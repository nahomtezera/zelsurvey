import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Check, 
  X, 
  Eye, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Send,
  DollarSign,
  Ban,
  Trash2,
  Settings as SettingsIcon,
  TrendingUp,
  Receipt,
  Award,
  LogOut,
  AlertTriangle,
  User as UserIcon,
  Moon,
  Sun,
  LayoutDashboard,
  BarChart3,
  Share2,
  Edit,
  Plus,
  Minus,
  Briefcase,
  Menu,
  Download,
  Filter,
  Activity,
  ArrowRight,
  FileText
} from 'lucide-react';
import { 
  getUsers, 
  getDeposits, 
  getWithdrawals, 
  getPlans, 
  updatePlans,
  getTransactions,
  getPlatformSettings,
  updatePlatformSettings,
  approveDeposit, 
  rejectDeposit, 
  processWithdrawal, 
  updateUser, 
  toggleUserBanStatus,
  deleteUserAccount,
  addNotification,
  isSuperAdminAccount,
  triggerReferralReward,
  PlatformSettings
} from '../../services/storage';
import { User, DepositRequest, WithdrawalRequest, InvestmentPlan, Transaction } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

interface AdminPanelProps {
  currentUser: User;
  onDataChanged: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onLogout: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'deposits' 
  | 'withdrawals' 
  | 'transactions' 
  | 'memberships' 
  | 'referrals' 
  | 'announcements' 
  | 'reports' 
  | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  onDataChanged, 
  showToast,
  onLogout,
  darkMode = true,
  setDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('All');

  // Screenshot Proof Inspector & Detail Modal
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [reviewDepositId, setReviewDepositId] = useState<string | null>(null);
  const [viewDepositDetail, setViewDepositDetail] = useState<DepositRequest | null>(null);

