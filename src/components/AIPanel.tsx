// src/components/AIPanel.tsx
// Location: src/components/AIPanel.tsx
// UPDATED: Add mode prop and API integration

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Send } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { aiAPI } from '@/lib/api';
import type { RWAAsset } from '@/lib/constants';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: RWAAsset | null;
  mode: 'live' | 'demo';
  walletAddress?: string;
}

export function AIPanel({ isOpen, onClose, selectedAsset, mode, walletAddress }: AIPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen) {
      const greeting = selectedAsset
        ? `I'm analyzing ${selectedAsset.name}. This asset offers ${selectedAsset.apy}% APY with ${selectedAsset.risk} risk profile. What would you like to know?`
        : mode === 'demo'
        ? "Hello! I'm your AI analyst in demo mode. Ask me about yield quality, risk assessment, or allocation strategies."
        : "Hello! I'm your AI analyst. Ask me about your portfolio, yield quality, or allocation strategies.";
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, selectedAsset, mode]);

  const quickQuestions = [
    "Why this yield?",
    "What are the risks?",
    "Conservative allocation?",
    "Compare alternatives"
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setLoading(true);
    
    try {
      if (mode === 'live' && walletAddress) {
        // Call real API
        const response = await aiAPI.createAnalysis({
          walletAddress,
          query: userMessage,
          context: selectedAsset ? {
            assetId: selectedAsset.id,
            assetName: selectedAsset.name,
            apy: selectedAsset.apy,
            riskLevel: selectedAsset.risk,
          } : undefined,
        });
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.analysis.response,
        }]);
      } else {
        // Demo mode - simulate response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoResponse = generateDemoResponse(userMessage, selectedAsset);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: demoResponse,
        }]);
      }
    } catch (error) {
      console.error('AI query failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onClose}
          />

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
                <span className="text-xs px-2 py-0.5 rounded-full" 
                  style={{ 
                    backgroundColor: mode === 'live' ? `${COLORS.maxionGreen}20` : `${COLORS.signalCyan}20`,
                    color: mode === 'live' ? COLORS.maxionGreen : COLORS.signalCyan,
                  }}>
                  {mode === 'live' ? 'LIVE' : 'DEMO'}
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

            {/* Messages */}
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
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.obsidianBlack }}>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.signalCyan }} />
                      <div className="w-2 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: COLORS.signalCyan }} />
                      <div className="w-2 h-2 rounded-full animate-pulse delay-200" style={{ backgroundColor: COLORS.signalCyan }} />
                    </div>
                  </div>
                </div>
              )}
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