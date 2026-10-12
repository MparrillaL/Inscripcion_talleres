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
    crearResumenPanel,
    buscarPrimerMenor
} from "./logica.js";
import { iniciarPreferencias } from "./preferencias.js";

// Nombres de los campos del formulario (coinciden con los id del HTML).
const CAMPOS = ["nombre", "edad", "tipo", "modalidad", "experiencia"];
// Texto que se muestra cuando una estadística no tiene datos.
const SIN_DATOS = "Sin datos";
// Origen concreto para postMessage (nunca "*"): el panel se sirve desde el mismo host y puerto.
const ORIGEN = window.location.origin;

// Colección en memoria: al arrancar solo están los tres participantes de ejemplo.
const participantes = crearParticipantesEjemplo();

// Objeto con las referencias al DOM; se rellenan en iniciar() cuando el DOM ya existe.
const ui = {};
// Guarda la ventana de ayuda abierta (null si no hay ninguna).
let ventanaAyuda = null;

// Busca en el HTML todos los elementos que usa el programa y los guarda en ui.
function cargarElementos() {
    ui.formulario = document.getElementById("formulario");
    ui.resumenErrores = document.getElementById("errores");
    ui.busqueda = document.getElementById("busqueda");
    ui.filtroModalidad = document.getElementById("filtro-modalidad");
    ui.btnPrimerMenor = document.getElementById("btn-primer-menor");
    ui.menorMensaje = document.getElementById("primer-menor-mensaje");
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

    // Si falta algún elemento se avisa en consola.
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

// Crea un párrafo "Etiqueta: valor" para la tarjeta.
function crearTextoTarjeta(etiqueta, valor) {
    const parrafo = document.createElement("p");
    // textContent evita que el texto se interprete como HTML.
    parrafo.textContent = `${etiqueta}: ${valor}`;
    return parrafo;
}

// Crea la tarjeta (article) de un participante.
function crearTarjeta(participante) {
    const tarjeta = document.createElement("article");
    // Se calculan las clasificaciones que se muestran en la tarjeta.
    const clasificacionEdad = obtenerClasificacionEdad(participante.edad);
    const clasificacionExperiencia = obtenerClasificacionExperiencia(participante.experiencia);

    // Atributos y clases que identifican la tarjeta y reflejan su estado.
    tarjeta.classList.add("tarjeta");
    tarjeta.classList.add(participante.edad < 18 ? "tarjeta-menor" : "tarjeta-mayor");
    tarjeta.classList.add(`experiencia-${clasificacionExperiencia.toLowerCase()}`);
    tarjeta.setAttribute("data-id", String(participante.id));
    tarjeta.setAttribute("data-modalidad", participante.modalidad);

    // Título con el nombre.
    const titulo = document.createElement("h3");
    titulo.textContent = participante.nombre;

    // Fecha de inscripción en formato español.
    const fecha = new Date(participante.fechaInscripcion).toLocaleString("es-ES");

    // Botón para eliminar al participante.
    const botonBorrar = document.createElement("button");
    botonBorrar.type = "button";
    botonBorrar.classList.add("btn-borrar");
    botonBorrar.textContent = "Eliminar";
    botonBorrar.setAttribute("aria-label", `Eliminar a ${participante.nombre}`);
    botonBorrar.addEventListener("click", () => borrarParticipante(participante.id));

    // Se añaden todos los elementos a la tarjeta.
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

// Pinta en pantalla la lista de participantes que se le pasa.
function renderLista(lista) {
    // Se vacía la lista anterior.
    ui.lista.replaceChildren();

    // Se añade una tarjeta por participante.
    for (const participante of lista) {
        ui.lista.append(crearTarjeta(participante));
    }

    actualizarAvisoSinResultados();
}

// Muestra u oculta el aviso según haya tarjetas visibles.
function actualizarAvisoSinResultados() {
    // Se cuentan las tarjetas que hay ahora mismo en el DOM.
    const visibles = ui.lista.querySelectorAll(".tarjeta").length;

    // Mensaje distinto según no haya nadie inscrito o no coincida el filtro.
    if (visibles === 0) {
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
    // Valores actuales del buscador y del filtro de modalidad.
    const texto = ui.busqueda.value.trim();
    const modalidad = ui.filtroModalidad.value;
    // Se parte de la lista completa y se va filtrando.
    let resultado = participantes;

    // Filtro por nombre si se ha escrito algo.
    if (texto !== "") {
        resultado = filtrarPorNombre(resultado, texto);
    }
    // Filtro por modalidad si no está en "todas".
    if (modalidad !== "todas") {
        resultado = filtrarPorModalidad(resultado, modalidad);
    }

    // Se pinta el resultado.
    renderLista(resultado);
}

// Elimina un participante tras pedir confirmación.
function borrarParticipante(id) {
    // Se busca el participante por su id.
    const participante = participantes.find(p => p.id === id);
    if (participante === undefined) {
        return;
    }

    // Cancelar deja la aplicación como estaba.
    if (!confirm(`¿Seguro que quieres eliminar a ${participante.nombre}?`)) {
        return;
    }

    // Se quita del array usando su posición.
    const indice = participantes.indexOf(participante);
    participantes.splice(indice, 1);

    // Se busca solo la tarjeta de ese participante y se quita del DOM.
    const tarjeta = ui.lista.querySelector(`[data-id="${id}"]`);
    if (tarjeta !== null) {
        tarjeta.remove();
    }

    // Las demás tarjetas no se tocan; se actualizan aviso, estadísticas y panel.
    actualizarAvisoSinResultados();
    actualizarEstadisticas();
    enviarResumenAlPanel();
}

/* ---------- Estadísticas ---------- */

// Devuelve la media con 2 decimales o "Sin datos".
function formatearMedia(valor) {
    return valor === null ? SIN_DATOS : valor.toFixed(2);
}

// Devuelve el número como texto o "Sin datos".
function formatearEntero(valor) {
    return valor === null ? SIN_DATOS : String(valor);
}

// Escribe un texto dentro del elemento con ese id.
function ponerTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento !== null) {
        elemento.textContent = texto;
    }
}

// Se calculan con la colección completa, aunque el listado esté filtrado.
function actualizarEstadisticas() {
    // Cualquier cambio en la colección deja desfasado el aviso del primer menor.
    ui.menorMensaje.textContent = "";

    const stats = calcularEstadisticas(participantes);

    // Se escribe cada estadística en su elemento del HTML.
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

// Muestra el nombre del primer menor de edad de la colección o avisa de que no hay.
function mostrarPrimerMenor() {
    const menor = buscarPrimerMenor(participantes);

    if (menor === null) {
        ui.menorMensaje.textContent = "No hay ningún menor de edad inscrito.";
    } else {
        ui.menorMensaje.textContent = `Primer menor de edad: ${menor.nombre} (${menor.edad} años).`;
    }
}

/* ---------- Panel en iframe (postMessage) ---------- */

// Envía al iframe el resumen actual de inscripciones.
function enviarResumenAlPanel() {
    const ventanaPanel = ui.marcoPanel.contentWindow;
    if (ventanaPanel === null) {
        return;
    }
    // Se indica el origen de destino para que no lo reciba otra página.
    ventanaPanel.postMessage(crearResumenPanel(participantes), ORIGEN);
}

// Solo se atiende el aviso "panel-listo" de nuestro propio iframe.
function recibirMensajePanel(event) {
    // Se ignoran mensajes de otros orígenes u otras ventanas.
    if (event.origin !== ORIGEN) {
        return;
    }
    if (event.source !== ui.marcoPanel.contentWindow) {
        return;
    }

    // El mensaje debe ser exactamente { tipo: "panel-listo" }.
    const datos = event.data;
    const esAvisoValido = datos !== null && typeof datos === "object" &&
        datos.tipo === "panel-listo" && Object.keys(datos).length === 1;
    if (!esAvisoValido) {
        return;
    }

    // El panel ya está listo: se le envía el resumen.
    enviarResumenAlPanel();
}

// Cada vez que cambia la colección se repinta todo y se avisa al panel.
function actualizarVista() {
    aplicarFiltros();
    actualizarEstadisticas();
    enviarResumenAlPanel();
}

/* ---------- Formulario de alta ---------- */

// Muestra los errores de cada campo y un resumen general.
function mostrarErroresFormulario(errores) {
    // Primero se borran los errores anteriores.
    for (const aviso of document.querySelectorAll(".error-campo")) {
        aviso.textContent = "";
    }

    // Se marca cada campo como válido o inválido y se escribe su mensaje.
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

    // Mensaje resumen debajo del formulario.
    const cantidad = Object.keys(errores).length;
    ui.resumenErrores.textContent = cantidad === 0
        ? ""
        : `No se ha inscrito a nadie: corrige ${cantidad} campo(s) marcado(s).`;
}

// Se ejecuta al enviar el formulario: valida y añade el participante.
function enviarFormulario(event) {
    // Evita que la página se recargue.
    event.preventDefault();

    // Se leen los valores escritos en el formulario.
    const datos = {};
    for (const campo of CAMPOS) {
        datos[campo] = document.getElementById(campo).value;
    }

    // Se valida y se muestran los errores (si los hay).
    const resultado = validarParticipante(datos);
    mostrarErroresFormulario(resultado.errores);
    if (!resultado.valido) {
        return; // se conservan los valores escritos y no se añade nada
    }

    // Se genera un id libre para el nuevo participante.
    const id = generarId(participantes);
    if (id === null) {
        ui.resumenErrores.textContent = "No se ha podido generar un identificador libre. Inténtalo de nuevo.";
        return;
    }

    // Se limpian los datos y se añade el participante a la colección.
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

    // Se vacía el formulario y se actualiza la pantalla.
    ui.formulario.reset();
    actualizarVista();
}

/* ---------- JSON ---------- */

// Muestra un mensaje bajo el área JSON (en rojo si es un error).
function mostrarMensajeJSON(texto, esError) {
    ui.jsonMensaje.textContent = texto;
    ui.jsonMensaje.classList.toggle("error", esError);
}

// Convierte la colección a texto JSON y lo escribe en el textarea.
function exportarParticipantes() {
    ui.jsonArea.value = JSON.stringify(participantes, null, 2);
    mostrarMensajeJSON(`Exportados ${participantes.length} participantes.`, false);
}

// Sustituye la colección por la que viene en el texto JSON, si es válida.
function importarParticipantesDesdeJSON(texto) {
    let datos;

    // Si el texto no es JSON, JSON.parse lanza un error.
    try {
        datos = JSON.parse(texto);
    } catch (error) {
        mostrarMensajeJSON("JSON mal formado: revisa comas, comillas y llaves.", true);
        return;
    }

    // Se comprueba que la estructura y los valores son correctos.
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

    // Se actualiza la pantalla y se avisa al usuario.
    actualizarVista();
    mostrarMensajeJSON(`Importación correcta: ${participantes.length} participantes.`, false);
}

// Lee el archivo elegido y lo importa como JSON.
function importarDesdeArchivo(event) {
    // Primer archivo seleccionado.
    const archivo = event.target.files[0];
    if (archivo === undefined) {
        return;
    }

    // FileReader lee el archivo de forma asíncrona.
    const lector = new FileReader();
    // Al terminar de leer, se muestra el texto y se importa.
    lector.onload = () => {
        ui.jsonArea.value = String(lector.result);
        importarParticipantesDesdeJSON(ui.jsonArea.value);
    };
    lector.onerror = () => mostrarMensajeJSON("No se pudo leer el archivo.", true);
    lector.readAsText(archivo);
    ui.inputImportar.value = ""; // permite volver a elegir el mismo archivo
}

/* ---------- Ventana de ayuda (window.open) ---------- */

// Indica si la ventana de ayuda sigue abierta.
function ayudaAbierta() {
    return ventanaAyuda !== null && !ventanaAyuda.closed;
}

// Abre la ayuda en una ventana nueva (o la reutiliza si ya existe).
function abrirAyuda() {
    if (ayudaAbierta()) {
        ventanaAyuda.focus(); // se reutiliza la ventana que ya hay
        ui.ayudaMensaje.textContent = "La ayuda ya estaba abierta.";
        return;
    }

    // window.open devuelve null si el navegador bloquea la ventana.
    ventanaAyuda = window.open("./ayuda.html", "ayuda-talleres", "width=620,height=720");
    ui.ayudaMensaje.textContent = ventanaAyuda === null
        ? "El navegador ha bloqueado la ventana emergente. Permítela para ver la ayuda."
        : "Ayuda abierta en una ventana nueva.";
}

// Cierra la ventana de ayuda si está abierta.
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

// Prepara la página: busca los elementos y conecta los eventos.
function iniciar() {
    if (!cargarElementos()) {
        return;
    }

    // Eventos de los controles de la página.
    ui.formulario.addEventListener("submit", enviarFormulario);
    ui.busqueda.addEventListener("input", aplicarFiltros);
    ui.filtroModalidad.addEventListener("change", aplicarFiltros);
    ui.btnPrimerMenor.addEventListener("click", mostrarPrimerMenor);
    ui.btnExportar.addEventListener("click", exportarParticipantes);
    ui.btnImportarTexto.addEventListener("click", () => importarParticipantesDesdeJSON(ui.jsonArea.value));
    ui.inputImportar.addEventListener("change", importarDesdeArchivo);
    ui.btnAbrirAyuda.addEventListener("click", abrirAyuda);
    ui.btnCerrarAyuda.addEventListener("click", cerrarAyuda);

    // El receptor se instala antes de que el panel pueda avisar.
    window.addEventListener("message", recibirMensajePanel);

    // Se activan las preferencias y se pinta la pantalla por primera vez.
    iniciarPreferencias();
    actualizarVista();
}

// El script es type="module" (diferido), pero se comprueba por si el DOM aún se está cargando.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
