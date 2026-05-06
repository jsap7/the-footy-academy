type Props = {
  hints?: string;
};

export default function StatusBar({ hints }: Props) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-t border-hairline bg-bg px-6 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
      <span>
        v0.3.5 · phase 3.5 · <span className="text-accent">● live</span>
      </span>
      {hints ? <span>{hints}</span> : null}
    </div>
  );
}
