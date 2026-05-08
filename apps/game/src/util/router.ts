import { useEffect, useState } from 'react';

// Tiny pathname-based router for the two-route landing/game setup. No
// dependency on react-router — we have exactly one transition (/ ↔ /game)
// and a back-button case. Anything more elaborate should switch to a real
// router instead of growing this.

export type Route = 'landing' | 'game';

function routeFromPath(pathname: string): Route {
  return pathname.startsWith('/game') ? 'game' : 'landing';
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? 'landing' : routeFromPath(window.location.pathname),
  );

  useEffect(() => {
    const onChange = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', onChange);
    window.addEventListener('navigate', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('navigate', onChange);
    };
  }, []);

  return route;
}

// Push a new pathname without a full reload + emit a custom event so the
// router hook can re-render. anchors that should SPA-navigate should call
// this from onClick (and prevent default).
export function navigate(pathname: string): void {
  if (window.location.pathname === pathname) return;
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new Event('navigate'));
}

// Drop-in click handler for anchor tags that intercept normal clicks but
// fall back to native navigation on modifier-clicks (cmd/ctrl/shift) so
// "open in new tab" still works.
export function spaClick(pathname: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    e.preventDefault();
    navigate(pathname);
  };
}
