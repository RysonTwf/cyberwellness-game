# Cyber Wellness Quest — Improvement Plan (Living Doc)

*Last updated: 18 Aug 2026*

## 0. What this game is

A **final recap experience**, played after all 3 terms of the Cyber Wellness curriculum are done — mostly self-directed over the holidays, sometimes teacher-led in class. Not a term-by-term companion, so it doesn't need to mirror Term 1→2→3 chronology. It needs to **comprehensively touch everything taught across the year**, in a single ~20–30 min sitting, ordered for narrative pacing rather than calendar order.

**Decision:** **One game, one app, one entry point.** The Atlas Gate asks the student whether they're P1–P3 or P4–P6, then the app shows that band's content for the rest of the session. The *content* is fully separate per band — different scenarios throughout, and different mechanics for 2 of the 5 realms, not just a difficulty toggle — but it's delivered as a single product, not two separately built/deployed apps sharing only visuals and characters.

---

## 1. Source of truth: what the Overview Plan actually requires

Full re-read of `Cyber Wellness 2026_Overview&Plan.docx`, term by term, with every sub-point that needs to land in the game somewhere.

### Term 1 — Healthy Digital Habits (4 core habits)

| Habit | Full definition | Covered by |
|---|---|---|
| **Set Boundaries Online** | Use safety tools to create a secure online environment *and* develop healthy screen use habits | Passworld, Privacy Peaks, Balance Bay |
| **Think Before You Act** | Be respectful online, **check if content is true**, and **leave a positive digital trail** | Bully Bog (respect) ✅ · Fake News realm (check if true) ✅ · **digital footprint — gap** ⚠️ |
| **Report Inappropriate Content** | Know how to spot harmful content and act by reporting it | **No dedicated beat — gap** ⚠️ |
| **Engage and Support** | Build a safe space for conversations, seek help/guidance when needed | Loosely touched in Bully Bog (Pockets, bystander framing) — **not explicit — gap** ⚠️ |

### Term 2 — Recess Activities (reinforcement + pledge)

| Category | Key points | Covered by |
|---|---|---|
| Be Safe Online | Never share personal info, watch for suspicious links, strong/private passwords | Passworld, Privacy Peaks ✅ |
| Be Kind Online | Treat others well, no cyberbullying, words hurt online too | Bully Bog ✅ |
| Be Smart Online | Not everything is true — check sources; **posts stay online forever**; **respect others' work, don't copy/steal** | Fake News realm (sources) ✅ · **digital footprint — gap** ⚠️ · **plagiarism/IP — gap (minor)** ⚠️ |
| Balance is Key | Regular screen breaks, offline time, notice how tech makes you feel | Balance Bay ✅ |
| When Things Go Wrong | Tell a trusted adult; **know how to report AND block** | **Gap — pairs with Report above** ⚠️ |
| Pledge | Student commits to contributing to a safe online community | Traveler's Pledge (finale) — currently 4 lines (one per original realm) ⚠️ **needs a 5th line for Fake News** |

### Term 3 — Fake News and Images

| Element | Detail | Covered by |
|---|---|---|
| Hook | "Can our eyes be fooled?" — fake news *and* fake/altered images | New realm — design hook around this ✅ |
| Why it matters | Real scenarios: fake videos of classmates, rumours, embarrassment, scams | New realm scenario design |
| Method (P1–P3) | 🛑 STOP – pause · ✅ CHECK – ask a trusted adult or check another source | New realm, P1–P3 version |
| Method (P4–P6) | S.U.R.E. — Source / Understand / Research / Evaluate | New realm, P4–P6 version |
| "3 tips to CHECK real vs. digitally-altered content" | **Not detailed in the Overview Plan doc** — lives in the actual SLS lesson package, not here | ⚠️ **Still not sourced.** Didn't block the realm any further, though — the game's rule text and P4–P6 clue set use general, well-established media-literacy signals instead (source credibility, cross-checking, does-it-add-up reasoning), clearly flagged in `realms.js` as pending swap-in once the real content surfaces. |
| Capstone activity | ✅ **Confirmed 18 Aug 2026: "Cyber Defender Quest."** | Built as the P4–P6 mini-game's title. |

---

## 1a. How much does the source material actually differentiate by band?

Less than our game design assumes — worth being clear-eyed about this.

