import { 
  User, 
  DepositRequest, 
  WithdrawalRequest, 
  InvestmentPlan, 
  UserInvestment, 
  Transaction, 
  NotificationItem, 
  SystemAnnouncement,
  BankAccountInfo 
} from '../types';
import { supabase } from '../lib/supabase';

export const SUPER_ADMIN_EMAIL = 'Kinghanubas123@gmail.com';
export const SUPER_ADMIN_PASS = 'Superman@batman';

const KEYS = {
  CURRENT_USER: 'zelsurvey_current_user',
  USERS: 'zelsurvey_users',
  DEPOSITS: 'zelsurvey_deposits',
  WITHDRAWALS: 'zelsurvey_withdrawals',
  INVESTMENTS: 'zelsurvey_investments',
  TRANSACTIONS: 'zelsurvey_transactions',
  NOTIFICATIONS: 'zelsurvey_notifications',
  ANNOUNCEMENTS: 'zelsurvey_announcements',
  PLANS: 'zelsurvey_plans',
  SETTINGS: 'zelsurvey_settings',
  THEME: 'zelsurvey_theme',
};

export interface PlatformSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  instructions: string;
  minWithdrawalAmount: number;
  referralCommissionPercent: number;
}

// Default Platform Settings
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  bankName: 'Official Bank Account',
  accountName: 'ZelSurvey Automated Systems',
  accountNumber: '1000 0000 0000',
  swiftCode: 'BANKETAA',
  instructions: 'Transfer the exact deposit amount to the official bank account above, capture your deposit receipt or screenshot, and upload it for instant admin verification.',
  minWithdrawalAmount: 5000,
  referralCommissionPercent: 5,
};

// Default Investment Plans
export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    minInvestment: 1000,
    dailyEarnings: 200,
    durationDays: 10,
    dailyRoiPercent: 20.0,
    totalReturnPercent: 200,
    description: 'Perfect for beginners looking to test the ZelSurvey automated investment engine.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'silver',
    name: 'Silver',
    minInvestment: 3000,
    dailyEarnings: 500,
    durationDays: 15,
    dailyRoiPercent: 16.67,
    totalReturnPercent: 250,
    description: 'Standard plan with accelerated yield for growth-focused investors.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'gold',
    name: 'Gold',
    minInvestment: 5000,
    dailyEarnings: 800,
    durationDays: 20,
    dailyRoiPercent: 16.0,
    totalReturnPercent: 320,
    popular: true,
    description: 'High-yield tier with optimized compound returns and priority verification.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minInvestment: 10000,
    dailyEarnings: 1500,
    durationDays: 30,
    dailyRoiPercent: 15.0,
    totalReturnPercent: 450,
    description: 'Elite investment package designed for substantial wealth generation.',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    minInvestment: 25000,
    dailyEarnings: 2500,
    durationDays: 45,
    dailyRoiPercent: 10.0,
    totalReturnPercent: 450,
    description: 'Maximum yield capital allocation with dedicated portfolio analytics.',
    color: 'from-emerald-500 to-teal-700',
  },
];

export const COMPANY_BANK_ACCOUNT: BankAccountInfo = {
  bankName: 'Official Bank Account',
  accountName: 'ZelSurvey Automated Systems',
  accountNumber: '1000 0000 0000',
  instructions: 'Transfer the amount to the official bank account above, capture your receipt or screenshot, and upload it in the form below.',
};

// Helper to safely load data from Local Cache
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return defaultValue;
  }
}

// Helper to save data to Local Cache & emit update event
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('zelsurvey_storage_updated'));
  } catch (e) {
    console.error(`Error writing ${key}`, e);
  }
}

// Transform functions between DB columns and UI models
function mapProfileToUser(p: any): User {
  return {
    id: p.id,
    fullName: p.full_name || p.fullName || 'User',
    username: p.username || 'user',
    email: p.email || '',
    phone: p.phone || '',
    password: p.password || undefined,
    role: p.role || 'user',
    referralCode: p.referral_code || p.referralCode || 'ZEL-10000',
    referredBy: p.referred_by || p.referredBy || undefined,
    balance: Number(p.balance || 0),
    totalDeposits: Number(p.total_deposits || p.totalDeposits || 0),
    totalWithdrawals: Number(p.total_withdrawals || p.totalWithdrawals || 0),
    referralEarnings: Number(p.referral_earnings || p.referralEarnings || 0),
    activePlansCount: Number(p.active_plans_count || p.activePlansCount || 0),
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    isBanned: Boolean(p.is_banned || p.isBanned),
    referralRewardPaid: Boolean(p.referral_reward_paid || p.referralRewardPaid),
  };
}

function mapUserToProfile(u: User): any {
  return {
    id: u.id,
    full_name: u.fullName,
    username: u.username,
    email: u.email,
    phone: u.phone || '',
    role: u.role || 'user',
    referral_code: u.referralCode,
    referred_by: u.referredBy || null,
    balance: u.balance || 0,
    total_deposits: u.totalDeposits || 0,
    total_withdrawals: u.totalWithdrawals || 0,
    referral_earnings: u.referralEarnings || 0,
    active_plans_count: u.activePlansCount || 0,
    is_banned: u.isBanned || false,
    referral_reward_paid: u.referralRewardPaid || false,
    created_at: u.createdAt || new Date().toISOString(),
  };
}

