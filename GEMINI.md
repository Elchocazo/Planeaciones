# Reglas Arquitectónicas del Proyecto - Generador de Planeadores

## Estándar Documental y Motor de Paginación (Fidelidad Word y Google Docs)

Toda la maquetación visual, el cuaderno pedagógico (`notebook-editor.js`), el motor de paginación (`pagination-engine.js`) y las exportaciones deben regirse estrictamente por los siguientes principios técnicos invariantes:

### 1. Prohibición de Bloques Monolíticos Indivisibles
- **Listas (`<ul>`, `<ol>`)**: NUNCA trasladar una lista completa a la siguiente página solo porque excede el espacio disponible. Las listas deben fragmentarse elemento por elemento (`<li>`). Los ítems que quepan en la página actual deben permanecer en ella; únicamente los ítems restantes deben fluir a la página siguiente.
- **Tablas (`<table>`)**: Si una tabla excede el límite inferior de la página, debe partirse por filas (`<tr>`), trasladando las filas sobrantes a la hoja siguiente.
- **Párrafos extensos**: No deben ser expulsados en bloque si existe espacio para alojar sus primeras líneas, respetando el control de huérfanas y viudas (mínimo 2 líneas por página).

### 2. Control Estricto de Títulos y Encabezados Huérfanos (`keep-with-next`)
- Ningún encabezado (`h1`-`h6`), título de fase ni párrafo que actúe como título o subtítulo de sección puede quedar al final de una página sin contenido asociado.
- Un título solo puede permanecer en la página si su elemento subsiguiente tiene espacio para colocar al menos su primer elemento (primer ítem de lista o primeras 2 líneas de texto). Si el elemento subsiguiente debe comenzar en la hoja siguiente, el título DEBE acompañarlo y trasladarse a la nueva hoja.

### 3. Recombinación Transparente y No Destructiva
- Cualquier división efectuada en el DOM para propósitos de visualización paginada (listas partidas, tablas partidas) debe ser 100% reversible.
- Antes de cada ciclo de cálculo y al ejecutar `getCleanHtml()`, los elementos divididos deben recombinarse a su estado semántico único original.
- Cero contaminación de espaciadores efímeros o duplicados en el almacenamiento de datos (`idb-storage`, `storage.js`) o en las exportaciones Word (`docx-generator.js`, `export.js`).

---

## Estándar de Rendimiento, Seguridad contra Bloqueos e Integridad Multimedia

Todo el procesamiento de texto, manejo de imágenes, sincronización de estado y enrutamiento debe cumplir estrictamente con los siguientes requisitos:

### 4. Prevención Absoluta de Retroceso Catastrófico de Regex (Anti-ReDoS)
- **Cero cuantificadores anidados solapados**: Está terminantemente prohibido usar patrones como `(?:\n+|:\s*\n*|\s*:\s*|\s+)*`, `(a+)+` o combinaciones repetitivas de espacios y separadores anidados. Toda normalización de saltos de línea y puntuación debe ser estrictamente determinista (ej. `[\s:]*`).
- **Cuantificadores de encabezados acotados**: Patrones de captura que preceden a separadores o saltos (como encabezados con dos puntos) NUNCA deben ser indefinidamente codiciosos (evitar `[^\n:]+:`). Deben poseer límites fijos de longitud razonables (ej. `[^\n:]{1,120}:`) para evitar complejidad $O(N^2)$ al procesar cadenas largas.
- **Límite de tiempo de CPU**: Ninguna rutina de limpieza de texto (`cleanDocumentArtifacts`, `cleanBrokenLinebreaks`, `unglueText`, etc.) debe demorar más de 10 ms en procesar un documento completo.

### 5. Blindaje Obligatorio de Contenido Multimedia y Cadenas Base64
- **Aislamiento previo invariable**: Antes de ejecutar cualquier expresión regular de limpieza semántica, matemática, salto de línea o despegado de texto sobre un campo o HTML, toda etiqueta multimedia (`<img\b[^>]*>`, URIs `data:image/...`, audios o videos) DEBE ser extraída y sustituida por marcadores de posición protegidos (`___IMG_SHIELD_X___`).
- **Restauración íntegra**: Al concluir las transformaciones, los marcadores deben ser reconstituidos exactamente a su contenido binario/HTML original. Jamás someter payloads base64 a expresiones regulares de análisis lingüístico o de formato.

