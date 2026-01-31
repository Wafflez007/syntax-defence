class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMusic = null;
        this.isBraveMusic = false;

        // Initialize SFX Context (Keep the Synth!)
        this.initSynth();

        // NEW: Pre-load voices (Chrome needs this kickstart)
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
    }

    initSynth() {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.1; // SFX Volume
        this.masterGain.connect(this.ctx.destination);
    }

    // --- BGM LOGIC (MP3s) ---
    
    startMusic() {
        // Stop any existing music
        this.stopMusic();

        if (!this.scene.cache.audio.exists('bgm_tension')) {
            console.warn('Audio asset "bgm_tension" not found. Skipping music.');
            return;
        }

        // Play Normal Tension Track
        this.currentMusic = this.scene.sound.add('bgm_tension', {
            loop: true,
            volume: 0.5 // Adjust based on how loud your MP3 is
        });
        this.currentMusic.play();
        this.isBraveMusic = false;
    }

    switchMode(isBraveMode) {
        // Prevent restarting the same track if we are already in that mode
        if (this.isBraveMusic === isBraveMode) return;

        // 1. Enter Brave Mode
        if (isBraveMode) {
            this.currentMusic.stop();
            this.currentMusic = this.scene.sound.add('bgm_brave', {
                loop: true,
                volume: 0.6
            });
            this.currentMusic.play();
            this.isBraveMusic = true;
        } 
        // 2. Return to Normal Mode
        else {
            this.currentMusic.stop();
            this.currentMusic = this.scene.sound.add('bgm_tension', {
                loop: true,
                volume: 0.5
            });
            this.currentMusic.play();
            this.isBraveMusic = false;
        }
    }

    updateMusicPitch(timeLeft) {
        if (!this.currentMusic || this.isBraveMusic) return;

        // Dynamic Pitching: Speed up music in the last 10 seconds!
        if (timeLeft <= 10) {
            // Rate goes from 1.0 -> 1.2
            // This creates a "Panic" effect naturally
            this.currentMusic.setRate(1.0 + ((10 - timeLeft) * 0.02));
        } else {
            this.currentMusic.setRate(1.0);
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    // --- SFX LOGIC (Keep exactly as is) ---
    playSFX(type) {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
            case 'hit': 
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'hit_heavy': 
                osc.type = 'square'; osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc.start(t); osc.stop(t + 0.3);
                break;
            case 'hit_fast': 
                osc.type = 'triangle'; osc.frequency.setValueAtTime(800, t);
                osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'brave': 
                osc.type = 'sine'; osc.frequency.setValueAtTime(600, t);
                osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
                gain.gain.setValueAtTime(0.1, t);
                osc.start(t); osc.stop(t + 0.2);
                break;
        }
    }

    speak(text, type = 'normal') {
        if (!window.speechSynthesis) return;
        
        // Cancel any currently speaking text so they don't queue up
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Default AI Settings
        utterance.volume = 1;  // Max volume
        utterance.rate = 1.1;  // 10% faster (more robotic)
        utterance.pitch = 1.2; // Higher pitch (female/AI trope)

        // Custom Tones
        if (type === 'brave') {
            utterance.pitch = 1.3;
            utterance.rate = 1.2; // Excited
        } else if (type === 'critical') {
            utterance.pitch = 0.8; // Low pitch (System Failure sound)
            utterance.rate = 0.9;
        }

        // Voice Selection Strategy
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a specific "good" voice
        // "Google US English" is great on Chrome. "Samantha" is great on Mac. "Zira" on Windows.
        const preferredVoice = voices.find(v => 
            v.name.includes('Google US English') || 
            v.name.includes('Zira') || 
            v.name.includes('Samantha')
        );

        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }
}