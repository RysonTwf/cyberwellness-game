# Graph Report - .  (2026-08-06)

## Corpus Check
- Corpus is ~16,658 words - fits in a single context window. You may not need a graph.

## Summary
- 146 nodes · 261 edges · 10 communities
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Realm World & Scene Art
- Story Script & Dialogue Screens
- Mini-Games & Realm Screen
- Walkable World Movement
- App Shell & Entry Point
- Design Tokens & Fonts
- Package Manifest & Scripts
- Stamp Badge & Motion
- Progress State & Persistence

## God Nodes (most connected - your core abstractions)
1. `React Component Inventory` - 10 edges
2. `REALMS` - 9 edges
3. `The Atlas (internet as a map)` - 9 edges
4. `DialogueCard()` - 7 edges
5. `StampBadge()` - 7 edges
6. `useProgress()` - 7 edges
7. `Design Token System` - 7 edges
8. `World()` - 6 edges
9. `Ink Stamp Badge (signature element)` - 6 edges
10. `Comet()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `REALMS` --shares_data_with--> `Per-Realm Accent Colors`  [INFERRED]
  src/data/realms.js → design.md
- `dev` --references--> `Cyber Wellness Quest (project overview)`  [EXTRACTED]
  package.json → README.md
- `ISLANDS` --implements--> `The Atlas (internet as a map)`  [INFERRED]
  src/components/AtlasMap.jsx → storyline.md
- `REALMS` --shares_data_with--> `The Atlas (internet as a map)`  [INFERRED]
  src/data/realms.js → storyline.md
- `@fontsource/baloo-2` --implements--> `Design Token System`  [EXTRACTED]
  package.json → design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]
- **Documented Deviations from the Design Docs** — readme_walkable_world_deviation, readme_vite_app_deviation, readme_third_minigame_deviation [EXTRACTED 1.00]
- **No-Fail Kid-Safety Stance** — design_no_fail_states, design_accessibility_notes, storyline_no_fear_framing, storyline_reversible_choices [INFERRED 0.85]

## Communities (10 total, 0 thin omitted)

### Community 0 - "Realm World & Scene Art"
Cohesion: 0.10
Nodes (22): graphify Knowledge-Graph Workflow, Field-Journal / Passport Metaphor, Cyber Wellness Quest (project overview), ISLANDS, Fog(), Glimmer(), Pockets(), Vex() (+14 more)

### Community 1 - "Story Script & Dialogue Screens"
Cohesion: 0.18
Nodes (14): AtlasGate(), CertificateScreen(), BY_NAME, CharacterArt(), Comet(), DialogueCard(), JournalProgress(), PLEDGE (+6 more)

### Community 2 - "Mini-Games & Realm Screen"
Cohesion: 0.16
Nodes (15): Accessibility & Kid-Safety UX, React Component Inventory, Only Two Mini-Game Mechanics, Deviation: A Third Mini-Game, AtlasMap(), ChoiceCard(), GAMES, REALM_ICONS (+7 more)

### Community 3 - "Walkable World Movement"
Cohesion: 0.19
Nodes (11): Point-and-Click Card Navigation, No Timers, No Fail States, No Score, requestAnimationFrame Walk Loop, Deviation: Walkable World, Not Cards, GATE, Traveler(), distance(), KEY_DIRS (+3 more)

### Community 4 - "App Shell & Entry Point"
Cohesion: 0.14
Nodes (12): Single-File Artifact Constraints, Screen Flow: Gate to Atlas to Realm to Stamp, SPA Root Mount Point, lucide-react, lucide-react, No Image Assets: SVG Shapes Only, App(), BEATS (+4 more)

### Community 5 - "Design Tokens & Fonts"
Cohesion: 0.16
Nodes (14): Rejecting Neon-Cyberspace Visuals, Per-Realm Accent Colors, Design Token System, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, dependencies, @fontsource/baloo-2 (+6 more)

### Community 6 - "Package Manifest & Scripts"
Cohesion: 0.14
Nodes (13): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, dev (+5 more)

### Community 7 - "Stamp Badge & Motion"
Cohesion: 0.33
Nodes (9): Ink Stamp Badge (signature element), Two-Moment Motion Budget, ICONS, makeRandom(), roughCircle(), seedFrom(), StampBadge(), StampMoment() (+1 more)

### Community 8 - "Progress State & Persistence"
Cohesion: 0.47
Nodes (8): Realm Progress State Model, localStorage Persistence (cyber-wellness-quest/v1), Deviation: Vite App with Persistence, freshRealmProgress(), initialState(), load(), reducer(), useProgress()

## Ambiguous Edges - Review These
- `Cyber Wellness Quest (project overview)` → `graphify Knowledge-Graph Workflow`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **19 isolated node(s):** `name`, `private`, `version`, `type`, `build` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Cyber Wellness Quest (project overview)` and `graphify Knowledge-Graph Workflow`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `The Atlas (internet as a map)` connect `Realm World & Scene Art` to `Story Script & Dialogue Screens`, `App Shell & Entry Point`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `Cyber Wellness Quest (project overview)` connect `Realm World & Scene Art` to `App Shell & Entry Point`, `Package Manifest & Scripts`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `REALMS` connect `Story Script & Dialogue Screens` to `Realm World & Scene Art`, `Walkable World Movement`, `App Shell & Entry Point`, `Design Tokens & Fonts`, `Progress State & Persistence`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `REALMS` (e.g. with `Per-Realm Accent Colors` and `The Atlas (internet as a map)`) actually correct?**
  _`REALMS` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `The Atlas (internet as a map)` (e.g. with `Field-Journal / Passport Metaphor` and `ISLANDS`) actually correct?**
  _`The Atlas (internet as a map)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._