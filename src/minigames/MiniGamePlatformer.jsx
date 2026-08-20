import { useRef, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import PhaserMiniGame from './PhaserMiniGame';
import { makePasswordFortressConfig } from './phaser-scenes/passwordFortressScene';

/**
 * RETIRED — not registered in RealmScreen's GAMES, referenced by nothing.
 *
 * Superseded by PlatformerStoryRealm.jsx, which owns Passworld P4-P6 end to
 * end and mounts PhaserMiniGame itself. Unregistering this was the last thing
 * holding a Phaser import inside RealmScreen.jsx, which no longer touches
 * that chunk at all.
 *
 * Kept in the tree rather than deleted. Delete or reuse deliberately.
 */

/**
 * P4–P6 Passworld mechanic ("Guard the Vault: Level Up", Milestones Phase 2).
 * Phaser owns the actual gameplay (physics, collision, the win animation);
 * this wrapper is the thin, accessible shell around it — a text-equivalent
 * progress readout, and the same "retry anytime / explicit Done button"
 * pattern the other mini-games use (design.md §8: no fail states, no timer).
 *
 * Touch controls are real DOM buttons, not canvas-drawn — the scene just
 * polls `controlsRef` each frame alongside actual keyboard state, so
 * keyboard and touch are equally first-class (design.md §8 input parity).
 */
export default function MiniGamePlatformer({ game, onComplete }) {
  const total = game.tiles.filter((t) => t.kind === 'real').length;
  const [collected, setCollected] = useState(0);
  const [won, setWon] = useState(false);
  const [round, setRound] = useState(0); // bump to force a fresh Phaser instance
  const controlsRef = useRef({ left: false, right: false, jump: false });

  const hold = (key) => ({
    onMouseDown: () => { controlsRef.current[key] = true; },
    onMouseUp: () => { controlsRef.current[key] = false; },
    onMouseLeave: () => { controlsRef.current[key] = false; },
    onTouchStart: (e) => { e.preventDefault(); controlsRef.current[key] = true; },
    onTouchEnd: (e) => { e.preventDefault(); controlsRef.current[key] = false; },
  });

  function retry() {
    setWon(false);
    setCollected(0);
    controlsRef.current = { left: false, right: false, jump: false };
    setRound((r) => r + 1);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <PhaserMiniGame
        key={round}
        config={(Phaser) =>
          makePasswordFortressConfig(Phaser, {
            game,
            controlsRef,
            onProgress: (n) => setCollected(n),
            onWin: () => setWon(true),
          })
        }
      />

      <p className="tile-hint">{won ? 'Vault secured.' : `${collected} of ${total} secured`}</p>

      <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ minWidth: 56, minHeight: 48 }}
          aria-label="Move left"
          {...hold('left')}
        >
          ←
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ minWidth: 72, minHeight: 48 }}
          aria-label="Jump"
          {...hold('jump')}
        >
          Jump
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ minWidth: 56, minHeight: 48 }}
          aria-label="Move right"
          {...hold('right')}
        >
          →
        </button>
      </div>

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
          <RotateCcw size={16} />
          Try again
        </button>
        {won && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(total)}>
            <Check size={19} />
            Guard secured
          </button>
        )}
      </div>
    </div>
  );
}
