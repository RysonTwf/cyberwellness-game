/**
 * Privacy Peaks' P4–P6 mechanic (Milestones Phase 2): the stepping-stone
 * decision run. The actual decision logic (which stone, correct/incorrect,
 * progress, when it's done) lives in React — same pattern as MiniGameSpot —
 * so this scene is deliberately dumb: it draws the misty ravine, the run of
 * stones and the Traveler, and exposes one method, `hopTo(index, correct)`,
 * that the React wrapper calls after each choice to move the Traveler and
 * mark the resolved stone. One-directional (React → Phaser) keeps this
 * simple to reason about.
 *
 * The stone/token/fog/backdrop art is declared once in
 * `steppingStonesArt.js` (Milestones Phase 4) — this scene only ever refers
 * to its texture keys.
 */

import { buildSteppingStonesArt, preloadSteppingStonesArt } from './steppingStonesArt';
import { motionTween, prefersReducedMotion } from '../../lib/motion';
import boyWalk from '../../assets/characters/boy-walk-1.png';
import girlWalk from '../../assets/characters/girl-walk-1.png';

// The player's CharacterSelect pick, if any — the idle walk frame, the same
// one world/Traveler.jsx and CharacterSelect.jsx show. Loaded into the scene
// so the figure that hops the stones is the one the player chose, not the
// neutral 'ss-token' stand-in. Anything but 'boy'/'girl' keeps the token.
const AVATAR_SRC = { boy: boyWalk, girl: girlWalk };

// Only the runtime tints live here — everything the art is drawn with belongs
// to steppingStonesArt.js. Light tints so a resolved stone still reads as a
// stone (the top face keeps its form) rather than a flat coloured disc.
const STEP_TINT = 0xa9d9cd; // stepped on — a safe one
const SKIP_TINT = 0xf1dcaf; // skipped — a flagged one
const STEP_GLOW = 0x2d8c7f;
const SKIP_GLOW = 0xe0a030;

const W = 560;
const H = 190;

