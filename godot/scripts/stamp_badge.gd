class_name StampBadge
extends Control
## Ports StampBadge.jsx — the ink stamp badge, design.md's one signature "wow"
## moment. Rough (not perfect) rings via StampGeometry, procedural icons
## (key/compass/heart/sun) since no icon font/image assets exist yet.
##
## Simplification vs. the React version: the arced label-on-path text is not
## ported (SVG textPath has no Godot equivalent, and every badge in this build
## is locked, where the React version doesn't render the label either) —
## revisit when a realm actually earns its first stamp.

@export var realm_id: String = ""
@export var icon: String = "key"
@export var badge_accent: Color = Palette.INK_SOFT
@export var earned: bool = false
@export var angle_deg: float = 0.0
@export var badge_size: float = 96.0


func _ready() -> void:
	custom_minimum_size = Vector2(badge_size, badge_size)
	pivot_offset = Vector2(badge_size, badge_size) / 2.0
	rotation_degrees = angle_deg if earned else 0.0


func _draw() -> void:
	var s: float = badge_size / 120.0
	var color: Color = badge_accent if earned else Palette.INK_SOFT
	var seed: int = StampGeometry.seed_from(realm_id if realm_id != "" else icon)

	var outer := StampGeometry.rough_circle_smoothed(60, 60, 53, seed)
	var inner := StampGeometry.rough_circle_smoothed(60, 60, 46, seed + 977)

	var outer_scaled := PackedVector2Array()
	for p in outer:
		outer_scaled.append(p * s)
	var inner_scaled := PackedVector2Array()
	for p in inner:
		inner_scaled.append(p * s)

	var outer_col := color
	outer_col.a = 0.95 if earned else 0.8
	var dash: float = (8.0 if earned else 5.0) * s
	var gap: float = (4.0 if earned else 6.0) * s
	_draw_dashed(outer_scaled, dash, gap, outer_col, max((3.4 if earned else 2.0) * s, 1.0))

	var inner_col := color
	inner_col.a = 0.65 if earned else 0.5
	draw_polyline(inner_scaled, inner_col, max(1.3 if earned else 1.0, 1.0) * s, true)

	_draw_icon(icon, Vector2(60, 60) * s, badge_size * 0.16, color)


func _draw_dashed(points: PackedVector2Array, dash: float, gap: float, color: Color, width: float) -> void:
	if points.size() < 2:
		return
	var draw_on := true
	var remaining := dash
	for i in range(points.size() - 1):
		var a: Vector2 = points[i]
		var b: Vector2 = points[i + 1]
		var seg: float = a.distance_to(b)
		if seg <= 0.0:
			continue
		var t := 0.0
		while t < seg:
			var step: float = min(remaining, seg - t)
			if draw_on:
				var from: Vector2 = a.lerp(b, t / seg)
				var to: Vector2 = a.lerp(b, (t + step) / seg)
				draw_line(from, to, color, width, true)
			t += step
			remaining -= step
			if remaining <= 0.001:
				draw_on = not draw_on
				remaining = dash if draw_on else gap


func _draw_icon(name: String, c: Vector2, r: float, color: Color) -> void:
	match name:
		"key":
			draw_arc(c + Vector2(-r * 0.15, 0), r * 0.55, 0, TAU, 20, color, r * 0.22, true)
			draw_line(c + Vector2(r * 0.3, 0), c + Vector2(r * 1.1, 0), color, r * 0.22, true)
			draw_line(c + Vector2(r * 0.9, 0), c + Vector2(r * 0.9, r * 0.35), color, r * 0.16, true)
			draw_line(c + Vector2(r * 1.1, 0), c + Vector2(r * 1.1, r * 0.35), color, r * 0.16, true)
		"compass":
			draw_arc(c, r, 0, TAU, 28, color, r * 0.18, true)
			var needle := PackedVector2Array([
				c + Vector2(0, -r * 0.7), c + Vector2(r * 0.28, r * 0.15),
				c, c + Vector2(-r * 0.28, r * 0.15),
			])
			draw_colored_polygon(needle, color)
		"heart":
			draw_circle(c + Vector2(-r * 0.35, -r * 0.25), r * 0.42, color)
			draw_circle(c + Vector2(r * 0.35, -r * 0.25), r * 0.42, color)
			var tri := PackedVector2Array([
				c + Vector2(-r * 0.72, -r * 0.1), c + Vector2(r * 0.72, -r * 0.1), c + Vector2(0, r * 0.85),
			])
			draw_colored_polygon(tri, color)
		"sun":
			draw_circle(c, r * 0.5, color)
			for i in range(8):
				var a2: float = (TAU / 8.0) * i
				var dir := Vector2(cos(a2), sin(a2))
				draw_line(c + dir * r * 0.68, c + dir * r * 1.05, color, r * 0.16, true)
		_:
			draw_arc(c, r * 0.6, 0, TAU, 16, color, r * 0.16, true)
