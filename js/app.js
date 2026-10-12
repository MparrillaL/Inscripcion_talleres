// app.js: interfaz de la página principal (formulario, listado, estadísticas, JSON, iframe y ayuda).
import {
    crearParticipantesEjemplo,
    validarParticipante,
    normalizarParticipante,
    generarId,
    obtenerClasificacionEdad,
    obtenerClasificacionExperiencia,
    filtrarPorNombre,
    filtrarPorModalidad,
    calcularEstadisticas,
    validarColeccionImportada,
    crearResumenPanel
} from "./logica.js";
import { iniciarPreferencias } from "./preferencias.js";

const CAMPOS = ["nombre", "edad", "tipo", "modalidad", "experiencia"];
const SIN_DATOS = "Sin datos";
// Origen concreto para postMessage (nunca "*"): el panel se sirve desde el mismo host y puerto.
const ORIGEN = window.location.origin;

// Colección en memoria: al arrancar solo están los tres participantes de ejemplo.
const participantes = crearParticipantesEjemplo();

// Referencias al DOM; se rellenan en iniciar() cuando el DOM ya existe.
const ui = {};
let ventanaAyuda = null;

function cargarElementos() {
    ui.formulario = document.getElementById("formulario");
    ui.resumenErrores = document.getElementById("errores");
    ui.busqueda = document.getElementById("busqueda");
    ui.filtroModalidad = document.getElementById("filtro-modalidad");
    ui.lista = document.getElementById("lista-participantes");
    ui.sinResultados = document.getElementById("sin-resultados");
    ui.jsonArea = document.getElementById("json-area");
    ui.jsonMensaje = document.getElementById("json-mensaje");
    ui.btnExportar = document.getElementById("btn-exportar");
    ui.btnImportarTexto = document.getElementById("btn-importar-texto");
    ui.inputImportar = document.getElementById("input-importar");
    ui.marcoPanel = document.getElementById("panel-evento");
    ui.btnAbrirAyuda = document.getElementById("btn-abrir-ayuda");
    ui.btnCerrarAyuda = document.getElementById("btn-cerrar-ayuda");
    ui.ayudaMensaje = document.getElementById("ayuda-mensaje");

    // Si falta algo imprescindible se avisa en consola en lugar de romper con un TypeError.
    for (const clave of Object.keys(ui)) {
        if (ui[clave] === null) {
            console.error(`No se encuentra el elemento "${clave}" en la página.`);
            return false;
        }
    }
    return true;
}

/* ---------- Tarjetas y listado ---------- */

function crearTextoTarjeta(etiqueta, valor) {
    const parrafo = document.createElement("p");
    parrafo.textContent = `${etiqueta}: ${valor}`;
    return parrafo;
}

function crearTarjeta(participante) {
    const tarjeta = document.createElement("article");
    const clasificacionEdad = obtenerClasificacionEdad(participante.edad);
    const clasificacionExperiencia = obtenerClasificacionExperiencia(participante.experiencia);

    // Atributos y clases que identifican la tarjeta y reflejan su estado.
    tarjeta.classList.add("tarjeta");
    tarjeta.classList.add(participante.edad < 18 ? "tarjeta-menor" : "tarjeta-mayor");
    tarjeta.classList.add(`experiencia-${clasificacionExperiencia.toLowerCase()}`);
    tarjeta.setAttribute("data-id", String(participante.id));
    tarjeta.setAttribute("data-modalidad", participante.modalidad);

    const titulo = document.createElement("h3");
    titulo.textContent = participante.nombre;

    const fecha = new Date(participante.fechaInscripcion).toLocaleString("es-ES");

    const botonBorrar = document.createElement("button");
    botonBorrar.type = "button";
    botonBorrar.classList.add("btn-borrar");
    botonBorrar.textContent = "Eliminar";
    botonBorrar.setAttribute("aria-label", `Eliminar a ${participante.nombre}`);
    botonBorrar.addEventListener("click", () => borrarParticipante(participante.id));

    tarjeta.append(
        titulo,
        crearTextoTarjeta("ID", participante.id),
        crearTextoTarjeta("Edad", `${participante.edad} años (${clasificacionEdad})`),
        crearTextoTarjeta("Tipo", participante.tipo),
        crearTextoTarjeta("Modalidad", participante.modalidad),
        crearTextoTarjeta("Experiencia", `${participante.experiencia} años (${clasificacionExperiencia})`),
        crearTextoTarjeta("Inscrito", fecha),
        botonBorrar
    );

    return tarjeta;
}

