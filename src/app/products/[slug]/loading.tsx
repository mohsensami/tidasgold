export default function Loading() {
  return (
    <div className="container animate-pulse py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-7 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-24 w-full rounded bg-muted" />
          <div className="h-32 w-full rounded-lg bg-muted" />
          <div className="h-12 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
