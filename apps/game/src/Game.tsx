import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import EmptyState from './components/EmptyState';
import ChallengeSelectModal from './components/ChallengeSelectModal';
import ChallengeStickyBar from './components/ChallengeStickyBar';
import EventBanner from './components/EventBanner';
import GameOverModal from './components/GameOverModal';
import OffersPage from './components/OffersPage';
import RewardSelectModal from './components/RewardSelectModal';
import SaveMenu from './components/SaveMenu';
import YearlyReviewModal from './components/YearlyReviewModal';
import PlayerDetailDrawer from './components/PlayerDetailDrawer';
import PlayerList from './components/PlayerList';
import ScoutsPage from './components/ScoutsPage';
import ShortlistPage from './components/ShortlistPage';
import TopBar from './components/TopBar';
import { drawChallengeOptions } from './game/challenges';
import { getCurrentFacility } from './game/facilities';
import { averageCurrent } from './game/playerStats';
import { computeReputationBreakdown, computeReputation } from './game/reputation';
import { applyReward } from './game/rewards';
import { generateStartingRoster } from './game/startingRoster';
import { generateScoutMarket } from './game/scoutMarket';
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
import { INITIAL_GAME_STATE, type ActiveChallenge, type GameState } from './types';

type TabKey = 'dashboard' | 'roster' | 'shortlist' | 'scouts' | 'offers';

// Build a fresh initial GameState — used both at very-first-launch and on
// "Start New Run". Preserves runHistory across runs (so the user can see
// how many runs they've done) but resets everything else.
function freshGameState(carriedRunHistory: GameState['runHistory'] = []): GameState {
  return {
    ...INITIAL_GAME_STATE,
    roster: generateStartingRoster(),
    scoutMarket: generateScoutMarket(),
    runHistory: carriedRunHistory,
  };
}

export default function Game() {
  // Hydrate from localStorage on first render — falls back to a fresh
  // initial state if nothing is saved or the version is mismatched.
  const [state, setState] = useState<GameState>(() => loadFromLocalStorage() ?? freshGameState());
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [yearlyReview, setYearlyReview] = useState<YearlyReview | null>(null);

  // Auto-save to localStorage on every state change. JSON.stringify on the
  // current state size is cheap (a few KB).
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  // Phase 6 — first-year challenge auto-draw. If the user just landed on
  // Jan W1 of any year (including game start) and hasn't picked a
  // challenge yet, surface the modal options. We populate
  // pendingChallengeOptions here rather than inside the turn loop so that
  // the very first launch (before any "next week" click) still triggers
  // the modal.
  useEffect(() => {
    if (state.gameOver) return;
    if (state.pendingChallengeOptions) return;
    if (state.hasPickedChallengeThisYear) return;
    if (state.currentMonth !== 1 || state.currentWeek !== 1) return;
    const rosterByPlayerIdAvgCurrent: Record<string, number> = {};
    for (const p of state.roster) rosterByPlayerIdAvgCurrent[p.id] = averageCurrent(p);
    const options = drawChallengeOptions(state.currentYear, state.cash, rosterByPlayerIdAvgCurrent);
    // The challenge auto-draw is conditional on calendar state, runs at most
    // once per year, and pendingChallengeOptions is persisted to localStorage
    // — useMemo isn't a viable replacement.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, pendingChallengeOptions: options }));
  }, [
    state.gameOver,
    state.pendingChallengeOptions,
    state.hasPickedChallengeThisYear,
    state.currentMonth,
    state.currentWeek,
    state.currentYear,
    state.roster,
    state.cash,
  ]);

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

  // Block advancing the calendar while any modal is up — the user has to
  // resolve the year-start / reward / game-over flow before more time
  // passes.
  const isModalBlocking =
    !!state.gameOver ||
    !!state.pendingChallengeOptions ||
    !!state.pendingRewardOptions ||
    !!yearlyReview;

  const handleAdvanceMonth = () => {
    if (isModalBlocking) return;
    setState((prev) => {
      const next = advanceMonth(prev);
      // Yearly review fires once on Jan W1 of each year — guarded by
      // lastYearlyReviewYear so the Jan W2/W3/W4 ticks don't re-trigger.
      // The yearly review fires BEFORE the challenge-select modal so the
      // user sees the recap of the year they just cleared, then picks
      // the next challenge.
      const reviewYear = next.currentYear - 1;
      if (
        next.currentMonth === 1 &&
        next.currentWeek === 1 &&
        next.lastYearlyReviewYear !== reviewYear &&
        reviewYear >= 2026
      ) {
        setYearlyReview(computeYearlyReview(next, reviewYear));
        return { ...next, lastYearlyReviewYear: reviewYear };
      }
      return next;
    });
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === 'n' || e.key === 'N') {
        if (isModalBlocking) return;
        setState((prev) => advanceMonth(prev));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalBlocking]);

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

  const handlePickChallenge = (chosen: ActiveChallenge) =>
    setState((prev) => ({
      ...prev,
      currentChallenge: chosen,
      hasPickedChallengeThisYear: true,
      pendingChallengeOptions: null,
    }));

  const handlePickReward = (rewardId: string) =>
    setState((prev) => {
      const applied = applyReward(prev, rewardId as never);
      return { ...applied, pendingRewardOptions: null };
    });

  const handleStartNewRun = () => setState((prev) => freshGameState(prev.runHistory));

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        cash={state.cash}
        week={state.currentWeek}
        month={state.currentMonth}
        year={state.currentYear}
        reputation={computeReputation(state)}
        tabs={navTabs}
        activeTab={activeTab}
        onChangeTab={(key) => setActiveTab(key as TabKey)}
        onAdvanceMonth={handleAdvanceMonth}
        saveMenu={<SaveMenu state={state} onImport={(s) => setState(s)} />}
      />
      <ChallengeStickyBar state={state} />
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
            onJumpTab={(t) => setActiveTab(t as TabKey)}
            onChange={setState}
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
          </div>
        )}
      </main>
      <StatusBar
        hints={
          selectedPlayer
            ? '[N] next week · [ESC] close drawer'
            : '[N] next week · click any player to drill in'
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
      {/*
        Modal stack ordering: yearly review first (informational recap),
        then reward pick (post-success), then challenge select (year ahead),
        then game over (terminal). Each next step shows once the prior is
        cleared. Game over takes precedence over everything else.
      */}
      {!yearlyReview && state.gameOver ? (
        <GameOverModal state={state} onStartNewRun={handleStartNewRun} />
      ) : null}
      {!yearlyReview &&
      !state.gameOver &&
      state.pendingRewardOptions &&
      state.pendingRewardOptions.length > 0 ? (
        <RewardSelectModal
          options={state.pendingRewardOptions}
          year={state.currentYear - 1}
          onPick={handlePickReward}
        />
      ) : null}
      {!yearlyReview &&
      !state.gameOver &&
      !state.pendingRewardOptions &&
      state.pendingChallengeOptions &&
      state.pendingChallengeOptions.length > 0 ? (
        <ChallengeSelectModal
          year={state.currentYear}
          options={state.pendingChallengeOptions}
          onPick={handlePickChallenge}
        />
      ) : null}
    </div>
  );
}