function renderLista(lista) {
    ui.lista.replaceChildren();

    for (const participante of lista) {
        ui.lista.append(crearTarjeta(participante));
    }

    // Mensaje distinto según no haya nadie inscrito o no coincida el filtro.
    if (lista.length === 0) {
        ui.sinResultados.textContent = participantes.length === 0
            ? "No hay participantes inscritos."
            : "Ningún participante coincide con la búsqueda.";
        ui.sinResultados.hidden = false;
    } else {
        ui.sinResultados.hidden = true;
    }
}

// Combina la búsqueda por nombre y el filtro de modalidad.
function aplicarFiltros() {
    const texto = ui.busqueda.value.trim();
    const modalidad = ui.filtroModalidad.value;
    let resultado = participantes;

    if (texto !== "") {
        resultado = filtrarPorNombre(resultado, texto);
    }
    if (modalidad !== "todas") {
        resultado = filtrarPorModalidad(resultado, modalidad);
    }

    renderLista(resultado);
}

function borrarParticipante(id) {
    const participante = participantes.find(p => p.id === id);
    if (participante === undefined) {
        return;
    }

    // Cancelar deja la aplicación como estaba.
    if (!confirm(`¿Seguro que quieres eliminar a ${participante.nombre}?`)) {
        return;
    }

    const indice = participantes.indexOf(participante);
    participantes.splice(indice, 1);
    actualizarVista(); // vuelve a pintar las tarjetas sin la eliminada
}

/* ---------- Estadísticas ---------- */

function formatearMedia(valor) {
    return valor === null ? SIN_DATOS : valor.toFixed(2);
}

function formatearEntero(valor) {
    return valor === null ? SIN_DATOS : String(valor);
}

function ponerTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento !== null) {
        elemento.textContent = texto;
    }
}

// Se calculan con la colección completa, aunque el listado esté filtrado.
function actualizarEstadisticas() {
    const stats = calcularEstadisticas(participantes);

    ponerTexto("stat-total", String(stats.total));
    ponerTexto("stat-menores", String(stats.menores));
    ponerTexto("stat-mayores", String(stats.mayores));
    ponerTexto("stat-edad-media", formatearMedia(stats.edadMedia));
    ponerTexto("stat-edad-min", formatearEntero(stats.edadMinima));
    ponerTexto("stat-edad-max", formatearEntero(stats.edadMaxima));
    ponerTexto("stat-presencial", String(stats.porModalidad.presencial));
    ponerTexto("stat-online", String(stats.porModalidad.online));
    ponerTexto("stat-estudiantes", String(stats.porTipo.estudiante));
    ponerTexto("stat-profesionales", String(stats.porTipo.profesional));
    ponerTexto("stat-invitados", String(stats.porTipo.invitado));
    ponerTexto("stat-exp-presencial", formatearMedia(stats.experienciaMediaPresencial));
}

/* ---------- Panel en iframe (postMessage) ---------- */

function enviarResumenAlPanel() {
    const ventanaPanel = ui.marcoPanel.contentWindow;
    if (ventanaPanel === null) {
        return;
    }
    ventanaPanel.postMessage(crearResumenPanel(participantes), ORIGEN);
}

// Solo se atiende el aviso "panel-listo" de nuestro propio iframe.
function recibirMensajePanel(event) {
    if (event.origin !== ORIGEN) {
        return;
    }
    if (event.source !== ui.marcoPanel.contentWindow) {
        return;
    }

    const datos = event.data;
    const esAvisoValido = datos !== null && typeof datos === "object" &&
        datos.tipo === "panel-listo" && Object.keys(datos).length === 1;
    if (!esAvisoValido) {
        return;
    }

    enviarResumenAlPanel();
}

// Cada vez que cambia la colección se repinta todo y se avisa al panel.
function actualizarVista() {
    aplicarFiltros();
    actualizarEstadisticas();
    enviarResumenAlPanel();
}

/* ---------- Formulario de alta ---------- */

function mostrarErroresFormulario(errores) {
    for (const aviso of document.querySelectorAll(".error-campo")) {
        aviso.textContent = "";
    }

    for (const campo of CAMPOS) {
        const mensaje = errores[campo];
        const control = document.getElementById(campo);
        const aviso = document.getElementById(`error-${campo}`);
        const hayError = mensaje !== undefined;

        control.classList.toggle("invalido", hayError);
        control.setAttribute("aria-invalid", String(hayError));
        if (aviso !== null && hayError) {
            aviso.textContent = mensaje;
        }
    }

    const cantidad = Object.keys(errores).length;
    ui.resumenErrores.textContent = cantidad === 0
        ? ""
        : `No se ha inscrito a nadie: corrige ${cantidad} campo(s) marcado(s).`;
}

