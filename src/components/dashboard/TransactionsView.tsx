import React, { useState } from 'react';
import { Receipt, Search, Filter, ArrowDownCircle, ArrowUpCircle, PieChart, Users } from 'lucide-react';
import { getUserTransactions } from '../../services/storage';
import { User, TransactionType } from '../../types';

interface TransactionsViewProps {
  user: User;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const transactions = getUserTransactions(user.id);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || tx.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <Receipt className="w-4 h-4" />
          <span>Activity Log</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Transactions History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete ledger of deposits, withdrawals, investment subscriptions, and referral commissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Deposit', 'Withdrawal', 'Investment', 'Referral Commission'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {filteredTransactions.length === 0 ? (
          <p className="text-center py-10 text-xs text-slate-400">No transactions found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        {tx.type === 'Deposit' && <ArrowDownCircle className="w-4 h-4 text-emerald-500" />}
                        {tx.type === 'Withdrawal' && <ArrowUpCircle className="w-4 h-4 text-indigo-500" />}
                        {tx.type === 'Investment' && <PieChart className="w-4 h-4 text-blue-500" />}
                        {tx.type === 'Referral Commission' && <Users className="w-4 h-4 text-purple-500" />}
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">
                      ETB {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {tx.status === 'Completed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          Completed
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                          Pending
                        </span>
                      )}
                      {tx.status === 'Failed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600">
                          Failed
                        </span>
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
};
