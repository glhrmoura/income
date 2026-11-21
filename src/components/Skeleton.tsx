interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-pulse rounded-sm bg-graphite-200 align-middle motion-reduce:animate-none ${className}`}
    />
  );
}
