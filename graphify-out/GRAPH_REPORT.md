# Graph Report - cyberwellness-game  (2026-08-07)

## Corpus Check
- 11 files · ~8,187 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 92 nodes · 106 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b4a40cf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- Choice Card Component
- No-Fear Choice Framing
- Graphify Integration
- Traveler Character

## God Nodes (most connected - your core abstractions)
1. `Component inventory for the React build` - 9 edges
2. `Cyber Wellness Quest` - 7 edges
3. `Signature element: the ink stamp badge` - 6 edges
4. `Password Fortress platformer (Passworld)` - 6 edges
5. `Cross the Fog stepping-stone run (Privacy Peaks)` - 6 edges
6. `Suggested build order (cheapest mechanic first)` - 6 edges
7. `Cyber Wellness Quest — Godot port` - 5 edges
8. `The Atlas (internet as a map)` - 5 edges
9. `Field-journal / passport metaphor` - 5 edges
10. `Sort mechanic (two labeled bins)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Password Fortress platformer (Passworld)` --semantically_similar_to--> `Sort mechanic (two labeled bins)`  [INFERRED] [semantically similar]
  godot.md → design.md
- `Cross the Fog stepping-stone run (Privacy Peaks)` --semantically_similar_to--> `Spot mechanic (tap flagged items)`  [INFERRED] [semantically similar]
  godot.md → design.md
- `RealmState machine (idle to story to game to rule to stamped)` --semantically_similar_to--> `Screen flow: gate to Atlas to realms to finale`  [INFERRED] [semantically similar]
  godot.md → design.md
- `Principle 3: four mechanics, one per realm` --references--> `Sort mechanic (two labeled bins)`  [EXTRACTED]
  godot.md → design.md
- `HTML5 export as primary distribution target` --cites--> `Cyber Wellness Quest`  [EXTRACTED]
  godot.md → README.md

## Hyperedges (group relationships)
- **Godot autoload + JSON-content architecture borrowed from the example doc** — godot_json_content_pattern, godot_journey_manager, godot_stamp_manager, godot_project_layout, godot_realm_anatomy, godot_example_doc [EXTRACTED 1.00]
- **The Atlas Cast** — storyline_comet, storyline_keeper_vex, storyline_the_fog, storyline_pockets, storyline_the_glimmer, storyline_traveler [EXTRACTED 1.00]

## Communities (16 total, 4 thin omitted)

### Community 0 - "Realm Content & Story Components"
Cohesion: 0.67
Nodes (3): Finale: The Wise Traveler, Passport Stamps as Proof of Visit, The Traveler's Pledge

### Community 1 - "Design Spec & Godot Port Docs"
Cohesion: 0.21
Nodes (13): Hub layout: The Atlas, AtlasMap component, CertificateScreen component, ChoiceCard component, Component inventory for the React build, Decision point pattern (two choice cards, no dead end), DialogueCard component, RealmScreen component (+5 more)

### Community 2 - "Realm Lore & Mini-Game Design"
Cohesion: 0.33
Nodes (7): Spot mechanic (tap flagged items), MiniGameSpot component, Password Fortress platformer (Passworld), Cross the Fog stepping-stone run (Privacy Peaks), Principle 3: four mechanics, one per realm, Principle 2: the mechanic is the lesson, Revision note: replace bin-heavy mechanics

### Community 3 - "Atlas Map & Realm Art Scenes"
Cohesion: 0.20
Nodes (10): The Atlas (internet as a map), Prologue: The Atlas Gate, Realm 4: Balance Bay, Realm 3: Bully Bog, Keeper Vex, Realm 1: Passworld, Pockets the Frog, Realm 2: Privacy Peaks (+2 more)

### Community 4 - "App Shell & Progress State"
Cohesion: 0.20
Nodes (11): Concept summary: single-sitting Atlas journey, Decision: stay 2D, not 3D, HTML5 export as primary distribution target, Uploaded Godot example doc (e41a819a-cyberwellnessgamedesigndoc.md), Content lives in JSON, not GDScript, Godot 4 port design doc, Cyber Wellness Quest, Layout (+3 more)

### Community 5 - "Vite Build Scripts"
Cohesion: 0.29
Nodes (5): Cyber Wellness Quest — Godot port, Layout, Not done yet, Opening it, Running the checks without the editor

### Community 6 - "Persistence, Accessibility & Managers"
Cohesion: 0.40
Nodes (5): JournalProgress component, State & data model (travelerName, currentScreen, realmProgress), Technical constraints (artifact-era), journey_manager autoload, stamp_manager autoload

### Community 7 - "Visual Design System"
Cohesion: 0.21
Nodes (12): Rejected trope: warm-cream-and-serif AI default, Rejected trope: neon-cyberspace-on-black, Color token system (paper, ink, realm accents), Field-journal / passport metaphor, Signature element: the ink stamp badge, Motion budget: two spent moments only, Page-fold transition, StampBadge component (+4 more)

### Community 8 - "React Runtime Dependencies"
Cohesion: 0.40
Nodes (5): Accessibility & kid-safety UX notes, Godot accessibility & kid-safety bar, Open questions (save, audio, milestone scope, difficulty, stone count), Principle 5: no login, no data collection, Local FileAccess save system

### Community 9 - "Realm Screen & Mini-Games"
Cohesion: 0.40
Nodes (5): Keeper Vex (Passworld character), Balance the Day (Balance Bay, unchanged), Principle 4: nothing is a villain, The Fog (Privacy Peaks antagonist), The Glimmer (Balance Bay character)

### Community 10 - "Walkable Scene Coordinate Rules"
Cohesion: 0.50
Nodes (4): Sort mechanic (two labeled bins), MiniGameSort component, Scene construction (section 9a): art must agree with walkable ground, Walk system port (useWalker.js to CharacterBody2D)

### Community 11 - "Traveler Walk System"
Cohesion: 0.50
Nodes (4): Suggested build order (cheapest mechanic first), Clear the Water sort (Bully Bog, unchanged), Pockets (Bully Bog character), Traveler's Pledge (finale, four lines)

## Knowledge Gaps
- **24 isolated node(s):** `Running it`, `The four realms`, `Layout`, `Project history`, `Opening it` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Component inventory for the React build` connect `Design Spec & Godot Port Docs` to `Walkable Scene Coordinate Rules`, `Realm Lore & Mini-Game Design`, `Persistence, Accessibility & Managers`, `Visual Design System`?**
  _High betweenness centrality (0.354) - this node is a cross-community bridge._
- **Why does `Cyber Wellness Quest` connect `App Shell & Progress State` to `Vite Build Scripts`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `Sort mechanic (two labeled bins)` connect `Walkable Scene Coordinate Rules` to `Realm Lore & Mini-Game Design`, `Traveler Walk System`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **What connects `Running it`, `The four realms`, `Layout` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._