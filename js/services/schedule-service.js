/**
 * SERVICIO DE HORARIO (ScheduleService)
 * Motor del horario escolar institucional.
 * - Resuelve qué asignaturas y grados corresponden para cualquier fecha según el horario recurrente.
 * - Construye la vista del día mediante operaciones puras de lectura (loadDate).
 * - Maneja bloques consecutivos sin fusionar ni destruir sesiones pedagógicas (Req. 46).
 */

class ScheduleServiceClass {
  constructor() {}

  /**
   * Construye la vista del día de forma 100% PURA (READ-ONLY)
   * No crea clases, no renumera, no borra ni modifica datos existentes (Req. 25).
   */
  buildDayView(dateStr, teacherId) {
    if (!dateStr) return null;
    const tid = teacherId || ClassRepository._getCurrentTeacherId();

    // 1. Obtener slots del horario para esta fecha (Lunes..Viernes)
    const scheduleSlots = ScheduleRepository.getSlotsForDate(dateStr, tid);

    // 2. Obtener clases reales ya persistidas para esta fecha
    const savedClasses = ClassRepository.getByDate(dateStr, tid);

    // 3. Mapear qué clases corresponden hoy
    const usedClassIds = new Set();
    const slotsWithClassInfo = scheduleSlots.map(slot => {
      // 1. Buscar si ya existe una clase asociada directamente a este slotId
      let matchedClass = savedClasses.find(c => !usedClassIds.has(c.id) && c.scheduleSlotId === slot.id);

      // 2. Buscar por horario exacto + materia + grado
      if (!matchedClass) {
        matchedClass = savedClasses.find(c =>
          !usedClassIds.has(c.id) &&
          c.time && slot.time && c.time === slot.time &&
          this._matchesSlot(c, slot)
        );
      }

      // 3. Buscar por coincidencia lógica de materia y grado
      if (!matchedClass) {
        matchedClass = savedClasses.find(c =>
          !usedClassIds.has(c.id) &&
          this._matchesSlot(c, slot)
        );
      }

      if (matchedClass) {
        usedClassIds.add(matchedClass.id);
      }

      const hasRealContent = Boolean(
        matchedClass && (
          (matchedClass.curriculum?.topic && String(matchedClass.curriculum.topic).trim().length > 0 && String(matchedClass.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
          (matchedClass.didacticSequence?.inicio && String(matchedClass.didacticSequence.inicio).trim().length > 0) ||
          (matchedClass.didacticSequence?.desarrollo && String(matchedClass.didacticSequence.desarrollo).trim().length > 0) ||
          (matchedClass.pedagogy?.inicio && String(matchedClass.pedagogy.inicio).trim().length > 0) ||
          (matchedClass.pedagogy?.desarrollo && String(matchedClass.pedagogy.desarrollo).trim().length > 0) ||
          (matchedClass.teacherNotebook?.studentNotebookContent && String(matchedClass.teacherNotebook.studentNotebookContent).trim().length > 0)
        )
      );
      const isPlanned = Boolean(matchedClass && (matchedClass.status === 'planned' || matchedClass.status === 'completed') && hasRealContent);
      const isPending = !isPlanned;

      return {
        slot: slot,
        classSession: matchedClass || null,
        isPlanned: isPlanned,
        isPending: isPending
      };
    });

    // Detectar clases adicionales en este día que no correspondan estrictamente a un slot del horario
    const orphanClasses = savedClasses.filter(c => !usedClassIds.has(c.id));

    return {
      date: dateStr,
      teacherId: tid,
      totalSlots: scheduleSlots.length,
      scheduledItems: slotsWithClassInfo,
      additionalClasses: orphanClasses,
      allSavedClasses: savedClasses
    };
  }

  _matchesSlot(classSession, slot) {
    if (!classSession || !slot) return false;
    const s1 = String(classSession.subjectName || classSession.subject || '').toLowerCase().trim();
    const s2 = String(slot.subjectName || slot.subject || '').toLowerCase().trim();
    const g1 = String(classSession.gradeName || classSession.grade || '').toLowerCase().trim();
    const g2 = String(slot.gradeName || slot.grade || '').toLowerCase().trim();

    const subjectMatches = s1 === s2;
    const gradeMatches = g1 === g2 || (slot.group && String(classSession.group || '').toLowerCase().trim() === String(slot.group).toLowerCase().trim());

    // Si coincide el horario exacto además de materia y grado
    if (classSession.time && slot.time && classSession.time === slot.time) {
      return subjectMatches && gradeMatches;
    }

    return subjectMatches && gradeMatches;
  }
}

const ScheduleService = new ScheduleServiceClass();

if (typeof window !== 'undefined') {
  window.ScheduleService = ScheduleService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScheduleService;
}
