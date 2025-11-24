import { Category, Transaction, Tag } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const TX_KEY = 'hisab_transactions';
const CAT_KEY = 'hisab_categories';
const TAG_KEY = 'hisab_tags';
const SETTINGS_KEY = 'hisab_settings';

export const loadTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TX_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TX_KEY, JSON.stringify(transactions));
};

export const loadCategories = (): Category[] => {
  const stored = localStorage.getItem(CAT_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CAT_KEY, JSON.stringify(categories));
};

export const loadTags = (): Tag[] => {
  const stored = localStorage.getItem(TAG_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTags = (tags: Tag[]) => {
  localStorage.setItem(TAG_KEY, JSON.stringify(tags));
};

export const loadCurrency = (): string => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.currency || 'INR';
  }
  return 'INR';
};

export const saveCurrency = (currency: string) => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const settings = stored ? JSON.parse(stored) : {};
  settings.currency = currency;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearAllData = () => {
  localStorage.removeItem(TX_KEY);
  localStorage.removeItem(CAT_KEY);
  localStorage.removeItem(TAG_KEY);
  // We intentionally do not clear settings so currency preference persists
};