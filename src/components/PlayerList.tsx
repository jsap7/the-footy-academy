import type { Player } from '../types';
import { averageCurrent, averagePotential } from '../game/playerStats';
import { calculateStipend } from '../game/stipends';
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  players: readonly Player[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
};

const COLS = 'grid-cols-[minmax(0,1.6fr)_56px_72px_64px_64px_36px_minmax(0,1fr)_minmax(0,1fr)]';

const DOTTED_TRACK =
  'repeating-linear-gradient(to right, var(--color-ink-faint) 0 2px, transparent 2px 4px)';

function PotBar({ current, potential }: { current: number; potential: number }) {
  const maxed = current >= potential;
  return (
    <div
      className="relative h-[6px] w-full rounded-[2px] overflow-hidden"
      style={{ backgroundImage: DOTTED_TRACK }}
      aria-hidden
    >
      <div
        className={`absolute inset-y-0 left-0 ${maxed ? 'bg-accent-bright' : 'bg-accent'}`}
        style={{ width: `${current}%` }}
      />
      <div
        className="absolute -top-[2px] -bottom-[2px] w-[2px] bg-ink-mid"
        style={{ left: `calc(${potential}% - 1px)` }}
      />
    </div>
  );
}

export default function PlayerList({ players, selectedPlayerId, onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-bg-elev">
      <div
        className={`grid ${COLS} items-center gap-5 border-b border-hairline px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
      >
        <span>player</span>
        <span>age</span>
        <span>position</span>
        <span className="text-right">cur</span>
        <span className="text-right">pot</span>
        <span className="text-right">tr</span>
        <span>development</span>
        <span className="text-right">stipend / mo</span>
      </div>
      <div className="divide-y divide-hairline">
        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          const cur = averageCurrent(player);
          const pot = averagePotential(player);
          const stipend = calculateStipend(player);
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player.id)}
              className={`grid w-full ${COLS} items-center gap-5 px-6 py-4 text-left text-[13px] leading-none transition-colors duration-150 ${
                isSelected ? 'bg-bg-row-hi text-ink' : 'text-ink hover:bg-bg-elev-2'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-accent' : 'bg-transparent'}`}
                />
                <span className="truncate">
                  {player.firstName} {player.lastName}
                </span>
                {player.askingPrice != null ? (
                  <Chip tone="accent">listed</Chip>
                ) : player.availableForSale ? (
                  <Chip tone="muted">available</Chip>
                ) : null}
              </span>
              <span className="tabular-nums text-ink-mid">{player.age}</span>
              <span>
                <Chip tone="muted">{player.position}</Chip>
              </span>
              <span className="text-right tabular-nums text-ink">{cur}</span>
              <span className="text-right tabular-nums text-ink-mid">{pot}</span>
              <span className="text-right tabular-nums text-ink-dim">{player.traits.length}</span>
              <PotBar current={cur} potential={pot} />
              <span className="text-right tabular-nums text-ink-mid">{formatCash(stipend)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
