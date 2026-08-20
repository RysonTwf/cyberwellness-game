# Handover — Privacy Peaks + Balance Bay rebuilds (2026-08-20)

Branch: `merge/ryson-plus-mine`. The Bully Bog work is **committed**
(`7762f96`). Everything below is **new uncommitted working-tree state** on top
of it, from two sessions: Privacy Peaks first, then Balance Bay. `npx vite
build` passes; both realms were played end to end in a browser, and every
failure mode each one claims was measured rather than assumed.

Four of the five realms now run as full multi-chapter experiences. **Fable
Falls is the only one left.**

---

## The pattern all four now share

Each of these realms had the same disease, and it wasn't length: **the mechanic
taught against its own rule.**

| Realm | The old mechanic quietly taught… | …but the rule says |
| --- | --- | --- |
| Bully Bog | sorting comments into two tidy piles | acting is *hard*, and doing nothing is the easy option |
| Privacy Peaks | judge a message by reading it | looking official is the easiest part to fake |
| Balance Bay | plan a tidy day from a god's-eye view | notice how you feel *in the moment*, while it's still fun |

So in each case the fix was to make the mechanic *be* the rule, and — the part
worth keeping — **to enforce it with arithmetic rather than assert it in a text
box.** Every one of these realms now has a scoring curve in which the tempting
wrong strategy is measurably unable to reach the target. That's the house
style now; hold the next realm to it.

`FULL_MECHANICS` in `RealmScreen.jsx` is the seam. It is now four lines.

---

# Part 1 — Privacy Peaks: "The Fog Line"

Three chapters. Messages arrive pegged to a line along a ridge, all on
identical white paper. You lift one down, carry it to a post and **hold** to
check — the spyglass (who actually sent it), the signal fire (check by a route
*you* chose), the ranger's hut (ask a grown-up) — then commit at one end of the
ridge or the other: the drop, or the waypost.

**The arithmetic:** committing unchecked scores a token +2/+3 *even when you're
right*; committing after the check that would have caught it scores +10/+12.
Being suspicious of everything fails too, because some messages are genuine and
matter. Checks cost seconds, the line holds two notes, and the wind takes what
you leave hanging — so you must triage.

| # | Chapter | Adds |
| --- | --- | --- |
| 1 | Who's Actually Talking | the two commits, the spyglass |
| 2 | Looks Right, Isn't | the signal fire, and senders who genuinely *are* who they claim |
| 3 | What They're Really After | `heavy` messages; only the ranger's hut resolves them |

The decision fires the moment the "Atlas Security" message arrives
(`decisionOn: 'q3'` — keyed to a message id, not a count as the Bog does), with
it still hanging on the line.

### Measured

| Play style | Ch1 (t 82) | Ch2 (t 82) | Ch3 (t 80) |
| --- | --- | --- | --- |
| Check, then commit | **100** ✓ | **100** ✓ | **100** ✓ |
| Perfect instincts, never checks | 56 ✗ | — | — |
| Touches nothing | 30 ✗ | — | — |
| Spyglass only, never the fire | — | 70 ✗ | — |
| Never asks the ranger | — | — | 50 ✗ |