function mapDepositToDb(d: DepositRequest): any {
  return {
    id: d.id,
    user_id: d.userId,
    user_name: d.userName,
    user_email: d.userEmail,
    amount: d.amount,
    bank_used: d.bankUsed,
    transaction_ref: d.transactionRef || null,
    payment_proof_url: d.paymentProofUrl,
    notes: d.notes || null,
    status: d.status,
    date: d.date,
    reviewed_at: d.reviewedAt || null,
    admin_notes: d.adminNotes || null,
  };
}

function mapDbToDeposit(d: any): DepositRequest {
  return {
    id: d.id,
    userId: d.user_id || d.userId,
    userName: d.user_name || d.userName || 'User',
    userEmail: d.user_email || d.userEmail || '',
    amount: Number(d.amount || 0),
    bankUsed: d.bank_used || d.bankUsed || 'Bank Transfer',
    transactionRef: d.transaction_ref || d.transactionRef || undefined,
    paymentProofUrl: d.payment_proof_url || d.paymentProofUrl || '',
    notes: d.notes || undefined,
    status: d.status || 'Pending',
    date: d.date || new Date().toISOString(),
    reviewedAt: d.reviewed_at || d.reviewedAt || undefined,
    adminNotes: d.admin_notes || d.adminNotes || undefined,
  };
}

function mapWithdrawalToDb(w: WithdrawalRequest): any {
  return {
    id: w.id,
    user_id: w.userId,
    user_name: w.userName,
    user_email: w.userEmail,
    amount: w.amount,
    method: w.method,
    account_info: w.accountInfo,
    account_name: w.accountName || null,
    status: w.status,
    date: w.date,
    reviewed_at: w.reviewedAt || null,
    admin_notes: w.adminNotes || null,
  };
}

function mapDbToWithdrawal(w: any): WithdrawalRequest {
  return {
    id: w.id,
    userId: w.user_id || w.userId,
    userName: w.user_name || w.userName || 'User',
    userEmail: w.user_email || w.userEmail || '',
    amount: Number(w.amount || 0),
    method: w.method || 'Bank Transfer',
    accountInfo: w.account_info || w.accountInfo || '',
    accountName: w.account_name || w.accountName || undefined,
    status: w.status || 'Pending',
    date: w.date || new Date().toISOString(),
    reviewedAt: w.reviewed_at || w.reviewedAt || undefined,
    adminNotes: w.admin_notes || w.adminNotes || undefined,
  };
}

function mapTransactionToDb(t: Transaction): any {
  return {
    id: t.id,
    user_id: t.userId,
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    reference_id: t.referenceId || null,
    date: t.date,
  };
}

function mapDbToTransaction(t: any): Transaction {
  return {
    id: t.id,
    userId: t.user_id || t.userId,
    type: t.type || 'Deposit',
    amount: Number(t.amount || 0),
    description: t.description || '',
    status: t.status || 'Completed',
    referenceId: t.reference_id || t.referenceId || undefined,
    date: t.date || new Date().toISOString(),
  };
}

function mapNotificationToDb(n: NotificationItem): any {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    date: n.date,
  };
}

function mapDbToNotification(n: any): NotificationItem {
  return {
    id: n.id,
    userId: n.user_id || n.userId,
    title: n.title || 'Notification',
    message: n.message || '',
    type: n.type || 'system',
    read: Boolean(n.read),
    date: n.date || new Date().toISOString(),
  };
}

function mapSettingsToDb(s: PlatformSettings): any {
  return {
    id: 'default_settings',
    bank_name: s.bankName,
    account_name: s.accountName,
    account_number: s.accountNumber,
    swift_code: s.swiftCode || null,
    instructions: s.instructions,
    min_withdrawal_amount: s.minWithdrawalAmount,
    referral_commission_percent: s.referralCommissionPercent,
  };
}

function mapDbToSettings(s: any): PlatformSettings {
  return {
    bankName: s.bank_name || s.bankName || DEFAULT_PLATFORM_SETTINGS.bankName,
    accountName: s.account_name || s.accountName || DEFAULT_PLATFORM_SETTINGS.accountName,
    accountNumber: s.account_number || s.accountNumber || DEFAULT_PLATFORM_SETTINGS.accountNumber,
    swiftCode: s.swift_code || s.swiftCode || DEFAULT_PLATFORM_SETTINGS.swiftCode,
    instructions: s.instructions || DEFAULT_PLATFORM_SETTINGS.instructions,
    minWithdrawalAmount: Number(s.min_withdrawal_amount || s.minWithdrawalAmount || 5000),
    referralCommissionPercent: Number(s.referral_commission_percent || s.referralCommissionPercent || 5),
  };
}

function mapInvestmentToDb(inv: UserInvestment): any {
  return {
    id: inv.id,
    user_id: inv.userId,
    plan_id: inv.planId,
    plan_name: inv.planName,
    amount: inv.amount,
    daily_earnings: inv.dailyEarnings,
    total_return: inv.totalReturn,
    start_date: inv.startDate,
    end_date: inv.endDate,
    duration_days: inv.durationDays,
    days_elapsed: inv.daysElapsed,
    status: inv.status,
  };
}

