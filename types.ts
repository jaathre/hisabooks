export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  description: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
}

export enum AppTab {
  LOGS = 'LOGS',
  INSIGHTS = 'INSIGHTS',
  ORGANIZE = 'ORGANIZE',
  SETTINGS = 'SETTINGS'
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}