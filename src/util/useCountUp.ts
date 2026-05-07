import { useEffect, useRef, useState } from 'react';

// Smoothly interpolate from the previous value to the new target over
// `durationMs`. On every change, we kick off a rAF loop that ease-outs from
// the displayed value (NOT the previous target — important if the user
// advances the calendar before the prior animation lands) toward the new
// target. ~400ms feels celebratory on big sales without dragging on the
// per-week burn deduction.
export function useCountUp(target: number, durationMs = 400): number {
  const [displayed, setDisplayed] = useState(target);
  const fromRef = useRef(target);
  const targetRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === targetRef.current) return;
    fromRef.current = displayed;
    targetRef.current = target;
    startRef.current = null;

    const step = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out cubic — fast at the start, soft landing.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setDisplayed(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayed(targetRef.current);
        rafRef.current = null;
      }
    };

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally exclude `displayed` from deps — it changes on every
    // frame. fromRef captures the snapshot at animation start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return displayed;
}
