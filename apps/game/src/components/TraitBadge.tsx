import { useEffect, useRef, useState } from 'react';
import { getTrait } from '../game/traits';
import type { TraitCategory, TraitId } from '../types';

type Props = {
  id: TraitId;
};

const CATEGORY_TONE: Record<TraitCategory, { border: string; bg: string; text: string }> = {
  positive: {
    border: 'border-accent-dim',
    bg: 'bg-accent-faint',
    text: 'text-accent-bright',
  },
  negative: {
    border: 'border-warn/40',
    bg: 'bg-warn-faint',
    text: 'text-warn',
  },
  neutral: { border: 'border-hairline-bright', bg: 'bg-bg-elev-2', text: 'text-ink-mid' },
};

const TOOLTIP_WIDTH = 256;

export default function TraitBadge({ id }: Props) {
  const trait = getTrait(id);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!pinned) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPinned(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pinned]);

  const open = hovered || pinned;

  useEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setAlignRight(rect.left + TOOLTIP_WIDTH > window.innerWidth - 8);
  }, [open]);

  if (!trait) return null;

  const tone = CATEGORY_TONE[trait.category];

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => setPinned((prev) => !prev)}
        aria-expanded={open}
        aria-describedby={open ? `trait-desc-${id}` : undefined}
        className={`inline-flex items-center rounded-[3px] border px-2 py-[3px] text-[10px] uppercase tracking-[0.10em] leading-none transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${tone.border} ${tone.bg} ${tone.text}`}
      >
        {trait.name}
      </button>
      {open && (
        <span
          id={`trait-desc-${id}`}
          role="tooltip"
          className={`pointer-events-none absolute top-full z-30 mt-2 w-64 max-w-[16rem] rounded-md border border-hairline-bright bg-bg-elev px-3 py-2 text-[12px] leading-snug text-ink-mid shadow-lg font-body ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {trait.description}
        </span>
      )}
    </span>
  );
}
