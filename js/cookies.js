// cookies.js: funciones para guardar, leer y borrar cookies.

// Atributos comunes: el mismo ámbito para guardar y borrar; Secure solo si la página va por HTTPS.
function atributosComunes() {
    let atributos = "Path=/; SameSite=Lax";
    if (window.location.protocol === "https:") {
        atributos += "; Secure";
    }
    return atributos;
}

// Guarda una cookie con su nombre, su valor y los días que debe durar.
export function guardarCookie(nombre, valor, dias) {
    // Max-Age se indica en segundos, así que se convierten los días.
    const segundos = Math.round(dias * 24 * 60 * 60);

    // encodeURIComponent evita problemas con espacios o caracteres especiales.
    document.cookie = encodeURIComponent(nombre) + "=" + encodeURIComponent(valor) + "; " + atributosComunes() + "; Max-Age=" + segundos;
}

// Devuelve el valor de la cookie o null si no existe o está corrupta.
export function leerCookie(nombre) {
    // document.cookie devuelve todas las cookies juntas: "a=1; b=2".
    // Si está vacío se usa un array vacío para no recorrer nada.
    const partes = document.cookie === "" ? [] : document.cookie.split("; ");

    // Se recorre cada cookie buscando la que tenga el nombre pedido.
    for (const parte of partes) {
        // Se busca el "=" que separa el nombre del valor.
        const posicionIgual = parte.indexOf("=");
        if (posicionIgual === -1) {
            continue;
        }

        try {
            // Se descodifica el nombre y se compara con el que buscamos.
            const clave = decodeURIComponent(parte.slice(0, posicionIgual));
            if (clave === nombre) {
                // Si coincide, se devuelve el valor descodificado.
                return decodeURIComponent(parte.slice(posicionIgual + 1));
            }
        } catch (error) {
            // Una cookie alterada puede tener un % mal formado: se ignora.
            continue;
        }
    }

    // Si se termina el bucle, la cookie no existe.
    return null;
}

// Borra una cookie poniéndole Max-Age=0 (caduca al instante).
// Debe llevar el mismo Path que al guardarla, si no el navegador no la borra.
export function borrarCookie(nombre) {
    document.cookie = encodeURIComponent(nombre) + "=; " + atributosComunes() + "; Max-Age=0";
}
