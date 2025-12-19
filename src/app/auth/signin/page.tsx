// src/app/auth/signin/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Brain } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { userAPI } from '@/lib/api';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      // In real implementation, this would authenticate
      // For now, we'll simulate and redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth state
      localStorage.setItem('maxion_auth', 'true');
      localStorage.setItem('maxion_email', email);
      
      router.push('/app');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.obsidianBlack }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between"
        style={{ backgroundColor: COLORS.graphitePanel }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: COLORS.maxionGreen }}>
            <Brain size={24} style={{ color: COLORS.obsidianBlack }} />
          </div>
          <span className="text-2xl font-bold" style={{ color: COLORS.maxionGreen }}>
            MAXION
          </span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Intelligence for Real Yield
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands using AI-powered analysis for real-world asset investments on Mantle.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {[
            { label: 'TVL', value: '$45M+' },
            { label: 'Users', value: '12K+' },
            { label: 'Assets', value: '150+' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-2xl font-bold font-mono mb-1" 
                style={{ color: COLORS.maxionGreen }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your MAXION account</p>
          </div>

          {error && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.riskRed}20` }}>
              <p className="text-sm" style={{ color: COLORS.riskRed }}>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="font-medium" style={{ color: COLORS.maxionGreen }}>
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: COLORS.maxionGreen, 
                color: COLORS.obsidianBlack,
                opacity: loading || !email || !password ? 0.5 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-semibold" style={{ color: COLORS.maxionGreen }}>
              Sign up
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}