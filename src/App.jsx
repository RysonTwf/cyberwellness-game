import { useEffect } from 'react';
import MainScreen from './components/MainScreen';
import CharacterSelect from './components/CharacterSelect';
import TravelerRoom from './components/TravelerRoom';
import AtlasMap from './components/AtlasMap';
import RealmScreen from './components/RealmScreen';
import CertificateScreen from './components/CertificateScreen';
import JournalProgress from './components/JournalProgress';
import { useProgress } from './state/useProgress';
import { REALM_BY_ID, getBandView } from './data/realms';

export default function App() {
  const { state, dispatch, allStamped, reset } = useProgress();
  const { currentScreen, travelerName, realmProgress, band } = state;

  const rawRealm = REALM_BY_ID[currentScreen] ?? null;
  // Every screen downstream of the gate reads content for the band chosen
  // there (Improvement Plan §0). Defaults to 'lower' defensively — should
  // only matter for an old saved session from before band-select existed.
  const realm = rawRealm ? getBandView(rawRealm, band ?? 'lower') : null;
  const onAtlas = currentScreen === 'atlas';

  // Each screen change starts at the top. The page itself no longer scrolls
  // (styles.css locks it to the viewport), so this resets whichever side
  // column was scrolled rather than the window.
  useEffect(() => {
    document.querySelector('.stage-side')?.scrollTo({ top: 0 });
  }, [currentScreen]);

  const go = (screen) => dispatch({ type: 'go', screen });

  return (
    <div className="app">
      <div className="shell">
        {currentScreen !== 'title' && currentScreen !== 'character' && currentScreen !== 'room' && (
          <JournalProgress
            realmProgress={realmProgress}
            travelerName={travelerName}
            showBack={!onAtlas}
            onOpenAtlas={() => go('atlas')}
          />
        )}

        {currentScreen === 'title' && <MainScreen onStart={() => go('character')} />}

        {currentScreen === 'character' && (
          <CharacterSelect
            onSelect={(avatar) => {
              dispatch({ type: 'setAvatar', avatar });
              go('room');
            }}
          />
        )}

        {currentScreen === 'room' && (
          <TravelerRoom
            onBegin={(name, chosenBand) => {
              dispatch({ type: 'setName', name });
              dispatch({ type: 'setBand', band: chosenBand });
            }}
            onExit={() => go('atlas')}
          />
        )}

        {onAtlas && (
          <AtlasMap
            travelerName={travelerName}
            realmProgress={realmProgress}
            allStamped={allStamped}
            band={band ?? 'lower'}
            atlasPos={state.atlasPos}
            onAtlasMove={(pos) => dispatch({ type: 'setAtlasPos', pos })}
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
