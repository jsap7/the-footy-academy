import { monthlyBurn, monthlyNet, MONTHLY_BASE_INCOME } from '../game/finance';
import { averagePotential } from '../game/playerStats';
import { calculateStipend } from '../game/stipends';
import type { GameState, Offer } from '../types';
import { formatCash, formatMonth } from '../util/format';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import FacilityCard from './FacilityCard';
import MonthlyBurnCard from './MonthlyBurnCard';
import Sparkline from './Sparkline';

type Props = {
  state: GameState;
  onAdvanceMonth: () => void;
  onJumpTab: (tab: 'roster' | 'shortlist' | 'scouts' | 'offers') => void;
  onSelectPlayer: (playerId: string) => void;
  onUpgradeFacility: () => void;
  onDowngradeFacility: () => void;
};

function HeroNumber({
  label,
  value,
  tone,
  size = 'xl',
}: {
  label: string;
  value: string;
  tone?: 'good' | 'warn';
  size?: 'lg' | 'xl';
}) {
  const toneClass =
    tone === 'good' ? 'text-accent-bright' : tone === 'warn' ? 'text-warn' : 'text-ink';
  const sizeClass = size === 'xl' ? 'text-[64px]' : 'text-[40px]';
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span className={`tabular-nums leading-none ${sizeClass} ${toneClass}`}>{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'good' | 'warn' | 'dim';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-accent-bright'
      : tone === 'warn'
        ? 'text-warn'
        : tone === 'dim'
          ? 'text-ink-mid'
          : 'text-ink';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span className={`text-[22px] tabular-nums leading-none ${toneClass}`}>{value}</span>
      {hint ? <span className="text-[11px] text-ink-dim">{hint}</span> : null}
    </div>
  );
}

function pickBestPendingOffer(state: GameState): Offer | undefined {
  const pending = state.pendingOffers.filter((o) => o.status === 'pending');
  if (pending.length === 0) return undefined;
  return [...pending].sort((a, b) => b.amount - a.amount)[0];
}

