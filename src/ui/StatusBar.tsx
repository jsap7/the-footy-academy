type Props = {
  hints?: string;
};

export default function StatusBar({ hints }: Props) {
  return (
    <div className="flex items-center justify-between border-t border-hairline px-6 py-2 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
      <span>
        v0.1.5 · phase 1.5 · <span className="text-good">● saved</span>
      </span>
      {hints ? <span>{hints}</span> : null}
    </div>
  );
}
