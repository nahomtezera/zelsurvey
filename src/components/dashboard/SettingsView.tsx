import React, { useState } from 'react';
import { Settings, Sun, Moon, Bell, Globe, LogOut, Check } from 'lucide-react';
import { User } from '../../types';

interface SettingsViewProps {
  user: User;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  darkMode,
  setDarkMode,
  onLogout,
  showToast,
}) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [depositAlerts, setDepositAlerts] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleSavePreferences = () => {
    showToast('success', 'Preferences Saved', 'Your app settings have been updated.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>App Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure interface appearance, notification channels, and active session settings.
        </p>
      </div>

      {/* Theme Toggle Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>Appearance & Mode</span>
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setDarkMode(false)}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              !darkMode
                ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs font-bold">Light Mode</p>
                <p className="text-[11px] text-slate-500">Clean, bright high-contrast theme</p>
              </div>
            </div>
            {!darkMode && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={() => setDarkMode(true)}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              darkMode
                ? 'bg-blue-950/60 border-blue-500 text-white font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[11px] text-slate-400">Eye-safe twilight slate theme</p>
              </div>
            </div>
            {darkMode && <Check className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Notification Preferences</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Deposit & Withdrawal Alerts</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Notify when admin verifies or approves your deposit receipts</p>
            </div>
            <input
              type="checkbox"
              checked={depositAlerts}
              onChange={(e) => setDepositAlerts(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Email Notifications</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Send session reports and monthly investment summaries</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">SMS Updates</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive instant SMS alerts on daily yield accruals</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Language Settings</span>
        </h3>

        <div className="max-w-xs">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              showToast('info', 'Language Selected', `Language set to ${e.target.value}.`);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none"
          >
            <option value="English">English (US)</option>
            <option value="Amharic">Amharic (አማርኛ)</option>
            <option value="Oromo">Afaan Oromoo</option>
          </select>
        </div>
      </div>

      {/* Save & Logout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleSavePreferences}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
        >
          Save All Preferences
        </button>

        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of ZelSurvey</span>
        </button>
      </div>

    </div>
  );
};
