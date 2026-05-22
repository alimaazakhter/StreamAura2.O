export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-accent/30 animate-spin" style={{ animationDuration: "2s" }} />
      </div>
      <p className="text-text-muted text-sm animate-pulse">Loading...</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
      <div className="aspect-[2/3] skeleton rounded-xl" />
      <div className="mt-2 space-y-1.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="py-6 lg:py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="skeleton h-7 w-48 rounded" />
      </div>
      <div className="flex gap-3 lg:gap-4 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <div className="relative h-[60vh] skeleton" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10 space-y-4">
        <div className="skeleton h-12 w-96 rounded" />
        <div className="skeleton h-6 w-64 rounded" />
        <div className="skeleton h-4 w-full max-w-2xl rounded" />
        <div className="skeleton h-4 w-full max-w-xl rounded" />
      </div>
    </div>
  );
}
