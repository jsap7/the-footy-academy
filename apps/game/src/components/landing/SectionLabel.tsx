type Props = {
  index: string;
  title: string;
  className?: string;
};

export default function SectionLabel({ index, title, className = '' }: Props) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.20em] text-ink-faint">{index}</span>
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">{title}</span>
    </div>
  );
}
