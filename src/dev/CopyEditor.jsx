import { useSyncExternalStore, useState, useMemo } from 'react';
import { X, RotateCcw, Copy, Save, Eraser } from 'lucide-react';
import { REALMS, bandViewRaw, COMET_CATCHPHRASE } from '../data/realms';
import { INTRO_BEATS } from '../components/IntroStory';
import { ROOM_TOUR } from '../components/TravelerRoom';
import { ATLAS_TOUR } from '../components/AtlasMap';
import { REALM_TOUR } from '../components/RealmIntro';
import {
  collectEditable,
  collectScreenEditable,
  getOverrides,
  overrideCount,
  overridesVersion,
  removeOverride,
  setOverride,
  clearOverrides,
  subscribe,
  SCREENS,
  SCREEN_BY_ID,
} from './contentOverrides';

const REALMS_FILE = 'src/data/realms.js';

// The text arrays behind each editable screen. Kept here (not in
// contentOverrides.js) so that module stays free of component imports.
const SCREEN_DATA = {
  intro: INTRO_BEATS,
  roomTour: ROOM_TOUR,
  atlasTour: ATLAS_TOUR,
  realmTour: REALM_TOUR,
};

/* ---- turning a plain string into / out of a JS source literal ------------- */

function escapeFor(s, quote) {
  let out = s.replace(/\\/g, '\\\\');
  if (quote === "'") out = out.replace(/'/g, "\\'");
  else if (quote === '"') out = out.replace(/"/g, '\\"');
  else out = out.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return out;
}

const count = (haystack, needle) => haystack.split(needle).length - 1;

/**
 * Find the exact source literal holding `value`, trying each quote style, and
 * the `${COMET_CATCHPHRASE}` template used by every realm's first line.
 * @returns {{ find: string, replace: string } | null}
 */
function locate(fileText, original, next) {
  for (const q of ["'", '"', '`']) {
    const find = q + escapeFor(original, q) + q;
    if (count(fileText, find) === 1) return { find, replace: q + escapeFor(next, q) + q };
  }
  // template literal: `...${COMET_CATCHPHRASE}`
  if (original.endsWith(COMET_CATCHPHRASE) && next.endsWith(COMET_CATCHPHRASE)) {
    const oPre = original.slice(0, -COMET_CATCHPHRASE.length);
    const nPre = next.slice(0, -COMET_CATCHPHRASE.length);
    const find = '`' + escapeFor(oPre, '`') + '${COMET_CATCHPHRASE}`';
    if (count(fileText, find) === 1) {
      return { find, replace: '`' + escapeFor(nPre, '`') + '${COMET_CATCHPHRASE}`' };
    }
  }
  return null;
}

/* ---- grouping fields into sections --------------------------------------- */

function sectionOf(dotPath) {
  if (dotPath === 'name' || dotPath === 'blurb' || dotPath === 'topic' || dotPath.startsWith('intro'))
    return '1 · Realm & intro';
  if (dotPath.startsWith('story')) return '2 · Story';
  if (dotPath.startsWith('decision')) return '3 · The question';
  if (dotPath.startsWith('extraBeats')) return '4 · Follow-up questions';
  if (dotPath.startsWith('game')) return '5 · Mini-game';
  if (dotPath.startsWith('rule')) return '6 · The rule';
  return '7 · Other';
}

/* ---- override key -> a readable "where" ---------------------------------- */

function whereOf(key) {
  const seg = key.split('|');
  if (seg[0] === 'screen') {
    return `${SCREEN_BY_ID[seg[1]]?.label ?? seg[1]} / ${seg[2]}`;
  }
  return `${seg[0]} / ${seg[1]} / ${seg[2]}`;
}

/* ------------------------------------------------------------------------- */

export default function CopyEditor({ initialRealm, initialBand, onClose }) {
  useSyncExternalStore(subscribe, overridesVersion, () => 0);

  const [target, setTarget] = useState(() =>
    REALMS.some((r) => r.id === initialRealm) ? `realm|${initialRealm}` : `realm|${REALMS[0].id}`,
  );
  const [band, setBand] = useState(initialBand === 'higher' ? 'higher' : 'lower');
  const [result, setResult] = useState(null);

  const [kind, id] = target.split('|');
  const isRealm = kind === 'realm';
  const realm = isRealm ? REALMS.find((r) => r.id === id) : null;

  const fields = useMemo(
    () =>
      isRealm
        ? collectEditable(bandViewRaw(realm, band), id, band)
        : collectScreenEditable(SCREEN_DATA[id], id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target, band, overridesVersion()],
  );

  const sections = useMemo(() => {
    const map = new Map();
    for (const f of fields) {
      const s = isRealm ? sectionOf(f.dotPath) : 'Lines';
      if (!map.has(s)) map.set(s, []);
      map.get(s).push(f);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [fields, isRealm]);

  const total = overrideCount();

  const onEdit = (field, value) => {
    setResult(null);
    if (value === field.original) removeOverride(field.key);
    else setOverride(field.key, value);
  };

  const copyChanges = async () => {
    const entries = Object.entries(getOverrides());
    if (!entries.length) return;
    const pretty = entries.map(([key, value]) => `${whereOf(key)}\n  ${value}`).join('\n\n');
    const raw = JSON.stringify(getOverrides(), null, 2);
    const blob = `=== Copy changes (${entries.length}) ===\n\n${pretty}\n\n--- raw ---\n${raw}\n`;
    try {
      await navigator.clipboard.writeText(blob);
      setResult({
        kind: 'ok',
        msg: `Copied ${entries.length} change${entries.length === 1 ? '' : 's'} to the clipboard.`,
      });
    } catch {
      setResult({ kind: 'err', msg: 'Clipboard blocked — open the console; the text is logged there.' });
      // eslint-disable-next-line no-console
      console.log(blob);
    }
  };

  // Re-derive an override's *original* string from the live data, by key.
  const originalFor = (key) => {
    const seg = key.split('|');
    if (seg[0] === 'screen') {
      return { file: SCREEN_BY_ID[seg[1]]?.file, original: getAtPath(SCREEN_DATA[seg[1]], seg[2]) };
    }
    const [rid, scope, dotPath] = seg;
    const rlm = REALMS.find((x) => x.id === rid);
    if (!rlm) return { file: REALMS_FILE, original: undefined };
    const view = bandViewRaw(rlm, scope === 'shared' ? 'lower' : scope);
    return { file: REALMS_FILE, original: getAtPath(view, dotPath) };
  };

  const saveToSource = async () => {
    const overrides = getOverrides();
    if (!Object.keys(overrides).length) return;
    setResult({ kind: 'busy', msg: 'Saving…' });

    let files;
    try {
      const r = await fetch('/__copy-editor/source');
      files = (await r.json()).files;
      if (!files || typeof files !== 'object') throw new Error('no source');
    } catch (e) {
      setResult({ kind: 'err', msg: `Can't reach the dev server (${e.message}). Is npm run dev running?` });
      return;
    }

    const replacements = [];
    const unlocatable = [];
    const applying = [];
    for (const [key, next] of Object.entries(overrides)) {
      const { file, original } = originalFor(key);
      const fileText = file && files[file];
      if (typeof fileText !== 'string' || typeof original !== 'string') {
        unlocatable.push(key);
        continue;
      }
      const hit = locate(fileText, original, next);
      if (!hit) {
        unlocatable.push(key);
        continue;
      }
      replacements.push({ file, ...hit });
      applying.push(key);
    }

    if (!replacements.length) {
      setResult({ kind: 'err', msg: 'Nothing could be matched in the source. Use "Copy changes" instead.' });
      return;
    }

    let saveRes;
    try {
      const r = await fetch('/__copy-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replacements }),
      });
      saveRes = await r.json();
    } catch (e) {
      setResult({ kind: 'err', msg: `Save failed: ${e.message}` });
      return;
    }

    // Drop the overrides that landed in source — HMR reloads the file with the
    // new value baked in, so the localStorage copy is now redundant.
    const failedFinds = new Set((saveRes.failed || []).map((f) => f.find));
    applying.forEach((key, i) => {
      if (!failedFinds.has(replacements[i].find)) removeOverride(key);
    });

    const leftover = unlocatable.length + (saveRes.failed?.length || 0);
    const fileCount = new Set(replacements.map((r) => r.file)).size;
    setResult({
      kind: leftover ? 'warn' : 'ok',
      msg: leftover
        ? `Saved ${saveRes.applied} to source. ${leftover} couldn't be matched — kept in the browser; use "Copy changes" for those.`
        : `Saved ${saveRes.applied} change${saveRes.applied === 1 ? '' : 's'} to ${fileCount} file${fileCount === 1 ? '' : 's'}.`,
    });
  };

  return (
    <div className="copy-editor" role="dialog" aria-label="Copy editor">
      <header className="ce-head">
        <strong>Edit copy</strong>
        <span className="ce-count">{total} change{total === 1 ? '' : 's'}</span>
        <button type="button" className="ce-x" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </header>

      <div className="ce-controls">
        <select value={target} onChange={(e) => { setTarget(e.target.value); setResult(null); }}>
          <optgroup label="Realms">
            {REALMS.map((r) => (
              <option key={r.id} value={`realm|${r.id}`}>{r.name}</option>
            ))}
          </optgroup>
          <optgroup label="Screens">
            {SCREENS.map((s) => (
              <option key={s.id} value={`screen|${s.id}`}>{s.label}</option>
            ))}
          </optgroup>
        </select>
        {isRealm && (
          <select value={band} onChange={(e) => { setBand(e.target.value); setResult(null); }}>
            <option value="lower">P1–P3</option>
            <option value="higher">P4–P6</option>
          </select>
        )}
      </div>

      <div className="ce-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={copyChanges} disabled={!total}>
          <Copy size={14} /> Copy changes
        </button>
        <button type="button" className="btn btn-accent btn-sm" onClick={saveToSource} disabled={!total}>
          <Save size={14} /> Save to source
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => { clearOverrides(); setResult(null); }}
          disabled={!total}
        >
          <Eraser size={14} /> Reset all
        </button>
      </div>

      {result && <p className={`ce-result ce-${result.kind}`}>{result.msg}</p>}

      <div className="ce-body">
        {sections.map(([name, list]) => (
          <section key={name} className="ce-section">
            <h4>{name}</h4>
            {list.map((f) => (
              <div key={f.key} className={`ce-field${f.overridden ? ' changed' : ''}`}>
                <label>
                  {f.label}
                  {f.overridden && (
                    <button
                      type="button"
                      className="ce-reset"
                      title="Reset to original"
                      onClick={() => { removeOverride(f.key); setResult(null); }}
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                </label>
                <textarea
                  rows={Math.min(6, Math.ceil(f.current.length / 52) + 1)}
                  value={f.current}
                  spellCheck
                  onChange={(e) => onEdit(f, e.target.value)}
                />
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function getAtPath(obj, dotPath) {
  return dotPath.split('.').reduce((n, p) => (n == null ? n : n[/^\d+$/.test(p) ? Number(p) : p]), obj);
}
