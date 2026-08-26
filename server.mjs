#!/usr/bin/env node
/**
 * Godot-Arter 零依赖本地启动器（仅需 Node.js >= 18，无需 npm install）
 *
 * 用法：
 *   node server.mjs                # 默认端口 3080
 *   node server.mjs 5173           # 指定端口
 *   PORT=8080 node server.mjs      # 或用环境变量
 *
 * 打开：http://127.0.0.1:3080/game-art-studio
 *
 * 提供：
 *  - 静态托管 public/index.html（与双击 game-art-studio.html 同一份产物）
 *  - /game-art-studio/api/proxy-image + /api/proxy-image 图片代理，
 *    为跨域图片附加 access-control-allow-origin: *，
 *    使「序列帧切片 / 一键下载 / 无缝地图平铺」等需要读像素的操作用远程图也能工作
 */
import http from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || process.argv[2] || 3080)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function handleProxy(url, res) {
  const target = url.searchParams.get('url') || ''
  if (!/^https?:\/\//i.test(target)) {
    res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ ok: false, error: 'bad url' }))
    return
  }
  try {
    const upstream = await fetch(target, { headers: { 'user-agent': 'godot-arter-local' } })
    if (!upstream.ok) {
      res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: false, status: upstream.status, error: 'upstream ' + upstream.status }))
      return
    }
    const ct = upstream.headers.get('content-type') || 'image/png'
    const buf = Buffer.from(await upstream.arrayBuffer())
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
}

async function serveStatic(relPath, res) {
  // 防路径穿越：只允许 public/ 之内的相对路径
  const safe = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const file = path.join(ROOT, 'public', safe)
  const buf = await readFile(file)
  const ext = path.extname(file).toLowerCase()
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' })
  res.end(buf)
}

/* ================= 网页联动（浏览器扩展） ================= */
const WEB_LINK_ASSET_DIR = path.join(ROOT, 'assets', 'generated')
const WEB_LINK_META_FILE = path.join(ROOT, 'data', 'generated_assets.json')
const pendingPrompts = new Map() // site -> { site, prompt, from, at }

function webLinkCors(res) {
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type')
}

function sendJson(res, status, obj) {
  webLinkCors(res)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(obj))
}

