import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import EmptyState from './components/EmptyState';
import EventBanner from './components/EventBanner';
import OffersPage from './components/OffersPage';
import PlayerDetailDrawer from './components/PlayerDetailDrawer';
import PlayerList from './components/PlayerList';
import ScoutsPage from './components/ScoutsPage';
import ShortlistPage from './components/ShortlistPage';
import TopBar from './components/TopBar';
import { listPlayer, setPlayerAvailable, unlistPlayer } from './game/gameActions';
import { advanceMonth } from './game/turnLoop';
import StatusBar from './ui/StatusBar';
import { INITIAL_GAME_STATE, type GameState } from './types';

type TabKey = 'dashboard' | 'roster' | 'shortlist' | 'scouts' | 'offers';

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
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
      if (e.key === 'n' || e.key === 'N') {
        setState((prev) => advanceMonth(prev));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const actionableOffers = state.pendingOffers.filter(
    (o) => o.status === 'pending' || o.status === 'countered',
  ).length;

  const navTabs = [
    { key: 'dashboard', label: 'dashboard' },
    { key: 'roster', label: 'roster', badge: state.roster.length },
    { key: 'shortlist', label: 'shortlist', badge: state.shortlist.length },
    { key: 'offers', label: 'offers', badge: actionableOffers },
    { key: 'scouts', label: 'scouts' },
  ] as const;

  const onRoster = selectedPlayer ? state.roster.some((p) => p.id === selectedPlayer.id) : false;

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        cash={state.cash}
        month={state.currentMonth}
        year={state.currentYear}
        tabs={navTabs}
        activeTab={activeTab}
        onChangeTab={(key) => setActiveTab(key as TabKey)}
        onAdvanceMonth={handleAdvanceMonth}
      />
      <EventBanner
        birthdays={state.recentBirthdays}
        releases={state.recentReleases}
        sales={state.recentSales}
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            state={state}
            onAdvanceMonth={handleAdvanceMonth}
            onJumpTab={(t) => setActiveTab(t as TabKey)}
            onSelectPlayer={handleSelect}
          />
        )}
        {activeTab !== 'dashboard' && (
          <div className="mx-auto w-full max-w-[1280px] px-12 py-10 space-y-6">
            {activeTab === 'roster' &&
              (state.roster.length === 0 ? (
                <EmptyState
                  hasScouts={state.scouts.length > 0}
                  onGoToScouts={() => setActiveTab('scouts')}
                />
              ) : (
                <PlayerList
                  players={state.roster}
                  pendingOffers={state.pendingOffers}
                  selectedPlayerId={selectedPlayerId}
                  onSelect={handleSelect}
                />
              ))}
            {activeTab === 'shortlist' && (
              <ShortlistPage
                state={state}
                selectedPlayerId={selectedPlayerId}
                onSelect={handleSelect}
                onChange={setState}
              />
            )}
            {activeTab === 'scouts' && <ScoutsPage state={state} onChange={setState} />}
            {activeTab === 'offers' && (
              <OffersPage state={state} onChange={setState} onSelectPlayer={handleSelect} />
            )}
          </div>
        )}
      </main>
      <StatusBar
        hints={
          selectedPlayer
            ? '[N] next month · [ESC] close drawer'
            : '[N] next month · click any player to drill in'
        }
      />
      <PlayerDetailDrawer
        player={selectedPlayer}
        onClose={handleClose}
        onSetAvailable={
          onRoster && selectedPlayer
            ? (id, available) => setState((prev) => setPlayerAvailable(prev, id, available))
            : undefined
        }
        onList={
          onRoster && selectedPlayer
            ? (id, price) => setState((prev) => listPlayer(prev, id, price))
            : undefined
        }
        onUnlist={
          onRoster && selectedPlayer
            ? (id) => setState((prev) => unlistPlayer(prev, id))
            : undefined
        }
      />
    </div>
  );
}
