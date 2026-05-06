import type { TraitId } from '../types';
import TraitBadge from './TraitBadge';

type Props = {
  traits: readonly TraitId[];
};

export default function TraitList({ traits }: Props) {
  if (traits.length === 0) {
    return <p className="text-[12px] uppercase tracking-[0.14em] text-ink-faint">no traits</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((id) => (
        <TraitBadge key={id} id={id} />
      ))}
    </div>
  );
}
