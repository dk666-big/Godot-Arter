# Godot-Arter 功能增强方案书

## Godot-Arter Feature Enhancement Roadmap

**版本：** v2.0  
**作者：** Godot-Arter 开发团队  
**日期：** 2025年

---

## 概述

本文档包含 Godot-Arter 工坊的完整功能增强规划：

1. **音效制作模块** - 新增音效/音乐生成
2. **烛火剧场增强** - 剧情模块全面升级
3. **角色工坊增强** - 角色生成能力提升
4. **地图功能增强** - TileSet 可视化编辑
5. **性能与体验优化** - 性能、缓存、快捷键
6. **AI 能力增强** - 更多 AI 辅助功能
7. **Godot 集成增强** - 深度 Godot 集成

---

## 第一部分：音效制作模块 🎵

### 1.1 模块定位

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

## 第二部分：烛火剧场增强 🎭

### 2.1 AI 对话生成

#### 2.1.1 功能说明
输入角色设定和场景描述后，AI 自动生成对话内容。

#### 2.1.2 输入参数
| 参数 | 说明 |
|------|------|
| 角色设定 | 角色性格、背景、说话风格 |
| 场景描述 | 当前场景的氛围、地点 |
| 对话数量 | 生成几句对话 |
| 对话风格 | 正式/轻松/紧张/幽默 |

#### 2.1.3 实现方式
```typescript
async function generateDialogue(
  character: CharacterProfile,
  scene: SceneDescription,
  options: {
    count?: number
    style?: 'formal' | 'casual' | 'tense' | 'humorous'
  }
): Promise<Dialogue[]> {
  const prompt = `
角色：${character.name}
性格：${character.personality}
说话风格：${character.speakingStyle}
场景：${scene.description}
氛围：${scene.mood}

请生成 ${options.count || 5} 句对话：
`
  return await callTextGen(prompt, 'chat')
}
```

### 2.2 分支剧情树（可视化编辑）

#### 2.2.1 功能说明
可视化的剧情分支图，支持拖拽编辑。

#### 2.2.2 UI 设计
```
        ┌─────────────────┐
        │   序章·开始    │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌───────┐  ┌───────┐  ┌───────┐
│ 路线A │  │ 路线B │  │ 路线C │
│ (战斗)│  │(潜入) │  │(说服) │
└───┬───┘  └───┬───┘  └───┬───┘
    │          │          │
    ▼          ▼          ▼
┌───────┐  ┌───────┐  ┌───────┐
│ BOSS  │  │ BOSS  │  │ BOSS  │
│ (困难)│  │(普通) │  │ (Easy)│
└───────┘  └───────┘  └───────┘
```

#### 2.2.3 交互功能
| 功能 | 说明 |
|------|------|
| 拖拽节点 | 调整节点位置 |
| 添加分支 | 右键菜单添加新分支 |
| 连接节点 | 拖拽连接线 |
| 条件标记 | 设置分支条件（flag） |
| 预览模式 | 模拟剧情分支 |

### 2.3 多角色对话

#### 2.3.1 功能说明
支持一个分镜内多个角色同时存在和对话。

#### 2.3.2 数据结构
```typescript
interface MultiDialogueShot {
  id: string
  background: string
  characters: {
    id: string
    name: string
    position: 'left' | 'center' | 'right'
    expression: string
    visible: boolean
  }[]
  dialogues: {
    speakerId: string
    text: string
    emotion: 'normal' | 'happy' | 'angry' | 'sad'
  }[]
}
```

### 2.4 音效/BGM 绑定

#### 2.4.1 功能说明
为分镜或场景绑定背景音乐和音效。

#### 2.4.2 绑定选项
| 类型 | 说明 |
|------|------|
| BGM | 背景音乐（支持淡入淡出） |
| 环境音 | 风声、雨声、人群等 |
| 音效 | 特定音效（脚步声、门声等） |

### 2.5 语音合成（TTS）

#### 2.5.1 功能说明
接入 TTS API，为对话生成语音。

#### 2.5.2 配置参数
| 参数 | 说明 |
|------|------|
| 声音 | 每个角色选择不同声音 |
| 语速 | 0.5x - 2x |
| 音调 | -12 到 +12 |
| 情绪 | 开心/悲伤/愤怒/平静 |

---

## 第三部分：角色工坊增强 🧍

### 3.1 多角度批量生成

#### 3.1.1 功能说明
一键生成角色的正面/侧面/背面三视图。

