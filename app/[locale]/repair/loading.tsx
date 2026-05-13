export default function RepairLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="flex flex-col gap-3 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex bg-card border border-border/60 rounded-2xl overflow-hidden h-40 animate-pulse">
              <div className="w-44 md:w-52 bg-muted shrink-0" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
