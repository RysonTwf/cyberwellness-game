# Handover — Bully Bog rebuild (2026-08-20)

Branch: `merge/ryson-plus-mine`. The Passworld work described in the previous
handover is now **committed and pushed** (`b00bde5`). Everything below is
**new uncommitted working-tree state** on top of it. `npx vite build` passes;
all three chapters were played through end to end in a browser.

---

## What was asked for, and what shipped

Previous handover's open item #1: *"the other four realms are still short."*
The ask this session was **Bully Bog only**, and — asked mid-session — to make
it **"more game-like instead of text-like"**, with a free hand on the mechanic.

So Bully Bog P4–P6 is no longer a story → decision → sort → rule sequence. It's
three chapters of a real arcade game, **The Bog Current**, built on the same
`fullMechanic` seam Passworld uses.

| Ask | Where it landed |
| --- | --- |
| Lengthen Bully Bog | 3 chapters, 27 comments + a pile-on tail of 5, ~2.5 min of actual play |
| Make it game-like | New Phaser scene: a current, a boat, a net, three drop stations, a live clarity meter |
| Keep the curriculum | Every comment carries a `why`; the two `extraBeats` now land on the chapter debriefs they belong to |
| Keyboard + mouse only | Arrows/WASD **or** the boat follows the pointer; Space **or** click for the one verb |

---

## The game

Comments float right-to-left along three lanes toward Pockets' lily pad. You
paddle a coracle anywhere in the water. **Space or a click** scoops the nearest
comment into your net; press again over one of the stations on the near bank to
drop it there.

| Station | What it does |
| --- | --- |
| **Report** | Takes a comment out of the water before it lands |
| **Pockets** | Shows a comment to Pockets |
| **The heron** | Fetches a grown-up (chapter 3 only) |

Anything you never touch drifts off the left edge and **lands**.

**The mechanic is the lesson, and it's enforced by the scoring, not asserted in
a text box:**

- Only carrying a **kind** comment to Pockets raises clarity. Reporting mean
  ones merely stops it falling. A player who spends the round deleting bad
  comments and never says anything kind **mathematically cannot clear the
  water.** Bystander → upstander, in arithmetic.
- Mean comments **gather likes** while they sit, and hit harder for each one
  (`base × (1 + likes × 0.25)`). Acting early beats acting perfectly.
- A **pile-on** spawns as a leader with followers stacked behind it. Report the
  leader and the whole tail pops with it; pick off followers one at a time and
  the leader lands anyway.
- **Heavy** cards (about who somebody *is*) slow the boat and the report basket
  refuses them outright. They only drop at the heron — chapter 3 **cannot be
  finished without asking an adult for help**, on purpose.
- **Doing nothing is a legal move**, and sometimes right: `fair` comments
  (honest, unwelcome, not cruel) are best left in the water. Reporting one
  costs you.

Every station × kind combination has a scored, worded outcome — see `OUTCOMES`
in the scene. There is no combination that just silently does nothing.

## The three chapters

Data lives in `src/data/realms.js` → `bullybogHigher.game.levels`.

| # | Name | Teaches | New mechanic |
| --- | --- | --- | --- |
| 1 | One Comment at a Time | Deleting the cruel one isn't the job; nothing improves until you say the kind thing where it can be seen | the two verbs |
| 2 | The Pile-On | A pile-on isn't one comment × 5 — the replies borrow their nerve from the first one | `chain` tails, `likeEvery` |
| 3 | About Who You Are | The comments that stick are about who somebody is; those aren't yours to carry alone | `heavy` cards, the heron, `fair` cards |

**The realm's decision fires mid-round in chapter 2.** The current freezes with
the pile-on still sitting in the water and the panel asks. An unsafe answer
darkens the water by 14 and hands the decision straight back without unfreezing
(no dead ends, design.md §5); the safe answer drops **the player's own words
into the water as a card** (`level.ownComment`) that they then have to carry
over to Pockets themselves.

---

## Files touched

### `src/minigames/phaser-scenes/bogCurrentScene.js` (new, ~700 lines)
The scene. One class replayed per chapter, everything data-driven: `comments`,
`speed`, `gap`, `likeEvery`, `hasHeron`, `decisionAfter`, `startClarity`,
`target`.

Two numbers that were chosen **together** and must stay that way: `CARD_W`
(190) and `LANES` (114/158/202, i.e. 44 apart). 44px is exactly the tallest a
two-line card gets; narrower cards push the longest comments to three lines and
neighbouring lanes start colliding. **If you add a comment longer than ~60
characters, check it still wraps to two lines.**

