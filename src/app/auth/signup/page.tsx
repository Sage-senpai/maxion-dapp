// src/app/auth/signup/page.tsx
// FIXED: Proper wallet address generation
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Brain, Loader2, AlertCircle } from 'lucide-react';
import { COLORS } from '@/lib/constants';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // FIXED: Generate proper 40-character hex address
  const generateMockWallet = (): string => {
    const hexChars = '0123456789abcdef';
    let wallet = '0x';
    for (let i = 0; i < 40; i++) {
      wallet += hexChars[Math.floor(Math.random() * 16)];
    }
    return wallet;
  };

  const handleSignUp = async () => {
    console.log('🚀 Signup initiated');
    setDebugInfo('Starting signup process...');
    
    // Clear previous errors
    setError('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setDebugInfo('Validation failed: Missing fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setDebugInfo('Validation failed: Passwords mismatch');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setDebugInfo('Validation failed: Password too short');
      return;
    }

    setLoading(true);
    setDebugInfo('Validation passed. Creating mock wallet...');

    try {
      // FIXED: Generate proper 40-character wallet address
      const mockWallet = generateMockWallet();
      console.log('📝 Mock wallet generated:', mockWallet);
      setDebugInfo(`Mock wallet: ${mockWallet.slice(0, 10)}...`);

      // Verify wallet format
      if (!/^0x[a-fA-F0-9]{40}$/.test(mockWallet)) {
        throw new Error('Invalid wallet address format generated');
      }

      // Try to create user via API
      console.log('🌐 Calling /api/users...');
      setDebugInfo('Calling API to create user...');
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: mockWallet,
          riskProfile: 'balanced',
        }),
      });

      console.log('📡 API Response status:', response.status);
      setDebugInfo(`API responded with status: ${response.status}`);

      const data = await response.json();
      console.log('📦 API Response data:', data);

      if (!response.ok) {
        // API returned an error
        const errorMsg = data.error || data.message || 'Failed to create account';
        console.error('❌ API Error:', errorMsg);
        setDebugInfo(`API Error: ${errorMsg}`);
        
        // If user already exists, that's actually OK for demo
        if (response.status === 409 || errorMsg.includes('already exists')) {
          console.log('ℹ️ User exists, proceeding with login...');
          setDebugInfo('User already exists, logging in...');
          // Continue to save auth state
        } else {
          throw new Error(errorMsg);
        }
      }

      console.log('✅ User created/found successfully');
      setDebugInfo('Success! Saving authentication...');

      // Store auth state in localStorage
      localStorage.setItem('maxion_auth', 'true');
      localStorage.setItem('maxion_email', email);
      localStorage.setItem('maxion_name', name);
      localStorage.setItem('maxion_wallet', mockWallet);

      console.log('💾 Auth state saved to localStorage');
      setDebugInfo('Auth saved. Redirecting...');

      // Show success message
      alert('✅ Account Created Successfully!\n\nWelcome to MAXION!\n\nRedirecting to app...');

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to app in demo mode
      console.log('🔄 Redirecting to /app?mode=demo');
      setDebugInfo('Redirecting to app...');
      router.push('/app?mode=demo');

    } catch (err: any) {
      console.error('💥 Signup error:', err);
      const errorMessage = err.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      setDebugInfo(`Error: ${errorMessage}`);
      
      // Show detailed error
      alert(`❌ Signup Failed\n\n${errorMessage}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login (bypass database)
  const handleDemoLogin = () => {
    console.log('🎭 Demo login initiated');
    
    // Just set auth and redirect
    const mockWallet = generateMockWallet();
    localStorage.setItem('maxion_auth', 'true');
    localStorage.setItem('maxion_email', 'demo@maxion.app');
    localStorage.setItem('maxion_name', 'Demo User');
    localStorage.setItem('maxion_wallet', mockWallet);
    
    alert('✅ Demo Account Created!\n\nWelcome to MAXION Demo!\n\nRedirecting...');
    
    router.push('/app?mode=demo');
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

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border" 
              style={{ 
                backgroundColor: `${COLORS.riskRed}10`,
                borderColor: COLORS.riskRed 
              }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={20} style={{ color: COLORS.riskRed }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.riskRed }}>
                    Signup Failed
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Debug Info (only in development) */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="p-3 rounded-lg text-xs font-mono" style={{ backgroundColor: COLORS.slateGrey }}>
              <div className="text-gray-400">Debug: {debugInfo}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
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

            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Confirm Password */}
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

            {/* Normal Signup Button */}
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: COLORS.slateGrey }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500" style={{ backgroundColor: COLORS.obsidianBlack }}>
                  Having trouble?
                </span>
              </div>
            </div>

            {/* Demo Mode Button (bypass database) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-lg font-semibold border-2"
              style={{ 
                borderColor: COLORS.signalCyan,
                color: COLORS.signalCyan,
                backgroundColor: 'transparent'
              }}
            >
              Try Demo Mode (No Database Required)
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