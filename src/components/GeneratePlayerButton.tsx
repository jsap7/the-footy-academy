type Props = {
  onGenerate: () => void;
};

export default function GeneratePlayerButton({ onGenerate }: Props) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      className="rounded-md border border-neutral-700 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
    >
      Generate Player
    </button>
  );
}
