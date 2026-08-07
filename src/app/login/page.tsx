'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Send OTP trigger
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
      setInfoMsg('Verification code sent! Please check your terminal console logs.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP trigger
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('otp', {
        email: email.trim(),
        code: code.trim(),
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error || 'Invalid verification code');
      }

      // Fetch current session to inspect user onboarding status
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData?.user;

      if (user && user.joinedDate) {
        router.push('/');
      } else {
        router.push('/role-selection');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  // Google sign in helper
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/role-selection' });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cn-purple/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cn-blue/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-cn-purple/25 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black font-[var(--font-display)] text-text-primary tracking-tight">
            Welcome to <span className="gradient-text">CampusNest</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 max-w-[280px]">
            The premium student housing network for Nigerian universities
          </p>
        </div>

        {/* Card Body */}
        <GlassCard variant="elevated" className="p-6 md:p-8 space-y-6">
          {/* Notification Alerts */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-xl bg-cn-coral/10 border border-cn-coral/25 flex items-start gap-2.5 text-xs text-cn-coral"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {infoMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-xl bg-cn-green/10 border border-cn-green/25 flex items-start gap-2.5 text-xs text-cn-green"
              >
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              /* Step 1: Email Request Form */
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@unilag.edu.ng"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl glass-solid border border-[var(--border-light)] text-xs font-semibold outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all text-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white gradient-bg text-xs font-bold shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send OTP Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              /* Step 2: Verification Code Form */
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[10px] font-bold text-cn-purple hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl glass-solid border border-[var(--border-light)] text-center text-lg font-bold tracking-widest outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all text-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white gradient-bg text-xs font-bold shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[10px] text-text-tertiary">
                  Didn&apos;t receive it?{' '}
                  <button type="button" onClick={handleSendOtp} className="text-cn-purple hover:underline font-bold">
                    Resend Code
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--border-light)]"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[var(--border-light)]"></div>
          </div>

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-xl border border-[var(--border-light)] bg-white text-text-primary font-semibold text-xs transition-all hover:bg-surface-secondary active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            {/* SVG Google icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.014c1.478 0 2.825.541 3.864 1.428l3.078-3.078C19.066 3.18 16.696 2 13.99 2A10.5 10.5 0 0 0 3.5 12.5a10.5 10.5 0 0 0 10.49 10.5c5.782 0 10.51-4.17 10.51-10.5 0-.58-.05-1.148-.15-1.715H12.24Z"
              />
            </svg>
            Google Account
          </button>
        </GlassCard>
      </motion.div>
    </main>
  );
}
