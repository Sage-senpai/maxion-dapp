//src/app/page.tsx
// FIXED: Working modal with proper navigation
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FIXED: Direct navigation instead of modal
  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleDemoMode = () => {
    // Quick demo setup
    if (typeof window !== 'undefined') {
      localStorage.setItem('maxion_auth', 'true');
      localStorage.setItem('maxion_email', 'demo@maxion.app');
      localStorage.setItem('maxion_name', 'Demo User');
      localStorage.setItem('maxion_wallet', '0x' + Math.random().toString(16).substr(2, 40));
    }
    router.push('/app?mode=demo');
  };

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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
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
                <button onClick={handleSignIn} className="block w-full text-left text-gray-300 hover:text-white">Sign In</button>
                <button 
                  onClick={handleGetStarted}
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
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-lg font-semibold text-lg"
                style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
              >
                Start Free Trial
                <ChevronRight className="inline ml-2" size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDemoMode}
                className="px-8 py-4 rounded-lg font-semibold text-lg border"
                style={{ borderColor: COLORS.signalCyan, color: COLORS.signalCyan }}
              >
                Try Demo
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
                  boxShadow: plan.popular ? `0 10px 30px ${COLORS.maxionGreen}20` : 'none',
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
                  onClick={handleGetStarted}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-lg font-semibold text-lg"
              style={{ backgroundColor: COLORS.maxionGreen, color: COLORS.obsidianBlack }}
            >
              Start Your Free Trial
              <ChevronRight className="inline ml-2" size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDemoMode}
              className="px-8 py-4 rounded-lg font-semibold text-lg border"
              style={{ borderColor: COLORS.signalCyan, color: COLORS.signalCyan }}
            >
              Try Demo Mode
            </motion.button>
          </div>
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
                <li><button onClick={handleDemoMode} className="hover:text-white">Demo</button></li>
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
    </div>
  );
}