# Cyber Wellness Quest — Design Document

## 1. Concept Summary

A single-page interactive web game for kids aged 7-12, playable in one 20-30
minute sitting. The internet is reframed as **the Atlas** — a living map made
of "realms" the player travels through with a guide. Each realm teaches one
cyber wellness topic through a short story beat, a branching decision, and a
small hands-on mini-game. Progress is tracked with **stamps** collected in a
passport-style journal, ending in a personalized certificate.

## 2. Design Direction & Rationale

Two tropes dominate this space and both were deliberately avoided:

- **Neon-cyberspace-on-black.** The obvious "internet" visual (dark
  background, glowing green/blue circuits, matrix-style grid) reads as scary
  or hacker-coded, which works against the message that the internet is a
  place kids can explore *safely*, not a dangerous void.
- **Generic warm-cream-and-serif "AI design" default.** Flattens personality
  and doesn't fit an energetic kids' product anyway.

Instead the whole product is grounded in a **field-journal / passport**
metaphor: the player is a Traveler filling in a journal as they explore, and
every earned badge is a physical-feeling ink stamp, not a digital trophy
icon. This gives the internet a sense of a place worth exploring thoughtfully
(like a nature reserve you visit with a guide and a notebook) rather than a
void to fear or a screen to be babysat through.

## 3. Token System

### Color

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F1F5F6` | Base background — cool "journal page," not warm cream |
| `ink` | `#1F3452` | Primary text — deep fountain-pen navy, never pure black |
| `ink-soft` | `#5C7185` | Secondary text, captions |
| `gold` (Passworld) | `#E0A030` | Realm 1 accent — vault/key |
| `teal` (Privacy Peaks) | `#2D8C7F` | Realm 2 accent — misty lookout |
| `coral` (Bully Bog) | `#E0637A` | Realm 3 accent — warm, not alarming |
| `periwinkle` (Balance Bay) | `#7B6EF6` | Realm 4 accent — dusk/tide |

Each realm accent is used **only** inside that realm's screens and its stamp.
The hub and shared UI (buttons, nav) stay in `ink`/`paper` so the four realm
colors read as distinct "regions of the map," not a rainbow UI.

### Type

- **Display** — a rounded, friendly geometric face (e.g. *Baloo 2* or
  *Fredoka*) for titles and the traveler's journal headers. Used at large
  size only; never for body paragraphs.
- **Body** — a clean rounded sans (e.g. *Nunito*) at a large base size
  (18-20px) for readability at this age.
- **Stamp/Label** — a monospace or typewriter face (e.g. *Space Mono* or
  *IBM Plex Mono*) used only inside stamps, map pins, and badge labels — this
  is what sells the "passport ink stamp" signature and should not leak into
  body copy.

### Layout Concept

**Hub — "The Atlas"**
```
┌─────────────────────────────────────┐
│   Comet's greeting + journal icon    │
│                                       │
│      (map illustration, 4 islands    │
│       connected by a winding         │
│       "Stream" path)                 │
│                                       │
│   [Passworld]   [Privacy Peaks]      │
│   [Bully Bog]   [Balance Bay]        │
│                                       │
│   stamp progress: ○ ○ ○ ○            │
└─────────────────────────────────────┘
```

**Realm screen (story beat)**
```
┌─────────────────────────────────────┐
│  realm accent bar / icon             │
│                                       │
│   character art (shape-built)        │
│   "dialogue card"                    │
│                                       │
│   [choice card A]  [choice card B]   │
└─────────────────────────────────────┘
```

**Mini-game screen** — same header/accent bar, full-width interactive area
below (drag targets, sort bins, or tap targets depending on realm).

**Stamp moment** — full-bleed accent-colored flash, stamp graphic thunks
down at a slight rotation onto the journal, then screen returns to the Atlas
with the new stamp filled in.

### Signature Element

**The ink stamp badge.** A circular, slightly irregular-edged stamp (subtle
SVG noise/roughen on the circle border, not a perfect circle) rendered in the
realm's accent color, with a simple icon (key, compass, heart, sun) and a
short monospace label arced or set along the bottom (e.g. "PASSWORLD ·
VISITED"). Each stamp lands at a slightly different rotation (-6° to 6°,
randomized once per session) so the journal page feels hand-stamped rather
than templated. This is the one recurring "wow" moment and everything else
in the UI stays quiet so it doesn't compete.

## 4. Screen Flow

```
                          Atlas Gate (name entry, meet Comet)
                                     │
                                     ▼
                              The Atlas (hub)
                          ╱      │      │      │      ╲
                  Passworld  Privacy  Bully   Balance  Fable
                             Peaks    Bog     Bay      Falls
                      │        │        │        │        │
                      ▼        ▼        ▼        ▼        ▼
                 story → choice → mini-game → stamp (back to hub after each)
                                     │ (after every stamp)
                                     ▼
                   Finale: Wise Traveler certificate + pledge
```

