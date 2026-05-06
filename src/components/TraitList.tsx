import type { TraitId } from '../types';
import TraitBadge from './TraitBadge';

type Props = {
  traits: readonly TraitId[];
};

export default function TraitList({ traits }: Props) {
  if (traits.length === 0) {
    return <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">No traits</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((id) => (
        <TraitBadge key={id} id={id} />
      ))}
    </div>
  );
}
