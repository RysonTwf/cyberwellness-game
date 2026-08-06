extends Control
## Temporary bootstrap scene.
##
## This exists so the scaffold is verifiable before any realm is built: run with
## `--headless -- --selftest` and it asserts the autoloads, the realm JSON, and
## the ported world bounds all load, prints a report, and exits non-zero on
## failure. Replaced by atlas_gate.tscn at build-order step 1 (godot.md §12).

@onready var _report: Label = $Margin/Rows/Report


func _ready() -> void:
	var lines := _run_checks()
	var text := "\n".join(lines)
	print(text)

	if "--selftest" in OS.get_cmdline_user_args():
		var failed := false
		for line in lines:
			if line.begins_with("FAIL"):
				failed = true
		# Quitting inside _ready() tears the process down before stdout is
		# flushed, so the report never reaches the terminal. Yield one frame.
		await get_tree().process_frame
		get_tree().quit(1 if failed else 0)
		return

	_report.text = text


func _run_checks() -> Array[String]:
	var lines: Array[String] = []
	lines.append("Cyber Wellness Quest — scaffold self-test")
	lines.append("Godot %s" % Engine.get_version_info().string)
	lines.append("")

	# Autoloads resolve (project.godot [autoload] wiring).
	lines.append(_check("JourneyManager autoload", JourneyManager != null))
	lines.append(_check("StampManager autoload", StampManager != null))

	# Progress dictionary matches design.md §7 shape.
	var shape_ok := true
	for id in JourneyManager.REALM_IDS:
		var p: Dictionary = JourneyManager.realm_progress.get(id, {})
		if not (p.has("story_done") and p.has("choice_made") and p.has("stamped")):
			shape_ok = false
	lines.append(_check("realm_progress shape (4 realms)", shape_ok))

	# Every realm's JSON parsed and carries the ported world block.
	for id in JourneyManager.REALM_IDS:
		var world: Dictionary = JourneyManager.world_for(id)
		var ok: bool = world.has("spawn") and world.has("bounds")
		var detail := ""
		if ok:
			var b: Dictionary = world["bounds"]
			var s: Dictionary = world["spawn"]
			detail = "  spawn(%s,%s) bounds x[%s..%s] y[%s..%s]" % [
				s["x"], s["y"], b["minX"], b["maxX"], b["minY"], b["maxY"]
			]
		lines.append(_check("data/%s.json world block" % id, ok) + detail)

	# Stamp presentation facts present for all four.
	var stamps_ok := true
	for id in JourneyManager.REALM_IDS:
		if StampManager.stamp_for(id).is_empty():
			stamps_ok = false
	lines.append(_check("stamp metadata (4 realms)", stamps_ok))

	# Save round-trip — the one capability the port adds (godot.md §8).
	JourneyManager.set_traveler_name("SelfTest")
	JourneyManager.save_game()
	JourneyManager.traveler_name = ""
	JourneyManager.load_game()
	lines.append(_check("save/load round-trip", JourneyManager.traveler_name == "SelfTest"))
	JourneyManager.reset_journey()

	return lines


func _check(label: String, ok: bool) -> String:
	return ("ok   " if ok else "FAIL ") + label
