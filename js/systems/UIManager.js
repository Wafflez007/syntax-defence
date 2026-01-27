class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.createHUD();
    }

    createHUD() {
        // 1. Top Bar Background
        this.scene.add.rectangle(400, 30, 800, 60, 0x000000).setAlpha(0.8);

        // 2. Score (Left)
        this.scoreText = this.scene.add.text(20, 15, 'SCORE: 0', { 
            fontFamily: 'Courier New', fontSize: '28px', color: '#00AEEF' 
        });

        // 3. Junie Avatar (Center)
        // Container Frame
        this.scene.add.rectangle(400, 35, 70, 50, 0x000000).setStrokeStyle(2, 0x00AEEF);
        // Face Sprite
        this.junieFace = this.scene.add.sprite(400, 35, 'junie_face', 0).setScale(0.8);
        // Name Tag (Under Face)
        this.scene.add.text(400, 72, 'JUNIE AI', { 
            fontFamily: 'Courier New', fontSize: '10px', color: '#00AEEF' 
        }).setOrigin(0.5);

        // 4. Timer (Far Right)
        this.timeText = this.scene.add.text(780, 15, '60s', { 
            fontFamily: 'Courier New', fontSize: '28px', color: '#FFF' 
        }).setOrigin(1, 0);

        // 5. NEW: Brave Meter (Right of Junie, Before Timer)
        // Label above the bar
        this.scene.add.text(580, 18, 'SYNC LEVEL', { 
            fontSize: '10px', color: '#AAA' 
        }).setOrigin(0.5);

        // Background Bar (Gray) - Wider and Taller
        // Position: Starts at x=460, Centered vertically at y=38
        this.braveBarBg = this.scene.add.rectangle(460, 38, 240, 20, 0x333333).setOrigin(0, 0.5);

        // Fill Bar (Green) - Starts empty
        this.braveBarFill = this.scene.add.rectangle(460, 38, 0, 20, COLORS.TERM_GREEN).setOrigin(0, 0.5);
    }

    react(emotion) {
        if (!this.junieFace) return;

        switch(emotion) {
            case 'damage':
                this.junieFace.setFrame(2); // X Eyes
                this.scene.cameras.main.shake(200, 0.01); 
                // Reset to idle after 500ms
                this.scene.time.delayedCall(500, () => {
                    if (this.scene.isBraveMode) this.react('brave');
                    else this.react('idle');
                });
                break;

            case 'brave':
                this.junieFace.setFrame(1); // Angry/Focused Eyes
                // Glitch effect: Randomly offset x/y slightly
                this.scene.tweens.add({
                    targets: this.junieFace,
                    x: '+=2',
                    y: '+=2',
                    duration: 50,
                    yoyo: true,
                    repeat: 5
                });
                break;

            case 'idle':
                this.junieFace.setFrame(0); // Normal Eyes
                break;
        }
    }

    updateScore(newScore) {
        this.scoreText.setText('SCORE: ' + newScore);
        // Pulse animation
        this.scene.tweens.add({ targets: this.scoreText, scale: 1.2, duration: 100, yoyo: true });
    }

    flashDamage() {
        this.scoreText.setColor('#FF0000');
        this.scene.time.delayedCall(200, () => this.scoreText.setColor('#00AEEF'));
        this.react('damage');
    }

    updateTimer(timeLeft) {
        this.timeText.setText(timeLeft + 's');
        if (timeLeft <= 10) {
            this.timeText.setColor('#FF0055');
            this.timeText.setFontSize('36px');
            if (timeLeft % 2 === 0) this.junieFace.setVisible(false);
            else this.junieFace.setVisible(true);
        }
    }

    updateBraveMeter(value, isMax) {
        // Recalculate width based on new Max Width (240px)
        // Max value is 200 points
        const maxWidth = 240;
        const width = (value / 200) * maxWidth;
        
        this.braveBarFill.width = width;
        
        if (isMax) {
            this.braveBarFill.setFillStyle(COLORS.WHITE);
        } else {
            this.braveBarFill.setFillStyle(COLORS.TERM_GREEN);
        }
    }
}