class_name CutsceneShot
extends Resource

@export var id: String = ""
@export var image_path: String = ""
@export var speaker: String = ""
@export var speaker_color: Color = Color.WHITE
@export_multiline var text: String = ""
@export var typewriter_speed: float = 0.03
@export var entry_anim: String = "fade"
@export var transition: String = "fade"
@export var duration: float = 0.0
@export_range(0.0, 1.0) var darken_bg: float = 0.6
@export_range(0.0, 1.0) var camera_shake: float = 0.0
@export_range(0.1, 1.0) var slow_motion: float = 1.0
@export var choices: Array[CutsceneChoice] = []
@export var goto_scene: String = ""
@export var goto_shot: String = ""
@export var on_complete_signal: String = ""
