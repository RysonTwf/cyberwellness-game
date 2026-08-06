import { useState } from 'react';
import { RotateCcw, Scale } from 'lucide-react';

/**
 * "Balance the Day" — Balance Bay (storyline.md).
 *
 * design.md §6 lists only Sort and Spot, but §5's description of this game is
 * a scale rather than two bins, so it gets its own component. Crucially it
 * reuses Sort's control scheme exactly — tap to place, tap to take back — so
 * there's still no new control to learn (design.md §5).
 *
 * There is no single correct split. Only the extremes tip the scale hard,
 * which teaches balance rather than a number.
 */
export default function MiniGameBalance({ game, onComplete }) {
  const [day, setDay] = useState([]); // item ids, in the order they were added

  const slots = game.slots;
  const items = game.items;
  const chosen = day.map((id) => items.find((i) => i.id === id));
  const screenCount = chosen.filter((i) => i.screen).length;
  const lifeCount = chosen.length - screenCount;
  const full = day.length === slots;

  // More screen time drops the left (periwinkle) pan; more of everything else
  // drops the right (teal) pan. Capped so it never looks broken.
  const tilt = day.length ? -((screenCount - lifeCount) / slots) * 15 : 0;

  const verdict = !full
    ? null
    : screenCount >= slots - 1
      ? { tone: 'rethink', text: game.verdicts.allScreen }
      : screenCount === 0
        ? { tone: 'rethink', text: game.verdicts.noScreen }
        : { tone: 'settled', text: game.verdicts.level };

  function add(id) {
    if (full || day.includes(id)) return;
    setDay((d) => [...d, id]);
  }

  function removeAt(index) {
    setDay((d) => d.filter((_, i) => i !== index));
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      {/* ---- The scale ---- */}
      <div className="scale">
        <div className="row-between">
          <span className="stamp-label">
            <Scale size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            The tide
          </span>
          <span className="stamp-label">
            {day.length} / {slots} hours filled
          </span>
        </div>

        <div className="scale-beam" style={{ transform: `rotate(${tilt}deg)` }} />

        <div className="scale-legend">
          <span style={{ color: 'var(--periwinkle)' }}>Screen time · {screenCount}</span>
          <span style={{ color: 'var(--teal)' }}>Everything else · {lifeCount}</span>
        </div>
      </div>

      {/* ---- The six hours ---- */}
      <div className="slots">
        {Array.from({ length: slots }, (_, i) => {
          const item = chosen[i];
          if (!item) {
            return (
              <div key={`empty-${i}`} className="slot">
                Hour {i + 1}
              </div>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              className={`slot filled ${item.screen ? 'screen' : 'life'}`}
              onClick={() => removeAt(i)}
              aria-label={`Take "${item.text}" back out of the day`}
            >
              {item.text}
            </button>
          );
        })}
      </div>

      {/* ---- The things you could do ---- */}
      <div className="pool">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            onClick={() => add(item.id)}
            disabled={full || day.includes(item.id)}
          >
            <span
              className="swatch"
              style={{ background: item.screen ? 'var(--periwinkle)' : 'var(--teal)' }}
            />
            {item.text}
          </button>
        ))}
      </div>

      {verdict && (
        <div className={`redirect${verdict.tone === 'settled' ? ' settled' : ''}`}>
          <span className="ic">
            <Scale size={22} />
          </span>
          <p>{verdict.text}</p>
        </div>
      )}

      <div className="row" style={{ justifyContent: 'center' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setDay([])}
          disabled={!day.length}
        >
          <RotateCcw size={16} />
          Clear the day
        </button>
        <button
          type="button"
          className="btn btn-accent"
          disabled={!full}
          onClick={() => onComplete(lifeCount)}
        >
          {full ? "That's my day" : `Fill ${slots - day.length} more`}
        </button>
      </div>
    </div>
  );
}
