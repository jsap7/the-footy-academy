import { useState } from 'react';
import {
  canDowngradeFacility,
  canUpgradeFacility,
  currentFacilityMonthly,
  currentUpgradeCost,
  getCurrentFacility,
  getNextFacilityTier,
  getPrevFacilityTier,
} from '../game/facilities';
import { applyInflation } from '../game/inflation';
import { FACILITY_DEFINITIONS, type GameState } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

type Props = {
  state: GameState;
  onUpgrade: () => void;
  onDowngrade: () => void;
};

function ScoutAvailabilitySummary({
  levels,
  rareUpgrade,
}: {
  levels: readonly (1 | 2 | 3 | 4 | 5)[];
  rareUpgrade?: 1 | 2 | 3 | 4 | 5;
}) {
  const main = levels.length > 1 ? `lvl ${levels[0]}–${levels[levels.length - 1]}` : `lvl ${levels[0]}`;
  return (
    <span>
      {main}
      {rareUpgrade ? <span className="text-ink-faint"> · rare lvl {rareUpgrade}</span> : null}
    </span>
  );
}

export default function FacilityCard({ state, onUpgrade, onDowngrade }: Props) {
  const [pending, setPending] = useState<'upgrade' | 'downgrade' | null>(null);
  const current = getCurrentFacility(state);
  const nextTier = getNextFacilityTier(state.facilityTier);
  const next = nextTier != null ? FACILITY_DEFINITIONS[nextTier] : null;
  const prevTier = getPrevFacilityTier(state.facilityTier);
  const prev = prevTier != null ? FACILITY_DEFINITIONS[prevTier] : null;
  const upgradeGate = canUpgradeFacility(state);
  const downgradeGate = canDowngradeFacility(state);

  const confirmUpgrade = () => {
    if (!upgradeGate.ok) return;
    onUpgrade();
    setPending(null);
  };
  const confirmDowngrade = () => {
    if (!downgradeGate.ok) return;
    onDowngrade();
    setPending(null);
  };

  return (
    <Card className="col-span-12 md:col-span-12 flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">facility</span>
        <Chip tone="muted">tier {current.tier}/5</Chip>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-[28px] leading-none text-ink">{current.name.toLowerCase()}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-hairline pt-4 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">monthly</div>
          <div className="mt-1 tabular-nums text-ink">
            {formatCash(currentFacilityMonthly(state))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">development</div>
          <div className="mt-1 tabular-nums text-ink">×{current.developmentMultiplier.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">scouts</div>
          <div className="mt-1 text-ink">
            <ScoutAvailabilitySummary
              levels={current.scoutLevelsAvailable.levels}
              rareUpgrade={current.scoutLevelsAvailable.rareUpgrade}
            />
          </div>
        </div>
      </div>

      {next && nextTier != null ? (
        <div className="rounded-md border border-hairline-bright bg-bg-elev-2 p-4 text-[12px]">
          {pending === 'upgrade' ? (
            <div className="flex flex-col gap-3">
              <p className="text-ink">
                upgrade to <span className="text-accent-bright">{next.name.toLowerCase()}</span> for{' '}
                <span className="tabular-nums text-accent-bright">
                  {formatCash(currentUpgradeCost(state, nextTier))}
                </span>
                ?
              </p>
              <p className="text-[11px] text-ink-dim font-body">
                monthly cost goes from {formatCash(currentFacilityMonthly(state))} →{' '}
                {formatCash(applyInflation(next.monthlyCost, state.currentYear))}. development ×
                {current.developmentMultiplier.toFixed(2)} → ×
                {next.developmentMultiplier.toFixed(2)}.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={confirmUpgrade}>
                  confirm upgrade
                </Button>
                <Button variant="ghost" onClick={() => setPending(null)}>
                  cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.10em] text-ink-dim">
                  <span>next tier</span>
                  <span className="text-ink-faint">·</span>
                  <span>tier {next.tier}/5</span>
                </div>
                <div className="mt-1 text-ink">{next.name.toLowerCase()}</div>
                <div className="mt-1 text-[11px] text-ink-dim font-body">
                  {formatCash(currentUpgradeCost(state, nextTier))} now ·{' '}
                  {formatCash(applyInflation(next.monthlyCost, state.currentYear))}/mo · dev ×
                  {next.developmentMultiplier.toFixed(2)}
                </div>
              </div>
              <Button
                variant="primary"
                disabled={!upgradeGate.ok}
                onClick={() => setPending('upgrade')}
              >
                upgrade
              </Button>
            </div>
          )}
          {!upgradeGate.ok && pending !== 'upgrade' ? (
            <p className="mt-2 text-[10px] uppercase tracking-[0.10em] text-warn">
              {upgradeGate.reason}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-[11px] text-ink-dim font-body">at the top tier — no further upgrades.</p>
      )}

      {prev ? (
        <div className="flex items-center justify-between border-t border-hairline pt-4 text-[11px]">
          {pending === 'downgrade' ? (
            <div className="flex w-full flex-col gap-3">
              <p className="text-ink">
                downgrade to <span className="text-warn">{prev.name.toLowerCase()}</span>?
              </p>
              <p className="text-[11px] text-ink-dim font-body">
                no refund. monthly cost drops from {formatCash(currentFacilityMonthly(state))} →{' '}
                {formatCash(applyInflation(prev.monthlyCost, state.currentYear))}.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="danger" onClick={confirmDowngrade}>
                  confirm downgrade
                </Button>
                <Button variant="ghost" onClick={() => setPending(null)}>
                  cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-ink-dim font-body">
                downgrade to {prev.name.toLowerCase()} (no refund)
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!downgradeGate.ok}
                onClick={() => setPending('downgrade')}
              >
                downgrade
              </Button>
            </>
          )}
          {!downgradeGate.ok && pending !== 'downgrade' ? (
            <span className="ml-3 text-[10px] uppercase tracking-[0.10em] text-warn">
              {downgradeGate.reason}
            </span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
