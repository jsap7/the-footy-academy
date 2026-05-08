import SectionLabel from './SectionLabel';

const STEPS: { n: string; title: string; body: string; chip: string }[] = [
  {
    n: '01',
    title: 'scout',
    chip: 'shortlist',
    body: 'Hire scouts. Better levels surface better tier players. They each surface one prospect per month into your shortlist with a fee locked at find-time.',
  },
  {
    n: '02',
    title: 'sign',
    chip: 'roster',
    body: 'Pick the kids you want. Pay the fee. They go on the permanent roster, eat monthly stipends, and start gaining stats every week — biased by age, potential, and traits.',
  },
  {
    n: '03',
    title: 'develop',
    chip: '+ traits',
    body: 'Facilities multiply growth (1.0× → 1.5×). Traits like Workaholic and Late Bloomer shape every tick. Cross 96 weeks on roster and they go Veteran — +10% dev rate, ×1.15 market value.',
  },
  {
    n: '04',
    title: 'sell',
    chip: 'offers',
    body: 'Clubs send unsolicited bids. Accept, counter, or hold. List with a price and they respond against the asking. Generational sales hit jackpot territory; mid kids barely cover their stipend.',
  },
];

export default function Loop() {
  return (
    <section id="loop" className="border-t border-hairline">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-20 lg:px-12">
        <SectionLabel index="// 01" title="the loop" />
        <h2 className="mt-6 max-w-3xl text-[34px] leading-[1.1] sm:text-[40px] text-ink">
          a tight, four-step rhythm — and an economy that punishes complacency.
        </h2>
        <p className="mt-4 max-w-2xl text-[14px] leading-[1.65] text-ink-mid font-body">
          You scout, sign, develop, sell. Income is flat at €34k a month. Operating costs, stipends,
          facilities, scout salaries are not. Every week ticks down something. Every season the
          board hands you a target. Skip a beat and the squeeze closes.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="group relative flex flex-col rounded-md border border-hairline bg-bg-elev p-5 transition-colors hover:border-accent-dim"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-pixel text-[36px] leading-none text-accent-bright">
                  {s.n}
                </span>
                <span className="rounded-[3px] border border-hairline-bright bg-bg px-1.5 py-[1px] text-[9px] uppercase tracking-[0.14em] text-ink-mid">
                  {s.chip}
                </span>
              </div>
              <h3 className="mt-6 text-[20px] uppercase tracking-[0.10em] text-ink">{s.title}</h3>
              <p className="mt-3 text-[13px] leading-[1.6] text-ink-mid font-body">{s.body}</p>
              <div className="mt-6 flex items-center justify-between border-t border-hairline pt-3 text-[10px] uppercase tracking-[0.14em] text-ink-faint transition-colors group-hover:text-ink-dim">
                <span>step {s.n}</span>
                <span aria-hidden>↘</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
