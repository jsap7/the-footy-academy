import { fireScout, hireScout } from '../game/gameActions';
import type { GameState } from '../types';
import Card from '../ui/Card';
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
    <div className="space-y-10">
      <section className="space-y-4">
        <SectionHead label="hired scouts" count={state.scouts.length} />
        <Card padded={false}>
          {state.scouts.length === 0 ? (
            <p className="px-6 py-8 text-center text-[13px] text-ink-dim font-body">
              no scouts hired. browse the market below.
            </p>
          ) : (
            <div className="divide-y divide-hairline">
              {state.scouts.map((scout) => (
                <ScoutListItem key={scout.id} scout={scout} action="fire" onAction={handleFire} />
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHead
          label="scout market"
          count={state.scoutMarket.length}
          right={
            <span className="text-[11px] uppercase tracking-[0.10em] text-ink-dim">
              refreshes monthly · weekly salary deducted each turn
            </span>
          }
        />
        <Card padded={false}>
          {state.scoutMarket.length === 0 ? (
            <p className="px-6 py-8 text-center text-[13px] text-ink-dim font-body">
              market empty. wait for next month&apos;s refresh.
            </p>
          ) : (
            <div className="divide-y divide-hairline">
              {state.scoutMarket.map((scout) => (
                <ScoutListItem
                  key={scout.id}
                  scout={scout}
                  action="hire"
                  disabled={state.cash < scout.monthlySalary}
                  onAction={handleHire}
                />
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
