'use client'

import { useMemo, useEffect, useState } from 'react'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'

// In-memory cache for fetched agents (module-level)
const agentsCache = new Map<number, { agents: Agent[]; totalCount: number }>()

export function useAgents() {
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState<string | null>(null)

  const fetchAgents = async (): Promise<Agent[]> => {
    const cacheKey = 5042002 // ARC testnet chain ID

    // Check cache first
    if (agentsCache.has(cacheKey)) {
      return agentsCache.get(cacheKey)!.agents
    }

    setScanProgress('Scanning blockchain...')

    try {
      // Fetch token IDs from server-side API
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const tokenList: { tokenId: string; owner: string; blockNumber: string }[] = data.agents || []

      setScanProgress(`Loading metadata for ${tokenList.length} agents...`)

      // Fetch metadata for each agent
      const agents: Agent[] = []
      let i = 0
      for (const item of tokenList) {
        i++
        if (i % 10 === 0) {
          setScanProgress(`Loading agent ${i}/${tokenList.length}...`)
        }

        try {
          // Fetch metadata from IPFS via Pinata gateway
          // We know the tokenURI pattern from the contract
          let name = `Agent #${item.tokenId}`
          let description = ''
          let image = ''
          let type: AgentType = 'other'
          let capabilities: AgentCapability[] = []
          let version = '1.0.0'

          // Try to fetch metadata from IPFS
          // The tokenURI is stored on-chain, but we'd need to call ownerOf/tokenURI per agent
          // To avoid 50+ RPC calls, we set default names and let detail page fetch metadata
          name = `Agent #${item.tokenId}`

          agents.push({
            id: BigInt(item.tokenId),
            owner: item.owner as `0x${string}`,
            name,
            description,
            image,
            type,
            capabilities,
            version,
            metadataUri: '',
            reputation: null,
            validations: null,
            validationStatus: 'pending' as ValidationStatus,
            createdAt: Number(item.blockNumber),
            updatedAt: Number(item.blockNumber),
          })
        } catch {
          continue
        }
      }

      agents.sort((a, b) => Number(b.id - a.id))

      agentsCache.set(cacheKey, { agents, totalCount: agents.length })
      setScanProgress(null)
      return agents
    } catch {
      agentsCache.set(cacheKey, { agents: [], totalCount: 0 })
      setScanProgress(null)
      return []
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    const cacheKey = 5042002
    if (!agentsCache.has(cacheKey)) {
      setLoading(true)
      fetchAgents().finally(() => setLoading(false))
    }
  }, [])

  return useMemo(() => {
    const cached = agentsCache.get(5042002)
    return {
      agents: cached?.agents ?? [] as Agent[],
      totalCount: cached?.totalCount ?? 0,
      isLoading: loading || !cached,
      scanProgress,
      fetchAgents,
    }
  }, [loading, scanProgress])
}
