interface SkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export function Skeleton({ className = '', 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      role="status"
      aria-label="Loading card content"
      aria-busy="true"
    >
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      role="status"
      aria-label="Loading chart"
      aria-busy="true"
    >
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-64 w-full" />
      <span className="sr-only">Loading chart...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100"
      role="status"
      aria-label="Loading table data"
      aria-busy="true"
    >
      <div className="p-6 border-b border-gray-100">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading table data...</span>
    </div>
  );
}
