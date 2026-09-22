# ARQUITECTURA DEL SISTEMA — PLANEACIONES PEDAGÓGICAS (v4.0)

Este documento describe la arquitectura modular, desacoplada y definitiva del sistema de gestión de planeaciones de clase docentes.

---

## 1. Visión General y Filosofía

La aplicación fue rediseñada integralmente para transformar un planeador tradicional basado en arrays planos y parches reactivos en un **Gestor Profesional de Secuencias y Planeaciones de Clase**, conectado al horario escolar, la malla curricular y el sistema de exportación institucional oficial.

### Principios Fundamentales
1. **Desacoplamiento Absoluto:** El horario escolar, la secuencia curricular y la planeación de cada clase son entidades independientes con su propio ciclo de vida.
2. **Consecutivo Permanente e Inmutable (`sequenceNumber`):** El número de clase de una asignatura y curso jamás se calcula a partir de índices de un array ni de la posición en el día. Una vez asignado, permanece inmutable. El siguiente consecutivo siempre se calcula como `max(existentes) + 1`.
3. **Independencia Total de Paralelos:** `4°A` y `4°B` son grupos completamente independientes. Nunca comparten contador de clase ni se sincronizan entre sí.
4. **Navegación de Solo Lectura:** Cambiar de día, mes o vista en el calendario jamás guarda, renumera ni crea registros ficticios. Navegar es 100% lectura pura.
5. **Guardado Atómico:** Guardar una sesión de clase afecta **únicamente** a esa sesión de clase en su propio registro.
6. **Preservación Estricta del Formato Institucional:** Las exportaciones a Word (`.docx`) y PDF mantienen al 100% el diseño de tablas, encabezados 2x6, tipografía y sellos de coordinación exigidos institucionalmente.

---

## 2. Las Tres Entidades Centrales

```
+---------------------+         +------------------------+
|    ScheduleSlot     |         |   CurriculumSequence   |
| (Horario Escolar)   |         | (Secuencia Pedagógica) |
+---------------------+         +------------------------+
         \                                  /
          \                                /
           \                              /
            v                            v
          +--------------------------------+
          |          ClassSession          |
          |       (Sesión de Clase)        |
          +--------------------------------+
```

### 1. `ScheduleSlot` (Horario Semanal)
- Representa un espacio recurrente en la semana escolar (ej. "Lunes de 07:00 a 08:00 - Sistemas 4°A").
- **Propósito:** Plantilla organizativa de qué clases deben ocurrir cada día.
- **Ciclo de vida:** Configurable desde el perfil docente. Cambiar el horario jamás altera ni destruye planeaciones históricas previamente redactadas.

### 2. `CurriculumSequence` (Secuencia Curricular)
- Representa el avance pedagógico de una asignatura en un grado y grupo a lo largo de un período académico.
- **Propósito:** Registro acumulativo de clases planeadas (`planned`), pendientes (`pending`) y porcentaje de cobertura temática.
- **Regla:** Se identifica de forma unívoca por `(period, subject, grade, group, sequenceNumber)`.

### 3. `ClassSession` (Sesión de Clase)
- Representa la clase real dictada o a dictar en una fecha calendario específica.
- **Propósito:** Contiene las actividades pedagógicas concretas redactadas por el docente (Inicio, Desarrollo, Cierre, Recursos, Evaluación, Tareas, Observaciones) y su snapshot curricular (Tema, DBA, Desempeño).
- **Aislamiento:** Posee su propio identificador único (`id`), número de versión (`version`) y timestamps.

---

## 3. Capas de la Aplicación

