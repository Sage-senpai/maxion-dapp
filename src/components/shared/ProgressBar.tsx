// src/components/shared/ProgressBar.tsx
// Progress bar with percentage display
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = COLORS.maxionGreen, 
  showLabel = true,
  size = 'md' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-mono" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={`w-full rounded-full ${heights[size]}`} style={{ backgroundColor: COLORS.slateGrey }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`rounded-full ${heights[size]}`}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}