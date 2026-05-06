import { useEffect, useMemo, useState } from 'react';
import EmptyState from './components/EmptyState';
import NavStrip from './components/NavStrip';
import PlayerDetail from './components/PlayerDetail';
import PlayerList from './components/PlayerList';
import ScoutsPage from './components/ScoutsPage';
import ShortlistPage from './components/ShortlistPage';
import TopBar from './components/TopBar';
import { monthlyBurn } from './game/finance';
import { advanceMonth } from './game/turnLoop';
import Button from './ui/Button';
import SectionHead from './ui/SectionHead';
import StatusBar from './ui/StatusBar';
import { INITIAL_GAME_STATE, type GameState } from './types';

type TabKey = 'roster' | 'shortlist' | 'scouts';

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeTab, setActiveTab] = useState<TabKey>('roster');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    const onRoster = state.roster.find((p) => p.id === selectedPlayerId);
    if (onRoster) return onRoster;
    const onShortlist = state.shortlist.find((e) => e.player.id === selectedPlayerId);
    return onShortlist?.player ?? null;
  }, [state.roster, state.shortlist, selectedPlayerId]);

  const handleSelect = (id: string) => {
    setSelectedPlayerId((prev) => (prev === id ? null : id));
  };

  const handleClose = () => setSelectedPlayerId(null);

  const handleAdvanceMonth = () => setState((prev) => advanceMonth(prev));

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === 'Escape') {
        setSelectedPlayerId(null);
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        setState((prev) => advanceMonth(prev));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const headerActions = (
    <Button variant="primary" onClick={handleAdvanceMonth} hint="N">
      next month →
    </Button>
  );

  const navTabs = [
    { key: 'roster', label: 'academy' },
    {
      key: 'shortlist',
      label: 'shortlist',
      hint: state.shortlist.length > 0 ? String(state.shortlist.length) : undefined,
    },
    { key: 'scouts', label: 'scouts' },
    { key: 'transfers', label: 'transfers', hint: 'phase 3', disabled: true },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        cash={state.cash}
        month={state.currentMonth}
        year={state.currentYear}
        squad={state.roster.length}
        burn={monthlyBurn(state)}
        rightSlot={headerActions}
      />
      <NavStrip tabs={navTabs} active={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />
      <main className="flex min-h-0 flex-1">
        <section className="flex w-full min-w-0 flex-1 flex-col border-r border-hairline">
          {activeTab === 'roster' && (
            <>
              <SectionHead label="academy roster" count={state.roster.length} />
              {state.roster.length === 0 ? (
                <EmptyState
                  hasScouts={state.scouts.length > 0}
                  onGoToScouts={() => setActiveTab('scouts')}
                />
              ) : (
                <PlayerList
                  players={state.roster}
                  selectedPlayerId={selectedPlayerId}
                  onSelect={handleSelect}
                />
              )}
            </>
          )}
          {activeTab === 'shortlist' && (
            <>
              <SectionHead
                label="shortlist"
                count={state.shortlist.length}
                right={
                  <span className="text-[10px] tracking-[0.14em] text-ink-faint">
                    expires after 3 months · sign or lose them
                  </span>
                }
              />
              <ShortlistPage
                state={state}
                selectedPlayerId={selectedPlayerId}
                onSelect={handleSelect}
                onChange={setState}
              />
            </>
          )}
          {activeTab === 'scouts' && <ScoutsPage state={state} onChange={setState} />}
        </section>
        {selectedPlayer && (
          <aside className="w-[480px] shrink-0">
            <PlayerDetail player={selectedPlayer} onClose={handleClose} />
          </aside>
        )}
      </main>
      <StatusBar
        hints={selectedPlayer ? '[N] next month · [ESC] close' : '[N] next month · [↑/↓] navigate'}
      />
    </div>
  );
}
