import { STAT_GROUPS, STAT_GROUP_LABELS, STAT_LABELS, type Player, type StatGroup } from '../types';
import { averageCurrent, averagePotential } from '../game/playerStats';
import StatRow from './StatRow';
import TraitList from './TraitList';

type Props = {
  player: Player;
  onClose: () => void;
};

const GROUP_ORDER: readonly StatGroup[] = ['physical', 'technical', 'mental'];

export default function PlayerDetail({ player, onClose }: Props) {
  const avgCur = averageCurrent(player);
  const avgPot = averagePotential(player);
  const gap = avgPot - avgCur;

  return (
    <div className="flex h-full flex-col bg-neutral-950">
      <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-50">
            {player.firstName} {player.lastName}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            <span className="font-mono uppercase">{player.position}</span>
            <span className="mx-1.5 text-neutral-700">·</span>
            <span className="tabular-nums">age {player.age}</span>
            <span className="mx-1.5 text-neutral-700">·</span>
            <span>{player.nationality}</span>
          </p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-neutral-600">
            [debug: {player.qualityTier}]
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail"
          className="rounded border border-transparent px-2 py-1 text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-100"
        >
          Close
        </button>
      </header>

      <div className="grid grid-cols-3 border-b border-neutral-800 px-5 py-3 text-xs">
        <Summary label="Avg Current" value={avgCur} tone="bright" />
        <Summary label="Avg Potential" value={avgPot} tone="dim" />
        <Summary label="Gap" value={gap} tone="dim" />
      </div>

      <section className="border-b border-neutral-800 px-5 py-3">
        <h3 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Traits
        </h3>
        <TraitList traits={player.traits} />
      </section>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {GROUP_ORDER.map((group) => (
          <section key={group} className="border-b border-neutral-900 py-3 last:border-b-0">
            <h3 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {STAT_GROUP_LABELS[group]}
            </h3>
            <div className="space-y-0.5">
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

function Summary({ label, value, tone }: { label: string; value: number; tone: 'bright' | 'dim' }) {
  return (
    <div>
      <div className="text-[0.65rem] uppercase tracking-wider text-neutral-500">{label}</div>
      <div
        className={`mt-1 font-mono text-lg tabular-nums ${
          tone === 'bright' ? 'text-neutral-50' : 'text-neutral-400'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
