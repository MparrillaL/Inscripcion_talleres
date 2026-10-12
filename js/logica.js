// logica.js: validación y cálculos. Ninguna función de este archivo toca el DOM.

const EDAD_MAYORIA = 18;

// Devuelve una copia nueva de los tres participantes de ejemplo.
export function crearParticipantesEjemplo() {
    return [
        {
            id: 483721,
            nombre: "Ana García",
            edad: 17,
            tipo: "estudiante",
            modalidad: "presencial",
            experiencia: 2.5,
            fechaInscripcion: "2026-10-08T08:30:00.000Z"
        },
        {
            id: 102938,
            nombre: "Carlos Pérez",
            edad: 29,
            tipo: "profesional",
            modalidad: "online",
            experiencia: 6,
            fechaInscripcion: "2026-10-09T10:15:00.000Z"
        },
        {
            id: 593821,
            nombre: "Elena Gómez",
            edad: 42,
            tipo: "invitado",
            modalidad: "presencial",
            experiencia: 8.5,
            fechaInscripcion: "2026-10-10T11:00:00.000Z"
        }
    ];
}

// Convierte los textos del formulario en un participante limpio (ya validado).
export function normalizarParticipante(datos) {
    return {
        nombre: String(datos.nombre ?? "").trim(),
        edad: Number(String(datos.edad ?? "").trim()),
        tipo: String(datos.tipo ?? ""),
        modalidad: String(datos.modalidad ?? ""),
        experiencia: Number(String(datos.experiencia ?? "").trim())
    };
}

// Valida los datos (siempre no fiables). Devuelve { valido, errores } con un mensaje por campo.
export function validarParticipante(datos) {
    const errores = {};
    const origen = datos ?? {};

    // Nombre: entre 2 y 60 caracteres sin contar espacios de los extremos.
    const nombre = String(origen.nombre ?? "").trim();
    if (nombre.length < 2 || nombre.length > 60) {
        errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
    }

    // Edad: se comprueba el texto antes de convertir, porque Number("") es 0 y Number("18abc") es NaN.
    const edadTexto = String(origen.edad ?? "").trim();
    if (edadTexto === "") {
        errores.edad = "La edad es obligatoria.";
    } else if (!/^\d+$/.test(edadTexto)) {
        errores.edad = "La edad debe ser un número entero, sin letras ni decimales.";
    } else {
        const edad = Number(edadTexto);
        if (!Number.isFinite(edad) || !Number.isInteger(edad) || edad < 0 || edad > 120) {
            errores.edad = "La edad debe estar entre 0 y 120.";
        }
    }

    // Tipo: solo los valores permitidos (switch porque hay varias opciones válidas).
    switch (origen.tipo) {
        case "estudiante":
        case "profesional":
        case "invitado":
            break;
        default:
            errores.tipo = "Elige un tipo: estudiante, profesional o invitado.";
    }

    // Modalidad: presencial u online.
    if (origen.modalidad !== "presencial" && origen.modalidad !== "online") {
        errores.modalidad = "Elige una modalidad: presencial u online.";
    }

    // Experiencia: número (con decimales con punto) entre 0 y 10.
    const experienciaTexto = String(origen.experiencia ?? "").trim();
    if (experienciaTexto === "") {
        errores.experiencia = "La experiencia es obligatoria.";
    } else if (!/^\d+(\.\d+)?$/.test(experienciaTexto)) {
        errores.experiencia = "La experiencia debe ser un número (usa punto para los decimales).";
    } else {
        const experiencia = Number(experienciaTexto);
        if (!Number.isFinite(experiencia) || experiencia < 0 || experiencia > 10) {
            errores.experiencia = "La experiencia debe estar entre 0 y 10.";
        }
    }

    return { valido: Object.keys(errores).length === 0, errores };
}

