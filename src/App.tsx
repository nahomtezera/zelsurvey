import React, { useState, useEffect } from 'react';
import { 
  initializeStorage, 
  getCurrentUser, 
  setCurrentUser, 
  getNotifications, 
  getDeposits, 
  getUserTransactions, 
  getUserInvestments,
  processDailyEarnings,
  seedDemoDataForTesting 
} from './services/storage';
import { User, ActiveTab, AuthMode } from './types';

// Common Components
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';

// Public & Auth Components
import { LandingPage } from './components/landing/LandingPage';
import { RegisterView } from './components/auth/RegisterView';
import { LoginView } from './components/auth/LoginView';

// Dashboard Views
import { UserDashboard } from './components/dashboard/UserDashboard';
import { DepositView } from './components/dashboard/DepositView';
import { WithdrawView } from './components/dashboard/WithdrawView';
import { InvestmentPlansView } from './components/dashboard/InvestmentPlansView';
import { MyInvestmentsView } from './components/dashboard/MyInvestmentsView';
import { TransactionsView } from './components/dashboard/TransactionsView';
import { ReferralView } from './components/dashboard/ReferralView';
import { NotificationsView } from './components/dashboard/NotificationsView';
import { ProfileView } from './components/dashboard/ProfileView';
import { SettingsView } from './components/dashboard/SettingsView';
import { DailyRewardsView } from './components/dashboard/DailyRewardsView';
import { MembershipView } from './components/dashboard/MembershipView';
import { AchievementsView } from './components/dashboard/AchievementsView';
import { LogoutModal } from './components/common/LogoutModal';

