class_name WorldView
extends Control
## Ports World.jsx — a walkable 2D space, used for the Atlas hub now and for
## every realm later (godot.md §4 calls out the same shared pattern).
##
## The 560x280 scene art is authored in its own pixel space; this Control
## fits that box into whatever room it's given (letterboxed, like the SVG's
## width:100% + viewBox did) and everything living under SceneRoot — art,
## Traveler, hotspot pins — shares that one coordinate space for free via the
## normal Node2D transform stack.

const SCENE_BOX := Vector2(560, 280)
const SCENE_SCALE := Vector2(5.6, 2.8)

signal hotspot_interacted(id: String, data: Dictionary)

@export var world_bounds_min := Vector2(0, 0)
@export var world_bounds_max := Vector2(100, 100)
@export var spawn := Vector2(50, 50)
@export var objective_text: String = ""
@export var hint_text: String = "Tap the ground to walk, or use the arrow keys."

@onready var _scene_root: Node2D = $SceneRoot
@onready var _art: AtlasSceneArt = $SceneRoot/Art
@onready var _hotspot_layer: HotspotLayer = $SceneRoot/HotspotLayer
@onready var _comet_follow: Comet = $SceneRoot/CometFollow
@onready var _traveler: TravelerController = $SceneRoot/Traveler
@onready var _interact_btn: Button = $InteractBtn
@onready var _objective_label: Label = $InfoBar/ObjectiveLabel
@onready var _hint_label: Label = $InfoBar/HintLabel

var _hotspots: Array = []
var _active: Dictionary = {}
var _fit_scale: float = 1.0
var _origin: Vector2 = Vector2.ZERO


func _ready() -> void:
	_objective_label.text = objective_text
	_hint_label.text = hint_text

	_interact_btn.pressed.connect(_on_interact_pressed)
	resized.connect(_layout)
	_layout()


## Explicit setup instead of relying on exported vars set by a parent's own
## _ready() — a child's _ready() always runs first, so world_bounds_min/max
## and spawn set by the owning screen after instancing would otherwise never
## reach the Traveler (caught by the headless smoke test: bounds silently
## stayed at the Vector2 default (0,0)..(100,100) instead of the real ones).
func configure(bounds_min: Vector2, bounds_max: Vector2, spawn_pos: Vector2) -> void:
	world_bounds_min = bounds_min
	world_bounds_max = bounds_max
	spawn = spawn_pos
	_traveler.bounds_min = bounds_min
	_traveler.bounds_max = bounds_max
	_traveler.spawn = spawn_pos


func set_hotspots(list: Array) -> void:
	_hotspots = list
	_hotspot_layer.set_hotspots(list)


## Re-place at spawn — used when a realm/hub is (re)entered, matching World.jsx
## re-placing the Traveler whenever `sceneKey` changes.
func enter() -> void:
	_traveler.place_at(spawn.x, spawn.y)


func _layout() -> void:
	if size.x <= 0 or size.y <= 0:
		return
	_fit_scale = min(size.x / SCENE_BOX.x, size.y / SCENE_BOX.y)
	_origin = (size - SCENE_BOX * _fit_scale) / 2.0
	_scene_root.scale = Vector2.ONE * _fit_scale
	_scene_root.position = _origin


func _process(_delta: float) -> void:
	_update_active_hotspot()
	_position_interact_button()
	_position_comet_follow()
	_art.queue_redraw()


func _position_comet_follow() -> void:
	# Trails just behind the Traveler, same world position, small offset.
	_comet_follow.position = _traveler.position - _comet_follow.size / 2.0 + Vector2(-14, -10)


func _update_active_hotspot() -> void:
	var best: Dictionary = {}
	var best_dist: float = TravelerController.INTERACT_RANGE
	for spot in _hotspots:
		var d: float = _traveler.distance_to_world(Vector2(spot["x"], spot["y"]))
		if d < best_dist:
			best = spot
			best_dist = d
	_active = best
	_hotspot_layer.set_active(best.get("id", ""))


func _position_interact_button() -> void:
	if _active.is_empty():
		_interact_btn.visible = false
		return
	_interact_btn.visible = true
	_interact_btn.text = str(_active.get("action", "Look"))
	var scene_px: Vector2 = _traveler.world_pos * SCENE_SCALE
	var control_px: Vector2 = _origin + scene_px * _fit_scale
	_interact_btn.position = control_px + Vector2(-_interact_btn.size.x / 2.0, 14.0)


func _on_interact_pressed() -> void:
	_trigger_interact()


func _trigger_interact() -> void:
	if _active.is_empty():
		return
	hotspot_interacted.emit(str(_active.get("id", "")), _active)


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_walk_to_control_point(event.position)
	elif event is InputEventScreenTouch and event.pressed:
		_walk_to_control_point(event.position)


func _walk_to_control_point(control_px: Vector2) -> void:
	if _fit_scale <= 0.0:
		return
	var scene_px: Vector2 = (control_px - _origin) / _fit_scale
	var world: Vector2 = scene_px / SCENE_SCALE
	_traveler.walk_to(world.x, world.y)


func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_SPACE or event.keycode == KEY_ENTER:
			_trigger_interact()
