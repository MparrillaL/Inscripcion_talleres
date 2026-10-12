// logica.js: validación y cálculos. Ninguna función de este archivo toca el DOM.

// Edad a partir de la cual una persona se considera mayor de edad.
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
    // Los textos se limpian con trim y los números se convierten con Number.
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
    // Objeto donde se guarda un mensaje de error por cada campo incorrecto.
    const errores = {};
    // Si no llegan datos se usa un objeto vacío para que no falle.
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

    // Es válido si no se ha guardado ningún error.
    return { valido: Object.keys(errores).length === 0, errores };
}

// Genera un id aleatorio de 6 cifras que no esté en uso; con tope de intentos para no bloquear la pestaña.
export function generarId(participantes) {
    const MAX_INTENTOS = 100;
    let intentos = 0;

    while (intentos < MAX_INTENTOS) {
        // Número aleatorio entre 100000 y 999999.
        const candidato = Math.floor(Math.random() * 900000) + 100000;
        let repetido = false;

        // Se comprueba que ningún participante tenga ya ese id.
        for (const participante of participantes) {
            if (participante.id === candidato) {
                repetido = true;
                break;
            }
        }

        // Si no está repetido, es el id elegido.
        if (!repetido) {
            return candidato;
        }
        intentos++;
    }

    // Si se agotan los intentos no se ha encontrado un id libre.
    return null;
}

// Devuelve si el participante es menor o mayor de edad.
export function obtenerClasificacionEdad(edad) {
    return edad < EDAD_MAYORIA ? "Menor de edad" : "Mayor de edad";
}

// Clasifica la experiencia: menos de 4 años inicial, de 4 a 7 intermedia, el resto avanzada.
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
    // El texto buscado y el nombre se pasan a minúsculas para compararlos.
    const buscado = texto.trim().toLowerCase();
    const resultado = [];

    // Se guardan los participantes cuyo nombre contiene el texto.
    for (const participante of lista) {
        if (participante.nombre.toLowerCase().includes(buscado)) {
            resultado.push(participante);
        }
    }
    return resultado;
}

// Devuelve solo los participantes de la modalidad indicada.
export function filtrarPorModalidad(lista, modalidad) {
    const resultado = [];

    // Se guardan los que tienen esa modalidad.
    for (const participante of lista) {
        if (participante.modalidad === modalidad) {
            resultado.push(participante);
        }
    }
    return resultado;
}

// Media de experiencia de los presenciales; null si no hay ninguno.
export function calcularExperienciaMediaPresencial(participantes) {
    // Acumuladores: suma de experiencias y número de presenciales.
    let suma = 0;
    let presenciales = 0;

    for (const participante of participantes) {
        if (participante.modalidad === "online") {
            continue; // los online no cuentan
        }
        suma += participante.experiencia;
        presenciales++;
    }

    // Se evita dividir entre 0 si no hay presenciales.
    return presenciales === 0 ? null : suma / presenciales;
}