export default function Dashboard({
  state,
  onAdvanceMonth,
  onJumpTab,
  onSelectPlayer,
  onUpgradeFacility,
  onDowngradeFacility,
}: Props) {
  const burn = monthlyBurn(state);
  const net = monthlyNet(state);
  const totalStipends = state.roster.reduce((s, p) => s + calculateStipend(p, state.currentYear), 0);
  const totalScoutSalary = state.scouts.reduce((s, sc) => s + sc.monthlySalary, 0);
  const avgPotAcrossRoster =
    state.roster.length > 0
      ? Math.round(state.roster.reduce((s, p) => s + averagePotential(p), 0) / state.roster.length)
      : 0;
  const actionableOffers = state.pendingOffers.filter(
    (o) => o.status === 'pending' || o.status === 'countered',
  ).length;
  const bestOffer = pickBestPendingOffer(state);
  const bestOfferPlayer = bestOffer
    ? state.roster.find((p) => p.id === bestOffer.playerId)
    : undefined;
  const bestOfferClub = bestOffer ? state.clubs.find((c) => c.id === bestOffer.clubId) : undefined;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-12 py-12">
      {/* Hero */}
      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-12 lg:col-span-8" elevated padded={false}>
          <div className="flex items-end justify-between gap-6 px-8 pt-8">
            <HeroNumber
              label="cash on hand"
              value={formatCash(state.cash)}
              tone={state.cash <= 0 ? 'warn' : undefined}
            />
            <div className="flex flex-col items-end gap-2 pb-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                {formatMonth(state.currentMonth, state.currentYear).toLowerCase()}
              </span>
              <Button variant="hero" size="lg" onClick={onAdvanceMonth} hint="N">
                next month →
              </Button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-hairline px-8 py-6">
            <Stat
              label="monthly net"
              value={formatCash(net)}
              tone={net >= 0 ? 'good' : 'warn'}
              hint={`income ${formatCash(MONTHLY_BASE_INCOME)} − burn ${formatCash(burn)}`}
            />
            <Stat
              label="stipends / mo"
              value={formatCash(totalStipends)}
              tone="dim"
              hint={`${state.roster.length} players`}
            />
            <Stat
              label="scout salaries / mo"
              value={formatCash(totalScoutSalary)}
              tone="dim"
              hint={`${state.scouts.length} scouts`}
            />
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
              cash · last 12 months
            </span>
            <span className="text-[11px] tabular-nums text-ink-dim">
              {state.cashHistory.length} {state.cashHistory.length === 1 ? 'month' : 'months'}
            </span>
          </div>
          <Sparkline values={state.cashHistory} width={320} height={88} className="w-full" />
          <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.10em] text-ink-dim">
            <span>
              start{' '}
              <span className="text-ink-mid tabular-nums">
                {formatCash(state.cashHistory[0] ?? state.cash)}
              </span>
            </span>
            <span>
              now <span className="text-ink tabular-nums">{formatCash(state.cash)}</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Summary grid */}
      <div className="mt-10 grid grid-cols-12 gap-6">
        <Card className="col-span-12 md:col-span-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">roster</span>
            <button
              type="button"
              onClick={() => onJumpTab('roster')}
              className="text-[11px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
            >
              view →
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-[40px] tabular-nums leading-none text-ink">
              {state.roster.length}
            </span>
            <span className="text-[12px] uppercase tracking-[0.10em] text-ink-dim">players</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-[12px]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">
                avg potential
              </div>
              <div className="mt-1 tabular-nums text-ink">{avgPotAcrossRoster || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">
                stipend burn
              </div>
              <div className="mt-1 tabular-nums text-ink">{formatCash(totalStipends)}</div>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 md:col-span-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">scouts</span>
            <button
              type="button"
              onClick={() => onJumpTab('scouts')}
              className="text-[11px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
            >
              view →
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-[40px] tabular-nums leading-none text-ink">
              {state.scouts.length}
            </span>
            <span className="text-[12px] uppercase tracking-[0.10em] text-ink-dim">hired</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-[12px]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">
                salaries / mo
              </div>
              <div className="mt-1 tabular-nums text-ink">{formatCash(totalScoutSalary)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">market</div>
              <div className="mt-1 tabular-nums text-ink">{state.scoutMarket.length} avail</div>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 md:col-span-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">offers</span>
            <button
              type="button"
              onClick={() => onJumpTab('offers')}
              className="text-[11px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
            >
              view →
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-[40px] tabular-nums leading-none text-ink">
              {actionableOffers}
            </span>
            <span className="text-[12px] uppercase tracking-[0.10em] text-ink-dim">
              awaiting you
            </span>
          </div>
          <div className="mt-5 border-t border-hairline pt-4">
            {bestOffer && bestOfferPlayer && bestOfferClub ? (
              <button
                type="button"
                onClick={() => onSelectPlayer(bestOfferPlayer.id)}
                className="block w-full text-left transition-colors hover:text-accent"
              >
                <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">top bid</div>
                <div className="mt-1 text-[14px]">
                  {bestOfferClub.name} ·{' '}
                  <span className="tabular-nums text-accent-bright">
                    {formatCash(bestOffer.amount)}
                  </span>
                </div>
                <div className="mt-1 truncate text-[12px] text-ink-mid">
                  for {bestOfferPlayer.firstName} {bestOfferPlayer.lastName}
                </div>
              </button>
            ) : (
              <span className="text-[12px] text-ink-dim">no pending bids.</span>
            )}
          </div>
        </Card>
      </div>

      {/* Burn breakdown + facility */}
      <div className="mt-10 grid grid-cols-12 gap-6">
        <MonthlyBurnCard state={state} />
        <div className="col-span-12 lg:col-span-8">
          <FacilityCard
            state={state}
            onUpgrade={onUpgradeFacility}
            onDowngrade={onDowngradeFacility}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">last month</span>
          <span className="text-[11px] tabular-nums text-ink-faint">
            {formatMonth(state.currentMonth, state.currentYear).toLowerCase()}
          </span>
        </div>
        <Card padded={false}>
          {state.recentSales.length + state.recentBirthdays.length + state.recentReleases.length ===
          0 ? (
            <div className="px-8 py-10 text-center text-[12px] text-ink-dim font-body">
              nothing happened last month. click next month to advance the calendar.
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {state.recentSales.map((s) => (
                <li
                  key={`s-${s.playerId}`}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Chip tone="accent">sold</Chip>
                    <span className="text-[13px] text-ink">{s.playerName}</span>
                    <span className="text-[12px] text-ink-mid">→ {s.clubName}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[14px] text-accent-bright">
                    {formatCash(s.amount)}
                  </span>
                </li>
              ))}
              {state.recentBirthdays.map((b) => (
                <li
                  key={`b-${b.playerId}`}
                  className="flex items-center gap-3 px-6 py-4 text-[13px] text-ink"
                >
                  <Chip tone="muted">birthday</Chip>
                  <span>{b.playerName}</span>
                  <span className="text-ink-mid">turned {b.newAge}</span>
                </li>
              ))}
              {state.recentReleases.map((r) => (
                <li
                  key={`r-${r.playerId}`}
                  className="flex items-center gap-3 px-6 py-4 text-[13px] text-ink"
                >
                  <Chip tone="danger">released</Chip>
                  <span>{r.playerName}</span>
                  <span className="text-ink-mid">aged out at {r.finalAge}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
