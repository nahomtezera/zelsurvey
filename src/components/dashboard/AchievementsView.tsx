import React from 'react';
import { User } from '../../types';
import { getAllAchievements } from '../../services/gamificationService';
import { Award, Lock, CheckCircle2, Sparkles, Trophy, Star } from 'lucide-react';

interface AchievementsViewProps {
  user: User;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ user }) => {
  const achievements = getAllAchievements(user);
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
              <Trophy className="w-4 h-4 text-purple-300" />
              <span>Investment Badges & Achievements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Your Achievement Collection</h1>
            <p className="text-purple-200 text-sm max-w-xl leading-relaxed">
              Unlock prestigious badges as you deposit, invest, check in daily, and grow your portfolio on ZelSurvey.
            </p>
          </div>

          {/* PROGRESS CIRCLE / BAR */}
          <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-purple-400/20 w-full md:w-80 space-y-3 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-purple-200">Unlocked Badges</span>
              <span className="text-amber-400 font-extrabold">{unlockedCount} / {totalCount} ({progressPercent}%)</span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-purple-300 text-center">
              {unlockedCount === totalCount 
                ? '🏆 Master Investor! All achievements unlocked.' 
                : `${totalCount - unlockedCount} achievement${totalCount - unlockedCount === 1 ? '' : 's'} remaining to complete.`}
            </p>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS GRID */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">All Milestone Badges</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                item.isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-500/40 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              {/* STATUS BADGE */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-3xl p-3 rounded-2xl ${
                  item.isUnlocked 
                    ? 'bg-amber-100 dark:bg-amber-950/60 shadow-inner' 
                    : 'bg-slate-200 dark:bg-slate-800 grayscale'
                }`}>
                  {item.icon}
                </span>

                {item.isUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="space-y-1.5 my-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{item.title}</span>
                  {item.isUnlocked && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* FOOTER DATE OR POINTS */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  +{item.rewardPoints} Pts
                </span>

                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                  {item.isUnlocked && item.unlockedAt 
                    ? new Date(item.unlockedAt).toLocaleDateString()
                    : item.isUnlocked 
                    ? 'Completed' 
                    : 'In Progress'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
