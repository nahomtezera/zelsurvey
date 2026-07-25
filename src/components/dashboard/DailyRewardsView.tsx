import React, { useState } from 'react';
import { User } from '../../types';
import { 
  DAILY_REWARD_DAYS, 
  checkDailyCheckInStatus, 
  claimDailyReward, 
  getTodayDateString 
} from '../../services/gamificationService';
import { fireCelebrationConfetti, fireConfetti } from '../common/Confetti';
import { Calendar, Gift, Flame, Sparkles, CheckCircle2, Clock, Award, Coins } from 'lucide-react';

interface DailyRewardsViewProps {
  user: User;
  onUpdateUser?: (updatedUser: User) => void;
  onUserUpdated?: () => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onAddToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const DailyRewardsView: React.FC<DailyRewardsViewProps> = ({ 
  user, 
  onUpdateUser, 
  onUserUpdated,
  showToast, 
  onAddToast 
}) => {
  const [claiming, setClaiming] = useState(false);
  const [justClaimedDay, setJustClaimedDay] = useState<number | null>(null);

  const status = checkDailyCheckInStatus(user);
  const currentStreak = user.checkInStreak || 0;
  const totalPoints = user.rewardPoints || 0;
  const today = getTodayDateString();

  const handleClaim = () => {
    if (!status.canClaim || claiming) return;

    setClaiming(true);
    setTimeout(() => {
      const res = claimDailyReward(user.id);
      setClaiming(false);

      if (res.success && res.user) {
        setJustClaimedDay(res.dayClaimed);
        if (typeof onUpdateUser === 'function') {
          onUpdateUser(res.user);
        }
        if (typeof onUserUpdated === 'function') {
          onUserUpdated();
        }

        const msg = res.message || 'Daily reward claimed!';
        if (typeof showToast === 'function') {
          showToast('success', 'Daily Reward Claimed! 🎉', msg);
        } else if (typeof onAddToast === 'function') {
          onAddToast(msg, 'success');
        }

        if (res.dayClaimed === 7 || res.cashBonus > 0) {
          fireCelebrationConfetti();
        } else {
          fireConfetti();
        }
      } else {
        const msg = res.message || 'Daily reward status updated.';
        if (typeof showToast === 'function') {
          showToast('info', 'Daily Reward Status', msg);
        } else if (typeof onAddToast === 'function') {
          onAddToast(msg, 'info');
        }
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold border border-white/20">
              <Gift className="w-4 h-4 text-amber-200" />
              <span>Daily Check-in Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Earn Daily Free Rewards</h1>
            <p className="text-amber-100 text-sm max-w-xl leading-relaxed">
              Log in every day to claim reward points and cash bonuses. Keep your 7-day streak active to unlock the grand Day 7 bonus!
            </p>
          </div>

          {/* STATS BADGES */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-3 px-3 py-1 border-r border-white/20">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-amber-200 font-bold uppercase">Streak Counter</p>
                <p className="text-lg font-black">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-300">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-amber-200 font-bold uppercase">Reward Points</p>
                <p className="text-lg font-black">{totalPoints.toLocaleString()} Pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLAIM ACTION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
              status.canClaim 
                ? 'bg-amber-500 text-white animate-bounce' 
                : 'bg-emerald-500 text-white'
            }`}>
              {status.canClaim ? <Sparkles className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {status.canClaim 
                  ? `Day ${status.nextDayToClaim} Reward Ready!` 
                  : 'Today\'s Reward Claimed'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {status.canClaim 
                  ? 'Tap the button below to claim your daily points now.' 
                  : 'You are on track! Next check-in resets tomorrow at 00:00.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={!status.canClaim || claiming}
            className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
              status.canClaim 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            {claiming ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : status.canClaim ? (
              <>
                <Gift className="w-5 h-5" />
                <span>Claim Day {status.nextDayToClaim} Reward</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span>Check-in Claimed Today</span>
              </>
            )}
          </button>
        </div>

        {/* PROGRESS TRACKER BAR */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-slate-600 dark:text-slate-400">7-Day Streak Progress</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">{currentStreak} / 7 Days</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, (currentStreak / 7) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-DAY REWARD STREAK CALENDAR CARDS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">7-Day Reward Roadmap</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {DAILY_REWARD_DAYS.map((item) => {
            const isCompleted = currentStreak >= item.day && !status.canClaim;
            const isNextToClaim = status.canClaim && status.nextDayToClaim === item.day;
            const isJustClaimed = justClaimedDay === item.day;

            return (
              <div
                key={item.day}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  item.isBonusDay
                    ? 'col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-b from-amber-500/10 via-orange-500/10 to-amber-500/20 border-amber-400 dark:border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : isNextToClaim
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 shadow-md ring-2 ring-amber-400/50 scale-105'
                    : isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* DAY BADGE */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isNextToClaim
                      ? 'bg-amber-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    Day {item.day}
                  </span>

                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {item.isBonusDay && (
                    <Award className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
                  )}
                </div>

                {/* ICON & REWARD DISPLAY */}
                <div className="my-2 flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 font-black text-lg ${
                    item.isBonusDay
                      ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md'
                      : isNextToClaim
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-amber-500'
                  }`}>
                    {item.isBonusDay ? '🎁' : '🪙'}
                  </div>

                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    +{item.points} Pts
                  </p>

                  {item.cashBonus && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +ETB {item.cashBonus}
                    </span>
                  )}
                </div>

                {/* FOOTER LABEL */}
                <div className="mt-2 text-center border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {item.isBonusDay ? 'Bonus Reward' : item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
