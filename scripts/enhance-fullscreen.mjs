import { readFileSync, writeFileSync } from 'node:fs'

const filePath = 'D:/Godot-Arter/src/client/index.ts'
let content = readFileSync(filePath, 'utf-8')

// 找到 closeBtn 后面，添加控制面板
const oldPattern = `      const closeBtn=document.createElement('button')
      closeBtn.textContent='✕'
      closeBtn.style.cssText='position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.6);border:2px solid #594c39;border-radius:50%;width:48px;height:48px;color:#e8a33d;font-size:20px;cursor:pointer'
      closeBtn.onclick=()=>overlay.remove()
      stage.appendChild(closeBtn)
      
      overlay.appendChild(stage)`

const newPattern = `      const closeBtn=document.createElement('button')
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
      zoomInBtn.onclick=()=>{ const s=bgImg.style.transform.match(/scale\\(([\\d.]+)\\)/); const cur=s?parseFloat(s[1]):1; const n=Math.min(1.5,cur+0.1); bgImg.style.transform='scale('+n.toFixed(1)+')' }
      const zoomOutBtn=document.createElement('button')
      zoomOutBtn.textContent='🔍-'
      zoomOutBtn.style.cssText='background:rgba(255,255,255,0.1);border:1px solid #594c39;border-radius:6px;color:#e8a33d;padding:4px 8px;cursor:pointer;font-size:12px'
      zoomOutBtn.onclick=()=>{ const s=bgImg.style.transform.match(/scale\\(([\\d.]+)\\)/); const cur=s?parseFloat(s[1]):1; const n=Math.max(0.5,cur-0.1); bgImg.style.transform='scale('+n.toFixed(1)+')' }
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
      
      overlay.appendChild(stage)`

if (content.includes(oldPattern)) {
  console.log('Found pattern, replacing...')
  content = content.replace(oldPattern, newPattern)
  writeFileSync(filePath, content, 'utf-8')
  console.log('Done!')
} else {
  console.log('Pattern not found!')
}
