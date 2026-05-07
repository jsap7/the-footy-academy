import type { CSSProperties, ReactNode } from 'react';
import {
  ACHIEVEMENT_DEFINITIONS,
  FACILITY_DEFINITIONS,
  type AchievementId,
  type BirthdayEvent,
  type FacilityDowngradeEvent,
  type FacilityScoutFiredEvent,
  type FacilityWarningEvent,
  type ReleaseEvent,
  type SaleEvent,
} from '../types';
import type { StatMilestoneEvent } from '../game/statMilestones';
import type { NationalTeamCallupEvent, NationalTeamDropEvent } from '../game/nationalTeams';

const ACHIEVEMENT_TITLE = new Map(ACHIEVEMENT_DEFINITIONS.map((d) => [d.id, d.title]));
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  birthdays: readonly BirthdayEvent[];
  releases: readonly ReleaseEvent[];
  sales: readonly SaleEvent[];
  facilityEvents?: readonly (FacilityWarningEvent | FacilityDowngradeEvent)[];
  forcedScoutFires?: readonly FacilityScoutFiredEvent[];
  achievements?: readonly AchievementId[];
  statMilestones?: readonly StatMilestoneEvent[];
  nationalTeamCallups?: readonly NationalTeamCallupEvent[];
  nationalTeamDrops?: readonly NationalTeamDropEvent[];
  veterans?: readonly { playerId: string; playerName: string }[];
};

// Stagger config for the streaming animation. Up to MAX_STAGGERED events
// trickle in 200ms apart; everything past that lands together (delay 0) so
// a noisy turn doesn't drag on for seconds.
const STAGGER_STEP_MS = 200;
const MAX_STAGGERED = 8;

type Item = { key: string; node: ReactNode };

export default function EventBanner({
  birthdays,
  releases,
  sales,
  facilityEvents = [],
  forcedScoutFires = [],
  achievements = [],
  statMilestones = [],
  nationalTeamCallups = [],
  nationalTeamDrops = [],
  veterans = [],
}: Props) {
  const items: Item[] = [];

  for (const s of sales) {
    items.push({
      key: `s-${s.playerId}`,
      node: (
        <>
          <Chip tone="accent">sold</Chip>
          <span className="text-ink">{s.playerName}</span>
          <span className="text-ink-mid">→ {s.clubName}</span>
          <span className="tabular-nums text-accent-bright">{formatCash(s.amount)}</span>
        </>
      ),
    });
  }
  for (const b of birthdays) {
    items.push({
      key: `b-${b.playerId}`,
      node: (
        <>
          <Chip tone="muted">birthday</Chip>
          <span className="text-ink">
            {b.playerName} <span className="text-ink-mid">→ {b.newAge}</span>
          </span>
        </>
      ),
    });
  }
  for (const r of releases) {
    items.push({
      key: `r-${r.playerId}`,
      node: (
        <>
          <Chip tone="danger">released</Chip>
          <span className="text-ink">{r.playerName}</span>
          <span className="text-ink-mid">
            {r.finalAge >= 22 ? 'aged out' : 'released'} at {r.finalAge}
          </span>
        </>
      ),
    });
  }
  facilityEvents.forEach((e, i) => {
    if (e.type === 'warning') {
      items.push({
        key: `fw-${i}`,
        node: (
          <>
            <Chip tone="danger">warning</Chip>
            <span className="text-ink">
              facility unaffordable — auto-downgrade next month if cash isn&apos;t restored
            </span>
          </>
        ),
      });
    } else {
      items.push({
        key: `fd-${i}`,
        node: (
          <>
            <Chip tone="danger">downgraded</Chip>
            <span className="text-ink">
              facility dropped to {FACILITY_DEFINITIONS[e.toTier].name.toLowerCase()}
            </span>
            <span className="text-ink-mid">
              ({FACILITY_DEFINITIONS[e.fromTier].name.toLowerCase()} unaffordable)
            </span>
          </>
        ),
      });
    }
  });
  for (const f of forcedScoutFires) {
    items.push({
      key: `ff-${f.scoutId}`,
      node: (
        <>
          <Chip tone="danger">fired</Chip>
          <span className="text-ink">{f.scoutName}</span>
          <span className="text-ink-mid">lvl {f.scoutLevel} — facility downgrade</span>
        </>
      ),
    });
  }
  for (const id of achievements) {
    items.push({
      key: `a-${id}`,
      node: (
        <>
          <Chip tone="accent">★ unlocked</Chip>
          <span className="text-ink">{ACHIEVEMENT_TITLE.get(id) ?? id}</span>
        </>
      ),
    });
  }
  for (const m of statMilestones) {
    const top = m.thresholds.reduce((mx, t) => (t.threshold > mx ? t.threshold : mx), 0);
    const tone = top >= 90 ? 'accent' : 'muted';
    const summary = m.thresholds.map((t) => t.statLabel).join(', ');
    items.push({
      key: `m-${m.playerId}`,
      node: (
        <>
          <Chip tone={tone}>milestone {top}</Chip>
          <span className="text-ink">{m.playerName}</span>
          <span className="text-ink-mid">→ {summary}</span>
        </>
      ),
    });
  }
  for (const c of nationalTeamCallups) {
    const tone = c.toTier === 'senior' || c.toTier === 'U21' ? 'good' : 'accent';
    const verb = c.fromTier ? 'promoted to' : 'called up to';
    const chipLabel = c.toTier === 'senior' ? 'ENGLAND SENIOR SQUAD' : `england ${c.toTier}`;
    items.push({
      key: `ntc-${c.playerId}`,
      node: (
        <>
          <Chip tone={tone}>{chipLabel}</Chip>
          <span className="text-ink">
            {c.playerName}
            <span className="ml-1 text-ink-mid tabular-nums">({c.playerOvr} OVR)</span>
          </span>
          <span className="text-ink-mid">{verb} squad</span>
          {c.mvBonusPct > 0 ? (
            <span className="tabular-nums text-accent-bright">— MV +{c.mvBonusPct}%</span>
          ) : null}
        </>
      ),
    });
  }
  for (const d of nationalTeamDrops) {
    items.push({
      key: `ntd-${d.playerId}`,
      node: (
        <>
          <Chip tone="danger">dropped</Chip>
          <span className="text-ink">{d.playerName}</span>
          <span className="text-ink-mid">
            {d.toTier ? `↓ england ${d.toTier}` : `out of england ${d.fromTier} squad`}
          </span>
        </>
      ),
    });
  }
  for (const v of veterans) {
    items.push({
      key: `vet-${v.playerId}`,
      node: (
        <>
          <Chip tone="accent">veteran</Chip>
          <span className="text-ink">{v.playerName}</span>
          <span className="text-ink-mid">96 weeks — dev +10%, mv +15%</span>
        </>
      ),
    });
  }

  if (items.length === 0) return null;
  // Single event needs no streaming — feels weirder than a hard cut.
  const useStagger = items.length > 1;

  return (
    <div className="border-b border-hairline bg-bg-elev">
      <div className="mx-auto w-full max-w-[1280px] px-12 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">last week</span>
          {items.map((item, idx) => {
            const stagger =
              useStagger && idx < MAX_STAGGERED ? `${idx * STAGGER_STEP_MS}ms` : '0ms';
            const style = { ['--stagger' as string]: stagger } as CSSProperties;
            return (
              <span
                key={item.key}
                className="flex items-center gap-2 animate-banner-event"
                style={style}
              >
                {item.node}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
