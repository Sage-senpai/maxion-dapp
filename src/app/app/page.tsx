// src/app/app/page.tsx
// Location: src/app/app/page.tsx
// Main application (formerly the root page.tsx content)
// Protected route - requires authentication

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { LoadingSequence } from '@/components/LoadingSequence';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AIPanel } from '@/components/AIPanel';
import { ModeSwitcher, ModeBadge } from '@/components/ModeSwitcher';
import { Overview } from '@/components/Dashboard/Overview';
import { AssetTable } from '@/components/Assets/AssetTable';
import { AllocateFlow } from '@/components/Allocate/AllocateFlow';
import { PortfolioView } from '@/components/Portfolio/PortfolioView';
import { COLORS } from '@/lib/constants';
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
  
  const { isConnected, address } = useAccount();

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('maxion_auth');
    if (!auth) {
      router.push('/auth/signin');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Get mode from URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'live' || modeParam === 'demo') {
      setMode(modeParam);
    }
  }, [searchParams]);

  // Handle mode change
  const handleModeChange = (newMode: 'live' | 'demo') => {
    setMode(newMode);
    // Update URL without reload
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

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

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
            {/* Top Bar */}
            <div 
              className="sticky top-0 z-30 border-b"
              style={{
                backgroundColor: COLORS.graphitePanel,
                borderColor: COLORS.slateGrey,
              }}
            >
              <div className="flex items-center justify-between p-4">
                {/* Mobile: Logo | Desktop: Mode Switcher + Badge */}
                {isMobile ? (
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: COLORS.maxionGreen }}>
                      MAXION
                    </h1>
                    <p className="text-xs font-mono" style={{ color: COLORS.signalCyan }}>
                      Intelligence Layer
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ModeSwitcher 
                      mode={mode} 
                      onModeChange={handleModeChange}
                      walletConnected={isConnected}
                    />
                    <ModeBadge mode={mode} />
                  </div>
                )}

                {/* Connect Wallet Button */}
                <div className="scale-90 origin-right">
                  {mode === 'live' ? (
                    <ConnectButton 
                      showBalance={!isMobile}
                      chainStatus="icon"
                    />
                  ) : (
                    <div className="text-xs text-gray-500">
                      Demo Mode Active
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: Mode Switcher */}
              {isMobile && (
                <div className="px-4 pb-4">
                  <ModeSwitcher 
                    mode={mode} 
                    onModeChange={handleModeChange}
                    walletConnected={isConnected}
                  />
                </div>
              )}
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
                      walletAddress={mode === 'live' ? address : undefined}
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
                      walletAddress={mode === 'live' ? address : undefined}
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
                    <PortfolioView 
                      mode={mode}
                      walletAddress={mode === 'live' ? address : undefined}
                    />
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
            mode={mode}
            walletAddress={mode === 'live' ? address : undefined}
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