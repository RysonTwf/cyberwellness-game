import { useMemo, useState } from 'react';
import { Lock, LockOpen, Send, Trash2, Check, Info, RotateCcw } from 'lucide-react';
import { playSfx } from '../lib/sfx';
import { drawBalanced } from '../lib/draw';
import MethodTrack, { CheckPrompt } from '../components/MethodTrack';

/**
 * Generic sort mini-game (design.md §6): takes items + two labelled bins.
 * Used by Passworld ("Guard the Vault", "Before You Post") and Bully Bog
 * ("Clear the Water").
 *
 * Controls, per design.md §5 and §8:
 *  - drag the card onto a bin (desktop)
 *  - or just tap a bin (touch/keyboard) — HTML5 drag doesn't fire on touch,
 *    and this is a touch-first product, so tap is the primary path
 * There is no fail state: a card in the wrong bin gets a warm one-liner and
 * is filed correctly, and the whole game can be retried freely.
 *
 * Two things stop a clean run being bought rather than earned
 * (thingstoimproveon.md):
 *
 *  - **The round is drawn.** `game.roundSize` items come out of a larger
 *    authored pool each run, balanced across the bins (lib/draw.js). The old
 *    behaviour re-asked the *same items in the same words*, so one blind run
 *    told you every answer and bought a guaranteed clean one.
 *  - **The check gets named.** Where `game.purpose.nameTheCheck` is set, an
 *    item filed correctly then asks *which* check it falls foul of, with the
 *    spent-key rule S.U.R.E. proved out (a key you've tried is disabled).
 *    That turns "pick a bin" into a judgement that transfers to an item the
 *    game never showed you.
 *
 * Naming is opt-in per game, not per component: the P1–P3 bands read the
 * method off the track and sort by it, and the P4–P6 bands name it.
 *
 *   game.purpose:   { name, why, checks: [{ key, name, sub }], nameTheCheck?, prompt? }
 *   game.roundSize: how many of `items` to deal each run (optional)
 *   game.items:     [{ id, text, bin, check? checkNote? }], `check` may be an array
 */

const BIN_ICONS = { lock: Lock, unlock: LockOpen, send: Send, trash: Trash2 };

const asKeys = (check) => (Array.isArray(check) ? check : check ? [check] : []);

export default function MiniGameSort({ game, onComplete }) {
  const purpose = game.purpose ?? null;
  const naming = Boolean(purpose?.nameTheCheck);

  const deal = () => drawBalanced(game.items, game.roundSize, 'bin');
  const [round, setRound] = useState(deal);
  const [placed, setPlaced] = useState([]); // { item, bin, correct }
  const [note, setNote] = useState(null);
  const [over, setOver] = useState(null);
  const [dragging, setDragging] = useState(false);

  // The just-filed item, held here while its check is being named.
  const [namingItem, setNamingItem] = useState(null);

  const current = round[placed.length] ?? null;
  const done = !current && !namingItem;
  const binById = useMemo(
    () => Object.fromEntries(game.bins.map((b) => [b.id, b])),
    [game.bins],
  );
  const firstTryCorrect = placed.filter((p) => p.correct).length;
  const allCorrect = placed.length > 0 && firstTryCorrect === placed.length;

  // Ticked once the child has named that check correctly this round, so the
  // track is a record of what they've actually used, not just a legend.
  const cleared = useMemo(
    () => new Set(placed.filter((p) => p.correct && p.named).flatMap((p) => asKeys(p.item.check))),
    [placed],
  );

  function place(binId) {
    if (!current || namingItem) return;
    const correct = current.bin === binId;
    const target = binById[current.bin];
    playSfx(correct ? 'confirm' : 'error');
    setOver(null);
    setDragging(false);

    // Filed right, and it has a check to name, hold it here and ask.
    if (correct && naming && asKeys(current.check).length) {
      setNamingItem({ item: current, spent: [], wrong: null });
      setNote(null);
      return;
    }

    setPlaced((p) => [...p, { item: current, bin: current.bin, correct }]);
    setNote(
      correct
        ? null
        : `Not quite. "${current.text}" goes in ${target.title}: ${target.sub.toLowerCase()}. Putting it there for you.`,
    );
  }

  /**
   * Naming the check. A key already tried on this item is spent, so the row
   * can't be tapped along until one sticks: and a miss costs the item its
   * first-try credit, which is what the finish gate counts. Nothing is lost
   * beyond going round again (design.md §8).
   */
  function nameCheck(key) {
    const { item, spent } = namingItem;
    if (spent.includes(key)) return;
    const right = asKeys(item.check).includes(key);
    playSfx(right ? 'confirm' : 'error');
    if (!right) {
      setNamingItem((n) => ({ ...n, spent: [...n.spent, key], wrong: key }));
      return;
    }
    setPlaced((p) => [
      ...p,
      { item, bin: item.bin, correct: spent.length === 0, named: true },
    ]);
    setNote(item.checkNote ?? null);
    setNamingItem(null);
  }

  function retry() {
    setRound(deal());
    setPlaced([]);
    setNote(null);
    setNamingItem(null);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <MethodTrack purpose={purpose} cleared={cleared} />

      {/* ---- Naming the check for the card just filed ---- */}
      {namingItem && (
        <>
          <div className="tile-stage">
            <div className="tile">{namingItem.item.text}</div>
          </div>
          <CheckPrompt
            checks={purpose.checks}
            prompt={purpose.prompt ?? 'Which check does this one fail?'}
            spent={namingItem.spent}
            onPick={nameCheck}
          />
          {namingItem.wrong && (
            <div className="redirect">
              <span className="ic">
                <Info size={22} />
              </span>
              <p>Not that one. Read it again and think about what it would actually cost.</p>
            </div>
          )}
        </>
      )}

      {/* ---- The card being sorted ---- */}
      {!done && !namingItem && (
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
            {placed.length + 1} of {round.length}. Drag it to a box, or just tap one.
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
              All sorted. {firstTryCorrect} of {round.length} right on the first try.
              {firstTryCorrect < round.length
                ? ' The ones that move are the ones worth remembering.'
                : ' No mistakes at all.'}
            </p>
          </div>
        </div>
      )}

      {note && !done && !namingItem && (
        <div className="redirect">
          <span className="ic">
            <Info size={22} />
          </span>
          <p>{note}</p>
        </div>
      )}

      {/* ---- The two bins ---- */}
      {!namingItem && (
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
      )}

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
          <RotateCcw size={16} />
          Sort again
        </button>
        {/* Finishing takes a clean run, not just a finished one. Every item
            still gets filed into its right bin as you go — that's the teaching
, but a misfile (or a misnamed check) means the round doesn't
            count, otherwise you could hit any bin every time and reach "Done"
            having judged nothing. No penalty beyond going again, and the next
            round is a different draw (design.md §8). */}
        {done && allCorrect && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(firstTryCorrect)}>
            Done sorting
          </button>
        )}
        {done && !allCorrect && (
          <p className="tile-hint">
            {firstTryCorrect} of {placed.length} right first time. Sort again to clear it, and you will
            get a different handful.
          </p>
        )}
      </div>
    </div>
  );
}
