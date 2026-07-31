import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpCircle, Wallet, AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { requestWithdrawal, getUserWithdrawals, getPlatformSettings } from '../../services/storage';
import { User, WithdrawalRequest } from '../../types';

interface WithdrawViewProps {
  user: User;
  onWithdrawalCreated: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({ user, onWithdrawalCreated, showToast }) => {
  const platformSettings = getPlatformSettings();
  const minAmount = platformSettings.minWithdrawalAmount || 5000;

  const [amount, setAmount] = useState<string>(minAmount.toString());
  const [method, setMethod] = useState<string>('Commercial Bank of Ethiopia (CBE)');
  const [accountInfo, setAccountInfo] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const withdrawals = getUserWithdrawals(user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numericAmount = parseFloat(amount);

    // Rule 1: Balance check
    if (user.balance < minAmount) {
      const msg = `Your available balance must be at least ETB ${minAmount.toLocaleString()} before you can request a withdrawal.`;
      setErrorMessage(msg);
      showToast('error', 'Insufficient Balance', msg);
      return;
    }

    // Rule 2: Minimum check
    if (isNaN(numericAmount) || numericAmount < minAmount) {
      const msg = `Minimum withdrawal amount is ETB ${minAmount.toLocaleString()}.`;
      setErrorMessage(msg);
      showToast('error', 'Withdrawal Limit', msg);
      return;
    }

    if (!accountInfo.trim()) {
      const msg = method === 'Telebirr' ? 'Please enter your Telebirr phone number.' : 'Please enter your account number.';
      setErrorMessage(msg);
      return;
    }

    if (numericAmount > user.balance) {
      setErrorMessage('Insufficient Balance');
      showToast('error', 'Insufficient Balance', 'Your wallet balance is less than the requested withdrawal amount.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = requestWithdrawal({
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        amount: numericAmount,
        method,
        accountInfo,
        accountName,
      });

      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.message);
        showToast('error', 'Withdrawal Failed', res.message);
        return;
      }

      showToast('success', 'Withdrawal Submitted', `Your withdrawal request of ETB ${numericAmount.toLocaleString()} is pending processing.`);
      onWithdrawalCreated();

      // Reset form
      setAmount(minAmount.toString());
      setAccountInfo('');
      setAccountName('');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <ArrowUpCircle className="w-4 h-4" />
          <span>Capital Payout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Withdraw Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Request funds withdrawal directly to your bank account or mobile wallet.
        </p>
      </div>

      {/* Available Balance Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Available Wallet Balance</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ETB {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-2xl text-blue-600">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Withdraw Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Withdrawal Request</h3>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Withdrawal Amount (ETB)
              </label>
              <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                Min Amount: ETB {minAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min={minAmount}
              max={user.balance}
              step={100}
              placeholder={`Minimum ETB ${minAmount.toLocaleString()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
            />
            {parseFloat(amount) < minAmount && (
              <p className="text-[11px] font-bold text-red-500 mt-1">Minimum withdrawal amount is ETB {minAmount.toLocaleString()}.</p>
            )}
            {parseFloat(amount) > user.balance && (
              <p className="text-[11px] font-bold text-red-500 mt-1">Insufficient Balance</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Withdrawal Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                <option value="Awash Bank">Awash Bank</option>
                <option value="Telebirr">Telebirr</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {method === 'Telebirr' ? 'Telebirr Account Holder Name' : 'Account Holder Name'}
              </label>
              <input
                type="text"
                placeholder="e.g. Abebe Tadesse"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {method === 'Telebirr' ? 'Telebirr Phone Number' : 'Account Number'}
            </label>
            <input
              type="text"
              placeholder={method === 'Telebirr' ? 'e.g. 0911234567 or +251 911...' : 'e.g. 1000 1234 5678'}
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || user.balance <= 0}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ArrowUpCircle className="w-4 h-4" />
                <span>Submit Withdrawal Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">My Withdrawal History</h3>

        {withdrawals.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No withdrawal requests recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Method</th>
                  <th className="py-3 px-2">Account</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                      ETB {w.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{w.method}</td>
                    <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">{w.accountInfo}</td>
                    <td className="py-3 px-2 text-right">
                      {w.status === 'Pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">🟡 Pending</span>
                      )}
                      {w.status === 'Approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">🟢 Processed</span>
                      )}
                      {w.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600">🔴 Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
