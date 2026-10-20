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
      classes: classes.sort((a, b) => {
        const seqA = parseInt(a.sequenceNumber, 10) || 0;
        const seqB = parseInt(b.sequenceNumber, 10) || 0;
        if (seqA !== seqB) return seqA - seqB;
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.startTime || a.time || '').localeCompare(b.startTime || b.time || '');
      })
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
      const cleanGrd = gradeRaw.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const cleanGrp = groupRaw.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

      // Grados equivalentes: '4°a' y '4a' son el mismo grado/grupo (sin redundancias tipo '4°A (4A)')
      const isEquivalent = (cleanGrd === cleanGrp) || (cleanGrd.length > 0 && cleanGrp.length > 0 && (cleanGrd.includes(cleanGrp) || cleanGrp.includes(cleanGrd)));
      const hasDistinctGroup = !isEquivalent && groupRaw.length > 0;

      // Formato limpio del grado escolar (ej: '4°A', '4°B', '8°')
      let displayGrade = gradeRaw;
      const matchAB = cleanGrd.match(/^(\d+)([ab])$/i);
      if (matchAB) {
        displayGrade = `${matchAB[1]}°${matchAB[2].toUpperCase()}`;
      } else if (cleanGrd.match(/^\d+$/)) {
        displayGrade = `${cleanGrd}°`;
      }

      const key = hasDistinctGroup ? `${sNorm}__${cleanGrd}__${cleanGrp}` : `${sNorm}__${cleanGrd || 'gen'}`;

      if (!groupsMap[key]) {
        groupsMap[key] = {
          subjectName: subjRaw,
          gradeName: hasDistinctGroup ? `${displayGrade} (${groupRaw})` : displayGrade,
          group: groupRaw,
          period: period,
          classes: []
        };
      }
      groupsMap[key].classes.push(c);
    });

    const results = [];
    Object.values(groupsMap).forEach(g => {
      const sortedClasses = g.classes.sort((a, b) => {
        const seqA = parseInt(a.sequenceNumber, 10) || 0;
        const seqB = parseInt(b.sequenceNumber, 10) || 0;
        if (seqA !== seqB) return seqA - seqB;
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.startTime || a.time || '').localeCompare(b.startTime || b.time || '');
      });

      // Detectar si existen números de clase duplicados o desordenados
      const seenNums = new Set();
      let hasDuplicateNumbers = false;
      for (const c of sortedClasses) {
        const num = parseInt(c.sequenceNumber, 10);
        if (num > 0) {
          if (seenNums.has(num)) {
            hasDuplicateNumbers = true;
            break;
          }
          seenNums.add(num);
        }
      }

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

      const mirrorInfo = typeof ClassRepository !== 'undefined' && ClassRepository.getMirrorGradeInfo
        ? ClassRepository.getMirrorGradeInfo(g.gradeName, g.group, g.subjectName)
        : null;

      results.push({
        subjectName: g.subjectName,
        gradeName: g.gradeName,
        group: g.group,
        period: period,
        total: totalCount,
        planned: plannedCount,
        pending: totalCount - plannedCount,
        percentage: totalCount > 0 ? Math.round((plannedCount / totalCount) * 100) : 0,
        hasDuplicateNumbers: hasDuplicateNumbers,
        mirrorInfo: mirrorInfo,
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
