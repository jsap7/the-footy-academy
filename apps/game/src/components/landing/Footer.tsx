import { spaClick } from '../../util/router';

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-10 text-[11px] uppercase tracking-[0.10em] text-ink-dim sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <div className="flex items-center gap-3">
          <span className="text-ink">the footy academy</span>
          <span className="text-ink-faint">·</span>
          <span>v1.0</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/game"
            onClick={spaClick('/game')}
            className="transition-colors hover:text-accent"
          >
            play
          </a>
          <a
            href="https://github.com/jsap7/the-footy-academy"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            github ↗
          </a>
          <span className="text-ink-faint hidden sm:inline">·</span>
          <span className="hidden sm:inline">built with vite + react + tailwind</span>
        </div>
      </div>
    </footer>
  );
}
