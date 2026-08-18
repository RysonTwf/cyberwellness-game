import { useCallback, useEffect, useReducer } from 'react';
import { ACTIVE_REALMS } from '../data/realms';

/**
 * Game state (shape follows design.md §7) plus persistence.
 *
 * design.md §7 specified in-memory state only, because it assumed a
 * single-file artifact. This is a real Vite app, so we persist to
 * localStorage instead — which §7 itself anticipated as the follow-up
 * ("worth adding once the base game is built"). Everything stored is
 * game progress and a first name the child typed for themselves; no
 * personal data is collected beyond that (design.md §8).
 */

const STORAGE_KEY = 'cyber-wellness-quest/v1';

function freshRealmProgress() {
  return Object.fromEntries(
    ACTIVE_REALMS.map((r) => [
      r.id,
      {
        storyDone: false,
        choiceMade: null, // id of the option finally settled on
        gameScore: 0,
        stamped: false,
        // Each stamp lands at its own slight angle so the journal reads as
        // hand-stamped rather than templated (design.md §3).
        stampAngle: 0,
      },
    ]),
  );
}

function initialState() {
  return {
    travelerName: '',
    // 'lower' (P1–P3) | 'higher' (P4–P6) | null until the Atlas Gate asks
    // (Improvement Plan §0 — one game, one entry point; band picked once).
    band: null,
    currentScreen: 'room', // room | atlas | <realmId> | finale
    realmProgress: freshRealmProgress(),
    pledgeSigned: false,
    // Nothing is written to storage until the load has happened. Without this
    // the first render's empty state overwrites the saved journal before it's
    // ever read (and StrictMode's double-invoked effects then clobber it for
    // real). It lives in state, not a ref, because a ref would already be set
    // by the time the save effect runs in the same commit.
    hydrated: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...action.state, hydrated: true };

    case 'setName':
      return { ...state, travelerName: action.name };

    case 'setBand':
      return { ...state, band: action.band };

    case 'go':
      return { ...state, currentScreen: action.screen };

    case 'settleChoice':
      return {
        ...state,
        realmProgress: {
          ...state.realmProgress,
          [action.realm]: {
            ...state.realmProgress[action.realm],
            storyDone: true,
            choiceMade: action.choiceId,
          },
        },
      };

    case 'earnStamp':
      return {
        ...state,
        realmProgress: {
          ...state.realmProgress,
          [action.realm]: {
            ...state.realmProgress[action.realm],
            gameScore: action.score ?? 0,
            stamped: true,
            // -6deg .. 6deg, per design.md §3
            stampAngle: state.realmProgress[action.realm].stamped
              ? state.realmProgress[action.realm].stampAngle
              : Math.round((Math.random() * 12 - 6) * 10) / 10,
          },
        },
      };

    case 'signPledge':
      return { ...state, pledgeSigned: true };

    case 'reset':
      return {
        ...initialState(),
        travelerName: action.keepName ? state.travelerName : '',
        hydrated: true,
      };

    default:
      return state;
  }
}

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const base = initialState();
    // Merge defensively: a saved file from an older content set must not
    // leave a realm without its progress object.
    return {
      ...base,
      ...saved,
      realmProgress: Object.fromEntries(
        ACTIVE_REALMS.map((r) => [
          r.id,
          { ...base.realmProgress[r.id], ...saved?.realmProgress?.[r.id] },
        ]),
      ),
    };
  } catch {
    // Private browsing, disabled storage, corrupted JSON — all mean "start fresh".
    return null;
  }
}

export function useProgress() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    dispatch({ type: 'hydrate', state: load() ?? initialState() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — the game still works, it just won't be remembered.
    }
  }, [state]);

  const stampsEarned = ACTIVE_REALMS.filter((r) => state.realmProgress[r.id]?.stamped).length;

  const reset = useCallback((keepName = false) => dispatch({ type: 'reset', keepName }), []);

  return {
    state,
    dispatch,
    stampsEarned,
    allStamped: stampsEarned === ACTIVE_REALMS.length,
    reset,
  };
}
