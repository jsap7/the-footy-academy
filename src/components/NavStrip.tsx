type Tab = {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type Props = {
  tabs: readonly Tab[];
  active: string;
  onChange: (key: string) => void;
};

export default function NavStrip({ tabs, active, onChange }: Props) {
  return (
    <nav className="flex h-9 shrink-0 items-stretch border-b border-hairline bg-bg px-3">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 border-b border-transparent bg-transparent px-4 text-[10px] uppercase tracking-[0.14em] transition focus:outline-none ${
              isActive
                ? 'border-accent text-accent'
                : tab.disabled
                  ? 'cursor-not-allowed text-ink-faint'
                  : 'text-ink-dim hover:text-ink'
            }`}
          >
            <span>{tab.label}</span>
            {tab.hint ? <span className="text-[9px] text-ink-faint">[{tab.hint}]</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
