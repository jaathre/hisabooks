import React from 'react';
import { TriangleAlert, Download, Coins } from 'lucide-react';
import { Transaction, Category } from '../types';

interface SettingsViewProps {
  onClearData: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  transactions: Transaction[];
  categories: Category[];
}

const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'AED', symbol: 'dh', name: 'UAE Dirham' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ onClearData, currency, onCurrencyChange, transactions, categories }) => {
  
  const handleExportCSV = () => {
    // 1. Create CSV Header
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount'];
    
    // 2. Map Data
    const rows = transactions.map(tx => {
        const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Unknown';
        return [
            tx.date,
            `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
            tx.type,
            `"${catName}"`,
            tx.amount.toFixed(2)
        ].join(',');
    });

    // 3. Combine
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Create Blob and Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hisab_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 h-full bg-gray-50 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
      
      <div className="space-y-4">
        
        {/* Preferences Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Coins size={18} />
                <span>Currency</span>
            </h3>
            
            <div className="relative">
                <select 
                    value={currency} 
                    onChange={(e) => onCurrencyChange(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-primary appearance-none font-medium text-gray-700"
                >
                    {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.symbol} {c.code} - {c.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                </div>
            </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-2">About Hisab</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
                A simple, privacy-focused expense tracker designed to keep your finances organized without the clutter. 
                Data is stored locally on your device.
            </p>
        </div>

        {/* Data Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Data Management</h3>
            
            <button 
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 mb-3 transition-colors"
            >
                <Download size={18} />
                <span>Export to CSV</span>
            </button>

            <button 
                onClick={() => {
                    if(window.confirm("Are you sure? This will wipe all transactions and reset categories.")) {
                        onClearData();
                    }
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
                <TriangleAlert size={18} />
                <span>Reset All Data</span>
            </button>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8">
            v1.3.0 • Built with React & Gemini
        </div>

      </div>
    </div>
  );
};

export default SettingsView;