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

    // 0. Determinar si esta fecha corresponde a receso escolar o festivo
    const dayRecessInfo = (typeof ClassRepository !== 'undefined' && typeof ClassRepository._isRecessOrNonSchoolDay === 'function')
      ? { isRecess: ClassRepository._isRecessOrNonSchoolDay(dateStr) }
      : ((typeof HolidayService !== 'undefined') ? HolidayService.isRecessOrNonSchoolDay(dateStr) : { isRecess: false });

    // 1. Obtener slots del horario para esta fecha (Lunes..Viernes)
    const scheduleSlots = ScheduleRepository.getSlotsForDate(dateStr, tid);

    // 2. Obtener clases reales ya persistidas para esta fecha
    const savedClasses = ClassRepository.getByDate(dateStr, tid);

    // 3. Mapear qué clases corresponden hoy
    const usedClassIds = new Set();
    let misalignedCandidates = null;
    const targetDayOfWeek = new Date(dateStr + 'T12:00:00Z').getUTCDay();

    const slotsWithClassInfo = scheduleSlots.map(slot => {
      // 1. Buscar si ya existe una clase asociada directamente a este slotId
      let matchedClass = savedClasses.find(c => !usedClassIds.has(c.id) && c.scheduleSlotId && c.scheduleSlotId === slot.id);

      // 2. Buscar por horario exacto + materia + grado
      if (!matchedClass) {
        matchedClass = savedClasses.find(c =>
          !usedClassIds.has(c.id) &&
          c.time && slot.time && this._cleanTime(c.time) === this._cleanTime(slot.time) &&
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

      // Regla Arquitectónica 14: buildDayView es una función de solo lectura para la vista.
      // Jamás debe reasignar fechas, robar clases de otros días ni alterar clases existentes tras eliminaciones o vacíos.

      if (matchedClass) {
        usedClassIds.add(matchedClass.id);
        // Auto-anclar slot y horario oficial si faltaban
        if (!matchedClass.scheduleSlotId && slot.id) {
          matchedClass.scheduleSlotId = slot.id;
        }
        if (!matchedClass.time && slot.time) {
          matchedClass.time = slot.time;
        }
      }

      const hasRealContent = Boolean(
        matchedClass && (
          (matchedClass.curriculum?.topic && String(matchedClass.curriculum.topic).trim().length > 0 && String(matchedClass.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
          (matchedClass.topic && String(matchedClass.topic).trim().length > 0 && String(matchedClass.topic).trim() !== 'Sin tema planeado todavía') ||
          (matchedClass.didacticSequence?.inicio && String(matchedClass.didacticSequence.inicio).trim().length > 0) ||
          (matchedClass.didacticSequence?.desarrollo && String(matchedClass.didacticSequence.desarrollo).trim().length > 0) ||
          (matchedClass.pedagogy?.inicio && String(matchedClass.pedagogy.inicio).trim().length > 0) ||
          (matchedClass.pedagogy?.desarrollo && String(matchedClass.pedagogy.desarrollo).trim().length > 0) ||
          (matchedClass.teacherNotebook?.studentNotebookContent && String(matchedClass.teacherNotebook.studentNotebookContent).trim().length > 0) ||
          (matchedClass.notebookContent && String(matchedClass.notebookContent).trim().length > 0)
        )
      );

      // Si tiene contenido real o status planned/completed, la sesión se considera Planeada
      const isPlanned = Boolean(matchedClass && (matchedClass.status === 'planned' || matchedClass.status === 'completed' || hasRealContent));
      if (matchedClass && isPlanned && matchedClass.status !== 'planned' && matchedClass.status !== 'completed') {
        matchedClass.status = 'planned';
      }

      // Si es semana de receso o día no lectivo, un slot sin clase NO es un pendiente que requiera planeación
      const isPending = !isPlanned && !dayRecessInfo.isRecess;

      const expectedSeq = (typeof ClassRepository !== 'undefined' && typeof ClassRepository.getScheduleSequenceNumber === 'function')
        ? ClassRepository.getScheduleSequenceNumber(dateStr, slot.subjectName || slot.subject, slot.gradeName || slot.grade, tid, { requireScheduledWeekday: true })
        : null;

      return {
        slot: slot,
        classSession: matchedClass || null,
        expectedSequenceNumber: expectedSeq,
        isPlanned: isPlanned,
        isPending: isPending,
        isRecess: dayRecessInfo.isRecess,
        recessInfo: dayRecessInfo.isRecess ? dayRecessInfo : null
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
      allSavedClasses: savedClasses,
      isRecess: dayRecessInfo.isRecess,
      recessInfo: dayRecessInfo.isRecess ? dayRecessInfo : null
    };
  }

  getScheduleSequenceNumber(dateStr, subject, grade, teacherId, options = {}) {
    if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.getScheduleSequenceNumber === 'function') {
      return ClassRepository.getScheduleSequenceNumber(dateStr, subject, grade, teacherId, options);
    }
    return null;
  }

  _cleanTime(timeStr) {
    return String(timeStr || '').replace(/\s+/g, '').toLowerCase().trim();
  }

  _normSubject(name) {
    const s = String(name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (s.includes('sistema') || s.includes('tecnolog') || s.includes('informat') || s.includes('computac')) return 'sistemas';
    if (s.includes('matemat') || s.includes('aritmet') || s.includes('geometr') || s.includes('algebr')) return 'matematicas';
    if (s.includes('robot')) return 'robotica';
    if (s.includes('logic')) return 'logica';
    if (s.includes('direccion') || s.includes('grupo') || s.includes('orientac')) return 'direccion de grupo';
    return s;
  }

  _normGrade(grd) {
    if (typeof ClassRepository !== 'undefined' && typeof ClassRepository._normGrade === 'function') {
      return ClassRepository._normGrade(grd);
    }
    return String(grd || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^0-9a-z]/g, "").trim();
  }

  _matchesSlot(classSession, slot) {
    if (!classSession || !slot) return false;
    if (classSession.scheduleSlotId && slot.id && classSession.scheduleSlotId === slot.id) {
      return true;
    }

    const s1 = this._normSubject(classSession.subjectName || classSession.subject);
    const s2 = this._normSubject(slot.subjectName || slot.subject);
    const g1 = this._normGrade(classSession.gradeName || classSession.grade);
    const g2 = this._normGrade(slot.gradeName || slot.grade);
    const grp1 = this._normGrade(classSession.group);
    const grp2 = this._normGrade(slot.group);

    const subjectMatches = (s1 === s2) || (s1.length > 3 && s2.length > 3 && (s1.includes(s2) || s2.includes(s1)));
    const gradeMatches = (g1 && g2 && g1 === g2) ||
                         (grp1 && grp2 && grp1 === grp2) ||
                         (g1 && grp2 && g1 === grp2) ||
                         (grp1 && g2 && grp1 === g2);

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