function mapDbToInvestment(inv: any): UserInvestment {
  return {
    id: inv.id,
    userId: inv.user_id || inv.userId,
    planId: inv.plan_id || inv.planId,
    planName: inv.plan_name || inv.planName,
    amount: Number(inv.amount || 0),
    dailyEarnings: Number(inv.daily_earnings || inv.dailyEarnings || 0),
    totalReturn: Number(inv.total_return || inv.totalReturn || 0),
    startDate: inv.start_date || inv.startDate,
    endDate: inv.end_date || inv.endDate,
    durationDays: Number(inv.duration_days || inv.durationDays || 10),
    daysElapsed: Number(inv.days_elapsed || inv.daysElapsed || 1),
    status: inv.status || 'Active',
  };
}

// Fetch all data from Supabase DB to update local cache
export async function fetchDataFromSupabase(): Promise<void> {
  try {
    // 1. Fetch Profiles
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (!pErr && profiles && profiles.length > 0) {
      const usersList = profiles.map(mapProfileToUser);
      setItem(KEYS.USERS, usersList);

      // Sync current logged in user
      const currentUser = getCurrentUser();
      if (currentUser) {
        const freshCurrent = usersList.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (freshCurrent) {
          setCurrentUser(freshCurrent);
        }
      }
    }

    // 2. Fetch Deposits
    const { data: deposits } = await supabase.from('deposits').select('*').order('date', { ascending: false });
    if (deposits) {
      setItem(KEYS.DEPOSITS, deposits.map(mapDbToDeposit));
    }

    // 3. Fetch Withdrawals
    const { data: withdrawals } = await supabase.from('withdrawals').select('*').order('date', { ascending: false });
    if (withdrawals) {
      setItem(KEYS.WITHDRAWALS, withdrawals.map(mapDbToWithdrawal));
    }

    // 4. Fetch Transactions
    const { data: transactions } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (transactions) {
      setItem(KEYS.TRANSACTIONS, transactions.map(mapDbToTransaction));
    }

    // 5. Fetch Notifications
    const { data: notifications } = await supabase.from('notifications').select('*').order('date', { ascending: false });
    if (notifications) {
      setItem(KEYS.NOTIFICATIONS, notifications.map(mapDbToNotification));
    }

    // 6. Fetch Admin Settings
    const { data: settingsData } = await supabase.from('admin_settings').select('*').single();
    if (settingsData) {
      setItem(KEYS.SETTINGS, mapDbToSettings(settingsData));
    }

    // 7. Fetch Investments
    const { data: investments } = await supabase.from('investments').select('*').order('start_date', { ascending: false });
    if (investments) {
      setItem(KEYS.INVESTMENTS, investments.map(mapDbToInvestment));
    }

    // Ensure Super Admin exists
    await ensureSuperAdminExistsInSupabase();
  } catch (err) {
    console.warn('Supabase fetch sync notice:', err);
  }
}

// Ensure Super Admin exists in both Supabase & local cache
export async function ensureSuperAdminExistsInSupabase(): Promise<User> {
  const superAdmin: User = {
    id: 'user-super-admin-king',
    fullName: 'Super Administrator',
    username: 'superadmin',
    email: SUPER_ADMIN_EMAIL,
    phone: '+251 900 000 000',
    password: SUPER_ADMIN_PASS,
    role: 'admin',
    referralCode: 'ZEL-SUPERADMIN',
    balance: 250000,
    totalDeposits: 250000,
    totalWithdrawals: 0,
    referralEarnings: 0,
    activePlansCount: 0,
    createdAt: new Date().toISOString(),
    isBanned: false,
  };

  const users = getItem<User[]>(KEYS.USERS, []);
  let existingAdmin = users.find((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!existingAdmin) {
    users.unshift(superAdmin);
    setItem(KEYS.USERS, users);
  } else {
    superAdmin.balance = existingAdmin.balance;
    superAdmin.totalDeposits = existingAdmin.totalDeposits;
    superAdmin.totalWithdrawals = existingAdmin.totalWithdrawals;
    superAdmin.referralEarnings = existingAdmin.referralEarnings;
  }

  // Push to Supabase profiles
  try {
    await supabase.from('profiles').upsert(mapUserToProfile(superAdmin));
  } catch (e) {
    // Ignore error if RLS/table missing
  }

  return superAdmin;
}

// Initializer
export function initializeStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, []);
  }

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setItem(KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
  }

  if (!localStorage.getItem(KEYS.PLANS)) {
    setItem(KEYS.PLANS, DEFAULT_PLANS);
  }

  if (!localStorage.getItem(KEYS.DEPOSITS)) {
    setItem(KEYS.DEPOSITS, []);
  }

  if (!localStorage.getItem(KEYS.WITHDRAWALS)) {
    setItem(KEYS.WITHDRAWALS, []);
  }

  if (!localStorage.getItem(KEYS.INVESTMENTS)) {
    setItem(KEYS.INVESTMENTS, []);
  }

  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    setItem(KEYS.TRANSACTIONS, []);
  }

  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setItem(KEYS.NOTIFICATIONS, []);
  }

  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    setItem(KEYS.ANNOUNCEMENTS, [
      {
        id: 'anc-1',
        title: 'Welcome to ZelSurvey',
        message: 'Welcome to the premier Ethiopian investment platform. Deposit via secure bank transfer and start growing your portfolio today.',
        date: new Date().toISOString(),
        target: 'all',
        author: 'ZelSurvey Super Admin',
      },
    ]);
  }

  // Initial Supabase Sync
  fetchDataFromSupabase();

  // Polling every 6 seconds to keep live data synced
  setInterval(() => {
    fetchDataFromSupabase();
  }, 6000);
}