**A balance bug worth knowing about:** chapter 2 originally let a
spyglass-only player pass at 87/82 — its entire claim, undone by its own
scoring, because only three cards were fire-decided and the clamp at 100 hid
the penalty. Fixed in the *data*, not the dials: `q5` and `q9` became
`caughtBy: ['fire']`, and their `spy` lines were reworded to be **true but not
decisive** ("The school address, as always. Which is also what a good fake
would look like."). That wording pattern is the chapter — imitate it if you add
cards there.

### Files

- `src/minigames/phaser-scenes/fogLineScene.js` (new) — the scene.
- `src/minigames/phaser-scenes/peakArt.js` (new) — procedural art; the far
  lookout's 4 frames are the visibility readout.
- `src/components/PeaksStoryRealm.jsx` (new) — the React frame.
- `src/data/realms.js` — `privacyHigher` rewritten; story re-sequenced, new
  `extraBeats`, `rule` rewritten to pull three chapters together.

**Don't undo these three; each cost a debugging pass:** a carried note is
x-clamped (the commits sit within half a note of the canvas edges); the hold
ring sits *beside* the post at depth 25 (a carried note hangs over the post
you're standing at and covered it); a note's spawn pop is scale-only, never
alpha. Also: `drawReach()` owns every note's `y` every frame, so nothing else
may tween `y` on a note.

`CARD_W` (210) and `SLOTS` (140/376) were chosen together. **Keep message
`text` under ~95 characters** or a note wraps to four lines and reaches into
the posts.

---

# Part 2 — Balance Bay: "One More"

Three chapters. You play with the Glimmer — actually play, catching motes it
throws you — and the only question the game ever asks is *one more?*

**The arithmetic, and it's the good bit:** the toy genuinely gets worse. Each
round throws fewer motes, duller ones, and pays less. Meanwhile the bonfire
burns down, faster the longer you stay. So there's a hump, it's in the middle,
and **both** failure modes lose: quitting immediately fails, and playing every
round scores *worse than never playing at all*.

| # | Chapter | Adds |
| --- | --- | --- |
| 1 | One More | the loop, numbers on — the decline is visible |
| 2 | You're Basically Fine | **the numbers go away.** Only the Traveler's posture, the bonfire, the sky and the tide are left |
| 3 | The Bonfire | **autoplay** — the next round starts unless you stop it — plus a friend who waves, with a deadline |

The decision fires at a "one more?" after round 3 of chapter 2, with the
Glimmer already insisting you're fine and the numbers already switched off. The
safe answer buys a **notice beat**: the scene points, once, at the three things
that were already on screen.

### Measured

Chapter 1, every stopping point (target 82, ~85% catch rate):

| Stopped after | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Evening | 60 ✗ | 71 ✗ | 82 ✓ | 88 ✓ | **89** ✓ | 87 ✓ | 77 ✗ | 56 ✗ |

Note **56 < 60**: playing every round really is worse than never playing.

Chapter 3 (target 82): stopping at 2 → 78 ✗; **3 → 94 ✓; 4 → 94 ✓**; 5 → 63 ✗;
6 → 58 ✗. The pass window is exactly the wave window. A **fully passive player
— one who never touches the choice after the first round — lands at 56**, which
is the chapter's whole claim about autoplay, in a number.

Full clean run: 88 / 84 / 93, rule, stamp saved.

### Files

- `src/minigames/phaser-scenes/oneMoreScene.js` (new) — the scene.
- `src/minigames/phaser-scenes/bayArt.js` (new) — procedural art. **Two sprites
  are readouts, not scenery:** the Traveler's 4-frame posture and the bonfire's
  4 frames. Chapter 2 has nothing else, so treat them as load-bearing.
- `src/components/BayStoryRealm.jsx` (new) — the React frame **and the evening
  chart** (see below).
- `src/data/realms.js` — `balanceHigher` rewritten. `balanceLower` is now
  self-contained (this band used to borrow `balanceLower.game.items`), and
  `MiniGameBalance` stays registered because P1–P3 still uses it.

**Three things not to undo:**

1. **The choice buttons sit over the water, not the beach**, and the veil
   covers only the sky and sea. They were originally at the bottom and covered
   the Traveler — i.e. hid the posture readout at the exact moment chapter 2
   needs it.
2. **"One more" is bright and big; "I'm done for now" is quiet and further
   away.** That asymmetry is deliberate — it's a real dark pattern, it's why
   stopping takes effort, and the debrief names it out loud. Both are equally
   clickable and equally keyboard-reachable; **the weight is visual, never
   mechanical.** Don't "fix" it, and don't make it actually harder to press.
3. **The Glimmer is drawn pretty and stays pretty.** Making it sinister would
   answer "am I still enjoying this?" for the player and teach the wrong thing
   — the claim is not that screens are bad.

### The evening chart (`EveningChart` in `BayStoryRealm.jsx`)

This realm's teaching happens in the debrief, because the thing it wants you to
notice is invisible while it's happening. The chart is one axis (evening
points) diverging around a neutral zero rule: what each round was **worth**
above it, what it **cost** below. Read left to right, the moment the gold bar
outgrows the periwinkle one is the moment "one more" stopped paying for
itself. Rounds you never reached are drawn faintly from the chapter's design
values, so the quit-immediately failure can still see the hump it stopped short
of.

Built against the `dataviz` skill, and two of its rules bit for real:

- **One scale, both directions.** The first version scaled up-bars and
  down-bars independently, which put the visual crossover somewhere other than
  the real one — a covert dual-axis on precisely the thing the chart exists to
  show. Both are the same unit; they now share one pixels-per-point. **Don't
  re-split them.**
- **The palette is validated, and the gold has a debt.** periwinkle/gold pass
  the categorical checks (adjacent ΔE 34.3 protan, 24.4 tritan, 35.4 normal),
  but gold is 2.27:1 on white — under 3:1. That's why every bar is directly
  labelled *and* there's a visible table under the chart. That relief is
  required, not decoration; if you restyle the chart, keep both.

---

## Verified in-browser (both realms)

Story → three chapters → rule → stamp, progress saved, no console errors, on
each realm. Plus, on Privacy Peaks: the decision freezing as `q3` spawns with
the message still hanging; the unsafe answer costing 12 and re-asking
**without** unfreezing; heavy notes refused at the waypost and +14 at the hut;
both extra beats gating Next. On Balance Bay: the numbers genuinely hidden in
chapter 2 (`hudBar.visible === false`); the decision firing after round 3; the
unsafe answer costing 8 and re-asking; the notice beat naming its three tells;
autoplay starting round 4 by itself after 4 s; the wave opening after round 3
and closing one round later.

**Testing note, same as the last two sessions:** the browser-automation tab
reports `document.hidden`, so `requestAnimationFrame` never fires and the
Phaser loop sits at frame 0. Drive it by hand: a temporary `window.__peak` /
`window.__bay = this` at the end of `create()`, then `game.step(t, 16.67)` in a
loop. **`scene.update` and `time.delayedCall` advance under hand-stepping but
tweens barely do** (a 260 ms tween moved ~38 ms across 60 hand-steps), so
anything mid-tween looks frozen or half-faded in screenshots — a harness
artifact, not a bug. Both hooks were removed; `grep -rn "__peak\|__bay" src/`
is clean.

---

## Not done / next up

1. **Fable Falls is the last short realm.** Still one story → one decision →
   one Detective/Compare board → one rule. It's in better shape than the other
   three were — the Compare mechanic is bespoke and recent (`de44a37`) — so the
   question there is more "does it need three chapters?" than "is the mechanic
   wrong?". Worth actually asking before rebuilding it: it may be that Fable
   Falls needs *lengthening* rather than *replacing*, which would be a first.
2. **`MiniGameSteppingStones` + `steppingStonesScene` are unused** since the
   Peaks rebuild. Correct, still registered in `GAMES`, pointed at by nothing.
   Delete or reuse deliberately.
3. **Lower band (P1–P3) is untouched everywhere.** Passworld, Bully Bog,
   Privacy Peaks and Balance Bay all still run their original simple mechanics
   for the younger band — which is fine and probably right, but it is now a
   very large gap between the two bands' P4–P6 and P1–P3 experiences.
4. **Balance for real players is untested in all four realms.** Every number in
   this document came from scripted play, which reads instantly, never
   hesitates, and catches ~85% of everything. A real child spends 3–5 s reading
   each message and will dither at every "one more?". Expect both new realms to
   be harder in a classroom than they were in the harness. The dials:
   - Peaks: `patience` (14/12/11.5 s) and `gap`, then `target`.
   - Bay: `target` and `bonfireStart`. **Not `fun`/`cost`** — those carry the
     lesson, and the whole curve was tuned as one shape.
5. **A pre-existing cosmetic issue, not introduced here:** several
   player-visible strings in `bullybogHigher` use `*asterisk*` emphasis, which
   renders literally (debrief text is plain React children, not markdown). The
   new Peaks and Bay copy avoids it; Bully Bog's
   `game.levels[1].instruction` and a couple of `lesson` lines still have it.
6. **A small improvement in `BayStoryRealm` worth back-porting:** it infers the
   *shape* of an extra beat from the data (a beat with `options` is a question,
   anything else is an acknowledgement) instead of hard-coding the two known
   keys the way the Bog and the Peaks do. That's why Balance Bay could add a
   `noticing` beat without touching the component.
7. `graphify update .` has been run.
