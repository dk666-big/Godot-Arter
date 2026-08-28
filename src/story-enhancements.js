/**
 * Story Enhancement Module for Godot-Arter v2.1
 * 烛火剧场增强模块 - 多角色对话、音效绑定、分支剧情树、TTS
 */

// ===== Multi-Character Dialogue Support =====
const MultiCharacterModule = {
    // Initialize multi-character support for a shot
    initShotCharacters(shot) {
        if (!shot.characters) {
            shot.characters = [];
        }
        return shot.characters;
    },
    
    // Get character positions
    getCharacterPositions() {
        return [
            { id: 'left', label: '左侧', x: '10%' },
            { id: 'center-left', label: '中左', x: '30%' },
            { id: 'center', label: '中央', x: '50%' },
            { id: 'center-right', label: '中右', x: '70%' },
            { id: 'right', label: '右侧', x: '90%' }
        ];
    },
    
    // Get character emotions
    getCharacterEmotions() {
        return [
            { id: 'normal', label: '😶 正常', icon: '😶' },
            { id: 'happy', label: '😄 开心', icon: '😄' },
            { id: 'sad', label: '😢 悲伤', icon: '😢' },
            { id: 'angry', label: '😠 愤怒', icon: '😠' },
            { id: 'surprised', label: '😲 惊讶', icon: '😲' },
            { id: 'fearful', label: '😨 恐惧', icon: '😨' }
        ];
    },
    
    // Render character editor HTML
    renderCharacterEditor(characters, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Add character button
        const addBtn = document.createElement('button');
        addBtn.className = 'gas-btn ghost';
        addBtn.style.cssText = 'margin-bottom:8px';
        addBtn.textContent = '➕ 添加角色';
        addBtn.onclick = () => this.addCharacter(characters, containerId);
        container.appendChild(addBtn);
        
        // Character list
        characters.forEach((char, index) => {
            const charCard = document.createElement('div');
            charCard.style.cssText = 'background:#252a2e;border:1px solid var(--border);border-radius:6px;padding:8px;margin-bottom:6px';
            
            const positions = this.getCharacterPositions();
            const emotions = this.getCharacterEmotions();
            
            charCard.innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                    <input class="gas-input" data-char="name" value="${esc(char.name || '')}" placeholder="角色名" style="flex:1">
                    <button class="gas-btn ghost" style="padding:4px 8px;background:#3a1a1a" data-del-char="${index}">✕</button>
                </div>
                <div class="gas-row" style="flex-wrap:wrap;gap:6px">
                    <div style="flex:1">
                        <label style="font-size:10px;color:#9aa0a6">位置</label>
                        <select class="gas-select" data-char="position" style="width:100%">
                            ${positions.map(p => `<option value="${p.id}" ${char.position === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:1">
                        <label style="font-size:10px;color:#9aa0a6">表情</label>
                        <select class="gas-select" data-char="emotion" style="width:100%">
                            ${emotions.map(e => `<option value="${e.id}" ${char.emotion === e.id ? 'selected' : ''}>${e.label}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:0 0 auto">
                        <label style="font-size:10px;color:#9aa0a6">显示</label>
                        <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
                            <input type="checkbox" data-char="visible" ${char.visible !== false ? 'checked' : ''}>
                        </label>
                    </div>
                </div>
            `;
            
            // Event listeners
            charCard.querySelectorAll('[data-char]').forEach(el => {
                el.addEventListener('change', () => {
                    const key = el.dataset.char;
                    let value = el.type === 'checkbox' ? el.checked : el.value;
                    if (key === 'visible') {
                        char.visible = value;
                    } else {
                        char[key] = value;
                    }
                    persist();
                });
            });
            
            charCard.querySelector('[data-del-char]').onclick = () => {
                characters.splice(index, 1);
                persist();
                this.renderCharacterEditor(characters, containerId);
            };
            
            container.appendChild(charCard);
        });
    },
    
    // Add new character
    addCharacter(characters, containerId) {
        characters.push({
            id: 'char_' + Date.now().toString(36),
            name: '新角色',
            position: 'center',
            emotion: 'normal',
            visible: true,
            expression: ''
        });
        persist();
        this.renderCharacterEditor(characters, containerId);
    }
};

// ===== Audio Binding Module =====
const AudioBindingModule = {
    // Audio binding types
    audioTypes: {
        bgm: { label: '🎵 背景音乐', icon: '🎵' },
        ambient: { label: '🌿 环境音', icon: '🌿' },
        sfx: { label: '🔊 音效', icon: '🔊' },
        voice: { label: '🗣️ 语音', icon: '🗣️' }
    },
    
    // Fade presets
    fadePresets: [
        { label: '无', value: 0 },
        { label: '快速 0.5s', value: 0.5 },
        { label: '标准 1s', value: 1 },
        { label: '缓慢 2s', value: 2 },
        { label: '渐变 3s', value: 3 }
    ],
    
    // Initialize audio binding for shot/scene
    initShotAudio(shot) {
        if (!shot.audio) {
            shot.audio = {
                bgm: { id: '', volume: 80, fadeIn: 0, fadeOut: 0, loop: true },
                ambient: { id: '', volume: 60, fadeIn: 0 },
                sfx: [],
                voice: { id: '', volume: 100 }
            };
        }
        return shot.audio;
    },
    
    // Initialize scene audio (for scene-level binding)
    initSceneAudio(scene) {
        if (!scene.audio) {
            scene.audio = {
                bgm: { id: '', volume: 80, fadeIn: 1, fadeOut: 1, loop: true },
                ambient: { id: '', volume: 60, fadeIn: 0 },
                onEnter: null,
                onExit: null
            };
        }
        return scene.audio;
    },
    
    // Render audio binding editor
    renderAudioEditor(audio, type, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        const audioLibrary = getAudioLibrary();
        const sfxItems = audioLibrary.filter(i => i.type === 'sfx');
        const bgmItems = audioLibrary.filter(i => i.type === 'bgm');
        
        if (type === 'bgm') {
            container.innerHTML = `
                <div class="gas-row" style="flex-wrap:wrap;gap:8px;align-items:flex-end">
                    <div style="flex:2">
                        <label style="font-size:10px;color:#9aa0a6">BGM</label>
                        <select class="gas-select" id="audio-bgm-select" style="width:100%">
                            <option value="">（无）</option>
                            ${bgmItems.map(i => `<option value="${i.id}">${i.name || i.id}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:1">
                        <label style="font-size:10px;color:#9aa0a6">音量</label>
                        <input type="range" id="audio-bgm-vol" min="0" max="100" value="${audio.bgm?.volume || 80}" style="width:100%">
                    </div>
                    <div style="flex:0 0 auto">
                        <label style="font-size:10px;color:#9aa0a6">淡入</label>
                        <select class="gas-select" id="audio-bgm-fadein" style="width:80px">
                            ${this.fadePresets.map(f => `<option value="${f.value}" ${(audio.bgm?.fadeIn || 0) === f.value ? 'selected' : ''}>${f.label}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:0 0 auto">
                        <label style="font-size:10px;color:#9aa0a6">淡出</label>
                        <select class="gas-select" id="audio-bgm-fadeout" style="width:80px">
                            ${this.fadePresets.map(f => `<option value="${f.value}" ${(audio.bgm?.fadeOut || 0) === f.value ? 'selected' : ''}>${f.label}</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:0 0 auto">
                        <label style="font-size:10px;color:#9aa0a6;display:flex;align-items:center;gap:4px">
                            <input type="checkbox" id="audio-bgm-loop" ${audio.bgm?.loop !== false ? 'checked' : ''}>循环
                        </label>
                    </div>
                </div>
            `;
            
            // Set initial value
            if (audio.bgm?.id) {
                container.querySelector('#audio-bgm-select').value = audio.bgm.id;
            }
            
            // Event listeners
            container.querySelector('#audio-bgm-select')?.addEventListener('change', (e) => {
                audio.bgm = audio.bgm || {};
                audio.bgm.id = e.target.value;
                persist();
            });
            container.querySelector('#audio-bgm-vol')?.addEventListener('input', (e) => {
                audio.bgm = audio.bgm || {};
                audio.bgm.volume = parseInt(e.target.value);
                persist();
            });
            container.querySelector('#audio-bgm-fadein')?.addEventListener('change', (e) => {
                audio.bgm = audio.bgm || {};
                audio.bgm.fadeIn = parseFloat(e.target.value);
                persist();
            });
            container.querySelector('#audio-bgm-fadeout')?.addEventListener('change', (e) => {
                audio.bgm = audio.bgm || {};
                audio.bgm.fadeOut = parseFloat(e.target.value);
                persist();
            });
            container.querySelector('#audio-bgm-loop')?.addEventListener('change', (e) => {
                audio.bgm = audio.bgm || {};
                audio.bgm.loop = e.target.checked;
                persist();
            });
        }
    },
    
    // Generate Godot audio script for scene
    generateGodotAudioScript(scene, audio) {
        let script = '';
        
        if (audio.bgm?.id) {
            script += `
func play_scene_bgm():
    if has_node("BGMPlayer"):
        $BGMPlayer.stream = load("${audio.bgm.id}")
        $BGMPlayer.volume_db = ${Math.log10((audio.bgm.volume || 80) / 100) * 20}
        $BGMPlayer.stream.loop = ${audio.bgm.loop !== false}
        $BGMPlayer.play()
`;
        }
        
        if (audio.ambient?.id) {
            script += `
func play_scene_ambient():
    if has_node("AmbientPlayer"):
        $AmbientPlayer.stream = load("${audio.ambient.id}")
        $AmbientPlayer.volume_db = ${Math.log10((audio.ambient.volume || 60) / 100) * 20}
        $AmbientPlayer.play()
`;
        }
        
        return script;
    }
};

// ===== Branch Story Tree Module =====
const BranchTreeModule = {
    nodes: [],
    connections: [],
    canvas: null,
    ctx: null,
    selectedNode: null,
    dragNode: null,
    dragOffset: { x: 0, y: 0 },
    
    // Initialize branch tree
    init(containerId, storyData) {
        this.canvas = document.getElementById(containerId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Convert story data to nodes
        this.nodes = [];
        this.connections = [];
        
        if (storyData?.chapters) {
            storyData.chapters.forEach((ch, chIdx) => {
                if (ch.scenes) {
                    ch.scenes.forEach((sc, scIdx) => {
                        if (sc.shots) {
                            sc.shots.forEach((shot, shotIdx) => {
                                this.nodes.push({
                                    id: shot.id || `node_${chIdx}_${scIdx}_${shotIdx}`,
                                    label: shot.speaker || '旁白',
                                    text: (shot.text || '').slice(0, 20),
                                    type: 'shot',
                                    chapterIdx: chIdx,
                                    sceneIdx: scIdx,
                                    shotIdx: shotIdx,
                                    x: 100 + shotIdx * 150,
                                    y: 100 + chIdx * 200,
                                    choices: shot.choices || []
                                });
                            });
                        }
                    });
                }
            });
        }
        
        // Draw
        this.draw();
        
        // Event listeners
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        window.addEventListener('resize', () => this.resize());
    },
    
    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth || 800;
        this.canvas.height = parent.clientHeight || 400;
        this.draw();
    },
    
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Clear
        ctx.fillStyle = '#1a1e20';
        ctx.fillRect(0, 0, w, h);
        
        // Draw grid
        ctx.strokeStyle = '#2a2e30';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        
        // Draw connections
        this.connections.forEach(conn => {
            const from = this.nodes.find(n => n.id === conn.from);
            const to = this.nodes.find(n => n.id === conn.to);
            if (from && to) {
                ctx.strokeStyle = conn.color || '#e8a33d';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y + 20);
                ctx.lineTo(to.x, to.y - 20);
                ctx.stroke();
                
                // Arrow
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                ctx.beginPath();
                ctx.moveTo(to.x, to.y - 20);
                ctx.lineTo(to.x - 10 * Math.cos(angle - 0.5), to.y - 20 - 10 * Math.sin(angle - 0.5));
                ctx.moveTo(to.x, to.y - 20);
                ctx.lineTo(to.x - 10 * Math.cos(angle + 0.5), to.y - 20 - 10 * Math.sin(angle + 0.5));
                ctx.stroke();
            }
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            const isSelected = this.selectedNode === node.id;
            
            // Node body
            ctx.fillStyle = isSelected ? '#e8a33d' : (node.type === 'shot' ? '#2a2119' : '#38302a');
            ctx.strokeStyle = isSelected ? '#f5cf6b' : '#594c39';
            ctx.lineWidth = isSelected ? 3 : 2;
            
            const w = 120;
            const h = 40;
            
            ctx.beginPath();
            ctx.roundRect(node.x - w/2, node.y - h/2, w, h, 6);
            ctx.fill();
            ctx.stroke();
            
            // Node text
            ctx.fillStyle = isSelected ? '#1a1408' : '#efe6d0';
            ctx.font = '11px JetBrains Mono, Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label.slice(0, 12), node.x, node.y - 6);
            ctx.font = '9px JetBrains Mono, Consolas, monospace';
            ctx.fillStyle = isSelected ? '#3a2f22' : '#9aa0a6';
            ctx.fillText(node.text || '', node.x, node.y + 8);
            
            // Choice indicator
            if (node.choices && node.choices.length > 0) {
                ctx.fillStyle = '#e8a33d';
                ctx.beginPath();
                ctx.arc(node.x + w/2 - 8, node.y - h/2 + 8, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1a1408';
                ctx.font = '10px sans-serif';
                ctx.fillText(node.choices.length, node.x + w/2 - 8, node.y - h/2 + 9);
            }
        });
    },
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },
    
    findNodeAt(pos) {
        return this.nodes.find(node => {
            const dx = pos.x - node.x;
            const dy = pos.y - node.y;
            return Math.abs(dx) < 60 && Math.abs(dy) < 20;
        });
    },
    
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const node = this.findNodeAt(pos);
        
        if (node) {
            this.selectedNode = node.id;
            this.dragNode = node;
            this.dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
        } else {
            this.selectedNode = null;
        }
        this.draw();
    },
    
    onMouseMove(e) {
        if (this.dragNode) {
            const pos = this.getMousePos(e);
            this.dragNode.x = pos.x - this.dragOffset.x;
            this.dragNode.y = pos.y - this.dragOffset.y;
            this.draw();
        }
    },
    
    onMouseUp() {
        this.dragNode = null;
    },
    
    onDoubleClick(e) {
        const pos = this.getMousePos(e);
        const node = this.findNodeAt(pos);
        
        if (node) {
            // Select in story editor
            sel = {
                c: node.chapterIdx,
                s: node.sceneIdx,
                t: node.shotIdx
            };
            renderAll();
        }
    },
    
    addNode(type, x, y) {
        const node = {
            id: `node_${Date.now().toString(36)}`,
            label: type === 'shot' ? '新分镜' : '分支',
            text: '',
            type: type,
            x: x,
            y: y,
            choices: []
        };
        this.nodes.push(node);
        this.draw();
        return node;
    },
    
    deleteNode(nodeId) {
        this.nodes = this.nodes.filter(n => n.id !== nodeId);
        this.connections = this.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
        if (this.selectedNode === nodeId) {
            this.selectedNode = null;
        }
        this.draw();
    },
    
    addConnection(fromId, toId) {
        this.connections.push({ from: fromId, to: toId });
        this.draw();
    }
};

// ===== TTS Module =====
const TTSModule = {
    voices: [],
    isSpeaking: false,
    
    // Initialize TTS
    async init() {
        if ('speechSynthesis' in window) {
            return new Promise((resolve) => {
                speechSynthesis.onvoiceschanged = () => {
                    this.voices = speechSynthesis.getVoices();
                    resolve(this.voices);
                };
                // Fallback
                setTimeout(() => {
                    this.voices = speechSynthesis.getVoices();
                    resolve(this.voices);
                }, 100);
            });
        }
        return [];
    },
    
    // Get available voices
    getVoices() {
        return this.voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('en'));
    },
    
    // Speak text
    async speak(text, options = {}) {
        if (!('speechSynthesis' in window)) {
            console.warn('TTS not supported');
            return;
        }
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (options.voice) {
            const voice = this.voices.find(v => v.name === options.voice);
            if (voice) utterance.voice = voice;
        }
        
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        
        return new Promise((resolve, reject) => {
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            utterance.onerror = (e) => {
                this.isSpeaking = false;
                reject(e);
            };
            
            this.isSpeaking = true;
            speechSynthesis.speak(utterance);
        });
    },
    
    // Stop speaking
    stop() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
        }
    },
    
    // Preview voice
    async previewVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            await this.speak('你好，这是一段语音预览。', { voice: voiceName });
        }
    },
    
    // Generate voice for dialogue
    async generateVoiceForDialogue(text, options = {}) {
        // Use Web Speech API as fallback
        if (options.useWebTTS !== false) {
            return this.speak(text, options);
        }
        
        // Placeholder for external TTS API
        console.log('TTS generation requested:', { text, options });
        return null;
    }
};

