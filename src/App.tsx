import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import EmptyState from './components/EmptyState';
import AchievementsPage from './components/AchievementsPage';
import EventBanner from './components/EventBanner';
import FinancesPage from './components/FinancesPage';
import OffersPage from './components/OffersPage';
import SaveMenu from './components/SaveMenu';
import YearlyReviewModal from './components/YearlyReviewModal';
import PlayerDetailDrawer from './components/PlayerDetailDrawer';
import PlayerList from './components/PlayerList';
import ScoutsPage from './components/ScoutsPage';
import ShortlistPage from './components/ShortlistPage';
import TopBar from './components/TopBar';
import { getCurrentFacility } from './game/facilities';
import { computeReputationBreakdown, computeReputation } from './game/reputation';
import { loadFromLocalStorage, saveToLocalStorage } from './game/save';
import { computeYearlyReview, type YearlyReview } from './game/yearlyReview';
import {
  downgradeFacility,
  listPlayer,
  releasePlayer,
  setPlayerAvailable,
  setPlayerBlockOffers,
  unlistPlayer,
  upgradeFacility,
} from './game/gameActions';
import { advanceMonth } from './game/turnLoop';
import StatusBar from './ui/StatusBar';
import { INITIAL_GAME_STATE, type GameState } from './types';

type TabKey =
  | 'dashboard'
  | 'roster'
  | 'shortlist'
  | 'scouts'
  | 'offers'
  | 'finances'
  | 'achievements';

export default function App() {
  // Hydrate from localStorage on first render — falls back to a fresh
  // initial state if nothing is saved or the version is mismatched.
  const [state, setState] = useState<GameState>(
    () => loadFromLocalStorage() ?? INITIAL_GAME_STATE,
  );
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [yearlyReview, setYearlyReview] = useState<YearlyReview | null>(null);

  // Auto-save to localStorage on every state change. JSON.stringify on the
  // current state size is cheap (a few KB).
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

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

  const handleAdvanceMonth = () =>
    setState((prev) => {
      const next = advanceMonth(prev);
      // Dec → Jan transition: surface a yearly review for the year that
      // just ended. The first review fires after 12 turns from the game
      // start (Aug 2026 → Jan 2027 reviews 2026, etc.).
      if (prev.currentMonth === 12 && next.currentMonth === 1) {
        setYearlyReview(computeYearlyReview(next, prev.currentYear));
      }
      return next;
    });

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

  const unlockedAchievements = (state.achievements ?? null)
    ? Object.values(state.achievements).filter((a) => a?.unlockedAt).length
    : 0;

  const navTabs = [
    { key: 'dashboard', label: 'dashboard' },
    { key: 'roster', label: 'roster', badge: state.roster.length },
    { key: 'shortlist', label: 'shortlist', badge: state.shortlist.length },
    { key: 'offers', label: 'offers', badge: actionableOffers },
    { key: 'scouts', label: 'scouts' },
    { key: 'finances', label: 'finances' },
    { key: 'achievements', label: 'achievements', badge: unlockedAchievements },
  ] as const;

  const onRoster = selectedPlayer ? state.roster.some((p) => p.id === selectedPlayer.id) : false;

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        cash={state.cash}
        month={state.currentMonth}
        year={state.currentYear}
        reputation={computeReputation(state)}
        tabs={navTabs}
        activeTab={activeTab}
        onChangeTab={(key) => setActiveTab(key as TabKey)}
        onAdvanceMonth={handleAdvanceMonth}
        saveMenu={<SaveMenu state={state} onImport={(s) => setState(s)} />}
      />
      <EventBanner
        birthdays={state.recentBirthdays}
        releases={state.recentReleases}
        sales={state.recentSales}
        facilityEvents={state.recentFacilityEvents}
        forcedScoutFires={state.recentForcedScoutFires}
        achievements={state.recentAchievements}
        statMilestones={state.recentStatMilestones}
        nationalTeamCallups={state.recentNationalTeamCallups}
        nationalTeamDrops={state.recentNationalTeamDrops}
        veterans={state.recentVeterans}
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            state={state}
            onAdvanceMonth={handleAdvanceMonth}
            onJumpTab={(t) => setActiveTab(t as TabKey)}
            onSelectPlayer={handleSelect}
            onUpgradeFacility={() => setState((prev) => upgradeFacility(prev))}
            onDowngradeFacility={() => setState((prev) => downgradeFacility(prev))}
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
                  currentYear={state.currentYear}
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
            {activeTab === 'finances' && <FinancesPage state={state} />}
            {activeTab === 'achievements' && <AchievementsPage state={state} />}
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
        state={state}
        developmentMultiplier={getCurrentFacility(state).developmentMultiplier}
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
        onSetBlockOffers={
          onRoster && selectedPlayer
            ? (id, blocked) => setState((prev) => setPlayerBlockOffers(prev, id, blocked))
            : undefined
        }
        onRelease={
          onRoster && selectedPlayer
            ? (id) => {
                setState((prev) => releasePlayer(prev, id));
                setSelectedPlayerId(null);
              }
            : undefined
        }
      />
      {yearlyReview ? (
        <YearlyReviewModal
          review={yearlyReview}
          reputationLabel={computeReputationBreakdown(state).label}
          onClose={() => setYearlyReview(null)}
        />
      ) : null}
    </div>
  );
}
