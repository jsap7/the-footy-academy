import { CHALLENGE_LIBRARY } from './challenges';
import { hireScout } from './gameActions';
import { generateScoutMarket } from './scoutMarket';
import { generateStartingRoster } from './startingRoster';
import { advanceMonth } from './turnLoop';
import { INITIAL_GAME_STATE, type ActiveChallenge, type GameState } from '../types';

function buildRosterChallenge(rosterCount: number): ActiveChallenge {
  const def = CHALLENGE_LIBRARY.find((c) => c.id === 'build_roster')!;
  return {
    defId: def.id,
    tier: def.tier,
    title: def.title,
    description: def.description,
    unit: def.unit,
    yearStarted: 2026,
    target: def.baseTarget,
    progress: Math.min(rosterCount, def.baseTarget),
    meta: {},
  };
}

/** Populated game state for the landing-page dashboard preview (real UI, not a mock). */
export function createLandingDemoState(): GameState {
  let state: GameState = {
    ...INITIAL_GAME_STATE,
    roster: generateStartingRoster(),
    scoutMarket: generateScoutMarket(2, 2026),
    facilityTier: 2,
    hasPickedChallengeThisYear: true,
    currentChallenge: buildRosterChallenge(4),
  };

  const scoutsToHire = state.scoutMarket.slice(0, 2);
  for (const scout of scoutsToHire) {
    state = hireScout(state, scout.id);
  }

  for (let week = 0; week < 20; week++) {
    state = advanceMonth(state);
    if (state.gameOver) break;
    state = {
      ...state,
      pendingChallengeOptions: null,
      pendingRewardOptions: null,
      gameOver: null,
      hasPickedChallengeThisYear: true,
      recentBirthdays: [],
      recentReleases: [],
      recentSales: [],
      recentFacilityEvents: [],
      recentForcedScoutFires: [],
      recentAchievements: [],
      recentStatMilestones: [],
      recentNationalTeamCallups: [],
      recentNationalTeamDrops: [],
      recentVeterans: [],
    };
  }

  return {
    ...state,
    pendingChallengeOptions: null,
    pendingRewardOptions: null,
    gameOver: null,
    hasPickedChallengeThisYear: true,
    currentChallenge: buildRosterChallenge(state.roster.length),
  };
}
