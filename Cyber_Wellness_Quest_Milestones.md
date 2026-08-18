# Cyber Wellness Quest — Milestones & Team Workstreams

*Companion to `Cyber_Wellness_Quest_Improvement_Plan.md` — read that first for the "why," this doc is the "what, in what order."*
*Last updated: 18 Aug 2026*

## Team

- **Programmer (you):** game logic, mechanics, state/data model, band routing, integration.
- **Designer:** visual system, backgrounds, characters, UI chrome, asset production.
- **One game, one app, one entry point.** The existing Atlas Gate becomes the band-select moment — the student picks P1–P3 or P4–P6 right at the start, and the app routes into that band's content for the rest of the session. It is not two separately built/deployed apps.
- **Content is still fully separate per band** — different scenarios, and different mechanics for 2 of the 5 realms (not just a difficulty toggle) — sharing only the visual system, characters, core mechanics library, and world/backgrounds. That separation lives in the content data and component logic, not in the app architecture.

## Tech stack decisions

- **No Godot.** The earlier Godot port design doc is not being pursued — no code was written against it, so nothing is lost. Staying on a single web codebase (React/Vite) avoids a second toolchain/language and keeps the zero-install, browser-based deployment the game already relies on. It's also the safer choice for load time on older school devices, since a Godot HTML5 export would add a WASM runtime on top of everything else.
- **Phaser, scoped to two mechanics only.** The Platformer (Passworld, P4–P6) and stepping-stone decision run (Privacy Peaks, P4–P6) will use Phaser rather than hand-rolled JS, for its built-in physics/animation tooling. Every other mechanic (Sort, Spot, Balance, and the new Detective/Compare) stays plain React — no reason to pull Phaser in where the existing pattern already works.
- **Lazy-load Phaser.** Bundle it so it only loads when a player actually enters Passworld or Privacy Peaks *as a P4–P6 student* — the hub, the other three realms, and anyone playing the P1–P3 path shouldn't pay for a dependency they never use.

---

## Asset pipeline: placeholders & specs

Programmer and designer are working in parallel — this section exists so the programmer isn't blocked waiting on final art, and the designer isn't guessing at dimensions. **Placeholders and final art use the exact same file path**, so swapping one for the other is a file replacement, not a code change.

### Placeholder strategy

- [ ] **Programmer:** for every asset listed in Phases 0–4, create a flat-color placeholder (solid rectangle/circle, text label identifying it — e.g. "TILE: LETTER," "HAZARD: HACKER") at the exact dimensions/format the real asset will use. **Not done as image files** — instead, Phase 2's two Phaser mechanics draw all their placeholder art procedurally at runtime (`Phaser.Graphics → generateTexture`, see `minigames/phaser-scenes/`), so there was never a file for the designer to swap out. Worth a call: keep it procedural (nothing to swap, but the designer can't tweak flat-color placeholders in an image tool either), or have the programmer actually export the current shapes as real image files at these paths so the designer's swap-in stays a pure file replacement as originally planned.
- [x] Build and test all game logic (collision, collection, scoring, mood-switching) against placeholders first. **Done** — the Platformer and stepping-stone mechanics are fully built and validated against procedural placeholders (see Phase 2).
- [x] Don't let any mechanic's logic wait on final art — Phase 2's mechanics should be fully playable on placeholders before Phase 2 art is even started. **True as of 18 Aug 2026** — both are playable now, zero real art.

### Folder & naming convention

