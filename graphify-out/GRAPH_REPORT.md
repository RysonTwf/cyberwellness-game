# Graph Report - cyberwellness-game  (2026-08-19)

## Corpus Check
- 43 files · ~41,991 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 303 edges · 39 communities (17 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c471a55`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TravelerRoom.jsx
- StampBadge.jsx
- RealmScreen.jsx
- realms.js
- dependencies
- package.json
- Cyber Wellness Quest — Milestones & Team Workstreams
- useProgress.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- ArtPreview.jsx
- Asset pipeline
- MiniGamePlatformer.jsx
- Cyber Wellness Quest — Storyline
- Cyber Wellness Quest
- CLAUDE.md
- graphify Knowledge-Graph Workflow
- useWalker.js
- RealmArt.jsx
- localStorage Persistence (cyber-wellness-quest/v1)
- Cyber Wellness Quest (project overview)
- requestAnimationFrame Walk Loop
- No Image Assets: SVG Shapes Only
- Deviation: A Third Mini-Game
- Deviation: Vite App with Persistence
- Deviation: Walkable World, Not Cards
- The Atlas (internet as a map)
- Comet (paper-airplane guide)
- Keeper Vex
- No Fear-Based Framing
- Passport Stamps as Proof of Visit
- Pockets the Frog
- Choice Consequences Are Reversible
- The Fog
- The Glimmer
- The Traveler (player)
- The Traveler's Pledge

## God Nodes (most connected - your core abstractions)
1. `Cyber Wellness Quest — Milestones & Team Workstreams` - 12 edges
2. `Cyber Wellness Quest — Design Document` - 12 edges
3. `Cyber Wellness Quest — Storyline` - 11 edges
4. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
5. `Cyber Wellness Quest` - 8 edges
6. `useProgress()` - 6 edges
7. `DialogueCard()` - 6 edges
8. `StampBadge()` - 6 edges
9. `initialState()` - 5 edges
10. `3. Token System` - 5 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useProgress()`  [EXTRACTED]
  src/App.jsx → src/state/useProgress.js
- `CertificateScreen()` --calls--> `activePledge()`  [EXTRACTED]
  src/components/CertificateScreen.jsx → src/data/realms.js
- `PlatformerStoryRealm()` --calls--> `makePasswordFortressLevelConfig()`  [EXTRACTED]
  src/components/PlatformerStoryRealm.jsx → src/minigames/phaser-scenes/passwordFortressLevelScene.js
- `MiniGamePlatformer()` --calls--> `makePasswordFortressConfig()`  [EXTRACTED]
  src/minigames/MiniGamePlatformer.jsx → src/minigames/phaser-scenes/passwordFortressScene.js
- `MiniGameSteppingStones()` --calls--> `makeSteppingStonesConfig()`  [EXTRACTED]
  src/minigames/MiniGameSteppingStones.jsx → src/minigames/phaser-scenes/steppingStonesScene.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (39 total, 22 thin omitted)

### Community 0 - "TravelerRoom.jsx"
Cohesion: 0.10
Nodes (12): AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, BOUNDS, DIARY_SPOT, DOOR_SPOT (+4 more)

### Community 1 - "StampBadge.jsx"
Cohesion: 0.14
Nodes (11): AtlasGate(), BANDS, BEATS, BY_NAME, CharacterArt(), Comet(), ICONS, makeRandom() (+3 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.15
Nodes (14): ChoiceCard(), DialogueCard(), PlatformerStoryRealm(), EXTRA_BEAT_ORDER, GAMES, REALM_ICONS, ReportBlock(), StampMoment() (+6 more)

### Community 4 - "realms.js"
Cohesion: 0.11
Nodes (17): CertificateScreen(), ACTIVE_REALMS, activePledge(), balanceHigher, balanceLower, bullybogHigher, bullybogLower, fableFallsHigher (+9 more)

### Community 5 - "dependencies"
Cohesion: 0.13
Nodes (15): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+7 more)

### Community 6 - "package.json"
Cohesion: 0.14
Nodes (13): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, dev (+5 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (15): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+7 more)

### Community 8 - "useProgress.js"
Cohesion: 0.13
Nodes (7): SPA Root Mount Point, App(), RealmArt(), SCENES, REALMS, ArtPreview(), MOODS

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "ArtPreview.jsx"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "MiniGamePlatformer.jsx"
Cohesion: 0.33
Nodes (5): MiniGamePlatformer(), MiniGameSteppingStones(), makePasswordFortressConfig(), makeSteppingStonesConfig(), PhaserMiniGame()

### Community 14 - "Cyber Wellness Quest — Storyline"
Cohesion: 0.17
Nodes (11): Characters, Cyber Wellness Quest — Storyline, Finale: The Wise Traveler, Prologue: The Atlas Gate, Realm 1: Passworld, Realm 2: Privacy Peaks, Realm 3: Bully Bog, Realm 4: Balance Bay (+3 more)

### Community 15 - "Cyber Wellness Quest"
Cohesion: 0.20
Nodes (9): Cyber Wellness Quest, How it plays, Known deviations from the design docs, Layout, Notes on the build, Running it, Scene contact sheet, The four realms (+1 more)

### Community 19 - "RealmArt.jsx"
Cohesion: 0.73
Nodes (5): freshRealmProgress(), initialState(), load(), reducer(), useProgress()

## Knowledge Gaps
- **118 isolated node(s):** `SPAWN`, `BOUNDS`, `DIARY_SPOT`, `DOOR_SPOT`, `ISLANDS` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `World()` connect `TravelerRoom.jsx` to `RealmScreen.jsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `RealmScreen.jsx` to `StampBadge.jsx`, `realms.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `SPAWN`, `BOUNDS`, `DIARY_SPOT` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TravelerRoom.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `StampBadge.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._
- **Should `realms.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1067193675889328 - nodes in this community are weakly interconnected._