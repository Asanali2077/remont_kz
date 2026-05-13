export default function MyRequestsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 h-8 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 space-y-3 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
