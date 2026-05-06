import { useEffect, useMemo, useState } from 'react';
import EmptyState from './components/EmptyState';
import NavStrip from './components/NavStrip';
import PlayerDetail from './components/PlayerDetail';
import PlayerList from './components/PlayerList';
import TopBar from './components/TopBar';
import { generatePlayer } from './game/playerGenerator';
import Button from './ui/Button';
import SectionHead from './ui/SectionHead';
import StatusBar from './ui/StatusBar';
import { INITIAL_GAME_STATE, type GameState } from './types';

const NAV_TABS = [
  { key: 'roster', label: 'academy' },
  { key: 'scouts', label: 'scouts', hint: 'phase 2', disabled: true },
  { key: 'transfers', label: 'transfers', hint: 'phase 3', disabled: true },
] as const;

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const selectedPlayer = useMemo(
    () =>
      selectedPlayerId
        ? (state.roster.find((p) => p.id === selectedPlayerId) ?? null)
        : null,
    [state.roster, selectedPlayerId],
  );

  const handleGenerate = () => {
    setState((prev) => ({ ...prev, roster: [generatePlayer(), ...prev.roster] }));
  };

  const handleSelect = (id: string) => {
    setSelectedPlayerId((prev) => (prev === id ? null : id));
  };

  const handleClose = () => setSelectedPlayerId(null);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === 'Escape') {
        setSelectedPlayerId(null);
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        setState((prev) => ({ ...prev, roster: [generatePlayer(), ...prev.roster] }));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const generateButton = (
    <Button variant="primary" onClick={handleGenerate} hint="G">
      + generate player
    </Button>
  );

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        cash={state.cash}
        month={state.currentMonth}
        year={state.currentYear}
        squad={state.roster.length}
        rightSlot={generateButton}
      />
      <NavStrip tabs={NAV_TABS} active="roster" />
      <main className="flex min-h-0 flex-1">
        <section className="flex w-full min-w-0 flex-1 flex-col border-r border-hairline">
          <SectionHead label="academy roster" count={state.roster.length} />
          {state.roster.length === 0 ? (
            <EmptyState onGenerate={handleGenerate} />
          ) : (
            <PlayerList
              players={state.roster}
              selectedPlayerId={selectedPlayerId}
              onSelect={handleSelect}
            />
          )}
        </section>
        {selectedPlayer && (
          <aside className="w-[480px] shrink-0">
            <PlayerDetail player={selectedPlayer} onClose={handleClose} />
          </aside>
        )}
      </main>
      <StatusBar
        hints={
          selectedPlayer
            ? '[G] generate · [ESC] close · [↑/↓] navigate'
            : '[G] generate · [↑/↓] navigate'
        }
      />
    </div>
  );
}
