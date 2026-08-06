# Cyber Wellness Quest — Godot Port Design Doc

**Engine:** Godot 4.x (GDScript, 2D)
**Platform target:** HTML5 export first (this game is already a browser product — see README), native export optional later
**Audience:** Ages 7–12, single difficulty band (no grade split — unlike the Godot example doc this is based on, this game doesn't currently scale content by grade)
**Format:** 1 hub ("The Atlas") + 4 walkable realms, each a story beat → decision → mini-game → rule → stamp, ending in a certificate

This doc merges two sources:
- `design.md` / `storyline.md` / `src/data/realms.js` in this repo — the actual content, characters, tone rules, and visual system of **Cyber Wellness Quest** as it exists today (React/Vite, DOM-rendered 2D scenes).
- The uploaded Godot example doc (`e41a819a-cyberwellnessgamedesigndoc.md`) — a from-scratch Godot 4 architecture for a *different* concept (genre-per-level, MOE-mapped, grade-banded). Its **engineering patterns** (Autoload singletons, JSON-driven content, node choices per mechanic, performance/accessibility discipline) are reused below; its specific curriculum/level concepts are not, since this game already has its own four realms and its own mini-games.

No code has been written yet — this is the plan to build from.

---

## 1. Decision: stay 2D, not 3D

This doc directly answers the earlier "can we do 3D" question: **no, stay 2D**, for two independent reasons that both sources agree on:

1. The example doc's own performance section rules out 3D for this audience/hardware: keep particle/sprite counts modest, avoid heavy shaders, target the oldest laptop in the room, not the dev machine.
2. This game's identity *is* 2D paper-journal illustration (`design.md` §2–3) — flat vector scenes, a field-journal metaphor, an ink-stamp badge. 3D would fight the "internet as a place worth exploring, not a void" design rationale, not serve it.

Where extra visual depth is wanted, get it inside 2D: parallax background layers in each realm scene, a light shader for the "ink bleed" stamp pulse, particle-lite fog/water/tide effects (`GPUParticles2D`, capped counts). None of this requires a 3D renderer.

---

## 2. Design Principles (carried over, restated for Godot)

From `design.md` + `storyline.md`, unchanged in spirit, now as build constraints:

1. **No fail state.** The unsafe choice is never a game over — it triggers a warm redirect line from Comet and returns the player to the same decision. Godot implementation: decision scenes never `queue_free()` on the wrong pick; they just swap the dialogue label and re-enable the choice buttons.
2. **The mechanic is the lesson**, already true here (sort locked-vs-share info, spot the scam signals, sort kind-vs-unkind replies, balance the day) — preserve these four mechanics as-is rather than adopting the example doc's platformer/river/boss mechanics, which would require inventing new content this project doesn't have.
3. **Two mini-game shapes, reused with different content** (`design.md` §5): *Sort* (drag into two bins) and *Spot* (tap flagged items), plus the one bespoke mechanic, *Balance* (fill 6 day-slots, no single right answer). Keep exactly these three Godot mini-game scenes, data-driven per realm — don't grow a fourth mechanic per realm the way the example doc's 4-genre structure does.
4. **Nothing is a villain.** Keeper Vex, the Fog, the Glimmer are all misguided-not-malicious; dialogue tone must survive the port verbatim (see §5 for the actual line-by-line content).
5. **No login, no data collection**, already true (no accounts; only a first name held in memory). Godot save data (§8) must stay local-only, same as the example doc's Principle 5.
6. **Large tap targets, no timers, color+icon+text redundancy, `prefers-reduced-motion`-equivalent restraint** — carry `design.md` §8 forward as Godot's accessibility bar.

---

## 3. Content Map (unchanged from this repo — not MOE-remapped)

| Realm | Topic | Mechanic | Stamp |
|---|---|---|---|
| Passworld | Passwords & personal info | Sort — *Guard the Vault* | Key (gold) |
| Privacy Peaks | Strangers & scams online | Spot — *Clear the Fog* | Compass (teal) |
| Bully Bog | Cyberbullying & kindness | Sort — *Clear the Water* | Heart (coral) |
| Balance Bay | Screen time balance | Balance — *Balance the Day* | Sun (periwinkle) |

Realms are playable in any order from the Atlas hub; the finale (Traveler's Pledge + certificate) unlocks once all four stamps are earned — same flow as `design.md` §4, just re-hosted in Godot's scene tree instead of React state.

The example doc's grade-band toggle (P1–3 / P4–6) is **not** adopted — this game has one difficulty band by design. If a future grade split is wanted, `question_bank`-style JSON swapping (example doc §9) is the right pattern to borrow then, not now.

---

## 4. Realm Anatomy (applies to all four)

Every realm is one `.tscn` with the same internal state machine, driven by JSON content instead of hardcoded dialogue:

```
Realm.tscn
  World (Node2D)               # parallax bg layers + static scene art (TileMap or sprites)
  Traveler (CharacterBody2D)   # the player
  Hotspots (Node2D)            # Area2D per stop: story / decision / game / rule
  UI (CanvasLayer)
    DialogueCard (Control)
    ChoiceCard x2 (Control)
    MiniGame<Sort|Spot|Balance> (Control, instanced per realm's game.type)
  RealmState (Node, script)    # local state machine: idle → story → decision → game → rule → stamped
```

### 4.1 Walk system (ports `src/world/useWalker.js` directly)

The current walker is already exactly Godot's `CharacterBody2D` pattern: a 0–100 x/100 y world space per realm, clamped to a `bounds` rect, driven by **both** held-arrow-key/WASD movement and tap/click-to-walk-there, feeding one movement loop. Port plan:

- `bounds` and `spawn` per realm move from `realms.js`'s `world` block straight into each realm's JSON (see §7) — same four numbers (`minX/maxX/minY/maxY`) and same spawn `{x, y}`.
- Godot's `_physics_process` replaces the rAF loop; `Input.get_vector()` replaces the `KEY_DIRS` table; a clicked/tapped point sets a `target` Vector2 the body seeks toward, exactly mirroring `walkTo()`.
- World units (0–100) stay resolution-independent; convert to scene pixels with one scalar per realm the way `scene_y = world_y × 2.8` already does for the React version — the ratio just becomes a Godot scene-space conversion in `RealmState`.
- **Both authored-scene rules from `design.md` §9a carry over unchanged**, since they're about art/ground agreement, not the renderer: (1) solid ground across the walkable band in both "before" and "after" moods, (2) nothing solid drawn above the band, since there's still no depth sorting need — the Traveler always draws on top, same as today.

### 4.2 Hotspots (ports the `stops: { story, decision, game, rule }` pattern)

Each realm's four named stops (e.g. Passworld: Keeper Vex at `(68,72)`, the vault doors at `(20,78)`) become `Area2D` nodes with a label + action verb, matching today's "walk up, press Space/Enter, or tap the prompt" interaction. `RealmState` enables only the hotspot relevant to the current phase, same gating the React `RealmScreen` does today.

---

## 5. Realm-by-realm content (verbatim from `src/data/realms.js`, for the content-authoring pass)

This section exists so whoever builds the JSON files isn't re-deriving dialogue from the React source — it's the actual shipped copy, unchanged.

### Passworld (gold · key)
- **Story:** Comet — *"Passworld! Every door here is a vault, and every vault has a keeper."* → Keeper Vex asks for full name, school, address, and password "just so I know you're trustworthy."
- **Decision:** Answer everything (unsafe → warm redirect: a stranger never needs your real info or password to prove anything) vs. *"I don't think I should share that with someone I just met."* (safe → Vex approves, lets you through).
- **Game — Sort, "Guard the Vault":** bins *Keep It Locked* / *Safe to Share*. Locked: home address, full name, school, password, phone number. Share: favourite colour, favourite game, nickname, hobby.
- **Rule:** name/address/school/password stay locked; colour/nickname/games are fine to share; a real adult never needs your password.

### Privacy Peaks (teal · compass)
- **Story:** Comet warns fog hides who's really messaging you. "The Fog" sends a message: won a free tablet, click fast, "whats ur address so we can send it lol."
- **Decision:** Click the link (unsafe → nothing good happens, three scam signs at once) vs. *"That looks like a scam. I'm not clicking, and I'll tell a trusted adult."* (safe → fog clears).
- **Game — Spot, "Clear the Fog":** 6 tappable messages, 4 flagged (prize you didn't enter, artificial urgency, address request, "meet at the park, don't tell your parents"), 2 not flagged (plain hello, favourite-game question — reinforces that not every stranger message is a trap).
- **Rule:** don't guess through fog — rushing, prizes, address requests, and secrecy asks are the four signs; stop, don't reply, show a trusted adult.

### Bully Bog (coral · heart)
- **Story:** Pockets is singing; a comment appears — *"nobody wants to hear this, go away"* — and two other bog creatures start typing, looking at the player.
- **Decision:** *"yeah that was bad"* (unsafe → water darkens, Pockets sinks lower — "that made it heavier for Pockets, not lighter") vs. *"That wasn't kind. I liked your song, Pockets."* (safe → water clears, Pockets thanks the Traveler).
- **Game — Sort, "Clear the Water":** bins *Send It* / *Leave It*. Send: 4 kind/neutral lines. Leave: 4 unkind lines ("nobody wants to hear this," "we're not inviting you next time," etc.).
- **Rule:** same rule applies if it's about you — don't respond mean-for-mean, save it, show a trusted adult; standing up can be one kind sentence.

### Balance Bay (periwinkle · sun)
- **Story:** the tide is too high — "that'll be the Glimmer." The Glimmer: *"Stay a little longer! One more round… time doesn't really pass here, promise."* Friends are waiting at a bonfire down the beach.
- **Decision:** *"Just a little longer."* (unsafe → Glimmer brighter, bonfire dims — "it's just very good at being fun, and it says that every single time") vs. *"I've had a good amount of time here — I'm heading to the bonfire."* (safe → tide recedes, bonfire warms).
- **Game — Balance, "Balance the Day":** 6 slots to fill from 10 cards (4 screen: videos, game, group chat, video call; 6 non-screen: homework, outside, dinner, book, sleep, help at home). No single correct split — only all-screen or no-screen trip a verdict message; a level mix reads as "that's the whole trick."
- **Rule:** screens aren't the enemy, losing track is — decide your stop time before you start, keep room for sleep, movement, and people.

**Traveler's Pledge (finale, one line per realm, in the child's own voice):**
1. "I'll keep my personal info to myself."
2. "I'll stop and think before I click."
3. "I'll be kind, and stand up for others."
4. "I'll balance my screen time with the rest of my day."

---

## 6. Mini-game → Godot node mapping

| Mechanic | Used in | Godot approach |
|---|---|---|
| **Sort** | Passworld, Bully Bog | Draggable `Control`/`TextureRect` cards (custom `draggable.gd`, same pattern as the example doc's Level 3), two `Area2D`- or `Control`-based drop zones. Immediate per-item feedback, not end-of-round scoring — matches `design.md`'s "no score pressure." |
| **Spot** | Privacy Peaks | A vertical list of tappable message `Control` nodes; tap toggles a "flagged" state with an icon + the item's `note` text shown, not just a color change (accessibility rule: color is never the only signal). |
| **Balance** | Balance Bay | 6 empty slot `Control`s + a card tray; tapping a card fills the next open slot, tapping a filled slot returns it to the tray. A `verdict.gd` script checks the screen/non-screen ratio against the three verdict strings already written (`allScreen` / `noScreen` / `level`) and nudges a "tide" sprite's height via `Tween`. |

None of these need physics bodies or collision — all are `Control`-based UI mini-games layered in a `CanvasLayer` above the walkable realm, exactly like the current DOM overlay approach.

---

## 7. Data & Autoload singletons (borrowed pattern from the example doc)

The example doc's strongest idea, worth taking wholesale: **content lives in JSON, not GDScript**, and cross-scene state lives in Autoload singletons rather than being re-wired per scene.

```
res://
  scenes/
    atlas_gate.tscn        # name entry, meet Comet — ports AtlasGate.jsx
    atlas_map.tscn         # hub, 4 realm nodes + stamp progress — ports AtlasMap.jsx
    realm_passworld.tscn
    realm_privacy.tscn
    realm_bullybog.tscn
    realm_balance.tscn
    certificate.tscn       # finale — ports CertificateScreen.jsx
  scripts/
    traveler_controller.gd # ports useWalker.js
    realm_state.gd         # per-realm story→decision→game→rule→stamp machine
    minigame_sort.gd
    minigame_spot.gd
    minigame_balance.gd
    journey_manager.gd     # Autoload: traveler name, current screen, realmProgress dict
    stamp_manager.gd       # Autoload: which stamps are earned, drives JournalProgress UI
  data/
    passworld.json
    privacy.json
    bullybog.json
    balance.json
    pledge.json
  assets/
    sprites/                # realm scene art, Traveler, Comet, Keeper Vex, Pockets, etc.
    audio/
    fonts/                  # Baloo 2 (display), Nunito (body), Space Mono (stamp/label) — same three families as design.md §3
```

`journey_manager` + `stamp_manager` together are this project's equivalent of the example doc's `grade_manager` + `badge_manager` — same reason to set them up first: every realm scene needs to read "what's been earned so far" without re-wiring signals scene-to-scene.

`realmProgress` shape carries over unchanged from `design.md` §7:

```gdscript
# journey_manager.gd (Autoload)
var traveler_name: String = ""
var realm_progress: Dictionary = {
    "passworld": {"story_done": false, "choice_made": "", "stamped": false},
    "privacy":   {"story_done": false, "choice_made": "", "stamped": false},
    "bullybog":  {"story_done": false, "choice_made": "", "stamped": false},
    "balance":   {"story_done": false, "choice_made": "", "stamped": false},
}
```

---

## 8. Save system

Unlike the React version (in-memory only, "artifacts cannot use browser storage"), a Godot build is a real client and can persist for free — a genuine upgrade from the port, not scope creep, since it directly serves the "resume where you left off" need. Use `FileAccess` to write a small local JSON save (`user://` path): traveler name, stamps earned. No accounts, no server, nothing beyond what's already collected today (a first name) — keeps Principle 5 intact while fixing a real limitation of the current artifact-hosted version.

---

## 9. Visual system → Godot equivalents

Port `design.md` §3 token-for-token rather than reinterpreting it:

| Token | Value | Godot equivalent |
|---|---|---|
| `paper` | `#F1F5F6` | Theme `panel` background |
| `ink` / `ink-soft` | `#1F3452` / `#5C7185` | Theme font colors |
| gold / teal / coral / periwinkle | realm accents | per-realm `Theme` override or a `realm_accent` export var read by shared UI scenes |
| Display font | Baloo 2 | `DynamicFont` resource, titles/headers only |
| Body font | Nunito | `DynamicFont`, 18–20px equivalent |
| Stamp/label font | Space Mono | `DynamicFont`, stamps/pins/badges only — same rule: never leaks into body copy |

**The ink stamp badge** (`design.md`'s one signature "wow" moment) ports as: a `Sprite2D`/`Polygon2D` circle with slight per-vertex jitter (baked once, not runtime-random, to match "randomized once per session"), realm accent color, icon, and a `Space Mono` label following the circle's lower arc via `Path2D` + `PathFollow2D`. Random rotation ±6° set once on stamp-earned, not re-rolled.

**Motion budget** (`design.md` §10) — spend animation on exactly two moments, same restraint:
1. Stamp thunk: `AnimationPlayer` — scale-in + slight rotate + a quick shader-based "ink bleed" pulse.
2. Hub↔realm transition: a page-fold `AnimationPlayer` clip, ~250–300ms, skippable/instant if Godot's `OS.is_userfs_persistent()`-style reduced-motion equivalent is ever added (no direct engine equivalent to `prefers-reduced-motion` — would need a manual settings toggle if this matters enough to add).

Everything else (choice cards, mini-game feedback) stays quick opacity/scale tweens (~150ms), nothing bouncy, so it doesn't compete with the two signature moments — same rule as today.

---

## 10. Accessibility & kid-safety (unchanged bar, restated as Godot constraints)

- Minimum ~48px-equivalent tap targets throughout (touch-first, per current README's tap/click-to-walk support).
- No timers, no fail states — every mini-game and decision is freely retryable.
- Every mini-game has a text instruction line, not icon-only (already true of all three `game.instruction` strings in §5).
- Safe/unsafe and flagged/unflagged states always pair color with text + icon.
- No personal data requested beyond the in-session first name; Godot save (§8) never adds more.

---

## 11. Distribution

This is a browser game today (`npm run dev` / static `dist/` build, per README) with no offline/classroom-deployment requirement described anywhere in this repo's docs — unlike the example doc's school-laptop/.exe scenario, which doesn't apply here unless the audience changes. **HTML5 export is the primary target**, matching current distribution. A native export is easy to add later from the same project if a school/offline use case shows up, but nothing here should be built around requiring it.

Performance targets stay conservative regardless (per §1): modest sprite/particle counts, test on a modest machine before calling any realm done, not just a dev machine.

---

## 12. Suggested build order

1. **Foundation:** `journey_manager` + `stamp_manager` Autoloads, `atlas_gate.tscn` (name entry, meet Comet), `atlas_map.tscn` hub with 4 realm nodes + stamp dots (locked/unlocked art only, no realms wired yet).
2. **One full realm vertical slice — Passworld first** (already the simplest: one decision, one Sort game, no bespoke mechanic). Proves the walk system, hotspot gating, dialogue card, decision card, Sort mini-game, stamp thunk, and page-fold transition all at once. → **Playtest checkpoint** before touching the other three.
3. **Bully Bog** — reuses the Sort mini-game verbatim with new content; validates that realm data is fully JSON-driven with no code changes needed for a second Sort realm.
4. **Privacy Peaks** — introduces the Spot mini-game.
5. **Balance Bay** — introduces the bespoke Balance mini-game (the one mechanic without a precedent in the example doc, so budget it its own design pass on the tide-tween feel).
6. **Finale:** certificate screen + Traveler's Pledge, unlock-at-4-stamps gating.
7. **Polish pass:** stamp jitter/rotation baking, page-fold timing, audio (currently absent from the React version — optional addition, not required for parity).
8. **Export:** HTML5 export, test in an actual browser (not just the Godot editor's embedded preview) before calling it done.

---

## 13. Open questions (for you, not decided here)

- **Save system:** add persistence (§8) as part of the port, or intentionally keep it session-only to match the current product's privacy stance as closely as possible?
- **Audio:** the current game is silent (no audio system in `src/`). Add narration/SFX in the Godot version, or keep it silent for parity?
- **Scope of the first milestone:** build all four realms before anything is playable end-to-end, or ship the Passworld vertical slice (step 2 above) as a standalone demo first?

---

## 14. Reference

- This repo: `design.md`, `storyline.md`, `src/data/realms.js`, `src/world/useWalker.js`, `README.md`.
- Uploaded example: Godot 4 architecture patterns (Autoload singletons, JSON content, node-per-mechanic choices, performance/accessibility discipline) — curriculum/level specifics from that doc are not used here.
