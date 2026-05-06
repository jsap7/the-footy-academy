import type { Player } from '../types';
import { averagePotential } from '../game/playerStats';

type Props = {
  players: readonly Player[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
};

export default function PlayerList({ players, selectedPlayerId, onSelect }: Props) {
  if (players.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-16 text-sm text-neutral-500">
        No players yet. Generate one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 bg-neutral-950/95 backdrop-blur">
          <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
            <th className="border-b border-neutral-800 px-4 py-2 font-medium">Name</th>
            <th className="border-b border-neutral-800 px-4 py-2 font-medium">Age</th>
            <th className="border-b border-neutral-800 px-4 py-2 font-medium">Pos</th>
            <th className="border-b border-neutral-800 px-4 py-2 text-right font-medium">
              Avg Potential
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const isSelected = player.id === selectedPlayerId;
            return (
              <tr
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={`cursor-pointer border-b border-neutral-900 transition ${
                  isSelected
                    ? 'bg-neutral-800 text-neutral-50'
                    : 'text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <td className="border-b border-neutral-900 px-4 py-2">
                  {player.firstName} {player.lastName}
                </td>
                <td className="border-b border-neutral-900 px-4 py-2 tabular-nums text-neutral-400">
                  {player.age}
                </td>
                <td className="border-b border-neutral-900 px-4 py-2 font-mono text-xs uppercase text-neutral-400">
                  {player.position}
                </td>
                <td className="border-b border-neutral-900 px-4 py-2 text-right tabular-nums">
                  {averagePotential(player)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
