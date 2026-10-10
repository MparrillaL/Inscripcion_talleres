
const participantes = [
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

function validarParticipante(datos) {
    let esValido = true;

    const nombreLimpio = datos.nombre.trim();

    const edadLimpia = datos.edad.trim();
    const edadNumero = Number(edadLimpia);

    const tipoLimpio = datos.tipo.trim().toLowerCase();

    const modalidadLimpia = datos.modalidad.trim().toLowerCase();

    const experienciaLimpia = datos.experiencia.trim();
    const experienciaNumero = Number(experienciaLimpia);

    if (nombreLimpio.length < 2 || nombreLimpio.length > 60) {
        esValido = false;
    }

    if (edadLimpia === "" || isNaN(edadNumero) || edadNumero < 0 || edadNumero > 120) {
        esValido = false;
    }

    if (tipoLimpio !== "estudiante" && tipoLimpio !== "profesional" && tipoLimpio !== "invitado") {
        esValido = false;
    }


    if (modalidadLimpia !== "presencial" && modalidadLimpia !== "online") {
        esValido = false;
    }

    if (experienciaLimpia === "" || isNaN(experienciaNumero) || !isFinite(experienciaNumero) || experienciaNumero < 0 || experienciaNumero > 10) {
        esValido = false;
    }

    return esValido;
}

function generarId(participantes) {
    let intentos = 1;
    while (intentos <= 100) {
        const newID = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const encontrado = participantes.find(participante => participante.id === newID)
        if (encontrado !== undefined) {
            intentos++;
            continue;
        } else {
            return newID;
        }
    }
    console.error("Error: Se ha alcanzado el límite de 100 intentos sin generar un ID único.");
    return null;
}