/**
 * Bully Bog P4–P6: "The Bog Current".
 *
 * The realm used to be a drag-comments-into-two-piles sort, done in about
 * forty seconds. This is the same judgement made into an actual game, because
 * the judgement is the point and a static pile hides it: in the Bog, comments
 * are already *in the water* and already drifting toward Pockets, so every
 * choice is made against a clock and against the ones you didn't get to.
 *
 * The loop:
 *   Comments float right-to-left along three lanes. You paddle a coracle
 *   anywhere in the water (arrow keys / WASD, or the boat follows your
 *   pointer). Space — or a click — scoops the nearest card into your net.
 *   Carrying one, you take it down to one of three stations on the near bank
 *   and press again to drop it:
 *
 *     Report basket  take it out of the water before it lands
 *     Pockets' pad   show it to Pockets
 *     The heron      fetch a grown-up (chapter 3)
 *
 *   Anything you never touch drifts off the left edge and *lands*.
 *
 * Why it's built this way — the mechanic is the lesson, not decoration:
 *
 *  - Only carrying a *kind* card to Pockets raises the water's clarity.
 *    Netting mean ones merely stops it falling. So a player who spends the
 *    round deleting bad comments and never says anything kind mathematically
 *    cannot clear the water. Bystander to upstander, enforced by the scoring
 *    rather than asserted by a grown-up in a text box.
 *  - Mean comments gain likes the longer they're left up, and hit harder for
 *    each one. Acting early is worth more than acting perfectly.
 *  - A pile-on (`chain`) spawns as a leader with followers stacked behind it.
 *    Report the leader and the whole tail goes with it; pick off followers one
 *    at a time and you drown.
 *  - `heavy` cards — the ones about *who somebody is* rather than what they
 *    did — are slower to carry and will not go in the report basket at all.
 *    They only drop at the heron. You cannot finish chapter 3 without asking
 *    an adult for help, because that's the chapter's whole claim.
 *  - Doing nothing is a legal move, and sometimes the right one: `fair` cards
 *    (honest, unwelcome, not cruel) are best left alone.
 *
 * Nothing here says which card is which. Cards are all the same paper; only
 * `heavy` ones look different, and that difference says "this one is not like
 * the others", never which side of the line it's on. See bogArt.js.
 *
 * React owns all the words that aren't in the water — the chapter cards, the
 * decision, the debrief — same split as the Passworld platformer. This scene
 * reports what happened (`onResolve`) and how the water looks (`onClarity`),
 * and freezes itself when the decision beat is due. See BogStoryRealm.jsx.
 */

import { bubbleTexture, buildBogArt, floatTexture, preloadBogArt } from './bogArt';

const W = 560;
const H = 280;

/** The three lanes the current runs along, and where the bank shelf starts.
    44px apart, which is exactly the tallest a two-line card gets — any closer
    and comments in neighbouring lanes overlap and neither can be read. */
const LANES = [114, 158, 202];
const BANK_Y = 250;

/** A card is gone once its middle passes this — it "landed" on the Bog. */
const LAND_X = 34;
const SPAWN_X = 640;

// Wide enough that every comment in realms.js wraps to two lines at most.
// A three-line card is taller than the lane spacing and collides with its
// neighbours, so card width and lane spacing have to be chosen together.
const CARD_W = 190;
// How far past the hull the net reaches. Measured to the nearest *edge* of a
// card rather than its middle, so the rule the reach ring draws — if the ring
// touches a comment you can lift it — is the rule the code actually applies.
// Against card centres a 190px-wide comment was ungrabbable from either end.
const REACH = 44;
const BOAT_SPEED = 168;
const CARRY_DRAG = 0.55; // how much a `heavy` card slows the boat

const INK = 0x1f3452;

