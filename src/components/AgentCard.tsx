'use client'

import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { truncateAddress, ipfsToHttp, shortenAgentId } from '@/lib/utils'
import type { Agent } from '@/types/agent'

interface AgentCardProps {
  agent: Agent
  onClick?: (agent: Agent) => void
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const imageUrl = agent.image ? ipfsToHttp(agent.image) : null

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
      onClick={() => onClick?.(agent)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={agent.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-400">
              {(agent.name || '?')[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{agent.name}</CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ID: {shortenAgentId(agent.id)} · Owner: {truncateAddress(agent.owner)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {agent.description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {agent.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {agent.type}
          </Badge>
          {agent.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="outline" className="text-xs">
              {cap}
            </Badge>
          ))}
          {agent.capabilities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{agent.capabilities.length - 3}
            </Badge>
          )}
        </div>
        {agent.version && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">v{agent.version}</p>
        )}
      </CardContent>
    </Card>
  )
}
