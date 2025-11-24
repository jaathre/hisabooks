import React, { useState } from 'react';
import { Category, Tag, Transaction } from '../types';
import { COLORS } from '../constants';
import { Plus, X, Trash2, Hash, Layers, Activity, ArrowLeft } from 'lucide-react';
import TransactionList from './TransactionList';

interface OrganizeViewProps {
  categories: Category[];
  tags: Tag[];
  transactions: Transaction[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
}

type Tab = 'CATEGORIES' | 'HASHTAGS';

const OrganizeView: React.FC<OrganizeViewProps> = ({ 
  categories, tags, transactions,
  onAddCategory, onDeleteCategory,
  onAddTag, onDeleteTag,
  onEditTransaction, onDeleteTransaction,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  
  // Input States
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState(COLORS[0]);

  const resetForm = () => {
    setNewItemName('');
    setNewItemColor(COLORS[0]);
    setIsAdding(false);
  };

  const handleAdd = () => {
    if (!newItemName.trim()) return;

    if (activeTab === 'CATEGORIES') {
      onAddCategory({
        id: `cat_${Date.now()}`,
        name: newItemName,
        color: newItemColor
      });
    } else if (activeTab === 'HASHTAGS') {
      onAddTag({
        id: `tag_${Date.now()}`,
        name: newItemName.startsWith('#') ? newItemName : `#${newItemName}`
      });
    }
    resetForm();
  };

  const getTransactionCountForCategory = (catId: string) => {
    return transactions.filter(t => t.categoryId === catId).length;
  };

  const getTransactionCountForTag = (tagName: string) => {
    return transactions.filter(t => t.description.toLowerCase().includes(tagName.toLowerCase())).length;
  };

  // If a category is selected, show its transaction list
  if (selectedCategory) {
    const categoryTransactions = transactions.filter(t => t.categoryId === selectedCategory.id);
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 shadow-sm bg-white z-10">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full" style={{backgroundColor: selectedCategory.color}}></div>
             <h2 className="text-lg font-bold text-gray-800">{selectedCategory.name}</h2>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TransactionList 
            transactions={categoryTransactions} 
            categories={categories}
            onDelete={onDeleteTransaction}
            onEdit={onEditTransaction}
            currency={currency}
            showFilters={false} 
          />
        </div>
      </div>
    );
  }

  // If a tag is selected, show its transaction list
  if (selectedTag) {
    const tagTransactions = transactions.filter(t => t.description.toLowerCase().includes(selectedTag.name.toLowerCase()));
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 shadow-sm bg-white z-10">
          <button 
            onClick={() => setSelectedTag(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Hash size={16} />
             </div>
             <h2 className="text-lg font-bold text-gray-800">{selectedTag.name}</h2>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TransactionList 
            transactions={tagTransactions} 
            categories={categories}
            onDelete={onDeleteTransaction}
            onEdit={onEditTransaction}
            currency={currency}
            showFilters={false} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
        {/* Top Header & Toggles */}
        <div className="bg-white p-4 shadow-sm border-b border-gray-100 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Organise</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => { setActiveTab('CATEGORIES'); setIsAdding(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'CATEGORIES' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <Layers size={14}/> Categories
                </button>
                <button 
                    onClick={() => { setActiveTab('HASHTAGS'); setIsAdding(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'HASHTAGS' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Hash size={14} /> Hashtags
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
            
            {/* Add Button Row */}
            {!isAdding && activeTab !== 'HASHTAGS' && (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-semibold flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            )}

             {/* Special Header for Hashtags */}
            {activeTab === 'HASHTAGS' && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mb-4">
                     <Activity className="text-blue-500 shrink-0 mt-0.5" size={18}/>
                     <div>
                         <p className="text-sm text-blue-800 font-medium">Automatic Collection</p>
                         <p className="text-xs text-blue-600 mt-1">Hashtags are automatically collected from descriptions (e.g. "Lunch #work").</p>
                     </div>
                </div>
            )}

            {/* Add Item Form */}
            {isAdding && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/20 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-700 text-sm">
                            New {activeTab === 'CATEGORIES' ? 'Category' : 'Hashtag'}
                        </h3>
                        <button onClick={resetForm}><X size={16} className="text-gray-400" /></button>
                    </div>

                    <input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 mb-3"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        autoFocus
                    />

                    {activeTab === 'CATEGORIES' && (
                        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setNewItemColor(c)}
                                    className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform ${newItemColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                    style={{backgroundColor: c}}
                                />
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={handleAdd}
                        className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-sm active:bg-slate-800"
                    >
                        Save
                    </button>
                </div>
            )}

            {/* LISTS */}
            
            {/* Feature Rich Categories List */}
            {activeTab === 'CATEGORIES' && (
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => {
                        const count = getTransactionCountForCategory(cat.id);
                        return (
                            <div 
                                key={cat.id} 
                                onClick={() => setSelectedCategory(cat)}
                                className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between group relative h-28 hover:shadow-md transition-shadow cursor-pointer active:scale-95"
                            >
                                <div className="flex justify-between items-start">
                                     <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{backgroundColor: cat.color}}>
                                        {cat.name.charAt(0)}
                                     </div>
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteCategory(cat.id);
                                        }}
                                        className="text-gray-300 hover:text-red-500 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800 truncate">{cat.name}</div>
                                    <div className="text-xs text-gray-400">{count} Transactions</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Hashtags List */}
            {activeTab === 'HASHTAGS' && (
                <div className="flex flex-col gap-2">
                    {[...tags]
                        .sort((a, b) => getTransactionCountForTag(b.name) - getTransactionCountForTag(a.name))
                        .map(tag => {
                            const count = getTransactionCountForTag(tag.name);
                            return (
                                <button 
                                    key={tag.id} 
                                    onClick={() => setSelectedTag(tag)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-gray-50 active:scale-[0.99] transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                                            <Hash size={16} />
                                        </div>
                                        <span className="font-medium text-gray-700">{tag.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{count}</span>
                                    </div>
                                </button>
                            );
                        })
                    }
                    {tags.length === 0 && !isAdding && (
                         <div className="w-full text-center text-gray-400 py-10 text-sm">No hashtags collected yet.</div>
                    )}
                </div>
            )}

        </div>
    </div>
  );
};

export default OrganizeView;