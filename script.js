document.addEventListener('DOMContentLoaded', () => {
  // Your original arrays and variables
  const questions = [];
  const answers = [];
  const userInputs = [];
  const attempts = [];
  let currentIndex = 0;
  let score = 0;

  // Puzzle constants
  const PUZZLE_SIZE = 3; // 3x3 grid
  const TOTAL_PIECES = PUZZLE_SIZE * PUZZLE_SIZE;
  const PUZZLE_IMAGE = 'puzzle.jpg'; // The full puzzle image (put this file in your folder)
  // Load reward images dynamically (assumes images named 1.jpg, 2.jpg ... in root folder)
  const vikramImages = Array.from({ length: 52 }, (_, i) => `${i + 1}.jpg`);

  // DOM Elements
  const questionBox = document.getElementById("questionBox");
  const answerInput = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");
  const imageBox = document.getElementById("imageBox");
  const scoreBox = document.getElementById("score");
  const fireworksCanvas = document.getElementById("fireworks");

  // ... (rest of your fireworks code remains unchanged) ...

  // Fireworks setup and functions here...

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

  // Check answer
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
    const gameArea = document.getElement
