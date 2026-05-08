import type { ReactNode } from 'react';
import { formatCash, formatWeek } from '../util/format';
import { spaClick } from '../util/router';
import { useCountUp } from '../util/useCountUp';
import Button from '../ui/Button';

type Tab = {
  key: string;
  label: string;
  badge?: number;
};

type Props = {
  cash: number;
  week: number;
  month: number;
  year: number;
  reputation?: number;
  tabs: readonly Tab[];
  activeTab: string;
  onChangeTab: (key: string) => void;
  onAdvanceMonth: () => void;
  saveMenu?: ReactNode;
};

function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative flex items-center gap-2 px-3 py-2 text-[13px] uppercase tracking-[0.08em] transition-colors duration-150 ${
        isActive ? 'text-ink' : 'text-ink-dim hover:text-ink'
      }`}
    >
      <span>{tab.label}</span>
      {tab.badge !== undefined && tab.badge > 0 ? (
        <span
          className={`min-w-[18px] rounded-[3px] px-1 py-[1px] text-center text-[10px] tabular-nums leading-none ${
            isActive ? 'bg-accent text-bg' : 'bg-bg-elev-2 text-ink-mid group-hover:bg-bg-row-hi'
          }`}
        >
          {tab.badge}
        </span>
      ) : null}
      {isActive ? (
        <span aria-hidden className="absolute right-0 -bottom-[1px] left-0 h-[2px] bg-accent" />
      ) : null}
    </button>
  );
}

function HudBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: 'good' | 'warn';
}) {
  const valueClass =
    tone === 'good' ? 'text-accent-bright' : tone === 'warn' ? 'text-warn' : 'text-ink';
  return (
    <div className="flex flex-col items-end gap-0.5 leading-none whitespace-nowrap">
      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">{label}</span>
      <span className={`text-[15px] tabular-nums leading-none ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function TopBar({
  cash,
  week,
  month,
  year,
  reputation,
  tabs,
  activeTab,
  onChangeTab,
  onAdvanceMonth,
  saveMenu,
}: Props) {
  const cashTone: 'good' | 'warn' | undefined = cash <= 0 ? 'warn' : undefined;
  const animatedCash = useCountUp(cash);
  return (
    <header className="flex h-16 shrink-0 items-stretch border-b border-hairline bg-bg px-6">
      <div className="flex shrink-0 items-center gap-8">
        <a
          href="/"
          onClick={spaClick('/')}
          className="whitespace-nowrap text-[13px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
          title="Back to landing"
        >
          the footy academy
        </a>
      </div>
      <nav className="ml-10 flex shrink-0 items-stretch border-b border-transparent">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onClick={() => onChangeTab(tab.key)}
          />
        ))}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-7">
        {reputation != null ? <HudBlock label="Rep" value={reputation} /> : null}
        <HudBlock label="Cash" value={formatCash(Math.round(animatedCash))} tone={cashTone} />
        <HudBlock label="Week" value={formatWeek(month, week, year).toLowerCase()} />
        {saveMenu}
        <Button
          variant="hero"
          size="lg"
          onClick={onAdvanceMonth}
          hint="N"
          className="whitespace-nowrap"
        >
          next week →
        </Button>
      </div>
    </header>
  );
}