### 6. Compresión y Optimización de Imágenes en Cliente
- **Ingreso optimizado**: Toda imagen adjuntada al cuaderno pedagógico o planeador (vía subida de archivo, arrastrar y soltar o pegado directo del portapapeles `onpaste`) debe ser interceptada y procesada a través de Canvas off-screen antes de insertarse en el DOM o almacenarse en la base de datos.
- **Límites dimensionales y de peso**: Las imágenes deben redimensionarse automáticamente a un ancho máximo de 1280px con compresión de calidad balanceada (0.80 a 0.82 en formato WebP o JPEG de respaldo), garantizando pesos inferiores a ~200 KB por imagen para no agotar la cuota de `localStorage` / `IndexedDB` ni congelar el hilo principal en el auto-guardado.

### 7. Preservación del Estado de Navegación y Rutas en Recarga (`F5`)
- El enrutador (`AppRouter`) y la verificación de perfil inicial (`checkProfileOrOnboarding`) deben respetar el hash de la URL activa (`#notebook?id=...`, `#editor?id=...`, `#calendar`, etc.) durante eventos de carga inicial o recarga de página.
- Jamás debe forzarse una redirección destructiva al `#dashboard` si el usuario ya se encuentra editando o visualizando una clase específica indicada en el hash.

### 8. Organización de Talleres Prácticos en Hoja Independiente Imprimible
- Cuando en la importación o estructuración de una clase se detecte la sección "TALLER / EJERCICIO PRÁCTICO DE LA CLASE" (o taller práctico formativo), dicho contenido debe generarse y formatearse obligatoriamente como una **hoja de trabajo independiente** dentro del cuaderno pedagógico.
- La hoja debe contar con su correspondiente salto de página de impresión (`page-break`), membrete institucional del taller con campos para nombre del estudiante, fecha y grado, y debe estar 100% limpia de sintaxis residual (`\text`, `{}`, `$`, markdown crudo o cuadros vacíos sin uso), quedando lista para imprimir y entregar directamente al alumnado.

