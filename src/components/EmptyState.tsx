import Button from '../ui/Button';

type Props = {
  hasScouts: boolean;
  onGoToScouts: () => void;
};

const ASCII_FRAME = `+----------------------------------+
|                                  |
|        ::            ::          |
|        ::    ____    ::          |
|              \\__/                |
|                                  |
+----------------------------------+`;

export default function EmptyState({ hasScouts, onGoToScouts }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <pre className="text-[14px] leading-tight text-ink-faint select-none">{ASCII_FRAME}</pre>
      <h2 className="mt-8 text-[36px] uppercase leading-tight tracking-[0.04em] text-ink">
        your academy is empty
      </h2>
      <p className="mt-3 max-w-md text-[18px] text-ink-dim">
        {hasScouts
          ? 'wait for your scouts to surface kids each month-end, then sign them from the shortlist.'
          : 'hire a scout to start finding kids — they surface candidates each month-end.'}
      </p>
      {!hasScouts && (
        <div className="mt-8">
          <Button variant="primary" onClick={onGoToScouts}>
            → go to scouts
          </Button>
        </div>
      )}
    </div>
  );
}
