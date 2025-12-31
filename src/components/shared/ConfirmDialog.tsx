// src/components/shared/ConfirmDialog.tsx
// FIXED: Added React import and COLORS
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const colors = {
    danger: COLORS.riskRed,
    warning: COLORS.warningAmber,
    info: COLORS.signalCyan,
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-xl z-50"
        style={{ backgroundColor: COLORS.graphitePanel }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: COLORS.slateGrey,
              color: '#9CA3AF',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: colors[variant],
              color: COLORS.obsidianBlack,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
