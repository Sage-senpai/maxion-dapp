// src/components/AIPanel.tsx
// Location: src/components/AIPanel.tsx
// AI Analyst slide-in panel from right
// Responsive: Full screen on mobile, 384px width on desktop

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: RWAAsset | null;
}

export function AIPanel({ isOpen, onClose, selectedAsset }: AIPanelProps) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: selectedAsset
        ? `I'm analyzing ${selectedAsset.name}. This asset offers ${selectedAsset.apy}% APY with ${selectedAsset.risk} risk profile. What would you like to know?`
        : "Hello! I'm your AI analyst. Ask me about yield quality, risk assessment, or allocation strategies.",
    },
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    "Why this yield?",
    "What are the risks?",
    "Conservative allocation?",
    "Compare with alternatives"
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Based on my analysis, ${input.toLowerCase().includes('risk') 
          ? 'the primary risks include market volatility, liquidity constraints, and underlying asset performance. However, this asset has strong collateralization and regulatory oversight.' 
          : 'this yield is generated through a combination of interest payments and strategic asset appreciation. The 7-12% range reflects current market conditions and the quality of underlying collateral.'}`
      }]);
    }, 1000);
    
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel - Full screen mobile, sidebar desktop */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full md:w-96 border-l z-50 flex flex-col"
            style={{
              backgroundColor: COLORS.graphitePanel,
              borderColor: COLORS.slateGrey,
            }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: COLORS.slateGrey }}
            >
              <div className="flex items-center gap-2">
                <Brain size={20} style={{ color: COLORS.signalCyan }} />
                <span className="font-semibold" style={{ color: COLORS.signalCyan }}>
                  AI Analyst
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] sm:max-w-[80%] p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: msg.role === 'user' ? COLORS.slateGrey : COLORS.obsidianBlack,
                      color: msg.role === 'user' ? COLORS.maxionGreen : '#E5E7EB',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Questions */}
            <div 
              className="p-4 border-t"
              style={{ borderColor: COLORS.slateGrey }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{
                      borderColor: COLORS.signalCyan,
                      color: COLORS.signalCyan,
                    }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about yield, risk, allocation..."
                  className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.slateGrey,
                    color: '#E5E7EB',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: COLORS.signalCyan,
                    color: COLORS.obsidianBlack,
                  }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}