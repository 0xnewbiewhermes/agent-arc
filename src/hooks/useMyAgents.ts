'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import type { Agent, AgentType, AgentCapability } from '@/types/agent'
import { CONTRACTS, IDENTITY_REGISTRY_ABI } from '@/lib/contracts'

export function useMyAgents() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyAgents = useCallback(async () => {
    if (!publicClient || !address || !isConnected) {
      setAgents([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get Transfer events where `to` is the connected wallet
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
        args: { to: address },
        fromBlock: BigInt(0),
        toBlock: 'latest',
      })

      // Get Transfer events where `from` is the wallet (transfers out)
      const transferOutLogs = await publicClient.getLogs({
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
        args: { from: address },
        fromBlock: BigInt(0),
        toBlock: 'latest',
      })

      // Build set of tokenIds transferred out
      const transferredOut = new Set<bigint>()
      for (const log of transferOutLogs) {
        const args = log.args as Record<string, unknown> | undefined
        if (args && args.tokenId !== undefined) {
          transferredOut.add(args.tokenId as bigint)
        }
      }

      // Filter to only tokens received and not transferred out
      const userTokenIds = new Set<bigint>()
      for (const log of transferLogs) {
        const args = log.args as Record<string, unknown> | undefined
        if (args && args.tokenId !== undefined && !transferredOut.has(args.tokenId as bigint)) {
          userTokenIds.add(args.tokenId as bigint)
        }
      }

      const fetchedAgents: Agent[] = []

      for (const tokenId of userTokenIds) {
        try {
          // Verify ownership
          const owner = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
          })

          // Only include if still owned by the user
          if ((owner as string).toLowerCase() !== address.toLowerCase()) continue

          // Fetch token URI
          const tokenURI = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          })

          // Parse metadata
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
              // metadata fetch failed
            }
          }

          fetchedAgents.push({
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
            validationStatus: 'pending',
            createdAt: 0,
            updatedAt: 0,
          })
        } catch {
          // Skip failed reads
          continue
        }
      }

      setAgents(fetchedAgents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, address, isConnected])

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
