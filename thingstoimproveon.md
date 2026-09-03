# Things To Improve On

**A judgement-and-purpose audit of every mini-game**
Date: 31 Aug 2026 · Branch: `main` · S.U.R.E. and vault-door work committed as `9de6f87`

> **Verification pass, 31 Aug 2026.** Every checkable claim below was re-run against the
> code. It holds up: **11 of 12 substantive claims are exactly right, including all the
> arithmetic.** Two corrections have been folded into the text, the `realms.js` line
> numbers (drifted by the S.U.R.E. commit) and the score-plumbing claim in Secondary
> Findings. See **Verification log** at the foot of this document for the detail.

Two questions were asked of every game:

1. **Can a student pass it without using judgement?** (by guessing, by tapping through, or by rote after being shown the answers)
2. **Does the game explain its purpose the way Fable Falls does?**: i.e. does it name a transferable method, show it on screen while you play, and restate it at the end?

Method: all ten game instances (5 realms × 2 bands) were read at source level, gate logic traced, and the app was run and played end-to-end through the Traveller's room → Atlas → Bully Bog (P4–P6) to confirm the shell, the panel flow and the realm intro behave as the code says.

---

## Scoreboard

| # | Realm · Band | Game | Gate to finish | Pass by pure guessing | Pass by rote after one attempt | States its purpose |
|---|---|---|---|---|---|---|
| 1 | Balance Bay · both | Balance the Day (beach) | Fill 6 slots, **any** 6 | **100%** | n/a | ✗ |
| 2 | Privacy Peaks · P1–P3 | Read the Fog (quiz) | none | **100%** (≤10 taps) | n/a | ✗ |
| 3 | Fable Falls · P1–P3 | Check Before You Share (quiz) | none | **100%** (≤10 taps) | n/a | ✗ |
| 4 | Bully Bog · both | Clear the Water (sort) | 8/8 first try | 1 in 256 | **Yes** | ✗ |
| 5 | Privacy Peaks · P4–P6 | Clear the Fog (stepping stones) | 6/6 first try | 1 in 64 | **Yes** | ✗ |
| 6 | Passworld · P1–P3 | Guard the Vault (sort) | 9/9 first try | 1 in 512 | **Yes** | ✗ |
| 7 | Passworld · P4–P6 | Before You Post (sort) | 8/8 first try | 1 in 256 | **Yes** | ✗ |
| 8 | Passworld · P4–P6 | The vault door (platformer) | exact 6-of-12 subset | ~1 in 4,000 | No (no answers revealed) | Partly |
| 9 | Fable Falls · P4–P6 | Run It Through S.U.R.E. | name all 4 checks cleanly | **cannot** terminate on guessing | Partly | **✓, the model** |

"Pass by rote" means: the game tells you the right answer for every item as you get it wrong, then asks you the *same items in the same words* on retry. One blind run buys you a guaranteed clean run, with no judgement used at any point.

---

## The four games that need work first

### 1. Balance Bay (both bands): there is no gate at all

`src/components/BalanceBeachRealm.jsx:247`, the "That is my day" button is shown on `full` alone (six slots filled). The verdict (`allScreen` / `noScreen` / `level`) is computed and displayed but is **never required**. Six hours of screen time passes exactly as readily as a balanced day; Comet says the seesaw tipped over and then lets you through anyway.

This is the single biggest hole: it is not "passable by luck", it is *unfailable*. A child can fill the day without reading a single card.

**Fix:** require the level verdict to continue (`verdict.tone === 'settled'`), exactly as Sort and Stepping Stones already require a clean run, with the same no-penalty retry ("Clear the day" is already there). Then add a defensible rule the child can reason from, rather than an invisible threshold: e.g. *sleep must be in the day, at least one offline thing must be in the day, and screens must not take more than half of it.* Show those three as a checklist that ticks off live. That converts "fill six boxes" into "meet three conditions", a judgement.

Note also `MiniGameBalance.jsx` (the panel version) is unreachable: the realm sets `fullMechanic: 'balanceBeach'` at realm level (`src/data/realms.js:1318`), so `RealmScreen`'s `balance: MiniGameBalance` entry never mounts for either band. Whatever you change must be changed in `BalanceBeachRealm.jsx`, or the two should be reconciled.

