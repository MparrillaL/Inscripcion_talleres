
// Array inicial con tres participantes para que haya datos al cargar la página.
export const participantes = [
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

// Devuelve la clasificación de la edad para mostrarla en la tarjeta.
export function obtenerClasificacionEdad(participante) {
    const edad = participante.edad;

    if (edad < 18) {
        return "Menor de edad";
    } else {
        return "Mayor de edad";
    }
}

// Devuelve la clasificación según los años de experiencia.
export function obtenerClasificacionExperiencia(participante) {
    if (participante.experiencia < 4) {
        return "Inicial";
    } else if (participante.experiencia < 7) {
        return "Intermedia";
    } else {
        return "Avanzada";
    }
}
