configForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('nombre del jugador').value.trim();
  const count = parseInt(document.getElementById('cantidad de preguntas').value);
  const difficulty = document.getElementById('dificultad').value;
  const category = document.getElementById('categoría').value;

  config = { name, count, difficulty, category };

  setupContainer.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  await fetchQuestions();
  startGame();
});

async function fetchQuestions() {
  const { count, difficulty, category } = config;
  let url = `https://opentdb.com/api.php?amount=${count}&difficulty=${difficulty}&type=multiple`;
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

function handleAnswer(isCorrect) {
  stopTimer();
  totalTime += (Date.now() - startTime) / 1000;

  const buttons = answersContainer.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === decodeHTML(questions[currentQuestion].correct_answer)) {
      btn.classList.add('correcto');
    } else {
      btn.classList.add('incorrecto');
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