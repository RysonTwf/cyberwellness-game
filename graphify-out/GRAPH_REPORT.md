# Graph Report - CyberDefenderQuest  (2026-08-31)

## Corpus Check
- 68 files · ~592,016 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 466 nodes · 807 edges · 40 communities (17 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9de6f87a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Cyber Wellness Quest — Storyline
- CopyEditor.jsx
- RealmScreen.jsx
- passworldArt.js
- useProgress.js
- dependencies
- App.jsx
- Cyber Wellness Quest — Milestones & Team Workstreams
- playSfx
- vite-plugin-copy-editor.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- Cyber Wellness Quest — Design Document
- Asset pipeline
- steppingStonesArt.js
- Checklist
- Cyber Wellness Quest
- CLAUDE.md
- graphify Knowledge-Graph Workflow
- AtlasMap.jsx
- TravelerRoom.jsx
- ArtPreview.jsx
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
1. `playSfx()` - 19 edges
2. `CopyEditor()` - 15 edges
3. `applyScreenOverrides()` - 14 edges
4. `Cyber Wellness Quest — Milestones & Team Workstreams` - 13 edges
5. `fillRR()` - 12 edges
6. `Cyber Wellness Quest — Design Document` - 12 edges
7. `Cyber Wellness Quest — Storyline` - 11 edges
8. `App()` - 10 edges
9. `MiniGameSure()` - 10 edges
10. `PlatformerStoryRealm()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `subscribe()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `SettingsPanel()` --calls--> `useAudioSettings()`  [EXTRACTED]
  src/components/SettingsMenu.jsx → src/hooks/useAudioSettings.js
- `App()` --calls--> `getBandView()`  [EXTRACTED]
  src/App.jsx → src/data/realms.js
- `App()` --calls--> `useProgress()`  [EXTRACTED]
  src/App.jsx → src/state/useProgress.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (40 total, 22 thin omitted)

### Community 0 - "Cyber Wellness Quest — Storyline"
Cohesion: 0.17
Nodes (11): Characters, Cyber Wellness Quest — Storyline, Finale: The Wise Traveler, Prologue: The Atlas Gate, Realm 1: Passworld, Realm 2: Privacy Peaks, Realm 3: Bully Bog, Realm 4: Balance Bay (+3 more)

### Community 1 - "CopyEditor.jsx"
Cohesion: 0.11
Nodes (34): bandViewRaw(), getBandView(), applyOverrides(), clearOverrides(), collectEditable(), collectScreenEditable(), DEV, EDITABLE_KEYS (+26 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.05
Nodes (29): BalanceBeachRealm(), BOUNDS, ITEM_SPOTS, SHORT_LABELS, SPAWN, ChoiceCard(), DialogueCard(), PlatformerStoryRealm() (+21 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.14
Nodes (29): ACTIVE_SKIN, ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker() (+21 more)

### Community 4 - "useProgress.js"
Cohesion: 0.73
Nodes (5): freshRealmProgress(), initialState(), load(), reducer(), useProgress()

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 6 - "App.jsx"
Cohesion: 0.06
Nodes (37): DIARY_COPY, CERTIFICATE_COPY, CertificateScreen(), BY_NAME, CharacterArt(), Comet(), CharacterSelect(), OPTIONS (+29 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "playSfx"
Cohesion: 0.08
Nodes (40): App(), RealmScreen(), choose(), useAudioSettings(), useUiClickSfx(), useUiHoverSfx(), clamp01(), DEFAULTS (+32 more)

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Cyber Wellness Quest — Design Document"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "steppingStonesArt.js"
Cohesion: 0.09
Nodes (22): motionTween(), prefersReducedMotion(), MiniGameSteppingStones(), ACTIVE_SKIN, ART_MANIFEST, buildSteppingStonesArt(), drawBackdrop(), drawFogBank() (+14 more)

### Community 14 - "Checklist"
Cohesion: 0.33
Nodes (5): Checklist, Done, Log, To do, Working Plan & Change Log

### Community 15 - "Cyber Wellness Quest"
Cohesion: 0.20
Nodes (9): Cyber Wellness Quest, How it plays, Known deviations from the design docs, Layout, Notes on the build, Running it, Scene contact sheet, The four realms (+1 more)

### Community 18 - "AtlasMap.jsx"
Cohesion: 0.12
Nodes (20): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, REALM_TOUR, RealmIntro() (+12 more)

### Community 19 - "TravelerRoom.jsx"
Cohesion: 0.13
Nodes (10): AtlasGate(), BOUNDS, DIARY_SPOT, DOOR_SPOT, ROOM_TOUR, SPAWN, F, FURNITURE (+2 more)

### Community 20 - "ArtPreview.jsx"
Cohesion: 0.33
Nodes (4): SPA Root Mount Point, REALMS, ArtPreview(), MOODS

## Knowledge Gaps
- **155 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 215 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `playSfx` to `RealmScreen.jsx`, `passworldArt.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `RealmScreen.jsx` to `AtlasMap.jsx`, `App.jsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `PlatformerStoryRealm()` connect `RealmScreen.jsx` to `playSfx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CopyEditor.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11411411411411411 - nodes in this community are weakly interconnected._
- **Should `RealmScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053939714436805924 - nodes in this community are weakly interconnected._