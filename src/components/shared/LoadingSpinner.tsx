// src/components/shared/LoadingSpinner.tsx
// Animated loading spinner with customizable size and color
// ============================================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = COLORS.maxionGreen, className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
      style={{
        width: sizes[size],
        height: sizes[size],
        border: `2px solid ${color}30`,
        borderTopColor: color,
        borderRadius: '50%',
      }}
    />
  );
}