'use client'

import { use } from 'react'
import { useAgentDetail } from '@/hooks/useAgentDetail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, BadgeCheck, Shield } from 'lucide-react'

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { agent, isLoading, isOwner } = useAgentDetail(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-24" />
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-2xl font-semibold">Agent not found</h2>
        <p className="text-muted-foreground mt-2">The agent you are looking for does not exist.</p>
        <Link
          href="/explore"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Back to Explorer
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explorer
        </Link>

        {/* Agent Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0 overflow-hidden">
            {agent.image ? (
              <img src={agent.image} alt={agent.name} className="h-full w-full object-cover" />
            ) : (
              <span>🤖</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                {agent.type}
              </span>
            </div>
            <p className="mt-3 text-muted-foreground text-lg">{agent.description}</p>

            {/* Capabilities Tags */}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.capabilities.map((cap: string) => (
                  <span
                    key={cap}
                    className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <span>Version: {agent.version ?? '1.0.0'}</span>
              <span>Owner: {agent.owner?.slice(0, 6)}...{agent.owner?.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          {isOwner && (
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <Shield className="h-4 w-4" />
              Request Validation
            </button>
          )}
          <Link
            href={`https://arcscan.io/agent/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            View on Arcscan
          </Link>
        </div>

        {/* Tabbed View */}
        <Tabs defaultValue="reputation" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 mb-8">
            <TabsTrigger
              value="reputation"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
            >
              <BadgeCheck className="h-4 w-4 mr-2" />
              Reputation
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
            >
              <Shield className="h-4 w-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger
              value="metadata"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
            >
              Raw Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reputation" className="rounded-lg border border-border bg-card p-6">
            {agent.reputation && agent.reputation.length > 0 ? (
              <div className="space-y-4">
                {agent.reputation.map((rep: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{rep.validator}</p>
                      <p className="text-sm text-muted-foreground">{rep.tags?.join(', ')}</p>
                    </div>
                    <span className="text-sm font-medium">{rep.score ?? 'N/A'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No reputation data available yet.</p>
            )}
          </TabsContent>

          <TabsContent value="validation" className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {agent.validationStatus ?? 'Pending'}
                </span>
              </div>
              {agent.validations && agent.validations.length > 0 ? (
                agent.validations.map((v: any, i: number) => (
                  <div key={i} className="border-t border-border pt-3">
                    <p className="text-sm font-medium">{v.validator}</p>
                    <p className="text-sm text-muted-foreground">{v.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No validations yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="rounded-lg border border-border bg-card p-6">
            <pre className="overflow-auto text-sm text-muted-foreground">
              {JSON.stringify(agent, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
