# Graph Report - cyberwellness-game  (2026-08-30)

## Corpus Check
- 60 files · ~580,191 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 349 nodes · 570 edges · 35 communities (15 shown, 20 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d8b06f0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TravelerRoom.jsx
- Characters.jsx
- RealmScreen.jsx
- passworldArt.js
- App.jsx
- dependencies
- RealmArt.jsx
- Cyber Wellness Quest — Milestones & Team Workstreams
- audioSettings.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- Cyber Wellness Quest — Design Document
- Asset pipeline
- steppingStonesArt.js
- Checklist
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
1. `Cyber Wellness Quest — Milestones & Team Workstreams` - 13 edges
2. `fillRR()` - 12 edges
3. `Cyber Wellness Quest — Design Document` - 12 edges
4. `playSfx()` - 10 edges
5. `circle()` - 9 edges
6. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
7. `DialogueCard()` - 8 edges
8. `World()` - 8 edges
9. `useAudioSettings()` - 7 edges
10. `getVolumes()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `SettingsPanel()` --calls--> `useAudioSettings()`  [EXTRACTED]
  src/components/SettingsMenu.jsx → src/hooks/useAudioSettings.js
- `RealmScreen()` --calls--> `playSfx()`  [EXTRACTED]
  src/components/RealmScreen.jsx → src/lib/sfx.js
- `useAudioSettings()` --indirect_call--> `setMusicVolume()`  [INFERRED]
  src/hooks/useAudioSettings.js → src/lib/audioSettings.js
- `useAudioSettings()` --indirect_call--> `setSfxVolume()`  [INFERRED]
  src/hooks/useAudioSettings.js → src/lib/audioSettings.js
- `targetVolume()` --calls--> `getVolumes()`  [EXTRACTED]
  src/lib/music.js → src/lib/audioSettings.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (35 total, 20 thin omitted)

### Community 0 - "TravelerRoom.jsx"
Cohesion: 0.14
Nodes (10): BOUNDS, DIARY_SPOT, DOOR_SPOT, ROOM_TOUR, SPAWN, TravelerRoom(), F, FURNITURE (+2 more)

### Community 1 - "Characters.jsx"
Cohesion: 0.13
Nodes (12): AtlasGate(), BANDS, BEATS, BY_NAME, CharacterArt(), Comet(), MainScreen(), ICONS (+4 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.08
Nodes (32): BalanceBeachRealm(), BOUNDS, ITEM_SPOTS, SHORT_LABELS, SPAWN, ChoiceCard(), DialogueCard(), PlatformerStoryRealm() (+24 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.14
Nodes (28): ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker(), drawImpostor() (+20 more)

### Community 4 - "App.jsx"
Cohesion: 0.08
Nodes (36): App(), CertificateScreen(), CharacterSelect(), OPTIONS, JournalProgress(), REALM_ICONS, ACTIVE_REALMS, activePledge() (+28 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 6 - "RealmArt.jsx"
Cohesion: 0.14
Nodes (6): SPA Root Mount Point, RealmArt(), SCENES, REALMS, ArtPreview(), MOODS

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "audioSettings.js"
Cohesion: 0.31
Nodes (12): useAudioSettings(), clamp01(), DEFAULTS, getVolumes(), listeners, load(), notify(), save() (+4 more)

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Cyber Wellness Quest — Design Document"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "steppingStonesArt.js"
Cohesion: 0.15
Nodes (15): motionTween(), prefersReducedMotion(), ART_MANIFEST, buildSteppingStonesArt(), drawToken(), fillRR(), generate(), preloadSteppingStonesArt() (+7 more)

### Community 14 - "Checklist"
Cohesion: 0.33
Nodes (5): Checklist, Done, Log, To do, Working Plan & Change Log

### Community 18 - "AtlasMap.jsx"
Cohesion: 0.12
Nodes (19): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, RealmIntro(), SettingsMenu() (+11 more)

## Knowledge Gaps
- **131 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `App.jsx` to `audioSettings.js`, `RealmScreen.jsx`, `passworldArt.js`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `RealmScreen.jsx` to `Characters.jsx`, `AtlasMap.jsx`, `App.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `World()` connect `AtlasMap.jsx` to `TravelerRoom.jsx`, `RealmScreen.jsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TravelerRoom.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Should `Characters.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `RealmScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08067375886524823 - nodes in this community are weakly interconnected._