#### 3.1.2 生成模式
```
┌─────────┐
│  正面   │  ← 角色正脸 + 身体正面
├─────────┤
│ 侧面    │  ← 角色侧脸 + 身体侧面
├─────────┤
│ 背面    │  ← 角色后背 + 身体背面
└─────────┘
```

#### 3.1.3 自动裁剪
生成后自动裁剪成独立图片，方便导入 Godot 骨骼动画。

### 3.2 角色换装系统

#### 3.2.1 分层结构
```
角色身体
├── 底层：身体/皮肤
├── 中层：服装（如盔甲、袍子）
├── 顶层：配饰（如帽子、披风）
└── 武器：手持物品
```

#### 3.2.2 导出格式
导出为 Godot 可用的分层图片，Godot 端使用 Shader 或多 Sprite 实现换装。

### 3.3 动画序列导出

#### 3.3.1 功能说明
直接导出行走、攻击、待机等动画序列为 Godot 格式。

#### 3.3.2 导出选项
| 格式 | 说明 |
|------|------|
| SpriteFrames | Godot 原生动画格式 |
| PNG 序列 | 每帧一张图 |
| 翻转复用 | 仅生成一半，Godot 翻转 |

---

## 第四部分：地图功能增强 🗺️

### 4.1 TileSet 可视化编辑

#### 4.1.1 功能说明
在网页上直接编辑 TileSet 的碰撞形状和属性。

#### 4.1.2 编辑工具
| 工具 | 说明 |
|------|------|
| 碰撞绘制 | 绘制碰撞区域 |
| 地形刷 | 绘制地形类型 |
| 物体放置 | 放置树木、石头等 |
| 事件标记 | 标记触发区域 |

#### 4.1.3 Godot 导出
直接导出为 `.gd` TileSet 资源文件。

### 4.2 多层地图系统

#### 4.2.1 层级结构
```
地图层
├── 底层：地形（草地、道路、水域）
├── 碰撞层：不可通行区域
├── 装饰层：树木、花草、石头
├── 事件层：触发器、NPC 位置
└── 顶层：云彩、粒子效果
```

### 4.3 自动寻路测试

#### 4.3.1 功能说明
内置 A* 寻路算法，可视化显示寻路路径。

#### 4.3.2 可视化
- 绿色：可通行区域
- 红色：障碍物
- 蓝色线：寻路路径
- 黄色星：起点/终点

---

## 第五部分：性能与体验优化 ⚡

### 5.1 进度条优化

#### 5.1.1 功能说明
批量生成时显示预估剩余时间。

#### 5.1.2 显示内容
```
正在生成 3/10...
████████████░░░░░░░ 60%
预计剩余时间：35 秒
```

#### 5.1.3 实现方式
```typescript
function estimateRemainingTime(
  completed: number,
  total: number,
  elapsedMs: number
): number {
  const avgTimePerItem = elapsedMs / completed
  const remaining = total - completed
  return avgTimePerItem * remaining
}
```

### 5.2 本地缓存增强

#### 5.2.1 功能说明
IndexedDB 增强，支持更大的素材库。

#### 5.2.2 优化项
| 优化 | 说明 |
|------|------|
| 分片存储 | 大文件分片存储 |
| 懒加载 | 只加载可见区域的缩略图 |
| 压缩存储 | 启用 Brotli 压缩 |
| 自动清理 | 定期清理过期缓存 |

### 5.3 项目管理

#### 5.3.1 功能说明
多项目切换、导入/导出/备份。

#### 5.3.2 项目列表
```
📁 我的项目
├── ⚔️ 暗黑守卫（进行中）
├── 🏰 城堡防御（暂停）
├── 🌲 森林探险（已完成）
└── ➕ 新建项目
```

#### 5.3.3 项目操作
| 操作 | 说明 |
|------|------|
| 新建 | 创建空白项目 |
| 导入 | 导入项目压缩包 |
| 导出 | 导出项目为 zip |
| 备份 | 自动云备份 |
| 版本历史 | 恢复历史版本 |

### 5.4 全局快捷键

#### 5.4.1 快捷键列表
| 快捷键 | 功能 |
|--------|------|
| Ctrl+1~9 | 切换模块 |
| Ctrl+S | 保存 |
| Ctrl+E | 导出 |
| Ctrl+Z | 撤销 |
| Ctrl+Y | 重做 |
| Space | 播放/暂停预览 |
| Esc | 关闭弹窗/停止 |

---

## 第六部分：AI 能力增强 🤖

### 6.1 LLM 剧情续写

