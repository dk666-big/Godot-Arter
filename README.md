# 🎮 Godot-Arter

**One-stop game art workshop with a Godot-ready workflow.**

> 📖 详细功能与操作说明见 [使用说明书.md](使用说明书.md) (User manual)

Godot-Arter is a browser-based game art studio designed around the Godot game engine workflow. It helps you create characters, sprite sheets, game assets, cutouts, seamless maps, and Godot export metadata — all in one place with **BYOK (Bring Your Own Key)** API support.

## ✨ Features

| Module | What it does |
|--------|--------------|
| 🧍 Character Workshop | AI-generate characters (single view / three views / 8-direction), pixel/chibi/anime styles, transparent PNG ready for Godot `Sprite2D` |
| 🎞️ Sprite Sheet Workshop | Upload a sprite sheet, auto-slice by columns/rows, preview animation, repack, export PNG + `SpriteFrames.json` |
| 🧱 Asset Forge | Batch-generate props / icons / FX from multiple prompts |
| ✂️ Smart Matting | Color-key cutout (local), AI matting (Replicate rembg), feather/stroke, transparent PNG export |
| 🗺️ Seamless Map | **Full AI-generated map mode** or tile mode; seamless processing; Wang Tiles; split to Godot TileSet; high-res zoomable preview |
| ✨ Post Processing | Palette quantization, sprite outline, resize — useful for pixel-art and Godot import optimization |
| 🔌 API Presets | Add custom third-party OpenAI-compatible / Stability / SiliconFlow API routes; auto-sync to all generators |
| ⚙️ Export Center | Generate `manifest.json`, package assets, Godot official docs links |

## 🚀 Quick Start

三种方式任选，全部无需构建，也不要求注入 DSH：

### Option A: 本地零依赖服务（推荐，全功能）

仅需 **Node.js ≥ 18**（无需 `npm install`），一行命令：

```bash
node server.mjs                 # 默认端口 3080
node server.mjs 5173            # 或用 PORT=8080 node server.mjs 指定端口
```

然后打开：

```
http://127.0.0.1:3080/game-art-studio
```

该服务自带图片代理（`/game-art-studio/api/proxy-image`），即使图床禁止跨域，
「序列帧自动切片 / 一键下载 / 无缝地图平铺」等需要读取图片像素的功能也全部可用。

### Option B: 直接双击打开 game-art-studio.html

无需任何服务，浏览器直接打开即可用（生成 / 显示 / 本地演示 / 入库 / 下载均正常）。
程序默认请求 `response_format=b64_json` 让图片直接本地化，摆脱跨域图片 URL 限制，
绝大多数中转站均可全功能使用；若某中转站既返回跨域远程 URL 又不支持 base64，
则仅「用远程图做画布切片」类操作受浏览器安全策略限制（显示、下载、入库不受影响）。
此时切到 Option A 或 C 即可解锁全部能力。

### Option C: 作为 DSH 插件运行（可选）

此项目同时是一个 DSH 插件，注入后可复用 DSH 的 web 托管与内置图片代理路由：

```bash
# Install dependencies if needed
npm install --ignore-scripts

# Build host + client
npx tsdown

# Inside DSH injector environment
dev_inject_plugin D:/path/to/Godot-Arter

# Reload after changes
dev_reload_package dsh-game-art-studio

# Package a release tarball
npm pack --ignore-scripts
```

注入后 DSH web 服务也会提供 `http://127.0.0.1:3080/game-art-studio`（同款独立页面），
并注册 `godot_export_manifest` 工具供对话区调用。

## 🔑 API Keys & Privacy

- Keys are stored **only in your browser `localStorage`** and sent **directly to the API provider you choose**.
- No key is uploaded to any server.
- You can use **OpenAI**, **Stability AI**, **Replicate**, **SiliconFlow**, or any **custom OpenAI-compatible relay**.
- No key? Use the built-in **local demo mode** to test the full pipeline with Canvas-generated placeholder images.

### Custom API Presets

Use the **API Presets** tab to add your own third-party route:

- Protocol: OpenAI-compatible / Stability style / SiliconFlow style
- Base URL: `https://api.example.com/v1` (auto-appends `/images/generations`)
- Model ID and API Key

## 🕹️ Godot Import Tips

- Characters: import transparent PNG as `Texture2D`, use `Sprite2D`; pixel art → `Filter: Nearest`
- Sprite sheets: create a `SpriteFrames` resource and map exported `SpriteFrames.json` regions
- Maps/tiles: use exported `TileSet.json` + PNG, set TileSet shape to `Square`, draw in `TileMap`
- Palette/outline/resized assets can be dropped directly into `res://assets/`

## 🧩 Roadmap / Ideas

- More Godot-specific tools: auto-tile terrain presets, 9-slice UI, animation curve helper
- More post-processing filters
- Cloud sync / shareable presets
- Community prompt gallery

## 🔗 网页联动（ChatGPT / Gemini 浏览器扩展）

不想配 API Key？可以把 ChatGPT / Gemini 网页版当作免费生图后端：

1. 启动本地服务：`node server.mjs`
2. 在 Chrome / Edge 开发者模式加载 `extension/` 目录（详见 extension/安装说明.md）
3. 工坊里选「🌐 网页版」供应商点生成（或点「打开网页版」按钮）→ 扩展把提示词**自动填入网页对话框**（只填入、不自动发送）
4. 网页生成图片后点图片旁「💾 Godot-Arter」→ 自动落盘到 `assets/generated/` 并记录 `data/generated_assets.json`
5. 工坊页面的「网页收件箱」自动把新素材导入素材库（带提示词 / 来源 / 时间元数据）

未安装扩展时自动退化为「复制提示词到剪贴板，手动粘贴」。

## 📄 License

This project is open source under the **BSD-3-Clause** license.

## 🤝 Contributing

Pull requests and feature ideas are welcome. Please keep the project simple, offline-friendly, and aligned with Godot asset workflows.
