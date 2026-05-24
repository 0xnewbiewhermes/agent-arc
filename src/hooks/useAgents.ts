'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'

const agentsCache = new Map<number, { agents: Agent[]; totalCount: number; timestamp: number }>()
const CACHE_TTL = 120_000 // 2 minutes

export function useAgents() {
  const [loading, setLoading] = useState(false)

  const fetchAgents = useCallback(async (): Promise<Agent[]> => {
    const cacheKey = 5042002
    const cache = agentsCache.get(cacheKey)

    // Use cache if fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.agents
    }

    setLoading(true)

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

      agentsCache.set(cacheKey, { agents, totalCount: agents.length, timestamp: Date.now() })
      return agents
    } catch {
      agentsCache.set(cacheKey, { agents: [], totalCount: 0, timestamp: Date.now() })
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on mount + auto-refresh every 2 min
  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, CACHE_TTL)
    return () => clearInterval(interval)
  }, [fetchAgents])

  return useMemo(() => {
    const cached = agentsCache.get(5042002)
    const isStale = cached ? Date.now() - cached.timestamp > CACHE_TTL : true
    return {
      agents: cached?.agents ?? [] as Agent[],
      totalCount: cached?.totalCount ?? 0,
      isLoading: loading && (!cached || isStale),
      fetchAgents,
    }
  }, [loading, fetchAgents])
}
