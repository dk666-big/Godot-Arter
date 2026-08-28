/**
 * TTS Module for Godot-Arter v2.1
 * 语音合成模块 - Web Speech API / 外部 TTS API 支持
 */

const TTSModule = {
    // State
    voices: [],
    isInitialized: false,
    isSpeaking: false,
    currentUtterance: null,
    
    // Voice presets for different character types
    voicePresets: {
        narrator: { voice: null, rate: 0.9, pitch: 1.0, volume: 1.0, lang: 'zh-CN' },
        hero: { voice: null, rate: 1.0, pitch: 1.1, volume: 1.0, lang: 'zh-CN' },
        villain: { voice: null, rate: 0.8, pitch: 0.8, volume: 1.0, lang: 'zh-CN' },
        npc: { voice: null, rate: 0.95, pitch: 1.0, volume: 0.9, lang: 'zh-CN' },
        warrior: { voice: null, rate: 0.85, pitch: 0.9, volume: 1.0, lang: 'zh-CN' },
        mage: { voice: null, rate: 1.0, pitch: 1.2, volume: 0.9, lang: 'zh-CN' },
        child: { voice: null, rate: 1.1, pitch: 1.3, volume: 0.8, lang: 'zh-CN' },
        elder: { voice: null, rate: 0.8, pitch: 0.8, volume: 0.9, lang: 'zh-CN' }
    },
    
    // Initialize TTS
    async init() {
        if (!('speechSynthesis' in window)) {
            console.warn('Web Speech API not supported');
            return false;
        }
        
        return new Promise((resolve) => {
            // Load voices
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                this.isInitialized = true;
                
                // Match voices to presets
                this.matchVoicesToPresets();
                resolve(true);
            };
            
            // Chrome loads voices asynchronously
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
            
            // Timeout fallback
            setTimeout(() => {
                if (!this.isInitialized) {
                    loadVoices();
                }
            }, 1000);
        });
    },
    
    // Match available voices to presets
    matchVoicesToPresets() {
        const zhVoices = this.voices.filter(v => v.lang.startsWith('zh'));
        const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
        
        // Assign voices based on availability
        if (zhVoices.length > 0) {
            this.voicePresets.narrator.voice = zhVoices[0];
            this.voicePresets.hero.voice = zhVoices.find(v => v.name.includes('Female')) || zhVoices[0];
            this.voicePresets.villain.voice = zhVoices.find(v => v.name.includes('Male')) || zhVoices[0];
            this.voicePresets.npc.voice = zhVoices[Math.floor(zhVoices.length / 2)];
        }
        
        if (enVoices.length > 0) {
            this.voicePresets.warrior.voice = enVoices.find(v => v.name.includes('Male')) || enVoices[0];
            this.voicePresets.mage.voice = enVoices.find(v => v.name.includes('Female')) || enVoices[0];
        }
    },
    
    // Get available voices
    getAvailableVoices() {
        return this.voices.filter(v => 
            v.lang.startsWith('zh') || v.lang.startsWith('en')
        );
    },
    
    // Speak text with options
    async speak(text, options = {}) {
        if (!('speechSynthesis' in window)) {
            throw new Error('TTS not supported');
        }
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply voice settings
        if (options.voice) {
            utterance.voice = options.voice;
        } else if (options.preset) {
            const preset = this.voicePresets[options.preset];
            if (preset) {
                if (preset.voice) utterance.voice = preset.voice;
                utterance.rate = preset.rate;
                utterance.pitch = preset.pitch;
                utterance.volume = preset.volume;
            }
        }
        
        // Apply custom settings
        utterance.rate = options.rate || utterance.rate || 1;
        utterance.pitch = options.pitch || utterance.pitch || 1;
        utterance.volume = options.volume || utterance.volume || 1;
        utterance.lang = options.lang || utterance.lang || 'zh-CN';
        
        // Events
        utterance.onstart = () => {
            this.isSpeaking = true;
            options.onStart?.();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            options.onEnd?.();
        };
        
        utterance.onerror = (e) => {
            this.isSpeaking = false;
            options.onError?.(e);
        };
        
        utterance.onboundary = (e) => {
            options.onBoundary?.(e);
        };
        
        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
        
        return new Promise((resolve, reject) => {
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            utterance.onerror = (e) => {
                this.isSpeaking = false;
                reject(e);
            };
        });
    },
    
    // Stop speaking
    stop() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
        }
    },
    
    // Pause speaking
    pause() {
        if ('speechSynthesis' in window) {
            speechSynthesis.pause();
        }
    },
    
    // Resume speaking
    resume() {
        if ('speechSynthesis' in window) {
            speechSynthesis.resume();
        }
    },
    
    // Preview voice
    async previewVoice(preset) {
        const p = this.voicePresets[preset];
        if (!p) return;
        
        const texts = {
            narrator: '夜幕降临，烛火在风中摇曳...',
            hero: '我来守护这片土地！',
            villain: '哈哈哈，终于等到这一天了...',
            npc: '欢迎来到我们的村庄，旅行者。',
            warrior: '冲锋！为了荣耀！',
            mage: '魔法即是力量！',
            child: '妈妈，那边有什么？',
            elder: '年轻人，听我说...'
        };
        
        const text = texts[preset] || '语音预览测试';
        await this.speak(text, { preset });
    },
    
    // Generate speech for dialogue
    async generateDialogueSpeech(dialogue, options = {}) {
        // Clean dialogue text
        let text = dialogue.text || '';
        
        // Remove BBCode tags
        text = text.replace(/\[.*?\]/g, '');
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        if (!text) {
            return Promise.resolve();
        }
        
        // Determine preset based on speaker
        let preset = 'narrator';
        const speaker = (dialogue.speaker || '').toLowerCase();
        
        if (speaker.includes('旁白')) {
            preset = 'narrator';
        } else if (speaker.includes('英雄') || speaker.includes('主角')) {
            preset = 'hero';
        } else if (speaker.includes('坏人') || speaker.includes('Boss') || speaker.includes('魔王')) {
            preset = 'villain';
        } else if (speaker.includes('小孩') || speaker.includes('儿童')) {
            preset = 'child';
        } else if (speaker.includes('老人') || speaker.includes('长老')) {
            preset = 'elder';
        } else if (speaker.includes('法师') || speaker.includes('巫师')) {
            preset = 'mage';
        } else if (speaker.includes('战士') || speaker.includes('骑士')) {
            preset = 'warrior';
        } else if (speaker) {
            preset = 'npc';
        }
        
        return this.speak(text, {
            preset,
            ...options
        });
    },
    
    // Play dialogue sequence
    async playDialogueSequence(dialogues, options = {}) {
        const result = {
            completed: 0,
            total: dialogues.length
        };
        
        for (let i = 0; i < dialogues.length; i++) {
            const dialogue = dialogues[i];
            
            try {
                await this.generateDialogueSpeech(dialogue, {
                    onStart: () => {
                        options.onDialogueStart?.(i, dialogue);
                    },
                    onEnd: () => {
                        result.completed++;
                        options.onDialogueEnd?.(i, dialogue);
                    }
                });
                
                // Add pause between dialogues
                if (i < dialogues.length - 1 && !options.noPause) {
                    await this.delay(options.pauseDuration || 500);
                }
            } catch (e) {
                options.onError?.(e, i, dialogue);
            }
        }
        
        return result;
    },
    
    // Helper: delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Get speech rate range
    getRateRange() {
        return { min: 0.5, max: 2.0, default: 1.0 };
    },
    
    // Get pitch range
    getPitchRange() {
        return { min: 0.5, max: 2.0, default: 1.0 };
    }
};

