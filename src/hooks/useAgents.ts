'use client'

import { useMemo, useEffect, useState } from 'react'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'

const agentsCache = new Map<number, { agents: Agent[]; totalCount: number }>()

export function useAgents() {
  const [loading, setLoading] = useState(false)

  const fetchAgents = async (): Promise<Agent[]> => {
    const cacheKey = 5042002
    if (agentsCache.has(cacheKey)) {
      return agentsCache.get(cacheKey)!.agents
    }

    try {
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()

      const agents: Agent[] = (data.agents || []).map((item: { tokenId: string; owner: string; createdAt: string }) => ({
        id: BigInt(item.tokenId),
        owner: item.owner as `0x${string}`,
        name: `Agent #${item.tokenId}`,
        description: '',
        image: '',
        type: 'other' as AgentType,
        capabilities: [] as AgentCapability[],
        version: '1.0.0',
        metadataUri: '',
        reputation: null,
        validations: null,
        validationStatus: 'pending' as ValidationStatus,
        createdAt: Number(item.createdAt),
        updatedAt: Number(item.createdAt),
      }))

      agentsCache.set(cacheKey, { agents, totalCount: agents.length })
      return agents
    } catch {
      agentsCache.set(cacheKey, { agents: [], totalCount: 0 })
      return []
    }
  }

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
      fetchAgents,
    }
  }, [loading])
}
