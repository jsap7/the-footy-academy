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
};

export default function ShortlistItem({
  entry,
  scoutName,
  cash,
  selected,
  onSelect,
  onSign,
}: Props) {
  const player = entry.player;
  const cantAfford = cash < entry.signingFee;
  const expiresUrgent = entry.monthsRemaining <= 1;

  return (
    <div
      className={`flex items-stretch border-b border-hairline ${
        selected ? 'bg-bg-row-hi text-accent' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(entry.id)}
        className="flex flex-1 flex-col gap-1 px-3 py-3 text-left hover:text-accent"
      >
        <div className="flex items-center gap-3 text-[18px]">
          <span aria-hidden className="w-3 text-accent">
            {selected ? '>' : ' '}
          </span>
          <span className="truncate">
            {player.firstName} {player.lastName}
          </span>
          <span className="tabular-nums text-ink-mid">{player.age}</span>
          <Chip>{player.position}</Chip>
          <span className="tabular-nums text-ink-dim">[{player.traits.length}]</span>
        </div>
        <div className="flex items-center gap-3 pl-6 text-[14px] text-ink-dim">
          <span className="truncate">found by {scoutName}</span>
          <span className="text-ink-faint">·</span>
          <span className="tabular-nums">avg pot {averagePotential(player)}</span>
          <span className="text-ink-faint">·</span>
          <span className={`tabular-nums ${expiresUrgent ? 'text-danger' : ''}`}>
            {entry.monthsRemaining}mo left
          </span>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-3 px-4">
        <span className="tabular-nums text-ink">{formatCash(entry.signingFee)}</span>
        <Button
          variant="primary"
          disabled={cantAfford}
          onClick={() => onSign(entry.id)}
          className={cantAfford ? 'cursor-not-allowed opacity-40' : ''}
        >
          sign
        </Button>
      </div>
    </div>
  );
}
