# Graph Report - CyberDefenderQuest  (2026-08-31)

## Corpus Check
- Large corpus: 5896 files · ~594,688 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 487 nodes · 889 edges · 26 communities (21 shown, 4 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.85)
- Token cost: 150,612 input · 0 output

## Community Hubs (Navigation)
- Realm Screens & Story Panels
- Realm Content Data (both bands)
- Prologue Screens & Character Art
- Stepping Stones Mini-Game & Motion
- Passworld Platformer Scene & Art
- App Shell & Title Screens
- NPM Dependencies
- Sound Effects & Quiz Mini-Game
- Settings, Tutorial & Audio Prefs
- Atlas Map & Boat Navigation
- Screen Flow & Bully Bog Content
- Fable Falls & Privacy Peaks Content
- Judgement Audit & No-Fail Rules
- Progress State & Certificate
- Passworld Content & Named Methods
- Visual Design Language & Motion
- Curriculum Terms & S.U.R.E.
- Background Art Pipeline & Calibration
- Band Split & Guide Characters
- Sort/Spot/Balance Mini-Games
- Fixed Viewport Layout Rules
- Vite Build & Copy-Editor Plugin
- Graphify Workflow Rules
- Realm Intro & Coach Marks
- Phase 5 Playtest & Launch

## God Nodes (most connected - your core abstractions)
1. `playSfx()` - 19 edges
2. `CopyEditor()` - 15 edges
3. `applyScreenOverrides()` - 14 edges
4. `fillRR()` - 12 edges
5. `App()` - 10 edges
6. `MiniGameSure()` - 10 edges
7. `PlatformerStoryRealm()` - 9 edges
8. `circle()` - 9 edges
9. `DialogueCard()` - 8 edges
10. `World()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `S.T.O.P. (Sender · Tone · Task · Path)` --semantically_similar_to--> `STOP & CHECK Method (P1-P3)`  [INFERRED] [semantically similar]
  thingstoimproveon.md → Cyber_Wellness_Quest_Improvement_Plan.md
- `The Echo (Fable Falls guide)` --semantically_similar_to--> `The Fog (Privacy Peaks)`  [INFERRED] [semantically similar]
  Cyber_Wellness_Quest_Milestones.md → storyline.md
- `Dev ?pins Calibration Overlay` --semantically_similar_to--> `#art Scene Contact Sheet`  [INFERRED] [semantically similar]
  PLAN.md → README.md
- `The Ground Rule (scene_y = world_y × 2.8)` --semantically_similar_to--> `Scene Construction Rules (walkable band vs art)`  [INFERRED] [semantically similar]
  README.md → design.md
- `Known Deviations From The Design Docs` --cites--> `Reused Mini-Game Controls Across Realms`  [AMBIGUOUS]
  README.md → design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Five Realms of the Atlas** — storyline_passworld, storyline_privacy_peaks, storyline_bully_bog, storyline_balance_bay, storyline_fable_falls, storyline_the_atlas [EXTRACTED 1.00]
- **Consolidated Curriculum Coverage Gaps** — cyber_wellness_quest_improvement_plan_digital_footprint_gap, cyber_wellness_quest_improvement_plan_report_and_block, cyber_wellness_quest_improvement_plan_engage_and_support, cyber_wellness_quest_improvement_plan_plagiarism_ip_gap, cyber_wellness_quest_improvement_plan_three_tips_to_check [EXTRACTED 1.00]
- **Named-Method Mnemonics, One Per Realm** — thingstoimproveon_three_questions, thingstoimproveon_lmn, thingstoimproveon_stop_framework, thingstoimproveon_think_framework, thingstoimproveon_three_musts, cyber_wellness_quest_improvement_plan_sure_framework [EXTRACTED 1.00]

## Communities (26 total, 4 thin omitted)

### Community 0 - "Realm Screens & Story Panels"
Cohesion: 0.05
Nodes (29): BalanceBeachRealm(), BOUNDS, ITEM_SPOTS, SHORT_LABELS, SPAWN, ChoiceCard(), DialogueCard(), PlatformerStoryRealm() (+21 more)

