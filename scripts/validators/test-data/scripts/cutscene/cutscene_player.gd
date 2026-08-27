class_name InkTheaterPlayer
extends CanvasLayer

# 烛火剧场 · 单文件运行时播放器（参考实现，随剧情资产包交付）
# 用法：var t := InkTheaterPlayer.new(); add_child(t); t.play_id("prologue")
# 监听：finished(cutscene_id)
#       shot_event(event_name, cutscene_id, shot_id)  —— 分镜配置了"完成事件名"时触发
# 点击画面：打字中=立即显示全文；显示完=进入下一分镜。Esc 停止演出。

signal finished(cutscene_id: String)
signal shot_event(event_name: String, cutscene_id: String, shot_id: String)

var _cid := ""
var _data: CutsceneData
var _root: Control
var _holder: Control
var _shake_grp: Control
var _dim: ColorRect
var _img: TextureRect
var _dialog: PanelContainer
var _speaker: Label
var _text: RichTextLabel
var _hint: Label
var _choices_box: VBoxContainer
var _type_tween: Tween
var _move_tween: Tween
var _run_token := 0
var _typing := false
var _last_scene: CutsceneScene
var _last_idx := -1
var _last_shot: CutsceneShot

func _ready() -> void:
	layer = 100
	visible = false
	_build_ui()

func _build_ui() -> void:
	_root = Control.new()
	_root.name = "Stage"
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(_root)
	_dim = ColorRect.new()
	_dim.color = Color(0, 0, 0, 0)
	_dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.add_child(_dim)
	_holder = Control.new()
	_holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.add_child(_holder)
	_img = TextureRect.new()
	_img.set_anchors_preset(Control.PRESET_FULL_RECT)
	_img.offset_left = 32.0
	_img.offset_right = -32.0
	_img.offset_top = 24.0
	_img.offset_bottom = -232.0
	_img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_img.modulate = Color(1, 1, 1, 0)
	_img.pivot_offset = Vector2.ZERO
	_holder.add_child(_img)
	_shake_grp = Control.new()
	_shake_grp.set_anchors_preset(Control.PRESET_FULL_RECT)
	_shake_grp.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_shake_grp)
	_dialog = PanelContainer.new()
	_dialog.anchor_left = 0.04
	_dialog.anchor_right = 0.96
	_dialog.anchor_top = 1.0
	_dialog.anchor_bottom = 1.0
	_dialog.offset_top = -212.0
	_dialog.offset_bottom = -18.0
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.141, 0.110, 0.078, 0.94)
	style.border_color = Color(0.35, 0.30, 0.22)
	style.set_border_width_all(3)
	style.set_corner_radius_all(10)
	_dialog.add_theme_stylebox_override("panel", style)
	_dialog.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_shake_grp.add_child(_dialog)
	var vbox := VBoxContainer.new()
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_dialog.add_child(vbox)
	_speaker = Label.new()
	_speaker.add_theme_font_size_override("font_size", 15)
	_speaker.add_theme_color_override("font_color", Color(0.91, 0.64, 0.24))
	_speaker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(_speaker)
	_text = RichTextLabel.new()
	_text.bbcode_enabled = true
	_text.fit_content = true
	_text.custom_minimum_size = Vector2(0, 76)
	_text.add_theme_color_override("default_color", Color(0.94, 0.90, 0.82))
	_text.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(_text)
	_hint = Label.new()
	_hint.text = "点击继续 ▶"
	_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_hint.modulate = Color(1, 1, 1, 0.0)
	_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(_hint)
	_choices_box = VBoxContainer.new()
	_choices_box.anchor_left = 0.60
	_choices_box.anchor_right = 0.96
	_choices_box.anchor_top = 0.06
	_choices_box.add_theme_constant_override("separation", 10)
	_choices_box.visible = false
	_root.add_child(_choices_box)
	_root.gui_input.connect(_on_stage_input)

