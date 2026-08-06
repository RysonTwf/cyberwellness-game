class_name AtlasSceneArt
extends Node2D
## Ports the AtlasScene() SVG from AtlasMap.jsx: the hub background — a
## journal-map with a ruled graticule, clouds, birds, a compass rose, the
## Stream running between four islands, and the Gate the Traveler arrived
## through. This is the screen the player returns to most (per the source
## comment), so it carries the full decorative pass, not just the islands.
##
## Coordinates are copied verbatim from the 560x280 viewBox in the source.

## Both the art position (svg) and the walk-space position (world) an island
## lives at — single source of truth, shared with AtlasMap's hotspot builder.
const ISLANDS := {
	"passworld": {"svg": Vector2(129, 190), "world": Vector2(23, 76)},
	"privacy": {"svg": Vector2(246, 178), "world": Vector2(44, 71)},
	"bullybog": {"svg": Vector2(364, 192), "world": Vector2(65, 77)},
	"balance": {"svg": Vector2(476, 180), "world": Vector2(85, 72)},
}


func _draw() -> void:
	draw_rect(Rect2(0, 0, 560, 280), Color("#e9eff1"))

	_draw_graticule()
	_draw_water_band()
	_draw_clouds()
	_draw_birds()
	_draw_compass_rose()
	_draw_water_texture()
	_draw_stream()
	_draw_islands()
	_draw_gate()


func _draw_graticule() -> void:
	var col := Color(Palette.INK, 0.055)
	for y in [40, 80, 120, 160, 200, 240]:
		draw_line(Vector2(0, y), Vector2(560, y), col, 1.0)
	for x in [70, 140, 210, 280, 350, 420, 490]:
		draw_line(Vector2(x, 0), Vector2(x, 280), col, 1.0)


func _draw_water_band() -> void:
	draw_rect(Rect2(0, 150, 560, 130), Color(Palette.INK, 0.05))


func _draw_clouds() -> void:
	var col := Color("#f6f9fa", 0.9)
	var clouds := [
		[[118, 60, 34, 15], [144, 53, 24, 17], [94, 54, 20, 12]],
		[[352, 42, 30, 13], [376, 36, 21, 15]],
		[[238, 112, 26, 10], [256, 107, 18, 12]],
	]
	for cluster in clouds:
		for c in cluster:
			draw_colored_polygon(DrawUtils.ellipse_points(c[0], c[1], c[2], c[3]), col)


func _draw_birds() -> void:
	var col := Color(Palette.INK, 0.3)
	var birds := [
		[Vector2(196, 82), Vector2(203, 76), Vector2(210, 82)],
		[Vector2(211, 79), Vector2(218, 73), Vector2(225, 79)],
		[Vector2(300, 60), Vector2(306, 55), Vector2(312, 60)],
	]
	for b in birds:
		draw_polyline(DrawUtils.quad_bezier_points(b[0], b[1], b[2], 8), col, 2.0, true)


func _draw_compass_rose() -> void:
	var c := Vector2(502, 66)
	draw_circle(c, 27, Color("#f6f9fa", 0.7))
	draw_arc(c, 27, 0, TAU, 32, Color(Palette.INK, 0.4), 1.6, true)
	draw_arc(c, 19, 0, TAU, 28, Color(Palette.INK, 0.28), 1.0, true)
	draw_colored_polygon(PackedVector2Array([
		c + Vector2(-26, 0), c + Vector2(0, -6), c + Vector2(26, 0), c + Vector2(0, 6),
	]), Color(Palette.INK, 0.26))
	draw_colored_polygon(PackedVector2Array([
		c + Vector2(0, 26), c + Vector2(6, 0), c + Vector2(0, -26), c + Vector2(-6, 0),
	]), Color(Palette.INK, 0.42))
	draw_colored_polygon(PackedVector2Array([
		c + Vector2(0, -26), c + Vector2(6, 0), c,
	]), Palette.GOLD)
	var font := ThemeDB.fallback_font
	draw_string(font, c + Vector2(-4, -34), "N", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(Palette.INK, 0.55))


func _draw_water_texture() -> void:
	var col := Color(Palette.INK, 0.12)
	var ripples := [Vector2(46, 252), Vector2(266, 258), Vector2(414, 246), Vector2(158, 268)]
	for p in ripples:
		draw_polyline(DrawUtils.quad_bezier_points(p, p + Vector2(10, -6), p + Vector2(40, 0), 8), col, 2.0, true)


func _draw_stream() -> void:
	# One long dashed path through all 4 islands' gaps, sampled from the
	# source's cubic-spline-ish sequence of S-commands via a coarse polyline.
	var pts := PackedVector2Array([
		Vector2(4, 222), Vector2(70, 214), Vector2(96, 176), Vector2(176, 168),
		Vector2(224, 174), Vector2(306, 184), Vector2(352, 176), Vector2(436, 164),
		Vector2(476, 170), Vector2(546, 174), Vector2(558, 156),
	])
	DrawUtils.draw_dashed_polyline(self, pts, 9.0, 9.0, Color(Palette.INK, 0.32), 3.5)


func _draw_islands() -> void:
	for id in JourneyManager.REALM_IDS:
		var info: Dictionary = ISLANDS.get(id, {})
		if info.is_empty():
			continue
		var pos: Vector2 = info["svg"]
		var accent: Color = StampManager.accent_for(id)
		var visited: bool = JourneyManager.is_stamped(id)

		draw_colored_polygon(DrawUtils.ellipse_points(pos.x, pos.y + 22, 52, 14), Color(accent, 0.22))

		var body := _island_body(pos)
		draw_colored_polygon(body, Color(accent, 0.92 if visited else 0.55))
		draw_polyline(body, Color(Palette.INK, 0.14), 2.0, true)

		# marker flag
		draw_rect(Rect2(pos.x - 1, pos.y - 56, 3.5, 30), Color(Palette.INK, 0.6))
		draw_colored_polygon(PackedVector2Array([
			pos + Vector2(2.5, -56), pos + Vector2(24.5, -48), pos + Vector2(2.5, -40),
		]), accent)

		if visited:
			var badge_c: Vector2 = pos + Vector2(32, -28)
			draw_circle(badge_c, 12, accent)
			draw_line(badge_c + Vector2(-5, 0), badge_c + Vector2(-1.5, 3.7), Color.WHITE, 2.6, true)
			draw_line(badge_c + Vector2(-1.5, 3.7), badge_c + Vector2(5, -3.5), Color.WHITE, 2.6, true)


## M {x-42} {y+14} q5 -32 19 -36  q11 -15 25 -6  q21 -4 27 19  q13 8 9 23  Z
func _island_body(pos: Vector2) -> PackedVector2Array:
	var cur := pos + Vector2(-42, 14)
	var out := PackedVector2Array([cur])
	var segs := [
		[Vector2(5, -32), Vector2(19, -36)],
		[Vector2(11, -15), Vector2(25, -6)],
		[Vector2(21, -4), Vector2(27, 19)],
		[Vector2(13, 8), Vector2(9, 23)],
	]
	for seg in segs:
		var c: Vector2 = cur + seg[0]
		var e: Vector2 = cur + seg[1]
		var sampled := DrawUtils.quad_bezier_points(cur, c, e, 8)
		for i in range(1, sampled.size()):
			out.append(sampled[i])
		cur = e
	return out


func _draw_gate() -> void:
	var col := Color(Palette.INK, 0.55)
	draw_rect(Rect2(14, 186, 7, 42), col)
	draw_rect(Rect2(46, 186, 7, 42), col)
	draw_rect(Rect2(9, 176, 49, 10), col)
