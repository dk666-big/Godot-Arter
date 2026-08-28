# 音效制作模块方案书

## Godot-Arter 音效制作模块 / Audio Workshop Module

**版本：** v1.0  
**作者：** Godot-Arter 开发团队  
**日期：** 2025年

---

## 一、模块定位

### 1.1 目标
为 Godot-Arter 工坊新增 **「🎵 音效工坊」** 模块，提供游戏音效和音乐的生成、编辑、管理能力。

### 1.2 核心能力
| 功能 | 说明 |
|------|------|
| 🎵 音效生成 | AI 生成游戏音效（攻击/拾取/脚步声等） |
| 🎼 音乐生成 | AI 生成背景音乐（BGM/战斗/商店等风格） |
| ✂️ 音频剪辑 | 裁剪/拼接/淡入淡出 |
| 🔊 音效调节 | 音量/音调/时长调节 |
| 📥 Godot 导出 | 直接导出为 Godot 可用格式 |

### 1.3 与现有模块的协同
```
角色工坊 ──生成角色动画──┐
                          ├──► 音效工坊 ──► Godot 项目
场景工坊 ──生成场景──────┤
烛火剧场 ──剧情对话──────┘
```

---

## 二、功能详细设计

### 2.1 音效生成（Sound Effects）

#### 2.1.1 预设音效类型
| 类型 | 英文标签 | 示例 |
|------|----------|------|
| 攻击音效 | attack | 剑击、拳击、射击 |
| 拾取音效 | pickup | 金币、道具、血包 |
| 移动音效 | movement | 脚步声、翅膀声 |
| 界面音效 | ui | 点击、确认、取消 |
| 技能音效 | skill | 魔法、buff、debuff |
| 环境音效 | ambient | 风声、雨声、雷声 |
| 伤害音效 | damage | 受击、死亡、爆裂 |
| 成功音效 | success | 升级、通关、胜利 |
| 失败音效 | failure | 失败、游戏结束 |

#### 2.1.2 音效生成参数
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| 提示词 | text | - | 音效描述，如"金属剑击声" |
| 类型 | select | attack | 预设类型 |
| 时长 | range | 0.5-3s | 音效时长 |
| 强度 | slider | 0-100% | 音量强度 |

#### 2.1.3 AI 生成
- **支持供应商**：与图片生成共用同一套 AI 供应商
- **API 端点**：需要支持音频生成的 API（如 Suno、Udio、自建音频模型）
- **fallback**：若无 API，支持生成 MIDI/SimpleAudio 数据

---

### 2.2 音乐生成（Music Generation）

#### 2.2.1 预设音乐类型
| 类型 | 标签 | 说明 |
|------|------|------|
| 主菜单 | menu | 舒缓、轻柔 |
| 战斗 | battle | 激烈、紧张 |
| 探索 | exploration | 轻快、神秘 |
| 商店 | shop | 欢快、轻松 |
| BOSS | boss | 压迫感、史诗 |
| 结局 | ending | 感人、治愈 |
| 失败 | defeat | 悲伤、低沉 |

#### 2.2.2 音乐生成参数
| 参数 | 类型 | 说明 |
|------|------|------|
| 提示词 | text | 音乐描述 |
| 类型 | select | 预设类型 |
| 时长 | range | 15-180s |
| BPM | number | 60-200 |
| 乐器 | multi-select | 钢琴/吉他/鼓/弦乐等 |
| 情绪 | select | 欢快/平静/悲伤/紧张 |

#### 2.2.3 循环标记
- 支持设置循环点（Loop In / Loop Out）
- 自动检测音乐节拍，智能标记循环

---

### 2.3 音频剪辑（Audio Editing）

#### 2.3.1 时间轴编辑器
```
|────●────────────────●────|
   Loop In            Loop Out
```

#### 2.3.2 编辑功能
| 功能 | 说明 |
|------|------|
| 裁剪 | 设置起止点 |
| 淡入淡出 | 0-5s 可调 |
| 音量调节 | -20dB 到 +6dB |
| 音调调节 | -12 到 +12 半音 |
| 速度调节 | 0.5x - 2x |
| 反转 | 音频反向 |
| 拼接 | 多段音频合并 |

#### 2.3.3 波形显示
- 显示音频波形图
- 支持鼠标拖拽选择区域
- 显示时长和音量峰值

