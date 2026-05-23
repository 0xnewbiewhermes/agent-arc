export default function AgentDetailLoading() {
  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl">
        {/* Back link skeleton */}
        <div className="h-4 w-24 rounded bg-muted animate-pulse mb-8" />

        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="h-24 w-24 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-5 w-full max-w-lg rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded bg-muted animate-pulse" />
              <div className="h-5 w-14 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="h-10 w-80 rounded-lg bg-muted animate-pulse mb-8" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}
