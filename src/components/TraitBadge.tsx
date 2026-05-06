import { useEffect, useRef, useState } from 'react';
import { getTrait } from '../game/traits';
import type { TraitCategory, TraitId } from '../types';

type Props = {
  id: TraitId;
};

const CATEGORY_TONE: Record<TraitCategory, { border: string; text: string }> = {
  positive: { border: 'border-good-rim', text: 'text-good' },
  negative: { border: 'border-danger-rim', text: 'text-danger' },
  neutral: { border: 'border-hairline', text: 'text-ink-mid' },
};

const TOOLTIP_WIDTH = 240;

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
        className={`inline-flex items-center border bg-transparent px-[7px] py-[2px] text-[10px] uppercase tracking-[0.10em] transition focus:outline-none focus-visible:border-accent focus-visible:text-accent ${tone.border} ${tone.text}`}
      >
        {trait.name}
      </button>
      {open && (
        <span
          id={`trait-desc-${id}`}
          role="tooltip"
          className={`pointer-events-none absolute top-full z-20 mt-1 w-60 max-w-[16rem] border border-hairline bg-bg-elev px-3 py-2 text-[14px] leading-snug text-ink-mid shadow-none ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {trait.description}
        </span>
      )}
    </span>
  );
}