---

### 2.4 音效管理（Sound Bank）

#### 2.4.1 分类管理
```
📁 音效库
├── ⚔️ 战斗音效
│   ├── 剑击_01.wav
│   ├── 剑击_02.wav
│   └── 弓箭发射.wav
├── 💰 拾取音效
│   ├── 金币.wav
│   └── 道具获得.wav
├── 👣 移动音效
│   ├── 脚步_草地.wav
│   └── 脚步_石板.wav
└── 🎵 背景音乐
    ├── menu_theme.wav
    └── battle_theme.wav
```

#### 2.4.2 搜索和筛选
- 按名称搜索
- 按类型筛选
- 按标签筛选
- 播放预览

---

### 2.5 Godot 导出

#### 2.5.1 导出格式
| 格式 | 说明 |
|------|------|
| `.wav` | 无损，Godot 原生支持 |
| `.ogg` | 有损压缩，体积小 |
| `.mp3` | 通用格式 |

#### 2.5.2 导出结构
```
export/
├── sfx/
│   ├── attack/
│   ├── pickup/
│   └── ui/
└── bgm/
    ├── menu.ogg
    └── battle.ogg
```

#### 2.5.3 Godot 资源文件
- 生成 `AudioStreamPlayer` 预制体代码
- 生成音效注册表 JSON
- 生成 Godot GDScript 加载脚本

---

## 三、技术实现

### 3.1 音频生成 API

#### 3.1.1 统一 API 预设体系
所有音频 API 统一在「API 预设」模块中配置，支持以下类型：

**图片生成供应商（已有）：**
| ID | 名称 | 说明 |
|----|------|------|
| mock | 本地演示 | Canvas 占位图 |
| openai | OpenAI DALL-E | 需要 API Key |
| siliconflow | SiliconFlow | 中转站 |
| custom:xxx | 自定义第三方 | 用户配置 |

**音频生成供应商（新增）：**
| ID | 名称 | 说明 |
|----|------|------|
| mock | 本地演示 | Web Audio 合成音效 |
| suno | Suno AI | 音乐生成 |
| udio | Udio AI | 音乐生成 |
| elevenlabs | ElevenLabs | 音效+语音 |
| tts | TTS 语音 | 文字转语音 |
| custom-audio:xxx | 自定义音频 API | 用户配置 |

#### 3.1.2 自定义音频 API 配置
在「API 预设」中新增「音频 API」配置项：

```typescript
interface AudioProviderPreset {
  id: string
  name: string           // 显示名称，如 "我的音频中转"
  type: 'suno' | 'udio' | 'elevenlabs' | 'tts' | 'custom'
  baseUrl: string        // API 基础地址
  apiKey: string        // API Key
  model?: string        // 可选模型
  enabled: boolean
}
```

#### 3.1.3 支持的 API 类型
| API 类型 | 用途 | 示例供应商 |
|----------|------|----------|
| 音乐生成 | BGM/主题曲 | Suno, Udio, 自建音乐模型 |
| 音效生成 | 游戏音效 | ElevenLabs, 自建音效模型 |
| 语音合成 | 角色对话 | ElevenLabs, Azure TTS, 自建 TTS |
| 音频编辑 | 变调/特效 | 自建音频处理 API |
| 哼唱转谱 |哼唱转MIDI | 自建哼唱识别 API |

#### 3.1.4 替代方案（无 API 时）
| 方案 | 说明 |
|------|------|
| Web Audio API | 生成简单合成音效（beep/嗡鸣/节奏） |
| 预设音效库 | 内置常用音效（攻击/拾取/点击等） |
| MIDI 生成 | 生成 MIDI 再转音频 |

### 3.2 前端实现

#### 3.2.1 依赖
- **Web Audio API** - 音频播放和处理
- **AudioContext** - 音频上下文
- **AudioWorklet** - 自定义音频处理

