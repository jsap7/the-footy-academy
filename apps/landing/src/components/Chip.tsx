import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'danger' | 'good' | 'muted';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'border-hairline-bright bg-bg-elev text-ink-mid',
  muted: 'border-transparent bg-bg-elev-2 text-ink-dim',
  accent: 'border-accent-dim bg-accent-faint text-accent-bright',
  danger: 'border-warn/40 bg-warn-faint text-warn',
  good: 'border-accent-dim bg-accent-faint text-accent-bright',
};

export default function Chip({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border px-1.5 py-[1px] text-[10px] uppercase leading-none tracking-[0.10em] ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
