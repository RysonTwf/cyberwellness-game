# Handover — P1–P3 rebuild (2026-08-20)

Branch: `merge/ryson-plus-mine`. This lands on top of the Fable Falls P4–P6
rebuild, which was uncommitted working-tree state when this began and is
committed together with it. `npx vite build` passes; all five realms were
played end to end in a browser; every number below was produced by running the
game.

**All ten realm-bands now run mechanics that teach their own rule.** P4–P6 was
finished last session. This is P1–P3.

---

## What was actually wrong

The last handover listed the P1–P3 gap as "five multi-chapter experiences
against five short ones" and asked whether that gap was correct. Length turned
out to be the wrong thing to have measured. **Four of the five lower realms had
the identical disease their P4–P6 counterparts had before those rebuilds, and
the fifth had a milder version of it** — the mechanic quietly teaching against
the realm's own rule. Three of the four had *already been diagnosed in
writing*, in the P4–P6 handovers, and the verdicts were never band-specific:

| Realm | The P1–P3 mechanic quietly taught… | …but the rule says |
| --- | --- | --- |
| Passworld | danger is a property of the **fact** — "address" is a hazardous word | ask **who is asking**; Vex is a friendly stranger |
| Privacy Peaks | mark the bad lines in a message that is already obviously bad, pre-cut into six cards | it starts friendly and *turns* — then stop, don't reply, **tell an adult** |
| Bully Bog | sort comments into two tidy piles | acting is hard; doing nothing is easy |
| Balance Bay | plan a tidy evening, be graded, stop | decide when you'll stop **before you start** |
| Fable Falls | spot the difference against a free, trusted original | 🛑 STOP, then ✅ CHECK — *go and find* the trusted original |

So the answer to the open question is: the gap was **not** length. Making these
into three-chapter experiences would have been the wrong fix for
seven-year-olds and would not have touched the actual fault. All five are still
short — one story, one decision, one mini-game, one rule, through the shared
step machine in `RealmScreen.jsx`. What changed is what the mini-game *is*.

---

## The five

Each is a bespoke mechanic with a plain reducer next to it. `GAMES` in
`RealmScreen.jsx` is now five entries and all five are P1–P3.

### Passworld — "Who's Knocking" (`vaultDoor.js`)
Someone knocks and asks you for one thing. Tell them, or keep it locked. **The
same card comes round from different mouths** — Mum wants the address for a
form, `SparkleFox99` wants it too — and that is the whole mechanic, because it
is the whole rule. Over-sharing costs about twice what over-locking does;
neither is free, so "lock everything" fails too.

**Passwords are the one absolute**, so they are asked for by the friendliest
faces in the deck (your best friend; an account calling itself official) rather
than by obvious villains — otherwise "tell anyone I know" would be a strategy
the game merely failed to test rather than one it defeats.

### Privacy Peaks — "The Conversation" (`fogChat.js`)
One conversation, one message at a time, **and it opens genuinely friendly**.
Three buttons that never change and never grey out: reply, don't reply, tell an
adult — the rule's three verbs, and the only controls in the game. Replying to
the early safe ones *scores*, so the turn is a turn.

**Telling an adult is never punished, at any point.** Tell on the first hello
and you get a warm line, a small score and an explicit "that is never the wrong
move". It is not the winning line and it is not a mistake. **Never telling is
what costs**: reach the end having spotted everything and said nothing and the
chat is still open tomorrow, for −14. See "Don't undo these", #2.

### Bully Bog — "The Water" (`bogWater.js`)
The pile-on is live. A comment lands every turn whether or not you act, so you
cannot out-type it. Two meters, both lifted from the story's own words: the
water goes dark, and Pockets sinks lower in it.

Only kindness lifts Pockets; only telling an adult stops the comments. **You
need both**, and that is why there are two meters rather than one — telling
immediately and doing nothing else finishes with a clear pond and a frog at the
bottom of it, below target, and the debrief says exactly that. Order is not the
lesson: kind-then-tell and tell-then-kind both clear it, and the harness checks
that they do.

### Balance Bay — "The Promise" (`bayPlan.js`)
**The planner is kept here, deliberately, when P4–P6 threw one out.** Up there
the rule is about noticing how you feel in the moment, so a god's-eye board
taught against it. Down here the rule is a different sentence and planning is
not the wrong idea, it is *the* idea. What was wrong was that the board graded
the plan and stopped — a promise nobody ever tested, with the Glimmer standing
right there unused.

So you commit the plan and then **the evening happens**. A perfect plan is
worth 48 against a target of 80; you cannot win by planning. And "one more"
does not extend the current block, it **eats the next thing that wasn't a
screen** — which then gets asked about too when you reach it.