### Community 1 - "Realm Content Data (both bands)"
Cohesion: 0.07
Nodes (50): balanceHigher, balanceLower, bandViewRaw(), bullybogHigher, bullybogLower, COMET_CATCHPHRASE, fableFallsHigher, fableFallsLower (+42 more)

### Community 2 - "Prologue Screens & Character Art"
Cohesion: 0.07
Nodes (26): AtlasGate(), DIARY_COPY, CERTIFICATE_COPY, CertificateScreen(), BY_NAME, CharacterArt(), Comet(), INTRO_BEATS (+18 more)

### Community 3 - "Stepping Stones Mini-Game & Motion"
Cohesion: 0.09
Nodes (22): motionTween(), prefersReducedMotion(), MiniGameSteppingStones(), ACTIVE_SKIN, ART_MANIFEST, buildSteppingStonesArt(), drawBackdrop(), drawFogBank() (+14 more)

### Community 4 - "Passworld Platformer Scene & Art"
Cohesion: 0.14
Nodes (29): ACTIVE_SKIN, ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker() (+21 more)

### Community 5 - "App Shell & Title Screens"
Cohesion: 0.13
Nodes (20): App(), CharacterSelect(), OPTIONS, JournalProgress(), REALM_ICONS, MainScreen(), SchoolLogo(), TitleScene() (+12 more)

### Community 6 - "NPM Dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 7 - "Sound Effects & Quiz Mini-Game"
Cohesion: 0.13
Nodes (21): RealmScreen(), choose(), useUiClickSfx(), useUiHoverSfx(), getPool(), nextIndex, playSfx(), pools (+13 more)

### Community 8 - "Settings, Tutorial & Audio Prefs"
Cohesion: 0.17
Nodes (19): REALM_TOUR, RealmIntro(), SettingsMenu(), SettingsPanel(), Tutorial(), useAudioSettings(), clamp01(), DEFAULTS (+11 more)

### Community 9 - "Atlas Map & Boat Navigation"
Cohesion: 0.15
Nodes (13): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, orderedActiveRealms(), isInputLocked() (+5 more)

### Community 10 - "Screen Flow & Bully Bog Content"
Cohesion: 0.13
Nodes (16): Engage and Support / Who Would You Tell, Per-Band Suggested Play Order, Hub Order Disagreement (storyline.md vs Improvement Plan §4), Free Exploration, Any Order, Screen Flow (Gate → Atlas → realms → finale), Technical Constraints (artifact-era), De-"Level Up" the Band Split, Known Deviations From The Design Docs (+8 more)

### Community 11 - "Fable Falls & Privacy Peaks Content"
Cohesion: 0.18
Nodes (14): Respect Others' Work (Plagiarism/IP) Gap, STOP & CHECK Method (P1-P3), No Godot — Stay on React/Vite, Phaser, Scoped to Two Mechanics and Lazy-Loaded, The Echo (Fable Falls guide), Quiz Mini-Game, Stepping Stones Mini-Game (Phaser), MiniGameQuiz (5-question Q&A mechanic) (+6 more)

### Community 12 - "Judgement Audit & No-Fail Rules"
Cohesion: 0.19
Nodes (13): A Mini-Game Must Not Be Passable Without Judgement, Accessibility & Kid-Safety UX Notes, Balance Bay Walkable Beach (fullMechanic balanceBeach), Nothing Can Be Failed (warm redirect), Balance Bay (screen time balance), The Glimmer (Balance Bay, retired), Tone & Writing Guidelines (no fear-based framing), Balance Bay Has No Gate (unfailable) (+5 more)

### Community 13 - "Progress State & Certificate"
Cohesion: 0.17
Nodes (12): Digital Footprint / Positive Digital Trail Gap, Report & Block Resolution Option, Term 2 — Recess Activities & Pledge, Phase 1 — Content Authoring (both bands, 5 realms), Phase 4 — Polish, Accessibility, QA, Component Inventory, State & Data Model (travelerName, realmProgress), Dev Copy Editor (contentOverrides.js) (+4 more)

