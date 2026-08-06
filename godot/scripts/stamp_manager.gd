extends Node
## Autoload: which stamps are earned, and what they look like.
##
## godot.md §7 — this is the project's badge_manager equivalent. It owns the
## stamp *presentation* facts (icon, label, accent, baked jitter) so every realm
## and the JournalProgress UI read one source instead of re-deriving them.

signal stamp_earned(realm_id: String)

## design.md §3 accents, carried token-for-token (godot.md §9).
const ACCENTS := {
	"passworld": Color("e0a030"),  # gold
	"privacy": Color("2d8c7f"),    # teal
	"bullybog": Color("e0637a"),   # coral
	"balance": Color("7b6ef6"),    # periwinkle
}

const STAMPS := {
	"passworld": {"icon": "key", "label": "Passworld · Visited"},
	"privacy": {"icon": "compass", "label": "Privacy Peaks · Visited"},
	"bullybog": {"icon": "heart", "label": "Bully Bog · Visited"},
	"balance": {"icon": "sun", "label": "Sun · Visited"},
}

## design.md's signature element: the jitter and rotation are randomised ONCE
## and then held, not re-rolled per frame (godot.md §9). Seeded per realm so the
## same realm always stamps the same way within a session.
var _jitter_seed: Dictionary = {}


func _ready() -> void:
	for id in JourneyManager.REALM_IDS:
		_jitter_seed[id] = randi()


func accent_for(realm_id: String) -> Color:
	return ACCENTS.get(realm_id, Color("1f3452"))


func stamp_for(realm_id: String) -> Dictionary:
	return STAMPS.get(realm_id, {})


## Random rotation ±6°, set once on stamp-earned, never re-rolled (godot.md §9).
func rotation_for(realm_id: String) -> float:
	var rng := RandomNumberGenerator.new()
	rng.seed = _jitter_seed.get(realm_id, 0)
	return deg_to_rad(rng.randf_range(-6.0, 6.0))


func award(realm_id: String) -> void:
	if JourneyManager.is_stamped(realm_id):
		return
	JourneyManager.mark_stamped(realm_id)
	stamp_earned.emit(realm_id)


func earned_count() -> int:
	var n := 0
	for id in JourneyManager.REALM_IDS:
		if JourneyManager.is_stamped(id):
			n += 1
	return n