### 2 & 3. Both quiz realms: retry-until-right, guaranteed pass

`src/minigames/MiniGameQuiz.jsx:31,39`, a wrong pick shows its feedback and the child simply picks again; "Next question" appears as soon as the right answer is picked, and `next()` on the last question calls `onComplete` unconditionally. Every question is two options. Worst case for a child who reads nothing: **ten taps and the game is complete.**

The component's own docstring is honest about this: `onComplete` is handed the first-try count "purely for parity with the other games (nothing downstream reads it)." So there is no gate *and* no measurement.

This affects **Privacy Peaks P1–P3** and **Fable Falls P1–P3**, half of the entire P1–P3 curriculum.

**Fix, in order of preference:**
- **a.** Give the quiz the same clean-run gate the other games have: finishing needs all five right first time; a wrong answer explains itself, the round does not count, "Start over" reshuffles. This is one small change and it brings the quiz in line with Sort/Stones.
- **b.** Raise it above 50/50: three options per question, and shuffle option order per run so position cannot be memorised.
- **c.** For the P1–P3 band specifically, consider whether the "mark a pile then commit" mechanic really was too hard, or whether the *pile* was too big, a 4-item Spot with a commit button may land better than 5 binary questions and would restore actual judgement. (`MiniGameSpot.jsx` is currently dead code, see below, so this would be reviving something already built.)

### 4. Bully Bog (both bands): gated, but nothing to judge

`src/data/realms.js:608` and `:696`, the eight replies are four unmistakably kind and four unmistakably cruel, in both bands, with identical text. The all-correct gate (`MiniGameSort.jsx:41,184`) does its job mathematically, but no P4–P6 child is exercising judgement deciding whether *"Nobody wants to hear this."* is unkind.

This is also the clearest **band-parity gap**: P4–P6 gets the same eight items as P1–P3, only the surrounding prose is longer.

**Fix:** add the ambiguous middle, which is where the real skill lives, the reply that is *meant* kindly but lands badly, the joke that only works if you are in the group, the pile-on that is technically agreeing with someone else, the bystander silence. Suggested additions for P4–P6:
- *"Ha ha ha."* (on the mean comment)
- *"It is just a joke, do not be sensitive."*
- *"I did not say anything, I just laughed."*
- *"Everyone thinks it, I am just the one saying it."*
- *"Ignore them Pockets, they are losers."*: kind intent, but it starts a second pile-on

Then make the game ask *which check it fails* (see the S.U.R.E. recommendation below), not just which bin it goes in.

---

## The two games that are already close

### Passworld P4–P6: the vault door

`src/components/PlatformerStoryRealm.jsx:109–127`. This is the strongest gate in the product: an exact-subset match over the bag, with **no answers revealed on failure** (`"Something you ticked would be easy for someone to guess, or something strong got left out"`). Removing the teal/gold padlock colouring from the bag chips (committed in `9de6f87`) was the right call, before it, ticking the green ones took no judgement at all.

Remaining weakness: the discrimination is *recognisable English word* (`123456`, `password`, `qwerty`, `letmein`, `football`, `iloveyou`) versus *single random character* (`A`, `7`, `#`, `k`, `4`, `!`). A child can clear it on shape alone without ever thinking about length or guessability. Consider one or two decoys that look like character pieces but are not strong in context (e.g. `1`, `a`, `0`) and one strong piece that looks word-like (e.g. `Tig`, `Moon`), so the tile has to be *read*, not classified by silhouette.

### Fable Falls P4–P6: S.U.R.E. (the model)

`src/minigames/MiniGameSure.jsx`. Two mechanisms make this the only game that guessing cannot beat:

- **Spent letters** (`:95`), a letter you have already tried on this clue is disabled, so you cannot tap along the row until one sticks.
- **The recheck loop** (`:123–127`), any clue whose check you named wrongly comes back before the verdict, and keeps coming back until you name it right *first try*. A random guesser has a 1-in-4 chance per round and the loop simply does not terminate until a clean placement happens.

Plus the clue order is shuffled per run (`:49`), so the sequence cannot be memorised.

