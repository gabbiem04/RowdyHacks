
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface Bill extends Expense {}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  apr: number;
}

export interface BudgetItem {
    category: string;
    allocated: number;
    spent: number;
}