```
/assets/
  shared/                        (used by both P1-P3 and P4-P6 content paths, within the one app)
    hub/
      atlas-hub-bg.svg
    passworld/
      passworld-bg-calm.svg
      passworld-bg-alert.svg     (the two "moods")
    privacy-peaks/
      privacy-peaks-bg-calm.svg
      privacy-peaks-bg-alert.svg
    bully-bog/
      bully-bog-bg-calm.svg
      bully-bog-bg-alert.svg
    balance-bay/
      balance-bay-bg-calm.svg
      balance-bay-bg-alert.svg
    fablefalls/
      fablefalls-bg-calm.svg
      fablefalls-bg-alert.svg
    characters/
      comet.svg, traveler.svg, keeper-vex.svg, the-fog.svg,
      pockets.svg, the-glimmer.svg, the-echo.svg
    ui/
      stamp-key.svg, stamp-compass.svg, stamp-heart.svg,
      stamp-sun.svg, stamp-eye.svg,
      certificate-bg.svg, atlas-gate-bg.svg

  p4-6-only/
    passworld-platformer/
      traveler-{idle,run,jump,fall,land}.png   (sprite sheets)
      tiles-{letter,number,symbol,decoy}.png
      hazard-hacker.png
      vault-tileset.png
      meter-ui.png
    privacy-peaks-stepping-stones/
      stone-{1-6}.png
      fog-shape-{1-6}.png

  fablefalls-detective/
    p1-3/clue-{n}.svg
    p4-6/clue-{n}.svg
```

### Specs (proposed defaults — confirm against the live repo's existing constants once Claude Code has access, then lock)

| Asset type | Format | Dimensions | Notes |
|---|---|---|---|
| Scene backgrounds | SVG | 560×280 viewBox | Matches the existing convention (`scene_y = world_y × 2.8` walkable-band conversion) |
| Characters (story/hub) | SVG | Match existing cast's current size | Fable Falls' guide, "The Echo" (named in dialogue 18 Aug 2026), should match Vex/Fog/Pockets/Glimmer's existing scale |
| Platformer sprite frames | PNG sprite sheet | 64×64 px/frame (proposed) | Keep frame size = tile size so collision math stays simple |
| Platformer tileset | PNG sprite sheet | 64×64 px/tile (proposed) | |
| Stepping-stone sprites | PNG sprite sheet | 128×128 px (proposed) | Larger than platformer frames — stones are tap targets, not run-cycle frames |
| Stamp badges | SVG | Match existing 4 stamps' size | |
| Detective clue assets | SVG (P1-3), SVG (P4-6) | Match existing scene proportions | Stays SVG, not sprite sheet — this mechanic is plain React, not Phaser |

---

## Phase 0 — Foundation (shared design system + content schema)

**Programmer**
- [x] Extract the current single-game codebase into a **shared package**: design tokens, `StampBadge`, `DialogueCard`, `ChoiceCard`, `AtlasMap` shell, `JournalProgress`, `CertificateScreen`, `useWalker` walk system, `RealmArt` scene renderer. The app imports from this — no duplicated code between bands. **Done — no literal package split needed:** it was already one codebase; what mattered was auditing that every one of these components takes realm/progress/band data as props rather than assuming a band, which they do.
- [x] Expand the realm content schema (`data/realms.js`-equivalent) to support: **5 realms** (add Fable Falls), **per-band content variants** (same realm, different scenario/dialogue/difficulty), **per-band suggested hub order** (P1–P3 and P4–P6 open on different default realm orders — see Improvement Plan §4), and new fields for the **digital footprint** and **report & block** beats. **Done, including the hub-order piece added in this recheck pass** — `HUB_ORDER` + `orderedActiveRealms(band)` in `realms.js`, consumed by `AtlasMap`'s realm-strip list (verified: `lower` → balance→passworld→bullybog→privacy; `higher` → passworld→privacy→bullybog→balance, matching Improvement Plan §4 exactly; the map itself stays free-exploration, unordered).
- [x] Build the **band-select step into the Atlas Gate flow** — right after the name-entry prologue, the student picks P1–P3 or P4–P6. Store the choice in app state (`band: 'lower' | 'higher'`); every downstream screen reads content from the schema using that value. **One app, one build — this is a routing/state decision, not a second app shell.** **Done.**
- [x] Add Phaser as a scoped dependency; build a `PhaserMiniGame` wrapper component (mounts/unmounts a Phaser canvas inside a React container, cleans up on unmount) as the integration pattern Phase 2 will build on. **Done** — `minigames/PhaserMiniGame.jsx`, dynamic `import('phaser')`. Confirmed via `npm run build`: Phaser now ships as its own ~1.48MB chunk, separate from the ~248KB main bundle, fetched only when Phase 2's mechanics actually mount.
- [x] Set up the placeholder asset pipeline (see "Asset pipeline" section above) — flat-color stand-ins at every path listed, before content/mechanic work in Phases 1–2 begins. **Folder skeleton + naming convention + specs table done** (`/assets/README.md`). **Actual placeholder image files not created** — see the open question logged in "Asset pipeline" above about procedural-vs-file placeholders now that Phase 2 exists and made the call implicitly.

