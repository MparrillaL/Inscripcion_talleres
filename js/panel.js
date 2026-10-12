// panel.js: el panel construye y actualiza su propio DOM con los datos que recibe por postMessage.
import { validarMensajeResumen } from "./logica.js";

// Se acepta solo el origen de la propia aplicación (mismo host y puerto).
const ORIGEN = window.location.origin;
// Contenedor del HTML donde se pinta el resumen.
const contenedor = document.getElementById("panel-contenido");

// Crea una línea con la etiqueta en negrita seguida de su valor.
function crearLinea(etiqueta, valor) {
    const linea = document.createElement("p");
    const nombre = document.createElement("strong");
    nombre.textContent = `${etiqueta}: `;
    linea.append(nombre, valor);
    return linea;
}

// Pinta el resumen recibido dentro del panel.
function pintarResumen(resumen) {
    // Sin inscritos solo se muestra un aviso.
    if (resumen.total === 0) {
        const vacio = document.createElement("p");
        vacio.textContent = "Sin inscripciones";
        contenedor.replaceChildren(vacio);
        return;
    }

    // Con inscritos se muestran los totales y la última inscripción.
    const fecha = new Date(resumen.ultimo.fecha).toLocaleString("es-ES");
    contenedor.replaceChildren(
        crearLinea("Total de inscritos", String(resumen.total)),
        crearLinea("Presenciales", String(resumen.presencial)),
        crearLinea("Online", String(resumen.online)),
        crearLinea("Última inscripción", `${resumen.ultimo.nombre} (${fecha})`)
    );
}

// Se ejecuta cuando la página principal envía un mensaje.
function recibirMensaje(event) {
    // Origen, emisor y contenido deben ser los esperados; si no, se ignora sin tocar la interfaz.
    if (event.origin !== ORIGEN) {
        return;
    }
    if (event.source !== window.parent) {
        return;
    }
    if (!validarMensajeResumen(event.data)) {
        return;
    }
    // Si todo es correcto se pinta el resumen.
    pintarResumen(event.data);
}

// Prepara el panel: muestra un texto de espera y escucha mensajes.
function iniciar() {
    if (contenedor === null) {
        return;
    }

    // Texto que se ve hasta que llegan los datos.
    const espera = document.createElement("p");
    espera.textContent = "Esperando datos del evento...";
    contenedor.replaceChildren(espera);

    // Se escuchan los mensajes de la página principal.
    window.addEventListener("message", recibirMensaje);

    // El aviso se envía después de instalar el receptor.
    if (window.parent !== window) {
        window.parent.postMessage({ tipo: "panel-listo" }, ORIGEN);
    }
}

// Se arranca ya, o cuando el DOM termine de cargarse.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
