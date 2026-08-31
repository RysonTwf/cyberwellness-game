# Graph Report - cyberwellness-game  (2026-08-31)

## Corpus Check
- 68 files · ~590,332 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 406 nodes · 736 edges · 35 communities (14 shown, 21 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a979b98`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CopyEditor.jsx
- RealmScreen.jsx
- passworldArt.js
- realms.js
- dependencies
- TravelerRoom.jsx
- Cyber Wellness Quest — Milestones & Team Workstreams
- audioSettings.js
- vite-plugin-copy-editor.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- Cyber Wellness Quest — Design Document
- Asset pipeline
- steppingStonesArt.js
- Checklist
- App.jsx
- graphify Knowledge-Graph Workflow
- AtlasMap.jsx
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
1. `CopyEditor()` - 16 edges
2. `applyScreenOverrides()` - 14 edges
3. `Cyber Wellness Quest — Milestones & Team Workstreams` - 13 edges
4. `fillRR()` - 12 edges
5. `Cyber Wellness Quest — Design Document` - 12 edges
6. `playSfx()` - 11 edges
7. `App()` - 10 edges
8. `circle()` - 9 edges
9. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
10. `DialogueCard()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `subscribe()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --calls--> `getBandView()`  [EXTRACTED]
  src/App.jsx → src/data/realms.js
- `App()` --calls--> `useUiClickSfx()`  [EXTRACTED]
  src/App.jsx → src/hooks/useUiClickSfx.js
- `App()` --calls--> `useUiHoverSfx()`  [EXTRACTED]
  src/App.jsx → src/hooks/useUiHoverSfx.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (35 total, 21 thin omitted)

### Community 1 - "CopyEditor.jsx"
Cohesion: 0.12
Nodes (34): bandViewRaw(), getBandView(), REALMS, applyOverrides(), clearOverrides(), collectEditable(), collectScreenEditable(), EDITABLE_KEYS (+26 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.06
Nodes (32): SPA Root Mount Point, BalanceBeachRealm(), BOUNDS, ITEM_SPOTS, SHORT_LABELS, SPAWN, ChoiceCard(), PlatformerStoryRealm() (+24 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.11
Nodes (34): motionTween(), prefersReducedMotion(), ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate() (+26 more)

### Community 4 - "realms.js"
Cohesion: 0.11
Nodes (21): JournalProgress(), REALM_ICONS, ACTIVE_REALMS, balanceHigher, balanceLower, bullybogHigher, bullybogLower, fableFallsHigher (+13 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 6 - "TravelerRoom.jsx"
Cohesion: 0.08
Nodes (24): AtlasGate(), DIARY_COPY, CERTIFICATE_COPY, BY_NAME, CharacterArt(), Comet(), DialogueCard(), ICONS (+16 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "audioSettings.js"
Cohesion: 0.19
Nodes (19): App(), SettingsPanel(), useAudioSettings(), clamp01(), DEFAULTS, getVolumes(), listeners, load() (+11 more)

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Cyber Wellness Quest — Design Document"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "steppingStonesArt.js"
Cohesion: 0.19
Nodes (12): ART_MANIFEST, buildSteppingStonesArt(), drawBackdrop(), drawFogBank(), drawWisp(), generate(), preloadSteppingStonesArt(), ridge() (+4 more)

### Community 14 - "Checklist"
Cohesion: 0.33
Nodes (5): Checklist, Done, Log, To do, Working Plan & Change Log

### Community 15 - "App.jsx"
Cohesion: 0.11
Nodes (18): CertificateScreen(), CharacterSelect(), OPTIONS, INTRO_BEATS, IntroStory(), MainScreen(), RealmScreen(), SchoolLogo() (+10 more)

### Community 18 - "AtlasMap.jsx"
Cohesion: 0.12
Nodes (19): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, REALM_TOUR, RealmIntro() (+11 more)

## Knowledge Gaps
- **132 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `App.jsx` to `audioSettings.js`, `RealmScreen.jsx`, `passworldArt.js`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `TravelerRoom.jsx` to `AtlasMap.jsx`, `RealmScreen.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `World()` connect `AtlasMap.jsx` to `RealmScreen.jsx`, `TravelerRoom.jsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CopyEditor.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11861861861861862 - nodes in this community are weakly interconnected._
- **Should `RealmScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05909090909090909 - nodes in this community are weakly interconnected._