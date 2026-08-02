import { 
  User, 
  MembershipInfo, 
  MembershipTier, 
  Achievement, 
  DailyRewardDay, 
  ReferrerLeaderboardItem 
} from '../types';
import { 
  getUserById, 
  updateUser, 
  addTransaction, 
  addNotification 
} from './storage';

// -------------------------------------------------------------
// DAILY CHECK-IN REWARDS CONFIG
// -------------------------------------------------------------
export const DAILY_REWARD_DAYS: DailyRewardDay[] = [
  { day: 1, points: 5, label: '5 Pts' },
  { day: 2, points: 10, label: '10 Pts' },
  { day: 3, points: 15, label: '15 Pts' },
  { day: 4, points: 20, label: '20 Pts' },
  { day: 5, points: 30, label: '30 Pts' },
  { day: 6, points: 40, label: '40 Pts' },
  { day: 7, points: 50, cashBonus: 100, isBonusDay: true, label: '50 Pts + ETB 100' },
];

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Check if the user can claim their daily check-in reward
 */
export function checkDailyCheckInStatus(user: User) {
  const today = getTodayDateString();
  const lastCheckIn = user.lastCheckInDate;
  const currentStreak = user.checkInStreak || 0;

  if (!lastCheckIn) {
    // Never claimed before
    return {
      canClaim: true,
      lastClaimedToday: false,
      nextDayToClaim: 1,
      currentStreak: 0,
    };
  }

  if (lastCheckIn === today) {
    // Already claimed today
    return {
      canClaim: false,
      lastClaimedToday: true,
      nextDayToClaim: currentStreak >= 7 ? 1 : currentStreak + 1,
      currentStreak,
    };
  }

  // Calculate day difference
  const lastDate = new Date(lastCheckIn);
  const currentDate = new Date(today);
  const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Claimed yesterday -> increment streak or wrap if was 7
    const nextDay = currentStreak >= 7 ? 1 : currentStreak + 1;
    return {
      canClaim: true,
      lastClaimedToday: false,
      nextDayToClaim: nextDay,
      currentStreak,
    };
  } else {
    // Missed 1 or more days -> streak reset to Day 1
    return {
      canClaim: true,
      lastClaimedToday: false,
      nextDayToClaim: 1,
      currentStreak: 0,
    };
  }
}

/**
 * Claim daily check-in reward
 */
export function claimDailyReward(userId: string): { 
  success: boolean; 
  message: string; 
  pointsEarned: number; 
  cashBonus: number; 
  dayClaimed: number; 
  newStreak: number;
  user?: User;
} {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, message: 'User profile not found.', pointsEarned: 0, cashBonus: 0, dayClaimed: 0, newStreak: 0 };
  }

  const status = checkDailyCheckInStatus(user);
  if (!status.canClaim) {
    return { 
      success: false, 
      message: 'You have already claimed today\'s check-in reward. Come back tomorrow!', 
      pointsEarned: 0, 
      cashBonus: 0, 
      dayClaimed: status.currentStreak, 
      newStreak: status.currentStreak 
    };
  }

  const dayToClaimConfig = DAILY_REWARD_DAYS.find((d) => d.day === status.nextDayToClaim) || DAILY_REWARD_DAYS[0];
  const today = getTodayDateString();

  // Update user state
  const newStreak = status.nextDayToClaim;
  const currentPoints = user.rewardPoints || 0;
  const pointsEarned = dayToClaimConfig.points;
  const cashBonus = dayToClaimConfig.cashBonus || 0;

  user.lastCheckInDate = today;
  user.checkInStreak = newStreak;
  user.rewardPoints = currentPoints + pointsEarned;

  if (cashBonus > 0) {
    user.balance += cashBonus;
    addTransaction({
      userId: user.id,
      type: 'Admin Adjustment',
      amount: cashBonus,
      description: `Day ${dayToClaimConfig.day} Daily Check-In Bonus Cash`,
      status: 'Completed',
    });
  }

  updateUser(user);

  // Notify user
  const bonusMsg = cashBonus > 0 ? ` + ETB ${cashBonus} cash credited!` : '';
  addNotification(user.id, {
    title: `Day ${dayToClaimConfig.day} Daily Reward Claimed! 🎉`,
    message: `You earned ${pointsEarned} reward points${bonusMsg}. Streak: ${newStreak} days!`,
    type: 'system',
  });

  return {
    success: true,
    message: `Claimed Day ${dayToClaimConfig.day} Reward: +${pointsEarned} Points${cashBonus > 0 ? ` & +ETB ${cashBonus} Cash` : ''}!`,
    pointsEarned,
    cashBonus,
    dayClaimed: dayToClaimConfig.day,
    newStreak,
    user,
  };
}