async function readBody(req, limitBytes = 40 * 1024 * 1024) {
  const chunks = []
  let total = 0
  for await (const c of req) {
    total += c.length
    if (total > limitBytes) throw new Error('body too large')
    chunks.push(c)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

async function readMeta() {
  try {
    const list = JSON.parse(await readFile(WEB_LINK_META_FILE, 'utf-8'))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

async function handleWebLink(url, req, res) {
  const p = url.pathname
  if (req.method === 'OPTIONS') {
    webLinkCors(res)
    res.writeHead(204)
    res.end()
    return
  }
  try {
    if (req.method === 'POST' && p === '/api/web-link/prompt') {
      const body = JSON.parse((await readBody(req)) || '{}')
      const site = body.site === 'gemini' ? 'gemini' : 'chatgpt'
      const prompt = String(body.prompt || '').slice(0, 20000)
      if (!prompt) return sendJson(res, 400, { ok: false, error: 'empty prompt' })
      pendingPrompts.set(site, { site, prompt, from: String(body.from || 'studio'), at: Date.now() })
      return sendJson(res, 200, { ok: true, site })
    }
    if (req.method === 'GET' && p === '/api/web-link/prompt') {
      const site = url.searchParams.get('site') === 'gemini' ? 'gemini' : 'chatgpt'
      const pending = pendingPrompts.get(site) || null
      if (pending && url.searchParams.get('consume') === '1') pendingPrompts.delete(site)
      return sendJson(res, 200, { ok: true, pending })
    }
    if (req.method === 'POST' && p === '/api/web-link/save') {
      const body = JSON.parse((await readBody(req)) || '{}')
      const b64 = String(body.imageBase64 || '').replace(/^data:[^;]+;base64,/, '')
      if (!b64) return sendJson(res, 400, { ok: false, error: 'no imageBase64' })
      let buf
      try {
        buf = Buffer.from(b64, 'base64')
      } catch {
        return sendJson(res, 400, { ok: false, error: 'bad base64' })
      }
      if (!buf.length) return sendJson(res, 400, { ok: false, error: 'bad base64' })
      const mime = String(body.mime || 'image/png')
      const ext = /webp/i.test(mime) ? '.webp' : /jpe?g/i.test(mime) ? '.jpg' : /gif/i.test(mime) ? '.gif' : '.png'
      await mkdir(WEB_LINK_ASSET_DIR, { recursive: true })
      await mkdir(path.dirname(WEB_LINK_META_FILE), { recursive: true })
      const meta = await readMeta()
      const now = new Date()
      const day = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
      const seq = meta.filter((m) => String(m.file || '').startsWith(day + '_')).length + 1
      const file = day + '_' + String(seq).padStart(3, '0') + ext
      await writeFile(path.join(WEB_LINK_ASSET_DIR, file), buf)
      const rec = {
        id: 'w' + now.getTime().toString(36) + Math.random().toString(36).slice(2, 6),
        file,
        rel: 'assets/generated/' + file,
        site: body.site === 'gemini' ? 'gemini' : 'chatgpt',
        prompt: String(body.prompt || '').slice(0, 4000),
        sourceUrl: String(body.sourceUrl || '').slice(0, 500),
        bytes: buf.length,
        at: now.getTime(),
      }
      meta.push(rec)
      await writeFile(WEB_LINK_META_FILE, JSON.stringify(meta, null, 2))
      return sendJson(res, 200, { ok: true, ...rec })
    }
    if (req.method === 'GET' && p === '/api/web-link/assets') {
      const after = Number(url.searchParams.get('after') || 0)
      const meta = await readMeta()
      return sendJson(res, 200, { ok: true, items: meta.filter((m) => Number(m.at) > after) })
    }
    if (req.method === 'GET' && p === '/api/web-link/status') {
      const meta = await readMeta()
      return sendJson(res, 200, { ok: true, app: 'godot-arter', pending: [...pendingPrompts.keys()], saved: meta.length })
    }
    return sendJson(res, 404, { ok: false, error: 'unknown route' })
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: String((e && e.message) || e).slice(0, 200) })
  }
}

async function serveGeneratedAsset(rel, res) {
  const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, '')
  const file = path.join(WEB_LINK_ASSET_DIR, safe)
  const buf = await readFile(file)
  const ext = path.extname(file).toLowerCase()
  webLinkCors(res)
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(buf)
}
/* ===================== 网页联动结束 ===================== */

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    const p = decodeURIComponent(url.pathname)

    // 图片代理（客户端 toLocalBlobUrl 的托管兜底路径）
    if (p === '/game-art-studio/api/proxy-image' || p === '/api/proxy-image') {
      await handleProxy(url, res)
      return
    }

    // 网页联动 API（浏览器扩展：提示词中转 / 图片保存 / 新素材查询）
    if (p.startsWith('/api/web-link')) {
      await handleWebLink(url, req, res)
      return
    }

    // 网页联动生成的素材文件（工坊收件箱与扩展预览用）
    if (p.startsWith('/assets/generated/')) {
      await serveGeneratedAsset(p.slice('/assets/generated/'.length), res)
      return
    }

    // 页面路由（no-store：更新后强制拿到最新版，避免缓存旧页面）
    if (p === '/' || p === '/game-art-studio' || p === '/index.html') {
      const html = await readFile(path.join(ROOT, 'public', 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' })
      res.end(html)
      return
    }

    // favicon：静默返回 204，避免控制台 404 噪音
    if (p === '/favicon.ico') {
      res.writeHead(204)
      res.end()
      return
    }

    // public/ 下其他静态资源
    if (p.startsWith('/game-art-studio/')) {
      await serveStatic(p.slice('/game-art-studio/'.length), res)
      return
    }
    await serveStatic(p.replace(/^\/+/, ''), res)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
  }
})

server.listen(PORT, () => {
  console.log(`\n🎮 Godot-Arter 本地服务已启动`)
  console.log(`   首页: http://127.0.0.1:${PORT}/game-art-studio`)
  console.log(`   代理: http://127.0.0.1:${PORT}/game-art-studio/api/proxy-image?url=...\n`)
})