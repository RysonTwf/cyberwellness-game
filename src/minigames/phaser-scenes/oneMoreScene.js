/**
 * Balance Bay P4–P6: "One More".
 *
 * The realm used to be a planning exercise: fill six hours from a pool of
 * twelve cards, watch a beam tilt, done in about forty seconds. That teaches
 * against its own lesson twice over. It's a *god's-eye view* — full
 * information, no time pressure, nothing at stake — which is the one situation
 * in which balance is easy. And it scores you on a tidy ratio, when the
 * realm's own rule says the opposite: counting hours matters less than
 * noticing how you actually feel, in the moment, while the thing is still fun.
 *
 * So the game is now the moment itself. You play with the Glimmer — really
 * play, catching motes it throws you — and the only question the game ever
 * asks is: **one more?**
 *
 * Why it's built this way — the mechanic is the lesson, not decoration:
 *
 *  - **The toy genuinely gets worse.** Each round throws fewer motes, duller
 *    ones, and pays less. That isn't a number in a box claiming the fun ran
 *    out; it's the fun running out, in your hands. Whether you notice is the
 *    whole game.
 *  - **The bonfire burns while you play, and faster the longer you stay.**
 *    Late rounds cost far more evening than early ones — which is what "time
 *    doesn't really pass here" actually does to you. Playing every round
 *    scores *worse* than never playing at all.
 *  - **Stopping immediately also fails.** Round one is genuinely worth a lot.
 *    A player who treats screens as the enemy and quits at once ends the
 *    evening below the target too. There is a hump, and it's in the middle.
 *  - **Chapter 2 takes the numbers away**, because "do I feel fine" is not a
 *    reliable stop sign when the thing is built to feel fine. All that's left
 *    is the Traveler's posture, the bonfire, the sky and the tide — the tells
 *    chapter 1 taught you to read with the numbers on.
 *  - **Chapter 3 starts the next round for you** unless you actively stop it.
 *    Doing nothing is a choice, and here it's the Glimmer's, not yours.
 *
 * The Glimmer is drawn pretty and stays pretty (see bayArt.js). It is not a
 * monster and must never become one: the claim is not that screens are bad,
 * it's that "am I still enjoying this?" quietly stops being a question you
 * ask. A sinister Glimmer would answer that for the player and teach the
 * wrong thing.
 *
 * React owns all the words that aren't on the beach — the chapter cards, the
 * decision, the debrief and its round-by-round chart. This scene reports what
 * happened (`onRound`, `onEvening`) and how it's going (`onMeter`), and
 * freezes itself when the decision beat is due. See BayStoryRealm.jsx.
 */

import { buildBayArt, preloadBayArt } from './bayArt';

const W = 560;

/** Where the sea meets the sand, before the tide starts coming in. */
const BEACH_Y = 190;
/** The Traveler's feet, and the band their hands sweep. */
const FEET_Y = 252;
const HAND_Y = 216;
/** How far along the sand the Traveler can run. */
const ROAM = { min: 40, max: 384 };

const GLIMMER = { x: 90, y: 150 };
const BONFIRE_X = 490;

const WALK_SPEED = 190;
const CATCH_R = 22;
/** ms between motes within a round. Round length falls out of this × count. */
const MOTE_GAP = 420;

const PERI = 0x7b6ef6;
const GOLD = 0xe0a030;

/**
 * A round is worth `fun` at best, and never less than 55% of it — catching
 * well is a modest bonus, not the point. The decision this game is scoring is
 * *when you stopped*, so skill must not be able to drown it out.
 */
const FLOOR = 0.55;