### Fable Falls — "Stop and Check" (`fallsCheck.js`)
The two checks the rule names, as two buttons: *ask a grown-up* (settles things
about people) and *look somewhere else* (settles things about the world). The
left column is filled in by pressing one.

**No clock, and checking is free** — the deliberate split from its P4–P6
sibling, which is built entirely out of one. Triage is that band's lesson,
named in its chapter 2; failing an eight-year-old for being thorough would
teach the opposite of this realm's own rule. Checking both ways scores 9
against the right check's 10 and clears the target comfortably.

---

## Measured

Every number from `node scripts/simulate-lower.mjs`, which plays the real
reducers. It **exits non-zero if any claim breaks** — 35 claims, all holding.

| Passworld (start 30, target 82) | | Privacy Peaks (start 30, target 80) | |
| --- | --- | --- | --- |
| Reads who is asking | **90** ✓ | Answers friendly, stops, tells | **89** ✓ |
| **Sorts by the old card list** | **46 ✗** | Stops and tells the moment it turns | **82** ✓ |
| Tells anyone they recognise | 54 ✗ | Spots everything, tells nobody | 68 ✗ |
| Recognises faces, never a password | 68 ✗ | Replies to everything | 0 ✗ |
| Locks everything | 24 ✗ | Says nothing to anyone, ever | 38 ✗ |
| Tells everyone everything | 6 ✗ | Tells an adult on the first hello | 34 ✗ |

| Bully Bog (target 72) | | Balance Bay (target 80) | |
| --- | --- | --- | --- |
| One kind word, then tells | **82** ✓ | Balanced plan, holds to it | **90** ✓ |
| Tells first, then talks to Pockets | **90** ✓ | Two screens, holds to it | 86 ✓ |
| Two kind words, then tells | 74 ✓ | Four screens, holds to it | 82 ✓ |
| Only ever says something kind | 39 ✗ | **Good plan, gives in every time** | **42 ✗** |
| Only ever tells, nothing else | 55 ✗ | Good plan, gives in about half | 73 ✗ |
| Gives them a taste of it | 0 ✗ | All screens, holds to it | 46 ✗ |
| Watches | 7 ✗ | No screens at all | 18 ✗ |

| Fable Falls (start 24, target 80) | |
| --- | --- |
| Picks the check that fits | **94** ✓ |
| Checks both ways, every time | **87 ✓** *(must pass — see above)* |
| **Only ever asks a grown-up** | **70 ✗** |
| **Only ever looks somewhere else** | **62 ✗** |
| Never checks, guesses perfectly | 38 ✗ |
| Never checks, passes everything on | 2 ✗ |
| Never checks, lets everything go | 5 ✗ |

**The single most important row is "Sorts by the old card list" at 46/82.** It
plays the exact strategy the two-bin board rewarded — lock the five scary
words, share the four safe ones, ignore the asker. If it ever clears the target
again, the Passworld rebuild has come undone. The deck is built to defeat it:
four knocks want something from the old "locked" list from someone who
genuinely needs it, two want something from the old "share" list and are fine.

**Browser, all five, no console errors and no React warnings:**
90 / 89 / 82 / 90 / 93, every one stamped and saved. Each reproduced its
simulator figure exactly — Passworld stepped 30→90 in twelve clean +5s, Bay's
give-in line hit 42 on the nose, Falls scored 93 rather than 94 because one
tale used both checks, which is the `both` band working.

---

## Files

New: `src/minigames/{vaultDoor,fogChat,bogWater,bayPlan,fallsCheck}.js` (rules
and arithmetic, no React), `src/minigames/MiniGame{VaultDoor,FogChat,BogWater,BayPlan,FallsCheck}.jsx`
(pixels), `src/minigames/LowerBandKit.jsx` (shared furniture),
`scripts/simulate-lower.mjs`.

Changed: `src/data/realms.js` (all five `game` blocks + several stale
comments), `src/components/RealmScreen.jsx` (`GAMES` rewritten),
`src/styles.css` (the `.lg-*` block at the end).

---

## Bugs this caught

Two were real reducer bugs, two were copy that lied, one was a dead patch.

1. **Peaks scored the single most correct action in the game at 4 points.**
   Telling an adult the instant the conversation turns was landing on the
   "jumpy false alarm" branch, because `seenFlag` was only set once a flagged
   message had been answered some *other* way. Whatever a child can see, they
   have seen. Fixed; that line went 58 → 82.
2. **Peaks told a player who replied to all seven "you spotted every single one
   of them".** Flatly untrue, and it let the worst line off. There are now two
   endings for "ran out of conversation and told nobody", picked on whether
   they ever actually stopped replying.
3. **Bay's win text claimed "the Glimmer asked you five different ways"** on a
   night where it asked three. The number of asks depends on the plan, so it
   cannot be named in copy at all.
