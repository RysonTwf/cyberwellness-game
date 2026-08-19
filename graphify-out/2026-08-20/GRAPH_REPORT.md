# Graph Report - .  (2026-08-19)

## Corpus Check
- 7 files · ~55,435 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 290 nodes · 484 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.62)
- Token cost: 148,948 input · 0 output

## Community Hubs (Navigation)
- Curriculum Scope & Band Split
- Mechanics, Assets & Build Phases
- Atlas Hub, Progress & Realm Data
- Passworld Vault Level & Art
- Dependencies & Build Config
- Gate, Characters & Stamp Chrome
- Traveler Room & Walk System
- Phaser Mini-Game Wrappers
- Realm Scene Illustration
- Realm Screen & React Mini-Games
- Sort Mechanic
- graphify Workflow
- Playtest & Launch
- Step Panel Portal

## God Nodes (most connected - your core abstractions)
1. `fillRR()` - 12 edges
2. `Fable Falls Realm` - 11 edges
3. `circle()` - 9 edges
4. `Realm Plan by Band` - 9 edges
5. `Platformer Mechanic (Guard the Vault: Level Up)` - 8 edges
6. `A Mini-Game Must Not Be Passable Without Judgement` - 8 edges
7. `Asset Pipeline Folder Skeleton` - 8 edges
8. `Term 1 - Healthy Digital Habits` - 7 edges
9. `Stepping-Stone Decision Run` - 7 edges
10. `Cyber Wellness Quest (App)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `The Echo` --semantically_similar_to--> `The Fog`  [INFERRED] [semantically similar]
  Cyber_Wellness_Quest_Improvement_Plan.md → storyline.md
- `Asset Pipeline Folder Skeleton` --references--> `3 Tips to CHECK (Unsourced SLS Content)`  [EXTRACTED]
  assets/README.md → Cyber_Wellness_Quest_Improvement_Plan.md
- `Fixed Viewport, No Page Scrolling` --conceptually_related_to--> `Walkable Realm Scene`  [INFERRED]
  Cyber_Wellness_Quest_Milestones.md → README.md
- `Cyber Wellness Quest (App)` --cites--> `The Atlas Concept`  [EXTRACTED]
  README.md → design.md
- `Per-Band Realm Content Schema` --implements--> `P1-P3 / P4-P6 Band Split`  [EXTRACTED]
  Cyber_Wellness_Quest_Milestones.md → Cyber_Wellness_Quest_Improvement_Plan.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fable Falls Realm Delivery** — cyber_wellness_quest_improvement_plan_fable_falls, cyber_wellness_quest_improvement_plan_stop_and_check, cyber_wellness_quest_improvement_plan_sure_framework, cyber_wellness_quest_improvement_plan_cyber_defender_quest, cyber_wellness_quest_improvement_plan_the_echo, cyber_wellness_quest_milestones_compare_mechanic, cyber_wellness_quest_improvement_plan_fifth_pledge_line [EXTRACTED 1.00]
- **Judgement Rule Applied Across the Five Mini-Games** — cyber_wellness_quest_milestones_judgement_design_rule, design_sort_mechanic, design_spot_mechanic, design_balance_mechanic, cyber_wellness_quest_milestones_stepping_stones_mechanic, cyber_wellness_quest_milestones_platformer_mechanic, cyber_wellness_quest_milestones_vault_door_gate [EXTRACTED 1.00]
- **Phaser Art Manifest and Skin Swap Pipeline** — cyber_wellness_quest_milestones_art_manifest, cyber_wellness_quest_milestones_skin_system, cyber_wellness_quest_milestones_brackeys_cc0_skin, cyber_wellness_quest_milestones_platformer_mechanic, cyber_wellness_quest_milestones_asset_pipeline, assets_readme_specs_table [EXTRACTED 1.00]

## Communities (16 total, 3 thin omitted)

### Community 0 - "Curriculum Scope & Band Split"
Cohesion: 0.07
Nodes (49): Asset Folder & Naming Convention, Band Differentiation as Design Enrichment, P1-P3 / P4-P6 Band Split, Digital Footprint / Positive Digital Trail, Engage and Support, Fable Falls Realm, Fifth Traveler's Pledge Line, Final Recap Experience (+41 more)

### Community 1 - "Mechanics, Assets & Build Phases"
Cohesion: 0.07
Nodes (42): Asset Pipeline Folder Skeleton, Asset Specs Table, Cyber Defender Quest, P4-5 vs P4-6 Resolution, STOP & CHECK Method (P1-P3), S.U.R.E. Framework (P4-P6), Term 3 - Fake News and Images, Reduced-Motion Coverage Gap (+34 more)

### Community 2 - "Atlas Hub, Progress & Realm Data"
Cohesion: 0.07
Nodes (32): App(), AtlasMap(), BAND_INFO, BRANCH_CTRL, GATE, GATE_SVG, ISLANDS, CertificateScreen() (+24 more)

### Community 3 - "Passworld Vault Level & Art"
Cohesion: 0.14
Nodes (28): ART_ANIMS, ART_MANIFEST, buildPassworldArt(), BUILTIN_PLAYER_BODY, circle(), drawGate(), drawHacker(), drawImpostor() (+20 more)

### Community 4 - "Dependencies & Build Config"
Cohesion: 0.07
Nodes (28): @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono, lucide-react, dependencies, @fontsource/baloo-2, @fontsource/nunito, @fontsource/space-mono (+20 more)

### Community 5 - "Gate, Characters & Stamp Chrome"
Cohesion: 0.15
Nodes (13): AtlasGate(), BANDS, BEATS, BY_NAME, CharacterArt(), Comet(), DialogueCard(), ICONS (+5 more)

### Community 6 - "Traveler Room & Walk System"
Cohesion: 0.13
Nodes (11): BOUNDS, DIARY_SPOT, DOOR_SPOT, SPAWN, Boat(), RoomScene(), Traveler(), distance() (+3 more)

### Community 7 - "Phaser Mini-Game Wrappers"
Cohesion: 0.18
Nodes (10): ChoiceCard(), PlatformerStoryRealm(), ReportBlock(), StampMoment(), MiniGamePlatformer(), MiniGameSteppingStones(), makePasswordFortressLevelConfig(), makePasswordFortressConfig() (+2 more)

### Community 8 - "Realm Scene Illustration"
Cohesion: 0.14
Nodes (6): SPA Root Mount Point, RealmArt(), SCENES, REALMS, ArtPreview(), MOODS

### Community 9 - "Realm Screen & React Mini-Games"
Cohesion: 0.28
Nodes (6): EXTRA_BEAT_ORDER, GAMES, REALM_ICONS, RealmScreen(), MiniGameCompare(), MiniGameSpot()

### Community 10 - "Sort Mechanic"
Cohesion: 0.67
Nodes (3): BIN_ICONS, MiniGameSort(), shuffle()

## Knowledge Gaps
- **58 isolated node(s):** `REALM_ICONS`, `GAMES`, `EXTRA_BEAT_ORDER`, `passworldLower`, `passworldHigher` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DialogueCard()` connect `Gate, Characters & Stamp Chrome` to `Atlas Hub, Progress & Realm Data`, `Phaser Mini-Game Wrappers`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Fable Falls Realm` connect `Curriculum Scope & Band Split` to `Mechanics, Assets & Build Phases`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `REALM_ICONS`, `GAMES`, `EXTRA_BEAT_ORDER` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Curriculum Scope & Band Split` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Mechanics, Assets & Build Phases` be split into smaller, more focused modules?**
  _Cohesion score 0.07317073170731707 - nodes in this community are weakly interconnected._
- **Should `Atlas Hub, Progress & Realm Data` be split into smaller, more focused modules?**
  _Cohesion score 0.07435897435897436 - nodes in this community are weakly interconnected._
- **Should `Passworld Vault Level & Art` be split into smaller, more focused modules?**
  _Cohesion score 0.14193548387096774 - nodes in this community are weakly interconnected._