import { useMemo, useState } from 'react';
import type { Offer, Player } from '../types';
import {
  averageCurrent,
  averagePotential,
  buildPendingOffersIndex,
  highestOfferAmount,
} from '../game/playerStats';
import { calculateStipend } from '../game/stipends';
import { computeMarketValue } from '../game/marketValue';
import { MINIMUM_TRANSFER_AGE } from '../game/offers';
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';

type Props = {
  players: readonly Player[];
  pendingOffers: readonly Offer[];
  selectedPlayerId: string | null;
  currentYear: number;
  onSelect: (playerId: string) => void;
};

type SortKey = 'age' | 'cur' | 'pot' | 'mv' | 'stipend' | 'offers';
type SortDir = 'asc' | 'desc';

const COLS =
  'grid-cols-[minmax(0,1.4fr)_44px_64px_44px_44px_minmax(0,1fr)_72px_72px_minmax(0,1.1fr)]';

const DOTTED_TRACK =
  'repeating-linear-gradient(to right, var(--color-ink-faint) 0 2px, transparent 2px 4px)';

const DEFAULT_DIRECTION: Record<SortKey, SortDir> = {
  age: 'asc',
  cur: 'desc',
  pot: 'desc',
  mv: 'desc',
  stipend: 'desc',
  offers: 'desc',
};

function PotBar({ current, potential }: { current: number; potential: number }) {
  const maxed = current >= potential;
  return (
    <div
      className="relative h-[6px] w-full rounded-[2px] overflow-hidden"
      style={{ backgroundImage: DOTTED_TRACK }}
      aria-hidden
    >
      <div
        className={`absolute inset-y-0 left-0 ${maxed ? 'bg-accent-bright' : 'bg-accent'}`}
        style={{ width: `${current}%` }}
      />
      <div
        className="absolute -top-[2px] -bottom-[2px] w-[2px] bg-ink-mid"
        style={{ left: `calc(${potential}% - 1px)` }}
      />
    </div>
  );
}

type SortHeaderProps = {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDir;
  align?: 'left' | 'right';
  onToggle: (key: SortKey) => void;
};

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  align = 'left',
  onToggle,
}: SortHeaderProps) {
  const isActive = activeKey === sortKey;
  const arrow = isActive ? (direction === 'asc' ? '^' : 'v') : '·';
  const justify = align === 'right' ? 'justify-end' : 'justify-start';
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className={`flex items-center gap-1 ${justify} text-[10px] uppercase tracking-[0.12em] transition-colors duration-150 ${
        isActive ? 'text-ink' : 'text-ink-dim hover:text-ink-mid'
      }`}
    >
      <span>{label}</span>
      <span aria-hidden className="font-mono leading-none">
        {arrow}
      </span>
    </button>
  );
}

