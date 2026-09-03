/**
 * Dev-only content override layer for the in-browser Copy Editor
 * (src/dev/CopyEditor.jsx).
 *
 * Edits are stored in localStorage and merged over the realm data at read
 * time (see getBandView in src/data/realms.js), so the game shows them live
 * without touching source. "Save to source" in the editor is what writes
 * them into src/data/realms.js for real, via the dev-server plugin
 * (vite-plugin-copy-editor.js).
 *
 * Everything here is inert in a production build: `import.meta.env.DEV` is
 * false, so the store stays empty and `applyOverrides` returns its input
 * untouched.
 */

const KEY = 'cwq-copy-overrides/v1';
export const DEV = import.meta.env.DEV;

let store = load();
let version = 0;
const listeners = new Set();

function load() {
  if (!DEV || typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota — the in-memory copy still works this session */
  }
}

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Stable-across-renders snapshot for useSyncExternalStore. */
export function overridesVersion() {
  return version;
}

export function getOverrides() {
  return store;
}

export function overrideCount() {
  return Object.keys(store).length;
}

export function setOverride(key, value) {
  store = { ...store, [key]: value };
  persist();
  emit();
}

export function removeOverride(key) {
  if (!(key in store)) return;
  const next = { ...store };
  delete next[key];
  store = next;
  persist();
  emit();
}

export function clearOverrides() {
  store = {};
  persist();
  emit();
}

/* --------------------------------------------------------------------------
 * Path scheme
 *   <realmId>|<scope>|<dotPath>
 * scope is the band ('lower' / 'higher') for band content, or 'shared' for
 * the realm-level name / blurb / topic / intro (which both bands display).
 * ------------------------------------------------------------------------ */

const SHARED = /^(name|blurb|topic)$/;

export function scopeFor(dotPath, band) {
  return SHARED.test(dotPath) || dotPath.startsWith('intro') ? 'shared' : band;
}

export function overrideKey(realmId, dotPath, band) {
  return `${realmId}|${scopeFor(dotPath, band)}|${dotPath}`;
}

function setDeep(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    node = node[/^\d+$/.test(p) ? Number(p) : p];
    if (node == null) return;
  }
  const last = parts[parts.length - 1];
  node[/^\d+$/.test(last) ? Number(last) : last] = value;
}

const clone =
  typeof structuredClone === 'function'
    ? structuredClone
    : (x) => JSON.parse(JSON.stringify(x));

/** Return `view` with any matching overrides applied (a fresh clone), or the
 *  same reference when nothing matches. */
export function applyOverrides(view, realmId, band) {
  if (!DEV) return view;
  const prefixes = [`${realmId}|${band}|`, `${realmId}|shared|`];
  const hits = Object.keys(store).filter((k) => prefixes.some((p) => k.startsWith(p)));
  if (!hits.length) return view;
  const out = clone(view);
  for (const k of hits) {
    const dotPath = k.slice(k.indexOf('|', k.indexOf('|') + 1) + 1);
    setDeep(out, dotPath, store[k]);
  }
  return out;
}

/* --------------------------------------------------------------------------
 * Introspection — walk a raw band view and list every editable string.
 * ------------------------------------------------------------------------ */

// Keys whose string value is player-facing copy.
const EDITABLE_KEYS = new Set([
  'text',
  'note',
  'prompt',
  'response',
  'followUp',
  'accept',
  'feedback',
  'miss',
  'why',
  'checkNote',
  'instruction',
  'title',
  'sub',
  'lore',
  'learnShort',
  'name',
  'blurb',
  'topic',
]);

// Branches that never hold editable copy.
const SKIP_KEYS = new Set([
  'world',
  'stamp',
  'bands',
  'accent',
  'accentWash',
  'id',
  'enabled',
  'fullMechanic',
  'reportBlockEligible',
  'type',
  'slots',
  'musts', // item ids and a cap, not copy (Balance Bay's Three Musts gate)
  'items', // items[].text/.checkNote are editable, targeted walk below
]);

