# Handover — Passworld rebuild (2026-08-20)

Branch: `merge/ryson-plus-mine`. Everything below is **uncommitted working-tree
state**. `npx vite build` passes; the whole three-chapter run was played through
in a browser end to end.

---

## What was asked for, and what shipped

The starting complaint: *"the platform game doesn't really explain why symbols
are good for password."* It didn't — the level only ever taught *which* pickups
counted, never *why*, so a player could clear it and still not know what a
symbol bought them. Follow-on asks during the session:

| Ask | Where it landed |
| --- | --- |
| Explain *why* symbols/numbers/length matter | `beacons` — lamp-post signposts in the level + a post-door debrief |
| Much longer, much more detailed | Passworld is now **3 chapters**, ~8100px of level, 6 signposts + ~13 tiles each |
| Multiple levels if necessary | `realm.game.levels[]`, one scene replayed per chapter |
| Written for 7–12 year olds | All copy rewritten: short sentences, concrete pictures (a robot with a list, a dice with more sides). No "entropy"/"brute force"/"character class" |
| Signposts must be re-readable | Walking off a sign and back on says it again; Field notes panel keeps every note |
| Signposts on platforms, not the ground | Every `beacon.y` is a platform top; three chapters each gained a low entry platform purely to stand the opening sign on |
| Remove the "Knocked clear" toast on slime contact | Gone — the shove + red tint say it; the toast line is reserved for signposts |
| In-level messages at the top, not the bottom | Hint moved to y=8, toast to y=28, stacked along the top edge |

---

## The three chapters

Data lives in `src/data/realms.js` → `passworldHigher.game.levels`.

| # | Name | Teaches | Door `mode` |
| --- | --- | --- | --- |
| 1 | The Impostor at the Gate | What belongs in a password; why a symbol beats another letter | `strong` — tick every strong tile in the bag, exactly |
| 2 | The Guess Engine | Why length beats cleverness; why a real word is one guess | `length` — build a 12+ char password with a letter, number and symbol, nothing off the Engine's list |
| 3 | One Key, Many Doors | Why one password everywhere is the real danger (what happened to Sam) | `unique` — assign a *different* strong card to each of three accounts |

Chapter 1 alone carries the Sam encounter (`encounterX` / `gateX`); those keys
are absent from chapters 2 and 3 and the scene skips the impostor and gate.

---

## Files touched

### `src/data/realms.js`
`passworldHigher.game` went from one flat level to `{ title, instruction,
levels: [...] }`. Per level: `platforms`, `tiles` (each with a `why` string),
`hazards`, `beacons`, `props`, `door`, plus `chapter`/`name`/`intro`/`goal`/
`instruction`/`hint`.

Jump geometry is unchanged in spirit and still holds: a standing jump clears
72px of height and 112px of distance (velocity −360 vs gravity 900, 140px/s
across). Every rise here is 48px, every gap ≤74px, and the ground is unbroken
across all three chapters, so a missed jump costs the climb and nothing else.
**If you move a platform, re-check the rise/gap against those numbers.**

### `src/minigames/phaser-scenes/passwordFortressLevelScene.js`
One scene, replayed per chapter. New:
- optional encounter/gate (`hasEncounter`)
- `beacons` — lit/unlit posts, overlap-triggered, re-armed in `update()` via
  `isClearOf(zone)` (same latch the vault door already used)
- `buildProps()` — `guessEngine` (live word ticker + a counter running at
  91k guesses/sec) and `keyholes` (chapter 3's three-lock wall)
- tiles auto-widen for long labels (`Purple7Taco!` no longer overflows a 34px card)
- `game.hint` / `game.hintAfterGate` per chapter
- hazard-hit toast removed
- the hint and the toast both moved to the top of the canvas and stacked (y=8
  and y=28). At the bottom they sat on top of the Traveler and the ground-level
  tiles, so neither could be read

### `src/components/PlatformerStoryRealm.jsx`
Step machine is now `story → chapter → level → debrief → (next chapter…) → rule → stamp`.
Adds the three door modes, the Field-notes panel, and the debrief that finally
reveals each tile's `why`.

**Deliberate design constraint — don't break this:** nothing may reveal whether
a pickup is strong or weak *before* the door asks. The tile art is identical for
both kinds, the strength meter fills on anything, the HUD shows a bare count,
and the `why` text only appears in the debrief. That judgement call is the whole
point of the door.

### `src/minigames/phaser-scenes/passworldArt.js`
New manifest entries: `pw-beacon`, `pw-beacon-lit`, `pw-engine`, `pw-keyhole`.
All procedural like the rest — real sheets can drop in via the same `file` names.

### `src/styles.css`
Appended: `.chapter-card`, `.notes-list`/`.note-card`, `.debrief-list`,
`.pw-preview` (chapter 2's live password builder), `.pw-slots`/`.pw-slot`
(chapter 3's account slots).

---

## Verified in-browser

Chapters 1→2→3 played through: signposts light and file notes, re-reading works,
Field notes accumulate across chapters, all three door modes accept and refuse
correctly (including the reuse lesson firing on purpose), debriefs render, and
the run reaches the rule + stamp.

One bug found and fixed on the way: a stale `verdict` message recomputed its
counts from live state, so it could read "you have 3 of the three" next to a
refusal. Changing the selection now clears the verdict.

---

## Not done / next up

1. **The other four realms are still short.** The user's note — *"each realm
   seems too short… else the game would be too short"* — was raised while
   Passworld was mid-build and only Passworld got the treatment. Privacy Peaks,
   Bully Bog, Balance Bay and Fable Falls are all still one story → one decision
   → one mini-game → one rule. The chapter machinery is Passworld-specific
   (`fullMechanic: 'platformerStory'`); extending the other realms means either
   giving them multi-round mini-games or generalising the chapter pattern in
   `RealmScreen.jsx`.
2. **`passworldHigher.rule`** still reads as a single-lesson wrap-up. It now
   follows three chapters and could pull the three threads together explicitly.
3. **Lower band (P1–P3) Passworld is untouched** — still the card-sorting game.
4. `graphify update .` has not been run since these edits.
5. The old single-level path (`MiniGamePlatformer.jsx`, `passwordFortressScene.js`)
   is still in the tree and now unused by Passworld; check nothing else needs it
   before deleting.
