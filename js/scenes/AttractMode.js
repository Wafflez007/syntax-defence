class AttractMode extends Phaser.Scene {
    constructor() { super('AttractMode'); }

    create() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        this.createBackground(cx, cy);

        const c9Logo = this.add.image(cx - 80, 80, 'logo_c9').setOrigin(0.5).setScale(0.2); 
        this.add.text(cx, 80, 'x', { fontSize: '24px', color: '#555' }).setOrigin(0.5); // The "X"
        const jbLogo = this.add.image(cx + 80, 80, 'logo_jb').setOrigin(0.5).setScale(0.060);

        this.add.text(cx, 160, 'SYNTAX DEFENSE', {
            fontFamily: 'Impact', fontSize: '52px', color: '#00AEEF'
        }).setOrigin(0.5);

        // Load and Display Leaderboard
        this.createLeaderboard(cx, cy);

        const startText = this.add.text(cx, 520, '> CLICK TO INITIALIZE <', {
            fontFamily: 'Courier New', fontSize: '24px', color: '#23D18B', backgroundColor: '#000'
        }).setOrigin(0.5).setPadding(10);

        this.tweens.add({
            targets: startText, alpha: 0.2, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.input.on('pointerdown', () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('GameScene'));
        });
    }

    createBackground(cx, cy) {
        // Grid Lines
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x005577, 0.2);
        for (let i = 0; i < 800; i += 50) {
            graphics.moveTo(i, 0); graphics.lineTo(i, 600);
        }
        for (let i = 0; i < 600; i += 50) {
            graphics.moveTo(0, i); graphics.lineTo(800, i);
        }
        graphics.strokePath();

        // Particles
        this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            speedY: { min: -10, max: -50 }, // Float upwards like code bubbles
            scale: { start: 1, end: 0 },
            lifespan: 3000,
            quantity: 1,
            blendMode: 'ADD',
            tint: [0x00AEEF, 0x23D18B]
        });
    }

    createLeaderboard(cx, cy) {
        // Container
        this.add.rectangle(cx, cy + 40, 400, 280, 0x000000, 0.8).setStrokeStyle(2, 0x00AEEF);
        
        this.add.text(cx, cy - 80, 'TOP AGENTS', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#00AEEF'
        }).setOrigin(0.5);

        // Initial "Loading" State
        const loadingText = this.add.text(cx, cy, 'CONNECTING TO DB...', {
            fontFamily: 'Courier New', fontSize: '18px', color: '#AAA'
        }).setOrigin(0.5);

        this.tweens.add({ targets: loadingText, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });

        // FETCH FROM GOOGLE SHEET
        fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            // Remove Loading Text
            loadingText.destroy();
            
            // Render Data
            let yPos = cy - 50;
            data.forEach((entry, i) => {
                const color = i === 0 ? '#FFD700' : '#FFF';
                this.add.text(cx - 150, yPos, `${i + 1}. ${entry.name}`, {
                    fontFamily: 'Courier New', fontSize: '18px', color: color
                }).setOrigin(0, 0.5);
                this.add.text(cx + 150, yPos, entry.score, {
                    fontFamily: 'Courier New', fontSize: '18px', color: '#23D18B'
                }).setOrigin(1, 0.5);
                yPos += 40;
            });
            
            // Live Status
            this.add.text(cx, cy + 130, '● GLOBAL SYNC ACTIVE', {
                fontFamily: 'Arial', fontSize: '12px', color: '#23D18B'
            }).setOrigin(0.5);
        })
        .catch(err => {
            loadingText.setText('OFFLINE MODE');
            // Optional: Load fallback fake data here if fetch fails
        });
    }
}