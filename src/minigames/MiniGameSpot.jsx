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
  const [opened, setOpened] = useState([]);
  const totalFlags = useMemo(() => game.messages.filter((m) => m.flag).length, [game.messages]);
  const foundFlags = opened.filter((id) => game.messages.find((m) => m.id === id)?.flag).length;
  const done = foundFlags === totalFlags;

  function open(id) {
    setOpened((o) => (o.includes(id) ? o : [...o, id]));
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
          {foundFlags} of {totalFlags} things to stop and think about
        </span>
      </div>

      <div className="chat">
        {game.messages.map((m) => {
          const isOpen = opened.includes(m.id);
          const cls = !isOpen
            ? 'msg'
            : m.flag
              ? 'msg cleared flagged'
              : 'msg cleared was-fine';
          return (
            <button
              key={m.id}
              type="button"
              className={cls}
              onClick={() => open(m.id)}
              disabled={isOpen}
              aria-label={isOpen ? undefined : 'Tap to clear the fog off this message'}
            >
              <span>{m.text}</span>
              {isOpen && (
                <span className="msg-note">
                  {m.flag ? <Flag size={15} /> : <Check size={15} />}
                  {m.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpened([])}>
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