**Designer**
- [ ] Extend the color token + type system for the 5th realm (accent color, stamp icon — key/compass/heart/sun + one new).
- [ ] Define the "mood" pairing convention for the new realm's background art, consistent with the existing rules (solid ground across the whole walkable band in both moods; nothing solid floats above the band).
- [ ] Design the **band-select screen** (part of the Atlas Gate flow) — "Are you in P1–P3 or P4–P6?"

**Deliverable:** the app boots, the gate asks for name + band, and shares hub/journal/certificate chrome regardless of which band was picked. No realm content yet. **Programmer half done.** `npm run build` passes clean.

---

## Phase 1 — Content authoring (both bands, all 5 realms)

**Programmer**
- [x] Write realm content data per band per realm, per the Improvement Plan's story assignments:
  - Passworld: *Luke*-simple (P1–P3) vs. *Sam & Tom* impersonation (P4–P6)
  - Privacy Peaks, Bully Bog, Balance Bay: simple vs. higher-stakes variants (see Improvement Plan §3)
  - **Done for all 4 existing realms** — real, distinct `bands.higher` content in `realms.js` for each (Sam & Tom account-takeover; subtler phishing; identity-based pile-on/bystander, own `extraBeats`; feelings-over-hours reframe). Data-shape-validated programmatically and via `npm run build`.
  - **Fable Falls: STOP & CHECK story beats/decisions (P1–P3) and S.U.R.E. story beats/decisions (P4–P6)** — **done 18 Aug 2026**, once you resolved the realm's name, quest name, and P4-5/P4-6 question directly. P1–P3: a rumour about a classmate, resolved via STOP/CHECK, reusing the Spot mechanic. P4–P6: a fake video claim, resolved via S.U.R.E., styled as the "Cyber Defender Quest," reusing the Sort mechanic as an 8-clue "clue board" tagged by which S.U.R.E. step each clue belongs to. The one still-unsourced piece (the official "3 tips to CHECK" content) was worked around with general media-literacy reasoning instead — flagged in code, swappable later.
- [x] Build the reusable **Report & Block** resolution component, wired into the redirect moment in every realm. **Done** — `components/ReportBlock.jsx`.
- [x] Wire the **digital footprint** beat and the **"who would you tell?"** beat into Bully Bog, both bands. **Done**, using the Improvement Plan §2 suggested language.
- [x] **Write a 5th Traveler's Pledge line** for the Fable Falls realm — the existing 4 are one line per realm (e.g. *"I'll keep my personal info to myself"* for Passworld). Suggested direction: *"I'll stop and check before I believe or share."* Confirm final wording per band's reading level. **Live in the certificate as of 18 Aug 2026** — exactly the suggested line. Now that the realm is `enabled`, `activePledge()` no longer filters it out — it shows up like every other realm's line. Wording sign-off is still informally open.
- [x] **Audit hardcoded "4" realm-count assumptions**: `JournalProgress` stamp dots, `CertificateScreen`'s stamp display, and the finale's unlock condition ("all four stamps earned") all need to become 5 — and ideally read the realm count from the schema rather than being hardcoded, so this doesn't need revisiting if a realm is ever added or removed again. **Audited 18 Aug 2026.** `JournalProgress`, `CertificateScreen`, and the finale-unlock condition (`useProgress`'s `allStamped`) were already reading off `ACTIVE_REALMS.length` from the Phase 0 pass — confirmed still correct. Found one the earlier pass missed: `AtlasMap`'s "all stamped" greeting still literally said "Four stamps" — fixed to read off the count.

