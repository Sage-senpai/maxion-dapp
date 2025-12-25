// src/components/AIPanel.tsx
// Location: src/components/AIPanel.tsx
// UPDATED: Complete implementation with API integration and demo mode

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Send, Sparkles, TrendingUp, Shield, PieChart } from 'lucide-react';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  suggestions?: string[];
}

export function AIPanel({ isOpen, onClose, selectedAsset, mode, walletAddress }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = selectedAsset
        ? `I'm analyzing **${selectedAsset.name}**. This asset offers **${selectedAsset.apy}% APY** with **${selectedAsset.risk}** risk profile. What would you like to know?`
        : mode === 'demo'
        ? "Hello! I'm your AI analyst in demo mode. Ask me about yield quality, risk assessment, or allocation strategies."
        : "Hello! I'm your AI analyst. Ask me about your portfolio, yield quality, or allocation strategies.";
      
      setMessages([{ 
        role: 'assistant', 
        content: greeting,
        timestamp: new Date(),
        suggestions: selectedAsset 
          ? ["Why this yield?", "What are the risks?", "Compare alternatives"]
          : ["Analyze portfolio", "Best yields", "Risk assessment"]
      }]);
    }
  }, [isOpen, selectedAsset, mode, messages.length]);

  const quickQuestions = selectedAsset ? [
    { icon: TrendingUp, text: "Why this yield?", query: `Why does ${selectedAsset.name} offer ${selectedAsset.apy}% APY?` },
    { icon: Shield, text: "Risk factors?", query: `What are the main risks of ${selectedAsset.name}?` },
    { icon: PieChart, text: "Allocation advice?", query: `How much should I allocate to ${selectedAsset.name}?` },
    { icon: Sparkles, text: "Compare options", query: `Compare ${selectedAsset.name} with similar assets` },
  ] : [
    { icon: TrendingUp, text: "Best yields", query: "What are the best yield opportunities right now?" },
    { icon: Shield, text: "Risk check", query: "Assess the risk levels of my current portfolio" },
    { icon: PieChart, text: "Optimize allocation", query: "How should I optimize my portfolio allocation?" },
    { icon: Sparkles, text: "Market insights", query: "What are the current market trends in RWA?" },
  ];

  const handleSend = async (queryText?: string) => {
    const messageText = queryText || input.trim();
    if (!messageText || loading) return;
    
    setInput('');
    const userMessage: Message = { 
      role: 'user', 
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    
    try {
      if (mode === 'live' && walletAddress) {
        // Call real API
        const response = await aiAPI.createAnalysis({
          walletAddress,
          query: messageText,
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
          timestamp: new Date(),
          suggestions: response.analysis.suggestions,
        }]);
      } else {
        // Demo mode - simulate response
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
        
        const demoResponse = generateDemoResponse(messageText, selectedAsset);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: demoResponse.content,
          timestamp: new Date(),
          suggestions: demoResponse.suggestions,
        }]);
      }
    } catch (error) {
      console.error('AI query failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-96 border-l z-50 flex flex-col shadow-2xl"
            style={{
              backgroundColor: COLORS.graphitePanel,
              borderColor: COLORS.slateGrey,
            }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b flex items-center justify-between backdrop-blur-sm"
              style={{ 
                borderColor: COLORS.slateGrey,
                background: `linear-gradient(135deg, ${COLORS.graphitePanel}F0 0%, ${COLORS.obsidianBlack}F0 100%)`
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Brain size={20} style={{ color: COLORS.signalCyan }} />
                </motion.div>
                <span className="font-semibold" style={{ color: COLORS.signalCyan }}>
                  AI Analyst
                </span>
                <motion.span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ 
                    backgroundColor: mode === 'live' ? `${COLORS.maxionGreen}20` : `${COLORS.signalCyan}20`,
                    color: mode === 'live' ? COLORS.maxionGreen : COLORS.signalCyan,
                  }}>
                  {mode === 'live' ? 'LIVE' : 'DEMO'}
                </motion.span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[80%]">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-2xl text-sm leading-relaxed shadow-lg"
                        style={{
                          backgroundColor: msg.role === 'user' 
                            ? `${COLORS.slateGrey}DD` 
                            : `${COLORS.obsidianBlack}DD`,
                          color: msg.role === 'user' ? COLORS.maxionGreen : '#E5E7EB',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${msg.role === 'user' ? COLORS.slateGrey : COLORS.graphitePanel}`,
                        }}
                      >
                        {msg.content}
                      </motion.div>
                      
                      {/* Suggestions */}
                      {msg.role === 'assistant' && msg.suggestions && (
                        <div className="flex flex-wrap gap-2 px-1">
                          {msg.suggestions.map((suggestion, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSend(suggestion)}
                              className="text-xs px-2 py-1 rounded-lg transition-all"
                              style={{
                                backgroundColor: `${COLORS.slateGrey}60`,
                                color: COLORS.signalCyan,
                                border: `1px solid ${COLORS.slateGrey}`,
                              }}
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Loading indicator */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="p-3 rounded-2xl shadow-lg" 
                    style={{ 
                      backgroundColor: `${COLORS.obsidianBlack}DD`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS.signalCyan }}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div 
              className="p-4 border-t backdrop-blur-sm"
              style={{ 
                borderColor: COLORS.slateGrey,
                background: `linear-gradient(180deg, ${COLORS.graphitePanel}00 0%, ${COLORS.graphitePanel}F0 50%)`
              }}
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickQuestions.map((q, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(q.query)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-md disabled:opacity-50"
                    style={{
                      backgroundColor: `${COLORS.slateGrey}80`,
                      color: COLORS.signalCyan,
                      border: `1px solid ${COLORS.slateGrey}`,
                    }}
                  >
                    <q.icon size={14} />
                    <span>{q.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div 
                className="flex items-center gap-2 p-2 rounded-xl backdrop-blur-sm"
                style={{
                  backgroundColor: `${COLORS.obsidianBlack}CC`,
                  border: `1px solid ${COLORS.slateGrey}`,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-sm disabled:opacity-50"
                  style={{ color: '#E5E7EB' }}
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: input.trim() && !loading ? COLORS.maxionGreen : COLORS.slateGrey,
                    color: input.trim() && !loading ? COLORS.obsidianBlack : '#9CA3AF',
                  }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Demo response generator
function generateDemoResponse(query: string, asset?: RWAAsset | null): { content: string; suggestions: string[] } {
  const q = query.toLowerCase();
  
  if (asset) {
    if (q.includes('yield') || q.includes('apy')) {
      return {
        content: `${asset.name}'s **${asset.apy}% APY** is driven by ${
          asset.category === 'Treasury' 
            ? 'U.S. Treasury yields and institutional-grade bond returns'
            : asset.category === 'Real Estate'
            ? 'rental income streams and property appreciation in prime markets'
            : 'diversified revenue streams from established ${asset.category.toLowerCase()} assets'
        }. The yield is sustainable because:\n\n• **Underlying cash flows** are predictable and verified\n• **Market demand** remains strong for this asset class\n• **Risk management** protocols ensure capital preservation\n\nThis positions it favorably compared to traditional DeFi yields.`,
        suggestions: ["Compare with alternatives", "What are the risks?", "Historical performance"]
      };
    }
    
    if (q.includes('risk')) {
      return {
        content: `${asset.name} carries a **${asset.risk}** risk profile due to:\n\n**Key Risk Factors:**\n• Market volatility in the ${asset.category} sector\n• Regulatory requirements for tokenized assets\n• Liquidity considerations for RWA redemptions\n\n**Mitigations:**\n• Institutional-grade custody and insurance\n• Regular third-party audits\n• Diversified underlying asset base\n\nThe risk-return ratio is favorable for ${asset.risk === 'Low' ? 'conservative' : asset.risk === 'Medium' ? 'balanced' : 'growth-oriented'} investors.`,
        suggestions: ["Allocation strategy", "Insurance coverage", "Exit liquidity"]
      };
    }
    
    if (q.includes('allocat') || q.includes('how much')) {
      return {
        content: `For **${asset.name}**, I'd recommend:\n\n**Conservative Profile (5-15%)**\nIf you prioritize capital preservation with steady income\n\n**Balanced Profile (15-30%)**\nIf you want growth with manageable risk exposure\n\n**Aggressive Profile (30-50%)**\nIf you're seeking maximum returns with higher risk tolerance\n\nConsider your overall portfolio composition, liquidity needs, and investment timeline. Diversification across multiple RWA categories can optimize your risk-adjusted returns.`,
        suggestions: ["Portfolio analysis", "Rebalancing strategy", "Tax implications"]
      };
    }
    
    if (q.includes('compar')) {
      return {
        content: `Comparing **${asset.name}** (${asset.apy}% APY) with alternatives:\n\n**Similar Risk Profile:**\nOther ${asset.risk} risk assets typically offer ${asset.apy - 1}% - ${asset.apy + 2}% APY\n\n**Advantages:**\n• Higher yield-to-risk ratio\n• Better liquidity profile\n• Institutional backing\n\n**Trade-offs:**\n• Minimum investment requirements\n• Lock-up periods may apply\n• Regulatory compliance overhead\n\nOverall, ${asset.name} offers competitive risk-adjusted returns in the ${asset.category} category.`,
        suggestions: ["Alternative options", "Risk comparison", "Historical data"]
      };
    }
  }
  
  // General queries
  if (q.includes('best') || q.includes('top')) {
    return {
      content: `Based on current market conditions, here are top opportunities:\n\n**Highest Yields:**\n• Private Credit: 12-18% APY (Medium-High risk)\n• Real Estate: 8-12% APY (Medium risk)\n• Treasury Bills: 5-6% APY (Low risk)\n\n**Best Risk-Adjusted:**\nTreasury-backed assets offer the optimal balance of safety and returns for most portfolios. Consider diversifying across 3-4 asset categories for optimal risk management.`,
      suggestions: ["Analyze specific asset", "Risk tolerance assessment", "Portfolio builder"]
    };
  }
  
  if (q.includes('portfolio') || q.includes('allocation')) {
    return {
      content: `For optimal portfolio construction:\n\n**Core Holdings (60%):**\nLow-risk assets like Treasuries and investment-grade bonds\n\n**Growth Layer (30%):**\nMedium-risk real estate and commodities\n\n**Opportunistic (10%):**\nHigher-risk private credit and emerging assets\n\nThis 60/30/10 split balances stability with growth potential. Adjust based on your risk tolerance and investment timeline.`,
      suggestions: ["Rebalance now", "Risk assessment", "Tax optimization"]
    };
  }
  
  if (q.includes('risk') || q.includes('safe')) {
    return {
      content: `**Risk Assessment Framework:**\n\n**Low Risk (Score: 1-3):**\nTreasuries, AAA-rated bonds - Prioritize capital preservation\n\n**Medium Risk (Score: 4-6):**\nReal estate, commodities - Balanced growth approach\n\n**High Risk (Score: 7-10):**\nPrivate credit, emerging markets - Maximum return potential\n\nYour portfolio should match your risk tolerance, liquidity needs, and time horizon. Regular rebalancing maintains your target risk profile.`,
      suggestions: ["Calculate my risk score", "Conservative options", "Risk mitigation"]
    };
  }
  
  // Default response
  return {
    content: `I can help you with:\n\n• **Asset Analysis** - Deep dive into specific RWA opportunities\n• **Risk Assessment** - Evaluate portfolio risk exposure\n• **Yield Optimization** - Find the best risk-adjusted returns\n• **Allocation Strategy** - Build a balanced portfolio\n• **Market Insights** - Current trends in tokenized assets\n\nWhat would you like to explore?`,
    suggestions: ["Analyze portfolio", "Best yields now", "Risk check", "Market trends"]
  };
}