  // User Actions Modals
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);
  const [balanceAdjustUser, setBalanceAdjustUser] = useState<User | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'deduct'>('add');
  const [adjustAmount, setAdjustAmount] = useState<string>('1000');
  const [adjustNote, setAdjustNote] = useState<string>('Admin manual wallet correction');
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  // Investment Plan Edit Modal
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  // Broadcast Form
  const [ancTitle, setAncTitle] = useState('');
  const [ancMessage, setAncMessage] = useState('');

  // Referral Management States
  const [referralSearch, setReferralSearch] = useState('');
  const [referralFilter, setReferralFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Platform Settings Form
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(() => getPlatformSettings());

  // Data queries
  const users = getUsers();
  const deposits = getDeposits();
  const withdrawals = getWithdrawals();
  const plans = getPlans();
  const transactions = getTransactions();

  // Metrics
  const pendingDeposits = deposits.filter((d) => d.status === 'Pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'Approved');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'Approved');

  const totalDepositsVolume = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawalsVolume = approvedWithdrawals.reduce((acc, curr) => acc + curr.amount, 0);
  const platformRevenue = totalDepositsVolume * 0.08; // 8% platform gross margin
  const activeMembersCount = users.filter((u) => u.activePlansCount && u.activePlansCount > 0).length;
  const totalTransactionsCount = transactions.length;

  // Deposit Actions
  const handleApproveDeposit = async (depId: string) => {
    const res = await approveDeposit(depId, adminNotesInput || 'Bank transfer verified by Super Admin');
    if (res.success) {
      showToast('success', 'Deposit Verified! 💰', res.message);
      onDataChanged();
      setSelectedProofUrl(null);
      setReviewDepositId(null);
      setAdminNotesInput('');
      setViewDepositDetail(null);
      if (depositFilter === 'Pending') {
        setDepositFilter('Approved');
      }
    } else {
      showToast('error', 'Approval Error', res.message);
    }
  };

  const handleRejectDeposit = async (depId: string, customReason?: string) => {
    let reason = customReason || adminNotesInput;
    if (!reason) {
      const promptReason = window.prompt("Enter rejection reason (optional):", "Invalid payment reference or unconfirmed bank transfer");
      if (promptReason === null) return;
      reason = promptReason || 'Invalid payment reference or unconfirmed bank transfer';
    }
    const res = await rejectDeposit(depId, reason);
    if (res.success) {
      showToast('info', 'Deposit Rejected', res.message);
      onDataChanged();
      setSelectedProofUrl(null);
      setReviewDepositId(null);
      setAdminNotesInput('');
      setViewDepositDetail(null);
      if (depositFilter === 'Pending') {
        setDepositFilter('Rejected');
      }
    } else {
      showToast('error', 'Action Error', res.message);
    }
  };

  // Withdrawal Actions
  const handleProcessWithdrawal = async (wId: string, action: 'approve' | 'reject') => {
    const res = await processWithdrawal(wId, action, action === 'approve' ? 'Payout Fulfilled' : 'Withdrawal Declined');
    if (res.success) {
      showToast(action === 'approve' ? 'success' : 'info', 'Withdrawal Processed', res.message);
      onDataChanged();
    } else {
      showToast('error', 'Processing Error', res.message);
    }
  };

  // Balance Adjustment Handler
  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceAdjustUser) return;

    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid positive numerical amount.');
      return;
    }

    const currentBal = balanceAdjustUser.balance;
    const newBal = adjustMode === 'add' ? currentBal + val : Math.max(0, currentBal - val);

    updateUser({ ...balanceAdjustUser, balance: newBal });
    addNotification(balanceAdjustUser.id, {
      title: adjustMode === 'add' ? 'Wallet Credited' : 'Wallet Deducted',
      message: `${adjustMode === 'add' ? 'Added' : 'Deducted'} ETB ${val.toLocaleString()}. Note: ${adjustNote}`,
      type: 'system',
    });

    showToast(
      'success',
      'Wallet Balance Updated',
      `${balanceAdjustUser.fullName}'s balance is now ETB ${newBal.toLocaleString()}`
    );
    onDataChanged();
    setBalanceAdjustUser(null);
    setAdjustAmount('1000');
  };

  // User Save Edit
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;

    updateUser({
      ...editUserModal,
      fullName: editUserModal.fullName,
      email: editUserModal.email,
      phone: editUserModal.phone,
    });

    showToast('success', 'User Updated', `Saved details for ${editUserModal.fullName}`);
    onDataChanged();
    setEditUserModal(null);
  };

  // Toggle Ban Status
  const handleToggleBan = (u: User) => {
    if (isSuperAdminAccount(u)) {
      showToast('error', 'Action Restricted', 'The Super Administrator account cannot be suspended.');
      return;
    }

    const res = toggleUserBanStatus(u.id);
    if (res.success) {
      showToast('info', 'Status Updated', res.message);
      onDataChanged();
    } else {
      showToast('error', 'Update Error', res.message);
    }
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = () => {
    if (!deleteTargetUser) return;
    if (isSuperAdminAccount(deleteTargetUser)) {
      showToast('error', 'Action Restricted', 'The Super Administrator account cannot be deleted.');
      setDeleteTargetUser(null);
      return;
    }

    const res = deleteUserAccount(deleteTargetUser.id);
    if (res.success) {
      showToast('success', 'Account Deleted', res.message);
      onDataChanged();
      setDeleteTargetUser(null);
    } else {
      showToast('error', 'Deletion Error', res.message);
    }
  };

  // Save Investment Plan Edit
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const currentPlans = getPlans();
    const idx = currentPlans.findIndex((p) => p.id === editingPlan.id);
    if (idx !== -1) {
      currentPlans[idx] = editingPlan;
      updatePlans(currentPlans);
      onDataChanged();
      showToast('success', 'Investment Plan Updated', `Updated settings for ${editingPlan.name} Plan.`);
    }
    setEditingPlan(null);
  };

  // Broadcast Announcement
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancMessage.trim()) return;

    users.forEach((u) => {
      addNotification(u.id, {
        title: ancTitle,
        message: ancMessage,
        type: 'system',
      });
    });

    showToast('success', 'Broadcast Sent! 📢', `Notification delivered to all ${users.length} registered accounts.`);
    setAncTitle('');
    setAncMessage('');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings(settingsForm);
    onDataChanged();
    showToast('success', 'Settings Saved ⚙️', 'Company name, bank details, and platform rules updated globally.');
  };

  // CSV Export for Transactions
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('info', 'Export Empty', 'No transaction records to export.');
      return;
    }

    const headers = ['ID', 'User ID', 'Type', 'Amount (ETB)', 'Description', 'Date', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.userId,
      t.type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.date,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zelsurvey_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Export Downloaded 📄', 'Transaction log CSV exported successfully.');
  };

  // Filtered Lists
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const filteredDeposits = deposits.filter((d) => depositFilter === 'All' || d.status === depositFilter);
  const filteredWithdrawals = withdrawals.filter((w) => withdrawalFilter === 'All' || w.status === withdrawalFilter);
  const filteredTransactions = transactions.filter((t) => {
    const q = txSearch.toLowerCase();
    const matchesSearch = t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchesType = txTypeFilter === 'All' || t.type.toLowerCase() === txTypeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Chart Datasets
  const reportsData = [
    { name: 'Mon', deposits: totalDepositsVolume * 0.2, withdrawals: totalWithdrawalsVolume * 0.15, users: Math.max(1, Math.round(users.length * 0.2)), revenue: platformRevenue * 0.2 },
    { name: 'Tue', deposits: totalDepositsVolume * 0.35, withdrawals: totalWithdrawalsVolume * 0.25, users: Math.max(1, Math.round(users.length * 0.35)), revenue: platformRevenue * 0.35 },
    { name: 'Wed', deposits: totalDepositsVolume * 0.5, withdrawals: totalWithdrawalsVolume * 0.4, users: Math.max(2, Math.round(users.length * 0.5)), revenue: platformRevenue * 0.5 },
    { name: 'Thu', deposits: totalDepositsVolume * 0.65, withdrawals: totalWithdrawalsVolume * 0.55, users: Math.max(2, Math.round(users.length * 0.65)), revenue: platformRevenue * 0.65 },
    { name: 'Fri', deposits: totalDepositsVolume * 0.8, withdrawals: totalWithdrawalsVolume * 0.75, users: Math.max(3, Math.round(users.length * 0.8)), revenue: platformRevenue * 0.8 },
    { name: 'Sat', deposits: totalDepositsVolume * 0.9, withdrawals: totalWithdrawalsVolume * 0.88, users: Math.max(3, Math.round(users.length * 0.9)), revenue: platformRevenue * 0.9 },
    { name: 'Sun', deposits: totalDepositsVolume, withdrawals: totalWithdrawalsVolume, users: users.length, revenue: platformRevenue },
  ];

  const sidebarNavItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: users.length },
    { id: 'deposits', label: 'Deposits', icon: ArrowDownCircle, badge: pendingDeposits.length },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle, badge: pendingWithdrawals.length },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'memberships', label: 'Memberships', icon: Award },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: 'announcements', label: 'Announcements', icon: Send },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* GLOBAL TOP ADMIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Toggle Mobile Sidebar Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight flex items-center gap-2">
              ZelSurvey Console
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                SUPER ADMIN
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Administrator Workspace • {currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MOBILE QUICK TAB PILLS BAR */}
      <div className="md:hidden w-full bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
          <div className="w-72 bg-slate-900 h-full p-4 space-y-2 border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span className="font-extrabold text-sm text-white">Super Admin Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-900 text-purple-200">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* MAIN CONTAINER WITH SIDEBAR & CONTENT AREA */}
      <div className="flex-1 flex w-full min-h-0">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden md:flex flex-col p-4 space-y-1">
          <p className="px-3 py-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Management System
          </p>

          <div className="space-y-1 flex-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-purple-700' : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout Admin</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE AREA */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 w-full">
              
              <div>
                <h1 className="text-2xl font-black text-white">Platform Management Dashboard</h1>
                <p className="text-xs text-slate-400">Real-time financial metrics, pending reviews, and platform activity.</p>
              </div>

              {/* 9 CARDS DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Total Users */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{users.length}</p>
                  <p className="text-[11px] text-purple-400 font-semibold">Registered investor accounts</p>
                </div>

                {/* 2. Pending Deposits */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pending Deposits</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-amber-400">{pendingDeposits.length}</p>
                  <p className="text-[11px] text-slate-400">Awaiting receipt review</p>
                </div>

                {/* 3. Approved Deposits */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Approved Deposits</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">{approvedDeposits.length}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">Verified bank transfers</p>
                </div>

                {/* 4. Pending Withdrawals */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pending Withdrawals</span>
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                      <ArrowUpCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-rose-400">{pendingWithdrawals.length}</p>
                  <p className="text-[11px] text-slate-400">Requested payouts</p>
                </div>

                {/* 5. Total Deposits */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Deposits</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">
                    ETB {totalDepositsVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-blue-400 font-semibold">Total capital deposited</p>
                </div>

                {/* 6. Total Withdrawals */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Withdrawals</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">
                    ETB {totalWithdrawalsVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-indigo-400 font-semibold">Total payouts fulfilled</p>
                </div>

                {/* 7. Platform Revenue */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Platform Revenue</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">
                    ETB {platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-400">Net platform yield earnings</p>
                </div>

                {/* 8. Active Members */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Active Members</span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{activeMembersCount}</p>
                  <p className="text-[11px] text-cyan-400 font-semibold">Active plan holders</p>
                </div>

                {/* 9. Total Transactions */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Transactions</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{totalTransactionsCount}</p>
                  <p className="text-[11px] text-slate-400">Audit ledger entries</p>
                </div>

              </div>

              {/* OVERVIEW CHARTS & RECENT ACTIVITY */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Capital Flow Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Platform Capital Growth</h3>
                      <p className="text-[11px] text-slate-400">Deposits vs Withdrawals trends</p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportsData}>
                        <defs>
                          <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="withGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="deposits" name="Deposits (ETB)" stroke="#10b981" fillOpacity={1} fill="url(#depGrad)" />
                        <Area type="monotone" dataKey="withdrawals" name="Withdrawals (ETB)" stroke="#8b5cf6" fillOpacity={1} fill="url(#withGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Action Required Queues */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Action Required</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Urgent review queues needing admin attention.</p>

                    <div className="space-y-3 text-xs">
                      <button
                        onClick={() => setActiveTab('deposits')}
                        className="w-full p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between text-left hover:border-amber-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-amber-200">Pending Deposit Requests</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                          {pendingDeposits.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveTab('withdrawals')}
                        className="w-full p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between text-left hover:border-rose-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="w-4 h-4 text-rose-400" />
                          <span className="font-bold text-rose-200">Pending Withdrawal Requests</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                          {pendingWithdrawals.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">
                      Company Account: <span className="text-purple-300 font-bold">{settingsForm.bankName}</span> ({settingsForm.accountNumber})
                    </p>
                  </div>
                </div>

              </div>

              {/* RECENT DEPOSITS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Deposit Submissions</h3>
                  <button onClick={() => setActiveTab('deposits')} className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1">
                    <span>View All ({deposits.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Bank / Ref</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {deposits.slice(0, 5).map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-white">{d.userName}</td>
                          <td className="py-3 px-3 font-black text-emerald-400">ETB {d.amount.toLocaleString()}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{d.transactionRef}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                              d.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {d.status === 'Pending' ? (
                              <button
                                onClick={() => handleApproveDeposit(d.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RECENT REGISTRATIONS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Member Registrations</h3>
                  <button onClick={() => setActiveTab('users')} className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1">
                    <span>Manage Users ({users.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Investor</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Wallet</th>
                        <th className="py-2.5 px-3 text-right">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {users.slice(0, 5).map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-purple-600/30 text-purple-300 font-black flex items-center justify-center text-[10px]">
                              {u.fullName.charAt(0)}
                            </div>
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{u.phone}</td>
                          <td className="py-3 px-3 font-black text-purple-300">ETB {u.balance.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. USERS MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 w-full">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Registered Users Directory</h1>
                  <p className="text-xs text-slate-400">View user profiles, edit balances, suspend or delete accounts.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* USERS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email / Phone</th>
                        <th className="py-3 px-4">Wallet Balance</th>
                        <th className="py-3 px-4">Total Deposited</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredUsers.map((u) => {
                        const isSuperAdmin = isSuperAdminAccount(u);
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 font-extrabold flex items-center justify-center shrink-0">
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="leading-tight">{u.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-300">
                              <p className="font-mono text-[11px]">{u.email}</p>
                              <p className="text-[10px] text-slate-500">{u.phone}</p>
                            </td>

                            <td className="py-3.5 px-4 font-black text-purple-300">
                              ETB {u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3.5 px-4 text-emerald-400 font-bold">
                              ETB {u.totalDeposits.toLocaleString()}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuperAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {isSuperAdmin ? 'Super Admin' : 'Investor'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isBanned ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {u.isBanned ? 'Suspended' : 'Active'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setViewProfileUser(u)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                                  title="View Full Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setEditUserModal(u)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors cursor-pointer"
                                  title="Edit User Info"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setBalanceAdjustUser(u)}
                                  className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900 transition-colors cursor-pointer"
                                  title="Add or Deduct Balance"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                </button>

                                {!isSuperAdmin && (
                                  <>
                                    <button
                                      onClick={() => handleToggleBan(u)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        u.isBanned ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900' : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900'
                                      }`}
                                      title={u.isBanned ? 'Reactivate Account' : 'Suspend Account'}
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setDeleteTargetUser(u)}
                                      className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 hover:bg-rose-900 transition-colors cursor-pointer"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 3. DEPOSITS MANAGEMENT TAB */}
          {activeTab === 'deposits' && (
            <div className="space-y-6 w-full">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Deposit Verification Center</h1>
                  <p className="text-xs text-slate-400">Review payment screenshots, approve deposits to credit wallet, or reject invalid claims.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setDepositFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        depositFilter === status ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* DEPOSITS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Method / Ref</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No deposit requests found.</td>
                        </tr>
                      ) : (
                        filteredDeposits.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              <p>{d.userName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{d.userEmail}</p>
                            </td>

                            <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                              ETB {d.amount.toLocaleString()}
                            </td>

                            <td className="py-3.5 px-4 text-slate-300">
                              <p className="font-semibold">{d.bankUsed}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{d.transactionRef}</p>
                            </td>

                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                d.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                d.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {d.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {d.paymentProofUrl && (
                                  <button
                                    onClick={() => {
                                      setSelectedProofUrl(d.paymentProofUrl || null);
                                      setReviewDepositId(d.id);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900 text-purple-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    title="View Payment Proof Screenshot"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                                    <span>View Screenshot</span>
                                  </button>
                                )}

                                {d.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveDeposit(d.id)}
                                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Approve Deposit"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>

                                    <button
                                      onClick={() => handleRejectDeposit(d.id)}
                                      className="px-3 py-1 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Reject Deposit"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => setViewDepositDetail(d)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="View Full Deposit Details"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View Details</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 4. WITHDRAWALS MANAGEMENT TAB */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6 w-full">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Withdrawal Payout Requests</h1>
                  <p className="text-xs text-slate-400">Review pending payouts, approve bank transfers, or decline invalid requests.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setWithdrawalFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        withdrawalFilter === status ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* WITHDRAWALS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Method & Account</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No withdrawal requests found.</td>
                        </tr>
                      ) : (
                        filteredWithdrawals.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              <p>{w.userName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{w.userEmail}</p>
                            </td>

                            <td className="py-3.5 px-4 font-black text-purple-300 text-sm">
                              ETB {w.amount.toLocaleString()}
                            </td>

                            <td className="py-3.5 px-4 text-slate-300">
                              <p className="font-semibold">{w.method}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{w.accountInfo}</p>
                            </td>

                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                w.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                w.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {w.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {w.status === 'Pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleProcessWithdrawal(w.id, 'approve')}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve Payout</span>
                                  </button>

                                  <button
                                    onClick={() => handleProcessWithdrawal(w.id, 'reject')}
                                    className="px-3 py-1 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-mono">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 5. TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 w-full">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white">System Transactions Audit Log</h1>
                  <p className="text-xs text-slate-400">Complete immutable record of all deposits, withdrawals, and investments.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search ref ID or description..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* TYPE FILTERS */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Deposit', 'Withdrawal', 'Investment', 'Referral Bonus', 'Adjustment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      txTypeFilter === type ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* TRANSACTIONS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No transactions match your search filter.</td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-purple-300 font-bold">{tx.id}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">{tx.description}</td>
                            <td className="py-3.5 px-4 font-black text-emerald-400">
                              ETB {tx.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{tx.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 6. MEMBERSHIPS & INVESTMENT PLANS MANAGEMENT */}
          {activeTab === 'memberships' && (
            <div className="space-y-6 w-full">
              
              <div>
                <h1 className="text-2xl font-black text-white">Investment Plans & VIP Memberships</h1>
                <p className="text-xs text-slate-400">Configure return rates, minimum deposit requirements, and duration for investment tiers.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-white">{plan.name} Plan</h3>
                        <p className="text-xs text-purple-400 font-bold">{plan.dailyRoiPercent}% Daily Yield</p>
                      </div>

                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Plan</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-500">Minimum Investment:</span>
                        <span className="font-bold text-emerald-400">ETB {plan.minInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-bold text-white">{plan.durationDays} Days</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-500">Total Return ROI:</span>
                        <span className="font-bold text-purple-300">{plan.totalReturnPercent}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">{plan.description}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 7. REFERRALS MANAGEMENT TAB */}
          {activeTab === 'referrals' && (() => {
            const relationships = users
              .filter((u) => u.referredBy)
              .map((refUser) => {
                const referrer = users.find((u) => u.referralCode.toLowerCase() === refUser.referredBy?.toLowerCase());
                const userDeps = deposits.filter((d) => d.userId === refUser.id);
                const qualifyingApprovedDeposit = userDeps.find((d) => d.status === 'Approved' && d.amount >= 1000);
                const pendingDeposit = userDeps.find((d) => d.status === 'Pending');

                return {
                  refUser,
                  referrer,
                  qualifyingApprovedDeposit,
                  pendingDeposit,
                  rewardStatus: refUser.referralRewardPaid ? ('Paid' as const) : ('Pending' as const),
                };
              });

            const totalRelationships = relationships.length;
            const paidRewardsCount = relationships.filter((r) => r.rewardStatus === 'Paid').length;
            const pendingRewardsCount = totalRelationships - paidRewardsCount;
            const totalPaidAmount = paidRewardsCount * 100;

            const filtered = relationships.filter((rel) => {
              const matchesFilter =
                referralFilter === 'All'
                  ? true
                  : referralFilter === 'Paid'
                  ? rel.rewardStatus === 'Paid'
                  : rel.rewardStatus === 'Pending';

              const s = referralSearch.toLowerCase();
              const matchesSearch =
                !referralSearch ||
                rel.refUser.fullName.toLowerCase().includes(s) ||
                rel.refUser.email.toLowerCase().includes(s) ||
                (rel.refUser.referredBy && rel.refUser.referredBy.toLowerCase().includes(s)) ||
                (rel.referrer && rel.referrer.fullName.toLowerCase().includes(s)) ||
                (rel.referrer && rel.referrer.email.toLowerCase().includes(s));

              return matchesFilter && matchesSearch;
            });

            const handleManualTrigger = (refUserId: string) => {
              const res = triggerReferralReward(refUserId);
              if (res.success) {
                showToast('success', 'Reward Issued!', res.message);
                onDataChanged();
              } else {
                showToast('error', 'Cannot Issue Reward', res.message);
              }
            };

            return (
              <div className="space-y-6 w-full">
                
                <div>
                  <h1 className="text-2xl font-black text-white">Referral Program Management</h1>
                  <p className="text-xs text-slate-400">Track all referrer-referred relationships, deposit qualification, and ETB 100 rewards.</p>
                </div>

                {/* 4 Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase">Total Referrals</span>
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{totalRelationships}</p>
                    <p className="text-[11px] text-slate-400">Tracked connections</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase">Paid Rewards</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400">{paidRewardsCount}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">Approved deposits (&ge; ETB 1k)</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase">Pending Rewards</span>
                      <Activity className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-amber-400">{pendingRewardsCount}</p>
                    <p className="text-[11px] text-slate-400">Awaiting qualifying deposit</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase">Total Payouts</span>
                      <DollarSign className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-purple-400">ETB {totalPaidAmount.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">ETB 100 per qualification</p>
                  </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search referrer, referred user, or referral code..."
                      value={referralSearch}
                      onChange={(e) => setReferralSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Status:</span>
                    <select
                      value={referralFilter}
                      onChange={(e) => setReferralFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none cursor-pointer font-bold"
                    >
                      <option value="All">All Relationships</option>
                      <option value="Paid">Reward Paid (ETB 100)</option>
                      <option value="Pending">Reward Pending</option>
                    </select>
                  </div>
                </div>

                {/* Referrals Table */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white">Referral Audit Trail</h3>
                    <span className="text-xs text-purple-400 font-bold">{filtered.length} records</span>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400 text-xs">
                      No referral records match your current filter criteria.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                            <th className="pb-3 pl-2">Referrer</th>
                            <th className="pb-3">Referred User</th>
                            <th className="pb-3">Registration Date</th>
                            <th className="pb-3">Qualifying Deposit Status</th>
                            <th className="pb-3">Reward Status</th>
                            <th className="pb-3 pr-2 text-right">Admin Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-semibold">
                          {filtered.map((row) => (
                            <tr key={row.refUser.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 pl-2">
                                {row.referrer ? (
                                  <div>
                                    <div className="font-extrabold text-white">{row.referrer.fullName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">Code: {row.referrer.referralCode} • {row.referrer.email}</div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-extrabold text-amber-400">Code: {row.refUser.referredBy}</div>
                                    <div className="text-[10px] text-slate-500">Referrer account missing</div>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5">
                                <div className="font-extrabold text-white">{row.refUser.fullName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">@{row.refUser.username} • {row.refUser.email}</div>
                              </td>

                              <td className="py-3.5 text-slate-400">
                                {new Date(row.refUser.createdAt).toLocaleDateString()}
                              </td>

                              <td className="py-3.5">
                                {row.qualifyingApprovedDeposit ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Approved (ETB {row.qualifyingApprovedDeposit.amount.toLocaleString()})
                                  </span>
                                ) : row.pendingDeposit ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Pending (ETB {row.pendingDeposit.amount.toLocaleString()})
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                    No Qualifying Deposit (&lt; 1k)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5">
                                {row.rewardStatus === 'Paid' ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Paid (ETB 100)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Pending</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 pr-2 text-right">
                                {row.rewardStatus === 'Pending' && row.qualifyingApprovedDeposit && (
                                  <button
                                    onClick={() => handleManualTrigger(row.refUser.id)}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow transition-all cursor-pointer"
                                  >
                                    Verify & Trigger ETB 100
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

          {/* 8. ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 w-full">
              <div>
                <h1 className="text-2xl font-black text-white">Broadcast System Announcement</h1>
                <p className="text-xs text-slate-400">Send direct inbox notifications to all platform users.</p>
              </div>

              <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs max-w-2xl">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. System Maintenance & Yield Distribution Update"
                    value={ancTitle}
                    onChange={(e) => setAncTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Write platform broadcast message here..."
                    value={ancMessage}
                    onChange={(e) => setAncMessage(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to {users.length} Users</span>
                </button>
              </form>
            </div>
          )}

          {/* 9. REPORTS & ANALYTICS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6 w-full">
              <div>
                <h1 className="text-2xl font-black text-white">Reports & Financial Analytics</h1>
                <p className="text-xs text-slate-400">Visual performance charts for deposits, withdrawals, user signups, and daily revenue.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Deposits vs Withdrawals Bar Chart */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Deposits vs Withdrawals</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                        <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="withdrawals" name="Withdrawals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New Users Growth */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">New User Registrations</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="users" name="Registered Users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 10. PLATFORM SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 w-full">
              <div>
                <h1 className="text-2xl font-black text-white">Platform Configuration & Bank Details</h1>
                <p className="text-xs text-slate-400">Configure company name, bank account parameters, and minimum withdrawal thresholds.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs max-w-2xl">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Company / Bank Name</label>
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={settingsForm.accountName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accountName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Official Bank Account Number</label>
                    <input
                      type="text"
                      value={settingsForm.accountNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accountNumber: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">SWIFT Code</label>
                    <input
                      type="text"
                      value={settingsForm.swiftCode || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, swiftCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Deposit Instructions for Investors</label>
                  <textarea
                    rows={3}
                    value={settingsForm.instructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instructions: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Minimum Withdrawal Limit (ETB)</label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={settingsForm.minWithdrawalAmount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawalAmount: parseFloat(e.target.value) || 5000 })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Referral Bonus Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={settingsForm.referralCommissionPercent}
                      onChange={(e) => setSettingsForm({ ...settingsForm, referralCommissionPercent: parseFloat(e.target.value) || 5 })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-bold text-sm text-purple-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Save Platform Rules & Bank Details
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* SCREENSHOT PROOF INSPECTOR MODAL */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span>Payment Screenshot Verification</span>
              </h3>
              <button 
                onClick={() => {
                  setSelectedProofUrl(null);
                  setReviewDepositId(null);
                }} 
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[220px]">
              <img 
                src={selectedProofUrl} 
                alt="Payment proof screenshot" 
                className="max-h-[300px] w-auto object-contain rounded-lg"
              />
            </div>

            {reviewDepositId && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Admin Verification Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Ref #99281 confirmed in online banking"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApproveDeposit(reviewDepositId)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Approve Deposit
                  </button>
                  <button
                    onClick={() => handleRejectDeposit(reviewDepositId)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reject Deposit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT WALLET BALANCE (CREDIT / DEDUCT MONEY) */}
      {balanceAdjustUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Adjust Wallet Balance</h3>
              <button onClick={() => setBalanceAdjustUser(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400">
              User: <span className="text-white font-bold">{balanceAdjustUser.fullName}</span> ({balanceAdjustUser.email})<br />
              Current Balance: <span className="text-purple-300 font-bold">ETB {balanceAdjustUser.balance.toLocaleString()}</span>
            </p>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustMode('add')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    adjustMode === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Credit / Add Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustMode('deduct')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    adjustMode === 'deduct' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Deduct Money</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Note / Reason</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceAdjustUser(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-xl font-bold text-white transition-colors cursor-pointer ${
                    adjustMode === 'add' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW PROFILE DETAILS */}
      {viewProfileUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Investor Profile Card</h3>
              <button onClick={() => setViewProfileUser(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                <p className="font-black text-white text-base">{viewProfileUser.fullName}</p>
                <p className="font-mono text-purple-300">@{viewProfileUser.username} • {viewProfileUser.email}</p>
                <p className="text-[11px] text-slate-400">Phone: {viewProfileUser.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-800/60 rounded-xl">
                  <p className="text-slate-500">Wallet Balance</p>
                  <p className="font-bold text-emerald-400">ETB {viewProfileUser.balance.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl">
                  <p className="text-slate-500">Total Deposited</p>
                  <p className="font-bold text-white">ETB {viewProfileUser.totalDeposits.toLocaleString()}</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl">
                  <p className="text-slate-500">Referral Code</p>
                  <p className="font-mono font-bold text-purple-300">{viewProfileUser.referralCode}</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl">
                  <p className="text-slate-500">Registered</p>
                  <p className="font-bold text-white">{new Date(viewProfileUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewProfileUser(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT USER INFO */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Edit User Account</h3>
              <button onClick={() => setEditUserModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserModal.fullName}
                  onChange={(e) => setEditUserModal({ ...editUserModal, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editUserModal.email}
                  onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editUserModal.phone}
                  onChange={(e) => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE USER CONFIRMATION */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete Account?</h3>
              <p className="text-slate-400 mt-1">
                Are you sure you want to permanently delete <span className="text-white font-bold">{deleteTargetUser.fullName}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT INVESTMENT PLAN */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Edit Investment Plan</h3>
              <button onClick={() => setEditingPlan(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Min Investment (ETB)</label>
                  <input
                    type="number"
                    value={editingPlan.minInvestment}
                    onChange={(e) => setEditingPlan({ ...editingPlan, minInvestment: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Daily Yield (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlan.dailyRoiPercent}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyRoiPercent: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={editingPlan.durationDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total ROI (%)</label>
                  <input
                    type="number"
                    value={editingPlan.totalReturnPercent}
                    onChange={(e) => setEditingPlan({ ...editingPlan, totalReturnPercent: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold text-purple-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT DETAILS MODAL */}
      {viewDepositDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Deposit Request Details</span>
              </h3>
              <button
                onClick={() => setViewDepositDetail(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Investor Name</p>
                <p className="font-bold text-white text-sm">{viewDepositDetail.userName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Email Address</p>
                <p className="font-mono text-xs text-slate-400">{viewDepositDetail.userEmail}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Deposit Amount</p>
                <p className="font-black text-emerald-400 text-base">ETB {viewDepositDetail.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Status</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewDepositDetail.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                  viewDepositDetail.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {viewDepositDetail.status}
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Bank Used</p>
                <p className="font-semibold text-white">{viewDepositDetail.bankUsed}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Transaction Ref / ID</p>
                <p className="font-mono text-purple-300 font-bold">{viewDepositDetail.transactionRef}</p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Date Submitted</p>
                <p className="text-slate-300">{new Date(viewDepositDetail.date).toLocaleString()}</p>
              </div>

              {viewDepositDetail.adminNotes && (
                <div className="col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Admin Notes / Remarks</p>
                  <p className="text-slate-300 font-mono mt-0.5">{viewDepositDetail.adminNotes}</p>
                </div>
              )}
            </div>

            {viewDepositDetail.paymentProofUrl && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Uploaded Payment Proof</p>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center max-h-[200px]">
                  <img
                    src={viewDepositDetail.paymentProofUrl}
                    alt="Payment proof"
                    className="max-h-[190px] w-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {viewDepositDetail.status === 'Pending' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Admin Verification Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Ref confirmed in online banking"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApproveDeposit(viewDepositDetail.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Deposit</span>
                  </button>
                  <button
                    onClick={() => handleRejectDeposit(viewDepositDetail.id)}
                    className="flex-1 py-2.5 bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Deposit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
