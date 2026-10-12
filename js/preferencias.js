// preferencias.js: tema y tamaño de letra guardados en dos cookies independientes.
import { leerCookie, guardarCookie, borrarCookie } from "./cookies.js";

// Claves (nombres) de las cookies, días que duran y valores por defecto.
const COOKIE_TEMA = "tema";
const COOKIE_TAMANO = "tamano";
const DIAS_PREFERENCIAS = 30;
const TEMA_POR_DEFECTO = "claro";
const TAMANO_POR_DEFECTO = "normal";

// Referencias a los elementos de la sección de preferencias.
const ui = {};

// Devuelve el tema si es válido; si no, el de por defecto.
// Un valor de cookie no es de fiar: solo se aceptan las opciones conocidas.
function temaValido(valor) {
    return valor === "claro" || valor === "oscuro" ? valor : TEMA_POR_DEFECTO;
}

// Devuelve el tamaño si es válido; si no, el de por defecto.
function tamanoValido(valor) {
    return valor === "normal" || valor === "grande" ? valor : TAMANO_POR_DEFECTO;
}

// Se aplica sobre <html> para que cambien las variables CSS y el tamaño base (rem).
function aplicarPreferencias(tema, tamano) {
    document.documentElement.dataset.tema = tema;
    document.documentElement.dataset.tamano = tamano;
    // Los desplegables reflejan lo que se ha aplicado.
    ui.selectTema.value = tema;
    ui.selectTamano.value = tamano;
}

// Muestra un mensaje de estado (en rojo si es un error).
function mostrarMensaje(texto, esError) {
    ui.mensaje.textContent = texto;
    ui.mensaje.classList.toggle("error", esError);
}

// Aplica las preferencias elegidas y las guarda en cookies.
function guardar() {
    // Se leen los valores de los desplegables.
    const tema = temaValido(ui.selectTema.value);
    const tamano = tamanoValido(ui.selectTamano.value);

    // Se aplican siempre, aunque las cookies estén bloqueadas.
    aplicarPreferencias(tema, tamano);

    // Se guardan las dos cookies.
    guardarCookie(COOKIE_TEMA, tema, DIAS_PREFERENCIAS);
    guardarCookie(COOKIE_TAMANO, tamano, DIAS_PREFERENCIAS);

    // Se comprueba por lectura si el navegador las ha aceptado.
    const guardadas = leerCookie(COOKIE_TEMA) === tema && leerCookie(COOKIE_TAMANO) === tamano;
    // Mensaje según haya funcionado o no.
    if (guardadas) {
        mostrarMensaje(`Preferencias guardadas ${DIAS_PREFERENCIAS} días.`, false);
    } else {
        mostrarMensaje("No se han podido guardar las cookies (¿bloqueadas?). Se aplican solo durante esta visita.", true);
    }
}

// Borra las cookies y vuelve a los valores por defecto.
function restablecer() {
    // Se borran las dos cookies y se aplican los valores por defecto.
    borrarCookie(COOKIE_TEMA);
    borrarCookie(COOKIE_TAMANO);
    aplicarPreferencias(TEMA_POR_DEFECTO, TAMANO_POR_DEFECTO);

    // Se comprueba por lectura que ya no existen.
    const borradas = leerCookie(COOKIE_TEMA) === null && leerCookie(COOKIE_TAMANO) === null;
    // Mensaje según se hayan borrado o no.
    if (borradas) {
        mostrarMensaje("Preferencias restablecidas (tema claro y letra normal).", false);
    } else {
        mostrarMensaje("No se han podido borrar las cookies, pero se han aplicado los valores por defecto.", true);
    }
}

// Busca los elementos, carga las preferencias guardadas y conecta los botones.
export function iniciarPreferencias() {
    ui.selectTema = document.getElementById("tema");
    ui.selectTamano = document.getElementById("tamano");
    ui.mensaje = document.getElementById("preferencias-mensaje");
    const botonGuardar = document.getElementById("guardar-preferencias");
    const botonRestablecer = document.getElementById("reset-preferencias");

    // Si falta algún elemento, se avisa y no se sigue.
    if (!ui.selectTema || !ui.selectTamano || !ui.mensaje || !botonGuardar || !botonRestablecer) {
        console.error("Faltan elementos de la sección de preferencias.");
        return;
    }

    // Si no hay cookie, leerCookie devuelve null y se usa el valor por defecto.
    aplicarPreferencias(temaValido(leerCookie(COOKIE_TEMA)), tamanoValido(leerCookie(COOKIE_TAMANO)));

    // Botones de la sección.
    botonGuardar.addEventListener("click", guardar);
    botonRestablecer.addEventListener("click", restablecer);
}
