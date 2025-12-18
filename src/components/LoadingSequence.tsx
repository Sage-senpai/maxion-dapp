// src/components/LoadingSequence.tsx
// Location: src/components/LoadingSequence.tsx
// MAXION Intelligence Boot Sequence - Premium loading experience
// Responsive: Full screen on all devices

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface LoadingSequenceProps {
  onComplete: () => void;
}

export function LoadingSequence({ onComplete }: LoadingSequenceProps) {
  const [stage, setStage] = useState(0);
  
  const stages = [
    "Indexing real-world yield...",
    "Analyzing risk vectors...",
    "Calibrating intelligence layer...",
    "MAXION ready."
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 1800),
      setTimeout(() => onComplete(), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.obsidianBlack }}
    >
      <div className="text-center space-y-6 sm:space-y-8 max-w-md w-full">
        {/* MAXION Wordmark - Responsive text size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            style={{ color: COLORS.maxionGreen }}
          >
            MAXION
          </h1>
          <p 
            className="text-xs sm:text-sm mt-2 tracking-widest font-mono"
            style={{ color: COLORS.signalCyan }}
          >
            INTELLIGENCE LAYER
          </p>
        </motion.div>

        {/* Animated Data Nodes - Responsive sizing */}
        <div className="relative h-16 sm:h-20 md:h-24 w-full max-w-xs mx-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: COLORS.maxionGreen,
                left: `${i * 25}%`,
                top: '50%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.5, 1],
                scale: [0, 1.2, 0.8, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />
          ))}
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.line
                key={i}
                x1={`${i * 25 + 12.5}%`}
                y1="50%"
                x2={`${(i + 1) * 25 + 12.5}%`}
                y2="50%"
                stroke={COLORS.signalCyan}
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              />
            ))}
          </svg>
        </div>

        {/* Status Text - Responsive font size */}
        <div className="h-10 sm:h-12">
          <AnimatePresence mode="wait">
            {stage > 0 && (
              <motion.p
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs sm:text-sm font-mono px-4"
                style={{ color: COLORS.signalCyan }}
              >
                {stages[stage - 1]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}