Two honest gaps even here:
- The **action half** of each clue is still a 2-option retry-until-right with no gate, and the **final verdict** likewise. Only the naming half is protected.
- The `miss` and `note` copy teaches the clue→letter mapping, so by the second recheck round a child can pass on memory of *this post* rather than on the method. A second, different post (or a second set of clue wordings drawn at random) would close it.

---

## The purpose question

**Only one game explains its purpose: Fable Falls P4–P6.** Here is precisely what it does that nothing else does:

1. **It names a transferable method**: S.U.R.E. four letters, each a question you could ask about any post you ever see.
2. **It shows the method on screen the whole time you play**: the `sure-track` list, with each step's `name` and `sub` ("Source · Who is behind it?"), ticking off as you clear it (`MiniGameSure.jsx:160–172`, data at `realms.js:1042–1047`).
3. **It teaches the method before the game**: the safe decision option is literally *"I will run it through S.U.R.E. first"*, and Comet unpacks all four checks in the response (`realms.js:1024–1033`).
4. **It restates the method as the realm's rule**: the closing Comet card names all four checks again (`realms.js:1175`).
5. **The game's task is naming the check**: the letter is not decoration on top of five ordinary questions (which is exactly what the previous version was, per the file's own docstring); the letter *is* the answer.

Every other game has only an `instruction` line, which says what to **do**, not what skill is being built or why it matters:

- *"Put each one where it belongs. Which stay locked away, and which are fine to share?"*
- *"Replies people could send Pockets. Which would you send and not send?"*
- *"Fill the six hours between school and bed."*
- *"Step on the ones that are safe. Skip the ones with a warning sign."*
- *"A few more messages drift out of the fog. Answer each one…"*

The realm intro popup does carry an *"In this realm you will learn"* list for all five realms (`realms.js` `intro.learn`, confirmed on screen at Bully Bog), but it appears once, before the story, and is gone by the time the game starts. Nothing is on screen while the child plays, and no game asks the child to *name* the thing they are applying.

### Recommendation: give every game a named method, shown while playing

Add a `purpose` block to each `game` in `realms.js`, `{ name, why, checks: [{ key, name, sub }] }`, and render it above every mini-game with the same track component S.U.R.E. already uses. Then, wherever practical, make **naming the check** part of the answer, exactly as S.U.R.E. does.

Concrete proposals per realm:

| Realm | Method to name | The checks |
|---|---|---|
| Passworld (personal info) | **The Three Questions** | Could this **find** me? Could this **unlock** me? Could someone **pretend** to be me with it? |
| Passworld (the vault door) | **L.M.N.** | **Long** enough · **Mixed** characters · **Not** about me and not a real word |
| Privacy Peaks | **S.T.O.P.** | **Sender**, do I actually know who this is? · **Tone**, is it rushing or scaring me? · **Task**, what is it asking me to do? · **Path**, where does that link really go? |
| Bully Bog | **T.H.I.N.K.** | Is it **True**? **Helpful**? **Inspiring**? **Necessary**? **Kind**? |
| Balance Bay | **The Three Musts** | **Sleep** is in the day · at least one thing **off a screen** · screens under **two hours** in the evening |
| Fable Falls | **S.U.R.E.** *(already done)* | Source · Understand · Research · Evaluate |

S.T.O.P. and T.H.I.N.K. are standard, school-recognisable frameworks, the same reason S.U.R.E. works well for the older band, and both convert their game from "pick a bin" into "name the check it fails, then decide", which is the move that made S.U.R.E. un-guessable.

---

## The rote loophole, which affects five games

Sort, Stepping Stones and the two quizzes all reveal the correct answer on every wrong pick, then re-ask the **same items in the same words**. `MiniGameSort` reshuffles item *order* (`:20`), Stepping Stones does not shuffle at all, and neither changes content. So the intended flow

> guess blindly → get told all nine answers → retry → clean run → "Done"

, clears every gate in the product except the vault door and S.U.R.E. using no judgement at any point.

**Fix:** author more items than a round uses and draw a random subset each run (e.g. 14 items in the data, 8 per round). This costs only content, changes no component logic beyond the draw, and makes a clean run mean "I can tell these apart" instead of "I remember what it said last time." It also gives you replay value for a second lesson.

---

## Secondary findings

