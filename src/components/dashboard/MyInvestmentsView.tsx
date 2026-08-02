import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Calendar, CheckCircle2, PieChart, TrendingUp, DollarSign, Timer } from 'lucide-react';
import { getUserInvestments, processDailyEarnings } from '../../services/storage';
import { User, UserInvestment } from '../../types';

interface MyInvestmentsViewProps {
  user: User;
  setActiveTab: (tab: string) => void;
}

export const MyInvestmentsView: React.FC<MyInvestmentsViewProps> = ({ user, setActiveTab }) => {
  const [now, setNow] = useState<number>(Date.now());
  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    processDailyEarnings();
    return getUserInvestments(user.id);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      processDailyEarnings();
      setInvestments(getUserInvestments(user.id));
    }, 1000);
    return () => clearInterval(timer);
  }, [user.id]);

  const formatCountdown = (inv: UserInvestment) => {
    if (inv.status === 'Completed' || inv.daysElapsed >= inv.durationDays) {
      return 'Completed 🏆';
    }
    const startTime = new Date(inv.startDate).getTime();
    if (isNaN(startTime)) return 'Active';

    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const nextPayoutTime = startTime + (inv.daysElapsed + 1) * DAY_IN_MS;
    const diff = nextPayoutTime - now;

    if (diff <= 0) {
      return 'Processing Daily Payout... 💸';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Active Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">My Investments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track active plan durations, daily returns, and real-time next reward countdowns.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('investment-plans')}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PieChart className="w-4 h-4" />
          <span>Subscribe New Plan</span>
        </button>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Investments Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Deposit funds to your wallet and subscribe to any of our investment packages to start receiving daily earnings automatically.
          </p>
          <button
            onClick={() => setActiveTab('investment-plans')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20"
          >
            Browse Investment Plans
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {investments.map((inv) => {
            const progressPercent = Math.min(100, Math.round((inv.daysElapsed / inv.durationDays) * 100));
            const daysRemaining = Math.max(0, inv.durationDays - inv.daysElapsed);
            const totalEarnedSoFar = inv.daysElapsed * inv.dailyEarnings;
            const remainingExpectedEarnings = daysRemaining * inv.dailyEarnings;

            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                      Plan Subscription
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{inv.planName} Plan</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    inv.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {inv.status === 'Active' ? '🟢 Active' : '🏆 Completed'}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Investment Amount</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      ETB {inv.amount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Daily Earnings</p>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      ETB {inv.dailyEarnings.toLocaleString()}/day
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Earned So Far</p>
                    <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      ETB {totalEarnedSoFar.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Remaining Expected</p>
                    <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      ETB {remainingExpectedEarnings.toLocaleString()}
                    </p>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between">
                    <span className="text-slate-500">Purchase Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(inv.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Days Remaining */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      Days Elapsed: {inv.daysElapsed} / {inv.durationDays} Days ({daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Left)
                    </span>
                    <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Next Reward Time Countdown */}
                <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border border-amber-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Next Reward Time:</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-700 dark:text-amber-300">
                    {formatCountdown(inv)}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
                  <span>Total Expected Return:</span>
                  <span className="font-black">ETB {inv.totalReturn.toLocaleString()}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
