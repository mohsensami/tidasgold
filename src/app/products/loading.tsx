export default function Loading() {
  return (
    <div className="container animate-pulse py-8">
      <div className="mb-1 h-7 w-40 rounded bg-muted" />
      <div className="mb-6 h-4 w-20 rounded bg-muted" />
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden space-y-2 md:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-muted" />
          ))}
        </aside>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square rounded-lg bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