// ===== Progress Bar Enhancement =====
const ProgressEnhancer = {
    // Estimate remaining time
    estimateRemaining(completed, total, elapsedMs) {
        if (completed === 0) return null;
        const avgTimePerItem = elapsedMs / completed;
        const remaining = total - completed;
        return Math.round(avgTimePerItem * remaining / 1000);
    },
    
    // Format time
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} 秒`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${mins} 分 ${secs} 秒`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours} 小时 ${mins} 分`;
        }
    },
    
    // Create enhanced progress bar
    createProgressBar(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            background: var(--panel2, #38302a);
            border: 2px solid var(--border, #594c39);
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = 'font-size:12px;color:var(--text,#efe6d0);margin-bottom:8px';
        title.textContent = options.title || '处理中...';
        
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            background: var(--inputb, #201812);
            border-radius: 4px;
            height: 12px;
            overflow: hidden;
            margin-bottom: 6px;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, var(--accent,#e8a33d), var(--accent2,#f5cf6b));
            transition: width 0.3s ease;
            width: 0%;
        `;
        
        const stats = document.createElement('div');
        stats.style.cssText = 'font-size:11px;color:var(--muted,#9aa0a6);display:flex;justify-content:space-between';
        
        const progressText = document.createElement('span');
        progressText.textContent = '0/0';
        
        const percentText = document.createElement('span');
        percentText.textContent = '0%';
        
        const timeText = document.createElement('span');
        timeText.textContent = '预计剩余: --';
        
        stats.appendChild(progressText);
        stats.appendChild(percentText);
        stats.appendChild(timeText);
        
        progressContainer.appendChild(progressFill);
        progressBar.appendChild(title);
        progressBar.appendChild(progressContainer);
        progressBar.appendChild(stats);
        
        container.appendChild(progressBar);
        
        return {
            element: progressBar,
            title,
            progressFill,
            progressText,
            percentText,
            timeText,
            startTime: Date.now(),
            completed: 0,
            total: options.total || 100,
            
            update(completed, message) {
                this.completed = completed;
                const percent = Math.round((completed / this.total) * 100);
                const elapsed = Date.now() - this.startTime;
                const remaining = ProgressEnhancer.estimateRemaining(completed, this.total, elapsed);
                
                this.progressFill.style.width = percent + '%';
                this.progressText.textContent = `${completed}/${this.total}`;
                this.percentText.textContent = percent + '%';
                
                if (remaining !== null) {
                    this.timeText.textContent = `预计剩余: ${ProgressEnhancer.formatTime(remaining)}`;
                }
                
                if (message) {
                    this.title.textContent = message;
                }
            },
            
            complete(message) {
                this.update(this.total, message || '完成！');
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                    setTimeout(() => progressBar.remove(), 300);
                }, 1500);
            }
        };
    }
};