export function makeOneMoreConfig(
  Phaser,
  { level, onMeter, onRound, onDecisionReached, onEvening, onSceneReady },
) {
  const rounds = level.rounds ?? [];
  const bonfireStart = level.bonfireStart ?? 60;
  const showNumbers = level.showNumbers !== false;
  const autoplayMs = level.autoplayMs ?? 0;
  const decisionAfter = level.decisionAfter ?? null;
  const waveAfter = level.waveAfter ?? null;
  const waveWindow = level.waveWindow ?? 1;
  const target = level.target ?? 100;

  class OneMoreScene extends Phaser.Scene {
    constructor() {
      super('one-more');
    }

    preload() {
      preloadBayArt(this);
    }

    create() {
      buildBayArt(this);

      this.sparks = 0;
      this.bonfire = bonfireStart;
      this.roundIndex = -1; // index of the round just played
      this.phase = 'choice'; // choice | round | notice | over
      this.frozen = false;
      this.finished = false;
      this.decisionFired = false;
      this.waveOpenedAt = null;
      this.waveResolved = false;
      this.log = [];
      this.motes = [];
      this.pointerTargetX = null;
      this.choicePick = 0; // 0 = one more, 1 = done
      this.autoplayT = 0;
      this.lastFeel = 1;

      this.buildBackdrop();
      this.buildActors();
      this.buildHud();
      this.buildChoice();
      this.bindInput();

      this.refresh();
      this.openChoice(true);
      onSceneReady?.(this);
    }

    /* ------------------------------------------------------------ scenery -- */

    buildBackdrop() {
      this.add.image(0, 0, 'bay-bg-sky').setOrigin(0).setDepth(-6);

      // The stars only really come out once the Glimmer is put down, so they
      // ride the same alpha as the night and read as a reward, not a clock.
      this.stars = this.add.image(0, 0, 'bay-stars').setOrigin(0).setDepth(-4).setAlpha(0);

      // How late it's got. One rectangle whose alpha *is* the evening spent —
      // the same trick the Bog's murk and the Peaks' fog use, so "the evening
      // ran away from you" is a single number nobody has to read.
      this.night = this.add
        .rectangle(0, 0, W, BEACH_Y + 20, 0x1b2350)
        .setOrigin(0)
        .setAlpha(0)
        .setDepth(-5);

      // The beach slides up as the tide comes in. The tile is drawn tall
      // enough that it still reaches the bottom of the canvas at full tide.
      this.beach = this.add.image(0, BEACH_Y, 'bay-bg-beach').setOrigin(0).setDepth(-3);
    }

    buildActors() {
      this.glimmer = this.add.sprite(GLIMMER.x, GLIMMER.y, 'bay-glimmer', 0).setDepth(2);
      this.bob = 0;

      this.bonfireSprite = this.add
        .sprite(BONFIRE_X, FEET_Y + 12, 'bay-bonfire', 3)
        .setOrigin(0.5, 1)
        .setDepth(2);
      this.friends = [
        this.add.sprite(BONFIRE_X - 34, FEET_Y + 10, 'bay-friend', 0).setOrigin(0.5, 1).setDepth(3),
        this.add.sprite(BONFIRE_X + 32, FEET_Y + 10, 'bay-friend', 0).setOrigin(0.5, 1).setDepth(1),
      ];

      this.traveler = this.add
        .sprite(230, FEET_Y, 'bay-traveler', 0)
        .setOrigin(0.5, 1)
        .setDepth(10);

      // The catching band, drawn faintly so a player knows where their hands
      // actually are before they miss something and have to work it out.
      this.hands = this.add.circle(230, HAND_Y, CATCH_R, 0xffffff, 0).setStrokeStyle(1.5, 0xffffff, 0.28).setDepth(9);
    }

    buildHud() {
      const hud = this.add.container(0, 0).setDepth(30);
      this.hudLabel = this.add
        .text(10, 4, 'How the evening’s going', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '10px',
          color: '#ffffff',
        })
        .setAlpha(0.9);
      this.hudBack = this.add.rectangle(10, 18, 132, 9, 0x000000, 0.3).setOrigin(0);
      this.hudBar = this.add.rectangle(11, 19, 130, 7, 0x7b6ef6).setOrigin(0);
      this.hudNotch = this.add
        .rectangle(11 + (130 * target) / 100, 16, 2, 13, 0xffffff, 0.9)
        .setOrigin(0.5, 0);

      // Chapter 2 hides all of this on purpose. The realm's claim is that the
      // numbers which would tell you are not on offer when it matters, so the
      // game does not offer them either — the Traveler and the bonfire are the
      // only readouts left.
      for (const o of [this.hudLabel, this.hudBack, this.hudBar, this.hudNotch]) {
        o.setVisible(showNumbers);
      }

      this.roundText = this.add
        .text(W - 10, 6, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
        })
        .setOrigin(1, 0)
        .setAlpha(0.85);

      this.flash = this.add
        .text(W / 2, 34, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 380 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);
      this.flash.setShadow(0, 1, '#1f3452', 4);

      hud.add([this.hudLabel, this.hudBack, this.hudBar, this.hudNotch, this.roundText, this.flash]);
    }

    /**
     * The two buttons, and the fact that they are not the same size.
     *
     * "One more" is bright, big and sits where your eye already is; "I'm done
     * for now" is quieter and further away. That asymmetry is a real thing
     * real apps do, it is the whole reason stopping takes effort, and the
     * debrief names it out loud rather than leaving it as a trick played on a
     * child. Both are equally clickable and equally reachable from the
     * keyboard — the weight is visual, never mechanical.
     */
    buildChoice() {
      this.choiceLayer = this.add.container(0, 0).setDepth(24).setVisible(false);

      // The veil covers the sky and the sea only, never the beach. The choice
      // is the exact moment a player most needs to read the Traveler's posture,
      // the bonfire and the tide — dimming them, or worse covering them with a
      // button, would hide the readouts precisely when chapter 2 has nothing
      // else to offer.
      const veil = this.add.rectangle(0, 0, W, 168, 0x1b2350, 0.38).setOrigin(0);

      this.glimmerLine = this.add
        .text(W / 2, 74, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 440 },
        })
        .setOrigin(0.5, 0);
      this.glimmerLine.setShadow(0, 1, '#1f3452', 4);

      this.buttons = [
        { id: 'more', x: 214, y: 130, w: 140, h: 34, label: 'One more' },
        { id: 'done', x: 382, y: 130, w: 170, h: 28, label: 'I’m done for now' },
      ];

      this.buttonGfx = this.add.graphics();
      this.buttonTexts = this.buttons.map((b) =>
        this.add
          .text(b.x, b.y, b.label, {
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: b.id === 'more' ? '15px' : '12px',
            fontStyle: 'bold',
            color: b.id === 'more' ? '#ffffff' : '#eef1ff',
          })
          .setOrigin(0.5),
      );

      this.choiceLayer.add([veil, this.glimmerLine, this.buttonGfx, ...this.buttonTexts]);
    }

    bindInput() {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.actKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
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
        Phaser.Input.Keyboard.KeyCodes.ENTER,
      ]);

      this.input.on('pointermove', (p) => {
        this.pointerTargetX = p.worldX;
        if (this.phase === 'choice') {
          const hit = this.hitButton(p.worldX, p.worldY);
          if (hit >= 0) this.choicePick = hit;
        }
      });
      this.input.on('pointerdown', (p) => {
        if (this.phase !== 'choice' || this.frozen) return;
        const hit = this.hitButton(p.worldX, p.worldY);
        if (hit >= 0) this.commitChoice(this.buttons[hit].id);
      });
    }

    hitButton(x, y) {
      return this.buttons.findIndex(
        (b) => Math.abs(x - b.x) < b.w / 2 && Math.abs(y - b.y) < b.h / 2 + 4,
      );
    }

    /* -------------------------------------------------------- the choice -- */

    openChoice(first = false) {
      this.phase = 'choice';
      this.choicePick = 0;
      this.autoplayT = 0;
      const next = rounds[this.roundIndex + 1];

      if (!next) {
        this.endEvening('late');
        return;
      }

      this.glimmerLine.setText(first ? level.opener ?? 'Come and play!' : next.glimmer ?? 'One more?');
      this.choiceLayer.setVisible(true);
      this.buttonTexts[0].setText(first ? 'Play' : 'One more');
    }

    commitChoice(id) {
      if (this.phase !== 'choice' || this.frozen) return;
      this.choiceLayer.setVisible(false);
      if (id === 'done') {
        this.endEvening('stopped');
        return;
      }
      this.startRound();
    }

    /* --------------------------------------------------------- the round -- */

    startRound() {
      this.roundIndex += 1;
      const def = rounds[this.roundIndex];
      this.phase = 'round';
      this.roundDef = def;
      this.caught = 0;
      this.thrown = 0;
      this.spawned = 0;
      this.roundClock = 0;

      // The evening is spent at the *start* of a round — you committed the
      // time the moment you said yes, which is exactly how it works.
      this.bonfire = Math.max(0, this.bonfire - def.cost);
      this.refresh();
    }

    spawnMote() {
      const def = this.roundDef;
      const dim = Boolean(def.dim);
      const mote = this.add.image(GLIMMER.x, GLIMMER.y, 'bay-mote', dim ? 1 : 0).setDepth(8);
      mote.vx = 30 + Math.random() * 75;
      mote.vy = -(25 + Math.random() * 30);
      this.motes.push(mote);
      this.spawned += 1;
      this.thrown += 1;
      this.glimmer.setFrame(1);
      this.time.delayedCall(180, () => {
        if (this.phase === 'round') this.glimmer.setFrame(0);
      });
    }

    runMotes(dt) {
      for (const mote of [...this.motes]) {
        mote.vy += 60 * dt;
        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;

        const d = Math.hypot(mote.x - this.traveler.x, mote.y - HAND_Y);
        if (d < CATCH_R) {
          this.caught += 1;
          this.pop(mote.x, mote.y);
          this.motes = this.motes.filter((m) => m !== mote);
          mote.destroy();
          continue;
        }
        if (mote.y > FEET_Y + 14 || mote.x > W + 20) {
          this.motes = this.motes.filter((m) => m !== mote);
          this.tweens.add({
            targets: mote,
            alpha: 0,
            duration: 220,
            onComplete: () => mote.destroy(),
          });
        }
      }
    }

    pop(x, y) {
      const p = this.add.image(x, y, 'bay-catch').setDepth(12);
      this.tweens.add({
        targets: p,
        scale: 1.9,
        alpha: 0,
        duration: 260,
        onComplete: () => p.destroy(),
      });
    }

    finishRound() {
      const def = this.roundDef;
      const share = this.thrown ? this.caught / this.thrown : 1;
      const gained = Math.round(def.fun * (FLOOR + (1 - FLOOR) * share));
      this.sparks += gained;

      // How good that round actually was, relative to the first one. This is
      // the hidden number the Traveler's posture is drawn from — so the tell
      // is an honest function of the decline, not a scripted mood.
      this.lastFeel = rounds[0].fun ? def.fun / rounds[0].fun : 1;

      this.log.push({
        index: this.roundIndex + 1,
        fun: gained,
        cost: def.cost,
        caught: this.caught,
        thrown: this.thrown,
        bonfire: this.bonfire,
      });
      onRound?.({
        index: this.roundIndex + 1,
        fun: gained,
        cost: def.cost,
        caught: this.caught,
        thrown: this.thrown,
        bonfire: this.bonfire,
        sparks: this.sparks,
      });

      this.refresh();
      if (showNumbers) {
        this.say(
          gained >= rounds[0].fun * 0.7
            ? `That was a good one. +${gained}`
            : gained >= rounds[0].fun * 0.4
              ? `+${gained}`
              : `+${gained}. Not much in that one.`,
        );
      }

      this.maybeWave();
      if (this.checkDecision()) return;
      this.openChoice();
    }

    /* ---------------------------------------------------------- the beat -- */

    /** Chapter 3's called moment: a friend waves, and it doesn't wait forever. */
    maybeWave() {
      if (waveAfter == null) return;
      const done = this.roundIndex + 1;
      if (done === waveAfter) {
        this.waveOpenedAt = done;
        this.friends[0].setFrame(1);
        this.say('Down the beach, somebody waves you over.');
        return;
      }
      if (this.waveOpenedAt != null && !this.waveResolved && done > this.waveOpenedAt + waveWindow) {
        this.waveResolved = true;
        this.friends[0].setFrame(0);
        this.bonfire = Math.max(0, this.bonfire - (level.waveMissPenalty ?? 8));
        this.refresh();
        this.say('They stopped waving. You didn’t look up.');
      }
    }

    /**
     * The realm's decision doesn't happen on a button in a panel — it happens
     * at a "one more?", part-way through the evening, with the Glimmer already
     * saying you're fine.
     */
    checkDecision() {
      if (decisionAfter == null || this.decisionFired) return false;
      if (this.roundIndex + 1 < decisionAfter) return false;
      this.decisionFired = true;
      this.frozen = true;
      this.phase = 'choice';
      this.choiceLayer.setVisible(false);
      this.say('');
      onDecisionReached?.();
      return true;
    }

    /**
     * React calls this once the player has settled the decision.
     *
     * An unsafe answer costs the evening and does *not* resume — the decision
     * is handed straight back instead, same no-dead-end rule as every other
     * realm (design.md §5). The safe answer buys a `notice` beat: the game
     * points, once, at the three things that were already on screen.
     */
    resolveDecision(safe) {
      if (!safe) {
        this.bonfire = Math.max(0, this.bonfire - 8);
        this.refresh();
        this.say('The tide creeps up a little further.');
        return;
      }
      this.frozen = false;
      this.showNotice();
    }

    /** The safe answer's reward: what you'd have seen if you had looked. */
    showNotice() {
      this.phase = 'notice';
      const items = [
        { x: this.traveler.x, y: HAND_Y - 30, text: 'your shoulders' },
        { x: BONFIRE_X, y: FEET_Y - 60, text: 'the bonfire' },
        { x: 300, y: 60, text: 'how dark it got' },
      ];
      this.noticeTexts = items.map((it) => {
        const t = this.add
          .text(Phaser.Math.Clamp(it.x, 60, W - 60), it.y, it.text, {
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#1b2350',
            padding: { x: 6, y: 3 },
          })
          .setOrigin(0.5)
          .setDepth(28)
          .setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 260 });
        return t;
      });
      this.say('You looked. It was all already there.');
      this.time.delayedCall(2600, () => {
        for (const t of this.noticeTexts ?? []) t.destroy();
        this.noticeTexts = null;
        if (!this.finished) this.openChoice();
      });
    }

    /* -------------------------------------------------------- the ending -- */

    endEvening(how) {
      if (this.finished) return;
      this.finished = true;
      this.phase = 'over';
      this.choiceLayer.setVisible(false);

      // Getting there while somebody was still waving is worth something
      // specific, which is the point of chapter 3: the cost of one more isn't
      // always a vague "balance", sometimes it's a thing with a time on it.
      let waveBonus = 0;
      if (
        waveAfter != null &&
        !this.waveResolved &&
        this.waveOpenedAt != null &&
        this.roundIndex + 1 <= this.waveOpenedAt + waveWindow
      ) {
        waveBonus = level.waveBonus ?? 12;
        this.waveResolved = true;
        this.bonfire = Math.min(bonfireStart, this.bonfire + waveBonus);
        this.friends[0].setFrame(1);
        this.refresh();
      }

      this.say(
        how === 'late'
          ? 'It got late. The Glimmer ran out of things to throw.'
          : 'You put it down and headed for the bonfire.',
      );

      // Walking to the bonfire is the last thing that happens, every time —
      // stopping is an action, and it should look like one.
      this.tweens.add({
        targets: this.traveler,
        x: BONFIRE_X - 66,
        duration: 900,
        ease: 'Sine.inOut',
      });
      this.tweens.add({ targets: this.stars, alpha: 1, duration: 900 });

      this.time.delayedCall(1200, () =>
        onEvening?.({
          sparks: this.sparks,
          bonfire: this.bonfire,
          total: this.total(),
          rounds: this.roundIndex + 1,
          how,
          waveBonus,
          log: this.log,
        }),
      );
    }

    /* ----------------------------------------------------------- readout -- */

    total() {
      return Phaser.Math.Clamp(Math.round(this.sparks + this.bonfire), 0, 100);
    }

    /** Push every readout at once, so they can never disagree with each other. */
    refresh() {
      const total = this.total();
      this.hudBar.width = Math.max(1, (130 * total) / 100);
      this.hudBar.fillColor = total >= target ? 0x57b3a3 : total < 40 ? 0xe0637a : PERI;

      const spent = bonfireStart ? 1 - this.bonfire / bonfireStart : 0;
      this.night.setAlpha(Math.min(0.62, spent * 0.7));
      this.stars.setAlpha(this.finished ? 1 : Math.min(0.5, spent * 0.6));
      // the tide, coming up the beach
      this.beach.y = BEACH_Y - Math.round(spent * 14);

      this.bonfireSprite.setFrame(
        this.bonfire >= bonfireStart * 0.72
          ? 3
          : this.bonfire >= bonfireStart * 0.48
            ? 2
            : this.bonfire >= bonfireStart * 0.22
              ? 1
              : 0,
      );

      // Posture, from how good the last round actually was. The bands are
      // deliberately early — the first slump shows while the round is still
      // paying reasonably well, because a tell that only appears once you're
      // obviously miserable is a tell that arrived too late to be worth
      // reading. Chapter 2's decision lands on the second band on purpose:
      // something has changed, and only a little.
      this.traveler.setFrame(
        this.lastFeel > 0.8 ? 0 : this.lastFeel > 0.55 ? 1 : this.lastFeel > 0.3 ? 2 : 3,
      );
      // The Glimmer leans in harder the longer you stay.
      this.glimmer.setFrame(this.roundIndex >= 4 ? 2 : this.phase === 'round' ? 1 : 0);

      onMeter?.({ sparks: this.sparks, bonfire: this.bonfire, total, rounds: this.roundIndex + 1 });
    }

    say(text) {
      this.flash.setText(text);
      this.tweens.killTweensOf(this.flash);
      this.flash.setAlpha(text ? 1 : 0);
      if (text) this.tweens.add({ targets: this.flash, alpha: 0, delay: 1900, duration: 500 });
    }

    /* ----------------------------------------------------------- the loop -- */

    update(_, dms) {
      const dt = dms / 1000;
      this.bob += dt;
      this.glimmer.y = GLIMMER.y + Math.sin(this.bob * 1.6) * 3;

      if (this.phase === 'round') {
        this.walk(dt);
        this.roundClock += dms;
        if (this.spawned < this.roundDef.motes && this.roundClock >= this.spawned * MOTE_GAP) {
          this.spawnMote();
        }
        this.runMotes(dt);
        if (this.spawned >= this.roundDef.motes && !this.motes.length) this.finishRound();
      } else if (this.phase === 'choice' && !this.frozen) {
        this.runChoice(dms);
      }

      this.hands.setPosition(this.traveler.x, HAND_Y);
      this.roundText.setText(
        this.phase === 'round'
          ? `Round ${this.roundIndex + 1}`
          : this.finished
            ? ''
            : this.roundIndex < 0
              ? ''
              : `${this.roundIndex + 1} so far`,
      );
    }

    walk(dt) {
      const c = this.cursors;
      const left = c.left.isDown || this.wasd.A.isDown;
      const right = c.right.isDown || this.wasd.D.isDown;

      if (left || right) {
        this.pointerTargetX = null;
        this.traveler.x += (right ? 1 : -1) * WALK_SPEED * dt;
      } else if (this.pointerTargetX != null) {
        const dx = this.pointerTargetX - this.traveler.x;
        if (Math.abs(dx) > 4) {
          this.traveler.x += Math.sign(dx) * Math.min(WALK_SPEED * dt, Math.abs(dx));
        }
      }
      this.traveler.x = Phaser.Math.Clamp(this.traveler.x, ROAM.min, ROAM.max);
    }

    runChoice(dms) {
      const c = this.cursors;
      if (Phaser.Input.Keyboard.JustDown(c.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
        this.choicePick = 0;
      }
      if (Phaser.Input.Keyboard.JustDown(c.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
        this.choicePick = 1;
      }
      if (
        Phaser.Input.Keyboard.JustDown(this.actKey) ||
        Phaser.Input.Keyboard.JustDown(this.enterKey)
      ) {
        this.commitChoice(this.buttons[this.choicePick].id);
        return;
      }

      // Autoplay. Not cancellable by wiggling the selection — the whole point
      // is that only an actual decision counts, and doing nothing is the
      // Glimmer's decision, not yours.
      if (autoplayMs && this.roundIndex >= 0) {
        this.autoplayT += dms;
        if (this.autoplayT >= autoplayMs) {
          this.say('The Glimmer started the next one for you.');
          this.commitChoice('more');
          return;
        }
      }

      this.drawButtons();
    }

    drawButtons() {
      const g = this.buttonGfx;
      g.clear();
      this.buttons.forEach((b, i) => {
        const on = this.choicePick === i;
        if (b.id === 'more') {
          g.fillStyle(PERI, 1);
          g.fillRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 10);
          // the glow that makes it the easy one to reach for
          g.lineStyle(on ? 3 : 2, 0xffffff, on ? 0.95 : 0.5);
          g.strokeRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 10);
          if (autoplayMs && this.roundIndex >= 0) {
            const frac = Phaser.Math.Clamp(this.autoplayT / autoplayMs, 0, 1);
            g.fillStyle(GOLD, 0.55);
            g.fillRoundedRect(b.x - b.w / 2, b.y + b.h / 2 - 5, b.w * frac, 5, 2);
          }
        } else {
          g.fillStyle(0xffffff, on ? 0.3 : 0.14);
          g.fillRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 8);
          g.lineStyle(on ? 2.5 : 1.5, 0xffffff, on ? 0.9 : 0.45);
          g.strokeRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 8);
        }
      });
    }
  }

  return { scene: OneMoreScene, backgroundColor: '#8f86e8' };
}
