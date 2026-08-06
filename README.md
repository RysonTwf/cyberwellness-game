# Cyber Wellness Quest

A walkable cyber wellness game for ages 7–12. You're a Traveler with a paper
journal; a paper-airplane spirit called Comet shows you the Atlas — a map of
the internet made of four islands. Walk each realm, talk to who lives there,
make a call, play a mini-game built around the lesson itself, and earn a
passport stamp. Four stamps gets you the Wise Traveler certificate.

This is a **Godot 4 project** — see [`godot/`](godot/). An earlier React/Vite
draft of this game existed in this repo; it has been retired in favor of the
Godot build, which is the one plan now being followed. Its content and lessons
carry forward through `design.md` (original visual system) and `storyline.md`
(world and script); `godot.md` is the actual build plan.

## Running it

See [`godot/README.md`](godot/README.md) — open `godot/project.godot` in
Godot 4.1+, press F5.

## The four realms

| Realm | Topic | Mechanic | Stamp |
|---|---|---|---|
| Passworld | Passwords & personal info | Platformer — *Password Fortress* | Key (gold) |
| Privacy Peaks | Strangers & scams online | Stepping-Stone Run — *Cross the Fog* | Compass (teal) |
| Bully Bog | Cyberbullying & kindness | Sort — *Clear the Water* | Heart (coral) |
| Balance Bay | Screen time balance | Balance — *Balance the Day* | Sun (periwinkle) |

Realms can be played in any order; the finale unlocks at four stamps. See
`godot.md` §5–6 for the full content and mechanic mapping, and §2 for why
Passworld and Privacy Peaks moved off their original bin-sort mechanics.

## Layout

```
godot/            the game — see godot/README.md
design.md         visual system (tokens, type, signature stamp element)
storyline.md      world, characters, tone rules, full dialogue
godot.md          the build plan — architecture, content map, build order
graphify-out/     knowledge graph of this repo (see CLAUDE.md)
```

## Project history

Retired: a React/Vite draft that proved out the walkable-realm concept and
carried the original Sort/Spot mini-game set. Its content is preserved in
`design.md`/`storyline.md` and in git history; nothing in it is the live
plan anymore — `godot.md` is.
