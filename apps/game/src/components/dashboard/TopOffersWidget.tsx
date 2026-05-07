import { useMemo } from 'react';
import { acceptOffer } from '../../game/gameActions';
import type { GameState, Offer } from '../../types';
import { formatCash } from '../../util/format';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Chip from '../../ui/Chip';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onJumpTab: () => void;
};

const MAX_VISIBLE = 3;

type OfferGroup = {
  playerId: string;
  offers: Offer[];
  bestActive: Offer;
  bestAmount: number;
};

function isActive(o: Offer): boolean {
  return o.status === 'pending' || o.status === 'countered';
}

export default function TopOffersWidget({ state, onChange, onJumpTab }: Props) {
  const playerById = useMemo(() => new Map(state.roster.map((p) => [p.id, p])), [state.roster]);

  const groups = useMemo<OfferGroup[]>(() => {
    const map = new Map<string, Offer[]>();
    for (const o of state.pendingOffers) {
      if (!isActive(o)) continue;
      const list = map.get(o.playerId);
      if (list) list.push(o);
      else map.set(o.playerId, [o]);
    }
    const out: OfferGroup[] = [];
    for (const [playerId, offers] of map) {
      let best = offers[0];
      for (const o of offers) if (o.amount > best.amount) best = o;
      out.push({ playerId, offers, bestActive: best, bestAmount: best.amount });
    }
    out.sort((a, b) => {
      if (a.bestAmount !== b.bestAmount) return b.bestAmount - a.bestAmount;
      const aName = playerById.get(a.playerId);
      const bName = playerById.get(b.playerId);
      const an = aName ? `${aName.lastName} ${aName.firstName}` : a.playerId;
      const bn = bName ? `${bName.lastName} ${bName.firstName}` : b.playerId;
      return an.localeCompare(bn);
    });
    return out;
  }, [state.pendingOffers, playerById]);

  const visible = groups.slice(0, MAX_VISIBLE);
  const remainder = groups.length - visible.length;
  const empty = groups.length === 0;

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">top offers</span>
        <span className="text-[10px] tabular-nums text-ink-faint">{groups.length}</span>
      </div>
      {empty ? (
        <div className="flex flex-1 items-start px-4 py-4">
          <p className="text-[12px] text-ink-dim font-body">
            no offers yet — develop and list players to attract clubs.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-hairline">
            {visible.map((g) => {
              const player = playerById.get(g.playerId);
              const name = player ? `${player.firstName} ${player.lastName}` : '(sold)';
              return (
                <div
                  key={g.playerId}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2 transition-colors hover:bg-bg-elev-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate text-[12px] text-ink">
                      <span className="truncate">{name}</span>
                      {player ? <Chip tone="muted">{player.position}</Chip> : null}
                      {player ? (
                        <span className="text-[10px] text-ink-dim tabular-nums">{player.age}</span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.10em] text-ink-dim">
                      <span className="tabular-nums">{g.offers.length}</span> offer
                      {g.offers.length === 1 ? '' : 's'} · best{' '}
                      <span className="text-accent-bright tabular-nums">
                        {formatCash(g.bestAmount)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onJumpTab}
                    aria-label="View all offers"
                  >
                    view
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onChange(acceptOffer(state, g.bestActive.id))}
                  >
                    accept
                  </Button>
                </div>
              );
            })}
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
