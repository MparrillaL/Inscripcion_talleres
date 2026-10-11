
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