Grab range is measured to the nearest **edge** of a card, not its centre — at
190px wide, a centre-distance test made a card ungrabbable from either end. The
reach ring around the boat is therefore literally true: if it touches a
comment, you can lift it.

Draw order is explicit: cards depth 1, boat 10, a carried card 20, HUD 30.

### `src/minigames/phaser-scenes/bogArt.js` (new)
Procedural art set, same swap-in contract as `passworldArt.js` — `ART_MANIFEST`
declares both the eventual sprite-sheet file and a `draw()` stand-in; a `SKINS`
entry can replace any subset. Boat (2 frames), **Pockets (4 frames, driven by
the clarity meter — the frog's face is the readout you actually watch)**, heron
(2), reeds, puff, heart, treeline, water.

Comment cards aren't in the manifest: they're sized by their own text at
runtime (`bubbleTexture`). They're deliberately **not** colour-coded by kind —
only `heavy` ones look different, and that difference says "this one is not
like the others", never which side of the line it's on.

### `src/components/BogStoryRealm.jsx` (new)
The React frame: `story → chapter → round → debrief → (next chapter…) → rule →
stamp`. Owns the chapter cards, the clarity meter, the station legend, the live
feed, the decision, and the debrief.

**Same design constraint as Passworld, don't break it:** nothing reveals what a
comment actually was until the debrief. The cards are identical paper, the
meter moves on everything, and each comment's `why` is only read out afterwards.

The `extraBeats` (`footprint`, `tellSomeone`) that RealmScreen used to show in a
run after the decision now land on the chapter debrief whose lesson they match —
footprint on chapter 2, "who would you tell" on chapter 3, right after the game
has just made the player go and fetch an adult. They **gate** the Next button.

### `src/components/RealmScreen.jsx`
The `fullMechanic === 'platformerStory'` special case became a `FULL_MECHANICS`
lookup, so a third realm that wants to own its whole experience is one line.

### `src/data/realms.js`
`bullybogHigher.story` re-sequenced — it used to open straight onto the pile-on,
which now belongs to chapter 2, so it introduces the bog, the boat and the net
instead. `bullybogHigher.game` replaced with `{ type: 'bogcurrent', levels: [×3] }`
and `fullMechanic: 'bogCurrent'` added. `decision`, `extraBeats` and `rule` are
unchanged — the decision content fits chapter 2 exactly as written.

### `src/styles.css`
Appended: `.bog-meter*`, `.bog-stations`/`.bog-station-*`, `.bog-controls`,
`.bog-feed`, `.bog-debrief`.

---

## Verified in-browser

All three chapters played to completion, then the rule and the stamp.
Confirmed: kind→Pockets +14, mean→Report 0 and no landing damage, the pile-on
leader taking 3 followers with it, heavy cards refused at both Report and
Pockets and accepted at the heron (+10), the decision freezing the current at
`decisionAfter`, the unsafe answer darkening the water and re-asking without
unfreezing, the safe answer spawning the player's own card, both extra beats
gating their Next button, and the debrief naming every comment correctly.

**Testing note for whoever picks this up:** the browser-automation tab runs
`document.hidden`, so `requestAnimationFrame` never fires and the Phaser loop
sits at frame 0 — the scene renders its `create()` output and then appears
frozen. That is *not* a bug in the game. Drive it by hand instead:
`game.step(t, 16.67)` in a loop, with a temporary `window.__bog = this` at the
end of `create()`. (Both were removed again; `grep -rn "__bog" src/` is clean.)

---

## Not done / next up

1. **Three realms still short.** Privacy Peaks, Balance Bay and Fable Falls are
   all still one story → one decision → one mini-game → one rule. Bully Bog and
   Passworld now give two different worked examples of how to extend one, and
   `FULL_MECHANICS` in `RealmScreen.jsx` is the seam to hang the next off.
2. **Lower band (P1–P3) Bully Bog is untouched** — still the card-sorting game,
   same as lower-band Passworld.
3. **`bullybogHigher.rule`** still reads as a single-lesson wrap-up written for
   the old one-comment scenario. It now follows three chapters and could pull
   the three threads together explicitly — same open item Passworld's `rule` has.
4. **Balance for real players is untested.** Every clarity number was checked by
   scripted play, which acts instantly and never misses. A child at 40px/s with
   a mouse will drop things. If chapter 2 or 3 turns out to be too tight, the
   dial is `target` (currently 88 on all three) rather than the outcome values —
   those carry the lesson.
5. The old `MiniGameSort` path is still in the tree and still correct: it's what
   both bands' P1–P3 content uses.
6. `graphify update .` has been run.
