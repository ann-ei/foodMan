export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1" />
      </div>
      <div className="h-12 bg-muted animate-pulse rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
