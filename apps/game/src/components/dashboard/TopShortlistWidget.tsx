import { rejectShortlistEntry, signPlayer } from '../../game/gameActions';
import { averagePotential } from '../../game/playerStats';
import type { GameState, ShortlistEntry } from '../../types';
import { formatCash } from '../../util/format';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Chip from '../../ui/Chip';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onJumpTab: () => void;
  onJumpScouts: () => void;
};

const MAX_VISIBLE = 3;

function sortKey(a: ShortlistEntry, b: ShortlistEntry): number {
  const ap = averagePotential(a.player);
  const bp = averagePotential(b.player);
  if (ap !== bp) return bp - ap;
  if (a.monthsRemaining !== b.monthsRemaining) return a.monthsRemaining - b.monthsRemaining;
  // Final tie-breaker: alphabetical for determinism.
  const aName = `${a.player.lastName} ${a.player.firstName}`;
  const bName = `${b.player.lastName} ${b.player.firstName}`;
  return aName.localeCompare(bName);
}

function Row({
  entry,
  cash,
  onSign,
  onReject,
}: {
  entry: ShortlistEntry;
  cash: number;
  onSign: () => void;
  onReject: () => void;
}) {
  const cantAfford = cash < entry.signingFee;
  const expiresUrgent = entry.monthsRemaining <= 1;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2 transition-colors hover:bg-bg-elev-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[12px] text-ink truncate">
          <span className="truncate">
            {entry.player.firstName} {entry.player.lastName}
          </span>
          <Chip tone="muted">{entry.player.position}</Chip>
          <span className="text-[10px] text-ink-dim tabular-nums">{entry.player.age}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[10px] uppercase tracking-[0.10em] text-ink-dim">
          <span>
            pot <span className="text-ink tabular-nums">{averagePotential(entry.player)}</span>
          </span>
          <span>
            tr <span className="text-ink tabular-nums">{entry.player.traits.length}</span>
          </span>
          <span className={expiresUrgent ? 'text-warn' : ''}>
            <span className="tabular-nums">{entry.monthsRemaining}</span>mo
          </span>
        </div>
      </div>
      <span className="text-right text-[11px] tabular-nums text-ink">
        {formatCash(entry.signingFee)}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onReject}>
          rej
        </Button>
        <Button variant="primary" size="sm" disabled={cantAfford} onClick={onSign}>
          sign
        </Button>
      </div>
    </div>
  );
}

export default function TopShortlistWidget({ state, onChange, onJumpTab, onJumpScouts }: Props) {
  const sorted = [...state.shortlist].sort(sortKey);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remainder = sorted.length - visible.length;
  const empty = sorted.length === 0;

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">top shortlist</span>
        <span className="text-[10px] tabular-nums text-ink-faint">{state.shortlist.length}</span>
      </div>
      {empty ? (
        <div className="flex flex-1 flex-col items-start gap-2 px-4 py-4">
          <p className="text-[12px] text-ink-dim font-body">
            no prospects yet — hire scouts to find players.
          </p>
          <button
            type="button"
            onClick={onJumpScouts}
            className="text-[10px] uppercase tracking-[0.10em] text-ink-mid hover:text-accent"
          >
            browse scouts →
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-hairline">
            {visible.map((entry) => (
              <Row
                key={entry.id}
                entry={entry}
                cash={state.cash}
                onSign={() => onChange(signPlayer(state, entry.id))}
                onReject={() => onChange(rejectShortlistEntry(state, entry.id))}
              />
            ))}
          </div>
          {remainder > 0 ? (
            <button
              type="button"
              onClick={onJumpTab}
              className="border-t border-hairline px-4 py-2 text-left text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
            >
              +{remainder} more →
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}
