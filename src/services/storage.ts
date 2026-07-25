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

// Get Platform Settings
export function getPlatformSettings(): PlatformSettings {
  const settings = getItem<PlatformSettings>(KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
  if (!settings.minWithdrawalAmount || settings.minWithdrawalAmount < 5000) {
    settings.minWithdrawalAmount = 5000;
  }
  return settings;
}

// Update Platform Settings
export function updatePlatformSettings(settings: PlatformSettings): void {
  setItem(KEYS.SETTINGS, settings);
}

// Default Company Bank Account (Dynamic Getter)
export const COMPANY_BANK_ACCOUNT: BankAccountInfo = {
  bankName: 'Official Bank Account',
  accountName: 'ZelSurvey Automated Systems',
  accountNumber: '1000 0000 0000',
  instructions: 'Transfer the amount to the official bank account above, capture your receipt or screenshot, and upload it in the form below.',
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

// Helper to safely load data from LocalStorage
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from LocalStorage`, e);
    return defaultValue;
  }
}

// Helper to save data to LocalStorage
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('zelsurvey_storage_updated'));
  } catch (e) {
    console.error(`Error writing ${key} to LocalStorage`, e);
  }
}

// Initializer
export function initializeStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, []);
  }

  // Guarantee Super Admin presence
  ensureSuperAdminExists();

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
}

// Super Admin Safeguard Check
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

// Ensure Super Admin Account Exists
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
  } else {
    // Ensure credentials and admin role are kept intact
    let modified = false;
    if (superAdmin.password !== SUPER_ADMIN_PASS) {
      superAdmin.password = SUPER_ADMIN_PASS;
      modified = true;
    }
    if (superAdmin.role !== 'admin') {
      superAdmin.role = 'admin';
      modified = true;
    }
    if (superAdmin.isBanned) {
      superAdmin.isBanned = false;
      modified = true;
    }
    if (modified) {
      const idx = users.findIndex((u) => u.id === superAdmin!.id);
      if (idx !== -1) {
        users[idx] = superAdmin;
        setItem(KEYS.USERS, users);
      }
    }
  }

  return superAdmin;
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
    
    // Update current session if matching
    const current = getCurrentUser();
    if (current && current.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }
}

// Toggle User Suspension / Ban Status
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

// Delete User Account
export function deleteUserAccount(userId: string): { success: boolean; message: string } {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User account not found.' };

  if (isSuperAdminAccount(user)) {
    return { success: false, message: 'Security Safeguard: The Super Administrator account cannot be deleted.' };
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  setItem(KEYS.USERS, updatedUsers);

  return { success: true, message: `User account ${user.fullName} deleted successfully.` };
}

// Register New User
export function registerUser(userData: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  referralCode?: string;
}): { success: boolean; message: string; user?: User } {
  const users = getUsers();

  if (userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'This email address is reserved for system administration.' };
  }
  
  // Check email or username uniqueness
  const existingEmail = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingEmail) {
    return { success: false, message: 'A user with this email address already exists.' };
  }

  const existingUsername = users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase());
  if (existingUsername) {
    return { success: false, message: 'This username is already taken. Please choose another.' };
  }

  // Generate referral code
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

  // Send Welcome Notification
  addNotification(newUser.id, {
    title: 'Welcome to ZelSurvey!',
    message: 'Your account has been created successfully. Submit a deposit to begin investing.',
    type: 'system',
  });

  // Handle referral tracking
  if (userData.referralCode) {
    const referrer = users.find((u) => u.referralCode.toLowerCase() === userData.referralCode?.toLowerCase());
    if (referrer) {
      addNotification(referrer.id, {
        title: 'New Referral Registered',
        message: `${newUser.fullName} registered using your referral code ${referrer.referralCode}.`,
        type: 'referral',
      });
    }
  }

  return { success: true, message: 'Registration successful!', user: newUser };
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
        // Calculate 5% commission or ETB 100 referral bonus
        const commission = deposit.amount * 0.05;
        let rewardTotal = commission;

        // If deposit >= 1000 ETB and reward not paid yet, ensure at least ETB 100 reward
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

  // Update transaction log
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((t) => t.referenceId === depositId);
  if (txIndex !== -1) {
    transactions[txIndex].status = 'Failed';
    setItem(KEYS.TRANSACTIONS, transactions);
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

// Admin Approve/Reject Withdrawal
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
    daysElapsed: 1, // Day 1 active
    status: 'Active',
  };

  const investments = getItem<UserInvestment[]>(KEYS.INVESTMENTS, []);
  investments.unshift(newInvestment);
  setItem(KEYS.INVESTMENTS, investments);

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
  return newItem;
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    setItem(KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, []);
  const updated = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  setItem(KEYS.NOTIFICATIONS, updated);
}

// Seed Demo Data Helper
export function seedDemoDataForTesting(userId: string): { success: boolean; message: string } {
  const user = getUserById(userId);
  if (!user) return { success: false, message: 'Please log in first.' };

  // Create a pending demo deposit request of ETB 5,000 that can be tested in Admin Panel
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
