import {
    participantes,
    validarParticipante,
    generarId,
    normalizarParticipante,
    obtenerClasificacionEdad,
    obtenerClasificacionExperiencia,
    filtrarPorNombre,
    filtrarPorModalidad,
    guardarEnStorage,
    validarColeccionImportada,
} from './logica.js';

const formulario = document.querySelector('#formulario');
const contenedorTarjetas = document.querySelector('#tarjetas');
const contenedorErrores = document.querySelector('#errores');
const inputBusqueda = document.querySelector('#busqueda');
const selectModalidad = document.querySelector('#filtro-modalidad');
const btnExportar = document.querySelector('#btn-exportar');
const inputImportar = document.querySelector('#input-importar');
const jsonArea = document.querySelector('#json-area');
const btnImportarTexto = document.querySelector('#btn-importar-texto');
const mensajeJSON = document.querySelector('#json-mensaje');
const selectTema = document.querySelector('#tema');
const selectTamano = document.querySelector('#tamano');
const btnGuardarPreferencias = document.querySelector('#guardar-preferencias');
const btnRestablecerPreferencias = document.querySelector('#reset-preferencias');

const statTotal = document.querySelector('#stat-total');
const statPorcentajes = document.querySelector('#stat-porcentajes');
const statExpPresencial = document.querySelector('#stat-exp-presencial');
const statVeterano = document.querySelector('#stat-veterano');

const STORAGE_KEYS = {
    tema: 'dwc_tema',
    tamano: 'dwc_tamano'
};

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

function aplicarTema(tema) {
    const valor = tema === 'oscuro' ? 'oscuro' : 'claro';
    document.body.dataset.theme = valor;
    document.body.classList.toggle('tema-oscuro', valor === 'oscuro');
    if (selectTema) {
        selectTema.value = valor;
    }
}

function aplicarTamano(tamano) {
    const valor = tamano === 'grande' ? 'grande' : 'normal';
    document.body.dataset.size = valor;
    document.body.classList.toggle('tamano-grande', valor === 'grande');
    if (selectTamano) {
        selectTamano.value = valor;
    }
}

function leerCookie(nombre) {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
        const [clave, valor] = cookie.split('=');
        if (clave === nombre) {
            return decodeURIComponent(valor);
        }
    }
    return '';
}

function guardarCookie(nombre, valor, dias = 30) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; Path=/; SameSite=Lax; Max-Age=${dias * 86400}${secure}`;
}

function borrarCookie(nombre) {
    document.cookie = `${nombre}=; Path=/; SameSite=Lax; Max-Age=0`;
}

function cargarPreferencias() {
    let tema = 'claro';
    let tamano = 'normal';

    try {
        const temaLocal = localStorage.getItem(STORAGE_KEYS.tema);
        const tamanoLocal = localStorage.getItem(STORAGE_KEYS.tamano);

        if (temaLocal === 'oscuro' || temaLocal === 'claro') {
            tema = temaLocal;
        } else {
            const temaCookie = leerCookie('tema');
            if (temaCookie === 'oscuro' || temaCookie === 'claro') {
                tema = temaCookie;
            }
        }

        if (tamanoLocal === 'grande' || tamanoLocal === 'normal') {
            tamano = tamanoLocal;
        } else {
            const tamanoCookie = leerCookie('tamano');
            if (tamanoCookie === 'grande' || tamanoCookie === 'normal') {
                tamano = tamanoCookie;
            }
        }
    } catch (error) {
        console.warn('No se pudieron leer las preferencias guardadas:', error);
    }

    aplicarTema(tema);
    aplicarTamano(tamano);
}

function guardarPreferencias() {
    try {
        localStorage.setItem(STORAGE_KEYS.tema, selectTema.value);
        localStorage.setItem(STORAGE_KEYS.tamano, selectTamano.value);
        guardarCookie('tema', selectTema.value, 30);
        guardarCookie('tamano', selectTamano.value, 30);
        aplicarTema(selectTema.value);
        aplicarTamano(selectTamano.value);
    } catch (error) {
        console.warn('No se pudieron guardar las preferencias:', error);
    }
}

function resetearPreferencias() {
    try {
        localStorage.removeItem(STORAGE_KEYS.tema);
        localStorage.removeItem(STORAGE_KEYS.tamano);
    } catch (error) {
        console.warn('No se pudieron borrar las preferencias del almacenamiento:', error);
    }

    borrarCookie('tema');
    borrarCookie('tamano');
    aplicarTema('claro');
    aplicarTamano('normal');
}

function exportarParticipantes() {
    const jsonString = JSON.stringify(participantes, null, 2);
    jsonArea.value = jsonString;
}

function mostrarMensajeJSON(texto, esError) {
    mensajeJSON.textContent = texto;
    mensajeJSON.classList.toggle('error', esError);
}

function importarParticipantesDesdeJSON(texto) {
    let datos;

    try {
        datos = JSON.parse(texto);
    } catch (error) {
        mostrarMensajeJSON('JSON mal formado: revisa comas, comillas y llaves.', true);
        return;
    }

    const mensajeError = validarColeccionImportada(datos);
    if (mensajeError !== null) {
        mostrarMensajeJSON(`Importación rechazada. ${mensajeError}`, true);
        return;
    }

    // Solo se llega aquí si todo es válido, así que no hay importaciones parciales.
    participantes.length = 0;
    for (const participante of datos) {
        participantes.push({
            id: participante.id,
            nombre: participante.nombre.trim(),
            edad: participante.edad,
            tipo: participante.tipo.trim().toLowerCase(),
            modalidad: participante.modalidad.trim().toLowerCase(),
            experiencia: participante.experiencia,
            fechaInscripcion: participante.fechaInscripcion
        });
    }

    guardarEnStorage();
    aplicarFiltros();
    exportarParticipantes();
    mostrarMensajeJSON(`Importación correcta: ${participantes.length} participantes.`, false);
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

    guardarEnStorage();
    contenedorErrores.textContent = '';
    formulario.reset();
    aplicarFiltros();
});

btnExportar.addEventListener('click', () => {
    exportarParticipantes();
    mostrarMensajeJSON('Colección exportada al área de texto.', false);
});
btnImportarTexto.addEventListener('click', () => importarParticipantesDesdeJSON(jsonArea.value));

inputImportar.addEventListener('change', event => {
    const archivo = event.target.files[0];
    if (!archivo) {
        return;
    }

    const lector = new FileReader();
    lector.onload = () => importarParticipantesDesdeJSON(String(lector.result));
    lector.onerror = () => {
        mostrarMensajeJSON('No se pudo leer el archivo.', true);
    };
    lector.readAsText(archivo);
    inputImportar.value = '';
});

inputBusqueda.addEventListener('input', aplicarFiltros);
selectModalidad.addEventListener('change', aplicarFiltros);
btnGuardarPreferencias.addEventListener('click', guardarPreferencias);
btnRestablecerPreferencias.addEventListener('click', resetearPreferencias);

cargarPreferencias();
renderLista();