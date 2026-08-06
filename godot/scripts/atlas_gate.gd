extends Control
## Ports AtlasGate.jsx — the prologue: Comet unfolds from the journal, the
## player gets a name. Copy is verbatim from the React BEATS array.

const COMET_CATCHPHRASE := "Every good traveler carries two things: curiosity, and a second thought."

const BEATS := [
	"Oh — hello! You opened it. Most people just dust these off and put them back on the shelf.",
	"I'm Comet. This is the Atlas — every path the internet takes, drawn out as a map. And you, lucky page-turner, are about to become a Traveler.",
]

@onready var _beat0: DialogueCard = $Scroll/Margin/Col/BeatsBox/Beat0
@onready var _beat1: DialogueCard = $Scroll/Margin/Col/BeatsBox/Beat1
@onready var _keep_reading: Button = $Scroll/Margin/Col/KeepReadingBtn
@onready var _naming_box: VBoxContainer = $Scroll/Margin/Col/NamingBox
@onready var _catchphrase: DialogueCard = $Scroll/Margin/Col/NamingBox/CatchphraseCard
@onready var _name_edit: LineEdit = $Scroll/Margin/Col/NamingBox/PassportCard/PMargin/PCol/NameEdit
@onready var _open_btn: Button = $Scroll/Margin/Col/NamingBox/OpenBtn

var _beat_index: int = 0


func _ready() -> void:
	_beat0.text = BEATS[0]
	_beat0.refresh()
	_beat1.text = BEATS[1]
	_beat1.refresh()
	_beat1.visible = false

	_catchphrase.who = "Comet"
	_catchphrase.text = "%s Ready to see the map?" % COMET_CATCHPHRASE
	_catchphrase.refresh()

	_keep_reading.pressed.connect(_advance)
	_open_btn.pressed.connect(_begin)
	_name_edit.text_changed.connect(_on_name_changed)
	_name_edit.text_submitted.connect(func(_t): _begin())
	_open_btn.disabled = true


func _advance() -> void:
	_beat_index += 1
	if _beat_index == 1:
		_beat1.visible = true
	if _beat_index >= BEATS.size():
		_keep_reading.visible = false
		_naming_box.visible = true
		_name_edit.grab_focus()


func _on_name_changed(new_text: String) -> void:
	_open_btn.disabled = new_text.strip_edges().is_empty()


func _begin() -> void:
	var trimmed := _name_edit.text.strip_edges()
	if trimmed.is_empty():
		return
	JourneyManager.set_traveler_name(trimmed)
	get_tree().change_scene_to_file("res://scenes/atlas_map.tscn")
