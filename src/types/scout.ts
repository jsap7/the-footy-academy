export type ScoutLevel = 1 | 2 | 3 | 4 | 5;

export type Scout = {
  id: string;
  firstName: string;
  lastName: string;
  level: ScoutLevel;
  monthlySalary: number;
};
