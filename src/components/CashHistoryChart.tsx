import type { CashHistoryEntry } from '../types';
import { formatCash, formatMonth } from '../util/format';

type Props = {
  history: readonly CashHistoryEntry[];
  width?: number;
  height?: number;
};

export default function CashHistoryChart({ history, width = 720, height = 160 }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-[12px] uppercase tracking-[0.10em] text-ink-faint">
        — not enough history yet —
      </p>
    );
  }

  const cashes = history.map((e) => e.cash);
  const min = Math.min(0, ...cashes);
  const max = Math.max(0, ...cashes);
  const range = max - min || 1;
  const PAD_X = 28;
  const PAD_Y = 16;
  const innerW = width - PAD_X * 2;
  const innerH = height - PAD_Y * 2;

  const xAt = (i: number) =>
    history.length === 1 ? PAD_X + innerW / 2 : PAD_X + (i / (history.length - 1)) * innerW;
  const yAt = (cash: number) => PAD_Y + innerH - ((cash - min) / range) * innerH;
  const path = history.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(e.cash)}`).join(' ');

  // Highlight peak and trough
  let peakIdx = 0;
  let troughIdx = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i].cash > history[peakIdx].cash) peakIdx = i;
    if (history[i].cash < history[troughIdx].cash) troughIdx = i;
  }

  const zeroY = yAt(0);
  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="cash history chart"
      >
        {min < 0 ? (
          <line
            x1={PAD_X}
            x2={width - PAD_X}
            y1={zeroY}
            y2={zeroY}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            className="text-ink-faint"
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-accent"
        />
        {history.map((e, i) => (
          <circle
            key={i}
            cx={xAt(i)}
            cy={yAt(e.cash)}
            r={i === peakIdx || i === troughIdx ? 3 : 1.5}
            fill="currentColor"
            className={
              i === peakIdx
                ? 'text-accent-bright'
                : i === troughIdx
                  ? 'text-warn'
                  : 'text-accent'
            }
          />
        ))}
      </svg>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.10em] text-ink-faint">
        <span>{formatMonth(history[0].month, history[0].year).toLowerCase()}</span>
        <span>peak <span className="text-accent-bright tabular-nums">{formatCash(history[peakIdx].cash)}</span></span>
        <span>trough <span className="text-warn tabular-nums">{formatCash(history[troughIdx].cash)}</span></span>
        <span>{formatMonth(history[history.length - 1].month, history[history.length - 1].year).toLowerCase()}</span>
      </div>
    </div>
  );
}
