import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { arcTestnet } from '@/lib/arc-chain'

const CONTRACT = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const BLOCK_RANGE = 9900n
const MAX_SCAN_DEPTH = 200000n
const MIN_AGENTS = 50

const IDENTITY_ABI = [
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

// In-memory cache
let cachedResponse: ResponseData | null = null
let cacheTimestamp = 0
const CACHE_TTL = 120_000 // 2 minutes

interface ResponseData {
  agents: AgentData[]
  totalCount: number
  scannedChunks: number
  fromBlock: string
  toBlock: string
}

interface AgentData {
  tokenId: string
  owner: string
  name: string
  description: string
  image: string
  type: string
  version: string
  metadataUri: string
  createdAt: string
}

export async function GET() {
  if (cachedResponse && Date.now() - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json({ ...cachedResponse, cached: true })
  }

  try {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    const latestBlock = await client.getBlockNumber()
    const transferEvent = parseAbiItem(
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    )

    // Calculate all chunks
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

    // Fire all chunk queries in parallel
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

    // Collect unique tokenIds
    type TokenInfo = { owner: string; blockNumber: bigint }
    const tokenMap = new Map<string, TokenInfo>()

    for (const result of chunkResults) {
      if (result.status === 'rejected') continue
      for (const log of result.value) {
        const args = log.args as Record<string, unknown> | undefined
        if (!args || !args.tokenId) continue
        const tokenId = args.tokenId.toString()
        const to = (args.to as string)?.toLowerCase() || ''
        tokenMap.set(tokenId, {
          owner: to,
          blockNumber: log.blockNumber ?? BigInt(0),
        })
      }
    }

    // Sort by tokenId descending (newest first), take top MIN_AGENTS
    const sortedTokens = Array.from(tokenMap.entries())
      .sort((a, b) => Number(b[1].blockNumber) - Number(a[1].blockNumber))
      .slice(0, Math.max(MIN_AGENTS, tokenMap.size))

    // Fetch metadata for all agents in parallel (batches of 10)
    const agents: AgentData[] = []
    const batchSize = 10
    const tokenEntries = Array.from(sortedTokens)

    for (let start = 0; start < tokenEntries.length; start += batchSize) {
      const batch = tokenEntries.slice(start, start + batchSize)
      const batchResults = await Promise.allSettled(
        batch.map(async ([tokenId, info]) => {
          let name = `Agent #${tokenId}`
          let description = ''
          let image = ''
          let type = 'other'
          let version = '1.0.0'
          let metadataUri = ''

          try {
            const uri = await client.readContract({
              address: CONTRACT,
              abi: IDENTITY_ABI,
              functionName: 'tokenURI',
              args: [BigInt(tokenId)],
            })
            metadataUri = uri

            if (uri) {
              const httpUri = uri.startsWith('ipfs://')
                ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
                : uri
              try {
                const ipfsRes = await fetch(httpUri, { signal: AbortSignal.timeout(5000) })
                if (ipfsRes.ok) {
                  const meta = await ipfsRes.json()
                  name = meta.name || name
                  description = meta.description || ''
                  image = meta.image || ''
                  type = meta.agentType || type
                  version = meta.version || '1.0.0'
                }
              } catch { /* IPFS fail */ }
            }
          } catch { /* contract read fail */ }

          return {
            tokenId,
            owner: info.owner,
            name,
            description,
            image,
            type,
            version,
            metadataUri,
            createdAt: info.blockNumber.toString(),
          } satisfies AgentData
        })
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          agents.push(result.value)
        }
      }
    }

    cachedResponse = {
      agents,
      totalCount: agents.length,
      scannedChunks: chunks.length,
      fromBlock: minFrom.toString(),
      toBlock: latestBlock.toString(),
    }
    cacheTimestamp = Date.now()

    return NextResponse.json({ ...cachedResponse, cached: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
