/**
 * @dsh-external/dsh-game-art-studio — client 面板
 * Godot 官方美学 + 一站式美术工坊（BYOK）
 * 五大管线：角色工坊 / 序列帧 / 素材锻造 / 智能抠图 / 无缝大地图
 */
import type { SlotsService } from '@deepseek-ai/dsh-client-ui-slots'

type ClientContext = { slots: SlotsService; effect(fn: () => any, name?: string): void }
export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.slots.inject('conversation.view', () =>
    ctx.slots.register({
      name: 'conversation.view',
      id: '@dsh-external/dsh-game-art-studio-panel',
      label: () => '🎮 游戏美术工坊',
      component: () => ({ render() { return buildStudio() } }),
    }),
  ), '@dsh-external/dsh-game-art-studio: panel')

  // 同时注入到 sidebar 作为独立入口（如果 slots 支持）
  try {
    ctx.effect(() => (ctx.slots as any).inject?.('sidebar.view', () =>
      (ctx.slots as any).register?.({
        name: 'sidebar.view',
        id: '@dsh-external/dsh-game-art-studio-sidebar',
        label: () => '美术工坊',
        component: () => ({ render() {
          const d=document.createElement('div')
          d.style.padding='8px'; d.style.fontSize='12px'; d.style.color='#9aa0a6'
          d.textContent='🎮 游戏美术工坊已就绪 → 对话区查看完整面板'
          return d
        }}),
      })
    ), 'sidebar')
  } catch {}
}

function buildStudio(): HTMLElement {
  const root = document.createElement('div')
  root.className = 'gas-root'
  // ---- CSS (Godot 4.x Editor 风格) ----
  const style = document.createElement('style')
  style.textContent = `
  /* ---------- Terraria-style pixel theme ---------- */
  .gas-root{
    --bg:#181310; --panel:#2a2119; --panel2:#38302a; --border:#594c39;
    --accent:#e8a33d; --accent2:#f5cf6b; --accent-orange:#e07b3a; --pink:#d9536f;
    --text:#efe6d0; --muted:#9a8f7a; --ok:#7cbf5a; --warn:#e8c05a;
    --inputb:#201812; --thumbb:#241c15; --hover:#3e352c; --shadow:#0d0a08;
    font-family:'JetBrains Mono', ui-monospace, Consolas, 'Microsoft YaHei', monospace;
    color:var(--text); background:var(--bg); border:4px solid var(--border);
    border-radius:0; overflow:hidden; display:flex; flex-direction:column;
    max-height:96vh; width:100%; max-width:1760px; margin:0 auto;
    box-shadow:6px 6px 0 var(--shadow); transition:background .25s, color .25s;
    image-rendering:pixelated;
  }
  .gas-root[data-theme='light']{
    --bg:#cfc2a1; --panel:#e6dabb; --panel2:#f3ead3; --border:#a4916d;
    --accent:#b4711f; --accent2:#7c5210; --accent-orange:#c25a1c; --pink:#b5485f;
    --text:#3a2f22; --muted:#756850; --ok:#3f7a2c; --warn:#8a6c12;
    --inputb:#efe4c9; --thumbb:#e9dcbd; --hover:#dcca9f; --shadow:#8f7c5b;
  }
  *{ box-sizing:border-box; }
  /* Top bar */
  .gas-header{ display:flex; align-items:center; gap:12px; padding:12px 18px; position:relative; z-index:6;
    background:var(--panel); border-bottom:4px solid var(--border); }
  .gas-logo{ width:40px; height:40px; border-radius:0; background:linear-gradient(135deg,var(--accent),#c792ea);
    display:grid; place-items:center; font-weight:800; font-size:20px; color:#1a1408;
    border:3px solid var(--border); box-shadow:3px 3px 0 var(--shadow); }
  .gas-title{ font-weight:700; letter-spacing:1px; font-size:15px; line-height:1.2; }
  .gas-title small{ display:block; font-weight:400; color:var(--muted); font-size:11px; margin-top:3px; letter-spacing:.3px; }
  .gas-badge{ margin-left:auto; background:var(--hover); border:3px solid var(--border); padding:4px 10px; font-size:11px; color:var(--muted); box-shadow:3px 3px 0 var(--shadow); }
  .gas-badge b{ color:var(--accent2); }
  .gas-top-btn{ background:var(--hover); border:3px solid var(--border); color:var(--muted);
    padding:6px 10px; font-size:12px; cursor:pointer; box-shadow:3px 3px 0 var(--shadow);
    transition:filter .12s, color .12s, transform .08s; }
  .gas-top-btn:hover{ filter:brightness(1.15); color:var(--text); }
  .gas-top-btn:active{ transform:translate(2px,2px); box-shadow:1px 1px 0 var(--shadow); }
  .gas-theme-sel{ margin-left:auto; display:flex; gap:6px; align-items:center; }
  .gas-theme-opt{ display:flex; align-items:center; gap:5px; background:var(--hover); border:3px solid var(--border);
    color:var(--muted); padding:5px 9px; font-size:11px; cursor:pointer; box-shadow:3px 3px 0 var(--shadow);
    transition:filter .12s, color .12s, transform .08s; }
  .gas-theme-opt:hover{ filter:brightness(1.15); color:var(--text); }
  .gas-theme-opt:active{ transform:translate(2px,2px); box-shadow:1px 1px 0 var(--shadow); }
  .gas-theme-opt .tico{ font-size:13px; }
  .gas-theme-opt .tlabel{ white-space:nowrap; }
  .gas-theme-opt.active{ background:var(--accent); color:#1a1408; border-color:var(--border); font-weight:700; }
  /* Layout */
  .gas-shell{ display:flex; flex:1; min-height:0; position:relative; z-index:0; }
  .gas-body{ display:flex; flex:1; min-height:0; min-width:0; width:100%; }
  .gas-main{ min-width:0; flex:1 1 auto; }
  .gas-nav{ width:236px; flex:0 0 236px; background:var(--panel); border-right:4px solid var(--border);
    padding:10px 8px 12px; overflow-y:auto; overflow-x:hidden; position:relative; z-index:3;
    transition:width .2s, transform .2s; }
  .gas-nav.collapsed{ width:52px; flex-basis:52px; }
  .gas-main{ flex:1; padding:22px; overflow-y:auto; overflow-x:hidden; background:var(--bg);
    background-image:linear-gradient(45deg, var(--hover) 12%, transparent 12%, transparent 50%, var(--hover) 50%, var(--hover) 62%, transparent 62%), linear-gradient(45deg, var(--hover) 12%, transparent 12%, transparent 50%, var(--hover) 50%, var(--hover) 62%, transparent 62%);
    background-size:6px 6px; background-position:0 0, 3px 3px; opacity:1; }
  /* Nav group (collapsible directory) */
  .gas-nav-group-header{ width:100%; display:flex; align-items:center; gap:7px; background:var(--panel2);
    border:3px solid var(--border); color:var(--text); cursor:pointer; padding:6px 8px; margin-top:10px; font-size:12px;
    font-weight:700; letter-spacing:1px; text-transform:uppercase; box-shadow:3px 3px 0 var(--shadow); }
  .gas-nav-group-header:hover{ filter:brightness(1.1); }
  .gas-nav-group-header .gcaret{ font-size:10px; color:var(--accent2); width:12px; text-align:center; }
  .gas-nav-group-body{ display:flex; flex-direction:column; gap:2px; padding:6px 0 2px; overflow:hidden; }
  .gas-nav-group-body.closed{ display:none; }
  .gas-nav-item{ display:flex; align-items:center; gap:9px; padding:7px 10px; border:3px solid transparent;
    background:transparent; color:var(--muted); cursor:pointer; font-size:12px; white-space:nowrap; width:100%; text-align:left; }
  .gas-nav-item:hover{ background:var(--hover); color:var(--text); }
  .gas-nav-item.active{ background:var(--accent); color:#1a1408; font-weight:700; border-color:var(--border); box-shadow:3px 3px 0 var(--shadow); }
  .gas-nav-item .nico{ width:18px; text-align:center; font-size:13px; flex-shrink:0; }
  /* collapsed rail */
  .gas-nav.collapsed .gas-nav-item span.nlabel{ display:none; }
  .gas-nav.collapsed .gas-nav-item{ justify-content:center; padding:7px 0; }
  .gas-nav.collapsed .gas-nav-group-body{ display:none; }
  .gas-nav.collapsed .gas-nav-group-header span{ display:none; }
  .gas-nav.collapsed .gas-nav-group-header{ justify-content:center; padding:6px 0; }
  .gas-nav.collapsed .gas-hints{ display:none; }
  /* Hints section (moved into left sidebar) */
  .gas-hints{ margin-top:12px; display:flex; flex-direction:column; gap:10px; }
  .gas-hints .gas-card{ padding:12px; }
  .gas-side-toggle{ background:var(--hover); border:3px solid var(--border); color:var(--muted);
    padding:6px; margin:12px 6px 0; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:11px;
    box-shadow:3px 3px 0 var(--shadow); }
  .gas-side-toggle:hover{ color:var(--text); }
  /* Cards */
  .gas-card{ background:var(--panel2); border:3px solid var(--border); border-radius:0; padding:16px; box-shadow:3px 3px 0 var(--shadow); }
  .gas-card h4{ margin:2px 0 12px; font-size:14px; color:var(--accent2); letter-spacing:.5px; }
  .gas-label{ font-size:11px; color:var(--muted); margin:13px 0 5px; display:block; letter-spacing:.3px; }
  .gas-input, .gas-select, .gas-textarea{ width:100%; background:var(--inputb); border:3px solid var(--border); color:var(--text);
    border-radius:0; padding:9px 11px; font-size:12px; font-family:inherit; box-shadow:inset 2px 2px 0 var(--shadow); }
  .gas-input:focus, .gas-select:focus, .gas-textarea:focus{ outline:none; border-color:var(--accent); }
  .gas-textarea{ min-height:76px; resize:vertical; }
  .gas-row{ display:flex; gap:12px; flex-wrap:wrap; }
  .gas-btn{ padding:9px 15px; border-radius:0; border:3px solid var(--border); background:var(--accent); color:#1a1408; cursor:pointer;
    font-size:12px; font-weight:700; box-shadow:3px 3px 0 var(--shadow); transition:filter .12s, transform .08s, box-shadow .08s; }
  .gas-btn:hover{ filter:brightness(1.1); }
  .gas-btn:active{ transform:translate(2px,2px); box-shadow:1px 1px 0 var(--shadow); }
  .gas-btn.ghost{ background:var(--hover); color:var(--text); border-color:var(--border); box-shadow:3px 3px 0 var(--shadow); }
  .gas-btn.orange{ background:linear-gradient(135deg,#e07b3a,#d9536f); color:#fff; }
  .gas-btn:disabled{ opacity:.5; cursor:not-allowed; box-shadow:none; }
  .gas-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(168px,1fr)); gap:14px; margin-top:14px; }
  .gas-thumb{ aspect-ratio:1; background:var(--thumbb); border:3px solid var(--border); border-radius:0; overflow:hidden; position:relative; display:grid; place-items:center; transition:border-color .12s; box-shadow:3px 3px 0 var(--shadow); }
  .gas-thumb:hover{ border-color:var(--accent); }
  .gas-thumb img, .gas-thumb canvas{ width:100%; height:100%; object-fit:contain; image-rendering:pixelated; }
  .gas-thumb .meta{ position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.7); color:#efe6d0; font-size:10px; padding:5px 7px; display:flex; justify-content:space-between; }
  .gas-preview{ background:var(--thumbb); border:3px solid var(--border); border-radius:0; padding:14px; display:grid; place-items:center; min-height:180px; max-height:280px; position:relative; overflow:hidden; box-shadow:3px 3px 0 var(--shadow); }
  .gas-preview.tiled{ background-image: radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0); background-size:20px 20px; }
  .gas-canvas{ max-width:100%; max-height:180px; width:auto; height:auto; image-rendering: pixelated; border-radius:0; display:block; }
  .gas-preview img, .gas-canvas, .gas-preview canvas{ cursor:zoom-in; }
  .gas-map-viewport{ width:100%; height:400px; overflow:auto; background:var(--thumbb); border:3px solid var(--border); border-radius:0; padding:0; position:relative; box-shadow:inset 3px 3px 0 var(--shadow); }
  .gas-map-viewport img{ display:block; image-rendering: pixelated; max-width:none; cursor:grab; }
  .gas-kbd{ background:var(--inputb); border:3px solid var(--border); border-bottom-width:5px; padding:1px 6px; font-size:10px; color:var(--muted); }
  .gas-divider{ height:2px; background:var(--border); margin:18px 0; opacity:.7; }
  .gas-note{ font-size:11px; color:var(--muted); line-height:1.7; }
  .gas-progress{ height:12px; background:var(--inputb); border-radius:0; overflow:hidden; border:3px solid var(--border); }
  .gas-progress i{ display:block; height:100%; background:var(--accent); width:0%; transition:width .3s; }
  .gas-pill{ display:inline-flex; align-items:center; gap:5px; font-size:11px; background:var(--hover); border:3px solid var(--border); padding:2px 9px; color:var(--muted); }
  /* Asset lightbox */
  .gas-lightbox-overlay{ position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.72);
    display:grid; place-items:center; padding:24px; }
  .gas-lightbox{ position:relative; background:var(--panel2); border:4px solid var(--border);
    box-shadow:6px 6px 0 var(--shadow); max-width:94vw; max-height:92vh; display:flex; flex-direction:column; }
  .gas-lightbox-bar{ display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--panel);
    border-bottom:4px solid var(--border); }
  .gas-lightbox-title{ font-weight:700; font-size:14px; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .gas-lightbox-id{ margin-left:8px; font-size:11px; color:var(--muted); font-weight:400; }
  .gas-lightbox-act{ margin-left:auto; display:flex; gap:8px; }
  .gas-lightbox-body{ display:grid; place-items:center; padding:16px; overflow:auto; min-width:320px; min-height:220px; }
  .gas-lightbox-body img{ max-width:100%; max-height:72vh; image-rendering:pixelated; }
  .gas-lightbox-note{ text-align:center; font-size:11px; color:var(--muted); padding:0 0 10px; }
  /* ---- Pixel-consistency overrides (neutralize inline styles) ---- */
  .gas-root input[type=color], .gas-root #s-drop, .gas-root #pp-drop, .gas-root #m-drop{
    background:var(--inputb) !important; border:3px solid var(--border) !important; border-radius:0 !important;
  }
  .gas-root #e-list{ background:var(--inputb) !important; border:3px dashed var(--border) !important; border-radius:0 !important; }
  .gas-root [style*="1e2224"]{ background:var(--thumbb) !important; }
  .gas-root input[type=range]{ accent-color:var(--accent); }
  /* Level editor — layer panel items (Photoshop-style) */
  .sc-layer-item{ display:flex; align-items:center; gap:4px; padding:4px 6px; border-radius:5px; cursor:pointer; border:1.5px solid transparent; user-select:none; transition:background 0.1s; min-height:32px; }
  .sc-layer-item:hover{ background:rgba(255,255,255,0.05); }
  .sc-layer-item.active{ border-color:var(--accent); background:rgba(74,158,255,0.12) !important; }
  .sc-layer-item.drag-over{ border-color:#f1c40f; background:rgba(241,196,15,0.15) !important; }
  .sc-layer-item.dragging{ opacity:0.4; }
  .sc-layer-item .ly-vis{ width:20px; height:20px; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; flex-shrink:0; border:none; background:transparent; padding:0; color:var(--muted); }
  .sc-layer-item .ly-vis:hover{ color:var(--text); }
  .sc-layer-item .ly-vis.hidden{ color:#555; }
  .sc-layer-item .ly-lock{ width:20px; height:20px; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:11px; cursor:pointer; flex-shrink:0; border:none; background:transparent; padding:0; color:var(--muted); }
  .sc-layer-item .ly-lock:hover{ color:var(--text); }
  .sc-layer-item .ly-lock.locked{ color:#e74c3c; }
  .sc-layer-item .ly-thumb{ width:24px; height:24px; border-radius:3px; border:1px solid rgba(255,255,255,0.1); flex-shrink:0; overflow:hidden; background:#1a2030; display:flex; align-items:center; justify-content:center; font-size:10px; }
  .sc-layer-item .ly-name{ flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; color:var(--text); padding:0 2px; cursor:pointer; }
  .sc-layer-item .ly-name:hover{ color:var(--accent2); }
  .sc-layer-item .ly-name-input{ flex:1; background:#252a2e; border:1px solid var(--accent); border-radius:3px; color:var(--text); font-size:11px; padding:1px 4px; outline:none; width:0; min-width:0; }
  .sc-layer-item .ly-op{ width:36px; font-size:10px; color:var(--muted); text-align:center; flex-shrink:0; cursor:pointer; }
  .sc-layer-item .ly-op:hover{ color:var(--text); }
  .sc-layer-item .ly-sprite-count{ font-size:9px; color:var(--muted); flex-shrink:0; }
  .sc-layers-list::-webkit-scrollbar{ width:4px; }
  .sc-layers-list::-webkit-scrollbar-track{ background:transparent; }
  .sc-layers-list::-webkit-scrollbar-thumb{ background:var(--border); border-radius:2px; }
  /* Level editor layer panel context menu */
  .sc-layer-ctx{ position:fixed; z-index:9999; background:#252a2e; border:1px solid var(--border); border-radius:6px; padding:4px 0; min-width:150px; box-shadow:0 4px 16px rgba(0,0,0,0.5); }
  .sc-layer-ctx-item{ padding:6px 12px; font-size:11px; cursor:pointer; color:var(--text); display:flex; align-items:center; gap:6px; }
  .sc-layer-ctx-item:hover{ background:rgba(255,255,255,0.08); }
  .sc-layer-ctx-item.danger{ color:#e74c3c; }
  .sc-layer-ctx-sep{ height:1px; background:var(--border); margin:3px 0; }
  /* Element extractor — 结果区（拼贴画布） */
  .gas-extract-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(132px,1fr)); gap:14px; margin-top:10px;
    background:var(--inputb); border:3px solid var(--border); padding:14px; min-height:120px; }
  .gas-extract-cell{ position:relative; width:100%; }
  .gas-extract-item{ position:relative; background:var(--thumbb); border:3px solid var(--border); cursor:grab;
    transition:border-color .15s, box-shadow .15s; }
  .gas-extract-item:hover{ border-color:var(--accent2); }
  .gas-extract-item.sel{ border-color:var(--accent); box-shadow:0 0 0 2px var(--accent); }
  .gas-extract-item img{ width:100%; height:120px; object-fit:contain; display:block; image-rendering:pixelated; }
  .gas-extract-tag{ position:absolute; left:0; right:0; bottom:0; background:rgba(0,0,0,.6); color:var(--text);
    font-size:10px; padding:2px 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .gas-extract-del{ position:absolute; top:3px; right:3px; width:22px; height:22px; line-height:1; padding:0;
    background:rgba(0,0,0,.6); color:#fff; border:1px solid var(--border); cursor:pointer; font-size:12px; }
  .gas-extract-del:hover{ background:var(--pink); color:#fff; }
  .gas-extract-actions{ display:flex; gap:6px; margin-top:6px; }
  .gas-extract-actions .gas-btn{ flex:1; padding:4px 6px; font-size:11px; }
  @media(max-width:900px){ .gas-side{ display:none; } }
`
  root.appendChild(style)

  // ---- Header ----
  const header = document.createElement('div')
  header.className = 'gas-header'
  header.innerHTML = `<div class="gas-logo">G</div>
    <div class="gas-title">游戏美术工坊 <span style="font-weight:400;color:#6ea6d1;">· Godot Ready</span><small>角色 · 序列帧 · 素材 · 抠图 · 无缝大地图 — BYOK · 一键导出 Godot 4.x</small></div>
    <div class="gas-theme-sel" id="theme-sel" title="选择主题">
    <div class="gas-badge">DOCS <b>Godot 4.2</b> · <span style="color:#2ecc71;">● 就绪</span></div>`
  root.appendChild(header)

  // ---- Left nav (grouped) ----
  const tabDefs: { id:string; label:string; icon:string; group:string }[] = [
    { id:'character', label:'角色工坊', icon:'🧍', group:'生成' },
    { id:'seq', label:'单帧动画', icon:'🎬', group:'生成' },
    { id:'forge', label:'素材锻造', icon:'🧱', group:'生成' },
    { id:'scene', label:'场景工坊', icon:'🌦️', group:'生成' },
    { id:'story', label:'烛火剧场', icon:'🎭', group:'生成' },
    { id:'pipe', label:'素材流水线', icon:'🚀', group:'处理' },
    { id:'sheet', label:'序列帧', icon:'🎞️', group:'处理' },
    { id:'matting', label:'智能抠图', icon:'✂️', group:'处理' },
    { id:'extract', label:'元素提取', icon:'🧩', group:'处理' },
    { id:'post', label:'后处理', icon:'✨', group:'处理' },
    { id:'map', label:'无缝大地图', icon:'🗺️', group:'地图' },
    { id:'asset', label:'素材总管', icon:'📚', group:'系统' },
    { id:'preset', label:'API 预设', icon:'🔌', group:'系统' },
    { id:'export', label:'设置/导出', icon:'⚙️', group:'系统' },
  ]
  let active='character'
  const tabEls: Record<string, HTMLElement> = {}
  const nav = document.createElement('nav')
  nav.className = 'gas-nav'
  const groups = [...new Set(tabDefs.map(t=>t.group))]
  groups.forEach(g=>{
    const gh=document.createElement('button')
    gh.className='gas-nav-group-header'
    gh.innerHTML=`<span class="gcaret">▾</span><span>${g}</span>`
    const gb=document.createElement('div'); gb.className='gas-nav-group-body'
    tabDefs.filter(t=>t.group===g).forEach(t=>{
      const b=document.createElement('button')
      b.className='gas-nav-item'+(t.id===active?' active':'')
      b.innerHTML=`<span class="nico">${t.icon}</span><span class="nlabel">${t.label}</span>`
      b.dataset.tab=t.id
      b.onclick=()=>switchTab(t.id)
      gb.appendChild(b); tabEls[t.id]=b
    })
    gh.onclick=()=>{ const closed=gb.classList.toggle('closed'); const c=gh.querySelector('.gcaret'); if(c) c.textContent=closed?'▸':'▾' }
    nav.appendChild(gh); nav.appendChild(gb)
  })

  const shell=document.createElement('div'); shell.className='gas-shell'
  const body=document.createElement('div'); body.className='gas-body'
  const main=document.createElement('div'); main.className='gas-main'
  const side=document.createElement('div'); side.className='gas-hints'
  body.append(main); shell.append(nav, body); root.appendChild(shell)
  nav.appendChild(side)

  // ---- Side panel (Godot hints only; API keys moved to API 预设) ----
  side.innerHTML = `
    <div class="gas-card">
      <h4>📦 Godot 导出预设</h4>
      <div class="gas-note">
        • 角色 → <span class="gas-kbd">Sprite2D</span> + 透明 PNG<br>
        • 序列帧 → <span class="gas-kbd">SpriteFrames</span> / <span class="gas-kbd">AnimatedSprite2D</span><br>
        • 瓦片 → <span class="gas-kbd">TileSet</span> (16/32px) + <span class="gas-kbd">TileMap</span><br>
        • 抠图后直接拖入 <span class="gas-kbd">res://assets/</span>
      </div>
      <button class="gas-btn ghost" id="btn-godot-doc" style="width:100%;margin-top:10px;">打开 Godot 官方文档</button>
    </div>
    <div class="gas-card">
      <h4>💡 流水线提示</h4>
      <div class="gas-note" id="pipeline-tip">角色工坊：推荐先用「像素 32px 三视图」生成，再到序列帧一键拆帧。</div>
    </div>
  `

  side.querySelector('#btn-godot-doc')!.addEventListener('click', ()=> window.open('https://docs.godotengine.org/zh-cn/4.x/tutorials/2d/index.html','_blank'))

  // ---- Main panels ----
  const panels: Record<string, HTMLElement> = {}
  function mkPanel(id:string, html:string): HTMLElement {
    const p=document.createElement('div'); p.id='panel-'+id; p.style.display=id===active?'block':'none'; p.innerHTML=html; return p
  }

  // CHARACTER
  const pChar=mkPanel('character', `
    <div class="gas-card">
      <h4>🧍 角色工坊 — AI 生成 + Godot 兼容</h4>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">角色描述 Prompt</label>
          <textarea class="gas-textarea" id="c-prompt" style="min-height:92px" placeholder="角色描述（支持换行书写长提示词）。例：像素风 32px 冒险家少女，红斗篷，Q版，三视图，正面/侧面/背面，白色背景"></textarea>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">风格</label><select class="gas-select" id="c-style"><option value="pixel32">像素 32px</option><option value="pixel16">像素 16px</option><option value="chibi">Q版 Chibi</option><option value="anime">二次元立绘</option><option value="real">写实</option><option value="free">🎨 自由风格（完全按提示词）</option></select></div>
            <div style="flex:1"><label class="gas-label">视图</label><select class="gas-select" id="c-view"><option value="single">单视图</option><option value="tri">三视图 (前/侧/后)</option><option value="dir8">八方向</option></select></div>
            <div style="flex:1"><label class="gas-label">提供商</label><select class="gas-select" id="c-provider"><option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="c-model-sel" style="display:none;margin-top:6px"></select></div>
          </div>
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label class="gas-label" style="margin:0">背景色</label>
            <input type="color" id="c-bg" value="#ffffff" style="width:46px;height:30px;padding:2px;border:1px solid var(--border);border-radius:6px;background:#1e2224;cursor:pointer">
            <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer;margin-left:8px"><input type="checkbox" id="c-bg-trans">透明背景（PNG）</label>
          </div>
          <div class="gas-row" style="margin-top:10px">
            <button class="gas-btn" id="c-gen" style="flex:1">✨ 生成角色</button>
            <button class="gas-btn ghost" id="c-rand">🎲 随机示例</button>
            <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="c-upload" accept="image/*" hidden>📁 上传参考</label>
          </div>
          <div class="gas-progress" style="margin-top:8px"><i id="c-prog"></i></div>
          <div class="gas-note" id="c-status" style="margin-top:6px"></div>
        </div>
        <div style="width:220px">
          <label class="gas-label">参考图（可选）</label>
          <div class="gas-preview tiled" id="c-ref-preview" style="min-height:80px;max-height:100px"><span class="gas-note">未添加</span></div>
          <label class="gas-label">预览 · Godot Sprite2D</label>
          <div class="gas-preview" id="c-preview"><span class="gas-note">等待生成…</span></div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn ghost" id="c-dl" style="flex:1">⬇ PNG</button>
            <button class="gas-btn ghost" id="c-save">📥 入库</button>
              <button class="gas-btn ghost" id="c-to-sheet">→ 序列帧</button>
              <button class="gas-btn ghost" id="c-to-sheet-auto" title="角色→序列帧→切片→打包→导出 SpriteFrames 一次跑完">⚡ 一键流水线</button>
              <button class="gas-btn" id="c-export-scene" title="导出 Godot CharacterBody2D + SpriteFrames + 动画脚本，拖入 Godot 即可运行角色">🎮 角色场景</button>
          </div>
        </div>
      </div>
      <div class="gas-divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="gas-pill">Godot 导入：Texture2D · Filter: Nearest (像素) · 勾选 Mipmaps 关</span><span class="gas-note">BYOK：优先使用你的 OpenAI/Stability Key</span></div>
      <div class="gas-grid" id="c-gallery"></div>
    </div>
  `)

  // SHEET
  const pSheet=mkPanel('sheet', `
    <div class="gas-card">
      <h4>🎞️ 序列帧工坊 — 拆帧 / 打包 / 预览 / 导出 SpriteFrames</h4>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">上传精灵表或单帧图（将自动切片）</label>
          <div style="border:1.5px dashed var(--border); border-radius:8px; padding:14px; text-align:center; background:#1a1e20; cursor:pointer;" id="s-drop">
            <div style="font-size:22px">🖼️</div><div class="gas-note">拖拽或点击上传 PNG/JPG<br><span class="gas-kbd">支持透明背景</span></div>
            <input type="file" id="s-file" accept="image/*" hidden>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">列 (cols)</label><input class="gas-input" id="s-cols" type="number" value="4" min="1" max="128"></div>
            <div style="flex:1"><label class="gas-label">行 (rows)</label><input class="gas-input" id="s-rows" type="number" value="2" min="1" max="128"></div>
            <div style="flex:1"><label class="gas-label">帧率 FPS</label><input class="gas-input" id="s-fps" type="number" value="8" min="1" max="60"></div>
            <div style="flex:1"><label class="gas-label">边界微剪(px)</label><input class="gas-input" id="s-crop" type="number" value="2" min="0" max="256"></div>
          </div>
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="s-dir-rows"> 行 = 方向（导出命名动画）</label>
            <input class="gas-input" id="s-dir-names" style="flex:1" placeholder="每行方向名,逗号分隔，如 down,left,up,right">
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="s-slice">🔪 切片</button>
            <button class="gas-btn ghost" id="s-pack">📦 打包成表</button>
            <button class="gas-btn ghost" id="s-animate">▶ 播放</button>
            <button class="gas-btn ghost" id="s-zoom">⛶ 全屏预览</button>
            <button class="gas-btn orange" id="s-export">⬇ 导出 Godot</button>
              <button class="gas-btn ghost" id="s-save">📥 入库</button>
          </div>
          <label class="gas-label">AI 生成序列（BYOK · 支持角色参考图，生成后自动智能切分）</label>
          <textarea class="gas-textarea" id="s-prompt" style="min-height:68px" placeholder="只描述动作即可（配合左下方参考图），支持换行书写长提示词。例：像素小骑士 奔跑 8 帧 横向序列，侧面视角，透明背景"></textarea>
          <div class="gas-row" style="margin-top:8px">
            <label class="gas-label" style="margin:0">序列布局</label>
            <select class="gas-select" id="s-layout" style="flex:1"><option value="auto">✨ 智能自动切分（推荐）</option><option value="single">横向单行（8帧）</option><option value="2x4">2 行 × 4 列（8帧）</option><option value="4x2">4 行 × 2 列（8帧）</option><option value="tri">三视图 前/侧/后（3帧）</option><option value="dir8">八方向（2 行 × 4 列）</option></select>
            <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="s-ref" accept="image/*" hidden>📁 角色参考图</label>
            <div id="s-ref-preview" class="gas-preview tiled" style="min-height:44px;max-height:56px;flex:0 0 76px;padding:4px"><span class="gas-note">无</span></div>
            <div style="display:flex;flex-direction:column;flex:0 0 140px"><select class="gas-select" id="s-provider"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="s-model-sel" style="display:none;margin-top:4px"></select></div>
            <button class="gas-btn" id="s-gen">✨ 生成并切分</button>
          </div>
          <div class="gas-note" id="s-status"></div>
        </div>
        <div style="width:300px">
          <label class="gas-label">预览动画（可点「⛶ 放大」撑满全屏）</label>
          <div class="gas-preview tiled" id="s-preview"><canvas class="gas-canvas" id="s-canvas" width="288" height="288"></canvas></div>
          <label class="gas-label">打包结果</label>
          <div class="gas-preview" id="s-pack-preview"><span class="gas-note">等待打包</span></div>
        </div>
      </div>
      <div class="gas-grid" id="s-frames"></div>
      <div class="gas-row" style="margin-top:10px;align-items:center">
        <span class="gas-note" id="s-selinfo" style="flex:1">点击缩略图选中帧 → 微调该帧四边裁剪（去除残留，如邻帧法杖尖端）</span>
        <span class="gas-note">上</span><input class="gas-input" id="s-mt" type="number" value="0" min="0" max="512" style="width:56px">
        <span class="gas-note">下</span><input class="gas-input" id="s-mb" type="number" value="0" min="0" max="512" style="width:56px">
        <span class="gas-note">左</span><input class="gas-input" id="s-ml" type="number" value="0" min="0" max="512" style="width:56px">
        <span class="gas-note">右</span><input class="gas-input" id="s-mr" type="number" value="0" min="0" max="512" style="width:56px">
      </div>
    </div>
  `)

  // 单帧动画工作区（分治策略：AI 逐张画独立单角色，代码负责裁边/对齐/拼接/GIF）
  const pSeq=mkPanel('seq', `
    <div class="gas-card">
      <h4>🎬 单帧动画 — 逐帧生成 · 自动对齐去串位</h4>
      <div class="gas-note" style="margin:0 0 10px">核心：AI 只画"单张独立角色"，帧边界/排列/对齐/拼接全部交给代码 → 从根源消除邻帧串位。每行一个动作=一帧。</div>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">逐帧动作描述（每行一帧）</label>
          <textarea class="gas-textarea" id="q-prompts" style="min-height:110px" placeholder="每行一帧动作。例：
站立 idle
抬右手
挥法杖
收招"></textarea>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">帧率 FPS</label><input class="gas-input" id="q-fps" type="number" value="8" min="1" max="60"></div>
            <div style="flex:1"><label class="gas-label">参考图（可选）</label><label class="gas-btn ghost" style="cursor:pointer;width:100%;justify-content:center"><input type="file" id="q-ref" accept="image/*" hidden>📁 上传</label></div>
            <div style="flex:0 0 150px"><label class="gas-label">提供商</label><select class="gas-select" id="q-provider"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="q-model-sel" style="display:none;margin-top:4px"></select></div>
          </div>
          <div id="q-ref-preview" class="gas-preview tiled" style="min-height:44px;max-height:56px;margin-top:8px"><span class="gas-note">无参考图</span></div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="q-gen">✨ 逐帧生成</button>
            <button class="gas-btn ghost" id="q-align">🔧 批处理对齐</button>
            <button class="gas-btn ghost" id="q-pack">📦 拼成精灵表</button>
            <button class="gas-btn ghost" id="q-gif">🎞 合成 GIF</button>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn ghost" id="q-animate">▶ 预览</button>
            <button class="gas-btn orange" id="q-export">⬇ 导出 Godot</button>
            <button class="gas-btn ghost" id="q-save">📥 全部入库</button>
            <button class="gas-btn ghost" id="q-clear">清空</button>
          </div>
          <div class="gas-progress" style="margin-top:8px"><i id="q-prog"></i></div>
          <div class="gas-note" id="q-status"></div>
        </div>
        <div style="width:320px">
          <label class="gas-label">动画预览（可点 ⛶ 全屏）</label>
          <div class="gas-preview tiled" id="q-preview"><canvas class="gas-canvas" id="q-canvas" width="288" height="288"></canvas></div>
          <label class="gas-label">精灵表（横排拼接）</label>
          <div class="gas-preview" id="q-pack-preview"><span class="gas-note">等待拼接</span></div>
        </div>
      </div>
      <div class="gas-divider"></div>
      <div class="gas-card" style="background:#1e2224">
        <h4>🖱️ 上传整表 → 手动框选裁剪</h4>
        <div class="gas-note" style="margin:0 0 8px">把一张完整序列帧图上传后，用鼠标拖拽框出每一帧区域，框完点「✅ 应用并批量对齐」→ 自动裁白边/统一尺寸/脚底对齐，再复用上面拼接/GIF/导出。</div>
        <div class="gas-row" style="margin-top:6px">
          <label class="gas-btn ghost" style="cursor:pointer;flex:1;justify-content:center"><input type="file" id="q-sheet-file" accept="image/*" hidden>📤 上传整表</label>
          <button class="gas-btn ghost" id="q-box-auto">✨ 自动框图</button>
          <button class="gas-btn ghost" id="q-box-undo">↩ 撤销上一框</button>
          <button class="gas-btn ghost" id="q-box-clear">🧹 清除框选</button>
          <button class="gas-btn" id="q-box-apply">✅ 应用并批量对齐</button>
        </div>
        <div class="gas-preview tiled" style="margin-top:8px;max-height:340px;overflow:auto;background:#0f1213">
          <canvas id="q-sheet-canvas" width="800" height="400" style="display:block;cursor:crosshair;image-rendering:pixelated;max-width:100%;height:auto"></canvas>
        </div>
        <div class="gas-note" id="q-box-status" style="margin-top:6px">未上传整表。</div>
      </div>
      <label class="gas-label">帧列表</label>
      <div class="gas-grid" id="q-frames"></div>
    </div>
  `)


  // 素材处理流水线（五步：切→透→齐→名→导 一键批量）
  const pPipe=mkPanel('pipe', `
    <div class="gas-card">
      <h4>🚀 素材处理流水线 — 切 → 透 → 齐 → 名 → 导 一键批量</h4>
      <div class="gas-note" style="margin:0 0 10px">把 AI 生成图直接变成 Godot 可用动画素材。批量导入单帧或多帧整表，一键完成 切割 → 去背 → 统一画布+脚部对齐 → 规范命名 → 导出 SpriteFrames。</div>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">1️⃣ 导入素材（多选 / 拖拽；单张=整表将自动切分）</label>
          <div style="border:1.5px dashed var(--border);border-radius:8px;padding:14px;text-align:center;background:#1a1e20;cursor:pointer;" id="pp-drop">
            <div style="font-size:22px">📥</div><div class="gas-note">点击或拖拽上传 PNG/JPG<br>支持多选单帧，或一张完整序列帧（自动切分）</div>
            <input type="file" id="pp-file" accept="image/*" multiple hidden>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">动作名（命名前缀）</label><input class="gas-input" id="pp-name" value="walk"></div>
            <div style="flex:1"><label class="gas-label">FPS</label><input class="gas-input" id="pp-fps" type="number" value="8" min="1" max="60"></div>
            <div style="flex:1"><label class="gas-label">目标尺寸（0=自适应）</label><input class="gas-input" id="pp-size" type="number" value="0" min="0" max="4096"></div>
            <div style="flex:1"><label class="gas-label">去背模式</label><select class="gas-select" id="pp-bg"><option value="white">白底去背后</option><option value="gray">灰底去背后</option><option value="none">不去背</option></select></div>
          </div>
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label class="gas-label" style="margin:0">输入类型</label>
            <select class="gas-select" id="pp-mode" style="flex:1"><option value="frames">多张单帧（每张一帧）</option><option value="sheet">一张整表（自动切分）</option></select>
            <button class="gas-btn" id="pp-run">🚀 一键处理</button>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn ghost" id="pp-clear">🧹 清空</button>
            <button class="gas-btn orange" id="pp-dl">⬇ 下载全部</button>
            <button class="gas-btn ghost" id="pp-save">📥 全部入库</button>
          </div>
          <div class="gas-progress" style="margin-top:8px"><i id="pp-prog"></i></div>
          <div class="gas-note" id="pp-status"></div>
        </div>
        <div style="width:320px">
          <label class="gas-label">精灵表（横排）</label>
          <div class="gas-preview" id="pp-pack-preview"><span class="gas-note">等待处理</span></div>
          <label class="gas-label">动画预览</label>
          <div class="gas-preview tiled" id="pp-preview"><canvas class="gas-canvas" id="pp-canvas" width="288" height="288"></canvas></div>
        </div>
      </div>
      <label class="gas-label">处理结果帧</label>
      <div class="gas-grid" id="pp-frames"></div>
    </div>
  `)

  const pForge=mkPanel('forge', `
    <div class="gas-card">
      <h4>🧱 素材锻造 — 道具 / 图标 / 特效 一键批量</h4>
      <label class="gas-label">批量 Prompt（每行一个）</label>
      <textarea class="gas-textarea" id="f-prompts" style="min-height:80px" placeholder="像素风 金币 正面 32px 图标 透明背景
像素风 红药水 瓶子
像素风 木宝箱 关闭/打开 两态"></textarea>
      <div class="gas-row" style="margin-top:8px">
        <div style="flex:1">
          <label class="gas-label">参考图（可选，批量生成都会参考此图）</label>
          <div class="gas-row">
            <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="f-ref" accept="image/*" hidden>📁 上传参考</label>
            <div id="f-ref-preview" class="gas-preview tiled" style="min-height:56px;max-height:80px;flex:1"><span class="gas-note">未添加</span></div>
          </div>
        </div>
      </div>
      <div class="gas-row" style="margin-top:8px">
        <select class="gas-select" id="f-style" style="flex:1"><option value="icon">图标 64px</option><option value="pixel">像素道具</option><option value="fx">特效</option><option value="free">🎨 自由（完全按提示词）</option></select>
        <div style="flex:1;display:flex;flex-direction:column"><select class="gas-select" id="f-provider"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option></select><select class="gas-select" id="f-model-sel" style="display:none;margin-top:4px"></select></div>
        <button class="gas-btn" id="f-batch">⚡ 批量生成</button>
        <button class="gas-btn ghost" id="f-stop" disabled>⏹ 停止</button>
      </div>
      <div class="gas-row" style="margin-top:8px;align-items:center">
        <label class="gas-label" style="margin:0">背景色</label>
        <input type="color" id="f-bg" value="#ffffff" style="width:46px;height:30px;padding:2px;border:1px solid var(--border);border-radius:6px;background:#1e2224;cursor:pointer">
        <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer;margin-left:8px"><input type="checkbox" id="f-bg-trans">透明背景（PNG）</label>
      </div>
      <div class="gas-row" style="margin-top:8px;align-items:center">
        <label class="gas-label" style="margin:0">本地程序化生成（无需 API）</label>
        <button class="gas-btn ghost" id="f-shadow">👤 软阴影</button>
        <button class="gas-btn ghost" id="f-glow">✨ 光晕</button>
      </div>
      <div class="gas-progress" style="margin-top:8px"><i id="f-prog"></i></div>
      <div class="gas-note" id="f-status"></div>
      <div class="gas-grid" id="f-grid"></div>
      <div class="gas-row" style="margin-top:8px">
        <button class="gas-btn ghost" id="f-dl-all">⬇ 打包 ZIP (PNG)</button>
          <button class="gas-btn ghost" id="f-save-all">📥 全部入库</button>
        <button class="gas-btn ghost" id="f-clear">清空</button>
      </div>
    </div>
  `)

  // MATTING
  const pMat=mkPanel('matting', `
    <div class="gas-card">
      <h4>✂️ 智能抠图 — 自动扣背景 / 魔棒 / 色键 / AI</h4>
      <div class="gas-row">
        <div style="flex:1">
          <div style="border:1.5px dashed var(--border); border-radius:8px; padding:14px; text-align:center; background:#1a1e20; cursor:pointer" id="m-drop">
            <div style="font-size:22px">📤</div><div class="gas-note">上传待抠图素材（JPG/PNG）<br>点击或拖拽</div>
            <input type="file" id="m-file" accept="image/*" hidden>
          </div>
          <label class="gas-label">抠图模式</label>
          <select class="gas-select" id="m-mode"><option value="auto" selected>🤖 智能自动扣背景（本地采样，像PS一键抠）</option><option value="point">🖱️ 点选保留主体（精准抠单个元素）</option><option value="box">⬚ 框选保留区域</option><option value="wand">🪄 点击背景擦除（魔棒）</option><option value="chroma">🎨 色键抠图（指定颜色）</option><option value="ai">🌐 AI 抠图 (Replicate rembg / BYOK)</option></select>
          <div class="gas-note" id="m-mode-tip" style="margin-top:4px">🤖 自动模式：自动分析四边背景色，一键扣除背景；复杂背景建议用魔棒或 AI。</div>
          <div id="m-chroma-opts">
            <label class="gas-label">拾取背景色（点击图片拾色）</label>
            <div class="gas-row"><input type="color" id="m-color" value="#ffffff" style="width:48px;height:32px;background:#1e2224;border:1px solid var(--border);border-radius:6px;padding:2px;"><input class="gas-input" id="m-tol" type="range" min="0" max="100" value="30" style="flex:1"><span class="gas-pill" id="m-tol-v">30</span></div>
            <label class="gas-label">羽化 / 描边</label>
            <div class="gas-row"><span class="gas-note">羽化</span><input class="gas-input" id="m-feather" type="range" min="0" max="10" value="0" style="flex:1"><span class="gas-note">描边</span><input type="color" id="m-stroke" value="#000000"></div>
          </div>
          <div class="gas-row" style="margin-top:6px;align-items:center">
            <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="m-keep" checked> 去残留（保留最大主体，自动清理飘絮/碎点）</label>
            <span class="gas-note">色键模式未手动拾色时自动取四角色为背景色</span>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="m-cut">✂️ 一键抠图</button>
            <button class="gas-btn ghost" id="m-reset">↺ 重置</button>
            <button class="gas-btn orange" id="m-dl" disabled>⬇ 下载 PNG</button>
              <button class="gas-btn ghost" id="m-save" disabled>📥 入库</button>
          </div>
          <div class="gas-note" id="m-status"></div>
        </div>
        <div style="width:280px">
          <label class="gas-label">原图</label><div class="gas-preview tiled" id="m-orig" style="min-height:140px"><span class="gas-note">未选择</span></div>
          <label class="gas-label">结果（棋盘格为透明）</label><div class="gas-preview tiled" id="m-result" style="min-height:140px"><span class="gas-note">等待处理</span></div>
          <canvas id="m-canvas" hidden></canvas>
        </div>
      </div>
    </div>
  `)

  // MAP
  const pMap=mkPanel('map', `
      <div class="gas-card">
        <h4>🗺️ 无缝大地图 · AI 完整大地图生成</h4>
        <div class="gas-row">
          <div style="flex:1">
            <label class="gas-label">生成模式</label>
            <select class="gas-select" id="map-mode-type">
              <option value="tile">🧩 瓦片模式（用于 TileMap / TileSet）</option>
              <option value="fullmap" selected>🌍 完整大地图模式（AI 直接生成整张地图）</option>
            </select>
            <div class="gas-note" id="map-mode-tip" style="margin-top:4px">🌍 完整大地图：AI 直接生成一张可用的无缝大地图，适合做场景背景/整图导入；也可以后续切成 TileSet。</div>
            <div class="gas-row" style="margin-top:8px">
              <textarea class="gas-textarea" id="map-prompt" style="min-height:58px" placeholder="例：俯视像素草原村庄大地图，有道路/河流/树木，暗色风格，无缝平铺，无UI（支持换行书写长提示词）"></textarea>
              <select class="gas-select" id="map-provider" style="flex:0 0 128px"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="map-model-sel" style="display:none;margin-top:4px;flex:0 0 128px"></select>
              <button class="gas-btn" id="map-gen">✨ AI 生成</button>
              <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="map-file" accept="image/*" hidden>📁 上传</label>
            </div>
            <div class="gas-row" style="margin-top:8px">
              <div style="flex:1">
                <label class="gas-label">参考图（可选，生成时作为图生图参考）</label>
                <div class="gas-row">
                  <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="map-ref" accept="image/*" hidden>📁 上传参考</label>
                  <div id="map-ref-preview" class="gas-preview tiled" style="min-height:56px;max-height:80px;flex:1"><span class="gas-note">未添加</span></div>
                </div>
              </div>
            </div>
            <div class="gas-row" style="margin-top:8px">
              <div style="flex:1"><label class="gas-label">瓦片尺寸</label><select class="gas-select" id="map-size"><option value="16">16px</option><option value="32" selected>32px</option><option value="64">64px</option><option value="128">128px</option><option value="256">256px</option></select></div>
              <div style="flex:1"><label class="gas-label">完整地图尺寸</label><select class="gas-select" id="map-big-size"><option value="1024">1024×1024</option><option value="1536">1536×1024</option><option value="2048" selected>2048×2048</option><option value="4096">4096×4096</option><option value="8192">8192×8192</option></select></div>
            </div>
            <div class="gas-row" style="margin-top:8px">
              <button class="gas-btn" id="map-seam">♻ 整图无缝化</button>
              <button class="gas-btn ghost" id="map-wang">🔁 镜像无缝 2×2</button>
              <button class="gas-btn ghost" id="map-split">🔪 切成 TileSet</button>
              <button class="gas-btn orange" id="map-export">⬇ 导出 TileSet</button>
              <button class="gas-btn ghost" id="map-dl">⬇ 当前图</button>
            </div>
            <div class="gas-note" id="map-status"></div>
              <div class="gas-progress" id="map-progress" style="margin-top:6px;display:none"><i></i></div>
            <div class="gas-divider"></div>
            <label class="gas-label">🗺️ 完整地图 / 大地图缩放预览（支持滚轮缩放、拖拽查看细节）</label>
            <div class="gas-map-viewport" id="map-big-viewport">
              <span class="gas-note" id="map-big-empty">尚未生成大地图</span>
              <img id="map-big-img" alt="大地图预览" style="display:none;">
            </div>
            <div class="gas-row" style="margin-top:6px">
              <button class="gas-btn ghost" id="map-zoom-in">➕ 放大</button>
              <button class="gas-btn ghost" id="map-zoom-out">➖ 缩小</button>
              <button class="gas-btn ghost" id="map-zoom-fit">适应</button>
              <button class="gas-btn ghost" id="map-zoom-reset">1:1</button>
              <button class="gas-btn orange" id="map-big-dl">⬇ 高清 PNG</button>
              <button class="gas-btn ghost" id="map-save">📥 入库</button>
            </div>
            <div class="gas-note" style="margin-top:6px">💡 示例：完整大地图模式输入「俯视草原村庄无缝大地图」→ 得到整张地图 → 点「整图无缝化」→ 可「切成 TileSet」后在 Godot TileMap 使用。</div>
          </div>
          <div style="width:300px">
            <label class="gas-label">当前纹理/瓦片预览</label><div class="gas-preview tiled" id="map-preview"><span class="gas-note">等待生成/上传</span></div>
            <label class="gas-label">3×3 平铺校验（无缝检验）</label><div class="gas-preview" id="map-tiled" style="background:#0f1213; min-height:120px; overflow:hidden"><canvas id="map-tiled-canvas" width="192" height="192" style="width:192px;height:192px;image-rendering:pixelated"></canvas></div>
          </div>
        </div>
        <div class="gas-card" style="margin-top:12px">
          <h4>🧬 程序化地形（本地生成 · 无需 API）</h4>
          <div class="gas-row" style="align-items:flex-end">
            <div style="flex:1"><label class="gas-label">种子</label><input class="gas-input" id="ptm-seed" value="78123"></div>
            <div style="flex:1"><label class="gas-label">海平面（低=更多陆地）</label><input class="gas-input" id="ptm-sea" type="range" min="-30" max="30" value="0"></div>
            <div style="flex:1"><label class="gas-label">山脉强度</label><input class="gas-input" id="ptm-mtn" type="range" min="0" max="100" value="40"></div>
            <button class="gas-btn" id="ptm-gen">🧬 生成地形</button>
            <button class="gas-btn ghost" id="ptm-export">⬇ 导出 TileSet</button>
            <button class="gas-btn ghost" id="ptm-save">📥 入库</button>
          </div>
          <div class="gas-note" id="ptm-status" style="margin-top:6px">种子化多层噪声地形：水 / 陆地 / 森林 / 山脉 / 雪顶 + 河流，可导出 TileSet.json 与预览图。</div>
          <canvas id="ptm-canvas" width="256" height="256" style="width:100%;image-rendering:pixelated;border:1px solid var(--border);border-radius:10px;margin-top:8px;background:#141822"></canvas>
        </div>
        <div class="gas-card" style="margin-top:12px">
          <h4>🧩 无缝拼接工作台 — 区块矩阵 / AI 边缘重绘 / 掩码 / Godot 导出</h4>
          <div class="gas-row" style="align-items:center">
            <button class="gas-btn" id="st-add">➕ 当前图作新区块</button>
            <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="st-file" accept="image/*" hidden>📁 上传区块图</label>
            <button class="gas-btn ghost" id="st-edge">🔲 提取右边缘参考</button>
            <button class="gas-btn ghost" id="st-edge-b">🔲 提取下边缘参考</button>
            <span class="gas-note" id="st-gridinfo" style="flex:1"></span>
            <button class="gas-btn orange" id="st-export">📦 导出 Godot 包</button>
            <button class="gas-btn ghost" id="st-clear">🗑 清空</button>
          </div>
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label class="gas-label" style="margin:0">对齐偏移(px)</label>
            <input class="gas-input" id="st-offset" type="range" min="-256" max="256" value="0" style="flex:1">
            <span class="gas-pill" id="st-offset-v">0</span>
            <button class="gas-btn ghost" id="st-undo">↺ 撤销上区块</button>
          </div>
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label class="gas-label" style="margin:0">掩码绘制（拖拽涂画）</label>
            <button class="gas-btn ghost" data-mask="col" style="flex:1">🟥 禁足区</button>
            <button class="gas-btn ghost" data-mask="occ" style="flex:1">🟦 遮挡区</button>
            <button class="gas-btn ghost" data-mask="fg" style="flex:1">🟨 前景层</button>
            <button class="gas-btn ghost" id="st-mask-clear">清除当前块掩码</button>
          </div>
          <div class="gas-note" id="st-status" style="margin-top:6px">构思借鉴 MapStitch：AI 大图按区块矩阵拼接 → 提取边缘参考图喂给 AI 局部重绘 → 上传邻接图自动对齐拼合；拖拽绘制 禁足(碰撞)/遮挡(半透明)/前景(压层) 掩码；导出与 MapChunkManager.cs 兼容的 map_data.json（global_position + global_polygons）。</div>
          <canvas id="st-canvas" width="960" height="480" style="width:100%;cursor:pointer;border:1px solid var(--border);border-radius:10px;margin-top:8px;background:#141822;image-rendering:pixelated"></canvas>
        </div>
        <canvas id="map-canvas" hidden></canvas>
      </div>
    `)
// SCENE — 天气 × 日夜（功能借鉴 romestead_weather_free：天气参数库 + 程序化覆盖层渲染）
  // ELEMENT EXTRACTOR
  const pExtract=mkPanel('extract', `
    <div class="gas-card">
      <h4>🧩 元素提取 — 自动框选独立元素 / 点选 / 拖拽 / 保存素材</h4>
      <div class="gas-row">
        <div style="flex:1.2">
          <label class="gas-label">上传地图 / 多元素图（点击或拖拽）</label>
          <div style="border:1.5px dashed var(--border); border-radius:8px; padding:10px; text-align:center; background:#1a1e20; cursor:pointer" id="x-drop">
            <div style="font-size:18px">🗺️</div><div class="gas-note">拖拽或点击上传 PNG/JPG</div>
            <input type="file" id="x-file" accept="image/*" hidden>
          </div>
          <div class="gas-preview tiled" style="min-height:140px;margin-top:8px;position:relative" id="x-preview-wrap"><div id="x-preview" style="width:100%;min-height:140px;display:grid;place-items:center"><span class="gas-note">上传后在这里显示原图</span></div><canvas id="x-overlay" style="position:absolute;inset:0;pointer-events:none;display:none"></canvas></div>
        </div>
        <div style="flex:1">
          <label class="gas-label">提取方式</label>
          <select class="gas-select" id="x-mode"><option value="auto" selected>🔍 自动框出所有独立元素（先自动去背景再分割）</option><option value="point">🖱️ 点选单个元素（点原图某元素，自动框出它）</option><option value="box">⬚ 鼠标框选区域（拉矩形框，提取框内元素）</option><option value="line">✏️ 画分割线（画一条线把场景切开，分别提取）</option><option value="ai" disabled>🌐 AI 分割（SAM）— 即将上线</option></select>
          <div class="gas-note" id="x-mode-tip" style="margin-top:4px">自动模式：先识别背景色并擦除，再对前景做连通域分割，框出每个独立元素。</div>
          <div class="gas-row" style="margin-top:8px">
            <label class="gas-label" style="margin:0">容差</label>
            <input class="gas-input" id="x-tol" type="range" min="5" max="200" value="48" style="flex:1">
            <span class="gas-pill" id="x-tol-v">48</span>
            <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="x-min" checked> 忽略过小碎片</label>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="x-run">🔍 自动提取</button>
            <button class="gas-btn ghost" id="x-clear">↺ 清空</button>
            <button class="gas-btn orange" id="x-save-all" disabled>📥 全部入库</button>
            <button class="gas-btn ghost" id="x-save-sel" disabled>📥 保存选中</button>
            <button class="gas-btn ghost" id="x-dl-sel" disabled>⬇ 下载选中</button>
          </div>
          <div class="gas-note" id="x-status"></div>
        </div>
      </div>
      <div class="gas-divider"></div>
      <label class="gas-label">提取结果（可拖动 / 点击选中 / ✕ 移除 / 保存）</label>
      <div class="gas-extract-grid" id="x-stage"><span class="gas-note">先上传图片并「🔍 自动提取」</span></div>
    </div>
  `)

  const pScene=mkPanel('scene', `
    <div class="gas-card">
      <h4>🌦️ 场景工坊 — 天气 × 日夜 实时预览</h4>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">场景描述 Prompt（可选；留空则用上传 / 本地演示底图）</label>
          <div class="gas-row">
            <textarea class="gas-textarea" id="sc-prompt" style="min-height:58px" placeholder="例：像素风山间小镇，40x40 俯视（支持换行书写长提示词）"></textarea>
            <div style="display:flex;flex-direction:column;flex:0 0 140px"><select class="gas-select" id="sc-provider"><option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="sc-model-sel" style="display:none;margin-top:4px"></select></div>
            <button class="gas-btn" id="sc-gen">✨ 生成场景</button>
            <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="sc-upload" accept="image/*" hidden>📁 上传场景图</label>
            <button class="gas-btn orange" id="sc-export">⬇ 导出当前帧</button>
            <button class="gas-btn ghost" id="sc-save">📥 入库</button>
          </div>
          <div class="gas-note" id="sc-status" style="margin-top:6px"></div>
        </div>
      </div>
    </div>
    <div class="gas-card">
      <h4>☁️ 天气与日夜（参数库：晴天 / 雨天 / 雷暴 / 下雪）</h4>
      <div class="gas-row" style="align-items:center">
        <button class="gas-btn ghost" data-weather="clear" style="flex:1">☀️ 晴天</button>
        <button class="gas-btn ghost" data-weather="rainy" style="flex:1">🌧️ 雨天</button>
        <button class="gas-btn ghost" data-weather="thunder" style="flex:1">⛈️ 雷暴</button>
        <button class="gas-btn ghost" data-weather="snow" style="flex:1">❄️ 下雪</button>
        <button class="gas-btn ghost" id="sc-pause" style="flex:0 0 84px">⏸ 暂停</button>
      </div>
      <div class="gas-row" style="margin-top:8px">
        <div style="flex:1"><label class="gas-label">效果强度</label><input class="gas-input" id="sc-strength" type="range" min="0" max="100" value="100"></div>
        <div style="flex:1"><label class="gas-label">风力 / 飘动</label><input class="gas-input" id="sc-wind" type="range" min="0" max="100" value="40"></div>
        <div style="flex:1"><label class="gas-label">时间（日夜）</label><input class="gas-input" id="sc-hour" type="range" min="0" max="2400" value="1000"></div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <button class="gas-btn" id="sc-tab-weather">☁️ 天气预览</button>
        <button class="gas-btn ghost" id="sc-tab-editor">🎮 关卡编辑</button>
      </div>
      <div id="sc-weather-section">
        <div class="gas-label" style="margin-top:6px">预览（左上角显示 天气 · 时刻；雨/雪/闪电为纯程序化绘制）</div>
        <div class="gas-preview" style="padding:0;overflow:hidden"><canvas id="sc-canvas" width="800" height="450" style="width:100%;height:auto;display:block"></canvas></div>
      </div>
    </div>
    <div class="gas-card" id="sc-editor-card" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <h4 style="margin:0">🎮 关卡编辑器</h4>
        <span class="gas-note">拖拽素材到画布 · 双击删除 · 右键调整层级</span>
        <div style="flex:1"></div>
        <button class="gas-btn ghost" id="sc-ed-import-map">🗺️ 导入地图底图</button>
        <button class="gas-btn ghost" id="sc-ed-extract">🔍 智能提取元素</button>
        <button class="gas-btn ghost" id="sc-ed-water">🌊 海水动画</button>
        <button class="gas-btn" id="sc-ed-export-tscn">⬇ 导出 .tscn</button>
      </div>
      <div style="display:flex;gap:8px;height:480px">
        <!-- 左:素材库+工具栏 -->
        <div style="width:180px;display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <div style="font-size:11px;color:var(--muted);font-weight:bold;margin-bottom:2px">📦 素材库</div>
          <div id="sc-ed-sprite-palette" style="flex:1;overflow-y:auto;background:#1a1e20;border:1px solid var(--border);border-radius:6px;padding:6px;display:flex;flex-direction:column;gap:4px;min-height:120px">
            <div class="gas-note" style="font-size:10px">暂无素材<br>请先在「素材总管」入库</div>
          </div>
          <div style="font-size:11px;color:var(--muted);font-weight:bold;margin-bottom:2px">🛠 工具</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
            <button class="gas-btn ghost sc-ed-tool" data-tool="select" id="sc-ed-tool-select" style="font-size:11px;padding:5px">🖱 选择</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="pan" style="font-size:11px;padding:5px">✋ 平移</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="water-brush" style="font-size:11px;padding:5px">💧 海水笔</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="land-brush" style="font-size:11px;padding:5px">🌍 陆地笔</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="eraser" style="font-size:11px;padding:5px">🧹 橡皮擦</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="extract" style="font-size:11px;padding:5px">🔲 框选提取</button>
            <button class="gas-btn ghost sc-ed-tool" data-tool="particle" style="font-size:11px;padding:5px">✨ 粒子特效</button>
          </div>
          <div style="font-size:10px;color:var(--muted)">笔刷大小</div>
          <input class="gas-input" id="sc-ed-brush-size" type="range" min="4" max="64" value="16" style="width:100%">
        </div>
        <!-- 中:主画布 -->
        <div style="flex:1;position:relative;background:#111314;border:1px solid var(--border);border-radius:8px;overflow:hidden" id="sc-ed-canvas-wrap">
          <canvas id="sc-ed-canvas" style="position:absolute;top:0;left:0;cursor:default"></canvas>
          <canvas id="sc-ed-overlay" style="position:absolute;top:0;left:0;pointer-events:none"></canvas>
        </div>
        <!-- 右:图层+属性 -->
        <div style="width:200px;display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
            <span style="font-size:11px;color:var(--muted);font-weight:bold">📚 图层</span>
            <div style="flex:1"></div>
            <!-- 图层工具栏 -->
            <button class="gas-btn ghost" id="sc-ed-layer-add" title="新建图层" style="padding:2px 5px;font-size:10px;line-height:1">+</button>
            <button class="gas-btn ghost" id="sc-ed-layer-del" title="删除图层" style="padding:2px 5px;font-size:10px;line-height:1;background:#3a1a1a">🗑</button>
            <button class="gas-btn ghost" id="sc-ed-layer-dup" title="复制图层" style="padding:2px 5px;font-size:10px;line-height:1">⧉</button>
            <button class="gas-btn ghost" id="sc-ed-layer-merge" title="向下合并" style="padding:2px 5px;font-size:10px;line-height:1">⬇</button>
          </div>
          <div style="display:flex;gap:4px;margin-bottom:4px">
            <button class="gas-btn ghost" id="sc-ed-lock-all" title="锁定所有" style="flex:1;font-size:9px;padding:2px">🔒锁</button>
            <button class="gas-btn ghost" id="sc-ed-hide-all" title="隐藏所有" style="flex:1;font-size:9px;padding:2px">👁‍🗨隐</button>
            <button class="gas-btn ghost" id="sc-ed-show-all" title="显示所有" style="flex:1;font-size:9px;padding:2px">👁</button>
          </div>
          <div id="sc-ed-layers" class="sc-layers-list" style="flex:1;overflow-y:auto;background:#1a1e20;border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;flex-direction:column;gap:2px;min-height:120px;max-height:260px"></div>
          <div style="font-size:11px;color:var(--muted);font-weight:bold;margin-top:4px">⚙ 属性</div>
          <div id="sc-ed-props" style="background:#1a1e20;border:1px solid var(--border);border-radius:6px;padding:6px;font-size:11px;min-height:60px">
            <div class="gas-note" style="font-size:10px">选中素材查看属性</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;align-items:center">
        <span style="font-size:11px;color:var(--muted)">缩放</span>
        <input class="gas-input" id="sc-ed-zoom" type="range" min="10" max="400" value="100" style="width:120px">
        <span style="font-size:11px;color:var(--muted)" id="sc-ed-zoom-label">100%</span>
        <div style="flex:1"></div>
        <button class="gas-btn ghost" id="sc-ed-undo" style="font-size:11px">↩ 撤销</button>
        <button class="gas-btn ghost" id="sc-ed-clear" style="font-size:11px">🗑 清空</button>
        <button class="gas-btn" id="sc-ed-preview">▶ 实时预览</button>
      </div>
    </div>
  `)
// EXPORT
  const pExport=mkPanel('export', `
    <div class="gas-card">
      <h4>⚙️ 设置 / 导出中心 — Godot 一键打包</h4>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">项目名</label><input class="gas-input" id="e-name" value="MyGodotGame">
          <label class="gas-label">导出清单</label>
          <div id="e-list" style="background:#1a1e20; border:1px solid var(--border); border-radius:6px; padding:8px; min-height:80px; font-size:11px; color:var(--muted)">暂无素材 — 去前面工坊生成后会自动收录</div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="e-manifest">📄 生成 manifest.json</button>
            <button class="gas-btn ghost" id="e-zip">📦 打包下载</button>
            <button class="gas-btn ghost" id="e-proj" title="生成 Godot 4 像素风 project.godot 默认过滤片段（粘贴到项目根目录 project.godot）">⚙️ 像素设置</button>
            <button class="gas-btn ghost" id="e-clear">清空历史</button>
          </div>
          <div class="gas-note" style="margin-top:8px">将导出的 <span class="gas-kbd">assets/</span> 解压到 Godot 项目 <span class="gas-kbd">res://</span>，对应文档：<a href="https://docs.godotengine.org/zh-cn/4.x/classes/class_tileset.html" target="_blank" style="color:var(--accent2)">TileSet</a> · <a href="https://docs.godotengine.org/zh-cn/4.x/classes/class_spriteframes.html" target="_blank" style="color:var(--accent2)">SpriteFrames</a></div>
          <pre id="e-preview" style="background:#0f1213; border:1px solid var(--border); border-radius:6px; padding:8px; font-size:11px; max-height:180px; overflow:auto; display:none"></pre>
        </div>
        <div style="width:260px">
          <div class="gas-card" style="background:#1e2224">
            <h4>📚 Godot 官方参考</h4>
            <div class="gas-note" style="line-height:1.7">
              <a href="https://docs.godotengine.org/zh-cn/4.x/tutorials/2d/2d_sprite_animation.html" target="_blank" style="color:var(--accent2)">2D 精灵动画</a><br>
              <a href="https://docs.godotengine.org/zh-cn/4.x/tutorials/2d/using_tilemap.html" target="_blank" style="color:var(--accent2)">使用 TileMap</a><br>
              <a href="https://docs.godotengine.org/zh-cn/4.x/tutorials/assets/importing_images.html" target="_blank" style="color:var(--accent2)">导入图像</a><br>
              <div class="gas-divider"></div>
              推荐导入设置：<br>
              • 像素素材：<span class="gas-kbd">Filter: Nearest</span><br>
              • 透明：<span class="gas-kbd">Fix Alpha Border</span> 开启
            </div>
          </div>
          <div class="gas-card" style="background:#1e2224">
            <h4>🧹 存储</h4>
            <div class="gas-note">所有素材存于浏览器 IndexedDB / localStorage，刷新不丢失。Key 永不上传。</div>
            <div class="gas-row" style="margin-top:8px"><button class="gas-btn ghost" id="e-dump" style="flex:1">查看存储</button></div>
          </div>
        </div>
      </div>
    </div>
  `)

  // API 预设
  const pPreset=mkPanel('preset', `
    <div class="gas-card">
      <h4>🔑 内置供应商 API Key — 统一在此配置</h4>
      <div class="gas-note">Key 仅存于本地浏览器（localStorage），直连提供商，不经任何服务器。第三方自定义路由请在下方「自定义供应商」添加。</div>
      <div class="gas-row" style="margin-top:10px">
        <div style="flex:1"><label class="gas-label">OpenAI (DALL·E / GPT-Image)</label><input class="gas-input" id="k-openai" placeholder="sk-..." type="password"></div>
        <div style="flex:1"><label class="gas-label">Stability AI</label><input class="gas-input" id="k-stability" placeholder="sk-..." type="password"></div>
      </div>
      <div class="gas-row" style="margin-top:6px">
        <div style="flex:1"><label class="gas-label">Replicate (抠图/放大)</label><input class="gas-input" id="k-replicate" placeholder="r8_..." type="password"></div>
        <div style="flex:1"><label class="gas-label">SiliconFlow / Gemini</label><input class="gas-input" id="k-sf" placeholder="sk-..." type="password"></div>
      </div>
      <div class="gas-row" style="margin-top:10px">
        <button class="gas-btn" id="save-keys" style="flex:1">💾 保存 Key</button>
        <button class="gas-btn ghost" id="clear-keys">清空</button>
      </div>
      <div class="gas-note" id="keys-status" style="margin-top:8px;color:#2ecc71;display:none;">✓ 已保存到本地</div>
    </div>
    <div class="gas-card">
      <h4>🌐 免费网页版入口 — 点击跳转，自行登录使用</h4>
      <div class="gas-note">直接打开 Gemini / ChatGPT 官方网页版，登录后即可对话或生成。工坊只做跳转，如需在工坊内调用生图 API，请使用上方 Key 或下方自定义供应商。</div>
      <div class="gas-row" style="margin-top:8px">
        <button class="gas-btn" id="web-gemini" style="flex:1">🌐 打开 Gemini 网页版</button>
        <button class="gas-btn" id="web-chatgpt" style="flex:1">🌐 打开 ChatGPT 网页版</button>
      </div>
      <div class="gas-divider"></div>
      <h4>🔗 网页联动 — 浏览器扩展（ChatGPT / Gemini）</h4>
      <div class="gas-note">安装项目 <span class="gas-kbd">extension/</span> 目录下的浏览器扩展后（Chrome / Edge 开发者模式加载，见 extension/安装说明.md）：<br>① 点上方按钮（或在工坊中选「🌐 网页版」供应商生成）→ 扩展把提示词<b>自动填入网页对话框</b>——只填入、不自动发送，检查后手动点发送；<br>② 网页生成图片后点图片旁「💾 Godot-Arter」按钮 → 自动保存到 <span class="gas-kbd">assets/generated/</span> 并记录到 <span class="gas-kbd">data/generated_assets.json</span>；工坊页面会自动把它<b>导入素材库</b>（含提示词/来源/时间）。<br>未安装扩展时自动退化为「复制提示词到剪贴板，手动粘贴」。</div>
      <div class="gas-row" style="margin-top:8px">
        <button class="gas-btn ghost" id="web-link-test" style="flex:1">🔍 测试联动服务</button>
        <button class="gas-btn ghost" id="web-link-inbox" style="flex:1">📥 检查网页收件箱</button>
      </div>
      <div class="gas-note" id="web-link-status" style="margin-top:6px"></div>
    </div>
    <div class="gas-card">
      <h4>🔌 第三方 API 路由预设 — 自定义供应商</h4>
      <div class="gas-note">在这里添加你自己的第三方图像生成 API。添加后会自动出现在「角色 / 序列帧 / 素材 / 大地图」的提供商下拉框中，选择即可调用。<br>支持三类兼容协议：<span class="gas-kbd">OpenAI 兼容</span> / <span class="gas-kbd">Stability 风格</span> / <span class="gas-kbd">SiliconFlow 风格</span>。</div>
      <div class="gas-divider"></div>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">预设列表</label>
          <div id="p-list" style="background:#1a1e20;border:1px solid var(--border);border-radius:10px;padding:8px;min-height:80px;font-size:11px;color:var(--muted)">暂无自定义预设</div>
        </div>
        <div style="width:360px">
          <label class="gas-label">预设名称</label><input class="gas-input" id="p-name" placeholder="例：我的中转 / My API">
          <div class="gas-row">
            <div style="flex:1"><label class="gas-label">协议类型</label><select class="gas-select" id="p-type"><option value="openai">OpenAI 兼容</option><option value="stability">Stability 风格</option><option value="siliconflow">SiliconFlow 风格</option></select></div>
            <div style="flex:1">
              <label class="gas-label">模型（可自动获取后勾选多个）</label>
              <input class="gas-input" id="p-model" list="p-model-list" placeholder="默认模型：先「获取默认模型」勾选，或手动输入">
              <datalist id="p-model-list"></datalist>
              <button class="gas-btn ghost" id="p-fetch-models" style="width:100%;margin-top:4px">🔍 获取默认模型</button>
              <div id="p-models-picker" style="display:none;margin-top:8px;border:1px dashed var(--border);border-radius:10px;padding:8px;max-height:200px;overflow:auto">
                <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
                  <span style="font-size:11px;color:var(--muted)">已选 <b id="p-models-count" style="color:var(--accent2)">0</b> 个模型</span>
                  <button class="gas-btn ghost" id="p-models-all" type="button" style="padding:2px 8px;font-size:10px">全选</button>
                  <button class="gas-btn ghost" id="p-models-none" type="button" style="padding:2px 8px;font-size:10px">全不选</button>
                  <button class="gas-btn ghost" id="p-models-ok" type="button" style="padding:2px 8px;font-size:10px;margin-left:auto;color:var(--ok)">✅ 确定</button>
                </div>
                <div id="p-models-list" style="display:flex;flex-direction:column;gap:3px"></div>
              </div>
            </div>
          </div>
          <label class="gas-label">Base URL（可只填到 /v1，系统自动补全 /images/generations）</label><input class="gas-input" id="p-base" placeholder="https://tbtk.asia/v1 或 https://api.example.com/v1/images/generations">
          <label class="gas-label">API Key</label><input class="gas-input" id="p-key" type="password" placeholder="sk-...">
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="p-add" style="flex:1">➕ 新增 / 保存</button>
            <button class="gas-btn ghost" id="p-cancel">取消编辑</button>
          </div>
          <div class="gas-note" id="p-status" style="margin-top:6px"></div>
        </div>
      </div>
    </div>
    <div class="gas-card">
      <h4>🎮 Godot 物理预设 + 碰撞体配置器</h4>
      <div class="gas-note">配置 CharacterBody2D / RigidBody2D 参数，导出 .tscn 直接拖入 Godot 使用</div>
      <div class="gas-row" style="margin-top:10px">
        <div style="flex:1">
          <label class="gas-label">预设类型</label>
          <select class="gas-select" id="phys-type">
            <option value="char">CharacterBody2D（玩家/敌人）</option>
            <option value="rigid">RigidBody2D（物理对象）</option>
            <option value="static">StaticBody2D（静态墙/地板）</option>
          </select>
          <label class="gas-label" style="margin-top:8px">节点名称</label>
          <input class="gas-input" id="phys-name" value="Player" placeholder="节点名">
          <label class="gas-label" style="margin-top:8px">碰撞形状</label>
          <select class="gas-select" id="phys-shape">
            <option value="capsule">CapsuleShape2D（角色用胶囊）</option>
            <option value="circle">CircleShape2D（圆形碰撞）</option>
            <option value="rect">RectangleShape2D（矩形碰撞）</option>
            <option value="convex">ConvexPolygonShape2D（凸多边形）</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="gas-label">碰撞层 / 遮罩</label>
          <div class="gas-row">
            <input class="gas-input" id="phys-layer" type="number" value="1" min="1" max="32" style="flex:1">
            <span class="gas-note" style="margin:0 4px">层</span>
            <input class="gas-input" id="phys-mask" type="number" value="1" min="0" max="32" style="flex:1">
            <span class="gas-note" style="margin:0 4px">遮罩</span>
          </div>
          <label class="gas-label" style="margin-top:8px">质量 (mass)</label>
          <input class="gas-input" id="phys-mass" type="number" value="1.0" step="0.1" min="0.1">
          <label class="gas-label" style="margin-top:8px">初始速度</label>
          <div class="gas-row">
            <input class="gas-input" id="phys-vx" type="number" value="0" placeholder="vx" style="flex:1">
            <input class="gas-input" id="phys-vy" type="number" value="0" placeholder="vy" style="flex:1">
          </div>
          <label class="gas-label" style="margin-top:8px">重力缩放</label>
          <input class="gas-input" id="phys-gravity" type="number" value="1.0" step="0.1" min="0" max="10">
        </div>
      </div>
      <div class="gas-row" style="margin-top:10px">
        <button class="gas-btn" id="phys-export" style="flex:1">⬇ 导出 .tscn</button>
        <button class="gas-btn ghost" id="phys-export-gd" style="flex:1">📜 导出 .gd 脚本</button>
      </div>
    </div>
    <div class="gas-card">
      <h4>🗺️ AutoTile 位图平铺 — 自动识别 bitmask</h4>
      <div class="gas-note">上传瓦片图，自动识别 Godot 4 AutoTile 的 47 种 bitmask，导出 TileSet .tres</div>
      <div class="gas-row" style="margin-top:10px">
        <div style="flex:1">
          <div style="border:1.5px dashed var(--border);border-radius:8px;padding:12px;text-align:center;background:#1a1e20;cursor:pointer;" id="at-drop">
            <div style="font-size:20px">🗺️</div><div class="gas-note">点击或拖拽上传瓦片图 PNG（48×48 / 64×64 / 32×32 等）</div>
            <input type="file" id="at-file" accept="image/*" hidden>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="at-run" style="flex:1">🔍 分析 bitmask</button>
            <button class="gas-btn ghost" id="at-export" disabled style="flex:1">⬇ 导出 TileSet.tres</button>
          </div>
          <div class="gas-note" id="at-status" style="margin-top:6px"></div>
        </div>
        <div style="width:280px">
          <label class="gas-label">识别结果预览</label>
          <div id="at-preview" style="background:#1a1e20;border:1px solid var(--border);border-radius:8px;min-height:120px;max-height:200px;overflow:hidden;display:flex;align-items:center;justify-content:center">
            <span class="gas-note">等待上传…</span>
          </div>
          <div id="at-info" class="gas-note" style="margin-top:6px"></div>
        </div>
      </div>
    </div>
  `)

  // 内置供应商 Key（统一在 API 预设面板配置）
  const LS='dsh-game-art-studio:apiKeys'
  const loadKeys=()=>{
    try{ const j=JSON.parse(localStorage.getItem(LS)||'{}'); (pPreset.querySelector('#k-openai') as HTMLInputElement).value=j.openai||''; (pPreset.querySelector('#k-stability') as HTMLInputElement).value=j.stability||''; (pPreset.querySelector('#k-replicate') as HTMLInputElement).value=j.replicate||''; (pPreset.querySelector('#k-sf') as HTMLInputElement).value=j.siliconflow||'' }catch{}
  }
  const saveKeys=()=>{
    const v={ openai:(pPreset.querySelector('#k-openai') as HTMLInputElement).value.trim(), stability:(pPreset.querySelector('#k-stability') as HTMLInputElement).value.trim(), replicate:(pPreset.querySelector('#k-replicate') as HTMLInputElement).value.trim(), siliconflow:(pPreset.querySelector('#k-sf') as HTMLInputElement).value.trim() }
    localStorage.setItem(LS, JSON.stringify(v))
    const s=pPreset.querySelector('#keys-status') as HTMLElement; s.style.display='block'; setTimeout(()=>s.style.display='none',1500)
  }
  setTimeout(loadKeys,0)
  pPreset.querySelector('#save-keys')!.addEventListener('click', saveKeys)
  pPreset.querySelector('#clear-keys')!.addEventListener('click', ()=>{ localStorage.removeItem(LS); loadKeys() })
  // 免费网页版快捷入口：点击跳转到官方网页版，自行登录使用
  /* ---- 网页联动（浏览器扩展）客户端 ---- */
  const WEB_LINK_BASE = /^https?:$/.test(location.protocol) ? location.origin : ''
  function webToast(msg:string, ok=true){
    let el=document.getElementById('gas-web-toast') as HTMLElement|null
    if(!el){ el=document.createElement('div'); el.id='gas-web-toast'; el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:2147483647;max-width:430px;padding:10px 14px;font-size:12px;line-height:1.6;border:3px solid #594c39;background:#38302a;color:#efe6d0;box-shadow:4px 4px 0 rgba(0,0,0,.45);display:none;font-family:inherit;'; document.body.appendChild(el) }
    el.textContent=msg; el.style.borderColor= ok?'#7cbf5a':'#d9536f'; el.style.display='block'
    clearTimeout((el as any)._t); (el as any)._t=setTimeout(()=>{ el!.style.display='none' },5000)
  }
  async function webLinkPushPrompt(kind:string, prompt:string): Promise<boolean>{
    if(!WEB_LINK_BASE || !prompt) return false
    try{
      const r=await fetch(WEB_LINK_BASE+'/api/web-link/prompt',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ site:kind, prompt, from:'studio' }) })
      const j=await r.json()
      return !!j.ok
    }catch{ return false }
  }
  const openWebPanel=async (kind:string, prompt?:string)=>{
    const url= kind==='gemini' ? 'https://gemini.google.com' : 'https://chatgpt.com'
    const siteName=kind==='gemini'?'Gemini':'ChatGPT'
    
    if(prompt){
      // 检查是否需要服务器模式
      if(!WEB_LINK_BASE){
        // file:// 模式下，尝试使用 Blob URL 下载提示词
        try{
          const textToCopy=`请根据以下描述生成一张图片：

${prompt}

---
提示词来源：Godot-Arter`

          // 方法1：navigator.clipboard (需要 HTTPS 或 localhost)
          try{
            await navigator.clipboard.writeText(textToCopy)
            webToast('📋 提示词已复制到剪贴板 — 打开 '+siteName+' 后按 Ctrl+V 粘贴')
            window.open(url,'_blank')
            return
          }catch{}
          
          // 方法2：execCommand
          try{
            const ta=document.createElement('textarea')
            ta.value=textToCopy
            ta.style.cssText='position:fixed;top:0;left:0;opacity:0;pointer-events:none'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            webToast('📋 提示词已复制 — 打开 '+siteName+' 后 Ctrl+V 粘贴')
            window.open(url,'_blank')
            return
          }catch{}
          
          // 方法3：下载为文本文件
          const blob=new Blob([textToCopy],{type:'text/plain'})
          const dlUrl=URL.createObjectURL(blob)
          const a=document.createElement('a')
          a.href=dlUrl
          a.download='gemini-prompt-'+Date.now()+'.txt'
          a.click()
          URL.revokeObjectURL(dlUrl)
          webToast('⚠️ 复制受限，提示词已下载为文件 — 打开 '+siteName+' 后复制粘贴文件内容',false)
        }catch(e){
          webToast('⚠️ 操作失败，请在 '+siteName+' 中手动输入提示词',false)
        }
        window.open(url,'_blank')
        return
      }
      
      // 尝试联动服务
      const pushed=await webLinkPushPrompt(kind,prompt)
      if(pushed){
        webToast('🔗 提示词已发送到联动服务 — 装有扩展的浏览器会自动填入 '+siteName+' 对话框')
      }else{
        // 联动服务不可用，复制到剪贴板
        try{
          await navigator.clipboard.writeText(prompt)
          webToast('📋 提示词已复制到剪贴板 — 打开 '+siteName+' 后按 Ctrl+V 粘贴')
        }catch{
          webToast('⚠️ 复制失败，请在 '+siteName+' 中手动输入提示词',false)
        }
      }
    }
    // 打开网页
    window.open(url,'_blank')
  }
  pPreset.querySelector('#web-gemini')!.addEventListener('click', ()=> openWebPanel('gemini'))
  pPreset.querySelector('#web-chatgpt')!.addEventListener('click', ()=> openWebPanel('chatgpt'))
  pPreset.querySelector('#web-link-test')!.addEventListener('click', async ()=>{
    const st=pPreset.querySelector('#web-link-status') as HTMLElement
    if(!WEB_LINK_BASE){ st.textContent='⚠️ 当前以 file:// 直开，联动服务不可用 — 请用 node server.mjs 后经 http://127.0.0.1:3080 访问'; st.style.color='var(--warn)'; return }
    try{
      const j=await(await fetch(WEB_LINK_BASE+'/api/web-link/status')).json()
      st.textContent='✅ 联动服务在线 · 已保存 '+j.saved+' 张网页素材'+(j.pending&&j.pending.length?' · 待取提示词: '+j.pending.join('/'):'' )
      st.style.color='var(--ok)'
    }catch{ st.textContent='❌ 联动服务未连接（server.mjs 未运行？）'; st.style.color='var(--pink)' }
  })
  pPreset.querySelector('#web-link-inbox')!.addEventListener('click', ()=> webLinkCheckInbox(0,true))

  /* ===================== 🎭 烛火剧场 · 剧情演出素材生产 =====================
     定位：本工坊只负责"做素材"——编辑剧本数据、AI 生产插画、实时预览演出效果，
     并导出可直接拖入 Godot 项目 res:// 根目录的资产包：
       cutscenes/<id>.tres（CutsceneData 资源，配套 scripts/cutscene/*.gd 数据类）
       cutscenes/<id>.json（引擎无关的同一份数据）
       assets/cutscenes/img/<itemId>.png（分镜/场景底图）
       scripts/cutscene/*.gd（五个 @export 数据类 + 单文件运行时播放器参考实现）
     游戏侧接线、触发条件、存档联动由使用者在 Godot 内自行完成。 */
let pStory: HTMLElement
  ;(()=>{
    pStory=mkPanel('story', `
      <div class="gas-card">
        <h4>🎭 烛火剧场 InkTheater — 剧情演出素材生产</h4>
        <div class="gas-row" style="align-items:flex-end">
          <div style="flex:1"><label class="gas-label">剧本项目</label><select class="gas-select" id="st-proj"></select></div>
          <button class="gas-btn" id="st-new">➕ 新建剧本</button>
          <button class="gas-btn ghost" id="st-rename">✏️ 重命名</button>
          <button class="gas-btn ghost" id="st-del">🗑 删除</button>
          <button class="gas-btn ghost" id="st-sample">📖 载入示例</button>
        </div>
        <div class="gas-note">层级：章节 → 场景 → 分镜。分镜插画可 AI 生成后自动入库绑定；导出的 zip 解压到 Godot 项目 <span class="gas-kbd">res://</span> 根目录即含剧本 .tres/.json、引用 PNG 与 scripts/cutscene 数据类。</div>
      </div>
      <div class="gas-card">
        <div class="gas-row" style="align-items:stretch">
          <div style="width:250px;display:flex;flex-direction:column">
            <label class="gas-label">🤖 AI 剧情助手 <button class="gas-btn ghost" id="st-ai-toggle" style="margin-left:6px;padding:1px 6px;font-size:10px">展开</button></label>
            <div id="st-ai-panel" style="display:none;flex-direction:column;gap:8px;margin-bottom:8px">
              <textarea id="ai-outline-input" class="gas-textarea" style="min-height:80px" placeholder="输入剧情大纲描述，AI 将自动生成详细分镜...
例如：主角在夜晚巡逻城堡，发现入侵者后追击，最终击退敌人"></textarea>
              <div class="gas-row">
                <select id="ai-gen-provider" class="gas-select" style="flex:1">
                  <option value="mock">本地演示(无Key)</option>
                  <option value="openai">OpenAI</option>
                  <option value="siliconflow">SiliconFlow</option>
                </select>
                <select id="ai-model-select" class="gas-select" style="width:100px">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o mini</option>
                  <option value="gpt-3.5-turbo">GPT-3.5</option>
                </select>
              </div>
              <div class="gas-row">
                <select id="ai-img-provider" class="gas-select" style="flex:1">
                  <option value="mock">插画: 本地演示</option>
                  <option value="openai">插画: OpenAI</option>
                  <option value="siliconflow">插画: SiliconFlow</option>
                </select>
              </div>
              <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#9aa0a6">
                <input type="checkbox" id="ai-auto-img" checked> 自动生成插画
              </label>
              <button class="gas-btn" id="st-ai-generate">✨ AI 生成剧情 + 分镜</button>
              <div id="ai-status" class="gas-note" style="margin:0;font-size:10px"></div>
            </div>
          </div>
          <div style="width:250px;display:flex;flex-direction:column">
            <label class="gas-label">📜 剧本大纲</label>
            <div id="st-outline" style="flex:1;background:#1a1e20;border:1px solid var(--border);border-radius:10px;padding:8px;min-height:300px;max-height:430px;overflow:auto;font-size:12px"></div>
            <div class="gas-row" style="margin-top:8px">
              <button class="gas-btn ghost" id="st-add-ch">➕ 章节</button>
              <button class="gas-btn ghost" id="st-add-sc">➕ 场景</button>
              <button class="gas-btn ghost" id="st-add-shot">➕ 分镜</button>
            </div>
          </div>
          <div style="flex:1.25;display:flex;flex-direction:column">
            <label class="gas-label">🎬 分镜编辑</label>
            <div id="st-editor" style="background:#1a1e20;border:1px solid var(--border);border-radius:10px;padding:10px;font-size:12px"></div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column">
            <label class="gas-label">▶ 实时预览 <button class="gas-btn ghost" id="pv-fullscreen" style="margin-left:8px;padding:2px 8px;font-size:11px">⛶ 全屏预览</button></label>
            <div id="story-stage" data-no-zoom style="position:relative;aspect-ratio:16/9;background:#0b0a09;border:2px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer">
              <img id="pv-img" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;z-index:1">
              <div id="pv-dim" style="position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .35s;z-index:2"></div>
              <div id="pv-shake" style="position:absolute;inset:0;z-index:3">
                <div id="pv-dialog" style="position:absolute;left:4%;right:4%;bottom:5%;background:#241c14;border:3px solid #594c39;border-radius:10px;padding:10px 12px;box-shadow:4px 4px 0 rgba(0,0,0,.5)">
                  <div id="pv-speaker" style="font-weight:700;color:#e8a33d;font-size:12px;margin-bottom:4px"></div>
                  <div id="pv-text" style="color:#efe6d0;font-size:13px;line-height:1.65;min-height:44px;white-space:pre-wrap"></div>
                  <div id="pv-hint" style="text-align:right;color:#9aa0a6;font-size:10px;margin-top:2px;opacity:0">点击继续 ▶</div>
                </div>
              </div>
              <div id="pv-choices" style="position:absolute;right:5%;top:8%;z-index:4;display:none;flex-direction:column;gap:8px"></div>
              <div id="pv-state" style="position:absolute;left:8px;top:6px;z-index:4;font-size:10px;color:#9aa0a6"></div>
              <button id="pv-img-fullscreen" style="position:absolute;right:8px;bottom:220px;z-index:10;background:rgba(0,0,0,0.7);border:1px solid #594c39;border-radius:6px;color:#e8a33d;padding:4px 8px;cursor:pointer;font-size:11px;display:none">⛶ 插画全屏</button>
            </div>
            <div class="gas-row" style="margin-top:8px">
              <button class="gas-btn" id="pv-play-scene">▶ 播放当前场景</button>
              <button class="gas-btn ghost" id="pv-stop">⏹ 停止(Esc)</button>
            </div>
            <div class="gas-note" style="margin-top:6px">预览为近似模拟：打字机/入场动画/分支/跳转与导出播放器参数语义一致，缓动手感以 Godot 为准。点击画面=快进打字或继续；Esc=停止。</div>
          </div>
        </div>
      </div>
      <div class="gas-card" data-no-zoom>
        <label class="gas-label">🎞️ 时间轴 — 当前场景分镜（拖拽排序 · 点击选中 · ＋ 追加）</label>
        <div id="st-timeline" style="display:flex;gap:8px;overflow-x:auto;padding:8px;min-height:110px;background:#15181a;border:1px solid var(--border);border-radius:10px"></div>
      </div>
      <div class="gas-card">
        <h4>📤 导出剧情资产包</h4>
        <div class="gas-row">
          <button class="gas-btn" id="st-export-zip">📦 导出剧情包（tres+json+图片+数据类+播放器）</button>
          <button class="gas-btn ghost" id="st-export-json">⬇ 仅导出 JSON</button>
          <span class="gas-note" id="st-status" style="margin-left:auto"></span>
        </div>
        <div class="gas-note">解压到项目 res:// 根目录后：<span class="gas-kbd">scripts/cutscene/</span> 提供六个全局类；游戏内在任意时机实例化 <span class="gas-kbd">InkTheaterPlayer.new()</span> 并调用 <span class="gas-kbd">play_id("剧本id")</span> 即可演出；监听 finished(id) 与 shot_event(name,cid,sid) 接你的游戏逻辑。</div>
      </div>
    `)
    panels.story=pStory
    const $=(q:string)=>pStory.querySelector(q) as HTMLElement
    const statusEl=pStory.querySelector('#st-status') as HTMLElement
    /* ---- 数据模型 ---- */
    type SChoice={ id:string;text:string;next_shot_id:string;condition_flag:string }
    type SShot={ id:string;text:string;speaker:string;speaker_color:string;image_item:string;typewriter_speed:number;entry_anim:string;transition:string;duration:number;darken_bg:number;camera_shake:number;slow_motion:number;choices:SChoice[];goto_scene:string;goto_shot:string;on_complete_signal:string }
    type SScene={ id:string;title:string;background_item:string;bgm_path:string;shots:SShot[] }
    type SChapter={ id:string;title:string;scenes:SScene[] }
    type SProject={ id:string;title:string;chapters:SChapter[] }
    const LS_STORY='dsh-game-art-studio:stories'
    const uid=(pfx:string)=>pfx+Date.now().toString(36)+Math.random().toString(36).slice(2,5)
    const esc=(s:string)=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')
    function loadStories(){ try{ return JSON.parse(localStorage.getItem(LS_STORY)||'{}') }catch{ return {} } }
    let stories:any=loadStories()
    let curId:string=localStorage.getItem('dsh-game-art-studio:storyCur')||''
    if(!curId||!stories[curId]) curId=Object.keys(stories)[0]||''
    const cur=()=>stories[curId]
    const persist=()=>{ localStorage.setItem(LS_STORY,JSON.stringify(stories)); localStorage.setItem('dsh-game-art-studio:storyCur',curId) }
    let sel={ c:-1,s:-1,t:-1 }
    const selShot=()=>{ const p=cur(); if(!p||sel.c<0||sel.s<0||sel.t<0) return null; try{ return p.chapters[sel.c].scenes[sel.s].shots[sel.t] }catch{ return null } }
    const selScene=()=>{ const p=cur(); if(!p||sel.c<0||sel.s<0) return null; try{ return p.chapters[sel.c].scenes[sel.s] }catch{ return null } }
    /* ---- 插画库缓存 ---- */
    let assetCache:any[]=[]
    async function refreshAssets(){ try{ assetCache=await idbGetAll() }catch{ assetCache=[] } renderAll() }
    const itemById=(id:string)=>assetCache.find((a:any)=>a.id===id)||null
    const itemLabel=(a:any)=> '['+(a.kind||'?')+'] '+((a.name||'')+' ').slice(0,22)+'·'+(a.id||'')
    /* ---- 大纲树 ---- */
    function projRow(label:string,onClick:()=>void,onDel?:()=>void){
      const row=document.createElement('div'); row.style.cssText='display:flex;align-items:center;gap:4px;padding:2px 0'
      const b=document.createElement('span'); b.innerHTML=label; b.style.cssText='flex:1;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'; b.onclick=onClick
      row.appendChild(b)
      if(onDel){ const d=document.createElement('button'); d.textContent='✕'; d.title='删除'; d.style.cssText='border:0;background:none;color:#e74c3c;cursor:pointer;font-size:11px'; d.onclick=e=>{ e.stopPropagation(); if(confirm('确定删除？')) onDel() }; row.appendChild(d) }
      return row }
    function renderAll(){ renderProjSelect(); renderOutline(); renderEditor(); }
    function renderOutline(){
      renderProjSelect()
      const box=pStory.querySelector('#st-outline') as HTMLElement; box.innerHTML=''
      const p=cur()
      if(!p){ box.innerHTML='<div class="gas-note">暂无剧本 — 点「新建剧本」开始。「载入示例」可一键体验全流程。</div>'; return }
      const mark=(cond:any)=>cond?'style="color:#e8a33d"':''
      p.chapters.forEach((ch:any,ci:number)=>{
        box.appendChild(projRow(`<span ${mark(sel.c===ci)}>📗 第${ci+1}章 ${esc(ch.title)} <i style="color:#666">(${ch.scenes.length}场景)</i></span>`,
          ()=>{ sel={c:ci,s:-1,t:-1}; renderAll() },
          ()=>{ p.chapters.splice(ci,1); persist(); sel={c:-1,s:-1,t:-1}; renderAll() }))
        ch.scenes.forEach((sc:any,si:number)=>{
          box.appendChild(projRow(`<span ${mark(sel.c===ci&&sel.s===si)}>&nbsp;&nbsp;🎬 ${esc(sc.title)} <i style="color:#666">(${sc.shots.length}分镜)</i></span>`,
            ()=>{ sel={c:ci,s:si,t:-1}; renderAll() },
            ()=>{ ch.scenes.splice(si,1); persist(); if(sel.c===ci&&sel.s>=si) sel.s=-1; sel.t=-1; renderAll() }))
          const last=box.lastChild
          sc.shots.forEach((t:any,ti:number)=>{
            const row=projRow(`&nbsp;&nbsp;&nbsp;&nbsp;<span style="${sel.c===ci&&sel.s===si&&sel.t===ti?'color:#e8a33d':''}">${ti+1}. ${(t.image_item?'🖼':'▫')} ${(t.speaker?esc(t.speaker)+'：':'')}${esc(t.text.slice(0,18))}${t.choices.length?' ⤳':''}${t.duration>0?' ⏱':''}</span>`,
              ()=>{ sel={c:ci,s:si,t:ti}; renderAll() },
              ()=>{ sc.shots.splice(ti,1); persist(); if(sel.c===ci&&sel.s===si&&sel.t>=ti) sel.t=Math.max(-1,sel.t-1); renderAll() })
            row.style.paddingLeft='10px'; box.appendChild(row)
          })
        })
      })
    }
    function renderProjSelect(){ const el=pStory.querySelector('#st-proj') as HTMLSelectElement
      el.innerHTML=Object.values(stories).map((s:any)=>`<option value="${s.id}"${s.id===curId?' selected':''}>${esc(s.title)}</option>`).join('') }
    /* ---- 分镜编辑器 ---- */
    function field(label:string,inner:string){ return '<div style="margin-bottom:7px"><label class="gas-label">'+label+'</label>'+inner+'</div>' }
    function renderEditor(){
      const ed=pStory.querySelector('#st-editor') as HTMLElement; const t=selShot()
      if(!t){ ed.innerHTML='<div class="gas-note">左侧选择分镜后在此编辑；「＋ 分镜」新增。</div>'; renderTimeline(); return }
      const assetOpts=['<option value="">（未设置插画）</option>'].concat(
        assetCache.slice().sort((a:any,b:any)=>b.createdAt-a.createdAt).slice(0,120).map((a:any)=>`<option value="${a.id}"${a.id===t.image_item?' selected':''}>${itemLabel(a)}</option>`)).join('')
      ed.innerHTML=
        field('台词 <i style="font-weight:400">(支持 BBCode 子集：[b][i][color=#hex])</i>',`<textarea class="gas-textarea" data-k="text" style="min-height:60px">${t.text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea>`)+
        `<div class="gas-row">`+
        field('说话人',`<input class="gas-input" data-k="speaker" value="${esc(t.speaker)}">`)+
        field('名字颜色',`<input type="color" data-k="speaker_color" value="${/^#[0-9a-fA-F]{6}$/.test(t.speaker_color)?t.speaker_color:'#ffffff'}" style="height:32px">`)+
        `</div>`+
        field('插画','<select class="gas-select" data-k="image_item">'+assetOpts+'</select>'+
          '<div class="gas-row" style="margin-top:4px"><select class="gas-select" id="e-gen-provider"><option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="siliconflow">SiliconFlow</option></select>'+
          '<button class="gas-btn ghost" id="e-style-tpl">🎨 注入风格模板</button><button class="gas-btn" id="e-gen-img">✨ AI 生成并入库绑定</button></div>'+
          '<textarea class="gas-textarea" id="e-gen-prompt" placeholder="生成提示词：主角描述＋情绪动作＋场景环境（点模板按钮按工坊暗黑童话基调拼装）" style="min-height:46px;margin-top:6px"></textarea>')+
        `<div class="gas-row">`+
        field('入场动画','<select class="gas-select" data-k="entry_anim">'+['fade','slide_left','slide_right','zoom_in'].map(v=>`<option value="${v}"${t.entry_anim===v?' selected':''}>${v}</option>`).join('')+'</select>')+
        field('到下一分镜过渡','<select class="gas-select" data-k="transition">'+['fade','cut','page_flip'].map(v=>`<option value="${v}"${t.transition===v?' selected':''}>${v}</option>`).join('')+'</select>')+
        `</div>`+
        `<div class="gas-row" style="flex-wrap:wrap">`+
        field('打字速度 s/字',`<input class="gas-input" type="number" data-k="typewriter_speed" step="0.005" min="0.005" max="0.3" value="${t.typewriter_speed}" style="width:92px">`)+
        field('停留秒数 0=点击继续',`<input class="gas-input" type="number" data-k="duration" step="0.5" min="0" value="${t.duration}" style="width:92px">`)+
        field('背景暗化 0~1',`<input class="gas-input" type="number" data-k="darken_bg" step="0.05" min="0" max="1" value="${t.darken_bg}" style="width:92px">`)+
        field('镜头震动 0~1',`<input class="gas-input" type="number" data-k="camera_shake" step="0.1" min="0" max="1" value="${t.camera_shake}" style="width:92px">`)+
        field('慢动作 0.1~1',`<input class="gas-input" type="number" data-k="slow_motion" step="0.05" min="0.1" max="1" value="${t.slow_motion}" style="width:92px">`)+
        `</div>`+
        `<div class="gas-row">`+
        field('跳转到 场景id（可选）',`<input class="gas-input" data-k="goto_scene" value="${esc(t.goto_scene)}" placeholder="留空=不跳">`)+
        field('跳转到 分镜id（可选）',`<input class="gas-input" data-k="goto_shot" value="${esc(t.goto_shot)}" placeholder="优先级高于线性下一分镜">`)+
        field('完成事件名（游戏监听）',`<input class="gas-input" data-k="on_complete_signal" value="${esc(t.on_complete_signal)}">`)+
        `</div>`+
        field('分支选项（非空=该分镜末尾显示按钮）','<div id="e-choices"></div><button class="gas-btn ghost" id="e-add-choice" style="margin-top:4px">➕ 加选项</button>')
      ed.querySelectorAll('[data-k]').forEach(inp=>{
        inp.addEventListener('change',()=>{
          const k=(inp as HTMLElement).dataset.k!
          let v=(inp as HTMLInputElement).type==='checkbox'?(inp as HTMLInputElement).checked:(inp as HTMLInputElement).value
          if(k==='text'){ v=(inp as HTMLTextAreaElement).value; t.text=v; renderTimeline() }
          else if(k==='typewriter_speed'){ t.typewriter_speed=Math.min(0.3,Math.max(0.005,+ (inp as HTMLInputElement).value||0.03)) }
          else if(k==='duration'){ t.duration=Math.max(0,+(inp as HTMLInputElement).value||0) }
          else if(k==='darken_bg'){ t.darken_bg=Math.min(1,Math.max(0,+(inp as HTMLInputElement).value||0)) }
          else if(k==='camera_shake'){ t.camera_shake=Math.min(1,Math.max(0,+(inp as HTMLInputElement).value||0)) }
          else if(k==='slow_motion'){ t.slow_motion=Math.min(1,Math.max(0.1,+(inp as HTMLInputElement).value||1)) }
          else if(k==='goto_shot'||k==='goto_scene'||k==='on_complete_signal'){ (t as any)[k]=(inp as HTMLInputElement).value.trim() }
          else if(k==='entry_anim'||k==='transition'){ (t as any)[k]=(inp as HTMLInputElement).value; renderTimeline() }
          else if(k==='image_item'){ t.image_item=v; renderTimeline() }
          else if(k==='speaker_color'||k==='speaker'){ (t as any)[k]=v; renderOutline() }
          else (t as any)[k]=v
          persist()
        })
      })
      const pw=ed.querySelector('#e-gen-prompt') as HTMLTextAreaElement
      ed.querySelector('#e-style-tpl')!.addEventListener('click',()=>{
        pw.value=[ (t.speaker||'主角'), '情绪动作特写，场景环境描述。暗黑童话手绘塔防美术，融合《杀戮尖塔2》与《王国保卫战》，阵营配色（深棕主色、烛金点缀色）。完整场景构图，无文字、无UI。' ].join('')
      })
      ed.querySelector('#e-gen-img')!.addEventListener('click',async ()=>{
        const prompt=pw.value.trim(); if(!prompt) return toast(statusEl,'先填写生成提示词（可用 🎨 模板按钮拼装）',false)
        const prov=(ed.querySelector('#e-gen-provider') as HTMLSelectElement).value
        statusEl.textContent='🎭 插画生成中…('+prov+')'
        let url=''
        try{
          try{ url=await callImageGen(prompt,prov,{ size:'1024x1024' }) }
          catch(e:any){ toast(statusEl,'所选供应商失败，回退本地演示图：'+String(e.message||e).slice(0,50),false)
            url=await callImageGen(prompt,'mock',{ size:'1024x1024' }) }
          const id=await addToLibrary('story',(t.speaker||'插画')+' '+new Date().toLocaleTimeString(),url,{ from:'inktheater', prompt })
          await refreshAssets()
          t.image_item=id; persist()
          ;(ed.querySelector('[data-k="image_item"]') as HTMLSelectElement).value=id
          statusEl.textContent='✅ 已入库并绑定：'+id
          renderTimeline()
        }catch(e:any){ toast(statusEl,'生成失败：'+String(e.message||e).slice(0,90),false) }
      })
      const chBox=ed.querySelector('#e-choices')!
      t.choices.forEach((c:SChoice,i:number)=>{
        const row=document.createElement('div'); row.style.cssText='display:flex;gap:6px;margin-bottom:4px'
        row.innerHTML=`<input class="gas-input" data-c="text" value="${esc(c.text)}" placeholder="选项文字" style="flex:2"><input class="gas-input" data-c="next_shot_id" value="${esc(c.next_shot_id)}" placeholder="目标分镜id(空=下一分镜)" style="flex:1.2"><input class="gas-input" data-c="condition_flag" value="${esc(c.condition_flag)}" placeholder="条件flag(空=恒显)" style="flex:1"><button class="gas-btn ghost" title="移除">✕</button>`
        row.querySelectorAll('input[data-c]').forEach((inp:Element)=>(inp as HTMLInputElement).addEventListener('change',()=>{ (c as any)[(inp as HTMLElement).dataset.c!]=(inp as HTMLInputElement).value; persist() }))
        row.querySelector('button')!.addEventListener('click',()=>{ t.choices.splice(i,1); persist(); renderEditor() })
        chBox.appendChild(row)
      })
      ed.querySelector('#e-add-choice')!.addEventListener('click',()=>{ t.choices.push({ id:uid('o'), text:'选项 '+(t.choices.length+1), next_shot_id:'', condition_flag:'' }); persist(); renderEditor() })
      renderTimeline()
    }
    /* ---- 时间轴 ---- */
    function thumbFor(itemId:string,w:number,h:number){
      const d=document.createElement('div'); d.style.cssText=`width:${w}px;height:${h}px;background:#242a2e;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#566;font-size:18px;overflow:hidden;pointer-events:none`
      const it=itemById(itemId)
      if(it&&it.url){ const im=document.createElement('img'); im.src=it.url; im.style.cssText='width:100%;height:100%;object-fit:cover'; im.draggable=false; d.appendChild(im) }
      else d.textContent='🖼'
      return d }
    function renderTimeline(){
      const tl=pStory.querySelector('#st-timeline') as HTMLElement; tl.innerHTML=''
      const sc=selScene()
      if(!sc){ tl.innerHTML='<div class="gas-note">选择一个场景查看其分镜序列。</div>'; return }
      const p=cur(); let ci=-1, si=-1
      p.chapters.forEach((c:number,i:number)=>(c as any).scenes.forEach((s:any,j:number)=>{ if(s.id===sc.id){ci=i;si=j} }))
      sc.shots.forEach((t:any,i:number)=>{
        const chip=document.createElement('div'); chip.draggable=true; chip.dataset.i=String(i)
        chip.style.cssText=`flex:0 0 auto;width:158px;border:2px solid ${sel.t===i?'var(--accent2)':'var(--border)'};border-radius:8px;background:#1d2124;padding:6px;cursor:grab`
        chip.innerHTML=`<div style="display:flex;justify-content:space-between;font-size:10px;color:#9aa0a6;margin-bottom:4px"><span>#${i+1}</span><span>${t.transition==='fade'?'🌗':t.transition==='page_flip'?'📃':'✂️'} ${t.choices.length?'⤳':''}${t.duration>0?'⏱':''}</span></div>`
        chip.appendChild(thumbFor(t.image_item,142,62))
        const txt=document.createElement('div'); txt.style.cssText='font-size:11px;color:#ddd;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'
        txt.textContent=((t.speaker?t.speaker+'：':'')+t.text||'(空)').slice(0,26)
        chip.appendChild(txt)
        chip.addEventListener('click',()=>{ sel={c:ci,s:si,t:i}; renderEditor(); renderOutline() })
        chip.addEventListener('dragstart',(e:any)=>{ e.dataTransfer!.setData('text/plain',String(i)) })
        chip.addEventListener('dragover',(e:any)=>e.preventDefault())
        chip.addEventListener('drop',(e:any)=>{ e.preventDefault(); const from=parseInt(e.dataTransfer!.getData('text/plain')||'-1'); if(from<0||from===i) return
          const m=sc.shots.splice(from,1)[0]; sc.shots.splice(i,0,m); sel.t=i; persist(); renderAll() })
        tl.appendChild(chip)
      })
      const addChip=document.createElement('div'); addChip.style.cssText='flex:0 0 auto;width:110px;border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9aa0a6;cursor:pointer;font-size:22px'
      addChip.textContent='＋ 分镜'; addChip.onclick=addShot; tl.appendChild(addChip)
    }
    /* ---- CRUD ---- */
    function addShot(){ const p=cur(); if(!p) return toast(statusEl,'先新建剧本',false)
      const sc=selScene()||((()=>{ const ci=sel.c>=0?p.chapters[sel.c]:null; const ch=ci||p.chapters[p.chapters.length-1]; if(!ch) return null
        ch.scenes.push({ id:uid('sc'), title:'场景'+(ch.scenes.length+1), background_item:'', bgm_path:'', shots:[] }); sel={c:p.chapters.indexOf(ch),s:ch.scenes.length-1,t:-1}; return ch.scenes[ch.scenes.length-1] })())
      if(!sc) return toast(statusEl,'先创建章节与场景',false)
      sc.shots.push({ id:uid('shot'), text:'', speaker:'', speaker_color:'#ffffff', image_item:'', typewriter_speed:0.03, entry_anim:'fade', transition:'fade', duration:0, darken_bg:0.6, camera_shake:0, slow_motion:1, choices:[], goto_scene:'', goto_shot:'', on_complete_signal:'' })
      sel.t=sc.shots.length-1; persist(); renderAll() }
    function newProject(title:string): SProject{ const p:SProject={ id:uid('story'), title, chapters:[] }; stories[p.id]=p; curId=p.id
      p.chapters.push({ id:uid('ch'), title:'序章', scenes:[ { id:uid('sc'), title:'场景一', background_item:'', bgm_path:'', shots:[] } ] })
      sel={c:0,s:0,t:-1}; persist(); renderAll(); return p }
    function ensureDemo(){
      const p=newProject('序章·烛火之夜'); const sc0=p.chapters[0].scenes[0]; sc0.title='夜巡的开始'
      sc0.shots=[
        { id:uid('shot'), text:'寒风掠过王旗，[color=#e8a33d]烛火[/color]在塔顶明明灭灭。', speaker:'旁白', speaker_color:'#cdd7e0', image_item:'', typewriter_speed:0.035, entry_anim:'fade', transition:'fade', duration:0, darken_bg:0.55, camera_shake:0.4, slow_motion:1, choices:[], goto_scene:'', goto_shot:'', on_complete_signal:'prologue_patrol_started' },
        { id:uid('shot'), text:'城下集市人声渐息，只剩巡夜人的靴声敲着石阶。', speaker:'旁白', speaker_color:'#cdd7e0', image_item:'', typewriter_speed:0.04, entry_anim:'slide_left', transition:'fade', duration:2, darken_bg:0.6, camera_shake:0, slow_motion:1, choices:[], goto_scene:'', goto_shot:'', on_complete_signal:'' },
      ]
      const sc1:SScene={ id:uid('sc'), title:'老守塔人的低语', background_item:'', bgm_path:'', shots:[
        { id:uid('shot'), text:'孩子，把灯芯挑亮些 —— 它们熄灭的那晚，[b]城墙上的阴影会先走一步[/b]。', speaker:'老守塔人', speaker_color:'#d9536f', image_item:'', typewriter_speed:0.04, entry_anim:'zoom_in', transition:'fade', duration:0, darken_bg:0.7, camera_shake:0, slow_motion:1, choices:[], goto_scene:'', goto_shot:'', on_complete_signal:'' },
        { id:uid('shot'), text:'那么……[color=#8fd18f]选择吧[/color]，听完整个旧故事，还是先去睡觉？', speaker:'老守塔人', speaker_color:'#d9536f', image_item:'', typewriter_speed:0.04, entry_anim:'fade', transition:'cut', duration:0, darken_bg:0.75, camera_shake:0, slow_motion:1, choices:[
            { id:uid('o'), text:'听完故事再睡（flag: curious）', next_shot_id:'', condition_flag:'' },
            { id:uid('o'), text:'明天再说', next_shot_id:'', condition_flag:'' } ], goto_scene:'', goto_shot:'', on_complete_signal:'prologue_choice_made' },
      ] }
      const sc2:SScene={ id:uid('sc'), title:'Boss 登场', background_item:'', bgm_path:'', shots:[
        { id:uid('shot'), text:'雾墙裂开 —— [b]它比传说中更高。[/b]', speaker:'旁白', speaker_color:'#cdd7e0', image_item:'', typewriter_speed:0.03, entry_anim:'zoom_in', transition:'page_flip', duration:2.5, darken_bg:0.85, camera_shake:0.9, slow_motion:0.6, choices:[], goto_scene:'', goto_shot:'', on_complete_signal:'boss_intro_done' },
      ] }
      p.chapters[0].title='序章·烛火之夜'
      p.chapters.push({ id:uid('ch'), title:'第一幕·雾墙', scenes:[sc1,sc2] })
      persist(); renderAll(); toast(statusEl,'示例已载入：2 章 3 场景 5 分镜 —— 点「▶ 播放当前场景」体验预览',true) }
    /* ---- 预览播放器（语义与导出的 GD 播放器一致） ---- */
    const pv={ active:false, typing:false, waiting:false, timer:0 as any, next:()=>{}, finishTyping:()=>{} }
    function findShotById(id:string){ const p=cur(); if(!p||!id) return null
      for(const ch of p.chapters) for(const sc of ch.scenes){ const i=sc.shots.findIndex((x:any)=>x.id===id); if(i>=0) return { sc, i } }
      return null }
    function findSceneById(id:string){ const p=cur(); if(!p||!id) return null
      for(const ch of p.chapters){ const s=ch.scenes.find((x:any)=>x.id===id); if(s) return s } return null }
    function applyEntryAnim(img:HTMLElement,mode:string){
      img.style.transition='none'; img.style.opacity='0'; img.style.transform=''
      void (img as any).offsetWidth
      img.style.transition='opacity .45s ease, transform .55s cubic-bezier(.2,.7,.3,1)'
      requestAnimationFrame(()=>{ img.style.opacity='1'
        if(mode==='slide_left') img.style.transform='translateX(30px)'
        else if(mode==='slide_right') img.style.transform='translateX(-30px)'
        else if(mode==='zoom_in') img.style.transform='scale(1.07)' }) }
    function doShake(el:HTMLElement,intensity:number){ if(intensity<=0) return
      el.style.animation='none'; void (el as any).offsetWidth
      el.style.animation=`pvShake ${(0.34/Math.max(intensity,0.1)).toFixed(2)}s linear 3` }
    function stripBB(s:string){ return String(s).replace(/\[\/?(b|i|color)(=[^\]]*)?\]/gi,'') }
    function playShot(sc:SScene,idx:number){
      if(!pv.active) return
      const t=sc.shots[idx]; if(!t){ stopPreview(); return }
      const img=pStory.querySelector('#pv-img') as HTMLImageElement
      const dim=pStory.querySelector('#pv-dim') as HTMLElement
      const chBox=pStory.querySelector('#pv-choices') as HTMLElement
      const spk=pStory.querySelector('#pv-speaker') as HTMLElement
      const txt=pStory.querySelector('#pv-text') as HTMLElement
      const hint=pStory.querySelector('#pv-hint') as HTMLElement
      const state=pStory.querySelector('#pv-state') as HTMLElement
      state.textContent=t.id
      dim.style.background=`rgba(0,0,0,${t.darken_bg})`
      chBox.innerHTML=''; chBox.style.display='none'
      const src=itemById(t.image_item)?.url||''
      if(src){ img.src=src; pvImgFullscreenBtn.style.display='block'; pvImgFullscreenBtn.onclick=(e:Event)=>{ e.stopPropagation(); openImgFullscreen(src) } }
      else { pvImgFullscreenBtn.style.display='none' }
      applyEntryAnim(img,t.entry_anim)
      doShake(pStory.querySelector('#pv-shake') as HTMLElement,t.camera_shake)
      spk.textContent=t.speaker; spk.style.color=/^#[0-9a-fA-F]{6}$/.test(t.speaker_color)?t.speaker_color:'#fff'
      const pure=stripBB(t.text)
      txt.textContent=''; hint.style.opacity='0'
      pv.typing=true; pv.waiting=false; let vi=0
      const speedMs=Math.max(6,t.typewriter_speed*1000/t.slow_motion)
      clearInterval(pv.timer)
      pv.finishTyping=()=>{ clearInterval(pv.timer); vi=pure.length; txt.textContent=pure; pv.typing=false }
      pv.timer=setInterval(()=>{
        vi++; txt.textContent=pure.slice(0,vi)
        if(vi>=pure.length){ clearInterval(pv.timer); pv.typing=false; onTypedDone() }
      },speedMs)
      if(pure.length===0){ clearInterval(pv.timer); pv.typing=false; onTypedDone() }
      function onTypedDone(){
        if(!pv.active) return
        if(t.choices.length){
          hint.style.opacity='0'
          t.choices.forEach((c:SChoice)=>{
            const b=document.createElement('button'); b.className='gas-btn'; b.style.width='230px'; b.textContent=c.text+'（flag:'+c.condition_flag+'｜目标:'+(c.next_shot_id||'线性')+'）'
            b.addEventListener('click',ev=>{ ev.stopPropagation()
              if(!pv.active) return
              if(c.next_shot_id){ const f=findShotById(c.next_shot_id); if(f) return playShot(f.sc,f.i) }
              if(idx+1<sc.shots.length) return playShot(sc,idx+1)
              endShow() })
            chBox.appendChild(b) })
          chBox.style.display='flex'
          pv.waiting=true; pv.next=()=>endShow()
          return }
        hint.style.opacity='1'
        const advance=()=>{
          if(t.goto_shot){ const f=findShotById(t.goto_shot); if(f) return playShot(f.sc,f.i) }
          if(t.goto_scene){ const s=findSceneById(t.goto_scene); if(s&&s.shots.length) return playShot(s,0) }
          if(idx+1<sc.shots.length) return playShot(sc,idx+1)
          // 场景末尾 → 工程内线性推进到下一场景/章节首镜
          const p=cur(); if(!p) return endShow()
          let ci=-1, si=-1
          p.chapters.forEach((c:any,i:number)=>c.scenes.forEach((s:any,j:number)=>{ if(s.id===sc.id){ci=i;si=j} }))
          if(ci>=0){
            if(si+1<p.chapters[ci].scenes.length) return playShot(p.chapters[ci].scenes[si+1],0)
            if(p.chapters[ci+1]&&p.chapters[ci+1].scenes.length) return playShot(p.chapters[ci+1].scenes[0],0) }
          endShow() }
        pv.waiting=true; pv.next=advance
        if(t.duration>0){ setTimeout(()=>{ if(pv.active&&pv.waiting&&!pv.typing){ pv.waiting=false; advance() } }, Math.max(1,t.duration*1000/t.slow_motion)) } }
    }
    function endShow(){ stopPreview(); toast(statusEl,'演出结束 ✓（on_complete 信号见各分镜配置）',true) }
    function stopPreview(){ pv.active=false; pv.typing=false; pv.waiting=false; clearInterval(pv.timer)
      const img=pStory.querySelector('#pv-img') as HTMLImageElement; img.style.opacity='0'
      ;(pStory.querySelector('#pv-dim') as HTMLElement).style.background='rgba(0,0,0,0)'
      ;(pStory.querySelector('#pv-text') as HTMLElement).textContent=''
      ;(pStory.querySelector('#pv-speaker') as HTMLElement).textContent=''
      ;(pStory.querySelector('#pv-hint') as HTMLElement).style.opacity='0'
      const cb=pStory.querySelector('#pv-choices') as HTMLElement; cb.innerHTML=''; cb.style.display='none'
      ;(pStory.querySelector('#pv-state') as HTMLElement).textContent='' }
    function wirePreview(){
      const stg=pStory.querySelector('#story-stage') as HTMLElement
      stg.addEventListener('click',()=>{
        if(!pv.active) return
        if(pv.typing){ pv.finishTyping(); return }
        if(pv.waiting){ pv.waiting=false; pv.next() } })
      document.addEventListener('keydown',e=>{ if((e as KeyboardEvent).key==='Escape'&&pv.active) stopPreview() })
      pStory.querySelector('#pv-play-scene')!.addEventListener('click',()=>{
        const sc=selScene(); if(!sc) return toast(statusEl,'先在大纲中选择要演出的场景',false)
        if(!sc.shots.length) return toast(statusEl,'该场景还没有分镜',false)
        stopPreview(); pv.active=true
        toast(statusEl,'▶ 预览中：'+sc.title,false)
        playShot(sc,Math.max(0,sel.t)) })
      pStory.querySelector('#pv-stop')!.addEventListener('click',stopPreview) }
      
      // 全屏预览功能
      pStory.querySelector('#pv-fullscreen')!.addEventListener('click',()=>{
        const sc=selScene()
        if(!sc){ toast(statusEl,'请先选择一个场景',false); return }
        openStoryFullscreen(sc)
      })
      
      // 插画全屏按钮
      const pvImgFullscreenBtn=pStory.querySelector('#pv-img-fullscreen') as HTMLButtonElement
      pStory.querySelector('#story-stage')!.addEventListener('click',(e:Event)=>{
        const target=e.target as HTMLElement
        if(target.id==='pv-img'||target.closest('#pv-img')){
          const src=(pStory.querySelector('#pv-img') as HTMLImageElement).src
          if(src&&!src.includes('data:image/png;base64,R0lGODlh')) openImgFullscreen(src)
        }
      })
    /* ==== 序列化纯函数（供导出与离线结构验证复用；参数注解形态固定为 (x:SType)，验证器按表剥除） ==== */
    function storyTresEscape(s:string){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'').replace(/\n/g,'\\n').replace(/\t/g,'\\t') }
    function storyColorVal(hex:string){ if(/^#[0-9a-fA-F]{6}$/.test(hex)){
        const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255
        return 'Color('+r.toFixed(4)+', '+g.toFixed(4)+', '+b.toFixed(4)+', 1)'
      } return 'Color(1, 1, 1, 1)' }
    function collectStoryImages(p:SProject){ const out:string[]=[]; const push=(id:string)=>{ if(id&&out.indexOf(id)<0) out.push(id) }
      p.chapters.forEach((ch:SChapter)=>ch.scenes.forEach((sc:SScene)=>{ push(sc.background_item); sc.shots.forEach((t:SShot)=>push(t.image_item)) }))
      return out }
    function buildStoryTres(p:SProject,imgPath:(itemId:string)=>string){
      const lines:string[]=[]; const exts=[
        '[ext_resource type="Script" path="res://scripts/cutscene/cutscene_data.gd" id="scr_data"]',
        '[ext_resource type="Script" path="res://scripts/cutscene/cutscene_chapter.gd" id="scr_ch"]',
        '[ext_resource type="Script" path="res://scripts/cutscene/cutscene_scene.gd" id="scr_sc"]',
        '[ext_resource type="Script" path="res://scripts/cutscene/cutscene_shot.gd" id="scr_shot"]',
        '[ext_resource type="Script" path="res://scripts/cutscene/cutscene_choice.gd" id="scr_choice"]',
      ]
      exts.forEach(e=>lines.push(e))
      let n=0
      const nid=(pfx:string)=>{ n++; return pfx+'_'+n }
      const resOfChoice=(c:SChoice)=>{
        const id=nid('choice')
        lines.push('[sub_resource type="Resource" id="'+id+'"]')
        lines.push('script = ExtResource("scr_choice")')
        lines.push('text = "'+storyTresEscape(c.text)+'"')
        lines.push('next_shot_id = "'+storyTresEscape(c.next_shot_id)+'"')
        lines.push('condition_flag = "'+storyTresEscape(c.condition_flag)+'"')
        return id }
      const resOfShot=(t:SShot)=>{
        const cid=t.choices.map((c:any)=>resOfChoice(c))
        const id=nid('shot')
        lines.push('[sub_resource type="Resource" id="'+id+'"]')
        lines.push('script = ExtResource("scr_shot")')
        lines.push('id = "'+storyTresEscape(t.id)+'"')
        lines.push('image_path = "'+storyTresEscape(t.image_item?imgPath(t.image_item):'')+'"')
        lines.push('speaker = "'+storyTresEscape(t.speaker)+'"')
        lines.push('speaker_color = '+storyColorVal(t.speaker_color))
        lines.push('text = "'+storyTresEscape(t.text)+'"')
        lines.push('typewriter_speed = '+t.typewriter_speed)
        lines.push('entry_anim = "'+t.entry_anim+'"')
        lines.push('transition = "'+t.transition+'"')
        lines.push('duration = '+t.duration)
        lines.push('darken_bg = '+t.darken_bg)
        lines.push('camera_shake = '+t.camera_shake)
        lines.push('slow_motion = '+t.slow_motion)
        lines.push('choices = Array[Resource](['+cid.map(x=>'SubResource("'+x+'")').join(', ')+'])')
        lines.push('goto_scene = "'+storyTresEscape(t.goto_scene)+'"')
        lines.push('goto_shot = "'+storyTresEscape(t.goto_shot)+'"')
        lines.push('on_complete_signal = "'+storyTresEscape(t.on_complete_signal)+'"')
        return id }
      const resOfScene=(sc:SScene)=>{
        const sids=sc.shots.map((s0:SShot)=>resOfShot(s0))
        const id=nid('scene')
        lines.push('[sub_resource type="Resource" id="'+id+'"]')
        lines.push('script = ExtResource("scr_sc")')
        lines.push('id = "'+storyTresEscape(sc.id)+'"')
        lines.push('title = "'+storyTresEscape(sc.title)+'"')
        lines.push('background_path = "'+storyTresEscape(sc.background_item?imgPath(sc.background_item):'')+'"')
        lines.push('bgm_path = "'+storyTresEscape(sc.bgm_path)+'"')
        lines.push('shots = Array[Resource](['+sids.map(x=>'SubResource("'+x+'")').join(', ')+'])')
        return id }
      const resOfChapter=(ch:SChapter)=>{
        const cs=ch.scenes.map((c1:SScene)=>resOfScene(c1))
        const id=nid('chapter')
        lines.push('[sub_resource type="Resource" id="'+id+'"]')
        lines.push('script = ExtResource("scr_ch")')
        lines.push('id = "'+storyTresEscape(ch.id)+'"')
        lines.push('title = "'+storyTresEscape(ch.title)+'"')
        lines.push('scenes = Array[Resource](['+cs.map(x=>'SubResource("'+x+'")').join(', ')+'])')
        return id }
      const chIds=p.chapters.map((c2:any)=>resOfChapter(c2))
      const head='[gd_resource type="Resource" script_class="CutsceneData" load_steps='+(5+n+1)+' format=3]'
      lines.unshift(head)
      lines.push('[resource]')
      lines.push('script = ExtResource("scr_data")')
      lines.push('id = "'+storyTresEscape(p.id)+'"')
      lines.push('title = "'+storyTresEscape(p.title)+'"')
      lines.push('chapters = Array[Resource](['+chIds.map(x=>'SubResource("'+x+'")').join(', ')+'])')
      return lines.join('\n') }

    /* ---- 随包附带的 Godot 侧文件（素材交付物的一部分；接线由使用者在引擎内完成） ---- */
    const STORY_PLAYER_GD=[
      'class_name InkTheaterPlayer',
      'extends CanvasLayer',
      '',
      '# 烛火剧场 · 单文件运行时播放器（参考实现，随剧情资产包交付）',
      '# 用法：var t := InkTheaterPlayer.new(); add_child(t); t.play_id("prologue")',
      '# 监听：finished(cutscene_id)',
      '#       shot_event(event_name, cutscene_id, shot_id)  —— 分镜配置了“完成事件名”时触发',
      '# 点击画面：打字中=立即显示全文；显示完=进入下一分镜。Esc 停止演出。',
      '',
      'signal finished(cutscene_id: String)',
      'signal shot_event(event_name: String, cutscene_id: String, shot_id: String)',
      '',
      'var _cid := ""',
      'var _data: CutsceneData',
      'var _root: Control',
      'var _holder: Control',
      'var _shake_grp: Control',
      'var _dim: ColorRect',
      'var _img: TextureRect',
      'var _dialog: PanelContainer',
      'var _speaker: Label',
      'var _text: RichTextLabel',
      'var _hint: Label',
      'var _choices_box: VBoxContainer',
      'var _type_tween: Tween',
      'var _move_tween: Tween',
      'var _run_token := 0',
      'var _typing := false',
      'var _last_scene: CutsceneScene',
      'var _last_idx := -1',
      'var _last_shot: CutsceneShot',
      '',
      'func _ready() -> void:',
      '\tlayer = 100',
      '\tvisible = false',
      '\t_build_ui()',
      '',
      'func _build_ui() -> void:',
      '\t_root = Control.new()',
      '\t_root.name = "Stage"',
      '\t_root.set_anchors_preset(Control.PRESET_FULL_RECT)',
      '\tadd_child(_root)',
      '\t_dim = ColorRect.new()',
      '\t_dim.color = Color(0, 0, 0, 0)',
      '\t_dim.set_anchors_preset(Control.PRESET_FULL_RECT)',
      '\t_root.add_child(_dim)',
      '\t_holder = Control.new()',
      '\t_holder.set_anchors_preset(Control.PRESET_FULL_RECT)',
      '\t_root.add_child(_holder)',
      '\t_img = TextureRect.new()',
      '\t_img.set_anchors_preset(Control.PRESET_FULL_RECT)',
      '\t_img.offset_left = 32.0',
      '\t_img.offset_right = -32.0',
      '\t_img.offset_top = 24.0',
      '\t_img.offset_bottom = -232.0',
      '\t_img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE',
      '\t_img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED',
      '\t_img.modulate = Color(1, 1, 1, 0)',
      '\t_img.pivot_offset = Vector2.ZERO',
      '\t_holder.add_child(_img)',
      '\t_shake_grp = Control.new()',
      '\t_shake_grp.set_anchors_preset(Control.PRESET_FULL_RECT)',
      '\t_shake_grp.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\t_root.add_child(_shake_grp)',
      '\t_dialog = PanelContainer.new()',
      '\t_dialog.anchor_left = 0.04',
      '\t_dialog.anchor_right = 0.96',
      '\t_dialog.anchor_top = 1.0',
      '\t_dialog.anchor_bottom = 1.0',
      '\t_dialog.offset_top = -212.0',
      '\t_dialog.offset_bottom = -18.0',
      '\tvar style := StyleBoxFlat.new()',
      '\tstyle.bg_color = Color(0.141, 0.110, 0.078, 0.94)',
      '\tstyle.border_color = Color(0.35, 0.30, 0.22)',
      '\tstyle.set_border_width_all(3)',
      '\tstyle.set_corner_radius_all(10)',
      '\t_dialog.add_theme_stylebox_override("panel", style)',
      '\t_dialog.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\t_shake_grp.add_child(_dialog)',
      '\tvar vbox := VBoxContainer.new()',
      '\tvbox.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\t_dialog.add_child(vbox)',
      '\t_speaker = Label.new()',
      '\t_speaker.add_theme_font_size_override("font_size", 15)',
      '\t_speaker.add_theme_color_override("font_color", Color(0.91, 0.64, 0.24))',
      '\t_speaker.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\tvbox.add_child(_speaker)',
      '\t_text = RichTextLabel.new()',
      '\t_text.bbcode_enabled = true',
      '\t_text.fit_content = true',
      '\t_text.custom_minimum_size = Vector2(0, 76)',
      '\t_text.add_theme_color_override("default_color", Color(0.94, 0.90, 0.82))',
      '\t_text.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\tvbox.add_child(_text)',
      '\t_hint = Label.new()',
      '\t_hint.text = "点击继续 ▶"',
      '\t_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT',
      '\t_hint.modulate = Color(1, 1, 1, 0.0)',
      '\t_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE',
      '\tvbox.add_child(_hint)',
      '\t_choices_box = VBoxContainer.new()',
      '\t_choices_box.anchor_left = 0.60',
      '\t_choices_box.anchor_right = 0.96',
      '\t_choices_box.anchor_top = 0.06',
      '\t_choices_box.add_theme_constant_override("separation", 10)',
      '\t_choices_box.visible = false',
      '\t_root.add_child(_choices_box)',
      '\t_root.gui_input.connect(_on_stage_input)',
      '',
      'func play_id(cutscene_id: String) -> void:',
      '\t_cid = cutscene_id',
      '\tvar path := "res://cutscenes/%s.tres" % cutscene_id',
      '\tif not ResourceLoader.exists(path):',
      '\t\tpush_warning("InkTheater: 剧本不存在 %s" % path)',
      '\t\treturn',
      '\t_data = load(path) as CutsceneData',
      '\tif _data == null:',
      '\t\tpush_warning("InkTheater: 剧本类型不正确 %s" % path)',
      '\t\treturn',
      '\t_run_token += 1',
      '\t_kill_move()',
      '\t_finish_type()',
      '\tvisible = true',
      '\tif _data.chapters.is_empty():',
      '\t\t_end_show()',
      '\t\treturn',
      '\t_play(_data.chapters[0].scenes[0], 0)',
      '',
      'func stop() -> void:',
      '\t_visible_off()',
      '',
      'func _exit_tree() -> void:',
      '\t_root = null',
      '',
      'func _on_stage_input(event: InputEvent) -> void:',
      '\tif not visible or _data == null:',
      '\t\treturn',
      '\tif event is InputEventMouseButton and event.pressed:',
      '\t\t_advance_click()',
      '',
      'func _unhandled_key_input(event: InputEvent) -> void:',
      '\tif visible and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:',
      '\t\tstop()',
      '',
      'func _advance_click() -> void:',
      '\tif _typing:',
      '\t\t_finish_type()',
      '\t\treturn',
      '\tif _can_step() and _last_scene != null and _last_idx >= 0:',
      '\t\t_next_from(_last_scene, _last_idx, _last_shot, _run_token)',
      '',
      'func _kill_move() -> void:',
      '\tif _move_tween != null and _move_tween.is_valid():',
      '\t\t_move_tween.kill()',
      '',
      'func _finish_type() -> void:',
      '\tif _type_tween != null and _type_tween.is_valid():',
      '\t\t_type_tween.kill()',
      '\t_typing = false',
      '\t_text.visible_characters = -1',
      '\t_hint.modulate.a = 0.85',
      '',
      'func _clear_choices() -> void:',
      '\tfor c in _choices_box.get_children():',
      '\t\tc.queue_free()',
      '\t_choices_box.visible = false',
      '',
      'func _token_ok(token: int) -> bool:',
      '\treturn token == _run_token and visible',
      '',
      'func _can_step() -> bool:',
      '\treturn true',
      '',
      'func _play(scene_res: CutsceneScene, idx: int) -> void:',
      '\tvar token := _run_token',
      '\tif idx >= scene_res.shots.size():',
      '\t\t_next_after(scene_res, token)',
      '\t\treturn',
      '\tvar t: CutsceneShot = scene_res.shots[idx]',
      '\t_last_scene = scene_res',
      '\t_last_idx = idx',
      '\t_last_shot = t',
      '\t_clear_choices()',
      '\t_finish_type()',
      '\t_text.clear()',
      '\t_hint.modulate.a = 0.0',
      '\t_dim.color.a = t.darken_bg',
      '\tif t.image_path != "":',
      '\t\t_img.texture = load(t.image_path)',
      '\telse:',
      '\t\t_img.texture = null',
      '\t_speaker.text = t.speaker',
      '\t_speaker.add_theme_color_override("font_color", t.speaker_color)',
      '\t_text.text = t.text',
      '\tif t.on_complete_signal != "":',
      '\t\t_emit_event(t.on_complete_signal, t.id)',
      '\t_entry_anim(t.entry_anim, token)',
      '\t_do_shake(t.camera_shake)',
      '\t# 打字机（visible_characters 由 0 推进到总字数）',
      '\t_text.visible_characters = 0',
      '\t_typing = true',
      '\tvar total_chars := t.text.length()',
      '\tvar dur := total_chars * t.typewriter_speed / maxf(t.slow_motion, 0.05)',
      '\t_type_tween = create_tween()',
      '\t_type_tween.tween_property(_text, "visible_characters", total_chars, maxf(dur, 0.01))',
      '\tawait _type_tween.finished',
      '\tif not _token_ok(token):',
      '\t\treturn',
      '\t_typing = false',
      '\t_hint.modulate.a = 0.85',
      '\tif t.choices.size() > 0:',
      '\t\tfor c in t.choices:',
      '\t\t\tvar btn := Button.new()',
      '\t\t\tbtn.text = c.text',
      '\t\t\tbtn.pressed.connect(_on_choice.bind(c.next_shot_id))',
      '\t\t\t_choices_box.add_child(btn)',
      '\t\t_choices_box.visible = true',
      '\t\t_hint.modulate.a = 0.0',
      '\t\treturn',
      '\tif t.duration > 0.0:',
      '\t\tawait get_tree().create_timer(t.duration / maxf(t.slow_motion, 0.05)).timeout',
      '\t\tif not _token_ok(token):',
      '\t\t\treturn',
      '\t\t_next_from(scene_res, idx, t, token)',
      '',
      'func _next_from(scene_res: CutsceneScene, idx: int, t: CutsceneShot, token: int) -> void:',
      '\tif not _token_ok(token):',
      '\t\treturn',
      '\tif t.goto_shot != "":',
      '\t\tvar hit := find_shot(t.goto_shot)',
      '\t\tif hit.scene != null:',
      '\t\t\t_play(hit.scene, hit.index)',
      '\t\t\treturn',
      '\tif t.goto_scene != "":',
      '\t\tvar s := find_scene(t.goto_scene)',
      '\t\tif s != null and s.shots.size() > 0:',
      '\t\t\t_play(s, 0)',
      '\t\t\treturn',
      '\tif idx + 1 < scene_res.shots.size():',
      '\t\t_play(scene_res, idx + 1)',
      '\t\treturn',
      '\t_next_after(scene_res, token)',
      '',
      'func _next_after(scene_res: CutsceneScene, token: int) -> void:',
      '\tif not _token_ok(token) or _data == null:',
      '\t\treturn',
      '\tfor ch in _data.chapters:',
      '\t\tvar ci := _data.chapters.find(ch)',
      '\t\tfor i in range(ch.scenes.size()):',
      '\t\t\tif ch.scenes[i] == scene_res:',
      '\t\t\t\tif i + 1 < ch.scenes.size():',
      '\t\t\t\t\t_play(ch.scenes[i + 1], 0)',
      '\t\t\t\t\treturn',
      '\t\t\t\tif ci >= 0 and ci + 1 < _data.chapters.size():',
      '\t\t\t\t\tvar nxt: CutsceneChapter = _data.chapters[ci + 1]',
      '\t\t\t\t\tif nxt.scenes.size() > 0:',
      '\t\t\t\t\t\t_play(nxt.scenes[0], 0)',
      '\t\t\t\t\t\treturn',
      '\t_end_show()',
      '',
      'func _on_choice(next_shot_id: String) -> void:',
      '\t_clear_choices()',
      '\tif next_shot_id != "" and _data != null:',
      '\t\tvar hit := find_shot(next_shot_id)',
      '\t\tif hit.scene != null:',
      '\t\t\t_play(hit.scene, hit.index)',
      '\t\t\treturn',
      '\tif _last_scene != null and _last_idx >= 0:',
      '\t\t_next_from(_last_scene, _last_idx, _last_shot, _run_token)',
      '',
      'func find_shot(id: String) -> Dictionary:',
      '\tif _data == null:',
      '\t\treturn {"scene": null, "index": -1}',
      '\tfor ch in _data.chapters:',
      '\t\tfor sc in ch.scenes:',
      '\t\t\tfor i in range(sc.shots.size()):',
      '\t\t\t\tif sc.shots[i].id == id:',
      '\t\t\t\t\treturn {"scene": sc, "index": i}',
      '\treturn {"scene": null, "index": -1}',
      '',
      'func find_scene(id: String) -> CutsceneScene:',
      '\tif _data == null:',
      '\t\treturn null',
      '\tfor ch in _data.chapters:',
      '\t\tfor sc in ch.scenes:',
      '\t\t\tif sc.id == id:',
      '\t\t\t\treturn sc',
      '\treturn null',
      '',
      'func _entry_anim(mode: String, _token: int) -> void:',
      '\t_kill_move()',
      '\t_img.pivot_offset = _img.size * 0.5',
      '\t_img.modulate = Color(1, 1, 1, 0)',
      '\t_holder.position = Vector2.ZERO',
      '\t_holder.scale = Vector2.ONE',
      '\t_move_tween = create_tween()',
      '\tif mode == "slide_left":',
      '\t\t_holder.position = Vector2(42, 0)',
      '\t\t_move_tween.set_parallel(true)',
      '\t\t_move_tween.tween_property(_holder, "position", Vector2.ZERO, 0.55).set_ease(Tween.EASE_OUT)',
      '\t\t_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)',
      '\telif mode == "slide_right":',
      '\t\t_holder.position = Vector2(-42, 0)',
      '\t\t_move_tween.set_parallel(true)',
      '\t\t_move_tween.tween_property(_holder, "position", Vector2.ZERO, 0.55).set_ease(Tween.EASE_OUT)',
      '\t\t_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)',
      '\telif mode == "zoom_in":',
      '\t\t_holder.scale = Vector2(1.09, 1.09)',
      '\t\t_move_tween.set_parallel(true)',
      '\t\t_move_tween.tween_property(_holder, "scale", Vector2.ONE, 0.62).set_ease(Tween.EASE_OUT)',
      '\t\t_move_tween.tween_property(_img, "modulate:a", 1.0, 0.42)',
      '\telse:',
      '\t\t_move_tween.tween_property(_img, "modulate:a", 1.0, 0.45)',
      '',
      'func _do_shake(intensity: float) -> void:',
      '\tif intensity <= 0.0:',
      '\t\treturn',
      '\tvar tw := create_tween()',
      '\tvar steps := int(3.0 + intensity * 8.0)',
      '\tvar amp := intensity * 9.0',
      '\tfor i in steps:',
      '\t\ttw.tween_property(_shake_grp, "position", Vector2(randf_range(-amp, amp), randf_range(-amp, amp)), 0.03)',
      '\ttw.tween_property(_shake_grp, "position", Vector2.ZERO, 0.03)',
      '',
      'func _end_show() -> void:',
      '\t_finished_emit()',
      '\t_visible_off()',
      '',
      'func _finished_emit() -> void:',
      '\tfinished.emit(_cid)',
      '',
      'func _emit_event(event_name: String, shot_id: String) -> void:',
      '\tshot_event.emit(event_name, _cid, shot_id)',
      '\tif not has_signal(event_name):',
      '\t\tadd_user_signal(event_name)',
      '\temit_signal(event_name)',
      '',
      'func _visible_off() -> void:',
      '\t_run_token += 1',
      '\t_kill_move()',
      '\tif _type_tween != null and _type_tween.is_valid():',
      '\t\t_type_tween.kill()',
      '\t_typing = false',
      '\t_clear_choices()',
      '\t_img.texture = null',
      '\t_img.modulate = Color(1, 1, 1, 0)',
      '\t_holder.position = Vector2.ZERO',
      '\t_holder.scale = Vector2.ONE',
      '\t_dim.color.a = 0.0',
      '\t_text.clear()',
      '\t_speaker.text = ""',
      '\t_hint.modulate.a = 0.0',
      '\t_last_scene = null',
      '\t_last_idx = -1',
      '\t_last_shot = null',
      '\tvisible = false',
      '',
    ].join('\n')
    const STORY_GD_FILES={
      'scripts/cutscene/cutscene_choice.gd':[
        'class_name CutsceneChoice','extends Resource','','@export var text: String = ""','@export var next_shot_id: String = ""','@export var condition_flag: String = ""','',
      ].join('\n'),
      'scripts/cutscene/cutscene_shot.gd':[
        'class_name CutsceneShot','extends Resource','','@export var id: String = ""','@export var image_path: String = ""','@export var speaker: String = ""','@export var speaker_color: Color = Color.WHITE','@export_multiline var text: String = ""','@export var typewriter_speed: float = 0.03','@export var entry_anim: String = "fade"','@export var transition: String = "fade"','@export var duration: float = 0.0','@export_range(0.0, 1.0) var darken_bg: float = 0.6','@export_range(0.0, 1.0) var camera_shake: float = 0.0','@export_range(0.1, 1.0) var slow_motion: float = 1.0','@export var choices: Array[CutsceneChoice] = []','@export var goto_scene: String = ""','@export var goto_shot: String = ""','@export var on_complete_signal: String = ""','',
      ].join('\n'),
      'scripts/cutscene/cutscene_scene.gd':[
        'class_name CutsceneScene','extends Resource','','@export var id: String = ""','@export var title: String = ""','@export var background_path: String = ""','@export var bgm_path: String = ""','@export var shots: Array[CutsceneShot] = []','',
      ].join('\n'),
      'scripts/cutscene/cutscene_chapter.gd':[
        'class_name CutsceneChapter','extends Resource','','@export var id: String = ""','@export var title: String = ""','@export var scenes: Array[CutsceneScene] = []','',
      ].join('\n'),
      'scripts/cutscene/cutscene_data.gd':[
        'class_name CutsceneData','extends Resource','','@export var id: String = ""','@export var title: String = ""','@export var chapters: Array[CutsceneChapter] = []','',
      ].join('\n'),
      'scripts/cutscene/cutscene_player.gd':STORY_PLAYER_GD,
    }
    /* ---- 导出 ---- */
    async function exportStoryZip(){
      const p=cur()
      if(!p) return toast(statusEl,'没有可导出的剧本',false)
      let totalShots=0; p.chapters.forEach((c:any)=>c.scenes.forEach((s:any)=>totalShots+=s.shots.length))
      if(totalShots===0) return toast(statusEl,'剧本没有任何分镜，先添加内容',false)
      const used=collectStoryImages(p)
      statusEl.textContent='📦 打包中…（引用图片 '+used.length+' 张）'
      const entries=[] as {name:string,data:Uint8Array}[]
      let missImg=0
      for(const itemId of used){
        const it=itemById(itemId)
        if(!it){ missImg++; continue }
        const safe=String(itemId).replace(/[^A-Za-z0-9._-]/g,'_')
        try{ const r=await urlToBytes(it.url); entries.push({ name:'assets/cutscenes/img/'+safe+r.ext, data:r.bytes }) }
        catch{ missImg++ }
      }
      const imgPathFor=(itemId:string)=>itemId?('assets/cutscenes/img/'+String(itemId).replace(/[^A-Za-z0-9._-]/g,'_')+'.png'):''
      entries.push({ name:'cutscenes/'+p.id+'.tres', data:new TextEncoder().encode(buildStoryTres(p,imgPathFor)) })
      entries.push({ name:'cutscenes/'+p.id+'.json', data:new TextEncoder().encode(JSON.stringify(p,null,2)) })
      ;(Object.entries(STORY_GD_FILES) as [string,string][]).forEach((kv)=>{ entries.push({ name:kv[0], data:new TextEncoder().encode(kv[1]) }) })
      const readmeLines=[
        '烛火剧场剧情资产包 — '+p.title+'（'+p.id+'）','',
        '══════════════════════════════','', '导入步骤：','',
        '1) 将压缩包内三个文件夹整体拖入 Godot 项目根目录（与 project.godot 同级）：',
        '     cutscenes/    assets/    scripts/','', 
        '2) 等待导入完成。scripts/cutscene/ 内含六个全局类脚本（class_name 已注册）：',
        '     CutsceneData / CutsceneChapter / CutsceneScene / CutsceneShot / CutsceneChoice',
        '     以及单文件运行时播放器 cutscene_player.gd（class_name InkTheaterPlayer）','',
        '3) 在需要触发剧情的地方（按钮回调、战斗节点、autoload 等）：',
        '       var theater := InkTheaterPlayer.new()',
        '       add_child(theater)',
        '       theater.play_id("'+p.id+'")','', 
        '4) 演出结束会发出信号 finished("'+p.id+'")。',
        '   任一分镜若配置了「完成事件名」，还会发出对应命名信号与统一事件：',
        '       shot_event.connect(func(name, cid, sid): ...)',
        '   条件分支 flag 的判定由你的游戏逻辑在生成选项前控制（condition_flag 为约定字段）。','',
        '5) cutscenes/'+p.id+'.json 是同一份剧本的引擎无关版本（便于 diff/外部工具链）。','',
        '打包时间：'+new Date().toLocaleString(),
        '章节 '+p.chapters.length+' · 图片 '+entries.filter((e:any)=>e.name.startsWith('assets/cutscenes/img/')).length+' 张'+(missImg?('（'+missImg+' 张引用的插画已不在素材库，未打包——可在剧场内重新绑定）'):''),
      ]
      entries.push({ name:'README-导入说明.txt', data:new TextEncoder().encode(readmeLines.join('\n')) })
      const manifest={ app:'Godot-Arter', kind:'ink_theater_cutscene', project:p.title, godot:'4.2', cutscene_res:'cutscenes/'+p.id+'.tres', cutscene_json:'cutscenes/'+p.id+'.json', data_classes_dir:'scripts/cutscene/', player:'scripts/cutscene/cutscene_player.gd', images_used:used.length, generated_at:new Date().toISOString() }
      entries.push({ name:'manifest.json', data:new TextEncoder().encode(JSON.stringify(manifest,null,2)) })
      const blob=buildZipStore(entries)
      await downloadUrl(URL.createObjectURL(blob),'ink_theater_'+p.id+'.zip')
      statusEl.textContent='✓ 已导出 ink_theater_'+p.id+'.zip（'+entries.length+' 个文件'+(missImg?', 缺图'+missImg:'')+'）'
      toast(statusEl,'剧情资产包已导出 ✓ 解压到项目根目录即可',true)
    }
    /* ---- 面板样式注入 ---- */
    function injectStoryStyle(){ if(document.getElementById('story-preview-style')) return
      const st=document.createElement('style'); st.id='story-preview-style'
      st.textContent='@keyframes pvShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-7px,3px)}40%{transform:translate(6px,-4px)}60%{transform:translate(-5px,-2px)}80%{transform:translate(4px,4px)}}'
      document.head.appendChild(st) }
    /* ---- 项目管理事件 ---- */
    $('#st-proj')!.addEventListener('change',e=>{ curId=(e.target as HTMLSelectElement).value; persist(); sel={c:-1,s:-1,t:-1}; stopPreview(); renderAll() })
    $('#st-new')!.addEventListener('click',()=>{ const name=prompt('剧本名称','新剧本'); if(!name||!name.trim()) return; newProject(name.trim()) })
    $('#st-rename')!.addEventListener('click',()=>{ const p=cur(); if(!p) return toast(statusEl,'无剧本',false)
      const name=prompt('重命名剧本',p.title); if(!name||!name.trim()) return; p.title=name.trim(); persist(); renderProjSelect() })
    $('#st-del')!.addEventListener('click',()=>{ const p=cur(); if(!p) return
      if(!confirm('删除剧本「'+p.title+'」及其全部内容？')) return
      delete stories[p.id]; curId=Object.keys(stories)[0]||''; persist(); sel={c:-1,s:-1,t:-1}; stopPreview(); renderAll() })
    $('#st-sample')!.addEventListener('click',ensureDemo)
    $('#st-add-ch')!.addEventListener('click',()=>{ const p=cur(); if(!p) return toast(statusEl,'先新建剧本',false)
      p.chapters.push({ id:uid('ch'), title:'第'+(p.chapters.length+1)+'章', scenes:[] }); sel={c:p.chapters.length-1,s:-1,t:-1}; persist(); renderAll() })
    $('#st-add-sc')!.addEventListener('click',()=>{ const p=cur(); if(!p) return toast(statusEl,'先新建剧本',false)
      const ch=(sel.c>=0&&p.chapters[sel.c])?p.chapters[sel.c]:p.chapters[p.chapters.length-1]
      if(!ch) return toast(statusEl,'先创建章节',false)
      ch.scenes.push({ id:uid('sc'), title:'场景'+(ch.scenes.length+1), background_item:'', bgm_path:'', shots:[] })
      sel={c:p.chapters.indexOf(ch),s:ch.scenes.length-1,t:-1}; persist(); renderAll() })
    $('#st-add-shot')!.addEventListener('click',addShot)
    $('#st-export-zip')!.addEventListener('click',()=>void exportStoryZip())
    $('#st-export-json')!.addEventListener('click',()=>{ const p=cur(); if(!p) return toast(statusEl,'无剧本',false)
      downloadBlob(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),'cutscene_'+p.id+'.json'); toast(statusEl,'JSON 已下载（与导出包内的 cutscenes/*.json 同构）',true) })
    /* ---- 全屏预览 ---- */
    function openStoryFullscreen(sc:SScene){
      const overlay=document.createElement('div')
      overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center'
      
      const stage=document.createElement('div')
      stage.style.cssText='position:relative;width:100vw;height:100vh;max-width:1920px;background:#0b0a09;overflow:hidden'
      
      const bgImg=document.createElement('img')
      bgImg.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.5s'
      stage.appendChild(bgImg)
      
      const dimLayer=document.createElement('div')
      dimLayer.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.6);transition:background 0.3s;pointer-events:none'
      stage.appendChild(dimLayer)
      
      const dialog=document.createElement('div')
      dialog.style.cssText='position:absolute;left:5%;right:5%;bottom:8%;background:rgba(36,28,20,0.95);border:3px solid #594c39;border-radius:16px;padding:20px 24px;box-shadow:0 8px 32px rgba(0,0,0,0.6)'
      const speakerLabel=document.createElement('div')
      speakerLabel.style.cssText='font-weight:700;color:#e8a33d;font-size:20px;margin-bottom:12px'
      dialog.appendChild(speakerLabel)
      const textContent=document.createElement('div')
      textContent.style.cssText='color:#efe6d0;font-size:18px;line-height:1.8;min-height:60px;white-space:pre-wrap'
      dialog.appendChild(textContent)
      const hint=document.createElement('div')
      hint.style.cssText='text-align:right;color:#9aa0a6;font-size:14px;margin-top:16px;opacity:0;transition:opacity 0.3s'
      hint.textContent='点击继续 ▶'
      dialog.appendChild(hint)
      stage.appendChild(dialog)
      
      const shotInfo=document.createElement('div')
      shotInfo.style.cssText='position:absolute;top:20px;left:20px;background:rgba(0,0,0,0.6);border-radius:8px;padding:8px 16px;color:#9aa0a6;font-size:14px'
      stage.appendChild(shotInfo)
      
      const closeBtn=document.createElement('button')
      closeBtn.textContent='✕'
      closeBtn.style.cssText='position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.6);border:2px solid #594c39;border-radius:50%;width:48px;height:48px;color:#e8a33d;font-size:20px;cursor:pointer'
      closeBtn.onclick=()=>overlay.remove()
      stage.appendChild(closeBtn)
      
      // 控制面板
      const controlPanel=document.createElement('div')
      controlPanel.style.cssText='position:absolute;top:20px;right:80px;background:rgba(0,0,0,0.7);border:2px solid #594c39;border-radius:12px;padding:12px 16px;display:flex;flex-direction:column;gap:10px;min-width:200px'
      
      const brightnessRow=document.createElement('div')
      brightnessRow.style.cssText='display:flex;align-items:center;gap:8px'
      brightnessRow.innerHTML='<span style="color:#9aa0a6;font-size:12px;white-space:nowrap">亮度</span><input type="range" id="fs-brightness" min="0" max="100" value="100" style="flex:1"><span id="fs-brightness-v" style="color:#e8a33d;font-size:11px;width:30px">100%</span>'
      controlPanel.appendChild(brightnessRow)
      
      const darkenRow=document.createElement('div')
      darkenRow.style.cssText='display:flex;align-items:center;gap:8px'
      darkenRow.innerHTML='<span style="color:#9aa0a6;font-size:12px;white-space:nowrap">暗化</span><input type="range" id="fs-darken" min="0" max="90" value="60" style="flex:1"><span id="fs-darken-v" style="color:#e8a33d;font-size:11px;width:30px">60%</span>'
      controlPanel.appendChild(darkenRow)
      
      const contrastRow=document.createElement('div')
      contrastRow.style.cssText='display:flex;align-items:center;gap:8px'
      contrastRow.innerHTML='<span style="color:#9aa0a6;font-size:12px;white-space:nowrap">对比</span><input type="range" id="fs-contrast" min="50" max="150" value="100" style="flex:1"><span id="fs-contrast-v" style="color:#e8a33d;font-size:11px;width:30px">100%</span>'
      controlPanel.appendChild(contrastRow)
      
      const scaleRow=document.createElement('div')
      scaleRow.style.cssText='display:flex;align-items:center;gap:8px'
      scaleRow.innerHTML='<span style="color:#9aa0a6;font-size:12px;white-space:nowrap">缩放</span><input type="range" id="fs-scale" min="80" max="130" value="100" style="flex:1"><span id="fs-scale-v" style="color:#e8a33d;font-size:11px;width:30px">100%</span>'
      controlPanel.appendChild(scaleRow)
      
      const zoomInBtn=document.createElement('button')
      zoomInBtn.textContent='🔍+'
      zoomInBtn.style.cssText='background:rgba(255,255,255,0.1);border:1px solid #594c39;border-radius:6px;color:#e8a33d;padding:4px 8px;cursor:pointer;font-size:12px'
      zoomInBtn.onclick=()=>{ const s=bgImg.style.transform.match(/scale\(([\d.]+)\)/); const cur=s?parseFloat(s[1]):1; const n=Math.min(1.5,cur+0.1); bgImg.style.transform='scale('+n.toFixed(1)+')' }
      const zoomOutBtn=document.createElement('button')
      zoomOutBtn.textContent='🔍-'
      zoomOutBtn.style.cssText='background:rgba(255,255,255,0.1);border:1px solid #594c39;border-radius:6px;color:#e8a33d;padding:4px 8px;cursor:pointer;font-size:12px'
      zoomOutBtn.onclick=()=>{ const s=bgImg.style.transform.match(/scale\(([\d.]+)\)/); const cur=s?parseFloat(s[1]):1; const n=Math.max(0.5,cur-0.1); bgImg.style.transform='scale('+n.toFixed(1)+')' }
      const resetBtn=document.createElement('button')
      resetBtn.textContent='重置'
      resetBtn.style.cssText='background:rgba(255,255,255,0.1);border:1px solid #594c39;border-radius:6px;color:#e8a33d;padding:4px 8px;cursor:pointer;font-size:12px'
      resetBtn.onclick=()=>{
        bgImg.style.filter='brightness(1) contrast(1)'
        bgImg.style.transform='scale(1)'
        dimLayer.style.background='rgba(0,0,0,0.6)'
        ;(controlPanel.querySelector('#fs-brightness') as HTMLInputElement).value='100'
        ;(controlPanel.querySelector('#fs-darken') as HTMLInputElement).value='60'
        ;(controlPanel.querySelector('#fs-contrast') as HTMLInputElement).value='100'
        ;(controlPanel.querySelector('#fs-scale') as HTMLInputElement).value='100'
        ;(controlPanel.querySelector('#fs-brightness-v') as HTMLElement).textContent='100%'
        ;(controlPanel.querySelector('#fs-darken-v') as HTMLElement).textContent='60%'
        ;(controlPanel.querySelector('#fs-contrast-v') as HTMLElement).textContent='100%'
        ;(controlPanel.querySelector('#fs-scale-v') as HTMLElement).textContent='100%'
      }
      
      const zoomRow=document.createElement('div')
      zoomRow.style.cssText='display:flex;gap:6px;justify-content:center'
      zoomRow.appendChild(zoomInBtn)
      zoomRow.appendChild(zoomOutBtn)
      zoomRow.appendChild(resetBtn)
      controlPanel.appendChild(zoomRow)
      
      // 绑定控制事件
      ;(controlPanel.querySelector('#fs-brightness') as HTMLInputElement).oninput=function(){
        const v=parseInt(this.value)/100
        const c=(controlPanel.querySelector('#fs-contrast') as HTMLInputElement).value/100
        bgImg.style.filter='brightness('+v+') contrast('+c+')'
        ;(controlPanel.querySelector('#fs-brightness-v') as HTMLElement).textContent=this.value+'%'
      }
      ;(controlPanel.querySelector('#fs-contrast') as HTMLInputElement).oninput=function(){
        const b=(controlPanel.querySelector('#fs-brightness') as HTMLInputElement).value/100
        const v=parseInt(this.value)/100
        bgImg.style.filter='brightness('+b+') contrast('+v+')'
        ;(controlPanel.querySelector('#fs-contrast-v') as HTMLElement).textContent=this.value+'%'
      }
      ;(controlPanel.querySelector('#fs-darken') as HTMLInputElement).oninput=function(){
        dimLayer.style.background='rgba(0,0,0,'+(parseInt(this.value)/100)+')'
        ;(controlPanel.querySelector('#fs-darken-v') as HTMLElement).textContent=this.value+'%'
      }
      ;(controlPanel.querySelector('#fs-scale') as HTMLInputElement).oninput=function(){
        bgImg.style.transform='scale('+(parseInt(this.value)/100)+')'
        ;(controlPanel.querySelector('#fs-scale-v') as HTMLElement).textContent=this.value+'%'
      }
      
      stage.appendChild(controlPanel)
      
      overlay.appendChild(stage)
      
      let currentIdx=0
      let typing=false
      let currentText=''
      let charIndex=0
      let timer:any=null
      
      function showShot(idx:number){
        if(idx>=sc.shots.length){ overlay.remove(); return }
        const t=sc.shots[idx]
        const it=itemById(t.image_item)
        shotInfo.textContent='第 '+(idx+1)+' / '+sc.shots.length+' 镜 | '+t.id
        dimLayer.style.background='rgba(0,0,0,'+t.darken_bg+')'
        if(it&&it.url){
          bgImg.style.opacity='0'
          bgImg.onload=()=>{ bgImg.style.opacity='1' }
          bgImg.src=it.url
        }else{
          bgImg.style.opacity='0'
        }
        speakerLabel.textContent=t.speaker
        speakerLabel.style.color=t.speaker_color||'#e8a33d'
        currentText=stripBB(t.text)
        charIndex=0
        textContent.textContent=''
        hint.style.opacity='0'
        typing=true
        clearInterval(timer)
        const speedMs=Math.max(30,t.typewriter_speed*1000)
        timer=setInterval(()=>{
          charIndex++
          textContent.textContent=currentText.slice(0,charIndex)
          if(charIndex>=currentText.length){
            clearInterval(timer)
            typing=false
            hint.style.opacity='0.7'
          }
        },speedMs)
      }
      
      function advance(){
        if(typing){
          clearInterval(timer)
          charIndex=currentText.length
          textContent.textContent=currentText
          typing=false
          hint.style.opacity='0.7'
        }else{
          currentIdx++
          if(currentIdx<sc.shots.length){
            showShot(currentIdx)
          }else{
            overlay.remove()
          }
        }
      }
      
      stage.onclick=advance
      function keyHandler(e:KeyboardEvent){
        if(e.key==='Escape') overlay.remove()
        else if(e.key===' '||e.key==='Enter'){ e.preventDefault(); advance() }
      }
      document.addEventListener('keydown',keyHandler)
      overlay.addEventListener('remove',()=>{ clearInterval(timer); document.removeEventListener('keydown',keyHandler) })
      document.body.appendChild(overlay)
      showShot(0)
    }
    
    function openImgFullscreen(src:string){
      const overlay=document.createElement('div')
      overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;cursor:pointer'
      const img=document.createElement('img')
      img.src=src
      img.style.cssText='max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px'
      img.onclick=()=>overlay.remove()
      overlay.onclick=()=>overlay.remove()
      overlay.appendChild(img)
      document.body.appendChild(overlay)
    }
    
    // AI 剧情助手功能
    pStory.querySelector('#st-ai-toggle')!.addEventListener('click',()=>{
      const panel=pStory.querySelector('#st-ai-panel') as HTMLElement
      const btn=pStory.querySelector('#st-ai-toggle') as HTMLButtonElement
      if(panel.style.display==='none'){
        panel.style.display='flex'
        btn.textContent='收起'
      }else{
        panel.style.display='none'
        btn.textContent='展开'
      }
    })
    
    pStory.querySelector('#st-ai-generate')!.addEventListener('click',async ()=>{
      const outline=pStory.querySelector('#ai-outline-input') as HTMLTextAreaElement
      const genProv=pStory.querySelector('#ai-gen-provider') as HTMLSelectElement
      const imgProv=pStory.querySelector('#ai-img-provider') as HTMLSelectElement
      const autoImg=(pStory.querySelector('#ai-auto-img') as HTMLInputElement).checked
      const status=pStory.querySelector('#ai-status') as HTMLElement
      const btn=pStory.querySelector('#st-ai-generate') as HTMLButtonElement
      
      if(!outline.value.trim()){ toast(status,'请先输入剧情大纲',false); return }
      
      btn.disabled=true
      btn.textContent='⏳ 生成中...'
      status.textContent='正在让 AI 生成剧情结构...'
      
      try{
        // 构建 prompt
        const styleGuide='暗黑童话风格，融合《杀戮尖塔2》与《王国保卫战》，阵营配色（深棕主色、烛金点缀色）'
        const prompt=`你是一个专业的游戏剧情设计师。请根据以下大纲，生成详细的分镜剧本。

大纲：${outline.value.trim()}

风格指南：${styleGuide}

请按以下 JSON 格式输出（只需要 JSON，不要其他内容）：
{
  "title": "场景标题",
  "shots": [
    {
      "speaker": "说话人（无则写'旁白'）",
      "speaker_color": "#颜色如#e8a33d",
      "text": "对话或旁白内容",
      "image_prompt": "插画生成提示词（英文，描述场景画面，黑暗童话风格）",
      "darken_bg": 0-1的数字，背景暗化程度
    }
  ]
}

要求：
- 生成 3-6 个分镜
- 每个分镜包含一个 image_prompt 用于 AI 生成插画
- 对话要符合暗黑童话风格
- 返回纯 JSON`
        
        // 调用 AI 生成剧情
        let storyData:any
        try{
          const text=await callTextGen(prompt, genProv.value, {
            model: (pStory.querySelector('#ai-model-select') as HTMLSelectElement).value
          })
          // 提取 JSON
          const jsonMatch=text.match(/\{[\s\S]*\}/)
          if(jsonMatch) storyData=JSON.parse(jsonMatch[0])
          else throw new Error('AI 返回格式错误')
        }catch(e:any){
          // 回退到本地演示
          status.textContent='AI 生成失败，使用内置示例...'
          storyData={
            title:outline.value.trim().slice(0,20)||'AI 生成场景',
            shots:[
              {speaker:'旁白',speaker_color:'#9aa0a6',text:'夜色笼罩着古老的城堡...',image_prompt:'dark castle night, moonlight, gothic fantasy',darken_bg:0.4},
              {speaker:'守卫',speaker_color:'#e8a33d',text:'有什么东西在移动...',image_prompt:'knight guarding castle at night, torch light',darken_bg:0.3},
              {speaker:'旁白',speaker_color:'#9aa0a6',text:'一场战斗即将开始。',image_prompt:'epic battle scene, dark fantasy',darken_bg:0.5}
            ]
          }
        }
        
        status.textContent='剧情生成完成，正在处理...'
        
        // 获取或创建场景
        let proj=cur()
        if(!proj){
          // 创建新项目
          proj={ id:uid('proj'), name:'AI 生成剧本', chapters:[] }
          projects.push(proj)
          sel={c:-1,s:-1,t:-1}
          persist()
        }
        
        // 确保有章节
        let ch=proj.chapters[proj.chapters.length-1]
        if(!ch||proj.chapters.length===0){
          ch={ id:uid('ch'), title:'第'+(proj.chapters.length+1)+'章 AI生成章', scenes:[] }
          proj.chapters.push(ch)
        }
        
        // 创建场景
        const scene:SScene={
          id:uid('sc'),
          title:storyData.title||'AI 生成场景',
          background_item:'',
          bgm_path:'',
          shots:[]
        }
        
        // 生成各分镜
        status.textContent='正在生成 '+(storyData.shots?.length||0)+' 个分镜...'
        for(let i=0;i<(storyData.shots||[]).length;i++){
          const s=storyData.shots[i]
          const shot:SShot={
            id:uid('shot'),
            text:s.text||'',
            speaker:s.speaker||'旁白',
            speaker_color:s.speaker_color||'#e8a33d',
            image_item:'',
            entry_anim:'fade',
            transition:'fade',
            typewriter_speed:0.05,
            duration:0,
            darken_bg:s.darken_bg||0.4,
            camera_shake:0,
            slow_motion:1,
            choices:[],
            goto_scene:'',
            goto_shot:'',
            complete_signal:''
          }
          
          // 自动生成插画
          if(autoImg&&s.image_prompt){
            status.textContent='生成插画 '+(i+1)+'/'+storyData.shots.length
            try{
              const imgUrl=await callImageGen(s.image_prompt+' in dark fairy tale style, gothic fantasy art', imgProv.value, {size:'1024x1024'})
              const itemId=await addToLibrary('story', '插画 '+new Date().toLocaleTimeString(), imgUrl, {from:'ai-generate', prompt:s.image_prompt})
              shot.image_item=itemId
              await refreshAssets()
            }catch(e:any){
              console.warn('插画生成失败:',e.message)
            }
          }
          
          scene.shots.push(shot)
        }
        
        ch.scenes.push(scene)
        sel={c:proj.chapters.length-1,s:ch.scenes.length-1,t:-1}
        persist()
        renderAll()
        
        status.textContent='✅ 完成！已生成 '+scene.shots.length+' 个分镜'
        toast(status,'AI 剧情生成完成！',true)
      }catch(e:any){
        status.textContent='生成失败: '+String(e.message||e).slice(0,50)
        toast(status,'生成失败: '+String(e.message||e).slice(0,30),false)
      }finally{
        btn.disabled=false
        btn.textContent='✨ AI 生成剧情 + 分镜'
      }
    })
    
    /* ---- 启动 ---- */
    injectStoryStyle()
    wirePreview()
    renderAll()
    refreshAssets()
  })()


  // 后处理工坊
    // 素材总管
  const pAsset=mkPanel('asset', `
      <div class="gas-card">
        <h4>📚 素材总管 — 全管线素材库</h4>
        <div class="gas-row">
          <div style="width:220px">
            <label class="gas-label">管线 / 自建包</label>
            <div id="al-libs" style="display:flex;flex-direction:column;gap:6px"></div>
            <button class="gas-btn ghost" id="al-addlib" style="margin-top:4px">➕ 新建包</button>
            <div class="gas-note" style="margin-top:8px">生成素材可「📥 入库」到当前选中的库；自建包可重命名 / 删除 / 移动素材，自由分类管理。</div>
          </div>
          <div style="flex:1">
            <div class="gas-row">
              <input class="gas-input" id="al-search" placeholder="🔍 搜索编号/名称">
              <button class="gas-btn ghost" id="al-export">⬇ 导出备份</button>
              <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="al-import" accept=".json,application/json,image/*" multiple hidden>⬆ 导入图片/备份</label>
              <label class="gas-btn ghost" style="cursor:pointer"><input type="file" id="al-import-dir" webkitdirectory multiple accept="image/*" hidden>📁 导入文件夹</label>
              <button class="gas-btn ghost" id="al-clear">🗑 清空当前库</button>
            </div>
            <div class="gas-note" style="margin-top:6px">支持任意图片格式（PNG/JPG/WebP/GIF/BMP/SVG/AVIF…）单张 / 多选 / 整文件夹导入，也可直接拖图到下方区域；导入的图片按当前库归类。</div>
            <div class="gas-grid" id="al-grid"></div>
            <div class="gas-note" id="al-status"></div>
          </div>
        </div>
      </div>
    `)
const pPost=mkPanel('post', `
    <div class="gas-card">
      <h4>✨ Godot 后处理工坊 — 调色板 / 精灵描边 / 尺寸调整</h4>
      <div class="gas-row">
        <div style="flex:1">
          <div style="border:1.5px dashed var(--border);border-radius:8px;padding:14px;text-align:center;background:#1a1e20;cursor:pointer;" id="post-drop">
            <div style="font-size:22px">🖼️</div><div class="gas-note">点击或拖拽上传 PNG/JPG<br>对生成的角色/素材做 Godot 后处理</div>
            <input type="file" id="post-file" accept="image/*" hidden>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">操作</label><select class="gas-select" id="post-op">
              <option value="palette">🎨 调色板量化（像素风）</option>
              <option value="outline">🖊️ 精灵描边</option>
              <option value="resize">📐 尺寸调整</option>
              <option value="9patch">📐 9-patch UI 导出 Godot StyleBox</option>
            </select></div>
            <div style="flex:0 0 140px"><label class="gas-label">参数</label><input class="gas-input" id="post-param" placeholder="例：16 色 / 描边2px / 64px"></div>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="post-run">✨ 执行</button>
            <button class="gas-btn orange" id="post-dl" disabled>⬇ 下载 PNG</button>
            <button class="gas-btn ghost" id="post-save" disabled>📥 入库</button>
          </div>
          <div class="gas-note" id="post-status"></div>
          <div class="gas-note" style="margin-top:6px">💡 示例：角色立绘上传后 → 调色板量化选 16 色 → 得到像素风角色；输出 PNG 可直接拖入 Godot。</div>
        </div>
        <div style="width:280px">
          <label class="gas-label">处理后预览</label><div class="gas-preview tiled" id="post-preview"><span class="gas-note">等待处理</span></div>
          <canvas id="post-canvas" hidden></canvas>
        </div>
      </div>
    </div>
  `)

  ;[pChar,pSeq,pPipe,pSheet,pForge,pMat,pExtract,pMap,pScene,pAsset,pPost,pPreset,pExport,pStory].forEach(p=>main.appendChild(p))
  panels['character']=pChar; panels['seq']=pSeq; panels['pipe']=pPipe; panels['sheet']=pSheet; panels['forge']=pForge; panels['matting']=pMat; panels['map']=pMap; panels['scene']=pScene; panels['extract']=pExtract; panels['asset']=pAsset; panels['post']=pPost; panels['preset']=pPreset; panels['export']=pExport; panels['story']=pStory

  function switchTab(id:string){
    active=id
    main.scrollTop=0
    Object.entries(tabEls).forEach(([k,el])=>el.classList.toggle('active', k===id))
    Object.entries(panels).forEach(([k,el])=>el.style.display=k===id?'block':'none')
    const tip=side.querySelector('#pipeline-tip') as HTMLElement
    const tips:Record<string,string>={ character:'角色工坊：三视图适合直接进序列帧拆成行走动画', seq:'单帧动画：AI 逐张画单角色，代码自动裁白边/脚底对齐/横排拼接，从根源消除邻帧串位', pipe:'素材流水线：批量导入帧/整表，一键完成 切→去背→脚部对齐→命名→导出 SpriteFrames，产出 Godot 直接可用动画', sheet:'序列帧：4×2 切片后 FPS 8 在 Godot 中最顺滑', forge:'素材锻造：批量生成后可在“导出”一键打包', matting:'抠图：色键适合纯色背景，AI 适合复杂毛发', extract:'元素提取：上传地图/多元素图，自动框出独立元素或点选单个，拖拽后保存为素材', map:'无缝地图：可生成完整大地图或瓦片，再切成 TileSet；支持缩放预览', scene:'场景工坊：生成/上传场景底图后，叠加晴天/雨天/雷暴/下雪与日夜色调实时预览，可导出当前帧', story:'烛火剧场：剧本大纲→分镜编辑→实时预览→导出剧情资产包(zip)；插画可直接 AI 生成入库选用；解压到 Godot 项目 res:// 即可加载 .tres 剧本数据', asset:'素材总管：每个模块生成后可「📥 入库」，自动分类编号、本地保存、可导出/导入备份', post:'后处理：调色板量化适合像素风，描边适合精灵，尺寸调整适合 Godot 导入优化', preset:'API 配置：内置供应商 Key 与自定义路由都在此设置，保存后同步到所有生成面板；可点「🔍 获取默认模型」一键拉取全部可用模型', export:'导出：manifest.json 记录 Godot 目录结构' }
    if(tip) tip.textContent=tips[id]||''
  }


  // ---- 元素提取器 logic ----
  {
    const pExt = pExtract
    const drop=pExt.querySelector('#x-drop') as HTMLElement, fileInput=pExt.querySelector('#x-file') as HTMLInputElement
    const modeEl=pExt.querySelector('#x-mode') as HTMLSelectElement, modeTip=pExt.querySelector('#x-mode-tip') as HTMLElement
    const tolEl=pExt.querySelector('#x-tol') as HTMLInputElement, tolV=pExt.querySelector('#x-tol-v') as HTMLElement
    const minEl=pExt.querySelector('#x-min') as HTMLInputElement
    const runBtn=pExt.querySelector('#x-run') as HTMLElement, statusEl=pExt.querySelector('#x-status') as HTMLElement
    const stage=pExt.querySelector('#x-stage') as HTMLElement, clearBtn=pExt.querySelector('#x-clear') as HTMLElement
    const saveAllBtn=pExt.querySelector('#x-save-all') as HTMLButtonElement, saveSelBtn=pExt.querySelector('#x-save-sel') as HTMLButtonElement, dlSelBtn=pExt.querySelector('#x-dl-sel') as HTMLButtonElement
    let srcCanvas: HTMLCanvasElement|null=null
    let elements: any[]=[]
    let selected=-1
    const previewWrap=pExt.querySelector('#x-preview-wrap') as HTMLElement
    const previewEl=pExt.querySelector('#x-preview') as HTMLElement
    const overlay=pExt.querySelector('#x-overlay') as HTMLCanvasElement
    tolEl.addEventListener('input', ()=> tolV.textContent=tolEl.value)
    modeEl.addEventListener('change', ()=> modeTip.textContent = modeEl.value==='auto' ? '自动模式：先识别背景并擦除，再对前景做连通域分割，框出每个独立元素。' : modeEl.value==='point' ? '点选模式：点击原图上某个元素，自动框出它。' : modeEl.value==='box' ? '框选模式：在原图上按住拖拽拉一个矩形框，松开后提取框内所有独立元素。' : modeEl.value==='line' ? '画线模式：在原图上按住画一条分割线（尽量贯穿场景），松开后沿线把场景切开并分别提取。' : 'AI 分割(SAM) 即将上线——当前请使用自动/点选/框选/画线模式。')
    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{e.preventDefault(); drop.style.borderColor='#478cbf'})
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if(f) handle(f) })
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) handle(f) })
    function drawProgress(msg:string, warn=false){ if(statusEl){ statusEl.textContent=msg; statusEl.style.color = warn ? 'var(--warn)' : 'var(--muted)' } }
    function resetStage(){ stage.innerHTML='<span class="gas-note">先上传图片并提取</span>' }
    function splitElements(won:number,hon:number,data:Uint8ClampedArray,tol:number,minArea:number){
      const labels=new Int32Array(won*hon); labels.fill(-1)
      const boxes:any[]=[]; let lab=0; const stack:number[]=[]
      for(let sy=0;sy<hon;sy++) for(let sx=0;sx<won;sx++){
        const si=sy*won+sx
        if(labels[si]<0 && data[si*4+3]>8){
          const sr=data[si*4],sg=data[si*4+1],sb=data[si*4+2]
          let minX=sx,maxX=sx,minY=sy,maxY=sy,count=0
          labels[si]=lab; stack.length=0; stack.push(si)
          while(stack.length){
            const idx=stack.pop()!; const yy=(idx/won)|0, xx=idx%won; count++
            if(xx<minX)minX=xx; if(xx>maxX)maxX=xx; if(yy<minY)minY=yy; if(yy>maxY)maxY=yy
            const nb=[[xx+1,yy],[xx-1,yy],[xx,yy+1],[xx,yy-1]]
            for(const [nx,ny] of nb){
              if(nx<0||ny<0||nx>=won||ny>=hon) continue
              const ni=ny*won+nx
              if(labels[ni]<0 && data[ni*4+3]>8){
                const dr=data[ni*4]-sr,dg=data[ni*4+1]-sg,db=data[ni*4+2]-sb
                if(Math.sqrt(dr*dr+dg*dg+db*db)<=tol){ labels[ni]=lab; stack.push(ni) }
              }
            }
          }
          if(count>=minArea) boxes.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,count})
          lab++
        }
      }
      return boxes
    }
    function cropElement(box:any){
      const c=document.createElement('canvas'); c.width=box.w; c.height=box.h
      const g=c.getContext('2d')!; g.drawImage(srcCanvas!, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h)
      const id=g.getImageData(0,0,box.w,box.h); const d=id.data
      const T=parseInt(tolEl.value)||32
      let br=0,bg=0,bb=0,n=0
      for(let x=0;x<box.w;x++){ for(const y of [0,box.h-1]){ const i=(y*box.w+x)*4; br+=d[i];bg+=d[i+1];bb+=d[i+2];n++ } }
      for(let y=0;y<box.h;y++){ for(const x of [0,box.w-1]){ const i=(y*box.w+x)*4; br+=d[i];bg+=d[i+1];bb+=d[i+2];n++ } }
      br/=n; bg/=n; bb/=n
      for(let i=0;i<d.length;i+=4){ const dist=Math.sqrt((d[i]-br)**2+(d[i+1]-bg)**2+(d[i+2]-bb)**2); if(dist<T) d[i+3]=0 }
      g.putImageData(id,0,0)
      return c
    }
    function updateSel(){ const has=selected>=0&&selected<elements.length; saveSelBtn.disabled=!has; dlSelBtn.disabled=!has; saveAllBtn.disabled=!elements.length }
    function highlightSel(){ stage.querySelectorAll('.gas-extract-item').forEach((w:any)=> w.classList.toggle('sel', Number(w.dataset.idx)===selected)) }
    function rebuildStage(){
      stage.innerHTML=''
      if(!elements.length){ stage.innerHTML='<span class="gas-note">先上传图片并「🔍 自动提取」</span>'; return }
      elements.forEach((el,i)=>{
        const cell=document.createElement('div'); cell.className='gas-extract-cell'; cell.dataset.idx=String(i)
        const box=document.createElement('div'); box.className='gas-extract-item'
        const img=document.createElement('img'); img.src=el.img.toDataURL(); img.setAttribute('data-no-zoom','1'); box.appendChild(img)
        const tag=document.createElement('span'); tag.className='gas-extract-tag'; tag.textContent='#'+(i+1)+' · '+el.w+'×'+el.h; box.appendChild(tag)
        const del=document.createElement('button'); del.className='gas-extract-del'; del.textContent='✕'; box.appendChild(del)
        box.addEventListener('mousedown',(e)=>{ selected=i; highlightSel(); startDrag(e,box,i) })
        del.addEventListener('click',(e)=>{ e.stopPropagation(); elements.splice(i,1); rebuildStage(); updateSel() })
        cell.appendChild(box)
        // 下方也放独立的保存/下载小按钮
        const act=document.createElement('div'); act.className='gas-extract-actions'
        const sa=document.createElement('button'); sa.className='gas-btn ghost'; sa.textContent='📥 保存'; sa.onclick=()=>{ void saveElements([elements[i]]) }
        const dl=document.createElement('button'); dl.className='gas-btn ghost'; dl.textContent='⬇'; dl.onclick=()=>{ downloadUrl(elements[i].img.toDataURL(), elements[i].name+'.png') }
        act.append(sa,dl); cell.appendChild(act)
        stage.appendChild(cell)
      })
      updateSel()
    }
    function startDrag(e:MouseEvent,wrap:HTMLElement,i:number){
      e.preventDefault()
      // 用 transform 平移，在各自 cell 内做视觉偏移，不干扰 grid 布局
      const cell=wrap.parentElement as HTMLElement; const cellR=cell.getBoundingClientRect()
      let dx=0, dy=0; const baseX=e.clientX, baseY=e.clientY
      const st=stage.getBoundingClientRect(); const maxX=st.width-wrap.offsetWidth-8, maxY=st.height-wrap.offsetHeight-8
      const move=(ev:MouseEvent)=>{ dx=ev.clientX-baseX; dy=ev.clientY-baseY; const cx=Math.max(-cellR.width,Math.min(dx,maxX)); const cy=Math.max(-cellR.height,Math.min(dy,maxY)); wrap.style.transform='translate('+cx+'px,'+cy+'px)' }
      const up=()=>{ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) }
      window.addEventListener('mousemove',move); window.addEventListener('mouseup',up)
    }
    async function handle(file:File){
      const url=URL.createObjectURL(file); const img=new Image(); img.src=url; await new Promise(r=>img.onload=r)
      revokeSoon(url) // 图片已画到 canvas，不再需要 blob URL
      srcCanvas=document.createElement('canvas'); srcCanvas.width=img.naturalWidth; srcCanvas.height=img.naturalHeight
      srcCanvas.getContext('2d')!.drawImage(img,0,0)
      // 在上传框显示原图并绑定鼠标交互
      if(previewEl){ previewEl.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.width='100%'; im.style.maxHeight='300px'; im.style.imageRendering='pixelated'; im.style.cursor='crosshair'; im.setAttribute('data-no-zoom','1'); previewEl.appendChild(im)
        im.addEventListener('mousedown', ev=> onCanvasDown(ev, im))
        im.addEventListener('mousemove', ev=> onCanvasMove(ev, im))
        im.addEventListener('mouseup', ev=> onCanvasUp(ev, im))
        im.addEventListener('mouseleave', ()=>{ if(drawing) endDraw() })
      }
      elements=[]; selected=-1; resetStage()
      drawProgress('已加载 '+img.naturalWidth+'×'+img.naturalHeight+'。可自动提取，或切换 框选/画线 在原图上操作。')
    }
    // 采样四边背景色（可能多个），返回主背景色数组
    function sampleBg(d:Uint8ClampedArray|number[], w:number, h:number){
      const bg:any={}
      const edge=Math.max(1, Math.min(4, Math.floor(Math.min(w,h)*0.02)))
      const add=(x:number,y:number)=>{ if(x<0||y<0||x>=w||y>=h) return; const i=(y*w+x)*4; const k=String(((d[i]>>3)<<6)|((d[i+1]>>3)<<3)|(d[i+2]>>3)); if(!bg[k]) bg[k]={n:0,r:0,g:0,b:0}; const b=bg[k]; b.n++; b.r+=d[i]; b.g+=d[i+1]; b.b+=d[i+2] }
      for(let x=0;x<w;x++){ add(x,0); add(x,h-1); add(x,edge-1); add(x,h-edge) }
      for(let y=0;y<h;y++){ add(0,y); add(w-1,y); add(edge-1,y); add(w-edge,y) }
      const arr=Object.values(bg).sort((a:any,b:any)=>b.n-a.n)
      return arr.slice(0,4).map((b:any)=>({ r:b.r/b.n, g:b.g/b.n, b:b.b/b.n }))
    }
    // 把与四边背景色相近的像素设为透明（去背景）
    function removeBg(d:Uint8ClampedArray|number[], w:number, h:number, bgList:any, T:number){
      const bgd=bgList.map((c:any)=> Math.sqrt(c.r*c.r+c.g*c.g+c.b*c.b))
      let removed=0
      for(let i=0;i<d.length;i+=4){
        let isBg=false
        for(const c of bgList){
          const dist=Math.sqrt((d[i]-c.r)*(d[i]-c.r)+(d[i+1]-c.g)*(d[i+1]-c.g)+(d[i+2]-c.b)*(d[i+2]-c.b))
          if(dist<T){ isBg=true; break }
        }
        if(isBg){ d[i+3]=0; removed++ }
      }
      return removed
    }
    async function doAuto(){
      if(!srcCanvas) return drawProgress('请先上传图片')
      drawProgress('正在分析背景并分割…'); await new Promise(r=>setTimeout(r,30))
      const w=srcCanvas.width, h=srcCanvas.height
      const g=srcCanvas.getContext('2d')!; const id=g.getImageData(0,0,w,h); const d=id.data
      // 1) 先做一次基于 alpha 的原生分割（若图原本就带透明背景）
      const boxes0=splitElements(w,h,d,parseInt(tolEl.value)||48, minEl.checked? Math.max(5,(w*h)*0.0002):0)
      // 2) 若图完全透明背景（alpha 普遍为 0/255），直接用它；否则先自动去背景再分割
      // 检查当前是否已有透明（alpha<250 的像素比例）
      let anyTransparent=false, opaqueCount=0, total=w*h
      for(let i=3;i<d.length;i+=4){ if(d[i]<250){ anyTransparent=true; break } }
      let boxes
      if(anyTransparent){
        boxes=boxes0
      } else {
        const bgList=sampleBg(d,w,h)
        const Tbg=Math.max(24, parseInt(tolEl.value)||48)
        const removed=removeBg(d,w,h,bgList,Tbg)
        if(removed < total*0.5){
          drawProgress('⚠️ 背景色不单一或难以识别（仅移除 '+removed+' 像素）。已尝试分割前景，但效果可能不理想；建议像素风/纯色背景图。', true)
        }
        g.putImageData(id,0,0)
        boxes=splitElements(w,h,d,parseInt(tolEl.value)||48, minEl.checked? Math.max(5,(w*h)*0.0002):0)
      }
      boxes.sort((a,b)=>b.count-a.count)
      elements=boxes.map((b,i)=>({x:b.x,y:b.y,w:b.w,h:b.h,img:cropElement(b),name:'ELEMENT-'+(i+1)}))
      drawProgress('自动提取完成：'+elements.length+' 个独立元素。可在下方结果区拖动、选中保存。')
      rebuildStage()
    }
    function doPoint(x:number,y:number){
      if(!srcCanvas) return drawProgress('请先上传图片')
      const T=parseInt(tolEl.value)||48; const w=srcCanvas.width,h=srcCanvas.height
      if(x<0||y<0||x>=w||y>=h) return
      const g=srcCanvas.getContext('2d')!; const id=g.getImageData(0,0,w,h); const data=id.data
      const hit=splitElements(w,h,data,T,0).filter(b=> x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)
      if(!hit.length) return drawProgress('该点未命中元素，请点在元素上')
      const b=hit[0]; const el={x:b.x,y:b.y,w:b.w,h:b.h,img:cropElement(b),name:'ELEMENT-'+(elements.length+1)}
      elements.push(el); selected=elements.length-1; drawProgress('已框出元素 #'+(selected+1)+'（'+b.w+'×'+b.h+'）'); rebuildStage()
    }
    // 鼠标交互（点选 / 框选 / 画线）
    let drawing=false, drawMode='', startX=0, startY=0, curX=0, curY=0, linePts:any[]=[]
    function onCanvasDown(ev:MouseEvent|any, im:any){
      if(!srcCanvas) return
      const mode=modeEl.value
      if(mode!=='point' && mode!=='box' && mode!=='line') return
      const [mx,my]=toImg(ev, im)
      drawing=true; drawMode=mode; startX=mx; startY=my; curX=mx; curY=my; linePts=mode==='line'?[{x:mx,y:my}]:[]
      setupOverlay()
      drawOverlay()
      ev.preventDefault()
    }
    function onCanvasMove(ev:MouseEvent|any, im:any){
      if(!drawing) return
      const [mx,my]=toImg(ev, im); curX=mx; curY=my
      if(drawMode==='line') linePts.push({x:mx,y:my})
      drawOverlay()
    }
    function onCanvasUp(ev:MouseEvent|any, im:any){
      if(!drawing) return
      const [mx,my]=toImg(ev, im)
      if(drawMode==='box'){ doBoxSelect(startX,startY,mx,my) }
      else if(drawMode==='line'){ doLineCut(linePts) }
      else if(drawMode==='point'){ doPoint(mx,my) }
      drawing=false; hideOverlay()
    }
    function endDraw(){ if(linePts.length>1) doLineCut(linePts); drawing=false; hideOverlay() }
    function toImg(ev:MouseEvent|any, im:HTMLElement){ const r=im.getBoundingClientRect(); return [Math.floor((ev.clientX-r.left)/r.width*srcCanvas!.width), Math.floor((ev.clientY-r.top)/r.height*srcCanvas!.height)] }
    function setupOverlay(){ overlay.style.display='block'; const w=previewEl.querySelector('img'); if(w){ overlay.width=w.clientWidth; overlay.height=w.clientHeight; overlay.getContext('2d')!.clearRect(0,0,overlay.width,overlay.height) } }
    function drawOverlay(){ const c=overlay.getContext('2d')!; c.clearRect(0,0,overlay.width,overlay.height); c.strokeStyle='#ff5a5a'; c.lineWidth=2; if(drawMode==='box'){ const imgw=previewEl.querySelector('img'); const sx=startX/srcCanvas!.width*imgw!.clientWidth, sy=startY/srcCanvas!.height*imgw!.clientHeight; const ex=curX/srcCanvas!.width*imgw!.clientWidth, ey=curY/srcCanvas!.height*imgw!.clientHeight; c.strokeRect(Math.min(sx,ex),Math.min(sy,ey),Math.abs(ex-sx),Math.abs(ey-sy)) } else if(drawMode==='line'){ c.beginPath(); const imgw=previewEl.querySelector('img'); linePts.forEach((p,i)=>{ const x=p.x/srcCanvas!.width*imgw!.clientWidth,y=p.y/srcCanvas!.height*imgw!.clientHeight; if(i===0)c.moveTo(x,y); else c.lineTo(x,y) }); c.stroke() } }
    function hideOverlay(){ drawing=false; overlay.style.display='none'; const c=overlay.getContext('2d')!; c.clearRect(0,0,overlay.width,overlay.height) }
    // 框选：提取框内所有独立元素
    function doBoxSelect(x1:number,y1:number,x2:number,y2:number){
      if(!srcCanvas) return drawProgress('请先上传图片')
      const xa=Math.max(0,Math.min(x1,x2)), xb=Math.min(srcCanvas.width-1,Math.max(x1,x2))
      const ya=Math.max(0,Math.min(y1,y2)), yb=Math.min(srcCanvas.height-1,Math.max(y1,y2))
      if(xb-xa<4||yb-ya<4) return drawProgress('框选区域过小')
      const g=srcCanvas.getContext('2d')!; const id=g.getImageData(xa,ya,xb-xa+1,yb-ya+1); const d=id.data
      const T=parseInt(tolEl.value)||48; const minArea=minEl.checked? Math.max(5,(xb-xa+1)*(yb-ya+1)*0.0002):0
      const boxes=splitElements(xb-xa+1,yb-ya+1,d,T,minArea)
      let added=0
      for(const b of boxes){ const abs={x:xa+b.x,y:ya+b.y,w:b.w,h:b.h,count:b.count}; const el={x:abs.x,y:abs.y,w:abs.w,h:abs.h,img:cropElement(abs),name:'ELEMENT-'+(elements.length+1)}; elements.push(el); added++ }
      selected=elements.length-1
      drawProgress('框选提取完成：框内 '+added+' 个独立元素'); rebuildStage(); updateSel()
    }
    // 画线：把线像素设为透明作为分割缝，再擦背景，前景连通域被线切断成多块
    function doLineCut(pts:{x:number,y:number}[]){
      if(!srcCanvas) return drawProgress('请先上传图片')
      if(pts.length<2) return drawProgress('线太短，请画一条线')
      const w=srcCanvas.width,h=srcCanvas.height
      const g=srcCanvas.getContext('2d')!; const id=g.getImageData(0,0,w,h); const d=id.data
      // 1) 采样背景
      const bgList=sampleBg(d,w,h); const Tbg=Math.max(24,parseInt(tolEl.value)||48)
      removeBg(d,w,h,bgList,Tbg)
      // 2) 把线像素（及其宽度）设为透明
      const T=parseInt(tolEl.value)||48
      const width=Math.max(1,Math.round(Math.max(2, Math.min(8, Math.min(w,h)*0.01))))
      for(let i=0;i<pts.length;i++){
        const p=pts[i]; const p2=pts[i+1]||p
        const steps=Math.max(1,Math.ceil(Math.max(Math.abs(p2.x-p.x),Math.abs(p2.y-p.y))))
        for(let s=0;s<steps;s++){
          const x=Math.round(p.x+(p2.x-p.x)*s/steps), y=Math.round(p.y+(p2.y-p.y)*s/steps)
          for(let dy=-width;dy<=width;dy++) for(let dx=-width;dx<=width;dx++){
            const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=w||ny>=h) continue
            const idx=(ny*w+nx); d[idx*4+3]=0
          }
        }
      }
      g.putImageData(id,0,0)
      // 3) 前景连通域分割，线把它切断成多块
      const minArea=minEl.checked? Math.max(5,(w*h)*0.0002):0
      const boxes=splitElements(w,h,d,T,minArea)
      let added=0
      for(const b of boxes){ const el={x:b.x,y:b.y,w:b.w,h:b.h,img:cropElement(b),name:'ELEMENT-'+(elements.length+1)}; elements.push(el); added++ }
      selected=elements.length-1
      drawProgress('画线分割完成：沿切割线分出 '+added+' 个区域'); rebuildStage(); updateSel()
    }
    runBtn.addEventListener('click', ()=>{ if(modeEl.value==='auto') doAuto(); else drawProgress('请在右侧原图上：'+ (modeEl.value==='point'?'点击':'框选拉矩形' ) + (modeEl.value==='line'?'，按住画线分割':'，或切回自动提取')) })
    clearBtn.addEventListener('click', ()=>{ elements=[]; selected=-1; rebuildStage(); updateSel(); drawProgress('已清空') })
    saveAllBtn.addEventListener('click', ()=>{ void saveElements(elements) })
    saveSelBtn.addEventListener('click', ()=>{ if(selected>=0) void saveElements([elements[selected]]) })
    dlSelBtn.addEventListener('click', ()=>{ const el=(selected>=0?elements[selected]:(elements[0]||null)); if(el) downloadUrl(el.img.toDataURL(), el.name+'.png') })
    async function saveElements(list:any[]){ for(const el of list){ await addToLibrary('extract', el.name, el.img.toDataURL()) } drawProgress('已保存 '+list.length+' 个元素到素材库') }
    resetStage(); updateSel()
  }

  // ---- Helpers ----
  const LS_HISTORY='dsh-game-art-studio:history'
  const getHistory=(): any[]=>{ try{ return JSON.parse(localStorage.getItem(LS_HISTORY)||'[]')}catch{return[]}}
  const pushHistory=(item:any)=>{ const h=getHistory(); h.unshift({ ...item, at:new Date().toISOString() }); localStorage.setItem(LS_HISTORY, JSON.stringify(h.slice(0,100))); refreshExportList() }
  const getKeys=():any=>{ try{ return JSON.parse(localStorage.getItem(LS)||'{}')}catch{return{}} }
  function toast(el:HTMLElement, msg:string, ok=true){ el.textContent=msg; el.style.color=ok?'#2ecc71':'#e74c3c'; setTimeout(()=>el.textContent='',3000) }
  // 轮询等待某个条件成立（用于异步流程步骤之间，如等待切片/打包完成）
  function waitUntil(fn:()=>boolean, timeout=15000, step=120): Promise<void>{
    return new Promise((resolve,reject)=>{
      const t0=Date.now()
      const timer=setInterval(()=>{
        let ok=false; try{ ok=fn() }catch{}
        if(ok){ clearInterval(timer); resolve() }
        else if(Date.now()-t0>timeout){ clearInterval(timer); reject(new Error('等待超时')) }
      }, step)
    })
  }

  // ---- 素材总管：本地 IndexedDB 素材库 ----
  const DB_NAME='godot-arter-assets'
  const DB_STORE='assets'
  function openAssetDB(): Promise<IDBDatabase>{
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1)
      req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE,{keyPath:'id'}) }
      req.onsuccess=()=>resolve(req.result)
      req.onerror=()=>reject(req.error)
    })
  }
  async function idbPut(item:any){ const db=await openAssetDB(); return new Promise<void>((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).put(item); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
  async function idbGetAll():Promise<any[]>{ const db=await openAssetDB(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readonly'); const req=tx.objectStore(DB_STORE).getAll(); req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error) }) }
  async function idbDelete(id:string){ const db=await openAssetDB(); return new Promise<void>((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).delete(id); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
  async function idbClearByKind(kind:string){ const all=await idbGetAll(); for(const a of all){ if(a.kind===kind) await idbDelete(a.id) } }
  async function idbClearAll(){ const db=await openAssetDB(); return new Promise<void>((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
  function downloadDataUrl(dataUrl:string, filename:string){ const a=document.createElement('a'); a.href=dataUrl; a.download=filename; a.click() }
  // 可靠下载：data:/blob: 直接下载；远程 URL 先试 fetch→blob（CORS 允许时），
  // 托管环境再走本地代理，都不行则新标签打开原图（绝不覆盖当前页面）
  const isHostedEnv=()=> location.protocol!=='file:' && location.origin!=='null'
  async function downloadUrl(url:string, filename:string): Promise<void> {
    try{
      let target=url
      if(/^https?:\/\//i.test(url)){
        let blob:Blob|null=null
        try{ const r=await fetch(url); if(r.ok) blob=await r.blob() }catch{}
        if(!blob && isHostedEnv()){
          try{ const r2=await fetch('/game-art-studio/api/proxy-image?url='+encodeURIComponent(url)); if(r2.ok) blob=await r2.blob() }catch{}
        }
        if(blob){ target=URL.createObjectURL(blob); setTimeout(()=>URL.revokeObjectURL(target),10000) }
        else { window.open(url,'_blank'); return }
      } else if(/^blob:/i.test(url)){
        // blob URL 传入时，在 8s 后释放（浏览器已触发下载）
        revokeSoon(url, 8000)
      }
      const a=document.createElement('a'); a.href=target; a.download=filename; document.body.appendChild(a); a.click(); a.remove()
    }catch{ window.open(url,'_blank') }
  }

  // —— 零依赖 ZIP 写入器（STORE 无压缩）：配合一键「打包下载」生成可解压的 Godot 资源包 ——
  interface ZipEntry { name:string; data:Uint8Array }
  const crc32Table=(()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0 } return t })()
  function crc32(data:Uint8Array): number {
    let c=0xFFFFFFFF
    for(let i=0;i<data.length;i++) c=(crc32Table[(c^data[i])&0xFF]^(c>>>8))>>>0
    return (c^0xFFFFFFFF)>>>0
  }
  function buildZipStore(entries:ZipEntry[]): Blob {
    const enc=new TextEncoder()
    const chunks:Uint8Array[]=[]
    const central:Uint8Array[]=[]
    let offset=0
    for(const e of entries){
      const name=enc.encode(e.name)
      const crc=crc32(e.data)
      const size=e.data.length
      const local=new Uint8Array(30+name.length)
      const lv=new DataView(local.buffer)
      lv.setUint32(0,0x04034b50,true)            // local file header signature
      lv.setUint16(4,20,true)                     // version needed
      lv.setUint16(6,0x0800,true)                 // general purpose bit 11: UTF-8 filename
      lv.setUint16(8,0,true)                      // method: store
      lv.setUint16(10,0,true)                     // mod time
      lv.setUint16(12,0x21,true)                  // mod date (1980-01-01)
      lv.setUint32(14,crc,true)
      lv.setUint32(18,size,true)                  // compressed size (= size)
      lv.setUint32(22,size,true)                  // uncompressed size
      lv.setUint16(26,name.length,true)
      lv.setUint16(28,0,true)                     // extra len
      local.set(name,30)
      chunks.push(local, e.data)
      // central directory entry
      const c=new Uint8Array(46+name.length)
      const cv=new DataView(c.buffer)
      cv.setUint32(0,0x02014b50,true)             // central file header signature
      cv.setUint16(4,20,true)                     // version made by
      cv.setUint16(6,20,true)                     // version needed
      cv.setUint16(8,0x0800,true)                 // UTF-8
      cv.setUint16(10,0,true)                     // method: store
      cv.setUint16(12,0,true)                     // mod time
      cv.setUint16(14,0x21,true)                  // mod date
      cv.setUint32(16,crc,true)
      cv.setUint32(20,size,true)                  // compressed
      cv.setUint32(24,size,true)                  // uncompressed
      cv.setUint16(28,name.length,true)
      cv.setUint16(30,0,true)                     // extra len
      cv.setUint16(32,0,true)                     // comment len
      cv.setUint16(34,0,true)                     // disk number
      cv.setUint16(36,0,true)                     // internal attrs
      cv.setUint32(38,0,true)                     // external attrs
      cv.setUint32(42,offset,true)                // local header offset
      c.set(name,46)
      central.push(c)
      offset += local.length + e.data.length
    }
    let centralSize=0; for(const c of central) centralSize+=c.length
    const end=new Uint8Array(22)
    const ev=new DataView(end.buffer)
    ev.setUint32(0,0x06054b50,true)               // end of central directory signature
    ev.setUint16(4,0,true)                        // disk number
    ev.setUint16(6,0,true)                        // disk with central dir
    ev.setUint16(8,entries.length,true)           // entries on this disk
    ev.setUint16(10,entries.length,true)          // total entries
    ev.setUint32(12,centralSize,true)
    ev.setUint32(16,offset,true)                  // central dir offset
    ev.setUint16(20,0,true)                       // comment len
    return new Blob([...chunks, ...central, end] as unknown as BlobPart[],{type:'application/zip'})
  }
  // 从 data:/blob:/http URL 转字节数组，供打包使用
  async function urlToBytes(url:string): Promise<{bytes:Uint8Array; mime:string; ext:string}> {
    let blob:Blob|null=null; let mime=''
    if(/^data:/i.test(url)){ blob=dataUrlToBlob(url); mime=blob.type }
    else if(/^https?:/i.test(url)){
      if(isHostedEnv()){ try{ const r=await fetch(url); if(r.ok) blob=await r.blob() }catch{} }
      if(!blob){ try{ const r2=await fetch('/game-art-studio/api/proxy-image?url='+encodeURIComponent(url)); if(r2.ok) blob=await r2.blob() }catch{} }
    }
    if(!blob){ const r=await fetch(url); blob=await r.blob() }
    mime=blob.type||mime
    const bytes=new Uint8Array(await blob.arrayBuffer())
    const ext=/webp/i.test(mime)?'.webp':/jpe?g/i.test(mime)?'.jpg':/gif/i.test(mime)?'.gif':/svg/i.test(mime)?'.svg':/avif/i.test(mime)?'.avif': '.png'
    return { bytes, mime, ext }
  }

  // ---- 单帧动画工具：白边裁剪 / 统一画布 / 脚底对齐 / 横排拼接 ----
  function canvasToData(cvs:HTMLCanvasElement): ImageData { return cvs.getContext('2d')!.getImageData(0,0,cvs.width,cvs.height) }
  function blankCanvas(w:number,h:number): HTMLCanvasElement { const c=document.createElement('canvas'); c.width=Math.max(1,w); c.height=Math.max(1,h); return c }
  // 找到内容包围盒（非纯白 / alpha>0），返回相对源图坐标；用亮度容差适配浅色/渐变背景
  function trimWhitespace(img:HTMLImageElement|HTMLCanvasElement):{sx:number;sy:number;w:number;h:number}{
    const W=(img as HTMLImageElement).naturalWidth||(img as HTMLCanvasElement).width, H=(img as HTMLImageElement).naturalHeight||(img as HTMLCanvasElement).height
    if(W<1||H<1) return { sx:0, sy:0, w:W, h:H }
    const c=blankCanvas(W,H); const g=c.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(img as any,0,0)
    const d=g.getImageData(0,0,W,H).data
    let minX=W,minY=H,maxX=-1,maxY=-1
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=(y*W+x)*4; const a=d[i+3]
      // 内容 = 不透明 且 (RGB 与纯白差距大 或 明显低于纯白亮度)
      const isWhiteish = d[i]>=238 && d[i+1]>=238 && d[i+2]>=238
      if(a>8 && !isWhiteish){ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y }
    }
    if(maxX<minX||maxY<minY) return { sx:0, sy:0, w:W, h:H } // 全白/空 → 保底全图
    return { sx:minX, sy:minY, w:maxX-minX+1, h:maxY-minY+1 }
  }
  // 把原始帧裁白边（返回透明小图）
  function cropToContent(img:HTMLImageElement|HTMLCanvasElement): HTMLCanvasElement {
    const b=trimWhitespace(img)
    const out=blankCanvas(b.w,b.h)
    out.getContext('2d')!.drawImage(img as any, b.sx,b.sy,b.w,b.h, 0,0,b.w,b.h)
    return out
  }
  // 把一组帧统一到同一画布：水平居中 + 脚底对齐，返回一个"能容纳全部内容+上下留白"的画布尺寸
  function normalizeFrames(frames:HTMLCanvasElement[], pad=12):{frames:HTMLCanvasElement[];w:number;h:number}{
    if(!frames.length) return { frames, w:0, h:0 }
    let maxW=0, maxH=0
    for(const f of frames){ maxW=Math.max(maxW, f.width); maxH=Math.max(maxH, f.height) }
    const w=maxW+pad*2, h=maxH+pad*2
    const out:HTMLCanvasElement[]=[]
    for(const f of frames){
      const c=blankCanvas(w,h); const g=c.getContext('2d')!; g.imageSmoothingEnabled=false
      const x=Math.floor((w-f.width)/2)      // 水平居中
      const y=Math.floor((h-f.height)-pad)   // 脚底对齐到同一基线（下对齐）
      g.drawImage(f, x, y)
      out.push(c)
    }
    return { frames: out, w, h }
  }
  // 横排拼接成精灵表（透明背景）
  function packRow(frames:HTMLCanvasElement[]): HTMLCanvasElement {
    if(!frames.length){ const c=blankCanvas(1,1); return c }
    const fw=frames[0].width, fh=frames[0].height
    const out=blankCanvas(fw*frames.length, fh)
    const g=out.getContext('2d')!; g.imageSmoothingEnabled=false
    frames.forEach((fc,i)=> g.drawImage(fc, i*fw, 0))
    return out
  }
  // 从整表按矩形区域裁剪出独立帧
  function cropSheet(img:HTMLCanvasElement, rect:{x:number;y:number;w:number;h:number}): HTMLCanvasElement {
    const x=Math.max(0, Math.min(rect.x, img.width-1)), y=Math.max(0, Math.min(rect.y, img.height-1))
    const w=Math.max(1, Math.min(rect.w, img.width-x)), h=Math.max(1, Math.min(rect.h, img.height-y))
    const out=blankCanvas(w,h); out.getContext('2d')!.drawImage(img, x,y,w,h, 0,0,w,h)
    return out
  }
  // 去背：把背景透明化。mode=white(白度>240全透明/225~240半透明)；gray(RGB接近且亮度95~165按接近度透明)
  function removeBackground(cvs:HTMLCanvasElement, mode:'white'|'gray'|'none'='white'){
    if(!cvs||mode==='none') return cvs
    const g=cvs.getContext('2d')!; const W=cvs.width, H=cvs.height
    const imgData=g.getImageData(0,0,W,H); const d=imgData.data
    for(let i=0;i<d.length;i+=4){
      const r=d[i], gr=d[i+1], b=d[i+2], a=d[i+3]
      if(a===0) continue
      if(mode==='white'){
        // 白度：取 max 与 min 的差值小且都高 → 越接近纯白越透明
        const bright=(r+gr+b)/3
        if(r>240&&gr>240&&b>240){ d[i+3]=0 }
        else if(bright>225&&bright<=240 && Math.max(r,gr,b)-Math.min(r,gr,b)<18){ d[i+3]=Math.round(255*(240-bright)/15) }
      } else if(mode==='gray'){
        // 灰度背景：RGB 接近(最大差<25)且亮度 95~165
        const mx=Math.max(r,gr,b), mn=Math.min(r,gr,b)
        if(mx-mn<25){
          const bright=(r+gr+b)/3
          if(bright>=95&&bright<=165){ d[i+3]=0 }
          else if(bright>165&&bright<205 && mx-mn<20){ d[i+3]=Math.round(255*(205-bright)/40) }
        }
      }
    }
    g.putImageData(imgData,0,0)
    return cvs
  }
  // 规范命名：{prefix}_{i}.png，帧号从 0 连续
  function buildFrameNaming(prefix:string, count:number): string[] {
    const p=(prefix||'frame').replace(/[^\w-]+/g,'_')||'frame'
    return Array.from({length:count},(_,i)=> p+'_'+i+'.png')
  }
  // 自动框图：按列投影找水平分隔缝（横排整表），返回帧矩形数组
  function autoBoxProjection(img:HTMLCanvasElement): {x:number;y:number;w:number;h:number}[] {
    const W=img.width, H=img.height
    const d=img.getContext('2d')!.getImageData(0,0,W,H).data
    const col=new Float32Array(W)
    for(let x=0;x<W;x++) for(let y=0;y<H;y++){
      const i=(y*W+x)*4; const a=d[i+3]; const isWhite=d[i]>=240&&d[i+1]>=240&&d[i+2]>=240
      if(a>8 && !isWhite) col[x]++
    }
    const mean=col.reduce((a,b)=>a+b,0)/W
    const active=(x:number)=> col[x] > mean*0.12
    const spans:{x0:number;x1:number}[]=[]
    let inSpan=false, x0=0
    for(let x=0;x<W;x++){ if(active(x)){ if(!inSpan){ x0=x; inSpan=true } } else { if(inSpan){ if(x-x0>=8) spans.push({x0,x1:x-1}); inSpan=false } } }
    if(inSpan) spans.push({x0,x1:W-1})
    const row=new Float32Array(H)
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; const a=d[i+3]; const isWhite=d[i]>=240&&d[i+1]>=240&&d[i+2]>=240; if(a>8&&!isWhite) row[y]++ }
    const rowMean=row.reduce((a,b)=>a+b,0)/H
    let top=0,bot=H-1
    while(top<H && row[top]<=rowMean*0.12) top++
    while(bot>top && row[bot]<=rowMean*0.12) bot--
    if(top>=bot){ top=0; bot=H-1 }
    if(spans.length<2){
      // 单角色或未检测出分隔 → 视为单帧
      return [{ x:0, y:top, w:W, h:bot-top+1 }]
    }
    return spans.map(sp=>({ x:sp.x0, y:top, w:sp.x1-sp.x0+1, h:bot-top+1 }))
  }

  // ---- 内置 GIF89a 编码器（LZW，纯 JS 零依赖）----
  function buildGif(frames:HTMLCanvasElement[], fps:number, loop=true): Blob {
    if(!frames.length) return new Blob([], {type:'image/gif'})
    const W=frames[0].width, H=frames[0].height
    const frameDatas:ImageData[] = frames.map(canvasToData)
    // 收集全局调色板（RGB 去重，最多 256 色）
    const palette:{r:number;g:number;b:number}[]=[]
    const palMap=new Map<number,number>()
    const px=(r:number,g:number,b:number)=>{ const key=(r<<16)|(g<<8)|b; if(!palMap.has(key)){ if(palette.length<256){ palMap.set(key, palette.length); palette.push({r,g,b}) } } return palMap.get(key)??0 }
    for(const fd of frameDatas) for(let i=0;i<fd.data.length;i+=4){ if(fd.data[i+3]>8) px(fd.data[i],fd.data[i+1],fd.data[i+2]) }
    if(!palette.length) palette.push({r:0,g:0,b:0})
    // 补齐到 2 的幂颜色数
    let colors=palette.length; let bitDepth=1; while((1<<bitDepth)<colors) bitDepth++
    const colorCount=1<<bitDepth
    const table = new Uint8Array(colorCount*3)
    for(let i=0;i<colorCount;i++){ const c=palette[i]||{r:0,g:0,b:0}; table[i*3]=c.r; table[i*3+1]=c.g; table[i*3+2]=c.b }
    // 透明色索引：额外加一个全透明色项（RGBA=0,0,0,0）
    const transparentIndex=colors<colorCount? colors : (palette.length<256? palette.length : 0)
    // 为每帧生成 LZW 编码的索引序列
    const lzwKeySize = Math.max(2, bitDepth)
    const imageLzw=(fd:ImageData, out:number[])=>{
      // 建立像素 → 调色板索引
      const idx=new Uint8Array(W*H)
      for(let i=0;i<W*H;i++){
        const o=i*4; const a=fd.data[o+3]
        if(a<=8){ idx[i]=transparentIndex; continue }
        const k=(fd.data[o]<<16)|(fd.data[o+1]<<8)|fd.data[o+2]
        idx[i]=palMap.has(k)? palMap.get(k)! : 0
      }
      // LZW-GIF 编码（用 "p1,p2,..." 字符串表示当前序列，正确编码每个 code）
      const CLEAR=1<<lzwKeySize, EOI=CLEAR+1
      let codeSize=lzwKeySize+1
      let dict=new Map<string,number>(); let nextCode=EOI+1
      const bitBuf:number[]=[]
      const emit=(code:number, bits:number)=>{ for(let b=0;b<bits;b++) bitBuf.push((code>>b)&1); while(bitBuf.length>=8){ let byte=0; for(let k=0;k<8;k++) byte|=bitBuf[k]<<k; out.push(byte); bitBuf.splice(0,8) } }
      emit(CLEAR, codeSize)
      let cur=''
      for(let i=0;i<idx.length;i++){
        const c=idx[i]; const k=cur? cur+','+c : String(c)
        if(dict.has(k)){ cur=k; continue }
        emit(dict.has(cur)? dict.get(cur)! : c, codeSize)   // cur 可能为空或单像素，直接发对应码
        if(nextCode<(1<<codeSize) && dict.size<4096){ dict.set(k, nextCode++) }
        if(nextCode>=(1<<codeSize) && codeSize<12){ codeSize++ }
        if(nextCode>=4096){ emit(CLEAR, codeSize); dict.clear(); nextCode=EOI+1; codeSize=lzwKeySize+1 }
        cur=String(c)
      }
      if(cur) emit(dict.has(cur)? dict.get(cur)! : parseInt(cur.split(',').pop()!,10), codeSize)
      emit(EOI, codeSize)
      return out
    }
    // 组装字节
    const bytes:number[]=[]
    const pushStr=(s:string)=>{ for(let i=0;i<s.length;i++) bytes.push(s.charCodeAt(i)) }
    pushStr('GIF89a')
    // Logical Screen Descriptor
    bytes.push(W&0xff,(W>>8)&0xff,H&0xff,(H>>8)&0xff, 0xF0|(bitDepth-1), 0x00, 0x00)
    // Global Color Table
    for(let i=0;i<table.length;i++) bytes.push(table[i])
    // NETSCAPE looping (if loop)
    if(loop){
      bytes.push(0x21,0xFF,0x0B); pushStr('NETSCAPE2.0'); bytes.push(0x03,0x01,0x00,0x00,0x00)
    }
    // 每帧
    const delay=Math.max(2, Math.round(100/fps))
    for(const fd of frameDatas){
      // Graphic Control Extension (transparent index, delay)
      bytes.push(0x21,0xF9,0x04, 0x09, delay&0xff, (delay>>8)&0xff, transparentIndex, 0x00)
      // Image Descriptor, full frame, no interlace
      bytes.push(0x2C, 0,0,0,0, W&0xff,(W>>8)&0xff, H&0xff,(H>>8)&0xff, 0x00)
      const lzw:number[]=[]; imageLzw(fd, lzw)
      // LZW min code size + sub-blocks
      bytes.push(lzwKeySize)
      for(let i=0;i<lzw.length;i+=255){ const chunk=lzw.slice(i,i+255); bytes.push(chunk.length); for(const c of chunk) bytes.push(c) }
      bytes.push(0x00)
    }
    bytes.push(0x3B)
    return new Blob([new Uint8Array(bytes)], {type:'image/gif'})
  }

  const LS_CUSTOM_LIBS='dsh-game-art-studio:customLibs'
  const getCustomLibs=():any[]=>{ try{ const a=JSON.parse(localStorage.getItem(LS_CUSTOM_LIBS)||'[]'); return Array.isArray(a)?a:[] }catch{ return [] } }
  const saveCustomLibs=(list:any[])=> localStorage.setItem(LS_CUSTOM_LIBS, JSON.stringify(list))
  function allLibDefs():Record<string,{label:string;prefix:string}> {
    const merged={ ...LIB_DEFS }
    for(const c of getCustomLibs()) merged[c.key]={ label:c.label, prefix:c.prefix||'PKG' }
    return merged
  }

  // —— Godot 原生 .tres 资源生成（拖入即用,引用同目录同名 PNG）——
  function buildSpriteFramesTres(pngName:string, perRow:number, anims:{name:string;frames:number[];speed:number;loop:boolean}[], fw:number, fh:number): string {
    const refs=Array.from(new Set(anims.flatMap(a=>a.frames)))
    const atlas=new Map<number,string>()
    refs.forEach((idx,i)=>{ atlas.set(idx,'AtlasTexture_'+i) })
    const L:string[]=[]
    L.push('[gd_resource type="SpriteFrames" load_steps='+(atlas.size+2)+' format=3]')
    L.push('[ext_resource type="Texture2D" path="res://'+pngName+'" id="1_abcde"]')
    atlas.forEach((id,idx)=>{ const col=idx%perRow, row=Math.floor(idx/perRow)
      L.push('[sub_resource type="AtlasTexture" id="'+id+'"]')
      L.push('atlas = ExtResource("1_abcde")')
      L.push('region = Rect2('+(col*fw)+', '+(row*fh)+', '+fw+', '+fh+')')
    })
    L.push('[resource]')
    const animStr=anims.map(a=>'{'+
      '"frames": ['+a.frames.map(f=>'{"duration": '+(1/a.speed).toFixed(4)+', "texture": SubResource("'+atlas.get(f)+'")}').join(', ')+'], '+
      '"loop": '+a.loop+', "name": &"'+a.name+'", "speed": '+a.speed+'.0'+
    '}').join(', ')
    L.push('animations = ['+animStr+']')
    return L.join('\n')
  }
  // 由素材网格元数据构建 SpriteFrames 动画数组（复用序列帧导出逻辑，供导出中心打包时自动生成 .tres）
  function buildAnimationsFromMeta(meta:any){
    const fps=meta.fps||8, perRow=meta.cols||1, frameCount=meta.frames||0
    if(meta.dirRows && perRow>0 && meta.dirNames){
      const names=String(meta.dirNames).split(',').map(s=>s.trim()).filter(Boolean)
      const rows=Math.max(1,Math.ceil(frameCount/perRow))
      const animations:any[]=[]
      for(let r=0;r<rows;r++){
        const name=names[r]||('row'+r)
        const fr=[]; for(let c=0;c<perRow;c++){ const idx=r*perRow+c; if(idx<frameCount) fr.push(idx) }
        animations.push({ name, frames:fr, speed:fps, loop:true })
      }
      if(animations.length && animations[0].frames.length){ animations.push({ name:'stand', frames:[animations[0].frames[0]], speed:fps, loop:false }) }
      return animations
    }
    return [{ name:'default', frames: Array.from({length:frameCount},(_,i)=>i), speed:fps }]
  }
  function buildTileSetTres(pngName:string, cols:number, rows:number, tileSize:number): string {
    const L:string[]=[]
    L.push('[gd_resource type="TileSet" load_steps=3 format=3]')
    L.push('[ext_resource type="Texture2D" path="res://'+pngName+'" id="1_abcde"]')
    L.push('[sub_resource type="TileSetAtlasSource" id="TileSetAtlasSource_1"]')
    L.push('texture = ExtResource("1_abcde")')
    L.push('texture_region_size = Vector2i('+tileSize+', '+tileSize+')')
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) L.push(c+':'+r+'/0 = '+(r*cols+c))
    L.push('[resource]')
    L.push('tile_size = Vector2i('+tileSize+', '+tileSize+')')
    L.push('sources = [SubResource("TileSetAtlasSource_1")]')
    return L.join('\n')
  }

  const LIB_DEFS:Record<string,{label:string;prefix:string}> = {
    character:{label:'角色库',prefix:'CHAR'},
    spritesheet:{label:'序列帧库',prefix:'SPRITE'},
    asset:{label:'素材库',prefix:'ASSET'},
    matting:{label:'抠图库',prefix:'MATTING'},
    tile:{label:'瓦片库',prefix:'TILE'},
    map:{label:'大地图库',prefix:'MAP'},
    scene:{label:'场景库',prefix:'SCENE'},
    post:{label:'后处理库',prefix:'POST'},
    story:{label:'剧场插画库',prefix:'INK'},
  }
  // 素材 kind → Godot res://assets/ 子目录映射（用于一键打包导出的目录归类）
  const KIND_TO_GODOT_DIR:Record<string,string> = {
    character:'characters',
    spritesheet:'spritesheets',
    asset:'icons',
    matting:'textures',
    post:'textures',
    tile:'tilesets',
    map:'maps',
    scene:'scenes',
    story:'cutscenes',
  }
  let refreshAssetManagerGlobal: (()=>void)|null = null
  async function addToLibrary(kind:string, name:string, url:string, meta?:any): Promise<string>{
    const def=allLibDefs()[kind]||allLibDefs().asset||{ label:'素材库', prefix:'ASSET' }
    const all=await idbGetAll()
    const count=all.filter(a=>a.kind===kind).length+1
    const id=def.prefix+'-'+String(count).padStart(4,'0')
    const item:any={ id, kind, name:name||def.label+' #'+count, url, createdAt:Date.now() }
    if(meta) item.meta=meta
    await idbPut(item)
    try{ refreshAssetManagerGlobal?.() }catch{}
    return id
  }
  // 获取素材库全部条目(scene编辑器等模块调用)
  function getAllAssetItems(): Promise<{id:string, kind:string, name:string, url:string, meta?:any}[]>{
    return idbGetAll()
  }


  // ---- 第三方 API 预设（自定义路由） ----
  const LS_PRESETS='dsh-game-art-studio:customProviders'
  const getCustomProviders=(): any[]=>{ try{ const a=JSON.parse(localStorage.getItem(LS_PRESETS)||'[]'); return Array.isArray(a)?a:[] }catch{ return [] } }
  const saveCustomProviders=(list:any[])=>{ localStorage.setItem(LS_PRESETS, JSON.stringify(list)) }
  let pickedModels:string[]=[] // 勾选要使用的模型（保存为预设的 models 字段）
  const modelSelSyncs: (()=>void)[] = []

  function providerOptionHtml(): string {
    const built='<option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option><option value="web:gemini">🌐 Gemini 网页版</option><option value="web:chatgpt">🌐 ChatGPT 网页版</option>'
    const customs=getCustomProviders().map(p=>`<option value="custom:${p.id}">🔌 ${p.name.replace(/[<>"']/g,'')}</option>`).join('')
    return built+customs
  }

  function populateProviderSelects(){
    const ids=['c-provider','q-provider','s-provider','f-provider','map-provider','sc-provider']
    for(const id of ids){
      const sel=main.querySelector('#'+id) as HTMLSelectElement | null
      if(!sel) continue
      const old=sel.value
      sel.innerHTML=providerOptionHtml()
      // 尽量保留原选择；若已失效则回到本地演示
      if([...sel.options].some(o=>o.value===old)) sel.value=old
      else sel.value='mock'
    }
    modelSelSyncs.forEach(f=>f())
  }

  // 自定义供应商选中后，显示其勾选过的模型列表供生成时自由选用
  function bindModelSelect(panel:HTMLElement, provId:string, selId:string){
    const prov=panel.querySelector('#'+provId) as HTMLSelectElement | null
    const sel=panel.querySelector('#'+selId) as HTMLSelectElement | null
    if(!prov||!sel) return
    const update=()=>{
      const val=prov.value||''
      const p= val.startsWith('custom:') ? getCustomProviders().find(x=>x.id===val.slice(7)) : null
      const models= p ? (Array.isArray(p.models)&&p.models.length ? p.models : (p.model?[p.model]:[])) : []
      if(p && models.length){
        sel.innerHTML=models.map((m:string)=>'<option value="'+m.replace(/[<>"']/g,'')+'">'+m.replace(/[<>"']/g,'')+'</option>').join('')
        sel.style.display='block'
        if(p.model && models.includes(p.model)) sel.value=p.model
      }else{
        sel.innerHTML=''
        sel.style.display='none'
      }
    }
    prov.addEventListener('change', update)
    modelSelSyncs.push(update)
    update()
  }

  function renderPresetList(){
    const list=pPreset.querySelector('#p-list') as HTMLElement
    if(!list) return
    const presets=getCustomProviders()
    if(!presets.length){ list.innerHTML='<span style="color:#9aa0a6">暂无自定义预设 — 在下方表单中添加第一个</span>'; return }
    list.innerHTML=presets.map(p=>{
      const typeLabel=({ openai:'OpenAI 兼容', stability:'Stability', siliconflow:'SiliconFlow' } as Record<string,string>)[p.type]||p.type||'?'
      return `<div style="display:flex;gap:6px;align-items:center;padding:6px 0;border-bottom:1px dashed #3a3f47">
        <span style="color:#e67e22">🔌</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:12px;color:#e6e6e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(p.name||'未命名').replace(/[<>"']/g,'')}</div>
          <div style="font-size:10px;color:#9aa0a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${typeLabel} · ${(p.baseUrl||'').replace(/[<>"']/g,'')}</div>
          <div style="font-size:10px;color:#6ea6d1">${(p.models&&p.models.length)? ('已选 '+p.models.length+' 个模型 · '+(p.models[0]||'')) : (p.model||'默认模型')}</div>
        </div>
        <button class="gas-btn ghost" data-preset-edit="${p.id}" style="padding:3px 7px;font-size:10px">编辑</button>
        <button class="gas-btn ghost" data-preset-test="${p.id}" style="padding:3px 7px;font-size:10px">试生成</button>
        <button class="gas-btn ghost" data-preset-del="${p.id}" style="padding:3px 7px;font-size:10px;color:#e74c3c">删除</button>
      </div>`
    }).join('')
  }

  function resetPresetForm(){
    const f=pPreset.querySelector('#p-name') as HTMLInputElement; if(f) f.value=''
    const ft=pPreset.querySelector('#p-type') as HTMLSelectElement; if(ft) ft.value='openai'
    const fm=pPreset.querySelector('#p-model') as HTMLInputElement; if(fm) fm.value=''
    const fb=pPreset.querySelector('#p-base') as HTMLInputElement; if(fb) fb.value=''
    const fk=pPreset.querySelector('#p-key') as HTMLInputElement; if(fk) fk.value=''
    const st=pPreset.querySelector('#p-status') as HTMLElement; if(st) st.textContent=''
    const dl=pPreset.querySelector('#p-model-list') as HTMLDataListElement; if(dl) dl.innerHTML=''
    pickedModels=[]
    closeModelPicker()
  }

  function editPreset(id:string){
    const p=getCustomProviders().find(x=>x.id===id); if(!p) return
    ;(pPreset.querySelector('#p-name') as HTMLInputElement).value=p.name||''
    ;(pPreset.querySelector('#p-type') as HTMLSelectElement).value=p.type||'openai'
    ;(pPreset.querySelector('#p-model') as HTMLInputElement).value=p.model||''
    ;(pPreset.querySelector('#p-base') as HTMLInputElement).value=p.baseUrl||''
    ;(pPreset.querySelector('#p-key') as HTMLInputElement).value=p.apiKey||''
    ;(pPreset.querySelector('#p-id-hidden') as HTMLInputElement)?.remove?.()
    const hid=document.createElement('input'); hid.type='hidden'; hid.id='p-id-hidden'; hid.value=p.id
    pPreset.querySelector('#p-name')!.insertAdjacentElement('afterend', hid)
    pickedModels = Array.isArray(p.models)? p.models.slice() : []
    if(pickedModels.length) openModelPicker(pickedModels); else closeModelPicker()
    const st=pPreset.querySelector('#p-status') as HTMLElement; if(st){ st.textContent='正在编辑：'+p.name; st.style.color='#f1c40f' }
  }

  async function testPreset(id:string){
    const st=pPreset.querySelector('#p-status') as HTMLElement; if(!st) return
    const p=getCustomProviders().find(x=>x.id===id); if(!p){ st.textContent='预设不存在'; st.style.color='#e74c3c'; return }
    st.textContent='试生成中…'; st.style.color='#f1c40f'
    try{
      await callImageGen('test dot, solid color, 64px', 'custom:'+id, { size:'64x64' })
      st.textContent='✓ 连接成功：'+p.name; st.style.color='#2ecc71'
    }catch(e:any){
      st.textContent='连接失败：'+String(e.message||e).slice(0,120); st.style.color='#e74c3c'
    }
  }

  function addPresetFromForm(){
    const st=pPreset.querySelector('#p-status') as HTMLElement; if(!st) return
    const name=(pPreset.querySelector('#p-name') as HTMLInputElement).value.trim()
    const type=(pPreset.querySelector('#p-type') as HTMLSelectElement).value
    const model=(pPreset.querySelector('#p-model') as HTMLInputElement).value.trim()
    const baseUrl=(pPreset.querySelector('#p-base') as HTMLInputElement).value.trim()
    const apiKey=(pPreset.querySelector('#p-key') as HTMLInputElement).value.trim()
    if(!name) { st.textContent='请填写预设名称'; st.style.color='#e74c3c'; return }
    if(!baseUrl) { st.textContent='请填写 Base URL 接口地址'; st.style.color='#e74c3c'; return }
    const existingId=(pPreset.querySelector('#p-id-hidden') as HTMLInputElement)?.value
    const list=getCustomProviders()
    // 直接从 DOM 读 checkbox 当前状态：用户改了勾选即使没点"确定"也保存用户最后一次的选择，不依赖 pickedModels
    const domModels=[...pPreset.querySelectorAll('#p-models-list input[data-model]:checked')].map((cb:any)=>cb.dataset.model as string)
    const finalModels=domModels.length ? domModels : pickedModels.slice()
    const newItem={ id: existingId || ('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)), name, type, model: model||(finalModels[0]||''), baseUrl, apiKey, models: finalModels }
    if(existingId){
      const idx=list.findIndex(x=>x.id===existingId)
      if(idx>=0) list[idx]=newItem; else list.push(newItem)
    } else {
      list.unshift(newItem)
    }
    saveCustomProviders(list)
    resetPresetForm()
    renderPresetList()
    populateProviderSelects()
    st.textContent='✓ 已保存预设：'+name+'（已同步到所有生成下拉框）'; st.style.color='#2ecc71'
  }

  // 预设面板事件
  pPreset.querySelector('#p-add')!.addEventListener('click', addPresetFromForm)
  pPreset.querySelector('#p-fetch-models')!.addEventListener('click', ()=>{ void fetchPresetModels() })
  pPreset.querySelector('#p-models-all')!.addEventListener('click', ()=>{ const listEl=pPreset.querySelector('#p-models-list') as HTMLElement; listEl.querySelectorAll('input[data-model]').forEach((cb:any)=> cb.checked=true); updatePickerCount() })
  pPreset.querySelector('#p-models-none')!.addEventListener('click', ()=>{ const listEl=pPreset.querySelector('#p-models-list') as HTMLElement; listEl.querySelectorAll('input[data-model]').forEach((cb:any)=> cb.checked=false); updatePickerCount() })
  pPreset.querySelector('#p-models-ok')!.addEventListener('click', ()=>{
    const listEl=pPreset.querySelector('#p-models-list') as HTMLElement
    pickedModels=[...listEl.querySelectorAll('input[data-model]:checked')].map((cb:any)=> cb.dataset.model as string)
    if(pickedModels.length){ const fm=pPreset.querySelector('#p-model') as HTMLInputElement; fm.value=pickedModels[0] }
    closeModelPicker()
    const st=pPreset.querySelector('#p-status') as HTMLElement
    if(st){ st.textContent='✓ 已选用 '+pickedModels.length+' 个模型，保存预设后即可在各生成面板按供应商选用'; st.style.color='#2ecc71' }
  })
  pPreset.querySelector('#p-cancel')!.addEventListener('click', ()=>{ resetPresetForm(); ;(pPreset.querySelector('#p-id-hidden') as HTMLInputElement)?.remove?.() })
  pPreset.querySelector('#p-list')!.addEventListener('click', (e:any)=>{
    const btn=(e.target as HTMLElement).closest?.('button') as HTMLElement | null
    if(!btn) return
    const id=btn.dataset.presetEdit||btn.dataset.presetTest||btn.dataset.presetDel
    if(!id) return
    if(btn.dataset.presetEdit) editPreset(id)
    else if(btn.dataset.presetTest) void testPreset(id)
    else if(btn.dataset.presetDel){
      if(!confirm('确定删除预设？')) return
      saveCustomProviders(getCustomProviders().filter(x=>x.id!==id))
      renderPresetList(); populateProviderSelects(); resetPresetForm()
    }
  })

  // 初始化：预载自定义预设并同步到所有下拉框
  renderPresetList()
  populateProviderSelects()
  bindModelSelect(pChar,'c-provider','c-model-sel')
  bindModelSelect(pSeq,'q-provider','q-model-sel')
  bindModelSelect(pSheet,'s-provider','s-model-sel')
  bindModelSelect(pForge,'f-provider','f-model-sel')
  bindModelSelect(pMap,'map-provider','map-model-sel')
  bindModelSelect(pScene,'sc-provider','sc-model-sel')

  function resolveCustomEndpoint(base:string, type:string): string {
    const b=base.replace(/\/+$/,'')
    if(type==='stability'){
      if(/\/stable-image(?:\/|$)/i.test(b) || /\/generate\/[^/]+$/i.test(b)) return b
      return b+'/v2beta/stable-image/generate/sd3'
    }
    if(/\/images\/generations$/i.test(b) || /\/image\/generations$/i.test(b) || /\/generations$/i.test(b)) return b
    return b+'/images/generations'
  }

  // 「获取默认模型」：OpenAI 兼容 / SiliconFlow 的模型列表接口是 GET {base}/models
  // 若用户填的是完整生成端点，先还原根路径再拼 /models
  function resolveModelsEndpoint(base:string, type:string): string | null {
    if(type==='stability') return null // Stability 协议无公开模型列表接口
    let b=base.replace(/\/+$/,'')
    b=b.replace(/\/(images|image)\/generations$/i,'').replace(/\/generations$/i,'')
    return b+'/models'
  }

  async function fetchPresetModels(){
    const st=pPreset.querySelector('#p-status') as HTMLElement; if(!st) return
    const type=(pPreset.querySelector('#p-type') as HTMLSelectElement)?.value
    const base=(pPreset.querySelector('#p-base') as HTMLInputElement)?.value.trim()||''
    const key=(pPreset.querySelector('#p-key') as HTMLInputElement)?.value.trim()||''
    if(!base){ st.textContent='请先填写 Base URL 接口地址'; st.style.color='#e74c3c'; return }
    if(!key){ st.textContent='请先填写 API Key'; st.style.color='#e74c3c'; return }
    const endpoint=resolveModelsEndpoint(base,type||'openai')
    if(!endpoint){ st.textContent='Stability 协议暂不提供模型列表接口，请手动填写模型 ID'; st.style.color='#e74c3c'; return }
    const btn=pPreset.querySelector('#p-fetch-models') as HTMLButtonElement; if(!btn) return
    btn.disabled=true; const oldLabel=btn.textContent
    btn.textContent='⏳ 获取中…'
    st.textContent='正在请求 '+endpoint+' …'; st.style.color='#f1c40f'
    try{
      const r=await fetch(endpoint,{ headers:{ 'Authorization':'Bearer '+key, 'Accept':'application/json' } })
      if(!r.ok) throw new Error('HTTP '+r.status+' '+await r.text().then(t=>t.slice(0,160)))
      const j=await r.json() as any
      const arr:any[] = Array.isArray(j.data)? j.data : Array.isArray(j.models)? j.models : Array.isArray(j)? j : []
      const ids=arr.map((m:any)=> typeof m==='string'? m : (m.id||m.model||m.name)).filter((x:any)=>typeof x==='string').map((x:string)=>x.trim()).filter(Boolean)
      if(!ids.length) throw new Error('响应中没有找到模型列表（data 为空）')
      // 图像类模型排前面，便于默认选中
      const img=ids.filter((id:string)=>/image|dall|flux|sdxl|sd-|stable|t2i|pix|turbo|omni|gpt-image|kandinsky|sana|wan/i.test(id))
      const ordered=Array.from(new Set([...img, ...ids]))
      const def=ordered[0]||''
      ;(pPreset.querySelector('#p-model') as HTMLInputElement).value=def
      openModelPicker(ordered)
      st.textContent='✓ 检测到 '+ids.length+' 个模型，默认已全选（默认模型：'+def+'）— 取消不需要的勾选后点「✅ 确定」'
      st.style.color='#2ecc71'
    }catch(e:any){
      st.textContent='获取模型失败：'+String(e.message||e).slice(0,160); st.style.color='#e74c3c'
    }finally{
      btn.disabled=false; btn.textContent=oldLabel
    }
  }

  // ---- 模型勾选面板 ----
  function openModelPicker(models:string[]){
    const picker=pPreset.querySelector('#p-models-picker') as HTMLElement
    const listEl=pPreset.querySelector('#p-models-list') as HTMLElement
    if(!picker||!listEl) return
    pickedModels=models.slice()
    const checked=new Set(pickedModels)
    listEl.innerHTML=models.map((m:string)=>'<label style="display:flex;gap:6px;align-items:center;font-size:11px;color:var(--text);cursor:pointer;padding:2px 0"><input type="checkbox" data-model="'+m.replace(/[<>"']/g,'')+'" '+(checked.has(m)?'checked':'')+' style="accent-color:var(--accent)"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+m.replace(/[<>"']/g,'')+'</span></label>').join('')
    listEl.querySelectorAll('input[data-model]').forEach((cb:any)=>{ cb.addEventListener('change', updatePickerCount) })
    picker.style.display='block'
    updatePickerCount()
  }
  function updatePickerCount(){
    const countEl=pPreset.querySelector('#p-models-count') as HTMLElement
    const listEl=pPreset.querySelector('#p-models-list') as HTMLElement
    if(!countEl||!listEl) return
    countEl.textContent=String([...listEl.querySelectorAll('input[data-model]:checked')].length)
  }
  function closeModelPicker(){
    const picker=pPreset.querySelector('#p-models-picker') as HTMLElement
    if(picker) picker.style.display='none'
  }

  async function toLocalBlobUrl(url:string): Promise<string> {
    // 已是本地 data:/blob: 直接返回，避免多余的下载
    if(!/^https?:\/\//i.test(url)) return url
    // file:// 直开时没有 DSH 代理路由，不能落入代理兜底
    const hosted= location.protocol!=='file:' && location.origin!=='null'
    // 30s 超时防卡死；超时/失败都回退到「直接给 <img> 用原URL」或代理，绝不抛错导致生成失败
    const ac = typeof AbortController!=='undefined' ? new AbortController() : null
    const timer = ac ? setTimeout(()=>ac.abort(), 30000) : null
    try{
      const r=await fetch(url, ac ? { signal: ac.signal } : undefined)
      if(!r.ok) throw new Error('HTTP '+r.status)
      const blob=await r.blob()
      const local=URL.createObjectURL(blob)
      revokeSoon(local) // 自动释放，避免长会话中 blob URL 累积
      return local
    }catch(e:any){
      // 任何下载失败（含超时/跨域/防盗链）都不应让生成流程失败，回退到可显示的原图 URL 或代理
      return hosted ? '/game-art-studio/api/proxy-image?url='+encodeURIComponent(url) : url
    }finally{
      if(timer) clearTimeout(timer)
    }
  }
  // 自动释放 blob URL：图片 / 导出 blob 这种"用完即弃"的 URL 走这个，能避免长时间使用累积内存
  // 默认 60s 后释放（足够 <img> / <a>.click() 下载完成；过期后即使被引用也是空，对 UI 无影响）
  function revokeSoon(url:string, ms=60000){
    if(!url || !/^blob:/i.test(url)) return
    setTimeout(()=>{ try{ URL.revokeObjectURL(url) }catch{} }, ms)
  }
  // 通用"用 blob URL 触发下载"工具：内部用 revokeSoon 自动回收，不再依赖散落的 setTimeout
  function downloadBlob(blob:Blob, filename:string){
    const u=URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=u; a.download=filename; a.click()
    revokeSoon(u, 5000) // 5s 后释放，浏览器已下载到本地
  }

  function dataUrlToBlob(dataUrl:string): Blob {
    const parts=dataUrl.split(',')
    const mime=parts[0].match(/:(.*?);/)?.[1]||'image/png'
    const b64=parts[1]||''
    const bin=atob(b64)
    const arr=new Uint8Array(bin.length)
    for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i)
    return new Blob([arr],{type:mime})
  }

  function resolveEditsEndpoint(url:string): string {
    const u=url.replace(/\/images\/generations$/i, '/images/edits').replace(/\/generations$/i, '/edits')
    return u
  }

  async function callImageEdits(prompt:string, endpoint:string, key:string, opts:any): Promise<string> {
    const fd=new FormData()
    fd.append('image', dataUrlToBlob(opts.reference), 'reference.png')
    fd.append('prompt', prompt)
    if(opts.model) fd.append('model', opts.model)
    fd.append('n','1')
    fd.append('size', opts.size||'1024x1024')
    fd.append('response_format','b64_json')   // 图生图也优先要 base64，摆脱跨域远程 URL
    let r=await fetch(endpoint,{ method:'POST', headers:{ 'Authorization':'Bearer '+key }, body:fd })
    if(r.status===400||r.status===422){ fd.delete('response_format'); r=await fetch(endpoint,{ method:'POST', headers:{ 'Authorization':'Bearer '+key }, body:fd }) }
    if(!r.ok) throw new Error('Edits '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
    const j=await r.json()
    const url=j.data?.[0]?.url || (j.data?.[0]?.b64_json && ('data:image/png;base64,'+j.data[0].b64_json)) || j.images?.[0]?.url || j.output?.[0]?.url
    if(!url) throw new Error('Edits 未返回图片 URL')
    return await toLocalBlobUrl(url)
  }

  // 文本生成（对话/LLM）
  async function callTextGen(prompt:string, provider:string, opts:any={}): Promise<string> {
    const keys=getKeys()
    const model=opts.model||'gpt-4o'
    
    // 本地演示
    if(provider==='mock'){
      await new Promise(r=>setTimeout(r,500))
      return JSON.stringify({title:'演示场景',shots:[
        {speaker:'旁白',speaker_color:'#9aa0a6',text:'夜幕降临，烛火在风中摇曳...',image_prompt:'candlelit castle at night, dark fantasy',darken_bg:0.4},
        {speaker:'守卫',speaker_color:'#e8a33d',text:'站住！什么人？',image_prompt:'knight with torch in dark castle corridor',darken_bg:0.3}
      ]})
    }
    
    // 自定义第三方
    if(provider.startsWith('custom:')){
      const id=provider.slice(7)
      const preset=getCustomProviders().find(p=>p.id===id)
      if(!preset) throw new Error('自定义预设不存在')
      const base=preset.baseUrl.replace(/[/\\]+$/,'') // 移除末尾斜杠
      const endpoint=base+'/chat/completions'
      const body={model:model||'gpt-4o',messages:[{role:'user',content:prompt}],max_tokens:2000}
      const acS=typeof AbortController!=='undefined'?new AbortController():null
      const tS=acS?setTimeout(()=>acS.abort(),60000):null
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+preset.apiKey},body:JSON.stringify(body),signal:acS?.signal})
        if(!r.ok) throw new Error('第三方错误 '+r.status)
        const j=await r.json()
        return j.choices?.[0]?.message?.content||''
      }finally{ if(tS)clearTimeout(tS) }
    }
    
    // OpenAI
    if(!keys[provider]) throw new Error('未配置 '+provider+' 的 API Key')
    const body={model, messages:[{role:'user',content:prompt}], max_tokens:2000}
    const acS=typeof AbortController!=='undefined'?new AbortController():null
    const tS=acS?setTimeout(()=>acS.abort(),60000):null
    try{
      let r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+keys[provider]},body:JSON.stringify(body),signal:acS?.signal})
      if(!r.ok){
        if(r.status===401) throw new Error('API Key 无效')
        throw new Error('API 错误 '+r.status)
      }
      const j=await r.json()
      return j.choices?.[0]?.message?.content||''
    }finally{ if(tS)clearTimeout(tS) }
  }

  async function callImageGen(prompt:string, provider:string, opts:any={}): Promise<string> {
    const keys=getKeys()
    const ref=opts.reference
    // 免费网页版入口：不调 API，打开对应官方网页版；有联动服务时把提示词送达浏览器扩展自动填入
    if(provider.startsWith('web:')){
      openWebPanel(provider.slice(4), prompt)
      return mockImage(prompt+' [已打开 '+provider.slice(4)+' 网页版]', opts)
    }
    // 本地 mock：用 canvas 生成占位图，保证无 Key 也能演示
    if(provider==='mock') return mockImage(prompt, opts)

    // 自定义第三方 API 路由预设
    if(provider.startsWith('custom:')){
      const id=provider.slice(7)
      const preset=getCustomProviders().find(p=>p.id===id)
      if(!preset) throw new Error('自定义预设不存在，请到「API 预设」重新配置')
      if(!preset.baseUrl) throw new Error('第三方预设「'+preset.name+'」缺少 Base URL')
      if(!preset.apiKey) throw new Error('第三方预设「'+preset.name+'」缺少 API Key')
      const base=preset.baseUrl.replace(/\/+$/,'')
      const endpoint=resolveCustomEndpoint(base, preset.type)
      const label=preset.name||'第三方'
      if(preset.type==='stability'){
        const fd=new FormData(); fd.append('prompt', prompt); fd.append('output_format','png')
        if(preset.model) fd.append('model', preset.model)
        if(ref) fd.append('image', dataUrlToBlob(ref), 'reference.png')
        const r=await fetch(endpoint,{ method:'POST', headers:{ 'Authorization':'Bearer '+preset.apiKey, 'Accept':'image/*' }, body:fd })
        if(!r.ok) throw new Error('第三方('+label+') '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
        const blob=await r.blob(); const u=URL.createObjectURL(blob); revokeSoon(u); return u
      }
      // OpenAI 兼容 / SiliconFlow 风格
      if(ref){
        return await callImageEdits(prompt, resolveEditsEndpoint(endpoint), preset.apiKey, { ...opts, model: opts.model || preset.model || (preset.models?.[0]||'') || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3') })
      }
      const body:any={ prompt, n:1, size: opts.size||'1024x1024' }
      body.model=opts.model || preset.model || (preset.models?.[0]||'') || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3')
      if(preset.type==='siliconflow') body.image_size=opts.size||'1024x1024'
      // 优先要 base64：图片直接本地化，file:// 直开也能切片/下载，摆脱跨域图片 URL 限制
      body.response_format='b64_json'
      // 生图接口处理可能很慢（尤其大图），给请求加 180s 超时避免无限转圈
      const acS = typeof AbortController!=='undefined' ? new AbortController() : null
      const tS = acS ? setTimeout(()=>acS.abort(), 180000) : null
      try{
        let r=await fetch(endpoint,{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+preset.apiKey }, body:JSON.stringify(body), signal: acS?.signal })
        if(r.status===400||r.status===422){ delete body.response_format; r=await fetch(endpoint,{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+preset.apiKey }, body:JSON.stringify(body), signal: acS?.signal }) }
        if(!r.ok) throw new Error('第三方('+label+') '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
        const j=await r.json()
        const url=j.data?.[0]?.url || (j.data?.[0]?.b64_json && ('data:image/png;base64,'+j.data[0].b64_json)) || j.images?.[0]?.url || j.output?.[0]?.url
        if(!url) throw new Error('第三方('+label+') 未返回图片 URL')
        return await toLocalBlobUrl(url)
      }finally{
        if(tS) clearTimeout(tS)
      }
    }

    // 内置供应商
    if(!keys[provider]){ throw new Error('未配置 '+provider+' 的 API Key，请到右侧保存或切到“本地演示”') }
    if(provider==='openai'){
      const key=keys.openai
      if(ref){ return await callImageEdits(prompt, 'https://api.openai.com/v1/images/edits', key, { ...opts, model:'dall-e-3' }) }
      const body:any={ model:'dall-e-3', prompt, n:1, size: opts.size||'1024x1024', quality:'standard', response_format:'b64_json' }
      let r=await fetch('https://api.openai.com/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify(body) })
      if(r.status===400||r.status===422){ delete body.response_format; r=await fetch('https://api.openai.com/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify(body) }) }
      if(!r.ok) throw new Error('OpenAI '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const j=await r.json(); const b64=j.data?.[0]?.b64_json; const url=j.data?.[0]?.url || (b64 ? ('data:image/png;base64,'+b64) : null)
      if(!url) throw new Error('OpenAI 未返回图片')
      return await toLocalBlobUrl(url)
    }
    if(provider==='stability'){
      const key=keys.stability
      const fd=new FormData(); fd.append('prompt', prompt); fd.append('output_format','png')
      if(ref) fd.append('image', dataUrlToBlob(ref), 'reference.png')
      const r=await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3',{ method:'POST', headers:{ 'Authorization':'Bearer '+key, 'Accept':'image/*' }, body:fd })
      if(!r.ok) throw new Error('Stability '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const blob=await r.blob(); const u=URL.createObjectURL(blob); revokeSoon(u); return u
    }
    if(provider==='siliconflow'){
      const key=keys.siliconflow
      if(ref){ return await callImageEdits(prompt, 'https://api.siliconflow.cn/v1/images/edits', key, { ...opts, model:'black-forest-labs/FLUX.1-schnell' }) }
      const r=await fetch('https://api.siliconflow.cn/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify({ model:'black-forest-labs/FLUX.1-schnell', prompt, image_size:opts.size||'1024x1024' }) })
      if(!r.ok) throw new Error('SiliconFlow '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const j=await r.json(); const url=j.data?.[0]?.url || j.images?.[0]?.url
      if(!url) throw new Error('SiliconFlow 未返回图片')
      return await toLocalBlobUrl(url)
    }
    return mockImage(prompt, opts)
  }

function mockImage(prompt:string, opts:any): string {
    opts=opts||{}
    const c=document.createElement('canvas'); c.width=512; c.height=512; const g=c.getContext('2d')!
    if(opts.bgTrans){
      // 透明背景：先清空，再画淡棋盘格示意透明
      g.clearRect(0,0,512,512)
      g.fillStyle='rgba(160,160,160,0.10)'
    }else{
      const styleMap:Record<string,string>={ pixel32:'#2b2e33', pixel16:'#1e2224', chibi:'#fef9e7', anime:'#e8f8f5', icon:'#f4f6f7' }
      g.fillStyle=opts.bg||styleMap[opts.style]||'#2b2e33'; g.fillRect(0,0,512,512)
      g.fillStyle='rgba(255,255,255,0.04)'
    }
    // 棋盘格
    for(let y=0;y<512;y+=32) for(let x=0;x<512;x+=32) if((x+y)%64===0) g.fillRect(x,y,32,32)
    // 主体：简易角色占位
    g.fillStyle='#478cbf'; g.beginPath(); g.arc(256,220,70,0,Math.PI*2); g.fill()
    g.fillStyle='#e67e22'; g.fillRect(226,290,60,90)
    g.fillStyle='#2ecc71'; g.fillRect(196,380,120,12)
    // 文字
    g.fillStyle='white'; g.font='bold 18px monospace'; g.textAlign='center'; g.fillText(prompt.slice(0,28)||'MOCK',256,480)
    g.fillStyle='rgba(255,255,255,0.6)'; g.font='11px monospace'; g.fillText((opts.view||'')+' · '+ (opts.style||'')+' · 本地演示',256,500)
    return c.toDataURL('image/png')
  }

  // ---- Physics preset + AutoTile ----
  ;(()=>{
    const typeEl=pPreset.querySelector('#phys-type') as HTMLSelectElement
    const nameEl=pPreset.querySelector('#phys-name') as HTMLInputElement
    const shapeEl=pPreset.querySelector('#phys-shape') as HTMLSelectElement
    const layerEl=pPreset.querySelector('#phys-layer') as HTMLInputElement
    const maskEl=pPreset.querySelector('#phys-mask') as HTMLInputElement
    const massEl=pPreset.querySelector('#phys-mass') as HTMLInputElement
    const vxEl=pPreset.querySelector('#phys-vx') as HTMLInputElement
    const vyEl=pPreset.querySelector('#phys-vy') as HTMLInputElement
    const gravEl=pPreset.querySelector('#phys-gravity') as HTMLInputElement

    function buildPhysicsTSCN(): string {
      const type=typeEl.value, name=nameEl.value||'Player', shape=shapeEl.value
      const layer=parseInt(layerEl.value)||1, mask=parseInt(maskEl.value)||1
      const mass=parseFloat(massEl.value)||1.0
      const grav=parseFloat(gravEl.value)||1.0
      const safe=name.replace(/[^a-zA-Z0-9_]/g,'_')
      const shapes:Record<string,string>={ capsule:'CapsuleShape2D', circle:'CircleShape2D', rect:'RectangleShape2D', convex:'ConvexPolygonShape2D' }
      const shapeType=shapes[shape]||shapes.rect
      const lines:string[]=[
        '[gd_scene load_steps=2 format=3]',
        '',
        '[sub_resource type="'+shapeType+'" id="'+shapeType+'_1"]',
      ]
      if(shape==='capsule') lines.push('radius = 16.0\nheight = 32.0')
      else if(shape==='circle') lines.push('radius = 16.0')
      else if(shape==='rect') lines.push('size = Vector2(32, 32)')
      else if(shape==='convex') lines.push('points = PackedVector2Array(Vector2(-16, -16), Vector2(16, -16), Vector2(16, 16), Vector2(-16, 16))')
      // 子资源必须先于节点声明；节点类型从下拉文案提取（如 “CharacterBody2D (角色)”）
      const nodeType=typeEl.options[typeEl.selectedIndex].text.replace(/.*\(/,'').replace(/\)/g,'').trim()
      lines.push('')
      lines.push('[node name="'+safe+'" type="'+nodeType+'"]')
      if(type==='rigid'){ lines.push('mass = '+mass); lines.push('gravity_scale = '+grav) }
      lines.push('collision_layer = '+layer)
      lines.push('collision_mask = '+mask)
      lines.push('')
      lines.push('[node name="Collision" type="CollisionShape2D" parent="."]')
      lines.push('shape = SubResource("'+shapeType+'_1")')
      return lines.join('\n')
    }
    function buildPhysicsGD(): string {
      const type=typeEl.value
      if(type==='char'){
        return [
          'extends CharacterBody2D',
          '',
          'const SPEED := 150.0',
          'const RUN_SPEED := 300.0',
          '',
          'func _physics_process(delta: float) -> void:',
          '\tvar dir := Input.get_axis("ui_left", "ui_right")',
          '\tvar speed := RUN_SPEED if Input.is_action_pressed("ui_accept") else SPEED',
          '\tif dir != 0.0:',
          '\t\tvelocity.x = dir * speed',
          '\telse:',
          '\t\tvelocity.x = move_toward(velocity.x, 0.0, SPEED)',
          '\tvelocity.y += ProjectSettings.get_setting("physics/2d/default_gravity", 980.0) * delta',
          '\tmove_and_slide()',
          '',
        ].join('\n')
      }
      if(type==='rigid') return 'extends RigidBody2D\n'
      return 'extends StaticBody2D\n'
    }
    pPreset.querySelector('#phys-export')!.addEventListener('click',()=>{
      const tcn=buildPhysicsTSCN()
      const blob=new Blob([tcn],{type:'text/plain'})
      downloadBlob(blob, 'physics_'+Date.now()+'.tscn')
      toast(pPreset.querySelector('#keys-status') as HTMLElement,'物理场景已导出 .tscn', true)
    })
    pPreset.querySelector('#phys-export-gd')!.addEventListener('click',()=>{
      const gd=buildPhysicsGD()
      downloadBlob(new Blob([gd],{type:'text/plain'}), 'physics_body.gd')
      toast(pPreset.querySelector('#keys-status') as HTMLElement,'Godot 脚本已导出 .gd', true)
    })
  })()

  // ---- AutoTile bitmask recognizer ----
  ;(()=>{
    const drop=pPreset.querySelector('#at-drop') as HTMLElement
    const fileInput=pPreset.querySelector('#at-file') as HTMLInputElement
    const runBtn=pPreset.querySelector('#at-run') as HTMLButtonElement
    const exportBtn=pPreset.querySelector('#at-export') as HTMLButtonElement
    const status=pPreset.querySelector('#at-status') as HTMLElement
    const preview=pPreset.querySelector('#at-preview') as HTMLElement
    const info=pPreset.querySelector('#at-info') as HTMLElement
    let loadedTile:HTMLImageElement|null=null
    let analyzed=false

    drop.addEventListener('click',()=>fileInput.click())
    drop.addEventListener('dragover',(e:any)=>{ e.preventDefault(); drop.style.borderColor='var(--accent)' })
    drop.addEventListener('dragleave',()=>{ drop.style.borderColor='' })
    drop.addEventListener('drop',(e:any)=>{ e.preventDefault(); drop.style.borderColor=''; const f=e.dataTransfer?.files?.[0]; if(f) loadTileFile(f) })
    fileInput.addEventListener('change',()=>{ const f=fileInput.files?.[0]; if(f) loadTileFile(f) })

    function loadTileFile(f:File){
      const reader=new FileReader()
      reader.onload=()=>{ const img=new Image(); img.onload=()=>{ loadedTile=img; analyzed=false; preview.innerHTML=''; const mk=document.createElement('canvas'); mk.width=img.naturalWidth; mk.height=img.naturalHeight; const g=mk.getContext('2d')!; g.drawImage(img,0,0); preview.innerHTML=''; preview.appendChild(mk); mk.style.maxWidth='100%'; mk.style.imageRendering='pixelated'; status.textContent='已加载 '+img.naturalWidth+'×'+img.naturalHeight; status.style.color='var(--ok)'; exportBtn.disabled=true; info.textContent='' }; img.src=reader.result as string }
      reader.readAsDataURL(f)
    }

    function analyzeBitmask(): string {
      if(!loadedTile) return ''
      const w=loadedTile.naturalWidth, h=loadedTile.naturalHeight
      const c=document.createElement('canvas'); c.width=w; c.height=h
      const g=c.getContext('2d')!; g.drawImage(loadedTile,0,0)
      const data=g.getImageData(0,0,w,h).data
      // 瓦片尺寸：优先尝试能整除图集的常见尺寸，取最大者；否则退化为 min(w,h)
      const common=[8,16,24,32,48,64]
      let tileSize=Math.min(w,h)
      for(const t of common){ if(t<=Math.min(w,h) && w%t===0 && h%t===0){ tileSize=t } }
      const cols=Math.round(w/tileSize), rows=Math.round(h/tileSize)
      const getAlpha=(tx:number,ty:number):boolean=>{
        if(tx<0||ty<0||tx>=cols||ty>=rows) return false // 图集外视为空
        const sx=Math.min(tx*tileSize,w-1), sy=Math.min(ty*tileSize,h-1)
        return data[(sy*w+sx)*4+3]>10   // 取每格左上角像素 alpha（索引必须乘以整行宽度 w）
      }
      // Godot 4 peering-bit 语义：8 个方向各自独立判定（N/NE/E/SE/S/SW/W/NW）
      function tileMask(tx:number,ty:number):number{
        let m=0
        const n=(dx:number,dy:number)=>getAlpha(tx+dx,ty+dy)
        if(n(0,-1))m|=1; if(n(1,-1))m|=2; if(n(1,0))m|=4; if(n(1,1))m|=8
        if(n(0,1))m|=16; if(n(-1,1))m|=32; if(n(-1,0))m|=64; if(n(-1,-1))m|=128
        return m
      }
      const bitmaskNames:Record<string,string>={}
      let bitsSummary='已识别 '+cols+'×'+rows+' 瓦片(格 '+tileSize+'px)，bitmask 分布:\n'
      const seen=new Map<number,number>()
      for(let ty=0;ty<rows;ty++) for(let tx=0;tx<cols;tx++){ const m=tileMask(tx,ty); seen.set(m,(seen.get(m)||0)+1); bitmaskNames[m]=(bitmaskNames[m]||'')+'('+tx+','+ty+')' }
      for(const [m,count] of seen){ bitsSummary+='Bitmask '+(m>>>0)+': '+count+'个 '+bitmaskNames[m]+'\n' }
      return bitsSummary+'\n注: 位掩码仅基于每格透明度判断；地形(Terrain)匹配需在 Godot 中为地形集手动绘制或结合此 JSON 调整。'
    }

    runBtn.addEventListener('click',()=>{
      if(!loadedTile){ status.textContent='请先上传瓦片图'; status.style.color='var(--err)'; return }
      const result=analyzeBitmask()
      status.textContent='分析完成'; status.style.color='var(--ok)'
      info.textContent=result.split('\n').slice(0,4).join('\n')
      exportBtn.disabled=false; analyzed=true
    })

    exportBtn.addEventListener('click',()=>{
      if(!loadedTile) return
      const w=loadedTile.naturalWidth, h=loadedTile.naturalHeight
      const common=[8,16,24,32,48,64]
      let tileSize=Math.min(w,h)
      for(const t of common){ if(t<=Math.min(w,h) && w%t===0 && h%t===0){ tileSize=t } }
      const cols=Math.round(w/tileSize), rows=Math.round(h/tileSize)
      const safeName='AutoTile_'+Date.now()
      // 导出可用图集 TileSet：注册全部瓦片（c:r/0），地形位由用户在编辑器里结合 JSON 分析手动指定
      const L:string[]=[
        '[gd_resource type="TileSet" load_steps=3 format=3]',
        '',
        '[ext_resource type="Texture2D" path="res://tiles/autotile.png" id="1_autotile"]',
        '',
        '[sub_resource type="TileSetAtlasSource" id="TileSetAtlasSource_1"]',
        'texture = ExtResource("1_autotile")',
        'texture_region_size = Vector2i('+tileSize+', '+tileSize+')',
      ]
      for(let r2=0;r2<rows;r2++) for(let c2=0;c2<cols;c2++) L.push(c2+':'+r2+'/0 = '+(r2*cols+c2))
      L.push('')
      L.push('[resource]')
      L.push('tile_size = Vector2i('+tileSize+', '+tileSize+')')
      L.push('sources/0 = SubResource("TileSetAtlasSource_1")')
      downloadBlob(new Blob([L.join('\n')],{type:'text/plain'}), safeName+'.tres')
      // 同步导出逐格 bitmask 分析结果（可在 Godot 中据此绘制 terrain）
      const maskJson={ tile_size:tileSize, columns:cols, rows:rows, note:'terrain matching 需在 Godot 编辑器中手动指定', cells:[] as any[] }
      {
        const cvs=document.createElement('canvas'); cvs.width=w; cvs.height=h; const g2=cvs.getContext('2d')!; g2.drawImage(loadedTile,0,0); const px=g2.getImageData(0,0,w,h).data
        const a=(tx:number,ty:number)=> (tx>=0&&ty>=0&&tx<cols&&ty<rows) ? px[(ty*tileSize*w+tx*tileSize)*4+3]>10 : false
        for(let ty=0;ty<rows;ty++) for(let tx=0;tx<cols;tx++){
          let m=0; const n=(dx:number,dy:number)=>a(tx+dx,ty+dy)
          if(n(0,-1))m|=1; if(n(1,-1))m|=2; if(n(1,0))m|=4; if(n(1,1))m|=8
          if(n(0,1))m|=16; if(n(-1,1))m|=32; if(n(-1,0))m|=64; if(n(-1,-1))m|=128
          maskJson.cells.push({ cell:[tx,ty], mask:m>>>0 })
        }
      }
      setTimeout(()=>downloadBlob(new Blob([JSON.stringify(maskJson,null,2)],{type:'application/json'}), safeName+'_bitmask.json'),300)
      downloadUrl(loadedTile.src, safeName+'_source.png')
      status.textContent='已导出 TileSet.tres(含全部图集瓦片) + _bitmask.json 分析 + 源图 PNG —— 地形匹配请在 Godot 中按 JSON 绘制'; status.style.color='var(--ok)'
    })
  })()

  // ---- Character logic ----
  ;(()=>{
    const promptEl= pChar.querySelector('#c-prompt') as HTMLTextAreaElement
    const styleEl= pChar.querySelector('#c-style') as HTMLSelectElement
    const viewEl= pChar.querySelector('#c-view') as HTMLSelectElement
    const provEl= pChar.querySelector('#c-provider') as HTMLSelectElement
    const prog= pChar.querySelector('#c-prog') as HTMLElement
    const status= pChar.querySelector('#c-status') as HTMLElement
    const preview= pChar.querySelector('#c-preview') as HTMLElement
    const refPreview= pChar.querySelector('#c-ref-preview') as HTMLElement
    const gallery= pChar.querySelector('#c-gallery') as HTMLElement
    let lastUrl=''
    let refUrl=''
    const setProg=(p:number)=> prog.style.width=p+'%'

    async function gen(){
      const prompt=promptEl.value.trim(); if(!prompt) return toast(status,'请先输入角色描述',false)
      const style=styleEl.value, view=viewEl.value, prov=provEl.value
      const bg=(pChar.querySelector('#c-bg') as HTMLInputElement)?.value||'#ffffff'
      const bgTrans=(pChar.querySelector('#c-bg-trans') as HTMLInputElement)?.checked===true
      const bgSuffix= bgTrans ? ', transparent background, PNG, no background' : ', solid '+bg+' background'
      const styleSuffix= style==='free' ? '' : (style.startsWith('pixel')?' , pixel art, '+style:' , '+style)
      const fullPrompt = view==='tri' ? prompt+' , three views front side back, character sheet'+bgSuffix : view==='dir8' ? prompt+' , 8 directional sprites'+bgSuffix : prompt + styleSuffix + bgSuffix
      setProg(20); status.textContent='生成中… ('+prov+')'; (pChar.querySelector('#c-gen') as HTMLButtonElement).disabled=true
      try{
        const url=await callImageGen(fullPrompt, prov, { style, view, size:'1024x1024', bg, bgTrans, model: (pChar.querySelector('#c-model-sel') as HTMLSelectElement)?.value||undefined, reference: refUrl || undefined })
        lastUrl=url; setProg(100)
        preview.innerHTML=''; const img=document.createElement('img'); img.src=url; img.style.maxWidth='100%'; img.style.maxHeight='180px'; img.style.imageRendering='pixelated'; preview.appendChild(img)
        const card=document.createElement('div'); card.className='gas-thumb'; card.innerHTML='<img src="'+url+'"><div class="meta"><span>'+style+'</span><span>'+view+'</span></div>'
        card.onclick=()=>{ preview.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; preview.appendChild(im); lastUrl=url }
        gallery.prepend(card)
        pushHistory({ kind:'character', prompt, url, style, view })
        toast(status,'生成完成，已收录到导出清单')
      }catch(e:any){ toast(status,String(e.message||e),false); setProg(0) }
      finally{ (pChar.querySelector('#c-gen') as HTMLButtonElement).disabled=false; setTimeout(()=>setProg(0),1200) }
    }
    pChar.querySelector('#c-gen')!.addEventListener('click', gen)
    pChar.querySelector('#c-rand')!.addEventListener('click', ()=>{ const samples=['像素风 32px 勇者 红围巾 金色短发 Q版','赛博格少女 蓝色机甲 霓虹光','像素史莱姆 王冠 表情三态','中世纪法师 紫袍 法杖 8bit']; promptEl.value=samples[Math.floor(Math.random()*samples.length)]; })
    pChar.querySelector('#c-upload')!.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=refUrl; img.style.maxWidth='100%'; img.style.maxHeight='90px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); const del=document.createElement('button'); del.type='button'; del.textContent='✕ 删除'; del.style.cssText='margin-top:4px;font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#2c313d;color:#e74c3c;cursor:pointer;display:block'; del.onclick=(e:any)=>{ e.stopPropagation(); refUrl=''; refPreview.innerHTML='<span class="gas-note">未添加</span>'; toast(status,'参考图已删除') }; refPreview.appendChild(del); toast(status,'参考图已添加 ✓ 生成时会作为图生图参考') }
      reader.readAsDataURL(f)
    })
    pChar.querySelector('#c-dl')!.addEventListener('click', ()=>{ if(!lastUrl) return toast(status,'无图片',false); void downloadUrl(lastUrl,'character_'+Date.now()+'.png') })
    pChar.querySelector('#c-save')!.addEventListener('click', async()=>{ if(!lastUrl) return toast(status,'请先生成角色',false); const id=await addToLibrary('character','角色 '+new Date().toLocaleTimeString(),lastUrl); toast(status,'已入库 '+id) })
    pChar.querySelector('#c-to-sheet')!.addEventListener('click', async ()=>{
      if(!lastUrl) return toast(status,'先生成角色',false)
      switchTab('sheet')
      const sFileInput = pSheet.querySelector('#s-file') as HTMLInputElement
      try{
        const r=await fetch(lastUrl)
        if(!r.ok) throw new Error('图片下载失败 HTTP '+r.status)
        const blob=await r.blob()
        const file=new File([blob],'character.png',{type: blob.type||'image/png'})
        const dt=new DataTransfer(); dt.items.add(file); sFileInput.files=dt.files
        sFileInput.dispatchEvent(new Event('change',{bubbles:true}))
        toast(status,'已送至序列帧：可调整行列后点「切片」', true)
      }catch(e:any){
        toast(status,'送至序列帧失败：'+String(e.message||e).slice(0,80), false)
      }
    })
    // 🎮 导出角色场景：生成 Godot CharacterBody2D + SpriteFrames + 动画脚本
    pChar.querySelector('#c-export-scene')!.addEventListener('click', async ()=>{
      if(!lastUrl){ toast(status,'请先生成角色',false); return }
      const view=(pChar.querySelector('#c-view') as HTMLSelectElement)?.value||'single'
      const godotScript=['extends CharacterBody2D','','# 使用说明：给 Sprite2D 指定角色精灵表纹理并设置 hframes（列数），场景即可播放 idle/walk','const SPEED := 150.0','const RUN_SPEED := 300.0','','@onready var sprite: Sprite2D = $Sprite2D','@onready var anim: AnimationPlayer = $AnimationPlayer','','func _ready() -> void:','\tanim.play("idle")','','func _physics_process(delta: float) -> void:','\tvar dir := Input.get_axis("ui_left", "ui_right")','\tvar speed := RUN_SPEED if Input.is_action_pressed("ui_accept") else SPEED','\tif dir != 0.0:','\t\tvelocity.x = dir * speed','\t\tsprite.flip_h = dir < 0','\t\tif anim.current_animation != "walk": anim.play("walk")','\telse:','\t\tvelocity.x = move_toward(velocity.x, 0.0, SPEED)','\t\tif anim.current_animation != "idle": anim.play("idle")','\tvelocity.y += ProjectSettings.get_setting("physics/2d/default_gravity", 980.0) * delta','\tmove_and_slide()',''].join('\n')
      // Godot 4 结构：Animation 挂入 AnimationLibrary，再经 node 的 libraries 属性装载；sub_resource 必须先于 node 声明
      const tcn=['[gd_scene load_steps=5 format=3]','',
        '[ext_resource type="Script" path="res://characters/player.gd" id="1_player"]','',
        '[sub_resource type="Animation" id="Animation_idle"]',
        'resource_name = "idle"',
        'length = 0.4',
        'loop_mode = 1',
        'tracks/0/type = "value"',
        'tracks/0/imported = false',
        'tracks/0/enabled = true',
        'tracks/0/path = NodePath("Sprite2D:frame")',
        'tracks/0/interp = 1',
        'tracks/0/loop_wrap = true',
        'tracks/0/keys = {',
        '"times": PackedFloat32Array(0, 0.2),',
        '"transitions": PackedFloat32Array(1, 1),',
        '"update": 1,',
        '"values": [0, 0]',
        '}',
        '',
        '[sub_resource type="Animation" id="Animation_walk"]',
        'resource_name = "walk"',
        'length = 0.2',
        'loop_mode = 1',
        'tracks/0/type = "value"',
        'tracks/0/imported = false',
        'tracks/0/enabled = true',
        'tracks/0/path = NodePath("Sprite2D:frame")',
        'tracks/0/interp = 1',
        'tracks/0/loop_wrap = true',
        'tracks/0/keys = {',
        '"times": PackedFloat32Array(0, 0.1),',
        '"transitions": PackedFloat32Array(1, 1),',
        '"update": 1,',
        '"values": [0, 1]',
        '}',
        '',
        '[sub_resource type="AnimationLibrary" id="AnimationLibrary_1"]',
        '_data = {',
        '&"idle": SubResource("Animation_idle"),',
        '&"walk": SubResource("Animation_walk")',
        '}',
        '',
        '[node name="Player" type="CharacterBody2D"]',
        'script = ExtResource("1_player")',
        '',
        '[node name="Sprite2D" type="Sprite2D" parent="."]',
        'position = Vector2(0, -16)',
        'hframes = 2',
        '',
        '[node name="AnimationPlayer" type="AnimationPlayer" parent="."]',
        'libraries = {',
        '&"": SubResource("AnimationLibrary_1")',
        '}',
        ''].join('\n')
      const gdBlob=new Blob([godotScript],{type:'text/plain'})
      downloadBlob(new Blob([tcn],{type:'text/plain'}),'player_scene.tscn')
      setTimeout(()=>downloadBlob(gdBlob,'player.gd'),300)
      toast(status,'已导出角色场景 player_scene.tscn + player.gd（'+view+'，idle/walk 两帧动画骨架）— 请给 Sprite2D 设置精灵表纹理与 hframes 后运行',true)
    })
    // ⚡ 一键流水线：角色 → 序列帧 → 切片 → 打包 → 导出 SpriteFrames（一次跑完）
    pChar.querySelector('#c-to-sheet-auto')!.addEventListener('click', async ()=>{
      const btn=pChar.querySelector('#c-to-sheet-auto') as HTMLButtonElement
      if(btn.disabled) return
      btn.disabled=true; btn.textContent='⏳ 流水线进行中…'
      const sStatus=pSheet.querySelector('#s-status') as HTMLElement
      try{
        // 1. 确保有角色图
        if(!lastUrl){
          toast(status,'正在生成角色…')
          const prompt=(pChar.querySelector('#c-prompt') as HTMLTextAreaElement).value.trim()
          if(!prompt){ throw new Error('请先填写角色描述') }
          const style=(pChar.querySelector('#c-style') as HTMLSelectElement).value
          const view=(pChar.querySelector('#c-view') as HTMLSelectElement).value
          const bg=(pChar.querySelector('#c-bg') as HTMLInputElement)?.value||'#ffffff'
          const bgTrans=(pChar.querySelector('#c-bg-trans') as HTMLInputElement)?.checked===true
          const prov=(pChar.querySelector('#c-provider') as HTMLSelectElement)?.value||'mock'
          lastUrl=await callImageGen(prompt, prov as any, { style, view, bg, bgTrans, model:(pChar.querySelector('#c-model-sel') as HTMLSelectElement)?.value||undefined, reference: refUrl||undefined })
        }
        // 2. 送入序列帧
        switchTab('sheet')
        const sFileInput=pSheet.querySelector('#s-file') as HTMLInputElement
        const r=await fetch(lastUrl); if(!r.ok) throw new Error('图片下载失败 HTTP '+r.status)
        const blob=await r.blob()
        const file=new File([blob],'character.png',{type:blob.type||'image/png'})
        const dt=new DataTransfer(); dt.items.add(file); sFileInput.files=dt.files
        sFileInput.dispatchEvent(new Event('change',{bubbles:true}))
        // 3. 等待切片完成（帧缩略图出现）
        if(sStatus) sStatus.textContent='⏳ 正在切片…'
        await waitUntil(()=> (pSheet.querySelector('#s-frames') as HTMLElement).children.length>0, 20000)
        // 4. 打包
        if(sStatus) sStatus.textContent='⏳ 正在打包…'
        ;(pSheet.querySelector('#s-pack') as HTMLButtonElement).click()
        await new Promise(r=>setTimeout(r,300))
        // 5. 导出
        if(sStatus) sStatus.textContent='⏳ 正在导出…'
        ;(pSheet.querySelector('#s-export') as HTMLButtonElement).click()
        if(sStatus) sStatus.textContent='✓ 流水线完成：已切片→打包→导出 SpriteFrames'
        toast(sStatus,'✓ 一键流水线完成', true)
      }catch(e:any){
        toast(sStatus||status,'流水线失败：'+String(e.message||e).slice(0,80), false)
      }finally{
        btn.disabled=false; btn.textContent='⚡ 一键流水线'
      }
    })
  })()

  // ---- Sheet logic ----
  ;(()=>{
    const fileInput= pSheet.querySelector('#s-file') as HTMLInputElement
    const drop= pSheet.querySelector('#s-drop') as HTMLElement
    const colsEl= pSheet.querySelector('#s-cols') as HTMLInputElement
    const rowsEl= pSheet.querySelector('#s-rows') as HTMLInputElement
    const fpsEl= pSheet.querySelector('#s-fps') as HTMLInputElement
    const canvas= pSheet.querySelector('#s-canvas') as HTMLCanvasElement
    const ctx2= canvas.getContext('2d')!
    const framesEl= pSheet.querySelector('#s-frames') as HTMLElement
    const status= pSheet.querySelector('#s-status') as HTMLElement
    const promptEl= pSheet.querySelector('#s-prompt') as HTMLTextAreaElement
    let frames: HTMLCanvasElement[]=[]; let animId=0; let packCanvas: HTMLCanvasElement|null=null
    let sheetRefUrl=''
    // 逐帧微调裁剪：帧来源信息 + 每帧四边额外裁剪量
    let srcInfo:any=null
    let frameOffs:{t:number;b:number;l:number;r:number}[]=[]
    let selF=-1
    const sRefInput=pSheet.querySelector('#s-ref') as HTMLInputElement
    const sRefPreview=pSheet.querySelector('#s-ref-preview') as HTMLElement

    function loadImage(src:string):Promise<HTMLImageElement>{
      return new Promise((res,rej)=>{
        const tryLoad=(cors:boolean)=>{
          const im=new Image()
          if(/^https?:/i.test(src)) im.crossOrigin=cors?'anonymous':''
          im.onload=()=>res(im)
          im.onerror=()=>{ if(cors){ tryLoad(false) } else rej(new Error('图片加载失败（跨域被拦截，建议用 node server.mjs 本地服务打开）')) }
          im.src=src
        }
        tryLoad(true)
      })
    }

    // 智能网格检测(三层递进):①透明缝 ②亮度差分边界(紧贴网格) ③投影自相关周期(带留白)
    function detectGrid(img:HTMLImageElement):{cols:number;rows:number;conf:number;how:string}{
      const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height
      const manualC=parseInt(colsEl.value)||1, manualR=parseInt(rowsEl.value)||1
      if(w<8||h<8) return { cols:manualC, rows:manualR, conf:0, how:'' }
      const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d')!; g.drawImage(img,0,0)
      const d=g.getImageData(0,0,w,h).data
      const colA=new Float32Array(w), rowA=new Float32Array(h)
      const colL=new Float32Array(w), rowL=new Float32Array(h)
      for(let y=0;y<h;y++) for(let x=0;x<w;x++){
        const i=(y*w+x)*4
        const a=d[i+3]/255
        const L=a*(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255
        colA[x]+=a; rowA[y]+=a; colL[x]+=L; rowL[y]+=L
      }
      // 段间距众数(输入为若干“锚点”位置)
      const spacingMode=(pts:number[], total:number, minGap=8)=>{
        if(pts.length<3) return 0
        const gaps:number[]=[]
        for(let i=1;i<pts.length;i++){ const gap=pts[i]-pts[i-1]; if(gap>=minGap&&gap<=total*0.6) gaps.push(gap) }
        if(!gaps.length) return 0
        const cnt=new Map<number,number>(); for(const gp of gaps) cnt.set(gp,(cnt.get(gp)||0)+1)
        let best=0,bn=0; for(const [gp,n] of cnt) if(n>bn){bn=n;best=gp}
        return best
      }
      // ① 透明缝:按连续缝分组取中心
      const seamMode=(seams:number[], total:number)=>{
        if(seams.length<3) return 0
        const groups:number[][]=[]; let cur=[seams[0]]
        for(let i=1;i<seams.length;i++){ if(seams[i]-seams[i-1]<=2) cur.push(seams[i]); else { groups.push(cur); cur=[seams[i]] } }
        groups.push(cur)
        const reps=groups.map(gr=>Math.round((gr[0]+gr[gr.length-1])/2))
        return spacingMode(reps, total)
      }
      // ② 亮度差分边界:紧贴网格的帧边界处左右亮度突变
      const diffBoundaries=(proj:Float32Array, total:number, axis:'x'|'y')=>{
        const diff=new Float32Array(total)
        if(axis==='x'){
          for(let y=0;y<h;y++){ let prev=0
            for(let x=0;x<w;x++){ const i=(y*w+x)*4; const L=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; if(x>0) diff[x]+=Math.abs(L-prev); prev=L } }
        }else{
          for(let x=0;x<w;x++){ let prev=0
            for(let y=0;y<h;y++){ const i=(y*w+x)*4; const L=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; if(y>0) diff[y]+=Math.abs(L-prev); prev=L } }
        }
        const mean=diff.reduce((a,b)=>a+b,0)/total
        const pts:number[]=[0]
        for(let p=2;p<total-2;p++){ if(diff[p]>=diff[p-1]&&diff[p]>=diff[p+1]&&diff[p]>=diff[p-2]&&diff[p]>=diff[p+2]&&diff[p]>Math.max(0.4,(mean*2))) pts.push(p) }
        pts.push(total-1)
        // 从边界点推导帧宽:全量 + 隔一取奇/偶 三种采样,优选举类“能整除总长”的众数
        const modeOf=(arr:number[])=>{ if(!arr.length) return [0,0] as const; const cnt=new Map<number,number>(); for(const g of arr) cnt.set(g,(cnt.get(g)||0)+1); let best=0,bn=0; for(const [g,n] of cnt) if(n>bn){bn=n;best=g} return [best,bn] as const }
        const lists:number[][]=[]
        const core=pts.slice(1,-1)
        lists.push(core)
        lists.push(core.filter((_,i)=>i%2===0))
        lists.push(core.filter((_,i)=>i%2===1))
        let bestM=0, bestScore=-1
        for(const L of lists){
          const gaps:number[]=[]; for(let i=1;i<L.length;i++){ const gap=L[i]-L[i-1]; if(gap>=8&&gap<=total*0.6) gaps.push(gap) }
          const m=modeOf(gaps)[0]; if(m<=0) continue
          const d=Math.round(total/m); const err=Math.abs(total/m-d)
          const score=(err<0.02?100:0)+modeOf(gaps)[1]*5
          if(score>bestScore){ bestScore=score; bestM=m }
        }
        return bestM
      }
      // ③ 投影自相关:带留白的周期图,列/行亮度投影的周期=帧宽
      const periodOf=(proj:Float32Array, total:number)=>{
        const mean=proj.reduce((a,b)=>a+b,0)/total
        const q:number[]=[]; for(let i=0;i<total;i++) q.push(proj[i]-mean)
        const maxLag=Math.min(total>>1, 640)
        const vals=new Float32Array(maxLag+1)
        for(let lag=8;lag<=maxLag;lag++){
          let s=0; for(let i=0;i+lag<total;i++) s+=q[i]*q[i+lag]
          vals[lag]=s/(total-lag)
        }
        let best=0,bv=-Infinity
        for(let lag=8;lag<=maxLag;lag++) if(vals[lag]>bv){bv=vals[lag];best=lag}
        if(best<8||bv<=0) return 0
        const dbl=best*2<=maxLag? vals[best*2] : bv
        if(dbl < bv*0.5) return 0 // 无周期支撑
        return best
      }
      // 组装:列(帧宽)
      let fw=0, howC=''
      const colMean=colA.reduce((a,b)=>a+b,0)/w, rowMean=rowA.reduce((a,b)=>a+b,0)/h
      // 归一化平均不透明度(0..1)：列合计/h、行合计/w；>0.98 视为不透明（跳过透明缝检测）
      const opaque= (colMean/h)>0.98 && (rowMean/w)>0.98
      if(!opaque){
        const cs=[0]; for(let x=1;x<w;x++) if(colA[x]<colMean*0.18) cs.push(x)
        fw=seamMode([...cs.filter(s=>s<w-1), w-1], w)
        if(fw>0) howC='缝线'
      }
      if(!fw){ const fb=diffBoundaries(colL, w, 'x'); if(fb>0){ fw=fb; howC='边界' } }
      if(!fw){ const fp=periodOf(colL, w); if(fp>0){ fw=fp; howC='周期' } }
      if(!fw){ const m=colL.reduce((a,b)=>a+b,0)/w; const v=colL.reduce((a,b)=>a+(b-m)*(b-m),0)/w; if(m>0&&v/(m*m)<0.001){ fw=w; howC='均匀' } }
      let fh=0, howR=''
      if(!opaque){
        const rs=[0]; for(let y=1;y<h;y++) if(rowA[y]<rowMean*0.18) rs.push(y)
        fh=seamMode([...rs.filter(s=>s<h-1), h-1], h)
        if(fh>0) howR='缝线'
      }
      if(!fh){ const fb=diffBoundaries(rowL, h, 'y'); if(fb>0){ fh=fb; howR='边界' } }
      if(!fh){ const fp=periodOf(rowL, h); if(fp>0){ fh=fp; howR='周期' } }
      if(!fh){ const m=rowL.reduce((a,b)=>a+b,0)/h; const v=rowL.reduce((a,b)=>a+(b-m)*(b-m),0)/h; if(m>0&&v/(m*m)<0.001){ fh=h; howR='均匀' } }
      if(fw>0&&fh>0){
        const cols=Math.max(1,Math.round(w/fw)), rows=Math.max(1,Math.round(h/fh))
        if(cols<=64&&rows<=64&&cols*rows<=512&&cols*rows>=1&&fw>=12&&fh>=12){
          return { cols, rows, conf:1, how:(howC||howR||'自动') }
        }
      }
      return { cols:manualC, rows:manualR, conf:0, how:'' }
    }
    // 把一帧按整数倍缩放居中画到画布（nearest，消除模糊/拖影观感）
    function drawFrame(cvs:HTMLCanvasElement, idx:number){
      const g=cvs.getContext('2d')!; const f=frames[idx]; if(!f) return
      const W=cvs.width, H=cvs.height
      g.imageSmoothingEnabled=false; g.clearRect(0,0,W,H)
      const s=Math.max(1, Math.floor(Math.min(W/f.width, H/f.height)))
      const dw=f.width*s, dh=f.height*s
      g.drawImage(f, (W-dw)>>1, (H-dh)>>1, dw, dh)
    }
    function zoomPreview(){
      if(!frames.length) return toast(status,'无帧可播放',false)
      const ov=document.createElement('div'); ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px'
      const cv=document.createElement('canvas'); cv.width=900; cv.height=675; cv.style.cssText='image-rendering:pixelated;max-width:92vw;max-height:82vh;width:auto;height:auto;background:#141822'
      ov.appendChild(cv)
      const tip=document.createElement('div'); tip.style.cssText='color:#a6b0c0;font-size:12px'; tip.textContent='点击任意处关闭 · '+fpsEl.value+' FPS'
      ov.appendChild(tip)
      let rid=0, idx=0; const fps=parseInt(fpsEl.value)||8; let last=performance.now()
      const loop=(now:number)=>{ if(now-last>1000/fps){ drawFrame(cv, idx); idx=(idx+1)%frames.length; last=now } rid=requestAnimationFrame(loop) }
      rid=requestAnimationFrame(loop)
      ov.onclick=()=>{ cancelAnimationFrame(rid); ov.remove() }
      document.body.appendChild(ov)
    }

    async function sliceFromFile(file:File, presetGrid?:[number,number]){
      const url=URL.createObjectURL(file); const img=await loadImage(url); revokeSoon(url) // 已绘制到 canvas，blob URL 可释放
      // 智能切分：自动检测行列；若提供了「序列布局」则直接按该网格切分（不再用检测覆盖）
      let grid:any
      if(presetGrid){
        colsEl.value=String(presetGrid[0]); rowsEl.value=String(presetGrid[1])
        grid={ cols:presetGrid[0], rows:presetGrid[1], conf:1, how:'布局' }
      }else{
        grid=detectGrid(img)
        colsEl.value=String(grid.cols); rowsEl.value=String(grid.rows)
      }
      const cols=grid.cols, rows=grid.rows
      const crop=parseInt((pSheet.querySelector('#s-crop') as HTMLInputElement)?.value||'0')||0
      const cCrop=Math.max(0,Math.min(crop, Math.floor(img.width/cols/2)-1))
      const rCrop=Math.max(0,Math.min(crop, Math.floor(img.height/rows/2)-1))
      frames=[]; framesEl.innerHTML=''
      const fw=Math.max(1,Math.floor(img.width/cols)-2*cCrop), fh=Math.max(1,Math.floor(img.height/rows)-2*rCrop)
      // 原图 canvas
      const tmp=document.createElement('canvas'); tmp.width=img.width; tmp.height=img.height; tmp.getContext('2d')!.drawImage(img,0,0)
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const fc=document.createElement('canvas'); fc.width=fw; fc.height=fh; fc.getContext('2d')!.drawImage(tmp, c*(fw+2*cCrop)+cCrop, r*(fh+2*rCrop)+rCrop, fw, fh, 0,0,fw,fh)
        // 自动清除邻帧渗漏（保留主体,清除贴边孤立碎片），帧尺寸保持不变
        cleanFrameBleed(fc)
        frames.push(fc)
        const thumb=document.createElement('div'); thumb.className='gas-thumb'; thumb.appendChild(fc); const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML='<span>#'+frames.length+'</span><span>'+fw+'×'+fh+'</span>'; thumb.appendChild(meta)
        const fIdx=frames.length-1
        thumb.onclick=()=>selectF(fIdx)
        framesEl.appendChild(thumb)
      }
      // 记录源图信息用于逐帧微调
      srcInfo={ tmp, cols, rows, xOf:(c:number)=>c*(fw+2*cCrop)+cCrop, yOf:(r:number)=>r*(fh+2*rCrop)+rCrop, baseW:fw, baseH:fh }
      frameOffs=frames.map(()=>({t:0,b:0,l:0,r:0})); selF=-1
      const selInfo=pSheet.querySelector('#s-selinfo') as HTMLElement; if(selInfo) selInfo.textContent='点击缩略图选中帧 → 微调该帧四边裁剪(去除残留法杖等)'
      // 预览第一帧（整数倍缩放居中,清晰无拖影）
      if(frames[0]){ canvas.width=288; canvas.height=288; drawFrame(canvas, 0) }
      pushHistory({ kind:'spritesheet', file:file.name, cols, rows, count:frames.length })
      toast(status, '已切片 '+frames.length+' 帧 ('+fw+'×'+fh+')'+(grid.conf? grid.how==='布局'? ' · 按「序列布局」切分 '+cols+'×'+rows : ' · 智能检测('+grid.how+') '+cols+'×'+rows : ' · 未检出自动网格,按当前行列切分(可改列×行,或在「序列布局」直接选网格重切,如 横向单行 8 帧)'))
    }

    // ---- 逐帧微调裁剪（去除残留：如邻帧法杖尖端混入本帧）----
    function reRenderFrame(idx:number){
      if(!srcInfo||!frameOffs[idx]) return
      const o=frameOffs[idx]; const f=frames[idx]; if(!f) return
      const sx=srcInfo.xOf(idx%srcInfo.cols)+o.l, sy=srcInfo.yOf(Math.floor(idx/srcInfo.cols))+o.t
      const w=Math.max(4, srcInfo.baseW-o.l-o.r), h=Math.max(4, srcInfo.baseH-o.t-o.b)
      const fc=document.createElement('canvas'); fc.width=w; fc.height=h
      const g=fc.getContext('2d')!; g.imageSmoothingEnabled=false
      g.drawImage(srcInfo.tmp, sx, sy, w, h, 0,0,w,h)
      cleanFrameBleed(fc)
      frames[idx]=fc
      const thumbs=[...framesEl.querySelectorAll('.gas-thumb')] as HTMLElement[]
      const tb=thumbs[idx]; if(!tb) return
      tb.innerHTML=''; tb.appendChild(fc)
      const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML='<span>#'+(idx+1)+'</span><span>'+w+'×'+h+'</span>'; tb.appendChild(meta)
      if(idx===0){ canvas.width=288; canvas.height=288; drawFrame(canvas,0) }
      if(selInfo2) selInfo2.textContent='已微调第 '+(idx+1)+' 帧（左'+o.l+' 右'+o.r+' 上'+o.t+' 下'+o.b+'）—— 播放/打包/导出均按微调后帧'
    }
    const selInfo2=pSheet.querySelector('#s-selinfo') as HTMLElement
    function selectF(idx:number){
      selF=idx
      ;[...framesEl.querySelectorAll('.gas-thumb')].forEach((t:any,i:number)=>{ t.style.outline = i===idx?'2px solid #ffd76a':'' })
      const o=frameOffs[idx]||{t:0,b:0,l:0,r:0}
      for(const [k,id2] of [['t','#s-mt'],['b','#s-mb'],['l','#s-ml'],['r','#s-mr']] as const){ const el=pSheet.querySelector(id2) as HTMLInputElement; if(el) el.value=String((o as any)[k]||0) }
      if(selInfo2) selInfo2.textContent='已选中第 '+(idx+1)+' 帧：调整下方数值微调该帧四边裁剪'
    }
    for(const [k,id2] of [['t','#s-mt'],['b','#s-mb'],['l','#s-ml'],['r','#s-mr']] as const){
      pSheet.querySelector(id2)!.addEventListener('input', (e:any)=>{
        const v=parseInt(e.target.value)||0
        if(selF>=0&&frameOffs[selF]){ (frameOffs[selF] as any)[k]=Math.max(0,Math.min(512,v)); reRenderFrame(selF) }
      })
    }

    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.style.borderColor='#478cbf' })
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=(e.dataTransfer?.files?.[0]); if(f) { const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; sliceFromFile(f) }})
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) sliceFromFile(f) })
    pSheet.querySelector('#s-slice')!.addEventListener('click', ()=>{ const f=fileInput.files?.[0]; if(!f) return toast(status,'请先上传图片',false); sliceFromFile(f) })
    // 序列布局＝直接生效的切分网格：选「横向单行/2×4/…」后立即按该网格重切
    const LAYOUT_GRID_MAP:Record<string,[number,number]>={ single:[8,1], '2x4':[4,2], '4x2':[2,4], tri:[3,1], dir8:[4,2] }
    pSheet.querySelector('#s-layout')!.addEventListener('change', ()=>{
      const v=(pSheet.querySelector('#s-layout') as HTMLSelectElement).value
      const f=fileInput.files?.[0]
      if(v==='auto' || !f) return
      void sliceFromFile(f, LAYOUT_GRID_MAP[v]||[8,1])
    })
    pSheet.querySelector('#s-pack')!.addEventListener('click', ()=>{
      if(!frames.length) return toast(status,'无帧可打包',false)
      const cols=frames.length; const w=frames[0].width, h=frames[0].height
      packCanvas=document.createElement('canvas'); packCanvas.width=w*cols; packCanvas.height=h; const g=packCanvas.getContext('2d')!; g.imageSmoothingEnabled=false
      frames.forEach((fc,i)=> g.drawImage(fc, i*w,0))
      const prev=pSheet.querySelector('#s-pack-preview') as HTMLElement; prev.innerHTML=''; const img=document.createElement('img'); img.src=packCanvas.toDataURL(); img.style.maxWidth='100%'; img.style.maxHeight='220px'; img.style.width='auto'; img.style.height='auto'; img.style.objectFit='contain'; img.style.imageRendering='pixelated'; prev.appendChild(img)
      toast(status,'已打包成 '+packCanvas.width+'×'+packCanvas.height)
    })
    pSheet.querySelector('#s-animate')!.addEventListener('click', ()=>{
      if(!frames.length) return toast(status,'无帧',false)
      let idx=0; const fps=parseInt(fpsEl.value)||8; cancelAnimationFrame(animId)
      let last=performance.now()
      const loop=(now:number)=>{
        if(now-last>1000/fps){ drawFrame(canvas, idx); idx=(idx+1)%frames.length; last=now }
        animId=requestAnimationFrame(loop)
      }; animId=requestAnimationFrame(loop)
      setTimeout(()=>cancelAnimationFrame(animId), 4000)
    })
    pSheet.querySelector('#s-zoom')!.addEventListener('click', zoomPreview)
    sRefInput.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ sheetRefUrl=reader.result as string; sRefPreview.innerHTML=''; const im=document.createElement('img'); im.src=sheetRefUrl; im.style.maxWidth='100%'; im.style.maxHeight='48px'; im.style.imageRendering='pixelated'; sRefPreview.appendChild(im); const del=document.createElement('button'); del.type='button'; del.textContent='✕ 删除'; del.style.cssText='margin-top:4px;font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#2c313d;color:#e74c3c;cursor:pointer;display:block'; del.onclick=(e:any)=>{ e.stopPropagation(); sheetRefUrl=''; sRefPreview.innerHTML='<span class="gas-note">无</span>'; toast(status,'参考图已删除') }; sRefPreview.appendChild(del); toast(status,'角色参考图已添加 ✓ 生成时按该角色绘制动作') }
      reader.readAsDataURL(f)
    })
    pSheet.querySelector('#s-export')!.addEventListener('click', ()=>{
      if(!packCanvas) return toast(status,'请先打包',false)
      const ts=Date.now(); const pngName='spritesheet_'+ts+'.png'
      const a=document.createElement('a'); a.href=packCanvas.toDataURL(); a.download=pngName; a.click()
      // 生成 SpriteFrames json（支持：行=方向 → 命名动画；STAND 复用首帧）
      const w=frames[0]?.width||packCanvas.width, h=frames[0]?.height||packCanvas.height
      const perRow=parseInt((pSheet.querySelector('#s-cols') as HTMLInputElement).value)||frames.length||1
      const fps=parseInt(fpsEl.value)||8
      const frameList= frames.map((_,i)=>({ name:'frame_'+i, region:[(i%perRow)*w, Math.floor(i/perRow)*h, w, h], duration: 1/fps }))
      const dirRows=(pSheet.querySelector('#s-dir-rows') as HTMLInputElement)?.checked===true
      let animations:any[]=[]
      if(dirRows && perRow>0){
        const names=(pSheet.querySelector('#s-dir-names') as HTMLInputElement).value.split(',').map(s=>s.trim()).filter(Boolean)
        const rows=Math.max(1,Math.ceil(frames.length/perRow))
        for(let r=0;r<rows;r++){
          const name=names[r]||('row'+r)
          const fr=[]; for(let c=0;c<perRow;c++){ const idx=r*perRow+c; if(idx<frames.length) fr.push(idx) }
          animations.push({ name, frames:fr, speed:fps, loop:true })
        }
        // STAND 复用第一个方向动画的首帧（借鉴 occha 生成器约定）
        if(animations.length && animations[0].frames.length){ animations.push({ name:'stand', frames:[animations[0].frames[0]], speed:fps, loop:false }) }
      }else{
        animations=[{ name:'default', frames: frames.map((_,i)=>i), speed:fps }]
      }
      const mf={ meta:{ image:'spritesheet.png', size:[packCanvas.width, packCanvas.height], frames:frames.length, cols:perRow, rows:Math.max(1,Math.ceil(frames.length/perRow)), animation_mode: dirRows?'directional':'single' }, frames: frameList, godot:{ type:'SpriteFrames', animations } }
      const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); downloadBlob(blob,'SpriteFrames.json')
      // Godot 原生 .tres：引用同目录同名 PNG,拖入项目即可用（零手动配置）
      const at=document.createElement('a'); at.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildSpriteFramesTres(pngName, perRow, animations, w, h)); at.download='SpriteFrames_'+ts+'.tres'; at.click()
      pushHistory({ kind:'export', what:'spritesheet', at:Date.now() })
      toast(status,'已导出 PNG + SpriteFrames.json + SpriteFrames.tres ('+(dirRows?'命名动画 '+animations.map((x:any)=>x.name).join('/').slice(0,40):'默认动画')+') — .tres 与 PNG 放同一目录拖入 Godot 即用')
    })
    pSheet.querySelector('#s-save')!.addEventListener('click', async()=>{
        if(!packCanvas) return toast(status,'请先打包成表',false)
        // 记录网格元数据，供导出中心打包时自动生成同名 .tres
        const perRow=parseInt(colsEl.value)||frames.length||1
        const fps=parseInt(fpsEl.value)||8
        const dirRows=(pSheet.querySelector('#s-dir-rows') as HTMLInputElement)?.checked===true
        const dirNames=(pSheet.querySelector('#s-dir-names') as HTMLInputElement)?.value||''
        const w=frames[0]?.width||packCanvas.width, h=frames[0]?.height||packCanvas.height
        const meta={ cols:perRow, rows:Math.max(1,Math.ceil(frames.length/perRow)), fps, frameW:w, frameH:h, frames:frames.length, dirRows, dirNames }
        const id=await addToLibrary('spritesheet','序列帧 '+new Date().toLocaleTimeString(),packCanvas.toDataURL(),meta)
        toast(status,'已入库 '+id+(meta?`（网格 ${meta.cols}×${meta.rows}，导出中心可自动生成 .tres）`:''))
      })
      pSheet.querySelector('#s-gen')!.addEventListener('click', async()=>{
      const prompt=promptEl.value.trim(); if(!prompt) return toast(status,'输入序列描述',false)
      const prov=(pSheet.querySelector('#s-provider') as HTMLSelectElement)?.value || 'mock'
      const layout=(pSheet.querySelector('#s-layout') as HTMLSelectElement)?.value||'auto'
      const LAYOUT_HINT:Record<string,string>={ auto:'', single:', 8 frames, single horizontal row, left to right', '2x4':', 8 frames, 2 rows 4 columns, left to right then next row', '4x2':', 8 frames, 4 rows 2 columns, left to right then next row', tri:', three views side by side, front side back, 3 frames', dir8:', 8 directional sprites, 2 rows 4 columns: down/up row then left/right row' }
      const LAYOUT_GRID:Record<string,[number,number]>={ single:[8,1], '2x4':[4,2], '4x2':[2,4], tri:[3,1], dir8:[4,2] }
      // 强化：每帧完全隔离 + 留透明间隙 + 肢体不越界，尽量减少邻帧交叉
      const SEPARATION=', each frame fully isolated and centered, clear transparent gap/gutter between every frame, no parts crossing frame borders, no overlapping limbs between frames, uniform grid layout'
      toast(status,'序列生成中…（请稍候，生成后自动切分）')
      try{
        const url=await callImageGen(prompt + ' , sprite sheet, transparent background, same character across all frames' + SEPARATION + (LAYOUT_HINT[layout]||''), prov as any, { size:'1024x512', model: (pSheet.querySelector('#s-model-sel') as HTMLSelectElement)?.value||undefined, reference: sheetRefUrl || undefined })
        if(!url) throw new Error('生成接口未返回图片')
        const img=await loadImage(url)
        // 按所选布局预置行列；若选「智能」则由 sliceFromFile 自动检测
        if(layout!=='auto'){ const gc=LAYOUT_GRID[layout]?.[0]||8, gr=LAYOUT_GRID[layout]?.[1]||1; colsEl.value=String(gc); rowsEl.value=String(gr) }
        const c=document.createElement('canvas'); c.width=img.naturalWidth||img.width; c.height=img.naturalHeight||img.height
        c.getContext('2d')!.imageSmoothingEnabled=false; c.getContext('2d')!.drawImage(img,0,0)
        // 用 toDataURL → dataUrlToBlob 同步转 blob，绕开 toBlob 异步回调可能吞错的问题
        const dataUrl=c.toDataURL('image/png')
        const b=dataUrlToBlob(dataUrl)
        const f=new File([b],'ai-sheet.png',{type:'image/png'})
        const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files
        sliceFromFile(f)
        toast(status,'AI 序列已生成并自动切分（'+img.naturalWidth+'×'+img.naturalHeight+'）', true)
      }catch(e:any){
        const _s = (e&&(e.message||e)) ? String(e.message||e) : String(e)
        console.error('[s-gen] AI 生成失败', e)
        status.textContent='❌ 生成失败：'+_s.slice(0,160); status.style.color='#e74c3c'
      }
    })
  })()
  // 自动清除邻帧/杂散渗漏与半透明残影：保留最大主体，清除半透明流光/鬼影及与主体不相交的独立块。
  // 主体永远不清除——彻底避免把大块残影误当主体、反而删掉角色。
  // 注：原本是 sheet 模块 IIFE 内部的局部函数，导致 seq / pipe 模块里的"框选分离"和"流水线去背"都拿不到而抛 `cleanFrameBleed is not defined`。
  // 提到 buildStudio 顶层(同 cropToContent / packRow / removeBackground 等工具函数一处),三个模块共用同一份实现,行为完全一致。
  const cleanFrameBleed=(cvs:HTMLCanvasElement)=>{
    const W=cvs.width, H=cvs.height, N=W*H
    if(N<1) return
    const g=cvs.getContext('2d')!; const img=g.getImageData(0,0,W,H); const d=img.data
    // ① 先把半透明残影(alpha<96)真正清成透明——它们不成块、也不会被误当主体
    let changed=false
    for(let i=0;i<N;i++){ const a=d[i*4+3]; if(a>0 && a<96){ d[i*4+3]=0; changed=true } }
    // ② 对"实心"像素做连通域：只保留最大主体，清除与主体包围盒不相交的独立块
    const op=new Uint8Array(N)
    for(let i=0;i<N;i++) op[i]=d[i*4+3]>=96?1:0
    const label=new Int32Array(N).fill(-1)
    const sizes:number[]=[]; const stack:number[]=[]; const bbox:{minX:number;minY:number;maxX:number;maxY:number}[]=[]; let comps=0
    const near=(p:number)=>{ const x=p%W, y=(p/W)|0; const q:number[]=[]
      if(x>0)q.push(p-1); if(x<W-1)q.push(p+1); if(y>0)q.push(p-W); if(y<H-1)q.push(p+W); return q }
    for(let s=0;s<N;s++){
      if(!op[s]||label[s]!==-1) continue
      const cid=comps++; let sz=0; let minX=W,minY=H,maxX=0,maxY=0
      stack.length=0; stack.push(s); label[s]=cid
      while(stack.length){
        const p=stack.pop()!; const x=p%W, y=(p/W)|0; sz++
        if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y
        for(const q of near(p)) if(op[q]&&label[q]===-1){ label[q]=cid; stack.push(q) }
      }
      sizes.push(sz); bbox.push({minX,minY,maxX,maxY})
    }
    if(comps>1){
      let main=0; for(let i=1;i<comps;i++) if(sizes[i]>sizes[main]) main=i
      const mb=bbox[main]
      const intersects=(a:{minX:number;minY:number;maxX:number;maxY:number})=> a.minX<=mb.maxX && a.maxX>=mb.minX && a.minY<=mb.maxY && a.maxY>=mb.minY
      for(let s=0;s<N;s++){
        const cid=label[s]
        if(cid!==-1 && cid!==main && !intersects(bbox[cid])){ const i=s*4; if(d[i+3]!==0){ d[i+3]=0; changed=true } }
      }
    }
    if(changed) g.putImageData(img,0,0)
  }
  // ---- 单帧动画工作区（分治策略）----
  ;(()=>{
    const promptsEl= pSeq.querySelector('#q-prompts') as HTMLTextAreaElement
    const fpsEl= pSeq.querySelector('#q-fps') as HTMLInputElement
    const provEl= pSeq.querySelector('#q-provider') as HTMLSelectElement
    const status= pSeq.querySelector('#q-status') as HTMLElement
    const prog= pSeq.querySelector('#q-prog') as HTMLElement
    const framesEl= pSeq.querySelector('#q-frames') as HTMLElement
    const canvas= pSeq.querySelector('#q-canvas') as HTMLCanvasElement
    const packPrev= pSeq.querySelector('#q-pack-preview') as HTMLElement
    const refInput= pSeq.querySelector('#q-ref') as HTMLInputElement
    const refPreview= pSeq.querySelector('#q-ref-preview') as HTMLElement
    let rawFrames: HTMLCanvasElement[]=[]   // 生成后、裁边前的原始帧
    let frames: HTMLCanvasElement[]=[]      // 批处理对齐后的帧
    let packCanvas: HTMLCanvasElement|null=null
    let refUrl=''
    let animId=0

    const loadImage=(src:string):Promise<HTMLImageElement>=> new Promise((res,rej)=>{ const im=new Image(); if(/^https?:/i.test(src)) im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=rej; im.src=src })
    const setProg=(p:number)=> prog.style.width=p+'%'
    const drawFrame=(cvs:HTMLCanvasElement, idx:number)=>{
      const g=cvs.getContext('2d')!; const f=frames[idx]||rawFrames[idx]; if(!f) return
      const W=cvs.width, H=cvs.height; g.imageSmoothingEnabled=false; g.clearRect(0,0,W,H)
      const s=Math.max(1, Math.floor(Math.min(W/f.width, H/f.height)))
      const dw=f.width*s, dh=f.height*s
      g.drawImage(f, (W-dw)>>1, (H-dh)>>1, dw, dh)
    }
    const renderThumbs=()=>{
      framesEl.innerHTML=''
      const list=frames.length? frames : rawFrames
      list.forEach((fc,i)=>{
        const d=document.createElement('div'); d.className='gas-thumb'; d.appendChild(fc)
        const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML='<span>#'+(i+1)+'</span><span>'+fc.width+'×'+fc.height+'</span>'
        d.appendChild(meta); framesEl.appendChild(d)
      })
    }

    // 参考图
    refInput.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const im=document.createElement('img'); im.src=refUrl; im.style.maxWidth='100%'; im.style.maxHeight='48px'; im.style.imageRendering='pixelated'; refPreview.appendChild(im); const del=document.createElement('button'); del.type='button'; del.textContent='✕ 删除'; del.style.cssText='margin-top:4px;font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#2c313d;color:#e74c3c;cursor:pointer;display:block'; del.onclick=(e:any)=>{ e.stopPropagation(); refUrl=''; refPreview.innerHTML='<span class="gas-note">无参考图</span>'; toast(status,'参考图已删除') }; refPreview.appendChild(del); toast(status,'参考图已添加 ✓') }
      reader.readAsDataURL(f)
    })

    // 逐帧生成：每行一个动作 → 独立单角色图（白底、居中、留白边）
    const FRAME_SUFFIX=', single character, one pose only, full body, centered, plain solid white background, large empty margin around the character, no text, no watermark, no other characters, no partial limbs at edges'
    pSeq.querySelector('#q-gen')!.addEventListener('click', async ()=>{
      const lines=promptsEl.value.split('\n').map(s=>s.trim()).filter(Boolean)
      if(!lines.length) return toast(status,'请输入至少一行动作描述',false)
      const prov=provEl.value
      rawFrames=[]; frames=[]; packCanvas=null; packPrev.innerHTML='<span class="gas-note">等待拼接</span>'; framesEl.innerHTML=''
      const genBtn=pSeq.querySelector('#q-gen') as HTMLButtonElement; genBtn.disabled=true
      let done=0
      setProg(5)
      for(const line of lines){
        try{
          toast(status,'生成第 '+(done+1)+' 帧：'+line.slice(0,16)+'…')
          const url=await callImageGen(line+FRAME_SUFFIX, prov, { size:'1024x1024', model:(pSeq.querySelector('#q-model-sel') as HTMLSelectElement)?.value||undefined, reference: refUrl||undefined })
          const img=await loadImage(url)
          const c=blankCanvas(img.naturalWidth||img.width, img.naturalHeight||img.height)
          c.getContext('2d')!.drawImage(img,0,0)
          rawFrames.push(c)
          const thumb=document.createElement('div'); thumb.className='gas-thumb'; thumb.appendChild(c)
          const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML='<span>#'+(done+1)+'</span><span>RAW</span>'; thumb.appendChild(meta)
          framesEl.appendChild(thumb)
        }catch(e:any){ toast(status,'第 '+(done+1)+' 帧失败：'+String(e.message||e).slice(0,60), false) }
        done++; setProg(5+Math.round(done/lines.length*45))
      }
      genBtn.disabled=false; setProg(0)
      if(rawFrames[0]){ canvas.width=288; canvas.height=288; drawFrame(canvas,0) }
      toast(status,'已生成 '+rawFrames.length+'/'+lines.length+' 张单帧（自动切分前请点「批处理对齐」）', rawFrames.length>0)
    })

    // 批处理对齐：裁白边 + 统一画布 + 脚底对齐
    pSeq.querySelector('#q-align')!.addEventListener('click', ()=>{
      if(!rawFrames.length) return toast(status,'请先逐帧生成',false)
      setProg(10)
      const cropped=rawFrames.map(cropToContent)
      const norm=normalizeFrames(cropped, 12)
      frames=norm.frames
      renderThumbs()
      canvas.width=288; canvas.height=288; drawFrame(canvas,0)
      setProg(0)
      toast(status,'已对齐 '+frames.length+' 帧（裁白边→'+frames[0].width+'×'+frames[0].height+'· 脚底对齐）', true)
    })

    // 拼成精灵表（横排）
    pSeq.querySelector('#q-pack')!.addEventListener('click', ()=>{
      const list=frames.length? frames : rawFrames
      if(!list.length) return toast(status,'无帧可拼接',false)
      packCanvas=packRow(list)
      packPrev.innerHTML=''; const img=document.createElement('img'); img.src=packCanvas.toDataURL()
      img.style.maxWidth='100%'; img.style.maxHeight='200px'; img.style.width='auto'; img.style.height='auto'; img.style.objectFit='contain'; img.style.imageRendering='pixelated'; packPrev.appendChild(img)
      toast(status,'已拼成 '+packCanvas.width+'×'+packCanvas.height+' 精灵表', true)
    })

    // 合成 GIF
    pSeq.querySelector('#q-gif')!.addEventListener('click', ()=>{
      const list=frames.length? frames : rawFrames
      if(!list.length) return toast(status,'无帧可合成 GIF',false)
      const fps=parseInt(fpsEl.value)||8
      const blob=buildGif(list, fps, true)
      downloadBlob(blob,'animation_'+Date.now()+'.gif')
      toast(status,'已合成并下载 GIF（'+list.length+' 帧 @ '+fps+' FPS）', true)
    })

    // 预览动画
    pSeq.querySelector('#q-animate')!.addEventListener('click', ()=>{
      const list=frames.length? frames : rawFrames
      if(!list.length) return toast(status,'无帧',false)
      const fps=parseInt(fpsEl.value)||8; cancelAnimationFrame(animId)
      let idx=0
      let lastT=performance.now()
      const tick=(now:number)=>{ if(now-lastT>=1000/fps){ drawFrame(canvas, idx); idx=(idx+1)%list.length; lastT=now } animId=requestAnimationFrame(tick) }
      animId=requestAnimationFrame(tick)
      setTimeout(()=>cancelAnimationFrame(animId), 4000)
    })

    // 导出 Godot：精灵表 PNG + SpriteFrames.json/.tres + GIF
    pSeq.querySelector('#q-export')!.addEventListener('click', ()=>{
      const list=frames.length? frames : rawFrames
      if(!list.length) return toast(status,'先对齐/拼接',false)
      const sheet = packCanvas || packRow(list)
      const ts=Date.now(); const pngName='seqframe_'+ts+'.png'
      const a=document.createElement('a'); a.href=sheet.toDataURL(); a.download=pngName; a.click()
      const fw=list[0].width, fh=list[0].height, fps=parseInt(fpsEl.value)||8, perRow=list.length
      const animations=[{ name:'default', frames:list.map((_,i)=>i), speed:fps, loop:true }]
      const mf={ meta:{ image:pngName, size:[sheet.width,sheet.height], frames:list.length, cols:perRow, rows:1, animation_mode:'single' }, frames:list.map((_,i)=>({ name:'frame_'+i, region:[i*fw,0,fw,fh], duration:1/fps })), godot:{ type:'SpriteFrames', animations } }
      const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const bu=URL.createObjectURL(blob); const b=document.createElement('a'); b.href=bu; b.download='SpriteFrames.json'; b.click(); revokeSoon(bu, 5000)
      const at=document.createElement('a'); at.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildSpriteFramesTres(pngName, perRow, animations, fw, fh)); at.download='SpriteFrames_'+ts+'.tres'; at.click()
      const gifBlob=buildGif(list, fps, true); downloadBlob(gifBlob,'animation_'+ts+'.gif')
      pushHistory({ kind:'spritesheet', file:'seqframe', cols:perRow, rows:1, count:list.length })
      toast(status,'已导出 PNG + SpriteFrames.json/.tres + GIF（'+list.length+' 帧）', true)
    })

    // 全部入库
    pSeq.querySelector('#q-save')!.addEventListener('click', async ()=>{
      const list=frames.length? frames : rawFrames
      if(!list.length) return toast(status,'无素材可入库',false)
      const sheet = packCanvas || packRow(list)
      const id=await addToLibrary('spritesheet','单帧动画 '+new Date().toLocaleTimeString(), sheet.toDataURL(), { cols:list.length, rows:1, fps:parseInt(fpsEl.value)||8, frameW:list[0].width, frameH:list[0].height, frames:list.length, dirRows:false, dirNames:'' })
      toast(status,'已入库 '+id, true)
    })

    // 清空
    pSeq.querySelector('#q-clear')!.addEventListener('click', ()=>{
      rawFrames=[]; frames=[]; packCanvas=null; framesEl.innerHTML=''; packPrev.innerHTML='<span class="gas-note">等待拼接</span>'
      const g=canvas.getContext('2d')!; g.clearRect(0,0,canvas.width,canvas.height)
      toast(status,'已清空', true)
    })

    // ---- 上传整表 → 手动框选裁剪 ----
    const sheetFile= pSeq.querySelector('#q-sheet-file') as HTMLInputElement
    const sheetCanvas= pSeq.querySelector('#q-sheet-canvas') as HTMLCanvasElement
    const sheetCtx= sheetCanvas.getContext('2d')!
    const boxStatus= pSeq.querySelector('#q-box-status') as HTMLElement
    let sheetImg: HTMLCanvasElement|null=null
    let sheetScale=1
    let boxRects: {x:number;y:number;w:number;h:number}[]=[]
    let boxDrag: {x0:number;y0:number;x1:number;y1:number}|null=null
    let boxDragging=false

    const drawSheet=()=>{
      sheetCtx.clearRect(0,0,sheetCanvas.width,sheetCanvas.height)
      if(sheetImg){
        sheetCtx.imageSmoothingEnabled=false
        sheetCtx.drawImage(sheetImg, 0,0, sheetImg.width, sheetImg.height, 0,0, sheetCanvas.width, sheetCanvas.height)
      }
      // 已框框（黄）
      sheetCtx.strokeStyle='#ffd76a'; sheetCtx.lineWidth=2
      for(const r of boxRects){
        sheetCtx.strokeRect(r.x*sheetScale, r.y*sheetScale, r.w*sheetScale, r.h*sheetScale)
      }
      // 当前拖拽框（青）
      if(boxDrag){
        const x=Math.min(boxDrag.x0,boxDrag.x1)*sheetScale, y=Math.min(boxDrag.y0,boxDrag.y1)*sheetScale
        const w=Math.abs(boxDrag.x1-boxDrag.x0)*sheetScale, h=Math.abs(boxDrag.y1-boxDrag.y0)*sheetScale
        sheetCtx.strokeStyle='#6ea6d1'; sheetCtx.lineWidth=2
        sheetCtx.strokeRect(x,y,w,h)
      }
    }
    const imgToCanvas=(img:HTMLImageElement)=>{ const c=blankCanvas(img.naturalWidth||img.width, img.naturalHeight||img.height); const g=c.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(img,0,0); return c }
    sheetFile.addEventListener('change', async (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const url=URL.createObjectURL(f)
      try{
        const img=await loadImage(url)
        sheetImg=imgToCanvas(img)
        boxRects=[]; boxDrag=null
        // 画布内部像素 = 图片原始像素（不缩放），彻底避免显示缩放导致的坐标漂移
        sheetCanvas.width=sheetImg.width; sheetCanvas.height=sheetImg.height
        sheetScale=1
        drawSheet()
        boxStatus.textContent='已加载整表（'+sheetImg.width+'×'+sheetImg.height+'），拖拽框出每帧区域。'
      }catch(err:any){ boxStatus.textContent='加载失败：'+String(err.message||err).slice(0,60); boxStatus.style.color='#e74c3c' }
      finally{ URL.revokeObjectURL(url) }
    })
    // 用 offsetX/offsetY（相对 canvas 内部像素，天然准确）换算坐标，不漂移
    const evtPos=(e:MouseEvent)=>{ return { x:e.offsetX/sheetScale, y:e.offsetY/sheetScale } }
    sheetCanvas.addEventListener('mousedown', (e)=>{ if(!sheetImg) return; const p=evtPos(e); e.preventDefault(); boxDragging=true; boxDrag={x0:Math.max(0,Math.min(p.x,sheetImg.width)), y0:Math.max(0,Math.min(p.y,sheetImg.height)), x1:Math.max(0,Math.min(p.x,sheetImg.width)), y1:Math.max(0,Math.min(p.y,sheetImg.height)) }; drawSheet() })
    sheetCanvas.addEventListener('mousemove', (e)=>{ if(!boxDragging||!boxDrag) return; const p=evtPos(e); boxDrag.x1=Math.max(0,Math.min(p.x,sheetImg!.width)); boxDrag.y1=Math.max(0,Math.min(p.y,sheetImg!.height)); drawSheet() })
    const endBox=()=>{
      if(!boxDragging||!boxDrag) return
      const x=Math.min(boxDrag.x0,boxDrag.x1), y=Math.min(boxDrag.y0,boxDrag.y1)
      const w=Math.abs(boxDrag.x1-boxDrag.x0), h=Math.abs(boxDrag.y1-boxDrag.y0)
      if(w>=6&&h>=6) boxRects.push({x,y,w,h})
      boxDrag=null; boxDragging=false; drawSheet()
      boxStatus.textContent='已框 '+boxRects.length+' 帧，可继续框选/撤销/清除，或点「✅ 应用并批量对齐」。'
    }
    sheetCanvas.addEventListener('mouseup', endBox)
    sheetCanvas.addEventListener('mouseleave', endBox)
    // ✨ 自动框图：按列投影找内容分隔缝，自动生成每帧矩形
    const autoBox=()=>{
      if(!sheetImg) return toast(status,'请先上传整表',false)
      const W=sheetImg.width, H=sheetImg.height
      const d=sheetCtx.getImageData(0,0,W,H).data
      // 列投影：每列"非白/非透明内容"像素数
      const col=new Float32Array(W)
      for(let x=0;x<W;x++) for(let y=0;y<H;y++){
        const i=(y*W+x)*4; const a=d[i+3]; const isWhite=d[i]>=240&&d[i+1]>=240&&d[i+2]>=240
        if(a>8 && !isWhite) col[x]++
      }
      const colMax=Math.max(...col)||1
      // 找"内容密簇"：超过平均的列视为有效，用间隙分隔
      const mean=col.reduce((a,b)=>a+b,0)/W
      const active=(x:number)=> col[x] > mean*0.12
      const spans:{x0:number;x1:number}[]=[]
      let inSpan=false, x0=0
      for(let x=0;x<W;x++){ if(active(x)){ if(!inSpan){x0=x; inSpan=true} } else { if(inSpan){ if(x-x0>=8) spans.push({x0,x1:x-1}); inSpan=false } } }
      if(inSpan) spans.push({x0,x1:W-1})
      if(spans.length<2){ toast(status,'未能自动检测出多帧（可能角色连在一起或被裁切），请手动框选',false); return }
      // 行范围：取整表最上/最下内容行
      const row=new Float32Array(H)
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; const a=d[i+3]; const isWhite=d[i]>=240&&d[i+1]>=240&&d[i+2]>=240; if(a>8&&!isWhite) row[y]++ }
      const rowMean=row.reduce((a,b)=>a+b,0)/H
      let top=0,bot=H-1
      while(top<H && row[top]<=rowMean*0.12) top++
      while(bot>top && row[bot]<=rowMean*0.12) bot--
      if(top>=bot){ top=0; bot=H-1 }
      boxRects=spans.map(sp=>({ x:sp.x0, y:top, w:sp.x1-sp.x0+1, h:bot-top+1 }))
      drawSheet()
      boxStatus.textContent='✨ 自动框出 '+boxRects.length+' 帧，可手动微调后点「✅ 应用并批量对齐」。'
      toast(status,'自动框出 '+boxRects.length+' 帧',true)
    }
    pSeq.querySelector('#q-box-auto')!.addEventListener('click', autoBox)
    pSeq.querySelector('#q-box-undo')!.addEventListener('click', ()=>{ boxRects.pop(); drawSheet(); boxStatus.textContent='已框 '+boxRects.length+' 帧。' })
    pSeq.querySelector('#q-box-clear')!.addEventListener('click', ()=>{ boxRects=[]; boxDrag=null; drawSheet(); boxStatus.textContent='已清除框选。' })
    pSeq.querySelector('#q-box-apply')!.addEventListener('click', ()=>{
      if(!sheetImg) return toast(status,'请先上传整表',false)
      if(!boxRects.length) return toast(status,'请先框出帧区域（可点「✨ 自动框图」）',false)
      setProg(30); boxStatus.textContent='正在应用…'; boxStatus.style.color=''
      try{
        const cropped=boxRects.map(r=> cropSheet(sheetImg!, r)).map(c=>cropToContent(c))
        // 对每帧清残留（保留最大主体）
        cropped.forEach(c=>cleanFrameBleed(c))
        const normalized=cropped.filter(c=>{ // 丢弃近乎全透明的帧（避免帧列表空白）
          const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data; let op=0
          for(let i=0;i<c.width*c.height;i++) if(d[i*4+3]>16) op++
          return op > c.width*c.height*0.01
        })
        if(!normalized.length){ boxStatus.textContent='框选区域没有有效内容（可能框到纯白/空白），请重新框选。'; boxStatus.style.color='#e74c3c'; setProg(0); return }
        const norm=normalizeFrames(normalized, 12)
        frames=norm.frames
        rawFrames=normalized  // 保留裁边后的帧
        renderThumbs()
        canvas.width=288; canvas.height=288; drawFrame(canvas,0)
        boxStatus.textContent='已从 '+boxRects.length+' 个框生成 '+frames.length+' 帧（裁边→'+frames[0].width+'×'+frames[0].height+'· 脚底对齐）。'
        toast(status,'框选分离成功：'+frames.length+' 帧（'+frames[0].width+'×'+frames[0].height+'）', true)
      }catch(err:any){
        boxStatus.textContent='应用失败：'+String(err.message||err).slice(0,80); boxStatus.style.color='#e74c3c'
      }
      setProg(0)
    })
  })()

  // ---- 素材处理流水线（切→透→齐→名→导）----
  ;(()=>{
    const drop= pPipe.querySelector('#pp-drop') as HTMLElement
    const fileInput= pPipe.querySelector('#pp-file') as HTMLInputElement
    const nameEl= pPipe.querySelector('#pp-name') as HTMLInputElement
    const fpsEl= pPipe.querySelector('#pp-fps') as HTMLInputElement
    const sizeEl= pPipe.querySelector('#pp-size') as HTMLInputElement
    const bgEl= pPipe.querySelector('#pp-bg') as HTMLSelectElement
    const modeEl= pPipe.querySelector('#pp-mode') as HTMLSelectElement
    const status= pPipe.querySelector('#pp-status') as HTMLElement
    const prog= pPipe.querySelector('#pp-prog') as HTMLElement
    const framesEl= pPipe.querySelector('#pp-frames') as HTMLElement
    const canvas= pPipe.querySelector('#pp-canvas') as HTMLCanvasElement
    const packPrev= pPipe.querySelector('#pp-pack-preview') as HTMLElement
    let rawFrames: HTMLCanvasElement[]=[]   // 切割后、去背/对齐前的帧
    let frames: HTMLCanvasElement[]=[]      // 对齐后的帧
    let sheet: HTMLCanvasElement|null=null  // 精灵表
    let animId=0
    const loadImage=(src:string):Promise<HTMLImageElement>=> new Promise((res,rej)=>{ const im=new Image(); if(/^https?:/i.test(src)) im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=rej; im.src=src })
    const setProg=(p:number)=> prog.style.width=p+'%'
    const imgToCanvas=(img:HTMLImageElement)=>{ const c=blankCanvas(img.naturalWidth||img.width, img.naturalHeight||img.height); const g=c.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(img,0,0); return c }
    const drawPreview=(idx=0)=>{ const g=canvas.getContext('2d')!; const f=frames[idx]; if(!f) return; canvas.width=288; canvas.height=288; g.imageSmoothingEnabled=false; g.clearRect(0,0,288,288); const s=Math.max(1,Math.floor(Math.min(288/f.width,288/f.height))); const dw=f.width*s, dh=f.height*s; g.drawImage(f,(288-dw)>>1,(288-dh)>>1,dw,dh) }
    const renderThumbs=()=>{ framesEl.innerHTML=''; const list=frames.length? frames: rawFrames; list.forEach((fc,i)=>{ const d=document.createElement('div'); d.className='gas-thumb'; d.appendChild(fc); const m=document.createElement('div'); m.className='meta'; m.innerHTML='<span>#'+(i+1)+'</span><span>'+fc.width+'×'+fc.height+'</span>'; d.appendChild(m); framesEl.appendChild(d) }) }
    const scaleTo=(cvs:HTMLCanvasElement, target:number)=>{ if(target<=0||target>=cvs.width&&target>=cvs.height) return cvs; const w=target, h=Math.max(1,Math.round(cvs.height*target/cvs.width)); const out=blankCanvas(w,h); const g=out.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(cvs,0,0,w,h); return out }

    // 导入：读取所有选中的图片为 canvas（先存，处理时再切分/去背）
    let importedFiles: File[]=[]
    const ingestFiles=(files:FileList|File[])=>{
      importedFiles=Array.from(files).filter(f=>/^image\//.test(f.type)||/\.(png|jpe?g|webp)$/i.test(f.name||''))
      status.textContent='已导入 '+importedFiles.length+' 个文件，选择输入类型后点「🚀 一键处理」。'
      toast(status,'已导入 '+importedFiles.length+' 个文件', true)
    }
    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.style.borderColor='#478cbf' })
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); drop.style.borderColor='var(--border)'; const f=e.dataTransfer?.files; if(f&&f.length) ingestFiles(f) })
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files; if(f&&f.length){ ingestFiles(f); fileInput.value='' } })

    // 🚀 一键处理：切→透→齐→名→导
    pPipe.querySelector('#pp-run')!.addEventListener('click', async ()=>{
      if(!importedFiles.length) return toast(status,'请先导入素材',false)
      setProg(10); status.textContent='处理中…'; status.style.color=''
      try{
        const mode=modeEl.value, bgMode=bgEl.value as 'white'|'gray'|'none', target=parseInt(sizeEl.value)||0, fps=parseInt(fpsEl.value)||8
        const prefix=nameEl.value.trim()||'frame'
        rawFrames=[]
        // 第1步 切割
        if(mode==='sheet' && importedFiles.length===1){
          const u=URL.createObjectURL(importedFiles[0]); const img=await loadImage(u); revokeSoon(u)
          const sheetImg=imgToCanvas(img)
          const boxes=autoBoxProjection(sheetImg)
          rawFrames=boxes.map(r=> cropSheet(sheetImg, r))
          status.textContent='整表自动切分：'+rawFrames.length+' 帧。'
        } else {
          for(const f of importedFiles){ const u=URL.createObjectURL(f); const img=await loadImage(u); revokeSoon(u); rawFrames.push(imgToCanvas(img)) }
          status.textContent='多张单帧：'+rawFrames.length+' 帧。'
        }
        setProg(30)
        // 第2步 去背 + 第3步 裁边/对齐
        const processed=rawFrames.map(c=>{
          removeBackground(c, bgMode)
          const cropped=cropToContent(c)
          cleanFrameBleed(cropped)
          return scaleTo(cropped, target)
        }).filter(c=>{ // 丢弃近全透明
          const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data; let op=0
          for(let i=0;i<c.width*c.height;i++) if(d[i*4+3]>16) op++
          return op > c.width*c.height*0.01
        })
        if(!processed.length){ status.textContent='没有有效内容（可能全部被去背清空），请检查去背模式。'; status.style.color='#e74c3c'; setProg(0); return }
        const norm=normalizeFrames(processed, 12)
        frames=norm.frames
        setProg(60)
        // 横排拼成精灵表
        sheet=packRow(frames)
        packPrev.innerHTML=''; const pim=document.createElement('img'); pim.src=sheet.toDataURL(); pim.style.maxWidth='100%'; pim.style.maxHeight='200px'; pim.style.width='auto'; pim.style.height='auto'; pim.style.objectFit='contain'; pim.style.imageRendering='pixelated'; packPrev.appendChild(pim)
        renderThumbs(); drawPreview(0)
        setProg(90)
        // 第4步 命名 + 第5步 导出配置
        const names=buildFrameNaming(prefix, frames.length)
        const fw=frames[0].width, fh=frames[0].height, perRow=frames.length
        const animations=[{ name:prefix, frames:frames.map((_,i)=>i), speed:fps, loop:true }]
        const mf={ meta:{ image:'spritesheet.png', size:[sheet.width,sheet.height], frames:frames.length, cols:perRow, rows:1, animation_mode:'single' }, frames:frames.map((_,i)=>({ name:names[i], region:[i*fw,0,fw,fh], duration:1/fps })), godot:{ type:'SpriteFrames', animations } }
        // 存到模块级，供后续下载/入库
        ;(pPipe as any)._pipeline={ names, fps, animations, mf, fw, fh, perRow }
        status.textContent='✅ 处理完成：'+frames.length+' 帧（'+fw+'×'+fh+'）→ '+names[0]+' ~ '+names[names.length-1]+'；预览精灵表，可下载/入库。'
        toast(status,'处理完成：'+frames.length+' 帧，命名 '+prefix+'_0~'+prefix+'_'+(frames.length-1), true)
        setProg(100); setTimeout(()=>setProg(0),1200)
      }catch(e:any){ status.textContent='处理失败：'+String(e.message||e).slice(0,80); status.style.color='#e74c3c'; setProg(0) }
    })

    // 预览动画（点击预览画布播放）
    canvas.addEventListener('click', ()=>{ if(!frames.length) return; cancelAnimationFrame(animId); let idx=0; let lastT=performance.now(); const tick=(now:number)=>{ if(now-lastT>=1000/(parseInt(fpsEl.value)||8)){ drawPreview(idx); idx=(idx+1)%frames.length; lastT=now } animId=requestAnimationFrame(tick) }; animId=requestAnimationFrame(tick); setTimeout(()=>cancelAnimationFrame(animId),4000) })

    // 下载全部：逐帧命名 PNG + SpriteFrames.json + .tres + 精灵表
    pPipe.querySelector('#pp-dl')!.addEventListener('click', async ()=>{
      if(!frames.length) return toast(status,'请先处理',false)
      const pipe=pPipe as any; const { names, fps, animations, mf, fw, fh, perRow }=pipe._pipeline||{ names:buildFrameNaming(nameEl.value.trim()||'frame',frames.length), fps:parseInt(fpsEl.value)||8, animations:[{ name:'default', frames:frames.map((_,i)=>i), speed:parseInt(fpsEl.value)||8, loop:true }], mf:null, fw:frames[0].width, fh:frames[0].height, perRow:frames.length }
      // 逐帧下载（旧版字符为 dataURL 也可）
      for(let i=0;i<frames.length;i++){ const a=document.createElement('a'); a.href=frames[i].toDataURL(); a.download=names[i]; a.click(); await new Promise(r=>setTimeout(r,120)) }
      const sheetBuf=sheet||packRow(frames)
      const sa=document.createElement('a'); sa.href=sheetBuf.toDataURL(); sa.download=(nameEl.value.trim()||'walk')+'_spritesheet.png'; sa.click()
      if(mf){ const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const bu=URL.createObjectURL(blob); const b=document.createElement('a'); b.href=bu; b.download='SpriteFrames.json'; b.click(); setTimeout(()=>URL.revokeObjectURL(bu),3000) }
      const ts=Date.now(); const ga=document.createElement('a'); ga.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildSpriteFramesTres((nameEl.value.trim()||'walk')+'_spritesheet.png', perRow, animations, fw, fh)); ga.download='SpriteFrames_'+ts+'.tres'; ga.click()
      toast(status,'已下载 '+frames.length+' 帧 + 精灵表 + SpriteFrames', true)
    })

    // 全部入库
    pPipe.querySelector('#pp-save')!.addEventListener('click', async ()=>{
      if(!frames.length) return toast(status,'请先处理',false)
      const sheetBuf=sheet||packRow(frames); const fw=frames[0].width, fh=frames[0].height, fps=parseInt(fpsEl.value)||8, perRow=frames.length
      const id=await addToLibrary('spritesheet','流水线 '+new Date().toLocaleTimeString(), sheetBuf.toDataURL(), { cols:perRow, rows:1, fps, frameW:fw, frameH:fh, frames:frames.length, dirRows:false, dirNames:'' })
      toast(status,'已入库 '+id, true)
    })

    pPipe.querySelector('#pp-clear')!.addEventListener('click', ()=>{
      importedFiles=[]; rawFrames=[]; frames=[]; sheet=null; framesEl.innerHTML=''; packPrev.innerHTML='<span class="gas-note">等待处理</span>'
      const g=canvas.getContext('2d')!; g.clearRect(0,0,canvas.width,canvas.height)
      status.textContent='已清空'
    })
  })()

  // ---- Forge ----
  ;(()=>{
    const ta= pForge.querySelector('#f-prompts') as HTMLTextAreaElement
    const provEl= pForge.querySelector('#f-provider') as HTMLSelectElement
    const grid= pForge.querySelector('#f-grid') as HTMLElement
    const prog= pForge.querySelector('#f-prog') as HTMLElement
    const status= pForge.querySelector('#f-status') as HTMLElement
    const refPreview= pForge.querySelector('#f-ref-preview') as HTMLElement
    let refUrl=''
    pForge.querySelector('#f-ref')!.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=refUrl; img.style.maxWidth='100%'; img.style.maxHeight='70px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); const del=document.createElement('button'); del.type='button'; del.textContent='✕ 删除'; del.style.cssText='margin-top:4px;font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#2c313d;color:#e74c3c;cursor:pointer;display:block'; del.onclick=(e:any)=>{ e.stopPropagation(); refUrl=''; refPreview.innerHTML='<span class="gas-note">未添加</span>'; toast(status,'参考图已删除') }; refPreview.appendChild(del); toast(status,'参考图已添加 ✓') }
      reader.readAsDataURL(f)
    })
    // 批量队列：并发控制 + 失败重试 + 进度 + 可停止
    let forgeStop=false
    pForge.querySelector('#f-batch')!.addEventListener('click', async()=>{
      const lines=ta.value.split('\n').map(s=>s.trim()).filter(Boolean); if(!lines.length) return toast(status,'请输入 Prompt',false)
      const prov=provEl.value
      const bg=(pForge.querySelector('#f-bg') as HTMLInputElement)?.value||'#ffffff'
      const bgTrans=(pForge.querySelector('#f-bg-trans') as HTMLInputElement)?.checked===true
      const bgSuffix= bgTrans ? ', transparent background, PNG, no background' : ', solid '+bg+' background'
      const styleSel=(pForge.querySelector('#f-style') as HTMLSelectElement).value
      const styleHint = styleSel==='free' ? '' : styleSel==='icon' ? ', game asset icon, 64px, centered' : styleSel==='pixel' ? ', pixel art game asset, centered' : ', special effect, centered'
      const model=(pForge.querySelector('#f-model-sel') as HTMLSelectElement)?.value||undefined
      const batchBtn=pForge.querySelector('#f-batch') as HTMLButtonElement
      const stopBtn=pForge.querySelector('#f-stop') as HTMLButtonElement
      const CONCURRENCY=4, RETRY=3
      grid.innerHTML=''; forgeStop=false
      batchBtn.disabled=true; stopBtn.disabled=false
      let done=0
      const jobs=lines.map(line=>({ line }))
      const queue=[...jobs]
      const worker=async ()=>{
        while(queue.length && !forgeStop){
          const job=queue.shift()!; const { line }=job
          let url='', ok=false, lastErr=''
          for(let attempt=0; attempt<=RETRY && !forgeStop; attempt++){
            try{
              url=await callImageGen(line + ' , game asset' + styleHint + bgSuffix, prov, { style: styleSel, bg, bgTrans, model, reference: refUrl || undefined })
              ok=true; break
            }catch(e:any){ lastErr=String(e?.message||e); if(attempt>=RETRY) { /* 记录最后一次真实错误，见下方失败卡片 */ } }
          }
          if(ok){
            const card=document.createElement('div'); card.className='gas-thumb'; card.innerHTML='<img src="'+url+'"><div class="meta"><span>'+line.slice(0,12)+'</span><span>64px</span></div>'; grid.appendChild(card)
            pushHistory({ kind:'asset', prompt:line, url })
          }else{
            const err=document.createElement('div'); err.className='gas-thumb'; err.style.placeItems='center'; err.style.fontSize='11px'; err.style.color='#e74c3c'; err.textContent='失败:'+line.slice(0,12)+(lastErr?' · '+lastErr.slice(0,120):''); err.title=lastErr; grid.appendChild(err)
          }
          done++; prog.style.width=Math.round(done/lines.length*100)+'%'
        }
      }
      await Promise.all(Array.from({length: Math.min(CONCURRENCY, lines.length)}, worker))
      batchBtn.disabled=false; stopBtn.disabled=true
      toast(status, forgeStop?('已停止 '+done+'/'+lines.length):('批量完成 '+done+'/'+lines.length))
      prog.style.width= forgeStop ? '0%' : Math.round(done/lines.length*100)+'%'
      setTimeout(()=>prog.style.width='0%',1000)
    })
    pForge.querySelector('#f-stop')!.addEventListener('click', ()=>{ forgeStop=true; toast(status,'正在停止队列…') })
    pForge.querySelector('#f-clear')!.addEventListener('click', ()=> grid.innerHTML='')
      pForge.querySelector('#f-save-all')!.addEventListener('click', async()=>{
        const imgs=[...grid.querySelectorAll('img')] as HTMLImageElement[]; if(!imgs.length) return toast(status,'无素材可入库',false)
        let saved=0
        for(const img of imgs){ await addToLibrary('asset','素材 '+new Date().toLocaleTimeString(),img.src); saved++ }
        toast(status,'已入库 '+saved+' 个素材到「素材库」')
      })
    pForge.querySelector('#f-dl-all')!.addEventListener('click', async()=>{
      const imgs=[...grid.querySelectorAll('img')] as HTMLImageElement[]; if(!imgs.length) return toast(status,'无素材',false)
      // 逐个可靠下载（跨域远程图会自动走代理/新标签兜底，不覆盖当前页）
      for(let i=0;i<imgs.length;i++){ await downloadUrl(imgs[i].src,'asset_'+i+'.png'); await new Promise(r=>setTimeout(r,300)) }
    })
    // 本地程序化素材生成（功能借鉴 shadow_texture.gd：椭圆渐变软阴影 / 径向光晕）
    const addProc=(name:string,url:string)=>{
      const card=document.createElement('div'); card.className='gas-thumb'; card.innerHTML='<img src="'+url+'"><div class="meta"><span>'+name+'</span><span>本地</span></div>'
      grid.appendChild(card); pushHistory({ kind:'asset', prompt:name, url }); return card
    }
    pForge.querySelector('#f-shadow')!.addEventListener('click', ()=>{
      const c=document.createElement('canvas'); c.width=128; c.height=64
      const g=c.getContext('2d')!; g.clearRect(0,0,128,64)
      const img=g.createImageData(128,64), d=img.data, rx=60, ry=28, cx=64, cy=32
      for(let y=0;y<64;y++) for(let x=0;x<128;x++){
        const dx=(x-cx)/rx, dy=(y-cy)/ry, dist=dx*dx+dy*dy
        const a= dist<=1 ? 0.65*(1-dist*0.4) : 0
        const i=(y*128+x)*4; d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=Math.round(a*255)
      }
      g.putImageData(img,0,0)
      addProc('软阴影 128x64', c.toDataURL('image/png')); toast(status,'已生成软阴影素材（角色脚下阴影可直接用）✓')
    })
    pForge.querySelector('#f-glow')!.addEventListener('click', ()=>{
      const c=document.createElement('canvas'); c.width=128; c.height=128
      const g=c.getContext('2d')!
      const grad=g.createRadialGradient(64,64,2,64,64,62)
      grad.addColorStop(0,'rgba(255,255,255,0.95)'); grad.addColorStop(0.35,'rgba(255,220,160,0.55)'); grad.addColorStop(1,'rgba(255,220,160,0)')
      g.fillStyle=grad; g.fillRect(0,0,128,128)
      addProc('光晕 128x128', c.toDataURL('image/png')); toast(status,'已生成光晕素材（粒子/光效可用）✓')
    })
  })()

  // ---- Matting ----
  ;(()=>{
    const fileInput= pMat.querySelector('#m-file') as HTMLInputElement
    const drop= pMat.querySelector('#m-drop') as HTMLElement
    const modeEl= pMat.querySelector('#m-mode') as HTMLSelectElement
    const colorEl= pMat.querySelector('#m-color') as HTMLInputElement
    const tolEl= pMat.querySelector('#m-tol') as HTMLInputElement
    const tolV= pMat.querySelector('#m-tol-v') as HTMLElement
    const orig= pMat.querySelector('#m-orig') as HTMLElement
    const result= pMat.querySelector('#m-result') as HTMLElement
    const canvas= pMat.querySelector('#m-canvas') as HTMLCanvasElement
    const status= pMat.querySelector('#m-status') as HTMLElement
    const modeTip= pMat.querySelector('#m-mode-tip') as HTMLElement
    let loadedImg: HTMLImageElement|null=null
    let originalData: ImageData|null=null
    let colorTouched=false
    const state={ px:0, py:0, qx:0, qy:0, dragging:false }
    tolEl.addEventListener('input', ()=> tolV.textContent=tolEl.value)
    modeEl.addEventListener('change', ()=>{
      if(modeTip) modeTip.textContent = modeEl.value==='auto' ? '🤖 自动模式：从图片四边开始扩散扣除相连背景，适合产品图/素材图' : modeEl.value==='point' ? '🖱️ 点选保留：点击原图上要保留的元素，只留下与该点相连且颜色相近的主体（适合元素很多的图精准抠单个）' : modeEl.value==='box' ? '⬚ 框选保留：在图上拖拽框出要保留的区域，框内保留、其余透明' : modeEl.value==='wand' ? '🪄 魔棒模式：点击原图中的背景区域，即可擦除相连相似颜色' : modeEl.value==='ai' ? '🌐 AI 模式：调用 Replicate rembg（需右侧配置 Key），无 Key 时自动回退本地智能抠图' : '🎨 色键模式：点击原图拾取背景色，或直接选颜色'
    })
    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{e.preventDefault(); drop.style.borderColor='#478cbf'})
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if(f){ const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; handle(f) }})
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) handle(f) })
    async function handle(file:File){
      colorTouched=false
      const url=URL.createObjectURL(file); const img=new Image(); img.src=url; await new Promise(r=>img.onload=r); loadedImg=img
      canvas.width=img.naturalWidth||img.width; canvas.height=img.naturalHeight||img.height
      const g=canvas.getContext('2d')!; g.drawImage(img,0,0); originalData=g.getImageData(0,0,canvas.width,canvas.height)
      orig.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; im.style.maxHeight='130px'; orig.appendChild(im)
      revokeSoon(url, 8000) // 8s 后释放，足够预览渲染完成
      result.innerHTML='<span class="gas-note">等待抠图…</span>'
      im.style.cursor = modeEl.value==='wand' ? 'crosshair' : 'pointer'
      im.onclick=(e)=>{
        const rect=im.getBoundingClientRect(); const x=Math.floor((e.clientX-rect.left)/rect.width * img.naturalWidth); const y=Math.floor((e.clientY-rect.top)/rect.height * img.naturalHeight)
        if(modeEl.value==='wand'){
          doWand(x,y)
        } else if(modeEl.value==='point'){
          doPoint(x,y)
        } else if(modeEl.value==='box'){
          state.px=x; state.py=y; state.dragging=true
        } else if(modeEl.value==='chroma'){
          const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; const g2=c.getContext('2d')!; g2.drawImage(img,0,0)
          const dd=g2.getImageData(x,y,1,1).data; const hex='#'+[dd[0],dd[1],dd[2]].map(v=>v.toString(16).padStart(2,'0')).join(''); colorEl.value=hex; colorTouched=true
        } else if(modeEl.value==='auto'){
          toast(status,'自动抠图无需点击，直接点「✂️ 一键抠图」即可')
        }
      }
      // box 模式：拖拽框选
      im.onmousemove=(e)=>{
        if(!state.dragging || modeEl.value!=='box') return
        const rect=im.getBoundingClientRect(); const x=Math.floor((e.clientX-rect.left)/rect.width * img.naturalWidth); const y=Math.floor((e.clientY-rect.top)/rect.height * img.naturalHeight)
        state.qx=x; state.qy=y
      }
      im.onmouseup=(e)=>{
        if(!state.dragging || modeEl.value!=='box') return
        state.dragging=false
        const rect=im.getBoundingClientRect(); const x=Math.floor((e.clientX-rect.left)/rect.width * img.naturalWidth); const y=Math.floor((e.clientY-rect.top)/rect.height * img.naturalHeight)
        doBox(state.px,state.py,x,y)
      }
    }

    // 点选保留主体：从点击点做颜色连通区域生长，只保留相连且颜色相近的主体
    function doPoint(sx:number, sy:number){
      if(!originalData) return
      const w=canvas.width, h=canvas.height
      const g=canvas.getContext('2d')!; g.putImageData(originalData,0,0)
      const imgData=g.getImageData(0,0,w,h); const d=imgData.data
      if(sx<0||sy<0||sx>=w||sy>=h) return
      const seedIdx=sy*w+sx
      const sr=d[seedIdx*4], sg=d[seedIdx*4+1], sb=d[seedIdx*4+2]
      const T=parseInt(tolEl.value)||30
      const keep=new Uint8Array(w*h)
      const stack=[seedIdx]; keep[seedIdx]=1
      while(stack.length){
        const idx=stack.pop()!
        const y=Math.floor(idx/w), x=idx%w
        const neighbors=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]
        for(const [nx,ny] of neighbors){
          if(nx<0||ny<0||nx>=w||ny>=h) continue
          const ni=ny*w+nx
          if(keep[ni]) continue
          const dr=d[ni*4]-sr, dg=d[ni*4+1]-sg, db=d[ni*4+2]-sb
          const dist=Math.sqrt(dr*dr+dg*dg+db*db)
          if(dist<T){ keep[ni]=1; stack.push(ni) }
        }
      }
      for(let i=0;i<keep.length;i++){ if(!keep[i]) d[i*4+3]=0 }
      g.putImageData(imgData,0,0)
      keepLargest()
      renderResult()
      toast(status,'点选保留完成：已留下与所选点相连的主体，其余透明')
    }
    // 框选保留：保留框内区域，其余透明
    function doBox(x1:number,y1:number,x2:number,y2:number){
      if(!originalData) return
      const w=canvas.width, h=canvas.height
      const g=canvas.getContext('2d')!; g.putImageData(originalData,0,0)
      const imgData=g.getImageData(0,0,w,h); const d=imgData.data
      const xa=Math.max(0,Math.min(x1,x2)), xb=Math.min(w-1,Math.max(x1,x2))
      const ya=Math.max(0,Math.min(y1,y2)), yb=Math.min(h-1,Math.max(y1,y2))
      for(let y=0;y<h;y++) for(let x=0;x<w;x++){
        if(!(x>=xa&&x<=xb&&y>=ya&&y<=yb)){ const i=(y*w+x)*4; d[i+3]=0 }
      }
      g.putImageData(imgData,0,0)
      renderResult()
      toast(status,'框选保留完成：已保留框内区域，其余透明')
    }

    function renderResult(){
      result.innerHTML=''; const out=document.createElement('img'); out.src=canvas.toDataURL('image/png'); out.style.maxWidth='100%'; out.style.maxHeight='180px'; result.appendChild(out)
      ;(pMat.querySelector('#m-dl') as HTMLButtonElement).disabled=false
      ;(pMat.querySelector('#m-save') as HTMLButtonElement).disabled=false
      pushHistory({ kind:'matting', url: canvas.toDataURL() })
    }

    function doFlood(seeds: number[][], tolerance: number){
      if(!originalData) return
      const g=canvas.getContext('2d')!; g.putImageData(originalData,0,0)
      const w=canvas.width, h=canvas.height
      const imgData=g.getImageData(0,0,w,h); const d=imgData.data
      const visited=new Uint8Array(w*h)
      const queue: number[] = []
      const push=(idx:number)=>{ if(!visited[idx]){ visited[idx]=1; queue.push(idx) } }
      for(const [sx,sy] of seeds){ if(sx>=0&&sy>=0&&sx<w&&sy<h) push(sy*w+sx) }
      const T=tolerance*2.5
      while(queue.length){
        const idx=queue.shift()!
        const y=Math.floor(idx/w), x=idx%w
        d[idx+3]=0
        const r=d[idx], gg=d[idx+1], b=d[idx+2]
        const neighbors=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]
        for(const [nx,ny] of neighbors){
          if(nx<0||ny<0||nx>=w||ny>=h) continue
          const ni=ny*w+nx
          if(visited[ni]) continue
          const dr=d[ni]-r, dg=d[ni+1]-gg, db=d[ni+2]-b
          const dist=Math.sqrt(dr*dr+dg*dg+db*db)
          if(dist<T) push(ni)
        }
      }
      g.putImageData(imgData,0,0)
      keepLargest()
      renderResult()
    }
    // 去残留：只保留面积最大的连通主体（借鉴 MapStitch 的边缘愈合/透空思路）
    function keepLargest(){
      const chk=(pMat.querySelector('#m-keep') as HTMLInputElement)?.checked
      if(!chk) return
      const w=canvas.width, h=canvas.height
      const g0=canvas.getContext('2d')!; const imgData=g0.getImageData(0,0,w,h); const d=imgData.data
      const labels=new Int32Array(w*h); labels.fill(-1)
      const stack:number[]=[]; let label=0; const counts:number[]=[]
      for(let y=0;y<h;y++) for(let x=0;x<w;x++){
        const idx=y*w+x
        if(d[idx*4+3]>10 && labels[idx]<0){
          labels[idx]=label; counts[label]=0; stack.push(idx)
          while(stack.length){
            const i=stack.pop()!; counts[label]++
            const yy=Math.floor(i/w), xx=i%w
            if(xx+1<w && labels[i+1]<0 && d[(i+1)*4+3]>10){ labels[i+1]=label; stack.push(i+1) }
            if(xx-1>=0 && labels[i-1]<0 && d[(i-1)*4+3]>10){ labels[i-1]=label; stack.push(i-1) }
            if(yy+1<h && labels[i+w]<0 && d[(i+w)*4+3]>10){ labels[i+w]=label; stack.push(i+w) }
            if(yy-1>=0 && labels[i-w]<0 && d[(i-w)*4+3]>10){ labels[i-w]=label; stack.push(i-w) }
          }
          label++
        }
      }
      let best=-1,bestN=-1
      for(let i=0;i<counts.length;i++) if(counts[i]>bestN){ bestN=counts[i]; best=i }
      for(let i=0;i<labels.length;i++){ if(labels[i]!==best) d[i*4+3]=0 }
      g0.putImageData(imgData,0,0)
    }

    function doAuto(){
      if(!originalData) return
      const w=canvas.width, h=canvas.height
      const seeds: number[][]=[]
      for(let x=0;x<w;x++){ seeds.push([x,0]); seeds.push([x,h-1]) }
      for(let y=0;y<h;y++){ seeds.push([0,y]); seeds.push([w-1,y]) }
      doFlood(seeds, parseInt(tolEl.value)||30)
      toast(status,'智能自动抠背景完成（已移除与四边相连的背景）')
    }

    function doWand(x:number,y:number){
      if(!originalData) return
      doFlood([[x,y]], parseInt(tolEl.value)||30)
      toast(status,'魔棒已擦除相连背景')
    }

    function doChroma(){
      if(!loadedImg) return
      const tol=parseInt(tolEl.value); let target=colorEl.value
      // 未手动拾色时：任意纯色底识别 —— 取外沿 4px 边框的众数颜色
      if(!colorTouched){
        const cs=document.createElement('canvas'); cs.width=loadedImg.naturalWidth; cs.height=loadedImg.naturalHeight
        const cg=cs.getContext('2d')!; cg.drawImage(loadedImg,0,0)
        const d=cg.getImageData(0,0,cs.width,cs.height).data
        const bw=4; const buckets=new Map<string,{n:number,r:number,g:number,b:number}>()
        for(let y=0;y<cs.height;y++) for(let x=0;x<cs.width;x++){
          if(x>=bw && y>=bw && x<cs.width-bw && y<cs.height-bw) continue
          const i=(y*cs.width+x)*4
          const k=String(((d[i]>>4)<<8)|((d[i+1]>>4)<<4)|(d[i+2]>>4))
          const b=buckets.get(k)||{n:0,r:0,g:0,b:0}; b.n++; b.r+=d[i]; b.g+=d[i+1]; b.b+=d[i+2]; buckets.set(k,b)
        }
        let best:any=null
        for(const b of buckets.values()) if(!best||b.n>best.n) best=b
        colorEl.value='#'+[Math.round(best.r/best.n),Math.round(best.g/best.n),Math.round(best.b/best.n)].map(v=>v.toString(16).padStart(2,'0')).join('')
        target=colorEl.value
      }
      const tr=parseInt(target.slice(1,3),16), tg=parseInt(target.slice(3,5),16), tb=parseInt(target.slice(5,7),16)
      const feather=parseInt((pMat.querySelector('#m-feather') as HTMLInputElement).value)||0
      canvas.width=loadedImg.naturalWidth; canvas.height=loadedImg.naturalHeight; const g=canvas.getContext('2d')!; g.drawImage(loadedImg,0,0)
      const imgData=g.getImageData(0,0,canvas.width,canvas.height); const d=imgData.data
      for(let i=0;i<d.length;i+=4){
        const dist=Math.sqrt((d[i]-tr)**2 + (d[i+1]-tg)**2 + (d[i+2]-tb)**2)
        if(dist < tol*2.5){ const a=Math.max(0, (dist - tol*0.5)/ (tol*1.5))*255; d[i+3]= feather? Math.min(255, a+feather*8) : a<80?0:a }
      }
      g.putImageData(imgData,0,0)
      keepLargest()
      renderResult()
      toast(status,'色键抠图完成，可下载透明 PNG')
    }

    async function doAi(){
      if(!originalData) return
      const keys=getKeys()
      if(!keys.replicate){
        toast(status,'未配置 Replicate Key，已自动使用本地智能抠背景', false)
        doAuto(); return
      }
      status.textContent='AI 抠图请求中…'
      try{
        const dataUrl=canvas.toDataURL('image/png')
        const r=await fetch('https://api.replicate.com/v1/models/cjwbw/rembg/predictions',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+keys.replicate }, body:JSON.stringify({ input: { image: dataUrl } }) })
        if(!r.ok) throw new Error('Replicate '+r.status+': '+await r.text().then(t=>t.slice(0,120)))
        const pred=await r.json()
        const MAX_WAIT=90 // 秒，超时则回退本地抠图
        for(let i=0;i<MAX_WAIT;i++){
          await new Promise(res=>setTimeout(res,1000))
          const pr=await fetch(pred.urls?.get,{ headers:{ 'Authorization':'Bearer '+keys.replicate } })
          const pj=await pr.json()
          if(pj.status==='succeeded' && pj.output){
            const outUrl=Array.isArray(pj.output)?pj.output[0]:pj.output
            const img=new Image(); img.crossOrigin='anonymous'; img.src=outUrl; await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej })
            canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; const g=canvas.getContext('2d')!; g.drawImage(img,0,0)
            renderResult(); toast(status,'AI 抠图完成 ✓')
            return
          }
          if(pj.status==='failed') throw new Error('Replicate 处理失败（'+(pj.error||'').slice(0,60)+'）')
          if(i%10===0 && i>0) toast(status,'AI 抠图中…('+(i)+'s/'+MAX_WAIT+'s)，请稍候', true)
        }
        throw new Error('AI 抠图等待超 ' + MAX_WAIT + ' 秒（网络慢或模型排队中），已自动切换本地智能抠图')
      }catch(e:any){
        toast(status,'AI 抠图失败，已回退本地智能抠背景：'+String(e.message||e).slice(0,100), false)
        doAuto()
      }
    }

    pMat.querySelector('#m-cut')!.addEventListener('click', async()=>{
      if(!loadedImg) return toast(status,'请先上传',false)
      const mode=modeEl.value
      if(mode==='auto') doAuto()
      else if(mode==='point') toast(status,'请点击原图上要保留的元素，即可只留下主体')
      else if(mode==='box') toast(status,'请在原图上按住鼠标拖拽框出要保留的区域')
      else if(mode==='wand') toast(status,'请点击原图中的背景区域来擦除')
      else if(mode==='ai') await doAi()
      else doChroma()
    })
    pMat.querySelector('#m-reset')!.addEventListener('click', ()=>{
      if(!originalData) return
      const g=canvas.getContext('2d')!; g.putImageData(originalData,0,0)
      result.innerHTML='<span class="gas-note">已重置</span>'; (pMat.querySelector('#m-dl') as HTMLButtonElement).disabled=true
    })
    pMat.querySelector('#m-dl')!.addEventListener('click', ()=>{ const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='matting_'+Date.now()+'.png'; a.click() })
      pMat.querySelector('#m-save')!.addEventListener('click', async()=>{ const id=await addToLibrary('matting','抠图 '+new Date().toLocaleTimeString(),canvas.toDataURL('image/png')); toast(status,'已入库 '+id) })
  })()

  // ---- Map ----
  ;(()=>{
    const fileInput= pMap.querySelector('#map-file') as HTMLInputElement
    const promptEl= pMap.querySelector('#map-prompt') as HTMLInputElement
    const modeTypeEl= pMap.querySelector('#map-mode-type') as HTMLSelectElement
    const providerEl= pMap.querySelector('#map-provider') as HTMLSelectElement
    const preview= pMap.querySelector('#map-preview') as HTMLElement
    const canvas= pMap.querySelector('#map-canvas') as HTMLCanvasElement
    const tiledCanvas= pMap.querySelector('#map-tiled-canvas') as HTMLCanvasElement
    const status= pMap.querySelector('#map-status') as HTMLElement
    const refPreview= pMap.querySelector('#map-ref-preview') as HTMLElement
    const mapProgress= pMap.querySelector('#map-progress') as HTMLElement
    let curImg: HTMLImageElement|null=null
    let corsSafe=true
    let mapRefUrl=''
    function startMapProgress(){ if(!mapProgress) return; mapProgress.style.display='block'; const i=mapProgress.querySelector('i') as HTMLElement; if(i){ i.style.width='15%'; const t=setInterval(()=>{ const w=parseFloat(i.style.width)||15; if(w<85){ i.style.width=Math.min(85,w+Math.random()*12)+'%' } },400); (mapProgress as any)._timer=t } }
    function finishMapProgress(){ if(!mapProgress) return; const i=mapProgress.querySelector('i') as HTMLElement; if(i) i.style.width='100%'; const t=(mapProgress as any)._timer; if(t) clearInterval(t); setTimeout(()=>{ if(mapProgress) mapProgress.style.display='none'; if(i) i.style.width='0%' },800) }

    const modeTip= pMap.querySelector('#map-mode-tip') as HTMLElement
    const modeLabels:Record<string,string>={ tile:'🧩 瓦片模式：AI 生成单块可平铺瓦片 → 可生成高分辨率瓦片大地图 / TileSet', fullmap:'🌍 完整大地图模式：AI 直接生成一张完整无缝大地图 → 可作为场景整图，也可切成 TileSet' }
    modeTypeEl.addEventListener('change', ()=>{ if(modeTip) modeTip.textContent=modeLabels[modeTypeEl.value]||'' })

    function showPreview(img:HTMLImageElement, safe=true){ curImg=img; corsSafe=safe; preview.innerHTML=''; const im=document.createElement('img'); im.src=img.src; im.style.maxWidth='100%'; im.style.maxHeight='160px'; im.style.imageRendering='pixelated'; preview.appendChild(im); try{ updateTiled() }catch{} }
    function loadImg(src:string, cors=true):Promise<HTMLImageElement>{ return new Promise((res,rej)=>{ const i=new Image(); if(cors) i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=()=>{ if(cors){ loadImg(src,false).then(img=>{ corsSafe=false; res(img) }).catch(rej) } else rej(new Error('图片加载失败')) }; i.src=src }) }
    function updateTiled(){ if(!curImg) return; const g=tiledCanvas.getContext('2d')!; g.clearRect(0,0,tiledCanvas.width,tiledCanvas.height); g.imageSmoothingEnabled=false; const s=32; for(let y=0;y<3;y++) for(let x=0;x<3;x++) g.drawImage(curImg, x*s, y*s, s, s) }

    let bigMapUrl=''; let bigZoom=1
    const bigViewport= pMap.querySelector('#map-big-viewport') as HTMLElement
    const bigImg= pMap.querySelector('#map-big-img') as HTMLImageElement
    const bigEmpty= pMap.querySelector('#map-big-empty') as HTMLElement
    function fitBigMap(){ if(!bigImg || !bigImg.src) return; const vw=bigViewport.clientWidth-20, vh=bigViewport.clientHeight-20; const nw=parseInt(bigImg.dataset.naturalWidth||'2048'), nh=parseInt(bigImg.dataset.naturalHeight||'2048'); bigZoom=Math.max(0.02, Math.min(1, vw/nw, vh/nh)); bigImg.style.width=Math.floor(nw*bigZoom)+'px'; bigImg.style.height='auto' }
    function applyBigZoom(){ if(!bigImg || !bigImg.src) return; const nw=parseInt(bigImg.dataset.naturalWidth||'2048'); bigImg.style.width=Math.floor(nw*bigZoom)+'px'; bigImg.style.height='auto' }
    function setBigMap(src:string,w:number,h:number){ bigMapUrl=src; bigImg.src=src; bigImg.style.display='block'; bigImg.dataset.naturalWidth=String(w); bigImg.dataset.naturalHeight=String(h); if(bigEmpty) bigEmpty.style.display='none'; fitBigMap() }

    fileInput.addEventListener('change', async()=>{ const f=fileInput.files?.[0]; if(!f) return; const url=URL.createObjectURL(f); const img=await loadImg(url); showPreview(img,true); revokeSoon(url, 8000) })

    pMap.querySelector('#map-ref')!.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ mapRefUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=mapRefUrl; img.style.maxWidth='100%'; img.style.maxHeight='70px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); const del=document.createElement('button'); del.type='button'; del.textContent='✕ 删除'; del.style.cssText='margin-top:4px;font-size:10px;padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#2c313d;color:#e74c3c;cursor:pointer;display:block'; del.onclick=(e:any)=>{ e.stopPropagation(); mapRefUrl=''; refPreview.innerHTML='<span class="gas-note">未添加</span>'; toast(status,'参考图已删除') }; refPreview.appendChild(del); toast(status,'参考图已添加 ✓') }
      reader.readAsDataURL(f)
    })
    pMap.querySelector('#map-gen')!.addEventListener('click', async()=>{
      const prompt=promptEl.value.trim(); if(!prompt) return toast(status,'请先输入提示词',false)
      const prov=providerEl.value
      const mode=modeTypeEl.value
      startMapProgress()
      try{
        if(mode==='fullmap'){
          const targetSize=parseInt((pMap.querySelector('#map-big-size') as HTMLSelectElement).value)||2048
          const size=targetSize+'x'+targetSize
          const url=await callImageGen(prompt+' , full seamless game map, top-down, high detail, tileable, no UI, no watermark', prov, { size, model: (pMap.querySelector('#map-model-sel') as HTMLSelectElement)?.value||undefined, reference: mapRefUrl || undefined })
          const img=await loadImg(url)
          showPreview(img, corsSafe)
          if(corsSafe){ setBigMap(img.src, img.naturalWidth||targetSize, img.naturalHeight||targetSize); toast(status,'完整大地图已生成：'+(img.naturalWidth||targetSize)+'×'+(img.naturalHeight||targetSize), true) }
          else toast(status,'完整大地图已生成（远程直链）', false)
        } else {
          const ts=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
          const url=await callImageGen(prompt+' , seamless tileable texture, '+ts+'px', prov, { model: (pMap.querySelector('#map-model-sel') as HTMLSelectElement)?.value||undefined, reference: mapRefUrl || undefined })
          const img=await loadImg(url)
          showPreview(img, corsSafe)
          setBigMap(img.src, img.naturalWidth||256, img.naturalHeight||256)
          toast(status,corsSafe?'瓦片已生成':'瓦片已生成（远程直链）', !!corsSafe)
        }
        finishMapProgress()
      }catch(e:any){ finishMapProgress(); toast(status,String(e.message||e),false) }
    })

    pMap.querySelector('#map-seam')!.addEventListener('click', async()=>{
      if(!curImg) return toast(status,'请先生成/上传图片',false)
      if(!corsSafe){ toast(status,'远程图片未开启CORS，请先下载到本地再上传',false); return }
      const mode=modeTypeEl.value
      const tileSize=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
      try{
        if(mode==='fullmap'){
          const w=curImg.naturalWidth||curImg.width, h=curImg.naturalHeight||curImg.height
          canvas.width=w; canvas.height=h; const g=canvas.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(curImg,0,0,w,h)
          const imgData=g.getImageData(0,0,w,h); const d=imgData.data
          const blend=Math.max(4, Math.floor(Math.min(w,h)*0.06))
          for(let y=0;y<h;y++) for(let x=0;x<blend;x++){
            const li=(y*w+x)*4, ri=(y*w+(w-1-x))*4; const a=x/blend
            for(let k=0;k<3;k++){ d[li+k]=d[li+k]*a+d[ri+k]*(1-a); d[ri+k]=d[li+k] }
          }
          for(let x=0;x<w;x++) for(let y=0;y<blend;y++){
            const ti=(y*w+x)*4, bi=((h-1-y)*w+x)*4; const a=y/blend
            for(let k=0;k<3;k++){ d[ti+k]=d[ti+k]*a+d[bi+k]*(1-a); d[bi+k]=d[ti+k] }
          }
          g.putImageData(imgData,0,0)
          const outUrl=canvas.toDataURL('image/png'); const img=await loadImg(outUrl); showPreview(img,true); setBigMap(outUrl,w,h)
          toast(status,'完整大地图无缝化完成',true)
        } else {
          const size=tileSize
          canvas.width=size; canvas.height=size; const g=canvas.getContext('2d')!; g.imageSmoothingEnabled=false; g.drawImage(curImg,0,0,size,size)
          const imgData=g.getImageData(0,0,size,size); const d=imgData.data
          const blend=8
          for(let y=0;y<size;y++) for(let x=0;x<blend;x++){
            const li=(y*size+x)*4, ri=(y*size+(size-1-x))*4; const a=x/blend
            for(let k=0;k<3;k++){ d[li+k]=d[li+k]*a+d[ri+k]*(1-a); d[ri+k]=d[li+k] }
          }
          for(let x=0;x<size;x++) for(let y=0;y<blend;y++){
            const ti=(y*size+x)*4, bi=((size-1-y)*size+x)*4; const a=y/blend
            for(let k=0;k<3;k++){ d[ti+k]=d[ti+k]*a+d[bi+k]*(1-a); d[bi+k]=d[ti+k] }
          }
          g.putImageData(imgData,0,0)
          const outUrl=canvas.toDataURL('image/png'); const img=await loadImg(outUrl); showPreview(img); pushHistory({ kind:'tile', url:outUrl, size })
          toast(status,'瓦片无缝化完成',true)
        }
      }catch(e:any){ toast(status,'无缝化失败：'+String(e.message||e).slice(0,80),false) }
    })

    pMap.querySelector('#map-wang')!.addEventListener('click', async()=>{
      if(!curImg) return toast(status,'请先准备图片',false)
      if(!corsSafe){ toast(status,'远程图片未开启CORS，无法处理',false); return }
      const size=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
      canvas.width=size*2; canvas.height=size*2; const g=canvas.getContext('2d')!; g.imageSmoothingEnabled=false
      // 镜像四象限：原 / 水平翻转 / 垂直翻转 / 双向翻转 —— 相邻边像素天然连续，无限平铺也无接缝
      g.drawImage(curImg, 0, 0)
      g.save(); g.translate(size*2,0); g.scale(-1,1); g.drawImage(curImg, 0, 0); g.restore()   // 右：水平镜像
      g.save(); g.translate(0,size*2); g.scale(1,-1); g.drawImage(curImg, 0, 0); g.restore()   // 下：垂直镜像
      g.save(); g.translate(size*2,size*2); g.scale(-1,-1); g.drawImage(curImg, 0, 0); g.restore() // 右下：双向镜像
      const url=canvas.toDataURL('image/png')
      preview.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; preview.appendChild(im)
      curImg=await loadImg(url); updateTiled()
      toast(status,'镜像无缝 2×2 已生成（可点「生成大地图」得到完全无缝平铺）',true)
    })

    pMap.querySelector('#map-big')?.addEventListener('click', ()=>{
      if(modeTypeEl.value==='fullmap'){ if(!bigMapUrl) return toast(status,'请先生成完整大地图',false); fitBigMap(); toast(status,'已调整完整大地图预览',true); return }
      if(!curImg) return toast(status,'请先准备瓦片',false)
      if(!corsSafe){ toast(status,'远程瓦片未开启CORS，无法生成大地图',false); return }
      const tileSize=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
      const targetSize=parseInt((pMap.querySelector('#map-big-size') as HTMLSelectElement).value)||2048
      const tiles=Math.max(1, Math.round(targetSize/tileSize))
      const big=document.createElement('canvas'); big.width=tiles*tileSize; big.height=tiles*tileSize
      const g=big.getContext('2d')!; g.imageSmoothingEnabled=false
      for(let y=0;y<tiles;y++) for(let x=0;x<tiles;x++) g.drawImage(curImg, x*tileSize, y*tileSize, tileSize, tileSize)
      const url=big.toDataURL('image/png')
      setBigMap(url, big.width, big.height)
      toast(status,'高分辨率瓦片大地图已生成：'+big.width+'×'+big.height, true)
    })

    function downloadDataUrl(dataUrl:string, filename:string){ const a=document.createElement('a'); a.href=dataUrl; a.download=filename; a.click() }
    pMap.querySelector('#map-split')!.addEventListener('click', ()=>{
      if(!curImg) return toast(status,'请先生成/上传图片',false)
      if(!corsSafe){ toast(status,'远程图片未开启CORS，无法自动切片',false); return }
      const tileSize=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
      const w=curImg.naturalWidth||curImg.width, h=curImg.naturalHeight||curImg.height
      const cols=Math.max(1, Math.floor(w/tileSize)), rows=Math.max(1, Math.floor(h/tileSize))
      const ts=document.createElement('canvas'); ts.width=cols*tileSize; ts.height=rows*tileSize
      const g=ts.getContext('2d')!; g.imageSmoothingEnabled=false
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) g.drawImage(curImg, x*tileSize, y*tileSize, tileSize, tileSize, x*tileSize, y*tileSize, tileSize, tileSize)
      const tsUrl=ts.toDataURL('image/png')
      const json:any={ godot:'TileSet', tile_size:tileSize, columns:cols, rows:rows, image:'tileset.png', tiles:[] }
      for(let i=0;i<cols*rows;i++) json.tiles.push({ id:i, region:[(i%cols)*tileSize, Math.floor(i/cols)*tileSize, tileSize, tileSize], collision:false })
      const ts3=Date.now()
      downloadDataUrl(tsUrl,'tileset_'+ts3+'.png'); downloadBlob(new Blob([JSON.stringify(json,null,2)],{type:'application/json'}),'TileSet.json')
      // Godot 原生 .tres：引用同目录 tileset PNG,拖入即用
      const t3=document.createElement('a'); t3.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildTileSetTres('tileset_'+ts3+'.png', cols, rows, tileSize)); t3.download='TileSet_'+ts3+'.tres'; t3.click()
      toast(status,'已切成 TileSet：'+cols+'×'+rows+'（'+ts.width+'×'+ts.height+'）+ TileSet.tres（PNG 同目录拖入 Godot 即用）', true)
    })

    pMap.querySelector('#map-dl')!.addEventListener('click', async()=>{
      if(!curImg) return toast(status,'无图片',false)
      await downloadUrl(curImg.src||'', 'map_'+Date.now()+'.png')
      toast(status,'已下载 PNG',true)
    })
    pMap.querySelector('#map-export')!.addEventListener('click', ()=>{ (pMap.querySelector('#map-split') as HTMLButtonElement)?.click?.() })

    pMap.querySelector('#map-zoom-in')!.addEventListener('click', ()=>{ bigZoom*=1.5; applyBigZoom() })
    pMap.querySelector('#map-zoom-out')!.addEventListener('click', ()=>{ bigZoom/=1.5; applyBigZoom() })
    pMap.querySelector('#map-zoom-fit')!.addEventListener('click', fitBigMap)
    pMap.querySelector('#map-zoom-reset')!.addEventListener('click', ()=>{ bigZoom=1; applyBigZoom() })
    pMap.querySelector('#map-big-dl')!.addEventListener('click', ()=>{ if(!bigMapUrl) return toast(status,'请先生成大地图',false); downloadDataUrl(bigMapUrl,'bigmap_'+Date.now()+'.png'); toast(status,'高清 PNG 已下载',true) })
    pMap.querySelector('#map-save')!.addEventListener('click', async()=>{ if(!bigMapUrl) return toast(status,'请先生成大地图',false); const kind=modeTypeEl.value==='fullmap'?'map':'tile'; const id=await addToLibrary(kind,kind==='map'?'大地图 ':'瓦片 '+new Date().toLocaleTimeString(),bigMapUrl); toast(status,'已入库 '+id) })
    bigViewport.addEventListener('wheel', (e:any)=>{ e.preventDefault(); bigZoom*= e.deltaY<0 ? 1.2 : 0.8; applyBigZoom() }, { passive:false } as any)
    let mapDrag=false, mapDragX=0, mapDragY=0, mapScrollL=0, mapScrollT=0
    bigImg.addEventListener('mousedown', (e:any)=>{ mapDrag=true; mapDragX=e.clientX; mapDragY=e.clientY; mapScrollL=bigViewport.scrollLeft; mapScrollT=bigViewport.scrollTop; bigImg.style.cursor='grabbing' })
    window.addEventListener('mouseup', ()=>{ mapDrag=false; bigImg.style.cursor='grab' })
    bigViewport.addEventListener('mousemove', (e:any)=>{ if(mapDrag){ bigViewport.scrollLeft=mapScrollL-(e.clientX-mapDragX); bigViewport.scrollTop=mapScrollT-(e.clientY-mapDragY) } })
  })()
  // ---- Post processing ----
  ;(()=>{
    const drop= pPost.querySelector('#post-drop') as HTMLElement
    const fileInput= pPost.querySelector('#post-file') as HTMLInputElement
    const opEl= pPost.querySelector('#post-op') as HTMLSelectElement
    const paramEl= pPost.querySelector('#post-param') as HTMLInputElement
    const preview= pPost.querySelector('#post-preview') as HTMLElement
    const canvas= pPost.querySelector('#post-canvas') as HTMLCanvasElement
    const status= pPost.querySelector('#post-status') as HTMLElement
    const dlBtn= pPost.querySelector('#post-dl') as HTMLButtonElement
    const saveBtn= pPost.querySelector('#post-save') as HTMLButtonElement
    let loadedImg: HTMLImageElement|null=null
    let resultUrl=''

    function loadImage(src:string):Promise<HTMLImageElement>{ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src }) }

    async function handleFile(file:File){
      const url=URL.createObjectURL(file); loadedImg=await loadImage(url); revokeSoon(url, 8000)
      preview.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; im.style.maxHeight='180px'; preview.appendChild(im)
      resultUrl=''; dlBtn.disabled=true; toast(status,'已上传，选择操作后点「执行」')
    }

    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.style.borderColor='#478cbf' })
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if(f){ const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; handleFile(f) } })
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) handleFile(f) })

    pPost.querySelector('#post-run')!.addEventListener('click', ()=>{
      if(!loadedImg) return toast(status,'请先上传图片',false)
      const op=opEl.value
      const w=loadedImg.naturalWidth||loadedImg.width, h=loadedImg.naturalHeight||loadedImg.height
      canvas.width=w; canvas.height=h; const g=canvas.getContext('2d')!; g.imageSmoothingEnabled=false; g.clearRect(0,0,w,h); g.drawImage(loadedImg,0,0)
      try{
        if(op==='palette'){
          const colors=Math.max(2, parseInt(paramEl.value)||16)
          const levels=Math.max(2, Math.ceil(Math.pow(colors,1/3)))
          const imgData=g.getImageData(0,0,w,h); const d=imgData.data
          for(let i=0;i<d.length;i+=4){
            for(let k=0;k<3;k++){
              const step=255/(levels-1)
              d[i+k]=Math.round(Math.round(d[i+k]/step)*step)
            }
          }
          g.putImageData(imgData,0,0)
          toast(status,'调色板量化完成（约 '+Math.min(colors, levels*levels*levels)+' 色）', true)
        } else if(op==='outline'){
          const thickness=Math.max(1, parseInt(paramEl.value)||2)
          const imgData=g.getImageData(0,0,w,h); const d=imgData.data
          const srcData=new Uint8ClampedArray(d)
          for(let y=0;y<h;y++){
            for(let x=0;x<w;x++){
              const idx=(y*w+x)*4
              if(srcData[idx+3]===0) continue
              for(let oy=-thickness;oy<=thickness;oy++){
                for(let ox=-thickness;ox<=thickness;ox++){
                  const nx=x+ox, ny=y+oy
                  if(nx<0||ny<0||nx>=w||ny>=h) continue
                  const ni=(ny*w+nx)*4
                  if(srcData[ni+3]===0){
                    d[ni]=0; d[ni+1]=0; d[ni+2]=0; d[ni+3]=255
                  }
                }
              }
            }
          }
          g.putImageData(imgData,0,0)
          toast(status,'精灵描边完成（黑色 '+thickness+'px）', true)
        } else if(op==='resize'){
          const target=Math.max(1, parseInt(paramEl.value)||64)
          canvas.width=target; canvas.height=Math.max(1, Math.round(h*target/w)); const g2=canvas.getContext('2d')!; g2.imageSmoothingEnabled=false; g2.clearRect(0,0,target,canvas.height); g2.drawImage(loadedImg,0,0,target,canvas.height)
          toast(status,'尺寸调整完成 → '+canvas.width+'×'+canvas.height, true)
        } else if(op==='9patch'){
          // 9-patch: UI 面板九宫格 + 生成 Godot StyleBoxTexture 资源
          const imgData=g.getImageData(0,0,w,h); const d=imgData.data
          // 自动检测:第一行/第一列的黑色像素 = stretch 区
          let stretchTop=0, stretchLeft=0
          outer: for(let y=0;y<h;y++){ for(let x=0;x<w;x++){ const i=(y*w+x)*4; if(d[i]>10||d[i+1]>10||d[i+2]>10){ stretchTop=y; break outer } } }
          outer: for(let x=0;x<w;x++){ for(let y=0;y<h;y++){ const i=(y*w+x)*4; if(d[i]>10||d[i+1]>10||d[i+2]>10){ stretchLeft=x; break outer } } }
          // 第二遍检测 stretchBottom/Right (从底部/右部往内)
          let stretchBottom=h, stretchRight=w
          outer: for(let y=h-1;y>=0;y--){ for(let x=0;x<w;x++){ const i=(y*w+x)*4; if(d[i]>10||d[i+1]>10||d[i+2]>10){ stretchBottom=y+1; break outer } } }
          outer: for(let x=w-1;x>=0;x--){ for(let y=0;y<h;y++){ const i=(y*w+x)*4; if(d[i]>10||d[i+1]>10||d[i+2]>10){ stretchRight=x+1; break outer } } }
          const marginL=stretchLeft, marginR=w-stretchRight, marginT=stretchTop, marginB=h-stretchBottom
          // 生成 .tres (Godot 4 StyleBoxTexture)：九宫格边距属性为 texture_margin_*（Godot 3 的 margin_* 已失效）
          const pngName='9patch_panel.png'
          const tres=`[gd_resource type="StyleBoxTexture" load_steps=2 format=3]\n\n[ext_resource type="Texture2D" path="res://ui/${pngName}" id="1_panel"]\n\n[resource]\ntexture = ExtResource("1_panel")\ntexture_margin_left = ${marginL}\ntexture_margin_top = ${marginT}\ntexture_margin_right = ${marginR}\ntexture_margin_bottom = ${marginB}\n`
          const patchCanvas=document.createElement('canvas'); patchCanvas.width=w; patchCanvas.height=h
          const pg=patchCanvas.getContext('2d')!; pg.imageSmoothingEnabled=false; pg.drawImage(loadedImg,0,0)
          const pngData=patchCanvas.toDataURL('image/png')
          downloadUrl(pngData,pngName)
          setTimeout(()=>downloadBlob(new Blob([tres],{type:'text/plain'}),'panel_stylebox.tres'),300)
          canvas.width=w; canvas.height=h; const pg2=canvas.getContext('2d')!; pg2.imageSmoothingEnabled=false; pg2.clearRect(0,0,w,h); pg2.drawImage(loadedImg,0,0)
          // 在预览上画 9 宫格标记
          pg2.strokeStyle='rgba(255,100,100,0.7)'; pg2.lineWidth=1; pg2.setLineDash([4,4])
          pg2.strokeRect(stretchLeft+0.5,0.5,w-stretchLeft-stretchRight-1,stretchTop-0.5)
          pg2.strokeStyle='rgba(100,100,255,0.7)'
          pg2.strokeRect(stretchLeft+0.5,stretchBottom+0.5,w-stretchLeft-stretchRight-1,h-stretchBottom-stretchTop-1)
          toast(status,'9-patch 已导出 PNG + StyleBoxTexture.tres（可调边距: 左'+marginL+' 右'+marginR+' 上'+marginT+' 下'+marginB+'）', true)
        }
        resultUrl=canvas.toDataURL('image/png')
        preview.innerHTML=''; const im=document.createElement('img'); im.src=resultUrl; im.style.maxWidth='100%'; im.style.maxHeight='180px'; im.style.imageRendering='pixelated'; preview.appendChild(im)
        dlBtn.disabled=false; saveBtn.disabled=false
      }catch(e:any){ toast(status,'处理失败：'+String(e.message||e).slice(0,60),false) }
    })

    dlBtn.addEventListener('click', ()=>{ if(!resultUrl) return; const a=document.createElement('a'); a.href=resultUrl; a.download='post_'+Date.now()+'.png'; a.click() })
    saveBtn.addEventListener('click', async()=>{ if(!resultUrl) return; const id=await addToLibrary('post','后处理 '+new Date().toLocaleTimeString(),resultUrl); toast(status,'已入库 '+id) })
  })()

  // ---- Scene: 天气 × 日夜（程序化覆盖层，功能借鉴 romestead_weather_free）----
  ;(()=>{
    const canvas=pScene.querySelector('#sc-canvas') as HTMLCanvasElement
    const ctx=canvas.getContext('2d')!
    const status=pScene.querySelector('#sc-status') as HTMLElement
    const WEATHER_DB:Record<string,any>={
      clear:{ name:'晴天', ambient:[1,1,1], wind:1, wetness:0, rain:0, snow:0, thunder:false },
      rainy:{ name:'雨天', ambient:[0.9,0.9,1], wind:2, wetness:0.45, rain:4, snow:0, thunder:false },
      thunder:{ name:'雷暴', ambient:[0.6,0.6,0.8], wind:3, wetness:0.48, rain:16, snow:0, thunder:true },
      snow:{ name:'下雪', ambient:[0.94,0.97,1], wind:0.8, wetness:0.18, rain:0, snow:1, thunder:false },
    }
    let sceneImg:HTMLImageElement|null=null
    let weather='clear'
    let running=true, raf=0, t=0
    // 确定性伪随机（雨滴/雪花分布稳定）
    const hash=(n:number)=>{ let x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x) }
    const RAIN_N=90, SNOW_N=120
    const rainArr=Array.from({length:RAIN_N},(_,i)=>({ x:hash(i)*800, y:hash(i+50)*450, len:18+hash(i+9)*30, spd:9+hash(i+3)*8 }))
    const snowBack=Array.from({length:SNOW_N},(_,i)=>({ x:hash(i)*800, y:hash(i+80)*450, r:1+hash(i+5)*1.5, spd:0.6+hash(i)*1.1, drift:0.3+hash(i+2)*0.8 }))
    const snowFront=Array.from({length:Math.floor(SNOW_N/2)},(_,i)=>({ x:hash(i+200)*800, y:hash(i+300)*450, r:2+hash(i+7)*2.5, spd:1.1+hash(i+1)*1.6, drift:0.5+hash(i+4)*1.2 }))
    function hourOf(){ return (parseFloat((pScene.querySelector('#sc-hour') as HTMLInputElement)?.value||'1000')||1000)/100 }
    function strengthOf(){ return (parseFloat((pScene.querySelector('#sc-strength') as HTMLInputElement)?.value||'100')||100)/100 }
    function windOf(){ const w=(parseFloat((pScene.querySelector('#sc-wind') as HTMLInputElement)?.value||'40')||40)/100; return (w-0.5)*2 } // -1..1
    // 日夜环境曲线：亮度 + 色调（清晨/黄昏偏暖，夜晚偏蓝）
    function timeTint(hour:number){
      let b:number
      if(hour<5||hour>=21) b=0.22
      else if(hour<7) b=0.22+(hour-5)/2*0.78
      else if(hour<17) b=1
      else if(hour<19) b=1-(hour-17)/2*0.78
      else b=0.22
      const warm=(hour>=6&&hour<=8.5)||(hour>=15.5&&hour<=19)
      const r=warm?1.0*b:0.86*b, g=warm?0.82*b:0.86*b, bl=warm?0.62*b:1.0*b
      return { r,g,b:bl, alpha:Math.min(0.85,(1-b)*0.95+0.05) }
    }
    function drawBase(){
      ctx.clearRect(0,0,800,450)
      if(sceneImg){
        // cover 缩放铺满
        const s=Math.max(800/(sceneImg.naturalWidth||800), 450/(sceneImg.naturalHeight||450))
        const w=(sceneImg.naturalWidth||800)*s, h=(sceneImg.naturalHeight||450)*s
        ctx.drawImage(sceneImg,(800-w)/2,(450-h)/2,w,h)
      }else{
        const g=ctx.createLinearGradient(0,0,0,450)
        g.addColorStop(0,'#9ec4e8'); g.addColorStop(0.6,'#cfe3ef'); g.addColorStop(1,'#5f8f5f')
        ctx.fillStyle=g; ctx.fillRect(0,0,800,450)
        ctx.fillStyle='#fff2a8'; ctx.beginPath(); ctx.arc(660,90,40,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='bold 16px monospace'; ctx.textAlign='center'
        ctx.fillText('本地演示场景（上传或 AI 生成底图）',400,430)
      }
      // 日夜色调（multiply 暗化 + 色调）
      const tt=timeTint(hourOf())
      ctx.globalCompositeOperation='multiply'
      ctx.fillStyle='rgba('+Math.round(tt.r*255)+','+Math.round(tt.g*255)+','+Math.round(tt.b*255)+','+tt.alpha+')'
      ctx.fillRect(0,0,800,450)
      ctx.globalCompositeOperation='source-over'
      // 天气名 + 时刻
      const wd=WEATHER_DB[weather]||WEATHER_DB.clear
      const hh=Math.floor(hourOf()), mm=Math.round((hourOf()-hh)*60)
      ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(8,8,220,24)
      ctx.fillStyle='#fff'; ctx.font='bold 13px monospace'; ctx.textAlign='left'
      ctx.fillText(wd.name+' · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'),16,25)
    }
    function drawRain(strength:number, wind:number){
      const data=WEATHER_DB[weather]
      const n=Math.max(1,Math.floor(RAIN_N*strength*(data.rain/16)*1.6))
      const windX=wind*26*(data.wind||1)
      ctx.strokeStyle='rgba(180,200,255,0.55)'; ctx.lineWidth=1
      for(let i=0;i<n;i++){
        const r=rainArr[i%RAIN_N]
        const y=(r.y + (t*r.spd*strength))%460 - 5
        const x=(r.x + windX*(t*0.01)) % 820 - 10
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-windX*0.18, y+r.len); ctx.stroke()
      }
      if(data.wetness>0.3){
        ctx.fillStyle='rgba(160,190,255,0.25)'
        for(let i=0;i<6;i++){ const s=hash(i+40+t*0.5)*800; ctx.fillRect(s,444+hash(i+7)*4,2,5) }
      }
    }
    function drawThunder(){
      const flash=Math.max(0, Math.sin(t*0.55) - 0.82) * Math.max(0, Math.sin(t*0.17))
      if(flash>0.02){
        ctx.fillStyle='rgba(255,255,255,'+Math.min(0.85,flash*3)+')'
        ctx.fillRect(0,0,800,450)
      }
    }
    function drawSnow(strength:number, wind:number){
      ctx.save()
      ctx.shadowColor='rgba(255,255,255,0.8)'
      ctx.shadowBlur=3
      // 远景层（小、暗、少）
      ctx.fillStyle='rgba(230,238,250,0.5)'
      for(const f of snowBack){
        const y=(f.y + t*f.spd*strength)%460 - 2
        const x=(f.x + wind*f.drift*40)%820 - 10
        ctx.beginPath(); ctx.arc(x, y, f.r*0.7, 0, Math.PI*2); ctx.fill()
      }
      // 前景层（大、亮、带柔光）
      ctx.fillStyle='rgba(255,255,255,0.92)'
      for(const f of snowFront){
        const y=(f.y + t*f.spd*1.5*strength)%460 - 4
        const x=(f.x + wind*f.drift*70)%820 - 10
        ctx.beginPath(); ctx.arc(x, y, f.r, 0, Math.PI*2); ctx.fill()
      }
      ctx.restore()
    }
    function frame(){
      t+=0.016
      const st=strengthOf(), wind=windOf()
      drawBase()
      if(st>0.01){
        if(weather==='rainy'||weather==='thunder') drawRain(st,wind)
        if(weather==='thunder') drawThunder()
        if(weather==='snow') drawSnow(st,wind)
      }
      if(running) raf=requestAnimationFrame(frame)
    }
    frame()
    pScene.querySelector('#sc-pause')!.addEventListener('click', ()=>{
      running=!running
      const b=pScene.querySelector('#sc-pause') as HTMLButtonElement
      b.textContent=running?'⏸ 暂停':'▶ 播放'
      if(running){ raf=requestAnimationFrame(frame) }
    })
    pScene.querySelectorAll<HTMLElement>('[data-weather]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ weather=btn.dataset.weather||'clear' })
    })
    pScene.querySelector('#sc-strength')!.addEventListener('input', ()=>{/* 实时读取 */})
    const loadImg=(src:string)=>new Promise<HTMLImageElement>((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src })
    pScene.querySelector('#sc-upload')!.addEventListener('change', async(e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const url=URL.createObjectURL(f); sceneImg=await loadImg(url); revokeSoon(url, 8000); toast(status,'场景底图已加载 ✓')
    })
    pScene.querySelector('#sc-gen')!.addEventListener('click', async()=>{
      const prompt=(pScene.querySelector('#sc-prompt') as HTMLInputElement)?.value.trim()
      const prov=(pScene.querySelector('#sc-provider') as HTMLSelectElement)?.value||'mock'
      toast(status,'场景生成中…')
      try{
        const full=(prompt||'2D game scene background')+' , 2D game scene, wide shot'+ (weather==='snow'?', snowing':weather==='rainy'||weather==='thunder'?', rainy':', clear weather')
        const url=await callImageGen(full, prov, { size:'1024x576', model: (pScene.querySelector('#sc-model-sel') as HTMLSelectElement)?.value||undefined })
        sceneImg=await loadImg(url); toast(status,'场景已生成，叠加天气预览 ✓')
      }catch(err:any){ toast(status,String(err.message||err),false) }
    })
    pScene.querySelector('#sc-export')!.addEventListener('click', ()=>{
      if(!ctx) return
      const url=canvas.toDataURL('image/png')
      const a=document.createElement('a'); a.href=url; a.download='scene_weather_'+Date.now()+'.png'; a.click()
      toast(status,'当前天气帧已导出 PNG ✓')
    })
    pScene.querySelector('#sc-save')!.addEventListener('click', async()=>{
      const id=await addToLibrary('scene','场景 '+new Date().toLocaleTimeString()+' '+WEATHER_DB[weather].name, canvas.toDataURL('image/png'))
      toast(status,'已入库 '+id)
    })

    // ===================== 🎮 关卡编辑器 =====================
    ;(()=>{
      // ---- 状态 ----
      type SpriteItem={ id:string, name:string, url:string, w:number, h:number, img?:HTMLImageElement }
      type PlacedSprite={ id:string, spriteId:string, name:string, url:string, x:number, y:number, w:number, h:number, scale:number, rot:number, opacity:number, locked:boolean, layerId:string, img?:HTMLImageElement, frameCount?:number, frameW?:number, frameH?:number, frame?:number, fps?:number, lastFrameTime?:number }
      type Layer={ id:string, name:string, visible:boolean, locked:boolean, opacity:number, blendMode:string, color:string, thumbCanvas?:HTMLCanvasElement }
      type WaterRegion={ id:string, points:[number,number][], animType:'frame'|'particle'|'shader', color:string, speed:number, layerId:string }
      type ParticleRegion={ id:string, x:number, y:number, w:number, h:number, kind:'fire'|'smoke'|'sparkle'|'rain'|'snow'|'custom', params:Record<string,number>, layerId:string }
      type EdHistoryEntry={ sprites:PlacedSprite[], layers:Layer[], waters:WaterRegion[], particles:ParticleRegion[], bgUrl:string|null }

      const W=960, H=540
      const edCanvas=pScene.querySelector('#sc-ed-canvas') as HTMLCanvasElement
      const edOverlay=pScene.querySelector('#sc-ed-overlay') as HTMLCanvasElement
      const edCtx=edCanvas.getContext('2d')!
      const edOverlayCtx=edOverlay.getContext('2d')!
      let zoom=1, panX=0, panY=0
      let activeTool='select'
      let selectedId:string|null=null
      let dragSprite:PlacedSprite|null=null
      let dragStartX=0, dragStartY=0, spriteStartX=0, spriteStartY=0
      let isPanning=false, panStartX=0, panStartY=0, panOriginX=0, panOriginY=0
      let isDrawing=false, drawColor='#3b62a0', drawSize=16
      let currentLayerId='layer-default'
      let bgImage:HTMLImageElement|null=null, bgUrl:string|null=null
      const sprites:PlacedSprite[]=[]
      const layers:Layer[]=[{ id:'layer-default', name:'默认图层', visible:true, locked:false, opacity:1, blendMode:'normal', color:'#4a9eff' }]
      const waters:WaterRegion[]=[]
      const particles:ParticleRegion[]=[]
      const history:EdHistoryEntry[]=[]
      let histIdx=-1

      function snap(v:number,n=4){ return Math.round(v/n)*n }
      function genId(){ return Math.random().toString(36).slice(2,9) }
      function pushHist(){
        histIdx++; history.length=histIdx+1
        history.push({ sprites:JSON.parse(JSON.stringify(sprites)), layers:JSON.parse(JSON.stringify(layers)), waters:JSON.parse(JSON.stringify(waters)), particles:JSON.parse(JSON.stringify(particles)), bgUrl:bgUrl })
      }

      // ---- 画布初始化 ----
      function initCanvas(){
        edCanvas.width=W; edCanvas.height=H
        edOverlay.width=W; edOverlay.height=H
        const wrap=pScene.querySelector('#sc-ed-canvas-wrap') as HTMLElement
        const wrapW=wrap.clientWidth, wrapH=wrap.clientHeight
        zoom=Math.min(wrapW/W, wrapH/H)
        edCanvas.style.width=W*zoom+'px'; edCanvas.style.height=H*zoom+'px'
        edOverlay.style.width=W*zoom+'px'; edOverlay.style.height=H*zoom+'px'
        edOverlay.style.cursor='default'
        render()
      }

      // ---- 渲染 ----
      function render(){
        const ctx=edCtx
        ctx.clearRect(0,0,W,H)
        // 背景
        if(bgImage){ ctx.drawImage(bgImage,0,0,W,H) }
        else { ctx.fillStyle='#1a2030'; ctx.fillRect(0,0,W,H) }
        // 水面区域
        for(const w2 of waters){
          if(!layers.find(l=>l.id===w2.layerId)?.visible) continue
          if(w2.animType==='frame'){
            const t=Date.now()/1000, freq=w2.speed
            const waveH=3
            ctx.save()
            ctx.beginPath()
            if(w2.points.length>2) { ctx.moveTo(w2.points[0][0],w2.points[0][1]); for(let i=1;i<w2.points.length;i++) ctx.lineTo(w2.points[i][0],w2.points[i][1]); ctx.closePath() }
            else { ctx.rect(0,0,W,H) }
            ctx.clip()
            const imgData=ctx.getImageData(0,0,W,H)
            const d=imgData.data
            for(let y=0;y<H;y++){
              const wave=Math.sin(y*0.05+t*freq)*waveH
              for(let x=0;x<W;x++){
                const nx=(x+wave+W)%W, ny=y
                const ni=(ny*W+nx)*4, oi=(y*W+x)*4
                d[oi]=d[ni]; d[oi+1]=d[ni+1]; d[oi+2]=d[ni+2]; d[oi+3]=d[ni+3]
              }
            }
            ctx.putImageData(imgData,0,0)
            ctx.globalAlpha=0.35; ctx.fillStyle=w2.color; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1
            ctx.restore()
          } else if(w2.animType==='particle'){
            drawWaterParticles(ctx, w2)
          }
        }
        // 粒子特效
        const t=Date.now()/1000
        for(const p of particles){
          if(!layers.find(l=>l.id===p.layerId)?.visible) continue
          drawParticles(ctx, p, t)
        }
        // 精灵(按 y 排序)
        const sorted=[...sprites].sort((a,b)=>a.y-b.y)
        for(const sp of sorted){
          if(!layers.find(l=>l.id===sp.layerId)?.visible) continue
          if(sp.opacity<0.05) continue
          ctx.save()
          ctx.globalAlpha=sp.opacity
          if(sp.rot) ctx.translate(sp.x+sp.w/2, sp.y+sp.h/2), ctx.rotate(sp.rot*Math.PI/180)
          else ctx.translate(sp.x, sp.y)
          if(sp.img){
            if(sp.frameCount && sp.frameCount>1 && sp.frameW && sp.frameH){
              // 序列帧动画：每帧宽度 frameW，高度 frameH，水平排列
              const fi=sp.frame||0, sx=fi*sp.frameW
              ctx.drawImage(sp.img, sx, 0, sp.frameW, sp.frameH, 0, 0, sp.w, sp.h)
            } else {
              ctx.drawImage(sp.img, 0, 0, sp.w, sp.h)
            }
          }
          ctx.restore()
        }
        renderOverlay()
      }

      function drawWaterParticles(ctx:CanvasRenderingContext2D, w2:WaterRegion){
        const t=Date.now()/1000
        ctx.save()
        if(w2.points.length>2){ ctx.beginPath(); ctx.moveTo(w2.points[0][0],w2.points[0][1]); for(let i=1;i<w2.points.length;i++) ctx.lineTo(w2.points[i][0],w2.points[i][1]); ctx.closePath(); ctx.clip() }
        for(let i=0;i<60;i++){
          const hash=(n:number)=>{ let x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x) }
          const px=hash(i)*W, py=(hash(i+50)*H+t*w2.speed*30*(0.5+hash(i+3)))%H
          const pr=2+hash(i+7)*3
          ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2)
          ctx.fillStyle='rgba(200,230,255,'+(0.3+hash(i+9)*0.5)+')'; ctx.fill()
        }
        ctx.restore()
      }

      function drawParticles(ctx:CanvasRenderingContext2D, p:ParticleRegion, t:number){
        const hash=(n:number)=>{ let x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x) }
        const n=Math.round(p.params.amount||30), cx=p.x+p.w/2, cy=p.y+p.h/2
        ctx.save()
        if(p.kind==='fire'){
          for(let i=0;i<n;i++){
            const px=cx+(hash(i)-0.5)*p.w*0.6
            const py=cy+t*p.params.speed*20*(0.5+hash(i+3))%p.h - p.h*0.3
            const pr=3+hash(i+7)*5
            const alpha=Math.max(0,1-(py-cy+p.h*0.3)/(p.h*0.8))*0.8
            ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2)
            ctx.fillStyle='rgba(255,'+Math.round(100+hash(i)*155)+',0,'+alpha.toFixed(2)+')'; ctx.fill()
          }
        } else if(p.kind==='sparkle'){
          for(let i=0;i<n;i++){
            const px=cx+(hash(i)-0.5)*p.w, py=cy+(hash(i+50)-0.5)*p.h
            const pr=1+hash(i+9)*2, tw=0.5+Math.sin(t*3+i*0.7)*0.5
            ctx.beginPath(); ctx.arc(px,py,pr*tw,0,Math.PI*2)
            ctx.fillStyle='rgba(255,255,200,'+(0.3+hash(i+8)*0.7)+')'; ctx.fill()
          }
        } else if(p.kind==='smoke'){
          for(let i=0;i<n;i++){
            const px=cx+(hash(i)-0.5)*p.w*0.5, py=cy-t*p.params.speed*15*(0.5+hash(i+3))%p.h
            const pr=5+hash(i+7)*10, alpha=0.2+hash(i+5)*0.3
            ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2)
            ctx.fillStyle='rgba(150,150,150,'+alpha.toFixed(2)+')'; ctx.fill()
          }
        } else {
          // rain/snow fallback
          for(let i=0;i<n;i++){
            const px=(hash(i)*W+t*50*p.params.speed*(0.5+hash(i+3)))%W, py=(hash(i+50)*H+t*30*(0.5+hash(i+1)))%H
            const pr=p.kind==='rain'?1:2+hash(i+7)*2
            ctx.beginPath(); ctx.arc(px%p.w+cx-p.w/2,py%p.h+cy-p.h/2,pr,0,Math.PI*2)
            ctx.fillStyle=p.kind==='rain'?'rgba(180,200,255,0.5)':'rgba(255,255,255,0.7)'; ctx.fill()
          }
        }
        ctx.restore()
      }

      function renderOverlay(){
        const ctx=edOverlayCtx
        ctx.clearRect(0,0,W,H)
        ctx.save()
        ctx.scale(zoom,zoom)
        // 选中高亮
        if(selectedId){
          const sp=sprites.find(s=>s.id===selectedId)
          if(sp){ ctx.strokeStyle='#00e5ff'; ctx.lineWidth=2/zoom; ctx.setLineDash([4/zoom,4/zoom]); ctx.strokeRect(sp.x-2,sp.y-2,sp.w+4,sp.h+4) }
        }
        // 水面选区
        for(const w2 of waters){
          if(w2.points.length<3) continue
          ctx.beginPath(); ctx.moveTo(w2.points[0][0],w2.points[0][1])
          for(let i=1;i<w2.points.length;i++) ctx.lineTo(w2.points[i][0],w2.points[i][1]); ctx.closePath()
          ctx.strokeStyle='rgba(100,180,255,0.8)'; ctx.lineWidth=2/zoom; ctx.setLineDash([3/zoom,3/zoom]); ctx.stroke()
        }
        ctx.restore()
      }

      // ---- 事件处理 ----
      function canvasXY(e:MouseEvent){
        const r=edCanvas.getBoundingClientRect()
        return { x:(e.clientX-r.left)/zoom, y:(e.clientY-r.top)/zoom }
      }
      edCanvas.addEventListener('mousedown',(e: MouseEvent)=>{
        const {x,y}=canvasXY(e)
        if(activeTool==='pan'){
          isPanning=true; panStartX=e.clientX; panStartY=e.clientY; panOriginX=panX; panOriginY=panY; return
        }
        if(activeTool==='select'){
          // 逆序找(最上层先)
          const found=[...sprites].reverse().find(sp=>{
            const l=layers.find(l=>l.id===sp.layerId)
            if(!l?.visible||l.locked) return false
            return x>=sp.x&&x<=sp.x+sp.w&&y>=sp.y&&y<=sp.y+sp.h
          })
          if(found){ selectedId=found.id; dragSprite=found; dragStartX=x; dragStartY=y; spriteStartX=found.x; spriteStartY=found.y }
          else selectedId=null
          render(); return
        }
        if(activeTool==='water-brush'||activeTool==='land-brush'||activeTool==='eraser'){
          isDrawing=true; paintAt(x,y); return
        }
        if(activeTool==='particle'){
          // 点击画布添加粒子区域
          const kind=prompt('粒子类型:\nfire=火焰\nsmoke=烟雾\nsparkle=闪光\nrain=雨\nsnow=雪\n输入类型名:')||'sparkle'
          const pr={ amount:40, speed:1, size:3 }
          const p:ParticleRegion={ id:genId(), x:x-32, y:y-32, w:64, h:64, kind:kind as any, params:pr, layerId:currentLayerId }
          particles.push(p); pushHist()
          toast(pScene.querySelector('#sc-status') as HTMLElement,'已添加粒子特效: '+kind+'，可在属性面板调整', true)
          render(); return
        }
      })

      // 双击 = 取消选择 / 重置缩放，不要冒泡到全局 preview-click 放大镜
      edCanvas.addEventListener('dblclick',(e:MouseEvent)=>{
        e.stopPropagation()
        // 重置 zoom 到 1
        if(zoom !== 1){ zoom=1; panX=0; panY=0; applyPan(); }
        else { selectedId=null; render() }
      })
      edOverlay.addEventListener('dblclick',(e:MouseEvent)=>{ e.stopPropagation() })
      edCanvas.addEventListener('mousemove',(e:MouseEvent)=>{
        const {x,y}=canvasXY(e)
        if(isPanning){
          panX=panOriginX+(e.clientX-panStartX)
          panY=panOriginY+(e.clientY-panStartY)
          applyPan(); return
        }
        if(dragSprite){
          const nx=Math.max(0,Math.min(W-dragSprite.w, snap(x-(dragStartX-spriteStartX))))
          const ny=Math.max(0,Math.min(H-dragSprite.h, snap(y-(dragStartY-spriteStartY))))
          dragSprite.x=nx; dragSprite.y=ny
          updatePropsPanel(); render(); return
        }
        if(isDrawing){ paintAt(x,y) }
      })
      edCanvas.addEventListener('mouseup',()=>{
        if(isDrawing){ isDrawing=false; pushHist() }
        if(dragSprite){ dragSprite=null; pushHist() }
        isPanning=false
      })
      edCanvas.addEventListener('dblclick',()=>{
        if(selectedId){ sprites.splice(sprites.findIndex(s=>s.id===selectedId),1); selectedId=null; render(); pushHist() }
      })
      // 滚轮缩放
      edCanvas.addEventListener('wheel',(e:WheelEvent)=>{
        e.preventDefault()
        const z=zoom*(e.deltaY<0?1.1:0.9)
        zoom=Math.max(0.1,Math.min(4,z))
        edCanvas.style.width=W*zoom+'px'; edCanvas.style.height=H*zoom+'px'
        edOverlay.style.width=W*zoom+'px'; edOverlay.style.height=H*zoom+'px'
        ;(pScene.querySelector('#sc-ed-zoom') as HTMLInputElement).value=String(Math.round(zoom*100))
        ;(pScene.querySelector('#sc-ed-zoom-label') as HTMLElement).textContent=Math.round(zoom*100)+'%'
      })
      function applyPan(){
        edCanvas.style.transform=`translate(${panX}px,${panY}px)`
        edOverlay.style.transform=`translate(${panX}px,${panY}px)`
      }

      // ---- 笔刷绘制 ----
      function paintAt(x:number,y:number){
        const size=drawSize
        const color=activeTool==='eraser'?'#1a2030':activeTool==='water-brush'?'#3b62a0':'#4a7a3a'
        edCtx.save()
        if(activeTool==='eraser'){ edCtx.globalCompositeOperation='destination-out'; edCtx.fillStyle='rgba(0,0,0,1)' }
        else edCtx.fillStyle=color
        edCtx.beginPath(); edCtx.arc(x,y,size/2,0,Math.PI*2); edCtx.fill()
        edCtx.restore()
      }

      // ---- 工具栏 ----
      pScene.querySelectorAll<HTMLButtonElement>('.sc-ed-tool').forEach(btn=>{
        btn.addEventListener('click',()=>{
          activeTool=btn.dataset.tool||'select'
          edOverlay.style.cursor=activeTool==='pan'?'grab':activeTool==='select'?'default':'crosshair'
          pScene.querySelectorAll('.sc-ed-tool').forEach(b=>b.classList.remove('active'))
          if(activeTool!=='select') btn.classList.add('active')
        })
      })
      ;(pScene.querySelector('#sc-ed-brush-size') as HTMLInputElement).addEventListener('input',(e:any)=>{ drawSize=parseInt(e.target.value)||16 })

      // ---- 素材面板加载 ----
      async function loadSpritePalette(){
        const pal=pScene.querySelector('#sc-ed-sprite-palette') as HTMLElement
        pal.innerHTML='<div class="gas-note" style="font-size:10px">加载中...</div>'
        const items=await getAllAssetItems()
        pal.innerHTML=''
        if(!items.length){ pal.innerHTML='<div class="gas-note" style="font-size:10px">暂无素材<br>请先在「素材总管」入库</div>'; return }
        const shown=items.slice(0,30)
        for(const item of shown){
          const btn=document.createElement('button')
          btn.style.cssText='background:#252a2e;border:1px solid var(--border);border-radius:4px;padding:2px 4px;cursor:grab;display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text);width:100%;text-align:left'
          btn.textContent='🖼 '+item.name.slice(0,12)
          btn.draggable=true
          btn.addEventListener('dragstart',(e:DragEvent)=>{
            e.dataTransfer!.setData('sprite-id',item.id)
            e.dataTransfer!.setData('sprite-name',item.name)
            e.dataTransfer!.setData('sprite-url',item.url)
          })
          btn.addEventListener('click',()=>{
            placeSprite(item.url, item.name, W/2-32, H/2-32)
          })
          pal.appendChild(btn)
        }
      }

      edCanvas.addEventListener('dragover',(e:DragEvent)=>e.preventDefault())
      edCanvas.addEventListener('drop',(e:DragEvent)=>{
        e.preventDefault()
        const name=e.dataTransfer!.getData('sprite-name')
        const url=e.dataTransfer!.getData('sprite-url')
        if(!url) return
        const {x,y}=canvasXY(e as unknown as MouseEvent)
        placeSprite(url, name, snap(x-32), snap(y-32))
      })

      function placeSprite(url:string, name:string, x:number, y:number){
        const img=new Image(); img.crossOrigin='anonymous'
        img.onload=()=>{
          const scale=Math.min(64/Math.max(img.width,1), 64/Math.max(img.height,1))
          const w=Math.round(img.width*scale), h=Math.round(img.height*scale)
          const sp:PlacedSprite={ id:genId(), spriteId:genId(), name, url, x:Math.max(0,Math.min(W-w,x)), y:Math.max(0,Math.min(H-h,y)), w, h, scale:1, rot:0, opacity:1, locked:false, layerId:currentLayerId, img }
          sprites.push(sp); selectedId=sp.id
          render(); updateLayerPanel(); updatePropsPanel(); loadSpritePalette(); pushHist()
          const edStatus=pScene.querySelector('#sc-status') as HTMLElement
          if(edStatus) edStatus.textContent='已放置: '+name
        }
        img.onerror=()=>{ toast(pScene.querySelector('#sc-status') as HTMLElement,'素材加载失败: '+name,false) }
        img.src=url
      }

      // ---- 图层面板 ----
      function updateLayerPanel(){
        const panel=pScene.querySelector('#sc-ed-layers') as HTMLElement
        panel.innerHTML=''
        const activeId=currentLayerId

        // 底图行（不可拖拽）
        const bgDiv=document.createElement('div')
        bgDiv.className='sc-layer-item'
        bgDiv.style.cssText='margin-bottom:2px;opacity:0.75'
        bgDiv.innerHTML=`<button class="ly-vis" id="bg-vis-btn" title="显示/隐藏底图">${bgUrl?'👁':'👁‍🗨'}</button>
          <div class="ly-thumb" style="background:#2a3a2a;font-size:9px">🗺</div>
          <span class="ly-name" style="cursor:default;font-size:10px;color:var(--muted)">底图${bgUrl?' ✓':' (空)'}</span>`
        bgDiv.querySelector('#bg-vis-btn')!.addEventListener('click',(e:any)=>{
          e.stopPropagation()
          if(bgUrl){ bgUrl=null; bgImage=null } else {
            const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'
            inp.onchange=()=>{ const f=inp.files?.[0]; if(!f) return; const u=URL.createObjectURL(f); const img=new Image(); img.onload=()=>{ bgImage=img; bgUrl=u; revokeSoon(u,60000); render(); updateLayerPanel() }; img.src=u }
            inp.click()
          }
          updateLayerPanel()
        })
        panel.appendChild(bgDiv)

        // 水面行
        if(waters.length){
          const wDiv=document.createElement('div')
          wDiv.className='sc-layer-item'
          wDiv.innerHTML=`<button class="ly-vis" title="显示/隐藏水面">💧</button>
            <div class="ly-thumb" style="background:#1a2a3a;font-size:9px">💧</div>
            <span class="ly-name" style="cursor:default;font-size:10px">水面 ${waters.length} 区域</span>
            <span class="ly-sprite-count">${waters.length}🌊</span>`
          wDiv.addEventListener('click',()=>{ currentLayerId='__water__'; updateLayerPanel() })
          panel.appendChild(wDiv)
        }

        // 粒子行
        if(particles.length){
          const pDiv=document.createElement('div')
          pDiv.className='sc-layer-item'
          pDiv.innerHTML=`<button class="ly-vis" title="显示/隐藏粒子">☄️</button>
            <div class="ly-thumb" style="background:#1a1a2a;font-size:9px">✨</div>
            <span class="ly-name" style="cursor:default;font-size:10px">粒子特效 ${particles.length} 个</span>
            <span class="ly-sprite-count">${particles.length}✨</span>`
          pDiv.addEventListener('click',()=>{ currentLayerId='__particle__'; updateLayerPanel() })
          panel.appendChild(pDiv)
        }

        // 精灵图层（从下到上渲染，所以 reverse）
        for(const ly of [...layers].reverse()){
          const isActive=ly.id===activeId
          const spriteCount=sprites.filter(s=>s.layerId===ly.id).length
          const div=document.createElement('div')
          div.className='sc-layer-item'+(isActive?' active':'')
          div.dataset.layerId=ly.id
          div.draggable=true
          div.innerHTML=`
            <button class="ly-vis ${ly.visible?'':'hidden'}" data-ly-vis="${ly.id}" title="${ly.visible?'隐藏':'显示'}图层">${ly.visible?'👁':'👁‍🗨'}</button>
            <button class="ly-lock ${ly.locked?'locked':''}" data-ly-lock="${ly.id}" title="${ly.locked?'解锁':'锁定'}图层">${ly.locked?'🔒':'🔓'}</button>
            <div class="ly-thumb" id="ly-thumb-${ly.id}" style="background:${ly.color}20;border-color:${ly.color}40">${ly.name[0]||'L'}</div>
            <span class="ly-name" data-ly-name="${ly.id}" title="${ly.name}（双击重命名）">${ly.name}</span>
            <span class="ly-op" data-ly-op="${ly.id}" title="点击调整透明度">${Math.round(ly.opacity*100)}%</span>
            <span class="ly-sprite-count">${spriteCount}🖼</span>
          `
          // 点击选中图层
          div.addEventListener('click',(e:any)=>{
            const t=e.target as HTMLElement
            if(t.classList.contains('ly-vis')||t.classList.contains('ly-lock')||t.classList.contains('ly-op')) return
            currentLayerId=ly.id; updateLayerPanel()
          })
          // 可见性切换
          div.querySelector(`[data-ly-vis="${ly.id}"]`)!.addEventListener('click',(e:any)=>{ e.stopPropagation(); ly.visible=!ly.visible; render(); updateLayerPanel() })
          // 锁定切换
          div.querySelector(`[data-ly-lock="${ly.id}"]`)!.addEventListener('click',(e:any)=>{ e.stopPropagation(); ly.locked=!ly.locked; updateLayerPanel() })
          // 双击重命名
          const nameSpan=div.querySelector(`[data-ly-name="${ly.id}"]`) as HTMLElement
          nameSpan.addEventListener('dblclick',(e:any)=>{ e.stopPropagation(); startRenameLayer(ly.id) })
          // 透明度点击 → prompt 调整
          div.querySelector(`[data-ly-op="${ly.id}"]`)!.addEventListener('click',(e:any)=>{ e.stopPropagation()
            const v=prompt('图层透明度 0-100:',String(Math.round(ly.opacity*100)))
            if(v!==null){ ly.opacity=Math.max(0,Math.min(1,+v/100)); render(); updateLayerPanel() }
          })
          // 拖拽排序
          div.addEventListener('dragstart',(e:DragEvent)=>{ e.dataTransfer!.setData('layer-drag',ly.id); div.classList.add('dragging') })
          div.addEventListener('dragend',()=>{ div.classList.remove('dragging') })
          div.addEventListener('dragover',(e:DragEvent)=>{ if(e.dataTransfer?.types.includes('layer-drag')){ e.preventDefault(); div.classList.add('drag-over') } })
          div.addEventListener('dragleave',()=>{ div.classList.remove('drag-over') })
          div.addEventListener('drop',(e:DragEvent)=>{ e.preventDefault(); div.classList.remove('drag-over')
            const dragId=e.dataTransfer?.getData('layer-drag'); if(!dragId||dragId===ly.id) return
            const fromIdx=layers.findIndex(l=>l.id===dragId), toIdx=layers.findIndex(l=>l.id===ly.id)
            if(fromIdx<0||toIdx<0) return
            const [moved]=layers.splice(fromIdx,1); layers.splice(toIdx,0,moved)
            pushHist(); updateLayerPanel()
          })
          // 右键菜单
          div.addEventListener('contextmenu',(e:MouseEvent)=>{ e.preventDefault(); showLayerCtx(e, ly.id) })
          panel.appendChild(div)
        }

        // 空状态提示
        if(!layers.length){
          panel.innerHTML+='<div style="text-align:center;padding:16px 0;color:var(--muted);font-size:11px">无图层<br><span style="font-size:10px">点 + 新建</span></div>'
        }
      }

      function startRenameLayer(id:string){
        const panel=pScene.querySelector('#sc-ed-layers') as HTMLElement
        const ly=layers.find(l=>l.id===id); if(!ly) return
        const nameSpan=panel.querySelector(`[data-ly-name="${id}"]`) as HTMLElement
        if(!nameSpan) return
        const inp=document.createElement('input')
        inp.className='ly-name-input'
        inp.value=ly.name
        nameSpan.replaceWith(inp); inp.focus(); inp.select()
        const commit=()=>{ const v=inp.value.trim(); if(v) ly.name=v; updateLayerPanel(); pushHist() }
        inp.addEventListener('blur',commit)
        inp.addEventListener('keydown',(e:any)=>{ if(e.key==='Enter'){ inp.blur() } else if(e.key==='Escape'){ updateLayerPanel() } })
      }

      let ctxMenuEl:HTMLElement|null=null
      function showLayerCtx(e:MouseEvent, id:string){
        ctxMenuEl?.remove()
        const ly=layers.find(l=>l.id===id); if(!ly) return
        const idx=layers.findIndex(l=>l.id===id)
        const div=document.createElement('div')
        div.className='sc-layer-ctx'
        div.style.left=e.clientX+'px'; div.style.top=e.clientY+'px'
        div.innerHTML=`
          <div class="sc-layer-ctx-item" data-action="rename" data-id="${id}">✏️ 重命名</div>
          <div class="sc-layer-ctx-item" data-action="dup" data-id="${id}">⧉ 复制图层</div>
          <div class="sc-layer-ctx-sep"></div>
          <div class="sc-layer-ctx-item" data-action="new" data-id="${id}">+ 新建图层</div>
          <div class="sc-layer-ctx-item" data-action="up" data-id="${id}">⬆ 上移</div>
          <div class="sc-layer-ctx-item" data-action="down" data-id="${id}">⬇ 下移</div>
          <div class="sc-layer-ctx-item" data-action="top" data-id="${id}">⏫ 置顶</div>
          <div class="sc-layer-ctx-item" data-action="bottom" data-id="${id}">⏬ 置底</div>
          <div class="sc-layer-ctx-sep"></div>
          <div class="sc-layer-ctx-item" data-action="opacity" data-id="${id}">◐ 调整透明度...</div>
          <div class="sc-layer-ctx-item" data-action="color" data-id="${id}">🎨 图层颜色...</div>
          <div class="sc-layer-ctx-sep"></div>
          <div class="sc-layer-ctx-item danger" data-action="delete" data-id="${id}">🗑 删除图层</div>
        `
        div.addEventListener('click',(ev:any)=>{
          const act=ev.target.closest('[data-action]')?.dataset.action
          const ly2=layers.find(l=>l.id===id); const idx2=layers.findIndex(l=>l.id===id)
          ctxMenuEl?.remove(); ctxMenuEl=null
          if(!ly2) return
          if(act==='rename') startRenameLayer(id)
          else if(act==='dup'){ const nly:Layer={...ly2, id:genId(), name:ly2.name+' (副本)'}; layers.splice(idx2,0,nly); currentLayerId=nly.id; pushHist(); updateLayerPanel() }
          else if(act==='new'){ const nl:Layer={ id:genId(), name:'图层 '+(layers.length+1), visible:true, locked:false, opacity:1, blendMode:'normal', color:'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0') }; layers.push(nl); currentLayerId=nl.id; pushHist(); updateLayerPanel() }
          else if(act==='up'&&idx2<layers.length-1){ [layers[idx2],layers[idx2+1]]=[layers[idx2+1],layers[idx2]]; pushHist(); updateLayerPanel() }
          else if(act==='down'&&idx2>0){ [layers[idx2],layers[idx2-1]]=[layers[idx2-1],layers[idx2]]; pushHist(); updateLayerPanel() }
          else if(act==='top'){ const [m]=layers.splice(idx2,1); layers.push(m); pushHist(); updateLayerPanel() }
          else if(act==='bottom'){ const [m]=layers.splice(idx2,1); layers.unshift(m); pushHist(); updateLayerPanel() }
          else if(act==='opacity'){ const v=prompt('图层透明度 0-100:',String(Math.round(ly2.opacity*100))); if(v!==null){ ly2.opacity=Math.max(0,Math.min(1,+v/100)); render(); updateLayerPanel() } }
          else if(act==='color'){ const v=prompt('图层颜色 (hex如 #ff6644):',ly2.color); if(v&&/^#[0-9a-fA-F]{6}$/.test(v)){ ly2.color=v; updateLayerPanel() } }
          else if(act==='delete'){ if(layers.length<=1){ toast(pScene.querySelector('#sc-status') as HTMLElement,'至少保留一个图层',false); return }; layers.splice(idx2,1); if(currentLayerId===id) currentLayerId=layers[Math.max(0,idx2-1)].id; pushHist(); updateLayerPanel() }
        })
        document.body.appendChild(div)
        ctxMenuEl=div
        setTimeout(()=>{ document.addEventListener('click',()=>{ ctxMenuEl?.remove(); ctxMenuEl=null }, { once: true }) },0)
      }

      // 图层工具栏事件
      pScene.querySelector('#sc-ed-layer-add')!.addEventListener('click',()=>{
        const colors=['#4a9eff','#ff6b6b','#51cf66','#ffd43b','#cc5de8','#ff922b','#20c997','#f783ac']
        const nl:Layer={ id:genId(), name:'图层 '+(layers.length+1), visible:true, locked:false, opacity:1, blendMode:'normal', color:colors[layers.length%colors.length] }
        layers.push(nl); currentLayerId=nl.id; pushHist(); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已添加图层: '+nl.name, true)
      })
      pScene.querySelector('#sc-ed-layer-del')!.addEventListener('click',()=>{
        const ly=layers.find(l=>l.id===currentLayerId)
        if(layers.length<=1){ toast(pScene.querySelector('#sc-status') as HTMLElement,'至少保留一个图层',false); return }
        const idx=layers.findIndex(l=>l.id===currentLayerId)
        layers.splice(idx,1); currentLayerId=layers[Math.max(0,idx-1)].id
        // 把属于该图层的精灵也删掉
        for(let i=sprites.length-1;i>=0;i--) if(sprites[i].layerId===(ly as any).id) sprites.splice(i,1)
        if(selectedId&&sprites.find(s=>s.id===selectedId)) selectedId=null
        pushHist(); updateLayerPanel(); render()
      })
      pScene.querySelector('#sc-ed-layer-dup')!.addEventListener('click',()=>{
        const ly=layers.find(l=>l.id===currentLayerId); if(!ly) return
        const idx=layers.findIndex(l=>l.id===currentLayerId)
        const nly:Layer={ ...ly, id:genId(), name:ly.name+' (副本)' }
        layers.splice(idx+1,0,nly)
        // 复制同图层精灵
        for(const sp of sprites) if(sp.layerId===ly.id){ const nsp={...sp, id:genId(), layerId:nly.id}; sprites.push(nsp) }
        currentLayerId=nly.id; pushHist(); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已复制图层: '+nly.name, true)
      })
      pScene.querySelector('#sc-ed-layer-merge')!.addEventListener('click',()=>{
        const idx=layers.findIndex(l=>l.id===currentLayerId)
        if(idx>=layers.length-1){ toast(pScene.querySelector('#sc-status') as HTMLElement,'没有可合并的下层图层',false); return }
        const [top,bottom]=[layers[idx],layers[idx+1]]
        // 把 top 的精灵移到 bottom
        for(const sp of sprites) if(sp.layerId===top.id) sp.layerId=bottom.id
        layers.splice(idx,1); currentLayerId=bottom.id
        pushHist(); updateLayerPanel(); render()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已向下合并图层', true)
      })
      pScene.querySelector('#sc-ed-lock-all')!.addEventListener('click',()=>{
        const allLocked=layers.every(l=>l.locked)
        layers.forEach(l=>l.locked=!allLocked); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,allLocked?'已全部解锁':'已全部锁定', true)
      })
      pScene.querySelector('#sc-ed-hide-all')!.addEventListener('click',()=>{
        layers.forEach(l=>l.visible=false); render(); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已隐藏所有图层', true)
      })
      pScene.querySelector('#sc-ed-show-all')!.addEventListener('click',()=>{
        layers.forEach(l=>l.visible=true); render(); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已显示所有图层', true)
      })

      // ---- 属性面板 ----
      function updatePropsPanel(){
        const panel=pScene.querySelector('#sc-ed-props') as HTMLElement
        if(!selectedId){ panel.innerHTML='<div class="gas-note" style="font-size:10px">选中素材查看属性</div>'; return }
        const sp=sprites.find(s=>s.id===selectedId); if(!sp){ panel.innerHTML='<div class="gas-note" style="font-size:10px">选中素材查看属性</div>'; return }
        const isAnim=!!(sp.frameCount&&sp.frameCount>1)
        panel.innerHTML=`
          <div style="margin-bottom:6px;font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sp.name}</div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">X</span><input class="gas-input" id="sp-x" type="number" value="${Math.round(sp.x)}" style="flex:1;font-size:11px;padding:2px 4px"></div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">Y</span><input class="gas-input" id="sp-y" type="number" value="${Math.round(sp.y)}" style="flex:1;font-size:11px;padding:2px 4px"></div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">W</span><input class="gas-input" id="sp-w" type="number" value="${Math.round(sp.w)}" style="flex:1;font-size:11px;padding:2px 4px"></div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">H</span><input class="gas-input" id="sp-h" type="number" value="${Math.round(sp.h)}" style="flex:1;font-size:11px;padding:2px 4px"></div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">旋转</span><input class="gas-input" id="sp-rot" type="number" value="${sp.rot}" min="-180" max="180" style="flex:1;font-size:11px;padding:2px 4px"></div>
          <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">透明</span><input class="gas-input" id="sp-op" type="range" min="0" max="100" value="${Math.round(sp.opacity*100)}" style="flex:1"></div>
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">
            <div style="font-size:10px;color:var(--muted);margin-bottom:4px">🎬 序列帧动画</div>
            <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">帧数</span><input class="gas-input" id="sp-fc" type="number" value="${sp.frameCount||1}" min="1" max="64" style="flex:1;font-size:11px;padding:2px 4px"></div>
            <div class="gas-row" style="margin-bottom:4px"><span style="flex:0 0 40px;color:var(--muted)">FPS</span><input class="gas-input" id="sp-fps" type="number" value="${sp.fps||8}" min="1" max="60" style="flex:1;font-size:11px;padding:2px 4px"></div>
            <div style="font-size:9px;color:${isAnim?'var(--ok)':'var(--muted)'};margin-top:2px">${isAnim?'● 播放中':'○ 静态图片（填帧数>1开启动画）'}</div>
          </div>
          <div style="margin-top:6px;font-size:10px;color:var(--muted)">双击画布重置缩放/取消选择</div>
        `
        ;(panel.querySelector('#sp-x') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.x=Math.max(0,Math.min(W-sp.w,+e.target.value)); render(); pushHist() })
        ;(panel.querySelector('#sp-y') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.y=Math.max(0,Math.min(H-sp.h,+e.target.value)); render(); pushHist() })
        ;(panel.querySelector('#sp-w') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.w=Math.max(1,+e.target.value); render(); pushHist() })
        ;(panel.querySelector('#sp-h') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.h=Math.max(1,+e.target.value); render(); pushHist() })
        ;(panel.querySelector('#sp-rot') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.rot=+e.target.value; render(); pushHist() })
        ;(panel.querySelector('#sp-op') as HTMLInputElement).addEventListener('input',(e:any)=>{ sp.opacity=+e.target.value/100; render() })
        ;(panel.querySelector('#sp-op') as HTMLInputElement).addEventListener('change',()=>pushHist())
        ;(panel.querySelector('#sp-fc') as HTMLInputElement).addEventListener('change',(e:any)=>{
          const fc=Math.max(1,Math.min(64,+e.target.value))
          sp.frameCount=fc; sp.frameW=Math.round(sp.w/fc); sp.frameH=sp.h; sp.frame=0; sp.lastFrameTime=0
          render(); pushHist()
        })
        ;(panel.querySelector('#sp-fps') as HTMLInputElement).addEventListener('change',(e:any)=>{ sp.fps=Math.max(1,Math.min(60,+e.target.value)); render() })
      }

      // ---- 地图底图导入 ----
      pScene.querySelector('#sc-ed-import-map')!.addEventListener('click',()=>{
        const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'
        inp.onchange=()=>{ const f=inp.files?.[0]; if(!f) return
          const u=URL.createObjectURL(f)
          const img=new Image(); img.onload=()=>{
            bgImage=img; bgUrl=u; revokeSoon(u,60000)
            // 同步到素材库
            const edStatus=pScene.querySelector('#sc-status') as HTMLElement
            if(edStatus) edStatus.textContent='已导入地图底图: '+f.name+' ('+img.width+'×'+img.height+')'
            render(); updateLayerPanel()
          }; img.src=u
        }; inp.click()
      })

      // ---- 智能提取元素 ----
      pScene.querySelector('#sc-ed-extract')!.addEventListener('click',async()=>{
        if(!bgImage){ toast(pScene.querySelector('#sc-status') as HTMLElement,'请先导入地图底图',false); return }
        const cvs=document.createElement('canvas'); cvs.width=bgImage.naturalWidth; cvs.height=bgImage.naturalHeight
        const ctx=cvs.getContext('2d')!; ctx.drawImage(bgImage,0,0)
        const imgData=ctx.getImageData(0,0,cvs.width,cvs.height); const d=imgData.data
        const W2=cvs.width, H2=cvs.height
        const visited=new Uint8Array(W2*H2)
        const colors:Record<string,[number,number,number]>={
          water:[59,98,160], land:[74,122,58], sand:[230,210,160], tree:[40,80,40], grass:[80,140,50]
        }
        const colorDist=(a:[number,number,number],b:number[])=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])
        const matches=(px:number,py:number,cls:[number,number,number])=>{
          if(px<0||px>=W2||py<0||py>=H2) return false
          const i=(py*W2+px)*4
          return colorDist([d[i],d[i+1],d[i+2]],cls)<80
        }
        const flood=(sx:number,sy:number,cls:[number,number,number])=>{
          const comps:[number,number][]=[]
          const stack:number[][]=[[sx,sy]]; visited[sy*W2+sx]=1
          while(stack.length){
            const [cx2,cy2]=stack.pop()!
            comps.push([cx2,cy2])
            for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]]){
              const nx=cx2+dx, ny=cy2+dy
              if(nx>=0&&nx<W2&&ny>=0&&ny<H2&&!visited[ny*W2+nx]&&matches(nx,ny,cls)) visited[ny*W2+nx]=1, stack.push([nx,ny])
            }
          }
          return comps
        }
        const results:{x:number,y:number,w:number,h:number,cls:string}[]=[]
        const clsList=Object.entries(colors) as [string,[number,number,number]][]
        for(let y=0;y<H2;y+=4) for(let x=0;x<W2;x+=4){
          if(visited[y*W2+x]) continue
          for(const [clsName,cls] of clsList){
            if(matches(x,y,cls)){
              const comps=flood(x,y,cls)
              if(comps.length<16) continue
              const xs=comps.map(c=>c[0]), ys=comps.map(c=>c[1])
              const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys)
              results.push({ x:minX, y:minY, w:maxX-minX+1, h:maxY-minY+1, cls:clsName })
              for(const [cx2,cy2] of comps) visited[cy2*W2+cx2]=1
              break
            }
          }
        }
        const edStatus=pScene.querySelector('#sc-status') as HTMLElement
        if(edStatus) edStatus.textContent='提取完成: '+results.length+' 个元素'
        // 把提取的元素作为精灵加入
        const scaleX=W/bgImage.naturalWidth, scaleY=H/bgImage.naturalHeight
        for(const r of results.slice(0,20)){
          const sc=document.createElement('canvas'); sc.width=r.w; sc.height=r.h; const sctx=sc.getContext('2d')!
          sctx.drawImage(bgImage, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h)
          const dataUrl=sc.toDataURL('image/png')
          const img2=new Image(); await new Promise<void>(res=>{ img2.onload=()=>res(); img2.onerror=()=>res(); img2.src=dataUrl })
          const sw=Math.round(r.w*scaleX), sh=Math.round(r.h*scaleY)
          const sp:PlacedSprite={ id:genId(), spriteId:genId(), name:'['+r.cls+']', url:dataUrl, x:Math.round(r.x*scaleX), y:Math.round(r.y*scaleY), w:sw, h:sh, scale:1, rot:0, opacity:1, locked:false, layerId:currentLayerId, img:img2 }
          sprites.push(sp)
        }
        render(); loadSpritePalette(); updateLayerPanel(); pushHist()
        toast(edStatus,'提取了 '+Math.min(results.length,20)+' 个元素，自动放置在画布上',true)
      })

      // ---- 海水动画 ----
      pScene.querySelector('#sc-ed-water')!.addEventListener('click',()=>{
        const mode=(prompt('海水动画模式:\n1=帧动画(波浪波动)\n2=粒子(泡沫飞溅)\n3=着色器(正弦波动)\n输入数字(1-3):')||'1').trim()
        const w2:WaterRegion={ id:genId(), points:[], animType:mode==='2'?'particle':mode==='3'?'shader':'frame', color:'rgba(59,98,160,0.5)', speed:1.5, layerId:currentLayerId }
        // 全屏作为水面
        w2.points=[[0,0],[W,0],[W,H],[0,H]]
        waters.push(w2)
        render(); updateLayerPanel()
        toast(pScene.querySelector('#sc-status') as HTMLElement,'海水动画已添加(模式:'+w2.animType+')，可在属性面板调整参数',true)
      })

      // ---- 导出 .tscn ----
      pScene.querySelector('#sc-ed-export-tscn')!.addEventListener('click',()=>{
        const projectName=(pScene.querySelector('#e-name') as HTMLInputElement)?.value||'MyGodotGame'
        const safeName=projectName.replace(/[^a-zA-Z0-9_]/g,'_')
        const lines:string[]=[
          '[gd_scene load_steps='+(2+sprites.length*2+(waters.length?2:0)+(particles.length>0?particles.length:0))+' format=3]',
          '',
          '[ext_resource type="Script" path="res://scenes/'+safeName+'.gd"] id="1"',
        ]
        let extIdx=2
        const resMap:Record<string,number>={}
        for(const sp of sprites){
          if(!resMap[sp.url]){ resMap[sp.url]=extIdx++; lines.push('[ext_resource type="Texture2D" path="res://assets/sprites/'+sp.name.replace(/[^a-zA-Z0-9_.]/g,'_')+'.png" id="'+resMap[sp.url]+'"]') }
        }
        lines.push('')
        lines.push('[node name="'+safeName+'_Scene" type="Node2D"]')
        lines.push('script = ExtResource("1")')
        lines.push('')
        let nodeIdx=1
        if(bgUrl){
          lines.push('[node name="Background" type="Sprite2D" parent="."]')
          lines.push('position = Vector2('+W+'/2, '+H+'/2)')
          const bgRes=resMap[bgUrl]||(resMap[bgUrl]=extIdx++)
          lines.push('texture = ExtResource("'+bgRes+'")')
          lines.push(''); nodeIdx++
        }
        // 水面节点
        if(waters.length){
          lines.push('[node name="WaterLayer" type="Node2D" parent="."]')
          if(waters[0].animType==='particle'){
            lines.push('')
            lines.push('[node name="FoamParticles" type="CPUParticles2D" parent="WaterLayer"]')
            lines.push('position = Vector2('+W+'/2, '+H+'/2)')
            lines.push('amount = 80')
            lines.push('lifetime = 4.0')
            lines.push('speed = 60.0')
            lines.push('gravity = Vector2(0, 20)')
            lines.push('color = Color(0.78, 0.9, 1, 0.6)')
            lines.push('spread = 180.0')
          } else if(waters[0].animType==='shader'){
            lines.push('')
            lines.push('[node name="WaterShader" type="Sprite2D" parent="WaterLayer"]')
            lines.push('position = Vector2('+W+'/2, '+H+'/2)')
            lines.push('modulate = Color(0.23, 0.38, 0.63, 0.7)')
            lines.push('shader/material = SubResource("WaterMat")')
          }
          lines.push('')
        }
        // 粒子节点
        for(const p of particles){
          const pkind:Record<string,string>={ fire:'CPUParticles2D', smoke:'CPUParticles2D', sparkle:'CPUParticles2D', rain:'CPUParticles2D', snow:'CPUParticles2D', custom:'CPUParticles2D' }
          lines.push('[node name="Particle_'+p.id.slice(-4)+'" type="'+pkind[p.kind]+'" parent="."]')
          lines.push('position = Vector2('+Math.round(p.x+p.w/2)+', '+Math.round(p.y+p.h/2)+')')
          lines.push('amount = '+Math.round(p.params.amount||30))
          lines.push('lifetime = 3.0')
          lines.push('speed = '+(p.params.speed||1)*50)
          const pcolors:Record<string,string>={ fire:'Color(1, 0.5, 0, 0.8)', smoke:'Color(0.6, 0.6, 0.6, 0.3)', sparkle:'Color(1, 1, 0.8, 0.9)', rain:'Color(0.7, 0.8, 1, 0.5)', snow:'Color(1, 1, 1, 0.7)', custom:'Color(1, 1, 1, 0.8)' }
          lines.push('color = '+pcolors[p.kind])
          if(p.kind==='smoke'){ lines.push('gravity = Vector2(0, -30)'); lines.push('spread = 20.0') }
          else if(p.kind==='fire'){ lines.push('gravity = Vector2(0, -80)'); lines.push('spread = 40.0') }
          else if(p.kind==='sparkle'){ lines.push('gravity = Vector2(0, 0)'); lines.push('speed = 0.5'); lines.push('amount = '+(Math.round(p.params.amount||30)*2)) }
          lines.push('')
          nodeIdx++
        }
        // 精灵节点
        for(const sp of sprites){
          const nodeName='Sprite_'+nodeIdx+'_'+sp.name.replace(/[^a-zA-Z0-9_]/g,'_').slice(0,10)
          lines.push('[node name="'+nodeName+'" type="Sprite2D" parent="."]')
          lines.push('position = Vector2('+Math.round(sp.x+sp.w/2)+', '+Math.round(sp.y+sp.h/2)+')')
          lines.push('scale = Vector2('+sp.w+', '+sp.h+')')
          if(sp.rot) lines.push('rotation = '+sp.rot)
          if(sp.opacity<1) lines.push('modulate = Color(1,1,1,'+sp.opacity.toFixed(2)+')')
          const resId=resMap[sp.url]
          if(resId) lines.push('texture = ExtResource("'+resId+'")')
          lines.push(''); nodeIdx++
        }
        lines.push('[sub_resource type="GDScript" id="SceneScript"]')
        lines.push('script/source = "extends Node2D\\n\\nfunc _ready():\\n    pass"')
        lines.push('')
        lines.push('[sub_resource type="Environment" id="WaterMat"]')
        lines.push('background_mode = 4')
        lines.push('')
        lines.push('[connection signal="ready" from="." to="." method="_ready"]')
        lines.push('')
        lines.push('[connection signal="input_event" from="." to="." method="_on_input_event"]')

        const tcn='[gd_scene load_steps=1 format=3]\n\n[node name="'+safeName+'_Scene" type="Node2D"]\n\n# === Godot-Arter 关卡编辑器导出 ===\n# 精灵数: '+sprites.length+'  水面: '+waters.length+'  底图: '+(bgUrl?'有':'无')+'\n\n'
        const blob=new Blob([tcn+lines.join('\n')],{type:'text/plain'})
        downloadBlob(blob, safeName+'_scene.tscn')
        toast(pScene.querySelector('#sc-status') as HTMLElement,'已导出 '+safeName+'_scene.tscn（'+sprites.length+' 个精灵）',true)
      })

      // ---- Tab 切换 ----
      pScene.querySelector('#sc-tab-weather')!.addEventListener('click',()=>{
        ;(pScene.querySelector('#sc-tab-weather') as HTMLButtonElement).className='gas-btn'
        ;(pScene.querySelector('#sc-tab-editor') as HTMLButtonElement).className='gas-btn ghost'
        ;(pScene.querySelector('#sc-weather-section') as HTMLElement).style.display='block'
        ;(pScene.querySelector('#sc-editor-card') as HTMLElement).style.display='none'
      })
      pScene.querySelector('#sc-tab-editor')!.addEventListener('click',()=>{
        ;(pScene.querySelector('#sc-tab-weather') as HTMLButtonElement).className='gas-btn ghost'
        ;(pScene.querySelector('#sc-tab-editor') as HTMLButtonElement).className='gas-btn'
        ;(pScene.querySelector('#sc-weather-section') as HTMLElement).style.display='none'
        ;(pScene.querySelector('#sc-editor-card') as HTMLElement).style.display='block'
        initCanvas(); updateLayerPanel(); loadSpritePalette()
      })

      // ---- 缩放控制 ----
      ;(pScene.querySelector('#sc-ed-zoom') as HTMLInputElement).addEventListener('input',(e:any)=>{
        zoom=Math.max(0.1,Math.min(4,+e.target.value/100))
        edCanvas.style.width=W*zoom+'px'; edCanvas.style.height=H*zoom+'px'
        edOverlay.style.width=W*zoom+'px'; edOverlay.style.height=H*zoom+'px'
        ;(pScene.querySelector('#sc-ed-zoom-label') as HTMLElement).textContent=Math.round(zoom*100)+'%'
      })

      // ---- 撤销 ----
      pScene.querySelector('#sc-ed-undo')!.addEventListener('click',()=>{
        if(histIdx<=0) return
        histIdx--
        const h=history[histIdx]
        sprites.length=0; sprites.push(...JSON.parse(JSON.stringify(h.sprites)))
        layers.length=0; layers.push(...JSON.parse(JSON.stringify(h.layers)))
        waters.length=0; waters.push(...JSON.parse(JSON.stringify(h.waters)))
        particles.length=0; particles.push(...(JSON.parse(JSON.stringify(h.particles||[]))))
        bgUrl=h.bgUrl
        if(bgUrl){ const img=new Image(); img.onload=()=>{ bgImage=img; render() }; img.src=bgUrl }
        else bgImage=null
        selectedId=null; render(); updateLayerPanel()
      })

      // ---- 清空 ----
      pScene.querySelector('#sc-ed-clear')!.addEventListener('click',()=>{
        if(!confirm('确定清空当前关卡？')) return
        sprites.length=0; waters.length=0; bgUrl=null; bgImage=null; selectedId=null
        pushHist(); render(); updateLayerPanel(); updatePropsPanel()
      })

      // ---- 实时预览 ----
      pScene.querySelector('#sc-ed-preview')!.addEventListener('click',()=>{
        // 在新窗口打开预览
        const previewWin=window.open('','','width='+W+',height='+H)
        if(!previewWin) return
        previewWin.document.write(`<!DOCTYPE html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas><script>
const c=document.getElementById('c'); const ctx=c.getContext('2d');
const bg='${bgUrl||''}';
const spr=${JSON.stringify(sprites.map(s=>({...s,url:s.url}))) };
const waters=${JSON.stringify(waters)};
let t=0;
async function run(){
  if(bg){ const bi=new Image(); bi.crossOrigin='anonymous'; await new Promise(r=>{ bi.onload=r; bi.onerror=r; bi.src=bg }); ctx.drawImage(bi,0,0) }
  const simg={}; for(const s of spr){ const i=new Image(); i.crossOrigin='anonymous'; await new Promise(r=>{ i.onload=r; i.onerror=r; i.src=s.url }); simg[s.id]=i }
  function frame(){
    ctx.clearRect(0,0,${W},${H});
    if(bg&&simg['__bg']) ctx.drawImage(simg['__bg'],0,0);
    const s2=[...spr].sort((a,b)=>a.y-b.y);
    for(const s of s2){ if(simg[s.id]) ctx.drawImage(simg[s.id],s.x,s.y,s.w,s.h); }
    t+=0.016; requestAnimationFrame(frame);
  }
  // load bg
  if(bg){ const bi=new Image(); bi.crossOrigin='anonymous'; bi.onload=()=>{ simg['__bg']=bi; simg['__bg'].src=bg; simg['__bg'].onload=()=>requestAnimationFrame(frame) }; bi.src=bg }
  else requestAnimationFrame(frame);
}
run();
<\/script></body></html>`)
      })

      // ---- 初始化 ----
      pushHist()

      // ---- 精灵帧动画循环 ----
      let lastAnimTime=0
      function animLoop(ts:number){
        if(ts-lastAnimTime>=16){ // ~60fps
          let dirty=false
          for(const sp of sprites){
            if(sp.frameCount && sp.frameCount>1){
              const fps=sp.fps||8
              const interval=1000/fps
              if(!sp.lastFrameTime) sp.lastFrameTime=ts
              if(ts-sp.lastFrameTime>=interval){
                sp.frame=((sp.frame||0)+1)%sp.frameCount
                sp.lastFrameTime=ts
                dirty=true
              }
            }
          }
          if(dirty) render()
          lastAnimTime=ts
        }
        requestAnimationFrame(animLoop)
      }
      requestAnimationFrame(animLoop)
    })()
  })()

// ---- 程序化地形（功能借鉴 blob_world：种子化多层噪声 + 分类）----
  ;(()=>{
    const canvas=pMap.querySelector('#ptm-canvas') as HTMLCanvasElement
    const ctx=canvas.getContext('2d')!
    const status=pMap.querySelector('#ptm-status') as HTMLElement
    function makeNoise(seed:string){
      const perm=new Uint8Array(512); const arr=new Uint8Array(256)
      let h=2166136261
      for(let i=0;i<seed.length;i++){ h^=seed.charCodeAt(i)||0; h=Math.imul(h,16777619)>>>0 }
      for(let i=0;i<256;i++){ h=Math.imul(h^(i+7),16777619)>>>0; arr[i]=h&255 }
      for(let i=255;i>0;i--){ const j=h%(i+1); const tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp; h=Math.imul(h,1664525)+1013904223>>>0 }
      for(let i=0;i<512;i++) perm[i]=arr[i&255]
      const fade=(t:number)=>t*t*t*(t*(t*6-15)+10)
      const lerp2=(a:number,b:number,t:number)=>a+(b-a)*t
      const DIRS:number[][]=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
      const grad=(ix:number,iy:number,dx:number,dy:number)=>{ const d=DIRS[perm[(ix+perm[iy&255])&255]&7]; return d[0]*dx+d[1]*dy }
      const noise=(x:number,y:number)=>{
        const X=Math.floor(x), Y=Math.floor(y)
        const xf=x-X, yf=y-Y
        const u=fade(xf), v=fade(yf)
        const n00=grad(X,Y,xf,yf), n10=grad(X+1,Y,xf-1,yf), n01=grad(X,Y+1,xf,yf-1), n11=grad(X+1,Y+1,xf-1,yf-1)
        return lerp2(lerp2(n00,n10,u),lerp2(n01,n11,u),v)/1.41421356
      }
      const fbm=(x:number,y:number,oct:number)=>{ let a=0,amp=1,f=1,n=0; for(let i=0;i<oct;i++){ a+=noise(x*f,y*f)*amp; n+=amp; amp*=0.5; f*=2 } return a/n }
      return { fbm }
    }
    function gen(){
      const seed=(pMap.querySelector('#ptm-seed') as HTMLInputElement)?.value||'78123'
      const sea=parseFloat((pMap.querySelector('#ptm-sea') as HTMLInputElement)?.value||'0')||0
      const mtn=parseFloat((pMap.querySelector('#ptm-mtn') as HTMLInputElement)?.value||'40')||40
      const noise=makeNoise(seed)
      const W=256,H=256, S=16 // 每格地形块像素
      const rows=H/S, cols=W/S
      const classes:string[]=[]
      for(let ty=0;ty<rows;ty++){
        for(let tx=0;tx<cols;tx++){
          // 按瓦片索引频率采样（跨多块噪声域），保证一块地图形状丰富
          const land=noise.fbm(tx/5.5,ty/5.5,3)
          const mtnN=noise.fbm(tx/8+100,ty/8+100,3)
          const river=noise.fbm(tx/3.2,ty/3.2,2)
          const height=land + mtnN*(mtn/100)*0.9 - sea/40
          let cls:string
          if(height<-0.06) cls='水'
          else if(height>=-0.02&&river>-0.05&&river<0.05&&height<0.45) cls='河流'
          else if(height>0.32) cls='雪顶'
          else if(height>0.16) cls='山脉'
          else if(noise.fbm(tx/11+300,ty/11+300,2)>0.04) cls='森林'
          else cls='陆地'
          classes.push(cls)
        }
      }
      const colors:Record<string,string>={ '水':'#3b62a0','河流':'#4d86c9','陆地':'#6fa75c','森林':'#477a3a','山脉':'#8a8278','雪顶':'#e8eef2' }
      const idx=0; ctx.imageSmoothingEnabled=false
      for(let ty=0;ty<rows;ty++) for(let tx=0;tx<cols;tx++){
        const cls=classes[ty*cols+tx]
        ctx.fillStyle=colors[cls]||'#555'
        ctx.fillRect(tx*S,ty*S,S,S)
      }
      return { classes, cols, rows, S, colors }
    }
    let last:any=null
    const run=()=>{ last=gen() }
    pMap.querySelector('#ptm-gen')!.addEventListener('click', ()=>{ run(); if(status) status.textContent='✓ 已生成 256×256 地形（16px 块 × '+last.cols+'×'+last.rows+'）—— 水/河流/陆地/森林/山脉/雪顶' })
    pMap.querySelector('#ptm-export')!.addEventListener('click', ()=>{
      if(!last){ run() }
      const json:any={ godot:'TileSet', tile_size:last.S, columns:last.cols, rows:last.rows, image:'terrain.png', classes:[...(new Set(last.classes))], tiles:[] }
      for(let i=0;i<last.classes.length;i++) json.tiles.push({ id:i, type:last.classes[i], region:[(i%last.cols)*last.S, Math.floor(i/last.cols)*last.S, last.S, last.S] })
      const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'})
      const tsP=Date.now(); const pngP='procedural_terrain_'+tsP+'.png'
      downloadBlob(blob,'procedural_tileset_'+tsP+'.json')
      const au=document.createElement('a'); au.href=canvas.toDataURL('image/png'); au.download=pngP; au.click()
      // Godot 原生 .tres：引用同目录地形 PNG,拖入即用
      const pt=document.createElement('a'); pt.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildTileSetTres(pngP, last.cols, last.rows, last.S)); pt.download='procedural_tileset_'+tsP+'.tres'; pt.click()
      if(status) status.textContent='✓ 已导出 TileSet.json（'+last.cols+'×'+last.rows+'）+ 地形预览 PNG + TileSet.tres（PNG 同目录拖入 Godot 即用）'
    })
    pMap.querySelector('#ptm-save')!.addEventListener('click', async()=>{
      if(!last){ run() }
      const id=await addToLibrary('map','程序化地形 '+new Date().toLocaleTimeString(), canvas.toDataURL('image/png'))
      toast(status||document.body,'已入库 '+id)
    })
    run()
  })()

// ---- 无缝拼接工作台（构思借鉴 MapStitch：区块矩阵 / 边缘参考 / 掩码 / Godot 导出）----
  ;(()=>{
    const stCanvas=pMap.querySelector('#st-canvas') as HTMLCanvasElement
    const ctx=stCanvas.getContext('2d')!
    const info=pMap.querySelector('#st-gridinfo') as HTMLElement
    const offV=pMap.querySelector('#st-offset-v') as HTMLElement
    const status=pMap.querySelector('#st-status') as HTMLElement
    const CHUNK=1024, OVERLAP=128, STRIDE=CHUNK-OVERLAP, SCALE=0.42
    let chunks:any[]=[] // {gx,gy,img,ox,oy,masks:{col,occ,fg}: number[][][]}
    let sel=-1, maskLayer='', drawing:any=null
    const MASK_COLORS:Record<string,{fill:string,stroke:string}>={ col:{fill:'rgba(255,70,70,0.35)',stroke:'rgba(255,70,70,0.9)'}, occ:{fill:'rgba(80,130,255,0.32)',stroke:'rgba(80,130,255,0.9)'}, fg:{fill:'rgba(255,215,90,0.32)',stroke:'rgba(255,215,90,0.9)'} }
    const cam=()=>({ x:stCanvas.width/2, y:stCanvas.height/2 })
    function redraw(){
      ctx.clearRect(0,0,stCanvas.width,stCanvas.height)
      ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1
      for(let i=-6;i<=6;i++){ const x=cam().x+i*STRIDE*SCALE; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,stCanvas.height); ctx.stroke() }
      for(let j=-6;j<=6;j++){ const y=cam().y+j*STRIDE*SCALE; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(stCanvas.width,y); ctx.stroke() }
      chunks.forEach((c:any,idx:number)=>{
        const wx=cam().x+(c.gx*STRIDE+(c.ox||0))*SCALE, wy=cam().y+(c.gy*STRIDE+(c.oy||0))*SCALE
        ctx.drawImage(c.img,wx,wy,CHUNK*SCALE,CHUNK*SCALE)
        ctx.strokeStyle= idx===sel?'#ffd76a':'rgba(255,255,255,0.5)'; ctx.lineWidth= idx===sel?3:1
        ctx.strokeRect(wx,wy,CHUNK*SCALE,CHUNK*SCALE)
        for(const key of ['col','occ','fg'] as const){
          const mc=MASK_COLORS[key]; ctx.fillStyle=mc.fill; ctx.strokeStyle=mc.stroke; ctx.lineWidth=2
          for(const stroke of c.masks[key]){
            if(stroke.length<2) continue
            ctx.beginPath(); ctx.moveTo(wx+stroke[0][0]*SCALE,wy+stroke[0][1]*SCALE)
            for(let i=1;i<stroke.length;i++) ctx.lineTo(wx+stroke[i][0]*SCALE,wy+stroke[i][1]*SCALE)
            ctx.closePath(); ctx.fill(); ctx.stroke()
          }
        }
      })
      if(info) info.textContent = chunks.length? (chunks.length+' 区块 · 选中 '+ (sel>=0? chunks[sel].gx+','+chunks[sel].gy:'无') + ' · 1024px/块 · 重叠 '+OVERLAP+'px') : ''
    }
    function loadImg(src:string):Promise<HTMLImageElement>{ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src }) }
    async function addChunk(img:HTMLImageElement){
      // 统一缩放到 1024 区块
      const c=document.createElement('canvas'); c.width=CHUNK; c.height=CHUNK
      const g=c.getContext('2d')!; g.imageSmoothingEnabled=false
      const s=Math.max(CHUNK/(img.naturalWidth||CHUNK), CHUNK/(img.naturalHeight||CHUNK))
      const w=(img.naturalWidth||CHUNK)*s, h=(img.naturalHeight||CHUNK)*s
      g.drawImage(img,(CHUNK-w)/2,(CHUNK-h)/2,w,h)
      const dataUrl=c.toDataURL('image/png')
      const chunk={ gx:chunks.length, gy:0, img:await loadImg(dataUrl), ox:0, oy:0, masks:{ col:[], occ:[], fg:[] } }
      chunks.push(chunk); sel=chunks.length-1; redraw()
      if(status) { status.textContent='已加入区块 '+chunk.gx+','+chunk.gy+'（'+CHUNK+'×'+CHUNK+'）→ 可提取边缘参考图交给 AI 局部重绘，再点「上传区块图」回拼'; status.style.color='#2ecc71' }
    }
    function canvasXY(e:any){ const r=stCanvas.getBoundingClientRect(); return { vx:(e.clientX-r.left)/r.width*stCanvas.width, vy:(e.clientY-r.top)/r.height*stCanvas.height } }
    function toChunkLocal(vx:number,vy:number,c:any){ return { x:(vx-cam().x)/SCALE-(c.gx*STRIDE+(c.ox||0)), y:(vy-cam().y)/SCALE-(c.gy*STRIDE+(c.oy||0)) } }
    async function edgeStrip(side:'right'|'bottom'){
      if(sel<0||!chunks[sel]) { if(status) status.textContent='请先选中一个区块'; return }
      const c=chunks[sel]
      const cvs=document.createElement('canvas')
      cvs.width = side==='right'? OVERLAP : CHUNK
      cvs.height = side==='right'? CHUNK : OVERLAP
      const g=cvs.getContext('2d')!
      if(side==='right') g.drawImage(c.img, CHUNK-OVERLAP,0,OVERLAP,CHUNK,0,0,OVERLAP,CHUNK)
      else g.drawImage(c.img, 0,CHUNK-OVERLAP,CHUNK,OVERLAP,0,0,CHUNK,OVERLAP)
      const a=document.createElement('a'); a.href=cvs.toDataURL('image/png'); a.download='edge_'+side+'_'+c.gx+'_'+c.gy+'.png'; a.click()
      if(status) status.textContent='已提取'+ (side==='right'?'右':'下') +'边缘参考图（'+ (side==='right'?OVERLAP+'×'+CHUNK:CHUNK+'×'+OVERLAP) +'）→ 发给 AI 局部重绘后上传回拼'; status.style.color='#2ecc71'
    }
    // ---- events ----
    pMap.querySelector('#st-add')!.addEventListener('click', async()=>{
      const big=(pMap.querySelector('#map-big-img') as HTMLImageElement)?.src
      const prev=(pMap.querySelector('#map-preview img') as HTMLImageElement | null)
      const src= prev?.src || big || ''
      if(!src || src==='' || src.endsWith('尚未生成大地图')) { if(status){ status.textContent='请先生成或上传一张底图（可用「✨ AI 生成」或上传）'; status.style.color='#e74c3c' } return }
      toast(status,'正在把当前图加入区块矩阵…')
      try{ await addChunk(await loadImg(src)) }catch(e:any){ toast(status,String(e.message||e),false) }
    })
    pMap.querySelector('#st-file')!.addEventListener('change', async(e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const url=URL.createObjectURL(f)
      try{ await addChunk(await loadImg(url)) }catch(err:any){ toast(status,String(err.message||err),false) }
      finally{ revokeSoon(url, 5000) }
    })
    pMap.querySelector('#st-edge')!.addEventListener('click', ()=> edgeStrip('right'))
    pMap.querySelector('#st-edge-b')!.addEventListener('click', ()=> edgeStrip('bottom'))
    pMap.querySelector('#st-offset')!.addEventListener('input', (e:any)=>{
      const v=parseInt(e.target.value)||0; if(offV) offV.textContent=String(v)
      if(sel>=0&&chunks[sel]){ chunks[sel].ox=v; redraw() }
    })
    pMap.querySelector('#st-undo')!.addEventListener('click', ()=>{ if(chunks.length){ chunks.pop(); sel=Math.min(sel,chunks.length-1); redraw(); if(status) status.textContent='已撤销最后一个区块' } })
    pMap.querySelector('#st-clear')!.addEventListener('click', ()=>{
      if(!chunks.length) return
      if(!confirm('清空拼接工作台？')) return
      chunks=[]; sel=-1; redraw(); if(status) status.textContent='工作台已清空'
    })
    pMap.querySelector('#st-mask-clear')!.addEventListener('click', ()=>{
      if(sel<0||!chunks[sel]) { if(status) status.textContent='请先选中区块'; return }
      for(const k of ['col','occ','fg']) chunks[sel].masks[k]=[]
      redraw(); if(status) status.textContent='已清除当前区块全部掩码'
    })
    pMap.querySelectorAll<HTMLElement>('[data-mask]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        maskLayer = maskLayer===btn.dataset.mask ? '' : (btn.dataset.mask||'')
        pMap.querySelectorAll<HTMLElement>('[data-mask]').forEach(b=>{ b.style.outline = b===btn && maskLayer ? '2px solid var(--accent)' : '' })
        if(status) status.textContent = maskLayer? '正在绘制「'+btn.textContent?.trim()+'」——在画布上按住拖拽涂画，松开成块':'已退出掩码绘制'
      })
    })
    stCanvas.addEventListener('mousedown', (e:any)=>{
      if(!maskLayer || sel<0 || !chunks[sel]) return
      const {vx,vy}=canvasXY(e); const c=chunks[sel]; const p=toChunkLocal(vx,vy,c)
      if(p.x<-50||p.y<-50||p.x>CHUNK+50||p.y>CHUNK+50) return
      drawing={ pts:[[Math.round(p.x),Math.round(p.y)]] }
      stCanvas.style.cursor='crosshair'
      redraw()
    })
    stCanvas.addEventListener('mousemove', (e:any)=>{
      if(!drawing) return
      const {vx,vy}=canvasXY(e); const c=chunks[sel]; const p=toChunkLocal(vx,vy,c)
      const last=drawing.pts[drawing.pts.length-1]
      if(Math.hypot(p.x-last[0],p.y-last[1])>10) drawing.pts.push([Math.round(p.x),Math.round(p.y)])
      redraw()
    })
    stCanvas.addEventListener('mouseup', ()=>{
      if(!drawing) return
      if(drawing.pts.length>=2){ const c=chunks[sel]; c.masks[maskLayer||'col'].push(drawing.pts); if(status) status.textContent = '已记录「'+ (maskLayer==='col'?'禁足':maskLayer==='occ'?'遮挡':'前景') +'」掩码（' + (c.gx)+','+(c.gy)+ '）,可继续绘制或导出' }
      drawing=null; stCanvas.style.cursor='pointer'; redraw()
    })
    pMap.querySelector('#st-export')!.addEventListener('click', ()=>{
      if(!chunks.length){ if(status){ status.textContent='工作台为空，先加入区块'; status.style.color='#e74c3c' } return }
      for(const c of chunks){
        const a=document.createElement('a'); a.href=c.img.src; a.download='chunk_'+c.gx+'_'+c.gy+'_bg.png'; a.click()
      }
      const polygons:{col:number[][][],occ:number[][][],fg:number[][][]}={ col:[],occ:[],fg:[] }
      for(const c of chunks) for(const key of ['col','occ','fg'] as const){
        for(const stroke of c.masks[key]){
          polygons[key].push(stroke.map((pt:number[])=>[pt[0]+c.gx*STRIDE+(c.ox||0), pt[1]+c.gy*STRIDE+(c.oy||0)]))
        }
      }
      const json={ map_version:'FINAL_PERFECT', chunk_stride:STRIDE, chunk_size:CHUNK, overlap:OVERLAP,
        chunks: chunks.map(c=>({ chunk_id:c.gx+'_'+c.gy, grid_x:c.gx, grid_y:c.gy, background_path:'images/chunk_'+c.gx+'_'+c.gy+'_bg.png', global_position:{ x:c.gx*STRIDE+(c.ox||0), y:c.gy*STRIDE+(c.oy||0) }, buildings:[] })),
        global_polygons: polygons }
      const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'})
      downloadBlob(blob,'map_data.json')
      if(status){ status.textContent='✓ 已导出 '+chunks.length+' 个区块 PNG + map_data.json（MapChunkManager.cs 兼容：global_position + global_polygons）'; status.style.color='#2ecc71' }
    })
    redraw()
  })()

// ---- Asset Manager ----
  ;(()=>{
    const libsEl= pAsset.querySelector('#al-libs') as HTMLElement
    const gridEl= pAsset.querySelector('#al-grid') as HTMLElement
    const searchEl= pAsset.querySelector('#al-search') as HTMLInputElement
    const statusEl= pAsset.querySelector('#al-status') as HTMLElement
    const importEl= pAsset.querySelector('#al-import') as HTMLInputElement
    const importDirEl= pAsset.querySelector('#al-import-dir') as HTMLInputElement
    let activeLib='character'
    let allItems:any[]=[]
    const isImageFile=(f:any)=> (f.type||'').startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg|avif|ico|tiff?)$/i.test(f.name||'')

    function formatTime(t:number){ return new Date(t).toLocaleString() }

    function renderLibs(){
      if(!libsEl) return
      libsEl.innerHTML=''
      for(const [key,def] of Object.entries(allLibDefs())){
        const row=document.createElement('div'); row.style.display='flex'; row.style.gap='4px'; row.style.alignItems='center'
        const btn=document.createElement('button')
        btn.className='gas-btn'+(key===activeLib?'':' ghost')
        btn.textContent=def.label
        btn.style.textAlign='left'
        btn.style.flex='1'
        btn.onclick=()=>{ activeLib=key; renderLibs(); renderGrid() }
        row.appendChild(btn)
        // 自建包支持重命名/删除
        if(getCustomLibs().some(c=>c.key===key)){
          const ren=document.createElement('button'); ren.className='gas-btn ghost'; ren.textContent='✎'; ren.style.padding='2px 6px'; ren.title='重命名包'
          ren.onclick=()=>{
            const name=prompt('重命名包',def.label); if(!name||!name.trim()) return
            const list=getCustomLibs(); const c=list.find(x=>x.key===key)
            if(c){ c.label=name.trim(); saveCustomLibs(list); renderLibs() }
          }
          const delBtn=document.createElement('button'); delBtn.className='gas-btn ghost'; delBtn.textContent='🗑'; delBtn.style.padding='2px 6px'; delBtn.style.color='#e74c3c'; delBtn.title='删除包（包内素材移到素材库）'
          delBtn.onclick=async()=>{
            if(!confirm('删除包「'+def.label+'」？包内素材将移动到「素材库」。')) return
            for(const it of allItems) if(it.kind===key) await idbPut({ ...it, kind:'asset' })
            saveCustomLibs(getCustomLibs().filter(x=>x.key!==key))
            if(activeLib===key) activeLib='asset'
            await refresh(); statusEl.textContent='已删除包，素材移入素材库'
          }
          row.append(ren,delBtn)
        }
        libsEl.appendChild(row)
      }
    }

    function renderGrid(){
      if(!gridEl) return
      const q=(searchEl?.value||'').trim().toLowerCase()
      const libLabel=(allLibDefs()[activeLib]||{}).label||activeLib
      const list=allItems.filter(a=>a.kind===activeLib && (!q || (a.name||'').toLowerCase().includes(q) || (a.id||'').toLowerCase().includes(q)))
        .sort((a,b)=>b.createdAt-a.createdAt)
      if(!list.length){ gridEl.innerHTML='<div class="gas-note" style="grid-column:1/-1">「'+libLabel+'」为空 —— 生成后点「📥 入库」，或直接拖图片到此处导入。</div>'; return }
      gridEl.innerHTML=''
      const libKeys=Object.keys(allLibDefs())
      for(const item of list){
        const card=document.createElement('div'); card.className='gas-thumb'
        card.innerHTML='<img src="'+item.url+'">'
        const meta=document.createElement('div'); meta.className='meta'; meta.style.height='auto'; meta.style.flexDirection='column'; meta.style.alignItems='flex-start'
        meta.innerHTML='<span>'+item.id+'</span><span style="max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(item.name||'')+'</span><span>'+formatTime(item.createdAt)+'</span>'
        card.appendChild(meta)
        // 点击缩略图放大查看
        card.style.cursor='zoom-in'
        card.addEventListener('click', (e:any)=>{
          if((e.target as HTMLElement).closest('button, select, .meta, .gas-nav-item')) return
          openAssetLightbox(item.url, item.name||item.id, item.id)
        })
        const actions=document.createElement('div'); actions.style.position='absolute'; actions.style.top='4px'; actions.style.right='4px'; actions.style.display='flex'; actions.style.gap='4px'; actions.style.alignItems='center'
        const dl=document.createElement('button'); dl.className='gas-btn ghost'; dl.textContent='⬇'; dl.style.padding='2px 6px'; dl.onclick=()=>void downloadUrl(item.url,item.id+'.png')
        // 移动到其他库/包
        const mv=document.createElement('select'); mv.className='gas-select'; mv.style.padding='1px 2px'; mv.style.fontSize='10px'; mv.style.width='76px'
        mv.innerHTML='<option value="">⇄ 移动</option>'+libKeys.map(k=>'<option value="'+k+'">'+allLibDefs()[k].label+'</option>').join('')
        mv.onchange=async()=>{
          const to=mv.value; if(!to||to===item.kind) return
          await idbPut({ ...item, kind:to }); allItems=await idbGetAll(); renderGrid()
          statusEl.textContent='已移动 '+item.id+' → '+((allLibDefs()[to]||{}).label)
        }
        const del=document.createElement('button'); del.className='gas-btn ghost'; del.textContent='🗑'; del.style.padding='2px 6px'; del.style.color='#e74c3c'; del.onclick=async()=>{
          if(!confirm('删除素材 '+item.id+'？')) return
          await idbDelete(item.id); allItems=await idbGetAll(); renderGrid(); statusEl.textContent='已删除 '+item.id
        }
        actions.append(dl,mv,del); card.appendChild(actions)
        gridEl.appendChild(card)
      }
    }

    // 图片导入（单张/多张/文件夹均可），任意图片格式
    async function importImages(files:any){
      const imgs=[...files].filter((f:any)=>isImageFile(f))
      if(!imgs.length) return { ok:0, fail:0 }
      let ok=0, fail=0
      for(const f of imgs){
        try{
          const dataUrl=await new Promise<string>((res,rej)=>{
            const r=new FileReader(); r.onload=()=>res(r.result as string); r.onerror=()=>rej(r.error||new Error('read error')); r.readAsDataURL(f)
          })
          const rel=f.webkitRelativePath||''
          const name= rel.split(/[\\/]/).filter(Boolean).slice(-2).join('/') || f.name
          await addToLibrary(activeLib, name, dataUrl)
          ok++
        }catch{ fail++ }
      }
      return { ok, fail }
    }
    async function importBackup(file:any){
      const text=await file.text()
      const data=JSON.parse(text)
      const items=Array.isArray(data)?data:(data.items||[])
      if(!items.length) throw new Error('备份为空')
      for(const it of items){ if(it.id && it.url) await idbPut({ ...it, createdAt:it.createdAt||Date.now() }) }
      return items.length
    }
    async function handleImportFiles(files:any){
      const arr=[...files]
      const jsonFiles=arr.filter((f:any)=>f.type==='application/json'||/\.json$/i.test(f.name||''))
      const imgFiles=arr.filter((f:any)=>!(f.type==='application/json'||/\.json$/i.test(f.name||'')))
      let msg=''
      if(jsonFiles.length){
        try{ msg+='已导入备份 '+await importBackup(jsonFiles[0])+' 个；' }catch(e:any){ msg+='备份导入失败：'+String(e.message||e).slice(0,40)+'；' }
      }
      if(imgFiles.length){
        const r=await importImages(imgFiles)
        msg+='已导入图片 '+r.ok+' 张'+(r.fail?'（失败 '+r.fail+'）':'')+'到「'+((allLibDefs()[activeLib]||{}).label)+'」'
        if(!r.ok && !jsonFiles.length) msg='没有可导入的图片（支持 PNG/JPG/WebP/GIF/BMP/SVG/AVIF 等）'
      }
      await refresh()
      statusEl.textContent=msg||'未导入任何文件'
    }

    async function refresh(){ allItems=await idbGetAll(); renderLibs(); renderGrid() }
    refreshAssetManagerGlobal=refresh
    refresh()

    searchEl.addEventListener('input', renderGrid)
    pAsset.querySelector('#al-export')!.addEventListener('click', ()=>{
      const payload={ exportedAt:new Date().toISOString(), app:'Godot-Arter', items:allItems }
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
      downloadBlob(blob,'godot-arter-assets-'+Date.now()+'.json')
      statusEl.textContent='已导出 '+allItems.length+' 个素材备份'
    })
    importEl.addEventListener('change', (e:any)=>{ const fs=e.target.files; if(fs&&fs.length) void handleImportFiles(fs); e.target.value='' })
    importDirEl.addEventListener('change', (e:any)=>{ const fs=e.target.files; if(fs&&fs.length) void handleImportFiles(fs); e.target.value='' })
    // 新建自建包
    pAsset.querySelector('#al-addlib')!.addEventListener('click', ()=>{
      const name=prompt('新包名称','我的包 '+(getCustomLibs().length+1)); if(!name||!name.trim()) return
      const list=getCustomLibs(); list.unshift({ key:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), label:name.trim(), prefix:'PKG' })
      saveCustomLibs(list); renderLibs(); statusEl.textContent='已创建包「'+name.trim()+'」，切换到它即可导入素材'
    })
    // 拖放导入：单张 / 多张 / 整文件夹
    gridEl.addEventListener('dragover', (e:any)=>{ e.preventDefault(); gridEl.style.outline='2px dashed var(--accent)' })
    gridEl.addEventListener('dragleave', ()=>{ gridEl.style.outline='' })
    gridEl.addEventListener('drop', (e:any)=>{ e.preventDefault(); gridEl.style.outline=''; const files=e.dataTransfer?.files; if(files&&files.length) void handleImportFiles(files) })
    pAsset.querySelector('#al-clear')!.addEventListener('click', async()=>{
      if(!confirm('确定清空「'+((allLibDefs()[activeLib]||{}).label)+'」？')) return
      await idbClearByKind(activeLib); await refresh(); statusEl.textContent='已清空 '+((allLibDefs()[activeLib]||{}).label)
    })
  })()

  // ---- Export center ----
  function refreshExportList(){
    const list=main.querySelector('#e-list') as HTMLElement; if(!list) return
    const h=getHistory()
    if(!h.length){ list.textContent='暂无素材 — 去前面工坊生成后会自动收录'; return }
    list.innerHTML= h.slice(0,12).map((x:any,i)=> `<div style="display:flex;gap:6px;align-items:center;padding:3px 0;border-bottom:1px dashed #3a3f47"><span style="color:#6ea6d1">#${i+1}</span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.kind} · ${(x.prompt||x.file||'').slice(0,24)}</span><span style="font-size:10px;color:#9aa0a6">${new Date(x.at).toLocaleTimeString()}</span></div>`).join('')
  }
  setTimeout(refreshExportList,500)
  /* ---- 网页联动收件箱：自动导入扩展保存的素材 ---- */
  const WEB_INBOX_LS='dsh-game-art-studio:webInboxAt'
  async function webLinkCheckInbox(after:number|null, manual=false){
    if(!WEB_LINK_BASE){ if(manual) webToast('⚠️ file:// 模式下网页收件箱不可用（需 node server.mjs 本地服务）',false); return }
    try{
      const since= after!=null ? after : Number(localStorage.getItem(WEB_INBOX_LS)||0)
      const j=await(await fetch(WEB_LINK_BASE+'/api/web-link/assets?after='+since)).json()
      const items=(j&&j.items)||[]
      let imported=0; let maxAt=since
      for(const rec of items){
        if(Number(rec.at)>maxAt) maxAt=Number(rec.at)
        let exist=false
        try{ const all=await idbGetAll(); exist=all.some((a:any)=>a.id==='WEB-'+rec.id) }catch{}
        if(exist) continue
        try{
          const blob=await(await fetch(WEB_LINK_BASE+'/'+rec.rel)).blob()
          const dataUrl=await new Promise<string>((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result as string); fr.onerror=rej; fr.readAsDataURL(blob) })
          await idbPut({ id:'WEB-'+rec.id, kind:'asset', name:((rec.prompt? rec.prompt.slice(0,20): rec.file)+' ('+(rec.site==='gemini'?'Gemini':'ChatGPT')+')'), url:dataUrl, createdAt:Number(rec.at), meta:{ source:'web:'+rec.site, prompt:rec.prompt||'', file:rec.rel, sourceUrl:rec.sourceUrl||'' } })
          imported++
        }catch{}
      }
      if(maxAt>since) localStorage.setItem(WEB_INBOX_LS,String(maxAt))
      if(imported){
        try{ refreshAssetManagerGlobal?.() }catch{}
        webToast('📥 已从网页联动收件箱导入 '+imported+' 张素材到素材库')
      }else if(manual){
        webToast(items.length?'✅ 没有需要新导入的素材（已存在）':'✅ 收件箱为空 — 在 ChatGPT/Gemini 网页点「💾 Godot-Arter」保存后会自动出现在素材库')
      }
    }catch{ if(manual) webToast('❌ 联动服务未连接（server.mjs 未运行？）',false) }
  }
  if(WEB_LINK_BASE){
    if(!localStorage.getItem(WEB_INBOX_LS)) localStorage.setItem(WEB_INBOX_LS,String(Date.now()))
    setTimeout(()=>webLinkCheckInbox(null,false),2500)
    setInterval(()=>webLinkCheckInbox(null,false),8000)
  }
  main.querySelector('#e-manifest')?.addEventListener('click', ()=>{
    const h=getHistory(); const mf={ project:(main.querySelector('#e-name') as HTMLInputElement).value, godot:'4.2', generated_at:new Date().toISOString(), counts: h.reduce((a:any,c:any)=>{a[c.kind]=(a[c.kind]||0)+1;return a},{}), assets:h, structure:{ 'res://assets/characters/':'角色', 'res://assets/spritesheets/':'序列帧', 'res://assets/tilesets/':'瓦片', 'res://assets/icons/':'道具' } }
    const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent=JSON.stringify(mf,null,2)
    downloadBlob(new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}),'godot_manifest.json')
  })
  main.querySelector('#e-clear')?.addEventListener('click', ()=>{ localStorage.removeItem(LS_HISTORY); refreshExportList(); const pre=main.querySelector('#e-preview') as HTMLElement; if(pre) pre.style.display='none' })
  main.querySelector('#e-dump')?.addEventListener('click', ()=>{ const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent= 'localStorage '+LS_HISTORY+':\\n'+ (localStorage.getItem(LS_HISTORY)||'[]').slice(0,2000) })
  // 一键打包下载：把素材库（IndexedDB）打包成映射 Godot res://assets/ 的 ZIP
  async function exportGodotZip(){
    const pre=main.querySelector('#e-preview') as HTMLElement; const statusEl=pre; const setStatus=(m:string,c='#6ea6d1')=>{ statusEl.style.display='block'; statusEl.textContent=m; statusEl.style.color=c }
    const all=await idbGetAll()
    if(!all.length){ setStatus('素材库为空 — 先去各工坊生成并「📥 入库」后再打包', '#e74c3c'); toast(pre,'素材库为空',false); return }
    setStatus('正在打包 '+all.length+' 个素材…')
    const entries:ZipEntry[]=[]
    const manifestAssets:any[]=[]
    const counts:Record<string,number>={}
    let pngCount=0, done=0
    for(const item of all){
      try{
        const { bytes, ext }=await urlToBytes(item.url)
        const dir=KIND_TO_GODOT_DIR[item.kind] || ('custom/'+(item.kind||'other'))
        const safeName=(item.id||('asset_'+pngCount)).replace(/[^A-Za-z0-9._-]/g,'_')
        const entryName='assets/'+dir+'/'+safeName+ext
        entries.push({ name:entryName, data:bytes })
        // 带网格元数据的序列帧：自动生成同名 .tres（与 .png 同目录，Godot 拖入即用）
        let tresPath=''
        if(item.kind==='spritesheet' && item.meta?.cols && item.meta.frameW){
          const tresName='assets/'+dir+'/'+safeName+'.tres'
          const anims=buildAnimationsFromMeta(item.meta)
          const tresText=buildSpriteFramesTres(safeName+'.png', item.meta.cols, anims, item.meta.frameW, item.meta.frameH)
          entries.push({ name:tresName, data:new TextEncoder().encode(tresText) })
          tresPath=tresName
        }
        manifestAssets.push({ id:item.id, kind:item.kind, name:item.name, path:entryName, tres: tresPath||undefined })
        counts[item.kind]=(counts[item.kind]||0)+1
        pngCount++
      }catch(e){ /* 单个素材读取失败则跳过，不阻塞整体打包 */ }
      done++; if(done%20===0) setStatus('正在打包… '+done+'/'+all.length)
    }
    if(!entries.length){ setStatus('没有可打包的图片素材','#e74c3c'); return }
    // manifest.json：基于真实素材库而非历史
    const manifest={ project:(main.querySelector('#e-name') as HTMLInputElement).value||'MyGodotGame', godot:'4.2', generated_at:new Date().toISOString(), counts, assets:manifestAssets, structure:{ 'res://assets/characters/':'角色', 'res://assets/spritesheets/':'序列帧', 'res://assets/tilesets/':'瓦片', 'res://assets/icons/':'道具', 'res://assets/textures/':'抠图/后处理', 'res://assets/maps/':'大地图', 'res://assets/scenes/':'场景', 'res://assets/custom/':'自定义包' } }
    entries.push({ name:'manifest.json', data:new TextEncoder().encode(JSON.stringify(manifest,null,2)) })
    const readme=`Godot-Arter 资源包 — 解压到 Godot 项目 res:// 即用
========================================================

目录结构与 res://assets/ 对应 Godot 素材目录建议：
  assets/characters/    角色立绘 / 三视图
  assets/spritesheets/  序列帧 + SpriteFrames.tres（各模块导出时生成）
  assets/tilesets/      瓦片 + TileSet.tres
  assets/icons/         道具 / UI 图标
  assets/textures/      抠图 / 后处理
  assets/maps/          大地图
  assets/scenes/        场景
  assets/custom/        自定义包

像素素材推荐导入设置（Godot 导入面板 / Import 标签）：
  · Compress > Mode = Lossless  （像素风推荐无损，避免压缩瑕疵）
  · Mipmaps > Generate = Off    （2D 默认不建议开 mipmap）
  · Process > Fix Alpha Border = On （修复透明边缘虚边，推荐保留）


【Godot 4 像素风 · 全局默认过滤】把下面片段粘贴到项目根目录 project.godot 的 [rendering] 段（无则该段则新建）：
[rendering]
textures/canvas_textures/default_texture_filter = 0   ; 0=Nearest 邻近采样，像素图不模糊
; 说明：Godot 4 起纹理过滤已从 .import 文件移出，改为 CanvasItem 属性 + 此项目级默认值。

官方文档：
  · 2D 精灵动画  https://docs.godotengine.org/zh-cn/4.x/tutorials/2d/2d_sprite_animation.html
  · SpriteFrames https://docs.godotengine.org/zh-cn/4.x/classes/class_spriteframes.html
  · TileSet      https://docs.godotengine.org/zh-cn/4.x/classes/class_tileset.html
  · 导入图像     https://docs.godotengine.org/zh-cn/4.x/tutorials/assets/importing_images.html

生成时间：${new Date().toLocaleString()}    共 ${manifestAssets.length} 个素材
`
    entries.push({ name:'README-导入说明.txt', data:new TextEncoder().encode(readme) })
    const zipBlob=buildZipStore(entries)
    const zipName=((main.querySelector('#e-name') as HTMLInputElement).value||'MyGodotGame')+'_godot_package.zip'
    await downloadUrl(URL.createObjectURL(zipBlob), zipName)
    setStatus('✓ 已打包 '+manifestAssets.length+' 个素材 → '+zipName)
    toast(pre,'已打包 '+manifestAssets.length+' 个素材到 '+zipName,true)
  }
  main.querySelector('#e-zip')?.addEventListener('click', ()=>exportGodotZip())
  // ⚙️ 生成 Godot 4 像素风默认过滤片段（粘贴到 project.godot 的 [rendering] 段）
  const PIXEL_SNIPPET = `; Godot 4 像素风默认过滤片段 — 粘贴到项目根目录 project.godot 的 [rendering] 段（无该段则新建）
; 说明：Godot 4 起纹理 filter 已从 .import 文件移出，改为 CanvasItem 属性 + 项目级默认值。
[rendering]
textures/canvas_textures/default_texture_filter = 0   ; 0=Nearest 邻近采样，像素图不模糊

; 各素材在 Import 面板按需设置的像素推荐值：
;   Compress > Mode = Lossless      (像素风推荐无损，避免压缩瑕疵)
;   Mipmaps > Generate = Off        (2D 默认不建议开 mipmap)
;   Process > Fix Alpha Border = On (修复透明边缘虚边，推荐保留)
`
  main.querySelector('#e-proj')?.addEventListener('click', ()=>{
    const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent=PIXEL_SNIPPET
    const blob=new Blob([PIXEL_SNIPPET],{type:'text/plain'}); const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url; a.download='godot_pixel_settings.cfg'; a.click()
    revokeSoon(url, 5000)
    toast(pre,'已下载 godot_pixel_settings.cfg — 粘贴到 project.godot 的 [rendering] 段即生效', true)
  })


  // ---- Theme engine (dark / light / system) - direct selector ----
  const THEME_KEY = 'gas-theme'
  const THEME_ORDER = ['dark','light','system']
  const THEME_META = {
    dark:   { icon:'🌙', label:'深色' },
    light:  { icon:'☀️', label:'浅色' },
    system: { icon:'⚡', label:'系统' },
  }
  function resolveTheme(mode:string){
    if(mode === 'system'){
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark'
    }
    return mode || 'dark'
  }
  function currentMode(){ try{ const v=localStorage.getItem(THEME_KEY); return THEME_ORDER.indexOf(v as string)>=0 ? v as string : 'dark' }catch{ return 'dark' } }
  function applyTheme(mode:string){
    (root as HTMLElement).dataset.theme = resolveTheme(mode)
    try{ localStorage.setItem(THEME_KEY, mode) }catch{}
    // mark active segment
    ;(root.querySelectorAll('#theme-sel .gas-theme-opt') as NodeListOf<HTMLElement>).forEach(o=>{
      o.classList.toggle('active', o.dataset.mode===mode)
    })
  }
  // build the 3-way selector
  const themeSel = root.querySelector('#theme-sel')
  if(themeSel){
    THEME_ORDER.forEach((mode:string)=>{
      const b=document.createElement('button')
      b.className='gas-theme-opt'
      b.dataset.mode=mode
      const meta=(THEME_META as Record<string,{icon:string,label:string}>)[mode]
      b.title='主题：' + meta.label
      b.innerHTML = '<span class="tico">' + meta.icon + '</span><span class="tlabel">' + meta.label + '</span>'
      b.onclick=()=>applyTheme(mode)
      themeSel.appendChild(b)
    })
  }
  const initialMode = currentMode()
  applyTheme(initialMode)
  if(window.matchMedia) try{
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', ()=>{
      if(currentMode() === 'system') applyTheme('system')
    })
  }catch{}

  // ---- Nav collapse (rail) ----
  const NAV_KEY = 'gas-nav-collapsed'
  let navCollapsed = (()=>{ try{ return localStorage.getItem(NAV_KEY)==='1' }catch{ return false } })()
  function applyNav(){ nav.classList.toggle('collapsed', navCollapsed); try{ localStorage.setItem(NAV_KEY, navCollapsed?'1':'0') }catch{} }
  applyNav()
  const htmlSideToggle = document.createElement('button')
  htmlSideToggle.className='gas-side-toggle'
  htmlSideToggle.textContent = (navCollapsed?'» 展开':'« 收起')
  htmlSideToggle.title = '收起/展开左侧功能栏'
  htmlSideToggle.onclick=()=>{ navCollapsed=!navCollapsed; applyNav(); htmlSideToggle.textContent=(navCollapsed?'» 展开':'« 收起') }
  nav.appendChild(htmlSideToggle)


  // ---- Asset lightbox (click to enlarge) ----
  let lightboxEl: HTMLElement|null = null
  function closeLightbox(){ if(lightboxEl){ lightboxEl.remove(); lightboxEl=null; document.removeEventListener('keydown', lightboxKey) } }
  function lightboxKey(e:any){ if(e.key==='Escape') closeLightbox() }
  function openAssetLightbox(url:string, title:string, id:string){
    closeLightbox()
    const ov=document.createElement('div')
    ov.className='gas-lightbox-overlay'
    ov.innerHTML =`
      <div class="gas-lightbox">
        <div class="gas-lightbox-bar">
          <div class="gas-lightbox-title">${title}<span class="gas-lightbox-id">${id}</span></div>
          <div class="gas-lightbox-act">
            <button class="gas-btn ghost" data-lb-dl>⬇ 下载</button>
            <button class="gas-btn" data-lb-close>✕ 关闭</button>
          </div>
        </div>
        <div class="gas-lightbox-body"><img src="${url}" alt="${title}"></div>
        <div class="gas-lightbox-note">按 Esc 或点击背景关闭</div>
      </div>`
    ov.addEventListener('click', (e:any)=>{ if(e.target===ov) closeLightbox() })
    ov.querySelector('[data-lb-close]')!.addEventListener('click', closeLightbox)
    ov.querySelector('[data-lb-dl]')!.addEventListener('click', ()=> void downloadUrl(url, (id||title||'asset')+'.png'))
    document.body.appendChild(ov)
    lightboxEl=ov
    document.addEventListener('keydown', lightboxKey)
  }
  // expose for panel code
  ;(root as any).openAssetLightbox = openAssetLightbox

  // ---- Global preview click-to-zoom (works for any module's preview) ----
  root.addEventListener('click', (e:any)=>{
    const t = e.target as HTMLElement
    let url:string = '', title:string = ''
    if(t instanceof HTMLImageElement){ url = t.currentSrc || t.src; title = t.alt || (t as any).dataset?.name || '' }
    else if(t instanceof HTMLCanvasElement){ try{ url = (t as HTMLCanvasElement).toDataURL('image/png') }catch{} }
    if(!url) return
    if(t.closest('button, select, a, [data-no-zoom]')) return
    if(t.closest('#al-grid')) return   // asset manager handles its own click
    openAssetLightbox(url, title, '')
  })

  return root
}

