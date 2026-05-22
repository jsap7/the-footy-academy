import { spaClick } from '../../util/router';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pitch-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-12 lg:px-12 lg:py-16">
        <div className="flex items-center justify-between border-b border-hairline pb-4 text-[10px] uppercase tracking-[0.20em] text-ink-faint">
          <span>the footy academy · v1.0</span>
          <span className="hidden sm:block">single-player · browser save</span>
        </div>

        <div className="mt-10 max-w-2xl">
          <h1 className="text-[36px] leading-[0.95] sm:text-[48px] lg:text-[56px] text-ink">
            run a football
            <br />
            <span className="text-accent-bright">academy.</span>{' '}
            <span className="text-ink">go broke trying.</span>
          </h1>
          <p className="mt-5 text-[14px] leading-[1.65] text-ink-mid font-body">
            Scout, sign, develop, and sell youth players. Clear the board&apos;s seasonal challenge
            or lose the run. No accounts — your save stays in the browser.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/game"
              onClick={spaClick('/game')}
              className="cta-glow group inline-flex items-center gap-3 rounded-[5px] border border-accent bg-accent px-5 py-3 text-[13px] uppercase tracking-[0.10em] text-bg transition-colors hover:bg-accent-bright hover:border-accent-bright"
            >
              <span>play now</span>
              <span className="font-mono text-[11px] tracking-normal text-bg/70 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <a
              href="https://github.com/jsap7/the-footy-academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[5px] border border-hairline-bright bg-bg-elev px-4 py-3 text-[12px] uppercase tracking-[0.10em] text-ink-mid transition-colors hover:bg-bg-elev-2 hover:text-ink"
            >
              <span>github</span>
              <span className="text-ink-faint">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
