# Tic-Tac-Toe Deluxe 🎮

A modern, responsive web-based Tic-Tac-Toe game built from scratch using HTML5, CSS3, and Vanilla JavaScript. Features an unbeatable AI powered by the Minimax algorithm, synthesized sound effects, and celebration animations.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- **3 Game Modes:**
  - 👥 **2 Players (Local PvP):** Play with a friend on the same device.
  - 🤖 **vs AI (Easy):** Casual mode where the computer plays random open cells.
  - 🧠 **vs AI (Unbeatable):** Uses the **Minimax** game-theory algorithm to ensure mathematically optimal moves (impossible to beat!).
- **🔊 Synthesized Web Audio API:**
  - Realistic audio tones generated via code without external `.mp3` files (zero loading lag).
  - Sound toggle button (🔊 / 🔇) to easily mute.
- **🎉 Confetti Cannon:** Physics-based particle animation triggers when a player wins.
- **📱 Responsive Modern UI:** Dark theme with glassmorphism effects and CSS Grid layout.
- **📊 Real-time Scoreboard:** Tracks Player X wins, Player O / AI wins, and ties.

---

## 🚀 How to Run Locally

### Option 1: Direct File
Simply double-click `index.html` in your file explorer to open it in any web browser.

### Option 2: Local HTTP Server (Python)
```bash
# Clone or navigate to the directory
cd tic-tac-toe

# Start server
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## 🛠️ Project Structure

```
tic-tac-toe/
├── index.html     # Semantic markup and UI elements
├── style.css      # Modern dark-mode styling and animations
├── script.js      # Game state, Minimax algorithm, Web Audio API, and confetti
├── .gitignore     # Files to exclude from version control
└── README.md      # Project documentation
```

---

## 📄 License
MIT License. Free to use, modify, and learn from!
