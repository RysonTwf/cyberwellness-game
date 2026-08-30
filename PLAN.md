# Working Plan & Change Log

Living document for the `ryson` branch art/UX pass. Update the checklist and
log together — a change isn't "done" until it's ticked here with a note of
what actually changed.

---

## Checklist

### Done

- [x] Tap/click-to-move replaces the on-screen d-pad (`ef1a0d6`, after `0f08893`)
- [x] Walking speed evened out; dead Passworld platformer code removed (`371e6a5`)
- [x] Phase 4 accessibility audit — reduced-motion coverage, touch targets (`f8667e4`)
- [x] Stepping-stone scene gets an ART_MANIFEST/skin like Passworld (`3d2944b`)
- [x] Real background art wired in for Passworld, Privacy Peaks, Bully Bog,
      Balance Bay (`5158202`)
- [x] School-uniform mascots on CharacterSelect (mascot art above each pick
      card; cards themselves unchanged, mascots appear nowhere else) (`fc1f69e`)
- [x] Sprite walk-flip bug — the walk-bob animation lived on the sprite
      wrapper and overrode the inline `scaleX(facing)` flip, so the boy/girl
      sprite never faced left while moving; bob moved to the inner `<img>`
      (`fc1f69e`)
- [x] **Scene boxes enlarged** (this pass): `--scene-max-w` raised
      1100px → 1600px on `.world`/`.phaser-host` and 840px → 1200px on the
      Atlas, so the game box fills the screen and viewport *height* is what
      binds on a normal desktop instead of an arbitrary width cap. Dead
      `--scene-vh` declarations (set but never read anywhere) removed.
- [x] **Hotspots re-aligned to the real background art** (this pass), all in
      `src/data/realms.js` — the old coordinates were calibrated against the
      removed procedural SVG scenes. All four BGs are 1920×960, exactly the
      2:1 scene box, so % maps straight onto the art:
      - Passworld: "the vault doors" 20% → 17% (centred under the left gold
        door), "the open gate" 51% → 50%, walkable `minY` 68 → 70 so the
        Traveler stays below the wall's grass line (~69.6%).
      - Privacy Peaks: "the shape in the fog" 72% → 69% (the silhouette baked
        into FOG.png); "the clear path" moved from empty snow at 84% to the
        torii gate + stepping-stone path at 30% — that path is what the fog
        clearing actually reveals.
      - Bully Bog: "Pockets"/"the murky water" moved onto the left pond
        (48/24% → 27/17% — the sad frog sits at ~27%); "the comment" moved
        onto the right pond's crowd (66% → 73%).
      - Balance Bay (P4–6 band): "The Glimmer" 40% → 58% (under the sparkle),
        "the tide line" y 90 → 78 (against the wet band), "the bonfire"
        (84,84) → (78,88) (beside the flames, not inside them).
      - Fable Falls: untouched — still on placeholder SVG art, coordinates
        still match it.
- [x] **Dev pin-calibration overlay** (this pass): run the dev server with
      `?pins` in the URL and every world shows a live x/y readout in
      stop-space percent; clicking copies `x: NN, y: NN` to the clipboard
      (and logs it with the realm id) for pasting into `realms.js`. Dev-only,
      stripped from production builds.
- [x] **In-world elements scale with the box** (this pass): walker, pins,
      labels, interact button and Comet were all fixed CSS px (calibrated for
      the old 1100px cap), so growing the box — or zooming the browser out,
      which re-expands the fluid box while fixed-px pins shrink — made the
      actors look tiny against the scene. World.jsx now measures the box
      (ResizeObserver) and scales them up in proportion past 1100px (factor
      clamped to [1, 1.5], never below 1 — phones and 48px touch floors are
      untouched).

