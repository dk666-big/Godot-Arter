/**
 * Style Transfer Module for Godot-Arter v2.1
 * 图片风格迁移 - 油画/水彩/像素等风格转换
 */

const StyleTransferModule = {
    // Available styles
    styles: {
        pixel: {
            name: '🎮 像素化',
            icon: '🎮',
            method: 'pixelate',
            params: { size: 4 }
        },
        oil: {
            name: '🖼️ 油画',
            icon: '🖼️',
            method: 'oil',
            params: { levels: 6, intensity: 1.5 }
        },
        watercolor: {
            name: '🎨 水彩',
            icon: '🎨',
            method: 'watercolor',
            params: { softness: 0.8 }
        },
        sketch: {
            name: '✏️ 素描',
            icon: '✏️',
            method: 'sketch',
            params: { threshold: 30 }
        },
        neon: {
            name: '💜 霓虹',
            icon: '💜',
            method: 'neon',
            params: { glow: 2, threshold: 50 }
        },
        comic: {
            name: '📚 漫画',
            icon: '📚',
            method: 'comic',
            params: { edgeStrength: 1.5 }
        },
        glitch: {
            name: '🔴 故障',
            icon: '🔴',
            method: 'glitch',
            params: { intensity: 0.3 }
        },
        vaporwave: {
            name: '🌴 蒸汽波',
            icon: '🌴',
            method: 'vaporwave',
            params: { hueShift: 0.5 }
        }
    },
    
    // Apply pixelate effect
    pixelate(imageData, size = 4) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Create output data
        const output = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                // Get average color in block
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                
                for (let dy = 0; dy < size && y + dy < height; dy++) {
                    for (let dx = 0; dx < size && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        a += data[idx + 3];
                        count++;
                    }
                }
                
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                a = Math.round(a / count);
                
                // Fill block with average
                for (let dy = 0; dy < size && y + dy < height; dy++) {
                    for (let dx = 0; dx < size && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        output[idx] = r;
                        output[idx + 1] = g;
                        output[idx + 2] = b;
                        output[idx + 3] = a;
                    }
                }
            }
        }
        
        return new ImageData(output, width, height);
    },
    
    // Apply oil painting effect (simplified)
    oilPainting(imageData, levels = 6, intensity = 1.5) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data.length);
        
        const radius = 3;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Build histogram for this neighborhood
                const buckets = Array(levels).fill(0).map(() => ({ r: 0, g: 0, b: 0, a: 0, count: 0 }));
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = Math.max(0, Math.min(width - 1, x + dx));
                        const ny = Math.max(0, Math.min(height - 1, y + dy));
                        const idx = (ny * width + nx) * 4;
                        
                        // Calculate intensity level
                        const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        const level = Math.min(levels - 1, Math.floor((intensity / 255) * levels));
                        
                        buckets[level].r += data[idx];
                        buckets[level].g += data[idx + 1];
                        buckets[level].b += data[idx + 2];
                        buckets[level].a += data[idx + 3];
                        buckets[level].count++;
                    }
                }
                
                // Find dominant bucket
                let maxCount = 0, dominantIdx = 0;
                buckets.forEach((bucket, idx) => {
                    if (bucket.count > maxCount) {
                        maxCount = bucket.count;
                        dominantIdx = idx;
                    }
                });
                
                const bucket = buckets[dominantIdx];
                const outIdx = (y * width + x) * 4;
                
                output[outIdx] = Math.round(bucket.r / bucket.count);
                output[outIdx + 1] = Math.round(bucket.g / bucket.count);
                output[outIdx + 2] = Math.round(bucket.b / bucket.count);
                output[outIdx + 3] = Math.round(bucket.a / bucket.count);
            }
        }
        
        return new ImageData(output, width, height);
    },
    
    // Apply sketch effect
    sketchEffect(imageData, threshold = 30) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data.length);
        
        // Convert to grayscale first
        const gray = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            gray[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
        }
        
        // Sobel edge detection
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Sobel kernels
                const gx = 
                    -gray[(y-1)*width+(x-1)] + gray[(y-1)*width+(x+1)] +
                    -2*gray[y*width+(x-1)] + 2*gray[y*width+(x+1)] +
                    -gray[(y+1)*width+(x-1)] + gray[(y+1)*width+(x+1)];
                
                const gy = 
                    -gray[(y-1)*width+(x-1)] - 2*gray[(y-1)*width+x] - gray[(y-1)*width+(x+1)] +
                    gray[(y+1)*width+(x-1)] + 2*gray[(y+1)*width+x] + gray[(y+1)*width+(x+1)];
                
                const edge = Math.sqrt(gx*gx + gy*gy);
                
                // Apply threshold
                const value = edge > threshold ? 255 : 0;
                
                output[idx] = value;
                output[idx + 1] = value;
                output[idx + 2] = value;
                output[idx + 3] = 255;
            }
        }
        
        return new ImageData(output, width, height);
    },
    
    // Apply neon glow effect
    neonEffect(imageData, glow = 2, threshold = 50) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data.length);
        
        // First pass: edge detection
        const edges = new Uint8Array(width * height);
        const gray = new Uint8Array(width * height);
        
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            gray[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
        }
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                
                const gx = -gray[(y-1)*width+(x-1)] + gray[(y-1)*width+(x+1)] +
                           -2*gray[y*width+(x-1)] + 2*gray[y*width+(x+1)] +
                           -gray[(y+1)*width+(x-1)] + gray[(y+1)*width+(x+1)];
                
                const gy = -gray[(y-1)*width+(x-1)] - 2*gray[(y-1)*width+x] - gray[(y-1)*width+(x+1)] +
                           gray[(y+1)*width+(x-1)] + 2*gray[(y+1)*width+x] + gray[(y+1)*width+(x+1)];
                
                edges[i] = Math.sqrt(gx*gx + gy*gy) > threshold ? 255 : 0;
            }
        }
        
        // Second pass: apply neon colors
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const i = y * width + x;
                
                if (edges[i]) {
                    // Neon colors based on original hue
                    const h = (data[idx] + data[idx + 1] + data[idx + 2]) % 360;
                    const [r, g, b] = hsvToRgb((h + 180) % 360, 1, 1);
                    
                    // Glow effect
                    for (let dy = -glow; dy <= glow; dy++) {
                        for (let dx = -glow; dx <= glow; dx++) {
                            const nx = x + dx, ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const nIdx = (ny * width + nx) * 4;
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                const alpha = Math.max(0, 1 - dist / (glow + 1)) * 0.3;
                                
                                output[nIdx] = Math.min(255, output[nIdx] + r * alpha);
                                output[nIdx + 1] = Math.min(255, output[nIdx + 1] + g * alpha);
                                output[nIdx + 2] = Math.min(255, output[nIdx + 2] + b * alpha);
                                output[nIdx + 3] = 255;
                            }
                        }
                    }
                } else {
                    // Darken non-edge pixels
                    output[idx] = data[idx] * 0.1;
                    output[idx + 1] = data[idx + 1] * 0.1;
                    output[idx + 2] = data[idx + 2] * 0.1;
                    output[idx + 3] = 255;
                }
            }
        }
        
        return new ImageData(output, width, height);
    },
    
    // Apply glitch effect
    glitchEffect(imageData, intensity = 0.3) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const numGlitches = Math.floor(intensity * 10);
        
        for (let i = 0; i < numGlitches; i++) {
            const y = Math.floor(Math.random() * height);
            const offset = Math.floor((Math.random() - 0.5) * width * intensity * 2);
            
            for (let x = 0; x < width; x++) {
                const srcX = Math.max(0, Math.min(width - 1, x + offset));
                const srcIdx = (y * width + srcX) * 4;
                const dstIdx = (y * width + x) * 4;
                
                output[dstIdx] = data[srcIdx];
                output[dstIdx + 1] = data[srcIdx + 1];
                output[dstIdx + 2] = data[srcIdx + 2];
            }
        }
        
        // RGB shift
        const shift = Math.floor(intensity * 10);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const rIdx = (y * width + Math.min(width - 1, x + shift)) * 4;
                const bIdx = (y * width + Math.max(0, x - shift)) * 4;
                
                output[idx] = data[rIdx];
                output[idx + 2] = data[bIdx + 2];
            }
        }
        
        return new ImageData(output, width, height);
    },
    
    // Apply vaporwave effect
    vaporwaveEffect(imageData, hueShift = 0.5) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data.length);
        
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            
            let [h, s, v] = rgbToHsv(data[idx], data[idx + 1], data[idx + 2]);
            
            // Shift hue towards pink/purple
            h = (h + hueShift) % 1;
            
            // Increase saturation
            s = Math.min(1, s * 1.3);
            
            // Slight blue tint
            v = v * 0.9 + 0.1;
            
            const [r, g, b] = hsvToRgb(h * 360, s, v);
            
            output[idx] = r;
            output[idx + 1] = g;
            output[idx + 2] = b;
            output[idx + 3] = data[idx + 3];
        }
        
        return new ImageData(output, width, height);
    },
    
    // Main apply function
    applyStyle(sourceImageData, styleId, params = {}) {
        const style = this.styles[styleId];
        if (!style) return sourceImageData;
        
        switch (style.method) {
            case 'pixelate':
                return this.pixelate(sourceImageData, params.size || style.params.size);
            case 'oil':
                return this.oilPainting(sourceImageData, params.levels || style.params.levels, params.intensity || style.params.intensity);
            case 'sketch':
                return this.sketchEffect(sourceImageData, params.threshold || style.params.threshold);
            case 'neon':
                return this.neonEffect(sourceImageData, params.glow || style.params.glow, params.threshold || style.params.threshold);
            case 'glitch':
                return this.glitchEffect(sourceImageData, params.intensity || style.params.intensity);
            case 'vaporwave':
                return this.vaporwaveEffect(sourceImageData, params.hueShift || style.params.hueShift);
            default:
                return sourceImageData;
        }
    }
};

// Helper: RGB to HSV
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return [h, s, v];
}

// Helper: HSV to RGB
function hsvToRgb(h, s, v) {
    h /= 360;
    
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Export
if (typeof window !== 'undefined') {
    window.StyleTransferModule = StyleTransferModule;
}
