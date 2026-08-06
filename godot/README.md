# Cyber Wellness Quest — Godot port

The Godot 4 rebuild of the React game in the parent directory. Design doc: [`../godot.md`](../godot.md).

Nothing here is playable yet — this is the scaffold from build-order step 0
(`godot.md` §12). `scenes/boot.tscn` is a temporary placeholder that just proves
the project loads; it gets replaced by `atlas_gate.tscn` at step 1.

## Opening it

1. Launch Godot (`Godot_v4.7.1-stable_win64.exe`).
2. In the Project Manager, click **Import**.
3. Pick the `project.godot` file in *this* folder, then **Import & Edit**.

Once it's open, **F5** runs the game and **F6** runs just the current scene.
The output panel at the bottom is where `print()` and errors show up — that's
the first place to look when something misbehaves.

## Running the checks without the editor

The scaffold self-tests itself. From a bash shell (Git Bash — PowerShell eats
the bare `--`):

```bash
GODOT="/d/Users/ryson/Downloads/Godot_v4.7.1-stable_win64.exe/Godot_v4.7.1-stable_win64.exe"
"$GODOT" --headless --path . -- --selftest
```

Exits 0 when every check passes, 1 if any line reads `FAIL`. It verifies the
autoloads resolve, the four realm JSON files parse, the ported world bounds are
present, and the save file round-trips.

To re-import assets after pulling changes: `"$GODOT" --headless --path . --import`

## Layout

Follows `godot.md` §7.

| Path | What's in it |
|---|---|
| `scripts/journey_manager.gd` | Autoload. Traveler name + per-realm progress + save/load. Ports `src/state/useProgress.js`. |
| `scripts/stamp_manager.gd` | Autoload. Which stamps are earned, and their icon/label/accent/jitter. |
| `data/*.json` | Per-realm content. World `spawn`/`bounds` copied verbatim from `src/data/realms.js`. |
| `scenes/boot.tscn` | Temporary scaffold check. Replaced at build step 1. |
| `assets/` | Sprites, fonts, audio. Empty so far. |

Content lives in JSON, not GDScript, so the authoring pass never touches code.

## Not done yet

Everything else. In build order: Atlas gate + hub, Bully Bog (Sort), Balance Bay
(Balance), Privacy Peaks (river run), Passworld (platformer), certificate, then
HTML5 export.
