import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface CalendarWidgetProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  transactions: Transaction[];
  onDateSelect: (date: Date) => void;
  currency: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ 
  currentDate, 
  onMonthChange, 
  transactions, 
  onDateSelect,
  currency 
}) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Group transactions by date for the current month
  const dailyStats = useMemo(() => {
    const stats: Record<number, { hasExpense: boolean; hasIncome: boolean; total: number }> = {};
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear()) {
        const day = txDate.getDate();
        if (!stats[day]) {
          stats[day] = { hasExpense: false, hasIncome: false, total: 0 };
        }
        
        if (tx.type === TransactionType.EXPENSE) stats[day].hasExpense = true;
        if (tx.type === TransactionType.INCOME) stats[day].hasIncome = true;
        
        if (tx.type === TransactionType.EXPENSE) stats[day].total += tx.amount;
      }
    });
    
    return stats;
  }, [transactions, currentDate]);

  const renderDays = () => {
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 sm:h-16" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const stat = dailyStats[day];
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => {
            const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            onDateSelect(selectedDate);
          }}
          className={`h-14 sm:h-16 border border-gray-50 rounded-lg relative flex flex-col items-start justify-start p-1 transition-colors hover:bg-blue-50 hover:border-blue-100 ${isToday ? 'bg-blue-50/50 ring-1 ring-blue-200' : 'bg-white'}`}
        >
          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
            {day}
          </span>
          
          <div className="mt-auto flex gap-1 self-center pb-1">
            {stat?.hasIncome && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            )}
            {stat?.hasExpense && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            )}
          </div>
          
          {stat && stat.total > 0 && (
             <span className="text-[9px] text-gray-400 self-center font-medium hidden sm:block">
                {currency === 'INR' ? '₹' : '$'}{Math.round(stat.total)}
             </span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            {monthName} <span className="text-gray-400 font-normal">{year}</span>
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default CalendarWidget;
