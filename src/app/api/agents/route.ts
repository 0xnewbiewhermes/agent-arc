import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { arcTestnet } from '@/lib/arc-chain'

const CONTRACT = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const BLOCK_RANGE = 9900n
const MAX_SCAN_DEPTH = 200000n
const MIN_AGENTS = 50

let cachedAgents: ApiAgent[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 120_000

interface ApiAgent {
  tokenId: string
  owner: string
  createdAt: string
}

export async function GET() {
  if (cachedAgents && Date.now() - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json({ agents: cachedAgents, totalCount: cachedAgents.length, cached: true })
  }

  try {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    const latestBlock = await client.getBlockNumber()
    const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)')

    // Calculate chunks
    const chunks: { fromBlock: bigint; toBlock: bigint }[] = []
    let currentTo = latestBlock
    const minFrom = latestBlock > MAX_SCAN_DEPTH ? latestBlock - MAX_SCAN_DEPTH : 0n

    while (currentTo > minFrom) {
      const from = currentTo > BLOCK_RANGE ? currentTo - BLOCK_RANGE : 0n
      const safeFrom = from < minFrom ? minFrom : from
      chunks.push({ fromBlock: safeFrom, toBlock: currentTo })
      if (safeFrom === 0n) break
      currentTo = safeFrom - 1n
    }

    // Parallel chunk scanning
    const chunkResults = await Promise.allSettled(
      chunks.map((chunk) =>
        client.getLogs({
          address: CONTRACT,
          event: transferEvent,
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock,
        })
      )
    )

    // Collect unique tokenIds (last owner wins)
    const tokenMap = new Map<string, string>() // tokenId → owner
    const blockMap = new Map<string, bigint>() // tokenId → blockNumber

    for (const result of chunkResults) {
      if (result.status === 'rejected') continue
      for (const log of result.value) {
        const args = log.args as Record<string, unknown> | undefined
        if (!args || !args.tokenId) continue
        const tokenId = args.tokenId.toString()
        tokenMap.set(tokenId, (args.to as string)?.toLowerCase() || '')
        if (log.blockNumber && !blockMap.has(tokenId)) {
          blockMap.set(tokenId, log.blockNumber)
        }
      }
    }

    // Convert to sorted array
    const agents: ApiAgent[] = Array.from(tokenMap.entries())
      .map(([tokenId, owner]) => ({
        tokenId,
        owner,
        createdAt: blockMap.get(tokenId)?.toString() || '0',
      }))
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))

    cachedAgents = agents
    cacheTimestamp = Date.now()

    return NextResponse.json({
      agents,
      totalCount: agents.length,
      scannedChunks: chunks.length,
      cached: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
