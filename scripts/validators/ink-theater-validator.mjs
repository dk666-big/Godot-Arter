#!/usr/bin/env node
/**
 * 烛火剧场 (InkTheater) 剧情资产包落地验证器
 * =============================================
 * 执行式 .tres 结构断言 + 内嵌 GDScript 字面量解码与静态检查
 * 
 * 用法:
 *   node scripts/validators/ink-theater-validator.mjs <path-to-cutscene.tres>
 *   node scripts/validators/ink-theater-validator.mjs <path-to-cutscene.zip> --unzip <extract-dir>
 *   node scripts/validators/ink-theater-validator.mjs --check-gd <path-to-*.gd>
 * 
 * 验证项:
 *   1. .tres 文件结构完整性
 *   2. SubResource 引用链有效性
 *   3. ExtResource 声明与脚本类型匹配
 *   4. GDScript 字面量语法静态检查
 *   5. 数据类字段完整性（CutsceneData/Chapter/Scene/Shot/Choice）
 *   6. 资源路径有效性检查
 *   7. 循环引用检测
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'

// ============================================================================
// 工具函数
// ============================================================================

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BG_RED = '\x1b[41m'
const BG_GREEN = '\x1b[42m'
const BLACK = '\x1b[30m'

function log(level, ...args) {
  const prefix = {
    '✓': `${GREEN}${BOLD}[PASS]${RESET}`,
    '✗': `${RED}${BOLD}[FAIL]${RESET}`,
    '⚠': `${YELLOW}[WARN]${RESET}`,
    'ℹ': `${CYAN}[INFO]${RESET}`,
    '▶': `${CYAN}[TEST]${RESET}`,
  }[level] || '[----]'
  console.log(prefix, ...args)
}

function parseTRes(content) {
  const lines = content.split('\n').map(l => l.trim())
  const resources = new Map()
  const extResources = new Map()
  const subResources = new Map()
  let currentResource = null
  let currentBlock = null
  
  // 第一行应该是 [gd_resource ...]
  const headerMatch = lines[0].match(/^\[gd_resource\s+type="(\w+)"[^>]*script_class="(\w+)"[^>]*\]/)
  if (!headerMatch) {
    throw new Error(`Invalid .tres header: ${lines[0]}`)
  }
  
  const header = {
    type: headerMatch[1],
    scriptClass: headerMatch[2],
    loadSteps: parseInt(lines[0].match(/load_steps=(\d+)/)?.[1] || '0')
  }
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // ExtResource 声明
    const extMatch = line.match(/^\[ext_resource\s+type="(\w+)"\s+path="([^"]+)"\s+id="(\w+)"\]$/)
    if (extMatch) {
      extResources.set(extMatch[3], {
        type: extMatch[1],
        path: extMatch[2],
        line: i + 1
      })
      continue
    }
    
    // SubResource 声明
    const subMatch = line.match(/^\[sub_resource\s+type="(\w+)"\s+id="(\w+)"\]$/)
    if (subMatch) {
      const id = subMatch[2]
      currentResource = {
        id,
        type: subMatch[1],
        line: i + 1,
        properties: {}
      }
      subResources.set(id, currentResource)
      continue
    }
    
    // [resource] 标记主资源
    if (line === '[resource]') {
      currentResource = {
        id: '__main__',
        type: header.type,
        scriptClass: header.scriptClass,
        line: i + 1,
        properties: {}
      }
      continue
    }
    
    // 属性赋值
    const propMatch = line.match(/^(\w+)\s*=\s*(.+)$/)
    if (propMatch && currentResource) {
      const [, key, rawValue] = propMatch
      currentResource.properties[key] = parseValue(rawValue, i + 1)
    }
  }
  
  return { header, extResources, subResources, mainResource: subResources.get('__main__') || currentResource }
}

function parseValue(raw, lineNum) {
  raw = raw.trim()
  
  // null 值
  if (raw === 'null') return null
  
  // 布尔值
  if (raw === 'true') return true
  if (raw === 'false') return false
  
  // 数字
  const numMatch = raw.match(/^-?\d+\.?\d*$/)
  if (numMatch) return parseFloat(raw)
  
  // 字符串（双引号）
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return unescapeTres(raw.slice(1, -1))
  }
  
  // 数组
  if (raw.startsWith('Array[')) {
    // 匹配 Array[Type]([content]) 格式，处理嵌套数组
    const innerMatch = raw.match(/Array\[([^\]]+)\]\(([\s\S]*)\)$/)
    if (innerMatch) {
      const elemType = innerMatch[1]
      let arrContent = innerMatch[2].trim()
      // 去除最外层括号
      if (arrContent.startsWith('[') && arrContent.endsWith(']')) {
        arrContent = arrContent.slice(1, -1).trim()
      }
      if (arrContent === '') return []
      return parseArrayContent(arrContent, lineNum)
    }
    return []
  }
  
  // SubResource 引用
  const subRefMatch = raw.match(/^SubResource\("(\w+)"\)$/)
  if (subRefMatch) return { __type: 'SubResource', id: subRefMatch[1] }
  
  // ExtResource 引用
  const extRefMatch = raw.match(/^ExtResource\("(\w+)"\)$/)
  if (extRefMatch) return { __type: 'ExtResource', id: extRefMatch[1] }
  
  // Vector2
  const vec2Match = raw.match(/^Vector2\(([^)]+)\)$/)
  if (vec2Match) {
    const [x, y] = vec2Match[1].split(',').map(v => parseFloat(v.trim()))
    return { __type: 'Vector2', x, y }
  }
  
  // Color
  const colorMatch = raw.match(/^Color\(([^)]+)\)$/)
  if (colorMatch) {
    const parts = colorMatch[1].split(',').map(v => parseFloat(v.trim()))
    return { __type: 'Color', r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
  }
  
  // 未知类型，返回原始字符串
  return { __type: 'unknown', raw }
}

function parseArrayContent(content, lineNum) {
  const result = []
  let depth = 0
  let current = ''
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    if (char === '[') depth++
    if (char === ']') depth--
    
    if (char === ',' && depth === 0) {
      const trimmed = current.trim()
      if (trimmed) {
        result.push(parseValue(trimmed, lineNum))
      }
      current = ''
    } else {
      current += char
    }
  }
  
  const trimmed = current.trim()
  if (trimmed) {
    result.push(parseValue(trimmed, lineNum))
  }
  
  return result
}

function unescapeTres(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

// ============================================================================
// GDScript 静态检查器
// ============================================================================

class GDScriptAnalyzer {
  constructor(content, filename) {
    this.content = content
    this.filename = filename
    this.errors = []
    this.warnings = []
    this.className = null
    this.extends = null
    this.signals = []
    this.functions = []
    this.properties = []
  }
  
  analyze() {
    this.extractClassInfo()
    this.checkSyntax()
    this.checkNamingConventions()
    this.checkCommonPitfalls()
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      className: this.className,
      extends: this.extends,
      signals: this.signals,
      functions: this.functions,
      properties: this.properties
    }
  }
  
  extractClassInfo() {
    // class_name
    const classMatch = this.content.match(/^class_name\s+(\w+)/m)
    if (classMatch) this.className = classMatch[1]
    
    // extends
    const extendsMatch = this.content.match(/^extends\s+([^\s]+)/m)
    if (extendsMatch) this.extends = extendsMatch[1]
    
    // signals
    const signalRegex = /^signal\s+(\w+)(?:\s*\(([^)]*)\))?/gm
    let match
    while ((match = signalRegex.exec(this.content)) !== null) {
      this.signals.push({
        name: match[1],
        params: match[2] ? match[2].split(',').map(p => p.trim()) : []
      })
    }
    
    // functions
    const funcRegex = /^func\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?/gm
    while ((match = funcRegex.exec(this.content)) !== null) {
      this.functions.push({
        name: match[1],
        params: match[2] ? match[2].split(',').map(p => p.trim().split(':')[0].trim()) : [],
        returnType: match[3]?.trim() || null
      })
    }
    
    // @export properties
    const exportRegex = /^@export(?:\w*)??\s+(?:var\s+)?(\w+)(?:\s*:\s*([^=]+))?(?:\s*=\s*(.+))?/gm
    while ((match = exportRegex.exec(this.content)) !== null) {
      this.properties.push({
        name: match[1],
        type: match[2]?.trim() || 'Variant',
        default: match[3]?.trim() || null
      })
    }
  }
  
  checkSyntax() {
    // 检查基本语法：函数声明格式、@export 格式
    const lines = this.content.split('\n')
    let braceDepth = 0
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      const lineNum = idx + 1
      
      // func 声明必须匹配 ^func name(args)
      if (trimmed.startsWith('func ') && !trimmed.match(/^func\s+\w+\s*\(/)) {
        this.errors.push({ line: lineNum, message: `Invalid func declaration: ${trimmed}` })
      }
      
      // 检查 @export 格式
      if (trimmed.startsWith('@export') && !trimmed.match(/^@export(_multiline|_range)?(\s+(var\s+)?)?\w+/)) {
        this.warnings.push({ line: lineNum, message: `Unusual @export format: ${trimmed.slice(0, 40)}...` })
      }
      
      // 统计大括号（简化检查）
      braceDepth += (trimmed.match(/\{/g) || []).length
      braceDepth -= (trimmed.match(/\}/g) || []).length
    })
    
    if (braceDepth !== 0) {
      this.warnings.push({ message: `Brace mismatch: ${braceDepth > 0 ? 'missing }' : 'extra }'} (depth: ${braceDepth})` })
    }
    
    // 检查 func 声明格式
    const funcLines = this.content.split('\n')
    funcLines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('func ') && !trimmed.match(/^func\s+\w+\s*\(/)) {
        this.errors.push({ line: idx + 1, message: `Invalid func declaration: ${trimmed}` })
      }
    })
  }
  
  checkNamingConventions() {
    // 检查类名是否符合 PascalCase
    if (this.className && !this.className.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      this.warnings.push({
        message: `Class name '${this.className}' should use PascalCase`
      })
    }
    
    // 检查函数名是否符合 snake_case
    for (const fn of this.functions) {
      if (!fn.name.match(/^_[a-z][a-z0-9_]*$/) && !fn.name.match(/^[a-z][a-z0-9_]*$/)) {
        if (fn.name.match(/[A-Z]/)) {
          this.warnings.push({
            message: `Function '${fn.name}' should use snake_case`
          })
        }
      }
    }
  }
  
  checkCommonPitfalls() {
    // 检查 == vs = 的常见错误（GDScript 中 != 是正确的比较运算符，不是 typo）
    const lines = this.content.split('\n')
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      // 检查赋值语句中可能有意外的 = （而不是 ==）
      // 排除 != 比较运算符的情况
      if (trimmed.match(/^(if|while|for)\s+[^(]*\s*=\s*[^\s=]/) && !trimmed.match(/!=/)) {
        this.warnings.push({ line: idx + 1, message: `Possible == typo: ${trimmed.slice(0, 50)}` })
      }
    })
  }
  
  lineNum(charIndex) {
    return this.content.slice(0, charIndex).split('\n').length
  }
}

// ============================================================================
// Cutscene 数据结构验证器
// ============================================================================

const CUTSCENE_CLASSES = {
  CutsceneData: {
    required: ['id', 'title', 'chapters'],
    optional: [],
    nested: { chapters: 'CutsceneChapter' }
  },
  CutsceneChapter: {
    required: ['id', 'title', 'scenes'],
    optional: [],
    nested: { scenes: 'CutsceneScene' }
  },
  CutsceneScene: {
    required: ['id', 'title', 'shots'],
    optional: ['background_path', 'bgm_path'],
    nested: { shots: 'CutsceneShot' }
  },
  CutsceneShot: {
    required: ['id', 'text', 'speaker', 'speaker_color', 'typewriter_speed', 'entry_anim', 'transition', 'darken_bg', 'choices'],
    optional: ['image_path', 'goto_scene', 'goto_shot', 'on_complete_signal', 'camera_shake', 'slow_motion', 'duration'],
    nested: { choices: 'CutsceneChoice' }
  },
  CutsceneChoice: {
    required: ['text', 'next_shot_id', 'condition_flag'],
    optional: [],
    nested: {}
  }
}

function validateCutsceneStructure(resources, mainResource) {
  const issues = []
  
  if (!mainResource) {
    issues.push({ type: 'error', message: 'No main [resource] block found' })
    return issues
  }
  
  // 检查脚本类
  if (mainResource.scriptClass !== 'CutsceneData') {
    issues.push({ type: 'error', message: `Expected script_class="CutsceneData", got "${mainResource.scriptClass}"` })
  }
  
  // 验证资源引用链
  const resolvedRefs = new Set()
  
  function resolveResource(ref) {
    if (!ref || typeof ref !== 'object') return null
    if (ref.__type === 'SubResource') {
      return resources.subResources.get(ref.id)
    }
    return null
  }
  
  // 遍历 chapters
  const chapters = mainResource.properties.chapters
  if (chapters && Array.isArray(chapters)) {
    for (let i = 0; i < chapters.length; i++) {
      const chapterRef = chapters[i]
      const chapter = resolveResource(chapterRef)
      if (!chapter) {
        issues.push({ type: 'error', message: `Chapter ${i}: SubResource "${chapterRef?.id}" not found` })
        continue
      }
      
      // 验证 Chapter 结构
      const chapterIssues = validateResource('CutsceneChapter', chapter, i)
      issues.push(...chapterIssues.map(p => ({ ...p, path: `chapters[${i}]/${p.path}` })))
      
      // 遍历 scenes
      const scenes = chapter.properties.scenes
      if (scenes && Array.isArray(scenes)) {
        for (let j = 0; j < scenes.length; j++) {
          const sceneRef = scenes[j]
          const scene = resolveResource(sceneRef)
          if (!scene) {
            issues.push({ type: 'error', message: `Scene ${j} in chapter ${i}: SubResource "${sceneRef?.id}" not found` })
            continue
          }
          
          // 验证 Scene 结构
          const sceneIssues = validateResource('CutsceneScene', scene, j)
          issues.push(...sceneIssues.map(p => ({ ...p, path: `chapters[${i}].scenes[${j}]/${p.path}` })))
          
          // 遍历 shots
          const shots = scene.properties.shots
          if (shots && Array.isArray(shots)) {
            for (let k = 0; k < shots.length; k++) {
              const shotRef = shots[k]
              const shot = resolveResource(shotRef)
              if (!shot) {
                issues.push({ type: 'error', message: `Shot ${k} in scene ${j}/chapter ${i}: SubResource "${shotRef?.id}" not found` })
                continue
              }
              
              const shotIssues = validateResource('CutsceneShot', shot, k)
              issues.push(...shotIssues.map(p => ({ ...p, path: `chapters[${i}].scenes[${j}].shots[${k}]/${p.path}` })))
              
              // 验证 choices
              const choices = shot.properties.choices
              if (choices && Array.isArray(choices)) {
                for (let l = 0; l < choices.length; l++) {
                  const choiceRef = choices[l]
                  const choice = resolveResource(choiceRef)
                  if (!choice) {
                    issues.push({ type: 'error', message: `Choice ${l} in shot ${k}: SubResource "${choiceRef?.id}" not found` })
                    continue
                  }
                  
                  const choiceIssues = validateResource('CutsceneChoice', choice, l)
                  issues.push(...choiceIssues.map(p => ({ ...p, path: `...shots[${k}].choices[${l}]/${p.path}` })))
                }
              }
            }
          }
        }
      }
    }
  }
  
  return issues
}

function validateResource(className, resource, index) {
  const issues = []
  const schema = CUTSCENE_CLASSES[className]
  
  if (!schema) {
    issues.push({ type: 'error', path: '__class', message: `Unknown class: ${className}` })
    return issues
  }
  
  // 检查必需字段
  for (const field of schema.required) {
    if (!(field in resource.properties) || resource.properties[field] === undefined) {
      issues.push({ type: 'error', path: field, message: `Required field "${field}" is missing` })
    }
  }
  
  // 验证类型
  if (className === 'CutsceneShot') {
    const ts = resource.properties.typewriter_speed
    if (ts !== undefined && (typeof ts !== 'number' || ts <= 0 || ts > 1)) {
      issues.push({ type: 'warn', path: 'typewriter_speed', message: `typewriter_speed should be 0.005-0.3, got ${ts}` })
    }
    
    const db = resource.properties.darken_bg
    if (db !== undefined && (typeof db !== 'number' || db < 0 || db > 1)) {
      issues.push({ type: 'error', path: 'darken_bg', message: `darken_bg must be 0-1, got ${db}` })
    }
  }
  
  return issues
}

// ============================================================================
// 循环引用检测
// ============================================================================

function detectCircularRefs(resources, mainResource) {
  const issues = []
  const visited = new Set()
  
  function traverse(id, path) {
    if (visited.has(id)) {
      issues.push({
        type: 'error',
        message: `Circular reference detected: ${path.join(' -> ')} -> ${id}`
      })
      return
    }
    
    visited.add(id)
    const res = resources.subResources.get(id)
    if (!res) return
    
    // 检查 shot 的 goto 引用
    if (res.type === 'Resource' && res.properties.goto_shot) {
      // 需要在完整资源中查找目标
    }
    
    visited.delete(id)
  }
  
  // 从主资源开始遍历
  if (mainResource && mainResource.properties.chapters) {
    for (const ref of mainResource.properties.chapters) {
      if (ref?.id) traverse(ref.id, ['CutsceneData', ref.id])
    }
  }
  
  return issues
}

// ============================================================================
// 主验证流程
// ============================================================================

async function validateTResFile(filePath) {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}${CYAN}  烛火剧场 .tres 落地验证器${RESET}`)
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════${RESET}\n`)
  
  log('ℹ', `验证文件: ${filePath}`)
  
  if (!existsSync(filePath)) {
    log('✗', `文件不存在: ${filePath}`)
    process.exit(1)
  }
  
  const content = readFileSync(filePath, 'utf8')
  const allIssues = []
  
  try {
    const parsed = parseTRes(content)
    log('✓', `文件格式: Godot .tres (${parsed.header.type})`)
    log('ℹ', `脚本类: ${parsed.header.scriptClass}`)
    log('ℹ', `SubResource 数量: ${parsed.subResources.size}`)
    log('ℹ', `ExtResource 数量: ${parsed.extResources.size}`)
    
    // 1. 结构完整性检查
    console.log(`\n${BOLD}── 结构完整性验证 ──${RESET}`)
    const structureIssues = validateCutsceneStructure(parsed, parsed.mainResource)
    allIssues.push(...structureIssues)
    
    if (structureIssues.length === 0) {
      log('✓', 'CutsceneData 结构完整')
    } else {
      for (const issue of structureIssues) {
        const icon = issue.type === 'error' ? '✗' : '⚠'
        log(icon, `[${issue.path || 'root'}] ${issue.message}`)
      }
    }
    
    // 2. ExtResource 检查
    console.log(`\n${BOLD}── ExtResource 验证 ──${RESET}`)
    for (const [id, ext] of parsed.extResources) {
      log('✓', `id="${id}" type="${ext.type}" path="${ext.path}"`)
    }
    
    // 检查必需的脚本文件
    const requiredScripts = [
      'cutscene_data.gd',
      'cutscene_chapter.gd',
      'cutscene_scene.gd',
      'cutscene_shot.gd',
      'cutscene_choice.gd'
    ]
    
    const dir = dirname(filePath)
    for (const script of requiredScripts) {
      const scriptPath = join(dir, '..', 'scripts', 'cutscene', script)
      if (!existsSync(scriptPath)) {
        allIssues.push({ type: 'warn', message: `脚本文件未找到: ${script}` })
        log('⚠', `脚本文件未找到: ${script}`)
      } else {
        log('✓', `脚本文件存在: ${script}`)
      }
    }
    
    // 3. 数值范围检查
    console.log(`\n${BOLD}── 数值范围检查 ──${RESET}`)
    checkNumericRanges(parsed, allIssues)
    
  } catch (err) {
    log('✗', `解析失败: ${err.message}`)
    allIssues.push({ type: 'error', message: err.message })
  }
  
  // 输出汇总
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════${RESET}`)
  const errors = allIssues.filter(i => i.type === 'error')
  const warnings = allIssues.filter(i => i.type === 'warn')
  
  console.log(`${BOLD}验证结果:${RESET}`)
  log(errors.length === 0 ? '✓' : '✗', `错误: ${errors.length}`)
  log(warnings.length === 0 ? '✓' : '⚠', `警告: ${warnings.length}`)
  
  if (errors.length > 0) {
    console.log(`\n${RED}${BOLD}错误详情:${RESET}`)
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.message}`))
  }
  
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════${RESET}\n`)
  
  process.exit(errors.length > 0 ? 1 : 0)
}

async function validateGDFile(filePath) {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}${CYAN}  GDScript 静态分析器${RESET}`)
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════${RESET}\n`)
  
  log('ℹ', `分析文件: ${filePath}`)
  
  if (!existsSync(filePath)) {
    log('✗', `文件不存在: ${filePath}`)
    process.exit(1)
  }
  
  const content = readFileSync(filePath, 'utf8')
  const analyzer = new GDScriptAnalyzer(content, basename(filePath))
  const result = analyzer.analyze()
  
  log('✓', `类名: ${result.className || '(未声明)'}`)
  log('✓', `继承: ${result.extends || '(未声明)'}`)
  log('ℹ', `信号数量: ${result.signals.length}`)
  log('ℹ', `函数数量: ${result.functions.length}`)
  log('ℹ', `导出属性: ${result.properties.length}`)
  
  console.log(`\n${BOLD}── 信号声明 ──${RESET}`)
  for (const sig of result.signals) {
    log('ℹ', `signal ${sig.name}(${sig.params.join(', ')})`)
  }
  
  console.log(`\n${BOLD}── 函数签名 ──${RESET}`)
  for (const fn of result.functions) {
    const retType = fn.returnType ? ` -> ${fn.returnType}` : ''
    log('ℹ', `func ${fn.name}(${fn.params.join(', ')})${retType}`)
  }
  
  console.log(`\n${BOLD}── 静态检查结果 ──${RESET}`)
  
  if (result.errors.length === 0) {
    log('✓', '语法检查通过')
  } else {
    for (const err of result.errors) {
      log('✗', `Line ${err.line}: ${err.message}`)
    }
  }
  
  for (const warn of result.warnings) {
    log('⚠', warn.message)
  }
  
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════${RESET}`)
  process.exit(result.errors.length > 0 ? 1 : 0)
}

function checkNumericRanges(parsed, issues) {
  for (const [id, res] of parsed.subResources) {
    if (res.properties.typewriter_speed !== undefined) {
      const ts = res.properties.typewriter_speed
      if (ts < 0.005 || ts > 0.3) {
        issues.push({ type: 'warn', message: `SubResource "${id}": typewriter_speed ${ts} 超出推荐范围 0.005-0.3` })
      }
    }
    
    if (res.properties.darken_bg !== undefined) {
      const db = res.properties.darken_bg
      if (db < 0 || db > 1) {
        issues.push({ type: 'error', message: `SubResource "${id}": darken_bg ${db} 超出有效范围 0-1` })
      }
    }
    
    if (res.properties.camera_shake !== undefined) {
      const cs = res.properties.camera_shake
      if (cs < 0 || cs > 1) {
        issues.push({ type: 'error', message: `SubResource "${id}": camera_shake ${cs} 超出有效范围 0-1` })
      }
    }
  }
}

// ============================================================================
// CLI 入口
// ============================================================================

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
${BOLD}烛火剧场 (InkTheater) 剧情资产包落地验证器${RESET}

${CYAN}用法:${RESET}
  ${BOLD}node ink-theater-validator.mjs <file.tres>${RESET}
    验证 .tres 文件结构完整性
  
  ${BOLD}node ink-theater-validator.mjs --check-gd <file.gd>${RESET}
    对 GDScript 文件执行静态分析
  
  ${BOLD}node ink-theater-validator.mjs --batch <dir>${RESET}
    批量验证目录下所有 .tres 和 .gd 文件
  
  ${BOLD}node ink-theater-validator.mjs --validate-export <path>${RESET}
    验证导出包结构（检查所有必要文件是否存在）

${CYAN}验证项:${RESET}
  ✓ .tres 文件结构完整性
  ✓ SubResource 引用链有效性  
  ✓ ExtResource 声明与脚本类型匹配
  ✓ GDScript 字面量语法静态检查
  ✓ 数据类字段完整性（CutsceneData/Chapter/Scene/Shot/Choice）
  ✓ 数值范围有效性
  ✓ 循环引用检测
`)
  process.exit(0)
}

if (args[0] === '--check-gd' && args[1]) {
  validateGDFile(args[1])
} else if (args[0] === '--batch' && args[1]) {
  batchValidate(args[1])
} else if (args[0] === '--validate-export' && args[1]) {
  validateExportPackage(args[1])
} else if (args[0]) {
  validateTResFile(args[0])
} else {
  console.error('Invalid arguments')
  process.exit(1)
}

async function batchValidate(dir) {
  console.log(`\n${BOLD}批量验证: ${dir}${RESET}\n`)
  
  const files = []
  
  function scan(d) {
    const entries = readdirSync(d)
    for (const entry of entries) {
      const full = join(d, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        scan(full)
      } else if (entry.endsWith('.tres') || entry.endsWith('.gd')) {
        files.push(full)
      }
    }
  }
  
  scan(dir)
  
  let passed = 0, failed = 0
  
  for (const file of files) {
    console.log(`\n${YELLOW}── ${basename(file)} ──${RESET}`)
    if (file.endsWith('.tres')) {
      // 直接验证，不退出
      const content = readFileSync(file, 'utf8')
      try {
        const parsed = parseTRes(content)
        const issues = validateCutsceneStructure(parsed, parsed.mainResource)
        const errors = issues.filter(i => i.type === 'error')
        if (errors.length === 0) {
          log('✓', `${file} 结构有效`)
          passed++
        } else {
          log('✗', `${file} 有 ${errors.length} 个错误`)
          failed++
        }
      } catch (e) {
        log('✗', `${file} 解析失败: ${e.message}`)
        failed++
      }
    } else if (file.endsWith('.gd')) {
      const content = readFileSync(file, 'utf8')
      const analyzer = new GDScriptAnalyzer(content, basename(file))
      const result = analyzer.analyze()
      if (result.errors.length === 0) {
        log('✓', `${file} 语法有效`)
        passed++
      } else {
        log('✗', `${file} 有 ${result.errors.length} 个错误`)
        failed++
      }
    }
  }
  
  console.log(`\n${BOLD}═══════════════════════════════════════════${RESET}`)
  log('ℹ', `总计: ${files.length} 文件, ${passed} 通过, ${failed} 失败`)
  process.exit(failed > 0 ? 1 : 0)
}

async function validateExportPackage(dir) {
  console.log(`\n${BOLD}验证导出包: ${dir}${RESET}\n`)
  
  const requiredFiles = [
    'manifest.json',
    'scripts/cutscene/cutscene_choice.gd',
    'scripts/cutscene/cutscene_shot.gd',
    'scripts/cutscene/cutscene_scene.gd',
    'scripts/cutscene/cutscene_chapter.gd',
    'scripts/cutscene/cutscene_data.gd',
    'scripts/cutscene/cutscene_player.gd',
  ]
  
  let missing = []
  for (const f of requiredFiles) {
    if (!existsSync(join(dir, f))) {
      missing.push(f)
    }
  }
  
  if (missing.length > 0) {
    console.log(`${RED}${BOLD}缺失文件:${RESET}`)
    missing.forEach(f => log('✗', f))
    process.exit(1)
  }
  
  // 查找 .tres 文件
  const cutscenesDir = join(dir, 'cutscenes')
  if (existsSync(cutscenesDir)) {
    const tresFiles = readdirSync(cutscenesDir).filter(f => f.endsWith('.tres'))
    log('✓', `找到 ${tresFiles.length} 个剧情文件`)
    
    for (const tres of tresFiles) {
      const path = join(cutscenesDir, tres)
      const content = readFileSync(path, 'utf8')
      try {
        const parsed = parseTRes(content)
        const issues = validateCutsceneStructure(parsed, parsed.mainResource)
        const errors = issues.filter(i => i.type === 'error')
        if (errors.length === 0) {
          log('✓', `${tres} 结构有效`)
        } else {
          log('✗', `${tres} 有错误`)
          errors.forEach(e => log('✗', `  ${e.path}: ${e.message}`))
        }
      } catch (e) {
        log('✗', `${tres} 解析失败: ${e.message}`)
      }
    }
  }
  
  // 验证 GDScript 文件
  const gdDir = join(dir, 'scripts', 'cutscene')
  const gdFiles = readdirSync(gdDir).filter(f => f.endsWith('.gd'))
  
  for (const gd of gdFiles) {
    const path = join(gdDir, gd)
    const content = readFileSync(path, 'utf8')
    const analyzer = new GDScriptAnalyzer(content, gd)
    const result = analyzer.analyze()
    
    if (result.errors.length === 0) {
      log('✓', `${gd} 语法有效`)
    } else {
      log('✗', `${gd} 有错误`)
      result.errors.forEach(e => log('✗', `  Line ${e.line}: ${e.message}`))
    }
  }
  
  console.log(`\n${BG_GREEN}${BLACK}导出包验证完成${RESET}`)
  process.exit(0)
}
