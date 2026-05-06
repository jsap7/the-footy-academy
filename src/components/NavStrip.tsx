type Tab = {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type Props = {
  tabs: readonly Tab[];
  active: string;
};

export default function NavStrip({ tabs, active }: Props) {
  return (
    <nav className="flex h-9 shrink-0 items-stretch border-b border-hairline bg-bg px-3">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <span
            key={tab.key}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={tab.disabled || undefined}
            className={`flex items-center gap-2 border-b px-4 text-[10px] uppercase tracking-[0.14em] ${
              isActive
                ? 'border-accent text-accent'
                : tab.disabled
                  ? 'border-transparent text-ink-faint'
                  : 'border-transparent text-ink-dim'
            }`}
          >
            <span>{tab.label}</span>
            {tab.hint ? <span className="text-[9px] text-ink-faint">[{tab.hint}]</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
