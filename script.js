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