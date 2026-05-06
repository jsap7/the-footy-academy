import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Render with a subtly raised background so the card stands off the page. */
  elevated?: boolean;
  /** Add a generous internal pad. Default true. */
  padded?: boolean;
};

export default function Card({ children, className = '', elevated = true, padded = true }: Props) {
  return (
    <div
      className={`rounded-md border border-hairline ${elevated ? 'bg-bg-elev' : 'bg-bg'} ${padded ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
