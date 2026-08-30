# Graph Report - cyberwellness-game  (2026-08-31)

## Corpus Check
- 66 files · ~587,162 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 394 nodes · 696 edges · 40 communities (19 shown, 21 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0d7cb3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CertificateScreen.jsx
- contentOverrides.js
- RealmScreen.jsx
- passworldArt.js
- realms.js
- dependencies
- AtlasGate.jsx
- Cyber Wellness Quest — Milestones & Team Workstreams
- audioSettings.js
- vite-plugin-copy-editor.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- Cyber Wellness Quest — Design Document
- Asset pipeline
- steppingStonesArt.js
- Checklist
- App.jsx
- AtlasMap.jsx
- graphify Knowledge-Graph Workflow
- TravelerRoom.jsx
- BeachScene.jsx
- ArtPreview.jsx
- useProgress.js
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
10. `collectEditable()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `getBandView()`  [EXTRACTED]
  src/App.jsx → src/data/realms.js
- `App()` --indirect_call--> `overridesVersion()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --indirect_call--> `subscribe()`  [INFERRED]
  src/App.jsx → src/dev/contentOverrides.js
- `App()` --calls--> `useUiClickSfx()`  [EXTRACTED]
  src/App.jsx → src/hooks/useUiClickSfx.js
- `App()` --calls--> `useUiHoverSfx()`  [EXTRACTED]
  src/App.jsx → src/hooks/useUiHoverSfx.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]

## Communities (40 total, 21 thin omitted)

### Community 0 - "CertificateScreen.jsx"
Cohesion: 0.31
Nodes (8): CertificateScreen(), ICONS, makeRandom(), roughCircle(), seedFrom(), StampBadge(), activePledge(), REALM_BY_ID

### Community 1 - "contentOverrides.js"
Cohesion: 0.11
Nodes (33): App(), INTRO_BEATS, REALM_TOUR, ROOM_TOUR, clearOverrides(), collectEditable(), collectScreenEditable(), EDITABLE_KEYS (+25 more)

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.09
Nodes (23): ChoiceCard(), DialogueCard(), PlatformerStoryRealm(), RealmArt(), SCENES, EXTRA_BEAT_ORDER, GAMES, ReportBlock() (+15 more)

### Community 3 - "passworldArt.js"
Cohesion: 0.14
Nodes (28): ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker(), drawImpostor() (+20 more)

### Community 4 - "realms.js"
Cohesion: 0.12
Nodes (17): balanceHigher, balanceLower, bandViewRaw(), bullybogHigher, bullybogLower, fableFallsHigher, fableFallsLower, getBandView() (+9 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 6 - "AtlasGate.jsx"
Cohesion: 0.16
Nodes (8): AtlasGate(), DIARY_COPY, BY_NAME, CharacterArt(), Comet(), IntroStory(), TravelerRoom(), applyScreenOverrides()

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (16): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+8 more)

### Community 8 - "audioSettings.js"
Cohesion: 0.12
Nodes (23): RealmScreen(), SettingsPanel(), useAudioSettings(), useUiClickSfx(), useUiHoverSfx(), clamp01(), DEFAULTS, getVolumes() (+15 more)

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "Cyber Wellness Quest — Design Document"
Cohesion: 0.12
Nodes (16): 10. Motion & Animation Direction, 1. Concept Summary, 2. Design Direction & Rationale, 3. Token System, 4. Screen Flow, 5. Interaction Patterns, 6. Component Inventory (for the eventual React build), 7. State & Data Model (rough shape) (+8 more)

### Community 13 - "steppingStonesArt.js"
Cohesion: 0.14
Nodes (17): motionTween(), prefersReducedMotion(), ART_MANIFEST, buildSteppingStonesArt(), drawBackdrop(), drawFogBank(), drawWisp(), generate() (+9 more)

### Community 14 - "Checklist"
Cohesion: 0.33
Nodes (5): Checklist, Done, Log, To do, Working Plan & Change Log

### Community 15 - "App.jsx"
Cohesion: 0.26
Nodes (7): CharacterSelect(), OPTIONS, JournalProgress(), REALM_ICONS, MainScreen(), SchoolLogo(), ACTIVE_REALMS

### Community 16 - "AtlasMap.jsx"
Cohesion: 0.20
Nodes (7): ATLAS_TOUR, AtlasMap(), BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, orderedActiveRealms()

### Community 18 - "TravelerRoom.jsx"
Cohesion: 0.12
Nodes (19): RealmIntro(), SettingsMenu(), BOUNDS, DIARY_SPOT, DOOR_SPOT, SPAWN, Tutorial(), isInputLocked() (+11 more)

### Community 19 - "BeachScene.jsx"
Cohesion: 0.22
Nodes (6): MiniGameBalance(), BEACH_OBSTACLES, BeachScene(), HAMMOCK_SPOT, PROPS, SEESAW_SPOT

### Community 20 - "ArtPreview.jsx"
Cohesion: 0.33
Nodes (4): SPA Root Mount Point, REALMS, ArtPreview(), MOODS

### Community 21 - "useProgress.js"
Cohesion: 0.73
Nodes (5): freshRealmProgress(), initialState(), load(), reducer(), useProgress()

## Knowledge Gaps
- **129 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playSfx()` connect `audioSettings.js` to `RealmScreen.jsx`, `passworldArt.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `DialogueCard()` connect `RealmScreen.jsx` to `AtlasMap.jsx`, `CertificateScreen.jsx`, `AtlasGate.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `World()` connect `TravelerRoom.jsx` to `AtlasMap.jsx`, `RealmScreen.jsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CopyEditor()` (e.g. with `overridesVersion()` and `subscribe()`) actually correct?**
  _`CopyEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contentOverrides.js` be split into smaller, more focused modules?**
  _Cohesion score 0.112375533428165 - nodes in this community are weakly interconnected._
- **Should `RealmScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09175377468060394 - nodes in this community are weakly interconnected._