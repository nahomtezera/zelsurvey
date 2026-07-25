import React from 'react';
import { User } from '../../types';
import { getMembershipInfo } from '../../services/gamificationService';
import { Shield, Check, Lock, Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';

interface MembershipViewProps {
  user: User;
  onNavigateToDeposit?: () => void;
  setActiveTab?: (tab: string) => void;
}

const ALL_TIERS = [
  {
    tier: 'Bronze',
    badge: '🥉',
    title: 'Bronze Member',
    minDeposit: 0,
    maxDeposit: 'ETB 4,999',
    color: 'from-amber-700 via-orange-800 to-stone-800',
    borderColor: 'border-amber-700/50',
    benefits: [
      'Access to Starter Investment Plans',
      'Daily Check-in Rewards',
      '5% Referral Bonus Commission'
    ]
  },
  {
    tier: 'Silver',
    badge: '🥈',
    title: 'Silver Member',
    minDeposit: 5000,
    maxDeposit: 'ETB 19,999',
    color: 'from-slate-400 via-slate-500 to-slate-700',
    borderColor: 'border-slate-400/50',
    benefits: [
      'Standard Deposit & Withdrawal Verification',
      '5% Referral Bonus Commission',
      'Access to Silver Investment Plans'
    ]
  },
  {
    tier: 'Gold',
    badge: '🥇',
    title: 'Gold Member',
    minDeposit: 20000,
    maxDeposit: 'ETB 49,999',
    color: 'from-amber-500 via-yellow-500 to-amber-700',
    borderColor: 'border-amber-400/60',
    benefits: [
      'Accelerated Withdrawal Approvals',
      '7% Referral Bonus Commission',
      'Gold Member Daily Check-in Multiplier'
    ]
  },
  {
    tier: 'Platinum',
    badge: '💎',
    title: 'Platinum Investor',
    minDeposit: 50000,
    maxDeposit: 'ETB 99,999',
    color: 'from-purple-500 via-indigo-600 to-blue-700',
    borderColor: 'border-purple-500/60',
    benefits: [
      'Priority Deposit & Withdrawal Processing',
      'Access to Platinum Investment Packages',
      '10% Referral Bonus Commission',
      'Dedicated Financial Support Specialist'
    ]
  },
  {
    tier: 'VIP',
    badge: '👑',
    title: 'VIP Elite Member',
    minDeposit: 100000,
    maxDeposit: 'ETB 100,000+',
    color: 'from-amber-400 via-amber-500 to-yellow-600',
    borderColor: 'border-amber-300/80',
    benefits: [
      'Highest Priority 24/7 VIP Support',
      'Instant Deposit & Withdrawal Processing',
      'Exclusive VIP High-Yield Investment Plans (+1.5% Bonus ROI)',
      'Personal Portfolio Wealth Manager',
      'Unlimited Daily Rewards & Double Points'
    ]
  }
];

export const MembershipView: React.FC<MembershipViewProps> = ({ user, onNavigateToDeposit, setActiveTab }) => {
  const currentMembership = getMembershipInfo(user);

  const handleDepositClick = () => {
    if (typeof onNavigateToDeposit === 'function') {
      onNavigateToDeposit();
    } else if (typeof setActiveTab === 'function') {
      setActiveTab('deposit');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* HEADER BANNER WITH CURRENT TIER */}
      <div className={`bg-gradient-to-r ${currentMembership.color} text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Current Membership Status</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl">{currentMembership.badge}</span>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black">{currentMembership.title}</h1>
                <p className="text-white/80 text-xs sm:text-sm">
                  Total Verified Deposits: <strong className="text-white">ETB {user.totalDeposits.toLocaleString()}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full md:w-80 space-y-2 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-white/80">Tier Progress</span>
              <span className="text-amber-300 font-extrabold">{currentMembership.progressPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500 shadow"
                style={{ width: `${currentMembership.progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-white/90 leading-snug">
              {currentMembership.upgradeRequirement}
            </p>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP TIERS GRID */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>Membership Tiers & Exclusive Benefits</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Increase your total deposits to automatically upgrade your membership tier and unlock higher benefits.
            </p>
          </div>

          <button
            onClick={handleDepositClick}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span>Deposit Funds to Upgrade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_TIERS.map((tier) => {
            const isCurrent = currentMembership.tier === tier.tier;
            const isUnlocked = user.totalDeposits >= tier.minDeposit;

            return (
              <div
                key={tier.tier}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all p-6 flex flex-col justify-between relative ${
                  isCurrent
                    ? 'border-2 border-blue-500 dark:border-blue-400 shadow-xl ring-4 ring-blue-500/10 scale-102'
                    : isUnlocked
                    ? 'border-slate-300 dark:border-slate-700 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                {/* TIER BADGE TOP BAR */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{tier.badge}</span>
                    {isCurrent ? (
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                        Current Tier
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{tier.title}</h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                    Requirement: {tier.minDeposit === 0 ? 'No Minimum' : `ETB ${tier.minDeposit.toLocaleString()}+`} Total Deposits
                  </p>

                  {/* BENEFIT LIST */}
                  <ul className="mt-6 space-y-2.5">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BOTTOM UPGRADE ACTION */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isCurrent ? (
                    <div className="text-center py-2 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      Active Tier Level
                    </div>
                  ) : isUnlocked ? (
                    <div className="text-center py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      Qualified Member
                    </div>
                  ) : (
                    <button
                      onClick={handleDepositClick}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Deposit ETB {(tier.minDeposit - user.totalDeposits).toLocaleString()} to Unlock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
