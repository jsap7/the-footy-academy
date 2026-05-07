import type { GameState } from '../types';

export const SAVE_KEY = 'footy:save:v1';
export const SAVE_VERSION = 1;

export type SavedGame = {
  saveVersion: number;
  state: GameState;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveToLocalStorage(state: GameState): void {
  if (!isBrowser()) return;
  try {
    const blob: SavedGame = { saveVersion: SAVE_VERSION, state };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
  } catch (err) {
    // Quota exceeded or storage disabled — fail silently. The user's session
    // continues; they just won't have a save until next state change.
    // eslint-disable-next-line no-console
    console.warn('[save] failed to write to localStorage', err);
  }
}

export function loadFromLocalStorage(): GameState | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'saveVersion' in parsed &&
      'state' in parsed &&
      (parsed as SavedGame).saveVersion === SAVE_VERSION
    ) {
      return (parsed as SavedGame).state;
    }
    // Mismatched version — refuse rather than risk a corrupted session.
    return null;
  } catch {
    return null;
  }
}

export function clearLocalStorage(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SAVE_KEY);
}

export function exportSaveAsJSON(state: GameState): void {
  if (!isBrowser()) return;
  const blob: SavedGame = { saveVersion: SAVE_VERSION, state };
  const json = JSON.stringify(blob, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  a.download = `footy-save-${stamp}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedSave(raw: string): GameState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'saveVersion' in parsed &&
      'state' in parsed &&
      (parsed as SavedGame).saveVersion === SAVE_VERSION
    ) {
      return (parsed as SavedGame).state;
    }
    return null;
  } catch {
    return null;
  }
}
