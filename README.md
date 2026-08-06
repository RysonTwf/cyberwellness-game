# Cyber Wellness Quest

A walkable cyber wellness game for ages 7–12. You're a Traveler with a paper
journal; a paper-airplane spirit called Comet shows you the Atlas — a map of the
internet made of four islands. Walk each realm, talk to who lives there, make a
call, play a small game, and earn a passport stamp. Four stamps gets you the
Wise Traveler certificate.

Built from `design.md` (visual system) and `storyline.md` (world and script).

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site into dist/
npm run preview  # serve the built site
```

## How it plays

Each realm is a 2D scene you walk around in:

- **Move** — tap/click the ground to walk there, or hold the arrow keys / WASD.
- **Interact** — walk up to the pin and press Space/Enter, or tap the button
  that appears over the Traveler.
- Each step (story → decision → mini-game → the rule) puts the pin somewhere
  new, and the scene itself changes once you make the safe choice: the vault
  opens, the fog lifts, the water clears, the tide goes out.

Nothing can be failed. Picking the unsafe option gets a warm redirect from
Comet and hands the decision straight back — there is no dead end, no timer,
and no score shown to the player.

## The four realms

| Realm | Topic | Mini-game | Stamp |
|---|---|---|---|
| Passworld | Passwords & personal info | Sort: Guard the Vault | Key |
| Privacy Peaks | Strangers & scams online | Spot: Clear the Fog | Compass |
| Bully Bog | Cyberbullying & kindness | Sort: Clear the Water | Heart |
| Balance Bay | Screen time balance | Balance the Day | Sun |

Realms can be played in any order; the finale unlocks at four stamps.

## Layout

```
src/
  data/realms.js        all story, choices, mini-game content, world layouts
  state/useProgress.js  game state + localStorage persistence
  world/                useWalker (movement), World (walkable space), Traveler
  components/           Atlas gate/map, realm screen, dialogue, stamps, certificate
  minigames/            Sort, Spot, Balance
  styles.css            design tokens and all styling
```

## Notes on the build

- Progress (name, stamps, pledge) persists in `localStorage` under
  `cyber-wellness-quest/v1`. "Start a new journal" on the finale clears it.
- No image assets — every character and scene is SVG shapes, per `design.md` §9.
- Fonts are self-hosted via `@fontsource`, so there are no external requests.
- The walk loop is driven by `requestAnimationFrame`, so it pauses while the tab
  is in the background and resumes with a clamped timestep (no teleporting).

## Known deviations from the design docs

Both were deliberate calls, noted here so the docs and the build don't quietly
drift apart:

1. **Walkable world instead of card-based navigation.** `design.md` §5 specified
   point-and-click cards with no moving character. This was changed on request:
   the realms are now walked, though the mini-games are still tap puzzles.
2. **A real Vite app with persistence, not a single-file artifact.**
   `design.md` §9 assumed an artifact (Tailwind, no `localStorage`). §7 had
   already flagged persistence as the follow-up once the base game existed.
3. **A third mini-game component.** §6 lists only Sort and Spot, but §5's own
   "Balance the Day" description is a scale rather than two bins, so it has its
   own component — reusing Sort's exact tap-to-place controls so there is no new
   control to learn.
