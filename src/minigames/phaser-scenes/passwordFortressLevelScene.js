/**
 * Passworld P4–P6, full-level version: the entire realm — the Sam & Tom
 * encounter *and* the vault challenge — happens inside one continuous
 * platformer level, rather than a walk-to-a-hotspot-then-open-a-panel
 * story/decision/game/rule sequence like every other realm.
 *
 * Layout (1120×280 world, 560×280 camera viewport that follows the player):
 *   entry (0–260) → Sam encounter + locked gate (260–420) → vault
 *   platforming (420–980) → win animation, screen-pinned so it isn't
 *   thrown off by however far the camera has scrolled.
 *
 * The decision itself is still plain DOM (React renders `realm.decision`
 * via ChoiceCard, same content as every other realm) — this scene only
 * decides *when* that decision fires (an overlap trigger, not a click) and
 * *what physically blocks progress* until it resolves safely (a gate, not
 * just a locked "next" button). See components/PlatformerStoryRealm.jsx.
 */

import {
  buildPassworldArt,
  platformTexture,
  playerBody,
  preloadPassworldArt,
  spriteScale,
  tileTextureFor,
} from './passworldArt';

// Only the few tints the scene applies at runtime live here — everything the
// art itself is drawn with belongs to passworldArt.js.
const GOLD = 0xe0a030;
const TEAL = 0x2d8c7f;
const HAZARD = 0xc76b5c;

const LEVEL_W = 1120;
const LEVEL_H = 280;

