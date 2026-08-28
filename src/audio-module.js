/**
 * Audio Module for Godot-Arter v2.0
 * 音效制作模块 - Web Audio合成、音乐生成、音频编辑、Godot导出
 */

// 音效预设类型
const SFX_CATEGORIES = {
    combat: { label: '⚔️ 战斗', presets: ['sword_hit', 'arrow_fire', 'explosion', 'fire', 'hit'] },
    pickup: { label: '💰 拾取', presets: ['coin_pickup', 'powerup', 'level_up'] },
    movement: { label: '👣 移动', presets: ['footstep', 'jump', 'wind'] },
    ui: { label: '🖱️ 界面', presets: ['button_click', 'select', 'cancel', 'open', 'close'] },
    magic: { label: '✨ 魔法', presets: ['magic_cast', 'powerup'] },
    ambient: { label: '🌧️ 环境', presets: ['rain', 'wind'] },
    other: { label: '📦 其他', presets: ['death', 'hit', 'select', 'cancel'] }
};

// 音乐类型
const MUSIC_TYPES = {
    menu: { label: '🏠 主菜单', icon: '🏠' },
    battle: { label: '⚔️ 战斗', icon: '⚔️' },
    exploration: { label: '🗺️ 探索', icon: '🧭' },
    shop: { label: '💎 商店', icon: '💎' },
    boss: { label: '👹 BOSS', icon: '👹' },
    victory: { label: '🏆 胜利', icon: '🏆' },
    defeat: { label: '💔 失败', icon: '💔' }
};

const AudioModule = {
    audioContext: null,
    currentAudioBuffer: null,
    currentSource: null,
    gainNode: null,
    isPlaying: false,
    isLooping: false,
    library: [],
    currentAudioUrl: null,
    waveformData: null,
    analyser: null,
    sfxCategories: SFX_CATEGORIES,
    musicTypes: MUSIC_TYPES,
    currentCategory: 'combat',
    currentMusicType: 'menu',
    playbackStartTime: 0,
    playbackOffset: 0
};

function initAudioContext() {
    if (!AudioModule.audioContext) {
        AudioModule.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (AudioModule.audioContext.state === 'suspended') {
        AudioModule.audioContext.resume();
    }
    return AudioModule.audioContext;
}

// ===== Sound Effect Synthesis =====
const SFX_PRESETS = {
    sword_hit: { type: 'impact', baseFreq: 800, decay: 0.15, noise: 0.3 },
    arrow_fire: { type: 'whoosh', baseFreq: 400, decay: 0.3, noise: 0.7 },
    coin_pickup: { type: 'chime', baseFreq: 1200, decay: 0.4, noise: 0.1 },
    button_click: { type: 'click', baseFreq: 600, decay: 0.05, noise: 0.2 },
    magic_cast: { type: 'magic', baseFreq: 400, decay: 0.6, noise: 0.4 },
    footstep: { type: 'impact', baseFreq: 100, decay: 0.1, noise: 0.5 },
    explosion: { type: 'explosion', baseFreq: 80, decay: 0.8, noise: 0.9 },
    level_up: { type: 'fanfare', baseFreq: 523, decay: 0.8, noise: 0.1 },
    death: { type: 'descend', baseFreq: 400, decay: 1.0, noise: 0.3 },
    rain: { type: 'noise', baseFreq: 0, decay: 2.0, noise: 1.0 },
    wind: { type: 'noise', baseFreq: 0, decay: 2.0, noise: 1.0 },
    jump: { type: 'whoosh', baseFreq: 300, decay: 0.2, noise: 0.3 },
    hit: { type: 'impact', baseFreq: 150, decay: 0.1, noise: 0.6 },
    powerup: { type: 'fanfare', baseFreq: 440, decay: 0.5, noise: 0.1 },
    select: { type: 'click', baseFreq: 800, decay: 0.03, noise: 0.1 },
    cancel: { type: 'descend', baseFreq: 600, decay: 0.2, noise: 0.2 },
    fire: { type: 'explosion', baseFreq: 100, decay: 0.3, noise: 0.8 },
    open: { type: 'creak', baseFreq: 200, decay: 0.3, noise: 0.2 },
    close: { type: 'creak', baseFreq: 300, decay: 0.2, noise: 0.2 }
};

async function synthesizeSFX(preset, duration = 1.0, intensity = 70) {
    const ctx = initAudioContext();
    await ctx.resume();
    
    const presetData = SFX_PRESETS[preset] || SFX_PRESETS.sword_hit;
    const volume = intensity / 100;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const noiseGain = ctx.createGain();
    
    oscillator.type = presetData.type === 'noise' ? 'sine' : (presetData.type === 'explosion' ? 'sawtooth' : 'square');
    oscillator.frequency.setValueAtTime(presetData.baseFreq, ctx.currentTime);
    
    if (presetData.type === 'descend') {
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + presetData.decay);
    } else if (presetData.type === 'fanfare') {
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
    } else {
        oscillator.frequency.exponentialRampToValueAtTime(presetData.baseFreq * 0.5, ctx.currentTime + presetData.decay);
    }
    
    gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + presetData.decay);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (presetData.noise > 0.1) {
        const bufferSize = ctx.sampleRate * presetData.decay;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = presetData.type === 'explosion' ? 2000 : 500;
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseGain.gain.setValueAtTime(volume * presetData.noise * 0.3, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + presetData.decay);
        
        noiseSource.start(ctx.currentTime);
        noiseSource.stop(ctx.currentTime + presetData.decay);
    }
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + presetData.decay);
    
    return new Promise((resolve) => {
        setTimeout(() => resolve(), presetData.decay * 1000);
    });
}

