/**
 * REPOSITORIO CENTRALIZADO DE SESIONES DE CLASE (ClassRepository)
 * ÚNICA FUENTE DE VERDAD PARA CADA CLASE INDIVIDUAL.
 *
 * Principios arquitectónicos obligatorios:
 * 1. Identidad propia y permanente (id: cls_xxxxx).
 * 2. Consecutivo inmutable (sequenceNumber): no se renumeran al borrar o mover otras clases.
 * 3. Fecha inmutable como atributo de la sesión (date: YYYY-MM-DD).
 * 4. Snapshot curricular inmutable (curriculum: { topic, dba, achievement }).
 * 5. Estructura pedagógica modular (pedagogy: { inicio, desarrollo, cierre, recursos, evaluacion, tareas }).
 * 6. Guardado atómico individual: guardar una clase NO modifica las clases vecinas ni otras fechas.
 * 7. Grupos paralelos independientes: 4A != 4B (sin sincronizaciones permanentes).
 * 8. Control de concurrencia y versionado atómico (version: n + 1, updatedAt, optimistic lock).
 */

class ClassRepositoryClass {
  constructor() {
    this._channel = null;
    this._tabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this._cache = {}; // teacherId -> { [classId]: ClassSession }
    this._isInitialized = false;
    this._initPromise = null;
    this._setupChannel();
  }

