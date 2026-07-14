export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-[420px] w-full bg-navy-800/20" />
      <div className="container py-12">
        <div className="mx-auto mb-8 h-7 w-48 rounded bg-muted" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <div className="container py-4">
        <div className="mb-6 h-7 w-40 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