#### 3.2.2 界面布局
```
┌─────────────────────────────────────────────────────────────┐
│  🎵 音效工坊                                                 │
├───────────────┬─────────────────────────────────────────────┤
│               │                                              │
│  📁 音效库    │  🎛 音频编辑器 / 生成器                       │
│               │  ┌─────────────────────────────────────┐   │
│  ├─ ⚔️ 战斗   │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ waveform  │   │
│  ├─ 💰 拾取   │  └─────────────────────────────────────┘   │
│  ├─ 👣 移动   │  00:02.345 ─────●────────── 00:05.678      │
│  └─ 🎵 音乐   │                                              │
│               │  [⏮] [▶️ Play] [⏹] [⏭]                    │
│  ───────────  │                                              │
│  + 新建分类   │  音量: ████████░░ 80%                       │
│               │  音调: ██████░░░░ +2 半音                   │
│               │                                              │
│               │  [✂️ 裁剪] [⤴️ 淡入] [⤵️ 淡出] [🔄 反转]    │
│               │                                              │
├───────────────┴─────────────────────────────────────────────┤
│  🎼 音乐生成                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 描述: 轻快的冒险音乐，适合探索场景...                │    │
│  └─────────────────────────────────────────────────────┘    │
│  类型: [探索 ▼]  时长: [60s ▼]  乐器: [🎹🎸🥁]             │
│                                                              │
│  [✨ AI 生成音乐]                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 数据结构

```typescript
// 音效项
interface SFXItem {
  id: string
  name: string
  category: string
  type: 'sfx' | 'bgm'
  url: string  // Blob URL 或 base64
  duration: number  // 秒
  format: 'wav' | 'ogg' | 'mp3'
  tags: string[]
  createdAt: number
}

// 音效分类
interface SFXCategory {
  id: string
  name: string
  icon: string
  items: SFXItem[]
}

// 音乐项目
interface MusicProject {
  id: string
  name: string
  prompt: string
  type: 'menu' | 'battle' | 'exploration' | 'shop' | 'boss' | 'ending'
  duration: number
  bpm: number
  instruments: string[]
  url: string
  loopIn: number
  loopOut: number
}
```

---

## 四、API 设计

### 4.1 统一 API 预设配置

所有 API（图片、音频、TTS）统一在「API 预设」面板管理：

```
🔌 API 预设
├── 📷 图片生成
│   ├── OpenAI (DALL-E)
│   ├── SiliconFlow
│   └── 🔌 自定义第三方 API
│       └── Base URL / API Key / 模型
│
├── 🎵 音频生成
│   ├── Suno AI
│   ├── Udio AI
│   ├── ElevenLabs (音效/语音)
│   └── 🔌 自定义音频 API
│       └── Base URL / API Key / 模型
│
└── 🗣️ 语音合成 (TTS)
    ├── ElevenLabs
    ├── Azure TTS
    └── 🔌 自定义 TTS API
        └── Base URL / API Key / 声音模型
```

### 4.2 音频生成接口

```typescript
// 统一调用入口
async function callAudioGen(
  prompt: string,
  type: 'sfx' | 'music' | 'tts',
  options: {
    provider?: string      // 'suno' | 'udio' | 'mock' | 'custom:xxx'
    duration?: number      // 时长（秒）
    bpm?: number          // 音乐 BPM
    instruments?: string[] // 乐器
    voice?: string        // TTS 声音
    model?: string        // 指定模型
  }
): Promise<{
  url: string            // 音频 Blob URL
  duration: number       // 时长（秒）
  format: 'wav' | 'mp3' | 'ogg'
}>

// 内部实现
async function callAudioGen(prompt, type, opts = {}) {
  const { provider = 'mock' } = opts
  
  // 本地演示模式
  if (provider === 'mock') {
    return synthesizeLocalAudio(prompt, type, opts)
  }
  
  // 自定义第三方
  if (provider.startsWith('custom-audio:')) {
    const id = provider.slice('custom-audio:'.length)
    const preset = getAudioPresets().find(p => p.id === id)
    if (!preset) throw new Error('音频预设不存在')
    return callCustomAudioAPI(prompt, type, preset, opts)
  }
  
  // 内置供应商
  switch (provider) {
    case 'suno': return callSunoAPI(prompt, opts)
    case 'udio': return callUdioAPI(prompt, opts)
    case 'elevenlabs': return callElevenLabsAPI(prompt, type, opts)
    case 'tts': return callTTSAPI(prompt, opts)
    default: throw new Error('不支持的音频供应商')
  }
}
```

### 4.3 自定义音频 API 配置

```typescript
// 获取音频预设
function getAudioPresets(): AudioProviderPreset[] {
  const stored = localStorage.getItem('dsh-game-art-studio:audioProviders')
  return stored ? JSON.parse(stored) : []
}