4. **Bog had a dead patch**: tell on turn two and you spend four turns clicking
   "say something kind" into a silent pond. Added `finish()` — offered only
   once the comments have stopped, and safe to give because leaving early can
   only ever *lower* a score.
5. **Peaks stacked three nested scroll areas at the debrief.** The live chat now
   goes away once the conversation ends; the log quotes every message anyway.

Items 1 and 4 are the ones a scripted-only pass would have missed — 1 needed a
policy that told at exactly the right moment, 4 was invisible to a simulator
entirely.

---

## Don't undo these

1. **Five different mechanics is the point.** A mechanic general enough to fit
   five realms teaches none of them — that is what the generic Sort/Spot/
   Compare/Balance set *was*, and four of those five were teaching against
   their own realm's rule. The shared thing is the furniture (`LowerBandKit.jsx`,
   `.lg-*`), so a child meets one new idea per realm rather than one new idea
   and a new set of controls.
2. **Telling an adult is never scored as a mistake, in any realm, at any
   point.** In Peaks it is small-and-warm when early and the ceiling when
   earned; in the Bog it always stops the pile-on. Both fail by scoring little,
   never by being marked wrong, and both say so in words. This is the one place
   in the project where the arithmetic was chosen on safeguarding grounds first
   and game-design grounds second: a child who learns "don't bother a grown-up
   unless you're sure" has learned the most dangerous thing this project could
   teach them. If a balance pass ever wants to make over-telling cost, don't.
3. **The Bay keeps a planner and P4–P6 does not.** That is a deliberate split
   on two different rules, argued in the header of `bayPlan.js`, not an
   inconsistency to tidy up.
4. **Checking is free in Falls P1–P3 and expensive in Falls P4–P6.** Same
   split, same reason: triage is the older band's lesson and stated in its
   chapter 2 by name.
5. **"Say nothing for now" is styled exactly like the other three Bog moves.**
   It is the losing move and the game must not warn you off it — the lesson is
   that doing nothing feels like an ordinary option in the moment, because it
   is one.
6. **No finding in Falls is ever marked as decisive.** Half of them are
   perfectly true and settle nothing; telling those apart is the game. The
   moment the UI puts a tick on the right one, the realm is over.
7. **No realm accent is used for text in the `.lg-*` kit.** Most of it is
   10–13px and the accents run 3.1–3.5:1 on their own wash — fine for a UI
   element, short of the 4.5:1 small text needs. Accent lives in washes, rules
   and fills.
8. **Keep React and the DOM out of all five reducers**, or `simulate-lower.mjs`
   stops being able to play the real game and becomes a model of it.

---

## Retired, not deleted

Six components are now unregistered from `GAMES` and referenced by nothing.
Each carries a `RETIRED —` header saying what replaced it and why:
`MiniGameSort`, `MiniGameSpot`, `MiniGameCompare`, `MiniGameBalance`,
`MiniGamePlatformer`, `MiniGameSteppingStones` (plus `steppingStonesScene`).
Unregistering `MiniGamePlatformer` was the last thing holding a Phaser import
inside `RealmScreen.jsx`, which no longer touches that chunk at all. Delete or
reuse deliberately.

---

## Not done / next up

1. **Balance for real children is still untested, in all ten bands.** Every
   number in this document and the last came from scripted play. The lower
   band's exposure is different from the upper band's: none of these five has a
   real-time clock, so reading slowly costs nothing anywhere, and the risk is
   comprehension rather than reflex. Dials, in order: `target` first, then the
   per-realm start values. **Not** `ok` flags on knocks, `flag` on messages,
   `settledBy`/`findings` on tales, or the comment weights — those carry the
   lesson and the claim tests are tuned against them. Change one and re-run
   `node scripts/simulate-lower.mjs`.
2. **Nobody has read this copy aloud to a seven-year-old.** The reading level
   is the biggest untested thing here. Some debrief lines are long
   (`k7.gaveNote`, the Bay's `gaveIn` verdict) and several depend on a
   subordinate clause landing. That is a read-aloud pass, not a code change.
3. **The two bands now rhyme deliberately, and that is worth keeping straight.**
   Falls P1–P3 and P4–P6 are the same idea at two sizes; so, differently, are
   the two Bay games. Anyone changing one should read the other's header first —
   both splits are argued in code comments rather than only here.
4. **`*asterisk*` emphasis still renders literally** in several `bullybogHigher`
   strings (debrief text is plain React children, not markdown). Pre-existing,
   untouched, and the new P1–P3 copy avoids it.
5. **The `alarming: true` flags in Falls P4–P6 chapter 3 are read only by the
   simulator.** Unchanged from the last handover; don't mistake them for game
   data.
6. `graphify update .` has been run (602 nodes, 977 edges, 111 communities).