- [x] **Pins verified live in Chrome** (this pass, via the Claude browser
      extension): Privacy Peaks (story pin on the fog silhouette, Look
      triggers), Bully Bog (Pockets pin on the sad frog's pond), Balance Bay
      P4–6 (Glimmer pin under the sparkle) all land correctly. Passworld's
      lower-band pins not yet eyeballed (test save was upper band, which uses
      the platformer instead).
- [x] **Compact realm-screen chrome** (this pass): on a short laptop viewport
      (e.g. 1280×609 CSS at 150% Windows scaling) the 2:1 scene box is
      *height*-bound, so the width-cap raise alone didn't help there — every
      px of chrome above the box costs 2px of box width. Tightened
      journal-bar padding, accent-bar, and realm-head (smaller heading +
      badge, tighter margins): box grew 627 → 713px (+14%) on that viewport.

- [x] **Realm heading merged into the journal bar** (this pass): the realm's
      icon/name/topic now render in the bar's empty middle (JournalProgress
      `realm` prop, passed from App); the standalone `.realm-head` row is
      gone from RealmScreen/PlatformerStoryRealm/BalanceBeachRealm. Box grew
      713 → 982px on the test viewport — +57% total vs. before this pass.
      The topic pill hides under 720px so the bar doesn't crowd on phones.

- [x] **Lore, level descriptions, and tutorial** (this pass):
      - Every realm has an `intro` block in realms.js — a lore paragraph,
        three "you'll learn" bullets, and a one-line `learnShort` tagline.
      - Atlas sidebar cards now show each realm's blurb + "Learn: …" line.
      - `RealmIntro.jsx`: entering a not-yet-stamped realm pops the lore +
        what-you'll-learn panel over the visible realm ("Step in" dismisses;
        stamped realms skip it).
      - `Tutorial.jsx`: reusable coach-mark overlay — screen dims (dark but
        see-through), the current step's element is spotlit via a cutout
        with an accent ring, a card gives the guidance (Next/Back/Skip,
        keyboard Enter/arrows/Esc). Input-locked while running.
      - Tours wired: Traveler's Room (welcome → walk → pin → objective),
        Atlas (map → realm list → stamps → go explore), and first walkable
        realm (pin → interact → objective), chained after its intro popup.
        Each runs once (`tutorialsSeen` in progress state, cleared by
        reset); fullMechanic realms skip the realm tour.
      - All verified live in Chrome end-to-end on a fresh save.

- [x] **School content revision pass** (31 Aug 2026): the school reviewed the
      game and returned a change list.
      - **Language:** hand rewrite of every player-facing string in
        `realms.js` plus the screen copy (`IntroStory`, the three tutorial
        tours, `AtlasGate`, `CertificateScreen`, `StampMoment`) — proper word
        forms, no chat short-forms anywhere (including inside the in-fiction
        scam / bully / rumour messages), UK English, present tense,
        P3–P4 reading level, no em dashes.
      - **Privacy Peaks P1–3 and Fable Falls (both bands)** swapped their
        Spot/Sort "judge the whole pile" games for a plain 5-question Q&A
        (`game.type: 'quiz'`, new `src/minigames/MiniGameQuiz.jsx`,
        registered in `RealmScreen`). Same no-fail rule — a wrong answer
        explains itself and you pick again. Step trail shows "Questions" for
        these. Privacy Peaks P4–6 keeps its Phaser stepping-stones.
      - **Fable Falls** reframed: the rumour about Mia now spreads online (a
        forwarded screenshot/post), not by word of mouth, and the questions
        after teach source-checking, "looks real vs is real", and edited /
        AI-photo tells.
      - **Balance Bay:** the branching "stay vs go" choice and the Glimmer
        character are gone (the story just talks plainly about balancing
        screen time). The walkable beach was briefly cut and then restored —
        it now runs for **both bands** via realm-level
        `fullMechanic: 'balanceBeach'`: the Traveler walks the sand picking
        activities up while a real seesaw sprite (`world/beach/BeachScene.jsx`,
        `seesaw.png` + `palm-hammock.png`) tips. `RealmScreen` gained
        `hasDecision` support for a decision-less non-delegated realm (now
        unused but kept defensive).
      - **Copy Editor** (`contentOverrides.js`) learns the quiz field shape
        (`feedback` key + `game.questions.*` humanize labels).

### To do

- [ ] Verify Passworld lower-band pins live (needs a lower-band save).
- [ ] Fable Falls real background art (designer pass still pending —
      Milestones Phase 3). Re-align its stops when the art lands, same
      measure-against-the-PNG process as the other four.
- [ ] Phaser canvas sharpness: both Phaser scenes render at a fixed 560×280
      internal resolution and CSS-stretch to the box, so the bigger box makes
      the upscale softer. Neither scene reads pointer coordinates (keyboard /
      DOM-driven only), so an internal-resolution bump (e.g. 2×
      canvas + `camera.setZoom(2).centerOn(280,140)`) is safe if the blur
      bothers anyone at 1600px. Not done yet — size was the complaint, not
      blur.
