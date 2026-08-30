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
import { playSfx } from '../../lib/sfx';
import { motionTween, prefersReducedMotion } from '../../lib/motion';

// Only the few tints the scene applies at runtime live here — everything the
// art itself is drawn with belongs to passworldArt.js.
const GOLD = 0xe0a030;
const TEAL = 0x2d8c7f;
const HAZARD = 0xc76b5c;

const LEVEL_H = 280;
const DEFAULT_LEVEL_W = 1120;

export function makePasswordFortressLevelConfig(
  Phaser,
  { game, controlsRef, onDecisionReached, onCollect, onDoorReached, onProgress, onWin, onSceneReady },
) {
  const tiles = game.tiles ?? [];
  // `hazards` for a level that wants more than one patrol; `hazard` is still
  // honoured for the single-guard levels that predate it.
  const hazardCfgs = game.hazards ?? (game.hazard ? [game.hazard] : []);
  const gateX = game.gateX ?? 300;
  const encounterX = game.encounterX ?? 260;
  const LEVEL_W = game.levelWidth ?? DEFAULT_LEVEL_W;
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
      this.bagged = 0; // everything picked up, strong or not
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

        // The same slow hover on every tile. Giving the real ones a lift and
        // the decoys a glint marked them apart before the player read them,
        // which is exactly the call the vault door is there to ask for.
        // Purely decorative and infinite — under reduced motion there's
        // nothing useful about running it very fast, so it's skipped
        // outright rather than routed through motionTween.
        if (!prefersReducedMotion()) {
          this.tweens.add({
            targets: [sprite, label],
            y: '-=3',
            duration: 1100,
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

        // Guards walk a surface, they don't hover. Snap each one onto the
        // platform under its patrol and clip the beat to that platform's
        // span, rather than trusting the y in the data — a hand-written
        // number drifts the moment a platform moves, and a guard left
        // floating in open air reads as a bug (a slime especially).
        const mid = (cfg.patrolFrom + cfg.patrolTo) / 2;
        let surface = null;
        for (const p of platformLayout) {
          if (mid < p.x || mid > p.x + p.w) continue;
          if (p.y < cfg.y) continue; // must be below the requested height
          if (!surface || p.y < surface.y) surface = p; // highest one under it
        }
        const halfW = guard.displayWidth / 2;
        const halfH = guard.displayHeight / 2;
        let from = cfg.patrolFrom;
        let to = cfg.patrolTo;
        if (surface) {
          guard.y = surface.y - halfH;
          from = Math.max(from, surface.x + halfW);
          to = Math.min(to, surface.x + surface.w - halfW);
          // A ledge too narrow to pace on gets a sentry instead: it holds the
          // middle and still blocks the landing, rather than sliding off.
          if (from >= to) from = to = surface.x + surface.w / 2;
        }
        guard.x = from;

        // Deliberately exempt from reduced-motion (unlike the tile hover
        // above): this is the hazard itself, not a flourish — timing around
        // its patrol is the actual gameplay, so stopping or fast-forwarding
        // it under reduced motion would change what the level asks of the
        // player, not just how it looks.
        if (to > from) {
          this.tweens.add({
            targets: guard,
            x: to,
            // Pace scales with the beat's length so two guards on different
            // runs don't fall into lockstep and become one predictable wall.
            duration: Math.max(1200, (to - from) * 14),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
          });
        }
        this.physics.add.overlap(this.player, guard, () => this.onHazardHit(guard));
      }

      // ---- the vault door, standing on the last platform ----
      // Reaching it is what ends the run now, not picking up the last tile:
      // the Traveler has to face it and say which of what they're carrying
      // actually belongs in a password.
      const last = platformLayout[platformLayout.length - 1];
      const doorX = game.doorX ?? last.x + last.w / 2;
      const doorBaseY = game.doorY ?? last.y;
      this.door = this.add.image(doorX, doorBaseY, 'pw-vault-door').setOrigin(0.5, 1);
      this.doorAnswered = false;

      const doorZone = this.add.zone(doorX, doorBaseY - 34, 74, 84);
      this.physics.world.enable(doorZone, Phaser.Physics.Arcade.STATIC_BODY);
      this.physics.add.overlap(this.player, doorZone, () => {
        if (this.doorAnswered || this.locked) return;
        this.locked = true;
        this.player.setVelocity(0, 0);
        onDoorReached?.();
      });

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
      this.knockUntil = 0; // ms of knockback left, during which input can't steer

      onSceneReady?.(this);
    }

    /** Called by React once the decision resolves on the safe option. */
    resolveSafe() {
      this.locked = false;
      this.hintText?.setText('Collect the letter, number, and symbol tiles up on the platforms.');
      this.flashToast('Gate’s open. That is not really Sam. The real Sam never needs your password.');
      this.tweens.add(motionTween({
        targets: this.gateBody,
        alpha: 0,
        y: this.gateBody.y - 40,
        duration: 500,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.gateBody.body.enable = false;
        },
      }));
    }

    /**
     * Called by React when the door's question is resolved.
     * `passed` opens the vault; anything else hands control back and nudges
     * the Traveler clear of the door so they aren't re-triggering it on the
     * spot — there's no penalty either way, they just go and look again.
     */
    resolveDoor(passed, message) {
      if (passed) {
        this.doorAnswered = true;
        this.flashToast(message ?? 'That’s a strong password.');
        this.tweens.add(motionTween({
          targets: this.door,
          alpha: 0,
          y: this.door.y - 30,
          duration: 500,
          ease: 'Cubic.easeIn',
          onComplete: () => this.winSequence(),
        }));
        return;
      }
      this.locked = false;
      if (message) this.flashToast(message);
      this.player.setVelocity(-170, -150);
    }

    onTileTouch(sprite) {
      if (!sprite.active) return;
      const t = this.tileById.get(sprite.getData('id'));
      if (!t) return;

      const label = sprite.getData('label');

      // Everything goes in the bag, weak ones included — the judgement call
      // has moved to the door, where the Traveler has to say which of what
      // they picked up actually belongs in a password. Refusing to let them
      // pick a decoy up would answer that question for them.
      this.collectBurst(sprite.x, sprite.y);
      this.tweens.killTweensOf([sprite, label]);
      label?.destroy();
      sprite.destroy();

      this.bagged += 1;
      if (t.kind === 'real') {
        this.collected.add(t.id);
        onProgress?.(this.collected.size, this.realTotal);
      }
      onCollect?.(t);
      this.updateHud();
    }

    onHazardHit(guard) {
      if (this.hitCooldown > 0 || !this.player.active) return;
      this.hitCooldown = 700;
      const dir = this.player.x < guard.x ? -1 : 1;
      // A hard shove sideways, not a nudge. At 160 you barely moved, so
      // walking straight through a guard was cheaper than timing the gap and
      // the patrols weren't really defending anything. 440 across with only a
      // little lift throws you clear off the ledge — which costs the climb
      // back and nothing else, so it's still not a fail state (design.md §8).
      this.player.setVelocity(dir * 440, -170);
      // Hand the player back control only after the shove has actually
      // carried. `update()` zeroes horizontal velocity on any frame without
      // an input, so without this window it cancelled the knockback on the
      // very next tick — the hit measured 7px of travel at 440px/s, which is
      // why it read as a nudge no matter how hard the number was.
      this.knockUntil = 260;
      this.player.setTint(HAZARD);
      this.time.delayedCall(220, () => this.player.clearTint());
      this.flashToast('A bump, no harm. Time it and go again.');
    }

    flashToast(msg) {
      this.toastText.setText(msg);
      this.tweens.killTweensOf(this.toastText);
      this.toastText.setAlpha(1);
      // `delay` is how long the message stays fully readable before it
      // starts fading — that's dwell time, not motion, so motionTween
      // leaves it alone and only shrinks the fade itself.
      this.tweens.add(motionTween({ targets: this.toastText, alpha: 0, delay: 1600, duration: 500 }));
    }

    updateHud() {
      // Count only — no running "n of 6 strong". That readout told the player
      // which pickups had counted the moment they touched them, so the door's
      // question was already answered by the time they got there. The meter
      // still moves, but as a bar with no number attached to it.
      this.hudText.setText(`In the bag: ${this.bagged}`);

      // Fills on *anything* picked up, not just the ones that count. Tracking
      // the strong ones made the bar itself a tell — it moved for a good
      // pickup and sat still for a decoy.
      const target = tiles.length ? this.bagged / tiles.length : 0;
      this.tweens.killTweensOf(this.meter);
      this.tweens.add(motionTween({
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
      }));
    }

    drawMeter() {
      if (!this.meterFill) return;
      const w = 96;
      const h = 14;
      const v = this.meter.v;
      // One colour: a red/gold/teal ramp would grade the haul as it filled,
      // which is the judgement the door is supposed to ask for.
      const color = GOLD;
      this.meterFill.clear();
      if (v <= 0) return;
      this.meterFill.fillStyle(color, 1);
      this.meterFill.fillRoundedRect(12 + 2, 26 + 2, Math.max(4, (w - 4) * v), h - 4, (h - 4) / 2);
    }

    /** A little burst of sparks where a tile was picked up. */
    collectBurst(x, y) {
      // Purely decorative flourish, nothing else depends on it — skip it
      // outright under reduced motion rather than shrinking it to a
      // flicker.
      if (prefersReducedMotion()) return;
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
      this.flashToast('Vault open!');
      // Screen-pinned, not world-pinned — otherwise this closes over
      // whatever part of the 1120px level the camera happened to be
      // showing instead of the whole viewport.
      const left = this.add.image(140, 140, 'pw-door-left').setScrollFactor(0);
      const right = this.add.image(420, 140, 'pw-door-right').setScrollFactor(0);

      // The doors thump shut, hold a beat, then swing wide — the vault
      // sealing *then* opening for the Traveler is the stamp-earning moment,
      // so it wants a pause in the middle rather than one continuous slide.
      // The `delay`s pace that beat rather than animate anything, so
      // motionTween (duration-only) leaves them alone — reduced motion
      // still gets the win noticeably sooner (each slide collapses to
      // near-instant), just without cutting the staged pause entirely.
      this.tweens.add(motionTween({ targets: left, x: 130, duration: 180, yoyo: true, ease: 'Quad.easeOut' }));
      this.tweens.add(motionTween({ targets: right, x: 430, duration: 180, yoyo: true, ease: 'Quad.easeOut' }));
      this.tweens.add(motionTween({
        targets: left,
        x: -140,
        delay: 620,
        duration: 760,
        ease: 'Back.easeIn',
      }));
      this.tweens.add(motionTween({
        targets: right,
        x: 700,
        delay: 620,
        duration: 760,
        ease: 'Back.easeIn',
        onComplete: () => onWin?.(this.realTotal),
      }));
    }

    update(_time, delta) {
      if (this.hitCooldown > 0) this.hitCooldown -= delta;
      if (this.knockUntil > 0) this.knockUntil -= delta;
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

      // Mid-knockback the shove owns the horizontal axis; steering resumes
      // once it's spent. Facing still tracks input so the sprite doesn't
      // moonwalk through it.
      if (left) this.facing = -1;
      else if (right) this.facing = 1;

      if (this.knockUntil <= 0) {
        if (left) this.player.setVelocityX(-140);
        else if (right) this.player.setVelocityX(140);
        else this.player.setVelocityX(0);
      }
      this.player.setFlipX(this.facing < 0);

      if (jumpPressed && this.player.body.blocked.down) {
        this.player.setVelocityY(-360);
        // Gravity clears `blocked.down` the very next tick, so this branch
        // naturally only fires once per grounded press — no extra edge
        // tracking needed to keep the sound single-shot per jump.
        playSfx('jump');
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
