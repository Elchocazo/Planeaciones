/**
 * SERVICIO DE AUDITORÍA Y RECUPERACIÓN UNIVERSAL DE PLANEACIONES (RecoveryService)
 * 
 * Principio Fundamental (Req. Crítico):
 * NO PERDER NINGUNA PLANEACIÓN EXISTENTE.
 * "Una planeación que no aparece en la interfaz no significa que no exista."
 * 
 * Funciones:
 * 1. Escaneo universal exhaustivo de: LocalStorage, IndexedDB, SessionStorage, snapshots y backups.
 * 2. Extracción profunda de clases, secuencias didácticas y Cuaderno del Docente.
 * 3. Identificación de clases invisibles, huérfanas, sin fecha y posibles duplicados.
 * 4. Diagnóstico completo con reporte estadístico en tiempo real.
 * 5. Fusión inteligente anti-vacíos: nunca sobrescribe datos existentes con cadenas vacías.
 * 6. Respaldo previo inmutable antes de cualquier migración o recuperación.
 */

class RecoveryServiceClass {
  constructor() {
    this._lastAuditReport = null;
    this._recoveredClassesCache = [];
    this._isScanning = false;
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

  _getSequenceRepository() {
    if (typeof SequenceRepository !== 'undefined') return SequenceRepository;
    if (typeof window !== 'undefined' && window.SequenceRepository) return window.SequenceRepository;
    if (typeof global !== 'undefined' && global.SequenceRepository) return global.SequenceRepository;
    try {
      return require('../repositories/sequence-repository.js');
    } catch (e) {
      return null;
    }
  }

  /**
   * Ejecuta el escaneo universal y genera el reporte de auditoría
   */
  async runAudit(teacherId = null) {
    const tid = teacherId || (typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel');
    this._isScanning = true;

    console.log(`[RecoveryService] Iniciando auditoría universal para ${tid}...`);

    const rawRecords = {
      localStorageRecords: [],
      indexedDBRecords: [],
      sessionStorageRecords: [],
      diskBackupRecords: []
    };

    // 1. Escanear LocalStorage
    rawRecords.localStorageRecords = this._scanLocalStorage(tid);

    // 2. Escanear IndexedDB
    rawRecords.indexedDBRecords = await this._scanIndexedDB(tid);

    // 3. Escanear SessionStorage
    rawRecords.sessionStorageRecords = this._scanSessionStorage();

    // 4. Escanear Respaldo en Disco (si server local está activo)
    rawRecords.diskBackupRecords = await this._scanDiskBackups();

    // 5. Procesar y normalizar todas las clases encontradas
    const allFoundClasses = [];
    const legacyPlansFound = new Set();
    const sourcesFound = new Set();

    const processItem = (item, sourceName) => {
      if (!item) return;
      sourcesFound.add(sourceName);

      // Si es un objeto de día con array de classes
      if (item.date && Array.isArray(item.classes)) {
        legacyPlansFound.add(`${sourceName}:${item.date}`);
        item.classes.forEach((cls, idx) => {
          allFoundClasses.push(this._normalizeExtractedClass(cls, item.date, item.period, sourceName, idx));
        });
        return;
      }

      // Si es un mapa de días legacy { [date]: { date, classes: [...] } }
      if (typeof item === 'object' && !Array.isArray(item)) {
        const dateEntries = Object.entries(item).filter(([k, v]) => v && typeof v === 'object' && Array.isArray(v.classes));
        if (dateEntries.length > 0) {
          dateEntries.forEach(([d, dayPlan]) => {
            legacyPlansFound.add(`${sourceName}:${d}`);
            dayPlan.classes.forEach((cls, idx) => {
              allFoundClasses.push(this._normalizeExtractedClass(cls, dayPlan.date || d, dayPlan.period || '1°', sourceName, idx));
            });
          });
          return;
        }

        // Si es un mapa de sesiones { [id]: ClassSession }
        const values = Object.values(item);
        const looksLikeSessionMap = values.some(v => v && (v.subject || v.subjectName || v.curriculum || v.pedagogy || v.didacticSequence));
        if (looksLikeSessionMap) {
          values.forEach((v, idx) => {
            if (v && typeof v === 'object' && (v.subject || v.subjectName || v.topic || v.curriculum)) {
              allFoundClasses.push(this._normalizeExtractedClass(v, v.date || '', v.period || '1°', sourceName, idx));
            }
          });
          return;
        }

        // Si tiene clave 'classes' o 'plans'
        if (item.plans && typeof item.plans === 'object') {
          Object.keys(item.plans).forEach(d => {
            const p = item.plans[d];
            if (p && Array.isArray(p.classes)) {
              legacyPlansFound.add(`${sourceName}:${d}`);
              p.classes.forEach((cls, idx) => {
                allFoundClasses.push(this._normalizeExtractedClass(cls, d, p.period || '1°', sourceName, idx));
              });
            }
          });
          return;
        }
      }

      // Si es un array directo de clases
      if (Array.isArray(item)) {
        item.forEach((cls, idx) => {
          if (cls && typeof cls === 'object' && (cls.subject || cls.subjectName || cls.topic || cls.curriculum)) {
            allFoundClasses.push(this._normalizeExtractedClass(cls, cls.date || '', cls.period || '1°', sourceName, idx));
          }
        });
      }
    };

    rawRecords.localStorageRecords.forEach(r => processItem(r.data, `localStorage:${r.key}`));
    rawRecords.indexedDBRecords.forEach(r => processItem(r.data, `indexedDB:${r.key}`));
    rawRecords.sessionStorageRecords.forEach(r => processItem(r.data, `sessionStorage:${r.key}`));
    rawRecords.diskBackupRecords.forEach(r => processItem(r.data, `diskBackup:${r.name}`));

    // 6. Deduplicación inteligente e identificación de huérfanos / invisibles
    const deduplicated = this._consolidateFoundClasses(allFoundClasses, tid);

    // 7. Generar estadísticas precisas para el reporte (Req. 3, 141)
    const rep = this._buildAuditStats(deduplicated, legacyPlansFound.size, rawRecords);
    this._lastAuditReport = rep;
    this._recoveredClassesCache = deduplicated.all;
    this._lastScannedKeys = [
      ...rawRecords.localStorageRecords.map(r => r.key),
      ...rawRecords.indexedDBRecords.map(r => r.key),
      ...rawRecords.sessionStorageRecords.map(r => r.key)
    ];
    this._isScanning = false;

    console.log('[RecoveryService] Auditoría completada:', rep);
    return rep;
  }

  /**
   * Alias de auditoría universal para vistas y diagnósticos
   */
  async auditAllStorages(teacherId = null) {
    const rep = await this.runAudit(teacherId);
    return {
      ...rep,
      found: rep.totalClasses,
      completedClasses: rep.totalCompleted,
      totalClassesInRepository: rep.totalClasses,
      scannedKeys: (this._lastScannedKeys && this._lastScannedKeys.length > 0 ? this._lastScannedKeys : ['localStorage'])
    };
  }

  /**
   * Ejecuta la recuperación segura aplicando los datos auditados a ClassRepository
   */
  async executeSafeRecovery(teacherId = null) {
    const tid = teacherId || (typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel');
    
    // Primero auditar si no se ha hecho
    const auditReport = await this.runAudit(tid);

    // PASO 1: RESPALDO PREVIO OBLIGATORIO (Req. 55, 140)
    await this._createPreRecoveryBackup(tid);

    // PASO 2: OBTENER MAPA ACTUAL DE CLASES EN ClassRepository
    const repo = this._getClassRepository();
    const currentClassesMap = (repo && repo._getAllMap)
      ? repo._getAllMap(tid)
      : {};

    let addedCount = 0;
    let updatedCount = 0;

    // PASO 3: INTEGRAR CLASES RECUPERADAS SIN SOBRESCRIBIR CON VACÍOS
    auditReport.classes.forEach(recoveredCls => {
      const existingId = recoveredCls.id;
      const existing = currentClassesMap[existingId];

      if (!existing) {
        // Buscar si existe una clase con igual fecha, materia, grado y consecutivo
        const matchingKey = Object.values(currentClassesMap).find(c =>
          this._isSameLogicalClass(c, recoveredCls)
        );

        if (matchingKey) {
          // Fusionar de forma enriquecida en la clase existente
          const merged = this._smartMerge(matchingKey, recoveredCls);
          currentClassesMap[matchingKey.id] = merged;
          updatedCount++;
        } else {
          // Nueva clase recuperada (puede ser huérfana o histórica)
          currentClassesMap[existingId] = recoveredCls;
          addedCount++;
        }
      } else {
        // Actualizar clase existente completando cualquier campo faltante
        const merged = this._smartMerge(existing, recoveredCls);
        currentClassesMap[existingId] = merged;
        updatedCount++;
      }
    });

    // PASO 4: PERSISTIR EN ClassRepository (LocalStorage + IndexedDB + Mirror v3)
    if (repo && repo._persist) {
      repo._persist(currentClassesMap, tid);
    }

    // PASO 5: SINCRONIZAR SECUENCIAS CURRICULARES
    const seqRepo = this._getSequenceRepository();
    if (seqRepo) {
      this._syncSequencesFromClasses(Object.values(currentClassesMap), tid);
    }

    console.log(`[RecoveryService] Recuperación ejecutada con éxito: +${addedCount} clases nuevas, ${updatedCount} enriquecidas.`);
    return {
      success: true,
      recovered: addedCount,
      found: auditReport.totalClasses,
      addedCount,
      updatedCount,
      alreadyPresent: updatedCount,
      totalClasses: Object.keys(currentClassesMap).length,
      auditReport
    };
  }

  /**
   * Obtiene las clases marcadas como huérfanas para visualización
   */
  getOrphanedClasses() {
    if (!this._recoveredClassesCache || this._recoveredClassesCache.length === 0) {
      const tid = typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel';
      const repo = this._getClassRepository();
      const all = repo && repo.getAllClasses ? repo.getAllClasses(tid) : [];
      return all.filter(c => c.status === 'orphaned' || !c.date || c.isOrphaned);
    }
    return this._recoveredClassesCache.filter(c => c.status === 'orphaned' || !c.date || c.isOrphaned);
  }

  /**
   * Vincula manualmente una clase huérfana a una fecha y horario escolar
   */
  linkOrphanedClass(classId, date, slotInfo = {}, teacherId = null) {
    if (!classId || !date) return false;
    const tid = teacherId || (typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel');
    const repo = this._getClassRepository();
    if (!repo) return false;
    const cls = repo.getClass(classId, tid);
    if (!cls) return false;

    cls.date = date;
    cls.status = (cls.curriculum?.topic || cls.didacticSequence?.desarrollo) ? 'planned' : 'pending';
    cls.isOrphaned = false;

    if (slotInfo.id) cls.scheduleSlotId = slotInfo.id;
    if (slotInfo.time) cls.time = slotInfo.time;
    if (slotInfo.startTime) cls.startTime = slotInfo.startTime;
    if (slotInfo.endTime) cls.endTime = slotInfo.endTime;

    repo.saveClass(cls, tid);
    return true;
  }

  // =========================================================================
  // MÉTODOS INTERNOS DE ESCANEO
  // =========================================================================

  _scanLocalStorage(teacherId) {
    const records = [];
    if (typeof localStorage === 'undefined') return records;

    try {
      const keysToInspect = [];
      if (typeof localStorage.key === 'function' && typeof localStorage.length === 'number') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) keysToInspect.push(k);
        }
      }
      Object.keys(localStorage).forEach(k => {
        if (!keysToInspect.includes(k) && typeof localStorage.getItem(k) === 'string') {
          keysToInspect.push(k);
        }
      });

      for (const key of keysToInspect) {
        if (!key) continue;

        // Patrones relevantes de planeaciones, sesiones, respaldos y cuadernos
        const isTarget = key.includes('teacher_planner_plans_') ||
                         key.includes('teacher_class_sessions_') ||
                         key.startsWith('snapshot_') ||
                         key.startsWith('migration_backup_') ||
                         key.startsWith('pre_migration_') ||
                         key.startsWith('backup_') ||
                         key.includes('notebook_') ||
                         key.includes('autosave_');

        if (isTarget) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              records.push({ key, data: parsed });
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('[RecoveryService] Error al escanear LocalStorage:', err);
    }

    return records;
  }

  async _scanIndexedDB(teacherId) {
    const records = [];
    if (typeof IDBStorage === 'undefined' || !IDBStorage.isSupported || !IDBStorage.isSupported()) {
      return records;
    }

    try {
      await IDBStorage.init();
      const keys = await IDBStorage.keys();

      for (const k of keys) {
        try {
          const val = await IDBStorage.get(k);
          if (val) {
            records.push({ key: k, data: val });
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[RecoveryService] Error al escanear IndexedDB:', err);
    }

    return records;
  }

  _scanSessionStorage() {
    const records = [];
    if (typeof sessionStorage === 'undefined') return records;

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        if (key.includes('plan') || key.includes('class') || key.includes('notebook')) {
          try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
              records.push({ key, data: JSON.parse(raw) });
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    return records;
  }

  async _scanDiskBackups() {
    const records = [];
    if (typeof fetch === 'undefined') return records;

    try {
      const res = await fetch('/api/latest-backup');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          records.push({ name: 'autosave_latest.json', data });
        }
      }
    } catch (e) {}

    return records;
  }

  // =========================================================================
  // NORMALIZADOR PROFUNDO DE CLASE (ClassSession v5)
  // =========================================================================

  _normalizeExtractedClass(rawClass, dateStr, periodStr, sourceName, indexFallback) {
    const now = new Date().toISOString();
    const id = rawClass.id || rawClass.classId || `cls_recov_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const subName = rawClass.subjectName || rawClass.subject || rawClass.materia || 'Asignatura General';
    const grdName = rawClass.gradeName || rawClass.grade || rawClass.grado || 'General';
    const group = rawClass.group || rawClass.paralelo || grdName;
    const period = rawClass.period || periodStr || '1°';
    const date = rawClass.date || dateStr || '';

    // Consecutivo permanente
    let seqNum = rawClass.sequenceNumber ?? rawClass.consecutive ?? rawClass.dayNumber ?? rawClass.numeroClase;
    if (seqNum !== undefined && seqNum !== null) {
      const cleanNum = parseInt(String(seqNum).replace(/[^0-9]/g, ''), 10);
      seqNum = !isNaN(cleanNum) ? cleanNum : (indexFallback + 1);
    } else {
      seqNum = (indexFallback + 1);
    }

    // 1. Snapshot Curricular
    const topic = rawClass.curriculum?.topic || rawClass.topic || rawClass.tema || rawClass.ejeTematico || '';
    const dba = rawClass.curriculum?.dba || rawClass.dba || '';
    const achievement = rawClass.curriculum?.achievement || rawClass.curriculum?.performance || rawClass.achievement || rawClass.performance || rawClass.logro || rawClass.desempeno || '';
    const periodTopics = Array.isArray(rawClass.curriculum?.periodTopics) ? rawClass.curriculum.periodTopics : (Array.isArray(rawClass.periodTopics) ? rawClass.periodTopics : []);
    const periodPerformances = Array.isArray(rawClass.curriculum?.periodPerformances) ? rawClass.curriculum.periodPerformances : (Array.isArray(rawClass.periodPerformances) ? rawClass.periodPerformances : []);

    // 2. Secuencia Didáctica
    const rawPedagogy = rawClass.didacticSequence || rawClass.pedagogy || {};
    const parsedFromDesc = this._parseLegacyDescription(rawClass.description || '');

    const inicio = rawPedagogy.inicio || parsedFromDesc.inicio || rawClass.inicio || '';
    const desarrollo = rawPedagogy.desarrollo || parsedFromDesc.desarrollo || rawClass.desarrollo || (parsedFromDesc.rawFallback ? rawClass.description : '');
    const cierre = rawPedagogy.cierre || parsedFromDesc.cierre || rawClass.cierre || '';
    const recursos = rawPedagogy.recursos || parsedFromDesc.recursos || rawClass.recursos || rawClass.materiales || '';
    const tareas = rawPedagogy.tareas || parsedFromDesc.tareas || rawClass.tareas || rawClass.compromisos || '';
    const evaluation = rawPedagogy.evaluation || rawPedagogy.evaluacion || parsedFromDesc.evaluation || rawClass.evaluation || rawClass.evaluacion || '';

    // 3. Cuaderno del Docente (Extracción Exhaustiva - Req. 6, 88)
    const rawNotebook = rawClass.teacherNotebook || {};
    const question = rawNotebook.question || rawClass.question || rawClass.pregunta || rawClass.preguntaProblematizadora || '';
    const dynamics = rawNotebook.dynamics || rawClass.dynamics || rawClass.dinamica || '';
    const rules = Array.isArray(rawNotebook.rules) ? rawNotebook.rules : (Array.isArray(rawClass.rules) ? rawClass.rules : (rawClass.reglas ? [rawClass.reglas] : []));
    const periodStructure = Array.isArray(rawNotebook.periodStructure) ? rawNotebook.periodStructure : (Array.isArray(rawClass.periodStructure) ? rawClass.periodStructure : []);
    const studentNotebookContent = rawNotebook.studentNotebookContent || rawClass.notebookContent || rawClass.contenidoEstudiante || rawClass.cuadernoEstudiante || rawClass.guiaDetallada || '';
    const practicalActivity = rawNotebook.practicalActivity || rawClass.practicalActivity || rawClass.actividadPractica || rawClass.taller || rawClass.ejercicio || '';
    const detailedContent = rawNotebook.detailedContent || rawClass.detailedContent || rawClass.contenidoDocente || rawClass.guiaDocente || '';
    const additionalNotes = rawNotebook.additionalNotes || rawClass.additionalNotes || rawClass.notas || '';
    const sourceText = rawNotebook.sourceText || rawClass.sourceText || '';

    // Observaciones
    const observations = rawClass.observations || rawPedagogy.observaciones || rawClass.observaciones || '';

    // Estado inteligente
    const hasSubstantiveContent = Boolean(
      (topic && topic.trim()) ||
      (inicio && inicio.trim()) ||
      (desarrollo && desarrollo.trim()) ||
      (studentNotebookContent && studentNotebookContent.trim())
    );

    let status = rawClass.status;
    if (!status) {
      status = hasSubstantiveContent ? 'planned' : 'pending';
    }
    if (!date) {
      status = 'orphaned';
    }

    const subLower = String(subName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isHomeroom = subLower.includes('direccion de grupo') || subLower.includes('dirección de grupo');

    return {
      id,
      teacherId: rawClass.teacherId || 'usr_manuel',
      sequenceId: rawClass.sequenceId || null,
      scheduleSlotId: rawClass.scheduleSlotId || null,
      date,
      dayOfWeek: rawClass.dayOfWeek || '',
      startTime: rawClass.startTime || '',
      endTime: rawClass.endTime || '',
      time: rawClass.time || '',
      subjectId: this._slugify(subName),
      subjectName: subName,
      gradeId: this._slugify(grdName),
      gradeName: grdName,
      group,
      period,
      sequenceNumber: seqNum,
      status,
      subjectType: isHomeroom ? 'homeroom' : (rawClass.subjectType || 'academic'),
      curriculum: {
        topic,
        dba,
        achievement,
        periodTopics,
        periodPerformances
      },
      didacticSequence: {
        inicio,
        desarrollo,
        cierre,
        recursos,
        tareas,
        evaluation,
        durations: rawPedagogy.durations || {}
      },
      teacherNotebook: {
        question,
        periodStructure,
        dynamics,
        rules,
        detailedContent,
        studentNotebookContent,
        practicalActivity,
        additionalNotes,
        sourceText
      },
      observations,
      attachments: Array.isArray(rawClass.attachments) ? rawClass.attachments : [],
      version: Math.max(rawClass.version || 1, 1),
      createdAt: rawClass.createdAt || now,
      updatedAt: rawClass.updatedAt || now,
      // Metadatos de auditoría
      _source: sourceName,
      isOrphaned: !date || status === 'orphaned'
    };
  }

  _parseLegacyDescription(text) {
    if (!text || typeof text !== 'string') {
      return { inicio: '', desarrollo: '', cierre: '', recursos: '', tareas: '', evaluation: '', rawFallback: false };
    }

    const res = { inicio: '', desarrollo: '', cierre: '', recursos: '', tareas: '', evaluation: '', rawFallback: false };
    const lines = text.split('\n');
    let currentSec = null;
    const buffers = { inicio: [], desarrollo: [], cierre: [], recursos: [], tareas: [], evaluacion: [] };

    lines.forEach(l => {
      const trimmed = l.trim();
      const upper = trimmed.toUpperCase().replace(/\*/g, '');

      if (/^(FASE\s+DE\s+INICIO|INICIO)\b/i.test(upper)) {
        currentSec = 'inicio';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+INICIO|INICIO)[\*\s]*:?/i, '').trim();
        if (rest) buffers.inicio.push(rest);
      } else if (/^(FASE\s+DE\s+DESARROLLO|DESARROLLO)\b/i.test(upper)) {
        currentSec = 'desarrollo';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+DESARROLLO|DESARROLLO)[\*\s]*:?/i, '').trim();
        if (rest) buffers.desarrollo.push(rest);
      } else if (/^(FASE\s+DE\s+CIERRE|CIERRE)\b/i.test(upper)) {
        currentSec = 'cierre';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+CIERRE|CIERRE)[\*\s]*:?/i, '').trim();
        if (rest) buffers.cierre.push(rest);
      } else if (/^RECURSOS\b/i.test(upper)) {
        currentSec = 'recursos';
        const rest = trimmed.replace(/^[\*\s]*RECURSOS(\s+DID[AÁ]CTICOS)?[\*\s]*:?/i, '').trim();
        if (rest) buffers.recursos.push(rest);
      } else if (/^EVALUACI[OÓ]N\b/i.test(upper)) {
        currentSec = 'evaluacion';
        const rest = trimmed.replace(/^[\*\s]*EVALUACI[OÓ]N(\s+FORMATIVA)?[\*\s]*:?/i, '').trim();
        if (rest) buffers.evaluacion.push(rest);
      } else if (/^(TAREAS?|COMPROMISOS?)\b/i.test(upper)) {
        currentSec = 'tareas';
        const rest = trimmed.replace(/^[\*\s]*(TAREAS?|COMPROMISOS?)[\*\s]*:?/i, '').trim();
        if (rest) buffers.tareas.push(rest);
      } else {
        if (currentSec) {
          buffers[currentSec].push(l);
        } else {
          buffers.desarrollo.push(l);
        }
      }
    });

    res.inicio = buffers.inicio.join('\n').trim();
    res.desarrollo = buffers.desarrollo.join('\n').trim();
    res.cierre = buffers.cierre.join('\n').trim();
    res.recursos = buffers.recursos.join('\n').trim();
    res.tareas = buffers.tareas.join('\n').trim();
    res.evaluation = buffers.evaluacion.join('\n').trim();

    if (!res.inicio && !res.cierre && !res.recursos && !res.tareas && !res.evaluation) {
      res.desarrollo = text;
      res.rawFallback = true;
    }

    return res;
  }

  _consolidateFoundClasses(classesList, teacherId) {
    const mapById = {};
    const mapByLogic = {};
    const duplicates = [];

    classesList.forEach(c => {
      // Clave lógica única: periodo + materia + grupo + sequenceNumber
      const logicKey = `${c.period}__${this._norm(c.subjectName)}__${this._norm(c.group)}__${c.sequenceNumber}`;

      if (!mapById[c.id]) {
        mapById[c.id] = c;
      } else {
        // Mismo ID encontrado en distintas capas -> fusionar enriqueciendo
        mapById[c.id] = this._smartMerge(mapById[c.id], c);
      }

      if (!mapByLogic[logicKey]) {
        mapByLogic[logicKey] = c;
      } else {
        if (mapByLogic[logicKey].id !== c.id) {
          // Posible duplicado (distinto ID pero mismo consecutivo)
          duplicates.push({ a: mapByLogic[logicKey], b: c });
        }
      }
    });

    const consolidatedList = Object.values(mapById);
    const orphans = consolidatedList.filter(c => c.isOrphaned || !c.date || c.status === 'orphaned');

    return {
      all: consolidatedList,
      orphans,
      duplicates
    };
  }

  _isSameLogicalClass(c1, c2) {
    if (!c1 || !c2) return false;
    if (c1.id && c2.id && c1.id === c2.id) return true;
    if (c1.date && c2.date && c1.date === c2.date) {
      if (this._norm(c1.subjectName) === this._norm(c2.subjectName) && this._norm(c1.group) === this._norm(c2.group)) {
        return true;
      }
    }
    return false;
  }

  _smartMerge(base, incoming) {
    if (!base && !incoming) return null;
    if (!base) return JSON.parse(JSON.stringify(incoming));
    if (!incoming) return JSON.parse(JSON.stringify(base));

    const merged = JSON.parse(JSON.stringify(base));

    // Garantizar que las sub-estructuras obligatorias existan como objetos antes de acceder a propiedades
    if (!merged.curriculum || typeof merged.curriculum !== 'object') {
      merged.curriculum = {};
    }
    if (!merged.didacticSequence || typeof merged.didacticSequence !== 'object') {
      merged.didacticSequence = {};
    }
    if (!merged.teacherNotebook || typeof merged.teacherNotebook !== 'object') {
      merged.teacherNotebook = {};
    }
    if (!merged.pedagogy || typeof merged.pedagogy !== 'object') {
      merged.pedagogy = {};
    }

    const incCurriculum = incoming.curriculum || {};
    const incDidactic = incoming.didacticSequence || incoming.pedagogy || {};
    const incNotebook = incoming.teacherNotebook || {};
    const basePedagogy = base.pedagogy || {};
    const baseNotebook = base.teacherNotebook || {};

    // Regla anti-vacíos: solo actualizar si incoming tiene contenido real
    const pickNonEmpty = (valIncoming, valBase) => {
      if (valIncoming !== null && valIncoming !== undefined && typeof valIncoming === 'string' && valIncoming.trim().length > 0) {
        return valIncoming;
      }
      if (valBase !== null && valBase !== undefined && typeof valBase === 'string' && valBase.trim().length > 0) {
        return valBase;
      }
      return '';
    };

    // 1. Snapshot Curricular
    merged.curriculum.topic = pickNonEmpty(
      incCurriculum.topic || incoming.topic || incoming.tema,
      merged.curriculum.topic || base.topic || base.tema
    );
    merged.curriculum.dba = pickNonEmpty(
      incCurriculum.dba || incoming.dba,
      merged.curriculum.dba || base.dba
    );
    merged.curriculum.achievement = pickNonEmpty(
      incCurriculum.achievement || incCurriculum.performance || incoming.achievement || incoming.performance || incoming.logro || incoming.desempeno,
      merged.curriculum.achievement || base.curriculum?.achievement || base.achievement || base.performance || base.logro
    );

    if (Array.isArray(incCurriculum.periodTopics) && incCurriculum.periodTopics.length > 0) {
      merged.curriculum.periodTopics = incCurriculum.periodTopics;
    } else if (Array.isArray(incoming.periodTopics) && incoming.periodTopics.length > 0) {
      merged.curriculum.periodTopics = incoming.periodTopics;
    } else if (!Array.isArray(merged.curriculum.periodTopics)) {
      merged.curriculum.periodTopics = [];
    }

    if (Array.isArray(incCurriculum.periodPerformances) && incCurriculum.periodPerformances.length > 0) {
      merged.curriculum.periodPerformances = incCurriculum.periodPerformances;
    } else if (Array.isArray(incoming.periodPerformances) && incoming.periodPerformances.length > 0) {
      merged.curriculum.periodPerformances = incoming.periodPerformances;
    } else if (!Array.isArray(merged.curriculum.periodPerformances)) {
      merged.curriculum.periodPerformances = [];
    }

    // 2. Secuencia Didáctica
    merged.didacticSequence.inicio = pickNonEmpty(
      incDidactic.inicio || incoming.inicio,
      merged.didacticSequence.inicio || basePedagogy.inicio || base.inicio
    );
    merged.didacticSequence.desarrollo = pickNonEmpty(
      incDidactic.desarrollo || incoming.desarrollo || incoming.description,
      merged.didacticSequence.desarrollo || basePedagogy.desarrollo || base.desarrollo || base.description
    );
    merged.didacticSequence.cierre = pickNonEmpty(
      incDidactic.cierre || incoming.cierre,
      merged.didacticSequence.cierre || basePedagogy.cierre || base.cierre
    );
    merged.didacticSequence.recursos = pickNonEmpty(
      incDidactic.recursos || incoming.recursos || incoming.materiales,
      merged.didacticSequence.recursos || basePedagogy.recursos || base.recursos || base.materiales
    );
    merged.didacticSequence.tareas = pickNonEmpty(
      incDidactic.tareas || incoming.tareas || incoming.compromisos,
      merged.didacticSequence.tareas || basePedagogy.tareas || base.tareas || base.compromisos
    );
    merged.didacticSequence.evaluation = pickNonEmpty(
      incDidactic.evaluation || incDidactic.evaluacion || incoming.evaluation || incoming.evaluacion,
      merged.didacticSequence.evaluation || basePedagogy.evaluation || basePedagogy.evaluacion || base.evaluation || base.evaluacion
    );

    if (incDidactic.durations && typeof incDidactic.durations === 'object') {
      merged.didacticSequence.durations = Object.assign({}, merged.didacticSequence.durations || {}, incDidactic.durations);
    } else if (!merged.didacticSequence.durations) {
      merged.didacticSequence.durations = basePedagogy.durations || {};
    }

    // 3. Cuaderno del Docente
    merged.teacherNotebook.question = pickNonEmpty(
      incNotebook.question || incoming.question || incoming.pregunta || incoming.preguntaProblematizadora,
      merged.teacherNotebook.question || baseNotebook.question || base.question || base.pregunta
    );
    merged.teacherNotebook.dynamics = pickNonEmpty(
      incNotebook.dynamics || incoming.dynamics || incoming.dinamica,
      merged.teacherNotebook.dynamics || baseNotebook.dynamics || base.dynamics || base.dinamica
    );
    merged.teacherNotebook.studentNotebookContent = pickNonEmpty(
      incNotebook.studentNotebookContent || incoming.studentNotebookContent || incoming.notebookContent || incoming.cuadernoEstudiante || incoming.contenidoEstudiante,
      merged.teacherNotebook.studentNotebookContent || baseNotebook.studentNotebookContent || base.notebookContent || base.cuadernoEstudiante
    );
    merged.teacherNotebook.practicalActivity = pickNonEmpty(
      incNotebook.practicalActivity || incoming.practicalActivity || incoming.actividadPractica || incoming.taller,
      merged.teacherNotebook.practicalActivity || baseNotebook.practicalActivity || base.practicalActivity || base.actividadPractica || base.taller
    );
    merged.teacherNotebook.detailedContent = pickNonEmpty(
      incNotebook.detailedContent || incoming.detailedContent || incoming.contenidoDocente || incoming.guiaDocente,
      merged.teacherNotebook.detailedContent || baseNotebook.detailedContent || base.detailedContent || base.contenidoDocente
    );
    merged.teacherNotebook.additionalNotes = pickNonEmpty(
      incNotebook.additionalNotes || incoming.additionalNotes || incoming.notas,
      merged.teacherNotebook.additionalNotes || baseNotebook.additionalNotes || base.additionalNotes || base.notas
    );
    merged.teacherNotebook.sourceText = pickNonEmpty(
      incNotebook.sourceText || incoming.sourceText,
      merged.teacherNotebook.sourceText || baseNotebook.sourceText || base.sourceText
    );

    if (Array.isArray(incNotebook.rules) && incNotebook.rules.length > 0) {
      merged.teacherNotebook.rules = incNotebook.rules;
    } else if (Array.isArray(incoming.rules) && incoming.rules.length > 0) {
      merged.teacherNotebook.rules = incoming.rules;
    } else if (!Array.isArray(merged.teacherNotebook.rules)) {
      merged.teacherNotebook.rules = Array.isArray(baseNotebook.rules) ? baseNotebook.rules : [];
    }

    if (Array.isArray(incNotebook.periodStructure) && incNotebook.periodStructure.length > 0) {
      merged.teacherNotebook.periodStructure = incNotebook.periodStructure;
    } else if (Array.isArray(incoming.periodStructure) && incoming.periodStructure.length > 0) {
      merged.teacherNotebook.periodStructure = incoming.periodStructure;
    } else if (!Array.isArray(merged.teacherNotebook.periodStructure)) {
      merged.teacherNotebook.periodStructure = Array.isArray(baseNotebook.periodStructure) ? baseNotebook.periodStructure : [];
    }

    // 4. Observaciones y adjuntos
    merged.observations = pickNonEmpty(
      incoming.observations || incoming.observaciones,
      merged.observations || base.observaciones
    );

    if (Array.isArray(incoming.attachments) && incoming.attachments.length > 0) {
      merged.attachments = incoming.attachments;
    } else if (!Array.isArray(merged.attachments)) {
      merged.attachments = Array.isArray(base.attachments) ? base.attachments : [];
    }

    // 5. Metadatos de fecha y slot
    if (!merged.date && incoming.date) {
      merged.date = incoming.date;
    }
    if (!merged.startTime && incoming.startTime) merged.startTime = incoming.startTime;
    if (!merged.endTime && incoming.endTime) merged.endTime = incoming.endTime;
    if (!merged.time && incoming.time) merged.time = incoming.time;
    if (!merged.dayOfWeek && incoming.dayOfWeek) merged.dayOfWeek = incoming.dayOfWeek;
    if (!merged.scheduleSlotId && incoming.scheduleSlotId) merged.scheduleSlotId = incoming.scheduleSlotId;
    if (!merged.sequenceId && incoming.sequenceId) merged.sequenceId = incoming.sequenceId;

    // 6. Espejos de retrocompatibilidad (para componentes v1-v4)
    merged.pedagogy.inicio = merged.didacticSequence.inicio;
    merged.pedagogy.desarrollo = merged.didacticSequence.desarrollo;
    merged.pedagogy.cierre = merged.didacticSequence.cierre;
    merged.pedagogy.recursos = merged.didacticSequence.recursos;
    merged.pedagogy.evaluacion = merged.didacticSequence.evaluation;
    merged.pedagogy.tareas = merged.didacticSequence.tareas;
    merged.pedagogy.observaciones = merged.observations;

    merged.topic = merged.curriculum.topic;
    merged.dba = merged.curriculum.dba;
    merged.achievement = merged.curriculum.achievement;
    merged.notebookContent = merged.teacherNotebook.studentNotebookContent;
    if (!merged.description && merged.didacticSequence.desarrollo) {
      merged.description = merged.didacticSequence.desarrollo;
    }

    // 7. Estado
    const hasContent = Boolean(
      (merged.curriculum.topic && merged.curriculum.topic.trim()) ||
      (merged.didacticSequence.inicio && merged.didacticSequence.inicio.trim()) ||
      (merged.didacticSequence.desarrollo && merged.didacticSequence.desarrollo.trim()) ||
      (merged.teacherNotebook.studentNotebookContent && merged.teacherNotebook.studentNotebookContent.trim())
    );

    if (base.status === 'completed' || incoming.status === 'completed') {
      merged.status = 'completed';
    } else if (hasContent) {
      merged.status = 'planned';
    } else {
      merged.status = merged.status || incoming.status || 'pending';
    }

    merged.version = Math.max(merged.version || 1, incoming.version || 1);
    merged.updatedAt = new Date().toISOString();

    return merged;
  }

  _buildAuditStats(consolidated, totalLegacyPlans, rawRecords) {
    const classes = consolidated.all;

    const totalClasses = classes.length;
    const completed = classes.filter(c => c.status === 'planned' || c.status === 'completed').length;
    const pending = classes.filter(c => c.status === 'pending' || c.status === 'draft').length;
    const withoutDate = classes.filter(c => !c.date || c.date.trim() === '').length;
    const withoutNumber = classes.filter(c => !c.sequenceNumber || isNaN(c.sequenceNumber)).length;
    const withoutGroup = classes.filter(c => !c.group || c.group.trim() === '').length;
    const orphaned = consolidated.orphans.length;
    const duplicates = consolidated.duplicates.length;
    const withNotebook = classes.filter(c => Boolean(c.teacherNotebook?.studentNotebookContent || c.teacherNotebook?.question || c.teacherNotebook?.practicalActivity)).length;

    // Calcular cuántas son visibles en el calendario actual
    const visibleInCurrentCalendar = classes.filter(c => c.date && c.date.trim().length > 0).length;
    const invisibleInCurrentCalendar = totalClasses - visibleInCurrentCalendar;

    return {
      timestamp: new Date().toISOString(),
      totalPlansFound: totalLegacyPlans,
      totalClasses,
      totalClassesInRepository: totalClasses,
      totalCompleted: completed,
      completedClasses: completed,
      totalPending: pending,
      totalWithoutDate: withoutDate,
      totalWithoutNumber: withoutNumber,
      totalWithoutGroup: withoutGroup,
      totalOrphaned: orphaned,
      totalDuplicates: duplicates,
      totalLegacyRecords: rawRecords.localStorageRecords.length + rawRecords.indexedDBRecords.length,
      classesWithNotebook: withNotebook,
      currentlyVisible: visibleInCurrentCalendar,
      currentlyInvisible: invisibleInCurrentCalendar,
      requiresManualReview: duplicates + withoutDate,
      classes: classes,
      duplicatesList: consolidated.duplicates,
      orphansList: consolidated.orphans
    };
  }

  async _createPreRecoveryBackup(teacherId) {
    try {
      const backupKey = `backup_recovery_pre_execution_${teacherId}_${Date.now()}`;
      const dump = {};

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) dump[k] = localStorage.getItem(k);
        }
        localStorage.setItem(backupKey, JSON.stringify({
          timestamp: new Date().toISOString(),
          teacherId,
          description: 'Copia de seguridad antes de la recuperación universal de planeaciones',
          data: dump
        }));
      }

      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        await IDBStorage.set(backupKey, dump);
      }

      console.log(`[RecoveryService] Respaldo inmutable de seguridad creado: ${backupKey}`);
      return true;
    } catch (e) {
      console.warn('[RecoveryService] Advertencia creando respaldo de seguridad:', e);
      return false;
    }
  }

  _syncSequencesFromClasses(classes, teacherId) {
    try {
      const seqMap = {};
      classes.forEach(c => {
        if (!c.curriculum?.topic && !c.curriculum?.dba) return;
        const key = `${c.period}__${c.subjectName}__${c.group}__${c.sequenceNumber}`;
        if (!seqMap[key]) {
          seqMap[key] = {
            id: `seq_${c.period}_${this._slugify(c.subjectName)}_${this._slugify(c.group)}_${c.sequenceNumber}`,
            teacherId,
            period: c.period,
            subjectName: c.subjectName,
            gradeName: c.gradeName,
            group: c.group,
            sequenceNumber: c.sequenceNumber,
            topic: c.curriculum.topic,
            dba: c.curriculum.dba,
            achievement: c.curriculum.achievement,
            status: c.status,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          };
        }
      });

      const seqArray = Object.values(seqMap);
      const seqRepo = this._getSequenceRepository();
      const seqKey = seqRepo && seqRepo.getStorageKey ? seqRepo.getStorageKey(teacherId) : `teacher_planner_sequences_${teacherId}_v1`;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(seqKey, JSON.stringify(seqArray));
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        IDBStorage.set(seqKey, seqArray).catch(() => {});
      }
      if (seqRepo && seqRepo._cache) {
        seqRepo._cache[teacherId] = seqArray;
      }
    } catch (e) {}
  }

  _norm(str) {
    return String(str || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  _slugify(text) {
    return String(text || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'general';
  }
}

const RecoveryService = new RecoveryServiceClass();

if (typeof window !== 'undefined') {
  window.RecoveryService = RecoveryService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecoveryService;
}
