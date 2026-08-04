export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  avatarUrl?: string;
  bio?: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referralEarnings: number;
  activePlansCount: number;
  createdAt: string;
  isBanned?: boolean;
  referralRewardPaid?: boolean; // Indicates if ETB 100 referral reward was paid to referrer for this user
  // Daily Rewards & Engagement
  lastCheckInDate?: string; // YYYY-MM-DD
  checkInStreak?: number; // 1 - 7
  rewardPoints?: number;
  unlockedAchievements?: string[]; // Array of achievement IDs
}

export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';

export interface MembershipInfo {
  tier: MembershipTier;
  badge: string;
  title: string;
  color: string;
  minDeposit: number;
  nextTier: MembershipTier | null;
  nextTierMinDeposit: number | null;
  progressPercent: number;
  benefits: string[];
  upgradeRequirement: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPoints: number;
  rewardCash?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'onboarding' | 'finance' | 'engagement' | 'social';
}

export interface DailyRewardDay {
  day: number;
  points: number;
  cashBonus?: number;
  isBonusDay?: boolean;
  label: string;
}

export interface ReferrerLeaderboardItem {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarUrl?: string;
  totalReferrals: number;
  totalEarned: number;
  membershipBadge: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  instructions: string;
}

export type DepositStatus = 'Pending' | 'Approved' | 'Rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankUsed: string;
  transactionRef?: string;
  paymentProofUrl: string; // Base64 or object URL preview
  notes?: string;
  date: string;
  status: DepositStatus;
  adminNotes?: string;
  reviewedAt?: string;
}

export type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  accountInfo: string;
  accountName?: string;
  date: string;
  status: WithdrawalStatus;
  adminNotes?: string;
  reviewedAt?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  dailyEarnings: number;
  durationDays: number;
  dailyRoiPercent: number;
  totalReturnPercent: number;
  description: string;
  popular?: boolean;
  color: string;
}

export type InvestmentStatus = 'Active' | 'Completed';

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  dailyEarnings: number;
  totalReturn: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  daysElapsed: number;
  status: InvestmentStatus;
  lastClaimDate?: string;
}

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Investment' | 'Referral Commission' | 'Plan Earnings' | 'Daily Earnings' | 'Admin Adjustment';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Rejected';
  referenceId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'deposit' | 'withdrawal' | 'investment' | 'system' | 'referral';
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  target: 'all' | string; // 'all' or userId
  author: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'deposit'
  | 'withdraw'
  | 'investment-plans'
  | 'my-investments'
  | 'daily-rewards'
  | 'membership'
  | 'achievements'
  | 'transactions'
  | 'referrals'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'admin';

export type AuthMode = 'none' | 'login' | 'register' | 'admin-login';
