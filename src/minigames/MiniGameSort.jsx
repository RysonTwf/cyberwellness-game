import { useMemo, useState } from 'react';
import { Lock, LockOpen, Send, Trash2, Check, Info, RotateCcw } from 'lucide-react';

/**
 * Generic sort mini-game (design.md §6): takes items + two labelled bins.
 * Used by Passworld ("Guard the Vault") and Bully Bog ("Clear the Water").
 *
 * Controls, per design.md §5 and §8:
 *  - drag the card onto a bin (desktop)
 *  - or just tap a bin (touch/keyboard) — HTML5 drag doesn't fire on touch,
 *    and this is a touch-first product, so tap is the primary path
 * There is no fail state: a card in the wrong bin gets a warm one-liner and
 * is filed correctly, and the whole game can be retried freely.
 */

const BIN_ICONS = { lock: Lock, unlock: LockOpen, send: Send, trash: Trash2 };

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function MiniGameSort({ game, onComplete }) {
  const [queue, setQueue] = useState(() => shuffle(game.items));
  const [placed, setPlaced] = useState([]);
  const [note, setNote] = useState(null);
  const [over, setOver] = useState(null);
  const [dragging, setDragging] = useState(false);

  const current = queue[placed.length] ?? null;
  const done = !current;
  const binById = useMemo(
    () => Object.fromEntries(game.bins.map((b) => [b.id, b])),
    [game.bins],
  );
  const firstTryCorrect = placed.filter((p) => p.correct).length;
  const allCorrect = placed.length > 0 && firstTryCorrect === placed.length;

  function place(binId) {
    if (!current) return;
    const correct = current.bin === binId;
    const target = binById[current.bin];

    setPlaced((p) => [...p, { item: current, bin: current.bin, correct }]);
    setNote(
      correct
        ? null
        : `Not quite — "${current.text}" goes in ${target.title}: ${target.sub.toLowerCase()}. Popped it over there for you.`,
    );
    setOver(null);
    setDragging(false);
  }

  function retry() {
    setQueue(shuffle(game.items));
    setPlaced([]);
    setNote(null);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      {/* ---- The card being sorted ---- */}
      {!done && (
        <>
          <div className="tile-stage">
            <div
              className={`tile${dragging ? ' dragging' : ''}`}
              draggable
              onDragStart={() => setDragging(true)}
              onDragEnd={() => {
                setDragging(false);
                setOver(null);
              }}
            >
              {current.text}
            </div>
          </div>
          <p className="tile-hint">
            {placed.length + 1} of {game.items.length} — drag it to a box, or just tap one.
          </p>
        </>
      )}

      {done && (
        <div className="redirect settled">
          <span className="ic">
            <Check size={22} />
          </span>
          <div>
            <p>
              All sorted — {firstTryCorrect} of {game.items.length} filed right the first time.
              {firstTryCorrect < game.items.length
                ? ' The ones that moved are the ones worth remembering.'
                : ' Not one slip.'}
            </p>
          </div>
        </div>
      )}

      {note && !done && (
        <div className="redirect">
          <span className="ic">
            <Info size={22} />
          </span>
          <p>{note}</p>
        </div>
      )}

      {/* ---- The two bins ---- */}
      <div className="bins">
        {game.bins.map((bin) => {
          const Icon = BIN_ICONS[bin.icon] ?? Lock;
          const items = placed.filter((p) => p.bin === bin.id);
          return (
            <div
              key={bin.id}
              className={`bin${over === bin.id ? ' over' : ''}${!done && !over ? ' armed' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(bin.id);
              }}
              onDragLeave={() => setOver((o) => (o === bin.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                place(bin.id);
              }}
            >
              <button
                type="button"
                onClick={() => place(bin.id)}
                disabled={done}
                style={{
                  all: 'unset',
                  cursor: done ? 'default' : 'pointer',
                  display: 'block',
                  width: '100%',
                }}
                aria-label={`Put "${current?.text ?? ''}" in ${bin.title}`}
              >
                <span className="bin-title">
                  <Icon size={19} />
                  {bin.title}
                </span>
                <span className="bin-sub" style={{ display: 'block' }}>
                  {bin.sub}
                </span>
              </button>

              <div className="bin-items">
                {items.map((p) => (
                  <div
                    key={p.item.id}
                    className={`bin-item ${p.correct ? 'right' : 'rethink'}`}
                  >
                    {p.correct ? <Check size={15} /> : <Info size={15} />}
                    {p.item.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
          <RotateCcw size={16} />
          Sort again
        </button>
        {/* Finishing takes a clean run, not just a finished one. Every item
            still gets filed into its right bin as you go — that's the teaching
            — but a misfile means the round doesn't count, otherwise you could
            hit any bin every time and reach "Done" having judged nothing. No
            penalty beyond going again (design.md §8). */}
        {done && allCorrect && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(firstTryCorrect)}>
            Done sorting
          </button>
        )}
        {done && !allCorrect && (
          <p className="tile-hint">
            {firstTryCorrect} of {placed.length} filed right first time. Sort again to clear it.
          </p>
        )}
      </div>
    </div>
  );
}
