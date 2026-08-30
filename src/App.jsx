import { useEffect } from 'react';
import MainScreen from './components/MainScreen';
import CharacterSelect from './components/CharacterSelect';
import TravelerRoom from './components/TravelerRoom';
import AtlasMap from './components/AtlasMap';
import RealmScreen from './components/RealmScreen';
import RealmIntro from './components/RealmIntro';
import CertificateScreen from './components/CertificateScreen';
import JournalProgress from './components/JournalProgress';
import SchoolLogo from './components/SchoolLogo';
import SettingsMenu from './components/SettingsMenu';
import { useProgress } from './state/useProgress';
import { useUiClickSfx } from './hooks/useUiClickSfx';
import { useUiHoverSfx } from './hooks/useUiHoverSfx';
import { REALM_BY_ID, getBandView } from './data/realms';

export default function App() {
  const { state, dispatch, allStamped, reset } = useProgress();
  const { currentScreen, travelerName, realmProgress, band, avatar, tutorialsSeen } = state;

  useUiClickSfx();
  useUiHoverSfx();

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
      <SettingsMenu />

      {/* The school crest sits top-left on every screen after the opening
          sequence (the title + intro story feature it full-size instead). */}
      {currentScreen !== 'title' && currentScreen !== 'intro' && (
        <SchoolLogo variant="mark" className="corner-logo" />
      )}

      <div className="shell">
        {currentScreen !== 'title' && currentScreen !== 'character' && currentScreen !== 'room' && (
          <JournalProgress
            realmProgress={realmProgress}
            travelerName={travelerName}
            showBack={!onAtlas}
            onOpenAtlas={() => go('atlas')}
            realm={realm}
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
            avatar={avatar}
            onBegin={(name, chosenBand) => {
              dispatch({ type: 'setName', name });
              dispatch({ type: 'setBand', band: chosenBand });
            }}
            onExit={() => go('atlas')}
            showTutorial={!tutorialsSeen?.room}
            onTutorialDone={() => dispatch({ type: 'tutorialDone', key: 'room' })}
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
            showTutorial={!tutorialsSeen?.atlas}
            onTutorialDone={() => dispatch({ type: 'tutorialDone', key: 'atlas' })}
          />
        )}

        {realm && (
          <>
            <RealmScreen
              // Remount on realm change so each visit starts at its first beat
              key={realm.id}
              realm={realm}
              progress={realmProgress[realm.id]}
              travelerName={travelerName}
              avatar={avatar}
              onSettle={(realmId, choiceId) =>
                dispatch({ type: 'settleChoice', realm: realmId, choiceId })
              }
              onStamp={(realmId, score) => dispatch({ type: 'earnStamp', realm: realmId, score })}
              onBackToAtlas={() => go('atlas')}
            />
            <RealmIntro
              // Fresh intro per realm entered, same remount trick as above
              key={`intro-${realm.id}`}
              realm={realm}
              // The lore popup greets every visit until the realm is stamped;
              // revisits go straight in.
              showIntro={!realmProgress[realm.id]?.stamped}
              // The "how a realm works" tour runs once, on the first realm
              // with the walkable pin flow (fullMechanic realms teach their
              // own mechanics on-screen).
              showTutorial={!tutorialsSeen?.realm && !realm.fullMechanic}
              onTutorialDone={() => dispatch({ type: 'tutorialDone', key: 'realm' })}
            />
          </>
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
