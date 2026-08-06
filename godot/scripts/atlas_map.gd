extends Control
## Ports AtlasMap.jsx — the hub. The Traveler walks the Stream between four
## islands (World.jsx + this file's own AtlasScene svg, ported to WorldView +
## AtlasSceneArt). The source's plain-list accessibility fallback (a button
## per realm, redundant with the walkable map) was dropped on request now
## that walking is the real way in — the map is the only way to reach a
## realm here.

## GATE, matching AtlasMap.jsx's own inline const — the hub's spawn point and
## bounds are Atlas-specific navigation data, not per-realm content.
const GATE := Vector2(6, 88)
const WORLD_BOUNDS_MIN := Vector2(4, 68)
const WORLD_BOUNDS_MAX := Vector2(94, 92)

@onready var _greeting: DialogueCard = $Scroll/Margin/Col/GreetingCard
@onready var _status: Label = $Scroll/Margin/Col/StatusLabel
@onready var _finale_btn: Button = $Scroll/Margin/Col/FinaleBtn
@onready var _stamp_row: HBoxContainer = $Scroll/Margin/Col/StampRow
@onready var _world: WorldView = $Scroll/Margin/Col/World


func _ready() -> void:
	_build_stamp_row()
	_setup_world()
	_refresh_greeting()
	_finale_btn.pressed.connect(_on_finale_pressed)
	_finale_btn.visible = JourneyManager.all_stamped()
	JourneyManager.progress_changed.connect(func(_id): _refresh_greeting(); _rebuild_hotspots())


func _setup_world() -> void:
	_world.configure(WORLD_BOUNDS_MIN, WORLD_BOUNDS_MAX, GATE)
	_world.hotspot_interacted.connect(_on_hotspot_interacted)
	_rebuild_hotspots()
	_world.enter()


func _rebuild_hotspots() -> void:
	var hotspots: Array = []
	for id in JourneyManager.REALM_IDS:
		var data: Dictionary = JourneyManager.realms.get(id, {})
		var island: Dictionary = AtlasSceneArt.ISLANDS.get(id, {})
		var world_pos: Vector2 = island.get("world", Vector2.ZERO)
		hotspots.append({
			"id": id,
			"x": world_pos.x,
			"y": world_pos.y,
			"label": data.get("name", id),
			"action": "Visit again" if JourneyManager.is_stamped(id) else "Travel here",
			"accent": StampManager.accent_for(id),
		})
	if JourneyManager.all_stamped():
		hotspots.append({
			"id": "finale",
			"x": GATE.x + 2,
			"y": 78,
			"label": "The Atlas Gate",
			"action": "Finish",
			"accent": Palette.GOLD,
		})
	_world.set_hotspots(hotspots)
	_world.objective_text = "Walk back to the Atlas Gate" if JourneyManager.all_stamped() else "Walk to an island and step onto it"


func _on_hotspot_interacted(id: String, data: Dictionary) -> void:
	if id == "finale":
		_on_finale_pressed()
	else:
		_on_realm_pressed(id, str(data.get("label", id)))


func _build_stamp_row() -> void:
	for id in JourneyManager.REALM_IDS:
		var badge := preload("res://scenes/stamp_badge.tscn").instantiate()
		badge.realm_id = id
		badge.icon = StampManager.stamp_for(id).get("icon", "key")
		badge.badge_accent = StampManager.accent_for(id)
		badge.earned = JourneyManager.is_stamped(id)
		badge.angle_deg = rad_to_deg(StampManager.rotation_for(id))
		badge.badge_size = 44.0
		_stamp_row.add_child(badge)


func _refresh_greeting() -> void:
	var visited: int = StampManager.earned_count()
	var total: int = JourneyManager.REALM_IDS.size()
	var traveler: String = JourneyManager.traveler_name if JourneyManager.traveler_name != "" else "Traveler"
	var text: String
	if JourneyManager.all_stamped():
		text = "Four stamps, Traveler %s. The Gate's been waiting for you." % traveler
	elif visited == 0:
		text = "Here it is — the whole Atlas. Walk the Stream, %s, and step onto whichever island you like the look of." % traveler
	else:
		text = "%d down, %d to go. Where to next, %s?" % [visited, total - visited, traveler]
	_greeting.who = "Comet"
	_greeting.text = text
	_greeting.refresh()
	_finale_btn.visible = JourneyManager.all_stamped()


func _on_realm_pressed(_id: String, realm_name: String) -> void:
	_status.text = "%s isn't built yet — coming up next (godot.md §12)." % realm_name
	print("[interact] realm pressed: ", realm_name)


func _on_finale_pressed() -> void:
	_status.text = "The finale certificate isn't built yet."
	print("[interact] finale pressed")