function enviarFormulario(event) {
    event.preventDefault();

    const datos = {};
    for (const campo of CAMPOS) {
        datos[campo] = document.getElementById(campo).value;
    }

    const resultado = validarParticipante(datos);
    mostrarErroresFormulario(resultado.errores);
    if (!resultado.valido) {
        return; // se conservan los valores escritos y no se añade nada
    }

    const id = generarId(participantes);
    if (id === null) {
        ui.resumenErrores.textContent = "No se ha podido generar un identificador libre. Inténtalo de nuevo.";
        return;
    }

    const normalizado = normalizarParticipante(datos);
    participantes.push({
        id: id,
        nombre: normalizado.nombre,
        edad: normalizado.edad,
        tipo: normalizado.tipo,
        modalidad: normalizado.modalidad,
        experiencia: normalizado.experiencia,
        fechaInscripcion: new Date().toISOString()
    });

    ui.formulario.reset();
    actualizarVista();
}

/* ---------- JSON ---------- */

function mostrarMensajeJSON(texto, esError) {
    ui.jsonMensaje.textContent = texto;
    ui.jsonMensaje.classList.toggle("error", esError);
}

function exportarParticipantes() {
    ui.jsonArea.value = JSON.stringify(participantes, null, 2);
    mostrarMensajeJSON(`Exportados ${participantes.length} participantes.`, false);
}

function importarParticipantesDesdeJSON(texto) {
    let datos;

    try {
        datos = JSON.parse(texto);
    } catch (error) {
        mostrarMensajeJSON("JSON mal formado: revisa comas, comillas y llaves.", true);
        return;
    }

    const mensajeError = validarColeccionImportada(datos);
    if (mensajeError !== null) {
        mostrarMensajeJSON(`Importación rechazada. ${mensajeError}`, true);
        return; // la colección anterior queda intacta
    }

    // Solo se llega aquí si todo es válido, así que nunca hay importaciones parciales.
    participantes.length = 0;
    for (const participante of datos) {
        participantes.push({
            id: participante.id,
            nombre: participante.nombre.trim(),
            edad: participante.edad,
            tipo: participante.tipo,
            modalidad: participante.modalidad,
            experiencia: participante.experiencia,
            fechaInscripcion: participante.fechaInscripcion
        });
    }

    actualizarVista();
    mostrarMensajeJSON(`Importación correcta: ${participantes.length} participantes.`, false);
}

function importarDesdeArchivo(event) {
    const archivo = event.target.files[0];
    if (archivo === undefined) {
        return;
    }

    const lector = new FileReader();
    lector.onload = () => {
        ui.jsonArea.value = String(lector.result);
        importarParticipantesDesdeJSON(ui.jsonArea.value);
    };
    lector.onerror = () => mostrarMensajeJSON("No se pudo leer el archivo.", true);
    lector.readAsText(archivo);
    ui.inputImportar.value = ""; // permite volver a elegir el mismo archivo
}

/* ---------- Ventana de ayuda (window.open) ---------- */

function ayudaAbierta() {
    return ventanaAyuda !== null && !ventanaAyuda.closed;
}

function abrirAyuda() {
    if (ayudaAbierta()) {
        ventanaAyuda.focus(); // se reutiliza la ventana que ya hay
        ui.ayudaMensaje.textContent = "La ayuda ya estaba abierta.";
        return;
    }

    ventanaAyuda = window.open("./ayuda.html", "ayuda-talleres", "width=620,height=720");
    ui.ayudaMensaje.textContent = ventanaAyuda === null
        ? "El navegador ha bloqueado la ventana emergente. Permítela para ver la ayuda."
        : "Ayuda abierta en una ventana nueva.";
}

function cerrarAyuda() {
    if (ayudaAbierta()) {
        ventanaAyuda.close();
        ui.ayudaMensaje.textContent = "Ayuda cerrada.";
    } else {
        ui.ayudaMensaje.textContent = "No hay ninguna ayuda abierta.";
    }
    ventanaAyuda = null;
}

/* ---------- Arranque ---------- */

function iniciar() {
    if (!cargarElementos()) {
        return;
    }

    ui.formulario.addEventListener("submit", enviarFormulario);
    ui.busqueda.addEventListener("input", aplicarFiltros);
    ui.filtroModalidad.addEventListener("change", aplicarFiltros);
    ui.btnExportar.addEventListener("click", exportarParticipantes);
    ui.btnImportarTexto.addEventListener("click", () => importarParticipantesDesdeJSON(ui.jsonArea.value));
    ui.inputImportar.addEventListener("change", importarDesdeArchivo);
    ui.btnAbrirAyuda.addEventListener("click", abrirAyuda);
    ui.btnCerrarAyuda.addEventListener("click", cerrarAyuda);

    // El receptor se instala antes de que el panel pueda avisar.
    window.addEventListener("message", recibirMensajePanel);

    iniciarPreferencias();
    actualizarVista();
}

// El script es type="module" (diferido), pero se comprueba por si el DOM aún se está cargando.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
