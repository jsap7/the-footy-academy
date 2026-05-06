export type AchievementId =
  | 'first_sale'
  | 'first_million_sale'
  | 'first_10m_sale'
  | 'first_50m_sale'
  | 'first_generational_find'
  | 'first_generational_sale'
  | 'tier_2_facility'
  | 'tier_3_facility'
  | 'tier_4_facility'
  | 'tier_5_facility'
  | 'survive_first_year'
  | 'survive_5_years'
  | 'survive_10_years'
  | 'develop_player_to_potential'
  | 'find_3_generational'
  | 'sell_to_tier_1_club'
  | 'roster_of_10_players'
  | 'lvl_5_scout_hired'
  | 'develop_late_bloomer'
  | 'never_went_negative_5_years';

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
};

export type Achievement = AchievementDefinition & {
  unlockedAt: { month: number; year: number } | null;
};

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  { id: 'first_sale', title: 'Off the Mark', description: 'Complete your first transfer.' },
  {
    id: 'first_million_sale',
    title: 'Seven Figures',
    description: 'Sell a player for €1M or more.',
  },
  {
    id: 'first_10m_sale',
    title: 'Eight Figures',
    description: 'Sell a player for €10M or more.',
  },
  {
    id: 'first_50m_sale',
    title: 'Marquee Move',
    description: 'Sell a player for €50M or more.',
  },
  {
    id: 'first_generational_find',
    title: 'Once in a Generation',
    description: 'Sign your first generational-tier player.',
  },
  {
    id: 'first_generational_sale',
    title: 'Cashing In',
    description: 'Sell a generational-tier player.',
  },
  { id: 'tier_2_facility', title: 'Walls Up', description: 'Build the Local Facility.' },
  { id: 'tier_3_facility', title: 'Real Coaching', description: 'Build the Regional Academy.' },
  { id: 'tier_4_facility', title: 'Continental Setup', description: 'Build the Elite Academy.' },
  { id: 'tier_5_facility', title: 'World-Class', description: 'Build the World-Class facility.' },
  { id: 'survive_first_year', title: 'Year One', description: 'Survive a full calendar year.' },
  { id: 'survive_5_years', title: 'Half a Decade', description: 'Survive five calendar years.' },
  { id: 'survive_10_years', title: 'Ten-Year Project', description: 'Survive ten calendar years.' },
  {
    id: 'develop_player_to_potential',
    title: 'Full Stretch',
    description: 'Develop a player to within 5% of their full potential.',
  },
  {
    id: 'find_3_generational',
    title: 'Eye for Talent',
    description: 'Sign three generational players over the course of your career.',
  },
  {
    id: 'sell_to_tier_1_club',
    title: 'Big Time',
    description: 'Sell a player to a tier-1 club (Real Madrid, Man City, Bayern, PSG).',
  },
  {
    id: 'roster_of_10_players',
    title: 'Full House',
    description: 'Carry ten players on the roster simultaneously.',
  },
  { id: 'lvl_5_scout_hired', title: 'Best in the Business', description: 'Hire a level-5 scout.' },
  {
    id: 'develop_late_bloomer',
    title: 'Patience Pays',
    description: 'Develop a player with the late_bloomer trait to within 5% of their potential.',
  },
  {
    id: 'never_went_negative_5_years',
    title: 'Steady Hand',
    description: 'Operate for five full years without ever going below €0 cash.',
  },
] as const;

export const ALL_ACHIEVEMENT_IDS = ACHIEVEMENT_DEFINITIONS.map((d) => d.id);
