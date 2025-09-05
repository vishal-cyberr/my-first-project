// Your original arrays and variables
const questions = [];
const answers = [];
const userInputs = [];
const attempts = [];
let currentIndex = 0;
let score = 0;
// Load reward images dynamically (assumes images named 1.jpg, 2.jpg ... in root folder)
const vikramImages = Array.from({ length: 52 }, (_, i) => `${i + 1}.jpg`);

// Puzzle constants
const PUZZLE_SIZE = 3; // 3x3 grid
const TOTAL_PIECES = PUZZLE_SIZE * PUZZLE_SIZE;
const PUZZLE_IMAGE = 'puzzle.jpg'; // The full puzzle image (put this file in your folder)

// DOM Elements
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const imageBox = document.getElementById("imageBox");
const scoreBox = document.getElementById("score");
const fireworksCanvas = document.getElementById("fireworks");

// Fireworks code
document.addEventListener('DOMContentLoaded', () => {
  const canvas = fireworksCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener('resize', resize);
  resize();

  function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return [r, g, b];
  }

  let particles = [];
  let running = false;

  function createBurst(cx, cy, hue, count = 90) {
    hue = hue === undefined ? Math.random() * 360 : hue;
    const [r, g, b] = hslToRgb(hue, 100, 55);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * (0.7 + Math.random() * 1.6);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2.6 + 0.6,
        life: 1,
        decay: Math.random() * 0.015 + 0.006,
        rgb: [r, g, b],
        gravity: 0.02 + Math.random() * 0.03,
      });
    }
  }

  function animate() {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.998;
      p.vy *= 0.998;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }
      const alpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${alpha})`;
      ctx.arc(p.x, p.y, p.r + (1 - p.life) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.arc(p.x, p.y, Math.max(0.3, p.r * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      running = false;
    }
  }

  window.launchFireworks = (ProOptions = {}) => {
    const bursts = ProOptions.bursts || Math.floor(3 + Math.random() * 3);
    for (let b = 0; b < bursts; b++) {
      const cx = Math.random() * window.innerWidth;
      const cy = Math.random() * (window.innerHeight * 0.45) + 40;
      const hue = Math.random() * 360;
      createBurst(cx, cy, hue, 80 + Math.floor(Math.random() * 40));
    }
    if (!running) {
      running = true;
      requestAnimationFrame(animate);
    }
  };
});

// Generate a math question
function generateQuestion() {
  let num1, num2, op, answer;
  const operators = ["+", "-", "×", "÷"];
  do {
    num1 = Math.floor(Math.random() * 260) + 1;
    num2 = Math.floor(Math.random() * 210) + 1;
    op = operators[Math.floor(Math.random() * operators.length)];
    if (op === "+") answer = num1 + num2;
    else if (op === "-") answer = num1 - num2;
    else if (op === "×") answer = num1 * num2;
    else if (op === "÷" && num1 % num2 === 0) answer = num1 / num2;
  } while (op === "÷" && num1 % num2 !== 0);
  questions.push(`${num1} ${op} ${num2}`);
  answers.push(answer);
  userInputs.push("");
  attempts.push(0);
}

// Show question
function showQuestion(index) {
  if (index >= questions.length) generateQuestion();
  questionBox.textContent = `Q${index + 1}: ${questions[index]} = `;
  answerInput.value = userInputs[index];
  feedback.textContent = "";
  // Do not clear puzzle or fireworks here to keep visible
}

// Puzzle reward functions
function initPuzzle() {
  imageBox.innerHTML = ''; // Clear previous content
  const container = document.createElement('div');
  container.id = 'puzzleContainer';

  for (let i = 0; i < TOTAL_PIECES; i++) {
    const piece = document.createElement('div');
    piece.classList.add('puzzlePiece');
    // Set background slice position
    const row = Math.floor(i / PUZZLE_SIZE);
    const col = i % PUZZLE_SIZE;
    piece.style.backgroundImage = `url(${PUZZLE_IMAGE})`;
    piece.style.backgroundPosition = `${(-col * 100) / (PUZZLE_SIZE - 1)}% ${(-row * 100) / (PUZZLE_SIZE - 1)}%`;
    container.appendChild(piece);
  }
  imageBox.appendChild(container);
}

function updatePuzzle(score) {
  const pieces = [...document.querySelectorAll('#puzzleContainer .puzzlePiece')];
  pieces.forEach((piece, index) => {
    if (index < score && index < TOTAL_PIECES) {
      piece.classList.add('visible');
    } else {
      piece.classList.remove('visible');
    }
  });
}

// Modified checkAnswer to reward puzzle slices
function checkAnswer() {
  const input = answerInput.value.trim();
  userInputs[currentIndex] = input;
  if (!input) {
    feedback.textContent = "⚠ Please enter an answer!";
    feedback.style.color = "orange";
    return;
  }
  if (Number(input) === answers[currentIndex]) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    score++;
    scoreBox.textContent = `Score: ${score}`;

    if (!document.getElementById('puzzleContainer')) {
      initPuzzle();
    }
    updatePuzzle(score);

    launchFireworks();
  } else {
    attempts[currentIndex]++;
    if (attempts[currentIndex] >= 2) {
      feedback.textContent = `❌ Wrong! Correct answer is ${answers[currentIndex]}`;
      feedback.style.color = "red";
    } else {
      feedback.textContent = `⚠ Try again!`;
      feedback.style.color = "orange";
    }
  }
}

// Navigation
function nextQuestion() {
  currentIndex++;
  showQuestion(currentIndex);
}
function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
}

// Toggle section visibility
function toggleSection(id) {
  const sec = document.getElementById(id);
  if (sec.style.display === "none" || sec.style.display === "") {
    sec.style.display = "block";
  } else {
    sec.style.display = "none";
  }
}

// User name handling
document.getElementById("startQuizBtn").onclick = () => {
  const nameInput = document.getElementById("userNameInput");
  if (!nameInput.value.trim()) {
    alert("Please enter your name to start!");
    return;
  }
  localStorage.setItem("userName", nameInput.value.trim());
  welcomeUser(nameInput.value.trim());
  document.getElementById("userNameSection").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  document.getElementById("controls").style.display = "block";
  loadProgress();
  showQuestion(currentIndex);
};

// Welcome user message
function welcomeUser(name) {
  let wUser = document.getElementById("welcomeUser");
  if (!wUser) {
    wUser = document.createElement("div");
    wUser.id = "welcomeUser";
    questionBox.parentNode.insertBefore(wUser, questionBox);
  }
  wUser.textContent = `Welcome, ${name}! Let's begin the challenge 🌟`;
}