**Designer**
- [ ] Confirm which existing cast members (Keeper Vex, The Fog, Pockets, The Glimmer) need alternate poses/expressions for the harder P4–P6 scenarios.
- [ ] Design a **5th realm character** — Fable Falls' guide is named in dialogue now (**The Echo** — repeats whatever it hears without checking it, the personification of a rumour, not a villain), needs its visual design. Consistent with the existing "no villain" cast — Vex/Fog/Pockets/Glimmer are all sympathetic, not scary.
- [ ] *Optional:* Luke/Sam/Tom-inspired supporting characters, to visually tie the game back to the exact classroom scenarios kids already saw — strong choice for a *recap* tool specifically.

**Deliverable:** full playable story content for both bands, across all 5 realms. **Note:** Passworld/Privacy Peaks/Bully Bog/Balance Bay are fully playable end-to-end in Phase 1 — P4–P6 Passworld and Privacy Peaks temporarily run on the original Sort/Spot mechanics as an interim stand-in until Phase 2's Platformer/stepping-stone versions land. Fable Falls turned out not to need the "no fallback mechanic" caveat this note originally raised — it shipped by reusing Spot (P1–P3) and Sort (P4–P6) directly rather than waiting for a bespoke Detective/Compare mechanic.

**Status 18 Aug 2026:** done for all 5 realms. Fable Falls unblocked and shipped the same day you resolved its naming/quest-name/P4-6 questions — content, mechanic, and pledge line all live.

---

## Phase 2 — New mechanics

**Programmer**
- [x] Build the **Platformer** mechanic (P4–P6 Passworld) in Phaser, via the `PhaserMiniGame` wrapper from Phase 0. Lazy-load the Phaser bundle on entry to this realm. **Done** — "Guard the Vault: Level Up" (`MiniGamePlatformer.jsx` + `phaser-scenes/passwordFortressScene.js`). Playtested live 18 Aug 2026, confirmed working after a hard refresh cleared a stale dev-server bundle.
- [x] Build the **stepping-stone decision run** mechanic (P4–P6 Privacy Peaks) in Phaser, same wrapper/lazy-load pattern. **Done** — "Clear the Fog: Level Up" (`MiniGameSteppingStones.jsx` + `phaser-scenes/steppingStonesScene.js`). Decision logic lives in React (same pattern as `MiniGameSpot`); Phaser is the visual run of stones/fog only.
- [x] **Design touch controls for both Phaser mechanics** — platformers/stepping-stone runs conventionally use keyboard, but this is a touch-first product. Needs on-screen controls (e.g. tap-to-move + tap-to-jump zones, or a lightweight on-screen d-pad) for the Platformer, and straightforward tap-to-advance for the stepping-stone run. Keyboard support can exist too, but shouldn't be the primary input. **Done.** Platformer: real DOM ←/Jump/→ buttons (≥48px targets), held via pointer events, polled by the scene identically to keyboard state — fully playable on touch alone. Stepping-stones: 100% DOM button taps (Step on it / Skip it) — no keyboard path exists at all for this one, Phaser is purely visual.
- [ ] Build a new **Detective/Compare** mechanic for Fable Falls in plain React (mirrors the SLS "Interactive Images, Compare, Short Response" activities) — a **STOP & CHECK** version (P1–P3) and a **S.U.R.E.**, clue-based version (P4–P6). No Phaser needed here — same pattern as Sort/Spot/Balance. **Superseded, not built** — Fable Falls shipped 18 Aug 2026 reusing Spot (P1–P3) and Sort (P4–P6) directly instead of a bespoke mechanic, since there's no real image-comparison content or assets yet to build a literal "compare two photos" experience against. Worth a decision: leave it as Sort/Spot permanently (simplest, consistent with how the game already stretches those two mechanics everywhere), or still build the bespoke version later for a more distinct "detective board" feel once real content/art exists.

