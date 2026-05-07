import type { Transaction, TransactionType } from '../types';
import { formatCash, formatMonth } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  transactions: readonly Transaction[];
  limit?: number;
};

const TYPE_LABEL: Record<TransactionType, string> = {
  sale: 'sale',
  signing: 'signed',
  release: 'released',
  scout_hire: 'hired',
  scout_fire: 'fired',
  facility_upgrade: 'upgrade',
  facility_downgrade: 'downgrade',
  monthly_burn: 'burn',
  sponsorship: 'sponsor',
};

const TYPE_TONE: Record<TransactionType, 'accent' | 'muted' | 'danger' | 'neutral' | 'good'> = {
  sale: 'accent',
  signing: 'muted',
  release: 'danger',
  scout_hire: 'muted',
  scout_fire: 'danger',
  facility_upgrade: 'accent',
  facility_downgrade: 'danger',
  monthly_burn: 'neutral',
  sponsorship: 'good',
};

export default function TransactionList({ transactions, limit = 60 }: Props) {
  if (transactions.length === 0) {
    return (
      <p className="text-[12px] uppercase tracking-[0.10em] text-ink-faint">
        no transactions yet — advance a month or sign a player.
      </p>
    );
  }

  const rows = transactions.slice(0, limit);
  return (
    <div className="divide-y divide-hairline">
      {rows.map((t) => {
        const sign = t.amount > 0 ? '+' : t.amount < 0 ? '-' : '';
        const cls =
          t.amount > 0 ? 'text-accent-bright' : t.amount < 0 ? 'text-warn' : 'text-ink-mid';
        const abs = Math.abs(t.amount);
        return (
          <div
            key={t.id}
            className="grid grid-cols-[80px_72px_minmax(0,1fr)_120px] items-center gap-3 px-1 py-2 text-[12px]"
          >
            <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint tabular-nums">
              {formatMonth(t.month, t.year).toLowerCase()}
            </span>
            <Chip tone={TYPE_TONE[t.type]}>{TYPE_LABEL[t.type]}</Chip>
            <span className="truncate text-ink">{t.description}</span>
            <span className={`text-right tabular-nums ${cls}`}>
              {t.amount === 0 ? '—' : `${sign}${formatCash(abs)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
