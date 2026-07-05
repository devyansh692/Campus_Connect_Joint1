export function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-xl3 border border-ink/10 p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-ink/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-ink/10" />
          <div className="h-2 w-16 rounded bg-ink/10" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-ink/10" />
        <div className="h-3 w-5/6 rounded bg-ink/10" />
      </div>
    </div>
  );
}