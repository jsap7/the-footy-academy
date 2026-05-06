import { STAT_GROUPS, STAT_GROUP_LABELS, STAT_LABELS, type Player, type StatGroup } from '../types';
import { averageCurrent, averagePotential } from '../game/playerStats';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import StatRow from './StatRow';
import TraitList from './TraitList';

type Props = {
  player: Player;
  onClose: () => void;
};

const GROUP_ORDER: readonly StatGroup[] = ['physical', 'technical', 'mental'];

function SummaryCell({
  label,
  value,
  tone,
  borderRight,
}: {
  label: string;
  value: number;
  tone: 'accent' | 'ink';
  borderRight?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${borderRight ? 'border-r border-hairline' : ''}`}>
      <div className="text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</div>
      <div
        className={`mt-2 text-[38px] leading-none tabular-nums ${
          tone === 'accent' ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function PlayerDetail({ player, onClose }: Props) {
  const avgCur = averageCurrent(player);
  const avgPot = averagePotential(player);
  const gap = avgPot - avgCur;

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="border-b border-hairline px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[36px] leading-none text-ink">
              {player.firstName} {player.lastName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-ink-mid">
              <Chip>{player.position}</Chip>
              <span className="text-ink-faint">·</span>
              <span className="tabular-nums">age {player.age}</span>
              <span className="text-ink-faint">·</span>
              <span className="uppercase tracking-[0.10em]">{player.nationality}</span>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              [debug: {player.qualityTier}]
            </p>
          </div>
          <Button onClick={onClose} hint="ESC" aria-label="Close detail">
            close
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-3 border-b border-hairline">
        <SummaryCell label="avg current" value={avgCur} tone="accent" borderRight />
        <SummaryCell label="avg potential" value={avgPot} tone="ink" borderRight />
        <SummaryCell label="gap" value={gap} tone="ink" />
      </div>

      <section className="border-b border-hairline px-6 py-4">
        <h3 className="mb-3 text-[10px] uppercase tracking-[0.14em] text-ink-dim">── traits</h3>
        <TraitList traits={player.traits} />
      </section>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
        {GROUP_ORDER.map((group) => (
          <section key={group} className="border-b border-hairline py-4 last:border-b-0">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.14em] text-ink-dim">
              ── {STAT_GROUP_LABELS[group].toLowerCase()}
            </h3>
            <div>
              {STAT_GROUPS[group].map((key) => (
                <StatRow
                  key={key}
                  label={STAT_LABELS[key]}
                  current={player.stats.current[key]}
                  potential={player.stats.potential[key]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
