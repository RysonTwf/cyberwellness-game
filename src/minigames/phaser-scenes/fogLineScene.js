/**
 * Privacy Peaks P4–P6: "The Fog Line".
 *
 * The realm used to be six stepping stones — read a message, step on it or
 * skip it, done in forty seconds. That mechanic quietly teaches the wrong
 * thing, though: it asks you to *judge a message by reading it*, which is
 * exactly the skill a good scam is built to defeat. Looking official is the
 * easiest part to fake.
 *
 * So this game will not let you win by reading. Messages arrive pegged to a
 * line strung along the ridge, and every one of them is the same paper. To
 * find out anything about a message you have to unpeg it, carry it to a post,
 * and *spend time checking*:
 *
 *   The spyglass    look at who actually sent it — the address underneath
 *                   the name, not the name on top
 *   The signal fire check it the official way, by a route you chose rather
 *                   than the one the message handed you
 *   The ranger's hut ask a grown-up (chapter 3)
 *
 * Then you commit, at one end of the ridge or the other:
 *
 *   The drop        let it go
 *   The waypost     do what it says
 *
 * Why it's built this way — the mechanic is the lesson, not decoration:
 *
 *  - Committing *unchecked* scores a token +2 or +3 even when you happen to
 *    be right. Committing *after the check that would have caught it* scores
 *    +10 or +12. A player who trusts their gut and never checks anything
 *    mathematically cannot clear the fog, however good their instincts are.
 *    "Go and check the official way yourself", enforced by arithmetic.
 *  - Being suspicious of everything fails too. Some messages are real and
 *    matter, and binning one — or letting the wind take it while you were
 *    busy — costs you. Paranoia is not the skill; checking is.
 *  - Checks cost seconds, the line holds two notes, and the wind takes
 *    anything left hanging too long. So you cannot check everything and have
 *    to triage: which of these is worth the walk?
 *  - Chapter 2's messages are built so the spyglass alone isn't enough — the
 *    sender really is who it says. Only going and looking for yourself
 *    catches them.
 *  - `heavy` notes — the ones asking for something about *you*, or for a
 *    secret — are refused at the waypost outright and cost you at the drop.
 *    They only resolve at the ranger's hut. Chapter 3 cannot be finished
 *    without asking an adult for help, on purpose.
 *
 * Nothing here says which message is which. Notes are identical paper; only
 * `heavy` ones look different, and that difference says "this one is not like
 * the others", never which side of the line it's on. See peakArt.js.
 *
 * React owns all the words that aren't on the ridge — the chapter cards, the
 * decision, the debrief — same split as the Passworld platformer and the Bog
 * current. This scene reports what happened (`onResolve`) and how far you can
 * see (`onVisibility`), and freezes itself when the decision beat is due. See
 * PeaksStoryRealm.jsx.
 */

import { buildPeakArt, noteTexture, preloadPeakArt, stampTexture } from './peakArt';

const W = 560;

/** The rope. Notes hang from it, just under the HUD strip. */
const LINE_Y = 60;
/** Where the ridge tile starts, and therefore how far down the fog reaches. */
const RIDGE_TOP = 196;
/** The path along the ridge — where the Traveler's feet are. */
const RIDGE_Y = 222;

/**
 * Note width and slot spacing were chosen together and must stay that way:
 * two slots 236 apart hold a 210-wide note with room to breathe, and 210 is
 * wide enough that every message in realms.js wraps to three lines at most.
 * A four-line note reaches down into the posts. **If you add a message longer
 * than ~95 characters, check it still wraps to three lines.**
 */
const CARD_W = 210;
const SLOTS = [140, 376];
/** How far along the ridge the Traveler can reach up to the line. */
const REACH = CARD_W / 2 + 30;

const WALK_SPEED = 168;

const INK = 0x1f3452;
const GOLD = 0xe0a030;

