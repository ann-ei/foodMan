export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-36 bg-muted animate-pulse rounded" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded mt-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-52 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
