/**
 * SERVICIO DE IMPORTACIÓN INTELIGENTE (ImportService)
 * 
 * Orquestador del flujo:
 * rawText -> parse -> validate -> preview -> resolveConflicts -> apply -> save
 * 
 * Reglas mandatorias (Req. 15, 16, 40-45, 117-123):
 * 1. REGLA DE IDENTIDAD: Al importar sobre una clase existente (ej. Clase #7),
 *    conservar por defecto la identidad, número, fecha y grado de la clase actual.
 * 2. MERGE INTELIGENTE (ANTI-VACÍOS): Campos no detectados en el texto jamás borran información previa.
 * 3. AISLAMIENTO TOTAL: Modificar Clase #7 NO altera Clase #8 ni ninguna otra.
 * 4. IMPORTAR COMO NUEVA CLASE: Genera nuevo ID, calcula siguiente consecutivo (max + 1) e independiza.
 * 5. SALVAGUARDA TOTAL: Almacena sourceText íntegro y permite deshacer la importación.
 */

class ImportServiceClass {
  constructor() {
    this._lastImportBackup = null; // Para deshacer importación
  }

  _getParser() {
    if (typeof ImportParser !== 'undefined') return ImportParser;
    if (typeof window !== 'undefined' && window.ImportParser) return window.ImportParser;
    if (typeof global !== 'undefined' && global.ImportParser) return global.ImportParser;
    try {
      return require('./import-parser.js');
    } catch (e) {
      return null;
    }
  }

  _getClassRepository() {
    if (typeof ClassRepository !== 'undefined') return ClassRepository;
    if (typeof window !== 'undefined' && window.ClassRepository) return window.ClassRepository;
    if (typeof global !== 'undefined' && global.ClassRepository) return global.ClassRepository;
    try {
      return require('../repositories/class-repository.js');
    } catch (e) {
      return null;
    }
  }

  /**
   * Analiza y valida el texto pegado preparando el objeto para la previsualización
   */
  prepareImport(rawText, targetClass = null) {
    const parser = this._getParser();
    if (!parser) {
      throw new Error('ImportParser no está cargado en el sistema.');
    }

    const parsed = parser.parse(rawText);
    const conflicts = this.detectConflicts(parsed, targetClass);

    return {
      parsed,
      targetClass,
      conflicts,
      hasConflicts: conflicts.length > 0
    };
  }

  /**
   * Detecta discrepancias de identidad entre el texto importado y la clase activa
   */
  detectConflicts(parsed, targetClass) {
    const conflicts = [];
    if (!targetClass) return conflicts;

    // 1. Conflicto de Consecutivo / Número de Clase (Req. 15, 16, 45)
    if (parsed.metadata.sequenceNumber !== null && targetClass.sequenceNumber !== undefined) {
      if (parsed.metadata.sequenceNumber !== targetClass.sequenceNumber) {
        conflicts.push({
          type: 'sequenceNumber',
          label: 'Número de Clase',
          currentVal: `Clase #${targetClass.sequenceNumber}`,
          importedVal: `Clase #${parsed.metadata.sequenceNumber}`,
          defaultChoice: 'keep_current',
          message: `El texto indica Clase #${parsed.metadata.sequenceNumber}, pero estás importando sobre Clase #${targetClass.sequenceNumber}.`
        });
      }
    }

    // 2. Conflicto de Grado (Req. 43)
    if (parsed.metadata.grade && targetClass.gradeName) {
      const g1 = this._norm(targetClass.gradeName);
      const g2 = this._norm(parsed.metadata.grade);
      if (g1 && g2 && !g1.includes(g2) && !g2.includes(g1)) {
        conflicts.push({
          type: 'grade',
          label: 'Grado / Curso',
          currentVal: targetClass.gradeName,
          importedVal: parsed.metadata.grade,
          defaultChoice: 'keep_current',
          message: `La planeación indica "${parsed.metadata.grade}", pero la clase actual corresponde a "${targetClass.gradeName}".`
        });
      }
    }

    // 3. Conflicto de Asignatura
    if (parsed.metadata.subject && targetClass.subjectName) {
      const s1 = this._norm(targetClass.subjectName);
      const s2 = this._norm(parsed.metadata.subject);
      if (s1 && s2 && !s1.includes(s2) && !s2.includes(s1)) {
        conflicts.push({
          type: 'subject',
          label: 'Asignatura',
          currentVal: targetClass.subjectName,
          importedVal: parsed.metadata.subject,
          defaultChoice: 'keep_current',
          message: `El texto indica materia "${parsed.metadata.subject}", pero la clase actual es de "${targetClass.subjectName}".`
        });
      }
    }

    // 4. Conflicto de Fecha (Req. 44)
    if (parsed.metadata.date && targetClass.date) {
      if (parsed.metadata.date !== targetClass.date) {
        conflicts.push({
          type: 'date',
          label: 'Fecha',
          currentVal: targetClass.date,
          importedVal: parsed.metadata.date,
          defaultChoice: 'keep_current',
          message: `La clase actual tiene fecha ${targetClass.date}, el texto menciona ${parsed.metadata.date}.`
        });
      }
    }

    return conflicts;
  }