- **Term 1 (4 habits) and Term 2 (recess reinforcement):** written as **one unified curriculum for all of P1–P6**. No band split anywhere in either table — same definitions, same bullets, for the whole school.
- **Term 3 (Fake News):** the **only** place the Overview Plan itself splits by band — STOP & CHECK (P1–P3) vs. S.U.R.E. (P4–P6).
- **✅ Resolved 18 Aug 2026:** the doc writes the S.U.R.E. band as **"(P4-5)"**, not "(P4-6)" — consistently, in all three places it appears (lines 47, 75, 87). **Decision: treat P4-5 as P4-6 for this game.** All of P4–P6 gets S.U.R.E. in Fable Falls, same as every other realm's P4–P6 band — no special-casing P6 out.
- **The Luke vs. Sam & Tom scenario split** (which shaped our Passworld/Balance Bay band framing) comes from the Lesson Plan doc and slide decks, not the Overview Plan — and even there, it started as a **suggestion**, not a rule: the Lesson Plan doc says *"CHOOSE EITHER SCENARIO ONE OR TWO,"* with Scenario One *"Suggested for P1–P3"* and Scenario Two *"Suggested for P4–P6."* The hard per-band split only appears later, in the separately-issued 27 Feb and 4 Mar slide decks. The Lesson Plan's own reflection section is headed **"Reflection (for both Scenarios)"** — identical wrap-up regardless of which scenario a class ran.
- **Bottom line:** our plan's band differentiation — harder mechanics, more nuanced scenarios, different "stakes" for P4–P6 — is **our own design extension for making a good recap game**, not something the curriculum itself mandates. Nothing wrong with that, but it shouldn't be presented as "the curriculum requires this" if it comes up in review — it's a deliberate enrichment layer on top of a mostly one-size-fits-all source.
- **✅ Confirmed with school contact (18 Aug 2026):** the heavier P4–P6 scenarios (Passworld's account takeover/impersonation, Bully Bog's identity-based harassment) were checked directly and given the OK as age-appropriate. Safe to build as planned.

---

## 2. Consolidated content gaps (in priority order)

1. **Digital footprint / "positive digital trail"** — appears in *both* Term 1 (Think Before You Act) and Term 2 (Be Smart Online). Two independent mentions in the source doc — this is not a minor point, it should get real presence in the game, not just a line of dialogue.
2. **Report + Block** — named as its own Term 1 habit *and* reinforced in Term 2. Needs a concrete, teachable moment, not just a mention in reflection questions.
3. **Engage and Support / seeking help** — a named Term 1 habit with no clear home yet.
4. **Respect others' work (no copying/stealing content)** — smallest gap, one bullet under Be Smart Online. Lowest priority — candidate to fold into the Fake News realm rather than get its own beat.
5. **The "3 tips to CHECK" content** — not a design gap, a *missing source material* gap. Needs to be tracked down (SLS package) before the Fake News realm's mini-game can be finalized.

### Recommended fixes (no new realms beyond the one already planned)

- **Digital footprint** → add as a decision beat inside **Bully Bog**, right alongside the kindness choice (e.g., "before Pockets' comment goes up... would it be okay if this stayed online forever?"). Natural fit since the curriculum pairs "respectful" and "positive trail" in the same sentence.
- **Report + Block** → rather than a dedicated realm, add a consistent **"Report & Block" resolution option** that appears at the redirect moment in every realm where something goes wrong (Privacy Peaks scams, Bully Bog mean comments, Fake News scenario). This matches how the curriculum itself treats it — always paired with another habit, never standalone.
- **Engage and Support** → give Comet (or a realm character) an explicit "who would you tell?" prompt, most naturally in Bully Bog's bystander moment. Reinforces that seeking help is itself a habit, not just a fallback.
- **Plagiarism/IP respect** → fold into the Fake News realm's "Understand/Research" step as a light touch (e.g., one Detective Quest clue about a copied post), not a separate beat.

---

## 3. Realm plan by band

| Realm | P1–P3 mechanic & framing | P4–P6 mechanic & framing |
|---|---|---|
| **Passworld** | Sort — simple password hygiene, mirrors *Luke*-level simplicity | Platformer — mirrors *Sam & Tom* impersonation/account-takeover scenario |
| **Privacy Peaks** | Spot — basic stranger-danger, oversharing | Stepping-stone decision run — scams, phishing nuance |
| **Bully Bog** | Sort — kind vs. unkind, simple empathy + **digital footprint beat** + **"who would you tell?" beat** | Same mechanic, harder scenario — identity-based harassment, bystander responsibility, same two added beats |
| **Balance Bay** | Balance — screen time vs. sleep/family (echoes *Luke*/dinner scenario) | Same mechanic, reframed around noticing *how tech makes you feel*, not just time limits |
| **Fable Falls** | STOP & CHECK + Report — pause, ask a trusted adult, check another source | S.U.R.E. framework, styled as the **Cyber Defender Quest** |

**Universal addition (all realms, both bands):** Report & Block as a resolution option wherever a redirect/consequence moment happens.