func play_id(cutscene_id: String) -> void:
	_cid = cutscene_id
	var path := "res://cutscenes/%s.tres" % cutscene_id
	if not ResourceLoader.exists(path):
		push_warning("InkTheater: 剧本不存在 %s" % path)
		return
	_data = load(path) as CutsceneData
	if _data == null:
		push_warning("InkTheater: 剧本类型不正确 %s" % path)
		return
	_run_token += 1
	_kill_move()
	_finish_type()
	visible = true
	if _data.chapters.is_empty():
		_end_show()
		return
	_play(_data.chapters[0].scenes[0], 0)

func stop() -> void:
	_visible_off()

func _exit_tree() -> void:
	_root = null

func _on_stage_input(event: InputEvent) -> void:
	if not visible or _data == null:
		return
	if event is InputEventMouseButton and event.pressed:
		_advance_click()

func _unhandled_key_input(event: InputEvent) -> void:
	if visible and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		stop()

func _advance_click() -> void:
	if _typing:
		_finish_type()
		return
	if _can_step() and _last_scene != null and _last_idx >= 0:
		_next_from(_last_scene, _last_idx, _last_shot, _run_token)

func _kill_move() -> void:
	if _move_tween != null and _move_tween.is_valid():
		_move_tween.kill()

func _finish_type() -> void:
	if _type_tween != null and _type_tween.is_valid():
		_type_tween.kill()
	_typing = false
	_text.visible_characters = -1
	_hint.modulate.a = 0.85

func _clear_choices() -> void:
	for c in _choices_box.get_children():
		c.queue_free()
	_choices_box.visible = false

func _token_ok(token: int) -> bool:
	return token == _run_token and visible

func _can_step() -> bool:
	return true

func _play(scene_res: CutsceneScene, idx: int) -> void:
	var token := _run_token
	if idx >= scene_res.shots.size():
		_next_after(scene_res, token)
		return
	var t: CutsceneShot = scene_res.shots[idx]
	_last_scene = scene_res
	_last_idx = idx
	_last_shot = t
	_clear_choices()
	_finish_type()
	_text.clear()
	_hint.modulate.a = 0.0
	_dim.color.a = t.darken_bg
	if t.image_path != "":
		_img.texture = load(t.image_path)
	else:
		_img.texture = null
	_speaker.text = t.speaker
	_speaker.add_theme_color_override("font_color", t.speaker_color)
	_text.text = t.text
	if t.on_complete_signal != "":
		_emit_event(t.on_complete_signal, t.id)
	_entry_anim(t.entry_anim, token)
	_do_shake(t.camera_shake)
	# 打字机（visible_characters 由 0 推进到总字数）
	_text.visible_characters = 0
	_typing = true
	var total_chars := t.text.length()
	var dur := total_chars * t.typewriter_speed / maxf(t.slow_motion, 0.05)
	_type_tween = create_tween()
	_type_tween.tween_property(_text, "visible_characters", total_chars, maxf(dur, 0.01))
	await _type_tween.finished
	if not _token_ok(token):
		return
	_typing = false
	_hint.modulate.a = 0.85
	if t.choices.size() > 0:
		for c in t.choices:
			var btn := Button.new()
			btn.text = c.text
			btn.pressed.connect(_on_choice.bind(c.next_shot_id))
			_choices_box.add_child(btn)
		_choices_box.visible = true
		_hint.modulate.a = 0.0
		return
	if t.duration > 0.0:
		await get_tree().create_timer(t.duration / maxf(t.slow_motion, 0.05)).timeout
		if not _token_ok(token):
			return
		_next_from(scene_res, idx, t, token)

func _next_from(scene_res: CutsceneScene, idx: int, t: CutsceneShot, token: int) -> void:
	if not _token_ok(token):
		return
	if t.goto_shot != "":
		var hit := find_shot(t.goto_shot)
		if hit.scene != null:
			_play(hit.scene, hit.index)
			return
	if t.goto_scene != "":
		var s := find_scene(t.goto_scene)
		if s != null and s.shots.size() > 0:
			_play(s, 0)
			return
	if idx + 1 < scene_res.shots.size():
		_play(scene_res, idx + 1)
		return
	_next_after(scene_res, token)

