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

export type AchievementCategory =
  | 'sales'
  | 'facility'
  | 'talent'
  | 'survival'
  | 'development'
  | 'misc';

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  category: AchievementCategory;
};

export type Achievement = AchievementDefinition & {
  unlockedAt: { month: number; year: number } | null;
};

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  // Sales
  {
    id: 'first_sale',
    title: 'Off the Mark',
    description: 'Complete your first transfer.',
    category: 'sales',
  },
  {
    id: 'first_million_sale',
    title: 'Seven Figures',
    description: 'Sell a player for €1M or more.',
    category: 'sales',
  },
  {
    id: 'first_10m_sale',
    title: 'Eight Figures',
    description: 'Sell a player for €10M or more.',
    category: 'sales',
  },
  {
    id: 'first_50m_sale',
    title: 'Marquee Move',
    description: 'Sell a player for €50M or more.',
    category: 'sales',
  },
  {
    id: 'first_generational_sale',
    title: 'Cashing In',
    description: 'Sell a generational-tier player.',
    category: 'sales',
  },
  {
    id: 'sell_to_tier_1_club',
    title: 'Big Time',
    description: 'Sell a player to a tier-1 club (Real Madrid, Man City, Bayern, PSG).',
    category: 'sales',
  },
  // Facility
  {
    id: 'tier_2_facility',
    title: 'Walls Up',
    description: 'Build the Local Facility.',
    category: 'facility',
  },
  {
    id: 'tier_3_facility',
    title: 'Real Coaching',
    description: 'Build the Regional Academy.',
    category: 'facility',
  },
  {
    id: 'tier_4_facility',
    title: 'Continental Setup',
    description: 'Build the Elite Academy.',
    category: 'facility',
  },
  {
    id: 'tier_5_facility',
    title: 'World-Class',
    description: 'Build the World-Class facility.',
    category: 'facility',
  },
  // Talent
  {
    id: 'first_generational_find',
    title: 'Once in a Generation',
    description: 'Sign your first generational-tier player.',
    category: 'talent',
  },
  {
    id: 'find_3_generational',
    title: 'Eye for Talent',
    description: 'Sign three generational players over the course of your career.',
    category: 'talent',
  },
  {
    id: 'lvl_5_scout_hired',
    title: 'Best in the Business',
    description: 'Hire a level-5 scout.',
    category: 'talent',
  },
  // Survival
  {
    id: 'survive_first_year',
    title: 'Year One',
    description: 'Survive a full calendar year.',
    category: 'survival',
  },
  {
    id: 'survive_5_years',
    title: 'Half a Decade',
    description: 'Survive five calendar years.',
    category: 'survival',
  },
  {
    id: 'survive_10_years',
    title: 'Ten-Year Project',
    description: 'Survive ten calendar years.',
    category: 'survival',
  },
  {
    id: 'never_went_negative_5_years',
    title: 'Steady Hand',
    description: 'Operate for five full years without ever going below €0 cash.',
    category: 'survival',
  },
  // Development
  {
    id: 'develop_player_to_potential',
    title: 'Full Stretch',
    description: 'Develop a player to within 5% of their full potential.',
    category: 'development',
  },
  {
    id: 'develop_late_bloomer',
    title: 'Patience Pays',
    description: 'Develop a player with the late_bloomer trait to within 5% of their potential.',
    category: 'development',
  },
  // Misc
  {
    id: 'roster_of_10_players',
    title: 'Full House',
    description: 'Carry ten players on the roster simultaneously.',
    category: 'misc',
  },
] as const;

export const ALL_ACHIEVEMENT_IDS = ACHIEVEMENT_DEFINITIONS.map((d) => d.id);

export const ACHIEVEMENT_CATEGORIES: readonly {
  id: AchievementCategory;
  label: string;
}[] = [
  { id: 'sales', label: 'Sales' },
  { id: 'facility', label: 'Facility' },
  { id: 'talent', label: 'Talent' },
  { id: 'survival', label: 'Survival' },
  { id: 'development', label: 'Development' },
  { id: 'misc', label: 'Misc' },
] as const;
