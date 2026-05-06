import type { BirthdayEvent, ReleaseEvent, SaleEvent } from '../types';
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  birthdays: readonly BirthdayEvent[];
  releases: readonly ReleaseEvent[];
  sales: readonly SaleEvent[];
};

export default function EventBanner({ birthdays, releases, sales }: Props) {
  if (birthdays.length === 0 && releases.length === 0 && sales.length === 0) return null;
  return (
    <div className="border-b border-hairline bg-bg-elev">
      <div className="mx-auto w-full max-w-[1280px] px-12 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">last month</span>
          {sales.map((s) => (
            <span key={`s-${s.playerId}`} className="flex items-center gap-2">
              <Chip tone="accent">sold</Chip>
              <span className="text-ink">{s.playerName}</span>
              <span className="text-ink-mid">→ {s.clubName}</span>
              <span className="tabular-nums text-accent-bright">{formatCash(s.amount)}</span>
            </span>
          ))}
          {birthdays.map((b) => (
            <span key={`b-${b.playerId}`} className="flex items-center gap-2">
              <Chip tone="muted">birthday</Chip>
              <span className="text-ink">
                {b.playerName} <span className="text-ink-mid">→ {b.newAge}</span>
              </span>
            </span>
          ))}
          {releases.map((r) => (
            <span key={`r-${r.playerId}`} className="flex items-center gap-2">
              <Chip tone="danger">released</Chip>
              <span className="text-ink">{r.playerName}</span>
              <span className="text-ink-mid">aged out at {r.finalAge}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
