import { participantes, validarParticipante, generarId, normalizarParticipante, obtenerClasificacionEdad, obtenerClasificacionExperiencia } from './logica.js';

// Seleccionamos los elementos del HTML que vamos a manipular.
const formulario = document.querySelector('#formulario');
const contenedorTarjetas = document.querySelector('#tarjetas');
const contenedorErrores = document.querySelector('#errores');

// Creamos la tarjeta visual para cada participante.
function crearTarjeta(participante) {
    const tarjeta = document.createElement('section');
    tarjeta.classList.add('tarjeta');

    // Nombre del participante.
    const titulo = document.createElement('h3');
    titulo.textContent = participante.nombre;
    tarjeta.appendChild(titulo);

    // Edad y su clasificación.
    const edad = document.createElement('p');
    const claseEdad = obtenerClasificacionEdad(participante.edad);
    edad.textContent = `Edad: ${participante.edad} años (${claseEdad})`;
    tarjeta.appendChild(edad);

    // Tipo de participante.
    const tipo = document.createElement('p');
    tipo.textContent = `Tipo: ${participante.tipo}`;
    tarjeta.appendChild(tipo);

    // Modalidad elegida.
    const modalidad = document.createElement('p');
    modalidad.textContent = `Modalidad: ${participante.modalidad}`;
    tarjeta.appendChild(modalidad);

    // Experiencia y su clasificación.
    const experiencia = document.createElement('p');
    const claseExp = obtenerClasificacionExperiencia(participante.experiencia);
    experiencia.textContent = `Experiencia: ${participante.experiencia} años (${claseExp})`;
    tarjeta.appendChild(experiencia);

    // Fecha de inscripción en formato español.
    const fecha = document.createElement('p');
    fecha.textContent = `Inscrito: ${new Date(participante.fechaInscripcion).toLocaleString('es-ES')}`;
    tarjeta.appendChild(fecha);

    // Botón para eliminar el participante.
    const botonBorrar = document.createElement('button');
    botonBorrar.textContent = 'Eliminar';
    botonBorrar.addEventListener('click', () => {
        const confirmar = confirm(`¿Seguro que quieres eliminar a ${participante.nombre}?`);
        if (confirmar) {
            const indice = participantes.indexOf(participante);
            if (indice !== -1) {
                participantes.splice(indice, 1);
            }
            renderLista();
        }
    });
    tarjeta.appendChild(botonBorrar);

    return tarjeta;
}

// Pintamos la lista completa de participantes en el DOM.
function renderLista() {
    contenedorTarjetas.textContent = '';

    for (const participante of participantes) {
        const tarjeta = crearTarjeta(participante);
        contenedorTarjetas.appendChild(tarjeta);
    }
}

// Cuando el usuario envía el formulario, procesamos los datos.
formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    // Recogemos los valores introducidos por el usuario.
    const datos = {
        nombre: formulario.nombre.value,
        edad: formulario.edad.value,
        tipo: formulario.tipo.value,
        modalidad: formulario.modalidad.value,
        experiencia: formulario.experiencia.value
    };

    // Si los datos son válidos, creamos un nuevo participante.
    if (validarParticipante(datos)) {
        const participanteNormalizado = normalizarParticipante(datos);
        const nuevoParticipante = {
            id: generarId(participantes),
            nombre: participanteNormalizado.nombre,
            edad: participanteNormalizado.edad,
            tipo: participanteNormalizado.tipo,
            modalidad: participanteNormalizado.modalidad,
            fechaInscripcion: new Date().toISOString(),
            experiencia: participanteNormalizado.experiencia
        };

        // Añadimos el participante y volvemos a pintar la lista.
        participantes.push(nuevoParticipante);
        renderLista();
        contenedorErrores.textContent = '';
        formulario.reset();
    } else {
        // Mostramos un mensaje si los datos no son correctos.
        contenedorErrores.textContent = 'Error: Datos inválidos.';
    }
});

// Al cargar la página, mostramos los participantes iniciales.
renderLista();
