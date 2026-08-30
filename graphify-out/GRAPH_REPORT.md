# Graph Report - cyberwellness-game  (2026-08-31)

## Corpus Check
- 67 files · ~588,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 400 nodes · 716 edges · 36 communities (15 shown, 21 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ff84e14`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contentOverrides.js
- PlatformerStoryRealm.jsx
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
1. `CopyEditor()` - 16 edges
2. `Cyber Wellness Quest — Milestones & Team Workstreams` - 13 edges
3. `applyScreenOverrides()` - 12 edges
4. `fillRR()` - 12 edges
5. `Cyber Wellness Quest — Design Document` - 12 edges
6. `playSfx()` - 11 edges
7. `circle()` - 9 edges
8. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
9. `App()` - 8 edges
10. `DialogueCard()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `CopyEditor()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/dev/CopyEditor.jsx → src/dev/contentOverrides.js
- `CopyEditor()` --indirect_call--> `subscribe()`  [INFERRED]
  src/dev/CopyEditor.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `subscribe()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --calls--> `useProgress()`  [EXTRACTED]
  src/App.jsx → src/state/useProgress.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (36 total, 21 thin omitted)

### Community 1 - "contentOverrides.js"
Cohesion: 0.11
Nodes (33): DIARY_COPY, REALM_TOUR, ROOM_TOUR, bandViewRaw(), applyOverrides(), clearOverrides(), collectEditable(), collectScreenEditable() (+25 more)

### Community 2 - "PlatformerStoryRealm.jsx"
Cohesion: 0.09
Nodes (25): BalanceBeachRealm(), BOUNDS, ITEM_SPOTS, SHORT_LABELS, SPAWN, ChoiceCard(), DialogueCard(), PlatformerStoryRealm() (+17 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.14
Nodes (28): ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker(), drawImpostor() (+20 more)

### Community 4 - "realms.js"
Cohesion: 0.10
Nodes (24): CertificateScreen(), JournalProgress(), REALM_ICONS, ACTIVE_REALMS, activePledge(), balanceHigher, balanceLower, bullybogHigher (+16 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 6 - "TravelerRoom.jsx"
Cohesion: 0.07
Nodes (23): AtlasGate(), BY_NAME, CharacterArt(), Comet(), INTRO_BEATS, IntroStory(), MainScreen(), SchoolLogo() (+15 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "audioSettings.js"
Cohesion: 0.24
Nodes (13): SettingsPanel(), useAudioSettings(), clamp01(), DEFAULTS, getVolumes(), listeners, load(), notify() (+5 more)

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Cyber Wellness Quest — Design Document"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "steppingStonesArt.js"
Cohesion: 0.11
Nodes (20): motionTween(), prefersReducedMotion(), MiniGameSteppingStones(), ART_MANIFEST, buildSteppingStonesArt(), drawBackdrop(), drawFogBank(), drawWisp() (+12 more)

### Community 14 - "Checklist"
Cohesion: 0.33
Nodes (5): Checklist, Done, Log, To do, Working Plan & Change Log

### Community 15 - "App.jsx"
Cohesion: 0.13
Nodes (20): App(), CharacterSelect(), OPTIONS, EXTRA_BEAT_ORDER, GAMES, RealmScreen(), getBandView(), overridesVersion() (+12 more)

### Community 18 - "AtlasMap.jsx"
Cohesion: 0.14
Nodes (18): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, RealmIntro(), SettingsMenu() (+10 more)

### Community 20 - "RealmArt.jsx"
Cohesion: 0.14
Nodes (6): SPA Root Mount Point, RealmArt(), SCENES, REALMS, ArtPreview(), MOODS

## Knowledge Gaps
- **132 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `App.jsx` to `audioSettings.js`, `passworldArt.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `PlatformerStoryRealm.jsx` to `AtlasMap.jsx`, `realms.js`, `TravelerRoom.jsx`, `App.jsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `World()` connect `AtlasMap.jsx` to `PlatformerStoryRealm.jsx`, `TravelerRoom.jsx`, `App.jsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contentOverrides.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Should `PlatformerStoryRealm.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0915915915915916 - nodes in this community are weakly interconnected._