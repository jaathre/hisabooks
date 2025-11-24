import React, { useMemo, useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currency: string;
  showFilters?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  categories, 
  onDelete, 
  onEdit, 
  currency,
  showFilters = true
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  // Sort by date desc and filter
  const filteredAndSortedTransactions = useMemo(() => {
    let data = [...transactions];
    
    if (filterType === 'EXPENSE') {
      data = data.filter(t => t.type === TransactionType.EXPENSE);
    } else if (filterType === 'INCOME') {
      data = data.filter(t => t.type === TransactionType.INCOME);
    }

    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filter Bar */}
      {showFilters && (
        <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="flex w-full bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${filterType === 'ALL' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('EXPENSE')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${filterType === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Expense
            </button>
            <button 
              onClick={() => setFilterType('INCOME')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${filterType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Income
            </button>
          </div>
        </div>
      )}

      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 font-semibold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
        <div className="col-span-3 sm:col-span-2">Date</div>
        <div className="col-span-5 sm:col-span-7">Description</div>
        <div className="col-span-4 sm:col-span-3 text-right">Amount</div>
      </div>

      {/* Data Rows */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-8 text-center">
            <div className="mb-4 bg-gray-50 p-4 rounded-full">
                <Filter className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm">No transactions found.</p>
          </div>
        ) : (
          filteredAndSortedTransactions.map((tx) => (
            <div 
              key={tx.id} 
              onClick={() => onEdit(tx)}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 items-center text-sm group transition-colors cursor-pointer active:bg-gray-100"
            >
              
              <div className="col-span-3 sm:col-span-2 text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                <div className="text-[10px] text-gray-400 font-normal sm:hidden">{new Date(tx.date).getFullYear()}</div>
              </div>

              <div className="col-span-5 sm:col-span-7">
                <div className="font-medium text-gray-800 truncate">{tx.description}</div>
                <div className="flex items-center mt-1">
                   <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(tx.categoryId) }}
                   />
                   <span className="text-xs text-gray-400 truncate max-w-[100px]">{getCategoryName(tx.categoryId)}</span>
                </div>
              </div>

              <div className="col-span-4 sm:col-span-3 text-right">
                <span className={`font-bold ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : ''}{formatAmount(tx.amount)}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;