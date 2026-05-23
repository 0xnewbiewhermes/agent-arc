'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AgentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <AlertCircle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-2xl font-semibold mb-2">Failed to load agent</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        There was an error loading this agent. It may have been removed or the network is unavailable.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
        <Link
          href="/explore"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Back to Explorer
        </Link>
      </div>
    </div>
  )
}
