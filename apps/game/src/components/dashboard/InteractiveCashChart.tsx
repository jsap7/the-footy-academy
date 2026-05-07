import { useMemo, useRef, useState } from 'react';
import type { CashHistoryEntry } from '../../types';
import { formatCash, formatMonth } from '../../util/format';
import Card from '../../ui/Card';

type Props = {
  history: readonly CashHistoryEntry[];
  currentCash: number;
  onShowDetails: () => void;
};

const VIEW_W = 720;
const VIEW_H = 160;
const PAD_X = 28;
const PAD_Y = 16;

export default function InteractiveCashChart({ history, currentCash, onShowDetails }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { points, peakIdx, troughIdx, min, range, hasData } = useMemo(() => {
    if (history.length === 0) {
      return {
        points: [] as { x: number; y: number; entry: CashHistoryEntry }[],
        peakIdx: 0,
        troughIdx: 0,
        min: 0,
        range: 1,
        hasData: false,
      };
    }
    const cashes = history.map((e) => e.cash);
    const lo = Math.min(0, ...cashes);
    const hi = Math.max(0, ...cashes);
    const r = hi - lo || 1;
    const innerW = VIEW_W - PAD_X * 2;
    const innerH = VIEW_H - PAD_Y * 2;
    const xAt = (i: number) =>
      history.length === 1 ? PAD_X + innerW / 2 : PAD_X + (i / (history.length - 1)) * innerW;
    const yAt = (cash: number) => PAD_Y + innerH - ((cash - lo) / r) * innerH;
    let peak = 0;
    let trough = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].cash > history[peak].cash) peak = i;
      if (history[i].cash < history[trough].cash) trough = i;
    }
    return {
      points: history.map((entry, i) => ({ x: xAt(i), y: yAt(entry.cash), entry })),
      peakIdx: peak,
      troughIdx: trough,
      min: lo,
      range: r,
      hasData: true,
    };
  }, [history]);

  if (!hasData) {
    return (
      <Card padded={false} className="flex h-full flex-col">
        <div className="flex items-baseline justify-between border-b border-hairline px-4 py-2.5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            cash · last {history.length} months
          </span>
          <button
            type="button"
            onClick={onShowDetails}
            className="text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
          >
            show details →
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.10em] text-ink-faint">
            — not enough history yet —
          </p>
        </div>
      </Card>
    );
  }

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const innerH = VIEW_H - PAD_Y * 2;
  const zeroY = PAD_Y + innerH - ((0 - min) / range) * innerH;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Convert mouse position to viewBox-space x.
    const localX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - localX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }
    setHoverIdx(nearest);
  };

  const handleMouseLeave = () => setHoverIdx(null);

  const hover = hoverIdx != null ? points[hoverIdx] : null;
  // Anchor tooltip in pixels from the SVG's top-left, scaled relative to viewBox.
  const tooltipLeftPct = hover ? (hover.x / VIEW_W) * 100 : 0;
  const tooltipTopPct = hover ? (hover.y / VIEW_H) * 100 : 0;

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
          cash · last {history.length} {history.length === 1 ? 'month' : 'months'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.10em] tabular-nums text-ink-mid">
            now <span className="text-ink">{formatCash(currentCash)}</span>
          </span>
          <button
            type="button"
            onClick={onShowDetails}
            className="text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
          >
            show details →
          </button>
        </div>
      </div>
      <div className="relative flex-1 px-3 pt-2 pb-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label="cash history chart"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {min < 0 ? (
            <line
              x1={PAD_X}
              x2={VIEW_W - PAD_X}
              y1={zeroY}
              y2={zeroY}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              className="text-ink-faint"
            />
          ) : null}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="text-accent"
          />
          {points.map((p, i) => {
            const isPeak = i === peakIdx;
            const isTrough = i === troughIdx;
            const isHover = i === hoverIdx;
            const r = isHover ? 4 : isPeak || isTrough ? 3 : 1.5;
            const cls = isHover
              ? 'text-accent-bright'
              : isPeak
                ? 'text-accent-bright'
                : isTrough
                  ? 'text-warn'
                  : 'text-accent';
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={r}
                fill="currentColor"
                className={`${cls} transition-all duration-150`}
              />
            );
          })}
          {hover ? (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_Y}
              y2={VIEW_H - PAD_Y}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              className="text-ink-faint"
            />
          ) : null}
        </svg>
        {hover ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${tooltipLeftPct}%`,
              top: `calc(${tooltipTopPct}% - 8px)`,
            }}
          >
            <div className="rounded-[3px] border border-hairline-bright bg-bg-elev-2 px-2 py-1 text-[10px] leading-tight whitespace-nowrap shadow-lg">
              <div className="uppercase tracking-[0.10em] text-ink-dim">
                {formatMonth(hover.entry.month, hover.entry.year).toLowerCase()}
              </div>
              <div className="tabular-nums text-ink">{formatCash(hover.entry.cash)}</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline justify-between border-t border-hairline px-4 py-1.5 text-[10px] uppercase tracking-[0.10em] text-ink-faint">
        <span>{formatMonth(history[0].month, history[0].year).toLowerCase()}</span>
        <span>
          peak{' '}
          <span className="text-accent-bright tabular-nums">
            {formatCash(history[peakIdx].cash)}
          </span>
        </span>
        <span>
          trough{' '}
          <span className="text-warn tabular-nums">{formatCash(history[troughIdx].cash)}</span>
        </span>
        <span>
          {formatMonth(
            history[history.length - 1].month,
            history[history.length - 1].year,
          ).toLowerCase()}
        </span>
      </div>
    </Card>
  );
}
