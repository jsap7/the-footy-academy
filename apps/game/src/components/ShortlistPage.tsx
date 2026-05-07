import { rejectShortlistEntry, signPlayer } from '../game/gameActions';
import type { GameState } from '../types';
import ShortlistItem from './ShortlistItem';

type Props = {
  state: GameState;
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
  onChange: (next: GameState) => void;
};

const HEADER_COLS =
  'grid-cols-[minmax(0,1.4fr)_56px_72px_60px_36px_minmax(0,1fr)_72px_120px_160px]';

export default function ShortlistPage({ state, selectedPlayerId, onSelect, onChange }: Props) {
  const handleSign = (entryId: string) => onChange(signPlayer(state, entryId));
  const handleReject = (entryId: string) => onChange(rejectShortlistEntry(state, entryId));

  if (state.shortlist.length === 0) {
    const noScouts = state.scouts.length === 0;
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-12 py-24 text-center">
        <p className="text-[20px] uppercase tracking-[0.06em] text-ink">no prospects yet</p>
        <p className="mt-3 max-w-md text-[13px] text-ink-mid font-body">
          {noScouts
            ? "you haven't hired any scouts. head to the scouts tab to start surfacing players."
            : 'your scouts will surface candidates on the next month-end. press n to advance.'}
        </p>
      </div>
    );
  }

  // Index hired scouts for "found by" lookup. If a scout was fired between
  // surfacing the find and now, fall back to a generic label.
  const scoutById = new Map(state.scouts.map((s) => [s.id, s]));

  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-bg-elev">
      <div
        className={`grid ${HEADER_COLS} items-center gap-5 border-b border-hairline px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
      >
        <span>player</span>
        <span>age</span>
        <span>position</span>
        <span className="text-right">pot</span>
        <span className="text-right">tr</span>
        <span>found by</span>
        <span className="text-right">expires</span>
        <span className="text-right">fee</span>
        <span className="text-right">action</span>
      </div>
      <div className="divide-y divide-hairline">
        {state.shortlist.map((entry) => {
          const scout = scoutById.get(entry.foundByScoutId);
          const scoutName = scout ? `${scout.firstName} ${scout.lastName}` : 'a former scout';
          return (
            <ShortlistItem
              key={entry.id}
              entry={entry}
              scoutName={scoutName}
              cash={state.cash}
              selected={entry.player.id === selectedPlayerId}
              onSelect={() => onSelect(entry.player.id)}
              onSign={handleSign}
              onReject={handleReject}
            />
          );
        })}
      </div>
    </div>
  );
}