/** Where each drop lands you, per station and per kind of comment. */
const OUTCOMES = {
  report: {
    mean: { clarity: 0, ok: true, note: 'Reported. It never landed.' },
    heavy: null, // refused — see `refuseNote`
    kind: { clarity: -6, ok: false, note: 'That one was kind. Pockets needed to see it.' },
    fair: {
      clarity: -4,
      ok: false,
      note: 'That wasn’t cruel — it was about the song, not about Pockets.',
    },
  },
  pockets: {
    kind: { clarity: 14, ok: true, note: 'Pockets heard that one.' },
    fair: {
      clarity: 3,
      ok: true,
      note: 'Pockets can take that. It’s about the song, not about them.',
    },
    mean: { clarity: -16, ok: false, note: 'You handed that straight to Pockets.' },
    heavy: null,
  },
  heron: {
    heavy: { clarity: 10, ok: true, note: 'You told a grown-up. That one wasn’t yours alone.' },
    mean: { clarity: 6, ok: true, note: 'Not wrong at all — though you could report that one yourself.' },
    kind: { clarity: -2, ok: false, note: 'The heron doesn’t need to see the nice ones.' },
    fair: { clarity: -2, ok: false, note: 'Nothing here for a grown-up. That one was just honest.' },
  },
};

const REFUSE_NOTE = {
  report: 'Too big for the basket. This one needs a grown-up.',
  pockets: 'Don’t hand Pockets that one. Take it to the heron.',
};

const WEIGHT = { mean: 10, heavy: 16, kind: 0, fair: 0 };