---

## 4. Suggested play order (per band) — pacing, not calendar order

**P1–P3:** Balance Bay → Passworld → Bully Bog → Privacy Peaks → Fake News → Pledge
**P4–P6:** Passworld → Privacy Peaks → Bully Bog → Balance Bay → Fake News → Pledge

Rationale: open with each band's own signature classroom scenario (recap tools land better starting with "remember this?"), middle realms in either order, Fake News last as a synthesis challenge that draws on judgment built in every earlier realm, before the Pledge.

Free exploration (no gating) stays — this is just the *suggested/default* hub order, not a locked sequence.

---

## 5. Open items / needs from the team

- [ ] **Still open:** source the real "3 tips to CHECK real vs. digitally-altered content" from the SLS package. **Worked around, not blocked on it anymore** — Fable Falls shipped 18 Aug 2026 using general media-literacy content in its place (source credibility, cross-checking, does-it-add-up reasoning), clearly flagged in `realms.js` as a placeholder for the official wording. Swap it in once it surfaces; low-risk either way since it's just data.
- [x] Confirm quest name: **Cyber Detective Quest** vs. **Cyber Defender Quest**. **Resolved 18 Aug 2026: Cyber Defender Quest.**
- [x] Name the new realm (Fable Falls / Mirrorlands / other). **Resolved 18 Aug 2026: Fable Falls.**
- [ ] Confirm how much weight "respect others' work" should get — fold into Fable Falls as planned, or skip entirely for v1? **Not yet folded in** — Fable Falls' shipped content (18 Aug 2026) doesn't currently touch plagiarism/IP; still the lowest-priority gap from §2.
- [x] Confirm build sequencing — see the Milestones doc's Phase 0–5 order (single app, band-select folded into Phase 0; no separate per-band builds). **Followed as written; Phases 0–2 are done.**
- [x] **Confirm "P4-5" vs "P4-6" for the S.U.R.E. framework.** **Resolved 18 Aug 2026: treat P4-5 as P4-6.** All of Fable Falls' P4–P6 band gets S.U.R.E., no P6 special-casing.
- [x] **Confirm** the **5th Traveler's Pledge line** (Fable Falls). **Live in the certificate as of 18 Aug 2026** — *"I'll stop and check before I believe or share."* Wording sign-off is still informally open (nobody's said no to it, but nobody's explicitly signed off either).
- [x] Decide how much to disclose/lean on "curriculum-mandated" language when describing band differentiation to stakeholders — per §1a, most of our band-specific design (harder mechanics, higher-stakes scenarios) is our own enrichment, not sourced from the Overview Plan. **Resolved:** disclosed as our own design choice and confirmed age-appropriate by school contact.

---

## 6. Changelog

- **19 Aug 2026: a mini-game must not be passable without judgement — new design rule, applied across all five.** This is the most consequential change since the band split, and it is a learning-design point rather than a technical one. An audit found four of the five mini-games could be completed without the student deciding anything: Sort filed every card into its *correct* bin whichever one you picked; Spot told you whether a message was a real problem the moment you clicked it, so clicking everything scored full marks; Stepping Stones advanced whatever you chose; and Passworld's platformer won the instant the last tile was touched. In each case the game still *looked* like it was teaching judgement while actually rewarding exhaustive clicking — which is exactly the habit these lessons exist to counter. All four now require the judgement to be right before they complete, with free retries and no fail state either way (design.md §8): the fix is never punishment, it is removing the path that skipped the thinking. **Balance Bay is deliberately excepted** — it has no correct answer by design, being a values exercise rather than a right/wrong one, so gating it would misrepresent what it teaches. Any new mechanic should be checked against this rule before it ships. Passworld's platformer was rebuilt hardest: collected pieces now go into a bag and a vault door at the end asks which of them belong in a strong password, refusing entry outright if the strong ones aren't all there. That in turn forced removing five separate visual tells that had been giving the answer away before the student read a word — including two the Milestones designer brief had explicitly asked for, now corrected there. See the Milestones changelog for the technical rundown.