// Admin Panel
import { AdminPanel } from './components/admin/AdminPanel';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zelsurvey_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<string>('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Local state version ticker to force re-renders when LocalStorage updates
  const [dataVersion, setDataVersion] = useState<number>(0);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
    try {
      const updated = getCurrentUser();
      setCurrentUserState(updated);
    } catch (e) {
      console.warn('refreshData error:', e);
    }
  };

  useEffect(() => {
    try {
      initializeStorage();
      const user = getCurrentUser();
      setCurrentUserState(user);
    } catch (e) {
      console.warn('initializeStorage effect error:', e);
    }

    const handleStorageUpdate = () => {
      refreshData();
    };

    window.addEventListener('zelsurvey_storage_updated', handleStorageUpdate);

    // Periodic check for daily earnings payouts
    const interval = setInterval(() => {
      try {
        processDailyEarnings();
        refreshData();
      } catch (e) {
        console.warn('Interval error:', e);
      }
    }, 10000);

    return () => {
      window.removeEventListener('zelsurvey_storage_updated', handleStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('zelsurvey_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('zelsurvey_theme', 'light');
      }
    } catch (e) {
      console.warn('Dark mode storage error:', e);
    }
  }, [darkMode]);

  // Toast Helper
  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast-' + Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUserState(user);
    setAuthMode('none');
    showToast('success', 'Welcome back!', `Logged in as ${user.fullName}`);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogoutTrigger = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setShowLogoutConfirm(false);
    setActiveTab('dashboard');
    setAuthMode('login');
    showToast('info', 'Logged Out', 'You have been logged out safely.');
  };

  // Helper function to seed test deposit request
  const handleSeedDemoData = () => {
    if (!currentUser) return;
    const res = seedDemoDataForTesting(currentUser.id);
    refreshData();
    if (res.success) {
      showToast('success', 'Demo Request Created!', res.message);
    }
  };

  // Derived metrics
  const unreadNotificationsCount = currentUser ? getNotifications(currentUser.id).filter((n) => !n.read).length : 0;
  const pendingDepositsCount = getDeposits().filter((d) => d.status === 'Pending').length;
  const userTransactions = currentUser ? getUserTransactions(currentUser.id) : [];
  const userInvestments = currentUser ? getUserInvestments(currentUser.id) : [];

  // IF LOGGED IN AS SUPER ADMIN, RENDER DEDICATED ADMIN CONSOLE
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        <AdminPanel
          currentUser={currentUser}
          onDataChanged={refreshData}
          showToast={showToast}
          onLogout={handleLogoutTrigger}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Logout Confirmation Modal */}
        <LogoutModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Global Navigation Header */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadNotificationsCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogoutTrigger}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSeedDemoData={currentUser ? handleSeedDemoData : undefined}
      />

      {/* VIEW CONDITIONAL RENDERING */}
      {!currentUser && activeTab !== 'admin' ? (
        /* Unauthenticated User sees Landing Page */
        <LandingPage
          onOpenAuth={(mode) => setAuthMode(mode)}
          onSelectPlan={(planId) => {
            setSelectedPlanForAuth(planId);
            setAuthMode('register');
          }}
        />
      ) : (
        /* Logged-In Application Layout or Admin View */
        <div className="flex w-full max-w-7xl mx-auto min-h-[calc(100vh-4rem)] min-w-0">
          
          {/* Desktop Sidebar (hidden when in public/landing view or mobile) */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadCount={unreadNotificationsCount}
            pendingDepositsCount={pendingDepositsCount}
          />

          {/* Main Dashboard Content Area */}
          <main className="flex-1 min-w-0 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-12">
            {activeTab === 'dashboard' && currentUser && (
              <UserDashboard
                user={currentUser}
                setActiveTab={setActiveTab}
                transactions={userTransactions}
                investments={userInvestments}
                onSeedDemoData={handleSeedDemoData}
                showToast={showToast}
              />
            )}

            {activeTab === 'deposit' && currentUser && (
              <DepositView
                user={currentUser}
                onDepositCreated={refreshData}
                showToast={showToast}
              />
            )}

            {activeTab === 'withdraw' && currentUser && (
              <WithdrawView
                user={currentUser}
                onWithdrawalCreated={refreshData}
                showToast={showToast}
              />
            )}

            {activeTab === 'investment-plans' && currentUser && (
              <InvestmentPlansView
                user={currentUser}
                onPlanPurchased={refreshData}
                setActiveTab={(tab) => setActiveTab(tab as ActiveTab)}
                showToast={showToast}
              />
            )}

            {activeTab === 'my-investments' && currentUser && (
              <MyInvestmentsView
                user={currentUser}
                setActiveTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'daily-rewards' && currentUser && (
              <DailyRewardsView
                user={currentUser}
                onUserUpdated={refreshData}
                onUpdateUser={() => refreshData()}
                showToast={showToast}
              />
            )}

            {activeTab === 'membership' && currentUser && (
              <MembershipView
                user={currentUser}
                onNavigateToDeposit={() => setActiveTab('deposit')}
                setActiveTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'achievements' && currentUser && (
              <AchievementsView
                user={currentUser}
              />
            )}

            {activeTab === 'transactions' && currentUser && (
              <TransactionsView
                user={currentUser}
              />
            )}

            {activeTab === 'referrals' && currentUser && (
              <ReferralView
                user={currentUser}
                showToast={showToast}
              />
            )}

            {activeTab === 'notifications' && currentUser && (
              <NotificationsView
                user={currentUser}
                onNotificationsUpdated={refreshData}
              />
            )}

            {activeTab === 'profile' && currentUser && (
              <ProfileView
                user={currentUser}
                onProfileUpdated={refreshData}
                showToast={showToast}
                onLogout={handleLogoutTrigger}
              />
            )}

            {activeTab === 'settings' && currentUser && (
              <SettingsView
                user={currentUser}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={handleLogoutTrigger}
                showToast={showToast}
              />
            )}

            {activeTab === 'admin' && (
              currentUser && currentUser.role === 'admin' ? (
                <AdminPanel
                  currentUser={currentUser}
                  onDataChanged={refreshData}
                  showToast={showToast}
                  onLogout={handleLogoutTrigger}
                />
              ) : (
                <div className="max-w-xl mx-auto py-16 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Access Denied</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                      You do not have administrative permissions to view this portal. Please log in with authorized credentials or return to your dashboard.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    {!currentUser && (
                      <button
                        onClick={() => setAuthMode('login')}
                        className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )
            )}
          </main>

        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {currentUser && activeTab !== 'admin' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Auth Modals */}
      {authMode === 'register' && (
        <RegisterView
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthMode('login')}
          onClose={() => setAuthMode('none')}
          initialReferralCode={selectedPlanForAuth}
        />
      )}

      {authMode === 'login' && (
        <LoginView
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setAuthMode('register')}
          onClose={() => setAuthMode('none')}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />

    </div>
  );
}