- **`MiniGameSpot.jsx` is dead code.** No realm sets `game.type: 'spot'` any more (the two Privacy Peaks bands are now `quiz` and `steppingstones`), but `RealmScreen.jsx:13,33` still imports and registers it. Either delete it or, better, revive it for the P1–P3 quiz replacement discussed above.
- **`MiniGameBalance.jsx` is unreachable**, for the reason given in §1. Two implementations of the same maths are drifting apart.
- **The score is saved but never read.** Every game calls `onComplete(n)` with a first-try count, and that count *is* plumbed all the way through: `RealmScreen.jsx:422` → `App.jsx:161` → `useProgress.js:104`, which writes `gameScore: action.score ?? 0` into `realmProgress[realm]` and hence into localStorage. Grep finds **two writes and zero readers**. So the data is already being captured and persisted on every child's device, there is just no way for a teacher to see it. Surfacing it is a read, not a plumbing job.
- **The branching decisions are not judgement either.** Every `decision` is two options where one is transparently the safe one (*"Tell Vex everything"* vs *"I should not share that with someone I have only just met"*), and the unsafe pick simply hands the choice back. That is right for tone, but it means the *only* judgement in a realm is the mini-game, which raises the stakes on everything above.
- **The `footprint` extra beat is a tap-to-agree** (`realms.js:597–607`, rendered as prompt → "Good point." → follow-up). It asks a real question, *would you be happy for this to stay online forever?*, and then accepts a single button as the answer. A two-option pick would cost nothing.
- **Walking to the pins is slow, and one route is blocked.** In the Traveller's room the couch sits directly between the spawn side and the door pin; walking straight at "The Door" wedges the avatar against the couch with no interact prompt, and you have to route around the furniture to reach it. Worth checking against a class of P1s on a 30-minute lesson clock.

---

## Priority order

1. **Gate Balance Bay** on the level verdict, and give it the Three Musts checklist. *(Currently unfailable.)*
2. **Gate the quiz** on a clean run, for both P1–P3 realms. *(Currently a ten-tap walkthrough.)*
3. **Add the ambiguous middle to Bully Bog**, and split the two bands' item sets.
4. **Add a named method to every game**, rendered on the S.U.R.E. track, and make naming the check part of the answer.
5. **Draw items from a larger pool** so a clean run cannot be bought with one blind run.
6. **Harden the second half of S.U.R.E.**: gate the action and verdict picks, and add a second post so the mapping cannot be memorised.
7. Tidy the dead components, and decide whether the first-try score should be surfaced to teachers.

---

## Verification log

Re-run against the code on 31 Aug 2026, after the S.U.R.E. work landed as `9de6f87`.
Every `file:line` reference outside `realms.js` is still exact.

| Claim | Result |
|---|---|
| Balance Bay unfailable, `BalanceBeachRealm.jsx:247` gates on `full` alone | ✓ `{full && (`; verdict computed at `:84–90`, rendered `:228–233`, **never required** |
| `MiniGameQuiz.jsx:31,39` retry-until-right, `onComplete` unconditional | ✓ exact |
| Bully Bog's 8 items identical across bands | ✓ **byte-identical**; only the `instruction` prose differs |
| `MiniGameSort.jsx:41,184` clean-run gate, `:20` shuffles order only | ✓ exact |
| Stepping Stones does not shuffle | ✓ no shuffle anywhere in the component or its Phaser scene |
| `MiniGameSpot.jsx` dead, `RealmScreen.jsx:13,33` still imports/registers it | ✓ exact; no realm sets `type: 'spot'` |
| `MiniGameSure.jsx` `:49` shuffle, `:95` spent letters, `:123–127` recheck | ✓ exact |
| Vault door exact-subset match, no answers revealed | ✓ `answerDoor()` spans `:109–127`; the quoted failure string matches verbatim |
| Vault-door tile labels and their split | ✓ all 12 as listed, 6 real (`A 7 # k 4 !`), 6 decoy |

The scoreboard probabilities were checked against the underlying counts, not taken on trust:

- Bully Bog **8 items** → 2⁸ = 256 · Stepping Stones **6 stones** → 2⁶ = 64
- Passworld P1–3 **9 items** → 2⁹ = 512 · Passworld P4–6 sort **8 items** → 2⁸ = 256
- Vault door **12 tiles, 6 real / 6 decoy** → 2¹² = 4096 ≈ "1 in 4,000"
- Balance Bay `slots: 6` · both quizzes 5 questions × 2 options → ≤10 taps

