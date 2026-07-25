import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
    </div>
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/40">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
      </div>
    ))}
  </div>
);
