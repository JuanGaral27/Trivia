const contenedorConfiguracion = document.getElementById('setup-container');
const contenedorJuego = document.getElementById('game-container');
const contenedorResultados = document.getElementById('results-container');

const formularioConfiguracion = document.getElementById('config-form');
const textoPregunta = document.getElementById('texto_pregunta');
const contenedorRespuestas = document.getElementById('respuestas');
const displayTemporizador = document.getElementById('temporizador');
const contadorPregunta = document.getElementById('contador_pregunta');
const displayPuntuacion = document.getElementById('puntuacion');
const resumenResultado = document.getElementById('resumen_resultado');

const botonReiniciar = document.getElementById('reiniciar_btn');
const botonCambiarConfig = document.getElementById('cambiar_config_btn');

let preguntas = [];
let preguntaActual = 0;
let puntuacion = 0;
let respuestasCorrectas = 0;
let tiempoTotal = 0;
let tiempoInicio;
let tiempoRestante = 20;
let temporizador;
let configuracion = {};

formularioConfiguracion.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre_jugador').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad_preguntas').value);
  const dificultad = document.getElementById('dificultad').value;
  const categoria = document.getElementById('categoria').value;

  configuracion = { nombre, cantidad, dificultad, categoria };

  contenedorConfiguracion.classList.add('hidden');
  contenedorJuego.classList.remove('hidden');

  await obtenerPreguntas();
  iniciarJuego();
});

async function obtenerPreguntas() {
  const { cantidad, dificultad, categoria } = configuracion;
  let url = `https://opentdb.com/api.php?amount=${cantidad}&difficulty=${dificultad}&type=multiple`;
  if (categoria) url += `&category=${categoria}`;

  textoPregunta.textContent = 'Cargando preguntas...';

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    preguntas = datos.results;

    if (preguntas.length === 0) {
      textoPregunta.textContent = 'No se encontraron preguntas con esta configuración. Intenta cambiar los parámetros.';
      return;
    }

  } catch (error) {
    textoPregunta.textContent = 'Error al cargar preguntas.';
  }
}


function iniciarJuego() {
  preguntaActual = 0;
  puntuacion = 0;
  respuestasCorrectas = 0;
  tiempoTotal = 0;
  mostrarPregunta();
}

function mostrarPregunta() {
  if (preguntaActual >= preguntas.length) return mostrarResultados();

  const pregunta = preguntas[preguntaActual];
  const opciones = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);

  contadorPregunta.textContent = `Pregunta ${preguntaActual + 1} de ${preguntas.length}`;
  textoPregunta.innerHTML = decodificarHTML(pregunta.question);
  contenedorRespuestas.innerHTML = '';

  opciones.forEach(opcion => {
    const boton = document.createElement('button');
    boton.innerHTML = decodificarHTML(opcion);
    boton.addEventListener('click', () => manejarRespuesta(opcion === pregunta.correct_answer));
    contenedorRespuestas.appendChild(boton);
  });

  iniciarTemporizador();
  tiempoInicio = Date.now();
}

function manejarRespuesta(esCorrecta) {
  detenerTemporizador();
  tiempoTotal += (Date.now() - tiempoInicio) / 1000;

  const botones = contenedorRespuestas.querySelectorAll('button');
  botones.forEach(boton => {
    boton.disabled = true;
    if (boton.innerHTML === decodificarHTML(preguntas[preguntaActual].correct_answer)) {
      boton.classList.add('correct');
    } else {
      boton.classList.add('incorrect');
    }
  });

  if (esCorrecta) {
    puntuacion += 10;
    respuestasCorrectas++;
  }

  displayPuntuacion.textContent = `Puntos: ${puntuacion}`;

  setTimeout(() => {
    preguntaActual++;
    mostrarPregunta();
  }, 2000);
}

function iniciarTemporizador() {
  tiempoRestante = 20;
  actualizarTemporizador();
  temporizador = setInterval(() => {
    tiempoRestante--;
    actualizarTemporizador();
    if (tiempoRestante === 0) {
      detenerTemporizador();
      manejarRespuesta(false);
    }
  }, 1000);
}

function detenerTemporizador() {
  clearInterval(temporizador);
}

function actualizarTemporizador() {
  displayTemporizador.textContent = `Tiempo restante: ${tiempoRestante}s`;
  displayTemporizador.className = tiempoRestante <= 5 ? 'warning' : '';
}
function mostrarResultados() {
  contenedorJuego.classList.add('hidden');
  contenedorResultados.classList.remove('hidden');

  const promedio = (tiempoTotal / preguntas.length).toFixed(2);
  const porcentaje = ((respuestasCorrectas / preguntas.length) * 100).toFixed(1);

  resumenResultado.innerHTML = `
    Jugador: ${configuracion.nombre}<br>
    Puntaje total: ${puntuacion}<br>
    Respuestas correctas: ${respuestasCorrectas}/${preguntas.length}<br>
    Porcentaje de aciertos: ${porcentaje}%<br>
    Tiempo promedio por pregunta: ${promedio}s
  `;
}

botonReiniciar.addEventListener('click', () => {
  contenedorResultados.classList.add('hidden');
  contenedorJuego.classList.remove('hidden');
  iniciarJuego();
});

botonCambiarConfig.addEventListener('click', () => {
  contenedorResultados.classList.add('hidden');
  contenedorConfiguracion.classList.remove('hidden');
});