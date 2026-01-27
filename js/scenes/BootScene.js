class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.createTextures();
        this.load.audio('bgm_tension', 'assets/audio/bgm_tension.mp3');
        this.load.audio('bgm_brave', 'assets/audio/bgm_brave.mp3');
        this.load.image('logo_c9', 'assets/images/logo_c9.png');
        this.load.image('logo_jb', 'assets/images/logo_jb.png');
    }

    createTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. The Core (Codebase) 
        graphics.clear();
        graphics.fillStyle(COLORS.C9_BLUE, 1);
        graphics.fillCircle(32, 32, 30);
        graphics.generateTexture('core', 64, 64);

        // 2. The Shield 
        graphics.clear();
        graphics.lineStyle(8, COLORS.C9_BLUE, 1);
        graphics.beginPath();
        graphics.arc(50, 50, 40, Phaser.Math.DegToRad(135), Phaser.Math.DegToRad(405));
        graphics.strokePath();
        graphics.generateTexture('shield', 100, 100);

        // 3. 3a. Standard Enemy (Magenta Triangle)
        graphics.clear();
        graphics.fillStyle(COLORS.VCT_MAGENTA, 1);
        graphics.moveTo(0, 0); graphics.lineTo(20, 10); graphics.lineTo(0, 20);
        graphics.fillPath();
        graphics.generateTexture('enemy', 20, 20);

        // 3b. NEW: Heavy Enemy "Logic Bomb" (Orange Box)
        graphics.clear();
        graphics.fillStyle(0xFF9900, 1); // Intense Orange
        graphics.lineStyle(2, 0xFFFFFF, 1);
        graphics.fillRect(0, 0, 32, 32); // Larger, boxy
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('enemy_heavy', 34, 34);

        // 3c. NEW: Fast Enemy "Race Condition" (Cyan Streak)
        graphics.clear();
        graphics.fillStyle(0x00FFFF, 1); // Cyan
        graphics.beginPath();
        graphics.moveTo(0, 5); 
        graphics.lineTo(24, 0); // Long and thin
        graphics.lineTo(0, -5);
        graphics.fillPath();
        graphics.generateTexture('enemy_fast', 24, 12);

        // 4. PowerUp (Junie Token) 
        const tokenCanvas = document.createElement('canvas');
        tokenCanvas.width = 22; tokenCanvas.height = 22;
        const ctx = tokenCanvas.getContext('2d');
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 22, 22);
        ctx.strokeStyle = '#23D18B'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 20, 20); 
        ctx.font = 'bold 12px Courier New'; ctx.fillStyle = '#23D18B';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('{ }', 11, 12);
        this.textures.addCanvas('token', tokenCanvas);

        // 5. Semantic Particles (The Code Symbols)
        const symbols = ['{ }', ';', '/>', '404', 'NaN', '!='];
        
        // Create one wide canvas to hold ALL symbols side-by-side
        // 32px width * 6 symbols = 192px total width
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = 192; 
        sheetCanvas.height = 32;
        const sCtx = sheetCanvas.getContext('2d');
        
        sCtx.font = 'bold 16px Courier New';
        sCtx.fillStyle = '#FFFFFF';
        sCtx.textAlign = 'center';
        sCtx.textBaseline = 'middle';
        
        // Draw each symbol into its own 32x32 "slot"
        symbols.forEach((sym, index) => {
            sCtx.fillText(sym, (index * 32) + 16, 16);
        });

        // Add as a Sprite Sheet (Key: 'symbols')
        this.textures.addSpriteSheet('symbols', sheetCanvas, {
            frameWidth: 32,
            frameHeight: 32
        });

        // 6. Basic Particle (Fallback)
        graphics.clear();
        graphics.fillStyle(COLORS.WHITE, 1);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particle', 4, 4);

        // 7. NEW: Junie's Face (Procedural Monitor)
        // We create 3 frames: Idle (0), Brave (1), Damage (2)
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 192; // 64px * 3 frames
        faceCanvas.height = 64;
        const fCtx = faceCanvas.getContext('2d');

        // FRAME 1: IDLE (Standard Eyes) - [  ]  [  ]
        fCtx.fillStyle = '#23D18B'; // Terminal Green
        fCtx.fillRect(10, 20, 15, 25); // Left Eye
        fCtx.fillRect(40, 20, 15, 25); // Right Eye
        
        // FRAME 2: BRAVE (Aggressive Eyes) - \  /
        fCtx.fillStyle = '#FFFFFF'; // Bright White
        fCtx.beginPath();
        // Left Eye (Slant)
        fCtx.moveTo(74, 20); fCtx.lineTo(90, 28); fCtx.lineTo(90, 45); fCtx.lineTo(74, 35);
        // Right Eye (Slant)
        fCtx.moveTo(118, 20); fCtx.lineTo(102, 28); fCtx.lineTo(102, 45); fCtx.lineTo(118, 35);
        fCtx.fill();

        // FRAME 3: DAMAGE (Dead Eyes) - X  X
        fCtx.fillStyle = '#FF0055'; // VCT Magenta
        fCtx.font = 'bold 40px Courier New';
        fCtx.fillText('X', 135, 45);
        fCtx.fillText('X', 170, 45);

        this.textures.addSpriteSheet('junie_face', faceCanvas, {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        this.scene.start('AttractMode');
    }
}