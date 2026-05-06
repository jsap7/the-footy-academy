import Button from '../ui/Button';

type Props = {
  onGenerate: () => void;
};

const ASCII_FRAME = `+----------------------------------+
|                                  |
|        ::            ::          |
|        ::    ____    ::          |
|              \\__/                |
|                                  |
+----------------------------------+`;

export default function EmptyState({ onGenerate }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <pre className="text-[14px] leading-tight text-ink-faint select-none">{ASCII_FRAME}</pre>
      <h2 className="mt-8 text-[36px] uppercase leading-tight tracking-[0.04em] text-ink">
        your academy is empty
      </h2>
      <p className="mt-3 max-w-md text-[18px] text-ink-dim">
        no players yet. start with a few random kids and see what the generator gives you…
      </p>
      <div className="mt-8">
        <Button variant="primary" onClick={onGenerate} hint="G">
          + generate first player
        </Button>
      </div>
    </div>
  );
}
