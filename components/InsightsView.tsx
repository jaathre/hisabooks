import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

interface InsightsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const InsightsView: React.FC<InsightsViewProps> = ({ 
  transactions, 
  categories, 
  currency,
}) => {
  // State for Daily View
  const [dailyDate, setDailyDate] = useState(new Date());
  
  // State for Monthly View
  const [monthlyDate, setMonthlyDate] = useState(new Date());

  // --- Helpers ---
  const formatMoney = (amount: number) => {
    return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // --- Navigation Handlers ---
  const shiftDay = (delta: number) => {
    const newDate = new Date(dailyDate);
    newDate.setDate(dailyDate.getDate() + delta);
    setDailyDate(newDate);
  };

  const shiftMonth = (delta: number) => {
    const newDate = new Date(monthlyDate);
    newDate.setMonth(monthlyDate.getMonth() + delta);
    setMonthlyDate(newDate);
  };

  // --- Data Calculations ---

  // 1. Overview Summary (Based on Monthly Date)
  const monthlySummary = useMemo(() => {
    const m = monthlyDate.getMonth();
    const y = monthlyDate.getFullYear();
    const currentMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const income = currentMonthTx.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTx.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions, monthlyDate]);

  // 2. Daily Expenses by Category (Bar Chart) - Based on dailyDate
  const dailyCategoryData = useMemo(() => {
    const targetDateStr = dailyDate.toDateString();
    
    // Filter expenses for the specific day
    const dayTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.toDateString() === targetDateStr && t.type === TransactionType.EXPENSE;
    });

    // Group by Category
    const stats: Record<string, number> = {};
    dayTx.forEach(t => {
        if (!stats[t.categoryId]) stats[t.categoryId] = 0;
        stats[t.categoryId] += t.amount;
    });

    return Object.entries(stats)
        .map(([catId, amount]) => {
            const cat = categories.find(c => c.id === catId);
            return {
                name: cat?.name || 'Unknown',
                amount,
                color: cat?.color || '#94a3b8'
            };
        })
        .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, dailyDate]);

  // 3. Monthly Trend (Line Chart) - Based on monthlyDate
  const monthlyTrendData = useMemo(() => {
    const m = monthlyDate.getMonth();
    const y = monthlyDate.getFullYear();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    // Initialize array for all days
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: 0
    }));

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === TransactionType.EXPENSE && d.getMonth() === m && d.getFullYear() === y) {
        const dayIdx = d.getDate() - 1;
        if (data[dayIdx]) {
            data[dayIdx].amount += t.amount;
        }
      }
    });

    return data;
  }, [transactions, monthlyDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-100 shadow-md rounded-lg text-xs">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          <p className="font-bold text-gray-900">{formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Format strings
  const dailyDateString = `${String(dailyDate.getDate()).padStart(2, '0')}.${String(dailyDate.getMonth() + 1).padStart(2, '0')}.${dailyDate.getFullYear()}`;
  const monthlyDateString = monthlyDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-6 bg-gray-50 relative">
      
      {/* Monthly Budget Summary (tied to Monthly View) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-500" />
                Overview
            </h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{monthlyDateString}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100">
            <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Income</div>
                <div className="font-bold text-emerald-600 text-sm sm:text-base">
                    {formatMoney(monthlySummary.income)}
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Expenses</div>
                <div className="font-bold text-red-500 text-sm sm:text-base">
                    {formatMoney(monthlySummary.expense)}
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Balance</div>
                <div className={`font-bold text-sm sm:text-base ${monthlySummary.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                    {formatMoney(monthlySummary.balance)}
                </div>
            </div>
        </div>
      </div>

      {/* Chart 1: Daily Expenses (Bar Chart) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => shiftDay(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Daily Expenses <span className="text-gray-400 normal-case ml-1">({dailyDateString})</span>
            </h3>
            <button onClick={() => shiftDay(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={20} />
            </button>
         </div>
         
         <div className="h-48 w-full">
            {dailyCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyCategoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            interval={0}
                            tick={({ x, y, payload }) => (
                                <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={10} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                                        {payload.value.length > 8 ? `${payload.value.substring(0, 6)}..` : payload.value}
                                    </text>
                                </g>
                            )}
                        />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {dailyCategoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                    <div className="w-10 h-1 bg-gray-100 rounded-full"></div>
                    <span className="text-sm">No expenses on this day</span>
                </div>
            )}
         </div>
      </div>

       {/* Chart 2: Monthly Trend (Line Chart) */}
       <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => shiftMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Monthly Trend <span className="text-gray-400 normal-case ml-1">({monthlyDateString})</span>
            </h3>
            <button onClick={() => shiftMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={20} />
            </button>
         </div>

         <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} interval={4} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} tick={{fill: '#94a3b8'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="h-20" /> {/* Spacer for bottom nav */}
    </div>
  );
};

export default InsightsView;