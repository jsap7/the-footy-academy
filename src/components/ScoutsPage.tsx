import { fireScout, hireScout } from '../game/gameActions';
import type { GameState } from '../types';
import SectionHead from '../ui/SectionHead';
import ScoutListItem from './ScoutListItem';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
};

export default function ScoutsPage({ state, onChange }: Props) {
  const handleHire = (scoutId: string) => onChange(hireScout(state, scoutId));
  const handleFire = (scoutId: string) => onChange(fireScout(state, scoutId));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SectionHead label="hired scouts" count={state.scouts.length} />
      {state.scouts.length === 0 ? (
        <p className="px-6 py-6 text-[16px] text-ink-dim">
          no scouts hired. browse the market below.
        </p>
      ) : (
        state.scouts.map((scout) => (
          <ScoutListItem key={scout.id} scout={scout} action="fire" onAction={handleFire} />
        ))
      )}

      <SectionHead
        label="scout market"
        count={state.scoutMarket.length}
        right={
          <span className="text-[10px] tracking-[0.14em] text-ink-faint">
            refreshes monthly · first salary due at month-end
          </span>
        }
      />
      {state.scoutMarket.length === 0 ? (
        <p className="px-6 py-6 text-[16px] text-ink-dim">
          market empty. wait for next month&apos;s refresh.
        </p>
      ) : (
        state.scoutMarket.map((scout) => {
          const cantAfford = state.cash < scout.monthlySalary;
          return (
            <ScoutListItem
              key={scout.id}
              scout={scout}
              action="hire"
              disabled={cantAfford}
              onAction={handleHire}
            />
          );
        })
      )}
    </div>
  );
}
