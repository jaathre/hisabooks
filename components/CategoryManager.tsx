import React, { useState } from 'react';
import { Category } from '../types';
import { COLORS } from '../constants';
import { Plus, X, Trash2 } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: newCatName,
        color: newCatColor
    };
    onAddCategory(newCat);
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col p-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-primary text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
            >
                {isAdding ? <X size={24}/> : <Plus size={24}/>}
            </button>
        </div>

        {isAdding && (
            <div className="bg-white p-4 rounded-2xl shadow-md mb-6 animate-in slide-in-from-top-4 duration-300">
                <h3 className="font-semibold mb-3">New Category</h3>
                <input 
                    type="text" 
                    placeholder="Category Name" 
                    className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 mb-4"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setNewCatColor(c)}
                            className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform ${newCatColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                            style={{backgroundColor: c}}
                        />
                    ))}
                </div>
                <button 
                    onClick={handleAdd}
                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-sm active:bg-slate-800"
                >
                    Save Category
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 gap-3 overflow-y-auto no-scrollbar pb-24">
            {categories.map(cat => (
                <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-10 rounded-full" style={{backgroundColor: cat.color}}></div>
                        <span className="font-medium text-gray-700">{cat.name}</span>
                    </div>
                    {/* Prevent deleting default income category or if it's the last one - for simplicity, just allow deleting user added ones mostly, but here allow all except safety check logic could be higher up */}
                    <button 
                        onClick={() => onDeleteCategory(cat.id)}
                        className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default CategoryManager;