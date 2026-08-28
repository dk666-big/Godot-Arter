/**
 * TileSet Editor Module for Godot-Arter v2.1
 * 瓦片地图可视化编辑器
 */

// ===== TileSet Editor Core =====
const TileSetEditor = {
    // Editor state
    canvas: null,
    ctx: null,
    tilesetImage: null,
    tileSize: 16,
    gridCols: 0,
    gridRows: 0,
    currentTool: 'select',
    currentLayer: 'terrain',
    selectedTiles: [],
    tiles: [],
    layers: {
        terrain: { visible: true, editable: true, data: {} },
        collision: { visible: true, editable: true, data: {} },
        decoration: { visible: true, editable: true, data: {} },
        events: { visible: true, editable: true, data: {} }
    },
    drawing: false,
    drawStart: null,
    isDragging: false,
    dragStart: null,
    zoom: 1,
    offset: { x: 0, y: 0 },
    undoStack: [],
    redoStack: [],
    currentTerrainType: 'grass',
    currentCollisionShape: 'rect',
    currentDecoration: 'tree',
    eventMarkers: [],
    
    // Terrain types
    terrainTypes: {
        grass: { name: '草地', color: '#4a7c4e' },
        water: { name: '水域', color: '#3a6c9e' },
        path: { name: '道路', color: '#8c7c5e' },
        wall: { name: '墙壁', color: '#5c5c5c' },
        floor: { name: '地板', color: '#7c6c5c' }
    },
    
    // Decoration types
    decorationTypes: {
        tree: { name: '🌲 树', color: '#2d5a2d' },
        rock: { name: '🪨 石头', color: '#6c6c6c' },
        flower: { name: '🌸 花', color: '#e8a0b0' },
        chest: { name: '📦 宝箱', color: '#c8a030' },
        lamp: { name: '💡 灯', color: '#f8d860' }
    },
    
    // Event types
    eventTypes: {
        spawn: { name: '⭐ 出生点', color: '#40c040' },
        enemy: { name: '👹 敌人', color: '#c04040' },
        npc: { name: '👤 NPC', color: '#4080c0' },
        trigger: { name: '📍 触发器', color: '#c08040' },
        exit: { name: '🚪 出口', color: '#8040c0' }
    },
    
    // Initialize editor
    init(containerId, options = {}) {
        this.tileSize = options.tileSize || 16;
        this.canvas = document.getElementById(containerId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Event listeners
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        window.addEventListener('resize', () => this.resize());
        
        this.draw();
        return this;
    },
    
    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth || 800;
            this.canvas.height = parent.clientHeight || 500;
        }
        this.draw();
    },
    
    // Load tileset image
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.tilesetImage = img;
                    this.gridCols = Math.floor(img.width / this.tileSize);
                    this.gridRows = Math.floor(img.height / this.tileSize);
                    this.tiles = [];
                    for (let y = 0; y < this.gridRows; y++) {
                        for (let x = 0; x < this.gridCols; x++) {
                            this.tiles.push({
                                x, y,
                                terrain: null,
                                collision: null,
                                decoration: null,
                                event: null
                            });
                        }
                    }
                    this.draw();
                    resolve({ cols: this.gridCols, rows: this.gridRows });
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    // Get tile at position
    getTileAt(canvasX, canvasY) {
        const worldX = (canvasX - this.offset.x) / this.zoom;
        const worldY = (canvasY - this.offset.y) / this.zoom;
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);
        
        if (tileX >= 0 && tileX < this.gridCols && tileY >= 0 && tileY < this.gridRows) {
            return this.tiles[tileY * this.gridCols + tileX];
        }
        return null;
    },
    
    // Get canvas position from event
    getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },
    
    onMouseDown(e) {
        const pos = this.getCanvasPos(e);
        const tile = this.getTileAt(pos.x, pos.y);
        
        if (e.button === 0) { // Left click
            if (this.currentTool === 'select') {
                if (tile) {
                    this.selectedTiles = [tile];
                    this.isDragging = true;
                    this.dragStart = pos;
                }
            } else if (this.currentTool === 'terrain') {
                this.drawing = true;
                this.drawStart = { x: tile?.x, y: tile?.y };
                this.applyTool(tile);
            } else if (this.currentTool === 'collision') {
                this.drawing = true;
                this.drawStart = { x: tile?.x, y: tile?.y };
                this.applyTool(tile);
            } else if (this.currentTool === 'decoration') {
                if (tile) this.applyTool(tile);
            } else if (this.currentTool === 'event') {
                if (tile) this.applyTool(tile);
            } else if (this.currentTool === 'erase') {
                this.drawing = true;
                if (tile) this.applyTool(tile);
            }
        } else if (e.button === 2) { // Right click
            this.isDragging = true;
            this.dragStart = pos;
        }
    },
    
    onMouseMove(e) {
        const pos = this.getCanvasPos(e);
        
        if (this.isDragging && e.buttons === 2) {
            // Pan
            if (this.dragStart) {
                this.offset.x += pos.x - this.dragStart.x;
                this.offset.y += pos.y - this.dragStart.y;
                this.dragStart = pos;
                this.draw();
            }
        } else if (this.isDragging && e.buttons === 1 && this.currentTool === 'select') {
            // Select drag
            this.draw();
            this.drawSelectionRect();
        } else if (this.drawing) {
            const tile = this.getTileAt(pos.x, pos.y);
            if (tile && this.currentTool !== 'decoration') {
                this.applyTool(tile);
            }
        }
    },
    
    onMouseUp() {
        if (this.isDragging && this.currentTool === 'select' && this.dragStart) {
            const rect = this.selectionRect;
            if (rect) {
                this.selectedTiles = this.tiles.filter(t => 
                    t.x >= rect.x1 && t.x <= rect.x2 && 
                    t.y >= rect.y1 && t.y <= rect.y2
                );
            }
        }
        this.drawing = false;
        this.isDragging = false;
        this.dragStart = null;
        this.selectionRect = null;
        this.draw();
    },
    
    onWheel(e) {
        e.preventDefault();
        const pos = this.getCanvasPos(e);
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.25, Math.min(4, this.zoom * delta));
        
        // Zoom towards mouse position
        const worldX = (pos.x - this.offset.x) / this.zoom;
        const worldY = (pos.y - this.offset.y) / this.zoom;
        
        this.zoom = newZoom;
        
        this.offset.x = pos.x - worldX * this.zoom;
        this.offset.y = pos.y - worldY * this.zoom;
        
        this.draw();
    },
    
    applyTool(tile) {
        if (!tile) return;
        
        this.saveUndo();
        
        switch (this.currentTool) {
            case 'terrain':
                tile.terrain = this.currentTerrainType;
                break;
            case 'collision':
                tile.collision = this.currentCollisionShape;
                break;
            case 'decoration':
                tile.decoration = this.currentDecoration;
                break;
            case 'event':
                tile.event = this.currentEventType;
                break;
            case 'erase':
                if (this.currentLayer === 'terrain') tile.terrain = null;
                else if (this.currentLayer === 'collision') tile.collision = null;
                else if (this.currentLayer === 'decoration') tile.decoration = null;
                else if (this.currentLayer === 'events') tile.event = null;
                break;
        }
        
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
        
        ctx.save();
        ctx.translate(this.offset.x, this.offset.y);
        ctx.scale(this.zoom, this.zoom);
        
        // Draw tileset image
        if (this.tilesetImage) {
            ctx.drawImage(this.tilesetImage, 0, 0);
        }
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1 / this.zoom;
        for (let x = 0; x <= this.gridCols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.tileSize, 0);
            ctx.lineTo(x * this.tileSize, this.gridRows * this.tileSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.gridRows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.tileSize);
            ctx.lineTo(this.gridCols * this.tileSize, y * this.tileSize);
            ctx.stroke();
        }
        
        // Draw layer overlays
        if (this.layers.terrain.visible && this.currentLayer === 'terrain') {
            this.drawTerrainLayer(ctx);
        }
        if (this.layers.collision.visible && this.currentLayer === 'collision') {
            this.drawCollisionLayer(ctx);
        }
        if (this.layers.decoration.visible && this.currentLayer === 'decoration') {
            this.drawDecorationLayer(ctx);
        }
        if (this.layers.events.visible && this.currentLayer === 'events') {
            this.drawEventLayer(ctx);
        }
        
        // Draw selected tiles
        if (this.selectedTiles.length > 0) {
            ctx.strokeStyle = '#e8a33d';
            ctx.lineWidth = 2 / this.zoom;
            this.selectedTiles.forEach(tile => {
                ctx.strokeRect(
                    tile.x * this.tileSize, 
                    tile.y * this.tileSize, 
                    this.tileSize, 
                    this.tileSize
                );
            });
        }
        
        ctx.restore();
        
        // Draw toolbar area
        this.drawInfo();
    },
    
    drawTerrainLayer(ctx) {
        this.tiles.forEach(tile => {
            if (tile.terrain) {
                const terrain = this.terrainTypes[tile.terrain];
                if (terrain) {
                    ctx.fillStyle = terrain.color + '60';
                    ctx.fillRect(
                        tile.x * this.tileSize,
                        tile.y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        });
    },
    
    drawCollisionLayer(ctx) {
        this.tiles.forEach(tile => {
            if (tile.collision) {
                ctx.fillStyle = '#e8a33d40';
                ctx.strokeStyle = '#e8a33d';
                ctx.lineWidth = 2 / this.zoom;
                
                const x = tile.x * this.tileSize;
                const y = tile.y * this.tileSize;
                const s = this.tileSize;
                
                ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
                ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
                
                // Collision indicator
                ctx.fillStyle = '#e8a33d';
                ctx.beginPath();
                ctx.arc(x + s/2, y + s/2, 3/this.zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    drawDecorationLayer(ctx) {
        this.tiles.forEach(tile => {
            if (tile.decoration) {
                const deco = this.decorationTypes[tile.decoration];
                if (deco) {
                    ctx.fillStyle = deco.color;
                    ctx.font = `${12/this.zoom}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        deco.name.charAt(0),
                        tile.x * this.tileSize + this.tileSize/2,
                        tile.y * this.tileSize + this.tileSize/2
                    );
                }
            }
        });
    },
    
    drawEventLayer(ctx) {
        this.tiles.forEach(tile => {
            if (tile.event) {
                const evt = this.eventTypes[tile.event];
                if (evt) {
                    ctx.fillStyle = evt.color;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1 / this.zoom;
                    
                    const cx = tile.x * this.tileSize + this.tileSize/2;
                    const cy = tile.y * this.tileSize + this.tileSize/2;
                    const r = this.tileSize/3;
                    
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - r);
                    ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
                    ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        });
    },
    
    drawSelectionRect() {
        if (!this.dragStart || !this.selectionRect) return;
        const ctx = this.ctx;
        const r = this.selectionRect;
        
        ctx.strokeStyle = '#e8a33d';
        ctx.fillStyle = '#e8a33d20';
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
        ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
    },
    
    drawInfo() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(5, 5, 200, 80);
        ctx.fillStyle = '#efe6d0';
        ctx.font = '12px JetBrains Mono, Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`网格: ${this.gridCols} × ${this.gridRows}`, 10, 22);
        ctx.fillText(`瓦片: ${this.tileSize}px`, 10, 38);
        ctx.fillText(`缩放: ${(this.zoom * 100).toFixed(0)}%`, 10, 54);
        ctx.fillText(`工具: ${this.currentTool}`, 10, 70);
    },
    
    // Undo/Redo
    saveUndo() {
        this.undoStack.push(JSON.stringify(this.tiles));
        if (this.undoStack.length > 50) this.undoStack.shift();
        this.redoStack = [];
    },
    
    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(this.tiles));
        this.tiles = JSON.parse(this.undoStack.pop());
        this.draw();
    },
    
    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(this.tiles));
        this.tiles = JSON.parse(this.redoStack.pop());
        this.draw();
    },
    
    // Export to Godot TileSet
    exportToGodot() {
        let code = `[gd_resource type="TileSet" load_steps=2 format=3]

[ext_resource type="Texture2D" path="res://tiles.png" id="1"]

[sub_resource type="TileSetScenesCollectionSource" id="TileSetScenesCollectionSource_1"]
scenes/1 = SubResource("TileSetScenesCollectionSource_1_scene")

[resource]
tile_size = Vector2i(${this.tileSize}, ${this.tileSize})
sources/1 = SubResource("TileSetScenesCollectionSource_1")

`;
        
        // Add terrain data
        const terrainData = {};
        this.tiles.forEach((tile, idx) => {
            if (tile.terrain) {
                if (!terrainData[tile.terrain]) terrainData[tile.terrain] = [];
                terrainData[tile.terrain].push(idx);
            }
        });
        
        // Add collision data
        let collisionCode = '\n[sub_resource type="TileSetAtlasSource" id="TileSetAtlasSource_1"]\n';
        collisionCode += `texture = ExtResource("1")\n`;
        collisionCode += `texture_region_size = Vector2i(${this.tileSize}, ${this.tileSize})\n`;
        collisionCode += `use_texture_padding = false\n`;
        
        let idx = 0;
        const collisions = this.tiles.filter(t => t.collision);
        if (collisions.length > 0) {
            collisionCode += '\n# Collision shapes\n';
            collisions.forEach(tile => {
                const x = tile.x;
                const y = tile.y;
                collisionCode += `\n[sub_resource type="RectangleShape2D" id="Collision_${idx}"]\n`;
                collisionCode += `custom_solver_bias = 0.0\n`;
                collisionCode += `size = Vector2(${this.tileSize - 4}, ${this.tileSize - 4})\n`;
                
                collisionCode += `\n[sub_resource type="TileMapPattern" id="Pattern_${idx}"]\n`;
                collisionCode += `cells = [Vector2i(${x}, ${y})]\n`;
                idx++;
            });
        }
        
        return code + collisionCode;
    },
    
    // Export as JSON
    exportToJSON() {
        return {
            tileSize: this.tileSize,
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            tiles: this.tiles,
            layers: this.layers
        };
    },
    
    // Import from JSON
    importFromJSON(data) {
        if (data.tileSize) this.tileSize = data.tileSize;
        if (data.gridCols) this.gridCols = data.gridCols;
        if (data.gridRows) this.gridRows = data.gridRows;
        if (data.tiles) this.tiles = data.tiles;
        if (data.layers) this.layers = data.layers;
        this.draw();
    },
    
    // Clear all
    clearAll() {
        if (!confirm('确定清除所有编辑数据？')) return;
        this.saveUndo();
        this.tiles.forEach(tile => {
            tile.terrain = null;
            tile.collision = null;
            tile.decoration = null;
            tile.event = null;
        });
        this.selectedTiles = [];
        this.draw();
    }
};

// ===== TileSet Editor UI Helper =====
const TileSetEditorUI = {
    editor: null,
    
    init(containerId, options = {}) {
        this.editor = TileSetEditor.init(containerId, options);
        return this;
    },
    
    setTool(tool) {
        if (this.editor) {
            this.editor.currentTool = tool;
            this.editor.draw();
        }
    },
    
    setLayer(layer) {
        if (this.editor) {
            this.editor.currentLayer = layer;
            this.editor.draw();
        }
    },
    
    setTerrainType(type) {
        if (this.editor) {
            this.editor.currentTerrainType = type;
        }
    },
    
    setCollisionShape(shape) {
        if (this.editor) {
            this.editor.currentCollisionShape = shape;
        }
    },
    
    setDecoration(type) {
        if (this.editor) {
            this.editor.currentDecoration = type;
        }
    },
    
    setEventType(type) {
        if (this.editor) {
            this.editor.currentEventType = type;
        }
    },
    
    async loadImage(file) {
        if (this.editor) {
            return await this.editor.loadImage(file);
        }
    },
    
    undo() {
        if (this.editor) this.editor.undo();
    },
    
    redo() {
        if (this.editor) this.editor.redo();
    },
    
    exportJSON() {
        if (this.editor) {
            const data = this.editor.exportToJSON();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tileset_data.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    },
    
    exportGodot() {
        if (this.editor) {
            const code = this.editor.exportToGodot();
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tileset.gd';
            a.click();
            URL.revokeObjectURL(url);
        }
    },
    
    clear() {
        if (this.editor) this.editor.clearAll();
    }
};

// Export
if (typeof window !== 'undefined') {
    window.TileSetEditor = TileSetEditor;
    window.TileSetEditorUI = TileSetEditorUI;
}
