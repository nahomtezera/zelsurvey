import React from 'react';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart, 
  Briefcase, 
  TrendingUp, 
  Award, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Users,
  Gift,
  Flame,
  Shield,
  Trophy,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Transaction, ActiveTab, UserInvestment } from '../../types';
import { getMembershipInfo, checkDailyCheckInStatus, getAllAchievements, getProfileCompletion } from '../../services/gamificationService';
import { getPlatformSettings } from '../../services/storage';
import { DashboardReferralSection } from './DashboardReferralSection';

interface UserDashboardProps {
  user: User;
  setActiveTab: (tab: ActiveTab) => void;
  transactions: Transaction[];
  investments: UserInvestment[];
  onSeedDemoData?: () => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  setActiveTab,
  transactions,
  investments,
  onSeedDemoData,
  showToast,
}) => {
  const membership = getMembershipInfo(user);
  const dailyStatus = checkDailyCheckInStatus(user);
  const achievements = getAllAchievements(user);
  const profileCompletion = getProfileCompletion(user);
  const platformSettings = getPlatformSettings();
  const minWithdrawal = platformSettings.minWithdrawalAmount || 5000;

  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  // Chart data
  const chartData = [
    { day: 'Mon', balance: Math.max(0, user.balance * 0.4) },
    { day: 'Tue', balance: Math.max(0, user.balance * 0.5) },
    { day: 'Wed', balance: Math.max(0, user.balance * 0.6) },
    { day: 'Thu', balance: Math.max(0, user.balance * 0.75) },
    { day: 'Fri', balance: Math.max(0, user.balance * 0.85) },
    { day: 'Sat', balance: Math.max(0, user.balance * 0.95) },
    { day: 'Sun', balance: user.balance },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Welcome Back Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Investor Portal</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-800">
              {membership.badge} {membership.tier}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back, {user.fullName}! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track investments, claim daily rewards, and monitor portfolio performance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('daily-rewards')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              dailyStatus.canClaim 
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{dailyStatus.canClaim ? 'Claim Daily Reward!' : `Streak: ${user.checkInStreak || 0} Days`}</span>
          </button>

          <button
            onClick={() => setActiveTab('deposit')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit</span>
          </button>
        </div>
      </div>

      {/* Available Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Available Wallet Balance</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {membership.badge} {membership.tier} Status
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              ETB {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>

            <p className="text-xs text-blue-100 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Verified Ledger • Minimum Withdrawal: ETB {minWithdrawal.toLocaleString()}</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('deposit')}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-center border border-white/20 transition-all group cursor-pointer"
            >
              <ArrowDownCircle className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold block">Deposit</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-center border border-white/20 transition-all group cursor-pointer"
            >
              <ArrowUpCircle className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold block">Withdraw</span>
            </button>

            <button
              onClick={() => setActiveTab('investment-plans')}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-center border border-white/20 transition-all group cursor-pointer"
            >
              <PieChart className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold block">Plans</span>
            </button>

            <button
              onClick={() => setActiveTab('daily-rewards')}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-center border border-white/20 transition-all group cursor-pointer"
            >
              <Gift className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform text-amber-300" />
              <span className="text-xs font-bold block text-amber-200">Rewards</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD REFERRAL CARD (IMMEDIATELY BELOW WALLET CARD) */}
      <DashboardReferralSection user={user} showToast={showToast} />

      {/* THREE INTERACTIVE HIGHLIGHT CARDS: MEMBERSHIP, DAILY CHECK-IN, PROFILE COMPLETION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* MEMBERSHIP CARD */}
        <div 
          onClick={() => setActiveTab('membership')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{membership.badge}</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                Level Status
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{membership.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{membership.upgradeRequirement}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Next Level Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{membership.progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${membership.progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* DAILY CHECK-IN CARD */}
        <div 
          onClick={() => setActiveTab('daily-rewards')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-2xl">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                dailyStatus.canClaim ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {dailyStatus.canClaim ? 'Claim Ready!' : 'Claimed Today'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Daily Rewards Streak</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current Streak: <strong>{user.checkInStreak || 0} Days</strong> • Total Points: <strong>{(user.rewardPoints || 0).toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>{dailyStatus.canClaim ? 'Claim Today\'s Bonus' : 'Streak Active'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* PROFILE COMPLETION CARD */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-2xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black font-mono tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                {profileCompletion.progressBarAscii}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Completion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Account setup: <strong>{profileCompletion.percentage}% complete</strong> ({profileCompletion.completedCount}/{profileCompletion.totalCount} steps)
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${profileCompletion.percentage}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* 4 STATISTICS CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Plans</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{user.activePlansCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Subscriptions active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Deposits</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ETB {user.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Verified bank receipts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Withdrawals</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ETB {user.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Processed payouts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Referral Earnings</span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ETB {user.referralEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">5% commission bonus</p>
        </div>
      </div>

      {/* PORTFOLIO CHART & ACHIEVEMENTS PREVIEW GRID */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Growth Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Portfolio Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly balance growth estimation</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }} 
                  formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACHIEVEMENTS & RECENT TRANSACTIONS PREVIEW */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Achievement Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Achievements</h3>
              </div>
              <button
                onClick={() => setActiveTab('achievements')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({unlockedAchievementsCount}/{achievements.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {achievements.slice(0, 4).map((a) => (
                <div 
                  key={a.id} 
                  title={a.title}
                  className={`p-2 rounded-2xl text-center border transition-all ${
                    a.isUnlocked 
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300/80 text-amber-600' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 grayscale'
                  }`}
                >
                  <span className="text-2xl block">{a.icon}</span>
                  <span className="text-[9px] font-bold block truncate mt-1 text-slate-700 dark:text-slate-300">{a.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Investments Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Investments</h3>
              <button
                onClick={() => setActiveTab('my-investments')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Active Investment Plans</p>
                <button
                  onClick={() => setActiveTab('investment-plans')}
                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Explore Plans
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {investments.slice(0, 2).map((inv) => (
                  <div key={inv.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{inv.planName} Plan</p>
                      <p className="text-[10px] text-slate-400">ETB {inv.dailyEarnings.toLocaleString()}/day</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