/**
 * The posts along the ridge, left to right. `check` posts are held down at;
 * `commit` posts are tapped. The ranger's hut is both — asking a grown-up
 * both finds out and settles it.
 */
const POSTS = {
  drop: { x: 32, label: 'Let it go', role: 'commit' },
  spy: { x: 150, label: 'Spyglass', role: 'check', hold: 900, art: 'peak-spyglass' },
  fire: { x: 288, label: 'Signal fire', role: 'check', hold: 1250, art: 'peak-fire' },
  hut: { x: 426, label: 'The ranger', role: 'both', hold: 1100, art: 'peak-hut' },
  gate: { x: 528, label: 'Do it', role: 'commit' },
};
const POST_REACH = 34;

/**
 * Where each commit lands you, per post and per kind of message.
 *
 * `solved` is the branch taken when the player already ran the check that
 * would have caught this one; `raw` when they didn't. The gap between the two
 * columns *is* the curriculum — being right by luck is worth a fraction of
 * being right on purpose.
 */
const OUTCOMES = {
  drop: {
    bait: {
      solved: { v: 10, ok: true, note: 'You found out what it was, and then you let it go.' },
      raw: { v: 2, ok: true, note: 'Right call — but that was a guess, not a check.' },
    },
    real: {
      solved: { v: -5, ok: false, note: 'You checked, saw it was genuine, and binned it anyway.' },
      raw: { v: -5, ok: false, note: 'That one really was from them. Suspicious of everything isn’t the skill either.' },
    },
    noise: {
      solved: { v: 3, ok: true, note: 'Nothing was being asked of you. Letting it go was fine.' },
      raw: { v: 3, ok: true, note: 'Nothing was being asked of you. Letting it go was fine.' },
    },
    heavy: {
      solved: { v: -6, ok: false, note: 'Getting rid of it isn’t the same as telling someone.' },
      raw: { v: -6, ok: false, note: 'Getting rid of it isn’t the same as telling someone.' },
    },
  },
  gate: {
    bait: {
      solved: { v: -14, ok: false, note: 'You’d already found out what it was. And you did it anyway.' },
      raw: { v: -12, ok: false, note: 'You did what it asked without ever finding out who sent it.' },
    },
    real: {
      solved: { v: 12, ok: true, note: 'Checked first, then acted. That’s the whole method.' },
      raw: { v: 3, ok: true, note: 'That one was genuine — but you didn’t know that when you acted.' },
    },
    noise: {
      solved: { v: 3, ok: true, note: 'Harmless either way. Nothing was being asked of you.' },
      raw: { v: 3, ok: true, note: 'Harmless either way. Nothing was being asked of you.' },
    },
    heavy: null, // refused — see REFUSE_NOTE
  },
  hut: {
    heavy: { v: 14, ok: true, note: 'You showed a grown-up. That one was never yours to answer alone.' },
    bait: { v: 6, ok: true, note: 'Never wrong to show a grown-up — though you could have caught that one yourself.' },
    real: { v: 6, ok: true, note: 'The ranger says the same thing the fire would have: it’s genuine.' },
    noise: { v: -2, ok: false, note: 'Nothing here for a grown-up. It’s a library book.' },
  },
};

const REFUSE_NOTE = {
  gate: 'No. That one isn’t a message you answer at all — take it to the ranger.',
};

/** What the wind costs you, per kind, for anything left hanging too long. */
const BLOWN = {
  bait: { v: 0, ok: true, note: 'The wind took it. Nothing bad happened — but you never found out what it was.' },
  real: { v: -4, ok: false, note: 'That one mattered, and it blew away while you were busy.' },
  noise: { v: 1, ok: true, note: 'Gone. It was never going to matter.' },
  heavy: { v: -8, ok: false, note: 'You let that one blow away. Somebody should have heard about it.' },
};

