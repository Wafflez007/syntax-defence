class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        // 1. Init Logic
        this.score = 0;
        this.timeLeft = GAME_CONFIG.sessionTime;
        this.isBraveMode = false;
        this.braveMeter = 0;
        this.isPlaying = true;

        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // 2. Init Systems (The new modular parts)
        this.fx = new FXManager(this);
        this.ui = new UIManager(this);
        this.audio = new AudioManager(this);
        
        this.audio.startMusic();

        this.time.delayedCall(500, () => {
            this.audio.speak("System Online. Protect the Core.");
        });

        this.createBackgroundGrid();
        this.handInput = new HandInputManager(this);
        this.handInput.start();
        this.input.setDefaultCursor('none');

        // 3. Init Entities
        // Core
        this.core = this.add.sprite(cx, cy, 'core').setDepth(10);
        this.tweens.add({ targets: this.core, scale: 1.1, alpha: 0.8, duration: 1000, yoyo: true, repeat: -1 });

        // Shield
        this.shieldContainer = this.add.container(cx, cy);
        this.shieldSprite = this.add.sprite(60, 0, 'shield').setOrigin(0.5).setAngle(90);
        this.shieldContainer.add(this.shieldSprite);
        this.physics.add.existing(this.shieldSprite);
        this.shieldSprite.body.setCircle(40);

        // Physics Groups
        this.enemies = this.physics.add.group();
        this.tokens = this.physics.add.group();

        // 4. Timers
        this.time.addEvent({ delay: 800, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 3000, callback: this.spawnToken, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });

        // Brave Mode UI Overlay
        this.braveOverlay = this.add.rectangle(400, 300, 800, 600, COLORS.C9_BLUE).setAlpha(0).setDepth(20);
    }

    createBackgroundGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x004466, 0.3);
        for(let i=0; i<800; i+=40) { graphics.moveTo(i, 0); graphics.lineTo(i, 600); }
        for(let i=0; i<600; i+=40) { graphics.moveTo(0, i); graphics.lineTo(800, i); }
        graphics.strokePath();
    }

    update() {
        if (!this.isPlaying) return;

        // Update Systems
        this.fx.updateEnvironment(this.timeLeft);

        // 1. Check if we need to switch tracks (Brave vs Normal)
        this.audio.switchMode(this.isBraveMode);
        
        // 2. If Normal, adjust pitch based on panic timer
        this.audio.updateMusicPitch(this.timeLeft);

        this.handleInput();

        // Physics Logic
        this.handleCollisions();
        this.handleMovement();
    }

    handleInput() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Get coordinates from MediaPipe (or fallback to mouse if tracking fails)
        let pointer = this.handInput.getPointer();
        
        // Calculate angle
        const angle = Phaser.Math.Angle.Between(cx, cy, pointer.x, pointer.y);
        
        // Rotate Shield (Smoothly via LERP for better feel)
        const currentRot = this.shieldContainer.rotation;
        this.shieldContainer.rotation = Phaser.Math.Angle.RotateTo(currentRot, angle, 0.1); 
    }

    handleMovement() {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.customSpeed) this.physics.moveToObject(enemy, this.core, enemy.customSpeed);
        });
    }

    handleCollisions() {
        const shieldAngle = Phaser.Math.Wrap(this.shieldContainer.rotation, -Math.PI, Math.PI);
        const tolerance = 1.0;

        // Enemies
        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, 400, 300);
            
            // Block Check
            if (dist < 80 && dist > 50) {
                const angleTo = Phaser.Math.Angle.Between(400, 300, enemy.x, enemy.y);
                if (Math.abs(Phaser.Math.Angle.Wrap(angleTo - shieldAngle)) < tolerance) {
                    this.destroyEnemy(enemy, true);
                }
            }
            // Hit Check
            if (dist < 30) this.damageCore(enemy);
        });

        // Tokens
        this.tokens.getChildren().forEach(token => {
            const dist = Phaser.Math.Distance.Between(token.x, token.y, 400, 300);
            if (dist < 80 && dist > 50) {
                const angleTo = Phaser.Math.Angle.Between(400, 300, token.x, token.y);
                if (Math.abs(Phaser.Math.Angle.Wrap(angleTo - shieldAngle)) < tolerance) {
                    this.collectToken(token);
                }
            }
            if (dist < 30) token.destroy();
        });
    }

    spawnEnemy() {
        if (!this.isPlaying || this.isBraveMode) return;
        
        // Logic: Determine Type
        let key = 'enemy';
        let speed = 150 + (60 - this.timeLeft) * 2;
        const rand = Phaser.Math.Between(0, 100);

        if (this.timeLeft < 45 && rand < 30) { key = 'enemy_heavy'; speed = 80; }
        if (this.timeLeft < 20 && rand < 20) { key = 'enemy_fast'; speed = 350; }

        // Spawn
        const pt = this.getSpawnPoint();
        const enemy = this.enemies.create(pt.x, pt.y, key);
        enemy.customSpeed = speed;
        if (key === 'enemy') enemy.setTint(COLORS.VCT_MAGENTA);
        
        this.physics.moveToObject(enemy, this.core, speed);
        enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, 400, 300);
    }

    spawnToken() {
        if (!this.isPlaying) return;
        const pt = this.getSpawnPoint();
        const token = this.tokens.create(pt.x, pt.y, 'token');
        this.physics.moveToObject(token, this.core, 100);
    }

    getSpawnPoint() {
        const side = Phaser.Math.Between(0, 3);
        if(side===0) return {x: Phaser.Math.Between(0, 800), y: -20};
        if(side===1) return {x: Phaser.Math.Between(0, 800), y: 620};
        if(side===2) return {x: -20, y: Phaser.Math.Between(0, 600)};
        return {x: 820, y: Phaser.Math.Between(0, 600)};
    }

    destroyEnemy(enemy, blocked) {
        // 1. Check if blocked logic FIRST (while enemy still exists)
        if (blocked) {
            this.score += 100;
            this.ui.updateScore(this.score);
            
            // Check Type
            if (enemy.texture.key === 'enemy_heavy') {
                // --- Heavy Logic ---
                this.audio.playSFX('hit_heavy');
                this.fx.explodeHeavy(enemy.x, enemy.y);
                this.fx.vibrate(50);

                // HIT STOP (Freeze Frame)
                this.physics.world.pause();
                this.anims.pauseAll(); 
                
                this.time.delayedCall(100, () => {
                    this.physics.world.resume();
                    this.anims.resumeAll();
                });

            } else if (enemy.texture.key === 'enemy_fast') {
                // --- Fast Logic ---
                this.audio.playSFX('hit_fast');
                this.fx.explodeEnemy(enemy.x, enemy.y); 
                this.fx.vibrate(10);

            } else {
                // --- Normal Logic ---
                this.audio.playSFX('hit');
                this.fx.explodeEnemy(enemy.x, enemy.y);
                this.fx.vibrate(20);
            }
        }

        // 2. NOW it is safe to destroy the object
        enemy.destroy();
    }

    damageCore(enemy) {
        enemy.destroy();
        this.score = Math.max(0, this.score - 500);
        this.ui.updateScore(this.score);
        this.ui.flashDamage();

        // 1. Violent Shake
        this.cameras.main.shake(300, 0.05); 
        
        // 2. Red Flash Overlay
        this.cameras.main.flash(100, 255, 0, 0);

        // 3. "Digital Tear" (Zoom Pump)
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.05,
            yoyo: true,
            duration: 50,
            repeat: 3
        });

        this.fx.damageEffect();
    }

    collectToken(token) {
        token.destroy();
        this.score += 300;
        this.ui.updateScore(this.score);
        this.fx.explodeToken(token.x, token.y);
        this.audio.playSFX('brave');
        this.fx.vibrate([50, 50, 50]);
        this.increaseBraveMeter();
    }

    increaseBraveMeter() {
        this.braveMeter = Math.min(200, this.braveMeter + 40);
        this.ui.updateBraveMeter(this.braveMeter, this.braveMeter >= 200);
        if (this.braveMeter >= 200 && !this.isBraveMode) this.activateBraveMode();
    }

    activateBraveMode() {
        this.isBraveMode = true;
        this.fx.matrixRain.start();
        this.tweens.add({ targets: this.braveOverlay, alpha: 0.2, duration: 200, yoyo: true });

        this.audio.speak("Maximum Synchronization!", "brave");
        
        const modeText = this.add.text(400, 300, 'BRAVE MODE ACTIVATED', {
            fontFamily: 'Impact', fontSize: '48px', color: '#FFF'
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({ targets: modeText, scale: 1.5, alpha: 0, duration: 1000 });
        
        this.enemies.clear(true, true);
        this.ui.react('brave');
        
        this.time.delayedCall(GAME_CONFIG.braveModeDuration, () => {
            this.isBraveMode = false;
            this.braveMeter = 0;
            this.ui.updateBraveMeter(0, false);
            this.ui.react('idle');
            this.fx.matrixRain.stop();
        });
    }

    updateTimer() {
        this.timeLeft--;
        this.ui.updateTimer(this.timeLeft);
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
            this.audio.speak(this.timeLeft.toString());
        }
        if (this.timeLeft <= 0) this.endGame();
    }

    endGame() {
        this.isPlaying = false;
        this.physics.pause();
        this.audio.stopMusic();
        this.audio.speak("Session Terminated.", "critical");
        this.handInput.stop();
        this.scene.start('ResultScene', { score: this.score });
    }
}