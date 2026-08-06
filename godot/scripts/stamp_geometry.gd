class_name StampGeometry
extends RefCounted
## Ports StampBadge.jsx's roughCircle/seedFrom/makeRandom verbatim, so a given
## realm roughens its stamp ring exactly as deterministically as the React
## version did (same seed -> same wobble).

## FNV-1a 32-bit, matching seedFrom() in StampBadge.jsx bit-for-bit.
static func seed_from(text: String) -> int:
	var h: int = 2166136261
	for i in range(text.length()):
		h = (h ^ text.unicode_at(i)) & 0xFFFFFFFF
		h = (h * 16777619) & 0xFFFFFFFF
	return h


## makeRandom(seed): a tiny LCG, one call per ring point.
static func _lcg_next(state: int) -> Array:
	var s: int = (state * 1664525 + 1013904223) & 0xFFFFFFFF
	return [s, float(s) / 4294967296.0]


## Jittered points around a circle, then smoothed to the midpoint polyline the
## same way roughCircle()'s quadratic-through-midpoints path reads visually.
static func rough_circle_smoothed(cx: float, cy: float, r: float, seed: int, points: int = 46, jitter: float = 1.5) -> PackedVector2Array:
	var s: int = seed & 0xFFFFFFFF
	if s == 0:
		s = 1
	var pts := PackedVector2Array()
	for i in range(points):
		var a: float = (float(i) / points) * TAU
		var next := _lcg_next(s)
		s = next[0]
		var rnd: float = next[1]
		var rr: float = r + (rnd - 0.5) * jitter * 2.0
		pts.append(Vector2(cx + cos(a) * rr, cy + sin(a) * rr))

	var mids := PackedVector2Array()
	for i in range(points + 1):
		var cur: Vector2 = pts[i % points]
		var nxt: Vector2 = pts[(i + 1) % points]
		mids.append((cur + nxt) / 2.0)
	return mids