**Designer**
- [ ] **Passworld platformer ("Password Fortress") asset set:**
  - Traveler animations beyond the existing walk cycle: idle, run, jump (rise), fall, land, and an optional "collect" reaction pose
  - Vault-interior tileset: platform/ground blocks (a few variants to avoid obvious tiling), walls, pillars, background vault machinery, at least one parallax layer in the existing gold Passworld accent
  - Collectible tiles: letter, number, symbol — need to read as distinct types at a glance
  - Decoy tiles styled like weak passwords (`123456`, `password`) — deliberately shinier/more tempting/easier to reach than the real ones
  - Hazard character ("hacker" patrol): idle/patrol movement + a soft-bump contact reaction (no death animation — no fail state)
  - Password-strength meter UI: vault-themed (lock dial or strength bar), clear weak vs. strong states
  - Feedback effects: collect sparkle, decoy shake/flash (not scary), meter fill animation, vault door unlock/open animation for level completion (doubles as the stamp-earning moment)
  - **Format: sprite sheet, not loose SVGs** — Phaser's preferred format, unlike the rest of the game's SVG-only approach
  - Keep it in the existing flat vector/paper-journal style — shouldn't read as a different game bolted onto the Atlas
- [ ] Stepping-stone/fog assets for Privacy Peaks P4–P6 — same sprite sheet format.
- [ ] Real-vs-fake image pairs + "clue" assets for the Detective mechanic. **Blocked on:** sourcing the "3 tips to CHECK real vs. digitally-altered content" (see Improvement Plan §5 open items) — don't start final art until this content is confirmed.

**Deliverable:** every realm playable end-to-end, correct band-specific content and mechanics rendering based on the band chosen at the gate.

**Status 18 Aug 2026:** the two Phaser mechanics are done for Passworld and Privacy Peaks — every one of the 5 realms is now playable end-to-end, both bands, including Fable Falls (via reused mechanics rather than a bespoke one — see above).

---

## Phase 3 — Backgrounds: scaling the existing 9

**Designer**
- [ ] Confirm the current 9 (Atlas hub + 4 realms × 2 moods) are reusable **as-is** regardless of band — same world/location, only story and mechanic differ per band, not the place itself.
- [ ] Add: 2 new mood backgrounds for Fable Falls, a finale/certificate backdrop (if not already covered), and the band-select screen art (see Phase 0). Fable Falls currently has a minimal placeholder scene (a waterfall/mist motif) in `RealmArt.jsx` — real story content now exists to design against.
- [ ] **Realistic total: ~12–13 background pieces, not 18.** This was never going to be 9 × 2 — it's one shared world either way. Worth telling her this explicitly — it reframes her remaining workload.

**Programmer**
- [ ] Integrate new art into the `RealmArt` scene renderer; extend mood-switching logic to cover realm 5.

---

## Phase 4 — Polish, accessibility, QA

**Programmer**
- [ ] Reduced-motion support, large tap targets (≥48px), text-equivalent instructions on every mini-game, keyboard/touch input parity, retry-without-penalty verified on every mini-game.
- [x] Decide & implement session persistence via `window.storage`. **Already done — turns out this predates the Milestones doc itself.** `state/useProgress.js` has persisted `travelerName`, `band`, `realmProgress`, and `pledgeSigned` to `localStorage` (key `cyber-wellness-quest/v1`) since before this project's Phase 0/1/2 work started — it was in the original single-band build. Re-verified 18 Aug 2026 that it still round-trips correctly with the new `band` field and 5-realm-shaped (4 active) `realmProgress`. So the "self-directed over the holidays" scenario this item worries about is already covered; nothing to build here, just worth knowing it's not a gap.

**Designer**
- [ ] Colorblind-safe check across every "safe/unsafe" visual cue — icon + text, never color alone.
- [ ] Finalize the realm 5 stamp badge.

---

## Phase 5 — Playtest & launch

**Both**
- [ ] Run at least one real pilot per band (classroom or holiday take-home) before wide rollout.
- [ ] Collect teacher/student feedback, iterate.

