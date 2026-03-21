export default function Loading() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-72 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
