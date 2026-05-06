import Button from '../ui/Button';
import Card from '../ui/Card';

type Props = {
  hasScouts: boolean;
  onGoToScouts: () => void;
};

export default function EmptyState({ hasScouts, onGoToScouts }: Props) {
  return (
    <Card padded={false}>
      <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
        <p className="text-[20px] uppercase tracking-[0.06em] text-ink">your academy is empty</p>
        <p className="mt-3 max-w-md text-[13px] text-ink-mid font-body">
          {hasScouts
            ? 'wait for your scouts to surface kids each month-end, then sign them from the shortlist.'
            : 'hire a scout to start finding kids — they surface candidates each month-end.'}
        </p>
        {!hasScouts && (
          <div className="mt-8">
            <Button variant="primary" size="lg" onClick={onGoToScouts}>
              go to scouts →
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
