/**
 * SERVICIO DE SECUENCIAS (SequenceService)
 * Monitorea el progreso pedagógico, seguimiento curricular y estado de secuencias.
 */

class SequenceServiceClass {
  constructor() {}

  /**
   * Calcula el resumen de progreso curricular por Asignatura, Grado y Período (Req. 29)
   * Ejemplo: Matemáticas 4° Primer período 80% (8 de 10 clases planeadas)
   * OPERACIÓN PURA DE LECTURA (no modifica ningún dato).
   */
  getSequenceProgress(subjectName, gradeName, period = '1°', teacherId) {
    const tid = teacherId || ClassRepository._getCurrentTeacherId();
    const classes = ClassRepository.getClasses({
      teacherId: tid,
      period: period,
      subject: subjectName,
      grade: gradeName
    }, tid);

    // Total de clases registradas
    const total = classes.length;
    const planned = classes.filter(c => c.status === 'planned' || c.status === 'completed').length;
    const pending = classes.filter(c => c.status === 'pending' || c.status === 'draft').length;
    const percentage = total > 0 ? Math.round((planned / total) * 100) : 0;

    return {
      subject: subjectName,
      grade: gradeName,
      period: period,
      total: total,
      planned: planned,
      pending: pending,
      percentage: percentage,
      classes: classes.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
    };
  }

  /**
   * Alias de conveniencia para calcular progreso (soporta period como primer o tercer argumento)
   */
  calculateProgress(arg1, arg2, arg3, teacherId) {
    if (typeof arg1 === 'string' && (arg1.includes('°') || arg1 === '1' || arg1 === '2' || arg1 === '3' || arg1 === '4')) {
      return this.getSequenceProgress(arg2, arg3, arg1, teacherId);
    }
    return this.getSequenceProgress(arg1, arg2, arg3, teacherId);
  }

  /**
   * Obtiene la lista agrupada de secuencias activas para el docente en el periodo actual
   */
  getAllActiveSequences(period = '1°', teacherId) {
    const tid = teacherId || ClassRepository._getCurrentTeacherId();
    const classes = ClassRepository.getClasses({ teacherId: tid, period: period }, tid);

    const groupsMap = {};
    const seenClassIds = new Set();

    classes.forEach(c => {
      if (!c || !c.id) return;
      if (seenClassIds.has(c.id)) return;
      seenClassIds.add(c.id);

      const subjRaw = String(c.subjectName || c.subject || 'Sin Asignatura').trim();
      const gradeRaw = String(c.gradeName || c.grade || 'General').trim();
      const groupRaw = String(c.group || gradeRaw).trim();

      // Normalizar para clave única de agrupación sin duplicaciones por espacios o mayúsculas
      const sNorm = subjRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const gNorm = gradeRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const grpNorm = groupRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Si el grupo es diferente del grado (ej. 4°A vs 4°B), diferenciarlo claramente
      const hasDistinctGroup = grpNorm !== gNorm && grpNorm.length > 0 && !gNorm.includes(grpNorm);
      const key = hasDistinctGroup ? `${sNorm}__${gNorm}__${grpNorm}` : `${sNorm}__${gNorm}`;

      if (!groupsMap[key]) {
        groupsMap[key] = {
          subjectName: subjRaw,
          gradeName: hasDistinctGroup ? `${gradeRaw} (${groupRaw})` : gradeRaw,
          group: groupRaw,
          period: period,
          classes: []
        };
      }
      groupsMap[key].classes.push(c);
    });

    const results = [];
    Object.values(groupsMap).forEach(g => {
      const sortedClasses = g.classes.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
      const plannedCount = sortedClasses.filter(c => {
        const isStatusPlanned = c.status === 'planned' || c.status === 'completed';
        const hasContent = Boolean(
          (c.curriculum?.topic && String(c.curriculum.topic).trim().length > 0 && String(c.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
          (c.didacticSequence?.inicio && String(c.didacticSequence.inicio).trim().length > 0) ||
          (c.didacticSequence?.desarrollo && String(c.didacticSequence.desarrollo).trim().length > 0) ||
          (c.pedagogy?.inicio && String(c.pedagogy.inicio).trim().length > 0) ||
          (c.pedagogy?.desarrollo && String(c.pedagogy.desarrollo).trim().length > 0) ||
          (c.teacherNotebook?.studentNotebookContent && String(c.teacherNotebook.studentNotebookContent).trim().length > 0)
        );
        return isStatusPlanned && hasContent;
      }).length;
      const totalCount = sortedClasses.length;
      results.push({
        subjectName: g.subjectName,
        gradeName: g.gradeName,
        group: g.group,
        period: period,
        total: totalCount,
        planned: plannedCount,
        pending: totalCount - plannedCount,
        percentage: totalCount > 0 ? Math.round((plannedCount / totalCount) * 100) : 0,
        classes: sortedClasses
      });
    });

    return results;
  }
}

const SequenceService = new SequenceServiceClass();

if (typeof window !== 'undefined') {
  window.SequenceService = SequenceService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SequenceService;
}
