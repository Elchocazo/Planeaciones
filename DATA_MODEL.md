# MODELO DE DATOS — PLANEACIONES PEDAGÓGICAS (v4.0)

Este documento detalla los esquemas formales, tipos de datos, llaves de almacenamiento y ejemplos JSON de todas las entidades del sistema.

---

## 1. Versión de Esquema Global
- **Versión Activa:** `DATA_SCHEMA_VERSION = 4`
- **Llave de Verificación en LocalStorage:** `planeaciones_data_schema_version`

---

## 2. Definición de Entidades

### A. `ScheduleSlot` (Horario Escolar Semanal)
Representa un bloque de tiempo recurrente en la semana escolar del docente.

```typescript
interface ScheduleSlot {
  id: string;               // Identificador único (ej. "slot_lun_1_sistemas_4a")
  teacherId: string;        // ID del docente (ej. "usr_manuel")
  dayOfWeek: number;        // Día escolar: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  startTime: string;        // Formato HH:mm (ej. "07:00")
  endTime: string;          // Formato HH:mm (ej. "08:00")
  time: string;             // Texto formateado (ej. "07:00 - 08:00")
  subjectId: string;        // Slug de la asignatura (ej. "sistemas")
  subjectName: string;      // Nombre de la asignatura (ej. "Sistemas")
  gradeId: string;          // Slug del grado (ej. "4a")
  gradeName: string;        // Nombre del grado (ej. "4°A")
  group: string;            // Identificador de grupo/paralelo (ej. "4°A")
  subjectType: 'academic' | 'homeroom' | 'special'; // Tipo de materia
  color?: string;           // Color distintivo hexadecimal
}
```

#### Ejemplo JSON:
```json
{
  "id": "slot_mon_1_sis_4a",
  "teacherId": "usr_manuel",
  "dayOfWeek": 1,
  "startTime": "07:00",
  "endTime": "08:00",
  "time": "07:00 - 08:00",
  "subjectId": "sistemas",
  "subjectName": "Sistemas",
  "gradeId": "4a",
  "gradeName": "4°A",
  "group": "4°A",
  "subjectType": "academic"
}
```

---

### B. `CurriculumSequence` (Secuencia Curricular)
Representa el avance temático y consecutivo dentro de un período académico para una asignatura, grado y grupo específico.

```typescript
interface CurriculumSequence {
  id: string;               // Identificador único (ej. "seq_1p_sistemas_4a_1")
  teacherId: string;        // ID del docente
  period: string;           // Período académico: "1°" | "2°" | "3°" | "4°"
  subjectName: string;      // Nombre de la asignatura (ej. "Sistemas")
  gradeName: string;        // Nombre del grado (ej. "4°A")
  group: string;            // Paralelo/grupo (ej. "4°A" != "4°B")
  sequenceNumber: number;   // Consecutivo permanente: 1, 2, 3...
  topic: string;            // Tema pedagógico
  dba: string;              // Derecho Básico de Aprendizaje asociado
  achievement: string;      // Desempeño / Logro esperado
  status: 'planned' | 'pending' | 'completed'; // Estado de la secuencia
  createdAt: string;        // Timestamp ISO 8601
  updatedAt: string;        // Timestamp ISO 8601
}
```

#### Ejemplo JSON:
```json
{
  "id": "seq_1p_sis_4a_1",
  "teacherId": "usr_manuel",
  "period": "1°",
  "subjectName": "Sistemas",
  "gradeName": "4°A",
  "group": "4°A",
  "sequenceNumber": 1,
  "topic": "El Computador y sus Componentes de Hardware",
  "dba": "DBA 1 - Reconoce los componentes físicos del computador y sus periféricos de entrada y salida.",
  "achievement": "Identifica los dispositivos de entrada, salida y almacenamiento del computador.",
  "status": "planned",
  "createdAt": "2026-09-15T12:00:00.000Z",
  "updatedAt": "2026-09-15T12:30:00.000Z"
}
```

---

### C. `ClassSession` (Sesión de Clase Atómica)
Entidad fundamental de planeación. Modificar o guardar esta entidad no altera a ninguna otra clase ni fecha.

