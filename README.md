# 🎮 Godot-Arter

**One-stop game art workshop with a Godot-ready workflow.**

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

### Option A: Open the standalone web app

Open the local page served by the DSH plugin:

```
http://127.0.0.1:3080/game-art-studio
```

Or open the self-contained file:

```
game-art-studio.html
```

No build is required if you use the prebuilt files in `public/` and `lib/`.

### Option B: Run as a DSH plugin

This project is also a DSH super-injector compatible plugin.

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

## 📄 License

This project is open source under the **BSD-3-Clause** license.

## 🤝 Contributing

Pull requests and feature ideas are welcome. Please keep the project simple, offline-friendly, and aligned with Godot asset workflows.