// Check if user is Super Admin
export function isSuperAdminAccount(userOrEmail: User | string): boolean {
  if (typeof userOrEmail === 'string') {
    return userOrEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }
  return (
    userOrEmail.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
    userOrEmail.username.toLowerCase() === 'superadmin' ||
    userOrEmail.id === 'user-super-admin-king'
  );
}

// Helper to safely execute background Supabase builder queries without unhandled rejections
function safeDb(builder: any): void {
  Promise.resolve(builder).then(() => {}, () => {});
}

// Ensure Super Admin exists (synchronous wrapper)
export function ensureSuperAdminExists(): User {
  const users = getItem<User[]>(KEYS.USERS, []);
  let superAdmin = users.find((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!superAdmin) {
    superAdmin = {
      id: 'user-super-admin-king',
      fullName: 'Super Administrator',
      username: 'superadmin',
      email: SUPER_ADMIN_EMAIL,
      phone: '+251 900 000 000',
      password: SUPER_ADMIN_PASS,
      role: 'admin',
      referralCode: 'ZEL-SUPERADMIN',
      balance: 250000,
      totalDeposits: 250000,
      totalWithdrawals: 0,
      referralEarnings: 0,
      activePlansCount: 0,
      createdAt: new Date().toISOString(),
      isBanned: false,
    };
    users.unshift(superAdmin);
    setItem(KEYS.USERS, users);
  }

  // Async sync to Supabase
  safeDb(supabase.from('profiles').upsert(mapUserToProfile(superAdmin)));
  return superAdmin;
}

// Platform Settings Functions
export function getPlatformSettings(): PlatformSettings {
  const settings = getItem<PlatformSettings>(KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
  if (!settings.minWithdrawalAmount || settings.minWithdrawalAmount < 5000) {
    settings.minWithdrawalAmount = 5000;
  }
  return settings;
}

export function updatePlatformSettings(settings: PlatformSettings): void {
  setItem(KEYS.SETTINGS, settings);
  // Async update to Supabase
  safeDb(supabase.from('admin_settings').upsert(mapSettingsToDb(settings)));
}

// Session Management
export function getCurrentUser(): User | null {
  return getItem<User | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(KEYS.CURRENT_USER, user);
}

export function logoutUser(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
  safeDb(supabase.auth.signOut());
  window.dispatchEvent(new Event('zelsurvey_storage_updated'));
}

// User CRUD
export function getUsers(): User[] {
  return getItem<User[]>(KEYS.USERS, []);
}

export function getUserById(userId: string): User | undefined {
  return getUsers().find((u) => u.id === userId);
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    setItem(KEYS.USERS, users);
    
    const current = getCurrentUser();
    if (current && current.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }

  // Push to Supabase profiles
  safeDb(supabase.from('profiles').upsert(mapUserToProfile(updatedUser)));
}

export function toggleUserBanStatus(userId: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User account not found.' };

  if (isSuperAdminAccount(user)) {
    return { success: false, message: 'Security Safeguard: The Super Administrator account cannot be suspended or demoted.' };
  }

  user.isBanned = !user.isBanned;
  updateUser(user);

  return {
    success: true,
    message: `Account for ${user.fullName} has been ${user.isBanned ? 'suspended' : 'reactivated'}.`,
    user,
  };
}

export function deleteUserAccount(userId: string): { success: boolean; message: string } {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User account not found.' };

  if (isSuperAdminAccount(user)) {
    return { success: false, message: 'Security Safeguard: The Super Administrator account cannot be deleted.' };
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  setItem(KEYS.USERS, updatedUsers);

  // Delete from Supabase profiles
  safeDb(supabase.from('profiles').delete().eq('id', userId));

  return { success: true, message: `User account ${user.fullName} deleted successfully.` };
}

// Supabase Auth: Password Reset
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `Password reset instructions have been sent to ${email}.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to send password reset email.' };
  }
}

// User Authentication & Registration via Supabase
export async function registerUserAsync(userData: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  referralCode?: string;
}): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();

  if (userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'This email address is reserved for system administration.' };
  }
  
  const existingEmail = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingEmail) {
    return { success: false, message: 'A user with this email address already exists.' };
  }

  const existingUsername = users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase());
  if (existingUsername) {
    return { success: false, message: 'This username is already taken. Please choose another.' };
  }

  // Supabase Auth Sign Up
  let authUserId = 'user-' + Date.now();
  if (userData.password) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username,
          },
        },
      });

      if (authErr) {
        console.warn('Supabase Auth warning:', authErr.message);
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }
    } catch (authException) {
      console.warn('Supabase Auth exception:', authException);
    }
  }

  const refCode = 'ZEL-' + Math.floor(10000 + Math.random() * 90000);

  const newUser: User = {
    id: authUserId,
    fullName: userData.fullName,
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: 'user',
    referralCode: refCode,
    referredBy: userData.referralCode || undefined,
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    activePlansCount: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);

  // Push profile & wallet to Supabase
  try {
    await supabase.from('profiles').insert(mapUserToProfile(newUser));
    await supabase.from('wallets').insert({
      id: 'wallet-' + newUser.id,
      user_id: newUser.id,
      balance: 0,
      total_deposits: 0,
      total_withdrawals: 0,
      referral_earnings: 0,
    });
  } catch (dbErr) {
    console.warn('Supabase profile creation fallback:', dbErr);
  }

  // Welcome Notification
  addNotification(newUser.id, {
    title: 'Welcome to ZelSurvey!',
    message: 'Your account has been created successfully. Submit a deposit to begin investing.',
    type: 'system',
  });

  // Handle referral notification
  if (userData.referralCode) {
    const referrer = users.find((u) => u.referralCode.toLowerCase() === userData.referralCode?.toLowerCase());
    if (referrer) {
      addNotification(referrer.id, {
        title: 'New Referral Registered',
        message: `${newUser.fullName} registered using your referral code ${referrer.referralCode}.`,
        type: 'referral',
      });

      // Track referral relation in Supabase
      safeDb(
        supabase.from('referrals').insert({
          id: 'REF-' + Math.floor(100000 + Math.random() * 900000),
          referrer_id: referrer.id,
          referred_user_id: newUser.id,
          status: 'Pending',
          reward_amount: 100,
          date: new Date().toISOString(),
        })
      );
    }
  }

  return { success: true, message: 'Registration successful!', user: newUser };
}

// Synchronous wrapper for registerUser
export function registerUser(userData: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  referralCode?: string;
}): { success: boolean; message: string; user?: User } {
  // Fire async processing
  registerUserAsync(userData);

  // Return synchronous result instantly from local cache logic
  const users = getUsers();

  if (userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'This email address is reserved for system administration.' };
  }

  const existingEmail = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingEmail) {
    return { success: false, message: 'A user with this email address already exists.' };
  }

  const existingUsername = users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase());
  if (existingUsername) {
    return { success: false, message: 'This username is already taken. Please choose another.' };
  }

  const refCode = 'ZEL-' + Math.floor(10000 + Math.random() * 90000);
  const newUser: User = {
    id: 'user-' + Date.now(),
    fullName: userData.fullName,
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: 'user',
    referralCode: refCode,
    referredBy: userData.referralCode || undefined,
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    activePlansCount: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  return { success: true, message: 'Registration successful!', user: newUser };
}

// Login via Supabase Auth + Profiles
export async function loginUserAsync(loginInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();
  let user = users.find(
    (u) =>
      u.email.toLowerCase() === loginInput.trim().toLowerCase() ||
      u.username.toLowerCase() === loginInput.trim().toLowerCase()
  );

  // Super Admin bypass
  if (loginInput.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (passwordInput === SUPER_ADMIN_PASS) {
      const superAdmin = ensureSuperAdminExists();
      setCurrentUser(superAdmin);
      return { success: true, message: 'Super Admin Login Successful!', user: superAdmin };
    } else {
      return { success: false, message: 'Incorrect password for Super Admin account.' };
    }
  }

  // Attempt Supabase Auth Login
  try {
    const emailToUse = user ? user.email : loginInput;
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: passwordInput,
    });

    if (!authErr && authData?.user) {
      // Fetch fresh profile from Supabase
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
      if (profile) {
        user = mapProfileToUser(profile);
      }
    }
  } catch (err) {
    console.warn('Supabase Auth sign-in warning:', err);
  }

  if (!user) {
    return { success: false, message: 'No account found matching this email or username.' };
  }

  if (user.password && user.password !== passwordInput) {
    return { success: false, message: 'Incorrect password. Please check your credentials and try again.' };
  }

  if (user.isBanned) {
    return { success: false, message: 'This account has been restricted. Please contact support.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Login successful!', user };
}

// Deposit Actions
export function getDeposits(): DepositRequest[] {
  return getItem<DepositRequest[]>(KEYS.DEPOSITS, []);
}

export function getUserDeposits(userId: string): DepositRequest[] {
  return getDeposits().filter((d) => d.userId === userId);
}

export function createDepositRequest(data: {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankUsed: string;
  transactionRef?: string;
  paymentProofUrl: string;
  notes?: string;
}): DepositRequest {
  const deposits = getDeposits();
  const newDeposit: DepositRequest = {
    id: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    amount: data.amount,
    bankUsed: data.bankUsed,
    transactionRef: data.transactionRef,
    paymentProofUrl: data.paymentProofUrl,
    notes: data.notes,
    date: new Date().toISOString(),
    status: 'Pending',
  };

  deposits.unshift(newDeposit);
  setItem(KEYS.DEPOSITS, deposits);

  // Push to Supabase deposits table
  safeDb(supabase.from('deposits').insert(mapDepositToDb(newDeposit)));

  // Record pending transaction log
  addTransaction({
    userId: data.userId,
    type: 'Deposit',
    amount: data.amount,
    description: `Deposit request via ${data.bankUsed}`,
    status: 'Pending',
    referenceId: newDeposit.id,
  });

  // Notify user
  addNotification(data.userId, {
    title: 'Deposit Submitted',
    message: `Your deposit request of ETB ${data.amount.toLocaleString()} is now pending verification.`,
    type: 'deposit',
  });

  return newDeposit;
}

// Admin: Approve Deposit
export function approveDeposit(depositId: string, adminNotes?: string): { success: boolean; message: string } {
  const deposits = getDeposits();
  const index = deposits.findIndex((d) => d.id === depositId);
  if (index === -1) return { success: false, message: 'Deposit request not found.' };

  const deposit = deposits[index];
  if (deposit.status === 'Approved') return { success: false, message: 'Deposit is already approved.' };

  deposit.status = 'Approved';
  deposit.adminNotes = adminNotes;
  deposit.reviewedAt = new Date().toISOString();
  deposits[index] = deposit;
  setItem(KEYS.DEPOSITS, deposits);

  // Push deposit update to Supabase
  safeDb(
    supabase.from('deposits').update({
      status: 'Approved',
      admin_notes: adminNotes || null,
      reviewed_at: deposit.reviewedAt,
    }).eq('id', depositId)
  );

  // Update User Wallet & Total Deposits
  const user = getUserById(deposit.userId);
  if (user) {
    user.balance += deposit.amount;
    user.totalDeposits += deposit.amount;

    // Check if referrer gets ETB 100 referral reward for ETB 1,000+ deposit
    if (user.referredBy) {
      const users = getUsers();
      const referrer = users.find((u) => u.referralCode.toLowerCase() === user.referredBy?.toLowerCase());
      if (referrer) {
        const commission = deposit.amount * 0.05;
        let rewardTotal = commission;

        let awardReferralBonus = false;
        if (deposit.amount >= 1000 && !user.referralRewardPaid) {
          awardReferralBonus = true;
          user.referralRewardPaid = true;
          if (rewardTotal < 100) {
            rewardTotal = 100;
          }
        }

        referrer.balance += rewardTotal;
        referrer.referralEarnings += rewardTotal;
        updateUser(referrer);

        addTransaction({
          userId: referrer.id,
          type: 'Referral Commission',
          amount: rewardTotal,
          description: awardReferralBonus
            ? `ETB 100 Referral Reward for inviting ${user.fullName}`
            : `5% referral commission from ${user.fullName}'s deposit`,
          status: 'Completed',
        });

        addNotification(referrer.id, {
          title: 'Referral Reward Credited! 🎉',
          message: awardReferralBonus
            ? `You earned ETB 100 because ${user.fullName} completed an approved deposit of ETB ${deposit.amount.toLocaleString()}!`
            : `You earned ETB ${rewardTotal.toLocaleString()} from ${user.fullName}'s verified deposit!`,
          type: 'referral',
        });

        // Update referral record status in Supabase
        safeDb(supabase.from('referrals').update({ status: 'Approved', reward_amount: rewardTotal }).eq('referred_user_id', user.id));
      }
    }

    updateUser(user);
  }

  // Update transaction status
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((t) => t.referenceId === depositId);
  if (txIndex !== -1) {
    transactions[txIndex].status = 'Completed';
    setItem(KEYS.TRANSACTIONS, transactions);
    safeDb(supabase.from('transactions').update({ status: 'Completed' }).eq('reference_id', depositId));
  } else {
    addTransaction({
      userId: deposit.userId,
      type: 'Deposit',
      amount: deposit.amount,
      description: `Deposit approved via ${deposit.bankUsed}`,
      status: 'Completed',
      referenceId: deposit.id,
    });
  }

  // Notify User
  addNotification(deposit.userId, {
    title: 'Deposit Approved! 🎉',
    message: `Your deposit of ETB ${deposit.amount.toLocaleString()} has been approved and credited to your wallet balance.`,
    type: 'deposit',
  });

  return { success: true, message: `Deposit of ETB ${deposit.amount.toLocaleString()} approved and wallet credited.` };
}

