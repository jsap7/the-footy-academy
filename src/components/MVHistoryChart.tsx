import { formatCash, formatMonth } from '../util/format';

type Entry = { month: number; year: number; mv: number };

type Props = {
  history: readonly Entry[];
  currentMV: number;
  width?: number;
  height?: number;
};

function trendLabel(history: readonly Entry[]): { text: string; tone: 'good' | 'warn' | 'dim' } {
  if (history.length < 2) return { text: 'no trend yet', tone: 'dim' };
  const first = history[0].mv;
  const last = history[history.length - 1].mv;
  const half = history[Math.floor(history.length / 2)].mv;
  if (last > first * 1.05 && last >= half) return { text: 'rising', tone: 'good' };
  if (last < first * 0.95) return { text: 'falling', tone: 'warn' };
  return { text: 'peaking', tone: 'dim' };
}

export default function MVHistoryChart({ history, currentMV, width = 480, height = 96 }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-[11px] uppercase tracking-[0.10em] text-ink-faint">
        — not enough history yet —
      </p>
    );
  }

  const values = history.map((e) => e.mv);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const PAD_X = 12;
  const PAD_Y = 10;
  const innerW = width - PAD_X * 2;
  const innerH = height - PAD_Y * 2;

  const xAt = (i: number) =>
    history.length === 1 ? PAD_X + innerW / 2 : PAD_X + (i / (history.length - 1)) * innerW;
  const yAt = (mv: number) => PAD_Y + innerH - ((mv - min) / range) * innerH;
  const path = history.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(e.mv)}`).join(' ');
  const areaPath = `${path} L ${xAt(history.length - 1)} ${PAD_Y + innerH} L ${xAt(0)} ${PAD_Y + innerH} Z`;
  const lastIdx = history.length - 1;
  const trend = trendLabel(history);
  const startMV = history[0].mv;
  const delta = currentMV - startMV;
  const deltaPct = startMV > 0 ? (delta / startMV) * 100 : 0;
  const deltaSign = delta > 0 ? '+' : '';
  const deltaTone = delta > 0 ? 'text-accent-bright' : delta < 0 ? 'text-warn' : 'text-ink-mid';

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="market value history"
      >
        <path d={areaPath} className="text-accent" fill="currentColor" fillOpacity={0.12} />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-accent"
        />
        {history.map((e, i) => (
          <circle
            key={`${e.year}-${e.month}-${i}`}
            cx={xAt(i)}
            cy={yAt(e.mv)}
            r={i === lastIdx ? 3 : 1.4}
            fill="currentColor"
            className={i === lastIdx ? 'text-accent-bright' : 'text-accent'}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.10em] text-ink-faint">
        <span>{formatMonth(history[0].month, history[0].year).toLowerCase()}</span>
        <span className={`tabular-nums ${deltaTone}`}>
          {history.length === 1 ? '—' : `${deltaSign}${formatCash(delta)} (${deltaSign}${deltaPct.toFixed(0)}%)`}
        </span>
        <span
          className={
            trend.tone === 'good' ? 'text-accent-bright' : trend.tone === 'warn' ? 'text-warn' : 'text-ink-mid'
          }
        >
          {trend.text}
        </span>
        <span>{formatMonth(history[lastIdx].month, history[lastIdx].year).toLowerCase()}</span>
      </div>
    </div>
  );
}
