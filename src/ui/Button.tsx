import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary';
  hint?: string;
  children: ReactNode;
};

export default function Button({
  variant = 'default',
  hint,
  className = '',
  children,
  ...rest
}: Props) {
  const variantStyles =
    variant === 'primary'
      ? 'border-accent-dim text-accent hover:bg-accent-faint hover:border-accent'
      : 'border-hairline text-ink hover:border-accent hover:text-accent';
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 border bg-transparent px-3 py-1.5 text-[18px] leading-none transition focus:outline-none focus-visible:border-accent focus-visible:text-accent ${variantStyles} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {hint ? (
        <span className="border border-current/40 px-1 text-[12px] tracking-[0.08em] uppercase opacity-80">
          {hint}
        </span>
      ) : null}
    </button>
  );
}
