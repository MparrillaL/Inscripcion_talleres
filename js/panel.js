// panel.js: el panel construye y actualiza su propio DOM con los datos que recibe por postMessage.
import { validarMensajeResumen } from "./logica.js";

// Se acepta solo el origen de la propia aplicación (mismo host y puerto).
const ORIGEN = window.location.origin;
const contenedor = document.getElementById("panel-contenido");

function crearLinea(etiqueta, valor) {
    const linea = document.createElement("p");
    const nombre = document.createElement("strong");
    nombre.textContent = `${etiqueta}: `;
    linea.append(nombre, valor);
    return linea;
}

function pintarResumen(resumen) {
    if (resumen.total === 0) {
        const vacio = document.createElement("p");
        vacio.textContent = "Sin inscripciones";
        contenedor.replaceChildren(vacio);
        return;
    }

    const fecha = new Date(resumen.ultimo.fecha).toLocaleString("es-ES");
    contenedor.replaceChildren(
        crearLinea("Total de inscritos", String(resumen.total)),
        crearLinea("Presenciales", String(resumen.presencial)),
        crearLinea("Online", String(resumen.online)),
        crearLinea("Última inscripción", `${resumen.ultimo.nombre} (${fecha})`)
    );
}

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
    pintarResumen(event.data);
}

function iniciar() {
    if (contenedor === null) {
        return;
    }

    const espera = document.createElement("p");
    espera.textContent = "Esperando datos del evento...";
    contenedor.replaceChildren(espera);

    window.addEventListener("message", recibirMensaje);

    // El aviso se envía después de instalar el receptor.
    if (window.parent !== window) {
        window.parent.postMessage({ tipo: "panel-listo" }, ORIGEN);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
