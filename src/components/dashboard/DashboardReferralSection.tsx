import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MessageCircle, 
  Send, 
  Mail, 
  Smartphone, 
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { User, DepositRequest } from '../../types';
import { getUsers, getDeposits } from '../../services/storage';

interface DashboardReferralSectionProps {
  user: User;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DashboardReferralSection: React.FC<DashboardReferralSectionProps> = ({ user, showToast }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const referralCode = user.referralCode || 'ZS847392';
  const referralLink = `https://zelsurvey.com/register?ref=${referralCode}`;
  const shareMessage = `Join ZelSurvey using my referral code ${referralCode}! Deposit ETB 1,000 or more to start growing your portfolio.`;

  // Fetch all registered users to find referred users
  const allUsers = getUsers();
  const allDeposits = getDeposits();

  // Filter users referred by current user
  const referredUsers = allUsers.filter(
    (u) => u.referredBy && u.referredBy.toLowerCase() === referralCode.toLowerCase()
  );

  // Compute Referral History & Statuses
  const referralHistory = referredUsers.map((refUser) => {
    const userDeps = allDeposits.filter((d) => d.userId === refUser.id);
    const approvedDeposit = userDeps.find((d) => d.status === 'Approved' && d.amount >= 1000);
    const anyApprovedDeposit = userDeps.find((d) => d.status === 'Approved');
    const pendingDeposit = userDeps.find((d) => d.status === 'Pending');

    let depositStatus: 'Registered' | 'Deposit Pending' | 'Deposit Approved' = 'Registered';
    if (approvedDeposit || anyApprovedDeposit) {
      depositStatus = 'Deposit Approved';
    } else if (pendingDeposit) {
      depositStatus = 'Deposit Pending';
    }

    const isRewardPaid = Boolean(refUser.referralRewardPaid || (approvedDeposit && refUser.referralRewardPaid));
    const rewardStatus: 'Reward Paid' | 'Pending' = isRewardPaid ? 'Reward Paid' : 'Pending';

    const isQualified = Boolean(approvedDeposit || isRewardPaid);

    return {
      id: refUser.id,
      username: `@${refUser.username || refUser.email.split('@')[0]}`,
      fullName: refUser.fullName,
      email: refUser.email,
      registrationDate: refUser.createdAt ? new Date(refUser.createdAt).toLocaleDateString() : 'Recent',
      depositStatus,
      rewardStatus,
      isQualified,
    };
  });

  // Calculate Statistics
  const totalInvites = referredUsers.length;
  const qualifiedReferrals = referralHistory.filter((r) => r.isQualified).length;
  const pendingRewards = totalInvites - qualifiedReferrals;
  const totalEarnings = user.referralEarnings || 0;

  // Copy Referral Link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    if (showToast) {
      showToast('success', 'Referral link copied successfully.');
    }
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Copy Referral Code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    if (showToast) {
      showToast('success', 'Referral code copied successfully.');
    }
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Native or Fallback Share
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invite Friends & Earn ETB 100',
          text: shareMessage,
          url: referralLink,
        });
        if (showToast) {
          showToast('success', 'Shared successfully!');
        }
        return;
      } catch (err) {
        // Fallback to share modal if user cancels or API fails
      }
    }
    setShowShareModal(true);
  };

  // Social Share Action Links
  const shareLinks = [
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-400 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + referralLink)}`,
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
    {
      name: 'SMS',
      icon: Smartphone,
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      url: `sms:?body=${encodeURIComponent(shareMessage + ' ' + referralLink)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-700 hover:bg-slate-600 text-white',
      url: `mailto:?subject=${encodeURIComponent('Join ZelSurvey & Earn')}&body=${encodeURIComponent(shareMessage + '\n\n' + referralLink)}`,
    },
  ];

  return (
    <div className="space-y-6 my-2">
      
      {/* MAIN LARGE PREMIUM REFERRAL CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white p-6 sm:p-8 shadow-2xl border border-blue-400/30">
        
        {/* Glow/Decorative Background Accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Affiliate & Referral Program</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Invite Friends & Earn ETB 100
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
              Invite your friends using your unique referral link. When a referred user deposits ETB 1,000 or more and the deposit is approved, you earn ETB 100.
            </p>
          </div>

          {/* Referral Credentials Display (Code & Link) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Referral Code Display */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                Referral Code
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                  {referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-white/20"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Referral Link Display */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                Referral Link
              </span>
              <div className="flex items-center justify-between gap-3 overflow-hidden">
                <span className="text-xs sm:text-sm font-mono text-blue-100 truncate">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-white/20"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* TWO LARGE ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <button
              onClick={handleCopyLink}
              className="w-full py-4 px-6 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm sm:text-base shadow-xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Referral Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-blue-600" />
                  <span>📋 Copy Referral Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareLink}
              className="w-full py-4 px-6 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-sm sm:text-base shadow-xl border border-blue-300/40 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
            >
              <Share2 className="w-5 h-5 text-amber-300" />
              <span>📤 Share Referral Link</span>
            </button>

          </div>

          {/* REFERRAL STATISTICS CARDS */}
          <div className="pt-4 border-t border-white/15">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-200 mb-3">
              Referral Performance Overview
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* 👥 Total Invites */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                <div className="flex items-center justify-between text-blue-200">
                  <span className="text-[11px] font-extrabold uppercase">Total Invites</span>
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{totalInvites}</p>
                <p className="text-[10px] text-blue-200">Registered with your code</p>
              </div>

              {/* 💰 Total Referral Earnings */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                <div className="flex items-center justify-between text-blue-200">
                  <span className="text-[11px] font-extrabold uppercase">Total Referral Earnings</span>
                  <DollarSign className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-300">
                  ETB {totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-blue-200">Credited directly to wallet</p>
              </div>

              {/* ✅ Qualified Referrals */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                <div className="flex items-center justify-between text-blue-200">
                  <span className="text-[11px] font-extrabold uppercase">Qualified Referrals</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{qualifiedReferrals}</p>
                <p className="text-[10px] text-blue-200">Deposited &ge; ETB 1,000</p>
              </div>

              {/* ⏳ Pending Rewards */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                <div className="flex items-center justify-between text-blue-200">
                  <span className="text-[11px] font-extrabold uppercase">Pending Rewards</span>
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{pendingRewards}</p>
                <p className="text-[10px] text-blue-200">Awaiting deposit approval</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* REFERRAL HISTORY TABLE / CARDS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Referral Network History</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track users who registered with your invitation link and their deposit status.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
            {referralHistory.length} Registered {referralHistory.length === 1 ? 'Friend' : 'Friends'}
          </span>
        </div>

        {referralHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
            <UserCheck className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Invites Recorded Yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Share your referral link <strong className="font-mono text-blue-600 dark:text-blue-400">{referralLink}</strong> with friends. When they sign up and complete an approved deposit of ETB 1,000 or more, you automatically earn ETB 100!
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                  <th className="pb-3 pl-2">Username</th>
                  <th className="pb-3">Registration Date</th>
                  <th className="pb-3">Deposit Status</th>
                  <th className="pb-3 pr-2 text-right">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {referralHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Username */}
                    <td className="py-3.5 pl-2">
                      <div className="font-extrabold text-slate-900 dark:text-white">{item.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.username}</div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {item.registrationDate}
                    </td>

                    {/* Deposit Status */}
                    <td className="py-3.5">
                      {item.depositStatus === 'Deposit Approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deposit Approved</span>
                        </span>
                      ) : item.depositStatus === 'Deposit Pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Deposit Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span>Registered</span>
                        </span>
                      )}
                    </td>

                    {/* Reward Status */}
                    <td className="py-3.5 pr-2 text-right">
                      {item.rewardStatus === 'Reward Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>Reward Paid (ETB 100)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Reward Pending</span>
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SHARE MODAL FOR MOBILE / DESKTOP FALLBACK */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Share2 className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Share Referral Link</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share your invitation link across social apps. When your contact signs up and completes an approved deposit of ETB 1,000 or more, you receive ETB 100 instantly.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map((app) => {
                const IconComponent = app.icon;
                return (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-2xl ${app.color} font-bold text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95 cursor-pointer`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{app.name}</span>
                  </a>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Your Referral Link</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-700 dark:text-slate-200 truncate">{referralLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
