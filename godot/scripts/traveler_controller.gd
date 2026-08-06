class_name TravelerController
extends Node2D
## Ports src/world/useWalker.js + src/world/Traveler.jsx verbatim: the
## Traveler's movement (held-key AND tap-to-walk feeding one loop, vertical
## movement compressed to 0.55x so the shallow walkable band doesn't read as
## sliding) and its plain-shapes figure (no skin tone, no hair, no gendered
## silhouette — storyline.md is deliberate about this).
##
## Position is tracked in WORLD units (0-100, matching realms.js/data/*.json)
## in `world_pos`; this node's own transform is kept in its parent's local
## "scene pixel" space via SCENE_SCALE, so it can sit directly under the same
## Node2D that draws the 560x280 scene art.

const SCENE_SCALE := Vector2(5.6, 2.8)
const INTERACT_RANGE := 12.0

@export var bounds_min := Vector2(0, 0)
@export var bounds_max := Vector2(100, 100)
@export var spawn := Vector2(50, 50)
@export var speed: float = 30.0
@export var accent: Color = Palette.INK

var world_pos: Vector2
var facing: float = 1.0
var moving: bool = false

var _target: Variant = null  # Vector2 or null
var _walk_phase: float = 0.0


func _ready() -> void:
	place_at(spawn.x, spawn.y)


func place_at(wx: float, wy: float) -> void:
	world_pos = _clamp_world(Vector2(wx, wy))
	_target = null
	_apply_transform()


func walk_to(wx: float, wy: float) -> void:
	_target = _clamp_world(Vector2(wx, wy))


func stop() -> void:
	_target = null


func _clamp_world(p: Vector2) -> Vector2:
	return Vector2(clamp(p.x, bounds_min.x, bounds_max.x), clamp(p.y, bounds_min.y, bounds_max.y))


func _physics_process(delta: float) -> void:
	var dt: float = min(delta, 0.05)

	var dx := 0.0
	var dy := 0.0
	if Input.is_physical_key_pressed(KEY_LEFT) or Input.is_physical_key_pressed(KEY_A):
		dx -= 1.0
	if Input.is_physical_key_pressed(KEY_RIGHT) or Input.is_physical_key_pressed(KEY_D):
		dx += 1.0
	if Input.is_physical_key_pressed(KEY_UP) or Input.is_physical_key_pressed(KEY_W):
		dy -= 1.0
	if Input.is_physical_key_pressed(KEY_DOWN) or Input.is_physical_key_pressed(KEY_S):
		dy += 1.0

	if dx != 0.0 or dy != 0.0:
		_target = null  # a keypress cancels a tap-to-move
	elif _target != null:
		var t: Vector2 = _target
		var to_target: Vector2 = t - world_pos
		var dist: float = to_target.length()
		if dist < 0.8:
			_target = null
		else:
			dx = to_target.x / dist
			dy = to_target.y / dist

	var len: float = Vector2(dx, dy).length()
	if len > 0.0 and dt > 0.0:
		var nx: float = world_pos.x + (dx / len) * speed * dt
		var ny: float = world_pos.y + (dy / len) * speed * 0.55 * dt
		world_pos = _clamp_world(Vector2(nx, ny))
		moving = true
		if dx != 0.0:
			facing = 1.0 if dx > 0.0 else -1.0
		_walk_phase += dt * 10.0
	else:
		moving = false

	_apply_transform()
	queue_redraw()


func _apply_transform() -> void:
	position = world_pos * SCENE_SCALE
	var depth: float = clamp((world_pos.y - bounds_min.y) / max(1.0, bounds_max.y - bounds_min.y), 0.0, 1.0)
	var depth_scale: float = 0.82 + depth * 0.34
	scale = Vector2(facing * depth_scale, depth_scale)


func distance_to_world(p: Vector2) -> float:
	return world_pos.distance_to(p)


func _draw() -> void:
	# Ported from Traveler.jsx's viewBox="0 0 40 56" figure, drawn at native
	# scale (this node's own transform already carries facing + depth-scale).
	var leg_swing: float = sin(_walk_phase) * 2.6 if moving else 0.0

	# soft ground shadow
	draw_colored_polygon(DrawUtils.ellipse_points(20, 53, 12, 3.2), Color(Palette.INK, 0.18))

	# legs
	draw_line(Vector2(17, 40), Vector2(15 - leg_swing, 51), Palette.INK, 4.5, true)
	draw_line(Vector2(23, 40), Vector2(25 + leg_swing, 51), Palette.INK, 4.5, true)

	# pack
	draw_colored_polygon(PackedVector2Array([
		Vector2(6, 24), Vector2(15, 24), Vector2(15, 37), Vector2(6, 37),
	]), Color(accent, 0.85))

	# torso: M12 24 q8 -5 16 0 v14 q-8 4 -16 0 Z
	var torso := DrawUtils.quad_bezier_points(Vector2(12, 24), Vector2(20, 19), Vector2(28, 24), 6)
	torso.append(Vector2(28, 38))
	var torso_bottom := DrawUtils.quad_bezier_points(Vector2(28, 38), Vector2(20, 42), Vector2(12, 38), 6)
	for p in torso_bottom:
		torso.append(p)
	draw_colored_polygon(torso, Palette.INK)

	# scarf: M12 24 q8 4 16 0 l1 5 q-9 4 -18 0 Z
	var scarf := DrawUtils.quad_bezier_points(Vector2(12, 24), Vector2(20, 28), Vector2(28, 24), 6)
	scarf.append(Vector2(29, 29))
	var scarf_bottom := DrawUtils.quad_bezier_points(Vector2(29, 29), Vector2(20.5, 33), Vector2(11, 29), 6)
	for p in scarf_bottom:
		scarf.append(p)
	draw_colored_polygon(scarf, accent)

	# scarf tail: M27 27 q7 3 6 10 l-4 -1 q0 -6 -4 -7 Z
	var tail := DrawUtils.quad_bezier_points(Vector2(27, 27), Vector2(34, 30), Vector2(33, 37), 5)
	tail.append(Vector2(29, 36))
	var tail_in := DrawUtils.quad_bezier_points(Vector2(29, 36), Vector2(29, 30), Vector2(25, 29), 5)
	for p in tail_in:
		tail.append(p)
	draw_colored_polygon(tail, accent)

	# head
	draw_circle(Vector2(20, 15), 9, Palette.INK)

	# cap brim: M11 13 q9 -9 18 0 q-9 -4 -18 0 Z
	var brim := DrawUtils.quad_bezier_points(Vector2(11, 13), Vector2(20, 4), Vector2(29, 13), 6)
	var brim_in := DrawUtils.quad_bezier_points(Vector2(29, 13), Vector2(20, 9), Vector2(11, 13), 6)
	for p in brim_in:
		brim.append(p)
	draw_colored_polygon(brim, accent)

	# eyes
	draw_circle(Vector2(23.5, 16), 1.7, Palette.PAPER)
	draw_circle(Vector2(17.5, 16), 1.7, Palette.PAPER)
