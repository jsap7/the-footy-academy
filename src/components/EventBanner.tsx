import {
  FACILITY_DEFINITIONS,
  type BirthdayEvent,
  type FacilityDowngradeEvent,
  type FacilityScoutFiredEvent,
  type FacilityWarningEvent,
  type ReleaseEvent,
  type SaleEvent,
} from '../types';
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  birthdays: readonly BirthdayEvent[];
  releases: readonly ReleaseEvent[];
  sales: readonly SaleEvent[];
  facilityEvents?: readonly (FacilityWarningEvent | FacilityDowngradeEvent)[];
  forcedScoutFires?: readonly FacilityScoutFiredEvent[];
};

export default function EventBanner({
  birthdays,
  releases,
  sales,
  facilityEvents = [],
  forcedScoutFires = [],
}: Props) {
  const totalEvents =
    birthdays.length +
    releases.length +
    sales.length +
    facilityEvents.length +
    forcedScoutFires.length;
  if (totalEvents === 0) return null;
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
          {facilityEvents.map((e, i) =>
            e.type === 'warning' ? (
              <span key={`fw-${i}`} className="flex items-center gap-2">
                <Chip tone="danger">warning</Chip>
                <span className="text-ink">
                  facility unaffordable — auto-downgrade next month if cash isn't restored
                </span>
              </span>
            ) : (
              <span key={`fd-${i}`} className="flex items-center gap-2">
                <Chip tone="danger">downgraded</Chip>
                <span className="text-ink">
                  facility dropped to {FACILITY_DEFINITIONS[e.toTier].name.toLowerCase()}
                </span>
                <span className="text-ink-mid">
                  ({FACILITY_DEFINITIONS[e.fromTier].name.toLowerCase()} unaffordable)
                </span>
              </span>
            ),
          )}
          {forcedScoutFires.map((f) => (
            <span key={`ff-${f.scoutId}`} className="flex items-center gap-2">
              <Chip tone="danger">fired</Chip>
              <span className="text-ink">{f.scoutName}</span>
              <span className="text-ink-mid">lvl {f.scoutLevel} — facility downgrade</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
