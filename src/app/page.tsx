//src/app/page.tsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Shield, Menu, X, Check, ChevronRight } from 'lucide-react';

const COLORS = {
  maxionGreen: '#3EF3A3',
  obsidianBlack: '#0B0E11',
  graphitePanel: '#161B22',
  slateGrey: '#1F2937',
  signalCyan: '#2BD9FE',
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

  return (
    <div style={{ backgroundColor: COLORS.obsidianBlack, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b" style={{ 
        backgroundColor: `${COLORS.graphitePanel}dd`,
        backdropFilter: 'blur(10px)',
        borderColor: COLORS.slateGrey 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.maxionGreen }}>
                <Brain size={20} style={{ color: COLORS.obsidianBlack }} />
              </div>
              <span className="text-xl font-bold" style={{ color: COLORS.maxionGreen }}>MAXION</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <button 
                onClick={() => setAuthMode('signin')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('signup')}
                className="px-6 py-2 rounded-lg font-medium"
                style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: COLORS.slateGrey }}
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-gray-300 hover:text-white">Features</a>
                <a href="#how-it-works" className="block text-gray-300 hover:text-white">How It Works</a>
                <a href="#pricing" className="block text-gray-300 hover:text-white">Pricing</a>
                <button onClick={() => setAuthMode('signin')} className="block text-gray-300 hover:text-white">Sign In</button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className="w-full px-6 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: COLORS.maxionGreen }}>
              Intelligence for
              <br />Real Yield
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Don't just chase yield — understand it. MAXION brings AI-powered analysis to real-world asset investments on Mantle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthMode('signup')}
                className="px-8 py-4 rounded-lg font-semibold text-lg"
                style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
              >
                Start Free Trial
                <ChevronRight className="inline ml-2" size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg font-semibold text-lg border"
                style={{ borderColor: COLORS.signalCyan, color: COLORS.signalCyan }}
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { label: 'Total Value Locked', value: '$45M+' },
              { label: 'Active Users', value: '12,400+' },
              { label: 'RWA Assets', value: '150+' },
              { label: 'Avg APY', value: '7.8%' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold font-mono mb-2" style={{ color: COLORS.maxionGreen }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.maxionGreen }}>
              Why MAXION?
            </h2>
            <p className="text-xl text-gray-400">Intelligence meets real-world yield</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Get instant explanations of yield sources, risk factors, and optimal allocation strategies.',
                color: COLORS.signalCyan,
              },
              {
                icon: TrendingUp,
                title: 'Real-World Assets',
                description: 'Access tokenized treasury bonds, real estate, infrastructure, and private credit on-chain.',
                color: COLORS.maxionGreen,
              },
              {
                icon: Shield,
                title: 'Risk Intelligence',
                description: 'Transparent risk assessment with personalized recommendations for your profile.',
                color: COLORS.maxionGreen,
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-xl border"
                style={{ backgroundColor: COLORS.graphitePanel, borderColor: COLORS.slateGrey }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}20` }}>
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.maxionGreen }}>
              How It Works
            </h2>
            <p className="text-xl text-gray-400">Three simple steps to intelligent yield</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect & Explore', desc: 'Connect your wallet and browse curated RWA opportunities' },
              { step: '02', title: 'Ask AI Analyst', desc: 'Get personalized insights on yield quality and risk factors' },
              { step: '03', title: 'Allocate Capital', desc: 'Invest with confidence backed by AI intelligence' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold mb-4" style={{ color: `${COLORS.maxionGreen}30` }}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5" style={{ backgroundColor: COLORS.slateGrey }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.maxionGreen }}>
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-400">Start free, upgrade when you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                features: ['Demo mode', 'Limited AI queries', 'Browse all assets', 'Basic analytics'],
              },
              {
                name: 'Pro',
                price: '$29',
                features: ['Live trading', 'Unlimited AI queries', 'Advanced analytics', 'Priority support'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: ['Custom integrations', 'API access', 'Dedicated support', 'White-label options'],
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-xl border ${plan.popular ? 'ring-2' : ''}`}
                style={{ 
                  backgroundColor: COLORS.graphitePanel, 
                  borderColor: plan.popular ? COLORS.maxionGreen : COLORS.slateGrey,
                  ringColor: COLORS.maxionGreen,
                }}
              >
                {plan.popular && (
                  <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full inline-block" style={{ backgroundColor: `${COLORS.maxionGreen}20`, color: COLORS.maxionGreen }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6 font-mono" style={{ color: COLORS.maxionGreen }}>
                  {plan.price}
                  {plan.price !== 'Custom' && <span className="text-lg text-gray-400">/mo</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Check size={16} style={{ color: COLORS.maxionGreen }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 rounded-lg font-semibold"
                  style={{ 
                    backgroundColor: plan.popular ? COLORS.maxionGreen : 'transparent',
                    color: plan.popular ? COLORS.obsidianBlack : COLORS.maxionGreen,
                    border: plan.popular ? 'none' : `2px solid ${COLORS.maxionGreen}`,
                  }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-2xl"
          style={{ backgroundColor: COLORS.graphitePanel }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: COLORS.maxionGreen }}>
            Ready to Invest Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands using AI-powered intelligence for real-world yield
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAuthMode('signup')}
            className="px-8 py-4 rounded-lg font-semibold text-lg"
            style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
          >
            Start Your Free Trial
            <ChevronRight className="inline ml-2" size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4" style={{ borderColor: COLORS.slateGrey }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm pt-8 border-t" style={{ borderColor: COLORS.slateGrey }}>
            © 2025 MAXION. Built on Mantle. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Auth Modal Component
function AuthModal({ mode, onClose }: { mode: 'signin' | 'signup'; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    console.log('Auth:', { mode, email, password, name });
    // In real implementation, this would call your API
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container - Centered with proper scrolling */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md my-8 mx-auto"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div 
          className="relative p-6 sm:p-8 rounded-2xl border shadow-2xl overflow-y-auto"
          style={{ 
            backgroundColor: COLORS.graphitePanel,
            borderColor: COLORS.slateGrey,
            maxHeight: 'calc(100vh - 4rem)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: COLORS.slateGrey }}>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <motion.button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                  style={{ 
                    backgroundColor: COLORS.slateGrey,
                    color: 'white',
                    borderColor: 'transparent',
                  }}
                  placeholder="Jonathan Maxion"
                  onFocus={(e) => e.target.style.borderColor = COLORS.maxionGreen}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                style={{ 
                  backgroundColor: COLORS.slateGrey,
                  color: 'white',
                  borderColor: 'transparent',
                }}
                placeholder="you@example.com"
                onFocus={(e) => e.target.style.borderColor = COLORS.maxionGreen}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                style={{ 
                  backgroundColor: COLORS.slateGrey,
                  color: 'white',
                  borderColor: 'transparent',
                }}
                placeholder="••••••••"
                onFocus={(e) => e.target.style.borderColor = COLORS.maxionGreen}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <button className="font-medium hover:underline" style={{ color: COLORS.maxionGreen }}>
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: `0 10px 30px ${COLORS.maxionGreen}40` 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-semibold text-base shadow-lg"
              style={{ 
                backgroundColor: COLORS.maxionGreen, 
                color: COLORS.obsidianBlack 
              }}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: COLORS.slateGrey }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500" style={{ backgroundColor: COLORS.graphitePanel }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium text-white hover:bg-white/5 transition-colors"
              style={{ borderColor: COLORS.slateGrey }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium text-white hover:bg-white/5 transition-colors"
              style={{ borderColor: COLORS.slateGrey }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </motion.button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-400 pt-4 border-t" style={{ borderColor: COLORS.slateGrey }}>
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => {}} 
                  className="font-semibold hover:underline transition-colors" 
                  style={{ color: COLORS.maxionGreen }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => {}} 
                  className="font-semibold hover:underline transition-colors" 
                  style={{ color: COLORS.maxionGreen }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}