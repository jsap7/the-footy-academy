import type { BirthdayEvent, ReleaseEvent, SaleEvent } from '../types';
import { formatCash } from '../util/format';

type Props = {
  birthdays: readonly BirthdayEvent[];
  releases: readonly ReleaseEvent[];
  sales: readonly SaleEvent[];
};

export default function EventBanner({ birthdays, releases, sales }: Props) {
  if (birthdays.length === 0 && releases.length === 0 && sales.length === 0) return null;
  return (
    <div className="border-b border-hairline bg-bg-row px-6 py-3">
      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ink-dim">── this month</div>
      <ul className="space-y-1 text-[16px] text-ink">
        {sales.map((s) => (
          <li key={`s-${s.playerId}`} className="text-good">
            <span>·</span> sold {s.playerName} to {s.clubName} for{' '}
            <span className="font-mono tabular-nums">{formatCash(s.amount)}</span>
          </li>
        ))}
        {birthdays.map((b) => (
          <li key={`b-${b.playerId}`}>
            <span className="text-accent">·</span> {b.playerName} turned {b.newAge} today
          </li>
        ))}
        {releases.map((r) => (
          <li key={`r-${r.playerId}`} className="text-danger">
            <span>·</span> {r.playerName} ({r.finalAge}) has aged out and left the academy
          </li>
        ))}
      </ul>
    </div>
  );
}