// Admin: Reject Deposit
export function rejectDeposit(depositId: string, adminNotes?: string): { success: boolean; message: string } {
  const deposits = getDeposits();
  const index = deposits.findIndex((d) => d.id === depositId);
  if (index === -1) return { success: false, message: 'Deposit request not found.' };

  const deposit = deposits[index];
  deposit.status = 'Rejected';
  deposit.adminNotes = adminNotes || 'Proof verification failed or invalid reference.';
  deposit.reviewedAt = new Date().toISOString();
  deposits[index] = deposit;
  setItem(KEYS.DEPOSITS, deposits);

  // Update in Supabase
  safeDb(
    supabase.from('deposits').update({
      status: 'Rejected',
      admin_notes: deposit.adminNotes,
      reviewed_at: deposit.reviewedAt,
    }).eq('id', depositId)
  );

  // Update transaction log
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((t) => t.referenceId === depositId);
  if (txIndex !== -1) {
    transactions[txIndex].status = 'Failed';
    setItem(KEYS.TRANSACTIONS, transactions);
    safeDb(supabase.from('transactions').update({ status: 'Failed' }).eq('reference_id', depositId));
  }

  // Notify User
  addNotification(deposit.userId, {
    title: 'Deposit Verification Failed ❌',
    message: `Your deposit of ETB ${deposit.amount.toLocaleString()} was rejected: ${deposit.adminNotes}`,
    type: 'deposit',
  });

  return { success: true, message: 'Deposit request rejected.' };
}

