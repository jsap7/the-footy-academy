// Annual inflation: 3%/year applied at-use-time to operating costs, scout
// salaries (only new hires), facility monthly + upgrade costs, signing fees,
// and stipends. NOT applied to: monthly base income (stays €5k), market
// values, or club wealth ceilings.

export const ANNUAL_INFLATION_RATE = 0.03;
export const INFLATION_BASE_YEAR = 2026;

export function getInflationFactor(currentYear: number): number {
  const yearsSinceStart = Math.max(0, currentYear - INFLATION_BASE_YEAR);
  return Math.pow(1 + ANNUAL_INFLATION_RATE, yearsSinceStart);
}

// Round at the call site so cents don't bleed into the UI. Hoisted helper
// since every inflated cost lookup wants this exact rounding.
export function applyInflation(amount: number, currentYear: number): number {
  return Math.round(amount * getInflationFactor(currentYear));
}
