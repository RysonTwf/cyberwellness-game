import { useEffect, useState, useSyncExternalStore, lazy, Suspense } from 'react';
import MainScreen from './components/MainScreen';
import IntroStory from './components/IntroStory';
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
import { playMusic, stopMusic } from './lib/music';
import { DEV, subscribe, overridesVersion } from './dev/contentOverrides';

// Dev-only in-browser copy editor (src/dev/CopyEditor.jsx). Code-split so it
// never lands in a production bundle.
const CopyEditor = DEV ? lazy(() => import('./dev/CopyEditor')) : null;

export default function App() {
  const { state, dispatch, allStamped, reset } = useProgress();
  const { currentScreen, travelerName, realmProgress, band, avatar, tutorialsSeen } = state;

  useUiClickSfx();
  useUiHoverSfx();

  // Re-render the whole tree when a Copy Editor override changes so the game
  // reflects it live (no-op version counter in a production build).
  useSyncExternalStore(subscribe, overridesVersion, () => 0);
  const [editorOpen, setEditorOpen] = useState(
    () => DEV && typeof window !== 'undefined' && window.location.hash === '#edit',
  );
  useEffect(() => {
    if (!DEV) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setEditorOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // One looping background track for the whole journey. It starts once the
  // player leaves the title (that transition is a click, which satisfies the
  // browser's autoplay policy) and runs unbroken across every screen after
  // it. On a reload mid-game there's been no gesture yet, so also arm a
  // one-time listener that kicks it off on the first click or key. Back at
  // the title (fresh start, or "start a new journal"), it stops.
  useEffect(() => {
    if (currentScreen === 'title') {
      stopMusic();
      return undefined;
    }
    playMusic('gameplay');
    const kick = () => playMusic('gameplay');
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
    return () => {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
  }, [currentScreen]);

  const go = (screen) => dispatch({ type: 'go', screen });

  return (
    <div className="app">
      <SettingsMenu />

      {/* The school crest sits top-left from the Traveler's Room onward. The
          three prologue screens (title, opening story, character pick) share
          the meadow scene and the crest on the title cover instead. */}
      {!['title', 'intro', 'character'].includes(currentScreen) && (
        <SchoolLogo variant="mark" className="corner-logo" />
      )}

      <div className="shell">
        {!['title', 'intro', 'character', 'room'].includes(currentScreen) && (
          <JournalProgress
            realmProgress={realmProgress}
            travelerName={travelerName}
            showBack={!onAtlas}
            onOpenAtlas={() => go('atlas')}
            realm={realm}
          />
        )}

        {currentScreen === 'title' && <MainScreen onStart={() => go('intro')} />}

        {currentScreen === 'intro' && <IntroStory onDone={() => go('character')} />}

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

      {DEV && (
        <>
          <button
            type="button"
            className="copy-editor-fab"
            onClick={() => setEditorOpen((o) => !o)}
            title="Edit copy (Ctrl/Cmd + Shift + E)"
          >
            ✏️
          </button>
          {editorOpen && (
            <Suspense fallback={null}>
              <CopyEditor
                initialRealm={rawRealm?.id}
                initialBand={band ?? 'lower'}
                onClose={() => setEditorOpen(false)}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
