import { useEffect, useState } from 'react';
import { STAT_GROUPS, STAT_GROUP_LABELS, STAT_LABELS, type Player, type StatGroup } from '../types';
import { computeMarketValue } from '../game/marketValue';
import { averageCurrent, averagePotential } from '../game/playerStats';
import { projectMVAtAges } from '../game/projection';
import { formatCash } from '../util/format';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import MVHistoryChart from './MVHistoryChart';
import SellingControls from './SellingControls';
import StatRow from './StatRow';
import TraitList from './TraitList';

type Props = {
  player: Player | null;
  onClose: () => void;
  developmentMultiplier?: number;
  onSetAvailable?: (playerId: string, available: boolean) => void;
  onList?: (playerId: string, price: number) => void;
  onUnlist?: (playerId: string) => void;
  onSetBlockOffers?: (playerId: string, blocked: boolean) => void;
  onRelease?: (playerId: string) => void;
};

const GROUP_ORDER: readonly StatGroup[] = ['physical', 'technical', 'mental'];

const TIER_TONE: Record<Player['qualityTier'], 'muted' | 'neutral' | 'accent'> = {
  mid: 'muted',
  good: 'neutral',
  great: 'neutral',
  elite: 'accent',
  generational: 'accent',
};

function HeroNumber({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'good' | 'dim';
}) {
  const toneClass =
    tone === 'good' ? 'text-accent-bright' : tone === 'dim' ? 'text-ink-mid' : 'text-ink';
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span className={`text-[36px] tabular-nums leading-none ${toneClass}`}>{value}</span>
    </div>
  );
}

export default function PlayerDetailDrawer({
  player,
  onClose,
  developmentMultiplier = 1.0,
  onSetAvailable,
  onList,
  onUnlist,
  onSetBlockOffers,
  onRelease,
}: Props) {
  const [confirmingRelease, setConfirmingRelease] = useState(false);
  // Escape closes when the drawer is open.
  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [player, onClose]);

  // Always render so the slide animation can run; visibility driven by `open`.
  const open = player != null;

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        aria-label="Close player detail"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-bg/80 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-hidden={!open}
        aria-label={player ? `${player.firstName} ${player.lastName} detail` : undefined}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-hairline bg-bg-elev shadow-[0_0_0_1px_rgba(0,0,0,0.4),-24px_0_48px_-24px_rgba(0,0,0,0.6)] transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        {player ? (
          <>
            <header className="border-b border-hairline px-8 pt-8 pb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                    <Chip tone={TIER_TONE[player.qualityTier]}>{player.qualityTier}</Chip>
                    <span className="text-ink-faint">·</span>
                    <span>{player.position}</span>
                    <span className="text-ink-faint">·</span>
                    <span className="tabular-nums">age {player.age}</span>
                    <span className="text-ink-faint">·</span>
                    <span>{player.nationality}</span>
                  </div>
                  <h2 className="mt-3 truncate text-[28px] leading-[1.1] text-ink">
                    {player.firstName} {player.lastName}
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} hint="ESC">
                  close
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 border-b border-hairline px-8 py-6">
              <HeroNumber label="avg current" value={averageCurrent(player)} tone="good" />
              <HeroNumber label="avg potential" value={averagePotential(player)} />
              <HeroNumber
                label="gap"
                value={averagePotential(player) - averageCurrent(player)}
                tone="dim"
              />
            </div>

            <section className="border-b border-hairline px-8 py-6">
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim">traits</h3>
              <TraitList traits={player.traits} />
            </section>

            <section className="border-b border-hairline px-8 py-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                  market value
                </h3>
                <span className="text-[18px] tabular-nums text-ink">
                  {formatCash(computeMarketValue(player))}
                </span>
              </div>
              <MVHistoryChart
                history={player.mvHistory ?? []}
                currentMV={computeMarketValue(player)}
              />
              {(() => {
                const currentMV = computeMarketValue(player);
                const projections = projectMVAtAges(player, [17, 18, 19], developmentMultiplier);
                if (projections.length === 0) {
                  return (
                    <p className="mt-4 text-[11px] uppercase tracking-[0.10em] text-ink-faint">
                      no further appreciation expected
                    </p>
                  );
                }
                return (
                  <div className="mt-5 border-t border-hairline pt-4">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                        projected value
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint">
                        deterministic estimate
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {projections.map((p) => {
                        const pct = currentMV > 0 ? Math.round((p.mv / currentMV - 1) * 100) : 0;
                        const tone =
                          p.mv > currentMV
                            ? 'text-accent-bright'
                            : p.mv < currentMV
                              ? 'text-warn'
                              : 'text-ink-mid';
                        return (
                          <div
                            key={p.age}
                            className="grid grid-cols-[80px_minmax(0,1fr)_72px] items-baseline gap-3 text-[12px]"
                          >
                            <span className="uppercase tracking-[0.10em] text-ink-mid">
                              at age {p.age}
                            </span>
                            <span className="text-[11px] text-ink-faint font-body">
                              {p.monthsForward} mo forward
                            </span>
                            <span className="text-right">
                              <span className="tabular-nums text-ink">{formatCash(p.mv)}</span>
                              <span className={`ml-2 text-[10px] tabular-nums ${tone}`}>
                                {pct >= 0 ? '+' : ''}
                                {pct}%
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </section>

            {onSetAvailable && onList && onUnlist && (
              <section className="border-b border-hairline px-8 py-6">
                <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                  selling
                </h3>
                <SellingControls
                  player={player}
                  onSetAvailable={onSetAvailable}
                  onList={onList}
                  onUnlist={onUnlist}
                  onSetBlockOffers={onSetBlockOffers}
                />
              </section>
            )}

            {onRelease && (
              <section className="border-b border-hairline px-8 py-6">
                <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                  release
                </h3>
                {confirmingRelease ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-[12px] text-ink">
                      release{' '}
                      <span className="text-warn">
                        {player.firstName} {player.lastName}
                      </span>
                      ?
                    </p>
                    <p className="text-[11px] text-ink-dim font-body">
                      they leave the academy immediately. no severance, no return on signing fee.
                      any pending offers walk.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        onClick={() => {
                          onRelease(player.id);
                          setConfirmingRelease(false);
                        }}
                      >
                        confirm release
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmingRelease(false)}>
                        cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] text-ink-dim font-body">
                      drop them from the academy. no return on signing fee — useful when a kid isn't
                      drawing offers and the stipend is bleeding you.
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmingRelease(true)}>
                      release
                    </Button>
                  </div>
                )}
              </section>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10">
              {GROUP_ORDER.map((group) => (
                <section key={group} className="border-b border-hairline py-6 last:border-b-0">
                  <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                    {STAT_GROUP_LABELS[group].toLowerCase()}
                  </h3>
                  <div className="space-y-1">
                    {STAT_GROUPS[group].map((key) => (
                      <StatRow
                        key={key}
                        label={STAT_LABELS[key]}
                        current={player.stats.current[key]}
                        potential={player.stats.potential[key]}
                        gain={player.lastTurnGains?.[key]}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
