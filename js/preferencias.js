// preferencias.js: tema y tamaño de letra guardados en dos cookies independientes.
import { leerCookie, guardarCookie, borrarCookie } from "./cookies.js";

const COOKIE_TEMA = "tema";
const COOKIE_TAMANO = "tamano";
const DIAS_PREFERENCIAS = 30;
const TEMA_POR_DEFECTO = "claro";
const TAMANO_POR_DEFECTO = "normal";

const ui = {};

// Un valor de cookie no es de fiar: solo se aceptan las opciones conocidas.
function temaValido(valor) {
    return valor === "claro" || valor === "oscuro" ? valor : TEMA_POR_DEFECTO;
}

function tamanoValido(valor) {
    return valor === "normal" || valor === "grande" ? valor : TAMANO_POR_DEFECTO;
}

// Se aplica sobre <html> para que cambien las variables CSS y el tamaño base (rem).
function aplicarPreferencias(tema, tamano) {
    document.documentElement.dataset.tema = tema;
    document.documentElement.dataset.tamano = tamano;
    ui.selectTema.value = tema;
    ui.selectTamano.value = tamano;
}

function mostrarMensaje(texto, esError) {
    ui.mensaje.textContent = texto;
    ui.mensaje.classList.toggle("error", esError);
}

function guardar() {
    const tema = temaValido(ui.selectTema.value);
    const tamano = tamanoValido(ui.selectTamano.value);

    // Se aplican siempre, aunque las cookies estén bloqueadas.
    aplicarPreferencias(tema, tamano);

    guardarCookie(COOKIE_TEMA, tema, DIAS_PREFERENCIAS);
    guardarCookie(COOKIE_TAMANO, tamano, DIAS_PREFERENCIAS);

    // Se comprueba por lectura si el navegador las ha aceptado.
    const guardadas = leerCookie(COOKIE_TEMA) === tema && leerCookie(COOKIE_TAMANO) === tamano;
    if (guardadas) {
        mostrarMensaje(`Preferencias guardadas ${DIAS_PREFERENCIAS} días.`, false);
    } else {
        mostrarMensaje("No se han podido guardar las cookies (¿bloqueadas?). Se aplican solo durante esta visita.", true);
    }
}

function restablecer() {
    borrarCookie(COOKIE_TEMA);
    borrarCookie(COOKIE_TAMANO);
    aplicarPreferencias(TEMA_POR_DEFECTO, TAMANO_POR_DEFECTO);

    const borradas = leerCookie(COOKIE_TEMA) === null && leerCookie(COOKIE_TAMANO) === null;
    if (borradas) {
        mostrarMensaje("Preferencias restablecidas (tema claro y letra normal).", false);
    } else {
        mostrarMensaje("No se han podido borrar las cookies, pero se han aplicado los valores por defecto.", true);
    }
}

export function iniciarPreferencias() {
    ui.selectTema = document.getElementById("tema");
    ui.selectTamano = document.getElementById("tamano");
    ui.mensaje = document.getElementById("preferencias-mensaje");
    const botonGuardar = document.getElementById("guardar-preferencias");
    const botonRestablecer = document.getElementById("reset-preferencias");

    if (!ui.selectTema || !ui.selectTamano || !ui.mensaje || !botonGuardar || !botonRestablecer) {
        console.error("Faltan elementos de la sección de preferencias.");
        return;
    }

    // Si no hay cookie, leerCookie devuelve null y se usa el valor por defecto.
    aplicarPreferencias(temaValido(leerCookie(COOKIE_TEMA)), tamanoValido(leerCookie(COOKIE_TAMANO)));

    botonGuardar.addEventListener("click", guardar);
    botonRestablecer.addEventListener("click", restablecer);
}