// -------------------------------------------------------------
// MEMBERSHIP LEVEL SYSTEM
// -------------------------------------------------------------
export function getMembershipInfo(user: User): MembershipInfo {
  const totalDeposits = user.totalDeposits || 0;

  if (totalDeposits >= 100000) {
    return {
      tier: 'VIP',
      badge: '👑',
      title: 'VIP Elite Member',
      color: 'from-amber-400 via-amber-500 to-yellow-600',
      minDeposit: 100000,
      nextTier: null,
      nextTierMinDeposit: null,
      progressPercent: 100,
      benefits: [
        'Highest Priority 24/7 VIP Customer Support',
        'Instant Deposit & Withdrawal Processing',
        'Exclusive VIP High-Yield Investment Plans (+1.5% Bonus ROI)',
        'Personal Portfolio Wealth Manager',
        'Unlimited Daily Rewards & Double Points'
      ],
      upgradeRequirement: 'Maximum Membership Tier Reached!'
    };
  }

  if (totalDeposits >= 50000) {
    const nextTierMin = 100000;
    const progress = Math.min(100, Math.round(((totalDeposits - 50000) / (nextTierMin - 50000)) * 100));
    return {
      tier: 'Platinum',
      badge: '💎',
      title: 'Platinum Investor',
      color: 'from-purple-500 via-indigo-600 to-blue-700',
      minDeposit: 50000,
      nextTier: 'VIP',
      nextTierMinDeposit: nextTierMin,
      progressPercent: progress,
      benefits: [
        'Priority Deposit & Withdrawal Processing',
        'Access to Platinum Investment Packages',
        '10% Referral Bonus Commission',
        'Dedicated Financial Support Specialist'
      ],
      upgradeRequirement: `Deposit ETB ${(nextTierMin - totalDeposits).toLocaleString()} more to reach 👑 VIP Level`
    };
  }

  if (totalDeposits >= 20000) {
    const nextTierMin = 50000;
    const progress = Math.min(100, Math.round(((totalDeposits - 20000) / (nextTierMin - 20000)) * 100));
    return {
      tier: 'Gold',
      badge: '🥇',
      title: 'Gold Tier Member',
      color: 'from-amber-500 via-yellow-500 to-amber-700',
      minDeposit: 20000,
      nextTier: 'Platinum',
      nextTierMinDeposit: nextTierMin,
      progressPercent: progress,
      benefits: [
        'Accelerated Withdrawal Approvals',
        '7% Referral Bonus Commission',
        'Gold Member Daily Check-in Multiplier (1.5x)'
      ],
      upgradeRequirement: `Deposit ETB ${(nextTierMin - totalDeposits).toLocaleString()} more to reach 💎 Platinum Level`
    };
  }

  if (totalDeposits >= 5000) {
    const nextTierMin = 20000;
    const progress = Math.min(100, Math.round(((totalDeposits - 5000) / (nextTierMin - 5000)) * 100));
    return {
      tier: 'Silver',
      badge: '🥈',
      title: 'Silver Tier Member',
      color: 'from-slate-400 via-slate-500 to-slate-700',
      minDeposit: 5000,
      nextTier: 'Gold',
      nextTierMinDeposit: nextTierMin,
      progressPercent: progress,
      benefits: [
        'Standard Deposit & Withdrawal Verification',
        '5% Referral Bonus Commission',
        'Access to Silver Investment Plans'
      ],
      upgradeRequirement: `Deposit ETB ${(nextTierMin - totalDeposits).toLocaleString()} more to reach 🥇 Gold Level`
    };
  }

  // Bronze Default
  const nextTierMin = 5000;
  const progress = Math.min(100, Math.round((totalDeposits / nextTierMin) * 100));
  return {
    tier: 'Bronze',
    badge: '🥉',
    title: 'Bronze Member',
    color: 'from-amber-700 via-orange-800 to-stone-800',
    minDeposit: 0,
    nextTier: 'Silver',
    nextTierMinDeposit: nextTierMin,
    progressPercent: progress,
    benefits: [
      'Access to Starter Investment Plans',
      'Daily Check-in Rewards',
      '5% Referral Commission'
    ],
    upgradeRequirement: `Deposit ETB ${(nextTierMin - totalDeposits).toLocaleString()} more to reach 🥈 Silver Level`
  };
}

