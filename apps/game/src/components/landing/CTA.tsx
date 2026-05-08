import { spaClick } from '../../util/router';

export default function CTA() {
  return (
    <section className="border-t border-hairline bg-bg-elev/30">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="relative overflow-hidden rounded-md border border-hairline-bright bg-bg-elev px-8 py-14 sm:px-14 lg:px-20 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              background:
                'repeating-linear-gradient(135deg, var(--color-accent) 0 1px, transparent 1px 22px)',
            }}
          />
          <div className="relative flex flex-col items-start gap-6 text-balance md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="text-[11px] uppercase tracking-[0.18em] text-accent-bright">
                ready, gaffer?
              </span>
              <h2 className="mt-3 text-[36px] leading-[1.05] sm:text-[44px] lg:text-[52px] text-ink">
                start a fresh academy.
                <br />
                <span className="text-accent-bright">do not get attached.</span>
              </h2>
              <p className="mt-5 max-w-xl text-[14px] leading-[1.65] text-ink-mid font-body">
                Free. Local. No account needed. Your save lives in the browser. The squeeze is
                already loaded.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/game"
                onClick={spaClick('/game')}
                className="cta-glow inline-flex items-center gap-3 rounded-[5px] border border-accent bg-accent px-6 py-4 text-[14px] uppercase tracking-[0.10em] text-bg transition-colors hover:bg-accent-bright hover:border-accent-bright"
              >
                <span>play now</span>
                <span className="font-mono text-[12px] tracking-normal text-bg/70">→</span>
              </a>
              <a
                href="https://github.com/jsap7/the-footy-academy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[5px] border border-hairline-bright bg-bg px-4 py-4 text-[12px] uppercase tracking-[0.10em] text-ink-mid transition-colors hover:bg-bg-elev-2 hover:text-ink"
              >
                <span>source on github</span>
                <span className="text-ink-faint">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
