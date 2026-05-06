import type { BirthdayEvent, GameState, Player, ReleaseEvent } from '../types';

// Auto-release age. Players who hit this age leave the academy for free.
export const RELEASE_AGE = 22;

// Run after the calendar has advanced. Any roster player whose birthMonth
// matches the (already-incremented) currentMonth ages up. Returns the new
// roster + a list of birthday events for the UI banner.
export function processBirthdays(state: GameState): {
  updatedRoster: Player[];
  birthdayEvents: BirthdayEvent[];
} {
  const events: BirthdayEvent[] = [];
  const updatedRoster = state.roster.map((player) => {
    if (player.birthMonth !== state.currentMonth) return player;
    const newAge = player.age + 1;
    events.push({
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      newAge,
    });
    return { ...player, age: newAge };
  });
  return { updatedRoster, birthdayEvents: events };
}

// Run immediately after birthdays so a player who just turned 22 in this
// same tick is released. Returns the surviving roster + release events.
export function processReleases(roster: readonly Player[]): {
  updatedRoster: Player[];
  releaseEvents: ReleaseEvent[];
} {
  const events: ReleaseEvent[] = [];
  const updatedRoster: Player[] = [];
  for (const player of roster) {
    if (player.age >= RELEASE_AGE) {
      events.push({
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        finalAge: player.age,
      });
      continue;
    }
    updatedRoster.push(player);
  }
  return { updatedRoster, releaseEvents: events };
}
