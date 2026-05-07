import { useState } from 'react';
import type { ActiveChallenge, ChallengeTier } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';
import Chip from '../ui/Chip';

type Props = {
  year: number;
  options: readonly ActiveChallenge[];
  onPick: (challenge: ActiveChallenge) => void;
};

const TIER_TONE: Record<ChallengeTier, 'good' | 'accent' | 'muted' | 'danger'> = {
  easy: 'muted',
  medium: 'accent',
  hard: 'good',
  brutal: 'danger',
};

const TIER_LABEL: Record<ChallengeTier, string> = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
  brutal: 'brutal',
};

function formatTarget(c: ActiveChallenge): string {
  if (c.unit === '€') return formatCash(c.target);
  if (c.target === 0) return '—';
  return `${c.target} ${c.unit}`;
}

export default function ChallengeSelectModal({ year, options, onPick }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const picked = options.find((o) => o.defId === selected);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/90 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-md border border-hairline-bright bg-bg-elev shadow-2xl">
        <header className="border-b border-hairline px-8 py-6">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            board expectations
          </span>
          <h2 className="mt-1 text-[28px] leading-none text-ink">{year} season</h2>
          <p className="mt-3 text-[12px] text-ink-mid font-body">
            pick one. it locks in for the year. clear it by dec w4 + stay in the black or it&apos;s
            game over.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {options.map((c) => {
            const isSelected = c.defId === selected;
            return (
              <button
                key={c.defId}
                type="button"
                onClick={() => setSelected(c.defId)}
                className={`group flex w-full items-start gap-4 rounded-md border px-5 py-4 text-left transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent-faint/40'
                    : 'border-hairline bg-bg-elev hover:border-accent-dim hover:bg-bg-elev-2'
                }`}
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Chip tone={TIER_TONE[c.tier]}>{TIER_LABEL[c.tier]}</Chip>
                    <span className="text-[14px] text-ink">{c.title}</span>
                  </div>
                  <p className="text-[12px] text-ink-mid font-body">{c.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                    target
                  </span>
                  <span className="text-[15px] tabular-nums text-ink">{formatTarget(c)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-8 py-4">
          <span className="text-[11px] text-ink-dim font-body">
            {picked ? picked.title.toLowerCase() : 'pick a challenge to continue'}
          </span>
          <Button
            variant="hero"
            disabled={!picked}
            onClick={() => picked && onPick(picked)}
          >
            commit to season →
          </Button>
        </footer>
      </div>
    </div>
  );
}