- **18 Aug 2026: Fable Falls unblocked and shipped.** Three of the four Improvement Plan §5 blockers resolved by you directly: realm name (**Fable Falls**), capstone quest name (**Cyber Defender Quest**, not Cyber Detective Quest as this doc had previously suggested), and P4-5 vs P4-6 (**treat as P4-6**). The 4th — the official "3 tips to CHECK" content — is still genuinely unsourced, so it was worked around rather than waited on: the realm's rule text and P4–P6 clue set use general, well-established media-literacy reasoning instead, clearly flagged in code as a placeholder for the real wording. Realm is now `enabled: true`: STOP & CHECK content for P1–P3 (reusing the Spot mechanic — a rumour about a classmate, sortable "fine" vs. "needs a second look" claims) and S.U.R.E. content for P4–P6 styled as the Cyber Defender Quest (reusing the Sort mechanic as a "clue board" — 8 clues tagged by which S.U.R.E. step they belong to, sorted into Points to Fake / Checks Out). Both reuse existing mechanics rather than the bespoke "Detective/Compare" mechanic Milestones Phase 2 originally specified — a pragmatic substitution given there's no real image-comparison content or assets to build a literal "compare two photos" experience against yet; worth revisiting if a more bespoke feel matters later. New guide character introduced in dialogue: **The Echo**, who repeats whatever it hears without checking it — the personification of a rumour, not a villain. 5th accent colour (`--sage`) and stamp icon (`eye`) picked as real, if placeholder-pending-designer, values so the realm doesn't clash visually with the other four. See Milestones changelog for the full technical rundown.
- **18 Aug 2026:** Recheck pass against your latest edits to this doc and the Milestones doc. Implemented the newly-flagged items that were actual code gaps: the 5th Pledge line (drafted, wired, filtered until Fake News is enabled — see above) and per-band suggested hub order (Milestones §4/Phase 0 — see Milestones changelog). Confirmed two items the audit flagged as open decisions are actually already resolved in the existing codebase: session persistence (localStorage-backed, predates this project's changes) and touch-control input for the Phase 2 Phaser mechanics (on-screen buttons/taps, not keyboard-first). Found and fixed one real bug the audit didn't catch: `AtlasMap`'s "all stamped" greeting still hardcoded "Four stamps" — now reads off the realm count.
- **18 Aug 2026:** Milestones Phase 2 (Phaser mechanics) shipped — see Milestones changelog.
- **18 Aug 2026:** Milestones Phase 1 content authoring shipped for all 4 existing realms' P4–P6 variants (§3's story assignments) — Passworld's Sam & Tom account-takeover scenario, Privacy Peaks' subtler phishing, Bully Bog's identity-based pile-on/bystander scenario, Balance Bay's feelings-over-hours reframe. All still use their existing mini-game mechanic; the Phaser swap-in is Phase 2. Fake News realm remains untouched, blocked on the open items below. See Milestones changelog for the technical rundown.
- **18 Aug 2026:** Milestones Phase 0 shipped in code — band-select in the Atlas Gate, per-band content schema (`src/data/realms.js`), 5th realm stubbed but disabled pending the open items in §5, Phaser wired as a lazy dependency. Also shipped from §2's recommended fixes: the reusable Report & Block resolution option (every realm) and the digital-footprint + "who would you tell" beats in Bully Bog, using the language suggested right here in §2. Content divergence between bands (§3) is not started yet — every realm currently runs identical content for both bands via a schema fallback. See `Cyber_Wellness_Quest_Milestones.md` changelog for the full technical rundown.
- **18 Aug 2026:** Initial consolidated plan. Incorporated: two-separate-games decision, new Fake News realm, full Overview Plan re-read (digital footprint, Report+Block, Engage/Support, plagiarism gaps identified), recap-pacing rationale for realm order.
- **18 Aug 2026:** Added §1a — cross-check of band differentiation across all source files. Key findings: Term 1/2 are unified (no band split in the Overview Plan); Term 3's S.U.R.E. framework is written as "P4-5" not "P4-6" (needs confirmation); the Luke/Sam&Tom scenario split was originally a "suggestion" in the Lesson Plan doc, formalized into a hard split only in later slide decks. Flagged that our mechanic/stakes differentiation by band is a design choice, not curriculum-mandated.
- **18 Aug 2026:** School contact confirmed the heavier P4-P6 scenarios (account takeover/impersonation in Passworld, identity-based harassment in Bully Bog) are age-appropriate. Still waiting on the P4-5/P4-6 typo confirmation and the "3 tips to CHECK" content.
- **18 Aug 2026:** **Correction to §0:** this is one game with one entry point, not two separately built apps — updated the Decision statement accordingly. Content differentiation by band is unchanged.
- **18 Aug 2026:** Full audit pass. Flagged the Traveler's Pledge still needs a 5th line (Fake News), added a contingency note for P4-5 vs P4-6 in case P6 is genuinely excluded from S.U.R.E.
- **18 Aug 2026:** Second audit pass. Fixed a stale build-sequencing open item that still described the old two-separate-builds approach — now points to the Milestones doc's phase order. Removed a duplicate open item that repeated the P4-5/P4-6 and "3 tips" items already tracked individually above.
