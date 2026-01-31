class ResultScene extends Phaser.Scene {
    constructor() { super('ResultScene'); }

    create(data) {
        // Get dynamic screen dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        const cx = width / 2;
        const cy = height / 2;

        // Dynamic Sizing Logic
        // The card will take up 80% of width (max 600px) and 80% of height (max 500px)
        const cardWidth = Math.min(600, width * 0.85);
        const cardHeight = Math.min(500, height * 0.85);

        // Responsive Font Sizes (Scale based on height)
        const headerSize = Math.max(24, height * 0.05);  // 5% of screen height
        const scoreLabelSize = Math.max(14, height * 0.025);
        const scoreSize = Math.max(48, height * 0.1);    // 10% of screen height

        // 1. Background Card
        this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x000000, 0.95)
            .setStrokeStyle(2, COLORS.C9_BLUE);

        // 2. Header Text (Positioned relative to top of card)
        const contentTop = cy - (cardHeight / 2) + (cardHeight * 0.15);
        
        this.add.text(cx, contentTop, 'SESSION COMPLETE', {
            fontFamily: 'Courier New', 
            fontSize: `${headerSize}px`, 
            color: '#FFF'
        }).setOrigin(0.5);

        // 3. Score Section
        const scoreY = contentTop + (cardHeight * 0.15); // Push down slightly
        
        this.add.text(cx, scoreY, 'FINAL SCORE', { 
            fontSize: `${scoreLabelSize}px`, 
            color: '#888' 
        }).setOrigin(0.5);
        
        this.add.text(cx, scoreY + (scoreLabelSize * 2), data.score, {
            fontFamily: 'Impact', 
            fontSize: `${scoreSize}px`, 
            color: '#00AEEF'
        }).setOrigin(0.5);

        // 4. Logo Footer (Positioned relative to bottom of card)
        const footerY = cy + (cardHeight / 2) - (cardHeight * 0.12);
        const logoSpacing = cardWidth * 0.25; // Space logos based on card width

        // Cloud9 Logo
        this.add.image(cx - logoSpacing, footerY, 'logo_c9')
            .setOrigin(0.5)
            .setScale(Math.min(0.15, width * 0.0003)); // Scale relative to screen width

        // Separator 'x'
        this.add.text(cx, footerY, 'x', { 
            fontSize: `${Math.max(16, height * 0.03)}px`, 
            color: '#555' 
        }).setOrigin(0.5);

        // JetBrains Logo
        this.add.image(cx + logoSpacing, footerY, 'logo_jb')
            .setOrigin(0.5)
            .setScale(Math.min(0.06, width * 0.00012));

        // 5. Create HTML Form
        // We pass the dimensions so the HTML can also be responsive
        this.createInputForm(cx, cy, cardWidth, cardHeight, data.score);
    }

    createInputForm(cx, cy, cardWidth, cardHeight, score) {
        const formDiv = document.createElement('div');
        formDiv.id = 'lead-capture-form';
        
        // CSS allows us to center it absolutely over the canvas
        // We set the top relative to the score position (approx 60% down the screen)
        formDiv.style.position = 'absolute';
        formDiv.style.left = '50%';
        formDiv.style.top = '60%'; // Looks good on most screens
        formDiv.style.transform = 'translate(-50%, -50%)';
        formDiv.style.textAlign = 'center';
        formDiv.style.width = '100%';

        formDiv.innerHTML = `
            <style>
                .terminal-input {
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid #00AEEF;
                    color: #FFF;
                    font-family: 'Courier New', monospace;
                    font-size: clamp(16px, 4vw, 24px); /* Responsive Font */
                    text-align: center;
                    width: ${cardWidth * 0.6}px; /* 60% of card width */
                    padding: 10px;
                    outline: none;
                }
                .terminal-btn {
                    margin-top: 20px;
                    background: #00AEEF;
                    border: none;
                    color: #000;
                    padding: 10px 20px;
                    font-family: 'Impact', sans-serif;
                    font-size: clamp(14px, 3vw, 20px);
                    cursor: pointer;
                    text-transform: uppercase;
                }
                .terminal-btn:hover { background: #FFF; }
                .hidden { display: none; }
            </style>
            <input type="text" id="player-tag" class="terminal-input" placeholder="ENTER ALIAS" maxlength="12" autocomplete="off">
            <br>
            <button id="commit-btn" class="terminal-btn">COMMIT SCORE</button>
        `;
        document.body.appendChild(formDiv);

        const btn = document.getElementById('commit-btn');
        const input = document.getElementById('player-tag');
        
        // Prevent keyboard from scrolling on mobile
        input.addEventListener('focus', () => {
             // Optional: Scroll to view if needed
        });
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
        formDiv.classList.add('hidden');

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
        
        const statusText = this.add.text(cx, cy + (this.scale.height * 0.1), '> UPLOADING TO CLOUD...', { 
            fontFamily: 'Courier New', fontSize: '18px', color: '#23D18B' 
        }).setOrigin(0.5);

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: alias, score: score })
        })
        .then(() => {
            statusText.setText('> UPLOAD COMPLETE.');
            this.time.delayedCall(1000, () => {
                if (this.formElement) this.formElement.remove();
                this.scene.start('AttractMode'); 
            });
        })
        .catch(err => {
            console.error('Upload Failed', err);
            statusText.setText('> OFFLINE MODE SAVED.');
            this.time.delayedCall(1000, () => {
                if (this.formElement) this.formElement.remove();
                this.scene.start('AttractMode'); 
            });
        });
    }
}