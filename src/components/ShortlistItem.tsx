import { averagePotential } from '../game/playerStats';
import type { ShortlistEntry } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';
import Chip from '../ui/Chip';

type Props = {
  entry: ShortlistEntry;
  scoutName: string;
  cash: number;
  selected: boolean;
  onSelect: (entryId: string) => void;
  onSign: (entryId: string) => void;
  onReject: (entryId: string) => void;
};

const COLS = 'grid-cols-[minmax(0,1.4fr)_56px_72px_60px_36px_minmax(0,1fr)_72px_120px_160px]';

export default function ShortlistItem({
  entry,
  scoutName,
  cash,
  selected,
  onSelect,
  onSign,
  onReject,
}: Props) {
  const player = entry.player;
  const cantAfford = cash < entry.signingFee;
  const expiresUrgent = entry.monthsRemaining <= 1;

  return (
    <div
      className={`grid w-full ${COLS} items-center gap-5 px-6 py-4 text-[13px] leading-none transition-colors duration-150 ${
        selected ? 'bg-bg-row-hi text-ink' : 'text-ink hover:bg-bg-elev-2'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(entry.id)}
        className="flex min-w-0 items-center gap-3 text-left hover:text-accent-bright"
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-accent' : 'bg-transparent'}`}
        />
        <span className="truncate">
          {player.firstName} {player.lastName}
        </span>
      </button>
      <span className="tabular-nums text-ink-mid">{player.age}</span>
      <span>
        <Chip tone="muted">{player.position}</Chip>
      </span>
      <span className="text-right tabular-nums text-ink">{averagePotential(player)}</span>
      <span className="text-right tabular-nums text-ink-dim">{player.traits.length}</span>
      <span className="truncate text-[12px] text-ink-mid">found by {scoutName}</span>
      <span className={`text-right tabular-nums ${expiresUrgent ? 'text-warn' : 'text-ink-mid'}`}>
        {entry.monthsRemaining}mo left
      </span>
      <span className="text-right tabular-nums text-ink">{formatCash(entry.signingFee)}</span>
      <span className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => onReject(entry.id)}>
          reject
        </Button>
        <Button variant="primary" disabled={cantAfford} onClick={() => onSign(entry.id)}>
          sign
        </Button>
      </span>
    </div>
  );
}