// ===== TTS UI Helper =====
const TTSUI = {
    // Render TTS settings panel
    renderSettings(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const presets = Object.keys(TTSModule.voicePresets);
        const voices = TTSModule.getAvailableVoices();
        
        container.innerHTML = `
            <div class="gas-row" style="flex-wrap:wrap;gap:8px">
                <div style="flex:1;min-width:150px">
                    <label class="gas-label">语音预设</label>
                    <select class="gas-select" id="tts-preset" style="width:100%">
                        ${presets.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <div style="flex:1;min-width:150px">
                    <label class="gas-label">具体语音</label>
                    <select class="gas-select" id="tts-voice" style="width:100%">
                        <option value="">（默认）</option>
                        ${voices.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="gas-row" style="margin-top:8px;flex-wrap:wrap;gap:8px">
                <div style="flex:1">
                    <label class="gas-label">语速: <span id="tts-rate-val">1.0</span></label>
                    <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" style="width:100%">
                </div>
                <div style="flex:1">
                    <label class="gas-label">音调: <span id="tts-pitch-val">1.0</span></label>
                    <input type="range" id="tts-pitch" min="0.5" max="2" step="0.1" value="1" style="width:100%">
                </div>
                <div style="flex:1">
                    <label class="gas-label">音量: <span id="tts-vol-val">1.0</span></label>
                    <input type="range" id="tts-vol" min="0" max="1" step="0.1" value="1" style="width:100%">
                </div>
            </div>
            <div class="gas-row" style="margin-top:8px;gap:6px">
                <button class="gas-btn" id="tts-play">▶ 预览</button>
                <button class="gas-btn ghost" id="tts-stop">⏹ 停止</button>
                <button class="gas-btn ghost" id="tts-preview-preset">🎭 试听预设</button>
            </div>
        `;
        
        // Event listeners
        container.querySelector('#tts-rate')?.addEventListener('input', (e) => {
            container.querySelector('#tts-rate-val').textContent = parseFloat(e.target.value).toFixed(1);
        });
        
        container.querySelector('#tts-pitch')?.addEventListener('input', (e) => {
            container.querySelector('#tts-pitch-val').textContent = parseFloat(e.target.value).toFixed(1);
        });
        
        container.querySelector('#tts-vol')?.addEventListener('input', (e) => {
            container.querySelector('#tts-vol-val').textContent = parseFloat(e.target.value).toFixed(1);
        });
        
        container.querySelector('#tts-play')?.addEventListener('click', () => {
            const voice = voices.find(v => v.name === container.querySelector('#tts-voice').value);
            TTSModule.speak('这是一段语音预览测试', {
                voice: voice || undefined,
                rate: parseFloat(container.querySelector('#tts-rate').value),
                pitch: parseFloat(container.querySelector('#tts-pitch').value),
                volume: parseFloat(container.querySelector('#tts-vol').value)
            });
        });
        
        container.querySelector('#tts-stop')?.addEventListener('click', () => {
            TTSModule.stop();
        });
        
        container.querySelector('#tts-preview-preset')?.addEventListener('click', () => {
            const preset = container.querySelector('#tts-preset').value;
            TTSModule.previewVoice(preset);
        });
    }
};

// Export
if (typeof window !== 'undefined') {
    window.TTSModule = TTSModule;
    window.TTSUI = TTSUI;
}
