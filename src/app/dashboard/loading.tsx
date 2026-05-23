export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-36 rounded bg-muted animate-pulse mb-1" />
            <div className="h-5 w-56 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>

        {/* Agents list skeleton */}
        <div className="h-6 w-28 rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
