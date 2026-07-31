import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, X, KeyRound, CheckCircle2 } from 'lucide-react';
import { loginUserAsync, resetPasswordForEmail } from '../../services/storage';
import { User as UserType } from '../../types';

interface LoginViewProps {
  onSuccess: (user: UserType) => void;
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onSwitchToRegister,
  onClose,
}) => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginInput.trim()) return setError('Please enter your email or username.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);

    try {
      const res = await loginUserAsync(loginInput.trim(), password);
      setLoading(false);

      if (!res.success || !res.user) {
        setError(res.message);
        return;
      }

      onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred during login. Please try again.');
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      return setResetError('Please enter a valid email address.');
    }

    setResetLoading(true);
    try {
      const res = await resetPasswordForEmail(resetEmail.trim());
      setResetLoading(false);
      if (res.success) {
        setResetMessage(res.message);
      } else {
        setResetError(res.message);
      }
    } catch (err: any) {
      setResetLoading(false);
      setResetError(err.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-left"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Member Login</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access your ZelSurvey investment dashboard.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="email@example.com or @username"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-2">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Register Now
            </button>
          </p>

        </form>

        {/* Forgot Password Modal */}
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-left space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <button
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Reset Password</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter your email to receive a password reset link.</p>
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
                  {resetError}
                </div>
              )}

              {resetMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Reset Link Sent!</span>
                  </div>
                  <p>{resetMessage}</p>
                  <button
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendPasswordReset} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md disabled:opacity-50"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
