// cookies.js: lectura, escritura y borrado de cookies con el mismo ámbito.

// Añade Secure solo si la página va por HTTPS.
function atributosComunes() {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    return `Path=/; SameSite=Lax${secure}`;
}

export function guardarCookie(nombre, valor, dias) {
    const segundos = Math.round(dias * 24 * 60 * 60);
    document.cookie = `${encodeURIComponent(nombre)}=${encodeURIComponent(valor)}; ${atributosComunes()}; Max-Age=${segundos}`;
}

// Devuelve el valor descodificado o null si no existe o está corrupto.
export function leerCookie(nombre) {
    const partes = document.cookie === "" ? [] : document.cookie.split("; ");

    for (const parte of partes) {
        const posicionIgual = parte.indexOf("=");
        if (posicionIgual === -1) {
            continue;
        }

        try {
            const clave = decodeURIComponent(parte.slice(0, posicionIgual));
            if (clave === nombre) {
                return decodeURIComponent(parte.slice(posicionIgual + 1));
            }
        } catch (error) {
            // Una cookie alterada puede tener un % mal formado: se ignora.
            continue;
        }
    }
    return null;
}

export function borrarCookie(nombre) {
    document.cookie = `${encodeURIComponent(nombre)}=; ${atributosComunes()}; Max-Age=0`;
}
