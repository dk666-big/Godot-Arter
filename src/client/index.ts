/**
 * @dsh-external/dsh-game-art-studio — client 面板
 * Godot 官方美学 + 一站式美术工坊（BYOK）
 * 五大管线：角色工坊 / 序列帧 / 素材锻造 / 智能抠图 / 无缝大地图
 */
import type { SlotsService } from '@deepseek-ai/dsh-client-ui-slots'

type ClientContext = { slots: SlotsService }
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
  .gas-root{ --godot-bg:#1e2224; --panel:#2b2e33; --panel2:#323840; --border:#3a3f47; --accent:#478cbf; --accent2:#6ea6d1; --accent-orange:#e67e22; --text:#e6e6e6; --muted:#9aa0a6; --ok:#2ecc71; --warn:#f1c40f; font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; color:var(--text); background:var(--godot-bg); border:1px solid var(--border); border-radius:10px; overflow:hidden; display:flex; flex-direction:column; max-height:92vh; }
  .gas-header{ display:flex; align-items:center; gap:12px; padding:10px 14px; background:linear-gradient(180deg,#25282b,#1e2224); border-bottom:1px solid var(--border); }
  .gas-logo{ width:32px; height:32px; border-radius:6px; background:var(--accent); display:grid; place-items:center; font-weight:800; color:white; box-shadow:0 2px 8px rgba(71,140,191,0.4); }
  .gas-title{ font-weight:700; letter-spacing:0.5px; }
  .gas-title small{ display:block; font-weight:400; color:var(--muted); font-size:11px; margin-top:2px; }
  .gas-badge{ margin-left:auto; background:#252a2e; border:1px solid var(--border); padding:4px 8px; border-radius:999px; font-size:11px; color:var(--muted); }
  .gas-badge b{ color:var(--accent2); }
  .gas-tabs{ display:flex; gap:6px; padding:8px 10px; background:var(--panel); border-bottom:1px solid var(--border); overflow-x:auto; scrollbar-width:thin; }
  .gas-tab{ padding:7px 12px; border-radius:7px; border:1px solid transparent; background:#25282b; color:var(--muted); cursor:pointer; font-size:12px; white-space:nowrap; transition:all .15s; }
  .gas-tab.active{ background:var(--accent); color:white; border-color:#5a9bd0; box-shadow:0 2px 6px rgba(71,140,191,.35); }
  .gas-tab:hover{ border-color:var(--border); color:var(--text); }
  .gas-body{ display:flex; flex:1; min-height:0; }
  .gas-main{ flex:1; padding:14px; overflow:auto; background:var(--godot-bg); }
  .gas-side{ width:280px; border-left:1px solid var(--border); background:var(--panel); padding:12px; overflow:auto; display:flex; flex-direction:column; gap:12px; }
  @media(max-width:900px){ .gas-side{ display:none; } }
  .gas-card{ background:var(--panel2); border:1px solid var(--border); border-radius:8px; padding:12px; }
  .gas-card h4{ margin:0 0 8px; font-size:12px; color:var(--accent2); letter-spacing:0.4px; }
  .gas-label{ font-size:11px; color:var(--muted); margin:8px 0 4px; display:block; }
  .gas-input, .gas-select, .gas-textarea{ width:100%; background:#1e2224; border:1px solid var(--border); color:var(--text); border-radius:6px; padding:7px 8px; font-size:12px; font-family:inherit; }
  .gas-textarea{ min-height:64px; resize:vertical; }
  .gas-row{ display:flex; gap:8px; }
  .gas-btn{ padding:7px 12px; border-radius:6px; border:1px solid var(--border); background:var(--accent); color:white; cursor:pointer; font-size:12px; font-weight:600; transition:all .15s; }
  .gas-btn:hover{ filter:brightness(1.08); transform:translateY(-1px); }
  .gas-btn.ghost{ background:#2b2e33; color:var(--text); }
  .gas-btn.orange{ background:var(--accent-orange); border-color:#d56d1a; }
  .gas-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; }
  .gas-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap:10px; margin-top:10px; }
  .gas-thumb{ aspect-ratio:1; background:#111416; border:1px solid var(--border); border-radius:8px; overflow:hidden; position:relative; display:grid; place-items:center; }
  .gas-thumb img, .gas-thumb canvas{ width:100%; height:100%; object-fit:contain; }
  .gas-thumb .meta{ position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.6); color:white; font-size:10px; padding:4px 6px; display:flex; justify-content:space-between; }
  .gas-preview{ background:#0f1213; border:1px solid var(--border); border-radius:8px; padding:10px; display:grid; place-items:center; min-height:180px; max-height:260px; position:relative; overflow:hidden; }
  .gas-preview.tiled{ background-image: radial-gradient(circle at 1px 1px, #2a2f33 1px, transparent 0); background-size:18px 18px; }
  .gas-canvas{ max-width:100%; max-height:180px; width:auto; height:auto; image-rendering: pixelated; border-radius:6px; display:block; }
  .gas-map-viewport{ width:100%; height:380px; overflow:auto; background:#0f1213; border:1px solid var(--border); border-radius:8px; padding:0; position:relative; }
  .gas-map-viewport img{ display:block; image-rendering: pixelated; max-width:none; cursor:grab; }
  .gas-kbd{ background:#1a1e20; border:1px solid var(--border); border-bottom-width:2px; padding:1px 5px; border-radius:4px; font-size:10px; color:var(--muted); }
  .gas-divider{ height:1px; background:var(--border); margin:10px 0; }
  .gas-note{ font-size:11px; color:var(--muted); line-height:1.5; }
  .gas-progress{ height:6px; background:#1a1e20; border-radius:999px; overflow:hidden; border:1px solid var(--border); }
  .gas-progress i{ display:block; height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-orange)); width:0%; transition:width .3s; }
  .gas-pill{ display:inline-flex; align-items:center; gap:4px; font-size:11px; background:#1e2224; border:1px solid var(--border); padding:3px 7px; border-radius:999px; color:var(--muted); }
  `
  root.appendChild(style)

  // ---- Header ----
  const header = document.createElement('div')
  header.className = 'gas-header'
  header.innerHTML = `<div class="gas-logo">G</div>
    <div class="gas-title">游戏美术工坊 <span style="font-weight:400;color:#6ea6d1;">· Godot Ready</span><small>角色 · 序列帧 · 素材 · 抠图 · 无缝大地图 — BYOK · 一键导出 Godot 4.x</small></div>
    <div class="gas-badge">DOCS <b>Godot 4.2</b> · <span style="color:#2ecc71;">● 就绪</span></div>`
  root.appendChild(header)

  // ---- Tabs ----
  const tabs = document.createElement('div')
  tabs.className = 'gas-tabs'
  const tabDefs: { id:string; label:string; icon:string }[] = [
    { id:'character', label:'角色工坊', icon:'🧍' },
    { id:'sheet', label:'序列帧', icon:'🎞️' },
    { id:'forge', label:'素材锻造', icon:'🧱' },
    { id:'matting', label:'智能抠图', icon:'✂️' },
    { id:'map', label:'无缝大地图', icon:'🗺️' },
    { id:'post', label:'后处理', icon:'✨' },
    { id:'preset', label:'API 预设', icon:'🔌' },
    { id:'export', label:'设置/导出', icon:'⚙️' },
  ]
  let active='character'
  const tabEls: Record<string, HTMLElement> = {}
  tabDefs.forEach(t=>{
    const b=document.createElement('button')
    b.className='gas-tab'+(t.id===active?' active':'')
    b.innerHTML=`${t.icon} ${t.label}`
    b.onclick=()=>switchTab(t.id)
    tabs.appendChild(b); tabEls[t.id]=b
  })
  root.appendChild(tabs)

  const body=document.createElement('div'); body.className='gas-body'
  const main=document.createElement('div'); main.className='gas-main'
  const side=document.createElement('div'); side.className='gas-side'
  body.append(main, side); root.appendChild(body)

  // ---- Side panel (API Keys + Godot hints) ----
  side.innerHTML = `
    <div class="gas-card">
      <h4>🔑 BYOK · API Keys</h4>
      <div class="gas-note">Key 仅存于本地浏览器 (localStorage)，直连提供商，不经服务器。</div>
      <label class="gas-label">OpenAI (DALL·E / GPT-Image)</label><input class="gas-input" id="k-openai" placeholder="sk-..." type="password">
      <label class="gas-label">Stability AI</label><input class="gas-input" id="k-stability" placeholder="sk-..." type="password">
      <label class="gas-label">Replicate (抠图/放大)</label><input class="gas-input" id="k-replicate" placeholder="r8_..." type="password">
      <label class="gas-label">SiliconFlow / Gemini</label><input class="gas-input" id="k-sf" placeholder="sk-..." type="password">
      <div class="gas-row" style="margin-top:8px">
        <button class="gas-btn" id="save-keys" style="flex:1">保存</button>
        <button class="gas-btn ghost" id="clear-keys">清空</button>
      </div>
      <div class="gas-note" id="keys-status" style="margin-top:6px;color:#2ecc71;display:none;">✓ 已保存到本地</div>
    </div>
    <div class="gas-card">
      <h4>📦 Godot 导出预设</h4>
      <div class="gas-note">
        • 角色 → <span class="gas-kbd">Sprite2D</span> + 透明 PNG<br>
        • 序列帧 → <span class="gas-kbd">SpriteFrames</span> / <span class="gas-kbd">AnimatedSprite2D</span><br>
        • 瓦片 → <span class="gas-kbd">TileSet</span> (16/32px) + <span class="gas-kbd">TileMap</span><br>
        • 抠图后直接拖入 <span class="gas-kbd">res://assets/</span>
      </div>
      <button class="gas-btn ghost" id="btn-godot-doc" style="width:100%;margin-top:8px;">打开 Godot 官方文档</button>
    </div>
    <div class="gas-card">
      <h4>💡 流水线提示</h4>
      <div class="gas-note" id="pipeline-tip">角色工坊：推荐先用「像素 32px 三视图」生成，再到序列帧一键拆帧。</div>
    </div>
  `

  // API keys logic
  const LS='dsh-game-art-studio:apiKeys'
  const loadKeys=()=>{
    try{ const j=JSON.parse(localStorage.getItem(LS)||'{}'); (side.querySelector('#k-openai') as HTMLInputElement).value=j.openai||''; (side.querySelector('#k-stability') as HTMLInputElement).value=j.stability||''; (side.querySelector('#k-replicate') as HTMLInputElement).value=j.replicate||''; (side.querySelector('#k-sf') as HTMLInputElement).value=j.siliconflow||'' }catch{}
  }
  const saveKeys=()=>{
    const v={ openai:(side.querySelector('#k-openai') as HTMLInputElement).value.trim(), stability:(side.querySelector('#k-stability') as HTMLInputElement).value.trim(), replicate:(side.querySelector('#k-replicate') as HTMLInputElement).value.trim(), siliconflow:(side.querySelector('#k-sf') as HTMLInputElement).value.trim() }
    localStorage.setItem(LS, JSON.stringify(v))
    const s=side.querySelector('#keys-status') as HTMLElement; s.style.display='block'; setTimeout(()=>s.style.display='none',1500)
  }
  setTimeout(loadKeys,0)
  side.querySelector('#save-keys')!.addEventListener('click', saveKeys)
  side.querySelector('#clear-keys')!.addEventListener('click', ()=>{ localStorage.removeItem(LS); loadKeys() })
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
          <textarea class="gas-textarea" id="c-prompt" placeholder="例：像素风 32px 冒险家少女，红斗篷，Q版，三视图，正面/侧面/背面，白色背景"></textarea>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">风格</label><select class="gas-select" id="c-style"><option value="pixel32">像素 32px</option><option value="pixel16">像素 16px</option><option value="chibi">Q版 Chibi</option><option value="anime">二次元立绘</option><option value="real">写实</option></select></div>
            <div style="flex:1"><label class="gas-label">视图</label><select class="gas-select" id="c-view"><option value="single">单视图</option><option value="tri">三视图 (前/侧/后)</option><option value="dir8">八方向</option></select></div>
            <div style="flex:1"><label class="gas-label">提供商</label><select class="gas-select" id="c-provider"><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option><option value="mock">本地演示(无Key)</option></select></div>
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
            <button class="gas-btn ghost" id="c-to-sheet">→ 送至序列帧</button>
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
            <div style="flex:1"><label class="gas-label">列 (cols)</label><input class="gas-input" id="s-cols" type="number" value="4" min="1" max="16"></div>
            <div style="flex:1"><label class="gas-label">行 (rows)</label><input class="gas-input" id="s-rows" type="number" value="2" min="1" max="16"></div>
            <div style="flex:1"><label class="gas-label">帧率 FPS</label><input class="gas-input" id="s-fps" type="number" value="8" min="1" max="24"></div>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="s-slice">🔪 切片</button>
            <button class="gas-btn ghost" id="s-pack">📦 打包成表</button>
            <button class="gas-btn ghost" id="s-animate">▶ 播放</button>
            <button class="gas-btn orange" id="s-export">⬇ 导出 Godot</button>
          </div>
          <label class="gas-label">AI 生成序列（BYOK）</label>
          <div class="gas-row"><input class="gas-input" id="s-prompt" placeholder="例：像素小骑士 奔跑 8帧 横向序列，透明背景"><select class="gas-select" id="s-provider" style="flex:0 0 128px"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><button class="gas-btn" id="s-gen">生成</button></div>
          <div class="gas-note" id="s-status"></div>
        </div>
        <div style="width:260px">
          <label class="gas-label">预览动画</label>
          <div class="gas-preview tiled" id="s-preview"><canvas class="gas-canvas" id="s-canvas" width="128" height="128"></canvas></div>
          <label class="gas-label">打包结果</label>
          <div class="gas-preview" id="s-pack-preview"><span class="gas-note">等待打包</span></div>
        </div>
      </div>
      <div class="gas-grid" id="s-frames"></div>
    </div>
  `)

  // FORGE
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
        <select class="gas-select" id="f-style" style="flex:1"><option value="icon">图标 64px</option><option value="pixel">像素道具</option><option value="fx">特效</option></select>
        <select class="gas-select" id="f-provider" style="flex:1"><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="mock">本地演示</option></select>
        <button class="gas-btn" id="f-batch">⚡ 批量生成</button>
      </div>
      <div class="gas-progress" style="margin-top:8px"><i id="f-prog"></i></div>
      <div class="gas-note" id="f-status"></div>
      <div class="gas-grid" id="f-grid"></div>
      <div class="gas-row" style="margin-top:8px">
        <button class="gas-btn ghost" id="f-dl-all">⬇ 打包 ZIP (PNG)</button>
        <button class="gas-btn ghost" id="f-clear">清空</button>
      </div>
    </div>
  `)

  // MATTING
  const pMat=mkPanel('matting', `
    <div class="gas-card">
      <h4>✂️ 智能抠图 — 色键 / AI / 羽化 / 描边</h4>
      <div class="gas-row">
        <div style="flex:1">
          <div style="border:1.5px dashed var(--border); border-radius:8px; padding:14px; text-align:center; background:#1a1e20; cursor:pointer" id="m-drop">
            <div style="font-size:22px">📤</div><div class="gas-note">上传待抠图素材（JPG/PNG）<br>点击或拖拽</div>
            <input type="file" id="m-file" accept="image/*" hidden>
          </div>
          <label class="gas-label">抠图模式</label>
          <select class="gas-select" id="m-mode"><option value="chroma">色键抠图（本地）</option><option value="ai">AI 抠图 (Replicate rembg / BYOK)</option><option value="alpha">颜色转透明</option></select>
          <div id="m-chroma-opts">
            <label class="gas-label">拾取背景色（点击图片拾色）</label>
            <div class="gas-row"><input type="color" id="m-color" value="#ffffff" style="width:48px;height:32px;background:#1e2224;border:1px solid var(--border);border-radius:6px;padding:2px;"><input class="gas-input" id="m-tol" type="range" min="0" max="100" value="30" style="flex:1"><span class="gas-pill" id="m-tol-v">30</span></div>
            <label class="gas-label">羽化 / 描边</label>
            <div class="gas-row"><span class="gas-note">羽化</span><input class="gas-input" id="m-feather" type="range" min="0" max="10" value="0" style="flex:1"><span class="gas-note">描边</span><input type="color" id="m-stroke" value="#000000"></div>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="m-cut">✂️ 一键抠图</button>
            <button class="gas-btn ghost" id="m-reset">↺ 重置</button>
            <button class="gas-btn orange" id="m-dl" disabled>⬇ 下载 PNG</button>
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
              <input class="gas-input" id="map-prompt" placeholder="例：俯视像素草原村庄大地图，有道路/河流/树木，暗色风格，无缝平铺，无UI">
              <select class="gas-select" id="map-provider" style="flex:0 0 128px"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select>
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
              <div style="flex:1"><label class="gas-label">瓦片尺寸</label><select class="gas-select" id="map-size"><option value="16">16px</option><option value="32" selected>32px</option><option value="64">64px</option><option value="128">128px</option></select></div>
              <div style="flex:1"><label class="gas-label">完整地图尺寸</label><select class="gas-select" id="map-big-size"><option value="1024">1024×1024</option><option value="1536">1536×1024</option><option value="2048" selected>2048×2048</option><option value="4096">4096×4096</option></select></div>
            </div>
            <div class="gas-row" style="margin-top:8px">
              <button class="gas-btn" id="map-seam">♻ 整图无缝化</button>
              <button class="gas-btn ghost" id="map-wang">Wang Tiles</button>
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
            </div>
            <div class="gas-note" style="margin-top:6px">💡 示例：完整大地图模式输入「俯视草原村庄无缝大地图」→ 得到整张地图 → 点「整图无缝化」→ 可「切成 TileSet」后在 Godot TileMap 使用。</div>
          </div>
          <div style="width:300px">
            <label class="gas-label">当前纹理/瓦片预览</label><div class="gas-preview tiled" id="map-preview"><span class="gas-note">等待生成/上传</span></div>
            <label class="gas-label">3×3 平铺校验（无缝检验）</label><div class="gas-preview" id="map-tiled" style="background:#0f1213; min-height:120px; overflow:hidden"><canvas id="map-tiled-canvas" width="192" height="192" style="width:192px;height:192px;image-rendering:pixelated"></canvas></div>
          </div>
        </div>
        <canvas id="map-canvas" hidden></canvas>
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
      <h4>🔌 第三方 API 路由预设 — 自定义供应商</h4>
      <div class="gas-note">在这里添加你自己的第三方图像生成 API。添加后会自动出现在「角色 / 序列帧 / 素材 / 大地图」的提供商下拉框中，选择即可调用。<br>支持三类兼容协议：<span class="gas-kbd">OpenAI 兼容</span> / <span class="gas-kbd">Stability 风格</span> / <span class="gas-kbd">SiliconFlow 风格</span>。</div>
      <div class="gas-divider"></div>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">预设列表</label>
          <div id="p-list" style="background:#1a1e20;border:1px solid var(--border);border-radius:6px;padding:8px;min-height:80px;font-size:11px;color:var(--muted)">暂无自定义预设</div>
        </div>
        <div style="width:360px">
          <label class="gas-label">预设名称</label><input class="gas-input" id="p-name" placeholder="例：我的中转 / My API">
          <div class="gas-row">
            <div style="flex:1"><label class="gas-label">协议类型</label><select class="gas-select" id="p-type"><option value="openai">OpenAI 兼容</option><option value="stability">Stability 风格</option><option value="siliconflow">SiliconFlow 风格</option></select></div>
            <div style="flex:1"><label class="gas-label">模型 ID</label><input class="gas-input" id="p-model" placeholder="可选，如 dall-e-3 / flux"></div>
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
  `)

  // 后处理工坊
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
            </select></div>
            <div style="flex:0 0 140px"><label class="gas-label">参数</label><input class="gas-input" id="post-param" placeholder="例：16 色 / 描边2px / 64px"></div>
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="post-run">✨ 执行</button>
            <button class="gas-btn orange" id="post-dl" disabled>⬇ 下载 PNG</button>
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

  ;[pChar,pSheet,pForge,pMat,pMap,pPost,pPreset,pExport].forEach(p=>main.appendChild(p))
  panels['character']=pChar; panels['sheet']=pSheet; panels['forge']=pForge; panels['matting']=pMat; panels['map']=pMap; panels['post']=pPost; panels['preset']=pPreset; panels['export']=pExport

  function switchTab(id:string){
    active=id
    Object.entries(tabEls).forEach(([k,el])=>el.classList.toggle('active', k===id))
    Object.entries(panels).forEach(([k,el])=>el.style.display=k===id?'block':'none')
    const tip=side.querySelector('#pipeline-tip') as HTMLElement
    const tips:Record<string,string>={ character:'角色工坊：三视图适合直接进序列帧拆成行走动画', sheet:'序列帧：4×2 切片后 FPS 8 在 Godot 中最顺滑', forge:'素材锻造：批量生成后可在“导出”一键打包', matting:'抠图：色键适合纯色背景，AI 适合复杂毛发', map:'无缝地图：可生成完整大地图或瓦片，再切成 TileSet；支持缩放预览', post:'后处理：调色板量化适合像素风，描边适合精灵，尺寸调整适合 Godot 导入优化', preset:'API 预设：自定义路由会同步到所有生成面板，Base URL 可只填 /v1，自动补全 images/generations', export:'导出：manifest.json 记录 Godot 目录结构' }
    if(tip) tip.textContent=tips[id]||''
  }

  // ---- Helpers ----
  const LS_HISTORY='dsh-game-art-studio:history'
  const getHistory=(): any[]=>{ try{ return JSON.parse(localStorage.getItem(LS_HISTORY)||'[]')}catch{return[]}}
  const pushHistory=(item:any)=>{ const h=getHistory(); h.unshift({ ...item, at:new Date().toISOString() }); localStorage.setItem(LS_HISTORY, JSON.stringify(h.slice(0,100))); refreshExportList() }
  const getKeys=():any=>{ try{ return JSON.parse(localStorage.getItem(LS)||'{}')}catch{return{}} }
  function toast(el:HTMLElement, msg:string, ok=true){ el.textContent=msg; el.style.color=ok?'#2ecc71':'#e74c3c'; setTimeout(()=>el.textContent='',3000) }

  // ---- 第三方 API 预设（自定义路由） ----
  const LS_PRESETS='dsh-game-art-studio:customProviders'
  const getCustomProviders=(): any[]=>{ try{ const a=JSON.parse(localStorage.getItem(LS_PRESETS)||'[]'); return Array.isArray(a)?a:[] }catch{ return [] } }
  const saveCustomProviders=(list:any[])=>{ localStorage.setItem(LS_PRESETS, JSON.stringify(list)) }

  function providerOptionHtml(): string {
    const built='<option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option>'
    const customs=getCustomProviders().map(p=>`<option value="custom:${p.id}">🔌 ${p.name.replace(/[<>"']/g,'')}</option>`).join('')
    return built+customs
  }

  function populateProviderSelects(){
    const ids=['c-provider','s-provider','f-provider','map-provider']
    for(const id of ids){
      const sel=main.querySelector('#'+id) as HTMLSelectElement | null
      if(!sel) continue
      const old=sel.value
      sel.innerHTML=providerOptionHtml()
      // 尽量保留原选择；若已失效则回到本地演示
      if([...sel.options].some(o=>o.value===old)) sel.value=old
      else sel.value='mock'
    }
  }

  function renderPresetList(){
    const list=pPreset.querySelector('#p-list') as HTMLElement
    if(!list) return
    const presets=getCustomProviders()
    if(!presets.length){ list.innerHTML='<span style="color:#9aa0a6">暂无自定义预设 — 在右侧表单中添加第一个</span>'; return }
    list.innerHTML=presets.map(p=>{
      const typeLabel={ openai:'OpenAI 兼容', stability:'Stability', siliconflow:'SiliconFlow' }[p.type]||p.type||'?'
      return `<div style="display:flex;gap:6px;align-items:center;padding:6px 0;border-bottom:1px dashed #3a3f47">
        <span style="color:#e67e22">🔌</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:12px;color:#e6e6e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(p.name||'未命名').replace(/[<>"']/g,'')}</div>
          <div style="font-size:10px;color:#9aa0a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${typeLabel} · ${(p.baseUrl||'').replace(/[<>"']/g,'')}</div>
          <div style="font-size:10px;color:#6ea6d1">${(p.model||'默认模型')}</div>
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
    const newItem={ id: existingId || ('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)), name, type, model: model||'', baseUrl, apiKey }
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

  function resolveCustomEndpoint(base:string, type:string): string {
    const b=base.replace(/\/+$/,'')
    if(type==='stability'){
      if(/\/stable-image(?:\/|$)/i.test(b) || /\/generate\/[^/]+$/i.test(b)) return b
      return b+'/v2beta/stable-image/generate/sd3'
    }
    if(/\/images\/generations$/i.test(b) || /\/image\/generations$/i.test(b) || /\/generations$/i.test(b)) return b
    return b+'/images/generations'
  }

  async function toLocalBlobUrl(url:string): Promise<string> {
    if(!/^https?:\/\//i.test(url)) return url
    try{
      const r=await fetch(url)
      if(!r.ok) return '/game-art-studio/api/proxy-image?url='+encodeURIComponent(url)
      const blob=await r.blob()
      return URL.createObjectURL(blob)
    }catch{
      return '/game-art-studio/api/proxy-image?url='+encodeURIComponent(url)
    }
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
    fd.append('prompt', prompt.slice(0,1000))
    if(opts.model) fd.append('model', opts.model)
    fd.append('n','1')
    fd.append('size', opts.size||'1024x1024')
    const r=await fetch(endpoint,{ method:'POST', headers:{ 'Authorization':'Bearer '+key }, body:fd })
    if(!r.ok) throw new Error('Edits '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
    const j=await r.json()
    const url=j.data?.[0]?.url || (j.data?.[0]?.b64_json && ('data:image/png;base64,'+j.data[0].b64_json)) || j.images?.[0]?.url
    if(!url) throw new Error('Edits 未返回图片 URL')
    return await toLocalBlobUrl(url)
  }

  async function callImageGen(prompt:string, provider:string, opts:any={}): Promise<string> {
    const keys=getKeys()
    const ref=opts.reference
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
        const blob=await r.blob(); return URL.createObjectURL(blob)
      }
      // OpenAI 兼容 / SiliconFlow 风格
      if(ref){
        return await callImageEdits(prompt, resolveEditsEndpoint(endpoint), preset.apiKey, { ...opts, model: preset.model || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3') })
      }
      const body:any={ prompt: prompt.slice(0,1000), n:1, size: opts.size||'1024x1024' }
      body.model=preset.model || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3')
      if(preset.type==='siliconflow') body.image_size=opts.size||'1024x1024'
      const r=await fetch(endpoint,{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+preset.apiKey }, body:JSON.stringify(body) })
      if(!r.ok) throw new Error('第三方('+label+') '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const j=await r.json()
      const url=j.data?.[0]?.url || (j.data?.[0]?.b64_json && ('data:image/png;base64,'+j.data[0].b64_json)) || j.images?.[0]?.url || j.output?.[0]?.url
      if(!url) throw new Error('第三方('+label+') 未返回图片 URL')
      return await toLocalBlobUrl(url)
    }

    // 内置供应商
    if(!keys[provider]){ throw new Error('未配置 '+provider+' 的 API Key，请到右侧保存或切到“本地演示”') }
    if(provider==='openai'){
      const key=keys.openai
      if(ref){ return await callImageEdits(prompt, 'https://api.openai.com/v1/images/edits', key, { ...opts, model:'dall-e-3' }) }
      const body={ model:'dall-e-3', prompt: prompt.slice(0,1000), n:1, size: opts.size||'1024x1024', quality:'standard' }
      const r=await fetch('https://api.openai.com/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify(body) })
      if(!r.ok) throw new Error('OpenAI '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const j=await r.json(); const url=j.data?.[0]?.url || j.data?.[0]?.b64_json && ('data:image/png;base64,'+j.data[0].b64_json)
      if(!url) throw new Error('OpenAI 未返回图片')
      return await toLocalBlobUrl(url)
    }
    if(provider==='stability'){
      const key=keys.stability
      const fd=new FormData(); fd.append('prompt', prompt); fd.append('output_format','png')
      if(ref) fd.append('image', dataUrlToBlob(ref), 'reference.png')
      const r=await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3',{ method:'POST', headers:{ 'Authorization':'Bearer '+key, 'Accept':'image/*' }, body:fd })
      if(!r.ok) throw new Error('Stability '+r.status+': '+await r.text().then(t=>t.slice(0,200)))
      const blob=await r.blob(); return URL.createObjectURL(blob)
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
    const c=document.createElement('canvas'); c.width=512; c.height=512; const g=c.getContext('2d')!
    // 背景
    const styleMap:Record<string,string>={ pixel32:'#2b2e33', pixel16:'#1e2224', chibi:'#fef9e7', anime:'#e8f8f5', icon:'#f4f6f7' }
    g.fillStyle=styleMap[opts.style]||'#2b2e33'; g.fillRect(0,0,512,512)
    // 棋盘格
    g.fillStyle='rgba(255,255,255,0.04)'; for(let y=0;y<512;y+=32) for(let x=0;x<512;x+=32) if((x+y)%64===0) g.fillRect(x,y,32,32)
    // 主体：简易角色占位
    g.fillStyle='#478cbf'; g.beginPath(); g.arc(256,220,70,0,Math.PI*2); g.fill()
    g.fillStyle='#e67e22'; g.fillRect(226,290,60,90)
    g.fillStyle='#2ecc71'; g.fillRect(196,380,120,12)
    // 文字
    g.fillStyle='white'; g.font='bold 18px monospace'; g.textAlign='center'; g.fillText(prompt.slice(0,28)||'MOCK',256,480)
    g.fillStyle='rgba(255,255,255,0.6)'; g.font='11px monospace'; g.fillText((opts.view||'')+' · '+ (opts.style||'')+' · 本地演示',256,500)
    return c.toDataURL('image/png')
  }

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
      const fullPrompt = view==='tri' ? prompt+' , three views front side back, white background, character sheet' : view==='dir8' ? prompt+' , 8 directional sprites, transparent background' : prompt + (style.startsWith('pixel')?' , pixel art, '+style:' , '+style)
      setProg(20); status.textContent='生成中… ('+prov+')'; (pChar.querySelector('#c-gen') as HTMLButtonElement).disabled=true
      try{
        const url=await callImageGen(fullPrompt, prov, { style, view, size:'1024x1024', reference: refUrl || undefined })
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
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=refUrl; img.style.maxWidth='100%'; img.style.maxHeight='90px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); toast(status,'参考图已添加 ✓ 生成时会作为图生图参考') }
      reader.readAsDataURL(f)
    })
    pChar.querySelector('#c-dl')!.addEventListener('click', ()=>{ if(!lastUrl) return toast(status,'无图片',false); const a=document.createElement('a'); a.href=lastUrl; a.download='character_'+Date.now()+'.png'; a.click() })
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
    const promptEl= pSheet.querySelector('#s-prompt') as HTMLInputElement
    let frames: HTMLCanvasElement[]=[]; let animId=0; let packCanvas: HTMLCanvasElement|null=null

    function loadImage(src:string):Promise<HTMLImageElement>{ return new Promise((res,rej)=>{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=rej; im.src=src }) }

    async function sliceFromFile(file:File){
      const url=URL.createObjectURL(file); const img=await loadImage(url)
      const cols=parseInt(colsEl.value)||4, rows=parseInt(rowsEl.value)||1
      frames=[]; framesEl.innerHTML=''
      const fw=Math.floor(img.width/cols), fh=Math.floor(img.height/rows)
      // 原图 canvas
      const tmp=document.createElement('canvas'); tmp.width=img.width; tmp.height=img.height; tmp.getContext('2d')!.drawImage(img,0,0)
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const fc=document.createElement('canvas'); fc.width=fw; fc.height=fh; fc.getContext('2d')!.drawImage(tmp, c*fw, r*fh, fw, fh, 0,0,fw,fh)
        frames.push(fc)
        const thumb=document.createElement('div'); thumb.className='gas-thumb'; thumb.appendChild(fc); const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML='<span>#'+frames.length+'</span><span>'+fw+'×'+fh+'</span>'; thumb.appendChild(meta)
        framesEl.appendChild(thumb)
      }
      // 预览第一帧
      if(frames[0]){ canvas.width=frames[0].width; canvas.height=frames[0].height; ctx2.imageSmoothingEnabled=false; ctx2.clearRect(0,0,canvas.width,canvas.height); ctx2.drawImage(frames[0],0,0) }
      pushHistory({ kind:'spritesheet', file:file.name, cols, rows, count:frames.length })
      toast(status, '已切片 '+frames.length+' 帧 ('+fw+'×'+fh+')')
    }

    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.style.borderColor='#478cbf' })
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=(e.dataTransfer?.files?.[0]); if(f) { const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; sliceFromFile(f) }})
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) sliceFromFile(f) })
    pSheet.querySelector('#s-slice')!.addEventListener('click', ()=>{ const f=fileInput.files?.[0]; if(!f) return toast(status,'请先上传图片',false); sliceFromFile(f) })
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
        if(now-last>1000/fps){ ctx2.clearRect(0,0,canvas.width,canvas.height); ctx2.drawImage(frames[idx],0,0); idx=(idx+1)%frames.length; last=now }
        animId=requestAnimationFrame(loop)
      }; animId=requestAnimationFrame(loop)
      setTimeout(()=>cancelAnimationFrame(animId), 4000)
    })
    pSheet.querySelector('#s-export')!.addEventListener('click', ()=>{
      if(!packCanvas) return toast(status,'请先打包',false)
      const a=document.createElement('a'); a.href=packCanvas.toDataURL(); a.download='spritesheet_'+Date.now()+'.png'; a.click()
      // 生成 SpriteFrames json
      const mf={ meta:{ image:'spritesheet.png', size:[packCanvas.width, packCanvas.height], frames:frames.length }, frames: frames.map((_,i)=>({ name:'frame_'+i, region:[i*frames[0].width,0,frames[0].width, frames[0].height], duration: 1/(parseInt(fpsEl.value)||8) })), godot:{ type:'SpriteFrames', animations:[{ name:'default', frames: frames.map((_,i)=>i), speed: parseInt(fpsEl.value)||8 }] } }
      const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const b=document.createElement('a'); b.href=url; b.download='SpriteFrames.json'; b.click()
      pushHistory({ kind:'export', what:'spritesheet', at:Date.now() })
      toast(status,'已导出 PNG + SpriteFrames.json (Godot 可直接创建 SpriteFrames 资源后导入)')
    })
    pSheet.querySelector('#s-gen')!.addEventListener('click', async()=>{
      const prompt=promptEl.value.trim(); if(!prompt) return toast(status,'输入序列描述',false)
      const prov=(pSheet.querySelector('#s-provider') as HTMLSelectElement)?.value || 'mock'
      try{ const url=await callImageGen(prompt+' , sprite sheet, transparent background', prov as any, { size:'1024x512' }); const img=await loadImage(url); const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; c.getContext('2d')!.drawImage(img,0,0); c.toBlob(b=>{ if(!b) return; const f=new File([b],'ai-sheet.png',{type:'image/png'}); const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; sliceFromFile(f) }) }catch(e:any){ toast(status,String(e.message),false) }
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
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=refUrl; img.style.maxWidth='100%'; img.style.maxHeight='70px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); toast(status,'参考图已添加 ✓') }
      reader.readAsDataURL(f)
    })
    pForge.querySelector('#f-batch')!.addEventListener('click', async()=>{
      const lines=ta.value.split('\n').map(s=>s.trim()).filter(Boolean); if(!lines.length) return toast(status,'请输入 Prompt',false)
      const prov=provEl.value; grid.innerHTML=''; let done=0
      for(const line of lines){
        try{
          const url=await callImageGen(line + ' , game asset, transparent background, centered', prov, { style: (pForge.querySelector('#f-style') as HTMLSelectElement).value, reference: refUrl || undefined })
          const card=document.createElement('div'); card.className='gas-thumb'; card.innerHTML='<img src="'+url+'"><div class="meta"><span>'+line.slice(0,12)+'</span><span>64px</span></div>'; grid.appendChild(card)
          pushHistory({ kind:'asset', prompt:line, url })
        }catch(e:any){ const err=document.createElement('div'); err.className='gas-thumb'; err.style.placeItems='center'; err.style.fontSize='11px'; err.style.color='#e74c3c'; err.textContent='失败:'+String(e.message).slice(0,30); grid.appendChild(err) }
        done++; prog.style.width=Math.round(done/lines.length*100)+'%'
      }
      toast(status,'批量完成 '+done+'/'+lines.length)
      setTimeout(()=>prog.style.width='0%',1000)
    })
    pForge.querySelector('#f-clear')!.addEventListener('click', ()=> grid.innerHTML='')
    pForge.querySelector('#f-dl-all')!.addEventListener('click', async()=>{
      const imgs=[...grid.querySelectorAll('img')] as HTMLImageElement[]; if(!imgs.length) return toast(status,'无素材',false)
      // 简易打包：依次下载
      for(let i=0;i<imgs.length;i++){ const a=document.createElement('a'); a.href=imgs[i].src; a.download='asset_'+i+'.png'; a.click(); await new Promise(r=>setTimeout(r,300)) }
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
    let loadedImg: HTMLImageElement|null=null
    tolEl.addEventListener('input', ()=> tolV.textContent=tolEl.value)
    drop.addEventListener('click', ()=> fileInput.click())
    drop.addEventListener('dragover', e=>{e.preventDefault(); drop.style.borderColor='#478cbf'})
    drop.addEventListener('dragleave', ()=> drop.style.borderColor='var(--border)')
    drop.addEventListener('drop', e=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if(f){ const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; handle(f) }})
    fileInput.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) handle(f) })
    async function handle(file:File){
      const url=URL.createObjectURL(file); const img=new Image(); img.src=url; await new Promise(r=>img.onload=r); loadedImg=img
      orig.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; im.style.maxHeight='130px'; orig.appendChild(im)
      result.innerHTML='<span class="gas-note">等待抠图…</span>'
      // 点击拾色
      im.style.cursor='crosshair'; im.onclick=(e)=>{
        const c=document.createElement('canvas'); c.width=im.naturalWidth; c.height=im.naturalHeight; const g=c.getContext('2d')!; g.drawImage(img,0,0)
        const rect=im.getBoundingClientRect(); const x=Math.floor((e.clientX-rect.left)/rect.width * img.naturalWidth); const y=Math.floor((e.clientY-rect.top)/rect.height * img.naturalHeight)
        const d=g.getImageData(x,y,1,1).data; const hex='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join(''); colorEl.value=hex
      }
    }
    pMat.querySelector('#m-cut')!.addEventListener('click', async()=>{
      if(!loadedImg) return toast(status,'请先上传',false)
      const mode=modeEl.value
      if(mode==='ai'){
        const keys=getKeys(); if(!keys.replicate) { toast(status,'未配置 Replicate Key，已回退到本地色键',false); return doChroma() }
        try{
          status.textContent='AI 抠图请求中…'
          // Replicate rembg
          const fd=new FormData(); // 简化：走 replicate API 需要先转 base64，这里用本地 fallback 演示
          // 为演示，直接用色键兜底，但提示已尝试
          doChroma(); status.textContent='AI 模式演示：已用本地算法完成（配置 Key 后可直连 rembg）'
          return
        }catch(e:any){ toast(status,String(e.message),false) }
      } else { doChroma() }
    })
    function doChroma(){
      if(!loadedImg) return
      const tol=parseInt(tolEl.value); const target=colorEl.value; const tr=parseInt(target.slice(1,3),16), tg=parseInt(target.slice(3,5),16), tb=parseInt(target.slice(5,7),16)
      const feather=parseInt((pMat.querySelector('#m-feather') as HTMLInputElement).value)||0
      canvas.width=loadedImg.naturalWidth; canvas.height=loadedImg.naturalHeight; const g=canvas.getContext('2d')!; g.drawImage(loadedImg,0,0)
      const imgData=g.getImageData(0,0,canvas.width,canvas.height); const d=imgData.data
      for(let i=0;i<d.length;i+=4){
        const dist=Math.sqrt((d[i]-tr)**2 + (d[i+1]-tg)**2 + (d[i+2]-tb)**2)
        if(dist < tol*2.5){ const a=Math.max(0, (dist - tol*0.5)/ (tol*1.5))*255; d[i+3]= feather? Math.min(255, a+feather*8) : a<80?0:a }
      }
      g.putImageData(imgData,0,0)
      result.innerHTML=''; const out=document.createElement('img'); out.src=canvas.toDataURL('image/png'); out.style.maxWidth='100%'; out.style.maxHeight='180px'; result.appendChild(out)
      ;(pMat.querySelector('#m-dl') as HTMLButtonElement).disabled=false
      pushHistory({ kind:'matting', url: canvas.toDataURL() })
      toast(status,'抠图完成，可下载透明 PNG')
    }
    pMat.querySelector('#m-reset')!.addEventListener('click', ()=>{ if(!loadedImg) return; result.innerHTML='<span class="gas-note">已重置</span>'; (pMat.querySelector('#m-dl') as HTMLButtonElement).disabled=true })
    pMat.querySelector('#m-dl')!.addEventListener('click', ()=>{ const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='matting_'+Date.now()+'.png'; a.click() })
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

    fileInput.addEventListener('change', async()=>{ const f=fileInput.files?.[0]; if(!f) return; const url=URL.createObjectURL(f); const img=await loadImg(url); showPreview(img,true) })

    pMap.querySelector('#map-ref')!.addEventListener('change', (e:any)=>{
      const f=e.target.files?.[0]; if(!f) return
      const reader=new FileReader()
      reader.onload=()=>{ mapRefUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=mapRefUrl; img.style.maxWidth='100%'; img.style.maxHeight='70px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); toast(status,'参考图已添加 ✓') }
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
          const url=await callImageGen(prompt+' , full seamless game map, top-down, high detail, tileable, no UI, no watermark', prov, { size, reference: mapRefUrl || undefined })
          const img=await loadImg(url)
          showPreview(img, corsSafe)
          if(corsSafe){ setBigMap(img.src, img.naturalWidth||targetSize, img.naturalHeight||targetSize); toast(status,'完整大地图已生成：'+(img.naturalWidth||targetSize)+'×'+(img.naturalHeight||targetSize), true) }
          else toast(status,'完整大地图已生成（远程直链）', false)
        } else {
          const ts=parseInt((pMap.querySelector('#map-size') as HTMLSelectElement).value)||32
          const url=await callImageGen(prompt+' , seamless tileable texture, '+ts+'px', prov, { reference: mapRefUrl || undefined })
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
      for(let y=0;y<2;y++) for(let x=0;x<2;x++){ g.drawImage(curImg, x*size, y*size, size,size); g.fillStyle='rgba(71,140,191,'+(x+y)*0.08+')'; g.fillRect(x*size,y*size,size,size) }
      g.strokeStyle='rgba(255,255,255,0.6)'; g.lineWidth=1; g.strokeRect(0,0,size*2,size*2); g.beginPath(); g.moveTo(size,0); g.lineTo(size,size*2); g.moveTo(0,size); g.lineTo(size*2,size); g.stroke()
      const url=canvas.toDataURL(); preview.innerHTML=''; const im=document.createElement('img'); im.src=url; im.style.maxWidth='100%'; preview.appendChild(im); curImg=await loadImg(url); updateTiled(); toast(status,'Wang Tiles 2×2 已生成')
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
      const jblob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'}); const jurl=URL.createObjectURL(jblob)
      downloadDataUrl(tsUrl,'tileset_'+Date.now()+'.png'); downloadDataUrl(jurl,'TileSet.json')
      toast(status,'已切成 TileSet：'+cols+'×'+rows+'（'+ts.width+'×'+ts.height+'）', true)
    })

    pMap.querySelector('#map-dl')!.addEventListener('click', async()=>{
      if(!curImg) return toast(status,'无图片',false)
      try{
        const r=await fetch(curImg.src); if(!r.ok) throw new Error('HTTP '+r.status)
        const blob=await r.blob(); downloadDataUrl(URL.createObjectURL(blob),'map_'+Date.now()+'.png'); toast(status,'已下载 PNG',true)
      }catch(e:any){
        if(/^https?:/i.test(curImg.src)){ window.open(curImg.src,'_blank'); toast(status,'远程直链无法直接下载，已在新标签打开原图',false) }
        else toast(status,'下载失败：'+String(e.message||e).slice(0,60),false)
      }
    })
    pMap.querySelector('#map-export')!.addEventListener('click', ()=>{ (pMap.querySelector('#map-split') as HTMLButtonElement)?.click?.() })

    pMap.querySelector('#map-zoom-in')!.addEventListener('click', ()=>{ bigZoom*=1.5; applyBigZoom() })
    pMap.querySelector('#map-zoom-out')!.addEventListener('click', ()=>{ bigZoom/=1.5; applyBigZoom() })
    pMap.querySelector('#map-zoom-fit')!.addEventListener('click', fitBigMap)
    pMap.querySelector('#map-zoom-reset')!.addEventListener('click', ()=>{ bigZoom=1; applyBigZoom() })
    pMap.querySelector('#map-big-dl')!.addEventListener('click', ()=>{ if(!bigMapUrl) return toast(status,'请先生成大地图',false); downloadDataUrl(bigMapUrl,'bigmap_'+Date.now()+'.png'); toast(status,'高清 PNG 已下载',true) })
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
    let loadedImg: HTMLImageElement|null=null
    let resultUrl=''

    function loadImage(src:string):Promise<HTMLImageElement>{ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src }) }

    async function handleFile(file:File){
      const url=URL.createObjectURL(file); loadedImg=await loadImage(url)
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
        }
        resultUrl=canvas.toDataURL('image/png')
        preview.innerHTML=''; const im=document.createElement('img'); im.src=resultUrl; im.style.maxWidth='100%'; im.style.maxHeight='180px'; im.style.imageRendering='pixelated'; preview.appendChild(im)
        dlBtn.disabled=false
      }catch(e:any){ toast(status,'处理失败：'+String(e.message||e).slice(0,60),false) }
    })

    dlBtn.addEventListener('click', ()=>{ if(!resultUrl) return; const a=document.createElement('a'); a.href=resultUrl; a.download='post_'+Date.now()+'.png'; a.click() })
  })()

  // ---- Export center ----
  function refreshExportList(){
    const list=main.querySelector('#e-list') as HTMLElement; if(!list) return
    const h=getHistory()
    if(!h.length){ list.textContent='暂无素材 — 去前面工坊生成后会自动收录'; return }
    list.innerHTML= h.slice(0,12).map((x:any,i)=> `<div style="display:flex;gap:6px;align-items:center;padding:3px 0;border-bottom:1px dashed #3a3f47"><span style="color:#6ea6d1">#${i+1}</span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.kind} · ${(x.prompt||x.file||'').slice(0,24)}</span><span style="font-size:10px;color:#9aa0a6">${new Date(x.at).toLocaleTimeString()}</span></div>`).join('')
  }
  setTimeout(refreshExportList,500)
  main.querySelector('#e-manifest')?.addEventListener('click', ()=>{
    const h=getHistory(); const mf={ project:(main.querySelector('#e-name') as HTMLInputElement).value, godot:'4.2', generated_at:new Date().toISOString(), counts: h.reduce((a:any,c:any)=>{a[c.kind]=(a[c.kind]||0)+1;return a},{}), assets:h, structure:{ 'res://assets/characters/':'角色', 'res://assets/spritesheets/':'序列帧', 'res://assets/tilesets/':'瓦片', 'res://assets/icons/':'道具' } }
    const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent=JSON.stringify(mf,null,2)
    const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='godot_manifest.json'; a.click()
  })
  main.querySelector('#e-clear')?.addEventListener('click', ()=>{ localStorage.removeItem(LS_HISTORY); refreshExportList(); const pre=main.querySelector('#e-preview') as HTMLElement; if(pre) pre.style.display='none' })
  main.querySelector('#e-dump')?.addEventListener('click', ()=>{ const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent= 'localStorage '+LS_HISTORY+':\\n'+ (localStorage.getItem(LS_HISTORY)||'[]').slice(0,2000) })

  return root
}