export default function PlayerList({
  players,
  pendingOffers,
  selectedPlayerId,
  currentYear,
  onSelect,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('pot');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const offersByPlayer = useMemo(() => buildPendingOffersIndex(pendingOffers), [pendingOffers]);

  const sortedPlayers = useMemo(() => {
    const enriched = players.map((p) => {
      const offers = offersByPlayer.get(p.id) ?? [];
      const bestOffer = highestOfferAmount(offers);
      return {
        player: p,
        cur: averageCurrent(p),
        pot: averagePotential(p),
        stipend: calculateStipend(p, currentYear),
        marketValue: computeMarketValue(p),
        offerCount: offers.length,
        bestOffer,
        name: `${p.lastName} ${p.firstName}`,
      };
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    enriched.sort((a, b) => {
      let primary = 0;
      switch (sortKey) {
        case 'age':
          primary = a.player.age - b.player.age;
          break;
        case 'cur':
          primary = a.cur - b.cur;
          break;
        case 'pot':
          primary = a.pot - b.pot;
          break;
        case 'mv':
          primary = a.marketValue - b.marketValue;
          break;
        case 'stipend':
          primary = a.stipend - b.stipend;
          break;
        case 'offers':
          primary = a.bestOffer - b.bestOffer || a.offerCount - b.offerCount;
          break;
      }
      if (primary !== 0) return primary * dir;
      return a.name.localeCompare(b.name);
    });
    return enriched;
  }, [players, offersByPlayer, sortKey, sortDir, currentYear]);

  const handleToggle = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(DEFAULT_DIRECTION[key]);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-bg-elev">
      <div
        className={`grid ${COLS} items-center gap-4 border-b border-hairline px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
      >
        <span>player</span>
        <SortHeader
          label="age"
          sortKey="age"
          activeKey={sortKey}
          direction={sortDir}
          onToggle={handleToggle}
        />
        <span>position</span>
        <SortHeader
          label="cur"
          sortKey="cur"
          activeKey={sortKey}
          direction={sortDir}
          align="right"
          onToggle={handleToggle}
        />
        <SortHeader
          label="pot"
          sortKey="pot"
          activeKey={sortKey}
          direction={sortDir}
          align="right"
          onToggle={handleToggle}
        />
        <span>development</span>
        <SortHeader
          label="value"
          sortKey="mv"
          activeKey={sortKey}
          direction={sortDir}
          align="right"
          onToggle={handleToggle}
        />
        <SortHeader
          label="stipend"
          sortKey="stipend"
          activeKey={sortKey}
          direction={sortDir}
          align="right"
          onToggle={handleToggle}
        />
        <SortHeader
          label="offers"
          sortKey="offers"
          activeKey={sortKey}
          direction={sortDir}
          align="right"
          onToggle={handleToggle}
        />
      </div>
      <div className="divide-y divide-hairline">
        {sortedPlayers.map(({ player, cur, pot, stipend, marketValue, offerCount, bestOffer }) => {
          const isSelected = player.id === selectedPlayerId;
          const hasOffers = offerCount > 0;
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player.id)}
              className={`relative grid w-full ${COLS} items-center gap-4 px-6 py-4 text-left text-[13px] leading-none transition-colors duration-150 ${
                isSelected ? 'bg-bg-row-hi text-ink' : 'text-ink hover:bg-bg-elev-2'
              }`}
            >
              {hasOffers ? (
                <span aria-hidden className="absolute inset-y-2 left-0 w-[2px] bg-accent" />
              ) : null}
              <span className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-accent' : 'bg-transparent'}`}
                />
                <span className="truncate">
                  {player.firstName} {player.lastName}
                </span>
                {player.age < MINIMUM_TRANSFER_AGE ? (
                  <Chip tone="muted">locked u{MINIMUM_TRANSFER_AGE}</Chip>
                ) : player.askingPrice != null ? (
                  <Chip tone="accent">listed</Chip>
                ) : player.availableForSale ? (
                  <Chip tone="muted">available</Chip>
                ) : player.blockOffers ? (
                  <Chip tone="danger">offers blocked</Chip>
                ) : null}
                {(player.monthsOnRoster ?? 0) >= 24 ? (
                  <Chip tone="accent">veteran</Chip>
                ) : null}
              </span>
              <span className="tabular-nums text-ink-mid">{player.age}</span>
              <span>
                <Chip tone="muted">{player.position}</Chip>
              </span>
              <span className="text-right tabular-nums text-ink">{cur}</span>
              <span className="text-right tabular-nums text-ink-mid">{pot}</span>
              <PotBar current={cur} potential={pot} />
              <span className="text-right tabular-nums text-ink">{formatCash(marketValue)}</span>
              <span className="text-right tabular-nums text-ink-mid">{formatCash(stipend)}</span>
              <span className="text-right tabular-nums text-ink-dim">
                {hasOffers ? (
                  <span className="text-ink">
                    {offerCount}
                    <span className="px-1 text-ink-faint">·</span>
                    <span className="text-accent-bright">{formatCash(bestOffer)}</span>
                  </span>
                ) : (
                  '—'
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