### 9. Blindaje y Formateo Pedagógico de Bloques de Código y Preservación de Paréntesis
- **Aislamiento de Código (`___CODE_BLOCK_SHIELD_X___`)**: Todo bloque de código o script técnico (Arduino, C++, Python, JavaScript, HTML, etc.), ya sea demarcado con cercas markdown (```), bloques preexistentes `<pre><code>` o detectado por cabeceras (`C++`, `#include`, `void setup()`, etc.), DEBE ser aislado y protegido de cualquier rutina de despegado (`unglueText`), unión de saltos de línea (`cleanBrokenLinebreaks`) o limpieza de artefactos (`cleanDocumentArtifacts`).
- **Integridad Sintáctica**: Prohibido bajo cualquier circunstancia eliminar o alterar llaves `{}` de bloques de código o conjuntos matemáticos, ni recortar bibliotecas o encabezados (`<ESP32Servo.h>`, `<Wire.h>`).
- **Preservación Estricta de Paréntesis `()`**: Toda rutina de limpieza sintáctica o inline markdown DEBE verificar que no existan paréntesis abiertos antes de pretender eliminar cierres huérfanos. Jamás eliminar un paréntesis de cierre `)` si en el segmento de texto existe su correspondiente paréntesis de apertura `(`.
- **Renderizado Estructurado**: Los bloques de código deben representarse visualmente dentro del cuaderno mediante contenedores con clase `.notebook-code-block`, estilo monospace, soporte para impresión (`page-break-inside: avoid`), cabecera del lenguaje y preservación íntegra de saltos de línea e identación.

### 10. Persistencia Absoluta e Inviolabilidad de Planeaciones entre Actualizaciones y Versiones
- **Prohibición Total de Reemplazo Destructivo**: Ningún script, migración, inicio de sesión o actualización de versión de base de datos (`v1`...`v5`...) puede sobrescribir con un conjunto vacío `{}` o un arreglo menor `[]` las planeaciones o clases ya existentes. Toda carga o migración debe ser estrictamente aditiva y conservativa (fusión / unión). Si la memoria posee datos y la fuente entrante está vacía, la persistencia destructiva debe ser rechazada inmediatamente.
- **Inmunidad ante Cambios de Claves de Almacenamiento (Key Bumping)**: Al cambiar o elevar la versión de una clave de almacenamiento (ej. de `_v4` a `_v5`), los repositorios (`ClassRepository`, `PlanRepository`, `StorageService`) DEBEN consultar en cascada todas las claves históricas previas (`_v4`, `_v3`, `_v2`, `_v1`, IndexedDB y el banco semilla oficial empaquetado) para migrar y conservar el 100% de las clases previas antes de dar por inicializado el repositorio.
- **Resguardo Multinivel (LocalStorage, IndexedDB, Banco Semilla y Firestore)**: Las planeaciones deben persistir en múltiples capas independientes. Si una capa (ej. LocalStorage) sufre purga del navegador, limpieza de caché o navegación en nuevo perfil, el sistema debe restaurar automáticamente las planeaciones desde IndexedDB, el banco semilla oficial (`initial-classes-data.js`) o Cloud Firestore de forma transparente e inmediata sin pérdida de información.
- **Filtro Anti-Borrado Fantasma**: Una clase solo puede dejar de mostrarse si existe un registro explícito de eliminación consciente del docente en la lista negra (`school_deleted_classes_`). Ningún filtro por origen (`_source: migration/backup/autosave`) ni error de red debe provocar que las clases desaparezcan de las interfaces pedagógicas.

### 11. Persistencia Confirmada e Importación sin Pérdida de Planeaciones
- **Guardado Obligatorio e Inmediato al Importar**: Al pulsar «Importar clase», «Importar como nueva clase» o «Aplicar a clase», cada planeación DEBE ser escrita físicamente en el almacenamiento persistente (`LocalStorage` e `IndexedDB`) y verificada mediante lectura de comprobación (`verifyPersistence`) ANTES de presentar la operación como exitosa en la interfaz. El guardado jamás debe depender de temporizadores de autoguardado, cambios de pantalla, eventos de salida (`beforeunload`, `pagehide`) ni variables volátiles en memoria.
- **Prohibición de Notificaciones Falsas de Éxito**: Está terminantemente prohibido cerrar modales de importación o emitir toasts de éxito si la escritura persistente no ha finalizado o arrojó error. Si la escritura falla, los datos del usuario pegados en el modal deben conservarse intactos en pantalla junto con el mensaje explícito de error.
- **`ClassRepository` como Única Fuente Canónica**: `ClassRepository` es el repositorio rector y la única fuente de verdad para las sesiones individuales de clase. `PlanRepository` opera como vista agregada y sincronizada por fecha; bajo ninguna circunstancia un estado de `PlanRepository` o un volcado diario puede eliminar o mutilar una clase existente en `ClassRepository`.
- **Rol Secundario y No Intercurrente del Autoguardado**: El autoguardado es una salvaguarda pasiva periódica. Nunca debe sobreescribir ni interferir con una importación en curso. Toda importación o restauración de respaldo ejecuta su propio flujo transaccional y espera la confirmación antes de permitir nuevos ciclos de autoguardado.
- **Orden Estricto de Inicialización Asíncrona**: Al arrancar la aplicación (`App.init`), la secuencia obligatoria es: (1) Abrir e inicializar `IDBStorage`; (2) Inicializar y await secuencial de `ScheduleRepository`, `ClassRepository` y `PlanRepository`; (3) Ejecutar migraciones aditivas (`MigrationManager`); (4) Ejecutar auto-recuperación y rescate (`RecoveryService`); (5) Ejecutar saneamiento y realineación de horario; (6) Inicializar vistas y modales; (7) Inicializar Router y renderizar la interfaz con datos 100% verificados. Prohibido ejecutar llamadas de renderizado o mutaciones en memoria que disparen guardados desincronizados antes de que IndexedDB haya terminado de cargarse.
- **Inmunidad contra Carreras de Concurrencia Multi-Capa**: Cuando `IDBStorage.set` se ejecuta, la promesa solo resuelve tras `tx.oncomplete` (confirmación física en disco). Si `LocalStorage` alcanza su cuota límite (`QuotaExceededError`), el error debe gestionarse sin abortar la persistencia en `IndexedDB`, y la pre-hidratación sincrónica nunca debe sobreescribir la base de datos persistente con datos incompletos de `LocalStorage`.


### 12. Sincronización Incremental, Idempotente y sin Pérdida de Datos (Google Cloud Firestore)
- **Sincronización en Dos Fases Invariante**:
  - **Fase A (Inicial Única)**: Al enlazar la nube por primera vez o carecer de confirmación previa (`firestore_initial_sync_done_${teacherId}`), el sistema ejecuta una reconciliación completa bidireccional no destructiva. Una vez completada, el indicador se fija en verdadero y cesa todo ciclo de subida global.
  - **Fase B (Incremental Exclusiva)**: Toda sincronización subsiguiente opera estrictamente sobre la cola de cambios pendientes (`firestore_sync_queue_${teacherId}`). Si la cola tiene 0 pendientes, el estado es inmediatamente «Todo sincronizado» con 0 escrituras de red y sin animación de spinner.
- **Blindaje Anti-Eco y Prevención de Bucles de Retroalimentación**:
  - Toda mutación originada desde la nube o sincronización interna DEBE propagar el flag `skipCloud: true` a lo largo de toda la cadena de repositorios (`ClassRepository`, `PlanRepository`, `StorageService`). Prohibido omitir `skipCloud` en llamadas intermedias como `_syncToPlanRepository`.
  - Los escuchadores en tiempo real (`onSnapshot`) deben verificar el hash de contenido (`_computeHash`) antes de provocar escrituras locales. Si el documento entrante posee el mismo hash que el último conocido, el evento se descarta como eco sin re-guardar ni re-emitir.
- **Hashing Determinista de Contenido Pedagógico**: Las comparaciones de cambio se realizan sobre una representación normalizada canónica con ordenación de claves, excluyendo marcas de tiempo volátiles (`cloudUpdatedAt`, `cloudStampedAt`, `_syncedAt`, `updatedAt`, `timestamp`). Documentos con contenido pedagógico idéntico jamás deben generar entradas en la cola ni escrituras de red redundantes.
- **Propagación Segura de Eliminaciones y Anti-Resurrección**:
  - La eliminación de una clase o planeación encola una acción destructiva atómica (`action: 'delete'`) que purga el documento en `school_classes_v1` y actualiza `school_plans_v1`.
  - Las clases registradas en la lista negra local de eliminadas (`ClassRepository.isDeletedClass`) tienen prioridad absoluta y jamás pueden ser reinsertadas o resucitadas por descargas o snapshots entrantes de la nube.
- **Control de Concurrencia y Detención Limpia**: El procesador de sincronización implementa mutex (`_isSyncing`) para evitar subidas concurrentes del mismo registro, soporte para pausa/detención inmediata (`pauseSync`) sin corrupción de estado, y reintentos con límite (máximo 3) para garantizar estabilidad del hilo principal.


### 13. Desacoplamiento Total de la Sincronización en la Nube y Cero Bloqueo de UI
«La sincronización con Firebase nunca debe bloquear el arranque, el renderizado ni la navegación que puedan funcionar con datos locales. Toda modificación de la inicialización debe preservar las reglas de persistencia, sincronización incremental y recuperación existentes, y debe incluir pruebas de regresión».

- **Arranque Inmediato sin Espera de Red**: La aplicación debe mostrar inmediatamente los datos locales pre-hidratados en memoria (0 ms de espera) y permitir la navegación fluida e instantánea entre vistas («Inicio / Hoy», «Calendario», «Materias & Clases», «Historial», «Recuperadas», «Configuración») sin depender de la conectividad o respuesta de Firebase Firestore.
- **Desacoplamiento Asíncrono de Firestore**: La inicialización de la conexión con Google Cloud Firestore y los ciclos de sincronización (inicial o incremental) deben ejecutarse en segundo plano (asíncrono desacoplado mediante `setTimeout` / microtarea), jamás interponiéndose en la secuencia crítica de renderizado local.
- **Prioridad Absoluta de Componentes e Interactividad**: Los componentes (`window.Calendar`, `window.Planner`), modales, el enrutador (`AppRouter`) y los escuchadores de navegación (`bindEvents`) deben registrarse y quedar 100% operativos antes de cualquier operación de red.
- **Mutex y Protección de Concurrencia en Conexión**: `FirestoreService.init()` debe implementar un singleton / mutex (`_initPromise`) para prevenir ejecuciones concurrentes múltiples, evitar carreras de bloqueo en `enablePersistence` y rechazar suscripciones duplicadas a `onSnapshot`.
- **Transparencia en Indicadores de Estado**: El indicador visual de la cabecera debe reflejar de forma fidedigna y no intrusiva el estado de la nube sin simular bloqueos ni congelar el hilo principal de la aplicación.