func _next_after(scene_res: CutsceneScene, token: int) -> void:
	if not _token_ok(token) or _data == null:
		return
	for ch in _data.chapters:
		var ci := _data.chapters.find(ch)
		for i in range(ch.scenes.size()):
			if ch.scenes[i] == scene_res:
				if i + 1 < ch.scenes.size():
					_play(ch.scenes[i + 1], 0)
					return
				if ci >= 0 and ci + 1 < _data.chapters.size():
					var nxt: CutsceneChapter = _data.chapters[ci + 1]
					if nxt.scenes.size() > 0:
						_play(nxt.scenes[0], 0)
						return
	_end_show()

func _on_choice(next_shot_id: String) -> void:
	_clear_choices()
	if next_shot_id != "" and _data != null:
		var hit := find_shot(next_shot_id)
		if hit.scene != null:
			_play(hit.scene, hit.index)
			return
	if _last_scene != null and _last_idx >= 0:
		_next_from(_last_scene, _last_idx, _last_shot, _run_token)

func find_shot(id: String) -> Dictionary:
	if _data == null:
		return {"scene": null, "index": -1}
	for ch in _data.chapters:
		for sc in ch.scenes:
			for i in range(sc.shots.size()):
				if sc.shots[i].id == id:
					return {"scene": sc, "index": i}
	return {"scene": null, "index": -1}

func find_scene(id: String) -> CutsceneScene:
	if _data == null:
		return null
	for ch in _data.chapters:
		for sc in ch.scenes:
			if sc.id == id:
				return sc
	return null

func _entry_anim(mode: String, _token: int) -> void:
	_kill_move()
	_img.pivot_offset = _img.size * 0.5
	_img.modulate = Color(1, 1, 1, 0)
	_holder.position = Vector2.ZERO
	_holder.scale = Vector2.ONE
	_move_tween = create_tween()
	if mode == "slide_left":
		_holder.position = Vector2(42, 0)
		_move_tween.set_parallel(true)
		_move_tween.tween_property(_holder, "position", Vector2.ZERO, 0.55).set_ease(Tween.EASE_OUT)
		_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)
	elif mode == "slide_right":
		_holder.position = Vector2(-42, 0)
		_move_tween.set_parallel(true)
		_move_tween.tween_property(_holder, "position", Vector2.ZERO, 0.55).set_ease(Tween.EASE_OUT)
		_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)
	elif mode == "zoom_in":
		_holder.scale = Vector2(1.09, 1.09)
		_move_tween.set_parallel(true)
		_move_tween.tween_property(_holder, "scale", Vector2.ONE, 0.62).set_ease(Tween.EASE_OUT)
		_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)
	else:
		_move_tween.tween_property(_img, "modulate:a", 1.0, 0.45)

func _do_shake(intensity: float) -> void:
	if intensity <= 0.0:
		return
	var tw := create_tween()
	var steps := int(3.0 + intensity * 8.0)
	var amp := intensity * 9.0
	for i in steps:
		tw.tween_property(_shake_grp, "position", Vector2(randf_range(-amp, amp), randf_range(-amp, amp)), 0.03)
	tw.tween_property(_shake_grp, "position", Vector2.ZERO, 0.03)

func _end_show() -> void:
	_finished_emit()
	_visible_off()

func _finished_emit() -> void:
	finished.emit(_cid)

func _emit_event(event_name: String, shot_id: String) -> void:
	shot_event.emit(event_name, _cid, shot_id)
	if not has_signal(event_name):
		add_user_signal(event_name)
	emit_signal(event_name)

func _visible_off() -> void:
	_run_token += 1
	_kill_move()
	if _type_tween != null and _type_tween.is_valid():
		_type_tween.kill()
	_typing = false
	_clear_choices()
	_img.texture = null
	_img.modulate = Color(1, 1, 1, 0)
	_holder.position = Vector2.ZERO
	_holder.scale = Vector2.ONE
	_dim.color.a = 0.0
	_text.clear()
	_speaker.text = ""
	_hint.modulate.a = 0.0
	_last_scene = null
	_last_idx = -1
	_last_shot = null
	visible = false
