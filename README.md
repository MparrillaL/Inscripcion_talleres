# Gestor de participantes de un evento

Práctica UD1 de Desarrollo Web en Entorno Cliente. Aplicación en HTML, CSS y JavaScript (sin frameworks ni servidor) para gestionar inscripciones.

## Descripción del proyecto

Web para gestionar las inscripciones de un evento. Se pueden añadir y borrar participantes, buscarlos, ver estadísticas, pasar la lista a JSON, ver un panel resumen y guardar el tema y el tamaño de letra en cookies. Todo se hace en el navegador, sin servidor.

## Fases del desarrollo

1. Maqueté las páginas en HTML y les di estilo con CSS.
2. Programé la lógica (validar, calcular estadísticas, filtrar) en un archivo aparte.
3. Conecté la lógica con la página: formulario, tarjetas y borrado.
4. Añadí exportar e importar en JSON.
5. Hice el panel en el iframe y la comunicación con la página principal.
6. Añadí las preferencias con cookies.
7. Hice la ventana de ayuda.
8. Revisé todo con el enunciado, comenté el código y escribí este README.

## Estructura

| Archivo | Función |
|---|---|
| `index.html` | Página principal: formulario, búsqueda, estadísticas, tarjetas, iframe, JSON, preferencias y ayuda |
| `panel.html` | Panel del evento (se incrusta en un iframe) |
| `ayuda.html` | Ayuda (se abre con `window.open`) |
| `css/estilos.css` | Estilos, tema claro/oscuro y tamaño de letra |
| `js/logica.js` | Validación y cálculos (no toca el DOM) |
| `js/app.js` | Interfaz de la página principal |
| `js/panel.js` | Lógica del panel del iframe |
| `js/preferencias.js` | Tema y tamaño de letra con cookies |
| `js/cookies.js` | `guardarCookie`, `leerCookie`, `borrarCookie` |
| `js/ayuda.js` | Datos del navegador en la ayuda |

## Funcionalidades, archivos y casos de prueba

### 1. Datos iniciales
- **Cómo:** `crearParticipantesEjemplo()` en `logica.js` devuelve tres participantes; `app.js` los guarda en `participantes`.

- **Prueba:** abrir la página. Resultado: tres tarjetas (Ana García 17, Carlos Pérez 29, Elena Gómez 42) y estadísticas con total 3.

### 2. Alta y validación
- **Cómo:** `validarParticipante(datos)` y `normalizarParticipante(datos)` en `logica.js`; `enviarFormulario` y `mostrarErroresFormulario` en `app.js`. Se comprueba el texto antes de convertir con `Number`.

- **Prueba válida:** `Luis Gil`, `0`, `invitado`, `online`, `3.5`. Resultado: nueva tarjeta, formulario vacío, estadísticas actualizadas.

- **Pruebas inválidas** (no se añade nada y se conservan los valores):
  - Nombre `A` o solo espacios: error de longitud.
  - Edad vacía, `18abc`, `-3`, `17.5`, `121`: error de edad.
  - Experiencia vacía, `11`, `3,5`, `abc`: error de experiencia.
  - Tipo o modalidad alterados desde DevTools (por ejemplo `value="otro"`): error en el campo.

### 3. Clasificaciones y tarjetas
- **Cómo:** `obtenerClasificacionEdad` y `obtenerClasificacionExperiencia` en `logica.js`; `crearTarjeta` en `app.js` con `createElement`, `textContent`, `append`, `classList` y `setAttribute` (sin `innerHTML`).

- **Prueba:** edad 17 y experiencia 2.5 dan "Menor de edad" e "Inicial"; edad 18 y experiencia 7 dan "Mayor de edad" y "Avanzada". La fecha sale en formato español.

### 4. Baja de participantes
- **Cómo:** `borrarParticipante` en `app.js`: `confirm`, `splice` y eliminación de la tarjeta con `querySelector`.

- **Prueba:** pulsar Eliminar y aceptar: desaparece solo esa tarjeta y cambian estadísticas y panel. Pulsar Eliminar y cancelar: no cambia nada.

### 5. Búsqueda y filtro
- **Cómo:** `filtrarPorNombre` y `filtrarPorModalidad` en `logica.js`; `aplicarFiltros` y `actualizarAvisoSinResultados` en `app.js`.

- **Prueba:** buscar `ANA` encuentra a Ana (sin distinguir mayúsculas). Combinar con modalidad `online` da "Ningún participante coincide con la búsqueda." Eliminar a todos da "No hay participantes inscritos."

