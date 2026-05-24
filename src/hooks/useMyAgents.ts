'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import type { Agent, AgentType, AgentCapability } from '@/types/agent'
import { CONTRACTS, IDENTITY_REGISTRY_ABI } from '@/lib/contracts'

const BLOCK_RANGE = 9900n
const MAX_SCAN_DEPTH = 300000n

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
      const latestBlock = await publicClient.getBlockNumber()
      // tokenId → { owner, mintBlock }
      const myTokens = new Map<bigint, { mintBlock: bigint }>()
      let currentTo = latestBlock
      const minFrom = latestBlock > MAX_SCAN_DEPTH ? latestBlock - MAX_SCAN_DEPTH : 0n

      // Scan backward in chunks for Transfer events TO user's address
      while (currentTo > minFrom && myTokens.size < 20) {
        const from = currentTo > BLOCK_RANGE ? currentTo - BLOCK_RANGE : 0n
        const safeFrom = from < minFrom ? minFrom : from

        // Transfer IN (to = user)
        try {
          const transferInLogs = await publicClient.getLogs({
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
            fromBlock: safeFrom,
            toBlock: currentTo,
          })

          for (const log of transferInLogs) {
            const args = log.args as Record<string, unknown> | undefined
            if (args && args.tokenId !== undefined) {
              const tokenId = args.tokenId as bigint
              const blockNumber = log.blockNumber ?? BigInt(0)
              // Only add if not already tracked
              if (!myTokens.has(tokenId)) {
                myTokens.set(tokenId, { mintBlock: blockNumber })
              }
            }
          }
        } catch {
          // Chunk failed, continue
        }

        // Transfer OUT (from = user) — remove these
        try {
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
            fromBlock: safeFrom,
            toBlock: currentTo,
          })

          for (const log of transferOutLogs) {
            const args = log.args as Record<string, unknown> | undefined
            if (args && args.tokenId !== undefined) {
              myTokens.delete(args.tokenId as bigint)
            }
          }
        } catch {
          // Chunk failed, continue
        }

        if (safeFrom === 0n) break
        currentTo = safeFrom - 1n
      }

      const fetchedAgents: Agent[] = []

      for (const [tokenId, info] of myTokens) {
        try {
          const owner = await publicClient.readContract({
            address: CONTRACTS.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
          })

          if ((owner as string).toLowerCase() !== address.toLowerCase()) continue

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
            createdAt: Number(info.mintBlock),
            updatedAt: Number(info.mintBlock),
          })
        } catch {
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