function humanize(dotPath, view) {
  const seg = dotPath.split('.');
  const n = (i) => Number(seg[i]) + 1;
  if (dotPath === 'name') return 'Realm name';
  if (dotPath === 'blurb') return 'Atlas blurb';
  if (dotPath === 'topic') return 'Topic line';
  if (dotPath === 'intro.lore') return 'Intro — the story';
  if (dotPath === 'intro.learnShort') return 'Intro — short "Learn:" line';
  if (dotPath.startsWith('intro.learn.')) return `Intro — "you'll learn" ${n(2)}`;
  if (dotPath === 'decision.prompt') return 'The question';
  if (dotPath === 'rule.text') return 'The rule';
  if (dotPath === 'game.title') return 'Mini-game — title';
  if (dotPath === 'game.instruction') return 'Mini-game — how to play';
  if (/^game\.questions\.\d+\.text$/.test(dotPath)) return `Quiz — question ${n(2)}`;
  if (/^game\.questions\.\d+\.options\.\d+\.text$/.test(dotPath))
    return `Quiz — Q${n(2)} answer ${String.fromCharCode(65 + Number(seg[4]))}`;
  if (/^game\.questions\.\d+\.options\.\d+\.feedback$/.test(dotPath))
    return `Quiz — Q${n(2)} answer ${String.fromCharCode(65 + Number(seg[4]))} — feedback`;
  if (/^story\.\d+\.text$/.test(dotPath)) {
    const who = view?.story?.[seg[1]]?.who ?? '';
    return `Story line ${n(1)}${who ? ` — ${who}` : ''}`;
  }
  if (/^decision\.options\.\d+\.text$/.test(dotPath)) return `Choice ${String.fromCharCode(65 + Number(seg[2]))} — the option`;
  if (/^decision\.options\.\d+\.response$/.test(dotPath)) return `Choice ${String.fromCharCode(65 + Number(seg[2]))} — what happens`;
  if (/^extraBeats\.\w+\.prompt$/.test(dotPath)) return `Follow-up (${seg[1]}) — question`;
  if (/^extraBeats\.\w+\.followUp$/.test(dotPath)) return `Follow-up (${seg[1]}) — reply`;
  if (/^extraBeats\.\w+\.accept$/.test(dotPath)) return `Follow-up (${seg[1]}) — button`;
  if (/^extraBeats\.\w+\.response$/.test(dotPath)) return `Follow-up (${seg[1]}) — reply`;
  if (/^extraBeats\.\w+\.options\.\d+\.text$/.test(dotPath)) return `Follow-up (${seg[1]}) — option ${n(3)}`;
  if (/^game\.bins\.\d+\.title$/.test(dotPath)) return `Mini-game — bin ${n(2)} name`;
  if (/^game\.bins\.\d+\.sub$/.test(dotPath)) return `Mini-game — bin ${n(2)} hint`;
  if (/^game\.items\.\d+\.text$/.test(dotPath)) return `Mini-game — card ${n(2)}`;
  if (/^game\.verdicts\.\w+$/.test(dotPath)) return `Mini-game — result (${seg[2]})`;
  if (/^game\.items\.\d+\.checkNote$/.test(dotPath)) return `Mini-game, card ${n(2)} (which check)`;
  if (/^game\.stones\.\d+\.checkNote$/.test(dotPath)) return `Mini-game, stone ${n(2)} (which check)`;
  // The named method every game now shows while you play (MethodTrack.jsx)
  if (dotPath === 'game.purpose.name') return 'Method, name';
  if (dotPath === 'game.purpose.why') return 'Method, why it matters';
  if (dotPath === 'game.purpose.prompt') return 'Method, "which check?" question';
  if (/^game\.purpose\.checks\.\d+\.(name|sub)$/.test(dotPath))
    return `Method, check ${n(3)} ${seg[4] === 'sub' ? 'question' : 'name'}`;
  return dotPath;
}

/**
 * @returns {{ key, dotPath, scope, label, original, current, overridden }[]}
 */
export function collectEditable(rawView, realmId, band) {
  const out = [];

  const push = (dotPath, original) => {
    const key = overrideKey(realmId, dotPath, band);
    out.push({
      key,
      dotPath,
      scope: scopeFor(dotPath, band),
      label: humanize(dotPath, rawView),
      original,
      current: key in store ? store[key] : original,
      overridden: key in store,
    });
  };

  const walk = (node, prefix) => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => {
        if (typeof v === 'string') {
          if (v.trim() && /(^|\.)learn$/.test(prefix)) push(`${prefix}.${i}`, v);
        } else {
          walk(v, `${prefix}.${i}`);
        }
      });
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        if (EDITABLE_KEYS.has(k) && v.trim()) push(p, v);
      } else {
        walk(v, p);
      }
    }
  };

  walk(rawView, '');

  // `items` is skipped wholesale above (to dodge items[].id/.bin/.check);
  // pick its two copy fields back up here.
  (rawView.game?.items ?? []).forEach((it, i) => {
    if (typeof it.text === 'string' && it.text.trim()) push(`game.items.${i}.text`, it.text);
    if (typeof it.checkNote === 'string' && it.checkNote.trim())
      push(`game.items.${i}.checkNote`, it.checkNote);
  });

  return out;
}

