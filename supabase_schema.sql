-- ZelSurvey Supabase Database Schema

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_deposits NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_withdrawals NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  referral_earnings NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  active_plans_count INT NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  referral_reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_deposits NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_withdrawals NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  referral_earnings NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  bank_used TEXT NOT NULL,
  transaction_ref TEXT,
  payment_proof_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  method TEXT NOT NULL,
  account_info TEXT NOT NULL,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  reference_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending',
  reward_amount NUMERIC(15, 2) NOT NULL DEFAULT 100.00,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  bank_name TEXT NOT NULL DEFAULT 'Bank of Abyssinia',
  account_name TEXT NOT NULL DEFAULT 'Dagmawit Dinku Asefa',
  account_number TEXT NOT NULL DEFAULT '253267658',
  swift_code TEXT DEFAULT 'ABYSETAA',
  instructions TEXT NOT NULL DEFAULT 'Transfer the exact deposit amount to the official Bank of Abyssinia account above, capture your deposit receipt or screenshot, and upload it for instant admin verification.',
  min_withdrawal_amount NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
  referral_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00
);

-- 9. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  daily_earnings NUMERIC(15, 2) NOT NULL,
  total_return NUMERIC(15, 2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  duration_days INT NOT NULL,
  days_elapsed INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Active'
);

-- Disable Row Level Security (RLS) for seamless client operations
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;