// Admin: Manual Trigger Referral Reward (ETB 100)
export function triggerReferralReward(referredUserId: string): { success: boolean; message: string } {
  const users = getUsers();
  const refUser = users.find((u) => u.id === referredUserId);
  if (!refUser) return { success: false, message: 'Referred user profile not found.' };

  if (refUser.referralRewardPaid) {
    return { success: false, message: 'Referral reward (ETB 100) has already been issued for this user.' };
  }

  if (!refUser.referredBy) {
    return { success: false, message: 'This user was not registered via a referral code.' };
  }

  const referrer = users.find((u) => u.referralCode.toLowerCase() === refUser.referredBy?.toLowerCase());
  if (!referrer) {
    return { success: false, message: 'Referrer profile not found.' };
  }

  // Credit ETB 100 reward
  refUser.referralRewardPaid = true;
  updateUser(refUser);

  referrer.balance += 100;
  referrer.referralEarnings += 100;
  updateUser(referrer);

  addTransaction({
    userId: referrer.id,
    type: 'Referral Commission',
    amount: 100,
    description: `ETB 100 Referral Reward for inviting ${refUser.fullName}`,
    status: 'Completed',
  });

  addNotification(referrer.id, {
    title: 'Referral Reward Credited! 🎉',
    message: `You earned ETB 100 because ${refUser.fullName} was verified!`,
    type: 'referral',
  });

  safeDb(supabase.from('referrals').update({ status: 'Approved', reward_amount: 100 }).eq('referred_user_id', referredUserId));

  return { success: true, message: `ETB 100 referral reward successfully credited to ${referrer.fullName}.` };
}

