/**
 * Passworld P4–P6, full-level version: the entire realm — the Sam & Tom
 * encounter *and* the vault challenges — happens inside continuous platformer
 * levels, rather than a walk-to-a-hotspot-then-open-a-panel
 * story/decision/game/rule sequence like every other realm.
 *
 * One scene, played three times. Passworld is three chapters long
 * (`realm.game.levels` in data/realms.js) and React remounts this scene per
 * chapter with that chapter's config, so everything here is driven by data:
 * the encounter and its gate are optional (chapter 1 only), the layout,
 * hazards, tiles, signposts and set-piece props all come in per level, and
 * *what the door asks* is decided entirely on the React side.
 *
 * The pieces a level can carry:
 *   platforms / tiles / hazards — the climb and what's on it
 *   encounterX + gateX          — the impersonator and the gate they block
 *   beacons                     — lamp-posts that explain *why*, in the world
 *   props                       — the Guess Engine, the wall of keyholes
 *
 * `beacons` are the reason this file grew: the level taught which pickups
 * counted without ever explaining what a symbol was buying you. Walking
 * through one lights it, flashes its short line on screen, and hands the long
 * one to React for the Traveler's field notes.
 *
 * The decision and every door question are still plain DOM (React renders
 * them, same content and components as every other realm) — this scene only
 * decides *when* they fire (overlap triggers, not clicks) and *what
 * physically blocks progress* until they resolve (a gate and a shut vault
 * door, not a disabled "next" button). See components/PlatformerStoryRealm.jsx.
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

const LEVEL_H = 280;
const DEFAULT_LEVEL_W = 1120;

export function makePasswordFortressLevelConfig(
  Phaser,
  {
    game,
    controlsRef,
    onDecisionReached,
    onCollect,
    onDoorReached,
    onProgress,
    onWin,
    onNote,
    onSceneReady,
  },
) {
  const tiles = game.tiles ?? [];
  // `hazards` for a level that wants more than one patrol; `hazard` is still
  // honoured for the single-guard levels that predate it.
  const hazardCfgs = game.hazards ?? (game.hazard ? [game.hazard] : []);
  // Only chapter 1 has the impersonator to get past; the later chapters open
  // straight onto their own puzzle, so both of these are optional now.
  const hasEncounter = game.encounterX != null;
  const gateX = game.gateX ?? 300;
  const encounterX = game.encounterX;
  // Walk-through signposts that explain *why* — see `beacons` in realms.js.
  const beaconCfgs = game.beacons ?? [];
  // Scenery with a job: the Guess Engine, the wall of keyholes.
  const propCfgs = game.props ?? [];
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
      // Manual smoothed follow, not startFollow — so the camera can lean
      // toward whichever way the player's facing (lookahead), letting them
      // see a hazard or platform coming before they reach it, rather than
      // staying dead-centred on the player at all times.
      this.lookaheadX = 0;
      this.cameras.main.centerOn(this.player.x, this.player.y);

      // ---- scenery with a job ----
      this.buildProps(propCfgs);

      // ---- the impersonator + the gate they're blocking ----
      // Chapter 1 only. Stood clear of the gate on the player's side — parked
      // at the gate's own x they were drawn behind the bars and barely
      // legible.
      this.decisionTriggered = false;
      if (hasEncounter) {
        this.add.image(encounterX - 24, 234, 'pw-impostor');
        this.gateBody = this.physics.add.staticImage(gateX, 202, 'pw-gate');
        this.physics.add.collider(this.player, this.gateBody);

        const zone = this.add.zone(encounterX, 200, 70, 130);
        this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, zone, () => {
          if (this.decisionTriggered) return;
          this.decisionTriggered = true;
          this.locked = true;
          this.player.setVelocity(0, 0);
          onDecisionReached?.();
        });
      }

      // ---- teaching beacons ----
      // Signposts you walk through. Each one flashes its short line in the
      // level and hands React the long one for the Field notes list, so the
      // reasoning is somewhere the player can go back and re-read rather
      // than a toast they might have jumped straight past.
      // A sign can be read as many times as the player likes: walk off it and
      // back on and it says its piece again. It's a teaching game, so a note
      // you missed the first time has to still be gettable — the only thing
      // that happens once is lighting the lamp and filing the note.
      this.beaconRead = new Set();
      this.beacons = [];
      for (const b of beaconCfgs) {
        const baseY = b.y ?? 262;
        const post = this.add.image(b.x, baseY, 'pw-beacon').setOrigin(0.5, 1);
        const zone = this.add.zone(b.x, baseY - 26, 46, 74);
        this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
        const entry = { cfg: b, post, zone, armed: true };
        this.beacons.push(entry);
        this.physics.add.overlap(this.player, zone, () => {
          if (!entry.armed) return;
          entry.armed = false;
          this.flashToast(b.short ?? b.text, 2600);
          if (this.beaconRead.has(b.id)) return;
          this.beaconRead.add(b.id);
          post.setTexture('pw-beacon-lit');
          this.tweens.add({
            targets: post,
            scaleX: 1.18,
            scaleY: 1.18,
            duration: 160,
            yoyo: true,
            ease: 'Quad.easeOut',
          });
          this.collectBurst(b.x, baseY - 34);
          onNote?.(b);
        });
      }

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
        // A word tile gets a wider card rather than text spilling off the
        // edges of it. The chapters past the first carry whole passwords
        // ("Purple7Taco!"), which at a fixed 34px card were unreadable —
        // and an unreadable tile can't be judged, which is the whole ask.
        const fontPx = t.label.length > 2 ? 10 : 15;
        const needed = Math.max(34, t.label.length * (fontPx * 0.62) + 16);
        if (needed > 34) {
          sprite.setDisplaySize(needed, 34);
          sprite.refreshBody();
        }
        const label = this.add
          .text(t.x, t.y - 1, t.label, {
            fontFamily: 'monospace',
            fontSize: `${fontPx}px`,
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);
        sprite.setData('label', label);

        // The same slow hover on every tile. Giving the real ones a lift and
        // the decoys a glint marked them apart before the player read them,
        // which is exactly the call the vault door is there to ask for.
        this.tweens.add({
          targets: [sprite, label],
          y: '-=3',
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        });
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

      // Fires once per approach, then stays disarmed until the Traveler has
      // actually stepped out of the zone again. Without that latch, "Step
      // back" was a dead button: it unlocked, but the player was still
      // standing inside the trigger, so the very next physics step re-fired
      // the overlap and re-opened the door. Anyone who reached it without
      // every strong tile was stuck there with only "Restart this vault"
      // left — a fail state this game isn't supposed to have (design.md §8).
      this.doorZone = this.add.zone(doorX, doorBaseY - 34, 74, 84);
      this.physics.world.enable(this.doorZone, Phaser.Physics.Arcade.STATIC_BODY);
      this.doorArmed = true;
      this.physics.add.overlap(this.player, this.doorZone, () => {
        if (this.doorAnswered || this.locked || !this.doorArmed) return;
        this.doorArmed = false;
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
      // Both messages live along the top of the screen, stacked. At the bottom
      // the hint sat right where the Traveler walks and where the ground-level
      // tiles are, so the two were constantly drawn over each other and
      // neither could be read.
      this.hintText = this.add
        .text(280, 8, game.hint ?? 'Walk right to find out what’s going on.', {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#1f3452',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0);
      this.toastText = this.add
        .text(280, 28, '', {
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
      // Without this, an arrow-key press can scroll the page/panel behind
      // the canvas at the same time it moves the Traveler — addCapture
      // makes the browser's default action (scrolling) never fire for
      // these keys while this scene is active.
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
      this.knockUntil = 0; // ms of knockback left, during which input can't steer

      onSceneReady?.(this);
    }

    /** Called by React once the decision resolves on the safe option. */
    resolveSafe() {
      this.locked = false;
      this.hintText?.setText(
        game.hintAfterGate ??
          'Collect the letter, number, and symbol tiles up on the platforms.',
      );
      this.flashToast('Gate’s open — the real Sam never needed your password anyway.');
      if (!this.gateBody) return;
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

    /**
     * Called by React when the door's question is resolved.
     * `passed` opens the vault; anything else hands control back and nudges
     * the Traveler clear of the door so they aren't re-triggering it on the
     * spot — there's no penalty either way, they just go and look again.
     */
    resolveDoor(passed, message) {
      if (passed) {
        this.doorAnswered = true;
        this.flashToast(message ?? 'The vault knows a strong one when it sees it.');
        this.tweens.add({
          targets: this.door,
          alpha: 0,
          y: this.door.y - 30,
          duration: 500,
          ease: 'Cubic.easeIn',
          onComplete: () => this.winSequence(),
        });
        return;
      }
      this.locked = false;
      if (message) this.flashToast(message);
      this.player.setVelocity(-170, -150);
      // Same reason `onHazardHit` needs one: `update()` zeroes horizontal
      // velocity on any frame without an input, so without this window the
      // nudge away from the door is cancelled on the very next tick and the
      // Traveler never actually steps back off the threshold.
      this.knockUntil = 260;
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
      // No toast. The shove and the flash of colour already say what happened,
      // and the toast line is wanted for the signposts — in a teaching game a
      // banner that fires on every bump buries the one carrying the lesson.
      this.player.setTint(HAZARD);
      this.time.delayedCall(220, () => this.player.clearTint());
    }

    flashToast(msg, hold = 1600) {
      this.toastText.setText(msg);
      this.tweens.killTweensOf(this.toastText);
      this.toastText.setAlpha(1);
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: hold, duration: 500 });
    }

    /**
     * Scenery that does something. `guessEngine` is the chapter-2 set piece:
     * a cracking machine visibly tearing through a list of common passwords
     * with a counter running up beside it. Nothing about it is interactive —
     * it's an argument, made in the world, for why "football" is a bad
     * password and why a symbol is a good one.
     */
    buildProps(cfgs) {
      this.engines = [];
      for (const cfg of cfgs) {
        if (cfg.type === 'keyholes') {
          const n = cfg.count ?? 3;
          for (let i = 0; i < n; i += 1) {
            this.add.image(cfg.x + i * (cfg.gap ?? 40), cfg.y ?? 246, 'pw-keyhole').setOrigin(0.5, 1);
          }
          if (cfg.label) {
            this.add
              .text(cfg.x + ((n - 1) * (cfg.gap ?? 40)) / 2, (cfg.y ?? 246) - 52, cfg.label, {
                fontFamily: 'sans-serif',
                fontSize: '10px',
                fontStyle: 'bold',
                color: '#1f3452',
                align: 'center',
              })
              .setOrigin(0.5);
          }
          continue;
        }
        if (cfg.type !== 'guessEngine') continue;

        const body = this.add.image(cfg.x, cfg.y ?? 262, 'pw-engine').setOrigin(0.5, 1);
        // Both readouts sit inside the screen bed drawn into the texture
        // (y 15–41 of a 62px-tall sprite), so they read as a display rather
        // than as text floating over a box.
        const top = body.y - body.height;
        const screen = this.add
          .text(cfg.x, top + 24, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#8ee6c8',
          })
          .setOrigin(0.5);
        const counter = this.add
          .text(cfg.x, top + 36, '', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e0a030',
          })
          .setOrigin(0.5);
        const engine = {
          words: cfg.words ?? ['password', '123456', 'qwerty', 'letmein', 'football'],
          i: 0,
          tried: cfg.startCount ?? 0,
          screen,
          counter,
          // Guesses per second, only for the counter's sake. A real cracker
          // does far more than this; the number just needs to run up too
          // fast to read, which is the point being made.
          rate: cfg.rate ?? 91_000,
        };
        this.engines.push(engine);
        // The word on the screen changes on a timer rather than per frame,
        // so it's readable — a kid has to be able to see it land on
        // "football" and realise that's a word they know.
        this.time.addEvent({
          delay: cfg.wordMs ?? 620,
          loop: true,
          callback: () => {
            engine.i = (engine.i + 1) % engine.words.length;
            engine.screen.setText(`${engine.words[engine.i]} ✗`);
            this.tweens.add({
              targets: engine.screen,
              alpha: { from: 0.35, to: 1 },
              duration: 180,
            });
          },
        });
        engine.screen.setText(`${engine.words[0]} ✗`);
      }
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
      if (this.knockUntil > 0) this.knockUntil -= delta;

      // The Guess Engine's counter runs whether or not the player's moving —
      // it's meant to feel like something that never stops trying.
      for (const e of this.engines ?? []) {
        e.tried += (e.rate * delta) / 1000;
        e.counter.setText(`${Math.floor(e.tried).toLocaleString('en-US')} tries`);
      }

      if (!this.player?.active || this.physics.world.isPaused) return;

      // Re-arm the vault door once the Traveler is clear of it, so walking
      // back up to it asks the question again — but standing on the spot
      // after stepping back doesn't.
      if (!this.doorArmed && !this.doorAnswered && this.doorZone) {
        if (this.isClearOf(this.doorZone)) this.doorArmed = true;
      }

      // Same latch for every signpost, so stepping off one and back on
      // re-reads it instead of standing inside it re-firing every frame.
      for (const b of this.beacons ?? []) {
        if (!b.armed && this.isClearOf(b.zone)) b.armed = true;
      }

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
      }

      // Airborne beats grounded: rising reads as jump, descending as fall,
      // and only once we're actually on something does run/idle apply.
      if (!this.player.body.blocked.down) {
        this.playerAnim(this.player.body.velocity.y < 0 ? 'pw-jump' : 'pw-fall');
      } else {
        this.playerAnim(left || right ? 'pw-run' : 'pw-idle');
      }

      this.updateCamera();
    }

    /** True once the player has physically stepped out of a trigger zone. */
    isClearOf(zone) {
      const z = zone?.body;
      const p = this.player?.body;
      if (!z || !p) return true;
      return p.right < z.left || p.left > z.right || p.bottom < z.top || p.top > z.bottom;
    }

    /** Switch animation only on change, so the run cycle isn't reset each frame. */
    playerAnim(key) {
      if (this.player.anims.currentAnim?.key === key) return;
      this.player.play(key, true);
    }

    updateCamera() {
      // Lean the camera ~70px toward whichever way the player's facing,
      // eased in over time so it doesn't snap the moment they turn around.
      const targetLookahead = this.locked ? 0 : this.facing * 70;
      this.lookaheadX = Phaser.Math.Linear(this.lookaheadX, targetLookahead, 0.05);

      const cam = this.cameras.main;
      const targetX = this.player.x + this.lookaheadX - cam.width / 2;
      const targetY = this.player.y - cam.height / 2;
      cam.scrollX = Phaser.Math.Linear(cam.scrollX, targetX, 0.1);
      cam.scrollY = Phaser.Math.Linear(cam.scrollY, targetY, 0.1);
    }
  }

  return {
    scene: PasswordFortressLevelScene,
    physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  };
}
