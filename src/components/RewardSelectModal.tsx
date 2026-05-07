import { useState } from 'react';
import type { RewardOffer } from '../types';
import Button from '../ui/Button';
import Chip from '../ui/Chip';

type Props = {
  options: readonly RewardOffer[];
  year: number; // year that just ended
  onPick: (rewardId: RewardOffer['id']) => void;
};

const FLAVOR_TONE: Record<RewardOffer['flavor'], 'accent' | 'good' | 'muted' | 'danger'> = {
  cash: 'good',
  permanent: 'accent',
  yearly: 'muted',
  token: 'danger',
};

const FLAVOR_LABEL: Record<RewardOffer['flavor'], string> = {
  cash: 'cash',
  permanent: 'permanent',
  yearly: 'this year',
  token: 'token',
};

export default function RewardSelectModal({ options, year, onPick }: Props) {
  const [selected, setSelected] = useState<RewardOffer['id'] | null>(null);
  const picked = options.find((o) => o.id === selected);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/90 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-md border border-hairline-bright bg-bg-elev shadow-2xl">
        <header className="border-b border-hairline px-8 py-6">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            season cleared
          </span>
          <h2 className="mt-1 text-[28px] leading-none text-ink">
            {year} · pick your reward
          </h2>
          <p className="mt-3 text-[12px] text-ink-mid font-body">
            three offers from the board. pick one — the others are gone.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {options.map((r) => {
            const isSelected = r.id === selected;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                className={`group flex w-full items-start gap-4 rounded-md border px-5 py-4 text-left transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent-faint/40'
                    : 'border-hairline bg-bg-elev hover:border-accent-dim hover:bg-bg-elev-2'
                }`}
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Chip tone={FLAVOR_TONE[r.flavor]}>{FLAVOR_LABEL[r.flavor]}</Chip>
                    <span className="text-[14px] text-ink">{r.title}</span>
                  </div>
                  <p className="text-[12px] text-ink-mid font-body">{r.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-8 py-4">
          <span className="text-[11px] text-ink-dim font-body">
            {picked ? picked.title.toLowerCase() : 'choose one'}
          </span>
          <Button
            variant="hero"
            disabled={!picked}
            onClick={() => picked && onPick(picked.id)}
          >
            claim →
          </Button>
        </footer>
      </div>
    </div>
  );
}
