// src/components/shared/Skeleton.tsx
// Loading skeleton for content placeholders
// ============================================================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ width, height, className = '', variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse ${variants[variant]} ${className}`}
      style={{
        backgroundColor: COLORS.slateGrey,
        width,
        height,
      }}
    />
  );
}