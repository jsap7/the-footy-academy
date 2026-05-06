import type { ReactNode } from 'react';

type Props = {
  label: string;
  count?: number;
  right?: ReactNode;
};

export default function SectionHead({ label, count, right }: Props) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hairline px-6 py-3">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">── {label}</span>
        {count !== undefined && (
          <span className="text-[10px] tracking-[0.14em] text-ink-faint">[{count}]</span>
        )}
      </div>
      {right}
    </div>
  );
}
