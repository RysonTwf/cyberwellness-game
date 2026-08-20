# Graph Report - cyberwellness-game  (2026-08-20)

## Corpus Check
- 52 files · ~86,287 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 450 nodes · 593 edges · 102 communities (15 shown, 87 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7762f96b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Curriculum Scope & Band Split
- Mechanics, Assets & Build Phases
- Atlas Hub, Progress & Realm Data
- Passworld Vault Level & Art
- Dependencies & Build Config
- Gate, Characters & Stamp Chrome
- Traveler Room & Walk System
- Phaser Mini-Game Wrappers
- Realm Screen & React Mini-Games
- Sort Mechanic
- Balance Mechanic
- graphify Workflow
- bogArt.js
- Step Panel Portal
- Cyber Wellness Quest
- Asset pipeline
- CLAUDE.md
- Asset Folder & Naming Convention
- Asset Specs Table
- Band Differentiation as Design Enrichment
- P1-P3 / P4-P6 Band Split
- Cyber Defender Quest
- Digital Footprint / Positive Digital Trail
- Engage and Support
- Fable Falls Realm
- Fifth Traveler's Pledge Line
- Final Recap Experience
- One Game, One App, One Entry Point
- P4-5 vs P4-6 Resolution
- Respect Others' Work (Plagiarism / IP)
- Realm Plan by Band
- Report & Block Resolution Option
- STOP & CHECK Method (P1-P3)
- Suggested Play Order per Band
- S.U.R.E. Framework (P4-P6)
- Term 1 - Healthy Digital Habits
- Term 2 - Recess Activities
- The Echo
- 3 Tips to CHECK (Unsourced SLS Content)
- Reduced-Motion Coverage Gap
- ART_MANIFEST Texture Declaration
- Asset Pipeline (Placeholders & Specs)
- Band Select in the Atlas Gate
- Brackeys CC0 Placeholder Skin
- Branching Atlas Map
- Detective/Compare Mechanic (MiniGameCompare)
- Fixed Viewport, No Page Scrolling
- Latin-Only Font Subsets
- Hub Order Doc Disagreement
- Input Scope: Keyboard + Mouse Only
- A Mini-Game Must Not Be Passable Without Judgement
- No Godot - Stay on React/Vite
- Phase 0 - Foundation
- Phase 1 - Content Authoring
- Phase 3 - Backgrounds
- PhaserMiniGame Wrapper
- Phaser Scoped to Two Mechanics, Lazy-Loaded
- Platformer Mechanic (Guard the Vault: Level Up)
- Per-Band Realm Content Schema
- Removed Visual Tells
- ReportBlock Component
- Session Persistence (localStorage)
- Skin-Based Art Swap-In (SKINS / ACTIVE_SKIN)
- Stepping-Stone Decision Run
- The Traveler's Room Prologue
- Vault Door Judgement Gate
- Accessibility & Kid-Safety UX Notes
- The Atlas Concept
- Avoided Tropes (Neon Cyberspace, Warm Cream)
- Balance the Day Mechanic
- Component Inventory
- Field-Journal / Passport Metaphor
- The Ink Stamp Badge
- Motion & Animation Direction
- Scene Construction Rules
- Screen Flow
- Sort Mechanic
- Spot Mechanic
- State & Data Model
- Technical Constraints
- Design Token System
- Ground Rule: scene_y = world_y x 2.8
- Known Deviations from the Design Docs
- No Fail State, Warm Redirect
- Walkable Realm Scene
- Atlas Gate (Prologue)
- Balance Bay
- Bully Bog
- Comet
- Keeper Vex
- No Fear-Based Framing
- Passworld
- Pockets the Frog
- Privacy Peaks
- The Atlas
- The Fog
- The Glimmer
- The Traveler
- The Traveler's Pledge
- Wise Traveler Certificate
- MiniGameSort.jsx

## God Nodes (most connected - your core abstractions)
1. `fillRR()` - 15 edges
2. `Cyber Wellness Quest — Milestones & Team Workstreams` - 13 edges
3. `circle()` - 12 edges
4. `Cyber Wellness Quest — Design Document` - 12 edges
5. `fillRR()` - 11 edges
6. `Cyber Wellness Quest — Storyline` - 11 edges
7. `DialogueCard()` - 9 edges
8. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
9. `Cyber Wellness Quest` - 8 edges
10. `circle()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `getBandView()`  [EXTRACTED]
  src/App.jsx → src/data/realms.js
- `App()` --calls--> `useProgress()`  [EXTRACTED]
  src/App.jsx → src/state/useProgress.js
- `AtlasMap()` --calls--> `orderedActiveRealms()`  [EXTRACTED]
  src/components/AtlasMap.jsx → src/data/realms.js
- `BogStoryRealm()` --calls--> `makeBogCurrentConfig()`  [EXTRACTED]
  src/components/BogStoryRealm.jsx → src/minigames/phaser-scenes/bogCurrentScene.js
- `CertificateScreen()` --calls--> `activePledge()`  [EXTRACTED]
  src/components/CertificateScreen.jsx → src/data/realms.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fable Falls Realm Delivery** — cyber_wellness_quest_improvement_plan_fable_falls, cyber_wellness_quest_improvement_plan_stop_and_check, cyber_wellness_quest_improvement_plan_sure_framework, cyber_wellness_quest_improvement_plan_cyber_defender_quest, cyber_wellness_quest_improvement_plan_the_echo, cyber_wellness_quest_milestones_compare_mechanic, cyber_wellness_quest_improvement_plan_fifth_pledge_line [EXTRACTED 1.00]
- **Judgement Rule Applied Across the Five Mini-Games** — cyber_wellness_quest_milestones_judgement_design_rule, design_sort_mechanic, design_spot_mechanic, design_balance_mechanic, cyber_wellness_quest_milestones_stepping_stones_mechanic, cyber_wellness_quest_milestones_platformer_mechanic, cyber_wellness_quest_milestones_vault_door_gate [EXTRACTED 1.00]
- **Phaser Art Manifest and Skin Swap Pipeline** — cyber_wellness_quest_milestones_art_manifest, cyber_wellness_quest_milestones_skin_system, cyber_wellness_quest_milestones_brackeys_cc0_skin, cyber_wellness_quest_milestones_platformer_mechanic, cyber_wellness_quest_milestones_asset_pipeline, assets_readme_specs_table [EXTRACTED 1.00]

## Communities (102 total, 87 thin omitted)

### Community 0 - "Curriculum Scope & Band Split"
Cohesion: 0.17
Nodes (11): Characters, Cyber Wellness Quest — Storyline, Finale: The Wise Traveler, Prologue: The Atlas Gate, Realm 1: Passworld, Realm 2: Privacy Peaks, Realm 3: Bully Bog, Realm 4: Balance Bay (+3 more)

### Community 1 - "Mechanics, Assets & Build Phases"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 2 - "Atlas Hub, Progress & Realm Data"
Cohesion: 0.05
Nodes (44): SPA Root Mount Point, App(), AtlasGate(), BANDS, BEATS, CertificateScreen(), JournalProgress(), RealmScreen() (+36 more)

### Community 3 - "Passworld Vault Level & Art"
Cohesion: 0.14
Nodes (31): ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawGuessEngine(), drawHacker() (+23 more)

### Community 4 - "Dependencies & Build Config"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 5 - "Gate, Characters & Stamp Chrome"
Cohesion: 0.08
Nodes (28): ACTION_LABEL, BogStoryRealm(), KIND_LABEL, ChoiceCard(), DialogueCard(), ACTION_LABEL, KIND_LABEL, PeaksStoryRealm() (+20 more)

### Community 6 - "Traveler Room & Walk System"
Cohesion: 0.09
Nodes (16): AtlasMap(), BAND_INFO, BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, BY_NAME, CharacterArt() (+8 more)

### Community 7 - "Phaser Mini-Game Wrappers"
Cohesion: 0.12
Nodes (33): BLOWN, OUTCOMES, POSTS, REFUSE_NOTE, SLOTS, ART_ANIMS, ART_MANIFEST, buildPeakArt() (+25 more)

### Community 9 - "Realm Screen & React Mini-Games"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 10 - "Sort Mechanic"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Balance Mechanic"
Cohesion: 0.14
Nodes (13): Files touched, Handover — Bully Bog rebuild (2026-08-20), Not done / next up, `src/components/BogStoryRealm.jsx` (new), `src/components/RealmScreen.jsx`, `src/data/realms.js`, `src/minigames/phaser-scenes/bogArt.js` (new), `src/minigames/phaser-scenes/bogCurrentScene.js` (new, ~700 lines) (+5 more)

### Community 13 - "bogArt.js"
Cohesion: 0.12
Nodes (25): ART_ANIMS, ART_MANIFEST, BOG_COLOURS, bubbleTexture(), buildBogArt(), circle(), drawBoat(), drawHeron() (+17 more)

### Community 16 - "Cyber Wellness Quest"
Cohesion: 0.20
Nodes (9): Cyber Wellness Quest, How it plays, Known deviations from the design docs, Layout, Notes on the build, Running it, Scene contact sheet, The four realms (+1 more)

### Community 103 - "MiniGameSort.jsx"
Cohesion: 0.67
Nodes (3): BIN_ICONS, MiniGameSort(), shuffle()

## Knowledge Gaps
- **208 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **87 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DialogueCard()` connect `Gate, Characters & Stamp Chrome` to `Atlas Hub, Progress & Realm Data`, `Traveler Room & Walk System`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `RealmArt()` connect `Gate, Characters & Stamp Chrome` to `Atlas Hub, Progress & Realm Data`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `World()` connect `Traveler Room & Walk System` to `Atlas Hub, Progress & Realm Data`, `Gate, Characters & Stamp Chrome`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mechanics, Assets & Build Phases` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Atlas Hub, Progress & Realm Data` be split into smaller, more focused modules?**
  _Cohesion score 0.053551912568306013 - nodes in this community are weakly interconnected._
- **Should `Passworld Vault Level & Art` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._