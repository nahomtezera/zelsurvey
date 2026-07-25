import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { PieChart, Check, ShieldCheck, AlertCircle, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { getPlans, purchaseInvestmentPlan } from '../../services/storage';
import { User, InvestmentPlan } from '../../types';

interface InvestmentPlansViewProps {
  user: User;
  onPlanPurchased: () => void;
  setActiveTab: (tab: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const InvestmentPlansView: React.FC<InvestmentPlansViewProps> = ({
  user,
  onPlanPurchased,
  setActiveTab,
  showToast,
}) => {
  const plans = getPlans();
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [insufficientModal, setInsufficientModal] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleInvestClick = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    if (user.balance < plan.minInvestment) {
      setInsufficientModal(true);
    } else {
      setConfirmModal(true);
    }
  };

  const handleConfirmInvestment = () => {
    if (!selectedPlan) return;
    setLoading(true);

    setTimeout(() => {
      const res = purchaseInvestmentPlan(user.id, selectedPlan.id);
      setLoading(false);
      setConfirmModal(false);

      if (!res.success) {
        showToast('error', 'Purchase Failed', res.message);
        return;
      }

      // Confetti celebration
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {
        console.error(err);
      }

      showToast('success', 'Plan Subscribed! 🎉', res.message);
      onPlanPurchased();
      setActiveTab('my-investments');
    }, 500);
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4" />
            <span>Yield Packages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Investment Plans</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Select a high-yield capital package to begin generating daily interest.
          </p>
        </div>

        {/* Current Balance */}
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
          <Wallet className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Your Wallet</p>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              ETB {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {plans.map((plan) => {
          const isAffordable = user.balance >= plan.minInvestment;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all hover:-translate-y-1 flex flex-col justify-between ${
                plan.popular
                  ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${plan.color} text-white flex items-center justify-center font-black text-lg mb-4 shadow-md`}>
                  {plan.name.charAt(0)}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="my-6 py-4 border-y border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Minimum Investment:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">ETB {plan.minInvestment.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Demo Daily Earnings:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">ETB {plan.dailyEarnings.toLocaleString()}/day</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Daily ROI Rate:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">+{plan.dailyRoiPercent}% / day</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Plan Duration:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{plan.durationDays} Days</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-bold">Total Expected Return:</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      ETB {(plan.minInvestment + (plan.dailyEarnings * plan.durationDays)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInvestClick(plan)}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white'
                }`}
              >
                <span>Invest ETB {plan.minInvestment.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 text-left space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Confirm Investment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Subscribe to the <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.name} Plan</span> for ETB {selectedPlan.minInvestment.toLocaleString()}?
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Investment Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">ETB {selectedPlan.minInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demo Daily Earnings:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ETB {selectedPlan.dailyEarnings.toLocaleString()}/day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-blue-600">{selectedPlan.durationDays} Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Total Expected Return:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  ETB {(selectedPlan.minInvestment + (selectedPlan.dailyEarnings * selectedPlan.durationDays)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvestment}
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                {loading ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance Modal */}
      {insufficientModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Insufficient Balance</h3>
            
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-1">
              <p className="font-bold text-sm">Please deposit funds first.</p>
              <p>
                Your wallet balance is <span className="font-bold">ETB {user.balance.toLocaleString()}</span>, but the <span className="font-bold">{selectedPlan.name} Plan</span> requires <span className="font-bold">ETB {selectedPlan.minInvestment.toLocaleString()}</span>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setInsufficientModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setInsufficientModal(false);
                  setActiveTab('deposit');
                }}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                Go to Deposit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
