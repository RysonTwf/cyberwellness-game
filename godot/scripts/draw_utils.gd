class_name DrawUtils
extends RefCounted
## Small shared _draw() helpers for the procedural (no-image-asset) art style
## used throughout this project (design.md §9: every scene is SVG shapes).

## Godot has no draw_ellipse; approximate with an N-gon and non-uniform radii.
static func ellipse_points(cx: float, cy: float, rx: float, ry: float, segments: int = 24) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in range(segments):
		var a: float = (float(i) / segments) * TAU
		pts.append(Vector2(cx + cos(a) * rx, cy + sin(a) * ry))
	return pts


## Samples an SVG-style quadratic bezier (absolute start/control/end points).
static func quad_bezier_points(p0: Vector2, c: Vector2, p1: Vector2, segments: int = 8) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in range(segments + 1):
		var t: float = float(i) / segments
		var mt: float = 1.0 - t
		pts.append(p0 * (mt * mt) + c * (2.0 * mt * t) + p1 * (t * t))
	return pts


## Must be called from inside ci's own _draw() (ci is normally `self`).
static func draw_dashed_polyline(ci: CanvasItem, points: PackedVector2Array, dash: float, gap: float, color: Color, width: float) -> void:
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
				ci.draw_line(a.lerp(b, t / seg), a.lerp(b, (t + step) / seg), color, width, true)
			t += step
			remaining -= step
			if remaining <= 0.001:
				draw_on = not draw_on
				remaining = dash if draw_on else gap
