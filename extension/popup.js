const DEFAULTS = { serverUrl: 'http://127.0.0.1:3080', autofill: true, saveBtn: true }
const $ = (id) => document.getElementById(id)

chrome.storage.sync.get(DEFAULTS, (v) => {
  const cfg = Object.assign({}, DEFAULTS, v || {})
  $('server').value = cfg.serverUrl
  $('autofill').checked = !!cfg.autofill
  $('saveBtn').checked = !!cfg.saveBtn
})

function save() {
  chrome.storage.sync.set({
    serverUrl: $('server').value.trim().replace(/\/+$/, '') || DEFAULTS.serverUrl,
    autofill: $('autofill').checked,
    saveBtn: $('saveBtn').checked
  })
}
$('server').addEventListener('change', save)
$('autofill').addEventListener('change', save)
$('saveBtn').addEventListener('change', save)

$('test').addEventListener('click', async () => {
  const st = $('status')
  const base = $('server').value.trim().replace(/\/+$/, '') || DEFAULTS.serverUrl
  st.textContent = '连接中…'
  st.className = ''
  try {
    const r = await fetch(base + '/api/web-link/status', { cache: 'no-store' })
    const j = await r.json()
    st.textContent = '✅ 联动服务在线 · 已保存 ' + j.saved + ' 张网页素材' + (j.pending && j.pending.length ? ' · 待取提示词: ' + j.pending.join('/') : '')
    st.className = 'ok'
  } catch (e) {
    st.textContent = '❌ 连不上联动服务 — 请确认已运行 node server.mjs（默认端口 3080）'
    st.className = 'bad'
  }
})
