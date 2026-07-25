import React from 'react';
import { Bell, CheckCheck, Info, CheckCircle2, XCircle, ArrowUpCircle, PieChart, Users } from 'lucide-react';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/storage';
import { User, NotificationItem } from '../../types';

interface NotificationsViewProps {
  user: User;
  onNotificationsUpdated: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ user, onNotificationsUpdated }) => {
  const notifications = getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(user.id);
    onNotificationsUpdated();
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
      onNotificationsUpdated();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Updates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Alerts for deposit approvals, withdrawal updates, investment subscriptions, and system updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-bold">No notifications yet</p>
            <p className="text-[11px] text-slate-400">Activity updates will appear here automatically.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !n.read
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="shrink-0 mt-1">
                {n.type === 'deposit' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {n.type === 'withdrawal' && <ArrowUpCircle className="w-5 h-5 text-indigo-500" />}
                {n.type === 'investment' && <PieChart className="w-5 h-5 text-blue-500" />}
                {n.type === 'referral' && <Users className="w-5 h-5 text-purple-500" />}
                {n.type === 'system' && <Info className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
