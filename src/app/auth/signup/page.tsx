// src/app/auth/signup/page.tsx
// FIXED: Proper signup with database integration
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Brain, Loader2 } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { useToast } from '@/components/shared/Toast';

export default function SignUpPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create account with mock wallet (in production, this would generate or connect wallet)
      const mockWallet = '0x' + Math.random().toString(16).substr(2, 40);
      
      // Call API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: mockWallet,
          riskProfile: 'balanced',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Store auth state
      localStorage.setItem('maxion_auth', 'true');
      localStorage.setItem('maxion_email', email);
      localStorage.setItem('maxion_name', name);
      localStorage.setItem('maxion_wallet', mockWallet);

      // Show success toast
      addToast({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to MAXION. Redirecting...',
      });

      // Wait a moment for toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to app
      router.push('/app?mode=demo');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      
      addToast({
        type: 'error',
        title: 'Signup Failed',
        message: err.message || 'Please try again',
      });
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
            Start Your Journey
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Access AI-powered intelligence for real-world asset investments.
          </p>
          <ul className="space-y-4">
            {[
              'AI-powered yield analysis',
              'Curated RWA opportunities',
              'Risk-adjusted recommendations',
              'Real-time portfolio tracking',
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: `${COLORS.maxionGreen}20` }}>
                  <span style={{ color: COLORS.maxionGreen }}>✓</span>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          © 2025 MAXION. Built on Mantle.
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Start investing with intelligence</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg" 
              style={{ backgroundColor: `${COLORS.riskRed}20` }}
            >
              <p className="text-sm" style={{ color: COLORS.riskRed }}>{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none disabled:opacity-50"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none disabled:opacity-50"
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
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none disabled:opacity-50"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none disabled:opacity-50"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleSignUp}
              disabled={loading || !name || !email || !password || !confirmPassword}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: COLORS.maxionGreen, 
                color: COLORS.obsidianBlack,
                opacity: loading || !name || !email || !password || !confirmPassword ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="font-semibold hover:underline" 
              style={{ color: COLORS.maxionGreen }}
            >
              Sign in
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}