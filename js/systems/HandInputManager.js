class HandInputManager {
    constructor(scene) {
        this.scene = scene;
        this.x = 400; 
        this.y = 300;
        this.isActive = false;
        this.videoElement = null;
        this.hands = null;

        // 1. The Cursor (The Green Target)
        this.cursor = scene.add.circle(400, 300, 10, 0x00FF00).setDepth(101).setAlpha(0);
        this.cursorRing = scene.add.circle(400, 300, 20).setStrokeStyle(2, 0x00FF00).setDepth(101).setAlpha(0);

        // 2. NEW: The Wireframe Mesh (The Blue Skeleton)
        this.mesh = scene.add.graphics().setDepth(100);
    }

    async start() {
        // Setup Video (Hidden)
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // Init MediaPipe
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

        // Start Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            this.videoElement.srcObject = stream;
            this.videoElement.play();

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
        // Clear previous frame's lines
        this.mesh.clear();

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            this.latestLandmarks = landmarks;

            // 1. Update Cursor Position (Index Finger Tip is #8)
            const indexTip = landmarks[8];
            const rawX = 1 - indexTip.x; // Mirror flip
            const rawY = indexTip.y;

            // Sensitivity Scaling (1.5x)
            this.x = Phaser.Math.Clamp((rawX - 0.5) * 1.5 + 0.5, 0, 1) * this.scene.scale.width;
            this.y = Phaser.Math.Clamp((rawY - 0.5) * 1.5 + 0.5, 0, 1) * this.scene.scale.height;

            this.cursor.setPosition(this.x, this.y).setAlpha(1);
            this.cursorRing.setPosition(this.x, this.y).setAlpha(1);

            // 2. NEW: Draw the Skeleton
            this.drawSkeleton(landmarks);

        } else {
            this.cursor.setAlpha(0);
            this.cursorRing.setAlpha(0);
        }
    }

    drawSkeleton(landmarks) {
        // Style: Cloud9 Blue, 2px thick, 60% opacity
        this.mesh.lineStyle(2, 0x00AEEF, 0.6);
        this.mesh.fillStyle(0xFFFFFF, 0.8);

        // Helper to map 0-1 coords to Screen Pixels
        const toScreen = (lm) => {
            return {
                x: (1 - lm.x) * this.scene.scale.width, // Note the 1-x for mirroring!
                y: lm.y * this.scene.scale.height
            };
        };

        // Draw Joints (Dots)
        for (let i = 0; i < landmarks.length; i++) {
            const pt = toScreen(landmarks[i]);
            // Draw small white dots at joints
            this.mesh.fillCircle(pt.x, pt.y, 3);
        }

        // Draw Bones (Lines)
        // MediaPipe Hand Indices:
        // Wrist: 0
        // Thumb: 0 -> 1 -> 2 -> 3 -> 4
        // Index: 0 -> 5 -> 6 -> 7 -> 8
        // Middle: 0 -> 9 -> 10 -> 11 -> 12
        // Ring: 0 -> 13 -> 14 -> 15 -> 16
        // Pinky: 0 -> 17 -> 18 -> 19 -> 20

        const fingers = [
            [0, 1, 2, 3, 4],       // Thumb
            [0, 5, 6, 7, 8],       // Index
            [9, 10, 11, 12],       // Middle (connects to wrist implicitly via palm)
            [13, 14, 15, 16],      // Ring
            [0, 17, 18, 19, 20]    // Pinky
        ];

        // Draw Finger Chains
        fingers.forEach(chain => {
            this.mesh.beginPath();
            const start = toScreen(landmarks[chain[0]]);
            this.mesh.moveTo(start.x, start.y);
            
            for (let i = 1; i < chain.length; i++) {
                const pt = toScreen(landmarks[chain[i]]);
                this.mesh.lineTo(pt.x, pt.y);
            }
            this.mesh.strokePath();
        });

        // Connect the knuckles (Palm Base) to close the hand
        // 5 (Index Base) -> 9 (Middle Base) -> 13 (Ring Base) -> 17 (Pinky Base)
        this.mesh.beginPath();
        const p5 = toScreen(landmarks[5]);
        this.mesh.moveTo(p5.x, p5.y);
        [9, 13, 17].forEach(idx => {
            const pt = toScreen(landmarks[idx]);
            this.mesh.lineTo(pt.x, pt.y);
        });
        this.mesh.strokePath();
    }

    getPointer() {
        return { x: this.x, y: this.y };
    }
    
    // Check for Fist Gesture (Fingertips close to Palm)
    isFist() {
        if (!this.latestLandmarks) return false;
        const lm = this.latestLandmarks;
        // Check distance of Index Tip (8) and Middle Tip (12) from Wrist (0)
        // If they are physically close, the hand is curled.
        const d8 = Math.hypot(lm[8].x - lm[0].x, lm[8].y - lm[0].y);
        const d12 = Math.hypot(lm[12].x - lm[0].x, lm[12].y - lm[0].y);
        return (d8 < 0.1 && d12 < 0.1); 
    }

    stop() {
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        this.isActive = false;
        this.cursor.destroy();
        this.cursorRing.destroy();
        this.mesh.destroy(); // Destroy the skeleton
    }
}