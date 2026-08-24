/**
 * @dsh-external/dsh-game-art-studio — hybrid 宿主
 * Godot 风格一站式美术工坊宿主：提供工具注册 + Godot 导出辅助
 * 实际重活在 client 完成（BYOK，用户自带 API Key 直连提供商），host 仅作日志/资源兜底
 */
import type { Context } from 'cordis'
import { readFileSync } from 'node:fs'
import z from 'schemastery'

export const name = "@dsh-external/dsh-game-art-studio"
export const inject = ['webServer']

export interface Config {
  godotVersion: string
}

export const Config = z.object({
  godotVersion: z.string().default('4.2').description('Godot 目标版本'),
})

export function apply(ctx: Context, config: Config): void {
  const c: any = config || { godotVersion: '4.2' }
  const ver = c.godotVersion || '4.2'
  const logger: any = (ctx as any).logger?.extend?.('game-art-studio') ?? (ctx as any).logger
  logger?.info?.(`[game-art-studio] Godot v${ver} 美术工坊已就绪 | 5 大管线: 角色/序列帧/素材/抠图/无缝地图`)

  // 独立网址：/game-art-studio → 完整 HTML 版（Godot 美术工坊）
  try {
    const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8')
    ctx.effect(() => (ctx as any).webServer.register({
      kind: 'exact',
      path: '/game-art-studio',
      handler: async (req: any, res: any) => {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        res.end(html)
      },
    }), 'game-art-studio: standalone page')
    logger?.info?.('[game-art-studio] 独立页面路由已注册 -> /game-art-studio')
  } catch (e) {
    logger?.warn?.('[game-art-studio] public/index.html 未找到，独立页面不可用: ' + String(e).slice(0, 120))
  }

  // 图片代理：解决第三方图片直链跨域导致浏览器无法显示/下载的问题
  try {
    ctx.effect(() => (ctx as any).webServer.register({
      kind: 'exact',
      path: '/game-art-studio/api/proxy-image',
      handler: async (req: any, res: any) => {
        try {
          const reqUrl = new URL(req.url ?? '/', 'http://localhost')
          const target = reqUrl.searchParams.get('url') || ''
          if (!/^https?:\/\//i.test(target)) {
            res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ ok: false, error: 'bad url' }))
            return
          }
          const upstream = await fetch(target)
          if (!upstream.ok) {
            res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ ok: false, status: upstream.status, error: 'upstream ' + upstream.status }))
            return
          }
          const buf = Buffer.from(await upstream.arrayBuffer())
          const ct = upstream.headers.get('content-type') || 'image/png'
          res.writeHead(200, {
            'content-type': ct,
            'content-length': buf.length,
            'cache-control': 'no-store',
            'access-control-allow-origin': '*',
          })
          res.end(buf)
        } catch (e) {
          res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: String(e).slice(0, 200) }))
        }
      },
    }), 'game-art-studio: proxy-image')
    logger?.info?.('[game-art-studio] 图片代理路由已注册 -> /game-art-studio/api/proxy-image')
  } catch (e) {
    logger?.warn?.('[game-art-studio] 图片代理注册失败: ' + String(e).slice(0, 120))
  }

  // 可选工具：若宿主有 tools 服务则注册（不强依赖 schemastery）
  try {
    const tools: any = (ctx as any).tools
    if (tools?.register) {
      ctx.effect(() => tools.register({
        name: 'godot_export_manifest',
        description: '生成 Godot 4.x 兼容的美术资源清单（JSON + 目录结构）',
        parameters: { type: 'object', properties: { projectName: { type: 'string' } }, required: [] } as any,
        async execute(args: any) {
          const manifest = {
            godot: ver,
            project: args?.projectName || 'MyGame',
            generated_at: new Date().toISOString(),
            structure: {
              'res://assets/characters/': '角色立绘/三视图',
              'res://assets/spritesheets/': '序列帧 + SpriteFrames.tres',
              'res://assets/tilesets/': 'TileSet + 无缝瓦片',
              'res://assets/icons/': '道具/UI',
            },
            assets: args?.assets || [],
            import_hint: '拖入 Godot FileSystem 后，对 spritesheets 创建 SpriteFrames，对 tilesets 新建 TileSet',
          }
          return { manifest: JSON.stringify(manifest, null, 2) }
        },
      }), 'game-art-studio: tool godot_export_manifest')
    }
  } catch { }

  ;(ctx as any).on?.('ready', () => logger?.info?.('[game-art-studio] 面板就绪 -> 对话区「游戏美术工坊」 & 独立页 /game-art-studio'))
}
