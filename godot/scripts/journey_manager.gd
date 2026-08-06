extends Node
## Autoload: who the Traveler is and how far they've got.
##
## Ports src/state/useProgress.js. The realm_progress shape is carried over
## unchanged from design.md §7 / godot.md §7 so the React save data and the
## Godot save data describe the same thing.

const REALM_IDS: Array[String] = ["passworld", "privacy", "bullybog", "balance"]

## godot.md §8: user:// only, no accounts, no server. The React version could not
## persist at all; this is the one capability the port genuinely adds.
const SAVE_PATH := "user://journey.save"

signal progress_changed(realm_id: String)
signal traveler_named(name: String)

var traveler_name: String = ""
var realm_progress: Dictionary = {}

## Realm content loaded from res://data/*.json (godot.md §7: content lives in
## JSON, not GDScript, so the authoring pass never touches code).
var realms: Dictionary = {}


func _ready() -> void:
	_reset_progress()
	_load_realm_data()
	load_game()


func _reset_progress() -> void:
	realm_progress = {}
	for id in REALM_IDS:
		realm_progress[id] = fresh_realm_progress()


## Ports freshRealmProgress() from useProgress.js.
func fresh_realm_progress() -> Dictionary:
	return {"story_done": false, "choice_made": "", "stamped": false}


func _load_realm_data() -> void:
	for id in REALM_IDS:
		var path := "res://data/%s.json" % id
		if not FileAccess.file_exists(path):
			push_warning("JourneyManager: missing realm data %s" % path)
			continue
		var text := FileAccess.get_file_as_string(path)
		var parsed: Variant = JSON.parse_string(text)
		if typeof(parsed) != TYPE_DICTIONARY:
			push_error("JourneyManager: %s is not a JSON object" % path)
			continue
		realms[id] = parsed


func set_traveler_name(value: String) -> void:
	traveler_name = value.strip_edges()
	traveler_named.emit(traveler_name)
	save_game()


func mark_story_done(realm_id: String) -> void:
	_set_field(realm_id, "story_done", true)


func record_choice(realm_id: String, choice_id: String) -> void:
	_set_field(realm_id, "choice_made", choice_id)


func mark_stamped(realm_id: String) -> void:
	_set_field(realm_id, "stamped", true)


func _set_field(realm_id: String, key: String, value: Variant) -> void:
	if not realm_progress.has(realm_id):
		push_error("JourneyManager: unknown realm '%s'" % realm_id)
		return
	realm_progress[realm_id][key] = value
	progress_changed.emit(realm_id)
	save_game()


func is_stamped(realm_id: String) -> bool:
	return realm_progress.get(realm_id, {}).get("stamped", false)


## godot.md §3: the finale unlocks once all four stamps are earned.
func all_stamped() -> bool:
	for id in REALM_IDS:
		if not is_stamped(id):
			return false
	return true


func world_for(realm_id: String) -> Dictionary:
	return realms.get(realm_id, {}).get("world", {})


# --- save/load (godot.md §8) -------------------------------------------------

func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_warning("JourneyManager: could not write save")
		return
	file.store_string(JSON.stringify({
		"traveler_name": traveler_name,
		"realm_progress": realm_progress,
	}))


func load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	traveler_name = parsed.get("traveler_name", "")
	var saved: Dictionary = parsed.get("realm_progress", {})
	# Merge rather than replace, so a save written by an older build that is
	# missing a realm still yields a complete progress dictionary.
	for id in REALM_IDS:
		if saved.has(id):
			var entry: Dictionary = fresh_realm_progress()
			entry.merge(saved[id], true)
			realm_progress[id] = entry


func reset_journey() -> void:
	traveler_name = ""
	_reset_progress()
	DirAccess.remove_absolute(SAVE_PATH)
