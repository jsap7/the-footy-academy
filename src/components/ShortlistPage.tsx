import { signPlayer } from '../game/gameActions';
import type { GameState } from '../types';
import ShortlistItem from './ShortlistItem';

type Props = {
  state: GameState;
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
  onChange: (next: GameState) => void;
};

export default function ShortlistPage({ state, selectedPlayerId, onSelect, onChange }: Props) {
  const handleSign = (entryId: string) => onChange(signPlayer(state, entryId));

  if (state.shortlist.length === 0) {
    const noScouts = state.scouts.length === 0;
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center text-[16px] text-ink-dim">
        {noScouts ? (
          <>
            <p className="text-[22px] uppercase tracking-[0.04em] text-ink">
              your scouts haven&apos;t found anyone yet
            </p>
            <p className="mt-3 max-w-md">
              you don&apos;t have any scouts. hire one from the scouts tab to start surfacing
              players.
            </p>
          </>
        ) : (
          <>
            <p className="text-[22px] uppercase tracking-[0.04em] text-ink">
              your scouts haven&apos;t found anyone yet
            </p>
            <p className="mt-3 max-w-md">
              {state.scouts.length === 1 ? 'your scout will' : 'your scouts will'} surface kids on
              the next month-end.
            </p>
          </>
        )}
      </div>
    );
  }

  // Index hired scouts for "found by" lookup. If a scout was fired between
  // surfacing the find and now, fall back to a generic label.
  const scoutById = new Map(state.scouts.map((s) => [s.id, s]));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
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
          />
        );
      })}
    </div>
  );
}