// 保存音频预设
function saveAudioPresets(presets: AudioProviderPreset[]) {
  localStorage.setItem('dsh-game-art-studio:audioProviders', JSON.stringify(presets))
}

// 调用自定义音频 API
async function callCustomAudioAPI(
  prompt: string,
  type: string,
  preset: AudioProviderPreset,
  opts: any
): Promise<AudioResult> {
  const endpoint = preset.baseUrl.replace(/\/+$/, '') + '/v1/audio/generate'
  
  const body: any = {
    prompt,
    model: opts.model || preset.model || 'default'
  }
  
  if (type === 'sfx') {
    body.duration = opts.duration || 1
  } else if (type === 'music') {
    body.duration = opts.duration || 60
    if (opts.bpm) body.bpm = opts.bpm
    if (opts.instruments) body.instruments = opts.instruments
  }
  
  // 优先要二进制音频
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + preset.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  if (!response.ok) throw new Error(`API 错误: ${response.status}`)
  
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  
  return {
    url,
    duration: await getAudioDuration(url),
    format: 'mp3'
  }
}
```

---

## 五、Godot 集成

### 5.1 导出文件结构

```
res://audio/
├── sfx/
│   ├── attack/
│   │   ├── sword_slash.wav
│   │   └── arrow_fire.wav
│   └── ui/
│       └── button_click.wav
└── bgm/
    ├── menu_theme.ogg
    └── battle_theme.ogg
```

### 5.2 自动生成脚本

```gdscript
# audio_registry.gd
extends Node

const SFX := {
    "attack/sword_slash": "res://audio/sfx/attack/sword_slash.wav",
    "attack/arrow_fire": "res://audio/sfx/attack/arrow_fire.wav",
    "ui/button_click": "res://audio/sfx/ui/button_click.wav",
}

const BGM := {
    "menu": "res://audio/bgm/menu_theme.ogg",
    "battle": "res://audio/bgm/battle_theme.ogg",
}

func play_sfx(sfx_name: String, volume: float = 0.0) -> void:
    if SFX.has(sfx_name):
        var player = AudioStreamPlayer.new()
        player.stream = load(SFX[sfx_name])
        player.volume_db = volume
        add_child(player)
        player.play()
        player.finished.connect(func(): player.queue_free())

func play_bgm(bgm_name: String, volume: float = 0.0, fade: bool = true) -> void:
    if BGM.has(bgm_name):
        # 实现淡入淡出
        pass
```

---

## 六、开发计划

### Phase 1：基础框架（1-2周）
- [ ] 音频工坊 UI 框架
- [ ] 音频播放/暂停/停止
- [ ] 波形显示
- [ ] 基础剪辑功能（裁剪、淡入淡出）

### Phase 2：音效生成（1-2周）
- [ ] 音效生成器 UI
- [ ] Web Audio API 合成基础音效
- [ ] 音效预设库
- [ ] 音效分类管理

### Phase 3：音乐生成（1-2周）
- [ ] 音乐生成器 UI
- [ ] 接入音频生成 API
- [ ] 循环点设置
- [ ] 音乐分类管理

### Phase 4：Godot 导出（1周）
- [ ] 音频导出功能
- [ ] Godot 脚本生成
- [ ] 导出预览

---

## 七、界面预览

### 7.1 模块入口
在左侧导航栏新增：
```
🎵 音效工坊（新增）
```

### 7.2 主界面
采用与「角色工坊」「场景工坊」一致的设计风格：
- 左侧：文件浏览器/分类
- 中间：主工作区（波形编辑器/生成器）
- 右侧：属性面板

### 7.3 供应商选择器
与图片生成共用同一套供应商选择 UI：

```html
<select id="audio-provider">
  <option value="mock">🎭 本地演示(无Key)</option>
  <option value="suno">🎵 Suno AI</option>
  <option value="udio">🎵 Udio AI</option>
  <option value="elevenlabs">🎵 ElevenLabs</option>
  <option value="tts">🗣️ 文字转语音</option>
  <option value="custom-audio:xxx">🔌 我的音频中转</option>
  <option value="custom-audio:yyy">🔌 另一个中转站</option>
