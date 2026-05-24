'use client'

import { useMemo, useCallback, useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'
import { CONTRACTS, IDENTITY_REGISTRY_ABI } from '@/lib/contracts'

// In-memory cache for fetched agents (module-level)
const agentsCache = new Map<number, { agents: Agent[]; totalCount: number }>()
// Track scanned range to resume from where we left off
const scannedRange = new Map<number, { scannedUpToBlock: bigint | null }>()

const BLOCK_RANGE = 9900n
const MAX_SCAN_DEPTH = 300000n // scan up to 300K blocks back
const MIN_AGENTS = 50 // stop scanning once we found this many

export function useAgents() {
  const publicClient = usePublicClient()
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState<string | null>(null)

  const fetchAgents = useCallback(async (): Promise<Agent[]> => {
    if (!publicClient) return []

    const cacheKey = publicClient.chain?.id ?? 1

    // Check cache first
    if (agentsCache.has(cacheKey)) {
      return agentsCache.get(cacheKey)!.agents
    }

    setScanProgress('Scanning blockchain...')

    try {
      const latestBlock = await publicClient.getBlockNumber()
      // tokenId → { owner, mintBlock }
      const allTokens = new Map<bigint, { owner: `0x${string}`; mintBlock: bigint }>()
      let currentTo = latestBlock
      const minFrom = latestBlock > MAX_SCAN_DEPTH ? latestBlock - MAX_SCAN_DEPTH : 0n

      // Scan backward in 9,900-block chunks
      while (currentTo > minFrom && allTokens.size < MIN_AGENTS) {
        const from = currentTo > BLOCK_RANGE ? currentTo - BLOCK_RANGE : 0n
        const safeFrom = from < minFrom ? minFrom : from

        setScanProgress(`Scanning blocks ${safeFrom.toString()} → ${currentTo.toString()}...`)

        try {
          const transferLogs = await publicClient.getLogs({
            address: CONTRACTS.IDENTITY_REGISTRY,
            event: {
              type: 'event',
              name: 'Transfer',
              inputs: [
                { indexed: true, name: 'from', type: 'address' },
                { indexed: true, name: 'to', type: 'address' },
                { indexed: true, name: 'tokenId', type: 'uint256' },
              ],
            },
            fromBlock: safeFrom,
            toBlock: currentTo,
          })

          for (const log of transferLogs) {
            const args = log.args as Record<string, unknown> | undefined
            if (args && args.tokenId !== undefined && args.from !== undefined && args.to !== undefined) {
              const tokenId = args.tokenId as bigint
              const from = args.from as string
              const to = args.to as `0x${string}`
              const blockNumber = log.blockNumber ?? BigInt(0)

              // Track owner (latest transfer wins)
              allTokens.set(tokenId, { owner: to, mintBlock: blockNumber })

              // If this is a mint (from=0x0), use blockNumber as creation
              const existing = allTokens.get(tokenId)
              if (from === '0x0000000000000000000000000000000000000000') {
                // First time seeing this token — record mint block
                if (!existing || blockNumber < existing.mintBlock) {
                  allTokens.set(tokenId, { owner: to, mintBlock: blockNumber })
                }
              } else if (existing) {
                // Regular transfer — update owner but keep earliest mintBlock
                allTokens.set(tokenId, { owner: to, mintBlock: existing.mintBlock })
              } else {
                allTokens.set(tokenId, { owner: to, mintBlock: blockNumber })
              }
            }
          }
        } catch {
          // Chunk failed (rate limit?), continue to next
        }

        if (safeFrom === 0n) break
        currentTo = safeFrom - 1n
      }

      setScanProgress(`Fetching metadata for ${allTokens.size} agents...`)

      const agents: Agent[] = []
      let i = 0
      for (const [tokenId, info] of allTokens) {
        i++
        if (i % 10 === 0) {
          setScanProgress(`Loading agent ${i}/${allTokens.size}...`)
        }

        try {
          const owner = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
          })

          const tokenURI = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          })

          let name = `Agent #${tokenId}`
          let description = ''
          let image = ''
          let type: AgentType = 'other'
          let capabilities: AgentCapability[] = []
          let version = '1.0.0'

          if (tokenURI) {
            const httpUri = tokenURI.startsWith('ipfs://')
              ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : tokenURI
            try {
              const response = await fetch(httpUri)
              if (response.ok) {
                const meta = await response.json()
                name = meta.name || name
                description = meta.description || ''
                image = meta.image || ''
                type = meta.agentType || type
                capabilities = meta.capabilities || []
                version = meta.version || '1.0.0'
              }
            } catch {
              // Metadata fetch failed, continue without it
            }
          }

          agents.push({
            id: tokenId,
            owner: owner as `0x${string}`,
            name,
            description,
            image,
            type,
            capabilities,
            version,
            metadataUri: tokenURI,
            reputation: null,
            validations: null,
            validationStatus: 'pending' as ValidationStatus,
            createdAt: Number(info.mintBlock),
            updatedAt: Number(info.mintBlock),
          })
        } catch {
          // Skip if contract read fails
          continue
        }
      }

      agents.sort((a, b) => Number(b.id - a.id))

      agentsCache.set(cacheKey, { agents, totalCount: agents.length })
      scannedRange.set(cacheKey, { scannedUpToBlock: currentTo })

      setScanProgress(null)
      return agents
    } catch {
      agentsCache.set(cacheKey, { agents: [], totalCount: 0 })
      setScanProgress(null)
      return []
    }
  }, [publicClient])

  // Auto-fetch on mount
  useEffect(() => {
    if (publicClient && !agentsCache.has(publicClient.chain?.id ?? 1)) {
      setLoading(true)
      fetchAgents().finally(() => setLoading(false))
    }
  }, [publicClient, fetchAgents])

  return useMemo(() => {
    const cached = publicClient?.chain?.id ? agentsCache.get(publicClient.chain.id) : undefined
    return {
      agents: cached?.agents ?? [] as Agent[],
      totalCount: cached?.totalCount ?? 0,
      isLoading: loading || !cached,
      scanProgress,
      fetchAgents,
    }
  }, [publicClient, fetchAgents, loading, scanProgress])
}
