import type { YearlyReview } from '../game/yearlyReview';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  review: YearlyReview;
  reputationLabel: string;
  onClose: () => void;
};

export default function YearlyReviewModal({ review, reputationLabel, onClose }: Props) {
  const repDelta = review.endReputation - review.startReputation;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/90 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-md border border-hairline-bright bg-bg-elev shadow-2xl">
        <header className="border-b border-hairline px-8 py-6">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            year in review
          </span>
          <h2 className="mt-1 text-[32px] leading-none text-ink">{review.year}</h2>
          <p className="mt-3 text-[12px] text-ink-mid">
            {reputationLabel.toLowerCase()} · {formatCash(review.endCash)} on hand
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 space-y-6 text-[12px]">
          <section>
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">finances</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-ink">
              <span className="text-ink-mid">sales</span>
              <span className="text-right tabular-nums">
                {review.totalSalesCount} ·{' '}
                <span className="text-accent-bright">+{formatCash(review.totalSalesValue)}</span>
              </span>
              <span className="text-ink-mid">spending</span>
              <span className="text-right tabular-nums text-warn">
                -{formatCash(review.totalSpending)}
              </span>
              <span className="text-ink-mid">net change</span>
              <span
                className={`text-right tabular-nums ${review.netCashChange >= 0 ? 'text-accent-bright' : 'text-warn'}`}
              >
                {review.netCashChange >= 0 ? '+' : ''}
                {formatCash(review.netCashChange)}
              </span>
              {review.biggestSale ? (
                <>
                  <span className="text-ink-mid">biggest sale</span>
                  <span className="text-right text-ink">
                    <span className="tabular-nums text-accent-bright">
                      {formatCash(review.biggestSale.amount)}
                    </span>
                    <span className="ml-2 text-ink-mid">
                      {review.biggestSale.description.replace(/^Sold\s+/, '')}
                    </span>
                  </span>
                </>
              ) : null}
            </div>
          </section>

          <section className="border-t border-hairline pt-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">players</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-ink">
              <span className="text-ink-mid">signed</span>
              <span className="text-right tabular-nums">{review.signingsCount}</span>
              <span className="text-ink-mid">released</span>
              <span className="text-right tabular-nums">{review.releasesCount}</span>
            </div>
          </section>

          <section className="border-t border-hairline pt-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
              achievements unlocked
            </h3>
            {review.achievements.length === 0 ? (
              <p className="text-ink-dim font-body">
                none this year — keep grinding for next time.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {review.achievements.map((a) => (
                  <li key={a.id} className="flex items-baseline gap-2">
                    <span className="text-accent-bright">★</span>
                    <span className="text-ink">{a.title}</span>
                    <span className="text-ink-faint">— {a.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-hairline pt-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
              reputation
            </h3>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-mid">started</span>
              <span className="tabular-nums text-ink-mid">{review.startReputation}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-ink-mid">ended</span>
              <span className="tabular-nums text-ink">{review.endReputation}</span>
            </div>
            <div
              className={`mt-2 text-right text-[14px] tabular-nums ${
                repDelta > 0 ? 'text-accent-bright' : repDelta < 0 ? 'text-warn' : 'text-ink-mid'
              }`}
            >
              {repDelta >= 0 ? '+' : ''}
              {repDelta} pts
            </div>
          </section>
        </div>

        <footer className="border-t border-hairline px-8 py-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              continue to {review.year + 1} →
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