```typescript
interface ClassSession {
  id: string;               // ID permanente (ej. "cls_mu4sbg2b_e1kjhqp")
  teacherId: string;        // ID del docente propietario
  sequenceId: string | null;// Vínculo opcional a CurriculumSequence
  scheduleSlotId: string | null; // Vínculo al slot de horario
  date: string;             // Fecha inmutable en formato YYYY-MM-DD (ej. "2026-09-15")
  dayOfWeek: string;        // Nombre del día (ej. "Martes")
  startTime: string;        // Hora inicio (ej. "07:00")
  endTime: string;          // Hora fin (ej. "08:00")
  time: string;             // Rango horario (ej. "07:00 - 08:00")
  subjectId: string;        // Slug de materia (ej. "sistemas")
  subjectName: string;      // Nombre de materia (ej. "Sistemas")
  gradeId: string;          // Slug de grado (ej. "4a")
  gradeName: string;        // Nombre de grado (ej. "4°A")
  group: string;            // Paralelo/grupo (ej. "4°A")
  period: string;           // Período académico ("1°" | "2°" | "3°" | "4°")
  sequenceNumber: number;   // Consecutivo permanente de clase (1, 2, 3...)
  status: 'planned' | 'pending'; // Estado de la planeación
  subjectType: 'academic' | 'homeroom' | 'special';

  // Snapshot Curricular Inmutable
  curriculum: {
    topic: string;          // Tema de la clase
    dba: string;            // Texto del DBA
    achievement: string;    // Desempeño / Logro
  };

  // Estructura Pedagógica Modular
  pedagogy: {
    inicio: string;         // Fase 1: Saberes previos, motivación y propósito
    desarrollo: string;     // Fase 2: Conceptualización, explicación y actividades
    cierre: string;         // Fase 3: Síntesis, retroalimentación y balance
    recursos: string;       // Materiales didácticos y herramientas
    evaluacion: string;     // Criterios e instrumentos de evaluación formativa
    tareas: string;         // Compromisos o consultas para el hogar
    observaciones: string;  // Observaciones pedagógicas del grupo
  };

  observations: string;     // Observaciones pedagógicas (espejo)
  notebookContent: string;  // Guía pedagógica o contenido de cuaderno docente (HTML)
  attachments: Array<{      // Archivos y anexos didácticos
    id: string;
    name: string;
    type: string;
    data: string;
  }>;

  version: number;          // Versión atómica incremental (1, 2, 3...)
  createdAt: string;        // Timestamp ISO 8601
  updatedAt: string;        // Timestamp ISO 8601
}
```

#### Ejemplo JSON:
```json
{
  "id": "cls_mu4sbg2b_e1kjhqp",
  "teacherId": "usr_manuel",
  "sequenceId": "seq_1p_sis_4a_1",
  "scheduleSlotId": "slot_mon_1_sis_4a",
  "date": "2026-09-15",
  "dayOfWeek": "Martes",
  "startTime": "07:00",
  "endTime": "08:00",
  "time": "07:00 - 08:00",
  "subjectId": "sistemas",
  "subjectName": "Sistemas",
  "gradeId": "4a",
  "gradeName": "4°A",
  "group": "4°A",
  "period": "1°",
  "sequenceNumber": 1,
  "status": "planned",
  "subjectType": "academic",
  "curriculum": {
    "topic": "El Computador y sus Partes",
    "dba": "DBA 1 - Reconoce los componentes físicos del computador.",
    "achievement": "Identifica los dispositivos de entrada y salida."
  },
  "pedagogy": {
    "inicio": "Saludo institucional y lluvia de ideas sobre qué aparatos electrónicos conocen en casa.",
    "desarrollo": "Explicación en tablero de las cuatro partes fundamentales del PC (CPU, monitor, teclado y mouse). Dibujo en el cuaderno de cada dispositivo con su respectiva función.",
    "cierre": "Ronda de preguntas rápidas identificando si cada elemento es de entrada o de salida.",
    "recursos": "Tablero, marcadores, cuaderno de apuntes, sala de sistemas.",
    "evaluacion": "Revisión en clase del dibujo y participación oral en la ronda de preguntas.",
    "tareas": "Pegar en el cuaderno dos recortes de periódicos o revistas que muestren teclados o mouses.",
    "observaciones": "El grupo participó activamente y completó los dibujos con claridad."
  },
  "observations": "El grupo participó activamente y completó los dibujos con claridad.",
  "notebookContent": "<p>Guía de trabajo #1: Hardware del computador.</p>",
  "attachments": [],
  "version": 1,
  "createdAt": "2026-09-15T07:00:00.000Z",
  "updatedAt": "2026-09-15T08:00:00.000Z"
}
```

---

## 3. Llaves de Persistencia en Storage

| Llave | Almacenamiento | Propósito |
|---|---|---|
| `teacher_class_sessions_{tid}_v4` | LocalStorage + IndexedDB | Mapa `id -> ClassSession` de todas las sesiones de clase del docente. |
| `teacher_curriculum_sequences_{tid}_v4` | LocalStorage + IndexedDB | Array de `CurriculumSequence` con el estado de avance temático. |
| `teacher_planner_plans_{tid}_v3` | LocalStorage | Modo espejo agrupado por fecha para compatibilidad 100% con herramientas legadas. |
| `school_current_active_user_v2` | LocalStorage | ID del docente o coordinador actualmente activo en la interfaz. |
| `planeaciones_data_schema_version` | LocalStorage | Indicador numérico de la versión del esquema (`4`). |
| `pre_migration_v4_backup_{tid}_{ts}` | LocalStorage | Respaldo automático inmutable generado antes de cualquier migración. |
