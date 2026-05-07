import { useEffect, type ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative flex max-h-[88vh] w-[min(960px,92vw)] flex-col overflow-hidden rounded-md border border-hairline-bright bg-bg-elev shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] uppercase tracking-[0.10em] text-ink-mid hover:text-accent"
          >
            close ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
