import { spaClick } from '../../util/router';
import Chip from '../../ui/Chip';
import DashboardMock from './DashboardMock';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pitch-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1180px] px-6 pt-10 pb-24 lg:px-12 lg:pt-14 lg:pb-32">
        {/* Top hairline + tag line */}
        <div className="flex items-center justify-between border-b border-hairline pb-4 text-[10px] uppercase tracking-[0.20em] text-ink-faint">
          <span>the footy academy · v0.6</span>
          <span className="hidden sm:block">est. 2026 · single-player</span>
        </div>

        <div className="mt-12 flex flex-col items-stretch gap-12 lg:gap-16">
          {/* Headline */}
          <div className="min-w-0 max-w-full">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" />
              <span>now playable</span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-dim">phase 6 the season</span>
            </div>
            <h1 className="mt-5 text-[40px] leading-[0.95] sm:text-[52px] md:text-[60px] lg:text-[64px] xl:text-[78px] text-ink">
              run a
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              football
              <br />
              <span className="text-accent-bright">academy.</span>
              <br />
              <span className="text-ink">
                go broke
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> </span>
                trying.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[14px] leading-[1.65] text-ink-mid font-body">
              You scout, sign, develop, and sell young players. Every season the board hands you a
              challenge. Clear it and stay in the black, or the run is over. A football management
              roguelike with no margin for sentimental attachments.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
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
                href="#loop"
                className="inline-flex items-center gap-2 rounded-[5px] border border-hairline-bright bg-bg-elev px-4 py-3 text-[12px] uppercase tracking-[0.10em] text-ink-mid transition-colors hover:bg-bg-elev-2 hover:text-ink"
              >
                <span>how it plays</span>
                <span className="text-ink-faint">↓</span>
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-hairline pt-6 text-[11px]">
              <div>
                <div className="uppercase tracking-[0.10em] text-ink-dim">starting cash</div>
                <div className="mt-1 font-pixel text-[20px] tabular-nums leading-none text-ink">
                  €100k
                </div>
              </div>
              <div>
                <div className="uppercase tracking-[0.10em] text-ink-dim">turn cadence</div>
                <div className="mt-1 font-pixel text-[20px] leading-none text-ink">weekly</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.10em] text-ink-dim">end condition</div>
                <div className="mt-1 font-pixel text-[20px] leading-none text-warn">
                  game&nbsp;over
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard mock — hidden on small screens because its
              fixed-width internals would force horizontal scroll. */}
          <div className="hidden min-w-0 md:block">
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[14px] bg-accent/[0.04] blur-3xl" />
              <DashboardMock />
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                <div className="flex items-center gap-2">
                  <Chip tone="muted">live</Chip>
                  <span>jan w1 2026</span>
                </div>
                <span>1280 × 800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
