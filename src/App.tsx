import { useState } from 'react';
import GeneratePlayerButton from './components/GeneratePlayerButton';
import PlayerList from './components/PlayerList';
import { generatePlayer } from './game/playerGenerator';
import type { Player } from './types';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleGenerate = () => {
    setPlayers((prev) => [generatePlayer(), ...prev]);
  };

  const handleSelect = (id: string) => {
    setSelectedPlayerId((prev) => (prev === id ? null : id));
  };

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
        <aside className="hidden w-[420px] shrink-0 lg:block">
          {/* Detail panel will be implemented in FOOTY-11 */}
        </aside>
      </main>
    </div>
  );
}