```
+-------------------------------------------------------------------------+
|                               CAPA UI / VISTAS                          |
|  - DashboardView (Inicio / Hoy)      - CalendarComponent (Mensual)      |
|  - ClassEditorView (Editor Atómico)  - SequenceView (Seguimiento)       |
|  - CurriculumSelectorModal           - CoordinatorView (Supervisión)    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            CAPA CORE & ENRUTADOR                        |
|  - AppRouter: Transiciones limpias de lectura pura                      |
|  - AppState: Estado reactivo global y desacoplado                       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           CAPA DE SERVICIOS                             |
|  - ScheduleService: Construye vistas del día sin mutaciones             |
|  - SequenceService: Monitorea avance y consecutivos                     |
|  - ClassService: Lógica de guardado, debounce y validación              |
|  - MigrationManager: Migración segura v3 -> v4 con respaldo automático  |
|  - BackupService: Importación / exportación total en JSON               |
+-------------------------------------------------------------------------+
                    |                                   |
                    v                                   v
+------------------------------------+ +----------------------------------+
|      CAPA DE EXPORTACIÓN           | |       CAPA DE REPOSITORIOS       |
|  - ExportAdapter: READ -> TRANSFORM| |  - ScheduleRepository            |
|  - ExportService: PDF / Previa     | |  - SequenceRepository            |
|  - DocxGenerator: Word institucional| |  - ClassRepository               |
+------------------------------------+ |  - CurriculumRepository          |
                                       +----------------------------------+
                                                        |
                                                        v
                                       +----------------------------------+
                                       |      PERSISTENCIA / STORAGE      |
                                       |  - LocalStorage (Cache rápido)   |
                                       |  - IndexedDB (Almacenamiento)    |
                                       |  - BroadcastChannel (Multi-tab)  |
                                       +----------------------------------+
```

---

## 4. Flujo de Datos y Ciclo de Vida de una Planeación

### Caso A: Visualización de un Día (Navegación)
1. El usuario selecciona un día en el Calendario o en Inicio.
2. `AppRouter.navigateTo('dashboard')` activa `DashboardView.setDate(dateStr)`.
3. `ScheduleService.buildDayView(dateStr, teacherId)` consulta:
   - Los slots del horario semanal para ese día de la semana (`ScheduleRepository`).
   - Las clases ya planeadas en esa fecha (`ClassRepository`).
4. Si un slot tiene una `ClassSession` existente, la muestra como **"Planeada"** con su tema y número de clase real.
5. Si no tiene clase aún, la muestra como **"Pendiente (+ Planear)"** sin alterar la persistencia.
6. **Resultado:** Operación 100% de lectura pura. Cero escrituras en base de datos.

### Caso B: Redacción y Guardado de una Clase
1. El usuario pulsa `+ Planear` o `✏️ Editar`.
2. Se abre `ClassEditorView` con la `ClassSession` seleccionada.
3. El docente redacta los campos pedagógicos modulares (Inicio, Desarrollo, Cierre, etc.) o importa desde la malla con `CurriculumSelectorModal` (copiando un snapshot inmutable).
4. **Autoguardado con debounce:** A los 1,000 ms de inactividad, `ClassService.scheduleAutoSave` persiste exclusivamente la clase activa.
5. **Guardado manual:** Al presionar `💾 Guardar clase`, se valida la estructura y `ClassRepository.saveClass` incrementa la versión atómica (`version: n + 1`).
6. El repositorio genera un snapshot de seguridad previo y actualiza el almacenamiento local, notificando a otras pestañas mediante `BroadcastChannel`.

### Caso C: Exportación Institucional
1. El usuario pulsa `📄 PDF` o `📘 Word (.docx)`.
2. `ExportAdapter.fromClass(classSession, profile)` convierte la entidad al contrato unificado sin mutar la clase.
3. El motor de exportación genera el documento institucional con el encabezado oficial, tablas indivisibles (`cantSplit`), encabezados repetidos (`tblHeader`) y firma de coordinación académica.

---

## 5. Prevención de Pérdida de Datos y Salvaguardas

1. **Snapshots Automáticos:** Cada vez que una clase o día es actualizado o eliminado, el sistema crea un respaldo previo versionado en `IDBStorage`.
2. **Regla Anti-Vacíos:** Si un campo clave contiene texto sustantivo previo y un guardado accidental envía un string vacío o nulo, el repositorio rechaza la sobrescritura destructiva y preserva el contenido anterior.
3. **Respaldo Previo a Migración:** El `MigrationManager` crea una copia integral de todos los planes antes de transformar datos a la versión de esquema 4 (`DATA_SCHEMA_VERSION = 4`). Si ocurre cualquier error, se ejecuta un rollback automático al estado original.