// Genera un id aleatorio de 6 cifras que no esté en uso; con tope de intentos para no bloquear la pestaña.
export function generarId(participantes) {
    const MAX_INTENTOS = 100;
    let intentos = 0;

    while (intentos < MAX_INTENTOS) {
        const candidato = Math.floor(Math.random() * 900000) + 100000;
        let repetido = false;

        for (const participante of participantes) {
            if (participante.id === candidato) {
                repetido = true;
                break;
            }
        }

        if (!repetido) {
            return candidato;
        }
        intentos++;
    }

    return null;
}

export function obtenerClasificacionEdad(edad) {
    return edad < EDAD_MAYORIA ? "Menor de edad" : "Mayor de edad";
}

export function obtenerClasificacionExperiencia(experiencia) {
    if (experiencia < 4) {
        return "Inicial";
    } else if (experiencia < 7) {
        return "Intermedia";
    }
    return "Avanzada";
}

// Búsqueda por nombre sin distinguir mayúsculas ni minúsculas.
export function filtrarPorNombre(lista, texto) {
    const buscado = texto.trim().toLowerCase();
    const resultado = [];

    for (const participante of lista) {
        if (participante.nombre.toLowerCase().includes(buscado)) {
            resultado.push(participante);
        }
    }
    return resultado;
}

export function filtrarPorModalidad(lista, modalidad) {
    const resultado = [];

    for (const participante of lista) {
        if (participante.modalidad === modalidad) {
            resultado.push(participante);
        }
    }
    return resultado;
}

// Media de experiencia de los presenciales; null si no hay ninguno.
export function calcularExperienciaMediaPresencial(participantes) {
    let suma = 0;
    let presenciales = 0;

    for (const participante of participantes) {
        if (participante.modalidad === "online") {
            continue; // los online no cuentan
        }
        suma += participante.experiencia;
        presenciales++;
    }

    return presenciales === 0 ? null : suma / presenciales;
}

// Primer menor de edad en el orden de la colección; null si no hay ninguno.
export function buscarPrimerMenor(participantes) {
    let encontrado = null;

    for (const participante of participantes) {
        if (participante.edad < EDAD_MAYORIA) {
            encontrado = participante;
            break; // ya no hace falta seguir
        }
    }
    return encontrado;
}

// Estadísticas de toda la colección. Las medias y extremos son null cuando no hay datos.
export function calcularEstadisticas(participantes) {
    const estadisticas = {
        total: 0,
        menores: 0,
        mayores: 0,
        edadMedia: null,
        edadMinima: null,
        edadMaxima: null,
        porModalidad: { presencial: 0, online: 0 },
        porTipo: { estudiante: 0, profesional: 0, invitado: 0 },
        experienciaMediaPresencial: null
    };
    let sumaEdades = 0;

    for (const participante of participantes) {
        estadisticas.total++;
        sumaEdades += participante.edad;

        if (participante.edad < EDAD_MAYORIA) {
            estadisticas.menores++;
        } else {
            estadisticas.mayores++;
        }

        if (estadisticas.edadMinima === null || participante.edad < estadisticas.edadMinima) {
            estadisticas.edadMinima = participante.edad;
        }
        if (estadisticas.edadMaxima === null || participante.edad > estadisticas.edadMaxima) {
            estadisticas.edadMaxima = participante.edad;
        }

        if (participante.modalidad === "online") {
            estadisticas.porModalidad.online++;
        } else {
            estadisticas.porModalidad.presencial++;
        }

        switch (participante.tipo) {
            case "estudiante":
                estadisticas.porTipo.estudiante++;
                break;
            case "profesional":
                estadisticas.porTipo.profesional++;
                break;
            case "invitado":
                estadisticas.porTipo.invitado++;
                break;
        }
    }

    if (estadisticas.total > 0) {
        estadisticas.edadMedia = sumaEdades / estadisticas.total;
    }
    estadisticas.experienciaMediaPresencial = calcularExperienciaMediaPresencial(participantes);

    return estadisticas;
}

