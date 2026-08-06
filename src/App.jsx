import { useEffect } from 'react';
import AtlasGate from './components/AtlasGate';
import AtlasMap from './components/AtlasMap';
import RealmScreen from './components/RealmScreen';
import CertificateScreen from './components/CertificateScreen';
import JournalProgress from './components/JournalProgress';
import { useProgress } from './state/useProgress';
import { REALM_BY_ID } from './data/realms';

export default function App() {
  const { state, dispatch, allStamped, reset } = useProgress();
  const { currentScreen, travelerName, realmProgress } = state;

  const realm = REALM_BY_ID[currentScreen] ?? null;
  const onAtlas = currentScreen === 'atlas';

  // Each screen change starts at the top — the page-fold reads as a new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  const go = (screen) => dispatch({ type: 'go', screen });

  return (
    <div className="app">
      <div className="shell">
        {currentScreen !== 'gate' && (
          <JournalProgress
            realmProgress={realmProgress}
            travelerName={travelerName}
            showBack={!onAtlas}
            onOpenAtlas={() => go('atlas')}
          />
        )}

        {currentScreen === 'gate' && (
          <AtlasGate
            onBegin={(name) => {
              dispatch({ type: 'setName', name });
              go('atlas');
            }}
          />
        )}

        {onAtlas && (
          <AtlasMap
            travelerName={travelerName}
            realmProgress={realmProgress}
            allStamped={allStamped}
            onEnter={(id) => go(id)}
            onFinale={() => go('finale')}
          />
        )}

        {realm && (
          <RealmScreen
            // Remount on realm change so each visit starts at its first beat
            key={realm.id}
            realm={realm}
            progress={realmProgress[realm.id]}
            travelerName={travelerName}
            onSettle={(realmId, choiceId) =>
              dispatch({ type: 'settleChoice', realm: realmId, choiceId })
            }
            onStamp={(realmId, score) => dispatch({ type: 'earnStamp', realm: realmId, score })}
            onBackToAtlas={() => go('atlas')}
          />
        )}

        {currentScreen === 'finale' && (
          <CertificateScreen
            travelerName={travelerName}
            realmProgress={realmProgress}
            pledgeSigned={state.pledgeSigned}
            onSign={() => dispatch({ type: 'signPledge' })}
            onBackToAtlas={() => go('atlas')}
            onStartOver={() => reset(false)}
          />
        )}
      </div>
    </div>
  );
}
