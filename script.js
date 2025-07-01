const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const resultsContainer = document.getElementById('results-container');
const configForm = document.getElementById('config-form');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers');
const timerDisplay = document.getElementById('timer');
const questionCounter = document.getElementById('question-counter');
const scoreDisplay = document.getElementById('score-display');
const resultSummary = document.getElementById('result-summary');

let questions = [], currentQuestion = 0, score = 0, correctAnswers = 0;
let timer, remainingTime = 20;
let startTime, totalTime = 0;
let config = {};

configForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('player-name').value.trim();
  const count = parseInt(document.getElementById('question-count').value);
  const difficulty = document.getElementById('difficulty').value;
  const category = document.getElementById('category').value;

  config = { name, count, difficulty, category };

  setupContainer.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  await fetchQuestions();
  startGame();
});

async function fetchQuestions() {
  const { count, difficulty, category } = config;
  let url = `https://opentdb.com/api.php?amount=${count}&difficulty=${difficulty}&type=multiple&timestamp=${Date.now()}`;
;
  if (category) url += `&category=${category}`;

  questionText.textContent = 'Cargando preguntas...';
  const res = await fetch(url);
  const data = await res.json();
  questions = data.results;
}

function startGame() {
  currentQuestion = 0;
  score = 0;
  correctAnswers = 0;
  totalTime = 0;
  showQuestion();
}

function showQuestion() {
  if (currentQuestion >= questions.length) return showResults();

  const q = questions[currentQuestion];
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  questionCounter.textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
  questionText.innerHTML = decodeHTML(q.question);
  answersContainer.innerHTML = '';
  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.innerHTML = decodeHTML(answer);
    btn.onclick = () => handleAnswer(answer === q.correct_answer);
    answersContainer.appendChild(btn);
  });

  startTimer();
  startTime = Date.now();
}
document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('change-settings-btn').addEventListener('click', changeSettings);

function handleAnswer(isCorrect) {
  stopTimer();
  totalTime += (Date.now() - startTime) / 1000;

  const buttons = answersContainer.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === decodeHTML(questions[currentQuestion].correct_answer)) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('incorrect');
    }
  });

  if (isCorrect) {
    score += 10;
    correctAnswers++;
  }

  scoreDisplay.textContent = `Puntos: ${score}`;
  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 2000);
}

function startTimer() {
  remainingTime = 20;
  updateTimer();
  timer = setInterval(() => {
    remainingTime--;
    updateTimer();
    if (remainingTime === 0) {
      stopTimer();
      handleAnswer(false);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function updateTimer() {
  timerDisplay.textContent = `Tiempo restante: ${remainingTime}s`;
  timerDisplay.className = remainingTime <= 5 ? 'warning' : '';
}

function showResults() {
  gameContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');

  const avgTime = (totalTime / questions.length).toFixed(2);
  const percent = ((correctAnswers / questions.length) * 100).toFixed(1);

  resultSummary.innerHTML = `
    Jugador: ${config.name}<br>
    Puntaje total: ${score}<br>
    Respuestas correctas: ${correctAnswers}/${questions.length}<br>
    Porcentaje de aciertos: ${percent}%<br>
    Tiempo promedio por pregunta: ${avgTime}s
  `;
}

async function restartGame() {
  resultsContainer.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  await fetchQuestions(); // 🔄 Vuelve a traer preguntas nuevas
  startGame();
}


function changeSettings() {
  resultsContainer.classList.add('hidden');
  setupContainer.classList.remove('hidden');
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
