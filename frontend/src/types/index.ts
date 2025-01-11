export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  description?: string;
  categoryId: string;
  paymentMethod: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
}

export interface Budget {
  id: string;
  amount: number;
  startDate: string;
  endDate: string;
  categoryId: string;
  category: Category;
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByMonth: Record<string, number>;
}