---

## Right now: what each of you should actually be doing

**Designer**, beyond the 9 backgrounds (which are shared-world art, done once):
1. **Fable Falls' scene art** — real content now exists for all of it (both bands), including a named guide character, **The Echo**. Currently running on a minimal placeholder scene in `RealmArt.jsx` (a waterfall/mist motif). Highest-value next task — it's the one realm still visibly bare next to the other four.
2. **Alternate poses/expressions** for existing cast where P4–P6 scenarios get harder (e.g., Keeper Vex reacting to impersonation, not just "don't share your password"). Unblocked, real dialogue exists to build against.
3. **Mini-game asset sets** for the two new mechanics (platformer tiles, stepping-stones) — fully built and running on procedural placeholders (see Phase 2), so real art has actual running code to be measured against.
4. **Band-select screen art** (part of the Atlas Gate flow, not a separate screen — see Phase 0) — currently plain buttons, needs its visual pass.
5. Stamp badge for Fable Falls, once The Echo's visual direction is set (currently using a plain `eye` icon as a stand-in).

**Programmer (you)**, in rough priority order:
1. ~~Phase 0~~ — **done.** Band-select, 5-realm/per-band schema (including per-band hub order), Phaser as a lazy dependency, asset-pipeline folder convention.
2. ~~Phase 1, all 5 realms~~ — **done.** Real P4–P6 content everywhere, Report & Block, digital-footprint/tell-someone beats, 5th pledge line (live), hardcoded-realm-count audit, and Fable Falls itself (content + mechanic, both bands).
3. ~~Phase 2 Phaser mechanics~~ — **done and playtested live**, including a follow-up rework: Passworld P4–P6 is now one continuous platformer level (story, the Sam & Tom decision, and the vault challenge all inside a single scrollable Phaser scene) rather than the decision living in a separate DOM panel — see the changelog entry below.
4. **Nothing programmer-blocked remains.** Everything left in this doc is either designer-side (above) or one of two open decisions, neither urgent:
   - Placeholder-asset strategy (procedural Phaser textures vs. real image files) — logged under "Asset pipeline" above.
   - Whether Fable Falls' Sort/Spot-based mechanics are the permanent answer or a bespoke Detective/Compare mechanic is still worth building later — logged under Phase 2 above.

