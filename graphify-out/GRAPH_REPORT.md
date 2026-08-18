# Graph Report - cyberwellness-game  (2026-08-18)

## Corpus Check
- 41 files · ~37,087 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 215 nodes · 363 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7f09726f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RealmArt.jsx
- StampBadge.jsx
- RealmScreen.jsx
- Characters.jsx
- realms.js
- dependencies
- package.json
- Cyber Wellness Quest — Milestones & Team Workstreams
- useProgress.js
- Cyber Wellness Quest — Improvement Plan (Living Doc)
- ArtPreview.jsx
- Asset pipeline
- MiniGamePlatformer.jsx

## God Nodes (most connected - your core abstractions)
1. `Cyber Wellness Quest — Milestones & Team Workstreams` - 12 edges
2. `React Component Inventory` - 10 edges
3. `REALMS` - 9 edges
4. `Cyber Wellness Quest — Improvement Plan (Living Doc)` - 9 edges
5. `The Atlas (internet as a map)` - 9 edges
6. `DialogueCard()` - 8 edges
7. `StampBadge()` - 7 edges
8. `useProgress()` - 7 edges
9. `Design Token System` - 7 edges
10. `ACTIVE_REALMS` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ISLANDS` --implements--> `The Atlas (internet as a map)`  [INFERRED]
  src/components/AtlasMap.jsx → storyline.md
- `dev` --references--> `Cyber Wellness Quest (project overview)`  [EXTRACTED]
  package.json → README.md
- `App()` --implements--> `Screen Flow: Gate to Atlas to Realm to Stamp`  [INFERRED]
  src/App.jsx → design.md
- `REALMS` --shares_data_with--> `Per-Realm Accent Colors`  [INFERRED]
  src/data/realms.js → design.md
- `REALMS` --shares_data_with--> `The Atlas (internet as a map)`  [INFERRED]
  src/data/realms.js → storyline.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]
- **No-Fail Kid-Safety Stance** — design_no_fail_states, design_accessibility_notes, storyline_no_fear_framing, storyline_reversible_choices [INFERRED 0.85]

## Communities (14 total, 1 thin omitted)

### Community 0 - "RealmArt.jsx"
Cohesion: 0.10
Nodes (21): graphify Knowledge-Graph Workflow, Field-Journal / Passport Metaphor, Cyber Wellness Quest (project overview), Fog(), Glimmer(), Pockets(), Vex(), BayScene() (+13 more)

### Community 1 - "StampBadge.jsx"
Cohesion: 0.46
Nodes (7): Ink Stamp Badge (signature element), ICONS, makeRandom(), roughCircle(), seedFrom(), StampBadge(), Passport Stamps as Proof of Visit

### Community 2 - "RealmScreen.jsx"
Cohesion: 0.12
Nodes (23): Accessibility & Kid-Safety UX, React Component Inventory, Two-Moment Motion Budget, Only Two Mini-Game Mechanics, No Image Assets: SVG Shapes Only, Deviation: A Third Mini-Game, CharacterArt(), ChoiceCard() (+15 more)

### Community 3 - "Characters.jsx"
Cohesion: 0.14
Nodes (15): Point-and-Click Card Navigation, No Timers, No Fail States, No Score, requestAnimationFrame Walk Loop, Deviation: Walkable World, Not Cards, BY_NAME, Comet(), Traveler(), distance() (+7 more)

### Community 4 - "realms.js"
Cohesion: 0.09
Nodes (32): Per-Realm Accent Colors, Screen Flow: Gate to Atlas to Realm to Stamp, App(), AtlasGate(), BANDS, BEATS, AtlasMap(), GATE (+24 more)

### Community 5 - "dependencies"
Cohesion: 0.12
Nodes (18): Rejecting Neon-Cyberspace Visuals, Single-File Artifact Constraints, Design Token System, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies (+10 more)

### Community 6 - "package.json"
Cohesion: 0.14
Nodes (13): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, dev (+5 more)

### Community 7 - "Cyber Wellness Quest — Milestones & Team Workstreams"
Cohesion: 0.12
Nodes (15): Asset pipeline: placeholders & specs, Changelog, Cyber Wellness Quest — Milestones & Team Workstreams, Folder & naming convention, Phase 0 — Foundation (shared design system + content schema), Phase 1 — Content authoring (both bands, all 5 realms), Phase 2 — New mechanics, Phase 3 — Backgrounds: scaling the existing 9 (+7 more)

### Community 8 - "useProgress.js"
Cohesion: 0.47
Nodes (8): Realm Progress State Model, localStorage Persistence (cyber-wellness-quest/v1), Deviation: Vite App with Persistence, freshRealmProgress(), initialState(), load(), reducer(), useProgress()

### Community 10 - "Cyber Wellness Quest — Improvement Plan (Living Doc)"
Cohesion: 0.14
Nodes (13): 0. What this game is, 1. Source of truth: what the Overview Plan actually requires, 1a. How much does the source material actually differentiate by band?, 2. Consolidated content gaps (in priority order), 3. Realm plan by band, 4. Suggested play order (per band) — pacing, not calendar order, 5. Open items / needs from the team, 6. Changelog (+5 more)

### Community 11 - "ArtPreview.jsx"
Cohesion: 0.40
Nodes (3): SPA Root Mount Point, ArtPreview(), MOODS

### Community 13 - "MiniGamePlatformer.jsx"
Cohesion: 0.33
Nodes (5): MiniGamePlatformer(), MiniGameSteppingStones(), makePasswordFortressConfig(), makeSteppingStonesConfig(), PhaserMiniGame()

## Ambiguous Edges - Review These
- `Cyber Wellness Quest (project overview)` → `graphify Knowledge-Graph Workflow`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **57 isolated node(s):** `name`, `private`, `version`, `type`, `build` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Cyber Wellness Quest (project overview)` and `graphify Knowledge-Graph Workflow`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `REALMS` connect `realms.js` to `RealmArt.jsx`, `useProgress.js`, `ArtPreview.jsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `No Image Assets: SVG Shapes Only` connect `RealmScreen.jsx` to `RealmArt.jsx`, `dependencies`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `Cyber Wellness Quest (project overview)` connect `RealmArt.jsx` to `RealmScreen.jsx`, `package.json`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `REALMS` (e.g. with `Per-Realm Accent Colors` and `The Atlas (internet as a map)`) actually correct?**
  _`REALMS` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `The Atlas (internet as a map)` (e.g. with `Field-Journal / Passport Metaphor` and `ISLANDS`) actually correct?**
  _`The Atlas (internet as a map)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._