#### 6.1.1 功能说明
输入大纲，AI 自动生成完整章节。

#### 6.1.2 输入输出
```
输入：
- 章节标题
- 主要角色
- 剧情大纲（3-5句）
- 目标字数

输出：
- 完整章节内容
- 分镜自动切分
- 角色对话生成
```

### 6.2 图片风格迁移

#### 6.2.1 功能说明
一键转换素材风格（像素风/手绘风/写实风）。

#### 6.2.2 支持风格
| 风格 | 说明 |
|------|------|
| pixel-art | 像素化 |
| hand-drawn | 手绘风格 |
| watercolor | 水彩画 |
| sketch | 素描 |

### 6.3 批量重命名

#### 6.3.1 功能说明
AI 分析素材内容，自动生成描述性名称。

#### 6.3.2 命名规则
```
原始：IMG_001.png
AI 分析：场景_森林_白天_树木_左侧.png
用户可自定义规则模板
```

### 6.4 智能推荐

#### 6.4.1 功能说明
根据当前项目推荐相关素材和功能。

#### 6.4.2 推荐类型
| 推荐 | 说明 |
|------|------|
| 素材推荐 | 根据场景推荐配套素材 |
| 风格推荐 | 统一项目风格 |
| 工作流推荐 | 优化生产流程 |

---

## 第七部分：Godot 集成增强 🎮

### 7.1 GDScript 脚本生成

#### 7.1.1 功能说明
根据剧情数据自动生成 Godot 脚本。

#### 7.1.2 生成内容
```gdscript
# 自动生成的剧情脚本
extends Node

signal dialogue_finished
signal choice_made(choice_id: String)

const SCENES := {
    "scene_1": preload("res://scenes/scene_1.tres"),
    "scene_2": preload("res://scenes/scene_2.tres"),
}

func play_scene(scene_id: String) -> void:
    var scene_data = SCENES.get(scene_id)
    if scene_data:
        # 播放逻辑
        pass

func _on_dialogue_finished() -> void:
    emit_signal("dialogue_finished")
```

### 7.2 远程预览（手机扫码）

#### 7.2.1 功能说明
手机扫码后在真机上预览游戏效果。

#### 7.2.2 实现方式
```
PC 工坊 ──生成预览码──► 手机扫码 ──► WebPreview ──► Godot Remote
```

### 7.3 项目同步

#### 7.3.1 功能说明
直接同步到 Godot 项目目录。

#### 7.3.2 同步选项
| 模式 | 说明 |
|------|------|
| 手动同步 | 导出后手动复制 |
| 自动同步 | 监听文件变化自动同步 |
| 云同步 | 通过 Git 或云盘同步 |

---

## 开发优先级

### P0（必须）
- [ ] 音效制作模块基础功能
- [ ] 进度条优化
- [ ] 项目管理

### P1（重要）
- [ ] AI 对话生成
- [ ] 多角色对话
- [ ] 角色换装系统
- [ ] TileSet 可视化编辑

### P2（增强）
- [ ] 分支剧情树
- [ ] 语音合成
- [ ] 图片风格迁移
- [ ] 远程预览

### P3（优化）
- [ ] 自动寻路测试
- [ ] 批量重命名
- [ ] 智能推荐
- [ ] 全局快捷键

---

## 技术依赖

### 前端依赖
- Web Audio API
- IndexedDB
- Canvas API
- WebSocket（远程预览）

### 后端依赖（如需）
- 音频生成 API（Suno/Udio）
- TTS API（ElevenLabs）
- LLM API（GPT-4/Claude）

### Godot 端
- Godot 4.x
- GDScript
- ResourceSystem

---

## 总结

本文档规划了 Godot-Arter 工坊的完整功能增强路线：

| 模块 | 主要功能 | 开发周期 |
|------|----------|----------|
| 音效工坊 | 音效/音乐生成、剪辑、导出 | 4-6 周 |
| 烛火剧场 | AI对话、分支剧情、TTS | 3-4 周 |
| 角色工坊 | 多角度、换装、动画导出 | 2-3 周 |
| 地图功能 | TileSet编辑、多层地图 | 2-3 周 |
| 性能优化 | 进度条、缓存、快捷键 | 1-2 周 |
| AI增强 | 剧情续写、风格迁移 | 2-3 周 |
| Godot集成 | 脚本生成、远程预览 | 1-2 周 |

**总计：** 15-23 周

---

**文档版本：** 2.0  
**最后更新：** 2025年  
**状态：** 规划中

