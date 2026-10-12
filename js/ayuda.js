// ayuda.js: muestra datos descriptivos del navegador (no se usan para validar ni para seguridad).
// Escribe un texto dentro del elemento con ese id (si existe).
function ponerTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento !== null) {
        elemento.textContent = texto;
    }
}

// Rellena la lista de datos con la información del navegador.
function mostrarDatosNavegador() {
    ponerTexto("dato-idioma", navigator.language);
    ponerTexto("dato-origen", window.location.origin);
    ponerTexto("dato-pantalla", `${screen.width} x ${screen.height} píxeles`);
}

// Los datos se muestran cuando la página ya se ha cargado.
document.addEventListener("DOMContentLoaded", mostrarDatosNavegador);