  _setupChannel() {
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
      try {
        this._channel = new BroadcastChannel('planeaciones_class_sync_v4');
        this._channel.onmessage = (event) => this._handleBroadcast(event.data);
      } catch (e) {}
    }
  }

  _handleBroadcast(msg) {
    if (!msg || msg.sourceTabId === this._tabId) return;

    if (msg.type === 'CLASS_SAVED' && msg.classSession) {
      const cls = msg.classSession;
      const tid = cls.teacherId || this._getCurrentTeacherId();
      if (!this._cache[tid]) this._cache[tid] = {};
      this._cache[tid][cls.id] = JSON.parse(JSON.stringify(cls));

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_remote_update', {
          detail: { classId: cls.id, date: cls.date, version: cls.version, sourceTabId: msg.sourceTabId }
        }));
      }
    } else if (msg.type === 'CLASS_DELETED' && msg.classId) {
      const tid = msg.teacherId || this._getCurrentTeacherId();
      if (this._cache[tid]) {
        delete this._cache[tid][msg.classId];
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_remote_delete', {
          detail: { classId: msg.classId, date: msg.date, sourceTabId: msg.sourceTabId }
        }));
      }
    }
  }

  _getCurrentTeacherId() {
    if (typeof UserService !== 'undefined' && UserService.getCurrentUserId) {
      return UserService.getCurrentUserId() || 'usr_manuel';
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('school_current_active_user_v2') || 'usr_manuel';
    }
    return 'usr_manuel';
  }

  getStorageKey(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    return `teacher_class_sessions_${tid}_v4`;
  }

  generateClassId(prefix = 'cls') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${ts}_${rand}`;
  }

  _norm(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  _hasRealContent(val) {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    if (!str || str === '<p><br/></p>' || str === '<p><br></p>' || str === '<p></p>' || str === '<br>') {
      return false;
    }
    const cleanText = str.replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
    if (cleanText.length > 0) return true;
    return /<(img|table|iframe|hr|svg|canvas|video|audio)[^>]*>/i.test(str);
  }

  /**
   * Inicializa el repositorio cargando clases desde IndexedDB y LocalStorage
   */
  async init(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid] && Object.keys(this._cache[tid]).length > 0) {
      return this._cache[tid];
    }
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      let sessionsMap = null;

      // 1. Cargar desde IndexedDB
      if (typeof IDBStorage !== 'undefined' && IDBStorage.get) {
        try {
          sessionsMap = await IDBStorage.get(this.getStorageKey(tid));
        } catch (e) {}
      }

      // 2. Cargar desde LocalStorage
      if (!sessionsMap && typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(this.getStorageKey(tid));
          if (raw) sessionsMap = JSON.parse(raw);
        } catch (e) {}
      }

      if (!sessionsMap || typeof sessionsMap !== 'object') {
        sessionsMap = {};
      }

      this._cache[tid] = sessionsMap;
      this._isInitialized = true;
      return sessionsMap;
    })();

    return this._initPromise;
  }

  _getAllMap(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) {
      return this._cache[tid];
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getStorageKey(tid));
        if (raw) {
          const parsed = JSON.parse(raw);
          this._cache[tid] = parsed;
          return parsed;
        }
      } catch (e) {}
    }
    this._cache[tid] = {};
    return this._cache[tid];
  }

  /**
   * Obtiene una clase por su ID permanente
   */
  getClass(classId, teacherId) {
    if (!classId) return null;
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    const cls = map[classId];
    return cls ? this._cleanClassText(JSON.parse(JSON.stringify(cls))) : null;
  }

  /**
   * Obtiene todas las clases aplicando filtros opcionales (READ-ONLY)
   */
  getClasses(filters = {}, teacherId) {
    const tid = teacherId || filters.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    let classes = Object.values(map);

    if (filters.date) {
      classes = classes.filter(c => c.date === filters.date);
    }
    if (filters.startDate) {
      classes = classes.filter(c => c.date >= filters.startDate);
    }
    if (filters.endDate) {
      classes = classes.filter(c => c.date <= filters.endDate);
    }
    if (filters.period) {
      const pNorm = this._norm(filters.period);
      classes = classes.filter(c => this._norm(c.period) === pNorm);
    }
    if (filters.subject || filters.subjectName) {
      const sNorm = this._norm(filters.subject || filters.subjectName);
      classes = classes.filter(c => this._norm(c.subjectName || c.subject) === sNorm || this._norm(c.subjectId) === sNorm);
    }
    if (filters.grade || filters.gradeName) {
      const gNorm = this._norm(filters.grade || filters.gradeName);
      classes = classes.filter(c => this._norm(c.gradeName || c.grade) === gNorm || this._norm(c.gradeId) === gNorm);
    }
    if (filters.group) {
      const grpNorm = this._norm(filters.group);
      classes = classes.filter(c => this._norm(c.group || c.gradeName || c.grade) === grpNorm);
    }
    if (filters.status) {
      classes = classes.filter(c => c.status === filters.status);
    }
    if (filters.sequenceId) {
      classes = classes.filter(c => c.sequenceId === filters.sequenceId);
    }

    return JSON.parse(JSON.stringify(classes)).map(c => this._cleanClassText(c));
  }

  /**
   * Obtiene todas las clases registradas para el docente (READ-ONLY)
   */
  getAllClasses(teacherId) {
    return this.getClasses({}, teacherId);
  }

  /**
   * Obtiene todas las clases asignadas a una fecha específica (READ-ONLY)
   */
  getByDate(dateStr, teacherId) {
    if (!dateStr) return [];
    const classes = this.getClasses({ date: dateStr }, teacherId);
    // Ordenar cronológicamente por startTime o por sequenceNumber
    return classes.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
    });
  }

  getBySubject(subject, teacherId) {
    return this.getClasses({ subject }, teacherId);
  }

  getByGrade(grade, teacherId) {
    return this.getClasses({ grade }, teacherId);
  }

  getBySequence(sequenceId, teacherId) {
    return this.getClasses({ sequenceId }, teacherId);
  }

  _normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId) {
    if (typeof scopeOrPeriod === 'string') {
      let group = grade;
      let tid = teacherId;
      if (teacherId === undefined && typeof groupOrTeacherId === 'string' && groupOrTeacherId.startsWith('usr_')) {
        tid = groupOrTeacherId;
        group = grade;
      } else if (typeof groupOrTeacherId === 'string') {
        group = groupOrTeacherId;
      }
      return {
        period: scopeOrPeriod,
        subject: subject,
        grade: grade,
        group: group,
        teacherId: tid
      };
    }
    return scopeOrPeriod || {};
  }

  /**
   * Encuentra el mayor sequenceNumber registrado para teacher + period + subject + grade + group.
   * Esto garantiza la preservación histórica: jamás renumera hacia abajo.
   */
  getMaxSequenceNumber(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    const scope = this._normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId);
    const tid = scope.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    const classes = Object.values(map);

    const targetSub = this._norm(scope.subject || scope.subjectName);
    const targetGrd = this._norm(scope.grade || scope.gradeName);
    const targetGrp = this._norm(scope.group || scope.grade || scope.gradeName);
    const targetPer = this._norm(scope.period || '1°');

    let maxNum = 0;
    classes.forEach(cls => {
      if (targetPer && this._norm(cls.period) !== targetPer) return;
      if (targetSub && this._norm(cls.subjectName || cls.subject) !== targetSub) return;
      if (targetGrd && this._norm(cls.gradeName || cls.grade) !== targetGrd) return;
      const clsGroup = cls.group || cls.gradeName || cls.grade;
      if (targetGrp && clsGroup && this._norm(clsGroup) !== targetGrp) return;

      const num = parseInt(cls.sequenceNumber, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });

    return maxNum;
  }

  /**
   * Determina el siguiente número consecutivo para una nueva clase (max + 1)
   */
  getNextSequenceNumber(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    return this.getMaxSequenceNumber(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId) + 1;
  }

  /**
   * Normaliza y valida una entidad ClassSession completa antes de persistir
   */
  _normalizeClassSession(incoming, existing = null) {
    const tid = incoming.teacherId || existing?.teacherId || this._getCurrentTeacherId();
    const classId = incoming.id || existing?.id || this.generateClassId('cls');
    const date = incoming.date || existing?.date || new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const subjectName = incoming.subjectName || incoming.subject || existing?.subjectName || existing?.subject || '';
    const gradeName = incoming.gradeName || incoming.grade || existing?.gradeName || existing?.grade || '';
    const group = incoming.group || existing?.group || gradeName;
    const period = incoming.period || existing?.period || '1°';

    // sequenceNumber: PERMANENTE E INMUTABLE
    let sequenceNumber = incoming.sequenceNumber !== undefined && incoming.sequenceNumber !== null
      ? parseInt(incoming.sequenceNumber, 10)
      : (existing?.sequenceNumber ? parseInt(existing.sequenceNumber, 10) : null);

    if (!sequenceNumber || isNaN(sequenceNumber)) {
      sequenceNumber = this.getNextSequenceNumber({
        teacherId: tid,
        period,
        subject: subjectName,
        grade: gradeName,
        group
      });
    }

    // Versionado atómico incremental
    const currentVersion = existing ? (existing.version || 1) : 0;
    const nextVersion = currentVersion + 1;

    // Snapshot Curricular: inmutable ante modificaciones futuras de la malla
    const incomingCur = incoming.curriculum || {};
    const existingCur = existing?.curriculum || {};
    const curriculum = {
      topic: incomingCur.topic ?? (incoming.topic ?? existingCur.topic ?? existing?.topic ?? ''),
      dba: incomingCur.dba ?? (incoming.dba ?? existingCur.dba ?? existing?.dba ?? ''),
      achievement: incomingCur.achievement ?? (incoming.achievement ?? incoming.performance ?? existingCur.achievement ?? existing?.achievement ?? existing?.performance ?? ''),
      periodTopics: Array.isArray(incomingCur.periodTopics) ? incomingCur.periodTopics : (Array.isArray(existingCur.periodTopics) ? existingCur.periodTopics : []),
      periodPerformances: Array.isArray(incomingCur.periodPerformances) ? incomingCur.periodPerformances : (Array.isArray(existingCur.periodPerformances) ? existingCur.periodPerformances : [])
    };

    // Estructura Pedagógica / Secuencia Didáctica modular (Sincronización bidireccional segura)
    const incomingDidactic = incoming.didacticSequence || {};
    const incomingPedagogy = incoming.pedagogy || {};
    const existingDidactic = existing?.didacticSequence || existing?.pedagogy || {};

    const resolveDidactic = (field, altField = null) => {
      const fromDidactic = incomingDidactic[field];
      const fromPedagogy = incomingPedagogy[field] ?? (altField ? incomingPedagogy[altField] : undefined);
      const existVal = existingDidactic[field] ?? (altField ? existingDidactic[altField] : undefined);

      if (fromPedagogy !== undefined && fromPedagogy !== existVal) {
        return fromPedagogy;
      }
      if (fromDidactic !== undefined) {
        return fromDidactic;
      }
      if (fromPedagogy !== undefined) {
        return fromPedagogy;
      }
      return existVal ?? '';
    };

    const didacticSequence = {
      inicio: resolveDidactic('inicio'),
      desarrollo: resolveDidactic('desarrollo') || (incoming.description || existing?.description || ''),
      cierre: resolveDidactic('cierre'),
      recursos: resolveDidactic('recursos'),
      evaluation: resolveDidactic('evaluation', 'evaluacion'),
      tareas: resolveDidactic('tareas'),
      durations: incomingDidactic.durations || incomingPedagogy.durations || existingDidactic.durations || {}
    };

    // Cuaderno del Docente (Segunda Capa de Información - Req. 28-35)
    const incomingNotebook = incoming.teacherNotebook || {};
    const existingNotebook = existing?.teacherNotebook || {};
    const teacherNotebook = {
      question: incomingNotebook.question ?? (incoming.question ?? existingNotebook.question ?? existing?.question ?? ''),
      periodStructure: Array.isArray(incomingNotebook.periodStructure) ? incomingNotebook.periodStructure : (Array.isArray(existingNotebook.periodStructure) ? existingNotebook.periodStructure : []),
      dynamics: incomingNotebook.dynamics ?? (incoming.dynamics ?? existingNotebook.dynamics ?? existing?.dynamics ?? ''),
      rules: Array.isArray(incomingNotebook.rules) ? incomingNotebook.rules : (Array.isArray(existingNotebook.rules) ? existingNotebook.rules : []),
      detailedContent: incomingNotebook.detailedContent ?? (incoming.detailedContent ?? existingNotebook.detailedContent ?? existing?.detailedContent ?? ''),
      studentNotebookContent: incomingNotebook.studentNotebookContent ?? (incoming.notebookContent ?? existingNotebook.studentNotebookContent ?? existing?.notebookContent ?? ''),
      practicalActivity: incomingNotebook.practicalActivity ?? (incoming.practicalActivity ?? existingNotebook.practicalActivity ?? existing?.practicalActivity ?? ''),
      additionalNotes: incomingNotebook.additionalNotes ?? (incoming.additionalNotes ?? existingNotebook.additionalNotes ?? existing?.additionalNotes ?? ''),
      sourceText: incomingNotebook.sourceText ?? (incoming.sourceText ?? existingNotebook.sourceText ?? existing?.sourceText ?? '')
    };

    // Regla anti-vacíos: si el campo entrante está vacío pero existía contenido previo real, PRESERVAR
    if (!this._hasRealContent(didacticSequence.inicio) && this._hasRealContent(existingDidactic.inicio)) {
      didacticSequence.inicio = existingDidactic.inicio;
    }
    if (!this._hasRealContent(didacticSequence.desarrollo) && this._hasRealContent(existingDidactic.desarrollo)) {
      didacticSequence.desarrollo = existingDidactic.desarrollo;
    }
    if (!this._hasRealContent(didacticSequence.cierre) && this._hasRealContent(existingDidactic.cierre)) {
      didacticSequence.cierre = existingDidactic.cierre;
    }
    if (!this._hasRealContent(didacticSequence.recursos) && this._hasRealContent(existingDidactic.recursos)) {
      didacticSequence.recursos = existingDidactic.recursos;
    }
    if (!this._hasRealContent(didacticSequence.evaluation) && this._hasRealContent(existingDidactic.evaluation)) {
      didacticSequence.evaluation = existingDidactic.evaluation;
    }
    if (!this._hasRealContent(didacticSequence.tareas) && this._hasRealContent(existingDidactic.tareas)) {
      didacticSequence.tareas = existingDidactic.tareas;
    }

    if (!this._hasRealContent(curriculum.topic) && this._hasRealContent(existingCur.topic)) {
      curriculum.topic = existingCur.topic;
    }
    if (!this._hasRealContent(curriculum.dba) && this._hasRealContent(existingCur.dba)) {
      curriculum.dba = existingCur.dba;
    }
    if (!this._hasRealContent(curriculum.achievement) && this._hasRealContent(existingCur.achievement)) {
      curriculum.achievement = existingCur.achievement;
    }

    if (!this._hasRealContent(teacherNotebook.question) && this._hasRealContent(existingNotebook.question)) {
      teacherNotebook.question = existingNotebook.question;
    }
    if (!this._hasRealContent(teacherNotebook.studentNotebookContent) && this._hasRealContent(existingNotebook.studentNotebookContent)) {
      teacherNotebook.studentNotebookContent = existingNotebook.studentNotebookContent;
    }
    if (!this._hasRealContent(teacherNotebook.practicalActivity) && this._hasRealContent(existingNotebook.practicalActivity)) {
      teacherNotebook.practicalActivity = existingNotebook.practicalActivity;
    }
    if (!this._hasRealContent(teacherNotebook.sourceText) && this._hasRealContent(existingNotebook.sourceText)) {
      teacherNotebook.sourceText = existingNotebook.sourceText;
    }

    // Sanitización defensiva de encabezados redundantes residuales
    if (typeof didacticSequence.recursos === 'string') {
      didacticSequence.recursos = didacticSequence.recursos
        .replace(/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:RECURSOS\s+DID[AÁ]CTICOS|RECURSOS\s+Y\s+MATERIALES|MATERIALES\s+DID[AÁ]CTICOS|RECURSOS|MATERIALES))\s*:?\s*/i, '')
        .trim();
    }
    if (typeof didacticSequence.tareas === 'string') {
      didacticSequence.tareas = didacticSequence.tareas
        .replace(/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|ACTIVIDADES\s+EXTRACLASE|TRABAJO\s+EN\s+CASA)\s*:?\s*/i, '')
        .trim();
    }

    // Limpiar saltos indebidos en campos pedagógicos y curriculares
    if (typeof didacticSequence.inicio === 'string') didacticSequence.inicio = this._cleanBrokenLinebreaks(didacticSequence.inicio);
    if (typeof didacticSequence.desarrollo === 'string') didacticSequence.desarrollo = this._cleanBrokenLinebreaks(didacticSequence.desarrollo);
    if (typeof didacticSequence.cierre === 'string') didacticSequence.cierre = this._cleanBrokenLinebreaks(didacticSequence.cierre);
    if (typeof didacticSequence.recursos === 'string') didacticSequence.recursos = this._cleanBrokenLinebreaks(didacticSequence.recursos);
    if (typeof didacticSequence.evaluation === 'string') didacticSequence.evaluation = this._cleanBrokenLinebreaks(didacticSequence.evaluation);
    if (typeof didacticSequence.tareas === 'string') didacticSequence.tareas = this._cleanBrokenLinebreaks(didacticSequence.tareas);

    if (typeof curriculum.topic === 'string') curriculum.topic = this._cleanBrokenLinebreaks(curriculum.topic);
    if (typeof curriculum.dba === 'string') curriculum.dba = this._cleanBrokenLinebreaks(curriculum.dba);
    if (typeof curriculum.achievement === 'string') curriculum.achievement = this._cleanBrokenLinebreaks(curriculum.achievement);

    if (typeof teacherNotebook.question === 'string') teacherNotebook.question = this._cleanBrokenLinebreaks(teacherNotebook.question);
    if (typeof teacherNotebook.dynamics === 'string') teacherNotebook.dynamics = this._cleanBrokenLinebreaks(teacherNotebook.dynamics);
    if (typeof teacherNotebook.studentNotebookContent === 'string') teacherNotebook.studentNotebookContent = this._cleanBrokenLinebreaks(teacherNotebook.studentNotebookContent);
    if (typeof teacherNotebook.practicalActivity === 'string') teacherNotebook.practicalActivity = this._cleanBrokenLinebreaks(teacherNotebook.practicalActivity);
    if (typeof teacherNotebook.detailedContent === 'string') teacherNotebook.detailedContent = this._cleanBrokenLinebreaks(teacherNotebook.detailedContent);
    if (typeof teacherNotebook.additionalNotes === 'string') teacherNotebook.additionalNotes = this._cleanBrokenLinebreaks(teacherNotebook.additionalNotes);

    const resolvedObservations = incoming.observations !== undefined 
      ? this._cleanBrokenLinebreaks(incoming.observations) 
      : (incomingPedagogy.observaciones !== undefined 
          ? this._cleanBrokenLinebreaks(incomingPedagogy.observaciones) 
          : (incomingDidactic.observaciones !== undefined 
              ? this._cleanBrokenLinebreaks(incomingDidactic.observaciones) 
              : (existing?.observations ?? existingDidactic.observaciones ?? '')));

    // Espejo de compatibilidad para código existente (pedagogy)
    const pedagogy = {
      ...didacticSequence,
      evaluacion: didacticSequence.evaluation,
      observaciones: resolvedObservations
    };

    // Determinar estado de la clase
    const hasPedagogyContent = this._hasRealContent(didacticSequence.inicio) || this._hasRealContent(didacticSequence.desarrollo) || this._hasRealContent(didacticSequence.cierre) || this._hasRealContent(teacherNotebook.studentNotebookContent);
    let status = incoming.status || (hasPedagogyContent ? 'planned' : (existing?.status || 'pending'));
    const isOrphaned = (!date || date.trim() === '' || incoming.isOrphaned || status === 'orphaned');
    if (isOrphaned && status !== 'planned') {
      status = 'orphaned';
    }

    const subLower = String(subjectName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isHomeroom = subLower.includes('direccion de grupo') || subLower.includes('dirección de grupo');

    return {
      id: classId,
      teacherId: tid,
      sequenceId: incoming.sequenceId || existing?.sequenceId || null,
      scheduleSlotId: incoming.scheduleSlotId || existing?.scheduleSlotId || null,
      date: date, // INMUTABLE
      dayOfWeek: incoming.dayOfWeek || existing?.dayOfWeek || '',
      startTime: incoming.startTime || existing?.startTime || '',
      endTime: incoming.endTime || existing?.endTime || '',
      time: incoming.time || existing?.time || '',
      subjectId: incoming.subjectId || existing?.subjectId || this._slugify(subjectName),
      subjectName: subjectName,
      gradeId: incoming.gradeId || existing?.gradeId || this._slugify(gradeName),
      gradeName: gradeName,
      group: group,
      period: period,
      sequenceNumber: sequenceNumber, // PERMANENTE E INMUTABLE
      status: status,
      subjectType: isHomeroom ? 'homeroom' : (incoming.subjectType || existing?.subjectType || 'academic'),
      curriculum: curriculum,
      didacticSequence: didacticSequence,
      teacherNotebook: teacherNotebook,
      pedagogy: pedagogy, // Espejo de compatibilidad
      observations: resolvedObservations,
      notebookContent: teacherNotebook.studentNotebookContent || incoming.notebookContent || existing?.notebookContent || '', // Espejo de compatibilidad
      legacyData: incoming.legacyData || existing?.legacyData || null,
      attachments: Array.isArray(incoming.attachments) ? incoming.attachments : (existing?.attachments || []),
      isOrphaned: isOrphaned,
      // Propiedades de compatibilidad para exportación legacy
      description: incoming.description
        ? incoming.description
            .replace(/(?:Recursos\s+did[aá]cticos?\s*:\s*(?:Y\s+)?MATERIALES|Recursos\s+did[aá]cticos?\s+y\s+materiales\s*:?)/gi, 'Recursos didácticos y materiales:')
            .replace(/(?:Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*:\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE|Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*y\s+actividades\s+extraclase\s*:?)/gi, 'Tareas / Compromisos:')
        : this._formatLegacyDescription(didacticSequence),
      topic: curriculum.topic,
      dba: curriculum.dba,
      achievement: curriculum.achievement,
      dayNumber: String(sequenceNumber),
      subject: subjectName,
      grade: gradeName,
      version: nextVersion,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
  }

  _formatLegacyDescription(pedagogy) {
    const parts = [];
    if (pedagogy.inicio && pedagogy.inicio.trim()) {
      parts.push(`FASE DE INICIO:\n${pedagogy.inicio.trim()}`);
    }
    if (pedagogy.desarrollo && pedagogy.desarrollo.trim()) {
      parts.push(`FASE DE DESARROLLO:\n${pedagogy.desarrollo.trim()}`);
    }
    if (pedagogy.cierre && pedagogy.cierre.trim()) {
      parts.push(`FASE DE CIERRE:\n${pedagogy.cierre.trim()}`);
    }
    if (pedagogy.recursos && pedagogy.recursos.trim()) {
      parts.push(`Recursos didácticos y materiales:\n${pedagogy.recursos.trim()}`);
    }
    const evalText = pedagogy.evaluation || pedagogy.evaluacion;
    if (evalText && evalText.trim()) {
      parts.push(`Evaluación:\n${evalText.trim()}`);
    }
    if (pedagogy.tareas && pedagogy.tareas.trim()) {
      parts.push(`Tareas / Compromisos:\n${pedagogy.tareas.trim()}`);
    }
    return parts.join('\n\n');
  }

  /**
   * Determina la completitud pedagógica de una sesión de clase (Req. 49, 50)
   * Informa qué secciones existen sin modificar el sequenceNumber.
   */
  getPlanningCompleteness(classSession) {
    if (!classSession) {
      return { percentage: 0, isComplete: false, flags: {}, missing: ['Sesión no existe'] };
    }

    const cur = classSession.curriculum || {};
    const ds = classSession.didacticSequence || classSession.pedagogy || {};
    const tn = classSession.teacherNotebook || {};

    const flags = {
      curriculum: Boolean(this._hasRealContent(cur.topic)),
      dba: Boolean(this._hasRealContent(cur.dba)),
      achievement: Boolean(this._hasRealContent(cur.achievement)),
      inicio: Boolean(this._hasRealContent(ds.inicio)),
      desarrollo: Boolean(this._hasRealContent(ds.desarrollo)),
      cierre: Boolean(this._hasRealContent(ds.cierre)),
      recursos: Boolean(this._hasRealContent(ds.recursos)),
      evaluacion: Boolean(this._hasRealContent(ds.evaluation || ds.evaluacion)),
      tareas: Boolean(this._hasRealContent(ds.tareas)),
      teacherNotebook: Boolean(this._hasRealContent(tn.studentNotebookContent) || this._hasRealContent(tn.question) || this._hasRealContent(tn.practicalActivity))
    };

    const criteria = [
      { key: 'curriculum', label: 'Tema / Malla', weight: 20 },
      { key: 'inicio', label: 'Fase de Inicio', weight: 15 },
      { key: 'desarrollo', label: 'Fase de Desarrollo', weight: 25 },
      { key: 'cierre', label: 'Fase de Cierre', weight: 10 },
      { key: 'recursos', label: 'Recursos', weight: 5 },
      { key: 'evaluacion', label: 'Evaluación', weight: 10 },
      { key: 'tareas', label: 'Tareas / Compromisos', weight: 5 },
      { key: 'teacherNotebook', label: 'Cuaderno del Docente', weight: 10 }
    ];

    let score = 0;
    const missing = [];

    criteria.forEach(c => {
      if (flags[c.key]) {
        score += c.weight;
      } else {
        missing.push(c.label);
      }
    });

    const filledFields = Object.values(flags).filter(Boolean).length;
    const totalFields = Object.keys(flags).length;
    const isComplete = (score >= 80 && flags.curriculum && flags.desarrollo);

    return {
      percentage: Math.min(score, 100),
      percent: Math.min(score, 100),
      isComplete,
      filledFields,
      totalFields,
      flags,
      missing
    };
  }

  /**
   * Obtiene todas las clases con estado huérfano o desvinculadas de fecha
   */
  getOrphanedClasses(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    return Object.values(map).filter(c => c.status === 'orphaned' || c.isOrphaned || !c.date || c.date.trim() === '');
  }

  /**
   * Vincula una clase huérfana a una fecha y horario escolar
   */
  linkOrphanedClass(classId, date, slotId = null, teacherId = null) {
    if (!classId || !date) return false;
    const tid = teacherId || this._getCurrentTeacherId();
    const cls = this.getClass(classId, tid);
    if (!cls) return false;

    cls.date = date;
    cls.isOrphaned = false;
    if (slotId) cls.scheduleSlotId = slotId;
    cls.status = (cls.curriculum?.topic || cls.didacticSequence?.desarrollo) ? 'planned' : 'pending';

    return this.saveClass(cls, tid);
  }

  _slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'general';
  }

  /**
   * Crea una nueva clase sesión garantizando secuencia válida
   */
  createClass(classData, teacherId) {
    if (!classData) return null;
    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);

    const normalized = this._normalizeClassSession(classData, null);
    map[normalized.id] = normalized;

    this._persist(map, tid);
    this._broadcastSave(normalized);

    console.log(`[ClassRepository:CREATE_CLASS] ID: ${normalized.id} Sub: ${normalized.subjectName} Grd: ${normalized.gradeName} Seq: #${normalized.sequenceNumber} Date: ${normalized.date}`);
    return JSON.parse(JSON.stringify(normalized));
  }

  /**
   * Guarda o actualiza atómicamente una clase. Afecta ÚNICAMENTE a esa clase.
   */
  saveClass(classData, teacherId, options = {}) {
    if (!classData) {
      console.error('[ClassRepository] Error: Intento de guardar clase vacía o inválida (Req. 68)');
      return null;
    }

    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);

    const classId = classData.id || classData.classId;
    const existing = classId ? map[classId] : null;

    // Validación obligatoria anti-destrucción
    if (!classId && !classData.subject && !classData.subjectName) {
      console.error('[ClassRepository] Rechazo de guardado: Faltan identificadores clave');
      return null;
    }

    const normalized = this._normalizeClassSession(classData, existing);

    // Guardar snapshot previo de seguridad
    if (existing) {
      this._saveSnapshot(tid, `class_${normalized.id}_v${existing.version}`, existing);
    }

    map[normalized.id] = normalized;
    this._persist(map, tid);
    this._broadcastSave(normalized);

    console.log(`[ClassRepository:UPDATE_CLASS] ID: ${normalized.id} Sub: ${normalized.subjectName} Grd: ${normalized.gradeName} Seq: #${normalized.sequenceNumber} v: ${normalized.version}`);
    return JSON.parse(JSON.stringify(normalized));
  }

  /**
   * Actualización parcial segura de una clase (Patch)
   */
  updateClass(classId, changes = {}, teacherId) {
    if (!classId) return null;
    const tid = teacherId || this._getCurrentTeacherId();
    const existing = this.getClass(classId, tid);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...changes,
      id: classId, // Inmutable
      date: existing.date, // Inmutable
      sequenceNumber: existing.sequenceNumber // Inmutable
    };

    return this.saveClass(merged, tid);
  }

  /**
   * Elimina una clase. NO renumera las clases restantes.
   */
  deleteClass(classId, teacherId) {
    if (!classId) return false;
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    const existing = map[classId];
    if (!existing) return false;

    // Snapshot previo de seguridad
    this._saveSnapshot(tid, `delete_class_${classId}`, existing);

    delete map[classId];
    this._persist(map, tid);

    if (this._channel) {
      try {
        this._channel.postMessage({
          type: 'CLASS_DELETED',
          classId: classId,
          teacherId: tid,
          date: existing.date,
          sourceTabId: this._tabId
        });
      } catch (e) {}
    }

    console.log(`[ClassRepository:DELETE_CLASS] Eliminada clase ${classId} (Seq: #${existing.sequenceNumber}). Las demás clases permanecen inmutables.`);
    return true;
  }

  /**
   * Duplica una clase como una NUEVA entidad independiente (Req. 14, 47)
   * - Copia contenido pedagógico, recursos, evaluación.
   * - Genera nuevo ID estable.
   * - Asigna nueva fecha si corresponde.
   * - Asigna nuevo sequenceNumber (max + 1).
   * - Establece nueva versión (1) y timestamps.
   * - Rompe 100% cualquier vínculo de edición con la clase original.
   */
  duplicateClass(classId, options = {}, teacherId) {
    const original = this.getClass(classId, teacherId);
    if (!original) return null;

    const targetDate = options.targetDate || original.date;
    const targetGroup = options.targetGroup || original.group;
    const targetGrade = options.targetGrade || original.gradeName;

    // Copia profunda estricta para romper cualquier referencia mutable compartida
    const clonedCurriculum = JSON.parse(JSON.stringify(original.curriculum || {}));
    const clonedPedagogy = JSON.parse(JSON.stringify(original.pedagogy || {}));
    const clonedAttachments = Array.isArray(original.attachments)
      ? JSON.parse(JSON.stringify(original.attachments))
      : [];

    const newSeqNum = this.getNextSequenceNumber({
      teacherId: teacherId || original.teacherId,
      period: options.period || original.period,
      subject: original.subjectName,
      grade: targetGrade,
      group: targetGroup
    });

    const newClassData = {
      id: this.generateClassId('cls'),
      teacherId: teacherId || original.teacherId,
      date: targetDate,
      startTime: options.startTime || original.startTime,
      endTime: options.endTime || original.endTime,
      time: options.time || original.time,
      subjectId: original.subjectId,
      subjectName: original.subjectName,
      gradeId: this._slugify(targetGrade),
      gradeName: targetGrade,
      group: targetGroup,
      period: options.period || original.period,
      sequenceNumber: newSeqNum, // Nuevo consecutivo único
      status: 'planned',
      subjectType: original.subjectType || 'academic',
      curriculum: clonedCurriculum,
      pedagogy: clonedPedagogy,
      observations: original.observations || '',
      notebookContent: original.notebookContent || '',
      attachments: clonedAttachments,
      version: 1
    };

    console.log(`[ClassRepository:DUPLICATE_CLASS] Creada clase ${newClassData.id} (#${newSeqNum}) a partir de ${classId} (#${original.sequenceNumber}). Vínculos rotos.`);
    return this.createClass(newClassData, teacherId);
  }

  _broadcastSave(classSession) {
    if (this._channel) {
      try {
        this._channel.postMessage({
          type: 'CLASS_SAVED',
          classSession: classSession,
          sourceTabId: this._tabId
        });
      } catch (e) {}
    }
  }

  _persist(sessionsMap, teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    this._cache[tid] = sessionsMap;
    const key = this.getStorageKey(tid);

    // 1. LocalStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(sessionsMap));
      }
    } catch (e) {
      console.warn('[ClassRepository] LocalStorage lleno. Se asegura en IndexedDB.');
    }

    // 2. IndexedDB
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, sessionsMap).catch(() => {});
    }

    // 3. Sincronización con PlanRepository en modo espejo para compatibilidad con vistas legacy
    this._syncLegacyPlanMirror(sessionsMap, tid);
  }

  _syncLegacyPlanMirror(sessionsMap, teacherId) {
    try {
      const plansByDate = {};
      Object.values(sessionsMap).forEach(cls => {
        const d = cls.date;
        if (!plansByDate[d]) {
          plansByDate[d] = {
            id: 'plan_' + teacherId + '_' + d,
            teacherId: teacherId,
            date: d,
            period: cls.period || '1°',
            version: 1,
            classes: [],
            attachments: [],
            generalNotes: ''
          };
        }
        plansByDate[d].classes.push({
          id: cls.id,
          classId: cls.id,
          date: cls.date,
          dayNumber: String(cls.sequenceNumber),
          sequenceNumber: cls.sequenceNumber,
          dayOfWeek: cls.dayOfWeek,
          startTime: cls.startTime,
          endTime: cls.endTime,
          time: cls.time,
          subject: cls.subjectName,
          subjectName: cls.subjectName,
          grade: cls.gradeName,
          gradeName: cls.gradeName,
          group: cls.group,
          period: cls.period || '1°',
          status: cls.status,
          dba: cls.curriculum?.dba || '',
          achievement: cls.curriculum?.achievement || '',
          topic: cls.curriculum?.topic || '',
          curriculum: cls.curriculum,
          didacticSequence: cls.didacticSequence,
          pedagogy: cls.pedagogy,
          teacherNotebook: cls.teacherNotebook,
          description: cls.description || '',
          observations: cls.observations || '',
          notebookContent: cls.notebookContent || cls.teacherNotebook?.studentNotebookContent || '',
          attachments: cls.attachments || [],
          version: cls.version || 1
        });
      });

      // Actualizar localStorage v3 para que herramientas legacy o tests sigan leyendo
      const legacyKey = 'teacher_planner_plans_' + teacherId + '_v3';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(legacyKey, JSON.stringify(plansByDate));
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        IDBStorage.set(legacyKey, plansByDate).catch(() => {});
      }
    } catch (e) {}
  }

  _saveSnapshot(teacherId, label, data) {
    try {
      const snapKey = `snapshot_${teacherId}_${label}`;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(snapKey, JSON.stringify({
          timestamp: new Date().toISOString(),
          label,
          data
        }));
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        IDBStorage.set(snapKey, data).catch(() => {});
      }
    } catch (e) {}
  }

  _cleanBrokenLinebreaks(text) {
    if (!text || typeof text !== 'string') return '';
    if (typeof window !== 'undefined' && window.ImportParser && typeof window.ImportParser.cleanBrokenLinebreaks === 'function') {
      return window.ImportParser.cleanBrokenLinebreaks(text);
    }
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Reparar "Criterios de" e "Instrumentos de" huérfanos sin la palabra "evaluación"
    clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
    clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

    // 2. Unir palabras clave partidas por salto de línea específicamente
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');

    // 3. Normalizar encabezados de subsección para que tengan dos puntos
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');

    // 4. Unir saltos de línea artificiales tras comas o punto y coma dentro de una misma idea/viñeta
    clean = clean.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ');

    // 5. Unir oraciones partidas tras preposiciones, artículos o conjunciones
    clean = clean.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, (match, prep, nextChar) => {
      const prefix = match.slice(0, match.indexOf(prep));
      return prefix + prep + ' ' + nextChar;
    });

    // 6. Unir líneas que terminan en palabra normal y la siguiente empieza con minúscula
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2');

    // 7. Unir líneas que terminan en texto y continúan con paréntesis explicativo en la línea siguiente
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2');

    // 8. Unir palabras con guión partidas por salto
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\s*-\s*\n\s*([a-záéíóúñA-ZÁÉÍÓÚÑ])/g, '$1-$2');

    // 9. Espaciado armónico antes de subsecciones
    clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    clean = clean.replace(/([^\n:]+:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');

    // 11. Normalizar saltos triples o excesivos
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  }

  _cleanClassText(cls) {
    if (!cls || typeof cls !== 'object') return cls;
    if (cls.curriculum) {
      if (typeof cls.curriculum.topic === 'string') cls.curriculum.topic = this._cleanBrokenLinebreaks(cls.curriculum.topic);
      if (typeof cls.curriculum.dba === 'string') cls.curriculum.dba = this._cleanBrokenLinebreaks(cls.curriculum.dba);
      if (typeof cls.curriculum.achievement === 'string') cls.curriculum.achievement = this._cleanBrokenLinebreaks(cls.curriculum.achievement);
    }
    if (cls.didacticSequence) {
      if (typeof cls.didacticSequence.inicio === 'string') cls.didacticSequence.inicio = this._cleanBrokenLinebreaks(cls.didacticSequence.inicio);
      if (typeof cls.didacticSequence.desarrollo === 'string') cls.didacticSequence.desarrollo = this._cleanBrokenLinebreaks(cls.didacticSequence.desarrollo);
      if (typeof cls.didacticSequence.cierre === 'string') cls.didacticSequence.cierre = this._cleanBrokenLinebreaks(cls.didacticSequence.cierre);
      if (typeof cls.didacticSequence.recursos === 'string') cls.didacticSequence.recursos = this._cleanBrokenLinebreaks(cls.didacticSequence.recursos);
      if (typeof cls.didacticSequence.evaluation === 'string') cls.didacticSequence.evaluation = this._cleanBrokenLinebreaks(cls.didacticSequence.evaluation);
      if (typeof cls.didacticSequence.tareas === 'string') cls.didacticSequence.tareas = this._cleanBrokenLinebreaks(cls.didacticSequence.tareas);
    }
    if (cls.pedagogy) {
      if (typeof cls.pedagogy.inicio === 'string') cls.pedagogy.inicio = this._cleanBrokenLinebreaks(cls.pedagogy.inicio);
      if (typeof cls.pedagogy.desarrollo === 'string') cls.pedagogy.desarrollo = this._cleanBrokenLinebreaks(cls.pedagogy.desarrollo);
      if (typeof cls.pedagogy.cierre === 'string') cls.pedagogy.cierre = this._cleanBrokenLinebreaks(cls.pedagogy.cierre);
      if (typeof cls.pedagogy.recursos === 'string') cls.pedagogy.recursos = this._cleanBrokenLinebreaks(cls.pedagogy.recursos);
      if (typeof cls.pedagogy.evaluation === 'string') cls.pedagogy.evaluation = this._cleanBrokenLinebreaks(cls.pedagogy.evaluation);
      if (typeof cls.pedagogy.evaluacion === 'string') cls.pedagogy.evaluacion = this._cleanBrokenLinebreaks(cls.pedagogy.evaluacion);
      if (typeof cls.pedagogy.tareas === 'string') cls.pedagogy.tareas = this._cleanBrokenLinebreaks(cls.pedagogy.tareas);
    }
    if (cls.teacherNotebook) {
      if (typeof cls.teacherNotebook.question === 'string') cls.teacherNotebook.question = this._cleanBrokenLinebreaks(cls.teacherNotebook.question);
      if (typeof cls.teacherNotebook.dynamics === 'string') cls.teacherNotebook.dynamics = this._cleanBrokenLinebreaks(cls.teacherNotebook.dynamics);
      if (typeof cls.teacherNotebook.studentNotebookContent === 'string') cls.teacherNotebook.studentNotebookContent = this._cleanBrokenLinebreaks(cls.teacherNotebook.studentNotebookContent);
      if (typeof cls.teacherNotebook.practicalActivity === 'string') cls.teacherNotebook.practicalActivity = this._cleanBrokenLinebreaks(cls.teacherNotebook.practicalActivity);
      if (typeof cls.teacherNotebook.detailedContent === 'string') cls.teacherNotebook.detailedContent = this._cleanBrokenLinebreaks(cls.teacherNotebook.detailedContent);
      if (typeof cls.teacherNotebook.additionalNotes === 'string') cls.teacherNotebook.additionalNotes = this._cleanBrokenLinebreaks(cls.teacherNotebook.additionalNotes);
    }
    if (typeof cls.description === 'string') cls.description = this._cleanBrokenLinebreaks(cls.description);
    if (typeof cls.observations === 'string') cls.observations = this._cleanBrokenLinebreaks(cls.observations);
    if (typeof cls.notebookContent === 'string') cls.notebookContent = this._cleanBrokenLinebreaks(cls.notebookContent);
    return cls;
  }
}

const ClassRepository = new ClassRepositoryClass();

if (typeof window !== 'undefined') {
  window.ClassRepository = ClassRepository;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassRepository;
}
