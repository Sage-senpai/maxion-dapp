// src/app/page.tsx
// Location: src/app/page.tsx
// Main MAXION application - orchestrates all views
// Responsive: Desktop sidebar + mobile bottom nav

'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Brain } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LoadingSequence } from '@/components/LoadingSequence';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AIPanel } from '@/components/AIPanel';
import { Overview } from '@/components/Dashboard/Overview';
import { AssetTable } from '@/components/Assets/AssetTable';
import { AllocateFlow } from '@/components/Allocate/AllocateFlow';
import { PortfolioView } from '@/components/Portfolio/PortfolioView';
import { COLORS } from '@/lib/constants';
import type { RWAAsset } from '@/lib/constants';

export default function MaxionApp() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { isConnected } = useAccount();

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: COLORS.obsidianBlack, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Loading Sequence */}
      <AnimatePresence>
        {loading && (
          <LoadingSequence onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {!loading && (
        <>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              walletConnected={isConnected}
            />
          )}

          {/* Main Content Area */}
          <div className={`${!isMobile ? 'md:ml-64' : ''} min-h-screen`}>
            {/* Top Bar - Mobile Header */}
            {isMobile && (
              <div 
                className="sticky top-0 z-30 border-b"
                style={{
                  backgroundColor: COLORS.graphitePanel,
                  borderColor: COLORS.slateGrey,
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h1 
                      className="text-xl font-bold"
                      style={{ color: COLORS.maxionGreen }}
                    >
                      MAXION
                    </h1>
                    <p 
                      className="text-xs font-mono"
                      style={{ color: COLORS.signalCyan }}
                    >
                      Intelligence Layer
                    </p>
                  </div>
                  <div className="scale-90 origin-right">
                    <ConnectButton 
                      showBalance={false}
                      chainStatus="icon"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Connect Button */}
            {!isMobile && !isConnected && (
              <div className="flex justify-end p-6">
                <ConnectButton />
              </div>
            )}

            {/* Main Content */}
            <main className="p-4 md:p-8 pb-24 md:pb-8">
              <AnimatePresence mode="wait">
                {activeView === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Overview setAiPanelOpen={setAiPanelOpen} />
                  </motion.div>
                )}
                
                {activeView === 'assets' && (
                  <motion.div
                    key="assets"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AssetTable
                      setAiPanelOpen={setAiPanelOpen}
                      setSelectedAsset={setSelectedAsset}
                    />
                  </motion.div>
                )}
                
                {activeView === 'allocate' && (
                  <motion.div
                    key="allocate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AllocateFlow setAiPanelOpen={setAiPanelOpen} />
                  </motion.div>
                )}
                
                {activeView === 'portfolio' && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PortfolioView />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <MobileNav 
              activeView={activeView} 
              setActiveView={setActiveView} 
            />
          )}

          {/* AI Analyst Panel */}
          <AIPanel
            isOpen={aiPanelOpen}
            onClose={() => {
              setAiPanelOpen(false);
              setSelectedAsset(null);
            }}
            selectedAsset={selectedAsset}
          />

          {/* Floating AI Button - Mobile Only */}
          {isMobile && !aiPanelOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAiPanelOpen(true)}
              className="fixed right-4 bottom-20 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30"
              style={{
                backgroundColor: COLORS.signalCyan,
                color: COLORS.obsidianBlack,
              }}
            >
              <Brain size={24} />
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}