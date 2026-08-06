# Graph Report - D:\Users\ryson\Documents\GitHub\cyberwellness-game  (2026-08-06)

## Corpus Check
- 31 files · ~22,040 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 211 nodes · 310 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.7)
- Token cost: 78,576 input · 0 output

## Community Hubs (Navigation)
- Realm Content & Story Components
- Design Spec & Godot Port Docs
- Realm Lore & Mini-Game Design
- Atlas Map & Realm Art Scenes
- App Shell & Progress State
- Vite Build Scripts
- Persistence, Accessibility & Managers
- Visual Design System
- React Runtime Dependencies
- Realm Screen & Mini-Games
- Walkable Scene Coordinate Rules
- Traveler Walk System
- No-Fear Choice Framing
- Graphify Integration
- Traveler Character

## God Nodes (most connected - your core abstractions)
1. `Component inventory for the React build` - 10 edges
2. `REALMS` - 7 edges
3. `The Atlas (internet as a map)` - 7 edges
4. `Sort mechanic (two labeled bins)` - 7 edges
5. `Password Fortress platformer (Passworld)` - 7 edges
6. `Cross the Fog stepping-stone run (Privacy Peaks)` - 7 edges
7. `useProgress()` - 6 edges
8. `StampBadge()` - 6 edges
9. `Signature element: the ink stamp badge` - 6 edges
10. `Suggested build order (cheapest mechanic first)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Cross the Fog stepping-stone run (Privacy Peaks)` --semantically_similar_to--> `Spot mechanic (tap flagged items)`  [INFERRED] [semantically similar]
  godot.md → design.md
- `REALMS` --shares_data_with--> `The Atlas (internet as a map)`  [INFERRED]
  src/data/realms.js → storyline.md
- `ISLANDS` --implements--> `The Atlas (internet as a map)`  [INFERRED]
  src/components/AtlasMap.jsx → storyline.md
- `Comet()` --implements--> `Comet (paper-airplane guide)`  [EXTRACTED]
  src/components/Characters.jsx → storyline.md
- `Decision point pattern (two choice cards, no dead end)` --semantically_similar_to--> `No fail state / warm redirect`  [INFERRED] [semantically similar]
  design.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The four-realm Atlas journey (topic, mini-game, stamp per realm)** — readme_atlas, readme_passworld, readme_privacy_peaks, readme_bully_bog, readme_balance_bay, readme_passport_stamp, readme_wise_traveler_certificate [EXTRACTED 1.00]
- **Scene art / walkable ground agreement contract** — readme_world_scene_coordinate_rule, readme_solid_ground_rule, readme_no_floating_props_rule, readme_scene_contact_sheet, design_scene_construction, godot_walk_system_port [EXTRACTED 1.00]
- **Godot autoload + JSON-content architecture borrowed from the example doc** — godot_json_content_pattern, godot_journey_manager, godot_stamp_manager, godot_project_layout, godot_realm_anatomy, godot_example_doc [EXTRACTED 1.00]
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]

## Communities (17 total, 3 thin omitted)

### Community 0 - "Realm Content & Story Components"
Cohesion: 0.13
Nodes (20): AtlasGate(), CertificateScreen(), BY_NAME, CharacterArt(), Comet(), DialogueCard(), JournalProgress(), ICONS (+12 more)

### Community 1 - "Design Spec & Godot Port Docs"
Cohesion: 0.10
Nodes (26): Hub layout: The Atlas, AtlasMap component, CertificateScreen component, ChoiceCard component, Component inventory for the React build, Concept summary: single-sitting Atlas journey, Decision point pattern (two choice cards, no dead end), DialogueCard component (+18 more)

### Community 2 - "Realm Lore & Mini-Game Design"
Cohesion: 0.13
Nodes (24): Sort mechanic (two labeled bins), Suggested build order (cheapest mechanic first), Keeper Vex (Passworld character), Balance the Day (Balance Bay, unchanged), Password Fortress platformer (Passworld), Cross the Fog stepping-stone run (Privacy Peaks), Clear the Water sort (Bully Bog, unchanged), Open questions (save, audio, milestone scope, difficulty, stone count) (+16 more)

### Community 3 - "Atlas Map & Realm Art Scenes"
Cohesion: 0.08
Nodes (22): BEATS, AtlasMap(), GATE, ISLANDS, Fog(), Glimmer(), Pockets(), Vex() (+14 more)

### Community 4 - "App Shell & Progress State"
Cohesion: 0.18
Nodes (11): SPA Root Mount Point, App(), RealmArt(), SCENES, ArtPreview(), MOODS, freshRealmProgress(), initialState() (+3 more)

### Community 5 - "Vite Build Scripts"
Cohesion: 0.14
Nodes (13): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, dev (+5 more)

### Community 6 - "Persistence, Accessibility & Managers"
Cohesion: 0.19
Nodes (13): Accessibility & kid-safety UX notes, JournalProgress component, State & data model (travelerName, currentScreen, realmProgress), Technical constraints (artifact-era), Godot accessibility & kid-safety bar, journey_manager autoload, Principle 5: no login, no data collection, Local FileAccess save system (+5 more)

### Community 7 - "Visual Design System"
Cohesion: 0.19
Nodes (13): Rejected trope: warm-cream-and-serif AI default, Rejected trope: neon-cyberspace-on-black, Color token system (paper, ink, realm accents), Field-journal / passport metaphor, Signature element: the ink stamp badge, Motion budget: two spent moments only, Page-fold transition, StampBadge component (+5 more)

### Community 8 - "React Runtime Dependencies"
Cohesion: 0.15
Nodes (13): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+5 more)

### Community 9 - "Realm Screen & Mini-Games"
Cohesion: 0.23
Nodes (8): GAMES, REALM_ICONS, RealmScreen(), MiniGameBalance(), BIN_ICONS, MiniGameSort(), shuffle(), MiniGameSpot()

### Community 10 - "Walkable Scene Coordinate Rules"
Cohesion: 0.36
Nodes (9): Scene construction (section 9a): art must agree with walkable ground, Walk system port (useWalker.js to CharacterBody2D), Deviation: walkable world replaces card navigation, Rule 2: nothing solid floats above the band, requestAnimationFrame walk loop with clamped timestep, #art scene contact sheet (dev-only), Rule 1: solid ground across the whole walkable band, Walkable 2D realm scene (+1 more)

### Community 11 - "Traveler Walk System"
Cohesion: 0.43
Nodes (5): Traveler(), distance(), KEY_DIRS, useWalker(), World()

## Knowledge Gaps
- **34 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Component inventory for the React build` connect `Design Spec & Godot Port Docs` to `Realm Lore & Mini-Game Design`, `Persistence, Accessibility & Managers`, `Visual Design System`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `Sort mechanic (two labeled bins)` connect `Realm Lore & Mini-Game Design` to `Design Spec & Godot Port Docs`, `Walkable Scene Coordinate Rules`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Deviation: Balance as a third mini-game component` connect `Realm Lore & Mini-Game Design` to `Design Spec & Godot Port Docs`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `The Atlas (internet as a map)` (e.g. with `ISLANDS` and `REALMS`) actually correct?**
  _`The Atlas (internet as a map)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Realm Content & Story Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13118279569892474 - nodes in this community are weakly interconnected._
- **Should `Design Spec & Godot Port Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._