export function makeFogLineConfig(
  Phaser,
  { level, onVisibility, onResolve, onDecisionReached, onRoundEnd, onSceneReady },
) {
  const script = level.messages ?? [];
  const gap = level.gap ?? 4200; // ms between arrivals
  const patience = level.patience ?? 13000; // ms a note hangs before the wind takes it
  const openPosts = level.posts ?? ['spy'];
  const decisionOn = level.decisionOn ?? null;
  const target = level.target ?? 100;

  class FogLineScene extends Phaser.Scene {
    constructor() {
      super('fog-line');
    }

    preload() {
      preloadPeakArt(this);
    }

    create() {
      buildPeakArt(this);

      this.visibility = level.startVisibility ?? 36;
      this.slots = SLOTS.map(() => null);
      this.carrying = null;
      this.spawnIndex = 0;
      this.nextSpawnAt = 500;
      this.elapsed = 0;
      this.frozen = false;
      this.finished = false;
      this.decisionFired = false;
      this.pointerTargetX = null;
      this.hold = { post: null, t: 0 };
      this.holdLock = false;

      this.buildBackdrop();
      this.buildPosts();
      this.buildLine();
      this.buildWalker();
      this.buildHud();
      this.bindInput();

      this.applyVisibility(0);
      onSceneReady?.(this);
    }

    /* ------------------------------------------------------------ scenery -- */

    buildBackdrop() {
      this.add.image(0, 0, 'peak-bg-sky').setOrigin(0).setDepth(-5);

      // The far lookout. Its frame is the visibility meter made into a thing
      // you look at rather than a number you read — you literally cannot see
      // it through thick fog, and it lights its lamp when the air clears.
      this.lookout = this.add.sprite(520, RIDGE_TOP, 'peak-lookout', 0).setOrigin(0.5, 1).setDepth(-4);

      this.fogBanks = [
        this.add.image(80, 96, 'peak-fogbank').setDepth(-3),
        this.add.image(320, 138, 'peak-fogbank').setDepth(-3),
        this.add.image(520, 112, 'peak-fogbank').setDepth(-3),
      ];

      // The fog itself. One rectangle over everything behind the ridge whose
      // alpha *is* the meter, so "you can see further" is a single number.
      this.fog = this.add.rectangle(0, 0, W, RIDGE_TOP, 0xeef3f4).setOrigin(0).setAlpha(0.5).setDepth(-2);

      this.add.image(0, RIDGE_TOP, 'peak-bg-ridge').setOrigin(0).setDepth(0);
    }

    buildPosts() {
      this.posts = ['drop', ...openPosts.filter((p) => POSTS[p]), 'gate'].map((id) => ({
        id,
        ...POSTS[id],
      }));

      for (const p of this.posts) {
        if (p.art) {
          p.sprite = this.add.sprite(p.x, RIDGE_Y, p.art, 0).setOrigin(0.5, 1).setDepth(1);
        } else if (p.id === 'drop') {
          this.add.image(p.x, RIDGE_Y, 'peak-drop').setOrigin(0.5, 1).setDepth(1);
        } else {
          this.add.image(p.x, RIDGE_Y, 'peak-gate').setOrigin(0.5, 1).setDepth(1);
        }

        this.add
          .text(p.x, RIDGE_Y + 10, p.label, {
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5, 0)
          .setDepth(2)
          .setShadow(0, 1, '#1f3452', 2);
      }

      // The ring a held check fills — "this takes a moment" as something you
      // watch happen rather than something a text box claims. It sits *beside*
      // the post at shoulder height, not above it: a note being carried hangs
      // directly over the post you're standing at, and a ring drawn there is
      // covered by the very note you're checking. Depth 25 puts it over the
      // carried note (20) as a second line of defence.
      this.holdRing = this.add.graphics().setDepth(25);
    }

    buildLine() {
      const g = this.add.graphics().setDepth(1);
      g.lineStyle(1.5, INK, 0.4);
      g.lineBetween(18, LINE_Y, W - 24, LINE_Y);
      // stakes at either end, so the rope is tied to the mountain
      g.lineStyle(3, 0x8a6a48, 1);
      g.lineBetween(18, LINE_Y - 6, 18, LINE_Y + 16);
      g.lineBetween(W - 24, LINE_Y - 6, W - 24, LINE_Y + 16);

      // The dashed line from the Traveler's hand up to whichever note is in
      // reach. Redrawn every frame in `update`.
      this.reachLine = this.add.graphics().setDepth(9);
    }

    buildWalker() {
      this.walker = this.add.sprite(280, RIDGE_Y, 'peak-walker', 0).setOrigin(0.5, 1).setDepth(10);
    }

    buildHud() {
      const hud = this.add.container(0, 0).setDepth(30);
      const label = this.add
        .text(10, 4, 'How far you can see', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '10px',
          color: '#1f3452',
        })
        .setAlpha(0.8);
      const back = this.add.rectangle(10, 18, 132, 9, 0x1f3452, 0.16).setOrigin(0);
      this.visBar = this.add.rectangle(11, 19, 130, 7, 0x57b3a3).setOrigin(0);
      // The target notch, so "how much more" is a place on the bar rather
      // than a sum to hold in your head.
      const notch = this.add
        .rectangle(11 + (130 * target) / 100, 16, 2, 13, 0x1f3452, 0.85)
        .setOrigin(0.5, 0);

      this.leftText = this.add
        .text(W - 10, 6, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '11px',
          color: '#1f3452',
        })
        .setOrigin(1, 0)
        .setAlpha(0.75);

      this.flash = this.add
        .text(W / 2, 244, '', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 400 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);
      this.flash.setShadow(0, 1, '#1f3452', 4);

      hud.add([label, back, this.visBar, notch, this.leftText, this.flash]);
    }

    bindInput() {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.actKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      // Otherwise an arrow or a space press scrolls the page behind the canvas
      // at the same time it walks the Traveler.
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

      // Mouse: the Traveler walks toward the pointer, and the button does
      // whatever Space does — a tap to lift or commit, held down to check.
      // Keyboard and mouse are the whole input story for this game (there is
      // no touch build), so both have to reach every verb.
      this.pointerDown = false;
      this.input.on('pointermove', (p) => {
        this.pointerTargetX = p.worldX;
      });
      this.input.on('pointerdown', (p) => {
        this.pointerTargetX = p.worldX;
        this.pointerDown = true;
        this.tap();
      });
      this.input.on('pointerup', () => {
        this.pointerDown = false;
      });
      this.input.on('gameout', () => {
        this.pointerDown = false;
      });
    }

    /* -------------------------------------------------------------- notes -- */

    spawnNote(def, slotIndex) {
      const heavy = def.kind === 'heavy';

      const from = this.add
        .text(0, 0, def.from ?? 'Unknown sender', {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#5c7185',
        })
        .setOrigin(0, 0);
      const body = this.add
        .text(0, 0, def.text, {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '10px',
          color: '#1f3452',
          align: 'left',
          wordWrap: { width: CARD_W - 26 },
        })
        .setOrigin(0, 0);

      const h = Math.max(46, Math.ceil(body.height) + 32);
      const note = this.add.image(0, 3, noteTexture(this, CARD_W, h, heavy)).setOrigin(0.5);
      from.setPosition(-CARD_W / 2 + 12, -h / 2 + 5);
      body.setPosition(-CARD_W / 2 + 12, -h / 2 + 24);

      const peg = this.add.image(0, -h / 2 - 3, 'peak-peg').setOrigin(0.5, 0.5);

      // The wind gauge — how long this note has left on the line. Deliberately
      // a thin bar on the note rather than a countdown clock in the HUD: this
      // realm spends its whole lesson on countdowns being a manipulation, and
      // the game shouldn't borrow the trick it's warning about.
      const wearBack = this.add
        .rectangle(-CARD_W / 2 + 10, h / 2 - 8, CARD_W - 20, 3, INK, 0.12)
        .setOrigin(0);
      const wear = this.add
        .rectangle(-CARD_W / 2 + 10, h / 2 - 8, CARD_W - 20, 3, 0x57b3a3)
        .setOrigin(0);

      const baseY = LINE_Y + 8 + h / 2;
      const container = this.add.container(SLOTS[slotIndex], baseY, [
        peg,
        note,
        from,
        body,
        wearBack,
        wear,
      ]);
      container.setSize(CARD_W, h);
      container.setDepth(2);
      // Pops in rather than dropping in: `drawReach` owns every note's y from
      // here on, so a tween on y would fight it every frame. The pop is scale
      // only, never alpha — a note that arrives mid-tween has to be *readable*
      // above all else, and a half-finished fade is a note you can't read.
      container.setScale(0.9);
      this.tweens.add({ targets: container, scale: 1, duration: 220, ease: 'Back.out' });

      const entry = {
        ...def,
        node: container,
        peg,
        wear,
        w: CARD_W,
        h,
        heavy,
        slot: slotIndex,
        left: def.patience ?? patience,
        span: def.patience ?? patience,
        checks: [],
        stamps: [],
        baseY,
      };
      this.slots[slotIndex] = entry;
      return entry;
    }

    /** Which note, if any, the Traveler can reach right now. */
    inReach() {
      let best = null;
      let bestD = REACH;
      for (const c of this.slots) {
        if (!c || c === this.carrying) continue;
        const d = Math.abs(this.walker.x - c.node.x);
        if (d < bestD) {
          best = c;
          bestD = d;
        }
      }
      return best;
    }

    /** Which post the Traveler is standing at, if any. */
    postHere() {
      return this.posts.find((p) => Math.abs(this.walker.x - p.x) < POST_REACH) ?? null;
    }

    /* ------------------------------------------------------------- verbs -- */

    tap() {
      if (this.frozen || this.finished) return;

      if (!this.carrying) {
        const note = this.inReach();
        if (!note) return;
        this.carrying = note;
        note.node.setDepth(20);
        note.peg.setVisible(false);
        this.tweens.add({ targets: note.node, scale: 0.94, duration: 120 });
        return;
      }

      const post = this.postHere();
      // A check post is held, not tapped — the ring says so. Tapping there
      // deliberately does nothing rather than dropping the note somewhere
      // surprising.
      if (post && (post.role === 'check' || post.role === 'both')) return;

      if (post && post.role === 'commit') {
        this.commit(this.carrying, post.id);
        return;
      }

      // Nowhere in particular: hang it back where it came from.
      const note = this.carrying;
      this.carrying = null;
      note.node.setDepth(2);
      note.peg.setVisible(true);
      note.node.y = note.baseY;
      this.tweens.add({ targets: note.node, scale: 1, x: SLOTS[note.slot], duration: 200 });
    }

    /** A completed hold at a check post. */
    finishCheck(post) {
      const note = this.carrying;
      if (!note) return;

      if (post.id === 'hut') {
        this.commit(note, 'hut');
        return;
      }

      post.sprite?.setFrame(1);
      this.time.delayedCall(600, () => post.sprite?.setFrame(0));

      if (note.checks.includes(post.id)) {
        this.say(
          post.id === 'spy'
            ? 'You’ve already had a look at that one through the glass.'
            : 'You’ve already checked that one the official way.',
        );
        return;
      }

      note.checks.push(post.id);
      const found = note[post.id];
      this.say(found ?? 'Nothing new. Not every check turns something up.');

      // The mark stays on the note, so "I already checked this" survives it
      // being hung back on the line.
      const tab = this.add
        .image(-CARD_W / 2 + 5, -note.h / 2 + 12 + note.stamps.length * 17, stampTexture(this, post.id))
        .setOrigin(0.5, 0);
      note.node.add(tab);
      note.stamps.push(tab);
    }

    /** Was this message checked in the way that would actually have caught it? */
    isSolved(note) {
      const catches = note.caughtBy ?? ['spy', 'fire'];
      return note.checks.some((c) => catches.includes(c));
    }

    commit(note, postId) {
      const solved = this.isSolved(note);
      const raw = OUTCOMES[postId]?.[note.kind];
      const outcome = raw && (raw.solved || raw.raw) ? (solved ? raw.solved : raw.raw) : raw;

      if (!outcome) {
        this.say(REFUSE_NOTE[postId] ?? 'Not that one, not here.');
        return;
      }

      this.carrying = null;
      this.slots[note.slot] = null;

      if (postId === 'hut') {
        const hut = this.posts.find((p) => p.id === 'hut');
        hut?.sprite?.setFrame(1);
        this.time.delayedCall(700, () => hut?.sprite?.setFrame(0));
        this.tweens.add({
          targets: note.node,
          x: POSTS.hut.x,
          y: RIDGE_Y - 30,
          scale: 0.15,
          alpha: 0,
          duration: 420,
          ease: 'Sine.in',
          onComplete: () => note.node.destroy(),
        });
      } else if (postId === 'drop') {
        // over the edge, and away on the wind
        this.tweens.add({
          targets: note.node,
          x: -80,
          y: note.node.y + 46,
          angle: -28,
          alpha: 0,
          duration: 520,
          ease: 'Sine.in',
          onComplete: () => note.node.destroy(),
        });
      } else {
        this.spark(note.node.x, note.node.y);
        this.tweens.add({
          targets: note.node,
          x: POSTS.gate.x,
          y: RIDGE_Y - 24,
          scale: 0.15,
          alpha: 0,
          duration: 380,
          ease: 'Sine.in',
          onComplete: () => note.node.destroy(),
        });
      }

      this.resolve(note, { action: postId, ok: outcome.ok, note: outcome.note, v: outcome.v, solved });
    }

    blowAway(note) {
      this.slots[note.slot] = null;
      const outcome = BLOWN[note.kind] ?? BLOWN.noise;
      this.tweens.add({
        targets: note.node,
        x: note.node.x - 150,
        y: note.node.y - 54,
        angle: -34,
        alpha: 0,
        duration: 620,
        ease: 'Sine.in',
        onComplete: () => note.node.destroy(),
      });
      this.resolve(note, {
        action: 'blown',
        ok: outcome.ok,
        note: outcome.note,
        v: outcome.v,
        solved: this.isSolved(note),
      });
    }

    spark(x, y) {
      const s = this.add.image(x, y, 'peak-spark').setDepth(21);
      this.tweens.add({
        targets: s,
        scale: 2.2,
        alpha: 0,
        duration: 320,
        onComplete: () => s.destroy(),
      });
    }

    /* ----------------------------------------------------------- scoring -- */

    resolve(note, result) {
      this.applyVisibility(result.v ?? 0);
      if (result.note) this.say(result.note);
      onResolve?.({
        id: note.id,
        from: note.from,
        text: note.text,
        kind: note.kind,
        why: note.why,
        checks: [...note.checks],
        solved: result.solved,
        action: result.action,
        ok: result.ok,
        note: result.note,
      });
    }

    applyVisibility(delta) {
      this.visibility = Phaser.Math.Clamp(this.visibility + delta, 0, 100);
      this.visBar.width = Math.max(1, (130 * this.visibility) / 100);
      this.visBar.fillColor =
        this.visibility >= target ? 0x57b3a3 : this.visibility < 30 ? 0xe0637a : 0xe0a030;
      this.fog.setAlpha(0.06 + (1 - this.visibility / 100) * 0.66);
      this.lookout.setFrame(
        this.visibility >= target ? 3 : this.visibility >= 60 ? 2 : this.visibility >= 34 ? 1 : 0,
      );
      onVisibility?.(this.visibility);
    }

    say(text) {
      this.flash.setText(text);
      this.tweens.killTweensOf(this.flash);
      this.flash.setAlpha(1);
      this.tweens.add({ targets: this.flash, alpha: 0, delay: 2200, duration: 500 });
    }

    /* ---------------------------------------------------------- the beat -- */

    /**
     * The realm's decision doesn't happen on a button in a panel — the ridge
     * stops the moment *that* message arrives, with it still hanging on the
     * line in front of you, and asks.
     */
    checkDecision(def) {
      if (!decisionOn || this.decisionFired || def.id !== decisionOn) return;
      this.decisionFired = true;
      this.frozen = true;
      this.say('');
      onDecisionReached?.();
    }

    /**
     * React calls this once the player has settled the decision.
     *
     * An unsafe answer thickens the fog but does *not* unfreeze — the decision
     * is handed straight back instead, same no-dead-end rule as every other
     * realm (design.md §5). Only the safe answer starts the wind again.
     */
    resolveDecision(safe, followUp) {
      if (!safe) {
        this.applyVisibility(-12);
        this.say('The fog closes in.');
        return;
      }
      this.frozen = false;
      if (followUp) this.say(followUp);
    }

    /* ----------------------------------------------------------- the loop -- */

    update(_, dms) {
      if (this.finished) return;
      this.elapsed += dms;
      const dt = dms / 1000;

      this.walk(dt);
      this.driftFog(dt);

      if (!this.frozen) {
        this.runWind(dms);
        this.maybeSpawn();
      }

      this.runHold(dms);
      this.drawReach();

      if (this.carrying) {
        // Clamped, not pinned to the walker: the drop and the waypost sit
        // within half a note's width of the edges, so a note held over either
        // of them would hang off the canvas and be unreadable at exactly the
        // moment the player is deciding what to do with it.
        this.carrying.node.x = Phaser.Math.Clamp(this.walker.x, CARD_W / 2 + 4, W - CARD_W / 2 - 4);
        this.carrying.node.y = RIDGE_Y - 44 - this.carrying.h / 2;
      }

      const remaining = script.length - this.spawnIndex;
      this.leftText.setText(remaining > 0 ? `${remaining} more coming` : 'that’s the last of them');

      this.checkEnd();
    }

    walk(dt) {
      const c = this.cursors;
      const left = c.left.isDown || this.wasd.A.isDown;
      const right = c.right.isDown || this.wasd.D.isDown;
      let moved = false;

      if (left || right) {
        // A key press takes the path back off the pointer — otherwise the
        // Traveler fights themselves whenever the cursor is parked somewhere.
        this.pointerTargetX = null;
        this.walker.x += (right ? 1 : -1) * WALK_SPEED * dt;
        this.walker.setFlipX(left);
        moved = true;
      } else if (this.pointerTargetX != null) {
        const dx = this.pointerTargetX - this.walker.x;
        if (Math.abs(dx) > 4) {
          this.walker.x += Math.sign(dx) * Math.min(WALK_SPEED * dt, Math.abs(dx));
          this.walker.setFlipX(dx < 0);
          moved = true;
        }
      }

      this.walker.x = Phaser.Math.Clamp(this.walker.x, 20, W - 20);
      if (moved && !this.walker.anims.isPlaying) this.walker.play('peak-walk');
      if (!moved && this.walker.anims.isPlaying) {
        this.walker.anims.stop();
        this.walker.setFrame(0);
      }

      // Space is the same button as a click: tapped it lifts or commits, held
      // at a check post it fills the ring (see `runHold`).
      if (Phaser.Input.Keyboard.JustDown(this.actKey)) this.tap();
    }

    driftFog(dt) {
      for (const bank of this.fogBanks) {
        bank.x -= 8 * dt;
        if (bank.x < -120) bank.x = W + 120;
      }
    }

    /**
     * Holding the button at a check post. The ring is the whole affordance —
     * standing at a post while carrying a note shows an empty ring, and
     * filling it is the only way to learn anything about the note.
     */
    runHold(dms) {
      this.holdRing.clear();
      if (this.frozen || this.finished || !this.carrying) {
        this.hold.post = null;
        this.hold.t = 0;
        return;
      }

      const post = this.postHere();
      if (!post || (post.role !== 'check' && post.role !== 'both')) {
        this.hold.post = null;
        this.hold.t = 0;
        return;
      }

      const down = this.actKey.isDown || this.pointerDown;
      if (!down) this.holdLock = false;

      if (this.hold.post !== post.id) {
        this.hold.post = post.id;
        this.hold.t = 0;
      }
      if (down && !this.holdLock) this.hold.t += dms;
      else if (!down) this.hold.t = 0;

      const frac = Phaser.Math.Clamp(this.hold.t / post.hold, 0, 1);
      const cx = post.x + 36;
      const cy = RIDGE_Y - 18;
      this.holdRing.fillStyle(0xffffff, 0.75);
      this.holdRing.fillCircle(cx, cy, 12);
      this.holdRing.lineStyle(3, INK, 0.25);
      this.holdRing.strokeCircle(cx, cy, 10);
      if (frac > 0) {
        this.holdRing.lineStyle(3, GOLD, 1);
        this.holdRing.beginPath();
        this.holdRing.arc(cx, cy, 10, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        this.holdRing.strokePath();
      }

      if (frac >= 1) {
        this.hold.t = 0;
        this.holdLock = true; // let go before you can check again
        this.finishCheck(post);
      }
    }

    /** The dashed line from the Traveler's hand to whatever is in reach. */
    drawReach() {
      this.reachLine.clear();
      const note = this.carrying ? null : this.inReach();
      for (const c of this.slots) {
        if (c && c !== this.carrying) c.node.y = c.baseY - (c === note ? 4 : 0);
      }
      if (!note) return;
      this.reachLine.lineStyle(1.5, GOLD, 0.85);
      const x = this.walker.x;
      for (let y = note.node.y + note.h / 2; y < RIDGE_Y - 34; y += 9) {
        this.reachLine.lineBetween(x, y, x, y + 4);
      }
    }

    runWind(dms) {
      for (const note of this.slots) {
        if (!note || note === this.carrying) continue;
        note.left -= dms;
        note.wear.width = Math.max(0, ((CARD_W - 20) * note.left) / note.span);
        note.wear.fillColor = note.left / note.span < 0.28 ? 0xe0637a : 0x57b3a3;
        if (note.left <= 0) this.blowAway(note);
      }
    }

    maybeSpawn() {
      if (this.spawnIndex >= script.length) return;
      if (this.elapsed < this.nextSpawnAt) return;
      const free = this.slots.indexOf(null);
      if (free === -1) {
        // The line is full. Wait rather than shoving somebody's note off it —
        // every message in the chapter has to get seen, because the debrief
        // reads all of them back.
        this.nextSpawnAt = this.elapsed + 500;
        return;
      }
      const def = script[this.spawnIndex];
      this.spawnIndex += 1;
      this.nextSpawnAt = this.elapsed + (def.gapAfter ?? gap);
      this.spawnNote(def, free);
      this.checkDecision(def);
    }

    checkEnd() {
      if (this.spawnIndex < script.length) return;
      if (this.carrying || this.frozen) return;
      if (this.slots.some((s) => s)) return;
      this.finished = true;
      this.say(
        this.visibility >= target ? 'The fog lifts. You can see the whole way down.' : 'That’s the last of them.',
      );
      this.time.delayedCall(700, () => onRoundEnd?.({ visibility: this.visibility }));
    }
  }

  return { scene: FogLineScene, backgroundColor: '#e8f1f0' };
}