// ===== Music Demo Synthesis =====
const MUSIC_PRESETS = {
    menu: { bpm: 90, notes: [262, 330, 392, 523], pattern: [0,0,1,1,2,2,3,3] },
    battle: { bpm: 140, notes: [196, 247, 294, 392], pattern: [0,0,1,1,2,2,3,3,2,2,1,1,0,0,3,3] },
    exploration: { bpm: 110, notes: [330, 392, 440, 523], pattern: [0,1,2,3,2,1,0,1] },
    shop: { bpm: 100, notes: [392, 440, 494, 523, 587], pattern: [0,1,2,3,4,4,3,2,1,0] },
    boss: { bpm: 160, notes: [165, 196, 220, 262], pattern: [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3] },
    victory: { bpm: 120, notes: [523, 659, 784, 1047], pattern: [0,1,2,3,3,2,1,0,0,2,3,3] },
    defeat: { bpm: 60, notes: [392, 349, 330, 262], pattern: [0,1,2,3,3,2,1,0] }
};

async function synthesizeMusicDemo(type = 'menu', duration = 8) {
    const ctx = initAudioContext();
    await ctx.resume();
    
    const preset = MUSIC_PRESETS[type] || MUSIC_PRESETS.menu;
    const interval = 60 / preset.bpm;
    const noteDuration = interval * 0.8;
    
    const oscillators = [];
    const gains = [];
    
    for (let i = 0; i < preset.pattern.length; i++) {
        const noteIndex = preset.pattern[i];
        const freq = preset.notes[noteIndex];
        const startTime = ctx.currentTime + i * interval;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.setValueAtTime(0.3, startTime + noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + noteDuration + 0.2);
        
        oscillators.push(osc);
        gains.push(gain);
    }
    
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration * 1000);
    });
}

// ===== Waveform Visualization =====
function drawWaveform(canvasId, color = '#e8a33d') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth || 400;
    const height = canvas.height = canvas.offsetHeight || 100;
    
    if (AudioModule.audioContext && AudioModule.currentAudioBuffer) {
        const data = AudioModule.currentAudioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;
        
        ctx.fillStyle = '#1a1e20';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < width; i++) {
            let min = 1.0, max = -1.0;
            for (let j = 0; j < step; j++) {
                const idx = i * step + j;
                if (idx < data.length) {
                    const datum = data[idx];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
            }
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
    }
}

// ===== Audio Playback Control =====
function playAudio(buffer, loop = false) {
    if (AudioModule.currentSource) {
        stopAudio();
    }
    
    const ctx = initAudioContext();
    AudioModule.currentSource = ctx.createBufferSource();
    AudioModule.currentSource.buffer = buffer;
    AudioModule.currentSource.loop = loop;
    
    AudioModule.gainNode = ctx.createGain();
    AudioModule.currentSource.connect(AudioModule.gainNode);
    AudioModule.gainNode.connect(ctx.destination);
    
    AudioModule.currentSource.start(0);
    AudioModule.playbackStartTime = ctx.currentTime;
    AudioModule.playbackOffset = 0;
    AudioModule.isPlaying = true;
    AudioModule.isLooping = loop;
    AudioModule.currentAudioBuffer = buffer;
    
    AudioModule.currentSource.onended = () => {
        if (!loop) {
            AudioModule.isPlaying = false;
        }
    };
}

function stopAudio() {
    if (AudioModule.currentSource) {
        try {
            AudioModule.currentSource.stop();
        } catch (e) {}
        AudioModule.currentSource = null;
    }
    AudioModule.isPlaying = false;
    AudioModule.isLooping = false;
}

function pauseAudio() {
    if (AudioModule.currentSource && AudioModule.isPlaying) {
        AudioModule.playbackOffset = AudioModule.audioContext.currentTime - AudioModule.playbackStartTime;
        stopAudio();
    }
}

function setVolume(volume) {
    if (AudioModule.gainNode) {
        AudioModule.gainNode.gain.value = Math.max(0, Math.min(1, volume / 100));
    }
}

