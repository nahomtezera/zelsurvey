import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Banknote, 
  Zap, 
  Lock, 
  ChevronRight, 
  Award, 
  Users, 
  HelpCircle, 
  Check, 
  Building2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_PLANS } from '../../services/storage';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectPlan: (planId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onSelectPlan }) => {
  const [calculatorAmount, setCalculatorAmount] = useState<number>(5000);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const calculateReturn = (amount: number) => {
    // Find closest plan matching the amount
    const plan = [...DEFAULT_PLANS].reverse().find((p) => amount >= p.minInvestment) || DEFAULT_PLANS[0];
    const daily = (amount / plan.minInvestment) * plan.dailyEarnings;
    const profit = daily * plan.durationDays;
    const total = amount + profit;
    return { daily, total, profit, planName: plan.name, durationDays: plan.durationDays };
  };

  const calc = calculateReturn(calculatorAmount);

  const faqs = [
    {
      q: 'How do I deposit funds into my ZelSurvey account?',
      a: 'Transfer your desired investment amount directly using our official bank transfer details provided on the Deposit page. Save the payment screenshot or transaction receipt, submit it on the Deposit page, and once verified by our admin team, your wallet balance will be updated automatically.',
    },
    {
      q: 'Is there a minimum deposit requirement?',
      a: 'The minimum investment plan starts at ETB 1,000 for the Starter Plan. You can choose higher tiers up to ETB 25,000 for maximum compounding returns.',
    },
    {
      q: 'What is the minimum withdrawal amount and how are requests processed?',
      a: 'Withdrawal requests are processed promptly to your verified bank or mobile wallet account. Minimum withdrawal is ETB 5,000, and your available balance must be at least ETB 5,000 to request a withdrawal.',
    },
    {
      q: 'How does the ZelSurvey Referral System work?',
      a: 'Every registered user receives a unique referral code and link. When your friends register and make their first verified deposit, you earn a 5% instant referral commission added to your wallet balance.',
    },
    {
      q: 'Is my data secure on ZelSurvey?',
      a: 'Yes. ZelSurvey uses local encrypted storage protocols and client session validation to ensure complete security of your transactions and investment logs.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-60 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Next-Gen Ethiopian Investment Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Smart Wealth Accumulation for{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Forward Investors
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Grow your capital securely with secure bank transfers, fast withdrawals, and a transparent investment experience built for Ethiopia.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm"
                >
                  Existing Member Login
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">ETB 1,000</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Min Investment</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">100% Verified</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Receipts</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Daily ROI</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automated Earnings</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Yield Calculator Card */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Yield Estimator</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calculate Potential Return</h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-2xl text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                {/* Amount Slider Input */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Investment Amount</label>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      ETB {calculatorAmount.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1000}
                    max={25000}
                    step={1000}
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>ETB 1,000 (Starter)</span>
                    <span>ETB 25,000 (Diamond)</span>
                  </div>
                </div>

                {/* Projected Results Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Daily Return</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      ETB {calc.daily.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Net Profit</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      +ETB {calc.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Total Expected Payout:</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                      ETB {calc.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Invest ETB {calculatorAmount.toLocaleString()} Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Why Choose ZelSurvey</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Security, Speed & Yield
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Engineered to bring international fintech standards to Ethiopian investors with transparent banking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Bank Integration</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deposit safely via local bank transfer. Upload your transaction receipt for quick admin verification and wallet credit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Automated Yields</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Watch your investment grow every 24 hours. Daily returns range from 1.5% to 3.8% depending on your chosen investment plan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5% Referral Commission</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Share your personalized referral code with friends. Earn an instant 5% commission on every verified deposit made by your network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTMENT PLANS PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Growth Packages</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Select Your Investment Plan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Flexible durations and yields designed to match every capital scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {DEFAULT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all hover:-translate-y-1 flex flex-col justify-between ${
                plan.popular
                  ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${plan.color} text-white flex items-center justify-center font-bold mb-4 shadow-sm`}>
                  {plan.name.charAt(0)}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="my-6 py-4 border-y border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Min Investment:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">ETB {plan.minInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Daily Earnings:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">ETB {plan.dailyEarnings.toLocaleString()}/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{plan.durationDays} Days</span>
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
                onClick={() => {
                  onSelectPlan(plan.id);
                  onOpenAuth('register');
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200'
                }`}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">How ZelSurvey Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Register with your name, phone number, and email in under 60 seconds.' },
              { step: '02', title: 'Bank Deposit', desc: 'Transfer funds to our official bank account and upload your payment proof.' },
              { step: '03', title: 'Admin Verification', desc: 'Admin reviews your receipt and credits your wallet balance promptly.' },
              { step: '04', title: 'Earn & Withdraw', desc: 'Select an investment plan, accrue daily interest, and withdraw to your bank or mobile wallet.' },
            ].map((s) => (
              <div key={s.step} className="p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm relative">
                <span className="text-3xl font-black text-blue-600/20 dark:text-blue-400/20 mb-3 block">{s.step}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{s.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Investor Reviews</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Trusted by Ethiopian Investors</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Abebe Tadesse',
              location: 'Addis Ababa',
              text: 'ZelSurvey makes depositing through bank transfer effortless. My Gold plan yields daily earnings right into my wallet.',
              plan: 'Gold Plan Investor',
            },
            {
              name: 'Makeda Bekele',
              location: 'Hawassa',
              text: 'The deposit verification process is very transparent. Once approved, I was able to activate the Platinum plan immediately.',
              plan: 'Platinum Plan Investor',
            },
            {
              name: 'Yonas Haile',
              location: 'Adama',
              text: 'The referral bonus is real! I shared my code with colleagues and received 5% commission on their first verified deposits.',
              plan: 'Silver Plan Investor',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-6">"{item.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h5>
                  <p className="text-[11px] text-slate-400">{item.location} • <span className="text-blue-600 dark:text-blue-400">{item.plan}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Support</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-90' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/40">
                    <p className="mt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Ready to Start Growing Your Portfolio?</h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Join thousands of smart investors using ZelSurvey to build wealth with automated returns and verified bank deposits.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              Z
            </div>
            <span className="text-white font-bold text-base">ZelSurvey</span>
          </div>

          <p className="text-center md:text-left">
            © 2026 ZelSurvey Fintech Platform. All rights reserved. Automated investment management systems.
          </p>

          <div className="flex items-center gap-6">
            <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">Login</button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">Register</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
