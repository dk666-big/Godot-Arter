/**
 * Batch Tools Module for Godot-Arter v2.1
 * 批量重命名 + 智能推荐
 */

const BatchTools = {
    // ===== Batch Rename =====
    
    // Rename patterns
    patterns: {
        prefix: { name: '添加前缀', template: '{prefix}{name}' },
        suffix: { name: '添加后缀', template: '{name}{suffix}' },
        replace: { name: '文本替换', template: '{name}' },
        sequence: { name: '序号命名', template: '{name}_{seq}' },
        case_upper: { name: '转为大写', template: '{name_upper}' },
        case_lower: { name: '转为小写', template: '{name_lower}' },
        case_title: { name: '首字母大写', template: '{name_title}' },
        date_prefix: { name: '日期前缀', template: '{date}_{name}' },
        type_prefix: { name: '类型前缀', template: '{type}_{name}' }
    },
    
    // Batch rename files
    batchRename(items, options = {}) {
        const { pattern, prefix, suffix, find, replace, startSeq, padding } = options;
        const results = [];
        
        items.forEach((item, index) => {
            let newName = item.name || item;
            const ext = this.getExtension(newName);
            const baseName = this.getBaseName(newName);
            
            switch (pattern) {
                case 'prefix':
                    newName = (prefix || '') + baseName + ext;
                    break;
                case 'suffix':
                    newName = baseName + (suffix || '') + ext;
                    break;
                case 'replace':
                    newName = baseName.replace(new RegExp(find || '', 'g'), replace || '') + ext;
                    break;
                case 'sequence':
                    const seq = String(startSeq + index).padStart(padding || 3, '0');
                    newName = baseName + '_' + seq + ext;
                    break;
                case 'case_upper':
                    newName = baseName.toUpperCase() + ext;
                    break;
                case 'case_lower':
                    newName = baseName.toLowerCase() + ext;
                    break;
                case 'case_title':
                    newName = this.toTitleCase(baseName) + ext;
                    break;
                case 'date_prefix':
                    const date = new Date().toISOString().slice(0, 10);
                    newName = date + '_' + baseName + ext;
                    break;
                case 'type_prefix':
                    newName = (item.type || 'item') + '_' + baseName + ext;
                    break;
                default:
                    newName = baseName + ext;
            }
            
            results.push({
                original: item.name || item,
                renamed: newName,
                id: item.id
            });
        });
        
        return results;
    },
    
    // Preview batch rename
    previewBatchRename(items, options = {}) {
        return this.batchRename(items, options);
    },
    
    // Apply batch rename
    applyBatchRename(items, options = {}) {
        const results = this.batchRename(items, options);
        // This would be called by the UI to actually rename files
        return results;
    },
    
    // Helper: get file extension
    getExtension(filename) {
        const idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.slice(idx) : '';
    },
    
    // Helper: get base name without extension
    getBaseName(filename) {
        const idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.slice(0, idx) : filename;
    },
    
    // Helper: title case
    toTitleCase(str) {
        return str.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },
    
    // ===== Smart Recommendation =====
    
    // Analyze asset type
    analyzeAsset(imageData, filename) {
        const suggestions = [];
        
        // Analyze by filename patterns
        const lowerName = filename.toLowerCase();
        
        if (lowerName.includes('walk') || lowerName.includes('run') || lowerName.includes('move')) {
            suggestions.push({ type: 'animation', action: 'animation', label: '🏃 移动动画', confidence: 0.9 });
        }
        if (lowerName.includes('idle') || lowerName.includes('stand')) {
            suggestions.push({ type: 'animation', action: 'idle', label: '😶 待机动画', confidence: 0.9 });
        }
        if (lowerName.includes('attack') || lowerName.includes('hit')) {
            suggestions.push({ type: 'animation', action: 'attack', label: '⚔️ 攻击动画', confidence: 0.9 });
        }
        if (lowerName.includes('jump')) {
            suggestions.push({ type: 'animation', action: 'jump', label: '⬆️ 跳跃动画', confidence: 0.85 });
        }
        if (lowerName.includes('dead') || lowerName.includes('death')) {
            suggestions.push({ type: 'animation', action: 'death', label: '💀 死亡动画', confidence: 0.9 });
        }
        if (lowerName.includes('bg') || lowerName.includes('background')) {
            suggestions.push({ type: 'background', label: '🖼️ 背景图', confidence: 0.9 });
        }
        if (lowerName.includes('icon') || lowerName.includes('ui')) {
            suggestions.push({ type: 'ui', label: '🎯 UI图标', confidence: 0.85 });
        }
        if (lowerName.includes('tile') || lowerName.includes('ground')) {
            suggestions.push({ type: 'tile', label: '🏠 瓦片', confidence: 0.8 });
        }
        if (lowerName.includes('enemy') || lowerName.includes('monster')) {
            suggestions.push({ type: 'enemy', label: '👹 敌人', confidence: 0.85 });
        }
        if (lowerName.includes('npc') || lowerName.includes('character')) {
            suggestions.push({ type: 'character', label: '🧍 角色', confidence: 0.8 });
        }
        if (lowerName.includes('weapon') || lowerName.includes('sword')) {
            suggestions.push({ type: 'weapon', label: '⚔️ 武器', confidence: 0.85 });
        }
        if (lowerName.includes('item') || lowerName.includes('coin')) {
            suggestions.push({ type: 'item', label: '💎 道具', confidence: 0.8 });
        }
        if (lowerName.includes('effect') || lowerName.includes('magic')) {
            suggestions.push({ type: 'effect', label: '✨ 特效', confidence: 0.85 });
        }
        
        // Analyze by pixel colors (simple heuristics)
        if (suggestions.length === 0) {
            suggestions.push({ type: 'unknown', label: '❓ 未识别', confidence: 0.3 });
        }
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    },
    
    // Suggest organization
    suggestOrganization(items) {
        const categories = {};
        
        items.forEach(item => {
            const analysis = this.analyzeAsset(null, item.name || item);
            const primary = analysis[0];
            
            if (primary && primary.type !== 'unknown') {
                if (!categories[primary.type]) {
                    categories[primary.type] = {
                        type: primary.type,
                        label: primary.label,
                        items: []
                    };
                }
                categories[primary.type].items.push(item);
            }
        });
        
        return Object.values(categories);
    },
    
    // Generate asset tags
    generateTags(item) {
        const tags = new Set();
        const name = (item.name || item).toLowerCase();
        
        // Add type-based tags
        if (name.includes('walk') || name.includes('run')) tags.add('animation');
        if (name.includes('idle')) tags.add('animation');
        if (name.includes('attack')) tags.add('animation');
        if (name.includes('bg')) tags.add('background');
        if (name.includes('icon')) tags.add('ui');
        
        // Add color hints
        if (name.includes('red')) tags.add('red');
        if (name.includes('blue')) tags.add('blue');
        if (name.includes('green')) tags.add('green');
        if (name.includes('gold')) tags.add('gold');
        
        // Add size hints
        if (name.includes('small') || name.includes('tiny')) tags.add('small');
        if (name.includes('large') || name.includes('big')) tags.add('large');
        
        return Array.from(tags);
    },
    
    // Suggest animation sequence grouping
    suggestAnimationGroups(items) {
        const groups = {};
        const patterns = [
            { regex: /^(.+?)_?(\d+)$/, key: 'numbered' },
            { regex: /^(.+?)_(walk|run|idle|attack|jump|death)$/i, key: 'action' }
        ];
        
        items.forEach(item => {
            const name = item.name || item;
            
            for (const pattern of patterns) {
                const match = name.match(pattern.regex);
                if (match) {
                    const key = pattern.key === 'numbered' 
                        ? `seq_${match[1]}` 
                        : match[2].toLowerCase();
                    
                    if (!groups[key]) {
                        groups[key] = {
                            name: match[1] || name,
                            type: pattern.key === 'action' ? 'animation' : 'sequence',
                            items: [],
                            suggestedName: pattern.key === 'action' 
                                ? `${match[1]}_${match[2]}` 
                                : `${match[1]} 序列`
                        };
                    }
                    groups[key].items.push(item);
                    break;
                }
            }
        });
        
        return Object.values(groups).filter(g => g.items.length > 1);
    },
    
    // Auto-detect animation frame count
    detectFrameCount(items) {
        const counts = {};
        
        items.forEach(item => {
            const name = item.name || item;
            const match = name.match(/_(\d+)$/) || name.match(/(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                counts[num] = (counts[num] || 0) + 1;
            }
        });
        
        // Find most common number
        let maxCount = 0, suggestedFrame = 0;
        Object.entries(counts).forEach(([num, count]) => {
            if (count > maxCount) {
                maxCount = count;
                suggestedFrame = parseInt(num);
            }
        });
        
        return suggestedFrame || 4;
    }
};

// ===== Pathfinding Test Module =====
const PathfindingTest = {
    // Simple grid-based pathfinding
    grid: null,
    gridWidth: 0,
    gridHeight: 0,
    
    // Initialize grid from collision data
    initGrid(width, height, collisionData = []) {
        this.gridWidth = width;
        this.gridHeight = height;
        this.grid = Array(height).fill(null).map(() => Array(width).fill(0));
        
        // Mark collision tiles
        collisionData.forEach(tile => {
            if (tile.x >= 0 && tile.x < width && tile.y >= 0 && tile.y < height) {
                this.grid[tile.y][tile.x] = 1;
            }
        });
    },
    
    // A* pathfinding
    findPath(startX, startY, endX, endY) {
        if (!this.grid) return null;
        
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const startKey = `${startX},${startY}`;
        const endKey = `${endX},${endY}`;
        
        openSet.push({ x: startX, y: startY });
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
        
        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => {
                const fA = fScore.get(`${a.x},${a.y}`) || Infinity;
                const fB = fScore.get(`${b.x},${b.y}`) || Infinity;
                return fA - fB;
            });
            
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;
            
            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }
            
            closedSet.add(currentKey);
            
            // Check neighbors (4-directional)
            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y }
            ];
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                // Skip if out of bounds or is obstacle or in closed set
                if (neighbor.x < 0 || neighbor.x >= this.gridWidth ||
                    neighbor.y < 0 || neighbor.y >= this.gridHeight ||
                    this.grid[neighbor.y][neighbor.x] === 1 ||
                    closedSet.has(neighborKey)) {
                    continue;
                }
                
                const tentativeG = (gScore.get(currentKey) || 0) + 1;
                
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }
                
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + this.heuristic(neighbor.x, neighbor.y, endX, endY));
            }
        }
        
        return null; // No path found
    },
    
    // Heuristic (Manhattan distance)
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },
    
    // Reconstruct path from A*
    reconstructPath(cameFrom, current) {
        const path = [{ x: current.x, y: current.y }];
        let key = `${current.x},${current.y}`;
        
        while (cameFrom.has(key)) {
            const node = cameFrom.get(key);
            path.unshift({ x: node.x, y: node.y });
            key = `${node.x},${node.y}`;
        }
        
        return path;
    },
    
    // Check if path exists
    hasPath(startX, startY, endX, endY) {
        return this.findPath(startX, startY, endX, endY) !== null;
    },
    
    // Find all reachable tiles from a point
    findReachableTiles(startX, startY, maxDistance = 100) {
        if (!this.grid) return [];
        
        const reachable = [];
        const visited = new Set();
        const queue = [{ x: startX, y: startY, dist: 0 }];
        
        while (queue.length > 0) {
            const { x, y, dist } = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
            if (this.grid[y][x] === 1) continue;
            if (dist > maxDistance) continue;
            
            visited.add(key);
            reachable.push({ x, y, distance: dist });
            
            queue.push({ x: x + 1, y, dist: dist + 1 });
            queue.push({ x: x - 1, y, dist: dist + 1 });
            queue.push({ x, y: y + 1, dist: dist + 1 });
            queue.push({ x, y: y - 1, dist: dist + 1 });
        }
        
        return reachable;
    },
    
    // Find isolated areas (disconnected regions)
    findIsolatedAreas() {
        if (!this.grid) return [];
        
        const visited = new Set();
        const areas = [];
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const key = `${x},${y}`;
                
                if (visited.has(key) || this.grid[y][x] === 1) continue;
                
                // Flood fill to find connected area
                const area = [];
                const queue = [{ x, y }];
                
                while (queue.length > 0) {
                    const { x: cx, y: cy } = queue.shift();
                    const cKey = `${cx},${cy}`;
                    
                    if (visited.has(cKey) || this.grid[cy][cx] === 1) continue;
                    if (cx < 0 || cx >= this.gridWidth || cy < 0 || cy >= this.gridHeight) continue;
                    
                    visited.add(cKey);
                    area.push({ x: cx, y: cy });
                    
                    queue.push({ x: cx + 1, y: cy });
                    queue.push({ x: cx - 1, y: cy });
                    queue.push({ x: cx, y: cy + 1 });
                    queue.push({ x: cx, y: cy - 1 });
                }
                
                if (area.length > 0) {
                    areas.push({
                        id: areas.length + 1,
                        tiles: area,
                        size: area.length,
                        boundingBox: {
                            minX: Math.min(...area.map(t => t.x)),
                            maxX: Math.max(...area.map(t => t.x)),
                            minY: Math.min(...area.map(t => t.y)),
                            maxY: Math.max(...area.map(t => t.y))
                        }
                    });
                }
            }
        }
        
        return areas;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.BatchTools = BatchTools;
    window.PathfindingTest = PathfindingTest;
}
