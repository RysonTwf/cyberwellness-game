# Graph Report - cyberwellness-game  (2026-08-31)

## Corpus Check
- 65 files · ~586,239 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 388 nodes · 685 edges · 35 communities (14 shown, 21 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c52e5ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AtlasMap.jsx
- contentOverrides.js
- RealmScreen.jsx
- passworldArt.js
- realms.js
- dependencies
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
- TravelerRoom.jsx
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
3. `fillRR()` - 12 edges
4. `Cyber Wellness Quest — Design Document` - 12 edges
5. `playSfx()` - 11 edges
6. `applyScreenOverrides()` - 10 edges
7. `circle()` - 9 edges
8. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
9. `App()` - 8 edges
10. `collectEditable()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `subscribe()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `RealmIntro()` --calls--> `applyScreenOverrides()`  [EXTRACTED]
  src/components/RealmIntro.jsx → src/dev/contentOverrides.js
- `SettingsPanel()` --calls--> `useAudioSettings()`  [EXTRACTED]
  src/components/SettingsMenu.jsx → src/hooks/useAudioSettings.js
- `TravelerRoom()` --calls--> `applyScreenOverrides()`  [EXTRACTED]
  src/components/TravelerRoom.jsx → src/dev/contentOverrides.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (35 total, 21 thin omitted)

### Community 0 - "AtlasMap.jsx"
Cohesion: 0.14
Nodes (12): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, INTRO_BEATS, IntroStory() (+4 more)

### Community 1 - "contentOverrides.js"
Cohesion: 0.13
Nodes (31): bandViewRaw(), REALMS, clearOverrides(), collectEditable(), collectScreenEditable(), EDITABLE_KEYS, emit(), getOverrides() (+23 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.09
Nodes (24): ChoiceCard(), DialogueCard(), PlatformerStoryRealm(), RealmArt(), SCENES, EXTRA_BEAT_ORDER, GAMES, ReportBlock() (+16 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.11
Nodes (33): motionTween(), prefersReducedMotion(), ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate() (+25 more)

### Community 4 - "realms.js"
Cohesion: 0.06
Nodes (32): AtlasGate(), BANDS, BEATS, CertificateScreen(), BY_NAME, CharacterArt(), Comet(), JournalProgress() (+24 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "audioSettings.js"
Cohesion: 0.28
Nodes (13): SettingsPanel(), useAudioSettings(), clamp01(), DEFAULTS, getVolumes(), listeners, load(), notify() (+5 more)

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
Nodes (22): SPA Root Mount Point, App(), CharacterSelect(), OPTIONS, RealmScreen(), getBandView(), ArtPreview(), MOODS (+14 more)

### Community 18 - "TravelerRoom.jsx"
Cohesion: 0.10
Nodes (22): REALM_TOUR, RealmIntro(), SettingsMenu(), BOUNDS, DIARY_SPOT, DOOR_SPOT, ROOM_TOUR, SPAWN (+14 more)

## Knowledge Gaps
- **126 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `App.jsx` to `audioSettings.js`, `RealmScreen.jsx`, `passworldArt.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `RealmScreen.jsx` to `AtlasMap.jsx`, `realms.js`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `World()` connect `TravelerRoom.jsx` to `AtlasMap.jsx`, `RealmScreen.jsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AtlasMap.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `contentOverrides.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1319073083778966 - nodes in this community are weakly interconnected._