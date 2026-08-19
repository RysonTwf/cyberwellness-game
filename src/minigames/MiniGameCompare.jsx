import { useMemo, useState } from 'react';
import { Check, RotateCcw, ScanSearch, ShieldCheck, X } from 'lucide-react';

/**
 * "Detective / Compare" — Fable Falls (Milestones Phase 2's original plan for
 * this realm, finally built rather than substituted).
 *
 * The SLS activity this mirrors is "Interactive Images, Compare, Short
 * Response", and the thing that stalled it was reading "Compare" as *two
 * photographs*. This game has no photographs by design (design.md/README —
 * SVG shapes only), and for a media-literacy lesson the comparison that
 * actually teaches isn't pixels anyway: it's **the trusted original against
 * the version going around**. So each row pairs one line of the real thing
 * with the retelling, and the player marks every line that doesn't hold up.
 * Text-first also means the text-equivalent instruction Phase 4 asks for is
 * the mechanic itself, not a caption bolted on.
 *
 * Both bands run the same component, differing only in `framework`:
 *   - 'stopcheck' (P1–P3) — a found change is simply something to STOP at.
 *   - 'sure'      (P4–P6) — every change also carries the S.U.R.E. step that
 *                           catches it, and the summary tallies them, which
 *                           is what makes this the "clue board" version.
 *
 * Controls are Sort's and Spot's, deliberately: click to mark, click again to
 * unmark, then commit the set (design.md §5 — no new control to learn).
 * Committing is the judgement — per the 19 Aug design rule a mini-game must
 * not be passable without one, so only an exact match opens the notes. Getting
 * it wrong costs nothing but another look (design.md §8, no fail states).
 */
export default function MiniGameCompare({ game, onComplete }) {
  const [marked, setMarked] = useState([]);
  const [checked, setChecked] = useState(false);
  const [miss, setMiss] = useState(null);

  const changedIds = useMemo(
    () => game.pairs.filter((p) => p.changed).map((p) => p.id),
    [game.pairs],
  );
  const total = changedIds.length;
  const isSure = game.framework === 'sure';

  // Which S.U.R.E. questions did the player's findings actually rely on —
  // shown once they're right, so the framework reads as four questions that
  // caught something rather than four words to memorise.
  const stepsUsed = useMemo(() => {
    if (!isSure) return [];
    const seen = [];
    for (const p of game.pairs) {
      if (p.changed && p.step && !seen.includes(p.step)) seen.push(p.step);
    }
    return seen;
  }, [game.pairs, isSure]);

  function toggle(id) {
    if (checked) return;
    setMiss(null);
    setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  function check() {
    const got = [...marked].sort();
    const want = [...changedIds].sort();
    if (got.length === want.length && got.every((id, i) => id === want[i])) {
      setChecked(true);
      setMiss(null);
      return;
    }
    const missed = want.filter((id) => !marked.includes(id)).length;
    const over = marked.filter((id) => !want.includes(id)).length;
    setMiss(
      [
        missed && `${missed} line${missed > 1 ? 's' : ''} you haven't marked yet`,
        over &&
          `${over} you've marked that actually match${over > 1 ? '' : 'es'} the original`,
      ]
        .filter(Boolean)
        .join(', and '),
    );
  }

  function reset() {
    setMarked([]);
    setChecked(false);
    setMiss(null);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <ScanSearch size={17} color="var(--accent)" />
        <span className="stamp-label">
          {checked
            ? `${total} of ${total} — that's every change`
            : `${marked.length} marked · ${total} that don't match`}
        </span>
      </div>

      <div className="compare">
        <div className="compare-head">
          <span className="compare-col-label">
            <ShieldCheck size={15} />
            {game.original.label}
          </span>
          <span className="compare-col-label going">
            <ScanSearch size={15} />
            {game.going.label}
          </span>
        </div>
        {(game.original.source || game.going.source) && (
          <div className="compare-head compare-source">
            <span>{game.original.source}</span>
            <span>{game.going.source}</span>
          </div>
        )}

        {game.pairs.map((p) => {
          const isMarked = marked.includes(p.id);
          const state = !checked ? '' : p.changed ? ' changed' : ' matches';
          return (
            <div className={`compare-row${state}`} key={p.id}>
              <div className="compare-cell original">
                {p.original ?? <em className="muted">Nothing here in the original.</em>}
              </div>
              <button
                type="button"
                className={`compare-cell going${isMarked && !checked ? ' marked' : ''}${state}`}
                onClick={() => toggle(p.id)}
                aria-pressed={!checked ? isMarked : undefined}
                disabled={checked}
                aria-label={
                  checked ? undefined : "Mark this line as not matching the original"
                }
              >
                <span>{p.going}</span>
                {checked && (
                  <span className="compare-note">
                    {p.changed ? <X size={15} /> : <Check size={15} />}
                    <span>
                      {isSure && p.changed && p.step && (
                        <strong className="sure-tag">{p.step}</strong>
                      )}
                      {p.note}
                    </span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!checked && (
        <>
          {miss && (
            <p className="tile-hint">Not yet — {miss}. Read them side by side again.</p>
          )}
          <div className="center">
            <button
              type="button"
              className="btn btn-accent"
              disabled={marked.length === 0}
              onClick={check}
            >
              <Check size={19} />
              That&rsquo;s my answer
            </button>
          </div>
        </>
      )}

      {checked && (
        <div className="redirect settled">
          <span className="ic">
            <ShieldCheck size={22} />
          </span>
          <p>
            {game.settled}
            {isSure && stepsUsed.length > 0 && (
              <>
                {' '}
                You got there on {stepsUsed.join(', ')} —{' '}
                {stepsUsed.length === 4
                  ? 'all four S.U.R.E. questions earned their place'
                  : `${stepsUsed.length} of the four S.U.R.E. questions`}
                .
              </>
            )}
          </p>
        </div>
      )}

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={16} />
          Start the compare over
        </button>
        {checked && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(total)}>
            {game.doneLabel ?? 'Done comparing'}
          </button>
        )}
      </div>
    </div>
  );
}
