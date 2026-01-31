class FXManager {
    constructor(scene) {
        this.scene = scene;
        this.createEnvironment();
        this.createEmitters();
    }

    createEnvironment() {
        const cx = this.scene.cameras.main.centerX;
        const cy = this.scene.cameras.main.centerY;
        this.bgRect = this.scene.add.rectangle(cx, cy, 800, 600, 0x000000).setDepth(-1);
    }

    createEmitters() {
        // Semantic Particles
        this.semanticParticles = this.scene.add.particles(0, 0, 'symbols', {
            frame: [0, 1, 2, 3, 4, 5],
            lifespan: 600,
            speed: { min: 50, max: 200 },
            scale: { start: 1.5, end: 0.5 },
            rotate: { min: -90, max: 90 },
            alpha: { start: 1, end: 0 },
            emitting: false,
            blendMode: 'SCREEN'
        });

        // Token Particles
        this.tokenExplosion = this.scene.add.particles(0, 0, 'particle', {
            lifespan: 800,
            speed: { min: 50, max: 150 },
            scale: { start: 2, end: 0 },
            blendMode: 'ADD',
            emitting: false,
            tint: COLORS.TERM_GREEN
        });

        // Matrix Rain Emitter
        this.matrixRain = this.scene.add.particles(0, 0, 'matrix_rain', {
            // Spawn across the whole screen width
            x: { min: 0, max: this.scene.scale.width }, 
            
            // Start slightly above screen so they fall IN naturally
            y: -350, 
            
            // Falling Speed (The video is quite fast)
            speedY: { min: 400, max: 700 }, 
            
            // Lifespan: Enough to hit the bottom (1000px distance / 400 speed ~ 2.5s)
            lifespan: 3000, 
            
            // Vary the size slightly for depth
            scale: { min: 0.8, max: 1.2 }, 
            
            // Fade them out as they reach the bottom
            alpha: { start: 0.8, end: 0 }, 
            
            // Quantity: How dense? Lower number = More rain (Frequency in ms)
            // 20ms = Very Heavy Rain. 50ms = Light Rain.
            frequency: 30, 
            
            emitting: false // Start paused
        }).setDepth(-1); // Behind everything
    }

    // Triggers
    explodeEnemy(x, y) {
        this.semanticParticles.emitParticleAt(x, y, 8);
        this.scene.cameras.main.shake(50, 0.005);
    }

    explodeHeavy(x, y) {
        this.semanticParticles.emitParticleAt(x, y, 12);
        this.scene.cameras.main.shake(100, 0.01);
    }

    explodeToken(x, y) {
        this.tokenExplosion.emitParticleAt(x, y, 15);
    }

    damageEffect() {
        this.scene.cameras.main.shake(200, 0.02);
        this.scene.cameras.main.flash(200, 255, 0, 0);
    }

    // Haptics
    vibrate(pattern) {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }

    updateEnvironment(timeLeft) {
        if (timeLeft > 30) {
            // Stable
        } else if (timeLeft > 10) {
            // Amber
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(0x000000),
                Phaser.Display.Color.ValueToColor(0x331100),
                20, timeLeft - 10
            );
            this.bgRect.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
        } else {
            // Red Pulse
            const pulse = Math.abs(Math.sin(this.scene.time.now / 100));
            const redVal = 50 + (pulse * 50);
            this.bgRect.setFillStyle(Phaser.Display.Color.GetColor(redVal, 0, 0));
        }
    }
}