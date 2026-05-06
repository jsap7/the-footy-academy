import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'danger' | 'good';

type Props = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'border-hairline text-ink-mid',
  accent: 'border-accent-dim text-accent',
  danger: 'border-danger-rim text-danger',
  good: 'border-good-rim text-good',
};

export default function Chip({ tone = 'neutral', children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center border px-[7px] py-[2px] text-[10px] uppercase tracking-[0.10em] ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