Every realm branches out from the Gate and is reachable from the start —
free exploration, in any order. The table order in storyline.md is only the
suggested pacing shown in the realm-strip list beneath the map. The finale
unlocks once every realm's stamp is earned.

## 5. Interaction Patterns

- **Story beats:** tap/click to advance dialogue cards (no timed text).
- **Decision points:** two large tappable cards, side by side on desktop,
  stacked on mobile. Selecting the "unsafe" option doesn't punish or scare —
  it shows a brief, warm redirect ("Let's think about that one differently…")
  and lets the child pick again, so there's no wrong-answer dead end.
- **Mini-games:** kept to two mechanics only, reused across realms with
  different content so kids don't have to learn new controls each time:
  - *Sort:* drag items into two labeled bins (used in Passworld, Bully Bog,
    Balance Bay)
  - *Spot:* tap the flagged items within a scene/message (used in Privacy
    Peaks)
- **Transitions:** a soft page-fold/turn effect between hub and realm
  screens, reinforcing the journal metaphor. Kept short (~250-300ms) and
  respects `prefers-reduced-motion`.

## 6. Component Inventory (for the eventual React build)

- `AtlasMap` — hub screen with 4 realm nodes + progress dots
- `RealmScreen` — wraps story beat + choice + mini-game for a given realm
- `DialogueCard`
- `ChoiceCard` (x2 per decision)
- `MiniGameSort` (generic, takes items + two bin labels as props)
- `MiniGameSpot` (generic, takes a scene config + flagged targets as props)
- `StampBadge` (renders one of the 4 realm stamps, "earned" or "locked")
- `JournalProgress` — small persistent header showing stamp count
- `CertificateScreen` — finale, name + 4 stamps + pledge lines

## 7. State & Data Model (rough shape)

```js
{
  travelerName: string,
  currentScreen: 'gate' | 'atlas' | 'passworld' | 'privacy' | 'bullybog' | 'balance' | 'finale',
  realmProgress: {
    passworld:  { storyDone: bool, choiceMade: string|null, gameScore: number, stamped: bool },
    privacy:    { ...same shape },
    bullybog:   { ...same shape },
    balance:    { ...same shape },
  }
}
```

All state lives in `useState`/`useReducer` in memory for the session
(artifacts cannot use browser storage). If persistence across visits is
wanted later, the artifact persistent-storage API (`window.storage`) can
store `realmProgress` per traveler name — worth adding once the base game is
built, not before.

## 8. Accessibility & Kid-Safety UX Notes

- Large tap targets (min ~48px) throughout — this is a touch-first product.
- No timers, no fail states, no score pressure — mini-games can be retried
  freely.
- Every mini-game has a text-equivalent instruction line, not icon-only.
- Color is never the *only* signal (e.g. "safe/unsafe" sort bins are also
  labeled with text + icon, not just green/red).
- No real personal data is ever requested of the player beyond a first name
  used only in-session.

## 9. Technical Constraints

- Single-file React artifact, Tailwind core utility classes only (no
  compiler, no arbitrary config).
- No `localStorage`/`sessionStorage` — in-memory state only, per artifact
  rules.
- Icons via `lucide-react`. No framer-motion available — animation via
  Tailwind transition utilities and CSS keyframes defined in the same file.
- No external image assets — all character and scene art built from SVG
  shapes/icons, consistent with the flat vector direction in Section 3.

## 9a. Scene Construction (added once the realms became walkable)

Section 5 originally specified point-and-click cards with no moving character.
That changed on request: each realm is now a 2D scene the Traveler walks
around. That introduces a constraint the card design never had — **the art has
to agree with the ground the player can stand on.**

Scene art is authored in a 560×280 viewBox; the walkable band is authored in
0–100 world units in `data/realms.js`. They convert as `scene_y = world_y × 2.8`.
Two rules:

1. **Solid ground across the whole band, in both moods.** Scenery changes when
   the safe choice is made (the tide goes out, the fog lifts), and the band has
   to stay on solid ground through that change, not just before it.
2. **Nothing solid floats above the band.** There is no depth sorting — the
   Traveler always draws over the scene — so a prop placed higher than the band
   will have the player walk in front of something they should pass behind.

Breaking these is not a subtle rendering nit; it reads immediately as broken to
a child. The failures already caught this way: a bonfire and the friends around
it burning on open water, a bog with no bank so the Traveler walked across the
water for the whole realm, and a Keeper hovering twenty units above the ground.

Check both rules on the `#art` contact sheet (see README), which overlays the
band and every hotspot on all realms in both moods.

## 10. Motion & Animation Direction

Spend motion on exactly two moments, keep everything else static:

1. **The stamp thunk** — scale-in + slight rotate + a quick "ink bleed"
   pulse, on stamp-earned only.
2. **Page-fold transition** — between hub and realm screens only.

Choice cards, buttons, and mini-game feedback use quick, subtle
opacity/scale changes (~150ms) — nothing bouncy or attention-grabbing that
would compete with the two signature moments above.
