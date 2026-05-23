'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import AgentCard from '@/components/AgentCard'

export default function HomePage() {
  const { agents, totalCount, isLoading } = useAgents()

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 px-6 flex flex-col items-center text-center bg-gradient-to-b from-background to-muted/30">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Discover & Manage AI Agents on ARC
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Register, discover, and validate ERC-8004 compliant AI agents on the ARC Testnet.
          Explore a decentralized registry of autonomous agents with verifiable reputations.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Register Agent
          </Link>
          <Link
            href="/explore"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Explore Agents
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full border-y border-border bg-card/50">
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-center gap-12">
          <div className="text-center">
            <p className="text-3xl font-bold">{isLoading ? '...' : totalCount ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Agents</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{isLoading ? '...' : agents?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Recently Registered</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">ARC</p>
            <p className="text-sm text-muted-foreground mt-1">Testnet</p>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8">Featured Agents</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.slice(0, 5).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No agents registered yet. Be the first!
          </p>
        )}
      </section>
    </div>
  )
}
