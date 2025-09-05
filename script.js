// Wait until the page is fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

  // 🧠 Quiz data storage
  const questions = [];     // Stores generated math questions
  const answers = [];       // Stores correct answers
  const userInputs = [];    // Stores user's answers
  const attempts = [];      // Tracks how many times each question was attempted
  let currentIndex = 0;     // Tracks which question is currently shown
  let score = 0;            // Tracks user's score

  // 🧩 Puzzle reward setup
  const PUZZLE_SIZE = 3;    // 3x3 puzzle grid
  const TOTAL_PIECES = PUZZLE_SIZE * PUZZLE_SIZE;
  const PUZZLE_IMAGE = 'puzzle.jpg'; // Image used for puzzle reward

  // 🖼️ Reward gallery images (1.jpg to 52.jpg)
  const vikramImages = Array.from({ length: 52 }, (_, i) => `${i + 1}.jpg`);

  // 🔗 DOM elements
  const questionBox = document.getElementById("questionBox");
  const answerInput = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");
  const imageBox = document.getElementById("imageBox");
  const scoreBox = document.getElementById("score");
  const fireworksCanvas = document.getElementById("fireworks");

  // 🔢 Generate a random math question
  function generateQuestion() {
    let num1, num2, op, answer;
    const operators = ["+", "-", "×", "÷"];
    do {
      num1 = Math.floor(Math.random() * 260) + 1;
      num2 = Math.floor(Math.random() * 210) + 1;
      op = operators[Math.floor(Math.random() * operators.length)];

      // Calculate correct answer based on operator
      if (op === "+") answer = num1 + num2;
      else if (op === "-") answer = num1 - num2;
      else if (op === "×") answer = num1 * num2;
      else if (op === "÷" && num1 % num2 === 0) answer = num1 / num2;

    } while (op === "÷" && num1 % num2 !== 0); // Ensure clean division

    // Store question and answer
    questions.push(`${num1} ${op} ${num2}`);
    answers.push(answer);
    userInputs.push("");
    attempts.push(0);
  }

  // 📋 Display the current question
  function showQuestion(index) {
    if (index >= questions.length) generateQuestion();
    questionBox.textContent = `Q${index + 1}: ${questions[index]} = `;
    answerInput.value = userInputs[index];
    feedback.textContent = "";
  }

  // 🧩 Initialize puzzle reward
  function initPuzzle() {
    imageBox.innerHTML = ''; // Clear previous puzzle
    const container = document.createElement('div');
    container.id = 'puzzleContainer';

    // Create puzzle pieces
    for (let i = 0; i < TOTAL_PIECES; i++) {
      const piece = document.createElement('div');
      piece.classList.add('puzzlePiece');

      // Position each piece correctly
      const row = Math.floor(i / PUZZLE_SIZE);
      const col = i % PUZZLE_SIZE;
      piece.style.backgroundImage = `url(${PUZZLE_IMAGE})`;
      piece.style.backgroundPosition = `${(-col * 100) / (PUZZLE_SIZE - 1)}% ${(-row * 100) / (PUZZLE_SIZE - 1)}%`;
      container.appendChild(piece);
    }

    imageBox.appendChild(container);
  }

  // 🧩 Reveal puzzle pieces based on score
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

  // ✅ Check user's answer
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

      if (!document.getElementById('puzzleContainer')) initPuzzle();
      updatePuzzle(score);
      launchFireworks(); // Optional visual effect
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

  // ➡ Move to next question
  function nextQuestion() {
    currentIndex++;
    showQuestion(currentIndex);
  }

  // ⬅ Move to previous question
  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      showQuestion(currentIndex);
    }
  }

  // 🔄 Toggle visibility of sections
  function toggleSection(id) {
    const sec = document.getElementById(id);
    sec.style.display = (sec.style.display === "none" || sec.style.display === "") ? "block" : "none";
  }

  // 👤 Start quiz after entering name
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

  // 👋 Display welcome message
  function welcomeUser(name) {
    let wUser = document.getElementById("welcomeUser");
    if (!wUser) {
      wUser = document.createElement("div");
      wUser.id = "welcomeUser";
      questionBox.parentNode.insertBefore(wUser, questionBox);
    }
    wUser.textContent = `Welcome, ${name}! Let's begin the challenge 🌟`;
  }

  // 💾 Save progress to localStorage
  function saveProgress() {
    const progress = {
      userName: localStorage.getItem("userName"),
      score: score,
      answers: userInputs,
    };
    localStorage.setItem("quizProgress", JSON.stringify(progress));
  }

  // 📥 Load progress from localStorage
  function loadProgress() {
    const progress = JSON.parse(localStorage.getItem("quizProgress"));
    if (progress) {
      score = progress.score || 0;
      userInputs.length = 0;
      Array.prototype.push.apply(userInputs, progress.answers || []);
      scoreBox.textContent = `Score: ${score}`;
      if (score > 0 && !document.getElementById('puzzleContainer')) initPuzzle();
      if (score > 0) updatePuzzle(score);
    }
  }

  // 🧠 Event listeners for quiz buttons
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

  // 🖼️ Load gallery images based on score
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

  // 🎮 Mini game logic
  let gameInterval;
  let gameScore = 0;
  let currentGameAnswer;

  document.getElementById("startGameBtn").onclick = () => {
    const gameArea = document.getElementById("gameArea");
    gameArea.innerHTML = "";
    gameScore = 0;

    function generateGameQuestion() {
      const a = Math.floor(Math.random() * 10);
      const b = Math.floor(Math.random() * 10);
      currentGameAnswer = a + b;
      gameArea
