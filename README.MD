# 🛡️ Syntax Defense

> **Defend the Core using only your hands.** > A gesture-controlled arcade survival game powered by MediaPipe AI, Phaser.js, and Google Cloud.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Competition_Ready-green.svg)

## 📖 Inspiration
We wanted to gamify the daily struggle of a developer: fighting off bugs and syntax errors to protect the codebase. Inspired by the "Iron Man" interface, we created a touchless, hygienic, and futuristic arcade experience perfect for convention booths.

## 🎮 What it does
**Syntax Defense** is a browser-based game where you control a rotating shield using real-time hand tracking.
* **Hand Tracking:** Your physical hand movements rotate the digital shield.
* **Visual Feedback:** A wireframe skeleton overlays your real hand, proving the AI is "locked in."
* **Brave Mode:** Triggers Matrix-style code rain and voice-acted feedback when you perform perfectly.
* **Live Leaderboard:** Scores are uploaded to a Google Sheet and displayed via QR code.

## 🛠️ Built With
* **Phaser 3.80** (Game Engine & WebGL Rendering)
* **MediaPipe Hands** (Computer Vision & AI Tracking)
* **Web Speech API** (Text-to-Speech Voice Assistant "Junie")
* **Web Audio API** (Real-time SFX)
* **Google Apps Script** (Serverless Backend)

## 🚀 How to Run Locally

### Prerequisites
Because this project uses the Webcam (MediaPipe), **it must run on a secure context (HTTPS) or Localhost**. It will not work if you simply double-click `index.html`.

### Method 1: VS Code (Recommended)
1.  Clone this repository.
2.  Open the folder in **VS Code**.
3.  Install the **"Live Server"** extension.
4.  Right-click `index.html` and select **"Open with Live Server"**.
5.  Allow Camera permissions in your browser.

### Method 2: Python Simple Server
If you have Python installed:
```bash
# Navigate to the project folder
cd syntax-defense

# Start server
python -m http.server 8000