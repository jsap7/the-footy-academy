type Props = {
  values: readonly number[];
  width?: number;
  height?: number;
  className?: string;
};

export default function Sparkline({ values, width = 320, height = 64, className = '' }: Props) {
  if (values.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-[11px] uppercase tracking-[0.10em] text-ink-faint ${className}`}
        style={{ width, height }}
      >
        — not enough history yet —
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padX = 2;
  const padY = 4;
  const stepX = (width - padX * 2) / (values.length - 1);
  const yFor = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);

  const points = values.map((v, i) => `${padX + i * stepX},${yFor(v)}`).join(' ');
  const last = values[values.length - 1];
  const lastX = padX + (values.length - 1) * stepX;
  const lastY = yFor(last);
  const trend = last >= values[0] ? 'good' : 'warn';
  const stroke = trend === 'good' ? 'var(--color-accent)' : 'var(--color-warn)';
  const fill = trend === 'good' ? 'rgba(127, 163, 130, 0.12)' : 'rgba(184, 107, 107, 0.10)';

  // Build a closed area path from the polyline back along the baseline.
  const areaPath =
    `M ${padX},${height} ` +
    values.map((v, i) => `L ${padX + i * stepX},${yFor(v)}`).join(' ') +
    ` L ${lastX},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d={areaPath} fill={fill} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} />
    </svg>
  );
}