// Withdrawal Actions
export function getWithdrawals(): WithdrawalRequest[] {
  return getItem<WithdrawalRequest[]>(KEYS.WITHDRAWALS, []);
}

export function getUserWithdrawals(userId: string): WithdrawalRequest[] {
  return getWithdrawals().filter((w) => w.userId === userId);
}

export function requestWithdrawal(data: {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  accountInfo: string;
  accountName?: string;
}): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
  const user = getUserById(data.userId);
  if (!user) return { success: false, message: 'User profile not found.' };

  const settings = getPlatformSettings();
  const minWithdrawal = settings.minWithdrawalAmount || 5000;

  if (user.balance < minWithdrawal) {
    return {
      success: false,
      message: `Your available balance must be at least ETB ${minWithdrawal.toLocaleString()} before you can request a withdrawal.`,
    };
  }

  if (data.amount < minWithdrawal) {
    return {
      success: false,
      message: `Minimum withdrawal amount is ETB ${minWithdrawal.toLocaleString()}.`,
    };
  }

  if (data.amount > user.balance) {
    return { success: false, message: 'Insufficient Balance. Your wallet balance is less than the requested withdrawal amount.' };
  }

  if (data.amount <= 0) {
    return { success: false, message: 'Invalid withdrawal amount.' };
  }

  // Deduct balance instantly
  user.balance -= data.amount;
  user.totalWithdrawals += data.amount;
  updateUser(user);

  const withdrawals = getWithdrawals();
  const newWithdrawal: WithdrawalRequest = {
    id: 'WTH-' + Math.floor(100000 + Math.random() * 900000),
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    amount: data.amount,
    method: data.method,
    accountInfo: data.accountInfo,
    accountName: data.accountName,
    date: new Date().toISOString(),
    status: 'Pending',
  };

  withdrawals.unshift(newWithdrawal);
  setItem(KEYS.WITHDRAWALS, withdrawals);

  // Push to Supabase withdrawals
  safeDb(supabase.from('withdrawals').insert(mapWithdrawalToDb(newWithdrawal)));

  // Log transaction
  addTransaction({
    userId: data.userId,
    type: 'Withdrawal',
    amount: data.amount,
    description: `Withdrawal request to ${data.method} (${data.accountInfo})`,
    status: 'Pending',
    referenceId: newWithdrawal.id,
  });

  // Notify user
  addNotification(data.userId, {
    title: 'Withdrawal Request Submitted',
    message: `Your withdrawal request of ETB ${data.amount.toLocaleString()} to ${data.method} is pending processing.`,
    type: 'withdrawal',
  });

  return { success: true, message: 'Withdrawal request submitted successfully!', withdrawal: newWithdrawal };
}

// Admin Process Withdrawal
export function processWithdrawal(withdrawalId: string, action: 'approve' | 'reject', notes?: string) {
  const withdrawals = getWithdrawals();
  const index = withdrawals.findIndex((w) => w.id === withdrawalId);
  if (index === -1) return { success: false, message: 'Withdrawal request not found.' };

  const withdrawal = withdrawals[index];
  if (action === 'approve') {
    withdrawal.status = 'Approved';
    withdrawal.adminNotes = notes || 'Withdrawal processed successfully.';
    withdrawal.reviewedAt = new Date().toISOString();

    addNotification(withdrawal.userId, {
      title: 'Withdrawal Processed 💸',
      message: `Your withdrawal of ETB ${withdrawal.amount.toLocaleString()} has been processed and transferred.`,
      type: 'withdrawal',
    });
  } else {
    withdrawal.status = 'Rejected';
    withdrawal.adminNotes = notes || 'Account details mismatch or verification required.';
    withdrawal.reviewedAt = new Date().toISOString();

    // Refund user balance
    const user = getUserById(withdrawal.userId);
    if (user) {
      user.balance += withdrawal.amount;
      user.totalWithdrawals = Math.max(0, user.totalWithdrawals - withdrawal.amount);
      updateUser(user);
    }

    addNotification(withdrawal.userId, {
      title: 'Withdrawal Rejected (Refunded)',
      message: `Your withdrawal of ETB ${withdrawal.amount.toLocaleString()} was rejected and refunded to your balance: ${withdrawal.adminNotes}`,
      type: 'withdrawal',
    });
  }

  withdrawals[index] = withdrawal;
  setItem(KEYS.WITHDRAWALS, withdrawals);

  // Push withdrawal update to Supabase
  safeDb(
    supabase.from('withdrawals').update({
      status: withdrawal.status,
      admin_notes: withdrawal.adminNotes,
      reviewed_at: withdrawal.reviewedAt,
    }).eq('id', withdrawalId)
  );

  return { success: true, message: `Withdrawal request ${action}d.` };
}

