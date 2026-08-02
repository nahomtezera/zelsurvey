import React, { useState } from 'react';
import { Users, Copy, Check, Share2, Sparkles, Gift, QrCode, Trophy, ExternalLink, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { TOP_REFERRERS_LEADERBOARD } from '../../services/gamificationService';
import { getTransactions } from '../../services/storage';

interface ReferralViewProps {
  user: User;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ user, showToast }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  // Get referral commission transactions
  const transactions = getTransactions();
  const referralTransactions = transactions.filter(
    (t) => t.userId === user.id && t.type === 'Referral Commission'
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    showToast('success', 'Referral Code Copied!', `Code ${user.referralCode} copied.`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('success', 'Referral Link Copied!', 'Invitation link copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Join ZelSurvey investment platform using my referral code ${user.referralCode} and grow your wealth! ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`Join ZelSurvey investment platform using my referral code ${user.referralCode}!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  // Generate clean inline SVG QR Code representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Affiliate Program</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Referral Network & Leaderboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Invite friends to ZelSurvey and earn an instant 5% commission on every verified deposit made by your network.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Referral Earnings</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ETB {user.referralEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Instant 5% cash commission credited</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl text-emerald-600">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Referral Network Activity</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {referralTransactions.length} {referralTransactions.length === 1 ? 'Reward' : 'Rewards'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Verified referral deposit commissions</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-2xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Referral Link & Code Box */}
      <div className="bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your Unique Referral Credentials</h3>
              <p className="text-xs text-blue-100">Share your code, link, or QR code to automatically earn cash commissions.</p>
            </div>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR Code</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          
          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
            <p className="text-[11px] font-bold text-blue-200 uppercase">Your Referral Code</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-black font-mono tracking-wider">{user.referralCode}</span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
            <p className="text-[11px] font-bold text-blue-200 uppercase">Your Referral Link</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono truncate text-blue-100">{referralLink}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* QUICK SHARE SOCIAL BUTTONS */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-blue-100 font-medium">Quick Share:</span>
          <button
            onClick={handleShareTelegram}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* LEADERBOARD OF TOP REFERRERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Referrers Leaderboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Top network leaders earning high affiliate returns this month</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Live Rankings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Referrer</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3 text-center">Invited Users</th>
                <th className="pb-3 pr-2 text-right">Total Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {TOP_REFERRERS_LEADERBOARD.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pl-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${
                      item.rank === 1 
                        ? 'bg-amber-400 text-slate-900 shadow-md' 
                        : item.rank === 2 
                        ? 'bg-slate-300 text-slate-900 shadow' 
                        : item.rank === 3 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="font-extrabold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.username}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.membershipBadge}
                    </span>
                  </td>
                  <td className="py-3 text-center font-black text-slate-800 dark:text-slate-200">
                    {item.totalReferrals}
                  </td>
                  <td className="py-3 pr-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                    ETB {item.totalEarned.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFERRAL HISTORY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Your Referral Earnings History</h3>
        
        {referralTransactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Referral Earnings Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Share your referral code <strong className="font-mono text-blue-600">{user.referralCode}</strong> with friends. You will receive 5% cash commission on every deposit!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralTransactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">{tx.description}</p>
                  <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    +ETB {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-500">Credited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowQrModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center border border-slate-200 dark:border-slate-800 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Your Referral QR Code</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Scan with any mobile camera to open your referral link directly.</p>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner inline-block mb-4">
              <img src={qrSvgUrl} alt="Referral QR Code" className="w-44 h-44 mx-auto rounded-lg" />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mb-4 truncate">
              {user.referralCode}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
