class ResultScene extends Phaser.Scene {
    constructor() { super('ResultScene'); }

    create(data) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // Background Card
        this.add.rectangle(cx, cy, 600, 450, 0x000000, 0.95).setStrokeStyle(2, COLORS.C9_BLUE);

        // Header Text
        this.add.text(cx, cy - 160, 'SESSION COMPLETE', {
            fontFamily: 'Courier New', fontSize: '32px', color: '#FFF'
        }).setOrigin(0.5);

        // Score Section
        this.add.text(cx, cy - 90, 'FINAL SCORE', { fontSize: '16px', color: '#888' }).setOrigin(0.5);
        this.add.text(cx, cy - 50, data.score, {
            fontFamily: 'Impact', fontSize: '64px', color: '#00AEEF'
        }).setOrigin(0.5);

        // --- NEW: LOGO FOOTER ---
        // Placing them at the bottom of the card (cy + 180)
        // 1. Cloud9 Logo (Left)
        this.add.image(cx - 80, cy + 180, 'logo_c9')
            .setOrigin(0.5)
            .setScale(0.15); // Adjust this scale if needed

        // 2. The 'x' separator
        this.add.text(cx, cy + 180, 'x', { 
            fontSize: '20px', color: '#555' 
        }).setOrigin(0.5);

        // 3. JetBrains Logo (Right)
        this.add.image(cx + 80, cy + 180, 'logo_jb')
            .setOrigin(0.5)
            .setScale(0.060); // Adjust this scale if needed

        // Call the form logic
        this.createInputForm(cx, cy, data.score);
    }

    createInputForm(cx, cy, score) {
        // Create HTML Form
        const formDiv = document.createElement('div');
        formDiv.id = 'lead-capture-form';
        // Added some top margin to push it below the score but above the logos
        formDiv.innerHTML = `
            <input type="text" id="player-tag" class="terminal-input" placeholder="ENTER ALIAS" maxlength="12" autocomplete="off">
            <br>
            <button id="commit-btn" class="terminal-btn">COMMIT SCORE</button>
        `;
        document.body.appendChild(formDiv);

        const btn = document.getElementById('commit-btn');
        const input = document.getElementById('player-tag');
        input.focus();

        const submitHandler = () => {
            const alias = input.value.toUpperCase() || 'ANONYMOUS';
            this.handleSubmission(alias, score, formDiv);
        };

        btn.onclick = submitHandler;
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitHandler();
        });
        
        this.formElement = formDiv;
    }

    handleSubmission(alias, score, formDiv) {
        // 1. Hide Form
        formDiv.classList.add('hidden');

        // 2. Show "Uploading" Animation
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Feedback Text
        const statusText = this.add.text(cx, cy + 50, '> UPLOADING TO CLOUD...', { 
            fontFamily: 'Courier New', fontSize: '18px', color: '#23D18B' 
        }).setOrigin(0.5);

        // 3. SEND DATA TO GOOGLE SHEET
        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // 'no-cors' is required for Google Scripts simple POSTs
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: alias, score: score })
        })
        .then(() => {
            // 4. Success -> Transition
            statusText.setText('> UPLOAD COMPLETE.');
            this.time.delayedCall(1000, () => {
                if (this.formElement) this.formElement.remove();
                this.scene.start('AttractMode'); 
            });
        })
        .catch(err => {
            // Fallback if internet fails
            console.error('Upload Failed', err);
            statusText.setText('> OFFLINE MODE SAVED.');
            this.time.delayedCall(1000, () => {
                if (this.formElement) this.formElement.remove();
                this.scene.start('AttractMode'); 
            });
        });
    }
}