import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'hero' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  hint?: string;
  children: ReactNode;
};

const VARIANTS: Record<NonNullable<Props['variant']>, string> = {
  default:
    'border border-hairline-bright bg-bg-elev text-ink hover:bg-bg-elev-2 hover:border-ink-faint',
  primary:
    'border border-accent-dim bg-accent-faint text-accent-bright hover:bg-accent-dim/40 hover:text-accent-bright hover:border-accent',
  hero: 'border border-accent bg-accent text-bg hover:bg-accent-bright hover:border-accent-bright shadow-[0_1px_0_0_rgba(0,0,0,0.15)_inset,0_8px_24px_-12px_rgba(127,163,130,0.4)]',
  ghost: 'border border-transparent text-ink-mid hover:bg-bg-elev hover:text-ink',
  danger: 'border border-warn/60 bg-warn-faint text-warn hover:border-warn',
};

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3 py-1.5 text-[12px]',
  lg: 'px-5 py-2.5 text-[13px]',
};

export default function Button({
  variant = 'default',
  size = 'md',
  hint,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-[5px] uppercase tracking-[0.10em] leading-none transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {hint ? (
        <span className="border border-current/30 px-1 text-[10px] tracking-[0.08em] opacity-80">
          {hint}
        </span>
      ) : null}
    </button>
  );
}