export function makeSteppingStonesConfig(Phaser, { stones, onSceneReady, avatar = null }) {
  class SteppingStonesScene extends Phaser.Scene {
    constructor() {
      super('stepping-stones');
    }

    preload() {
      // Real sprite sheets if a skin's been set, otherwise the built-in
      // stand-ins — see steppingStonesArt.js for how to swap them.
      preloadSteppingStonesArt(this);
      // The player's chosen avatar, when they picked one — used in place of
      // the neutral token below.
      const src = AVATAR_SRC[avatar];
      if (src) this.load.image('ss-avatar', src);
    }

    create() {
      buildSteppingStonesArt(this);
      const reduced = prefersReducedMotion();

      this.add.image(W / 2, H / 2, 'ss-backdrop');

      // One wide fog mass over the ravine. It drifts gently, and `hopTo`
      // slides it off toward the far side and fades it as the crossing is
      // made — the run literally clears the fog. Drawn wider than the canvas
      // and fully feathered, so shifting it never shows an edge.
      this.fog = this.add.image(W * 0.5, H * 0.5, 'ss-fog').setAlpha(0.78);
      this.fogBaseX = this.fog.x;

      if (!reduced) {
        this.tweens.add({
          targets: this.fog, x: this.fog.x + 12, duration: 6000,
          ease: 'Sine.inOut', yoyo: true, repeat: -1,
        });
        // a couple of loose wisps for depth
        [[-60, H * 0.46, 24000], [W + 60, H * 0.64, 31000]].forEach(([fromX, y, dur], i) => {
          const wisp = this.add.image(fromX, y, 'ss-wisp').setAlpha(0.45);
          const toX = i === 0 ? W + 80 : -80;
          this.tweens.add({ targets: wisp, x: toX, duration: dur, repeat: -1, ease: 'Linear' });
        });
      }

      // Stones on a shallow S so the run reads as a path, not a hard zigzag.
      // The right margin is wider so the last stone doesn't crowd the gate.
      const n = stones.length;
      const marginL = 42;
      const marginR = 70;
      const usableW = W - marginL - marginR;
      this.stoneSprites = stones.map((s, i) => {
        const t = n === 1 ? 0 : i / (n - 1);
        const x = marginL + usableW * t;
        const y = 120 + Math.sin(t * Math.PI * 1.6) * 16;
        this.add.image(x, y + 12, 'ss-stone-shadow').setAlpha(0.5);
        const sprite = this.add.image(x, y, 'ss-stone');
        this.add
          .text(x, y - 1, String(i + 1), {
            fontFamily: 'Baloo 2, Nunito, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#5c7185',
          })
          .setOrigin(0.5);
        return { x, y, sprite, glow: null };
      });

      const start = this.stoneSprites[0];
      const hasAvatar = this.textures.exists('ss-avatar');
      // How far above a stone's centre the figure's feet rest. The token frame
      // carries its own headroom/legroom, so it wants a big lift; the avatar
      // sprite is cropped tight to the shoe tips, so it plants much closer.
      this.footLift = hasAvatar ? 6 : 19;
      this.traveler = this.add
        .image(start?.x ?? marginL, (start?.y ?? 120) - this.footLift, hasAvatar ? 'ss-avatar' : 'ss-token')
        .setOrigin(0.5, 1);
      if (hasAvatar) {
        // The walk sprite is delivered at full size (a ~664x931 bounding box);
        // scale it to about the neutral token's height so it reads at the same
        // weight on a stone.
        const h = 48;
        this.traveler.setDisplaySize((h * this.traveler.width) / this.traveler.height, h);
      }
      this.footY = this.traveler.y;

      this.idleBob(reduced);

      onSceneReady?.(this);
    }

    /** A small resting bob, restarted after each hop lands. */
    idleBob(reduced = prefersReducedMotion()) {
      if (reduced) return;
      this.bob = this.tweens.add({
        targets: this.traveler, y: this.footY - 2, duration: 1400,
        ease: 'Sine.inOut', yoyo: true, repeat: -1,
      });
    }

    /** Move the Traveler to stone `index` and mark how that choice landed. */
    hopTo(index, correct) {
      const target = this.stoneSprites[index];
      if (!target) return;

      // Mark the resolved stone: a light tint that keeps its form, a soft
      // glow that stays under it, and a quick scale pop. The explanation
      // itself is DOM text in the wrapper.
      const tint = correct ? STEP_TINT : SKIP_TINT;
      const glowColour = correct ? STEP_GLOW : SKIP_GLOW;
      target.sprite.setTint(tint);
      if (target.glow) target.glow.destroy();
      target.glow = this.add
        .image(target.x, target.y + 3, 'ss-stone-shadow')
        .setTint(glowColour)
        .setAlpha(0)
        .setScale(1.4);
      this.children.moveBelow(target.glow, target.sprite); // glow sits under the stone
      this.tweens.add(motionTween({
        targets: target.glow, alpha: 0.45, duration: 260, ease: 'Sine.out',
      }));
      this.tweens.add(motionTween({
        targets: target.sprite, scaleX: 1.14, scaleY: 1.14,
        duration: 130, yoyo: true, ease: 'Quad.out',
      }));

      // The hop: kill anything still moving the Traveler (the idle bob, a
      // half-finished earlier hop), then slide x across while y arcs up and
      // settles onto the new stone. Restart the bob once it lands.
      const footY = target.y - this.footLift;
      this.footY = footY;
      this.tweens.killTweensOf(this.traveler);
      this.tweens.add(motionTween({
        targets: this.traveler, x: target.x, duration: 380, ease: 'Sine.inOut',
      }));
      this.tweens.add(motionTween({
        targets: this.traveler, y: footY - 20, duration: 180, ease: 'Sine.out',
        onComplete: () => {
          this.tweens.add(motionTween({
            targets: this.traveler, y: footY, duration: 200, ease: 'Sine.in',
            onComplete: () => this.idleBob(),
          }));
        },
      }));

      // Clear the fog as the crossing is made: it slides toward the far side
      // and thins, so the last stone lands on an almost-clear ravine and the
      // gate reads plainly. Kill the ambient drift first so it doesn't fight
      // this for the same `x`.
      this.tweens.killTweensOf(this.fog);
      const progress = (index + 1) / this.stoneSprites.length;
      this.tweens.add(motionTween({
        targets: this.fog,
        x: this.fogBaseX + progress * 150,
        alpha: Math.max(0.12, 0.82 - progress * 0.7),
        duration: 480, ease: 'Sine.out',
      }));
    }
  }

  return { width: W, height: H, scene: SteppingStonesScene };
}
