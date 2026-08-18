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

const INK = 0x1f3452;
const PAPER = 0xf1f5f6;
const GOLD = 0xe0a030;
const TEAL = 0x2d8c7f;
const HAZARD = 0xc76b5c;
const NEUTRAL = 0x9aa6b5; // the impersonator — deliberately unplaceable, not a villain colour

const LEVEL_W = 1120;
const LEVEL_H = 280;

export function makePasswordFortressLevelConfig(
  Phaser,
  { game, controlsRef, onDecisionReached, onProgress, onWin, onSceneReady },
) {
  const tiles = game.tiles ?? [];
  const hazardCfg = game.hazard;
  const gateX = game.gateX ?? 300;
  const encounterX = game.encounterX ?? 260;
  const platformLayout = game.platforms ?? [{ x: 0, y: 262, w: LEVEL_W, h: 18 }];

  class PasswordFortressLevelScene extends Phaser.Scene {
    constructor() {
      super('password-fortress-level');
    }

    preload() {
      this.buildTextures();
    }

    buildTextures() {
      const g = this.add.graphics();

      g.clear();
      g.fillStyle(INK, 1);
      g.fillRoundedRect(0, 8, 24, 24, 7);
      g.fillStyle(GOLD, 1);
      g.fillRoundedRect(0, 4, 24, 11, 5);
      g.fillStyle(PAPER, 1);
      g.fillCircle(8, 13, 2);
      g.fillCircle(16, 13, 2);
      g.generateTexture('traveler', 24, 32);

      g.clear();
      g.fillStyle(HAZARD, 1);
      g.fillRoundedRect(0, 0, 28, 24, 11);
      g.fillStyle(PAPER, 1);
      g.fillCircle(9, 10, 2.4);
      g.fillCircle(19, 10, 2.4);
      g.generateTexture('hazard', 28, 24);

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

      // The impersonator: same flat-blob language as everyone else, but
      // drawn twice at a slight offset with reduced opacity — a soft
      // "double image" that reads as "something's not quite lined up"
      // without needing a face or an expression to sell it.
      g.clear();
      g.fillStyle(NEUTRAL, 0.55);
      g.fillRoundedRect(2, 6, 24, 26, 9);
      g.fillStyle(NEUTRAL, 1);
      g.fillRoundedRect(0, 4, 24, 26, 9);
      g.fillStyle(PAPER, 1);
      g.fillCircle(8, 14, 2);
      g.fillCircle(16, 14, 2);
      g.generateTexture('npc', 28, 32);

      // Gate: a portcullis of vertical bars.
      g.clear();
      g.fillStyle(INK, 0.88);
      for (let i = 0; i < 5; i += 1) g.fillRoundedRect(i * 12, 0, 6, 120, 3);
      g.generateTexture('gate', 60, 120);

      g.destroy();
    }

    create() {
      this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
      this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);

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
      this.locked = false;
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

      // ---- the impersonator + the gate they're blocking ----
      this.add.image(encounterX + 14, 234, 'npc');
      this.gateBody = this.physics.add.staticImage(gateX, 202, 'gate');
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
        const sprite = this.tileGroup.create(t.x, t.y, t.kind === 'real' ? 'tile-real' : 'tile-decoy');
        sprite.setData('id', t.id);
        this.add.text(t.x, t.y, t.label, {
          fontFamily: 'monospace',
          fontSize: t.label.length > 2 ? '9px' : '14px',
          color: '#ffffff',
        }).setOrigin(0.5);
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

      // ---- HUD (screen-pinned — setScrollFactor(0) — so it stays put
      // regardless of how far the camera has scrolled) ----
      this.hudText = this.add
        .text(12, 10, '', { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#1f3452' })
        .setScrollFactor(0);
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

      if (t.kind === 'real') {
        sprite.destroy();
        this.collected.add(t.id);
        this.updateHud();
        onProgress?.(this.collected.size, this.realTotal);
        if (this.collected.size >= this.realTotal) this.winSequence();
      } else if (!this.decoyWarned.has(t.id)) {
        this.decoyWarned.add(t.id);
        this.flashToast('That one’s easy to guess — look for a locked one instead.');
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
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1600, duration: 500 });
    }

    updateHud() {
      const n = this.collected.size;
      const strength = n === 0 ? 'Weak' : n < this.realTotal ? 'Building…' : 'Strong';
      this.hudText.setText(`Password strength: ${strength}  (${n}/${this.realTotal})`);
    }

    winSequence() {
      this.physics.pause();
      this.flashToast('Vault secured!');
      // Screen-pinned, not world-pinned — otherwise this closes over
      // whatever part of the 1120px level the camera happened to be
      // showing instead of the whole viewport.
      const left = this.add.rectangle(140, 140, 280, 280, INK, 0.92).setScrollFactor(0);
      const right = this.add.rectangle(420, 140, 280, 280, INK, 0.92).setScrollFactor(0);
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

      if (this.locked) {
        this.player.setVelocityX(0);
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
    }
  }

  return {
    scene: PasswordFortressLevelScene,
    physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  };
}