### 6. Estadísticas
- **Cómo:** `calcularEstadisticas` y `calcularExperienciaMediaPresencial` (con `continue`) en `logica.js`; `actualizarEstadisticas` en `app.js`. Todo con bucles y acumuladores.

- **Prueba:** con los tres de ejemplo: total 3, menores 1, mayores 2, edad media 29.33, mínima 17, máxima 42, experiencia presencial media 5.50. Con la lista vacía (importar `[]`): "Sin datos" en medias y extremos, sin `NaN`.

### 7. Primer menor de edad
- **Cómo:** `buscarPrimerMenor` (bucle con `break`) en `logica.js`; `mostrarPrimerMenor` en `app.js`.

- **Prueba:** pulsar el botón: "Primer menor de edad: Ana García (17 años)." Tras eliminar a Ana: "No hay ningún menor de edad inscrito."

### 8. Exportar e importar JSON
- **Cómo:** `exportarParticipantes` e `importarParticipantesDesdeJSON` en `app.js` (`JSON.stringify`, `JSON.parse` con `try/catch`); `validarColeccionImportada` en `logica.js`.

- **Prueba de exportar:** pulsar Exportar: el textarea muestra el JSON de la colección.

- **Prueba de importar válido:** pegar el JSON exportado cambiando un nombre y pulsar Importar: se actualizan tarjetas, estadísticas y panel. Importar `[]`: lista vacía y panel "Sin inscripciones".

- **Pruebas inválidas** (se conserva la colección anterior): `{ mal`, `{}`, `[1]`, un participante con `"edad": "17"`, edad 200, id repetido, id `99`, fecha `"ayer"`, un elemento válido y otro inválido.

### 9. Panel en iframe (`postMessage`)
- **Cómo:** `enviarResumenAlPanel` y `recibirMensajePanel` en `app.js`; `recibirMensaje` y `pintarResumen` en `panel.js`; `crearResumenPanel` y `validarMensajeResumen` en `logica.js`. `targetOrigin` es `window.location.origin` (nunca `"*"`), y se comprueban `origin`, `source` y `data`.

- **Prueba:** al cargar, el panel muestra total, presenciales, online y última inscripción. Tras un alta, baja o importación se actualiza. Con lista vacía: "Sin inscripciones".

- **Mensajes rechazados:** en la consola del panel (seleccionando su contexto) o de la página, ejecutar `window.postMessage({tipo:"resumen",total:-1,presencial:0,online:0,ultimo:null}, "*")`. No cambia nada ni hay errores. Lo mismo con un objeto de estructura incorrecta.

### 10. Preferencias con cookies
- **Cómo:** `iniciarPreferencias`, `guardar` y `restablecer` en `preferencias.js`; `guardarCookie`, `leerCookie` y `borrarCookie` en `cookies.js` (`Path=/`, `SameSite=Lax`, `Max-Age` en segundos y `Secure` solo con HTTPS).

- **Prueba de guardar:** elegir tema oscuro y letra grande y pulsar Guardar: se aplican y en DevTools (Application, Cookies) aparecen `tema` y `tamano`. Recargar: se mantienen.

- **Prueba de restablecer:** pulsar Restablecer: desaparecen las cookies y vuelve el tema claro con letra normal.

- **Cookies ausentes:** borrarlas a mano y recargar: tema claro y letra normal.

- **Cookies alteradas:** poner `tema=%` o `tamano=gigante` en DevTools y recargar: se usan los valores por defecto sin errores.

- **Cookies bloqueadas:** bloquearlas en el navegador y pulsar Guardar: se aplican durante la visita y aparece un aviso.

### 11. Ayuda
- **Cómo:** `abrirAyuda`, `cerrarAyuda` y `ayudaAbierta` en `app.js` (`window.open`, referencia guardada y `closed`); `ayuda.js` muestra `navigator.language`, `location.origin` y `screen.width` x `screen.height`.

- **Prueba:** pulsar Abrir ayuda: se abre la ventana. Pulsarlo otra vez: se reutiliza y se avisa. Pulsar Cerrar ayuda: se cierra. Con ventanas emergentes bloqueadas: aparece el aviso.


## Uso de la IA

- Enlace al chat: (https://gemini.google.com/share/d/1wSWhD5W5hQUthZEVcHowogTHPkyQPAuW?usp=sharing)


