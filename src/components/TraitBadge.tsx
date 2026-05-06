import { useEffect, useRef, useState } from 'react';
import { getTrait } from '../game/traits';
import type { TraitCategory, TraitId } from '../types';

type Props = {
  id: TraitId;
};

const CATEGORY_STYLES: Record<TraitCategory, string> = {
  positive: 'border-emerald-800/70 bg-emerald-950/40 text-emerald-300',
  negative: 'border-rose-900/70 bg-rose-950/40 text-rose-300',
  neutral: 'border-neutral-700 bg-neutral-900 text-neutral-300',
};

export default function TraitBadge({ id }: Props) {
  const trait = getTrait(id);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
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

  if (!trait) return null;

  const open = hovered || pinned;
  const tone = CATEGORY_STYLES[trait.category];

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
        className={`inline-flex items-center border px-1.5 py-[1px] font-mono text-[0.7rem] uppercase tracking-wider transition focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 ${tone}`}
      >
        {trait.name}
      </button>
      {open && (
        <span
          id={`trait-desc-${id}`}
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-60 max-w-[16rem] border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs leading-snug text-neutral-300 shadow-lg"
        >
          {trait.description}
        </span>
      )}
    </span>
  );
}