  /**
   * Aplica los datos analizados sobre una clase existente con merge inteligente
   */
  applyToExistingClass(targetClass, parsedData, decisions = {}) {
    if (!targetClass || !parsedData) return null;

    // Respaldar estado previo para permitir Deshacer
    this._lastImportBackup = {
      classId: targetClass.id,
      timestamp: new Date().toISOString(),
      previousData: JSON.parse(JSON.stringify(targetClass))
    };

    const merged = JSON.parse(JSON.stringify(targetClass));

    // 1. Identidad: Aplicar decisiones o mantener la actual por defecto (Req. 16, 43, 44, 45)
    const incMeta = parsedData.metadata || parsedData.general || {};
    const useImportedSeq = decisions.sequenceNumber === 'use_imported' || decisions.sequenceNumber === 'import' || decisions.sequenceNumber === 'overwrite';
    const useImportedGrd = decisions.grade === 'use_imported' || decisions.grade === 'import' || decisions.grade === 'overwrite';
    const useImportedSub = decisions.subject === 'use_imported' || decisions.subject === 'import' || decisions.subject === 'overwrite';
    const useImportedDate = decisions.date === 'use_imported' || decisions.date === 'import' || decisions.date === 'overwrite';

    if (useImportedSeq && incMeta.sequenceNumber !== null && incMeta.sequenceNumber !== undefined) {
      merged.sequenceNumber = incMeta.sequenceNumber;
      merged.dayNumber = String(incMeta.sequenceNumber);
    }
    if (useImportedGrd && incMeta.grade) {
      merged.gradeName = incMeta.grade;
    }
    if (useImportedSub && incMeta.subject) {
      merged.subjectName = incMeta.subject;
    }
    if (useImportedDate && incMeta.date) {
      merged.date = incMeta.date;
    }

    // 2. Currículo: Merge inteligente (Req. 117, 118, 119)
    if (!merged.curriculum) merged.curriculum = {};
    if (parsedData.curriculum.topic && parsedData.curriculum.topic.trim()) {
      merged.curriculum.topic = parsedData.curriculum.topic.trim();
    }
    if (parsedData.curriculum.dba && parsedData.curriculum.dba.trim()) {
      merged.curriculum.dba = parsedData.curriculum.dba.trim();
    }
    if (parsedData.curriculum.achievement && parsedData.curriculum.achievement.trim()) {
      merged.curriculum.achievement = parsedData.curriculum.achievement.trim();
    }
    if (Array.isArray(parsedData.curriculum.periodTopics) && parsedData.curriculum.periodTopics.length > 0) {
      merged.curriculum.periodTopics = parsedData.curriculum.periodTopics;
    }
    if (Array.isArray(parsedData.curriculum.periodPerformances) && parsedData.curriculum.periodPerformances.length > 0) {
      merged.curriculum.periodPerformances = parsedData.curriculum.periodPerformances;
    }

    // 3. Secuencia Didáctica: Merge inteligente (Req. 22-27)
    if (!merged.didacticSequence) merged.didacticSequence = {};
    if (parsedData.didacticSequence.inicio && parsedData.didacticSequence.inicio.trim()) {
      merged.didacticSequence.inicio = parsedData.didacticSequence.inicio.trim();
    }
    if (parsedData.didacticSequence.desarrollo && parsedData.didacticSequence.desarrollo.trim()) {
      merged.didacticSequence.desarrollo = parsedData.didacticSequence.desarrollo.trim();
    }
    if (parsedData.didacticSequence.cierre && parsedData.didacticSequence.cierre.trim()) {
      merged.didacticSequence.cierre = parsedData.didacticSequence.cierre.trim();
    }
    if (parsedData.didacticSequence.recursos && parsedData.didacticSequence.recursos.trim()) {
      merged.didacticSequence.recursos = parsedData.didacticSequence.recursos.trim();
    }
    if (parsedData.didacticSequence.tareas && parsedData.didacticSequence.tareas.trim()) {
      merged.didacticSequence.tareas = parsedData.didacticSequence.tareas.trim();
    }
    if (parsedData.didacticSequence.evaluation && parsedData.didacticSequence.evaluation.trim()) {
      merged.didacticSequence.evaluation = parsedData.didacticSequence.evaluation.trim();
    }
    const parsedObs = (parsedData.didacticSequence?.observaciones || parsedData.observations || '').trim();
    if (parsedObs) {
      merged.didacticSequence.observaciones = parsedObs;
      merged.observations = parsedObs;
      if (!merged.pedagogy) merged.pedagogy = {};
      merged.pedagogy.observaciones = parsedObs;
    }
    if (parsedData.didacticSequence.durations) {
      merged.didacticSequence.durations = {
        ...(merged.didacticSequence.durations || {}),
        ...parsedData.didacticSequence.durations
      };
    }

    // 4. Cuaderno del Docente: Merge inteligente (Req. 28-35)
    if (!merged.teacherNotebook) merged.teacherNotebook = {};
    if (parsedData.teacherNotebook.question && parsedData.teacherNotebook.question.trim()) {
      merged.teacherNotebook.question = parsedData.teacherNotebook.question.trim();
    }
    if (Array.isArray(parsedData.teacherNotebook.periodStructure) && parsedData.teacherNotebook.periodStructure.length > 0) {
      merged.teacherNotebook.periodStructure = parsedData.teacherNotebook.periodStructure;
    }
    if (parsedData.teacherNotebook.dynamics && parsedData.teacherNotebook.dynamics.trim()) {
      merged.teacherNotebook.dynamics = parsedData.teacherNotebook.dynamics.trim();
    }
    if (Array.isArray(parsedData.teacherNotebook.rules) && parsedData.teacherNotebook.rules.length > 0) {
      merged.teacherNotebook.rules = parsedData.teacherNotebook.rules;
    }
    if (parsedData.teacherNotebook.studentNotebookContent && parsedData.teacherNotebook.studentNotebookContent.trim()) {
      merged.teacherNotebook.studentNotebookContent = parsedData.teacherNotebook.studentNotebookContent.trim();
    }
    if (parsedData.teacherNotebook.practicalActivity && parsedData.teacherNotebook.practicalActivity.trim()) {
      merged.teacherNotebook.practicalActivity = parsedData.teacherNotebook.practicalActivity.trim();
    }

    // SALVAGUARDA FUNDAMENTAL: Guardar texto original íntegro
    merged.teacherNotebook.sourceText = parsedData.teacherNotebook.sourceText;

    // Estado inteligente
    merged.status = 'planned';
    merged.updatedAt = new Date().toISOString();

    // Guardar atómicamente a través de ClassRepository
    const repo = this._getClassRepository();
    if (repo && repo.saveClass) {
      return repo.saveClass(merged, merged.teacherId);
    }

    return merged;
  }

