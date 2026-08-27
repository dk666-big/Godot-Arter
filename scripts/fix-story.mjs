import { readFileSync, writeFileSync } from 'node:fs'

const filePath = 'D:/Godot-Arter/src/client/index.ts'
let content = readFileSync(filePath, 'utf-8')

// 找到 story 注释块结束的位置
const commentEnd = "游戏侧接线、触发条件、存档联动由使用者在 Godot 内自行完成。 */\r\n"

// 1. 在注释结束后添加 pStory 的声明（不带 const）
const pstoryDeclaration = "游戏侧接线、触发条件、存档联动由使用者在 Godot 内自行完成。 */\r\nlet pStory: HTMLElement\r\n"

// 2. 在 IIFE 内部，把 "const pStory=mkPanel" 改为 "pStory=mkPanel"
const constPstoryPattern = "const pStory=mkPanel('story', `"
const assignPstoryPattern = "pStory=mkPanel('story', `"

if (!content.includes(constPstoryPattern)) {
  console.log('const pStory pattern not found!')
  process.exit(1)
}

// 应用修改
let newContent = content
  .replace(commentEnd, pstoryDeclaration)
  .replace(constPstoryPattern, assignPstoryPattern)

writeFileSync(filePath, newContent, 'utf-8')
console.log('Done! pStory is now declared outside the IIFE')
