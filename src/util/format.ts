const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatCash(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    const trimmed = m >= 10 || m % 1 === 0 ? Math.round(m).toString() : m.toFixed(1);
    return `${sign}€${trimmed}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    const trimmed = k >= 10 || k % 1 === 0 ? Math.round(k).toString() : k.toFixed(1);
    return `${sign}€${trimmed}k`;
  }
  return `${sign}€${abs}`;
}

export function formatMonth(month: number, year: number): string {
  const idx = Math.min(Math.max(month, 1), 12) - 1;
  return `${MONTH_NAMES[idx]} ${year}`;
}

// Weekly calendar format: "Jan W1 2026". Week is 1-4 (4 weeks per month, no
// real ISO weeks — see weekly-turn rework).
export function formatWeek(month: number, week: number, year: number): string {
  const idx = Math.min(Math.max(month, 1), 12) - 1;
  const w = Math.min(Math.max(week, 1), 4);
  return `${MONTH_NAMES[idx]} W${w} ${year}`;
}