// -------------------------------------------------------------
// ACHIEVEMENTS SYSTEM
// -------------------------------------------------------------
export function getAllAchievements(user: User): Achievement[] {
  const totalDeposits = user.totalDeposits || 0;
  const totalWithdrawals = user.totalWithdrawals || 0;
  const activePlansCount = user.activePlansCount || 0;
  const checkInStreak = user.checkInStreak || 0;
  const referralEarnings = user.referralEarnings || 0;

  return [
    {
      id: 'first_registration',
      title: 'First Registration',
      description: 'Successfully registered your ZelSurvey account',
      icon: '🏆',
      rewardPoints: 50,
      isUnlocked: true,
      unlockedAt: user.createdAt,
      category: 'onboarding',
    },
    {
      id: 'first_deposit',
      title: 'First Deposit',
      description: 'Made your first verified deposit via bank transfer',
      icon: '💰',
      rewardPoints: 100,
      isUnlocked: totalDeposits > 0,
      category: 'finance',
    },
    {
      id: 'first_withdrawal',
      title: 'First Withdrawal',
      description: 'Successfully withdrew earnings to your bank account',
      icon: '📤',
      rewardPoints: 150,
      isUnlocked: totalWithdrawals > 0,
      category: 'finance',
    },
    {
      id: 'first_investment',
      title: 'First Investment',
      description: 'Subscribed to your first automated ROI investment plan',
      icon: '⭐',
      rewardPoints: 100,
      isUnlocked: activePlansCount > 0,
      category: 'finance',
    },
    {
      id: 'login_streak_7',
      title: '7-Day Login Streak',
      description: 'Claimed 7 consecutive daily check-in rewards',
      icon: '🔥',
      rewardPoints: 200,
      isUnlocked: checkInStreak >= 7,
      category: 'engagement',
    },
    {
      id: 'first_referral',
      title: 'First Referral',
      description: 'Invited your first active referral partner',
      icon: '👥',
      rewardPoints: 150,
      isUnlocked: referralEarnings > 0 || !!user.referredBy,
      category: 'social',
    },
    {
      id: 'platinum_member',
      title: 'Platinum Member',
      description: 'Reached Platinum membership status (ETB 50,000+ deposits)',
      icon: '💎',
      rewardPoints: 500,
      isUnlocked: totalDeposits >= 50000,
      category: 'finance',
    },
    {
      id: 'vip_member',
      title: 'VIP Member',
      description: 'Reached VIP tier status (ETB 100,000+ deposits)',
      icon: '👑',
      rewardPoints: 1000,
      isUnlocked: totalDeposits >= 100000,
      category: 'finance',
    },
  ];
}

// -------------------------------------------------------------
// PROFILE COMPLETION SYSTEM
// -------------------------------------------------------------
export interface ProfileCompletionDetails {
  percentage: number;
  progressBarAscii: string;
  completedCount: number;
  totalCount: number;
  checklist: { label: string; completed: boolean; weight: number }[];
}

export function getProfileCompletion(user: User): ProfileCompletionDetails {
  const checklist = [
    { label: 'Full Name Provided', completed: Boolean(user.fullName && user.fullName.trim().length > 3), weight: 15 },
    { label: 'Email Address Verified', completed: Boolean(user.email && user.email.includes('@')), weight: 15 },
    { label: 'Phone Number Registered', completed: Boolean(user.phone && user.phone.trim().length >= 9), weight: 15 },
    { label: 'First Deposit Made', completed: (user.totalDeposits || 0) > 0, weight: 20 },
    { label: 'Active Investment Subscribed', completed: (user.activePlansCount || 0) > 0, weight: 20 },
    { label: 'Daily Check-in Claimed', completed: Boolean(user.lastCheckInDate), weight: 15 },
  ];

  let totalWeight = 0;
  let completedCount = 0;

  checklist.forEach((item) => {
    if (item.completed) {
      totalWeight += item.weight;
      completedCount += 1;
    }
  });

  const percentage = Math.min(100, totalWeight);

  // Generate ASCII block bar (e.g. ████████░░)
  const totalBlocks = 10;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const progressBarAscii = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return {
    percentage,
    progressBarAscii,
    completedCount,
    totalCount: checklist.length,
    checklist,
  };
}

// -------------------------------------------------------------
// REFERRAL LEADERBOARD DATA
// -------------------------------------------------------------
export const TOP_REFERRERS_LEADERBOARD: ReferrerLeaderboardItem[] = [
  {
    id: 'lead-1',
    rank: 1,
    name: 'Abebe Bikila',
    username: '@abebe_b',
    totalReferrals: 142,
    totalEarned: 35500,
    membershipBadge: '👑 VIP',
  },
  {
    id: 'lead-2',
    rank: 2,
    name: 'Tigist Assefa',
    username: '@tigist_a',
    totalReferrals: 118,
    totalEarned: 29500,
    membershipBadge: '💎 Platinum',
  },
  {
    id: 'lead-3',
    rank: 3,
    name: 'Dawit Getachew',
    username: '@dawit_g',
    totalReferrals: 95,
    totalEarned: 23750,
    membershipBadge: '💎 Platinum',
  },
  {
    id: 'lead-4',
    rank: 4,
    name: 'Bethlehem Tilahun',
    username: '@betty_t',
    totalReferrals: 76,
    totalEarned: 19000,
    membershipBadge: '🥇 Gold',
  },
  {
    id: 'lead-5',
    rank: 5,
    name: 'Yonas Haile',
    username: '@yonas_h',
    totalReferrals: 62,
    totalEarned: 15500,
    membershipBadge: '🥇 Gold',
  },
  {
    id: 'lead-6',
    rank: 6,
    name: 'Makeda Solomon',
    username: '@makeda_s',
    totalReferrals: 49,
    totalEarned: 12250,
    membershipBadge: '🥈 Silver',
  },
  {
    id: 'lead-7',
    rank: 7,
    name: 'Kassahun Worku',
    username: '@kassa_w',
    totalReferrals: 38,
    totalEarned: 9500,
    membershipBadge: '🥈 Silver',
  },
  {
    id: 'lead-8',
    rank: 8,
    name: 'Hiwot Tadesse',
    username: '@hiwot_t',
    totalReferrals: 27,
    totalEarned: 6750,
    membershipBadge: '🥈 Silver',
  },
];
