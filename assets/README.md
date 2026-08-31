# Asset pipeline

Folder/naming convention from `Cyber_Wellness_Quest_Milestones.md` ("Asset
pipeline: placeholders & specs"). Placeholders and final art use the exact
same file path, swapping one for the other is a file replacement, not a
code change.

**Status (18 Aug 2026):** skeleton only. All 5 realms' scene art, including
Fable Falls, now that it is enabled, stays inline SVG in
`src/components/RealmArt.jsx` (README.md "No Image Assets: SVG Shapes
Only"), so nothing there needs to move into this folder. This tree exists
for what is genuinely new and file-based:

- The two Phase 2 Phaser mechanics (`p4-6-only/`), which need real sprite
  sheets, Phaser's preferred format, unlike the rest of the game. (In
  practice Phase 2 shipped using procedurally-drawn Phaser textures instead
  of files at these paths, see the Milestones doc's "Asset pipeline"
  section for the open decision that leaves.)
- Fable Falls' Detective/Compare clue assets (`fablefalls-detective/`) and
  its shared mood backgrounds (`shared/fablefalls/`), content is now
  written (Phase 1) using the reused Sort/Spot mechanics rather than a
  bespoke Detective/Compare one; see the realm's own code comments in
  `src/data/realms.js` for what is still a placeholder within that (the
  official "3 tips to CHECK" source content specifically).
- A designer starting the P4–P6 platformer/stepping-stone art now (Phase 2
  can begin before that art lands, per Milestones, "do not let any
  mechanic's logic wait on final art") should drop flat-color, correctly-
  dimensioned placeholders at these paths as a first pass, then replace them
  in place with final art. None have been generated yet.

```
shared/                        used by both bands, within the one app
  hub/atlas-hub-bg.svg
  passworld/passworld-bg-{calm,alert}.svg
  privacy-peaks/privacy-peaks-bg-{calm,alert}.svg
  bully-bog/bully-bog-bg-{calm,alert}.svg
  balance-bay/balance-bay-bg-{calm,alert}.svg
  fablefalls/fablefalls-bg-{calm,alert}.svg
  characters/comet.svg, traveler.svg, keeper-vex.svg, the-fog.svg,
             pockets.svg, the-glimmer.svg, the-echo.svg
  ui/stamp-{key,compass,heart,sun,eye}.svg,
     certificate-bg.svg, atlas-gate-bg.svg

p4-6-only/
  passworld-platformer/
    traveler-{idle,run,jump,fall,land}.png   (sprite sheets)
    tiles-{letter,number,symbol,decoy}.png
    hazard-hacker.png
    vault-tileset.png
    meter-ui.png
  privacy-peaks-stepping-stones/
    stone-{1-6}.png
    fog-shape-{1-6}.png

fablefalls-detective/
  p1-3/clue-{n}.svg
  p4-6/clue-{n}.svg
```

## Specs (proposed defaults: confirm against live repo constants, then lock)

| Asset type | Format | Dimensions | Notes |
|---|---|---|---|
| Scene backgrounds | SVG | 560×280 viewBox | Matches existing convention (`scene_y = world_y × 2.8`) |
| Characters (story/hub) | SVG | Match existing cast's current size | Fable Falls' guide, "The Echo," matches Vex/Fog/Pockets/Glimmer's scale |
| Platformer sprite frames | PNG sprite sheet | 64×64 px/frame (proposed) | Frame size = tile size, keeps collision math simple |
| Platformer tileset | PNG sprite sheet | 64×64 px/tile (proposed) | |
| Stepping-stone sprites | PNG sprite sheet | 128×128 px (proposed) | Tap targets, not run-cycle frames |
| Stamp badges | SVG | Match existing 4 stamps' size | 5th stamp icon is `eye` (lucide) for now, see `StampBadge.jsx` |
| Detective clue assets | SVG (P1-3), SVG (P4-6) | Match existing scene proportions | Plain React, not Phaser, stays SVG |
