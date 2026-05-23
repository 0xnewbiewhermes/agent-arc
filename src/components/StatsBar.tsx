'use client'

import { useAgents } from '@/hooks/useAgents'
import { useEffect, useState } from 'react'

export default function StatsBar() {
  const { fetchAgents } = useAgents()
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
      .then((agents) => {
        setTotalCount(agents.length)
      })
      .catch(() => {
        setTotalCount(0)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [fetchAgents])

  return (
    <div className="flex items-center gap-6 rounded-xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Total Agents
        </span>
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {loading ? '...' : totalCount}
        </span>
      </div>
    </div>
  )
}