**Corrections applied to the text above:**

1. **`realms.js` line numbers had drifted ~7–12 lines**: the Fable Falls section comment was
   rewritten after this audit was written. Fixed in place: decision `1018–1025` → **`1024–1033`**;
   `steps` data `1033–1038` → **`1042–1047`**; rule `1163` → **`1175`**;
   `fullMechanic: 'balanceBeach'` `1311` → **`1318`**; Bully Bog game blocks `609`/`697` →
   **`608`/`696`**.
2. **"Nothing reads the score" was understated**: the score is not discarded, it is *persisted*.
   Rewritten in Secondary Findings.

**Stale framing removed:** the header and the vault-door section both described the S.U.R.E. and
bag-chip work as uncommitted. Both are committed (`9de6f87`).

**One point in the audit's favour:** the proposed Balance Bay fix references
`verdict.tone === 'settled'`, and that value genuinely exists at `BalanceBeachRealm.jsx:90`, the
fix is implementable exactly as written.

---

## What changed on 31 Aug 2026

Everything above was acted on. Two commits: the audit fixes, then the client's
format rule.

### The audit fixes

| Realm, band | Blind-guess odds before | After |
|---|---|---|
| Balance Bay | passed **always** | blocked unless the Three Musts hold |
| Privacy Peaks P1 to P3 | passed **always** (ten taps) | 1 in 243 |
| Fable Falls P1 to P3 | passed **always** (ten taps) | 1 in 243 |
| Bully Bog P4 to P6 | 1 in 256 | 1 in 160,000 |
| Privacy Peaks P4 to P6 | 1 in 64 | 1 in 243 |
| Passworld P4 to P6 sort | 1 in 256 | 1 in 20,736 |

- Balance Bay gates on the **Three Musts**: sleep is in the day, one thing is
  away from a screen, screens take no more than two hours. Checked
  exhaustively: every screens-only day is blocked.
- Every gated game draws its round from a larger authored pool, which closes
  the rote loophole.
- Every game names its method on screen while you play, through a shared
  `MethodTrack`: S.U.R.E., T.H.I.N.K., S.T.O.P., L.M.N., the Three Questions,
  the Three Musts.
- Bully Bog's bands no longer share byte-identical items. P4 to P6 has the
  ambiguous middle.
- The vault door's tiles are no longer sortable on silhouette.
- The digital-footprint beat is a real two-option pick.
- The first-try score, saved and never read, is surfaced for teachers in
  Settings and kept out of the child's flow.
- `MiniGameSpot` and `MiniGameBalance` are gone.
- The Traveller's room no longer wedges the avatar against the reading nook on
  the way to the door.

### The client's format rule

Privacy Peaks and Fable Falls use one question format throughout: a plain
five-question Q&A, one question at a time, one answer each. The stepping-stones
run and the S.U.R.E. card game each asked two things per item and ran to nine
or twelve asks, so both are retired, along with `MiniGameSteppingStones`,
`MiniGameSure` and the stepping-stones Phaser scene and art.

The frameworks survive the change. A question whose options are the four
S.U.R.E. letters, or the four S.T.O.P. checks, is an ordinary single-select
question, so naming the check is still the answer and the older bands still
*run* the method rather than merely agreeing with it.

Passworld and Balance Bay keep their mechanics: the client confirmed both are
fine, and they hold the only genuine tick-several-then-submit steps in the
product.

### Still open

- Balance Bay's Three Musts are met by 39% of random six-hour days (tightened
  from 58% when the Half check became a flat two-hour screen cap). That is by
  design, since the three conditions are stated on screen and the point is that
  they can be reasoned to rather than guessed, but it is still the weakest gate
  left.
- Privacy Peaks P4 to P6 lost the Phaser stepping-stones visual with the format
  change. If that scene is wanted back inside a Q&A, it would need re-siting.

## Writing rules

All player-facing copy follows the client's writing rules: school language, no
short forms, no text-speak, no em-dashes, school-kid friendly. They are
written out in `CLAUDE.md` and `design.md`.