// Comprueba que un texto es una fecha en formato ISO tal y como la genera toISOString().
function esFechaISO(texto) {
    const fecha = new Date(texto);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString() === texto;
}

// Valida una colección importada: devuelve el mensaje de error o null si es correcta.
export function validarColeccionImportada(datos) {
    if (!Array.isArray(datos)) {
        return "El JSON debe ser un array de participantes.";
    }

    const idsVistos = new Set();

    for (let i = 0; i < datos.length; i++) {
        const elemento = datos[i];
        const prefijo = `Participante ${i + 1}: `;

        if (elemento === null || typeof elemento !== "object" || Array.isArray(elemento)) {
            return prefijo + "no es un objeto.";
        }

        if (typeof elemento.nombre !== "string" || typeof elemento.tipo !== "string" ||
            typeof elemento.modalidad !== "string" || typeof elemento.fechaInscripcion !== "string") {
            return prefijo + "faltan campos de texto o tienen un tipo incorrecto.";
        }

        if (typeof elemento.id !== "number" || typeof elemento.edad !== "number" ||
            typeof elemento.experiencia !== "number") {
            return prefijo + "faltan campos numéricos o tienen un tipo incorrecto.";
        }

        // Se reutilizan las reglas del formulario pasando los números como texto.
        const resultado = validarParticipante({
            nombre: elemento.nombre,
            edad: String(elemento.edad),
            tipo: elemento.tipo,
            modalidad: elemento.modalidad,
            experiencia: String(elemento.experiencia)
        });
        if (!resultado.valido) {
            return prefijo + "algún valor está fuera de rango o no está permitido.";
        }

        if (!Number.isInteger(elemento.id) || elemento.id < 100000 || elemento.id > 999999) {
            return prefijo + "el id debe ser un entero entre 100000 y 999999.";
        }
        if (idsVistos.has(elemento.id)) {
            return prefijo + "el id está repetido.";
        }
        idsVistos.add(elemento.id);

        if (!esFechaISO(elemento.fechaInscripcion)) {
            return prefijo + "la fecha no es un texto ISO válido.";
        }
    }

    return null;
}

// Mensaje que la página principal envía al panel del iframe.
export function crearResumenPanel(participantes) {
    const estadisticas = calcularEstadisticas(participantes);
    let masReciente = null;

    for (const participante of participantes) {
        if (masReciente === null ||
            new Date(participante.fechaInscripcion).getTime() > new Date(masReciente.fechaInscripcion).getTime()) {
            masReciente = participante;
        }
    }

    return {
        tipo: "resumen",
        total: estadisticas.total,
        presencial: estadisticas.porModalidad.presencial,
        online: estadisticas.porModalidad.online,
        ultimo: masReciente === null
            ? null
            : { nombre: masReciente.nombre, fecha: masReciente.fechaInscripcion }
    };
}

function esEnteroNoNegativo(valor) {
    return typeof valor === "number" && Number.isInteger(valor) && valor >= 0;
}

// El panel no se fía de nadie: comprueba estructura, tipos y valores del mensaje.
export function validarMensajeResumen(datos) {
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        return false;
    }
    if (datos.tipo !== "resumen") {
        return false;
    }
    if (!esEnteroNoNegativo(datos.total) || !esEnteroNoNegativo(datos.presencial) ||
        !esEnteroNoNegativo(datos.online)) {
        return false;
    }
    if (datos.presencial + datos.online !== datos.total) {
        return false;
    }

    if (datos.ultimo === null) {
        return datos.total === 0;
    }

    const ultimo = datos.ultimo;
    if (datos.total === 0 || typeof ultimo !== "object" || Array.isArray(ultimo)) {
        return false;
    }
    if (typeof ultimo.nombre !== "string" || ultimo.nombre.length < 2 || ultimo.nombre.length > 60) {
        return false;
    }
    return typeof ultimo.fecha === "string" && esFechaISO(ultimo.fecha);
}
