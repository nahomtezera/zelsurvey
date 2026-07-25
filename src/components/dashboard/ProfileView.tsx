import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Check, KeyRound, ShieldCheck, LogOut } from 'lucide-react';
import { updateUser } from '../../services/storage';
import { User } from '../../types';

interface ProfileViewProps {
  user: User;
  onProfileUpdated: (updated: User) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onProfileUpdated, showToast, onLogout }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const updated: User = {
        ...user,
        fullName,
        phone,
      };

      updateUser(updated);
      onProfileUpdated(updated);
      setLoading(false);
      showToast('success', 'Profile Updated', 'Your profile details have been updated successfully.');
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (user.password && currentPassword !== user.password) {
      showToast('error', 'Password Mismatch', 'Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'Weak Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Password Mismatch', 'New passwords do not match.');
      return;
    }

    setPassLoading(true);

    setTimeout(() => {
      const updated: User = {
        ...user,
        password: newPassword,
      };

      updateUser(updated);
      onProfileUpdated(updated);
      setPassLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('success', 'Password Changed', 'Your security password has been updated.');
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <UserIcon className="w-4 h-4" />
          <span>Account Credentials</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Profile Details</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and security configuration.
        </p>
      </div>

      {/* User Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          {user.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">@{user.username}</p>
          <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Verified Investor
            </span>
            <span className="text-[11px] text-slate-400 font-mono">ID: {user.id}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Details Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Details</h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username (Immutable)</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h3>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{passLoading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Logout Session Card */}
      {onLogout && (
        <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">Active Account Session</h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
              Safely terminate your login session on this device. Your data and balances remain secure.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

    </div>
  );
};
