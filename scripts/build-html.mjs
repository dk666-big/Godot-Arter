// 把 lib/client.js 转换为单页 HTML(public/index.html + game-art-studio.html)
// 提取其中 buildStudio() 函数, 包裹成 <html><body><div id="app"></div><script>...</script></body></html>
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const clientJs = readFileSync(path.join(ROOT, 'lib', 'client.js'), 'utf8')

// lib/client.js 中 buildStudio 是内部函数, 没在工厂里被自动调用(只在 apply 内部 render 回调里调用)
// 提取策略: 从 `function buildStudio() {` 开始, 到 `return root;\n\t\t}\n\t\t//#endregion` 结束
const startIdx = clientJs.indexOf('function buildStudio()')
if (startIdx < 0) throw new Error('cannot find buildStudio() in lib/client.js')

// 找 buildStudio 函数体的结束: 它返回 `root`, 函数闭合是 `return root;\n\t\t}\n\t\t//#endregion`
const endMarker = '\t\treturn root;\n\t\t}'
const endIdx = clientJs.indexOf(endMarker, startIdx)
if (endIdx < 0) throw new Error('cannot find buildStudio end (return root)')

const studio = clientJs.slice(startIdx, endIdx + endMarker.length)

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎮 游戏美术工坊 · Godot Ready</title>
<style>
  html,body{margin:0;padding:0;background:#181310;height:100%;}
  #app{min-height:100vh;}
  body { font-family: 'JetBrains Mono', ui-monospace, Consolas, 'Microsoft YaHei', monospace; }
</style>
</head>
<body>
<div id="app"></div>
<script>
"use strict";
${studio}

// 启动: 把工坊挂到 #app
try {
  document.getElementById('app').appendChild(buildStudio());
} catch (e) {
  console.error('工坊启动失败:', e);
  const el = document.createElement('div');
  el.style.cssText = 'padding:20px;color:#e74c3c;font:14px monospace;white-space:pre-wrap';
  el.textContent = '工坊启动失败:\\n' + (e?.stack || e?.message || e);
  document.body.appendChild(el);
}
</script>
</body>
</html>
`

writeFileSync(path.join(ROOT, 'public', 'index.html'), html, 'utf8')
copyFileSync(path.join(ROOT, 'public', 'index.html'), path.join(ROOT, 'game-art-studio.html'))
console.log('✓ public/index.html   (', html.length, 'bytes )')
console.log('✓ game-art-studio.html (', html.length, 'bytes )')