  /**
   * Crea una NUEVA clase a partir del texto analizado con ID y consecutivo independientes (Req. 40, 41)
   */
  importAsNewClass(parsedData, options = {}, teacherId = null) {
    if (!parsedData) return null;
    const tid = teacherId || (typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel');

    const actualParsed = parsedData.parsed || parsedData;
    const target = options.targetClass || parsedData.targetClass || null;

    const subject = options.subjectName || (target ? target.subjectName : null) || actualParsed.metadata?.subject || 'General';
    const grade = options.gradeName || (target ? target.gradeName : null) || actualParsed.metadata?.grade || 'General';
    const group = options.group || (target ? (target.group || target.gradeName) : null) || grade;
    const period = options.period || (target ? target.period : null) || actualParsed.metadata?.period || '1°';
    const date = options.date || actualParsed.metadata?.date || (target ? target.date : null) || new Date().toISOString().slice(0, 10);

    const repo = this._getClassRepository();

    // Consecutivo nuevo: max + 1
    let nextSeq = 1;
    if (repo && repo.getNextSequenceNumber) {
      nextSeq = repo.getNextSequenceNumber({
        teacherId: tid,
        period,
        subject,
        grade,
        group
      });
    }

    const newClassData = {
      id: repo && repo.generateClassId ? repo.generateClassId('cls') : `cls_${Date.now().toString(36)}`,
      teacherId: tid,
      date,
      startTime: options.startTime || '',
      endTime: options.endTime || '',
      time: options.time || '',
      subjectId: repo && repo._slugify ? repo._slugify(subject) : 'general',
      subjectName: subject,
      gradeId: repo && repo._slugify ? repo._slugify(grade) : 'general',
      gradeName: grade,
      group,
      period,
      sequenceNumber: nextSeq, // Inmutable
      status: 'planned',
      subjectType: 'academic',
      curriculum: {
        topic: parsedData.curriculum.topic || '',
        dba: parsedData.curriculum.dba || '',
        achievement: parsedData.curriculum.achievement || '',
        periodTopics: parsedData.curriculum.periodTopics || [],
        periodPerformances: parsedData.curriculum.periodPerformances || []
      },
      didacticSequence: {
        inicio: parsedData.didacticSequence.inicio || '',
        desarrollo: parsedData.didacticSequence.desarrollo || '',
        cierre: parsedData.didacticSequence.cierre || '',
        recursos: parsedData.didacticSequence.recursos || '',
        tareas: parsedData.didacticSequence.tareas || '',
        evaluation: parsedData.didacticSequence.evaluation || '',
        observaciones: (parsedData.didacticSequence?.observaciones || parsedData.observations || ''),
        durations: parsedData.didacticSequence.durations || {}
      },
      teacherNotebook: {
        question: parsedData.teacherNotebook.question || '',
        periodStructure: parsedData.teacherNotebook.periodStructure || [],
        dynamics: parsedData.teacherNotebook.dynamics || '',
        rules: parsedData.teacherNotebook.rules || [],
        detailedContent: parsedData.teacherNotebook.detailedContent || '',
        studentNotebookContent: parsedData.teacherNotebook.studentNotebookContent || '',
        practicalActivity: parsedData.teacherNotebook.practicalActivity || '',
        additionalNotes: '',
        sourceText: parsedData.teacherNotebook.sourceText || ''
      },
      observations: (parsedData.didacticSequence?.observaciones || parsedData.observations || ''),
      attachments: [],
      version: 1
    };

    if (repo && repo.createClass) {
      return repo.createClass(newClassData, tid);
    }

    return newClassData;
  }

  /**
   * Permite deshacer la última importación aplicada sobre una clase (Req. 123)
   */
  undoLastImport() {
    if (!this._lastImportBackup) return false;
    const { classId, previousData } = this._lastImportBackup;

    const repo = this._getClassRepository();
    if (repo && repo.saveClass) {
      repo.saveClass(previousData, previousData.teacherId);
      this._lastImportBackup = null;
      console.log(`[ImportService] Deshecha importación en clase ${classId}. Estado restaurado.`);
      return true;
    }

    return false;
  }

  hasUndoAvailable() {
    return this._lastImportBackup !== null;
  }

  _norm(str) {
    return String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}

const ImportService = new ImportServiceClass();

if (typeof window !== 'undefined') {
  window.ImportService = ImportService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImportService;
}
