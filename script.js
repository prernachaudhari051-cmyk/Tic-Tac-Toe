/**
 * Tic-Tac-Toe Deluxe
 * Includes:
 * 1. 2-Player (PvP) & AI Modes (Easy & Unbeatable Minimax)
 * 2. Synthesized Sound Effects (Web Audio API - zero external assets)
 * 3. Physics-based Confetti Cannon for victories
 */

// ==========================================
// 1. GAME STATE & CONSTANTS
// ==========================================
let currentPlayer = "X";
let boardState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let currentGameMode = "pvp"; // "pvp", "ai-easy", "ai-hard"
let soundEnabled = true;

const scores = {
  X: 0,
  O: 0,
  ties: 0,
};

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],            // Diagonals
];

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const statusText = document.getElementById("status-text");
const cells = document.querySelectorAll(".cell");
const btnRestart = document.getElementById("btn-restart");
const btnResetScores = document.getElementById("btn-reset-scores");
const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");
const scoreTiesElement = document.getElementById("score-ties");
const labelX = document.getElementById("label-x");
const labelO = document.getElementById("label-o");
const modeButtons = document.querySelectorAll(".mode-btn");
const btnSoundToggle = document.getElementById("btn-sound-toggle");
const confettiCanvas = document.getElementById("confetti-canvas");

// ==========================================
// 3. SYNTHESIZED SOUND EFFECTS (Web Audio API)
// ==========================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = "sine", duration = 0.1, delay = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  setTimeout(() => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio playback safety catch
    }
  }, delay * 1000);
}

function soundMove(player) {
  if (player === "X") {
    playTone(480, "sine", 0.08);
  } else {
    playTone(360, "sine", 0.08);
  }
}

function soundWin() {
  // Joyful 3-tone victory chord
  playTone(523.25, "triangle", 0.2, 0);     // C5
  playTone(659.25, "triangle", 0.2, 0.12);  // E5
  playTone(783.99, "triangle", 0.35, 0.24); // G5
}

function soundTie() {
  playTone(280, "sawtooth", 0.25);
}

// ==========================================
// 4. CONFETTI CELEBRATION CANNON
// ==========================================
let confettiParticles = [];
let confettiAnimationId = null;

function triggerConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  confettiParticles = [];
  const colors = ["#38bdf8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.vRotation;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      confettiAnimationId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

// ==========================================
// 5. GAMEPLAY LOGIC & MOVE HANDLING
// ==========================================
function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-cell-index"));

  if (boardState[index] !== "" || !isGameActive) return;

  makeMove(index, currentPlayer);

  // If playing against AI and game is still active, trigger AI turn
  if (isGameActive && currentGameMode.startsWith("ai-") && currentPlayer === "O") {
    // Disable board temporarily while AI "thinks"
    isGameActive = false;
    statusText.innerHTML = `AI is thinking...`;

    setTimeout(() => {
      isGameActive = true;
      aiMakeMove();
    }, 320);
  }
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;

  soundMove(player);
  evaluateGameOutcome();
}

function evaluateGameOutcome() {
  let roundWon = false;
  let winningLine = [];

  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (
      boardState[a] !== "" &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      roundWon = true;
      winningLine = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    const winnerName =
      currentGameMode.startsWith("ai-") && currentPlayer === "O"
        ? "AI"
        : currentGameMode.startsWith("ai-") && currentPlayer === "X"
        ? "You"
        : `Player ${currentPlayer}`;

    statusText.innerHTML = `🎉 ${winnerName} Won!`;
    isGameActive = false;
    scores[currentPlayer]++;
    updateScoreboardUI();

    winningLine.forEach((idx) => cells[idx].classList.add("winner"));
    soundWin();
    triggerConfetti();
    return;
  }

  // Check for Tie
  if (!boardState.includes("")) {
    statusText.textContent = "🤝 It's a Tie / Draw!";
    isGameActive = false;
    scores.ties++;
    updateScoreboardUI();
    soundTie();
    return;
  }

  // Switch Turn
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnStatusText();
}

function updateTurnStatusText() {
  if (currentGameMode.startsWith("ai-")) {
    if (currentPlayer === "X") {
      statusText.innerHTML = `Your Turn (<span class="highlight-x">X</span>)`;
    } else {
      statusText.innerHTML = `AI's Turn (<span class="highlight-o">O</span>)`;
    }
  } else {
    const colorClass = currentPlayer === "X" ? "highlight-x" : "highlight-o";
    statusText.innerHTML = `Player <span class="${colorClass}">${currentPlayer}</span>'s Turn`;
  }
}

// ==========================================
// 6. AI OPPONENT LOGIC (EASY & UNBEATABLE MINIMAX)
// ==========================================
function aiMakeMove() {
  if (!isGameActive) return;

  let moveIndex;

  if (currentGameMode === "ai-easy") {
    // Easy: Random available cell
    const emptyCells = boardState
      .map((val, idx) => (val === "" ? idx : null))
      .filter((val) => val !== null);
    moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    // Unbeatable: Minimax algorithm
    moveIndex = findBestMove(boardState);
  }

  if (moveIndex !== undefined && moveIndex !== null) {
    makeMove(moveIndex, "O");
  }
}

function checkBoardWinner(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes("")) return "tie";
  return null;
}

// Minimax algorithm guarantees optimal decision
function minimax(board, depth, isMaximizing) {
  const winner = checkBoardWinner(board);
  if (winner === "O") return 10 - depth; // AI wins
  if (winner === "X") return depth - 10; // Human wins
  if (winner === "tie") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

// ==========================================
// 7. CONTROLS, MODES & RESET
// ==========================================
function setGameMode(newMode) {
  currentGameMode = newMode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-mode") === newMode);
  });

  if (currentGameMode.startsWith("ai-")) {
    labelX.textContent = "You (X)";
    labelO.textContent = "AI (O)";
  } else {
    labelX.textContent = "Player X";
    labelO.textContent = "Player O";
  }

  resetAllScores();
}

function updateScoreboardUI() {
  scoreXElement.textContent = scores.X;
  scoreOElement.textContent = scores.O;
  scoreTiesElement.textContent = scores.ties;
}

function restartRound() {
  currentPlayer = "X";
  boardState = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  updateTurnStatusText();

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner");
    cell.disabled = false;
  });
}

function resetAllScores() {
  scores.X = 0;
  scores.O = 0;
  scores.ties = 0;
  updateScoreboardUI();
  restartRound();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  btnSoundToggle.textContent = soundEnabled ? "🔊" : "🔇";
}

// ==========================================
// 8. EVENT LISTENERS
// ==========================================
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
btnRestart.addEventListener("click", restartRound);
btnResetScores.addEventListener("click", resetAllScores);
btnSoundToggle.addEventListener("click", toggleSound);

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setGameMode(btn.getAttribute("data-mode"));
  });
});