/* --------------------------------------------------------------------------
 * Screen copy — the opening story and the tutorial tours. Same override
 * store, keyed  screen|<screenId>|<dotPath>  (three segments, so the
 * CopyEditor's `key.split('|')` handling still lines up). The text arrays
 * themselves live in their components and are passed in by the editor;
 * this registry only holds where they are and which fields to expose.
 * ------------------------------------------------------------------------ */

export const SCREENS = [
  {
    id: 'intro',
    label: 'Opening story',
    file: 'src/components/IntroStory.jsx',
    fields: ['text', 'cta'],
    labelFor: (i, f, item) =>
      f === 'cta'
        ? `Beat ${i + 1} — button`
        : `Beat ${i + 1} — ${item?.kind === 'comet' ? 'Comet' : 'scene'}`,
  },
  {
    id: 'roomTour',
    label: 'Tutorial · the room',
    file: 'src/components/TravelerRoom.jsx',
    fields: ['title', 'text'],
    labelFor: (i, f) => `Step ${i + 1} — ${f === 'title' ? 'heading' : 'text'}`,
  },
  {
    id: 'atlasTour',
    label: 'Tutorial · the Atlas',
    file: 'src/components/AtlasMap.jsx',
    fields: ['title', 'text'],
    labelFor: (i, f) => `Step ${i + 1} — ${f === 'title' ? 'heading' : 'text'}`,
  },
  {
    id: 'realmTour',
    label: 'Tutorial · how a realm works',
    file: 'src/components/RealmIntro.jsx',
    fields: ['title', 'text'],
    labelFor: (i, f) => `Step ${i + 1} — ${f === 'title' ? 'heading' : 'text'}`,
  },
  {
    id: 'diary',
    label: 'The diary (room)',
    file: 'src/components/AtlasGate.jsx',
    fields: ['text'],
    labelFor: (i, f, item) => item?.label ?? `Line ${i + 1}`,
  },
  {
    id: 'certificate',
    label: 'The passport (end)',
    file: 'src/components/CertificateScreen.jsx',
    fields: ['text'],
    labelFor: (i, f, item) => item?.label ?? `Line ${i + 1}`,
  },
];

export const SCREEN_BY_ID = Object.fromEntries(SCREENS.map((s) => [s.id, s]));

export function screenKey(screenId, dotPath) {
  return `screen|${screenId}|${dotPath}`;
}

/** Apply screen overrides over a plain array of beat/step objects — a fresh
 *  clone when something matches, the same reference otherwise. Inert in a
 *  production build (`!DEV`). */
export function applyScreenOverrides(arr, screenId) {
  if (!DEV) return arr;
  const prefix = `screen|${screenId}|`;
  const hits = Object.keys(store).filter((k) => k.startsWith(prefix));
  if (!hits.length) return arr;
  const out = clone(arr);
  for (const k of hits) setDeep(out, k.slice(prefix.length), store[k]);
  return out;
}

/**
 * @returns {{ key, dotPath, scope, label, original, current, overridden }[]}
 */
export function collectScreenEditable(arr, screenId) {
  const screen = SCREEN_BY_ID[screenId];
  if (!screen || !Array.isArray(arr)) return [];
  const out = [];
  arr.forEach((item, i) => {
    for (const f of screen.fields) {
      const original = item?.[f];
      if (typeof original !== 'string' || !original.trim()) continue;
      const dotPath = `${i}.${f}`;
      const key = screenKey(screenId, dotPath);
      out.push({
        key,
        dotPath,
        scope: screenId,
        label: screen.labelFor(i, f, item),
        original,
        current: key in store ? store[key] : original,
        overridden: key in store,
      });
    }
  });
  return out;
}
