import { useMemo } from 'react';
import Dashboard from '../Dashboard';
import ChallengeStickyBar from '../ChallengeStickyBar';
import TopBar from '../TopBar';
import { createLandingDemoState } from '../../game/landingDemoState';
import { computeReputation } from '../../game/reputation';
import StatusBar from '../../ui/StatusBar';

const noop = () => {};

export default function LandingGamePreview() {
  const state = useMemo(() => createLandingDemoState(), []);

  const tabs = [
    { key: 'dashboard', label: 'dashboard' },
    { key: 'roster', label: 'roster', badge: state.roster.length },
    { key: 'shortlist', label: 'shortlist', badge: state.shortlist.length },
    {
      key: 'offers',
      label: 'offers',
      badge: state.pendingOffers.filter((o) => o.status === 'pending' || o.status === 'countered')
        .length,
    },
    { key: 'scouts', label: 'scouts' },
  ] as const;

  return (
    <section className="border-t border-hairline bg-bg-elev/20 overflow-x-auto">
      <div className="pointer-events-none min-w-[1280px] select-none">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col shadow-[0_24px_80px_-32px_rgba(0,0,0,0.75)]">
          <TopBar
            cash={state.cash}
            week={state.currentWeek}
            month={state.currentMonth}
            year={state.currentYear}
            reputation={computeReputation(state)}
            tabs={tabs}
            activeTab="dashboard"
            onChangeTab={noop}
            onAdvanceMonth={noop}
          />
          <ChallengeStickyBar state={state} />
          <main className="bg-bg">
            <Dashboard
              state={state}
              onJumpTab={noop}
              onChange={noop}
              onUpgradeFacility={noop}
              onDowngradeFacility={noop}
            />
          </main>
          <StatusBar hints="preview — play to take over" />
        </div>
      </div>
    </section>
  );
}
