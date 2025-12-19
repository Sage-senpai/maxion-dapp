// src/app/auth/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Brain } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { userAPI } from '@/lib/api';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('maxion_auth', 'true');
      localStorage.setItem('maxion_email', email);
      localStorage.setItem('maxion_name', name);
      
      router.push('/app/onboarding');
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.riskRed}20` }}>
              <p className="text-sm" style={{ color: COLORS.riskRed }}>{error}</p>
            </div>
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
                  style={{ backgroundColor: COLORS.slateGrey, color: 'white' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignUp}
              disabled={loading || !name || !email || !password || !confirmPassword}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: COLORS.maxionGreen, 
                color: COLORS.obsidianBlack,
                opacity: loading || !name || !email || !password || !confirmPassword ? 0.5 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/auth/signin" className="font-semibold" style={{ color: COLORS.maxionGreen }}>
              Sign in
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}