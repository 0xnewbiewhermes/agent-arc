'use client'

import { useAgents } from '@/hooks/useAgents'
import AgentGrid from '@/components/AgentGrid'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function ExplorePage() {
  const { agents, isLoading, scanProgress } = useAgents()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  const filteredAgents = agents
    ? agents
        .filter(
          (agent) =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name)
          if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    : []

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Agent Explorer</h1>
        <p className="text-muted-foreground mb-8">
          Browse and discover AI agents registered on the ARC Testnet
        </p>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agents by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Agent Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            {scanProgress && (
              <p className="text-sm text-muted-foreground">{scanProgress}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          </div>
        ) : (
          <AgentGrid agents={filteredAgents} />
        )}
      </div>
    </div>
  )
}
