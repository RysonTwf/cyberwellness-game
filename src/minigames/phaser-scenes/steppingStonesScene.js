/**
 * Privacy Peaks' P4–P6 mechanic (Milestones Phase 2): the stepping-stone
 * decision run. The actual decision logic (which stone, correct/incorrect,
 * progress, when it's done) lives in React — same pattern as MiniGameSpot —
 * so this scene is deliberately dumb: it draws the run of stones and fog,
 * and exposes one method, `hopTo(index, correct)`, that the React wrapper
 * calls after each choice to move the Traveler token and tint the resolved
 * stone. One-directional (React → Phaser) keeps this simple to reason about.
 */

const INK = 0x1f3452;
const PAPER_SUNK = 0xe7edef;
const TEAL = 0x2d8c7f;
const GOLD = 0xe0a030;

export function makeSteppingStonesConfig(Phaser, { stones, onSceneReady }) {
  class SteppingStonesScene extends Phaser.Scene {
    constructor() {
      super('stepping-stones');
    }

    create() {
      const n = stones.length;
      const marginX = 46;
      const usableW = 560 - marginX * 2;

      // fog bank behind everything
      const fog = this.add.graphics();
      fog.fillStyle(0xffffff, 0.4);
      fog.fillRect(0, 60, 560, 220);

      const stoneTex = this.add.graphics();
      stoneTex.fillStyle(PAPER_SUNK, 1);
      stoneTex.fillEllipse(25, 15, 46, 24);
      stoneTex.lineStyle(2, INK, 0.3);
      stoneTex.strokeEllipse(25, 15, 46, 24);
      stoneTex.generateTexture('stone', 50, 30);
      stoneTex.destroy();

      this.stoneSprites = stones.map((s, i) => {
        const x = marginX + (usableW * i) / Math.max(n - 1, 1);
        const y = 150 + (i % 2 === 0 ? -20 : 20);
        const sprite = this.add.image(x, y, 'stone');
        this.add
          .text(x, y, String(i + 1), {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#1f3452',
          })
          .setOrigin(0.5);
        return { x, y, sprite };
      });

      const tg = this.add.graphics();
      tg.fillStyle(INK, 1);
      tg.fillRoundedRect(0, 6, 20, 18, 6);
      tg.fillStyle(TEAL, 1);
      tg.fillRoundedRect(0, 2, 20, 9, 4);
      tg.generateTexture('traveler-token', 20, 26);
      tg.destroy();

      const start = this.stoneSprites[0];
      this.traveler = this.add.image(start?.x ?? 40, (start?.y ?? 150) - 22, 'traveler-token');

      onSceneReady?.(this);
    }

    hopTo(index, correct) {
      const target = this.stoneSprites[index];
      if (!target) return;
      target.sprite.setTint(correct ? TEAL : GOLD);
      this.tweens.add({
        targets: this.traveler,
        x: target.x,
        y: target.y - 22,
        duration: 380,
        ease: 'Sine.inOut',
      });
    }
  }

  return { scene: SteppingStonesScene };
}
