export default function ExploreLoading() {
  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-6xl">
        {/* Title skeleton */}
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-2" />
        <div className="h-5 w-72 rounded bg-muted animate-pulse mb-8" />

        {/* Search bar skeleton */}
        <div className="h-10 w-full rounded-lg bg-muted animate-pulse mb-8" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
