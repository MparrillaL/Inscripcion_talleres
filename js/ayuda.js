// ayuda.js: muestra datos descriptivos del navegador (no se usan para validar ni para seguridad).
function ponerTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento !== null) {
        elemento.textContent = texto;
    }
}

function mostrarDatosNavegador() {
    ponerTexto("dato-idioma", navigator.language);
    ponerTexto("dato-origen", window.location.origin);
    ponerTexto("dato-pantalla", `${screen.width} x ${screen.height} píxeles`);
}

document.addEventListener("DOMContentLoaded", mostrarDatosNavegador);
