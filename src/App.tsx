import { useEffect, useMemo, useState } from 'react';
import GeneratePlayerButton from './components/GeneratePlayerButton';
import PlayerDetail from './components/PlayerDetail';
import PlayerList from './components/PlayerList';
import { generatePlayer } from './game/playerGenerator';
import type { Player } from './types';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const selectedPlayer = useMemo(
    () => (selectedPlayerId ? (players.find((p) => p.id === selectedPlayerId) ?? null) : null),
    [players, selectedPlayerId],
  );

  const handleGenerate = () => {
    setPlayers((prev) => [generatePlayer(), ...prev]);
  };

  const handleSelect = (id: string) => {
    setSelectedPlayerId((prev) => (prev === id ? null : id));
  };

  const handleClose = () => setSelectedPlayerId(null);

  useEffect(() => {
    if (!selectedPlayerId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPlayerId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedPlayerId]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
        <h1 className="text-base font-semibold tracking-tight text-neutral-100">
          The Footy Academy
        </h1>
        <GeneratePlayerButton onGenerate={handleGenerate} />
      </header>
      <main className="flex min-h-0 flex-1">
        <section className="flex w-full min-w-0 flex-1 flex-col border-r border-neutral-800">
          <PlayerList
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelect={handleSelect}
          />
        </section>
        {selectedPlayer && (
          <aside className="w-[460px] shrink-0">
            <PlayerDetail player={selectedPlayer} onClose={handleClose} />
          </aside>
        )}
      </main>
    </div>
  );
}
