import {
    participantes,
    validarParticipante,
    generarId,
    normalizarParticipante,
    obtenerClasificacionEdad,
    obtenerClasificacionExperiencia,
    filtrarPorNombre,
    filtrarPorModalidad
} from './logica.js';

const formulario = document.querySelector('#formulario');
const contenedorTarjetas = document.querySelector('#tarjetas');
const contenedorErrores = document.querySelector('#errores');
const inputBusqueda = document.querySelector('#busqueda');
const selectModalidad = document.querySelector('#filtro-modalidad');

const statTotal = document.querySelector('#stat-total');
const statPorcentajes = document.querySelector('#stat-porcentajes');
const statExpPresencial = document.querySelector('#stat-exp-presencial');
const statVeterano = document.querySelector('#stat-veterano');

// Las tarjetas se renderizan dentro de este contenedor para conservar el título.
const listaTarjetas = document.createElement('div');
listaTarjetas.classList.add('lista-participantes');
contenedorTarjetas.appendChild(listaTarjetas);

function crearTarjeta(participante) {
    const tarjeta = document.createElement('section');
    tarjeta.classList.add('tarjeta');

    const titulo = document.createElement('h3');
    titulo.textContent = participante.nombre;
    tarjeta.appendChild(titulo);

    const edad = document.createElement('p');
    edad.textContent =
        `Edad: ${participante.edad} años (${obtenerClasificacionEdad(participante.edad)})`;
    tarjeta.appendChild(edad);

    const tipo = document.createElement('p');
    tipo.textContent = `Tipo: ${participante.tipo}`;
    tarjeta.appendChild(tipo);

    const modalidad = document.createElement('p');
    modalidad.textContent = `Modalidad: ${participante.modalidad}`;
    tarjeta.appendChild(modalidad);

    const experiencia = document.createElement('p');
    experiencia.textContent =
        `Experiencia: ${participante.experiencia} años (${obtenerClasificacionExperiencia(participante.experiencia)})`;
    tarjeta.appendChild(experiencia);

    const fecha = document.createElement('p');
    fecha.textContent =
        `Inscrito: ${new Date(participante.fechaInscripcion).toLocaleString('es-ES')}`;
    tarjeta.appendChild(fecha);

    const botonBorrar = document.createElement('button');
    botonBorrar.type = 'button';
    botonBorrar.textContent = 'Eliminar';
    botonBorrar.addEventListener('click', () => {
        if (confirm(`¿Seguro que quieres eliminar a ${participante.nombre}?`)) {
            const indice = participantes.indexOf(participante);
            if (indice !== -1) {
                participantes.splice(indice, 1);
            }
            aplicarFiltros();
        }
    });
    tarjeta.appendChild(botonBorrar);

    return tarjeta;
}

function actualizarEstadisticas() {
    const total = participantes.length;

    const tipos = {
        estudiante: participantes.filter(p => p.tipo === 'estudiante').length,
        profesional: participantes.filter(p => p.tipo === 'profesional').length,
        invitado: participantes.filter(p => p.tipo === 'invitado').length
    };

    const porcentaje = cantidad => total === 0
        ? '0'
        : ((cantidad / total) * 100).toLocaleString('es-ES', {
            maximumFractionDigits: 1
        });

    const presenciales = participantes.filter(p => p.modalidad === 'presencial');
    const experienciaMedia = presenciales.length
        ? presenciales.reduce((suma, p) => suma + Number(p.experiencia), 0) / presenciales.length
        : 0;

    const participanteVeterano = participantes.reduce((mayor, actual) => {
        if (!mayor || Number(actual.edad) > Number(mayor.edad)) {
            return actual;
        }
        return mayor;
    }, null);

    statTotal.textContent = String(total);
    statPorcentajes.textContent =
        `Estudiantes: ${porcentaje(tipos.estudiante)}%, ` +
        `Profesionales: ${porcentaje(tipos.profesional)}%, ` +
        `Invitados: ${porcentaje(tipos.invitado)}%`;
    statExpPresencial.textContent =
        `${experienciaMedia.toLocaleString('es-ES', { maximumFractionDigits: 1 })} años`;
    statVeterano.textContent = participanteVeterano
        ? `${participanteVeterano.nombre} (${participanteVeterano.edad} años)`
        : 'Ninguno';
}

function renderLista(lista = participantes) {
    listaTarjetas.replaceChildren();

    for (const participante of lista) {
        listaTarjetas.appendChild(crearTarjeta(participante));
    }

    actualizarEstadisticas();
}

function aplicarFiltros() {
    const texto = inputBusqueda.value.trim();
    const modalidad = selectModalidad.value;
    let resultado = participantes;

    if (texto !== '') {
        resultado = filtrarPorNombre(resultado, texto);
    }

    if (modalidad !== 'todas') {
        resultado = filtrarPorModalidad(resultado, modalidad);
    }

    renderLista(resultado);
}

formulario.addEventListener('submit', event => {
    event.preventDefault();

    const datos = {
        nombre: formulario.nombre.value,
        edad: formulario.edad.value,
        tipo: formulario.tipo.value,
        modalidad: formulario.modalidad.value,
        experiencia: formulario.experiencia.value
    };

    if (!validarParticipante(datos)) {
        contenedorErrores.textContent = 'Error: Datos inválidos.';
        return;
    }

    const participanteNormalizado = normalizarParticipante(datos);

    participantes.push({
        id: generarId(participantes),
        nombre: participanteNormalizado.nombre,
        edad: participanteNormalizado.edad,
        tipo: participanteNormalizado.tipo,
        modalidad: participanteNormalizado.modalidad,
        fechaInscripcion: new Date().toISOString(),
        experiencia: participanteNormalizado.experiencia
    });

    contenedorErrores.textContent = '';
    formulario.reset();
    aplicarFiltros();
});

inputBusqueda.addEventListener('input', aplicarFiltros);
selectModalidad.addEventListener('change', aplicarFiltros);

renderLista();