// ===== Audio Export Functions =====
async function exportToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    
    const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(wavBuffer);
    
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channels[ch][i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
}

function downloadAudio(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== Audio Library Management =====
function getAudioLibrary() {
    try {
        const stored = localStorage.getItem('dsh-game-art-studio:audioLibrary');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveToAudioLibrary(item) {
    const library = getAudioLibrary();
    item.id = item.id || 'audio_' + Date.now().toString(36);
    item.createdAt = Date.now();
    library.push(item);
    localStorage.setItem('dsh-game-art-studio:audioLibrary', JSON.stringify(library));
    return item;
}

function removeFromAudioLibrary(id) {
    const library = getAudioLibrary().filter(item => item.id !== id);
    localStorage.setItem('dsh-game-art-studio:audioLibrary', JSON.stringify(library));
}

function clearAudioLibrary() {
    localStorage.removeItem('dsh-game-art-studio:audioLibrary');
}

// ===== Generate Godot Audio Registry =====
function generateGodotAudioRegistry(library) {
    const sfxMap = {};
    const bgmMap = {};
    
    library.forEach(item => {
        const key = item.category + '/' + item.name;
        if (item.type === 'sfx') {
            sfxMap[key] = item.godotPath || 'res://audio/sfx/' + item.category + '/' + item.name + '.wav';
        } else {
            bgmMap[item.name] = item.godotPath || 'res://audio/bgm/' + item.name + '.wav';
        }
    });
    
    return {
        sfx: sfxMap,
        bgm: bgmMap
    };
}

// ===== Audio Editing Functions =====
function applyFadeIn(buffer, fadeTime = 0.5) {
    const ctx = initAudioContext();
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const oldData = buffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        const fadeSamples = Math.floor(fadeTime * buffer.sampleRate);
        
        for (let i = 0; i < buffer.length; i++) {
            if (i < fadeSamples) {
                newData[i] = oldData[i] * (i / fadeSamples);
            } else {
                newData[i] = oldData[i];
            }
        }
    }
    
    return newBuffer;
}

function applyFadeOut(buffer, fadeTime = 0.5) {
    const ctx = initAudioContext();
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const oldData = buffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        const fadeSamples = Math.floor(fadeTime * buffer.sampleRate);
        const fadeStart = buffer.length - fadeSamples;
        
        for (let i = 0; i < buffer.length; i++) {
            if (i >= fadeStart) {
                const progress = (i - fadeStart) / fadeSamples;
                newData[i] = oldData[i] * (1 - progress);
            } else {
                newData[i] = oldData[i];
            }
        }
    }
    
    return newBuffer;
}

function trimAudio(buffer, startTime, endTime) {
    const ctx = initAudioContext();
    const startSample = Math.floor(startTime * buffer.sampleRate);
    const endSample = Math.floor(endTime * buffer.sampleRate);
    const newLength = endSample - startSample;
    
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);
    
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const oldData = buffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        
        for (let i = 0; i < newLength; i++) {
            newData[i] = oldData[startSample + i];
        }
    }
    
    return newBuffer;
}

// ===== Load Audio File =====
async function loadAudioFile(file) {
    const ctx = initAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

// ===== Record Microphone Input =====
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = initAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const dest = ctx.createMediaStreamDestination();
    source.connect(dest);
    
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            stream.getTracks().forEach(track => track.stop());
            resolve(audioBuffer);
        };
        mediaRecorder.start();
    });
}

// Export for global use
if (typeof window !== 'undefined') {
    window.AudioModule = AudioModule;
    window.initAudioContext = initAudioContext;
    window.synthesizeSFX = synthesizeSFX;
    window.synthesizeMusicDemo = synthesizeMusicDemo;
    window.drawWaveform = drawWaveform;
    window.playAudio = playAudio;
    window.stopAudio = stopAudio;
    window.pauseAudio = pauseAudio;
    window.setVolume = setVolume;
    window.exportToWav = exportToWav;
    window.downloadAudio = downloadAudio;
    window.getAudioLibrary = getAudioLibrary;
    window.saveToAudioLibrary = saveToAudioLibrary;
    window.removeFromAudioLibrary = removeFromAudioLibrary;
    window.clearAudioLibrary = clearAudioLibrary;
    window.generateGodotAudioRegistry = generateGodotAudioRegistry;
    window.applyFadeIn = applyFadeIn;
    window.applyFadeOut = applyFadeOut;
    window.trimAudio = trimAudio;
    window.loadAudioFile = loadAudioFile;
    window.startRecording = startRecording;
    window.SFX_PRESETS = SFX_PRESETS;
    window.MUSIC_PRESETS = MUSIC_PRESETS;
    window.SFX_CATEGORIES = SFX_CATEGORIES;
    window.MUSIC_TYPES = MUSIC_TYPES;
}
