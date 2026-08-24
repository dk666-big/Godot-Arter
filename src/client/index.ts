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
  .gas-root{ --godot-bg:#1f232b; --panel:#272b35; --panel2:#313642; --border:#3e4553; --accent:#7aa2f7; --accent2:#a5c8ff; --accent-orange:#ff9e64; --pink:#f7768e; --text:#eef1f7; --muted:#a6b0c0; --ok:#4fd68a; --warn:#ffc46b; font-family: 'JetBrains Mono', ui-monospace, Consolas, 'Microsoft YaHei', monospace; color:var(--text); background:var(--godot-bg); border:1px solid var(--border); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; max-height:96vh; width:100%; max-width:1740px; margin:0 auto; box-shadow:0 12px 40px rgba(0,0,0,.35); }
  .gas-header{ display:flex; align-items:center; gap:16px; padding:18px 26px; position:relative; z-index:6; background:linear-gradient(135deg,#272c37,#1f232b); border-bottom:1px solid var(--border); }
  .gas-logo{ width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,#7aa2f7,#c792ea); display:grid; place-items:center; font-weight:800; font-size:20px; color:white; box-shadow:0 4px 14px rgba(122,162,247,.35); }
  .gas-title{ font-weight:700; letter-spacing:1px; font-size:15px; }
  .gas-title small{ display:block; font-weight:400; color:var(--muted); font-size:11px; margin-top:4px; letter-spacing:.3px; }
  .gas-badge{ margin-left:auto; background:rgba(255,255,255,.05); border:1px solid var(--border); padding:5px 12px; border-radius:999px; font-size:11px; color:var(--muted); }
  .gas-badge b{ color:var(--accent2); }
  .gas-tabs{ display:flex; gap:10px; padding:12px 18px; position:relative; z-index:5; background:#262a34; border-bottom:1px solid var(--border); overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; }
  .gas-tab{ padding:10px 16px; border-radius:999px; border:1px solid transparent; background:#2c313d; color:var(--muted); cursor:pointer; font-size:12px; white-space:nowrap; transition:background .18s, color .18s, box-shadow .18s; }
  .gas-tab.active{ background:linear-gradient(135deg,#7aa2f7,#c792ea); color:#fff; font-weight:600; box-shadow:0 2px 8px rgba(122,162,247,.32); }
  .gas-tab:hover{ border-color:var(--border); color:var(--text); }
  .gas-body{ display:flex; flex:1; min-height:0; position:relative; z-index:0; }
  .gas-main{ flex:1; padding:26px; overflow-y:auto; overflow-x:hidden; background:var(--godot-bg); }
  .gas-side{ width:276px; border-left:1px solid var(--border); background:var(--panel); padding:18px; overflow-y:auto; overflow-x:hidden; display:flex; flex-direction:column; gap:16px; }
  @media(max-width:900px){ .gas-side{ display:none; } }
  .gas-card{ background:var(--panel2); border:1px solid var(--border); border-radius:18px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,.12); }
  .gas-card h4{ margin:2px 0 14px; font-size:14px; color:var(--accent2); letter-spacing:.5px; }
  .gas-label{ font-size:11px; color:var(--muted); margin:14px 0 6px; display:block; letter-spacing:.3px; }
  .gas-input, .gas-select, .gas-textarea{ width:100%; background:#1a1e27; border:1px solid var(--border); color:var(--text); border-radius:11px; padding:10px 12px; font-size:12px; font-family:inherit; transition:border-color .15s, box-shadow .15s; }
  .gas-input:focus, .gas-select:focus, .gas-textarea:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(122,162,247,.15); }
  .gas-textarea{ min-height:76px; resize:vertical; }
  .gas-row{ display:flex; gap:14px; }
  .gas-btn{ padding:10px 16px; border-radius:12px; border:1px solid transparent; background:linear-gradient(135deg,#7aa2f7,#8aa7f0); color:#fff; cursor:pointer; font-size:12px; font-weight:600; transition:filter .18s, box-shadow .18s; box-shadow:0 2px 8px rgba(122,162,247,.25); }
  .gas-btn:hover{ filter:brightness(1.07); }
  .gas-btn.ghost{ background:#2c313d; color:var(--text); border:1px solid var(--border); box-shadow:none; }
  .gas-btn.orange{ background:linear-gradient(135deg,#ff9e64,#f7768e); box-shadow:0 2px 8px rgba(255,158,100,.25); }
  .gas-btn:disabled{ opacity:.5; cursor:not-allowed; }
  .gas-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(172px,1fr)); gap:18px; margin-top:16px; }
  .gas-thumb{ aspect-ratio:1; background:#141822; border:1px solid var(--border); border-radius:16px; overflow:hidden; position:relative; display:grid; place-items:center; transition:border-color .15s; }
  .gas-thumb:hover{ border-color:var(--accent); }
  .gas-thumb img, .gas-thumb canvas{ width:100%; height:100%; object-fit:contain; }
  .gas-thumb .meta{ position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.55); color:white; font-size:10px; padding:6px 8px; display:flex; justify-content:space-between; }
  .gas-preview{ background:#141822; border:1px solid var(--border); border-radius:16px; padding:16px; display:grid; place-items:center; min-height:180px; max-height:280px; position:relative; overflow:hidden; }
  .gas-preview.tiled{ background-image: radial-gradient(circle at 1px 1px, #3a4150 1px, transparent 0); background-size:20px 20px; }
  .gas-canvas{ max-width:100%; max-height:180px; width:auto; height:auto; image-rendering: pixelated; border-radius:10px; display:block; }
  .gas-map-viewport{ width:100%; height:400px; overflow:auto; background:#141822; border:1px solid var(--border); border-radius:16px; padding:0; position:relative; }
  .gas-map-viewport img{ display:block; image-rendering: pixelated; max-width:none; cursor:grab; }
  .gas-kbd{ background:#1a1e27; border:1px solid var(--border); border-bottom-width:2px; padding:2px 7px; border-radius:8px; font-size:10px; color:var(--muted); }
  .gas-divider{ height:1px; background:var(--border); margin:20px 0; opacity:.6; }
  .gas-note{ font-size:11px; color:var(--muted); line-height:1.75; }
  .gas-progress{ height:7px; background:#1a1e27; border-radius:999px; overflow:hidden; border:1px solid var(--border); }
  .gas-progress i{ display:block; height:100%; background:linear-gradient(90deg,#7aa2f7,#c792ea,#ff9e64); width:0%; transition:width .3s; }
  .gas-pill{ display:inline-flex; align-items:center; gap:5px; font-size:11px; background:#2c313d; border:1px solid var(--border); padding:4px 10px; border-radius:999px; color:var(--muted); }
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
    { id:'scene', label:'场景工坊', icon:'🌦️' },
    { id:'asset', label:'素材总管', icon:'📚' },
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
          <textarea class="gas-textarea" id="c-prompt" placeholder="例：像素风 32px 冒险家少女，红斗篷，Q版，三视图，正面/侧面/背面，白色背景"></textarea>
          <div class="gas-row" style="margin-top:8px">
            <div style="flex:1"><label class="gas-label">风格</label><select class="gas-select" id="c-style"><option value="pixel32">像素 32px</option><option value="pixel16">像素 16px</option><option value="chibi">Q版 Chibi</option><option value="anime">二次元立绘</option><option value="real">写实</option></select></div>
            <div style="flex:1"><label class="gas-label">视图</label><select class="gas-select" id="c-view"><option value="single">单视图</option><option value="tri">三视图 (前/侧/后)</option><option value="dir8">八方向</option></select></div>
            <div style="flex:1"><label class="gas-label">提供商</label><select class="gas-select" id="c-provider"><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option><option value="mock">本地演示(无Key)</option></select><select class="gas-select" id="c-model-sel" style="display:none;margin-top:6px"></select></div>
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
          <div class="gas-row" style="margin-top:8px;align-items:center">
            <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="s-dir-rows"> 行 = 方向（导出命名动画）</label>
            <input class="gas-input" id="s-dir-names" style="flex:1" placeholder="每行方向名,逗号分隔，如 down,left,up,right">
          </div>
          <div class="gas-row" style="margin-top:8px">
            <button class="gas-btn" id="s-slice">🔪 切片</button>
            <button class="gas-btn ghost" id="s-pack">📦 打包成表</button>
            <button class="gas-btn ghost" id="s-animate">▶ 播放</button>
            <button class="gas-btn orange" id="s-export">⬇ 导出 Godot</button>
              <button class="gas-btn ghost" id="s-save">📥 入库</button>
          </div>
          <label class="gas-label">AI 生成序列（BYOK）</label>
          <div class="gas-row"><input class="gas-input" id="s-prompt" placeholder="例：像素小骑士 奔跑 8帧 横向序列，透明背景"><div style="display:flex;flex-direction:column;flex:0 0 140px"><select class="gas-select" id="s-provider"><option value="mock">本地演示</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option></select><select class="gas-select" id="s-model-sel" style="display:none;margin-top:4px"></select></div><button class="gas-btn" id="s-gen">生成</button></div>
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
        <div style="flex:1;display:flex;flex-direction:column"><select class="gas-select" id="f-provider"><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="mock">本地演示</option></select><select class="gas-select" id="f-model-sel" style="display:none;margin-top:4px"></select></div>
        <button class="gas-btn" id="f-batch">⚡ 批量生成</button>
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
          <select class="gas-select" id="m-mode"><option value="auto" selected>🤖 智能自动扣背景（本地采样，像PS一键抠）</option><option value="wand">🪄 点击背景擦除（魔棒）</option><option value="chroma">🎨 色键抠图（指定颜色）</option><option value="ai">🌐 AI 抠图 (Replicate rembg / BYOK)</option></select>
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
              <input class="gas-input" id="map-prompt" placeholder="例：俯视像素草原村庄大地图，有道路/河流/树木，暗色风格，无缝平铺，无UI">
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
  const pScene=mkPanel('scene', `
    <div class="gas-card">
      <h4>🌦️ 场景工坊 — 天气 × 日夜 实时预览</h4>
      <div class="gas-row">
        <div style="flex:1">
          <label class="gas-label">场景描述 Prompt（可选；留空则用上传 / 本地演示底图）</label>
          <div class="gas-row">
            <input class="gas-input" id="sc-prompt" placeholder="例：像素风山间小镇，40x40 俯视">
            <div style="display:flex;flex-direction:column;flex:0 0 140px"><select class="gas-select" id="sc-provider"><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option><option value="mock">本地演示(无Key)</option></select><select class="gas-select" id="sc-model-sel" style="display:none;margin-top:4px"></select></div>
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
      <div class="gas-label" style="margin-top:6px">预览（左上角显示 天气 · 时刻；雨/雪/闪电为纯程序化绘制）</div>
      <div class="gas-preview" style="padding:0;overflow:hidden"><canvas id="sc-canvas" width="800" height="450" style="width:100%;height:auto;display:block"></canvas></div>
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

  ;[pChar,pSheet,pForge,pMat,pMap,pScene,pAsset,pPost,pPreset,pExport].forEach(p=>main.appendChild(p))
  panels['character']=pChar; panels['sheet']=pSheet; panels['forge']=pForge; panels['matting']=pMat; panels['map']=pMap; panels['scene']=pScene; panels['asset']=pAsset; panels['post']=pPost; panels['preset']=pPreset; panels['export']=pExport

  function switchTab(id:string){
    active=id
    main.scrollTop=0
    Object.entries(tabEls).forEach(([k,el])=>el.classList.toggle('active', k===id))
    Object.entries(panels).forEach(([k,el])=>el.style.display=k===id?'block':'none')
    const tip=side.querySelector('#pipeline-tip') as HTMLElement
    const tips:Record<string,string>={ character:'角色工坊：三视图适合直接进序列帧拆成行走动画', sheet:'序列帧：4×2 切片后 FPS 8 在 Godot 中最顺滑', forge:'素材锻造：批量生成后可在“导出”一键打包', matting:'抠图：色键适合纯色背景，AI 适合复杂毛发', map:'无缝地图：可生成完整大地图或瓦片，再切成 TileSet；支持缩放预览', scene:'场景工坊：生成/上传场景底图后，叠加晴天/雨天/雷暴/下雪与日夜色调实时预览，可导出当前帧', asset:'素材总管：每个模块生成后可「📥 入库」，自动分类编号、本地保存、可导出/导入备份', post:'后处理：调色板量化适合像素风，描边适合精灵，尺寸调整适合 Godot 导入优化', preset:'API 配置：内置供应商 Key 与自定义路由都在此设置，保存后同步到所有生成面板；可点「🔍 获取默认模型」一键拉取全部可用模型', export:'导出：manifest.json 记录 Godot 目录结构' }
    if(tip) tip.textContent=tips[id]||''
  }

  // ---- Helpers ----
  const LS_HISTORY='dsh-game-art-studio:history'
  const getHistory=(): any[]=>{ try{ return JSON.parse(localStorage.getItem(LS_HISTORY)||'[]')}catch{return[]}}
  const pushHistory=(item:any)=>{ const h=getHistory(); h.unshift({ ...item, at:new Date().toISOString() }); localStorage.setItem(LS_HISTORY, JSON.stringify(h.slice(0,100))); refreshExportList() }
  const getKeys=():any=>{ try{ return JSON.parse(localStorage.getItem(LS)||'{}')}catch{return{}} }
  function toast(el:HTMLElement, msg:string, ok=true){ el.textContent=msg; el.style.color=ok?'#2ecc71':'#e74c3c'; setTimeout(()=>el.textContent='',3000) }

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
  async function idbPut(item:any){ const db=await openAssetDB(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).put(item); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
  async function idbGetAll():Promise<any[]>{ const db=await openAssetDB(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readonly'); const req=tx.objectStore(DB_STORE).getAll(); req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error) }) }
  async function idbDelete(id:string){ const db=await openAssetDB(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).delete(id); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
  async function idbClearByKind(kind:string){ const all=await idbGetAll(); for(const a of all){ if(a.kind===kind) await idbDelete(a.id) } }
  async function idbClearAll(){ const db=await openAssetDB(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) }) }
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
      }
      const a=document.createElement('a'); a.href=target; a.download=filename; document.body.appendChild(a); a.click(); a.remove()
    }catch{ window.open(url,'_blank') }
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
  }
  let refreshAssetManagerGlobal: (()=>void)|null = null
  async function addToLibrary(kind:string, name:string, url:string): Promise<string>{
    const def=allLibDefs()[kind]||allLibDefs().asset||{ label:'素材库', prefix:'ASSET' }
    const all=await idbGetAll()
    const count=all.filter(a=>a.kind===kind).length+1
    const id=def.prefix+'-'+String(count).padStart(4,'0')
    const item={ id, kind, name:name||def.label+' #'+count, url, createdAt:Date.now() }
    await idbPut(item)
    try{ refreshAssetManagerGlobal?.() }catch{}
    return id
  }


  // ---- 第三方 API 预设（自定义路由） ----
  const LS_PRESETS='dsh-game-art-studio:customProviders'
  const getCustomProviders=(): any[]=>{ try{ const a=JSON.parse(localStorage.getItem(LS_PRESETS)||'[]'); return Array.isArray(a)?a:[] }catch{ return [] } }
  const saveCustomProviders=(list:any[])=>{ localStorage.setItem(LS_PRESETS, JSON.stringify(list)) }
  let pickedModels:string[]=[] // 勾选要使用的模型（保存为预设的 models 字段）
  const modelSelSyncs: (()=>void)[] = []

  function providerOptionHtml(): string {
    const built='<option value="mock">本地演示(无Key)</option><option value="openai">OpenAI</option><option value="stability">Stability</option><option value="siliconflow">SiliconFlow</option>'
    const customs=getCustomProviders().map(p=>`<option value="custom:${p.id}">🔌 ${p.name.replace(/[<>"']/g,'')}</option>`).join('')
    return built+customs
  }

  function populateProviderSelects(){
    const ids=['c-provider','s-provider','f-provider','map-provider','sc-provider']
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
      const typeLabel={ openai:'OpenAI 兼容', stability:'Stability', siliconflow:'SiliconFlow' }[p.type]||p.type||'?'
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
    const newItem={ id: existingId || ('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)), name, type, model: model||(pickedModels[0]||''), baseUrl, apiKey, models: pickedModels.slice() }
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
    if(!/^https?:\/\//i.test(url)) return url
    // file:// 直开时没有 DSH 代理路由，不能落入代理兜底
    const hosted= location.protocol!=='file:' && location.origin!=='null'
    try{
      const r=await fetch(url)
      if(!r.ok) throw new Error('HTTP '+r.status)
      const blob=await r.blob()
      return URL.createObjectURL(blob)
    }catch{
      // fetch 跨域失败不影响 <img> 直接显示；托管环境才回退到 DSH 代理（供画布切片等需要 CORS 的场景）
      return hosted ? '/game-art-studio/api/proxy-image?url='+encodeURIComponent(url) : url
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
        return await callImageEdits(prompt, resolveEditsEndpoint(endpoint), preset.apiKey, { ...opts, model: opts.model || preset.model || (preset.models?.[0]||'') || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3') })
      }
      const body:any={ prompt: prompt.slice(0,1000), n:1, size: opts.size||'1024x1024' }
      body.model=opts.model || preset.model || (preset.models?.[0]||'') || (preset.type==='siliconflow' ? 'black-forest-labs/FLUX.1-schnell' : 'dall-e-3')
      if(preset.type==='siliconflow') body.image_size=opts.size||'1024x1024'
      // 优先要 base64：图片直接本地化，file:// 直开也能切片/下载，摆脱跨域图片 URL 限制
      body.response_format='b64_json'
      let r=await fetch(endpoint,{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+preset.apiKey }, body:JSON.stringify(body) })
      if(r.status===400||r.status===422){ delete body.response_format; r=await fetch(endpoint,{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+preset.apiKey }, body:JSON.stringify(body) }) }
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
      const body:any={ model:'dall-e-3', prompt: prompt.slice(0,1000), n:1, size: opts.size||'1024x1024', quality:'standard', response_format:'b64_json' }
      let r=await fetch('https://api.openai.com/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify(body) })
      if(r.status===400||r.status===422){ delete body.response_format; r=await fetch('https://api.openai.com/v1/images/generations',{ method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key }, body:JSON.stringify(body) }) }
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
      const fullPrompt = view==='tri' ? prompt+' , three views front side back, character sheet'+bgSuffix : view==='dir8' ? prompt+' , 8 directional sprites'+bgSuffix : prompt + (style.startsWith('pixel')?' , pixel art, '+style:' , '+style) + bgSuffix
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
      reader.onload=()=>{ refUrl=reader.result as string; refPreview.innerHTML=''; const img=document.createElement('img'); img.src=refUrl; img.style.maxWidth='100%'; img.style.maxHeight='90px'; img.style.imageRendering='pixelated'; refPreview.appendChild(img); toast(status,'参考图已添加 ✓ 生成时会作为图生图参考') }
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
      const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const b=document.createElement('a'); b.href=url; b.download='SpriteFrames.json'; b.click()
      // Godot 原生 .tres：引用同目录同名 PNG,拖入项目即可用（零手动配置）
      const at=document.createElement('a'); at.href='data:text/plain;charset=utf-8,'+encodeURIComponent(buildSpriteFramesTres(pngName, perRow, animations, w, h)); at.download='SpriteFrames_'+ts+'.tres'; at.click()
      pushHistory({ kind:'export', what:'spritesheet', at:Date.now() })
      toast(status,'已导出 PNG + SpriteFrames.json + SpriteFrames.tres ('+(dirRows?'命名动画 '+animations.map((x:any)=>x.name).join('/').slice(0,40):'默认动画')+') — .tres 与 PNG 放同一目录拖入 Godot 即用')
    })
    pSheet.querySelector('#s-save')!.addEventListener('click', async()=>{
        if(!packCanvas) return toast(status,'请先打包成表',false)
        const id=await addToLibrary('spritesheet','序列帧 '+new Date().toLocaleTimeString(),packCanvas.toDataURL())
        toast(status,'已入库 '+id)
      })
      pSheet.querySelector('#s-gen')!.addEventListener('click', async()=>{
      const prompt=promptEl.value.trim(); if(!prompt) return toast(status,'输入序列描述',false)
      const prov=(pSheet.querySelector('#s-provider') as HTMLSelectElement)?.value || 'mock'
      try{ const url=await callImageGen(prompt+' , sprite sheet, transparent background', prov as any, { size:'1024x512', model: (pSheet.querySelector('#s-model-sel') as HTMLSelectElement)?.value||undefined }); const img=await loadImage(url); const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; c.getContext('2d')!.drawImage(img,0,0); c.toBlob(b=>{ if(!b) return; const f=new File([b],'ai-sheet.png',{type:'image/png'}); const dt=new DataTransfer(); dt.items.add(f); fileInput.files=dt.files; sliceFromFile(f) }) }catch(e:any){ toast(status,String(e.message),false) }
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
      const prov=provEl.value
      const bg=(pForge.querySelector('#f-bg') as HTMLInputElement)?.value||'#ffffff'
      const bgTrans=(pForge.querySelector('#f-bg-trans') as HTMLInputElement)?.checked===true
      const bgSuffix= bgTrans ? ', transparent background, PNG, no background' : ', solid '+bg+' background'
      grid.innerHTML=''; let done=0
      for(const line of lines){
        try{
          const url=await callImageGen(line + ' , game asset, centered'+bgSuffix, prov, { style: (pForge.querySelector('#f-style') as HTMLSelectElement).value, bg, bgTrans, model: (pForge.querySelector('#f-model-sel') as HTMLSelectElement)?.value||undefined, reference: refUrl || undefined })
          const card=document.createElement('div'); card.className='gas-thumb'; card.innerHTML='<img src="'+url+'"><div class="meta"><span>'+line.slice(0,12)+'</span><span>64px</span></div>'; grid.appendChild(card)
          pushHistory({ kind:'asset', prompt:line, url })
        }catch(e:any){ const err=document.createElement('div'); err.className='gas-thumb'; err.style.placeItems='center'; err.style.fontSize='11px'; err.style.color='#e74c3c'; err.textContent='失败:'+String(e.message).slice(0,30); grid.appendChild(err) }
        done++; prog.style.width=Math.round(done/lines.length*100)+'%'
      }
      toast(status,'批量完成 '+done+'/'+lines.length)
      setTimeout(()=>prog.style.width='0%',1000)
    })
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
    tolEl.addEventListener('input', ()=> tolV.textContent=tolEl.value)
    modeEl.addEventListener('change', ()=>{
      if(modeTip) modeTip.textContent = modeEl.value==='auto' ? '🤖 自动模式：从图片四边开始扩散扣除相连背景，适合产品图/素材图' : modeEl.value==='wand' ? '🪄 魔棒模式：点击原图中的背景区域，即可擦除相连相似颜色' : modeEl.value==='ai' ? '🌐 AI 模式：调用 Replicate rembg（需右侧配置 Key），无 Key 时自动回退本地智能抠图' : '🎨 色键模式：点击原图拾取背景色，或直接选颜色'
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
      result.innerHTML='<span class="gas-note">等待抠图…</span>'
      im.style.cursor = modeEl.value==='wand' ? 'crosshair' : 'pointer'
      im.onclick=(e)=>{
        const rect=im.getBoundingClientRect(); const x=Math.floor((e.clientX-rect.left)/rect.width * img.naturalWidth); const y=Math.floor((e.clientY-rect.top)/rect.height * img.naturalHeight)
        if(modeEl.value==='wand'){
          doWand(x,y)
        } else if(modeEl.value==='chroma'){
          const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; const g2=c.getContext('2d')!; g2.drawImage(img,0,0)
          const dd=g2.getImageData(x,y,1,1).data; const hex='#'+[dd[0],dd[1],dd[2]].map(v=>v.toString(16).padStart(2,'0')).join(''); colorEl.value=hex; colorTouched=true
        } else if(modeEl.value==='auto'){
          toast(status,'自动抠图无需点击，直接点「✂️ 一键抠图」即可')
        }
      }
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
        for(let i=0;i<40;i++){
          await new Promise(res=>setTimeout(res,1000))
          const pr=await fetch(pred.urls?.get,{ headers:{ 'Authorization':'Bearer '+keys.replicate } })
          const pj=await pr.json()
          if(pj.status==='succeeded' && pj.output){
            const outUrl=Array.isArray(pj.output)?pj.output[0]:pj.output
            const img=new Image(); img.crossOrigin='anonymous'; img.src=outUrl; await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej })
            canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; const g=canvas.getContext('2d')!; g.drawImage(img,0,0)
            renderResult(); toast(status,'AI 抠图完成')
            return
          }
          if(pj.status==='failed') throw new Error('Replicate 处理失败')
        }
        throw new Error('AI 抠图超时')
      }catch(e:any){
        toast(status,'AI 抠图失败，已回退本地智能抠背景：'+String(e.message||e).slice(0,80), false)
        doAuto()
      }
    }

    pMat.querySelector('#m-cut')!.addEventListener('click', async()=>{
      if(!loadedImg) return toast(status,'请先上传',false)
      const mode=modeEl.value
      if(mode==='auto') doAuto()
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
      const ts3=Date.now()
      downloadDataUrl(tsUrl,'tileset_'+ts3+'.png'); downloadDataUrl(jurl,'TileSet.json')
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
      const url=URL.createObjectURL(f); sceneImg=await loadImg(url); toast(status,'场景底图已加载 ✓')
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
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='procedural_tileset_'+tsP+'.json'; a.click()
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
      const url=URL.createObjectURL(f); try{ await addChunk(await loadImg(url)) }catch(err:any){ toast(status,String(err.message||err),false) }
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
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='map_data.json'; a.click()
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
      downloadDataUrl(URL.createObjectURL(blob),'godot-arter-assets-'+Date.now()+'.json')
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
  main.querySelector('#e-manifest')?.addEventListener('click', ()=>{
    const h=getHistory(); const mf={ project:(main.querySelector('#e-name') as HTMLInputElement).value, godot:'4.2', generated_at:new Date().toISOString(), counts: h.reduce((a:any,c:any)=>{a[c.kind]=(a[c.kind]||0)+1;return a},{}), assets:h, structure:{ 'res://assets/characters/':'角色', 'res://assets/spritesheets/':'序列帧', 'res://assets/tilesets/':'瓦片', 'res://assets/icons/':'道具' } }
    const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent=JSON.stringify(mf,null,2)
    const blob=new Blob([JSON.stringify(mf,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='godot_manifest.json'; a.click()
  })
  main.querySelector('#e-clear')?.addEventListener('click', ()=>{ localStorage.removeItem(LS_HISTORY); refreshExportList(); const pre=main.querySelector('#e-preview') as HTMLElement; if(pre) pre.style.display='none' })
  main.querySelector('#e-dump')?.addEventListener('click', ()=>{ const pre=main.querySelector('#e-preview') as HTMLElement; pre.style.display='block'; pre.textContent= 'localStorage '+LS_HISTORY+':\\n'+ (localStorage.getItem(LS_HISTORY)||'[]').slice(0,2000) })

  return root
}

