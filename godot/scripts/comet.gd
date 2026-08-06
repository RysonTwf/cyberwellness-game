class_name Comet
extends Control
## Ports the <Comet> SVG in src/components/Characters.jsx — a paper-airplane
## spirit, the guide present in every realm. Procedural, no image asset.

@export var comet_size: float = 44.0
@export var accent: Color = Palette.INK


func _ready() -> void:
	custom_minimum_size = Vector2(comet_size, comet_size)


func set_accent(c: Color) -> void:
	accent = c
	queue_redraw()


func _draw() -> void:
	var s: float = comet_size / 48.0

	# dotted flight trail: cubic bezier M3 40 C 12 38, 16 32, 15 27
	var p0 := Vector2(3, 40)
	var c1 := Vector2(12, 38)
	var c2 := Vector2(16, 32)
	var p1 := Vector2(15, 27)
	var trail_color := accent
	trail_color.a = 0.45
	for i in range(6):
		var t: float = i / 5.0
		var pt: Vector2 = p0.bezier_interpolate(c1, c2, p1, t)
		draw_circle(pt * s, 1.0 * s, trail_color)

	# upper wing
	draw_colored_polygon(PackedVector2Array([
		Vector2(44, 7) * s, Vector2(14, 24) * s, Vector2(23, 27) * s,
	]), accent)

	# lower wing, folded — darker via opacity so it reads as one paper
	var lower := accent
	lower.a *= 0.55
	draw_colored_polygon(PackedVector2Array([
		Vector2(44, 7) * s, Vector2(23, 27) * s, Vector2(26, 38) * s,
	]), lower)

	# fold crease
	var crease := Palette.PAPER
	crease.a = 0.9
	draw_line(Vector2(44, 7) * s, Vector2(23, 27) * s, crease, max(1.2 * s, 1.0), true)
