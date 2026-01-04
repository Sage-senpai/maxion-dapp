// src/app/app/page.tsx
// COMPLETE: All features working, no "coming soon" placeholders
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import WalletConnectSystem from '@/components/WalletConnectSystem';
import { NetworkSwitcher, NetworkBadge } from '@/components/NetworkSwitcher';
import { LoadingSequence } from '@/components/LoadingSequence';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AIPanel } from '@/components/AIPanel';
import { Overview } from '@/components/Dashboard/Overview';
import { AssetTable } from '@/components/Assets/AssetTable';
import { AllocateFlow } from '@/components/Allocate/AllocateFlow';
import { LivePortfolioView } from '@/components/Portfolio/LivePortfolioView';
import { COLORS } from '@/lib/constants';
import { CompleteAllocateFlow } from '@/components/Allocate/CompleteAllocateFlow';
import type { RWAAsset } from '@/lib/constants';

export default function AppPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem('maxion_auth');
    if (!auth) {
      router.push('/auth/signin');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Get mode from URL
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'live' || modeParam === 'demo') {
      setMode(modeParam);
    }
    
    const view = searchParams.get('view');
    if (view) {
      setActiveView(view);
    }
  }, [searchParams]);

  // Handle wallet mode change
  const handleWalletModeChange = (newMode: 'live' | 'demo', address?: string) => {
    setMode(newMode);
    setWalletAddress(address);
    
    const url = new URL(window.location.href);
    url.searchParams.set('mode', newMode);
    window.history.pushState({}, '', url.toString());
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.obsidianBlack }}>
      {/* Loading Sequence */}
      <AnimatePresence>
        {loading && <LoadingSequence onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              walletConnected={mode === 'live'}
            />
          )}

          {/* Main Content */}
          <div className={`${!isMobile ? 'md:ml-64' : ''} min-h-screen`}>
            {/* Top Bar */}
            <div 
              className="sticky top-0 z-30 border-b backdrop-blur-sm"
              style={{
                backgroundColor: `${COLORS.graphitePanel}F0`,
                borderColor: COLORS.slateGrey,
              }}
            >
              <div className="flex items-center justify-between p-4">
                {/* Mobile: Logo | Desktop: Network Switcher */}
                {isMobile ? (
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: COLORS.maxionGreen }}>
                      MAXION
                    </h1>
                    <NetworkBadge />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {mode === 'live' && <NetworkSwitcher />}
                  </div>
                )}

                {/* Wallet Connect */}
                <WalletConnectSystem 
                  onModeChange={handleWalletModeChange}
                  currentMode={mode}
                />
              </div>
            </div>

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
                    <Overview 
                      setAiPanelOpen={setAiPanelOpen}
                      mode={mode}
                      walletAddress={walletAddress}
                    />
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
                      mode={mode}
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
                    <AllocateFlow 
                      setAiPanelOpen={setAiPanelOpen}
                      mode={mode}
                      walletAddress={walletAddress}
                    />
                  </motion.div>
                )}
                
                {activeView === 'portfolio' && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LivePortfolioView 
                      mode={mode}
                      walletAddress={walletAddress}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* Mobile Bottom Nav */}
          {isMobile && (
            <MobileNav 
              activeView={activeView} 
              setActiveView={setActiveView} 
            />
          )}

          {/* AI Panel */}
          <AIPanel
            isOpen={aiPanelOpen}
            onClose={() => {
              setAiPanelOpen(false);
              setSelectedAsset(null);
            }}
            selectedAsset={selectedAsset}
            mode={mode}
            walletAddress={walletAddress}
          />

          {/* Floating AI Button - Mobile */}
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