export function makeBogCurrentConfig(
  Phaser,
  { level, onClarity, onResolve, onDecisionReached, onRoundEnd, onSceneReady },
) {
  const script = level.comments ?? [];
  const speed = level.speed ?? 34;
  const gap = level.gap ?? 2400; // ms between spawns
  const likeEvery = level.likeEvery ?? 0; // 0 = comments never gather likes
  const hasHeron = Boolean(level.hasHeron);
  const decisionAfter = level.decisionAfter ?? null;

  class BogCurrentScene extends Phaser.Scene {
    constructor() {
      super('bog-current');
    }

    preload() {
      preloadBogArt(this);
    }

    create() {
      buildBogArt(this);

      this.clarity = level.startClarity ?? 40;
      this.live = [];
      this.carrying = null;
      this.spawnIndex = 0;
      this.resolvedCount = 0;
      this.nextSpawnAt = 400;
      this.elapsed = 0;
      this.frozen = false;
      this.finished = false;
      this.decisionFired = false;
      this.pointerTarget = null;

      this.buildBackdrop();
      this.buildStations();
      this.buildBoat();
      this.buildHud();
      this.bindInput();

      this.applyClarity(0);
      onSceneReady?.(this);
    }

    /* ------------------------------------------------------------ scenery -- */

    buildBackdrop() {
      this.add.image(0, 0, 'bog-bg-trees').setOrigin(0);
      this.add.image(0, 96, 'bog-bg-water').setOrigin(0);

      // The murk. One rectangle whose alpha *is* the clarity meter, laid over
      // the clear water — so "the water goes darker" is a single number, and
      // the player watches their own score without reading a number at all.
      this.murk = this.add.rectangle(0, 96, W, H - 96, INK).setOrigin(0).setAlpha(0.5);

      // near bank
      this.add.rectangle(0, BANK_Y, W, H - BANK_Y, 0x6b7a4f).setOrigin(0);
      this.add.rectangle(0, BANK_Y, W, 4, 0x55663d).setOrigin(0);
      for (const x of [16, 214, 366, 520]) {
        this.add.image(x, BANK_Y + 4, 'bog-reeds').setOrigin(0.5, 1).setAlpha(0.9);
      }
    }

    buildStations() {
      this.stations = [
        { id: 'report', x: 140, label: 'Report' },
        { id: 'pockets', x: 292, label: 'Pockets' },
      ];
      if (hasHeron) this.stations.push({ id: 'heron', x: 448, label: 'Ask the heron' });

      const g = this.add.graphics();
      for (const s of this.stations) {
        s.y = BANK_Y + 16;
        s.w = 104;
        s.h = 30;
        g.fillStyle(0xffffff, 0.16);
        g.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 8);
        g.lineStyle(2, 0xffffff, 0.55);
        g.strokeRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 8);
      }

      // The report basket — a flagged buoy, drawn rather than sprited because
      // it's a fixed size and only ever appears here.
      const basket = this.add.graphics();
      basket.fillStyle(0xb98a52, 1);
      basket.fillRoundedRect(122, BANK_Y - 16, 26, 16, 4);
      basket.fillStyle(0xffffff, 0.85);
      basket.fillRect(147, BANK_Y - 34, 14, 9);
      basket.lineStyle(2, 0x5c7185, 1);
      basket.lineBetween(146, BANK_Y - 36, 146, BANK_Y - 12);

      this.pockets = this.add.sprite(292, BANK_Y - 4, 'bog-pockets', 1).setOrigin(0.5, 1);

      if (hasHeron) {
        this.heron = this.add.sprite(448, BANK_Y - 2, 'bog-heron', 0).setOrigin(0.5, 1);
      }

      for (const s of this.stations) {
        this.add
          .text(s.x, s.y, s.label, {
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5);
      }
    }

    buildBoat() {
      this.boat = this.add.sprite(430, 170, 'bog-boat', 0).setDepth(10);
      this.boat.play('bog-paddle');
      // The reach ring. Shown faintly all the time rather than only when
      // something is in range — a player needs to know how far the net goes
      // *before* they commit to a lane, not after.
      this.reachRing = this.add
        .circle(430, 170, REACH, 0xffffff, 0)
        .setStrokeStyle(1.5, 0xffffff, 0.3)
        .setDepth(9);
    }

    buildHud() {
      // Everything built in here sits on the HUD layer, above the water and
      // anything floating in it.
      const hud = this.add.container(0, 0).setDepth(30);
      this.hudLabel = this.add
        .text(10, 6, 'The water', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '10px',
          color: '#ffffff',
        })
        .setAlpha(0.85);
      const barBack = this.add.rectangle(10, 20, 132, 9, 0x000000, 0.28).setOrigin(0);
      this.clarityBar = this.add.rectangle(11, 21, 130, 7, 0x8fd6c6).setOrigin(0);
      // The target notch, so "how much more" is a place on the bar and not a
      // number to hold in your head.
      const target = level.target ?? 100;
      const notch = this.add
        .rectangle(11 + (130 * target) / 100, 18, 2, 13, 0xffffff, 0.9)
        .setOrigin(0.5, 0);

      this.leftText = this.add
        .text(W - 10, 8, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
        })
        .setOrigin(1, 0)
        .setAlpha(0.9);

      this.flash = this.add
        .text(W / 2 + 40, 10, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 250 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);
      this.flash.setShadow(0, 1, '#1f3452', 3);

      hud.add([this.hudLabel, barBack, this.clarityBar, notch, this.leftText, this.flash]);
    }

    bindInput() {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.actKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      // Otherwise an arrow or a space press scrolls the page behind the canvas
      // at the same time it moves the boat.
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      ]);

      // Mouse: the boat steers toward the pointer and a click is the same
      // button as Space. Keyboard and mouse are the whole input story for this
      // game — there is no touch build — so both have to reach every verb.
      this.input.on('pointermove', (p) => {
        this.pointerTarget = { x: p.worldX, y: p.worldY };
      });
      this.input.on('pointerdown', () => this.act());
    }

    /* -------------------------------------------------------------- cards -- */

    spawnCard(def, laneOffset = 0) {
      const lane = LANES[def.lane ?? this.spawnIndex % LANES.length];
      const heavy = def.kind === 'heavy';

      const text = this.add
        .text(0, 0, def.text, {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '11px',
          color: '#1f3452',
          align: 'left',
          wordWrap: { width: CARD_W - 24 },
        })
        .setOrigin(0.5);

      const h = Math.max(30, Math.ceil(text.height) + 16);
      const card = this.add.image(0, 0, bubbleTexture(this, CARD_W, h, heavy)).setOrigin(0.5);
      const raft = this.add.image(0, h / 2 + 2, floatTexture(this, CARD_W - 20)).setOrigin(0.5);

      const container = this.add.container(SPAWN_X + laneOffset, lane, [raft, card, text]);
      container.setSize(CARD_W, h);
      // Under the boat: a comment drifting through must never hide the thing
      // the player is steering.
      container.setDepth(1);

      const entry = {
        ...def,
        node: container,
        w: CARD_W,
        h,
        likes: 0,
        hearts: null,
        heavy,
        bob: Math.random() * Math.PI * 2,
        baseY: lane,
      };

      if (heavy || def.kind === 'mean') {
        entry.hearts = this.add
          .text(CARD_W / 2 - 12, -h / 2 + 5, '', {
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#e0637a',
          })
          .setOrigin(1, 0);
        container.add(entry.hearts);
      }

      this.live.push(entry);
      return entry;
    }

    /** The leader of a pile-on drags its followers in behind it. */
    spawnWithChain(def) {
      const leader = this.spawnCard(def);
      leader.followers = [];
      (def.chain ?? []).forEach((text, i) => {
        const follower = this.spawnCard(
          {
            id: `${def.id}-f${i}`,
            text,
            kind: 'mean',
            lane: def.lane,
            weight: 4,
            why: def.why,
            follower: true,
          },
          (i + 1) * 44,
        );
        follower.leader = leader;
        leader.followers.push(follower);
      });
    }

    /* ------------------------------------------------------------ the net -- */

    act() {
      if (this.frozen || this.finished) return;
      if (this.carrying) return this.tryDrop();

      let best = null;
      let bestD = REACH;
      for (const c of this.live) {
        const dx = Math.max(0, Math.abs(this.boat.x - c.node.x) - c.w / 2);
        const dy = Math.max(0, Math.abs(this.boat.y - c.node.y) - c.h / 2);
        const d = Math.hypot(dx, dy);
        if (d < bestD) {
          best = c;
          bestD = d;
        }
      }
      if (!best) return;

      this.carrying = best;
      this.live = this.live.filter((c) => c !== best);
      best.node.setDepth(20); // in the net, so above the boat
      this.tweens.add({ targets: best.node, scale: 0.92, duration: 120 });
    }

    tryDrop() {
      const card = this.carrying;
      const station = this.stations.find(
        (s) =>
          Math.abs(this.boat.x - s.x) < s.w / 2 + 22 && Math.abs(this.boat.y - s.y) < s.h / 2 + 30,
      );

      if (!station) {
        // Not over a station — put it back in the current where you are.
        this.carrying = null;
        card.node.setDepth(1);
        card.baseY = Phaser.Math.Clamp(this.boat.y - 28, LANES[0], LANES[LANES.length - 1]);
        this.tweens.add({ targets: card.node, scale: 1, duration: 120 });
        this.live.push(card);
        return;
      }

      const outcome = OUTCOMES[station.id]?.[card.kind];
      if (!outcome) {
        this.say(REFUSE_NOTE[station.id] ?? 'Not that one, not here.');
        return;
      }

      this.carrying = null;
      this.resolve(card, {
        action: station.id,
        ok: outcome.ok,
        note: outcome.note,
        clarity: outcome.clarity,
      });

      if (station.id === 'pockets' && outcome.ok) {
        this.tweens.add({
          targets: card.node,
          x: this.pockets.x,
          y: this.pockets.y - 40,
          scale: 0.2,
          alpha: 0,
          duration: 380,
          ease: 'Sine.in',
          onComplete: () => card.node.destroy(),
        });
      } else if (station.id === 'heron' && outcome.ok) {
        this.heron?.setFrame(1);
        this.time.delayedCall(420, () => this.heron?.setFrame(0));
        this.tweens.add({
          targets: card.node,
          y: -60,
          alpha: 0,
          duration: 520,
          ease: 'Sine.in',
          onComplete: () => card.node.destroy(),
        });
      } else {
        this.pop(card.node.x, card.node.y);
        card.node.destroy();
      }

      // Reporting the first comment in a pile-on takes the whole tail with it.
      // Chasing the followers one at a time is meant to feel like losing.
      if (station.id === 'report' && card.followers?.length) {
        const caught = card.followers.filter((f) => this.live.includes(f));
        for (const f of caught) {
          this.live = this.live.filter((c) => c !== f);
          this.pop(f.node.x, f.node.y);
          f.node.destroy();
          this.resolve(f, {
            action: 'chain',
            ok: true,
            note: 'Went with the comment it was piling onto.',
            clarity: 0,
          });
        }
        if (caught.length) {
          this.say(`You reported the first one — ${caught.length} pile-on replies went with it.`);
        }
      }
    }

    pop(x, y) {
      const puff = this.add.image(x, y, 'bog-puff');
      this.tweens.add({
        targets: puff,
        scale: 2.2,
        alpha: 0,
        duration: 320,
        onComplete: () => puff.destroy(),
      });
    }

    /* ----------------------------------------------------------- scoring -- */

    resolve(card, result) {
      this.resolvedCount += 1;
      this.applyClarity(result.clarity ?? 0);
      if (result.note) this.say(result.note);
      onResolve?.({
        id: card.id,
        text: card.text,
        kind: card.kind,
        why: card.why,
        follower: Boolean(card.follower),
        action: result.action,
        ok: result.ok,
        note: result.note,
      });
      this.checkDecision();
    }

    land(card) {
      this.live = this.live.filter((c) => c !== card);
      card.node.destroy();

      if (card.kind === 'mean' || card.kind === 'heavy') {
        const base = card.weight ?? WEIGHT[card.kind];
        const damage = Math.round(base * (1 + card.likes * 0.25));
        this.resolve(card, {
          action: 'landed',
          ok: false,
          clarity: -damage,
          note:
            card.likes > 0
              ? `That one sat there long enough to collect ${card.likes} likes. It hit harder for it.`
              : 'That one stayed up. The water went darker.',
        });
        this.cameras.main.shake(140, 0.004);
        return;
      }

      this.resolve(card, {
        action: 'drifted',
        ok: card.kind === 'fair',
        clarity: 0,
        note:
          card.kind === 'fair'
            ? 'Left alone. That was the right call.'
            : 'Pockets never saw that one.',
      });
    }

    applyClarity(delta) {
      this.clarity = Phaser.Math.Clamp(this.clarity + delta, 0, 100);
      this.clarityBar.width = Math.max(1, (130 * this.clarity) / 100);
      this.clarityBar.fillColor =
        this.clarity >= (level.target ?? 100)
          ? 0x8fd6c6
          : this.clarity < 30
            ? 0xe0637a
            : 0xe7c86a;
      this.murk.setAlpha(0.06 + (1 - this.clarity / 100) * 0.62);
      this.pockets.setFrame(this.clarity < 25 ? 0 : this.clarity < 50 ? 1 : this.clarity < 80 ? 2 : 3);
      onClarity?.(this.clarity);
    }

    say(text) {
      this.flash.setText(text);
      this.tweens.killTweensOf(this.flash);
      this.flash.setAlpha(1);
      this.tweens.add({ targets: this.flash, alpha: 0, delay: 1900, duration: 500 });
    }

    /* ---------------------------------------------------------- the beat -- */

    /**
     * The realm's decision doesn't happen on a button in a panel — the current
     * stops, mid-round, with the comment still sitting in the water, and asks.
     */
    checkDecision() {
      if (decisionAfter == null || this.decisionFired) return;
      if (this.resolvedCount < decisionAfter) return;
      this.decisionFired = true;
      this.frozen = true;
      this.say('');
      onDecisionReached?.();
    }

    /**
     * React calls this once the player has settled the decision.
     *
     * An unsafe answer darkens the water but does *not* unfreeze — the
     * decision is handed straight back instead, same no-dead-end rule as
     * every other realm (design.md §5). Only the safe answer starts the
     * current running again.
     */
    resolveDecision(safe, ownComment) {
      if (!safe) {
        this.applyClarity(-14);
        this.say('The water went darker.');
        return;
      }
      this.frozen = false;
      if (ownComment) {
        // What the player said goes into the water as their own card, in
        // front of them, so the next thing they do is carry their own words
        // over to Pockets.
        const card = this.spawnCard({ ...ownComment, lane: 1 });
        card.node.x = Math.min(this.boat.x + 90, 470);
        card.mine = true;
      }
      this.say('You said it. Now get it to Pockets.');
    }

    /* ----------------------------------------------------------- the loop -- */

    update(_, dms) {
      if (this.finished) return;
      const dt = dms / 1000;
      this.elapsed += dms;

      this.steer(dt);

      if (!this.frozen) {
        this.runCurrent(dms, dt);
        this.maybeSpawn();
      }

      if (this.carrying) {
        this.carrying.node.x = this.boat.x;
        this.carrying.node.y = this.boat.y - 30 - this.carrying.h / 2;
      }

      this.reachRing.setPosition(this.boat.x, this.boat.y);
      const remaining = script.length - this.spawnIndex;
      this.leftText.setText(remaining > 0 ? `${remaining} more coming` : 'that’s the last of them');

      this.checkEnd();
    }

    steer(dt) {
      const c = this.cursors;
      const left = c.left.isDown || this.wasd.A.isDown;
      const right = c.right.isDown || this.wasd.D.isDown;
      const up = c.up.isDown || this.wasd.W.isDown;
      const down = c.down.isDown || this.wasd.S.isDown;
      const speedNow = BOAT_SPEED * (this.carrying?.heavy ? CARRY_DRAG : 1);

      if (left || right || up || down) {
        // A key press takes the wheel back off the pointer — otherwise the
        // boat fights itself whenever the cursor is parked somewhere.
        this.pointerTarget = null;
        if (left) this.boat.x -= speedNow * dt;
        if (right) this.boat.x += speedNow * dt;
        if (up) this.boat.y -= speedNow * dt;
        if (down) this.boat.y += speedNow * dt;
      } else if (this.pointerTarget) {
        const dx = this.pointerTarget.x - this.boat.x;
        const dy = this.pointerTarget.y - this.boat.y;
        const d = Math.hypot(dx, dy);
        if (d > 3) {
          const step = Math.min(speedNow * dt, d);
          this.boat.x += (dx / d) * step;
          this.boat.y += (dy / d) * step;
        }
      }

      this.boat.x = Phaser.Math.Clamp(this.boat.x, 40, W - 30);
      this.boat.y = Phaser.Math.Clamp(this.boat.y, 100, BANK_Y + 20);

      if (Phaser.Input.Keyboard.JustDown(this.actKey)) this.act();
    }

    runCurrent(dms, dt) {
      for (const card of [...this.live]) {
        card.node.x -= speed * dt;
        card.bob += dt * 2.2;
        card.node.y = card.baseY + Math.sin(card.bob) * 2.5;

        if (likeEvery && card.hearts && card.likes < 6) {
          card.likeClock = (card.likeClock ?? 0) + dms;
          if (card.likeClock >= likeEvery) {
            card.likeClock = 0;
            card.likes += 1;
            card.hearts.setText(`♥ ${card.likes}`);
            this.tweens.add({
              targets: card.hearts,
              scale: 1.5,
              duration: 120,
              yoyo: true,
            });
          }
        }

        if (card.node.x < LAND_X) this.land(card);
      }
    }

    maybeSpawn() {
      if (this.spawnIndex >= script.length) return;
      if (this.elapsed < this.nextSpawnAt) return;
      const def = script[this.spawnIndex];
      this.spawnIndex += 1;
      this.nextSpawnAt = this.elapsed + (def.gapAfter ?? gap);
      if (def.chain?.length) this.spawnWithChain(def);
      else this.spawnCard(def);
    }

    checkEnd() {
      if (this.spawnIndex < script.length) return;
      if (this.live.length || this.carrying || this.frozen) return;
      this.finished = true;
      this.say(this.clarity >= (level.target ?? 100) ? 'The water is clear.' : 'That’s the last of them.');
      this.time.delayedCall(650, () => onRoundEnd?.({ clarity: this.clarity }));
    }
  }

  return { scene: BogCurrentScene, backgroundColor: '#dfe9e6' };
}
