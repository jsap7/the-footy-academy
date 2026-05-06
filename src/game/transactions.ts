import type { GameState, Transaction, TransactionType } from '../types';

const MAX_TRANSACTIONS = 24 * 8; // ~24 months × ~8 events/month worst case

export function appendTransaction(
  state: GameState,
  partial: { type: TransactionType; description: string; amount: number },
): Transaction[] {
  const tx: Transaction = {
    id: crypto.randomUUID(),
    month: state.currentMonth,
    year: state.currentYear,
    type: partial.type,
    description: partial.description,
    amount: partial.amount,
  };
  const next = [tx, ...state.transactions];
  if (next.length > MAX_TRANSACTIONS) next.length = MAX_TRANSACTIONS;
  return next;
}