// Investment Plan Actions
export function getPlans(): InvestmentPlan[] {
  const stored = getItem<InvestmentPlan[]>(KEYS.PLANS, DEFAULT_PLANS);
  const updated = stored.map((p) => {
    const defaultMatch = DEFAULT_PLANS.find((dp) => dp.id === p.id);
    if (defaultMatch) {
      return {
        ...p,
        minInvestment: defaultMatch.minInvestment,
        dailyEarnings: defaultMatch.dailyEarnings,
        dailyRoiPercent: defaultMatch.dailyRoiPercent,
        totalReturnPercent: defaultMatch.totalReturnPercent,
        durationDays: defaultMatch.durationDays,
      };
    }
    return p;
  });
  return updated;
}

export function updatePlans(plans: InvestmentPlan[]): void {
  setItem(KEYS.PLANS, plans);
}

export function getUserInvestments(userId: string): UserInvestment[] {
  return getItem<UserInvestment[]>(KEYS.INVESTMENTS, []).filter((inv) => inv.userId === userId);
}

export function purchaseInvestmentPlan(userId: string, planId: string): { success: boolean; message: string } {
  const user = getUserById(userId);
  if (!user) return { success: false, message: 'User account not found.' };

  const plans = getPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return { success: false, message: 'Investment plan not found.' };

  if (user.balance < plan.minInvestment) {
    return { success: false, message: 'Insufficient Balance. Please deposit funds first.' };
  }

  // Deduct investment amount
  user.balance -= plan.minInvestment;
  user.activePlansCount += 1;
  updateUser(user);

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  
  const dailyEarnings = plan.dailyEarnings || (plan.minInvestment * plan.dailyRoiPercent) / 100;
  const totalReturn = plan.minInvestment + (dailyEarnings * plan.durationDays);

  const newInvestment: UserInvestment = {
    id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
    userId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.minInvestment,
    dailyEarnings,
    totalReturn,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    durationDays: plan.durationDays,
    daysElapsed: 1,
    status: 'Active',
  };

  const investments = getItem<UserInvestment[]>(KEYS.INVESTMENTS, []);
  investments.unshift(newInvestment);
  setItem(KEYS.INVESTMENTS, investments);

  // Push to Supabase investments table
  safeDb(supabase.from('investments').insert(mapInvestmentToDb(newInvestment)));

  // Log transaction
  addTransaction({
    userId,
    type: 'Investment',
    amount: plan.minInvestment,
    description: `Purchased ${plan.name} Investment Plan`,
    status: 'Completed',
    referenceId: newInvestment.id,
  });

  // Notify user
  addNotification(userId, {
    title: 'Investment Purchased! 🚀',
    message: `You successfully subscribed to the ${plan.name} Plan with ETB ${plan.minInvestment.toLocaleString()}.`,
    type: 'investment',
  });

  return { success: true, message: `Successfully invested ETB ${plan.minInvestment.toLocaleString()} in ${plan.name} Plan!` };
}

// Transaction Logging
export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function getUserTransactions(userId: string): Transaction[] {
  return getTransactions().filter((t) => t.userId === userId);
}

export function addTransaction(data: Omit<Transaction, 'id' | 'date'>): Transaction {
  const transactions = getTransactions();
  const tx: Transaction = {
    ...data,
    id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
  };

  transactions.unshift(tx);
  setItem(KEYS.TRANSACTIONS, transactions);

  // Push to Supabase transactions table
  safeDb(supabase.from('transactions').insert(mapTransactionToDb(tx)));

  return tx;
}

// Notification System
export function getNotifications(userId: string): NotificationItem[] {
  return getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []).filter((n) => n.userId === userId);
}

export function addNotification(userId: string, data: Omit<NotificationItem, 'id' | 'userId' | 'date' | 'read'>): NotificationItem {
  const notifications = getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  const newItem: NotificationItem = {
    ...data,
    id: 'NTF-' + Math.floor(100000 + Math.random() * 900000),
    userId,
    date: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(newItem);
  setItem(KEYS.NOTIFICATIONS, notifications);

  // Push to Supabase notifications table
  safeDb(supabase.from('notifications').insert(mapNotificationToDb(newItem)));

  return newItem;
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    setItem(KEYS.NOTIFICATIONS, notifications);
    safeDb(supabase.from('notifications').update({ read: true }).eq('id', notificationId));
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  const updated = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  setItem(KEYS.NOTIFICATIONS, updated);
  safeDb(supabase.from('notifications').update({ read: true }).eq('user_id', userId));
}

// Seed Demo Data Helper
export function seedDemoDataForTesting(userId: string): { success: boolean; message: string } {
  const user = getUserById(userId);
  if (!user) return { success: false, message: 'Please log in first.' };

  createDepositRequest({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    amount: 5000,
    bankUsed: 'Bank Transfer',
    transactionRef: 'TXN-98234199',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    notes: 'Demo receipt submitted for testing verification.',
  });

  return { 
    success: true, 
    message: 'Demo deposit request of ETB 5,000 submitted! Switch to Admin Panel to approve it and credit your wallet balance.' 
  };
}
