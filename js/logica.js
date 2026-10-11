
const CLAVE_STORAGE = "participantes_talleres"

// Array inicial con tres participantes para que haya datos al cargar la página.
export const participantesPorDefecto = [
    {
        id: 483721,
        nombre: "Ana García",
        edad: 17,
        tipo: "estudiante",
        modalidad: "presencial",
        fechaInscripcion: "2026-10-08T08:30:00.000Z",
        experiencia: 2.5
    },
    {
        id: 102938,
        nombre: "Carlos Pérez",
        edad: 29,
        tipo: "profesional",
        modalidad: "online",
        fechaInscripcion: "2026-10-09T10:15:00.000Z",
        experiencia: 6.0
    },
    {
        id: 593821,
        nombre: "Elena Gómez",
        edad: 42,
        tipo: "invitado",
        modalidad: "presencial",
        fechaInscripcion: "2026-10-10T11:00:00.000Z",
        experiencia: 8.5
    }
];

// Normaliza los datos del formulario para guardar el participante limpio.
export function normalizarParticipante(datos) {
    return {
        nombre: datos.nombre.trim(),
        edad: Number(datos.edad.trim()),
        tipo: datos.tipo.trim().toLowerCase(),
        modalidad: datos.modalidad.trim().toLowerCase(),
        experiencia: Number(datos.experiencia.trim())
    };
}

// Comprueba si los datos del formulario son válidos.
export function validarParticipante(datos) {
    let esValido = true;

    const participanteNormalizado = normalizarParticipante(datos);

    // Number("") vale 0, así que las cadenas vacías se rechazan antes de convertir.
    if (datos.edad.trim() === "" || datos.experiencia.trim() === "") {
        esValido = false;
    }

    // El nombre debe tener entre 2 y 60 caracteres.
    if (participanteNormalizado.nombre.length < 2 || participanteNormalizado.nombre.length > 60) {
        esValido = false;
    }

    // La edad debe ser un número entero entre 0 y 120.
    if (!Number.isInteger(participanteNormalizado.edad) || participanteNormalizado.edad < 0 || participanteNormalizado.edad > 120) {
        esValido = false;
    }

    // El tipo debe ser uno de los permitidos.
    if (participanteNormalizado.tipo !== "estudiante" && participanteNormalizado.tipo !== "profesional" && participanteNormalizado.tipo !== "invitado") {
        esValido = false;
    }

    // La modalidad debe ser presencial o online.
    if (participanteNormalizado.modalidad !== "presencial" && participanteNormalizado.modalidad !== "online") {
        esValido = false;
    }

    // La experiencia debe ser un número válido y estar entre 0 y 10.
    if (isNaN(participanteNormalizado.experiencia) || !isFinite(participanteNormalizado.experiencia) || participanteNormalizado.experiencia < 0 || participanteNormalizado.experiencia > 10) {
        esValido = false;
    }

    return esValido;
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

        const datosFormulario = {
            nombre: elemento.nombre,
            edad: String(elemento.edad),
            tipo: elemento.tipo,
            modalidad: elemento.modalidad,
            experiencia: String(elemento.experiencia)
        };

        if (!validarParticipante(datosFormulario)) {
            return prefijo + "algún valor está fuera de rango o no está permitido.";
        }

        if (!Number.isInteger(elemento.id) || elemento.id < 100000 || elemento.id > 999999) {
            return prefijo + "el id debe ser un entero entre 100000 y 999999.";
        }

        if (idsVistos.has(elemento.id)) {
            return prefijo + "el id está repetido.";
        }
        idsVistos.add(elemento.id);

        const fecha = new Date(elemento.fechaInscripcion);
        if (Number.isNaN(fecha.getTime()) || fecha.toISOString() !== elemento.fechaInscripcion) {
            return prefijo + "la fecha no es un texto ISO válido.";
        }
    }

    return null;
}

// Genera un identificador aleatorio y único para cada participante.
export function generarId(participantes) {
    let intentos = 1;

    while (intentos <= 100) {
        const newID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const encontrado = participantes.find(participante => participante.id === newID);

        // Si el ID no existe, lo devolvemos.
        if (encontrado === undefined) {
            return newID;
        }

        intentos++;
    }

    console.error("Error: Se ha alcanzado el límite de 100 intentos sin generar un ID único.");
    return null;
}

// Devuelve si la persona es menor o mayor de edad.
export function obtenerClasificacionEdad(edad) {
    if (edad < 18) {
        return "Menor de edad";
    }
    return "Mayor de edad";
}

// Devuelve el nivel de experiencia según los años.
export function obtenerClasificacionExperiencia(experiencia) {
    if (experiencia < 4) {
        return "Inicial";
    } else if (experiencia < 7) {
        return "Intermedia";
    }
    return "Avanzada";
}

// Filtra los participantes por nombre.
export function filtrarPorNombre(lista, nombre) {
    const resultado = [];

    for (const participante of lista) {
        if (participante.nombre.toLowerCase().includes(nombre.toLowerCase())) {
            resultado.push(participante);
        }
    }

    return resultado;
}

// Filtra los participantes por modalidad.
export function filtrarPorModalidad(lista, modalidad) {
    const resultado = [];

    for (const participante of lista) {
        if (participante.modalidad.toLowerCase() === modalidad.toLowerCase()) {
            resultado.push(participante);
        }
    }

    return resultado;
}

// Cuenta cuántos inscritos hay.
export function totalInscritos(lista) {
    let total = 0;

    for (const participante of lista) {
        total++;
    }

    return total;
}

// Calcula el porcentaje de un tipo respecto al total.
export function porcentajePorTipo(lista, tipo) {
    const total = totalInscritos(lista);

    if (total === 0) {
        return 0;
    }

    let cantidad = 0;

    for (const participante of lista) {
        if (participante.tipo.toLowerCase() === tipo.toLowerCase()) {
            cantidad++;
        }
    }

    return (cantidad / total) * 100;
}

// Calcula la experiencia media del grupo.
export function experienciaMedia(lista) {
    if (lista.length === 0) {
        return 0;
    }

    let total = 0;

    for (const participante of lista) {
        total += participante.experiencia;
    }

    return total / lista.length;
}

// Devuelve el participante con más experiencia.
export function participanteVeterano(lista) {
    if (lista.length === 0) {
        return null;
    }

    let veterano = lista[0];

    for (const participante of lista) {
        if (participante.experiencia > veterano.experiencia) {
            veterano = participante;
        }
    }

    return veterano;
}
export function cargarDeStorage() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    if (datos) {
        try {
            return JSON.parse(datos);
        } catch (e) {
            console.error("Error al parsear los datos del storage", e);
        }
    }
    return participantesPorDefecto;
}

export const participantes = cargarDeStorage();

export function guardarEnStorage() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(participantes));
}