// Primer menor de edad en el orden de la colección; null si no hay ninguno.
export function buscarPrimerMenor(participantes) {
    // Empieza en null: si no hay menores se devuelve null.
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
    // Objeto con todos los contadores a cero.
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

    // Se recorre la lista una sola vez actualizando todos los contadores.
    for (const participante of participantes) {
        estadisticas.total++;
        sumaEdades += participante.edad;

        // Menores y mayores de edad.
        if (participante.edad < EDAD_MAYORIA) {
            estadisticas.menores++;
        } else {
            estadisticas.mayores++;
        }

        // Edad mínima y máxima (la primera vez se parte de null).
        if (estadisticas.edadMinima === null || participante.edad < estadisticas.edadMinima) {
            estadisticas.edadMinima = participante.edad;
        }
        if (estadisticas.edadMaxima === null || participante.edad > estadisticas.edadMaxima) {
            estadisticas.edadMaxima = participante.edad;
        }

        // Contador por modalidad.
        if (participante.modalidad === "online") {
            estadisticas.porModalidad.online++;
        } else {
            estadisticas.porModalidad.presencial++;
        }

        // Contador por tipo de participante.
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

    // La media solo se calcula si hay participantes.
    if (estadisticas.total > 0) {
        estadisticas.edadMedia = sumaEdades / estadisticas.total;
    }
    // La media de experiencia se calcula con la función de arriba.
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
    // Lo importado tiene que ser una lista.
    if (!Array.isArray(datos)) {
        return "El JSON debe ser un array de participantes.";
    }

    // Set para detectar ids repetidos.
    const idsVistos = new Set();

    // Se valida cada participante; al primer fallo se devuelve su mensaje.
    for (let i = 0; i < datos.length; i++) {
        const elemento = datos[i];
        const prefijo = `Participante ${i + 1}: `;

        // Cada elemento debe ser un objeto.
        if (elemento === null || typeof elemento !== "object" || Array.isArray(elemento)) {
            return prefijo + "no es un objeto.";
        }

        // Los campos de texto deben ser strings.
        if (typeof elemento.nombre !== "string" || typeof elemento.tipo !== "string" ||
            typeof elemento.modalidad !== "string" || typeof elemento.fechaInscripcion !== "string") {
            return prefijo + "faltan campos de texto o tienen un tipo incorrecto.";
        }

        // Los campos numéricos deben ser números.
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

        // El id debe tener 6 cifras y no repetirse.
        if (!Number.isInteger(elemento.id) || elemento.id < 100000 || elemento.id > 999999) {
            return prefijo + "el id debe ser un entero entre 100000 y 999999.";
        }
        if (idsVistos.has(elemento.id)) {
            return prefijo + "el id está repetido.";
        }
        idsVistos.add(elemento.id);

        // La fecha debe tener formato ISO.
        if (!esFechaISO(elemento.fechaInscripcion)) {
            return prefijo + "la fecha no es un texto ISO válido.";
        }
    }

    // Si no ha fallado nada, no hay error.
    return null;
}

// Mensaje que la página principal envía al panel del iframe.
export function crearResumenPanel(participantes) {
    const estadisticas = calcularEstadisticas(participantes);
    let masReciente = null;

    // Se busca el participante con la fecha de inscripción más reciente.
    for (const participante of participantes) {
        if (masReciente === null ||
            new Date(participante.fechaInscripcion).getTime() > new Date(masReciente.fechaInscripcion).getTime()) {
            masReciente = participante;
        }
    }

    // Mensaje con solo los datos que necesita el panel.
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

// Comprueba que un valor es un número entero mayor o igual que 0.
function esEnteroNoNegativo(valor) {
    return typeof valor === "number" && Number.isInteger(valor) && valor >= 0;
}

// El panel no se fía de nadie: comprueba estructura, tipos y valores del mensaje.
export function validarMensajeResumen(datos) {
    // Debe ser un objeto de tipo "resumen".
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        return false;
    }
    if (datos.tipo !== "resumen") {
        return false;
    }
    // Los contadores deben ser enteros y presencial + online debe dar el total.
    if (!esEnteroNoNegativo(datos.total) || !esEnteroNoNegativo(datos.presencial) ||
        !esEnteroNoNegativo(datos.online)) {
        return false;
    }
    if (datos.presencial + datos.online !== datos.total) {
        return false;
    }

    // Sin último participante solo es válido si no hay inscritos.
    if (datos.ultimo === null) {
        return datos.total === 0;
    }

    // Si hay último participante se comprueba su estructura.
    const ultimo = datos.ultimo;
    if (datos.total === 0 || typeof ultimo !== "object" || Array.isArray(ultimo)) {
        return false;
    }
    // El nombre debe tener entre 2 y 60 caracteres y la fecha debe ser ISO.
    if (typeof ultimo.nombre !== "string" || ultimo.nombre.length < 2 || ultimo.nombre.length > 60) {
        return false;
    }
    return typeof ultimo.fecha === "string" && esFechaISO(ultimo.fecha);
}
