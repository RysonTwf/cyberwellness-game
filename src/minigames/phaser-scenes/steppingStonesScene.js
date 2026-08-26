/**
 * Privacy Peaks' P4–P6 mechanic (Milestones Phase 2): the stepping-stone
 * decision run. The actual decision logic (which stone, correct/incorrect,
 * progress, when it's done) lives in React — same pattern as MiniGameSpot —
 * so this scene is deliberately dumb: it draws the run of stones and fog,
 * and exposes one method, `hopTo(index, correct)`, that the React wrapper
 * calls after each choice to move the Traveler token and tint the resolved
 * stone. One-directional (React → Phaser) keeps this simple to reason about.
 *
 * The stone/token/fog art itself is declared once in `steppingStonesArt.js`
 * (Milestones Phase 4) — this scene only ever refers to its texture keys.
 */

import { buildSteppingStonesArt, preloadSteppingStonesArt } from './steppingStonesArt';
import { motionTween } from '../../lib/motion';

// Only the few tints this scene applies at runtime live here — everything the
// art itself is drawn with belongs to steppingStonesArt.js.
const TEAL = 0x2d8c7f;
const GOLD = 0xe0a030;

export function makeSteppingStonesConfig(Phaser, { stones, onSceneReady }) {
  class SteppingStonesScene extends Phaser.Scene {
    constructor() {
      super('stepping-stones');
    }

    preload() {
      // Real sprite sheets if a skin's been set, otherwise the built-in
      // stand-ins — see steppingStonesArt.js for how to swap them.
      preloadSteppingStonesArt(this);
    }

    create() {
      buildSteppingStonesArt(this);

      const n = stones.length;
      const marginX = 46;
      const usableW = 560 - marginX * 2;

      // fog bank behind everything — the 560x220 texture is drawn centred on
      // the same band the old fillRect(0, 60, 560, 220) covered.
      this.add.image(280, 170, 'ss-fog');

      this.stoneSprites = stones.map((s, i) => {
        const x = marginX + (usableW * i) / Math.max(n - 1, 1);
        const y = 150 + (i % 2 === 0 ? -20 : 20);
        const sprite = this.add.image(x, y, 'ss-stone');
        this.add
          .text(x, y, String(i + 1), {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#1f3452',
          })
          .setOrigin(0.5);
        return { x, y, sprite };
      });

      const start = this.stoneSprites[0];
      this.traveler = this.add.image(start?.x ?? 40, (start?.y ?? 150) - 22, 'ss-token');

      onSceneReady?.(this);
    }

    hopTo(index, correct) {
      const target = this.stoneSprites[index];
      if (!target) return;
      target.sprite.setTint(correct ? TEAL : GOLD);
      // Purely the visual slide — the actual feedback (safe/unsafe, the
      // explanation) is DOM text in MiniGameSteppingStones.jsx, so this can
      // collapse to a near-instant snap under reduced motion with nothing
      // lost.
      this.tweens.add(motionTween({
        targets: this.traveler,
        x: target.x,
        y: target.y - 22,
        duration: 380,
        ease: 'Sine.inOut',
      }));
    }
  }

  return { scene: SteppingStonesScene };
}
