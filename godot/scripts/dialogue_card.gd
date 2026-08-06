class_name DialogueCard
extends PanelContainer
## Ports DialogueCard.jsx — one character speaking. Advance/dismiss is handled
## by whichever screen owns the beat sequence, same as the React version.

@export var who: String = "Comet"
@export var text: String = ""
@export var accent: Color = Palette.INK

@onready var _avatar: Comet = $Margin/Row/Avatar
@onready var _who_label: Label = $Margin/Row/Col/WhoLabel
@onready var _text_label: Label = $Margin/Row/Col/TextLabel


func _ready() -> void:
	refresh()


func refresh() -> void:
	_who_label.text = who
	_text_label.text = text
	_avatar.set_accent(accent)
