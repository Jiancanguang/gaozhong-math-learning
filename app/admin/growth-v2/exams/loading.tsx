export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Title */}
      <div className="h-8 w-48 rounded-lg bg-border-light" />

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-surface p-5">
            <div className="h-4 w-20 rounded bg-border-light" />
            <div className="mt-3 h-8 w-16 rounded bg-border-light" />
            <div className="mt-2 h-3 w-24 rounded bg-border-light" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-10">
        <div className="h-6 w-32 rounded bg-border-light" />
        <div className="mt-4 rounded-2xl border border-border-light bg-surface">
          <div className="border-b border-border-light bg-surface-alt px-4 py-3">
            <div className="h-4 w-full rounded bg-border-light" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border-light px-4 py-4 last:border-b-0">
              <div className="h-4 w-24 rounded bg-border-light" />
              <div className="h-4 w-40 rounded bg-border-light" />
              <div className="h-4 w-20 rounded bg-border-light" />
              <div className="h-4 w-16 rounded bg-border-light" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
