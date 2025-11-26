import React, { useState, useEffect } from 'react';
import { Transaction, Category, AppTab, TransactionType, Tag } from './types';
import { DEFAULT_CATEGORIES, MOCK_TRANSACTIONS, COLORS } from './constants';
import { 
  loadTransactions, saveTransactions, 
  loadCategories, saveCategories, 
  loadCurrency, saveCurrency, 
  clearAllData, 
  loadTags, saveTags 
} from './services/storageService';
import TransactionList from './components/TransactionList';
import InsightsView from './components/InsightsView';
import OrganizeView from './components/OrganizeView';
import SettingsView from './components/SettingsView';
import { ArrowUpDown, PieChart, Settings, Plus, X, Check, Folders, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LOGS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currency, setCurrency] = useState('INR');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTxType, setNewTxType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newTxCat, setNewTxCat] = useState('');

  // Quick Add Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS[0]);

  // Initial Load
  useEffect(() => {
    const loadedTx = loadTransactions();
    const loadedCat = loadCategories();
    const loadedCurr = loadCurrency();
    const loadedTags = loadTags();

    setCurrency(loadedCurr);
    
    if (loadedTx.length === 0 && !localStorage.getItem('hisab_initialized')) {
        setTransactions(MOCK_TRANSACTIONS);
        localStorage.setItem('hisab_initialized', 'true');
    } else {
        setTransactions(loadedTx);
    }
    
    setCategories(loadedCat);
    setTags(loadedTags);

    if(loadedCat.length > 0) setNewTxCat(loadedCat[0].id);
  }, []);

  // Persistence
  useEffect(() => { saveTransactions(transactions); }, [transactions]);
  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveCurrency(currency); }, [currency]);
  useEffect(() => { saveTags(tags); }, [tags]);

  // Handlers
  const openModalForAdd = () => {
      resetForm();
      setEditingTransactionId(null);
      setIsModalOpen(true);
  };

  const openModalForEdit = (tx: Transaction) => {
      setNewTxDesc(tx.description);
      setNewTxAmount(tx.amount.toString());
      setNewTxDate(tx.date);
      setNewTxType(tx.type);
      setNewTxCat(tx.categoryId);
      setEditingTransactionId(tx.id);
      setIsModalOpen(true);
  };

  const handleSaveTransaction = () => {
    // Description is now mandatory
    if (!newTxDesc.trim() || !newTxAmount) {
        alert("Please enter both an amount and a description.");
        return;
    }
    
    const amountVal = parseFloat(newTxAmount);

    // Extract Tags from description
    const extractedTags = newTxDesc.match(/#[\w]+/g);
    if (extractedTags) {
        const newTagsToAdd: Tag[] = [];
        extractedTags.forEach(tagStr => {
            const exists = tags.some(t => t.name.toLowerCase() === tagStr.toLowerCase());
            if (!exists && !newTagsToAdd.some(t => t.name.toLowerCase() === tagStr.toLowerCase())) {
                newTagsToAdd.push({
                    id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: tagStr
                });
            }
        });
        if (newTagsToAdd.length > 0) {
            setTags(prev => [...prev, ...newTagsToAdd]);
        }
    }

    if (editingTransactionId) {
        // Edit Mode
        setTransactions(prev => prev.map(t => {
            if (t.id === editingTransactionId) {
                return {
                    ...t,
                    description: newTxDesc,
                    amount: amountVal,
                    date: newTxDate,
                    categoryId: newTxCat,
                    type: newTxType
                };
            }
            return t;
        }));
    } else {
        // Add Mode
        const tx: Transaction = {
            id: `tx_${Date.now()}`,
            description: newTxDesc,
            amount: amountVal,
            date: newTxDate,
            categoryId: newTxCat,
            type: newTxType
        };
        setTransactions(prev => [tx, ...prev]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTxDesc('');
    setNewTxAmount('');
    setNewTxDate(new Date().toISOString().split('T')[0]);
    setNewTxType(TransactionType.EXPENSE);
    if(categories.length > 0) setNewTxCat(categories[0].id);
    
    // Reset quick add category state
    setIsCreatingCategory(false);
    setNewCatName('');
    setNewCatColor(COLORS[0]);
  };

  const handleQuickAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `cat_${Date.now()}`;
    const newCat: Category = {
        id: newId,
        name: newCatName,
        color: newCatColor
    };
    setCategories(prev => [...prev, newCat]);
    setNewTxCat(newId); // Auto select the new category
    setIsCreatingCategory(false);
    setNewCatName('');
  };

  const handleDeleteTransaction = (id: string) => {
    if(window.confirm("Delete this transaction?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        // If we were editing this one, close modal
        if(editingTransactionId === id) {
            setIsModalOpen(false);
        }
    }
  };

  const handleAddCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddTag = (tag: Tag) => {
    setTags(prev => [...prev, tag]);
  };

  const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
  };

  const handleClearData = () => {
    clearAllData();
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setTags([]);
    localStorage.removeItem('hisab_initialized');
  };

  // Render Logic
  const renderContent = () => {
    switch (activeTab) {
        case AppTab.LOGS:
            return <TransactionList 
                transactions={transactions} 
                categories={categories} 
                onDelete={handleDeleteTransaction} 
                onEdit={openModalForEdit}
                currency={currency} 
            />;
        case AppTab.INSIGHTS:
            return <InsightsView 
                transactions={transactions} 
                categories={categories} 
                currency={currency}
                onEditTransaction={openModalForEdit}
                onDeleteTransaction={handleDeleteTransaction}
            />;
        case AppTab.ORGANIZE:
            return <OrganizeView 
                categories={categories} 
                onAddCategory={handleAddCategory} 
                onDeleteCategory={handleDeleteCategory}
                tags={tags}
                onAddTag={handleAddTag}
                onDeleteTag={handleDeleteTag}
                transactions={transactions}
                onEditTransaction={openModalForEdit}
                onDeleteTransaction={handleDeleteTransaction}
                currency={currency}
            />;
        case AppTab.SETTINGS:
            return <SettingsView 
                onClearData={handleClearData} 
                currency={currency} 
                onCurrencyChange={setCurrency} 
                transactions={transactions}
                categories={categories}
            />;
        default:
            return null;
    }
  };

  const getCurrencySymbol = (code: string) => {
     if(code === 'INR') return '₹';
     if(code === 'USD') return '$';
     if(code === 'EUR') return '€';
     if(code === 'GBP') return '£';
     if(code === 'JPY') return '¥';
     return code;
  };

  return (
    <div className="h-full flex flex-col max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative border-x border-gray-100">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="h-20 bg-white border-t border-gray-100 grid grid-cols-5 items-center shrink-0 pb-safe z-30 px-2">
        <button 
            onClick={() => setActiveTab(AppTab.LOGS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === AppTab.LOGS ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <ArrowUpDown size={24} />
            <span className="text-[10px] font-medium">Logs</span>
        </button>
        
        <button 
            onClick={() => setActiveTab(AppTab.ORGANIZE)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === AppTab.ORGANIZE ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Folders size={24} />
            <span className="text-[10px] font-medium">Organise</span>
        </button>

        {/* Center Action Button */}
        <div className="flex flex-col items-center justify-center -mt-6">
            <button 
                onClick={openModalForAdd}
                className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center active:scale-95 transition-transform"
            >
                <Plus size={28} />
            </button>
        </div>

        <button 
            onClick={() => setActiveTab(AppTab.INSIGHTS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === AppTab.INSIGHTS ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <PieChart size={24} />
            <span className="text-[10px] font-medium">Insights</span>
        </button>
        
        <button 
            onClick={() => setActiveTab(AppTab.SETTINGS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === AppTab.SETTINGS ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Settings size={24} />
            <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>

      {/* Add/Edit Transaction Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-[90%] sm:h-auto sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold">{editingTransactionId ? 'Edit Transaction' : 'New Transaction'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                                {getCurrencySymbol(currency)}
                            </span>
                            <input 
                                type="number" 
                                inputMode="decimal"
                                value={newTxAmount}
                                onChange={(e) => setNewTxAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-gray-50 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                                autoFocus={!editingTransactionId}
                            />
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                        <button 
                            onClick={() => setNewTxType(TransactionType.EXPENSE)}
                            className={`py-2 rounded-lg text-sm font-semibold transition-all ${newTxType === TransactionType.EXPENSE ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
                        >
                            Expense
                        </button>
                        <button 
                            onClick={() => setNewTxType(TransactionType.INCOME)}
                            className={`py-2 rounded-lg text-sm font-semibold transition-all ${newTxType === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description <span className="text-red-500">*</span></label>
                        <input 
                            type="text"
                            required
                            value={newTxDesc}
                            onChange={(e) => setNewTxDesc(e.target.value)}
                            placeholder="e.g. Lunch #food #work"
                            className="w-full bg-gray-50 rounded-xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none border border-transparent focus:bg-white focus:border-gray-200"
                        />
                         <p className="text-[10px] text-gray-400 mt-1 ml-1">Use #hashtags to organize automatically</p>
                    </div>

                     {/* Date */}
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                        <input 
                            type="date"
                            value={newTxDate}
                            onChange={(e) => setNewTxDate(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                        
                        {isCreatingCategory ? (
                             <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-700">New Category</span>
                                    <button onClick={() => setIsCreatingCategory(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Category Name" 
                                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar py-1">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setNewCatColor(c)}
                                            className={`w-6 h-6 rounded-full flex-shrink-0 transition-transform ${newCatColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{backgroundColor: c}}
                                        />
                                    ))}
                                </div>
                                <button 
                                    onClick={handleQuickAddCategory}
                                    className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-sm active:bg-gray-800"
                                >
                                    Add Category
                                </button>
                             </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setNewTxCat(cat.id)}
                                        className={`p-2 rounded-lg border text-xs font-medium truncate transition-all ${newTxCat === cat.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setNewCatName('');
                                        setNewCatColor(COLORS[0]);
                                        setIsCreatingCategory(true);
                                    }}
                                    className="p-2 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1 group"
                                >
                                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">New</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
                    {editingTransactionId && (
                        <button 
                            onClick={() => handleDeleteTransaction(editingTransactionId)}
                            className="px-4 py-4 bg-red-50 text-red-500 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center"
                            aria-label="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button 
                        onClick={handleSaveTransaction}
                        className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        {editingTransactionId ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;