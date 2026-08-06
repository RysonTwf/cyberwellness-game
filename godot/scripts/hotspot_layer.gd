class_name HotspotLayer
extends Node2D
## Ports the .hotspot pin+label markup in World.jsx. Lives under the same
## uniformly-scaled scene root as TravelerController, so hotspot positions use
## the same world-unit -> scene-pixel conversion (world * SCENE_SCALE).

const SCENE_SCALE := Vector2(5.6, 2.8)

## Array[Dictionary]: {id, x, y, label, action, accent (Color)}
var hotspots: Array = []
var active_id: String = ""


func set_hotspots(list: Array) -> void:
	hotspots = list
	queue_redraw()


func set_active(id: String) -> void:
	if active_id == id:
		return
	active_id = id
	queue_redraw()


func _draw() -> void:
	for spot in hotspots:
		var pos: Vector2 = Vector2(spot["x"], spot["y"]) * SCENE_SCALE
		var accent: Color = spot.get("accent", Palette.INK)
		var near: bool = spot["id"] == active_id

		# pin: a small teardrop — circle + downward point
		var r: float = 7.0 if near else 6.0
		draw_circle(pos + Vector2(0, -r * 1.6), r, accent)
		draw_colored_polygon(PackedVector2Array([
			pos + Vector2(-r * 0.5, -r * 0.7),
			pos + Vector2(r * 0.5, -r * 0.7),
			pos,
		]), accent)
		draw_circle(pos + Vector2(0, -r * 1.6), r * 0.4, Palette.PAPER)

		# label, above the pin
		var font := ThemeDB.fallback_font
		var label: String = str(spot["label"])
		var font_size := 13
		var text_size: Vector2 = font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
		var label_pos: Vector2 = pos + Vector2(-text_size.x / 2.0, -r * 1.6 - r - 6.0)
		draw_string(font, label_pos, label, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Palette.INK)
