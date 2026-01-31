class HandInputManager {
    constructor(scene) {
        this.scene = scene;
        this.x = 400; // Default center
        this.y = 300;
        this.isActive = false;
        this.videoElement = null;
        this.hands = null;
        this.camera = null;

        // Create a visual "Cursor" so the player knows where their hand is
        this.cursor = scene.add.circle(400, 300, 15, 0x23D18B).setDepth(100).setAlpha(0);
        this.cursorRing = scene.add.circle(400, 300, 25).setStrokeStyle(2, 0x23D18B).setDepth(100).setAlpha(0);
    }

    async start() {
        // 1. Setup Video Element (Hidden)
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // 2. Initialize MediaPipe Hands
        this.hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        // 3. Start Camera
        // We use a simplified camera util provided by MediaPipe logic, 
        // or just standard navigator.mediaDevices
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            this.videoElement.srcObject = stream;
            this.videoElement.play();

            // Loop to send frames to MediaPipe
            const sendFrame = async () => {
                if (this.videoElement.paused || this.videoElement.ended) return;
                await this.hands.send({image: this.videoElement});
                requestAnimationFrame(sendFrame);
            };
            sendFrame();
            
            this.isActive = true;
            console.log("MediaPipe Started");
        } catch (e) {
            console.error("Camera failed:", e);
        }
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // We use the Index Finger Tip (Landmark 8) as the pointer
            // OR the Wrist (Landmark 0) for stability. Let's use Index Tip.
            const indexTip = landmarks[8];
            
            // MediaPipe returns 0.0 to 1.0 (normalized)
            // Note: Camera is mirrored! We must flip X.
            const rawX = 1 - indexTip.x; 
            const rawY = indexTip.y;

            // Map to Game Screen (800x600)
            // We add some "Sensitivity" scaling so you don't have to reach edges of camera
            this.x = Phaser.Math.Clamp((rawX - 0.5) * 1.5 + 0.5, 0, 1) * 800;
            this.y = Phaser.Math.Clamp((rawY - 0.5) * 1.5 + 0.5, 0, 1) * 600;

            // Update Visual Cursor
            this.cursor.setPosition(this.x, this.y).setAlpha(1);
            this.cursorRing.setPosition(this.x, this.y).setAlpha(1);
        } else {
            // No hand detected - fade out cursor
            this.cursor.setAlpha(0.5);
            this.cursorRing.setAlpha(0.5);
        }
    }

    getPointer() {
        return { x: this.x, y: this.y };
    }

    stop() {
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        this.isActive = false;
        this.cursor.destroy();
        this.cursorRing.destroy();
    }
}