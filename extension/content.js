// Godot-Arter 网页联动 · 内容脚本（ChatGPT / Gemini）
// 职责：1) 从联动服务取提示词并自动填入对话框（不自动发送）
//       2) 给生成图旁注入「💾 Godot-Arter」按钮，一键保存到工坊素材库
(() => {
  if (window.__godotArterLoaded) return
  window.__godotArterLoaded = true

  const SITE = location.hostname.indexOf('gemini.google.com') >= 0 ? 'gemini' : 'chatgpt'
  const DEFAULTS = { serverUrl: 'http://127.0.0.1:3080', autofill: true, saveBtn: true }
  let cfg = Object.assign({}, DEFAULTS)

  let lastHandledAt = 0
  let lastFilledPrompt = ''

  const server = () => String(cfg.serverUrl || DEFAULTS.serverUrl).replace(/\/+$/, '')

  /* ---------- 页面浮动提示 ---------- */
  let toastTimer = 0
  function toast(msg, ok) {
    if (ok === undefined) ok = true
    let el = document.getElementById('ga-toast')
    if (!el) {
      el = document.createElement('div')
      el.id = 'ga-toast'
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483647;max-width:420px;padding:10px 14px;font:12px/1.6 monospace;color:#efe6d0;background:#38302a;border:3px solid #594c39;box-shadow:4px 4px 0 rgba(0,0,0,.45);display:none;'
      document.documentElement.appendChild(el)
    }
    el.textContent = msg
    el.style.borderColor = ok ? '#7cbf5a' : '#d9536f'
    el.style.display = 'block'
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { el.style.display = 'none' }, 5000)
  }

  /* ---------- 输入框定位 ---------- */
  function findInput() {
    if (SITE === 'chatgpt') {
      return document.querySelector('#prompt-textarea') ||
        document.querySelector('div[contenteditable="true"][id*="prompt"]') ||
        document.querySelector('[data-testid="text-input"]') ||
        document.querySelector('form textarea')
    }
    return document.querySelector('rich-textarea .ql-editor') ||
      document.querySelector('div.ql-editor[contenteditable="true"]') ||
      document.querySelector('rich-textarea [contenteditable="true"]')
  }

  function fillInput(el, text) {
    el.focus()
    try {
      document.execCommand('selectAll', false, null)
      if (document.execCommand('insertText', false, text)) return true
    } catch (e) { /* 走兜底 */ }
    el.textContent = text
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
    return true
  }

  async function waitFor(fn, timeout, step) {
    timeout = timeout || 10000
    step = step || 250
    const t0 = Date.now()
    while (Date.now() - t0 < timeout) {
      let v = null
      try { v = fn() } catch (e) { /* ignore */ }
      if (v) return v
      await new Promise((r) => setTimeout(r, step))
    }
    return null
  }

  /* ---------- 提示词轮询 + 自动填入 ---------- */
  async function pollPrompt() {
    if (!cfg.autofill) return
    try {
      const r = await fetch(server() + '/api/web-link/prompt?site=' + SITE, { cache: 'no-store' })
      const j = await r.json()
      const p = j && j.pending
      if (!p || p.at === lastHandledAt) return
      const el = await waitFor(findInput, 8000)
      if (!el) {
        lastHandledAt = p.at
        try { await navigator.clipboard.writeText(p.prompt) } catch (e) { /* ignore */ }
        toast('Godot-Arter: 未找到输入框，提示词已复制到剪贴板', false)
        return
      }
      fillInput(el, p.prompt)
      lastHandledAt = p.at
      lastFilledPrompt = p.prompt
      try { await fetch(server() + '/api/web-link/prompt?site=' + SITE + '&consume=1', { cache: 'no-store' }) } catch (e) { /* ignore */ }
      const brief = p.prompt.length > 40 ? p.prompt.slice(0, 40) + '…' : p.prompt
      toast('Godot-Arter: 提示词已填入（' + brief + '）— 请检查后手动点发送')
    } catch (e) { /* 服务未启动等，静默 */ }
  }

  /* ---------- 生成图旁的保存按钮 ---------- */
  const MARK = 'data-ga-save-btn'

  function eligibleImgs() {
    const out = []
    for (const im of document.querySelectorAll('img')) {
      const w = im.naturalWidth || 0
      const h = im.naturalHeight || 0
      if (w < 200 || h < 200) continue
      const src = im.currentSrc || im.src || ''
      if (!/^(https?:|blob:|data:)/.test(src)) continue
      if (im.closest('button, a, nav, header, svg, [' + MARK + ']')) continue
      let inMsg = false
      if (SITE === 'chatgpt') {
        inMsg = !!im.closest('[data-message-author-role="assistant"]') || /oaiusercontent/.test(src)
      } else {
        inMsg = !!im.closest('model-response, .model-response-text, message-content, response-container, .conversation-container') || /googleusercontent/.test(src)
      }
      if (inMsg) out.push(im)
    }
    return out
  }

  function attachButtons() {
    if (!cfg.saveBtn) return
    for (const im of eligibleImgs()) {
      const host = im.parentElement
      if (!host || host.querySelector('[' + MARK + ']')) continue
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
      const btn = document.createElement('button')
      btn.setAttribute(MARK, '1')
      btn.type = 'button'
      btn.textContent = '💾 Godot-Arter'
      btn.title = '保存到 Godot-Arter 素材库'
      btn.style.cssText = 'position:absolute;top:6px;right:6px;z-index:50;padding:4px 10px;font:700 12px monospace;color:#1a1408;background:#e8a33d;border:2px solid #594c39;box-shadow:2px 2px 0 rgba(0,0,0,.4);cursor:pointer;border-radius:0;'
      btn.addEventListener('click', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        saveImage(im, btn)
      })
      host.appendChild(btn)
    }
  }

  function blobToB64(blob) {
    return new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onload = () => res({ base64: String(fr.result).split(',')[1] || '', mime: blob.type || 'image/png' })
      fr.onerror = rej
      fr.readAsDataURL(blob)
    })
  }

  async function grabImage(im) {
    const src = im.currentSrc || im.src
    if (/^data:/.test(src)) {
      const mime = (src.match(/^data:([^;]+);/) || [])[1] || 'image/png'
      return { base64: src.split(',')[1] || '', mime }
    }
    try {
      const r = await fetch(src)
      if (r.ok) return await blobToB64(await r.blob())
    } catch (e) { /* 跨域受限，转后台代抓 */ }
    const resp = await new Promise((res) => chrome.runtime.sendMessage({ type: 'ga-fetch-image', url: src }, res))
    if (!resp || !resp.ok) throw new Error((resp && resp.error) || '图片抓取失败')
    return { base64: resp.base64, mime: resp.mime }
  }

  function guessPrompt(im) {
    if (lastFilledPrompt) return lastFilledPrompt
    try {
      const sel = SITE === 'chatgpt' ? '[data-message-author-role="user"]' : 'user-query, .user-query'
      let best = null
      for (const u of document.querySelectorAll(sel)) {
        if (u.compareDocumentPosition(im) & Node.DOCUMENT_POSITION_FOLLOWING) best = u
      }
      if (best) return (best.innerText || '').trim().slice(0, 500)
    } catch (e) { /* ignore */ }
    return ''
  }

  async function saveImage(im, btn) {
    const label = btn.textContent
    btn.textContent = '⏳ 保存中…'
    btn.disabled = true
    try {
      const img = await grabImage(im)
      if (!img.base64) throw new Error('空图片')
      const r = await fetch(server() + '/api/web-link/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: img.base64, mime: img.mime, site: SITE, prompt: guessPrompt(im), sourceUrl: location.href })
      })
      const j = await r.json()
      if (!j.ok) throw new Error(j.error || '保存失败')
      btn.textContent = '✅ ' + j.file
      toast('Godot-Arter: 已保存 ' + j.file + ' → 工坊打开时会自动导入素材库')
    } catch (e) {
      btn.textContent = '❌ 失败'
      toast('Godot-Arter 保存失败: ' + String((e && e.message) || e) + '（server.mjs 是否已启动？）', false)
    }
    setTimeout(() => { btn.textContent = label; btn.disabled = false }, 4000)
  }

  /* ---------- 启动 ---------- */
  function start() {
    let t = 0
    const mo = new MutationObserver(() => {
      clearTimeout(t)
      t = setTimeout(attachButtons, 800)
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })
    attachButtons()
    pollPrompt()
    setInterval(pollPrompt, 2500)
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return
        for (const k of Object.keys(DEFAULTS)) if (changes[k]) cfg[k] = changes[k].newValue
      })
    } catch (e) { /* ignore */ }
    console.log('[Godot-Arter] 网页联动内容脚本已就绪 (' + SITE + ')')
  }

  try {
    chrome.storage.sync.get(DEFAULTS, (v) => {
      cfg = Object.assign({}, DEFAULTS, v || {})
      start()
    })
  } catch (e) {
    start()
  }
})()
