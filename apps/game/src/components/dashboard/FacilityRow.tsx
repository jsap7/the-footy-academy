import {
  canUpgradeFacility,
  currentFacilityMonthly,
  currentUpgradeCost,
  getCurrentFacility,
  getNextFacilityTier,
} from '../../game/facilities';
import type { GameState } from '../../types';
import { formatCash } from '../../util/format';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Chip from '../../ui/Chip';

type Props = {
  state: GameState;
  onUpgrade: () => void;
  onManage: () => void;
};

export default function FacilityRow({ state, onUpgrade, onManage }: Props) {
  const current = getCurrentFacility(state);
  const nextTier = getNextFacilityTier(state.facilityTier);
  const upgradeGate = canUpgradeFacility(state);
  const canUpgrade = upgradeGate.ok && nextTier != null;
  const upgradeCost = nextTier != null ? currentUpgradeCost(state, nextTier) : 0;

  return (
    <Card padded={false}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Chip tone="muted">tier {current.tier}/5</Chip>
          <span className="truncate text-[13px] text-ink">{current.name.toLowerCase()}</span>
          <span className="text-[10px] uppercase tracking-[0.10em] tabular-nums text-ink-dim">
            {formatCash(currentFacilityMonthly(state))}/mo
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canUpgrade ? (
            <Button variant="primary" size="sm" onClick={onUpgrade}>
              upgrade · {formatCash(upgradeCost)}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onManage}>
            manage
          </Button>
        </div>
      </div>
    </Card>
  );
}
