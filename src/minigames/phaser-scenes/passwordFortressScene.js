/**
 * Passworld's P4–P6 mechanic (Milestones Phase 2): a small single-screen
 * Arcade-physics platformer. Collect the letter/number/symbol tiles (up on
 * platforms — you have to jump for them) to build a strong password; the
 * "123456"/"password" tiles sit right on the ground, shinier and easier to
 * reach, and are worth nothing. A patrolling guard gives a soft, harmless
 * bump — no fail state (design.md §8), same as every other mini-game here.
 *
 * All art is procedural (Phaser Graphics → generateTexture) rather than
 * sprite sheets — see /assets/README.md for why: nothing here should block
 * on the designer's real art, and dimensions are easier to get right once
 * this is actually running than guessed at ahead of time.
 */

const INK = 0x1f3452;
const PAPER = 0xf1f5f6;
const GOLD = 0xe0a030;
const TEAL = 0x2d8c7f;
const HAZARD = 0xc76b5c;

export function makePasswordFortressConfig(Phaser, { game, controlsRef, onProgress, onWin }) {
  const tiles = game.tiles ?? [];
  const hazardCfg = game.hazard;
  const platformLayout = [
    { x: 0, y: 262, w: 560, h: 18 }, // ground
    { x: 140, y: 192, w: 100, h: 14 }, // A
    { x: 300, y: 142, w: 100, h: 14 }, // B — the hazard patrols here
    { x: 440, y: 192, w: 100, h: 14 }, // C
  ];

  class PasswordFortressScene extends Phaser.Scene {
    constructor() {
      super('password-fortress');
    }

    preload() {
      this.buildTextures();
    }

    buildTextures() {
      const g = this.add.graphics();

      // Traveler — same flat-shape language as world/Traveler.jsx, just
      // simplified for a 24×32 sprite.
      g.clear();
      g.fillStyle(INK, 1);
      g.fillRoundedRect(0, 8, 24, 24, 7);
      g.fillStyle(GOLD, 1);
      g.fillRoundedRect(0, 4, 24, 11, 5);
      g.fillStyle(PAPER, 1);
      g.fillCircle(8, 13, 2);
      g.fillCircle(16, 13, 2);
      g.generateTexture('traveler', 24, 32);

      // Hazard — a rounded, unthreatening blob. Not a villain, just a bump.
      g.clear();
      g.fillStyle(HAZARD, 1);
      g.fillRoundedRect(0, 0, 28, 24, 11);
      g.fillStyle(PAPER, 1);
      g.fillCircle(9, 10, 2.4);
      g.fillCircle(19, 10, 2.4);
      g.generateTexture('hazard', 28, 24);

      // Tiles
      g.clear();
      g.fillStyle(TEAL, 1);
      g.fillRoundedRect(0, 0, 34, 34, 8);
      g.lineStyle(2, INK, 0.5);
      g.strokeRoundedRect(1, 1, 32, 32, 8);
      g.generateTexture('tile-real', 34, 34);

      g.clear();
      g.fillStyle(GOLD, 1);
      g.fillRoundedRect(0, 0, 34, 34, 8);
      g.lineStyle(2, INK, 0.5);
      g.strokeRoundedRect(1, 1, 32, 32, 8);
      g.generateTexture('tile-decoy', 34, 34);

      g.destroy();
    }

    create() {
      // ---- platforms ----
      this.platforms = this.physics.add.staticGroup();
      for (const p of platformLayout) {
        const key = `plat-${p.x}-${p.y}`;
        if (!this.textures.exists(key)) {
          const g = this.add.graphics();
          g.fillStyle(INK, 0.85);
          g.fillRoundedRect(0, 0, p.w, p.h, 4);
          g.generateTexture(key, p.w, p.h);
          g.destroy();
        }
        const body = this.platforms.create(p.x + p.w / 2, p.y + p.h / 2, key);
        body.refreshBody();
      }

      // ---- player ----
      this.player = this.physics.add.sprite(30, 210, 'traveler').setBounce(0.05);
      this.player.body.setSize(20, 26).setOffset(2, 4);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms);
      this.facing = 1;

      // ---- tiles ----
      this.collected = new Set();
      this.decoyWarned = new Set();
      this.realTotal = tiles.filter((t) => t.kind === 'real').length;
      this.tileGroup = this.physics.add.staticGroup();
      this.tileById = new Map(tiles.map((t) => [t.id, t]));
      for (const t of tiles) {
        const sprite = this.tileGroup.create(t.x, t.y, t.kind === 'real' ? 'tile-real' : 'tile-decoy');
        sprite.setData('id', t.id);
        const label = this.add.text(t.x, t.y, t.label, {
          fontFamily: 'monospace',
          fontSize: t.label.length > 2 ? '9px' : '14px',
          color: '#ffffff',
        }).setOrigin(0.5);
        sprite.setData('label', label);
      }
      this.physics.add.overlap(this.player, this.tileGroup, (_player, sprite) =>
        this.onTileTouch(sprite),
      );

      // ---- hazard ----
      if (hazardCfg) {
        this.hazard = this.physics.add.sprite(hazardCfg.patrolFrom, hazardCfg.y, 'hazard');
        this.hazard.body.setAllowGravity(false);
        this.hazard.body.setImmovable(true);
        this.tweens.add({
          targets: this.hazard,
          x: hazardCfg.patrolTo,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        });
        this.physics.add.overlap(this.player, this.hazard, () => this.onHazardHit());
      }

      // ---- HUD (Phaser-drawn; the accessible text-equivalent lives in the
      // React wrapper's DOM, this is just the in-scene reinforcement) ----
      this.hudText = this.add.text(12, 10, '', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#1f3452',
      });
      this.toastText = this.add
        .text(280, 36, '', {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#1f3452',
          align: 'center',
          wordWrap: { width: 320 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);
      this.updateHud();

      // ---- input ----
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
      ]);
      this.controlsRef = controlsRef;
      this.hitCooldown = 0;
    }

    onTileTouch(sprite) {
      if (!sprite.active) return;
      const t = this.tileById.get(sprite.getData('id'));
      if (!t) return;

      if (t.kind === 'real') {
        this.collectTile(sprite);
        this.collected.add(t.id);
        this.updateHud();
        onProgress?.(this.collected.size, this.realTotal);
        if (this.collected.size >= this.realTotal) this.winSequence();
      } else if (!this.decoyWarned.has(t.id)) {
        this.decoyWarned.add(t.id);
        this.flashToast('That one’s easy to guess — look for a locked one instead.');
      }
    }

    /** A satisfying pop instead of the tile just vanishing (design.md §10). */
    collectTile(sprite) {
      const label = sprite.getData('label');
      sprite.body.enable = false;
      this.tweens.add({
        targets: [sprite, label],
        scale: 1.6,
        alpha: 0,
        duration: 260,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          sprite.destroy();
          label?.destroy();
        },
      });
      this.spawnCollectBurst(sprite.x, sprite.y);
    }

    spawnCollectBurst(x, y) {
      const colors = [TEAL, GOLD, INK];
      for (let i = 0; i < 6; i += 1) {
        const angle = (i / 6) * Math.PI * 2;
        const dot = this.add.circle(x, y, 3, colors[i % colors.length]);
        this.tweens.add({
          targets: dot,
          x: x + Math.cos(angle) * 28,
          y: y + Math.sin(angle) * 28,
          alpha: 0,
          duration: 380,
          ease: 'Cubic.easeOut',
          onComplete: () => dot.destroy(),
        });
      }
    }

    onHazardHit() {
      if (this.hitCooldown > 0 || !this.player.active) return;
      this.hitCooldown = 700;
      const dir = this.player.x < this.hazard.x ? -1 : 1;
      this.player.setVelocity(dir * 160, -160);
      this.player.setTint(HAZARD);
      this.time.delayedCall(180, () => this.player.clearTint());
      this.flashToast('Bumped — no harm done, just try a different path up.');
    }

    flashToast(msg) {
      this.toastText.setText(msg);
      this.tweens.killTweensOf(this.toastText);
      this.toastText.setAlpha(1);
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1400, duration: 500 });
    }

    updateHud() {
      const n = this.collected.size;
      const strength = n === 0 ? 'Weak' : n < this.realTotal ? 'Building…' : 'Strong';
      this.hudText.setText(`Password strength: ${strength}  (${n}/${this.realTotal})`);
    }

    winSequence() {
      this.physics.pause();
      this.flashToast('Vault secured!');
      const left = this.add.rectangle(140, 140, 280, 280, INK, 0.92);
      const right = this.add.rectangle(420, 140, 280, 280, INK, 0.92);
      this.tweens.add({ targets: left, x: -140, duration: 700, ease: 'Cubic.easeIn' });
      this.tweens.add({
        targets: right,
        x: 700,
        duration: 700,
        ease: 'Cubic.easeIn',
        onComplete: () => onWin?.(this.realTotal),
      });
    }

    update(_time, delta) {
      if (this.hitCooldown > 0) this.hitCooldown -= delta;
      if (!this.player?.active || this.physics.world.isPaused) return;

      const c = this.controlsRef?.current ?? {};
      const left = this.cursors.left.isDown || this.wasd.A.isDown || c.left;
      const right = this.cursors.right.isDown || this.wasd.D.isDown || c.right;
      const jumpPressed = this.cursors.up.isDown || this.wasd.W.isDown || c.jump;

      if (left) {
        this.player.setVelocityX(-140);
        this.facing = -1;
      } else if (right) {
        this.player.setVelocityX(140);
        this.facing = 1;
      } else {
        this.player.setVelocityX(0);
      }
      this.player.setFlipX(this.facing < 0);

      if (jumpPressed && this.player.body.blocked.down) {
        this.player.setVelocityY(-360);
      }
    }
  }

  return {
    scene: PasswordFortressScene,
    physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  };
}
