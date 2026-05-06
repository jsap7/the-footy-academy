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

const DOTTED_TRACK =
  'repeating-linear-gradient(to right, var(--color-ink-faint) 0 2px, transparent 2px 4px)';

const COLS =
  'grid-cols-[24px_minmax(0,1.6fr)_28px_56px_44px_minmax(0,1.3fr)_36px_64px]';

function PotBar({ current, potential }: { current: number; potential: number }) {
  const maxed = current >= potential;
  return (
    <div className="relative h-[8px] w-full" style={{ backgroundImage: DOTTED_TRACK }} aria-hidden>
      <div
        className={`absolute inset-y-0 left-0 ${maxed ? 'bg-good' : 'bg-accent'}`}
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
    <div className="overflow-y-auto">
      <div
        className={`grid ${COLS} items-center gap-3 border-b border-hairline px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-ink-dim`}
      >
        <span />
        <span>name</span>
        <span>age</span>
        <span>pos</span>
        <span>tr</span>
        <span>pot</span>
        <span className="text-right">avg</span>
        <span className="text-right">stip/mo</span>
      </div>
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
            className={`grid w-full ${COLS} items-center gap-3 border-b border-hairline px-3 py-2 text-left text-[18px] leading-none transition ${
              isSelected ? 'bg-bg-row-hi text-accent' : 'text-ink hover:bg-bg-row'
            }`}
          >
            <span aria-hidden className="text-accent">
              {isSelected ? '>' : ' '}
            </span>
            <span className="truncate">
              {player.firstName} {player.lastName}
            </span>
            <span className="tabular-nums text-ink-mid">{player.age}</span>
            <span>
              <Chip>{player.position}</Chip>
            </span>
            <span className="tabular-nums text-ink-dim">[{player.traits.length}]</span>
            <PotBar current={cur} potential={pot} />
            <span className="text-right tabular-nums">{pot}</span>
            <span className="text-right text-[14px] tabular-nums text-ink-dim">
              {formatCash(stipend)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
