'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import type { Agent, ValidationStatus, AgentType, AgentCapability } from '@/types/agent'
import { CONTRACTS, IDENTITY_REGISTRY_ABI, VALIDATION_REGISTRY_ABI } from '@/lib/contracts'

export function useAgentDetail(id: string) {
  const publicClient = usePublicClient()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgent = useCallback(async () => {
    if (!publicClient || !id) return

    setIsLoading(true)
    setError(null)

    try {
      const tokenId = BigInt(id)

      const [owner, tokenURI] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.IDENTITY_REGISTRY,
          abi: IDENTITY_REGISTRY_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }),
        publicClient.readContract({
          address: CONTRACTS.IDENTITY_REGISTRY,
          abi: IDENTITY_REGISTRY_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }),
      ])

      // Parse metadata
      let name = `Agent #${id}`
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
          // metadata fetch failed
        }
      }

      const valStatus: ValidationStatus = 'pending'

      setAgent({
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
        validationStatus: valStatus,
        createdAt: 0,
        updatedAt: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent details')
      setAgent(null)
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, id])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  return { agent, isLoading, isOwner: false, error, refetch: fetchAgent }
}
