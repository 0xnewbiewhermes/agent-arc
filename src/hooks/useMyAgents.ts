'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import type { Agent, AgentType, AgentCapability } from '@/types/agent'

let cachedMyAgents: { address: string; agents: Agent[] } | null = null

export function useMyAgents() {
  const { address, isConnected } = useAccount()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyAgents = useCallback(async () => {
    if (!address || !isConnected) {
      setAgents([])
      return
    }

    // Return cached result for same address
    if (cachedMyAgents && cachedMyAgents.address === address.toLowerCase()) {
      setAgents(cachedMyAgents.agents)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()

      const addr = address.toLowerCase()
      const myAgents: Agent[] = (data.agents || [])
        .filter((item: { owner: string }) => item.owner === addr)
        .map((item: { tokenId: string; createdAt: string }) => ({
          id: BigInt(item.tokenId),
          owner: address,
          name: `Agent #${item.tokenId}`,
          description: '',
          image: '',
          type: 'other' as AgentType,
          capabilities: [] as AgentCapability[],
          version: '1.0.0',
          metadataUri: '',
          reputation: null,
          validations: null,
          validationStatus: 'pending' as const,
          createdAt: Number(item.createdAt),
          updatedAt: Number(item.createdAt),
        }))

      cachedMyAgents = { address: addr, agents: myAgents }
      setAgents(myAgents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents')
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchMyAgents()
  }, [fetchMyAgents])

  return useMemo(() => ({
    agents,
    isLoading,
    totalCount: agents.length,
    error,
    refetch: fetchMyAgents,
  }), [agents, isLoading, error, fetchMyAgents])
}
