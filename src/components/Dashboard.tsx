import { useState } from 'react';
import type { GameState } from '../types';
import AchievementsPage from './AchievementsPage';
import ChallengeProgressWidget from './ChallengeProgressWidget';
import FinancesPage from './FinancesPage';
import FacilityCard from './FacilityCard';
import CompactAchievements from './dashboard/CompactAchievements';
import CompactBurn from './dashboard/CompactBurn';
import CompactGoals from './dashboard/CompactGoals';
import CompactReputation from './dashboard/CompactReputation';
import FacilityRow from './dashboard/FacilityRow';
import HeroStrip from './dashboard/HeroStrip';
import HiredScoutsWidget from './dashboard/HiredScoutsWidget';
import InteractiveCashChart from './dashboard/InteractiveCashChart';
import Modal from './dashboard/Modal';
import TopOffersWidget from './dashboard/TopOffersWidget';
import TopShortlistWidget from './dashboard/TopShortlistWidget';

type Props = {
  state: GameState;
  onJumpTab: (tab: 'roster' | 'shortlist' | 'scouts' | 'offers') => void;
  onChange: (next: GameState) => void;
  onUpgradeFacility: () => void;
  onDowngradeFacility: () => void;
};

type Overlay = 'finances' | 'achievements' | 'facility' | null;

export default function Dashboard({
  state,
  onJumpTab,
  onChange,
  onUpgradeFacility,
  onDowngradeFacility,
}: Props) {
  const [overlay, setOverlay] = useState<Overlay>(null);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col gap-3 px-6 py-4">
      {state.currentChallenge ? <ChallengeProgressWidget state={state} /> : null}

      <HeroStrip state={state} />

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <TopShortlistWidget
            state={state}
            onChange={onChange}
            onJumpTab={() => onJumpTab('shortlist')}
            onJumpScouts={() => onJumpTab('scouts')}
          />
        </div>
        <div className="col-span-4">
          <TopOffersWidget
            state={state}
            onChange={onChange}
            onJumpTab={() => onJumpTab('offers')}
          />
        </div>
        <div className="col-span-4">
          <HiredScoutsWidget
            state={state}
            onChange={onChange}
            onJumpTab={() => onJumpTab('scouts')}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 flex flex-col gap-3">
          <InteractiveCashChart
            history={state.cashHistory}
            currentCash={state.cash}
            onShowDetails={() => setOverlay('finances')}
          />
          <FacilityRow
            state={state}
            onUpgrade={onUpgradeFacility}
            onManage={() => setOverlay('facility')}
          />
        </div>
        <div className="col-span-5 grid grid-cols-2 gap-3">
          <CompactBurn state={state} onShowDetails={() => setOverlay('finances')} />
          <CompactReputation state={state} />
          <CompactGoals state={state} />
          <CompactAchievements state={state} onShowAll={() => setOverlay('achievements')} />
        </div>
      </div>

      {overlay === 'finances' ? (
        <Modal title="finances" onClose={() => setOverlay(null)}>
          <FinancesPage state={state} />
        </Modal>
      ) : null}
      {overlay === 'achievements' ? (
        <Modal title="achievements" onClose={() => setOverlay(null)}>
          <AchievementsPage state={state} />
        </Modal>
      ) : null}
      {overlay === 'facility' ? (
        <Modal title="facility" onClose={() => setOverlay(null)}>
          <FacilityCard
            state={state}
            onUpgrade={() => {
              onUpgradeFacility();
              setOverlay(null);
            }}
            onDowngrade={() => {
              onDowngradeFacility();
              setOverlay(null);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
