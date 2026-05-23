'use client'

import { useState, useEffect, useMemo } from 'react'
import AgentCard from '@/components/AgentCard'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAgents } from '@/hooks/useAgents'
import type { Agent, AgentType } from '@/types/agent'

interface AgentGridProps {
  agents?: Agent[]
}

export default function AgentGrid({ agents: propAgents }: AgentGridProps) {
  const { fetchAgents } = useAgents()
  const [fetchedAgents, setFetchedAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(!propAgents)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  const agents = propAgents ?? fetchedAgents

  useEffect(() => {
    if (propAgents) {
      setLoading(false)
      return
    }
    fetchAgents()
      .then(setFetchedAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [fetchAgents, propAgents])

  const filteredAndSorted = useMemo(() => {
    let result = [...agents]

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [agents, search, typeFilter, sortBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Loading agents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'assistant', label: 'Assistant' },
            { value: 'tool', label: 'Tool' },
            { value: 'workflow', label: 'Workflow' },
            { value: 'autonomous', label: 'Autonomous' },
            { value: 'custom', label: 'Custom' },
          ]}
          className="sm:max-w-[160px]"
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'name', label: 'Name (A-Z)' },
          ]}
          className="sm:max-w-[160px]"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:ml-auto">
          {filteredAndSorted.length} agent{filteredAndSorted.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400">
            {search || typeFilter !== 'all'
              ? 'No agents match your filters'
              : 'No agents registered yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((agent) => (
            <AgentCard key={agent.id.toString()} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
