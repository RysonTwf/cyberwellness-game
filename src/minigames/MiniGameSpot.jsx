import { useMemo, useState } from 'react';
import { Flag, Check, RotateCcw, Eye } from 'lucide-react';

/**
 * Generic spot mini-game (design.md §6): a scene config + flagged targets.
 * Used by Privacy Peaks ("Clear the Fog").
 *
 * Every message starts under fog. Tapping clears the fog off that line and
 * says what it is. Tapping a message that turns out to be fine isn't a
 * mistake — it's the point: not everything a stranger says is a trick, and
 * telling the difference is the skill (design.md §8, no fail states).
 */
export default function MiniGameSpot({ game, onComplete }) {
  // Marking is the judgement; revealing is the reward for getting it right.
  // Tapping a message used to clear the fog off it *and* tell you whether it
  // was a real problem — so tapping all of them scored full marks without the
  // player deciding anything. Now they mark the ones worth stopping at and
  // commit to the set; only an exact match opens the notes up.
  const [marked, setMarked] = useState([]);
  const [checked, setChecked] = useState(false);
  const [miss, setMiss] = useState(null);

  const flagIds = useMemo(
    () => game.messages.filter((m) => m.flag).map((m) => m.id),
    [game.messages],
  );
  const totalFlags = flagIds.length;
  const foundFlags = marked.filter((id) => flagIds.includes(id)).length;
  const done = checked;

  function open(id) {
    if (checked) return;
    setMiss(null);
    setMarked((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  }

  function check() {
    const got = [...marked].sort();
    const want = [...flagIds].sort();
    if (got.length === want.length && got.every((id, i) => id === want[i])) {
      setChecked(true);
      setMiss(null);
      return;
    }
    const missed = want.filter((id) => !marked.includes(id)).length;
    const over = marked.filter((id) => !want.includes(id)).length;
    setMiss(
      [
        missed && `${missed} you haven't marked yet`,
        over && `${over} that's actually fine`,
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
        <Flag size={17} color="var(--coral)" />
        <span className="stamp-label">
          {checked
            ? `${foundFlags} of ${totalFlags} — that's the lot`
            : `${marked.length} marked · ${totalFlags} to find`}
        </span>
      </div>

      <div className="chat">
        {game.messages.map((m) => {
          const isMarked = marked.includes(m.id);
          const cls = !checked
            ? `msg${isMarked ? ' marked' : ''}`
            : m.flag
              ? 'msg cleared flagged'
              : 'msg cleared was-fine';
          return (
            <button
              key={m.id}
              type="button"
              className={cls}
              onClick={() => open(m.id)}
              aria-pressed={!checked ? isMarked : undefined}
              disabled={checked}
              aria-label={checked ? undefined : 'Mark this one as worth stopping at'}
            >
              <span>{m.text}</span>
              {checked && (
                <span className="msg-note">
                  {m.flag ? <Flag size={15} /> : <Check size={15} />}
                  {m.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!checked && (
        <>
          {miss && <p className="tile-hint">Not yet — there's {miss}. Have another look.</p>}
          <div className="center">
            <button
              type="button"
              className="btn btn-accent"
              disabled={marked.length === 0}
              onClick={check}
            >
              <Check size={19} />
              That's my answer
            </button>
          </div>
        </>
      )}

      {done && (
        <div className="redirect settled">
          <span className="ic">
            <Eye size={22} />
          </span>
          <p>
            Fog's gone. Four things in one short chat — and the one asking your favourite game
            was fine all along. That's the bit most travelers get wrong in the other direction.
          </p>
        </div>
      )}

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={16} />
          Fog it back up
        </button>
        {done && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(foundFlags)}>
            Done looking
          </button>
        )}
      </div>
    </div>
  );
}