## Changelog
- **18 Aug 2026: Fable Falls unblocked and shipped**, once you resolved its three outstanding names/decisions directly (realm name → **Fable Falls**; quest name → **Cyber Defender Quest**; P4-5/P4-6 → treat as P4-6). Realm flipped to `enabled: true`. Content for both bands in `realms.js`: P1–P3 reuses the Spot mechanic (a rumour about a classmate, STOP & CHECK framing); P4–P6 reuses the Sort mechanic as an 8-clue "Cyber Defender Quest" clue board, each clue tagged by which S.U.R.E. step (Source/Understand/Research/Evaluate) it belongs to. New guide character named in dialogue: **The Echo**, who repeats whatever it hears without checking it. Added a 5th accent colour (`--sage`) and stamp icon (`eye`, via lucide) so the realm doesn't visually clash with the other four; added a minimal placeholder `RealmArt` scene (waterfall/mist) so it isn't blank; added an `ISLANDS` entry so the Atlas Map doesn't crash. Renamed the internal id and every reference from `fakenews` to `fablefalls` (schema, `HUB_ORDER`, `PLEDGE`, `REALM_ICONS`, `/assets/` folders) to match, now that the name is final. The one item still genuinely unsourced — the SLS package's official "3 tips to CHECK" content — was worked around with general media-literacy reasoning instead, clearly flagged in code as a placeholder for the real wording. All 5 realms × both bands validated programmatically; `npm run build` passes clean.
- **18 Aug 2026: Passworld P4–P6 reworked into one continuous platformer level**, by request ("entirely platformer"). Previously only the tile-collecting game step was Phaser; story, the Sam & Tom decision, and the rule were still the shared walk-to-a-hotspot/open-a-panel pattern every realm uses. Now the whole realm is one scrollable 1120px-wide Phaser level (`phaser-scenes/passwordFortressLevelScene.js`, camera follows the player) driven by a new realm-level component, `PlatformerStoryRealm.jsx`, that a realm+band opts into via `fullMechanic: 'platformerStory'` — an early-return branch in `RealmScreen.jsx`, zero risk to every other realm. The decision content is unchanged; only *delivery* changed: it now fires from an in-level encounter trigger (walking up to whoever's impersonating Sam) and is physically gated by a portcullis that only lifts once resolved safely, instead of a hotspot-opened panel. Story and the rule stay plain, accessible DOM dialogue either side of the level. P1–P3 Passworld is completely unaffected (no `fullMechanic` flag). Playtested live after the rework; verified programmatically (tile/hazard bounds, gate/encounter coordinates) and via `npm run build`.
- **18 Aug 2026:** Recheck pass against your latest edits to both docs. This edit added several genuinely new items on top of restoring the completion history below (which your edit had reset to unchecked) — went through each:
  - **Implemented** (real gaps): per-band suggested hub order (`HUB_ORDER` + `orderedActiveRealms(band)` in `realms.js`, wired into `AtlasMap`'s realm-strip; verified against Improvement Plan §4's exact ordering for both bands); the 5th Traveler's Pledge line (drafted, wired via a new `activePledge()` filter so it's invisible until Fake News ships); fixed one hardcoded-count bug the earlier audit missed (`AtlasMap`'s "Four stamps" greeting).
  - **Confirmed already satisfied**, not actually gaps: session persistence (pre-existing localStorage, predates this project's work); touch controls for both Phaser mechanics (already built this way in the Phase 2 pass — on-screen buttons for the Platformer, pure taps for stepping-stones); the hardcoded-"4" audit itself, everywhere except the one bug above.
  - **Left correctly open**: Fake News's story/mechanic work (still hard-blocked on Improvement Plan §5) and the placeholder-asset file question (now a real, flagged decision now that Phase 2 exists — see "Asset pipeline" above).
  - `npm run build` passes clean; the new hub-order/pledge-filter logic is verified programmatically.
- **18 Aug 2026:** Phase 2 (Phaser mechanics) shipped and playtested live. `MiniGamePlatformer.jsx` + `phaser-scenes/passwordFortressScene.js` — a single-screen Arcade-physics platformer for Passworld P4–P6 ("Guard the Vault: Level Up"): jump between platforms to collect letter/number/symbol tiles, avoid the shinier ground-level "123456"/"password" decoys, soft-bump-only hazard patrol, password-strength meter, vault-door-close win animation. `MiniGameSteppingStones.jsx` + `phaser-scenes/steppingStonesScene.js` — the Privacy Peaks P4–P6 stepping-stone run ("Clear the Fog: Level Up"): six stones presented one at a time, Step-on-it/Skip-it, decision logic in React (same pattern as `MiniGameSpot`), Phaser purely for the visual run + fog + Traveler hop animation. `PhaserMiniGame.jsx` extended to accept a `(Phaser) => config` factory, since a `Scene` class has to `extends Phaser.Scene` and can't be defined until the dynamic import resolves. All placeholder art is procedural (`Graphics → generateTexture`), no image files — see the "Asset pipeline" note this recheck pass added about that choice. `npm run build` confirms the lazy-load actually works end-to-end: Phaser ships as a ~1.48MB chunk separate from the ~248KB main bundle. Found and fixed one real bug during manual playtesting: a stale dev-server bundle (predating these changes) made the platformer look like it hadn't shipped — a hard refresh resolved it, not a code issue.
- **18 Aug 2026:** Phase 1 content authoring shipped for all 4 existing realms (programmer half — designer's band-specific art is still open). `src/data/realms.js`: `passworldHigher` (Sam & Tom account-takeover/impersonation — friend's account hijacked, a message claiming to be them asks for your password), `privacyHigher` (a fake "Atlas Security" urgency/verify-your-password message — subtler than the P1–P3 obvious-prize scam), `bullybogHigher` (a multi-comment pile-on targeting Pockets' voice rather than something they did, plus a bystander-pressure decision; carries its own `extraBeats` since band objects swap wholesale, not per-field), `balanceHigher` (same tide/Glimmer setup, reframed around noticing how the time actually feels rather than counting hours; reuses `balanceLower.game.items`). All 4 still use their existing Sort/Spot/Balance mechanic — the Phaser swap-in for Passworld/Privacy Peaks is Phase 2, unaffected by this. Verified programmatically (all 8 realm×band combinations resolve complete content; sort/spot/balance data shapes are internally consistent; exactly one `safe: true` decision option per pair) and via `npm run build`. Fake News stub is untouched, still blocked on §5.
- **18 Aug 2026:** Phase 0 shipped in code. `src/data/realms.js` restructured to `bands: { lower, higher }` per realm with `getBandView()` resolution and a `null`-band fallback to `lower`; added disabled `fakenews` 5th-realm stub; added `ACTIVE_REALMS` (filters disabled realms) and switched all consumers (AtlasMap, JournalProgress, CertificateScreen, useProgress) to it. `AtlasGate.jsx` now has an explicit intro → naming → band-select phase flow; `useProgress.js` persists `band` in state/localStorage. Added `PhaserMiniGame.jsx` (lazy `import('phaser')` wrapper, destroys on unmount) and the `phaser` dependency — confirmed via `npm run build` that it doesn't ship in the bundle until a mechanic actually imports it. Added `/assets/` folder skeleton + naming convention doc (no placeholder images generated yet — see Phase 0 checklist note on why). Also shipped ahead of schedule from Phase 1: `ReportBlock.jsx` (universal, on every unsafe-choice redirect) and the digital-footprint + "who would you tell" beats in Bully Bog (lower band, using Improvement Plan §2's own suggested language). `npm run build` passes clean.
- **18 Aug 2026:** Initial milestone doc created alongside the Improvement Plan.
- **18 Aug 2026:** Dropped the Godot port — staying on a single React/Vite codebase. Adopted Phaser, scoped and lazy-loaded, for the Platformer and stepping-stone mechanics only; everything else stays plain React.
- **18 Aug 2026:** Expanded Phase 2's Passworld platformer designer task into a full asset breakdown (Traveler animations, tileset, collectible/decoy tiles, hazard character, strength meter UI, feedback effects).
- **18 Aug 2026:** Added "Asset pipeline" section — placeholder strategy, folder/naming convention, and proposed dimension specs, so programmer and designer can work in parallel without blocking each other.
- **18 Aug 2026:** **Correction:** this is one game with one build/entry point, not two separately built apps. Removed "app-lower/app-higher" and the standalone landing-gate phase; band selection is now a step within the existing Atlas Gate flow, folded into Phase 0. Renumbered Phases 3–6 to 3–5 accordingly. Content (scenarios, mechanics for 2 of 5 realms) is still fully separate per band — that separation lives in the content schema and component logic, not in the app architecture.
- **18 Aug 2026:** Fixed a gap: Phase 1's content-authoring task didn't mention the Fake News realm at all. Added it explicitly, and clarified that Fake News has no fallback mechanic (unlike the other 4 realms) — it won't be playable until Phase 2, story-only until then.
- **18 Aug 2026:** Full audit pass. Fixed a stale "Landing/gate screen" reference left over from the one-game correction. Added: 5th Traveler's Pledge line task, hardcoded "4 realms" audit across JournalProgress/CertificateScreen/finale-unlock, per-band suggested hub order in the schema task, touch-control design for the two new Phaser mechanics, and elevated the persistence decision given the "self-directed over the holidays" usage pattern.
- **18 Aug 2026:** Second audit pass. Fixed a wrong "see below" reference (Asset pipeline section is actually above Phase 0). Renamed `landing-gate-bg.svg` to `atlas-gate-bg.svg` for terminology consistency.