// ===== Project Management Module =====
const ProjectManager = {
    LS_KEY: 'dsh-game-art-studio:projects',
    
    // Get all projects
    getProjects() {
        try {
            return JSON.parse(localStorage.getItem(this.LS_KEY) || '{}');
        } catch {
            return {};
        }
    },
    
    // Save projects
    saveProjects(projects) {
        localStorage.setItem(this.LS_KEY, JSON.stringify(projects));
    },
    
    // Create new project
    createProject(name) {
        const projects = this.getProjects();
        const id = 'proj_' + Date.now().toString(36);
        
        projects[id] = {
            id,
            name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            assets: [],
            stories: [],
            settings: {}
        };
        
        this.saveProjects(projects);
        return projects[id];
    },
    
    // Delete project
    deleteProject(id) {
        const projects = this.getProjects();
        delete projects[id];
        this.saveProjects(projects);
    },
    
    // Export project as JSON
    exportProject(id) {
        const projects = this.getProjects();
        const project = projects[id];
        if (!project) return null;
        
        const data = {
            project: project,
            assets: getHistory(),
            stories: loadStories(),
            audioLibrary: getAudioLibrary(),
            exportedAt: new Date().toISOString()
        };
        
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    },
    
    // Import project from JSON
    async importProject(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.project?.id) {
                throw new Error('无效的项目文件');
            }
            
            const projects = this.getProjects();
            const newId = 'proj_' + Date.now().toString(36);
            
            data.project.id = newId;
            data.project.name = data.project.name + ' (导入)';
            data.project.importedAt = Date.now();
            
            projects[newId] = data.project;
            this.saveProjects(projects);
            
            return data.project;
        } catch (e) {
            throw new Error('导入失败: ' + e.message);
        }
    },
    
    // Render project list
    renderProjectList(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const projects = this.getProjects();
        container.innerHTML = '';
        
        if (Object.keys(projects).length === 0) {
            container.innerHTML = '<div class="gas-note">暂无项目，点击「新建项目」开始</div>';
            return;
        }
        
        Object.values(projects).forEach(proj => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                border-bottom: 1px solid var(--border, #594c39);
                cursor: pointer;
            `;
            row.innerHTML = `
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${proj.name}</span>
                <span style="font-size:10px;color:var(--muted,#9aa0a6)">${new Date(proj.updatedAt).toLocaleDateString()}</span>
                <button class="gas-btn ghost" style="padding:2px 6px;font-size:10px" data-export="${proj.id}">📦</button>
                <button class="gas-btn ghost" style="padding:2px 6px;font-size:10px;background:#3a1a1a" data-del="${proj.id}">🗑</button>
            `;
            
            row.querySelector('[data-export]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const blob = this.exportProject(proj.id);
                if (blob) {
                    downloadBlob(blob, `${proj.name}.json`);
                }
            });
            
            row.querySelector('[data-del]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定删除项目「${proj.name}」？`)) {
                    this.deleteProject(proj.id);
                    this.renderProjectList(containerId, options);
                }
            });
            
            row.addEventListener('click', () => {
                options.onSelect?.(proj);
            });
            
            container.appendChild(row);
        });
    }
};

// Helper function
function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export for global use
if (typeof window !== 'undefined') {
    window.MultiCharacterModule = MultiCharacterModule;
    window.AudioBindingModule = AudioBindingModule;
    window.BranchTreeModule = BranchTreeModule;
    window.TTSModule = TTSModule;
    window.ProgressEnhancer = ProgressEnhancer;
    window.ProjectManager = ProjectManager;
}
