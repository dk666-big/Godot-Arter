// Godot-Arter 网页联动 · 后台服务工作线程
// MV3 中 content script 的跨域 fetch 受页面 CORS 限制，CDN 图片改由这里代抓
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== 'ga-fetch-image') return false
  ;(async () => {
    try {
      const r = await fetch(msg.url, { credentials: 'omit' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const blob = await r.blob()
      const b64 = await new Promise((res, rej) => {
        const fr = new FileReader()
        fr.onload = () => res(String(fr.result).split(',')[1] || '')
        fr.onerror = rej
        fr.readAsDataURL(blob)
      })
      sendResponse({ ok: true, base64: b64, mime: blob.type || 'image/png' })
    } catch (e) {
      sendResponse({ ok: false, error: String((e && e.message) || e) })
    }
  })()
  return true // 保持消息通道等待异步应答
})
