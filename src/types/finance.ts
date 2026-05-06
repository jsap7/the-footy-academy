export type TransactionType =
  | 'sale'
  | 'signing'
  | 'scout_hire'
  | 'scout_fire'
  | 'facility_upgrade'
  | 'facility_downgrade'
  | 'monthly_burn';

export type Transaction = {
  id: string;
  month: number;
  year: number;
  type: TransactionType;
  description: string;
  amount: number; // positive = income, negative = spending
};

export type CashHistoryEntry = {
  month: number;
  year: number;
  cash: number;
};
