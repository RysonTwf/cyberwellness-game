extends Control
## Ports AtlasMap.jsx's hub-with-no-walkable-scene fallback (design.md §3's own
## ASCII layout: greeting, 4 realm cards, stamp progress). The full walkable
## Stream/islands scene (World.jsx + AtlasScene svg) is real art+walk-system
## work, tracked separately — this is godot.md §12 step 1's minimum bar:
## "hub with 4 realm nodes + stamp dots (locked art only, no realms wired)."

@onready var _greeting: DialogueCard = $Scroll/Margin/Col/GreetingCard
@onready var _grid: GridContainer = $Scroll/Margin/Col/RealmGrid
@onready var _status: Label = $Scroll/Margin/Col/StatusLabel
@onready var _finale_btn: Button = $Scroll/Margin/Col/FinaleBtn
@onready var _stamp_row: HBoxContainer = $Scroll/Margin/Col/StampRow


func _ready() -> void:
	_build_realm_cards()
	_build_stamp_row()
	_refresh_greeting()
	_finale_btn.pressed.connect(_on_finale_pressed)
	_finale_btn.visible = JourneyManager.all_stamped()
	JourneyManager.progress_changed.connect(func(_id): _refresh_greeting())


func _build_realm_cards() -> void:
	for id in JourneyManager.REALM_IDS:
		var data: Dictionary = JourneyManager.realms.get(id, {})
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(0, 100)
		btn.text = "%s\n%s" % [data.get("name", id), data.get("topic", "")]
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		btn.size_flags_horizontal = SIZE_EXPAND_FILL

		var accent := Color(String(data.get("accent", "#1f3452")))
		var style := StyleBoxFlat.new()
		style.bg_color = Color(accent, 0.16)
		style.border_color = accent
		style.set_border_width_all(2)
		style.set_corner_radius_all(14)
		style.content_margin_left = 16.0
		style.content_margin_right = 16.0
		style.content_margin_top = 12.0
		style.content_margin_bottom = 12.0
		btn.add_theme_stylebox_override("normal", style)

		var hover: StyleBoxFlat = style.duplicate()
		hover.bg_color = Color(accent, 0.26)
		btn.add_theme_stylebox_override("hover", hover)

		btn.add_theme_color_override("font_color", Palette.INK)
		btn.add_theme_font_size_override("font_size", 18)
		btn.pressed.connect(_on_realm_pressed.bind(id, data.get("name", id)))
		_grid.add_child(btn)


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


func _on_finale_pressed() -> void:
	_status.text = "The finale certificate isn't built yet."
