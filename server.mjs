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
import { readFile } from 'node:fs/promises'
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    const p = decodeURIComponent(url.pathname)

    // 图片代理（客户端 toLocalBlobUrl 的托管兜底路径）
    if (p === '/game-art-studio/api/proxy-image' || p === '/api/proxy-image') {
      await handleProxy(url, res)
      return
    }

    // 页面路由
    if (p === '/' || p === '/game-art-studio' || p === '/index.html') {
      const html = await readFile(path.join(ROOT, 'public', 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'] })
      res.end(html)
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