### Community 14 - "Passworld Content & Named Methods"
Cohesion: 0.21
Nodes (12): Phase 2 — New Mechanics (Phaser), PlatformerStoryRealm (fullMechanic continuous level), Uniform Collectible Art (visual tells removed), Passworld Vault Door Challenge, Passworld Personal-Information Coverage (Before You Post), Keeper Vex (Passworld), Passworld (passwords & personal info), L.M.N. (Long · Mixed · Not about me) (+4 more)

### Community 15 - "Visual Design Language & Motion"
Cohesion: 0.20
Nodes (12): Reduced-Motion Support Beyond CSS (motionTween), Tap/Click-to-Move (goTo destination steering), Touch-Parity Regression Blocker (keyboard-only walking), The Traveler's Room Prologue, Avoided Neon-Cyberspace-on-Black Trope, Field-Journal / Passport Metaphor, The Ink Stamp Badge (signature element), Motion & Animation Direction (two moments only) (+4 more)

### Community 16 - "Curriculum Terms & S.U.R.E."
Cohesion: 0.20
Nodes (11): Asset Pipeline (placeholders share final paths), Asset Folder & Naming Convention, Cyber Defender Quest (capstone), Cyber Wellness 2026 Overview & Plan (source doc), Final Recap Experience (20-30 min), S.U.R.E. Framework (Source/Understand/Research/Evaluate), Term 1 — Healthy Digital Habits, Term 3 — Fake News and Images (+3 more)

### Community 17 - "Background Art Pipeline & Calibration"
Cohesion: 0.24
Nodes (10): Asset Specs Table (proposed dimensions), ART_MANIFEST Declared Texture List, Brackeys CC0 Pixel-Art Placeholder Pack, Phase 3 — Backgrounds, Skin-Based Art Swap (SKINS / ACTIVE_SKIN), Scene Construction Rules (walkable band vs art), Hotspot Re-alignment to Real Background Art, Dev ?pins Calibration Overlay (+2 more)

### Community 18 - "Band Split & Guide Characters"
Cohesion: 0.25
Nodes (8): Band Differentiation Is Our Own Enrichment, Band Split (P1-P3 / P4-P6), Luke vs. Sam & Tom Classroom Scenarios, One Game, One App, One Entry Point, Atlas Gate (prologue, naming + band select), Comet (paper-airplane guide), Curiosity and a Second Thought (Comet's catchphrase), The Traveler (the player)

### Community 19 - "Sort/Spot/Balance Mini-Games"
Cohesion: 0.50
Nodes (5): Balance Mini-Game (seesaw), Sort Mini-Game, Spot Mini-Game, Reused Mini-Game Controls Across Realms, Dead Code Findings (MiniGameSpot, MiniGameBalance)

### Community 20 - "Fixed Viewport Layout Rules"
Cohesion: 0.50
Nodes (4): Fixed Viewport, No Page Scrolling, In-World Elements Scale With The Box, Realm Heading Merged Into Journal Bar, Scene Box Enlargement (--scene-max-w)

## Ambiguous Edges - Review These
- `Nothing Can Be Failed (warm redirect)` → `The Glimmer (Balance Bay, retired)`  [AMBIGUOUS]
  storyline.md · relation: conceptually_related_to
- `Known Deviations From The Design Docs` → `Reused Mini-Game Controls Across Realms`  [AMBIGUOUS]
  README.md · relation: cites

## Knowledge Gaps
- **98 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Nothing Can Be Failed (warm redirect)` and `The Glimmer (Balance Bay, retired)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Known Deviations From The Design Docs` and `Reused Mini-Game Controls Across Realms`?**
  _Edge tagged AMBIGUOUS (relation: cites) - confidence is low._
- **Why does `playSfx()` connect `Sound Effects & Quiz Mini-Game` to `Realm Screens & Story Panels`, `Settings, Tutorial & Audio Prefs`, `Passworld Platformer Scene & Art`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `The Atlas (living map of the internet)` connect `Screen Flow & Bully Bog Content` to `Fable Falls & Privacy Peaks Content`, `Judgement Audit & No-Fail Rules`, `Progress State & Certificate`, `Passworld Content & Named Methods`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `Realm Screens & Story Panels` to `Atlas Map & Boat Navigation`, `Prologue Screens & Character Art`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `App()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`App()` has 2 INFERRED edges - model-reasoned connections that need verification._