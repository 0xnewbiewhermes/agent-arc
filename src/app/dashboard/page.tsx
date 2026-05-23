'use client'

import { useAccount } from 'wagmi'
import { useMyAgents } from '@/hooks/useMyAgents'
import AgentCard from '@/components/AgentCard'
import Link from 'next/link'
import { Plus, Wallet, AlertCircle } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const { agents, isLoading, totalCount } = useMyAgents()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <Wallet className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Connect your wallet to view and manage your registered AI agents on the ARC Testnet.
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your registered AI agents</p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Register New Agent
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Your Agents</p>
            <p className="text-3xl font-bold mt-1">{isLoading ? '...' : totalCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Validated</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Network</p>
            <p className="text-3xl font-bold mt-1">ARC</p>
          </div>
        </div>

        {/* Agents List */}
        <h2 className="text-xl font-semibold mb-6">Your Agents</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Agents Registered</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven&apos;t registered any AI agents yet. Create your first agent to get started.
            </p>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Register Your First Agent
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
