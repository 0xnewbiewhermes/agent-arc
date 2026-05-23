'use client'

import { useMemo, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'
import { CONTRACTS, IDENTITY_REGISTRY_ABI } from '@/lib/contracts'

// In-memory cache for fetched agents (module-level)
const agentsCache = new Map<number, { agents: Agent[]; totalCount: number }>()

export function useAgents() {
  const publicClient = usePublicClient()

  const fetchAgents = useCallback(async (): Promise<Agent[]> => {
    if (!publicClient) return []

    const cacheKey = publicClient.chain?.id ?? 1

    // Check cache first
    if (agentsCache.has(cacheKey)) {
      return agentsCache.get(cacheKey)!.agents
    }

    try {
      // Get Transfer events from IdentityRegistry (minting = from zero address)
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
        fromBlock: BigInt(0),
        toBlock: 'latest',
      })

      // Deduplicate by tokenId (last transfer wins = current owner)
      const tokenMap = new Map<
        bigint,
        { tokenId: bigint; owner: `0x${string}`; blockNumber: bigint }
      >()
      for (const log of transferLogs) {
        const args = log.args as Record<string, unknown> | undefined
        if (args && args.tokenId !== undefined && args.to !== undefined) {
          const tokenId = args.tokenId as bigint
          const to = args.to as `0x${string}`
          tokenMap.set(tokenId, {
            tokenId,
            owner: to,
            blockNumber: log.blockNumber ?? BigInt(0),
          })
        }
      }

      const agents: Agent[] = []

      for (const [, info] of tokenMap) {
        try {
          // Fetch owner
          const owner = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'ownerOf',
            args: [info.tokenId],
          })

          // Fetch metadata URI
          const tokenURI = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'tokenURI',
            args: [info.tokenId],
          })

          // Parse metadata from URI
          let name = `Agent #${info.tokenId}`
          let description = ''
          let image = ''
          let type: AgentType = 'assistant'
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
            id: info.tokenId,
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
            createdAt: Number(info.blockNumber),
            updatedAt: Number(info.blockNumber),
          })
        } catch {
          // Skip if contract read fails
          continue
        }
      }

      // Sort by creation time (newest first)
      agents.sort((a, b) => b.createdAt - a.createdAt)

      // Cache results
      agentsCache.set(cacheKey, { agents, totalCount: agents.length })

      return agents
    } catch {
      return []
    }
  }, [publicClient])

  return useMemo(() => {
    const cached = publicClient?.chain?.id ? agentsCache.get(publicClient.chain.id) : undefined
    return {
      agents: cached?.agents ?? [] as Agent[],
      totalCount: cached?.totalCount ?? 0,
      isLoading: false,
      fetchAgents,
    }
  }, [publicClient, fetchAgents])
}