</select>
```

### 7.4 暗色主题
与整个工坊一致的暗黑童话风格：
- 主色：`#241c14`（深棕）
- 强调色：`#e8a33d`（烛金）
- 边框：`#594c39`

---

## 八、风险与挑战

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 音频生成 API 不成熟 | 功能受限 | 先做 Web Audio 合成 + 预设音效库 |
| 大音频文件处理 | 性能问题 | 分片加载、懒加载 |
| 跨域音频加载 | CORS 问题 | 走本地 Blob URL |
| 用户无音频 API | 功能不可用 | 提供离线演示模式 |

---

## 九、总结

音效制作模块是 Godot-Arter 工坊的重要扩展，将补全游戏开发的音频环节：

1. **提升完整性** - 从视觉到听觉，完善游戏资产生产闭环
2. **提高效率** - AI 生成 + 预设库，快速产出音效
3. **降低成本** - 内置合成器减少对外部资源的依赖
4. **深化集成** - 真正做到"从工坊到 Godot 一站式"

---

## 附录：参考案例

| 产品 | 特点 |
|------|------|
| Audacity | 专业音频编辑 |
| Bfxr | 8-bit 音效生成 |
| sfxr | 复古游戏音效 |
| Suno | AI 音乐生成 |
| ElevenLabs | AI 音效+语音 |

---

## 十、API 预设面板扩展

### 10.1 统一配置界面
在现有的「API 预设」面板中新增音频和 TTS 配置区域：

```
┌─────────────────────────────────────────────────────────────┐
│  🔌 API 预设                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📷 图片生成                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ OpenAI API Key:  [sk-xxxx]  💾 保存                  │  │
│  │ SiliconFlow API Key:  [sk-xxxx]  💾 保存            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  🎵 音频生成                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 供应商    │ Base URL              │ API Key          │  │
│  │ Suno AI   │ api.suno.ai/v1       │ [sk-xxxx]        │  │
│  │ Udio      │ api.udio.ai/v1        │ [sk-xxxx]        │  │
│  │ ElevenLabs│ api.elevenlabs.ai/v1  │ [sk-xxxx]        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  🗣️ 语音合成 (TTS)                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 供应商    │ Base URL              │ 声音模型          │  │
│  │ ElevenLabs│ api.elevenlabs.ai/v1  │ [下沉/活泼/...]   │  │
│  │ Azure TTS │ [自定义]              │ [sk-xxxx]        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  🔌 自定义第三方音频 API                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ + 新增预设                                             │  │
│  │                                                        │  │
│  │ 名称: [我的音频中转站____]                            │  │
│  │ Base URL: [https://audio-api.example.com/v1___]       │  │
│  │ API Key:  [sk-xxxx________________________________]   │  │
│  │ 类型:    [🎵 音乐生成 ▼]                              │  │
│  │ 模型:    [florence-audio-v2___________________]       │  │
│  │            [💾 保存] [🗑 删除]                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 供应商配置字段

```typescript
// 音频/TTS 预设配置
interface AudioProviderConfig {
  id: string              // 唯一标识
  name: string            // 显示名称
  type: 'suno' | 'udio' | 'elevenlabs' | 'tts' | 'azure' | 'custom'
  baseUrl?: string        // API 基础地址（custom 需要）
  apiKey?: string         // API Key
  model?: string          // 可选模型
  voice?: string          // TTS 声音选项
  enabled: boolean        // 是否启用
}
```

### 10.3 统一的供应商选择逻辑

```typescript
// 获取所有音频供应商选项（与图片供应商共用样式）
function getAudioProviderOptions(): string {
  const built = [
    { value: 'mock', label: '🎭 本地演示(无Key)' },
    { value: 'suno', label: '🎵 Suno AI' },
    { value: 'udio', label: '🎵 Udio AI' },
    { value: 'elevenlabs', label: '🎵 ElevenLabs' },
    { value: 'tts', label: '🗣️ 文字转语音' },
  ]
  
  // 从预设中加载自定义供应商
  const customs = getAudioPresets()
    .filter(p => p.enabled)
    .map(p => ({
      value: `custom-audio:${p.id}`,
      label: `🔌 ${p.name}`
    }))
  
  return [...built, ...customs].map(o => 
    `<option value="${o.value}">${o.label}</option>`
  ).join('')
}
```

---

**文档版本：** 1.1  
**最后更新：** 2025年  
**状态：** 待开发
