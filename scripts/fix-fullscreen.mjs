import { readFileSync, writeFileSync } from 'node:fs'

const filePath = 'D:/Godot-Arter/src/client/index.ts'
let content = readFileSync(filePath, 'utf-8')

// 找到函数开始和结束
const startMarker = 'function openStoryFullscreen(sc:SScene){'
const endMarker = '    }'
    
const startIdx = content.indexOf(startMarker)
if (startIdx === -1) {
  console.log('Function start not found!')
  process.exit(1)
}

// 找到匹配的结束大括号
let depth = 0
let endIdx = -1
let inString = false
let stringChar = ''

for (let i = startIdx + startMarker.length - 1; i < content.length; i++) {
  const c = content[i]
  
  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true
    stringChar = c
    continue
  }
  
  if (inString && c === stringChar && content[i-1] !== '\\') {
    inString = false
    continue
  }
  
  if (inString) continue
  
  if (c === '{') depth++
  else if (c === '}') {
    depth--
    if (depth === 0) {
      endIdx = i + 1
      break
    }
  }
}

if (endIdx === -1) {
  console.log('Function end not found!')
  process.exit(1)
}

console.log('Found function at:', startIdx, '-', endIdx)

// 替换函数
const newFunc = `function openStoryFullscreen(sc:SScene){
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
    }`

const newContent = content.slice(0, startIdx) + newFunc + content.slice(endIdx)
writeFileSync(filePath, newContent, 'utf-8')
console.log('Done! Function replaced.')
