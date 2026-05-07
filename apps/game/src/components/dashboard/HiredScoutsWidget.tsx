import { fireScout } from '../../game/gameActions';
import type { GameState, Scout } from '../../types';
import { formatCash } from '../../util/format';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onJumpTab: () => void;
};

const MAX_VISIBLE = 3;

function sortScouts(a: Scout, b: Scout): number {
  if (a.level !== b.level) return b.level - a.level;
  const aName = `${a.lastName} ${a.firstName}`;
  const bName = `${b.lastName} ${b.firstName}`;
  return aName.localeCompare(bName);
}

function StarMeter({ level }: { level: number }) {
  return (
    <span className="font-mono text-[11px] leading-none tracking-tight text-accent-bright">
      {'★'.repeat(level)}
      <span className="text-ink-faint">{'★'.repeat(5 - level)}</span>
    </span>
  );
}

export default function HiredScoutsWidget({ state, onChange, onJumpTab }: Props) {
  const sorted = [...state.scouts].sort(sortScouts);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remainder = sorted.length - visible.length;
  const empty = sorted.length === 0;

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">hired scouts</span>
        <span className="text-[10px] tabular-nums text-ink-faint">{state.scouts.length}</span>
      </div>
      {empty ? (
        <div className="flex flex-1 flex-col items-start gap-2 px-4 py-4">
          <p className="text-[12px] text-ink-dim font-body">
            no scouts hired — hire from the scouts tab.
          </p>
          <button
            type="button"
            onClick={onJumpTab}
            className="text-[10px] uppercase tracking-[0.10em] text-ink-mid hover:text-accent"
          >
            browse market →
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-hairline">
            {visible.map((scout) => (
              <div
                key={scout.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2 transition-colors hover:bg-bg-elev-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[12px] text-ink">
                    {scout.firstName} {scout.lastName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.10em]">
                    <StarMeter level={scout.level} />
                    <span className="text-ink-dim">L{scout.level}</span>
                  </div>
                </div>
                <span className="text-right text-[11px] tabular-nums text-ink-mid">
                  {formatCash(scout.monthlySalary)}/mo
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onChange(fireScout(state, scout.id))}
                >
                  fire
                </Button>
              </div>
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
