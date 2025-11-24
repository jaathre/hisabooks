import { Category, TransactionType } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Food & Dining', color: '#ef4444' }, // Red
  { id: 'cat_2', name: 'Transportation', color: '#f59e0b' }, // Amber
  { id: 'cat_3', name: 'Shopping', color: '#3b82f6' }, // Blue
  { id: 'cat_4', name: 'Entertainment', color: '#8b5cf6' }, // Violet
  { id: 'cat_5', name: 'Bills & Utilities', color: '#64748b' }, // Slate
  { id: 'cat_6', name: 'Health', color: '#10b981' }, // Emerald
  { id: 'cat_7', name: 'Income', color: '#059669' }, // Green (Darker)
];

export const MOCK_TRANSACTIONS = [
  { id: 'tx_1', date: '2023-10-25', description: 'Grocery Run', amount: 120.50, categoryId: 'cat_1', type: TransactionType.EXPENSE },
  { id: 'tx_2', date: '2023-10-26', description: 'Uber to Work', amount: 25.00, categoryId: 'cat_2', type: TransactionType.EXPENSE },
  { id: 'tx_3', date: '2023-10-27', description: 'Salary', amount: 3000.00, categoryId: 'cat_7', type: TransactionType.INCOME },
];

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
  '#f43f5e', '#64748b'
];