// Save quiz progress to localStorage
function saveProgress() {
  const progress = {
    userName: localStorage.getItem("userName"),
    score: score,
    answers: userInputs,
  };
  localStorage.setItem("quizProgress", JSON.stringify(progress));
}

// Load quiz progress from localStorage
function loadProgress() {
  const progress = JSON.parse(localStorage.getItem("quizProgress"));
  if (progress) {
    score = progress.score || 0;
    userInputs.length = 0;
    Array.prototype.push.apply(userInputs, progress.answers || []);
    scoreBox.textContent = `Score: ${score}`;

    // Initialize puzzle and show saved slices for loaded score
    if (score > 0 && !document.getElementById('puzzleContainer')) {
      initPuzzle();
    }
    if (score > 0) updatePuzzle(score);
  }
}

// Save progress on answer check and navigation
document.getElementById("checkBtn").addEventListener("click", () => {
  checkAnswer();
  saveProgress();
});
document.getElementById("nextBtn").addEventListener("click", () => {
  nextQuestion();
  saveProgress();
});
document.getElementById("prevBtn").addEventListener("click", () => {
  prevQuestion();
  saveProgress();
});

// Gallery feature to load images as rewards (unchanged)
function loadGallery() {
  const gallery = document.getElementById("galleryImages");
  gallery.innerHTML = "";
  for (let i = 0; i < vikramImages.length && i < score; i++) {
    const img = document.createElement("img");
    img.src = vikramImages[i];
    img.alt = `Reward ${i + 1}`;
    gallery.appendChild(img);
  }
}

// Mini game variables & logic (unchanged)
let gameInterval;
let gameScore = 0;
let currentGameAnswer;

document.getElementById("startGameBtn").onclick = () => {
  const gameArea = document.getElementById("gameArea");
  gameScore = 0;
  let timeLeft = 30;
  gameArea.innerHTML = `<p>Time left: <span id="timeLeft">${timeLeft}</span>s</p><p>Score: <span id="gameScore">${gameScore}</span></p><div id="gameQuestion"></div><input type="text" id="gameAnswer" placeholder="Answer"><button id="submitGameAnswer">Submit</button>`;

  function nextGameQuestion() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    currentGameAnswer = a + b;
    document.getElementById("gameQuestion").textContent = `What is ${a} + ${b}?`;
    document.getElementById("gameAnswer").value = "";
  }

  nextGameQuestion();

  document.getElementById("submitGameAnswer").onclick = () => {
    const ans = Number(document.getElementById("gameAnswer").value.trim());
    if (ans === currentGameAnswer) {
      gameScore++;
      document.getElementById("gameScore").textContent = gameScore;
    }
    nextGameQuestion();
  };

  gameInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      alert(`Time's up! Your game score: ${gameScore}`);
    }
  }, 1000);
};