export function makePasswordFortressLevelConfig(
  Phaser,
  { game, controlsRef, onDecisionReached, onProgress, onWin, onSceneReady },
) {
  const tiles = game.tiles ?? [];
  // `hazards` for a level that wants more than one patrol; `hazard` is still
  // honoured for the single-guard levels that predate it.
  const hazardCfgs = game.hazards ?? (game.hazard ? [game.hazard] : []);
  const gateX = game.gateX ?? 300;
  const encounterX = game.encounterX ?? 260;
  const platformLayout = game.platforms ?? [{ x: 0, y: 262, w: LEVEL_W, h: 18 }];

  class PasswordFortressLevelScene extends Phaser.Scene {
    constructor() {
      super('password-fortress-level');
    }

    preload() {
      // Real sprite sheets if they've been dropped in, otherwise the built-in
      // stand-ins — see passworldArt.js for how to swap them.
      preloadPassworldArt(this);
    }

    create() {
      buildPassworldArt(this);

      this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
      this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);

      // ---- background: two parallax layers behind the vault ----
      this.add
        .tileSprite(0, 0, LEVEL_W, LEVEL_H, 'pw-bg-wall')
        .setOrigin(0)
        .setScrollFactor(0.15);
      this.add
        .tileSprite(0, 0, LEVEL_W, LEVEL_H, 'pw-bg-machinery')
        .setOrigin(0)
        .setScrollFactor(0.45);

      // ---- platforms ----
      this.platforms = this.physics.add.staticGroup();
      for (const p of platformLayout) {
        const body = this.platforms.create(
          p.x + p.w / 2,
          p.y + p.h / 2,
          platformTexture(this, p.w, p.h),
        );
        body.refreshBody();
      }

      // ---- player ----
      this.player = this.physics.add.sprite(30, 210, 'pw-traveler').setBounce(0.05);
      this.player.setScale(spriteScale(this, 'pw-traveler'));
      const pb = playerBody(this);
      this.player.body.setSize(pb.width, pb.height).setOffset(pb.offsetX, pb.offsetY);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms);
      this.player.play('pw-idle');
      this.facing = 1;
      this.locked = false;
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

      // ---- the impersonator + the gate they're blocking ----
      // Stood clear of the gate on the player's side — parked at the gate's
      // own x they were drawn behind the bars and barely legible.
      this.add.image(encounterX - 24, 234, 'pw-impostor');
      this.gateBody = this.physics.add.staticImage(gateX, 202, 'pw-gate');
      this.physics.add.collider(this.player, this.gateBody);

      this.decisionTriggered = false;
      const zone = this.add.zone(encounterX, 200, 70, 130);
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      this.physics.add.overlap(this.player, zone, () => {
        if (this.decisionTriggered) return;
        this.decisionTriggered = true;
        this.locked = true;
        this.player.setVelocity(0, 0);
        onDecisionReached?.();
      });

      // ---- tiles ----
      this.collected = new Set();
      this.decoyWarned = new Set();
      this.realTotal = tiles.filter((t) => t.kind === 'real').length;
      this.tileGroup = this.physics.add.staticGroup();
      this.tileById = new Map(tiles.map((t) => [t.id, t]));
      for (const t of tiles) {
        const sprite = this.tileGroup.create(t.x, t.y, tileTextureFor(t));
        sprite.setData('id', t.id);
        const label = this.add
          .text(t.x, t.y - 1, t.label, {
            fontFamily: 'monospace',
            fontSize: t.label.length > 2 ? '9px' : '15px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);
        sprite.setData('label', label);

        if (t.kind === 'real') {
          // a slow hover, so the ones worth having read as "live"
          this.tweens.add({
            targets: [sprite, label],
            y: '-=3',
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
          });
        } else {
          // ...and the decoys glint instead: flashier, but going nowhere
          this.tweens.add({
            targets: sprite,
            alpha: 0.78,
            duration: 620,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
          });
        }
      }
      this.physics.add.overlap(this.player, this.tileGroup, (_player, sprite) =>
        this.onTileTouch(sprite),
      );

      // ---- hazard ----
      for (const cfg of hazardCfgs) {
        const guard = this.physics.add.sprite(cfg.patrolFrom, cfg.y, 'pw-hacker');
        guard.setScale(spriteScale(this, 'pw-hacker'));
        guard.body.setAllowGravity(false);
        guard.body.setImmovable(true);
        guard.play('pw-hacker-move');
        this.tweens.add({
          targets: guard,
          x: cfg.patrolTo,
          // Pace scales with the beat's length so two guards on different
          // runs don't fall into lockstep and become one predictable wall.
          duration: Math.max(1200, Math.abs(cfg.patrolTo - cfg.patrolFrom) * 14),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        });
        this.physics.add.overlap(this.player, guard, () => this.onHazardHit(guard));
      }

      // ---- HUD (screen-pinned — setScrollFactor(0) — so it stays put
      // regardless of how far the camera has scrolled) ----
      this.hudText = this.add
        .text(12, 8, '', { fontFamily: 'sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#1f3452' })
        .setScrollFactor(0);

      // A real strength meter rather than a bare number: housing from the art
      // manifest, with the fill drawn live over it so it can animate as the
      // password gets stronger.
      this.add.image(12, 26, 'pw-meter').setOrigin(0, 0).setScrollFactor(0);
      this.meterFill = this.add.graphics().setScrollFactor(0);
      // 0..1, tweened rather than read straight off the count. It lives on its
      // own object rather than on the scene so that killing its tween can't
      // take any other scene-targeted tween down with it.
      this.meter = { v: 0 };
      this.hintText = this.add
        .text(280, 264, 'Walk right to find out what’s going on.', {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#1f3452',
          align: 'center',
        })
        .setOrigin(0.5, 1)
        .setScrollFactor(0);
      this.toastText = this.add
        .text(280, 36, '', {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#1f3452',
          align: 'center',
          wordWrap: { width: 320 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0)
        .setScrollFactor(0);
      this.updateHud();

      // ---- input ----
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.controlsRef = controlsRef;
      this.hitCooldown = 0;

      onSceneReady?.(this);
    }

    /** Called by React once the decision resolves on the safe option. */
    resolveSafe() {
      this.locked = false;
      this.hintText?.setText('Collect the letter, number, and symbol tiles up on the platforms.');
      this.flashToast('Gate’s open — the real Sam never needed your password anyway.');
      this.tweens.add({
        targets: this.gateBody,
        alpha: 0,
        y: this.gateBody.y - 40,
        duration: 500,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.gateBody.body.enable = false;
        },
      });
    }

    onTileTouch(sprite) {
      if (!sprite.active) return;
      const t = this.tileById.get(sprite.getData('id'));
      if (!t) return;

      const label = sprite.getData('label');

      if (t.kind === 'real') {
        this.collectBurst(sprite.x, sprite.y);
        this.tweens.killTweensOf([sprite, label]);
        label?.destroy();
        sprite.destroy();
        this.collected.add(t.id);
        this.updateHud();
        onProgress?.(this.collected.size, this.realTotal);
        if (this.collected.size >= this.realTotal) this.winSequence();
      } else {
        // A decoy shrugs you off — a shake, not a penalty. It stays on the
        // board so the contrast with the locked tiles keeps teaching.
        if (!this.decoyShaking) {
          this.decoyShaking = true;
          const x0 = sprite.x;
          this.tweens.add({
            targets: [sprite, label],
            x: x0 + 3,
            duration: 55,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              sprite.x = x0;
              if (label) label.x = x0;
              this.decoyShaking = false;
            },
          });
        }
        if (!this.decoyWarned.has(t.id)) {
          this.decoyWarned.add(t.id);
          this.flashToast('That one’s easy to guess — look for a locked one instead.');
        }
      }
    }

    onHazardHit(guard) {
      if (this.hitCooldown > 0 || !this.player.active) return;
      this.hitCooldown = 700;
      const dir = this.player.x < guard.x ? -1 : 1;
      this.player.setVelocity(dir * 160, -160);
      this.player.setTint(HAZARD);
      this.time.delayedCall(180, () => this.player.clearTint());
      this.flashToast('Bumped — no harm done, just try a different path up.');
    }

    flashToast(msg) {
      this.toastText.setText(msg);
      this.tweens.killTweensOf(this.toastText);
      this.toastText.setAlpha(1);
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1600, duration: 500 });
    }

    updateHud() {
      const n = this.collected.size;
      const strength = n === 0 ? 'Weak' : n < this.realTotal ? 'Building…' : 'Strong';
      this.hudText.setText(`Password strength: ${strength}  (${n}/${this.realTotal})`);

      // Tween the fill rather than snapping it, so collecting a tile has a
      // visible consequence up in the HUD and not just on the tile itself.
      const target = this.realTotal ? n / this.realTotal : 0;
      this.tweens.killTweensOf(this.meter);
      this.tweens.add({
        targets: this.meter,
        v: target,
        duration: 420,
        ease: 'Cubic.easeOut',
        onUpdate: () => this.drawMeter(),
        onComplete: () => {
          // Land exactly on the target — a killed-and-restarted tween can
          // otherwise leave the bar a hair short of full at 3/3.
          this.meter.v = target;
          this.drawMeter();
        },
      });
    }

    drawMeter() {
      if (!this.meterFill) return;
      const w = 96;
      const h = 14;
      const v = this.meter.v;
      // weak → strong runs hazard-red through gold to the realm's teal
      const color = v >= 0.999 ? TEAL : v >= 0.5 ? GOLD : HAZARD;
      this.meterFill.clear();
      if (v <= 0) return;
      this.meterFill.fillStyle(color, 1);
      this.meterFill.fillRoundedRect(12 + 2, 26 + 2, Math.max(4, (w - 4) * v), h - 4, (h - 4) / 2);
    }

    /** A little burst of sparks where a tile was picked up. */
    collectBurst(x, y) {
      for (let i = 0; i < 7; i += 1) {
        const s = this.add.image(x, y, 'pw-spark').setScale(0.7);
        const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.4;
        const d = 18 + Math.random() * 14;
        this.tweens.add({
          targets: s,
          x: x + Math.cos(a) * d,
          y: y + Math.sin(a) * d,
          alpha: 0,
          scale: 0.15,
          duration: 460,
          ease: 'Cubic.easeOut',
          onComplete: () => s.destroy(),
        });
      }
    }

    winSequence() {
      this.physics.pause();
      this.flashToast('Vault secured!');
      // Screen-pinned, not world-pinned — otherwise this closes over
      // whatever part of the 1120px level the camera happened to be
      // showing instead of the whole viewport.
      const left = this.add.image(140, 140, 'pw-door-left').setScrollFactor(0);
      const right = this.add.image(420, 140, 'pw-door-right').setScrollFactor(0);

      // The doors thump shut, hold a beat, then swing wide — the vault
      // sealing *then* opening for the Traveler is the stamp-earning moment,
      // so it wants a pause in the middle rather than one continuous slide.
      this.tweens.add({ targets: left, x: 130, duration: 180, yoyo: true, ease: 'Quad.easeOut' });
      this.tweens.add({ targets: right, x: 430, duration: 180, yoyo: true, ease: 'Quad.easeOut' });
      this.tweens.add({
        targets: left,
        x: -140,
        delay: 620,
        duration: 760,
        ease: 'Back.easeIn',
      });
      this.tweens.add({
        targets: right,
        x: 700,
        delay: 620,
        duration: 760,
        ease: 'Back.easeIn',
        onComplete: () => onWin?.(this.realTotal),
      });
    }

    update(_time, delta) {
      if (this.hitCooldown > 0) this.hitCooldown -= delta;
      if (!this.player?.active || this.physics.world.isPaused) return;

      if (this.locked) {
        this.player.setVelocityX(0);
        this.playerAnim('pw-idle');
        return;
      }

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

      // Airborne beats grounded: rising reads as jump, descending as fall,
      // and only once we're actually on something does run/idle apply.
      if (!this.player.body.blocked.down) {
        this.playerAnim(this.player.body.velocity.y < 0 ? 'pw-jump' : 'pw-fall');
      } else {
        this.playerAnim(left || right ? 'pw-run' : 'pw-idle');
      }
    }

    /** Switch animation only on change, so the run cycle isn't reset each frame. */
    playerAnim(key) {
      if (this.player.anims.currentAnim?.key === key) return;
      this.player.play(key, true);
    }
  }

  return {
    scene: PasswordFortressLevelScene,
    physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  };
}