- [ ] Mobile check: `.world` swaps to a 4:3 box under 560px, and the 2:1
      scene SVG letterboxes inside it (`preserveAspectRatio` default) — worth
      a look on a phone now that backgrounds are real art rather than
      procedural shapes that tolerated any crop.
- [ ] Balance Bay's walkable beach (`BalanceBeachRealm` ITEM_SPOTS, both
      bands now) uses `BeachScene`'s CSS sand/water + the two pixel sprites,
      not the `BalanceBayBG.png` art the story/rule steps show — if that
      scene ever gets real art the ITEM_SPOTS want re-measuring against it.

---

## Log

- **31 Aug 2026 — Passworld personal-information coverage**: P1–P3 gained a
  "which password is hardest to guess" follow-up (new `strongPassword`
  extraBeat; RealmScreen's beat renderer generalised to any `options` /
  `accept` beat). P4–P6's platformer only covered passwords + impersonation,
  so it now runs a short "Before You Post" Sort afterwards (new
  `passworldHigher.privacyCheck`; new `check` step in
  `PlatformerStoryRealm.jsx`) on info that gives you away in combination, and
  the P4–P6 rule mentions personal information.
- **31 Aug 2026 — de-"level up" the band split**: the game is played once, so
  P4–P6 shouldn't read as a sequel to P1–P3. **Bully Bog** and **Balance
  Bay** now run the identical scenario / decision / mechanic / items for both
  bands — only the wording differs (terse for P1–P3, fuller-but-tight for
  P4–P6). Dropped every ": Level Up" game title and "upgraded rule" /
  "again" / "this time" phrasing across Passworld, Privacy Peaks and Fable
  Falls too (their P4–P6 *content* still differs — account takeover,
  official-looking phishing, deepfakes). `src/data/realms.js` only; also
  `storyline.md`, `design.md`.
- **31 Aug 2026 — Balance Bay follow-ups**: retired the Glimmer character
  (plain talk about screen-time balance instead); then, per the school,
  restored the walkable beach for **both bands** — realm-level
  `fullMechanic: 'balanceBeach'`, seesaw + palm-hammock sprites visible as
  landmarks, spawn moved clear of the seesaw, ITEM_SPOTS re-laid. The
  panel `MiniGameBalance` reverted to its plain CSS beam (now unused by any
  realm but still registered). Files: `src/components/BalanceBeachRealm.jsx`
  (recreated), `src/components/RealmScreen.jsx`, `src/data/realms.js`,
  `src/world/beach/*`, `src/assets/beach/*`, `src/minigames/MiniGameBalance.jsx`,
  `src/styles.css`.
- **31 Aug 2026 — school content revision**: language rewrite across all
  player copy; new `MiniGameQuiz` mechanic for Privacy Peaks P1–3 and Fable
  Falls (both bands); Fable Falls reframed around an online rumour + fake-news
  / AI-photo questions; Balance Bay loses its walkable beach and its choice
  step (story → seesaw); `RealmScreen` handles decision-less realms; beach
  component/scene/assets deleted; Copy Editor covers quiz fields. Files:
  `src/data/realms.js`, `src/minigames/MiniGameQuiz.jsx` (new),
  `src/components/RealmScreen.jsx`, `src/dev/contentOverrides.js`, screen-copy
  components, `design.md`.
- **30 Aug 2026 — this pass**: scene-box size + hotspot alignment + `?pins`
  calibration overlay + proportional in-world scaling (details in the bold
  checklist entries above). Files touched: `src/styles.css` (`--scene-max-w`,
  dead `--scene-vh` cleanup, `--ws` transform on `.hotspot`/`.interact`),
  `src/data/realms.js` (stops + Passworld `minY`, with measurement notes as
  comments per realm), `src/world/World.jsx` (calibration overlay,
  ResizeObserver world-scale factor).
- **30 Aug 2026**: mascots on CharacterSelect + walk-flip fix + unused
  `BOY_MASCOT.jpg` removed (`fc1f69e`).
- **30 Aug 2026**: real background art for four realms (`5158202`); walking
  speed / dead-code cleanup (`371e6a5`).
- **Earlier**: see `git log` — d-pad → tap-to-move, accessibility audit,
  stepping-stone skin, boy/girl avatar art, Balance Bay beach gamification.
