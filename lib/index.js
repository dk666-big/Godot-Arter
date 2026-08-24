import { readFileSync } from "node:fs";
import z from "schemastery";
//#region src/index.ts
const name = "@dsh-external/dsh-game-art-studio";
const inject = ["webServer"];
const Config = z.object({ godotVersion: z.string().default("4.2").description("Godot 目标版本") });
function apply(ctx, config) {
	const ver = (config || { godotVersion: "4.2" }).godotVersion || "4.2";
	const logger = ctx.logger?.extend?.("game-art-studio") ?? ctx.logger;
	logger?.info?.(`[game-art-studio] Godot v${ver} 美术工坊已就绪 | 5 大管线: 角色/序列帧/素材/抠图/无缝地图`);
	try {
		const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
		ctx.effect(() => ctx.webServer.register({
			kind: "exact",
			path: "/game-art-studio",
			handler: async (req, res) => {
				res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
				res.end(html);
			}
		}), "game-art-studio: standalone page");
		logger?.info?.("[game-art-studio] 独立页面路由已注册 -> /game-art-studio");
	} catch (e) {
		logger?.warn?.("[game-art-studio] public/index.html 未找到，独立页面不可用: " + String(e).slice(0, 120));
	}
	try {
		ctx.effect(() => ctx.webServer.register({
			kind: "exact",
			path: "/game-art-studio/api/proxy-image",
			handler: async (req, res) => {
				try {
					const target = new URL(req.url ?? "/", "http://localhost").searchParams.get("url") || "";
					if (!/^https?:\/\//i.test(target)) {
						res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
						res.end(JSON.stringify({
							ok: false,
							error: "bad url"
						}));
						return;
					}
					const upstream = await fetch(target);
					if (!upstream.ok) {
						res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
						res.end(JSON.stringify({
							ok: false,
							status: upstream.status,
							error: "upstream " + upstream.status
						}));
						return;
					}
					const buf = Buffer.from(await upstream.arrayBuffer());
					const ct = upstream.headers.get("content-type") || "image/png";
					res.writeHead(200, {
						"content-type": ct,
						"content-length": buf.length,
						"cache-control": "no-store",
						"access-control-allow-origin": "*"
					});
					res.end(buf);
				} catch (e) {
					res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
					res.end(JSON.stringify({
						ok: false,
						error: String(e).slice(0, 200)
					}));
				}
			}
		}), "game-art-studio: proxy-image");
		logger?.info?.("[game-art-studio] 图片代理路由已注册 -> /game-art-studio/api/proxy-image");
	} catch (e) {
		logger?.warn?.("[game-art-studio] 图片代理注册失败: " + String(e).slice(0, 120));
	}
	try {
		const tools = ctx.tools;
		if (tools?.register) ctx.effect(() => tools.register({
			name: "godot_export_manifest",
			description: "生成 Godot 4.x 兼容的美术资源清单（JSON + 目录结构）",
			parameters: {
				type: "object",
				properties: { projectName: { type: "string" } },
				required: []
			},
			async execute(args) {
				const manifest = {
					godot: ver,
					project: args?.projectName || "MyGame",
					generated_at: (/* @__PURE__ */ new Date()).toISOString(),
					structure: {
						"res://assets/characters/": "角色立绘/三视图",
						"res://assets/spritesheets/": "序列帧 + SpriteFrames.tres",
						"res://assets/tilesets/": "TileSet + 无缝瓦片",
						"res://assets/icons/": "道具/UI"
					},
					assets: args?.assets || [],
					import_hint: "拖入 Godot FileSystem 后，对 spritesheets 创建 SpriteFrames，对 tilesets 新建 TileSet"
				};
				return { manifest: JSON.stringify(manifest, null, 2) };
			}
		}), "game-art-studio: tool godot_export_manifest");
	} catch {}
	ctx.on?.("ready", () => logger?.info?.("[game-art-studio] 面板就绪 -> 对话区「游戏美术工坊」 & 独立页 /game-art-studio"));
}
//#endregion
export { Config, apply, inject, name };

//# sourceMappingURL=index.js.map