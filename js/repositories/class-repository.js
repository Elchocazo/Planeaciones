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
    this._sequenceIndex = {}; // `${tid}_${per}_${sub}_${grd}_${grp}` -> maxSequenceNumber (O(1))
    this._deletedClassSets = {}; // teacherId -> Set<classId> (tombstones de clases eliminadas)
    this._isInitialized = false;
    this._initPromise = null;
    this._setupChannel();
    // Hidratación sincrónica preventiva e inmediata desde LocalStorage para evitar parpadeos
    try {
      const tid = this._getCurrentTeacherId();
      this._hydrateSyncFromLocalStorage(tid);
    } catch (e) {}
  }

  _getDeletedClassIds(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (!this._deletedClassSets) {
      this._deletedClassSets = {};
    }
    if (!this._deletedClassSets[tid]) {
      this._deletedClassSets[tid] = new Set();
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_deleted_classes_' + tid);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach(id => {
                if (id) this._deletedClassSets[tid].add(String(id));
              });
            }
          }
        } catch (e) {}
      }
      if (typeof sessionStorage !== 'undefined') {
        try {
          const rawSes = sessionStorage.getItem('school_deleted_classes_' + tid);
          if (rawSes) {
            const listSes = JSON.parse(rawSes);
            if (Array.isArray(listSes)) {
              listSes.forEach(id => {
                if (id) this._deletedClassSets[tid].add(String(id));
              });
            }
          }
        } catch (eSes) {}
      }
    }
    return this._deletedClassSets[tid];
  }

  isDeletedClass(classId, teacherId) {
    if (!classId) return false;
    const tid = teacherId || this._getCurrentTeacherId();
    const set = this._getDeletedClassIds(tid);
    return set.has(String(classId));
  }

  markClassDeleted(classId, teacherId) {
    if (!classId) return;
    const tid = teacherId || this._getCurrentTeacherId();
    const set = this._getDeletedClassIds(tid);
    set.add(String(classId));
    const jsonStr = JSON.stringify(Array.from(set));
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('school_deleted_classes_' + tid, jsonStr);
      } catch (e) {}
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('school_deleted_classes_' + tid, jsonStr);
      } catch (e) {}
    }
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set('school_deleted_classes_' + tid, Array.from(set)).catch(() => {});
    }
  }

  unmarkClassDeleted(classId, teacherId) {
    if (!classId) return;
    const tid = teacherId || this._getCurrentTeacherId();
    const set = this._getDeletedClassIds(tid);
    set.delete(String(classId));
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('school_deleted_classes_' + tid, JSON.stringify(Array.from(set)));
      } catch (e) {}
    }
  }

  _hydrateSyncFromLocalStorage(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (!this._cache[tid]) this._cache[tid] = {};

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getStorageKey(tid));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            for (const id in parsed) {
              if (this.isDeletedClass(id, tid) || (parsed[id] && this.isDeletedClass(parsed[id].id, tid))) {
                delete parsed[id];
                continue;
              }
              parsed[id] = this._cleanClassText(parsed[id]);
            }
            this._cache[tid] = parsed;
          }
        }

        // Cascada por claves históricas para inmunidad ante bumping de versión (Regla 10)
        for (const legacyKey of this.getLegacyStorageKeys(tid)) {
          if (legacyKey === this.getStorageKey(tid)) continue;
          const rawLegacy = localStorage.getItem(legacyKey);
          if (rawLegacy) {
            try {
              const legacyParsed = JSON.parse(rawLegacy);
              if (legacyParsed && typeof legacyParsed === 'object') {
                for (const id in legacyParsed) {
                  if (this.isDeletedClass(id, tid)) continue;
                  if (!this._cache[tid][id]) {
                    this._cache[tid][id] = this._cleanClassText(legacyParsed[id]);
                  }
                }
              }
            } catch (eLeg) {}
          }
        }

        // Ingestión en cascada desde PlanRepository (teacher_planner_plans_*) para inmunidad absoluta
        const planKeys = [
          'teacher_planner_plans_' + tid + '_v3',
          'teacher_planner_plans_' + tid + '_v2',
          'teacher_planner_plans_' + tid + '_v1',
          'teacher_planner_plans_v1'
        ];
        for (const pKey of planKeys) {
          const rawPlan = localStorage.getItem(pKey);
          if (rawPlan) {
            try {
              const plansMap = JSON.parse(rawPlan);
              if (plansMap && typeof plansMap === 'object') {
                for (const d in plansMap) {
                  const dayPlan = plansMap[d];
                  if (dayPlan && Array.isArray(dayPlan.classes)) {
                    dayPlan.classes.forEach(c => {
                      if (!c) return;
                      const cId = c.id || c.classId;
                      if (cId && this.isDeletedClass(cId, tid)) return;
                      const existing = cId ? this._cache[tid][cId] : null;
                      const hasIncomingContent = this._hasRealContent(c.topic) || this._hasRealContent(c.description) || this._hasRealContent(c.notebookContent);
                      if (!existing && hasIncomingContent) {
                        const norm = this._normalizeClassSession({ ...c, date: c.date || d, planId: dayPlan.id || ('plan_' + d) }, null);
                        if (!this.isDeletedClass(norm.id, tid)) {
                          this._cache[tid][norm.id] = norm;
                        }
                      }
                    });
                  }
                }
              }
            } catch (ePlan) {}
          }
        }
      } catch (e) {}
    }
    this._seedInitialClassesIfMissing(tid);
    // Regla Arquitectónica: Saneamiento y realineación se postergan a init()
    // para no detonar escrituras prematuras antes de fusionar IndexedDB con LocalStorage.
  }

  _seedInitialClassesIfMissing(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (!this._cache[tid]) this._cache[tid] = {};

    let initialSeed = null;
    if (typeof window !== 'undefined' && Array.isArray(window.INITIAL_CLASSES_DATA)) {
      initialSeed = window.INITIAL_CLASSES_DATA;
    } else if (typeof INITIAL_CLASSES_DATA !== 'undefined' && Array.isArray(INITIAL_CLASSES_DATA)) {
      initialSeed = INITIAL_CLASSES_DATA;
    }

    if (initialSeed && Array.isArray(initialSeed) && initialSeed.length > 0) {
      let seedAdded = false;
      initialSeed.forEach(seedCls => {
        if (!seedCls || !seedCls.id) return;
        if (this.isDeletedClass(seedCls.id, tid)) return;

        // 1. Comprobar si ya existe por ID exacto
        let existing = this._cache[tid][seedCls.id];

        const sNorm = this._norm(seedCls.subjectName || seedCls.subject);
        const gNorm = this._normGrade(seedCls.gradeName || seedCls.grade);
        const seq = parseInt(seedCls.sequenceNumber, 10);

        // 2. Si no existe por ID exacto, buscar por fecha + materia + grado
        if (!existing && seedCls.date) {
          for (const cId in this._cache[tid]) {
            const c = this._cache[tid][cId];
            if (!c || this.isDeletedClass(cId, tid)) continue;
            if (c.date === seedCls.date &&
                this._norm(c.subjectName || c.subject) === sNorm &&
                this._normGrade(c.gradeName || c.grade) === gNorm) {
              existing = c;
              break;
            }
          }
        }

        // Regla 10: NUNCA alterar la fecha ni sobreescribir una clase que el docente ya creó con su propia fecha
        if (!existing) {
          this._cache[tid][seedCls.id] = this._cleanClassText(JSON.parse(JSON.stringify(seedCls)));
          seedAdded = true;
        } else {
          if (!existing.curriculum?.topic && seedCls.curriculum?.topic) {
            this._cache[tid][existing.id] = this._cleanClassText(JSON.parse(JSON.stringify(seedCls)));
            seedAdded = true;
          }
        }
      });
      if (seedAdded) {
        this._sequenceIndex = {};
        this._persist(this._cache[tid], tid);
        this._isInitialized = true;
        console.log(`✅ [ClassRepository] Semilla oficial inicial incorporada (${initialSeed.length} clases sincronizadas para ${tid})`);
      }
    }
  }

  _setupChannel() {
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
      try {
        this._channel = new BroadcastChannel('planeaciones_class_sync_v4');
        if (typeof this._channel.unref === 'function') {
          this._channel.unref();
        }
        this._channel.onmessage = (event) => this._handleBroadcast(event.data);
      } catch (e) {}
    }
  }

  _handleBroadcast(msg) {
    if (!msg || msg.sourceTabId === this._tabId) return;

    if (msg.type === 'CLASS_SAVED' && msg.classSession) {
      const cls = msg.classSession;
      const tid = cls.teacherId || this._getCurrentTeacherId();
      if (this.isDeletedClass(cls.id, tid)) return;
      if (!this._cache[tid]) this._cache[tid] = {};
      this._cache[tid][cls.id] = JSON.parse(JSON.stringify(cls));

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_remote_update', {
          detail: { classId: cls.id, date: cls.date, version: cls.version, sourceTabId: msg.sourceTabId }
        }));
      }
    } else if (msg.type === 'CLASS_DELETED' && msg.classId) {
      const tid = msg.teacherId || this._getCurrentTeacherId();
      this.markClassDeleted(msg.classId, tid);
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
      const uid = UserService.getCurrentUserId();
      if (uid === 'usr_coordinacion') return 'usr_manuel';
      return uid || 'usr_manuel';
    }
    if (typeof localStorage !== 'undefined') {
      const uid = localStorage.getItem('school_current_active_user_v2');
      if (uid === 'usr_coordinacion') return 'usr_manuel';
      return uid || 'usr_manuel';
    }
    return 'usr_manuel';
  }

  getStorageKey(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    return `teacher_class_sessions_${tid}_v4`;
  }

  getLegacyStorageKeys(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    return [
      `teacher_class_sessions_${tid}_v4`,
      `teacher_class_sessions_${tid}_v3`,
      `teacher_class_sessions_${tid}_v2`,
      `teacher_class_sessions_${tid}_v1`,
      `teacher_class_sessions_${tid}`
    ];
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

  _normGrade(grd) {
    return String(grd || '')
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^0-9a-z]/g, "");
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
   * Inicializa el repositorio cargando y reconciliando clases desde IndexedDB y LocalStorage
   * garantizando que ambas capas queden 100% sincronizadas y confirmadas.
   */
  async init(teacherId, options = {}) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._isInitialized && this._cache[tid] && !options.force) {
      return this._cache[tid];
    }
    if (this._initPromise && !options.force) return this._initPromise;

    this._initPromise = (async () => {
      // Pre-hidratación sincrónica preventiva en memoria
      if (!this._cache[tid] || Object.keys(this._cache[tid]).length === 0) {
        this._hydrateSyncFromLocalStorage(tid);
      }

      let sessionsMap = null;

      // 1. Cargar desde IndexedDB (capa principal de alta capacidad - Regla 10)
      if (typeof IDBStorage !== 'undefined' && IDBStorage.init) {
        try {
          await IDBStorage.init();
          sessionsMap = await IDBStorage.get(this.getStorageKey(tid));
          for (const legKey of this.getLegacyStorageKeys(tid)) {
            if (legKey === this.getStorageKey(tid)) continue;
            try {
              const legMap = await IDBStorage.get(legKey);
              if (legMap && typeof legMap === 'object') {
                if (!sessionsMap) sessionsMap = {};
                for (const id in legMap) {
                  if (!sessionsMap[id] && !this.isDeletedClass(id, tid)) {
                    sessionsMap[id] = legMap[id];
                  }
                }
              }
            } catch (eIdbLeg) {}
          }
        } catch (e) {
          console.warn('[ClassRepository] Aviso leyendo de IndexedDB en init:', e);
        }
      }

      // 2. Cargar desde LocalStorage (clave activa y claves históricas - Regla 10)
      const shouldPreferIncoming = (inc, exist) => {
        if (!exist) return true;
        if (!inc) return false;
        const incHasContent = Boolean(
          (inc.curriculum?.topic && String(inc.curriculum.topic).trim().length > 0 && String(inc.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
          (inc.topic && String(inc.topic).trim().length > 0 && String(inc.topic).trim() !== 'Sin tema planeado todavía') ||
          (inc.didacticSequence?.desarrollo && String(inc.didacticSequence.desarrollo).trim().length > 0) ||
          (inc.description && String(inc.description).trim().length > 0) ||
          (inc.notebookContent && String(inc.notebookContent).trim().length > 0)
        );
        const existHasContent = Boolean(
          (exist.curriculum?.topic && String(exist.curriculum.topic).trim().length > 0 && String(exist.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
          (exist.topic && String(exist.topic).trim().length > 0 && String(exist.topic).trim() !== 'Sin tema planeado todavía') ||
          (exist.didacticSequence?.desarrollo && String(exist.didacticSequence.desarrollo).trim().length > 0) ||
          (exist.description && String(exist.description).trim().length > 0) ||
          (exist.notebookContent && String(exist.notebookContent).trim().length > 0)
        );
        if (incHasContent && !existHasContent) return true;
        if (!incHasContent && existHasContent) return false;
        if ((inc.version || 0) > (exist.version || 0)) return true;
        if (inc.updatedAt && exist.updatedAt && inc.updatedAt > exist.updatedAt) return true;
        return false;
      };

      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(this.getStorageKey(tid));
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              if (!sessionsMap) sessionsMap = {};
              for (const id in parsed) {
                if (this.isDeletedClass(id, tid)) continue;
                if (!sessionsMap[id] || shouldPreferIncoming(parsed[id], sessionsMap[id])) {
                  sessionsMap[id] = parsed[id];
                }
              }
            }
          }
          for (const legKey of this.getLegacyStorageKeys(tid)) {
            if (legKey === this.getStorageKey(tid)) continue;
            const legRaw = localStorage.getItem(legKey);
            if (legRaw) {
              try {
                const legParsed = JSON.parse(legRaw);
                if (legParsed && typeof legParsed === 'object') {
                  if (!sessionsMap) sessionsMap = {};
                  for (const id in legParsed) {
                    if (this.isDeletedClass(id, tid)) continue;
                    if (!sessionsMap[id] || shouldPreferIncoming(legParsed[id], sessionsMap[id])) {
                      sessionsMap[id] = legParsed[id];
                    }
                  }
                }
              } catch (eLS) {}
            }
          }
        } catch (e) {}
      }

      // 3. Fusionar con cualquier clase existente en la caché de memoria
      if (this._cache[tid] && typeof this._cache[tid] === 'object') {
        if (!sessionsMap) sessionsMap = {};
        for (const id in this._cache[tid]) {
          if (this.isDeletedClass(id, tid)) continue;
          if (!sessionsMap[id] || shouldPreferIncoming(this._cache[tid][id], sessionsMap[id])) {
            sessionsMap[id] = this._cache[tid][id];
          }
        }
      }

      if (sessionsMap && typeof sessionsMap === 'object') {
        for (const id in sessionsMap) {
          if (this.isDeletedClass(id, tid) || (sessionsMap[id] && this.isDeletedClass(sessionsMap[id].id, tid))) {
            delete sessionsMap[id];
            continue;
          }
          sessionsMap[id] = this._cleanClassText(sessionsMap[id]);
        }
      } else {
        sessionsMap = {};
      }

      this._cache[tid] = sessionsMap;
      this._seedInitialClassesIfMissing(tid);
      this.cleanMismatchedGrade7Classes(tid);
      this.realignSequenceNumbersToSchedule(tid);
      this._isInitialized = true;

      // Volcado y confirmación en ambas capas de persistencia
      try {
        await this.flushPersist(tid);
      } catch (ePersist) {
        console.warn('[ClassRepository] Aviso en flush inicial tras reconciliación:', ePersist);
      }

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_cache_hydrated', { detail: { teacherId: tid } }));
      }

      return this._cache[tid];
    })();

    return this._initPromise;
  }

  /**
   * Determina si una clase está marcada como respaldo/snapshot/huérfana
   * y debe ser excluida de la visualización normal y conteo del calendario.
   */
  isBackupClass(cls) {
    if (!cls || typeof cls !== 'object') return false;

    // Regla 10: Si la clase tiene fecha válida y contenido real (tema, desarrollo o cuaderno),
    // NUNCA debe ser excluida ni ocultada como respaldo
    const hasValidDate = Boolean(cls.date && /^\d{4}-\d{2}-\d{2}$/.test(cls.date));
    const hasContent = Boolean(
      (cls.curriculum?.topic && String(cls.curriculum.topic).trim().length > 0 && String(cls.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
      (cls.topic && String(cls.topic).trim().length > 0 && String(cls.topic).trim() !== 'Sin tema planeado todavía') ||
      (cls.didacticSequence?.desarrollo && String(cls.didacticSequence.desarrollo).trim().length > 0) ||
      (cls.description && String(cls.description).trim().length > 0) ||
      (cls.notebookContent && String(cls.notebookContent).trim().length > 0)
    );
    if (hasValidDate && hasContent) {
      if (cls.status === 'orphaned') cls.status = 'planned';
      if (cls.isOrphaned) cls.isOrphaned = false;
      return false;
    }

    // 1. Estado o tipo explícito de respaldo o huérfana
    const statusLower = String(cls.status || '').toLowerCase().trim();
    if (statusLower === 'backup' || statusLower === 'respaldo' || statusLower === 'snapshot' || statusLower === 'orphaned') {
      return true;
    }
    if (cls.isOrphaned === true) {
      return true;
    }

    // 2. Banderas booleanas explícitas de respaldo
    if (cls.isBackup === true || cls.backup === true || cls.isSnapshot === true || cls.snapshot === true || cls.isRespaldo === true || cls.respaldo === true) {
      return true;
    }

    const typeLower = String(cls.type || cls.sourceType || cls.subjectType || '').toLowerCase().trim();
    if (typeLower === 'backup' || typeLower === 'respaldo' || typeLower === 'snapshot') {
      return true;
    }

    // 3. Identificador de clase generado explícitamente como backup o snapshot
    const idLower = String(cls.id || cls.classId || '').toLowerCase().trim();
    if (idLower.startsWith('backup_') || idLower.startsWith('snapshot_') || idLower.startsWith('cls_backup_') || idLower.startsWith('cls_snapshot_')) {
      return true;
    }

    // 4. Etiquetas (tags)
    if (Array.isArray(cls.tags)) {
      if (cls.tags.some(t => {
        const tl = String(t).toLowerCase().trim();
        return tl === 'backup' || tl === 'respaldo' || tl === 'snapshot';
      })) {
        return true;
      }
    }

    // 5. Texto en tema o título marcado explícitamente como respaldo
    const topic = String(cls.curriculum?.topic || cls.topic || cls.tema || '').toLowerCase();
    if (topic.includes('[respaldo]') || topic.includes('(respaldo)') || topic.startsWith('respaldo:')) {
      return true;
    }

    // 6. Volcado de respaldo crudo sin fecha o sin materia
    const sourceLower = String(cls._source || cls.source || '').toLowerCase().trim();
    if ((sourceLower.includes('backup') || sourceLower.includes('respaldo') || sourceLower.includes('snapshot')) && (!cls.date || (!cls.subjectName && !cls.subject))) {
      return true;
    }

    return false;
  }

  /**
   * Deduplica un arreglo de clases eliminando copias redundantes generadas por importaciones repetidas de respaldos
   */
  deduplicateClasses(classesList) {
    if (!Array.isArray(classesList) || classesList.length <= 1) return classesList || [];

    const map = new Map();

    const scoreClass = (c) => {
      let score = 0;
      if (this.isBackupClass(c)) score -= 1000;
      const topic = c.curriculum?.topic || c.topic || '';
      const desarrollo = c.didacticSequence?.desarrollo || c.pedagogy?.desarrollo || c.description || '';
      const notebook = c.teacherNotebook?.studentNotebookContent || c.notebookContent || '';
      if (topic && topic.trim()) score += 50;
      if (desarrollo && desarrollo.trim()) score += 100 + Math.min(desarrollo.length, 300);
      if (notebook && notebook.trim()) score += 100 + Math.min(notebook.length, 300);
      if (c.updatedAt) score += 10;
      if (c.version) score += Math.min(c.version, 20);
      return score;
    };

    classesList.forEach(cls => {
      if (!cls) return;
      const date = String(cls.date || '').trim();
      const sub = this._norm(cls.subjectName || cls.subject || '');
      const grd = this._norm(cls.gradeName || cls.grade || cls.group || '');
      const seq = cls.sequenceNumber || cls.consecutive || cls.dayNumber || 0;
      const time = String(cls.time || cls.startTime || '').trim();
      const slot = String(cls.scheduleSlotId || '').trim();
      
      // Clave lógica: fecha + materia + grado + (consecutivo si existe, o slot/hora)
      let key = `${date}__${sub}__${grd}`;
      if (seq && seq > 0) {
        key += `__seq_${seq}`;
      } else if (slot) {
        key += `__slot_${slot}`;
      } else if (time) {
        key += `__time_${time}`;
      } else {
        const topicNorm = this._norm(cls.curriculum?.topic || cls.topic || '');
        key += `__top_${topicNorm.slice(0, 30)}`;
      }

      if (!map.has(key)) {
        map.set(key, cls);
      } else {
        const existing = map.get(key);
        if (scoreClass(cls) > scoreClass(existing)) {
          map.set(key, cls);
        }
      }
    });

    return Array.from(map.values());
  }

  /**
   * Obtener mapa crudo sin filtros (para serialización interna)
   */
  _getAllMap(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) {
      return this._cache[tid];
    }
    this._hydrateSyncFromLocalStorage(tid);
    if (!this._cache[tid]) {
      this._cache[tid] = {};
    }
    return this._cache[tid];
  }

  /**
   * Obtiene una clase por su ID permanente
   */
  getClass(classId, teacherId) {
    if (!classId) return null;
    const tid = teacherId || this._getCurrentTeacherId();
    if (this.isDeletedClass(classId, tid)) return null;
    const map = this._getAllMap(tid);
    const cls = map[classId];
    return cls ? JSON.parse(JSON.stringify(cls)) : null;
  }

  /**
   * Obtiene todas las clases aplicando filtros opcionales (READ-ONLY)
   */
  getClasses(filters = {}, teacherId) {
    const tid = teacherId || filters.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    let classes = Object.values(map);

    // Filtrar por fecha exacta primero (comparación O(1) instantánea antes de evaluaciones costosas)
    if (filters.date) {
      classes = classes.filter(c => c && c.date === filters.date);
    }
    if (filters.startDate) {
      classes = classes.filter(c => c && c.date >= filters.startDate);
    }
    if (filters.endDate) {
      classes = classes.filter(c => c && c.date <= filters.endDate);
    }
    if (filters.sequenceId) {
      classes = classes.filter(c => c && c.sequenceId === filters.sequenceId);
    }
    if (filters.status) {
      classes = classes.filter(c => c && c.status === filters.status);
    }

    // Filtrar clases eliminadas (tombstone)
    classes = classes.filter(c => c && c.id && !this.isDeletedClass(c.id, tid));

    // Filtrar clases marcadas como respaldo por defecto salvo que se solicite includeBackups: true
    if (!filters.includeBackups) {
      classes = classes.filter(c => !this.isBackupClass(c));
    }

    if (filters.period) {
      const pNorm = this._norm(filters.period);
      classes = classes.filter(c => this._norm(c.period || '1°') === pNorm);
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

    // Deduplicar clases idénticas del mismo día salvo que se solicite includeDuplicates: true
    if (!filters.includeDuplicates) {
      classes = this.deduplicateClasses(classes);
    }

    // Retorno ultrarrápido con shallow copy (evita JSON.stringify masivo de 70 clases pesadas)
    return classes.map(c => ({ ...c }));
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
    const tid = teacherId || this._getCurrentTeacherId();
    let classes = this.getClasses({ date: dateStr }, tid);

    // Salvaguarda: si ClassRepository no tiene clases o tiene menos que PlanRepository
    let plan = null;
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getPlan) {
      plan = PlanRepository.getPlan(tid, dateStr);
    }
    if (plan && Array.isArray(plan.classes) && plan.classes.length > 0) {
      let updated = false;
      plan.classes.forEach(c => {
        if (!c) return;
        const cId = c.id || c.classId;
        const existing = classes.find(ec => ec.id === cId || (ec.subjectName === (c.subject || c.subjectName) && ec.gradeName === (c.grade || c.gradeName)));
        const hasContent = this._hasRealContent(c.topic) || this._hasRealContent(c.description) || this._hasRealContent(c.notebookContent);
        if ((!existing && hasContent) || (existing && !this._hasRealContent(existing.curriculum?.topic) && hasContent)) {
          const norm = this._normalizeClassSession({ ...c, date: c.date || dateStr, planId: plan.id || ('plan_' + dateStr) }, existing || null);
          if (!this.isDeletedClass(norm.id, tid)) {
            if (!this._cache[tid]) this._cache[tid] = {};
            this._cache[tid][norm.id] = norm;
            if (!existing) {
              classes.push(norm);
            } else {
              const idx = classes.findIndex(ec => ec.id === existing.id);
              if (idx >= 0) classes[idx] = norm;
            }
            updated = true;
          }
        }
      });
      if (updated) {
        try {
          this._persist(this._cache[tid], tid);
        } catch (eP) {}
      }
    }

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
      const trimmed = scopeOrPeriod.trim();
      const isPeriod = /^[1-4](°|o|\.º|\.o)?$/i.test(trimmed);
      if (!isPeriod && subject) {
        return {
          period: grade || '1°',
          subject: scopeOrPeriod,
          grade: subject,
          group: groupOrTeacherId || subject,
          teacherId: teacherId
        };
      }
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
   * Utiliza un índice asociativo en memoria para responder en tiempo constante O(1).
   * Esto garantiza la preservación histórica: jamás renumera hacia abajo.
   * Consecutividad pedagógica estricta por materia y curso (Req. 8, 9, 10).
   */
  getMaxSequenceNumber(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    const scope = this._normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId);
    const tid = scope.teacherId || this._getCurrentTeacherId();
    const targetSub = this._norm(scope.subject || scope.subjectName);
    const targetGrd = this._normGrade(scope.grade || scope.gradeName);
    const targetGrp = this._normGrade(scope.group || scope.grade || scope.gradeName);
    const targetPer = this._norm(scope.period || '1°');

    // Salvaguarda obligatoria: Si no se provee asignatura o curso, jamás contaminar
    // con el número consecutivo más alto de otras materias (ej. Matemáticas 7° #15 -> #16)
    if (!targetSub || !targetGrd) {
      return 0;
    }

    const indexKey = `${tid}_${targetPer}_${targetSub}_${targetGrd}_${targetGrp}`;
    if (this._sequenceIndex && this._sequenceIndex[indexKey] !== undefined) {
      return this._sequenceIndex[indexKey];
    }

    const map = this._getAllMap(tid);
    const classes = Object.values(map);

    let maxNum = 0;
    classes.forEach(cls => {
      if (this.isDeletedClass(cls.id, tid)) return;
      if (this.isBackupClass(cls)) return;
      if (targetPer && this._norm(cls.period || '1°') !== targetPer) return;
      if (targetSub && this._norm(cls.subjectName || cls.subject) !== targetSub) return;
      if (targetGrd && this._normGrade(cls.gradeName || cls.grade) !== targetGrd) return;
      const clsGroup = cls.group || cls.gradeName || cls.grade;
      if (targetGrp && clsGroup && this._normGrade(clsGroup) !== targetGrp) return;

      const num = parseInt(cls.sequenceNumber, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });

    if (!this._sequenceIndex) this._sequenceIndex = {};
    this._sequenceIndex[indexKey] = maxNum;
    return maxNum;
  }

  _updateSequenceIndex(cls) {
    if (!cls) return;
    if (!this._sequenceIndex) this._sequenceIndex = {};
    const tid = cls.teacherId || this._getCurrentTeacherId();
    const targetSub = this._norm(cls.subjectName || cls.subject);
    const targetGrd = this._normGrade(cls.gradeName || cls.grade);
    const targetGrp = this._normGrade(cls.group || cls.gradeName || cls.grade);
    const targetPer = this._norm(cls.period || '1°');
    if (!targetSub || !targetGrd) return;
    const indexKey = `${tid}_${targetPer}_${targetSub}_${targetGrd}_${targetGrp}`;
    const num = parseInt(cls.sequenceNumber, 10);
    if (!isNaN(num)) {
      this._sequenceIndex[indexKey] = Math.max(this._sequenceIndex[indexKey] || 0, num);
    }
  }

  _normSubjectForSchedule(subject) {
    const s = this._norm(subject);
    if (s.includes('sistema') || s.includes('tecnolog') || s.includes('informat') || s.includes('computac')) return 'sistemas';
    if (s.includes('matemat') || s.includes('aritmet') || s.includes('geometr') || s.includes('algebr')) return 'matematicas';
    if (s.includes('robot')) return 'robotica';
    if (s.includes('logic')) return 'logica';
    if (s.includes('direccion') || s.includes('grupo') || s.includes('orientac')) return 'direccion de grupo';
    return s;
  }

  _isRecessOrNonSchoolDay(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    // Invariantes absolutos del calendario escolar oficial:
    // Días de inducción sin clases regulares de septiembre (2 al 4 de septiembre de 2026):
    // Únicamente hubo clase de Matemáticas 7° el martes 1 de septiembre; el resto de la semana no hubo clases.
    if (dateStr >= '2026-09-02' && dateStr <= '2026-09-04') return true;
    // Semana de receso institucional de octubre: 5 al 9 de octubre de 2026
    if (dateStr >= '2026-10-05' && dateStr <= '2026-10-09') return true;
    // Vacaciones de fin de año: 11 de diciembre de 2026 al 11 de enero de 2027
    if (dateStr >= '2026-12-11' && dateStr <= '2027-01-11') return true;
    // Semana Santa 2027: 21 al 28 de marzo de 2027
    if (dateStr >= '2027-03-21' && dateStr <= '2027-03-28') return true;
    // Festivos oficiales de Colombia 2026
    const holidays2026 = new Set([
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
      '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
      '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
      '2026-11-16', '2026-12-08', '2026-12-25'
    ]);
    if (holidays2026.has(dateStr)) return true;

    // Consultar HolidayService para festivos dinámicos de cualquier año o eventos adicionales
    if (typeof HolidayService !== 'undefined' && typeof HolidayService.isRecessOrNonSchoolDay === 'function') {
      try {
        const rec = HolidayService.isRecessOrNonSchoolDay(dateStr);
        if (rec && rec.isRecess) return true;
      } catch (e) {}
    }
    return false;
  }

  clearScheduleSequenceCache() {
    this._schedSeqCache = {};
    this._weekdaysCache = {};
  }

  _getScheduledWeekdays(subject, grade, teacherId) {
    const subNorm = this._normSubjectForSchedule(subject);
    const grdNorm = this._normGrade(grade);
    if (!subNorm || !grdNorm) return null;

    const tid = teacherId || this._getCurrentTeacherId();
    const cacheKey = `${tid}|${subNorm}|${grdNorm}`;
    if (this._weekdaysCache && this._weekdaysCache[cacheKey]) {
      return this._weekdaysCache[cacheKey];
    }

    const weekdays = new Set();

    // 1. Consultar ScheduleRepository en memoria o localStorage sin mutar almacenamiento
    if (typeof ScheduleRepository !== 'undefined') {
      try {
        let slots = (ScheduleRepository._cache && ScheduleRepository._cache[tid]) || null;
        if ((!slots || slots.length === 0) && typeof localStorage !== 'undefined' && ScheduleRepository.getStorageKey) {
          const raw = localStorage.getItem(ScheduleRepository.getStorageKey(tid));
          if (raw) {
            slots = JSON.parse(raw);
            if (Array.isArray(slots) && slots.length > 0 && ScheduleRepository._cache) {
              ScheduleRepository._cache[tid] = slots;
            }
          }
        }
        if (Array.isArray(slots) && slots.length > 0) {
          slots.forEach(s => {
            if (!s || s.active === false || !s.weekday) return;
            const sSub = this._normSubjectForSchedule(s.subjectName || s.subject);
            const sGrd = this._normGrade(s.gradeName || s.grade || s.group);
            if (sSub === subNorm && sGrd === grdNorm) {
              weekdays.add(Number(s.weekday));
            }
          });
        }
      } catch (e) {}
    }

    // 2. Respaldo garantizado desde el horario semanal oficial (DEFAULT_WEEKLY_SCHEDULE)
    if (weekdays.size === 0) {
      const defSched = (typeof StorageService !== 'undefined' && StorageService.DEFAULT_WEEKLY_SCHEDULE)
        || (typeof window !== 'undefined' && window.DEFAULT_WEEKLY_SCHEDULE)
        || (typeof DEFAULT_WEEKLY_SCHEDULE !== 'undefined' ? DEFAULT_WEEKLY_SCHEDULE : null)
        || null;
      if (defSched && typeof defSched === 'object') {
        for (const [dayIdx, daySlots] of Object.entries(defSched)) {
          if (!Array.isArray(daySlots)) continue;
          for (const slot of daySlots) {
            if (!slot) continue;
            const sSub = this._normSubjectForSchedule(slot.subjectName || slot.subject);
            const sGrd = this._normGrade(slot.gradeName || slot.grade || slot.group);
            if (sSub === subNorm && sGrd === grdNorm) {
              weekdays.add(Number(dayIdx));
            }
          }
        }
      }
    }

    if (weekdays.size > 0) {
      if (!this._weekdaysCache) this._weekdaysCache = {};
      this._weekdaysCache[cacheKey] = weekdays;
      return weekdays;
    }
    return null;
  }

  /**
   * Calcula el número de clase exacto según el horario oficial del docente y el calendario escolar:
   * - Matemáticas 7°: Clase #1 inicia el 1 de septiembre de 2026 ('2026-09-01').
   * - El resto de asignaturas y grados (incluyendo Matemáticas 2°, Matemáticas 3°, Sistemas, Robótica, Lógica, Dirección de grupo):
   *   Clase #1 inicia desde el 7 de septiembre de 2026 ('2026-09-07') en adelante.
   * - Descuenta automáticamente festivos oficiales de Colombia y semanas de receso / vacaciones.
   */
  getScheduleSequenceNumber(dateStr, subject, grade, teacherId, options = {}) {
    if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const subNorm = this._normSubjectForSchedule(subject);
    const grdNorm = this._normGrade(grade);
    if (!subNorm || !grdNorm) return null;

    const tid = teacherId || this._getCurrentTeacherId();
    const reqFlag = options.requireScheduledWeekday ? '1' : '0';
    const seqCacheKey = `${tid}|${subNorm}|${grdNorm}|${dateStr}|${reqFlag}`;
    if (this._schedSeqCache && this._schedSeqCache[seqCacheKey] !== undefined) {
      return this._schedSeqCache[seqCacheKey];
    }

    const weekdays = this._getScheduledWeekdays(subject, grade, tid);
    if (!weekdays || weekdays.size === 0) return null;

    const startStr = (subNorm === 'matematicas' && grdNorm === '7') ? '2026-09-01' : '2026-09-07';
    if (dateStr < startStr) return null;

    const [ey, em, ed] = dateStr.split('-').map(Number);
    const end = new Date(ey, em - 1, ed);
    if (options.requireScheduledWeekday) {
      if (!weekdays.has(end.getDay()) || this._isRecessOrNonSchoolDay(dateStr)) {
        if (!this._schedSeqCache) this._schedSeqCache = {};
        this._schedSeqCache[seqCacheKey] = null;
        return null;
      }
    }

    const [sy, sm, sd] = startStr.split('-').map(Number);
    const cur = new Date(sy, sm - 1, sd);

    let count = 0;
    let steps = 0;
    while (cur <= end && steps < 400) {
      steps++;
      const wd = cur.getDay();
      if (weekdays.has(wd)) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        if (!this._isRecessOrNonSchoolDay(dStr)) {
          count++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    const result = count > 0 ? count : null;
    if (!this._schedSeqCache) this._schedSeqCache = {};
    this._schedSeqCache[seqCacheKey] = result;
    return result;
  }

  /**
   * Realinea la numeración (sequenceNumber y dayNumber) de todas las clases existentes
   * acorde estrictamente al horario del docente y al calendario escolar (1 de sept para Matemáticas 7°,
   * 7 de sept para todas las demás clases, descontando festivos y receso), preservando intacto todo el contenido.
   */
  realignSequenceNumbersToSchedule(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._cache[tid];
    if (!map || typeof map !== 'object') return 0;

    let realignedCount = 0;
    const realignedClasses = [];

    for (const cId in map) {
      const c = map[cId];
      if (!c || this.isDeletedClass(cId, tid) || this.isBackupClass(c)) continue;

      // Si la fecha cae en receso escolar o festivo y la clase está completamente vacía (sin tema ni contenido),
      // purgarla para evitar clases pendientes fantasma en días no lectivos
      if (c.date && this._isRecessOrNonSchoolDay(c.date)) {
        const hasTopic = Boolean((c.curriculum?.topic || c.topic || '').trim());
        const hasDesarrollo = Boolean((c.didacticSequence?.desarrollo || c.description || '').trim());
        const hasNotebook = Boolean((c.teacherNotebook?.studentNotebookContent || c.notebookContent || '').trim());
        if (!hasTopic && !hasDesarrollo && !hasNotebook) {
          delete map[cId];
          realignedCount++;
          continue;
        }
      }

      if (!c.period) {
        c.period = '1°';
        realignedCount++;
      }
      if (!c.date || !/^\d{4}-\d{2}-\d{2}$/.test(c.date)) continue;

      const expected = this.getScheduleSequenceNumber(
        c.date,
        c.subjectName || c.subject,
        c.gradeName || c.grade,
        tid,
        { requireScheduledWeekday: true }
      );

      if (expected !== null && expected > 0) {
        if (parseInt(c.sequenceNumber, 10) !== expected || String(c.dayNumber) !== String(expected)) {
          c.sequenceNumber = expected;
          c.dayNumber = String(expected);
          realignedCount++;
          realignedClasses.push(c);
        }
      }
    }

    if (realignedCount > 0) {
      this._sequenceIndex = {};
      this._persist(map, tid);
      realignedClasses.forEach(c => {
        try {
          this._syncToPlanRepository(c, tid);
        } catch (e) {}
      });
      console.log(`✅ [ClassRepository] Realineada numeración por horario oficial en ${realignedCount} clases (0 planeaciones alteradas en contenido).`);
    }

    return realignedCount;
  }

  /**
   * Saneamiento definitivo de clases intrusas en 7° (Regla 10):
   * - Elimina o reubica clases de Sistemas / Ofimática que se hayan colado erróneamente en Matemáticas 7°.
   * - Elimina clases de Matemáticas 7° asignadas a días Lunes (donde el docente tiene Sistemas 7° y Dir. Grupo).
   * - Registra sus IDs permanentemente en school_deleted_classes_ para blindaje anti-resurrección absoluto.
   */
  cleanMismatchedGrade7Classes(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    if (!map || typeof map !== 'object') return 0;

    let changed = false;
    let purgedCount = 0;

    const sistemasKeywords = [
      'procesadores de texto',
      'hojas de calculo',
      'presentaciones interactivas',
      'ofimatica',
      'word / docs',
      'sistema operativo windows',
      'partes del computador',
      'herramientas ofimaticas',
      'creacion y edicion de contenido digital',
      'reportaje en procesador de texto',
      'diseno editorial'
    ];

    const isSistemasTopic = (text) => {
      if (!text) return false;
      const norm = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sistemasKeywords.some(kw => norm.includes(kw));
    };

    Object.keys(map).forEach(id => {
      const c = map[id];
      if (!c) return;

      const sNorm = this._norm(c.subjectName || c.subject || '');
      const gNorm = this._normGrade(c.gradeName || c.grade || c.group || '');

      // Solo evaluamos grado 7°
      if (gNorm !== '7') return;

      const topicText = `${c.curriculum?.topic || ''} ${c.topic || ''} ${c.curriculum?.dba || ''} ${c.achievement || ''} ${c.didacticSequence?.desarrollo || ''}`;

      // CASO 1: Clase registrada como Matemáticas 7° pero con tema claro de Sistemas / Ofimática
      if (sNorm === 'matematicas' && isSistemasTopic(topicText)) {
        console.warn(`[ClassRepository] Detectada clase intrusa de Sistemas en Matemáticas 7°: ${c.id} (${c.date})`);

        // Comprobar si ya existe una clase legítima de Sistemas 7° en esa fecha o con ese tema
        const existingSistemas = Object.values(map).find(sc =>
          sc && sc.id !== c.id &&
          this._norm(sc.subjectName || sc.subject || '') === 'sistemas' &&
          this._normGrade(sc.gradeName || sc.grade || '') === '7' &&
          (sc.date === c.date || (sc.curriculum?.topic && c.curriculum?.topic && this._norm(sc.curriculum.topic) === this._norm(c.curriculum.topic)))
        );

        if (existingSistemas) {
          // Ya existe su contraparte legítima en Sistemas -> Purgar y tombstone en Matemáticas
          this.markClassDeleted(c.id, tid);
          delete map[id];
          purgedCount++;
          changed = true;
          if (c.date && typeof PlanRepository !== 'undefined' && PlanRepository.deleteClass) {
            PlanRepository.deleteClass(tid, c.date, c.id);
          }
        } else {
          // Reasignar la clase para que pertenezca limpiamente a Sistemas 7°
          c.subjectName = 'Sistemas';
          c.subject = 'Sistemas';
          c.subjectId = 'sistemas';
          c.time = '7:50 - 8:40';
          c.scheduleSlotId = 'slot_mu6xbshs_flstw6';
          changed = true;
        }
      }

      // CASO 2: Clases de Matemáticas 7° registradas en día Lunes
      // Manuel nunca dicta Matemáticas 7° los lunes (su horario los lunes es Dir. Grupo 7:00-7:50 y Sistemas 7:50-8:40)
      if (sNorm === 'matematicas' && c.date) {
        const parts = c.date.split('-').map(Number);
        if (parts.length === 3) {
          const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
          if (dObj.getDay() === 1) { // 1 = Lunes
            console.warn(`[ClassRepository] Eliminando clase errónea de Matemáticas 7° en día Lunes: ${c.id} (${c.date})`);
            this.markClassDeleted(c.id, tid);
            delete map[id];
            purgedCount++;
            changed = true;
            if (typeof PlanRepository !== 'undefined' && PlanRepository.deleteClass) {
              PlanRepository.deleteClass(tid, c.date, c.id);
            }
          }
        }
      }

      // CASO 3: Duplicados idénticos en Sistemas 7° para la misma fecha y tema
      if (sNorm === 'sistemas' && c.date) {
        const duplicates = Object.values(map).filter(sc =>
          sc && sc.id !== c.id &&
          this._norm(sc.subjectName || sc.subject || '') === 'sistemas' &&
          this._normGrade(sc.gradeName || sc.grade || '') === '7' &&
          sc.date === c.date
        );
        if (duplicates.length > 0) {
          duplicates.forEach(dup => {
            const isOfficialSeed = dup.id === 'cls_mu6xgnn9_d1wm71p';
            const cIsOfficialSeed = c.id === 'cls_mu6xgnn9_d1wm71p';
            if (!cIsOfficialSeed && isOfficialSeed) {
              this.markClassDeleted(c.id, tid);
              delete map[id];
              purgedCount++;
              changed = true;
            } else if (!isOfficialSeed && cIsOfficialSeed) {
              this.markClassDeleted(dup.id, tid);
              delete map[dup.id];
              purgedCount++;
              changed = true;
            }
          });
        }
      }
    });

    if (changed) {
      this._persist(map, tid);
      console.log(`[ClassRepository] cleanMismatchedGrade7Classes: Saneadas ${purgedCount} clases erróneas de 7°.`);
    }

    return purgedCount;
  }

  /**
   * Determina el siguiente número consecutivo para una nueva clase.
   * Si se proporciona fecha (scope.date) y corresponde al horario escolar, retorna el número exacto por horario.
   */
  getNextSequenceNumber(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    const scope = this._normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId);
    if (scope && scope.date) {
      const tid = scope.teacherId || this._getCurrentTeacherId();
      const schedSeq = this.getScheduleSequenceNumber(
        scope.date,
        scope.subject || scope.subjectName,
        scope.grade || scope.gradeName,
        tid
      );
      if (schedSeq !== null && schedSeq > 0) {
        return schedSeq;
      }
    }
    return this.getMaxSequenceNumber(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId) + 1;
  }

  /**
   * Normaliza y valida una entidad ClassSession completa antes de persistir
   */
  _normalizeClassSession(incoming, existing = null) {
    const tid = incoming.teacherId || existing?.teacherId || this._getCurrentTeacherId();
    const classId = incoming.id || existing?.id || this.generateClassId('cls');
    const explicitlyOrphaned = Boolean(
      incoming.isOrphaned === true ||
      incoming.status === 'orphaned' ||
      (incoming.date === '' && !existing?.date)
    );
    const date = explicitlyOrphaned
      ? (incoming.date || '')
      : (incoming.date || existing?.date || new Date().toISOString().slice(0, 10));
    const now = new Date().toISOString();

    const subjectName = incoming.subjectName || incoming.subject || existing?.subjectName || existing?.subject || '';
    const gradeName = incoming.gradeName || incoming.grade || existing?.gradeName || existing?.grade || '';
    const group = incoming.group || existing?.group || gradeName;
    const period = incoming.period || existing?.period || '1°';

    // sequenceNumber: PERMANENTE E INMUTABLE (Soporta esquemas v1-v5: sequenceNumber, consecutive, dayNumber)
    const rawSeq = incoming.sequenceNumber ?? incoming.consecutive ?? incoming.dayNumber;
    let sequenceNumber = rawSeq !== undefined && rawSeq !== null && !isNaN(parseInt(String(rawSeq).replace(/[^0-9]/g, ''), 10))
      ? parseInt(String(rawSeq).replace(/[^0-9]/g, ''), 10)
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

    // Limpiar saltos indebidos y artefactos en campos pedagógicos y curriculares
    if (typeof didacticSequence.inicio === 'string') didacticSequence.inicio = this._cleanField(didacticSequence.inicio);
    if (typeof didacticSequence.desarrollo === 'string') didacticSequence.desarrollo = this._cleanField(didacticSequence.desarrollo);
    if (typeof didacticSequence.cierre === 'string') didacticSequence.cierre = this._cleanField(didacticSequence.cierre);
    if (typeof didacticSequence.recursos === 'string') didacticSequence.recursos = this._cleanField(didacticSequence.recursos);
    if (typeof didacticSequence.evaluation === 'string') didacticSequence.evaluation = this._cleanField(didacticSequence.evaluation);
    if (typeof didacticSequence.tareas === 'string') didacticSequence.tareas = this._cleanField(didacticSequence.tareas);

    if (typeof curriculum.topic === 'string') curriculum.topic = this._cleanField(curriculum.topic);
    if (typeof curriculum.dba === 'string') curriculum.dba = this._cleanField(curriculum.dba);
    if (typeof curriculum.achievement === 'string') curriculum.achievement = this._cleanField(curriculum.achievement);

    if (typeof teacherNotebook.question === 'string') teacherNotebook.question = this._cleanField(teacherNotebook.question);
    if (typeof teacherNotebook.dynamics === 'string') teacherNotebook.dynamics = this._cleanField(teacherNotebook.dynamics);
    if (typeof teacherNotebook.studentNotebookContent === 'string') teacherNotebook.studentNotebookContent = this._cleanField(teacherNotebook.studentNotebookContent);
    if (typeof teacherNotebook.practicalActivity === 'string') teacherNotebook.practicalActivity = this._cleanField(teacherNotebook.practicalActivity);
    if (typeof teacherNotebook.detailedContent === 'string') teacherNotebook.detailedContent = this._cleanField(teacherNotebook.detailedContent);
    if (typeof teacherNotebook.additionalNotes === 'string') teacherNotebook.additionalNotes = this._cleanField(teacherNotebook.additionalNotes);

    const resolvedObservations = incoming.observations !== undefined 
      ? this._cleanField(incoming.observations) 
      : (incomingPedagogy.observaciones !== undefined 
          ? this._cleanField(incomingPedagogy.observaciones) 
          : (incomingDidactic.observaciones !== undefined 
              ? this._cleanField(incomingDidactic.observaciones) 
              : this._cleanField(existing?.observations ?? existingDidactic.observaciones ?? '')));

    // Espejo de compatibilidad para código existente (pedagogy)
    const pedagogy = {
      ...didacticSequence,
      evaluacion: didacticSequence.evaluation,
      observaciones: resolvedObservations
    };

    // Determinar estado de la clase
    const hasCurriculumTopic = Boolean((curriculum.topic && String(curriculum.topic).trim().length > 0 && String(curriculum.topic).trim() !== 'Sin tema planeado todavía') || (incoming.topic && String(incoming.topic).trim().length > 0 && String(incoming.topic).trim() !== 'Sin tema planeado todavía'));
    const hasPedagogyContent = this._hasRealContent(didacticSequence.inicio) || this._hasRealContent(didacticSequence.desarrollo) || this._hasRealContent(didacticSequence.cierre) || this._hasRealContent(teacherNotebook.studentNotebookContent) || this._hasRealContent(incoming.notebookContent);
    const hasAnyRealContent = hasCurriculumTopic || hasPedagogyContent;

    const isOrphaned = incoming.isOrphaned === false
      ? false
      : (!date || date.trim() === '' || incoming.isOrphaned === true || incoming.status === 'orphaned');
    let status = incoming.status;
    if (isOrphaned) {
      status = 'orphaned';
    } else if (hasAnyRealContent) {
      status = 'planned';
    } else if (!status || status === 'pending') {
      status = existing?.status || 'pending';
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
      notebookContent: incoming.notebookContent || teacherNotebook.studentNotebookContent || existing?.notebookContent || '', // Espejo de compatibilidad
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
  createClass(classData, teacherId, options = {}) {
    if (!classData) return null;
    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);

    const normalized = this._normalizeClassSession(classData, null);
    map[normalized.id] = normalized;

    this._persist(map, tid);
    this._broadcastSave(normalized);
    this._updateSequenceIndex(normalized);

    console.log(`[ClassRepository:CREATE_CLASS] ID: ${normalized.id} Sub: ${normalized.subjectName} Grd: ${normalized.gradeName} Seq: #${normalized.sequenceNumber} Date: ${normalized.date}`);

    // Sincronización bidireccional inmediata con PlanRepository para Calendario y Planeador Diario
    if (!options.isPlanSync && !options.isClassSync) {
      this._syncToPlanRepository(normalized, tid);
    }

    // Sincronizar o crear automáticamente la contraparte en cursos ligados (ej: Sistemas 1° <-> 2°, 4°A <-> 4°B)
    if (!options.isMirrorSync && !normalized._isMirrorDuplicate) {
      try {
        const mirrorCls = this.syncMirrorClass(normalized, tid);
        // Si no existía la clase espejo para este consecutivo/semana, crearla automáticamente con su respectivo día
        if (!mirrorCls) {
          const mirrorInfo = this.getMirrorGradeInfo(normalized.gradeName, normalized.group, normalized.subjectName || normalized.subject);
          if (mirrorInfo) {
            this.duplicateClassToMirror(normalized.id, tid);
          }
        }
      } catch (e) {
        console.warn('[ClassRepository] Error al sincronizar/crear clase espejo en createClass:', e);
      }
    }

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

    // Blindaje de Coordinación: Marisol Ruiz tiene permiso exclusivo de lectura y descargas
    if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
      return classData;
    }

    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);

    const classId = classData.id || classData.classId;

    // Blindaje anti-resurrección: Si la clase fue eliminada explícitamente y no se pide revivirla, ignorar
    if (classId && this.isDeletedClass(classId, tid) && !options.allowUndelete) {
      console.warn(`[ClassRepository:SAVE_CLASS] Ignorado guardado de clase eliminada (tombstone activo): ${classId}`);
      return null;
    }
    if (classId && options.allowUndelete) {
      this.unmarkClassDeleted(classId, tid);
    }

    const existing = classId ? map[classId] : null;

    // Validación obligatoria anti-destrucción
    if (!classId && !classData.subject && !classData.subjectName) {
      console.error('[ClassRepository] Rechazo de guardado: Faltan identificadores clave');
      return null;
    }

    const normalized = this._normalizeClassSession(classData, existing);

    // Salvaguarda canónica: Si el ID codificaba una fecha antigua pero la clase se está guardando para otra fecha,
    // respetar la fecha solicitada por el docente y desacoplar del ID viejo para no alterar la fecha
    const matchDateInId = normalized.id && normalized.id.match(/^cls_(\d{4})(\d{2})(\d{2})_/);
    if (matchDateInId) {
      const canonicalDate = `${matchDateInId[1]}-${matchDateInId[2]}-${matchDateInId[3]}`;
      if (normalized.date && normalized.date !== canonicalDate) {
        const newId = this.generateClassId('cls');
        normalized.id = newId;
      }
    }

    // Guardar snapshot previo de seguridad (historial acotado: se conservan las últimas
    // SNAPSHOT_HISTORY versiones por clase para no crecer indefinidamente en IndexedDB)
    if (existing) {
      this._saveSnapshot(tid, `class_${normalized.id}_v${existing.version}`, existing);
      const SNAPSHOT_HISTORY = 15;
      const staleVersion = Number(existing.version) - SNAPSHOT_HISTORY;
      if (staleVersion > 0 && typeof IDBStorage !== 'undefined' && typeof IDBStorage.delete === 'function') {
        IDBStorage.delete(`snapshot_${tid}_class_${normalized.id}_v${staleVersion}`).catch(() => {});
      }
    }

    map[normalized.id] = normalized;

    // Sincronización automática de clases ligadas / espejo (ej: 4°A <-> 4°B) antes de persistir para evitar doble JSON.stringify
    let syncedMirror = null;
    if (!options.isMirrorSync) {
      try {
        syncedMirror = this.syncMirrorClass(normalized, tid, { skipPersist: true, skipCloud: !!options.skipCloud });
      } catch (e) {
        console.warn('[ClassRepository] Error al sincronizar clase espejo:', e);
      }
    }

    this._persist(map, tid);
    this._broadcastSave(normalized);
    this._updateSequenceIndex(normalized);

    // Sincronización automática con Google Cloud Firestore
    // (skipCloud: datos que vienen de la nube no se reenvían, evitando escrituras eco y bucles con onSnapshot)
    if (!options.skipCloud && typeof FirestoreService !== 'undefined' && typeof FirestoreService.isReady === 'function' && FirestoreService.isReady()) {
      try {
        const clsRef = FirestoreService.db.collection('school_classes_v1').doc(`${tid}_${normalized.id}`);
        const p = JSON.parse(JSON.stringify(normalized));
        p.teacherId = tid;
        p.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
        clsRef.set(p, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    console.log(`[ClassRepository:UPDATE_CLASS] ID: ${normalized.id} Sub: ${normalized.subjectName} Grd: ${normalized.gradeName} Seq: #${normalized.sequenceNumber} v: ${normalized.version}`);

    // Sincronización bidireccional con PlanRepository para visibilidad garantizada en Calendario y Planeador Diario
    if (!options.isPlanSync && !options.isClassSync) {
      this._syncToPlanRepository(normalized, tid);
      if (syncedMirror) {
        this._syncToPlanRepository(syncedMirror, tid);
      }
    }

    return JSON.parse(JSON.stringify(normalized));
  }

  /**
   * Sincroniza una clase de ClassRepository con PlanRepository asegurando que exista en la fecha correspondiente.
   */
  _syncToPlanRepository(normalized, tid) {
    if (!normalized || !normalized.date) return;
    if (typeof PlanRepository === 'undefined' || typeof PlanRepository.getPlan !== 'function' || typeof PlanRepository.savePlan !== 'function') return;

    try {
      const planDate = normalized.date;
      const currentPlan = PlanRepository.getPlan(tid, planDate) || {
        id: `plan_${planDate.replace(/-/g, '')}`,
        teacherId: tid,
        date: planDate,
        period: normalized.period || '1°',
        classes: []
      };
      if (!Array.isArray(currentPlan.classes)) currentPlan.classes = [];
      const existingIdx = currentPlan.classes.findIndex(c => c && (c.id === normalized.id || c.classId === normalized.id));
      
      const planClassFormat = {
        id: normalized.id,
        classId: normalized.id,
        date: planDate,
        dayOfWeek: normalized.dayOfWeek || (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(planDate) : ''),
        dayNumber: String(normalized.sequenceNumber || normalized.dayNumber || 1),
        sequenceNumber: normalized.sequenceNumber || 1,
        time: normalized.time || '',
        startTime: normalized.startTime || '',
        endTime: normalized.endTime || '',
        scheduleSlotId: normalized.scheduleSlotId || null,
        subject: normalized.subjectName || normalized.subject || '',
        grade: normalized.gradeName || normalized.grade || '',
        group: normalized.group || normalized.gradeName || '',
        topic: normalized.curriculum?.topic || normalized.topic || '',
        dba: normalized.curriculum?.dba || normalized.dba || '',
        achievement: normalized.curriculum?.achievement || normalized.achievement || '',
        description: normalized.didacticSequence?.desarrollo || normalized.pedagogy?.desarrollo || (normalized.didacticSequence?.inicio ? `Inicio: ${normalized.didacticSequence.inicio}\n\nDesarrollo: ${normalized.didacticSequence.desarrollo || ''}\n\nCierre: ${normalized.didacticSequence.cierre || ''}` : (normalized.description || '')),
        observations: normalized.observations || normalized.didacticSequence?.observaciones || '',
        notebookContent: normalized.notebookContent || normalized.teacherNotebook?.studentNotebookContent || '',
        attachments: Array.isArray(normalized.attachments) ? normalized.attachments : [],
        curriculum: normalized.curriculum || null,
        didacticSequence: normalized.didacticSequence || normalized.pedagogy || null,
        pedagogy: normalized.pedagogy || normalized.didacticSequence || null,
        teacherNotebook: normalized.teacherNotebook || null,
        status: normalized.status || 'planned',
        version: normalized.version || 1
      };

      if (existingIdx >= 0) {
        currentPlan.classes[existingIdx] = { ...currentPlan.classes[existingIdx], ...planClassFormat };
      } else {
        currentPlan.classes.push(planClassFormat);
      }
      PlanRepository.savePlan(tid, planDate, currentPlan, { isClassSync: true, forceEmpty: true });
    } catch (e) {
      console.warn('[ClassRepository] Error al sincronizar clase con PlanRepository:', e);
    }
  }

  /**
   * Obtiene la especificación del grado paralelo espejo si aplica (ej: 4°A <-> 4°B, 4A <-> 4B)
   */
  getMirrorGradeInfo(gradeName, group, subjectName) {
    const sNorm = this._norm(subjectName || '');
    const isSistemas = sNorm.includes('sistema') || sNorm.includes('tecnolog') || sNorm.includes('informat');

    // 1. Caso especial: Sistemas / Tecnología 1° <-> 2°
    if (isSistemas) {
      const raw = String(group || gradeName || '').trim();
      const numMatch = raw.replace(/[^0-9]/g, '');
      if (numMatch === '1') {
        return {
          gradeNum: 'sis_1_2',
          currentSection: '1',
          targetSection: '2',
          targetGradeName: '2°',
          targetGroup: '2°',
          currentClean: '1',
          targetClean: '2',
          targetWeekday: 5, // Viernes
          targetTime: '7:50 - 8:40',
          isDifferentGrades: true
        };
      }
      if (numMatch === '2') {
        return {
          gradeNum: 'sis_1_2',
          currentSection: '2',
          targetSection: '1',
          targetGradeName: '1°',
          targetGroup: '1°',
          currentClean: '2',
          targetClean: '1',
          targetWeekday: 4, // Jueves
          targetTime: '10:10 - 11:00',
          isDifferentGrades: true
        };
      }
    }

    // 2. Grados con grupos A / B (ej: 4°A <-> 4°B)
    const raw = String(group || gradeName || '').trim();
    const clean = raw.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const match = clean.match(/^(\d+)([AB])$/);
    if (!match) return null;
    const gradeNum = match[1];
    const section = match[2];
    const targetSection = section === 'A' ? 'B' : 'A';
    return {
      gradeNum,
      currentSection: section,
      targetSection,
      targetGradeName: `${gradeNum}°${targetSection}`,
      targetGroup: `${gradeNum}${targetSection}`,
      currentClean: `${gradeNum}${section}`.toLowerCase(),
      targetClean: `${gradeNum}${targetSection}`.toLowerCase(),
      targetWeekday: targetSection === 'A' ? 5 : 4,
      targetTime: targetSection === 'A' ? '11:00 - 11:50' : '8:40 - 9:30',
      isDifferentGrades: false
    };
  }

  /**
   * Sincroniza el contenido pedagógico de una clase con su contraparte espejo (ej. 4°A <-> 4°B, Sistemas 1° <-> 2°)
   * Copia automáticamente el mismo contenido curricular y didáctico a la contraparte.
   */
  syncMirrorClass(sourceClass, teacherId, options = {}) {
    if (!sourceClass || !sourceClass.sequenceNumber) return null;
    const tid = teacherId || sourceClass.teacherId || this._getCurrentTeacherId();
    const mirrorInfo = this.getMirrorGradeInfo(sourceClass.gradeName, sourceClass.group, sourceClass.subjectName || sourceClass.subject);
    if (!mirrorInfo) return null;

    const hasContent = Boolean(
      (sourceClass.curriculum?.topic && String(sourceClass.curriculum.topic).trim().length > 0 && String(sourceClass.curriculum.topic).trim() !== 'Sin tema planeado todavía') ||
      (sourceClass.didacticSequence?.inicio && String(sourceClass.didacticSequence.inicio).trim().length > 0) ||
      (sourceClass.didacticSequence?.desarrollo && String(sourceClass.didacticSequence.desarrollo).trim().length > 0) ||
      (sourceClass.pedagogy?.inicio && String(sourceClass.pedagogy.inicio).trim().length > 0) ||
      (sourceClass.pedagogy?.desarrollo && String(sourceClass.pedagogy.desarrollo).trim().length > 0) ||
      (sourceClass.teacherNotebook?.studentNotebookContent && String(sourceClass.teacherNotebook.studentNotebookContent).trim().length > 0)
    );
    if (!hasContent) return null;

    const map = this._getAllMap(tid);
    const classes = Object.values(map);

    const sNorm = this._norm(sourceClass.subjectName || sourceClass.subject);
    const targetClean = mirrorInfo.targetClean || `${mirrorInfo.gradeNum}${mirrorInfo.targetSection}`.toLowerCase();
    const targetPer = this._norm(sourceClass.period || '1°');
    const targetSeq = parseInt(sourceClass.sequenceNumber, 10);

    const mirrorCls = classes.find(c => {
      if (this._norm(c.period) !== targetPer) return false;
      if (this._norm(c.subjectName || c.subject) !== sNorm) return false;
      const cCleanGrd = String(c.gradeName || c.grade || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const cCleanGrp = String(c.group || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const isMatch = (cCleanGrd === targetClean || cCleanGrp === targetClean);
      if (!isMatch) return false;
      return parseInt(c.sequenceNumber, 10) === targetSeq;
    });

    if (!mirrorCls) {
      return null;
    }

    // Copiar campos pedagógicos y curriculares intactos manteniendo fecha y horario propios del curso espejo
    mirrorCls.curriculum = JSON.parse(JSON.stringify(sourceClass.curriculum || {}));
    mirrorCls.didacticSequence = JSON.parse(JSON.stringify(sourceClass.didacticSequence || sourceClass.pedagogy || {}));
    mirrorCls.teacherNotebook = JSON.parse(JSON.stringify(sourceClass.teacherNotebook || {}));
    mirrorCls.pedagogy = JSON.parse(JSON.stringify(sourceClass.pedagogy || mirrorCls.didacticSequence));
    mirrorCls.notebookContent = sourceClass.notebookContent || mirrorCls.teacherNotebook?.studentNotebookContent || '';
    mirrorCls.description = sourceClass.description || '';
    mirrorCls.topic = sourceClass.topic || mirrorCls.curriculum?.topic || '';
    mirrorCls.dba = sourceClass.dba || mirrorCls.curriculum?.dba || '';
    mirrorCls.achievement = sourceClass.achievement || mirrorCls.curriculum?.achievement || '';

    if (Array.isArray(sourceClass.attachments)) {
      mirrorCls.attachments = JSON.parse(JSON.stringify(sourceClass.attachments));
    }

    mirrorCls.status = 'planned';
    mirrorCls.updatedAt = new Date().toISOString();

    map[mirrorCls.id] = mirrorCls;
    if (!options.skipPersist) {
      this._persist(map, tid);
    }
    this._broadcastSave(mirrorCls);

    if (!options.skipCloud && typeof FirestoreService !== 'undefined' && typeof FirestoreService.isReady === 'function' && FirestoreService.isReady()) {
      try {
        const clsRef = FirestoreService.db.collection('school_classes_v1').doc(`${tid}_${mirrorCls.id}`);
        const p = JSON.parse(JSON.stringify(mirrorCls));
        p.teacherId = tid;
        p.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
        clsRef.set(p, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    console.log(`[ClassRepository:SYNC_MIRROR] Sincronizada clase espejo ${mirrorCls.id} (${mirrorInfo.targetGradeName} #${targetSeq}) desde ${sourceClass.id} (${sourceClass.gradeName})`);
    return mirrorCls;
  }

  /**
   * Duplica una clase específica a su grado espejo (ej: duplicar Clase #1 de 4°B en 4°A, o Sistemas 1° en 2°)
   * Si ya existe la clase con ese consecutivo en el grado espejo, actualiza su contenido.
   * Si NO existe, la crea con el horario y fecha correspondientes a ese curso en la misma semana.
   */
  duplicateClassToMirror(classId, teacherId) {
    if (!classId) return null;
    const tid = teacherId || this._getCurrentTeacherId();
    const sourceClass = this.getClass(classId, tid);
    if (!sourceClass) return null;

    const mirrorInfo = this.getMirrorGradeInfo(sourceClass.gradeName, sourceClass.group, sourceClass.subjectName || sourceClass.subject);
    if (!mirrorInfo) return null;

    const map = this._getAllMap(tid);
    const classes = Object.values(map);
    const sNorm = this._norm(sourceClass.subjectName || sourceClass.subject);
    const targetClean = mirrorInfo.targetClean || `${mirrorInfo.gradeNum}${mirrorInfo.targetSection}`.toLowerCase();
    const targetPer = this._norm(sourceClass.period || '1°');
    const targetSeq = parseInt(sourceClass.sequenceNumber, 10);

    // Buscar si ya existe la clase en el grado espejo
    let targetClass = classes.find(c => {
      if (this._norm(c.period) !== targetPer) return false;
      if (this._norm(c.subjectName || c.subject) !== sNorm) return false;
      const cCleanGrd = String(c.gradeName || c.grade || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const cCleanGrp = String(c.group || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const isMatch = (cCleanGrd === targetClean || cCleanGrp === targetClean);
      if (!isMatch) return false;
      return parseInt(c.sequenceNumber, 10) === targetSeq;
    });

    if (targetClass) {
      // Actualizar contenido pedagógico existente
      targetClass.curriculum = JSON.parse(JSON.stringify(sourceClass.curriculum || {}));
      targetClass.didacticSequence = JSON.parse(JSON.stringify(sourceClass.didacticSequence || sourceClass.pedagogy || {}));
      targetClass.teacherNotebook = JSON.parse(JSON.stringify(sourceClass.teacherNotebook || {}));
      targetClass.pedagogy = JSON.parse(JSON.stringify(sourceClass.pedagogy || targetClass.didacticSequence));
      targetClass.notebookContent = sourceClass.notebookContent || targetClass.teacherNotebook?.studentNotebookContent || '';
      targetClass.description = sourceClass.description || '';
      targetClass.topic = sourceClass.topic || targetClass.curriculum?.topic || '';
      targetClass.dba = sourceClass.dba || targetClass.curriculum?.dba || '';
      targetClass.achievement = sourceClass.achievement || targetClass.curriculum?.achievement || '';
      if (Array.isArray(sourceClass.attachments)) {
        targetClass.attachments = JSON.parse(JSON.stringify(sourceClass.attachments));
      }
      targetClass.status = 'planned';
      targetClass.updatedAt = new Date().toISOString();

      map[targetClass.id] = targetClass;
      this._persist(map, tid);
      this._broadcastSave(targetClass);
      console.log(`[ClassRepository:DUPLICATE_MIRROR] Actualizada clase espejo existente ${targetClass.id} (${mirrorInfo.targetGradeName} #${targetSeq})`);
      return targetClass;
    }

    // Si NO existe en el grado espejo, calcular fecha y horario apropiados para crearla en esa misma semana
    let targetDate = sourceClass.date;
    let targetTime = mirrorInfo.targetTime || sourceClass.time || '';
    let targetStartTime = sourceClass.startTime || '';
    let targetEndTime = sourceClass.endTime || '';
    let targetSlotId = null;
    let targetWeekday = mirrorInfo.targetWeekday || null;

    if (typeof ScheduleRepository !== 'undefined') {
      const slots = ScheduleRepository.getSlotsByTeacher ? ScheduleRepository.getSlotsByTeacher(tid) : [];
      const mirrorSlot = slots.find(s => {
        if (this._norm(s.subjectName || s.subject) !== sNorm) return false;
        const sCleanGrd = String(s.gradeName || s.grade || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        const sCleanGrp = String(s.group || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        return (sCleanGrd === targetClean || sCleanGrp === targetClean);
      });

      if (mirrorSlot) {
        targetSlotId = mirrorSlot.id;
        targetTime = mirrorSlot.time || targetTime;
        targetStartTime = mirrorSlot.startTime || targetStartTime;
        targetEndTime = mirrorSlot.endTime || targetEndTime;
        if (mirrorSlot.weekday) {
          targetWeekday = mirrorSlot.weekday;
        }
      }
    }

    if (!targetStartTime && targetTime && targetTime.includes('-')) {
      const parts = targetTime.split('-').map(s => s.trim());
      targetStartTime = parts[0];
      targetEndTime = parts[1];
    }

    if (sourceClass.date && targetWeekday) {
      const dParts = sourceClass.date.split('-').map(Number);
      const origDate = new Date(dParts[0], dParts[1] - 1, dParts[2]);
      const currentDay = origDate.getDay() || 7; // 1=Lunes..7=Domingo
      const diffDays = targetWeekday - currentDay;
      const newDateObj = new Date(dParts[0], dParts[1] - 1, dParts[2] + diffDays);
      let y = newDateObj.getFullYear();
      let m = String(newDateObj.getMonth() + 1).padStart(2, '0');
      let d = String(newDateObj.getDate()).padStart(2, '0');
      targetDate = `${y}-${m}-${d}`;

      // Si cae en receso escolar o festivo, avanzar semanas hasta encontrar fecha lectiva activa
      let safetyCount = 0;
      while (this._isRecessOrNonSchoolDay(targetDate) && safetyCount < 10) {
        safetyCount++;
        newDateObj.setDate(newDateObj.getDate() + 7);
        y = newDateObj.getFullYear();
        m = String(newDateObj.getMonth() + 1).padStart(2, '0');
        d = String(newDateObj.getDate()).padStart(2, '0');
        targetDate = `${y}-${m}-${d}`;
      }
    }

    const newClassData = {
      id: this.generateClassId('cls'),
      teacherId: tid,
      scheduleSlotId: targetSlotId,
      date: targetDate,
      startTime: targetStartTime,
      endTime: targetEndTime,
      time: targetTime,
      subjectId: sourceClass.subjectId,
      subjectName: sourceClass.subjectName,
      gradeId: this._slugify(mirrorInfo.targetGradeName),
      gradeName: mirrorInfo.targetGradeName,
      group: mirrorInfo.targetGroup,
      period: sourceClass.period,
      sequenceNumber: targetSeq,
      status: sourceClass.status || 'planned',
      subjectType: sourceClass.subjectType || 'academic',
      curriculum: JSON.parse(JSON.stringify(sourceClass.curriculum || {})),
      didacticSequence: JSON.parse(JSON.stringify(sourceClass.didacticSequence || sourceClass.pedagogy || {})),
      pedagogy: JSON.parse(JSON.stringify(sourceClass.pedagogy || {})),
      teacherNotebook: JSON.parse(JSON.stringify(sourceClass.teacherNotebook || {})),
      notebookContent: sourceClass.notebookContent || '',
      description: sourceClass.description || '',
      topic: sourceClass.topic || '',
      dba: sourceClass.dba || '',
      achievement: sourceClass.achievement || '',
      attachments: Array.isArray(sourceClass.attachments) ? JSON.parse(JSON.stringify(sourceClass.attachments)) : [],
      observations: '',
      _isMirrorDuplicate: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = this.createClass(newClassData, tid, { isMirrorSync: true });
    console.log(`[ClassRepository:DUPLICATE_MIRROR] Creada nueva clase espejo ${created.id} (${mirrorInfo.targetGradeName} #${targetSeq}) para fecha ${targetDate}`);
    return created;
  }

  /**
   * Sincroniza bidireccionalmente todas las clases consecutivas de dos grados espejo (ej. 4°A y 4°B, Sistemas 1° y 2°).
   * Si falta una clase en uno de los grupos, la crea automáticamente.
   */
  syncAllMirrorClasses(subjectName, period = '1°', teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    const classes = Object.values(map);
    const sNorm = this._norm(subjectName);
    const targetPer = this._norm(period);

    let syncedCount = 0;
    const eligibleClasses = classes.filter(c => {
      if (this._norm(c.period) !== targetPer) return false;
      if (this._norm(c.subjectName || c.subject) !== sNorm) return false;
      return Boolean(this.getMirrorGradeInfo(c.gradeName, c.group, c.subjectName || c.subject));
    });

    const pairsMap = {};
    eligibleClasses.forEach(c => {
      const info = this.getMirrorGradeInfo(c.gradeName, c.group, c.subjectName || c.subject);
      if (!info) return;
      const seq = parseInt(c.sequenceNumber, 10);
      if (isNaN(seq)) return;
      const groupKey = info.isDifferentGrades ? 'sis12' : info.gradeNum;
      const key = `${groupKey}_${seq}`;
      if (!pairsMap[key]) pairsMap[key] = {};
      pairsMap[key][info.currentSection] = c;
    });

    Object.values(pairsMap).forEach(pair => {
      const clsA = pair['A'] || pair['1'];
      const clsB = pair['B'] || pair['2'];

      if (clsA && !clsB) {
        // Falta en la segunda sección -> duplicar de A a B
        const hasA = (clsA.status === 'planned' || clsA.status === 'completed') || Boolean(clsA.curriculum?.topic || clsA.didacticSequence?.desarrollo);
        if (hasA) {
          this.duplicateClassToMirror(clsA.id, tid);
          syncedCount++;
        }
      } else if (clsB && !clsA) {
        // Falta en la primera sección -> duplicar de B a A
        const hasB = (clsB.status === 'planned' || clsB.status === 'completed') || Boolean(clsB.curriculum?.topic || clsB.didacticSequence?.desarrollo);
        if (hasB) {
          this.duplicateClassToMirror(clsB.id, tid);
          syncedCount++;
        }
      } else if (clsA && clsB) {
        const hasA = (clsA.status === 'planned' || clsA.status === 'completed') && Boolean(clsA.curriculum?.topic || clsA.didacticSequence?.desarrollo);
        const hasB = (clsB.status === 'planned' || clsB.status === 'completed') && Boolean(clsB.curriculum?.topic || clsB.didacticSequence?.desarrollo);

        if (hasA && !hasB) {
          this.syncMirrorClass(clsA, tid);
          syncedCount++;
        } else if (hasB && !hasA) {
          this.syncMirrorClass(clsB, tid);
          syncedCount++;
        } else if (hasA && hasB) {
          const timeA = new Date(clsA.updatedAt || 0).getTime();
          const timeB = new Date(clsB.updatedAt || 0).getTime();
          if (timeA >= timeB) {
            this.syncMirrorClass(clsA, tid);
          } else {
            this.syncMirrorClass(clsB, tid);
          }
          syncedCount++;
        }
      }
    });

    return syncedCount;
  }

  /**
   * Reorganiza y reestructura automáticamente todos los cuadernos pedagógicos que se encuentren
   * en formato de párrafo monolítico colapsado a lo largo de todas las clases almacenadas.
   */
  reformatAllMonolithicNotebooks(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    const classes = Object.values(map);
    let reformattedCount = 0;

    const isMonolithic = (html) => {
      if (!html || typeof html !== 'string') return false;
      const pCount = (html.match(/<p\b/gi) || []).length;
      const plainTextLen = html.replace(/<[^>]+>/g, '').trim().length;
      return (pCount <= 2 && plainTextLen > 250) &&
        (/(?:TEMAS\s+DEL|DESEMPEÑOS?\s+DE|CRITERIOS?\s+DE|Fase\s+de|Eje\s+temático|Tiempo:)/i.test(html) || /(?:[A-ZÁÉÍÓÚÑ][^:\n]{2,40}:\s+){2,}/.test(html));
    };

    const reformat = (content) => {
      if (typeof ImportParser !== 'undefined' && typeof ImportParser.formatMarkdownToHtml === 'function') {
        return ImportParser.formatMarkdownToHtml(content);
      }
      if (typeof NotebookEditor !== 'undefined' && typeof NotebookEditor.formatNotebookHtml === 'function') {
        return NotebookEditor.formatNotebookHtml(content, true);
      }
      return content;
    };

    classes.forEach(cls => {
      let modified = false;

      if (cls.notebookContent && isMonolithic(cls.notebookContent)) {
        const formatted = reformat(cls.notebookContent);
        if (formatted && formatted !== cls.notebookContent) {
          cls.notebookContent = formatted;
          modified = true;
        }
      }

      if (cls.teacherNotebook?.studentNotebookContent && isMonolithic(cls.teacherNotebook.studentNotebookContent)) {
        const formatted = reformat(cls.teacherNotebook.studentNotebookContent);
        if (formatted && formatted !== cls.teacherNotebook.studentNotebookContent) {
          cls.teacherNotebook.studentNotebookContent = formatted;
          modified = true;
        }
      }

      if (modified) {
        map[cls.id] = cls;
        reformattedCount++;
        console.log(`[ClassRepository] Cuaderno reestructurado para clase #${cls.sequenceNumber || cls.id} (${cls.subjectName} ${cls.gradeName})`);
      }
    });

    if (reformattedCount > 0) {
      this._persist(map, tid);
      this._sequenceIndex = {};
    }

    console.log(`[ClassRepository] Total cuadernos reorganizados: ${reformattedCount}`);
    return reformattedCount;
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
   * Elimina una clase de forma definitiva y permanente. NO renumera las clases restantes.
   * Garantiza sincronización en cascada con PlanRepository, StorageService, IDB y Firestore.
   */
  deleteClass(classId, teacherId, fallbackOptions = {}) {
    if (!classId && !fallbackOptions.date) return false;

    // Blindaje de Coordinación: Prohibido eliminar clases en modo supervisión
    if (typeof UserService !== 'undefined' && UserService.isCoordinatorActive && UserService.isCoordinatorActive()) {
      return false;
    }

    const tid = teacherId || this._getCurrentTeacherId();
    const map = this._getAllMap(tid);
    let existing = classId ? map[classId] : null;
    let actualKey = classId;

    if (!existing && classId) {
      // Búsqueda flexible por si está indexado bajo otra clave o campo (id, classId, _id)
      const foundEntry = Object.entries(map).find(([k, v]) => 
        k === classId || 
        (v && (v.id === classId || v.classId === classId || String(v.id) === String(classId)))
      );
      if (foundEntry) {
        actualKey = foundEntry[0];
        existing = foundEntry[1];
      }
    }

    // Búsqueda de respaldo por metadatos (fecha, número de secuencia, materia, grado)
    if (!existing && fallbackOptions && fallbackOptions.date) {
      const targetDate = String(fallbackOptions.date).trim();
      const targetSeq = fallbackOptions.sequenceNumber ? parseInt(fallbackOptions.sequenceNumber, 10) : null;
      const targetSub = fallbackOptions.subjectName ? this._norm(fallbackOptions.subjectName) : null;
      const targetGrd = fallbackOptions.gradeName ? this._norm(fallbackOptions.gradeName) : null;

      const foundByMeta = Object.entries(map).find(([k, v]) => {
        if (!v || v.date !== targetDate) return false;
        if (targetSeq !== null) {
          const vSeq = parseInt(v.sequenceNumber, 10);
          if (!isNaN(vSeq) && vSeq !== targetSeq) return false;
        }
        if (targetSub) {
          const vSub = this._norm(v.subjectName || v.subject || '');
          if (vSub && vSub !== targetSub) return false;
        }
        if (targetGrd) {
          const vGrd = this._norm(v.gradeName || v.grade || v.group || '');
          if (vGrd && vGrd !== targetGrd) return false;
        }
        return true;
      });

      if (foundByMeta) {
        actualKey = foundByMeta[0];
        existing = foundByMeta[1];
        if (!classId) classId = existing.id || actualKey;
      }
    }

    // 1. Registrar siempre en la lista permanente de tombstones para impedir resurrecciones
    if (classId) this.markClassDeleted(classId, tid);
    if (actualKey && actualKey !== classId) {
      this.markClassDeleted(actualKey, tid);
    }
    if (existing && existing.id && existing.id !== classId) {
      this.markClassDeleted(existing.id, tid);
    }

    // 2. Snapshot previo de seguridad si existía
    if (existing) {
      this._saveSnapshot(tid, `delete_class_${classId || actualKey}`, existing);
    }

    let somethingDeleted = false;

    // 3. Eliminar de la memoria local map
    if (actualKey && map[actualKey]) {
      delete map[actualKey];
      somethingDeleted = true;
    }
    if (classId && map[classId]) {
      delete map[classId];
      somethingDeleted = true;
    }
    if (existing && existing.id && map[existing.id]) {
      delete map[existing.id];
      somethingDeleted = true;
    }

    // También limpiar cualquier duplicado fantasma del mismo día, materia, grado y secuencia o tema
    if (existing && existing.date) {
      const eDate = existing.date;
      const eSub = this._norm(existing.subjectName || existing.subject || '');
      const eGrd = this._norm(existing.gradeName || existing.grade || existing.group || '');
      const eSeq = parseInt(existing.sequenceNumber, 10);
      const eTime = String(existing.time || existing.startTime || '').trim();

      Object.entries(map).forEach(([k, v]) => {
        if (!v || v.date !== eDate) return;
        const vSub = this._norm(v.subjectName || v.subject || '');
        const vGrd = this._norm(v.gradeName || v.grade || v.group || '');
        if (eSub && vSub && eSub !== vSub) return;
        if (eGrd && vGrd && eGrd !== vGrd) return;

        const vSeq = parseInt(v.sequenceNumber, 10);
        const vTime = String(v.time || v.startTime || '').trim();

        const sameSeq = !isNaN(eSeq) && !isNaN(vSeq) && eSeq === vSeq;
        const sameTime = eTime && vTime && eTime === vTime;

        if (sameSeq || (sameTime && sameSeq)) {
          this.markClassDeleted(k, tid);
          if (v.id) this.markClassDeleted(v.id, tid);
          delete map[k];
          somethingDeleted = true;
        }
      });
    }

    this._persist(map, tid);
    this._sequenceIndex = {};

    const targetDate = existing?.date || fallbackOptions.date;

    // 4. Sincronizar eliminación en PlanRepository
    if (typeof PlanRepository !== 'undefined') {
      try {
        if (targetDate && typeof PlanRepository.deleteClass === 'function') {
          if (classId) PlanRepository.deleteClass(tid, targetDate, classId);
          if (existing?.id && existing.id !== classId) PlanRepository.deleteClass(tid, targetDate, existing.id);
        }
        if (typeof PlanRepository.getAllPlans === 'function') {
          const plans = PlanRepository.getAllPlans(tid) || {};
          Object.values(plans).forEach(p => {
            if (p && Array.isArray(p.classes)) {
              const hasIt = p.classes.some(c => c && (c.id === classId || c.classId === classId || (existing?.id && c.id === existing.id)));
              if (hasIt && p.date) {
                if (classId) PlanRepository.deleteClass(tid, p.date, classId);
                if (existing?.id) PlanRepository.deleteClass(tid, p.date, existing.id);
                somethingDeleted = true;
              }
            }
          });
        }
      } catch (eP) {
        console.warn('[ClassRepository] Error al sincronizar eliminación con PlanRepository:', eP);
      }
    }
    // 5. Sincronizar eliminación en StorageService
    if (targetDate && typeof StorageService !== 'undefined' && typeof StorageService.getPlan === 'function') {
      try {
        const plan = StorageService.getPlan(targetDate);
        if (plan && Array.isArray(plan.classes)) {
          const prevLen = plan.classes.length;
          plan.classes = plan.classes.filter(c => c.id !== classId && c.id !== existing?.id && c.classId !== classId);
          if (plan.classes.length !== prevLen) {
            StorageService.savePlan(targetDate, plan, true);
            somethingDeleted = true;
          }
        }
      } catch (eS) {}
    }

    // 6. Sincronizar eliminación en la nube con Cloud Firestore
    if (typeof FirestoreService !== 'undefined') {
      try {
        if (typeof FirestoreService.deleteClassFromCloud === 'function') {
          if (classId) FirestoreService.deleteClassFromCloud(tid, classId, targetDate);
          if (existing?.id && existing.id !== classId) {
            FirestoreService.deleteClassFromCloud(tid, existing.id, targetDate);
          }
        } else if (FirestoreService.isReady && FirestoreService.isReady()) {
          // Eliminar documento individual de school_classes_v1
          if (classId) FirestoreService.db.collection('school_classes_v1').doc(`${tid}_${classId}`).delete().catch(() => {});
          if (existing?.id && existing.id !== classId) {
            FirestoreService.db.collection('school_classes_v1').doc(`${tid}_${existing.id}`).delete().catch(() => {});
          }
          // Actualizar documento de plan del día en school_plans_v1
          if (targetDate) {
            const planRef = FirestoreService.db.collection(FirestoreService.COLLECTION_PATH).doc(`plan_${tid}_${targetDate}`);
            planRef.get().then(snap => {
              if (snap.exists) {
                const p = snap.data();
                if (Array.isArray(p.classes)) {
                  const filtered = p.classes.filter(c => c.id !== classId && c.id !== existing?.id && c.classId !== classId);
                  planRef.update({ classes: filtered, updatedAt: new Date().toISOString() }).catch(() => {});
                }
              }
            }).catch(() => {});
          }
        }
      } catch (eCloud) {
        console.warn('[ClassRepository] Error al sincronizar eliminación con Firestore:', eCloud);
      }
    }

    // 7. Notificar a pestañas hermanas por BroadcastChannel
    if (this._channel) {
      try {
        this._channel.postMessage({
          type: 'CLASS_DELETED',
          classId: classId,
          teacherId: tid,
          date: targetDate,
          sourceTabId: this._tabId
        });
      } catch (e) {}
    }

    // 8. Notificar a componentes locales de la UI
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('class_session_deleted', {
        detail: { classId: classId, teacherId: tid, date: targetDate }
      }));
    }

    console.log(`[ClassRepository:DELETE_CLASS] Eliminada clase ${classId || actualKey} (Seq: #${existing?.sequenceNumber || 'N/A'}).`);
    return somethingDeleted || Boolean(existing);
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
    if (!sessionsMap || typeof sessionsMap !== 'object') return;

    // Blindaje de Regla 10: Prohibición total de persistencia destructiva
    const currentCount = this._cache[tid] ? Object.keys(this._cache[tid]).length : 0;
    const incomingCount = Object.keys(sessionsMap).length;
    if (incomingCount === 0 && currentCount > 0) {
      console.warn(`[ClassRepository] Rechazo de persistencia destructiva (Regla 10): intento de sobreescribir ${currentCount} clases con mapa vacío.`);
      return;
    }

    // La caché en memoria se actualiza de inmediato (lecturas siempre frescas).
    this._cache[tid] = sessionsMap;

    // Regla 10: Escritura síncrona inmediata en LocalStorage para inmunidad ante recargas F5 o cierres intempestivos
    try {
      if (typeof localStorage !== 'undefined') {
        const key = this.getStorageKey(tid);
        localStorage.setItem(key, JSON.stringify(sessionsMap));
      }
    } catch (eLS) {
      console.warn('[ClassRepository] LocalStorage lleno o error al guardar síncrono. Se prioriza IndexedDB.', eLS);
    }

    // Escritura agrupada para IndexedDB y tareas complementarias
    if (!this._pendingPersist) this._pendingPersist = new Set();
    this._pendingPersist.add(tid);
    if (!this._persistScheduled) {
      this._persistScheduled = true;
      const run = () => this.flushPersist();
      if (typeof queueMicrotask === 'function') queueMicrotask(run);
      else Promise.resolve().then(run);
    }
  }

  /**
   * Vuelca de forma inmediata a LocalStorage + IndexedDB los mapas pendientes.
   * Es idempotente y puede invocarse manualmente (p. ej. antes de exportar un respaldo).
   */
  /**
   * Vuelca de forma inmediata a LocalStorage + IndexedDB los mapas pendientes.
   * Retorna una Promesa que resuelve cuando se ha confirmado la persistencia en almacenamiento.
   */
  async flushPersist(teacherId = null) {
    this._persistScheduled = false;
    const pending = this._pendingPersist ? Array.from(this._pendingPersist) : [];
    if (teacherId && !pending.includes(teacherId)) pending.push(teacherId);
    if (this._pendingPersist) this._pendingPersist.clear();

    const results = await Promise.all(pending.map(async (tid) => {
      const sessionsMap = this._cache[tid];
      if (!sessionsMap) return true;
      const key = this.getStorageKey(tid);

      // 1. LocalStorage
      let lsOk = typeof localStorage === 'undefined';
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(sessionsMap));
          lsOk = true;
        }
      } catch (e) {
        console.warn('[ClassRepository] LocalStorage lleno o no disponible. Se asegura en IndexedDB.', e && e.name);
      }

      // 2. IndexedDB (capa principal de alta capacidad y confirmación física en disco)
      let idbOk = false;
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        try {
          idbOk = await IDBStorage.set(key, sessionsMap);
        } catch (eIdb) {
          console.warn('[ClassRepository] Excepción al persistir en IDBStorage:', eIdb);
          idbOk = false;
        }
      }

      if (!lsOk && !idbOk) {
        this._reportPersistFailure(tid);
        throw new Error(`[ClassRepository] Error crítico: No se pudo persistir en LocalStorage ni en IndexedDB para docente ${tid}`);
      }
      this._lastPersistError = null;

      // 3. Sincronización con PlanRepository en modo espejo
      try {
        this._syncLegacyPlanMirror(sessionsMap, tid);
      } catch (eMirror) {
        console.warn('[ClassRepository] Aviso en sincronización espejo:', eMirror);
      }

      return true;
    }));

    return results.every(Boolean);
  }

  /**
   * Guarda o actualiza una clase garantizando persistencia física y verificación de lectura.
   * Obligatorio para operaciones de importación (Regla Principal: Guardar al importar).
   */
  async saveClassPersisted(classData, teacherId, options = {}) {
    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const saved = this.saveClass(classData, tid, options);
    if (!saved) {
      throw new Error('[ClassRepository] El repositorio rechazó el guardado de la clase.');
    }

    // Esperar a que la persistencia en LocalStorage e IndexedDB se confirme físicamente
    await this.flushPersist(tid);

    // Si PlanRepository existe, forzar y confirmar persistencia espejo
    if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
      try {
        await PlanRepository.flushPersist(tid);
      } catch (ePlan) {}
    }

    // Verificación de lectura obligatoria
    const verification = await this.verifyPersistence(saved.id, tid);
    if (!verification.isVerified) {
      throw new Error(`[ClassRepository] Verificación de persistencia fallida para la clase ${saved.id}. No se encontró en disco ni en IndexedDB.`);
    }

    return saved;
  }

  /**
   * Crea una nueva clase garantizando persistencia física y verificación de lectura.
   */
  async createClassPersisted(classData, teacherId, options = {}) {
    const tid = teacherId || classData.teacherId || this._getCurrentTeacherId();
    const created = this.createClass(classData, tid, options);
    if (!created) {
      throw new Error('[ClassRepository] El repositorio rechazó la creación de la clase.');
    }

    await this.flushPersist(tid);

    if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
      try {
        await PlanRepository.flushPersist(tid);
      } catch (ePlan) {}
    }

    const verification = await this.verifyPersistence(created.id, tid);
    if (!verification.isVerified) {
      throw new Error(`[ClassRepository] Verificación de persistencia fallida para la nueva clase ${created.id}.`);
    }

    return created;
  }

  /**
   * Verifica la existencia física de una clase en el almacenamiento persistente
   */
  async verifyPersistence(classId, teacherId) {
    if (!classId) return { inLS: false, inIDB: false, isVerified: false };
    const tid = teacherId || this._getCurrentTeacherId();
    const key = this.getStorageKey(tid);
    let inLS = false;
    let inIDB = false;

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const map = JSON.parse(raw);
          if (map && (map[classId] || Object.values(map).some(c => c && c.id === classId))) {
            inLS = true;
          }
        }
      } catch (e) {}
    }

    if (typeof IDBStorage !== 'undefined' && IDBStorage.get) {
      try {
        const map = await IDBStorage.get(key);
        if (map && (map[classId] || Object.values(map).some(c => c && c.id === classId))) {
          inIDB = true;
        }
      } catch (e) {}
    }

    return {
      inLS,
      inIDB,
      isVerified: inLS || inIDB
    };
  }

  _reportPersistFailure(tid) {
    this._lastPersistError = { teacherId: tid, at: new Date().toISOString() };
    console.error('[ClassRepository] ERROR: no se pudo guardar en LocalStorage ni en IndexedDB. Exporte un respaldo JSON.');
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('planner-storage-error', { detail: this._lastPersistError }));
      }
      if (typeof App !== 'undefined' && typeof App.showToast === 'function') {
        App.showToast('⚠ No se pudo guardar en este navegador (almacenamiento lleno o bloqueado). Descargue un respaldo JSON ahora.', 'error');
      }
    } catch (e) {}
  }

  _syncLegacyPlanMirror(sessionsMap, teacherId) {
    try {
      const legacyKey = 'teacher_planner_plans_' + teacherId + '_v3';
      let plansByDate = {};
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(legacyKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              plansByDate = Object.assign({}, parsed);
            }
          }
        }
      } catch (e) {}

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
        } else if (!Array.isArray(plansByDate[d].classes)) {
          plansByDate[d].classes = [];
        }

        const clsItem = {
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
        };

        const existingIdx = plansByDate[d].classes.findIndex(c => c && (c.id === cls.id || c.classId === cls.id));
        if (existingIdx >= 0) {
          plansByDate[d].classes[existingIdx] = clsItem;
        } else {
          plansByDate[d].classes.push(clsItem);
        }
      });

      // Actualizar localStorage v3 para compatibilidad sin bloquear la UI
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(legacyKey, JSON.stringify(plansByDate));
      }
      if (typeof PlanRepository !== 'undefined' && PlanRepository._cache) {
        PlanRepository._cache[teacherId] = plansByDate;
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        IDBStorage.set(legacyKey, plansByDate).catch(() => {});
      }
    } catch (e) {}
  }

  _saveSnapshot(teacherId, label, data) {
    try {
      const snapKey = `snapshot_${teacherId}_${label}`;
      // Usar IndexedDB de alta capacidad para snapshots sin saturar el límite de 5MB de localStorage
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
    if (!text.includes('\n') && !text.includes('\r')) {
      if (!/Criterios\s+de|Instrumentos\s+de|Recursos\s+did[aá]cticos|Tareas\s+(?:y\s+)?compromisos/i.test(text)) {
        return text.trim();
      }
    }
    const hasImages = text.includes('<img') || text.includes('data:image/');
    let imagePlaceholders = null;
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const hasCodeBlocks = clean.includes('<div class="notebook-code-block"') || clean.includes('<pre');
    let codePlaceholders = null;
    if (hasCodeBlocks) {
      codePlaceholders = [];
      clean = clean.replace(/(?:<div\b[^>]*class="[^"]*notebook-code-block[^"]*"[^>]*>[\s\S]*?<\/div>|<pre\b[^>]*>[\s\S]*?<\/pre>)/gi, (m) => {
        const ph = `___CODE_BLOCK_SHIELD_${codePlaceholders.length}___`;
        codePlaceholders.push(m);
        return ph;
      });
    }

    if (hasImages) {
      imagePlaceholders = [];
      clean = clean.replace(/<img\b[^>]*>/gi, (m) => {
        const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
        imagePlaceholders.push(m);
        return ph;
      });
    }

    const hasEvalKeywords = /Criterios\s+de|Instrumentos\s+de/i.test(clean);
    const hasRecKeywords = /Recursos\s+did[aá]cticos|Tareas/i.test(clean);

    // 1, 2, 3. Reparar y normalizar encabezados de subsección solo cuando las palabras clave estén presentes
    if (hasEvalKeywords) {
      clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
      clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');
      clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
      clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');
      clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
      clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    }

    if (hasRecKeywords) {
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
      clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');
      clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
      clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');
    }

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

    // 8. Unir palabras con guión partidas por salto (ej. "teórico -\npráctico")
    if (clean.includes('-')) {
      clean = clean.replace(/(?<!\b(?:en|de|con|el|la|un|una))\b([a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s*-\s*\n\s*([a-záéíóúñ]+)\b/g, '$1-$2');
    }

    // 9. Espaciado armónico antes de subsecciones
    if (hasEvalKeywords) {
      clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');
    }

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    if (clean.includes(':')) {
      clean = clean.replace(/([^\n:]{1,120}:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');
    }

    // 11. Normalizar saltos triples o excesivos
    if (clean.includes('\n\n\n')) {
      clean = clean.replace(/\n{3,}/g, '\n\n');
    }

    if (imagePlaceholders && imagePlaceholders.length > 0) {
      clean = clean.replace(/___IMG_SHIELD_(\d+)___/g, (match, idx) => {
        return imagePlaceholders[parseInt(idx, 10)] || match;
      });
    }

    if (codePlaceholders && codePlaceholders.length > 0) {
      clean = clean.replace(/___CODE_BLOCK_SHIELD_(\d+)___/g, (match, idx) => {
        return codePlaceholders[parseInt(idx, 10)] || match;
      });
    }

    return clean.trim();
  }

  _cleanField(text) {
    if (!text || typeof text !== 'string') return text;
    if (!this._cleanedFieldCache) this._cleanedFieldCache = new Map();
    if (this._cleanedFieldCache.has(text)) {
      return this._cleanedFieldCache.get(text);
    }

    let clean = text;

    const hasCodeBlocks = clean.includes('<div class="notebook-code-block"') || clean.includes('<pre');
    let codePlaceholders = null;
    if (hasCodeBlocks) {
      codePlaceholders = [];
      clean = clean.replace(/(?:<div\b[^>]*class="[^"]*notebook-code-block[^"]*"[^>]*>[\s\S]*?<\/div>|<pre\b[^>]*>[\s\S]*?<\/pre>)/gi, (m) => {
        const ph = `___CODE_BLOCK_SHIELD_${codePlaceholders.length}___`;
        codePlaceholders.push(m);
        return ph;
      });
    }

    if (typeof window !== 'undefined' && window.ImportParser && typeof window.ImportParser.cleanDocumentArtifacts === 'function') {
      clean = window.ImportParser.cleanDocumentArtifacts(clean);
    } else {
      const hasImages = clean.includes('<img') || clean.includes('data:image/');
      let imagePlaceholders = null;
      if (hasImages) {
        imagePlaceholders = [];
        clean = clean.replace(/<img\b[^>]*>/gi, (m) => {
          const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
          imagePlaceholders.push(m);
          return ph;
        });
      }

      if (clean.includes('\\') || clean.includes('/text') || clean.includes('/Text') || clean.includes('\x09ext')) {
        clean = clean
          .replace(/(?:\\[tT]ext|\/[tT]ext|\x09ext|\\textbf|\\textit|\\mathrm|\\mathbf|\\textnormal|\\mbox)\s*\{([^}]*)\}/gi, '$1')
          .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
          .replace(/\\times\b/g, '×').replace(/\\div\b/g, '÷').replace(/\\cdot\b/g, '·').replace(/\\pm\b/g, '±')
          .replace(/\\(?:le|leq)\b/g, '≤').replace(/\\(?:ge|geq)\b/g, '≥').replace(/\\neq\b/g, '≠').replace(/\\approx\b/g, '≈')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
      }
      if (clean.includes('$')) {
        clean = clean
          .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
          .replace(/\$([^\$\n\r]+?)\$/g, '$1')
          .replace(/\$/g, '');
      }
      if (clean.includes('*') || clean.includes('->') || clean.includes('\n')) {
        clean = clean
          .replace(/""\*{1,3}/g, '"').replace(/''\*{1,3}/g, "'")
          .replace(/->\s*\*{0,2}/g, '-> ')
          .replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n')
          .replace(/(?<=[^\*\s])\*{1,3}(?=[^\*]|$)/g, '')
          .replace(/\*{1,3}/g, '')
          .replace(/(?<!\([^\n\)]*)\s*\*{1,2}\)\s*(?=\n|•|$)/g, '');
      }

      if (imagePlaceholders && imagePlaceholders.length > 0) {
        clean = clean.replace(/___IMG_SHIELD_(\d+)___/g, (match, idx) => {
          return imagePlaceholders[parseInt(idx, 10)] || match;
        });
      }
    }
    clean = this._cleanBrokenLinebreaks(clean);
    if (codePlaceholders && codePlaceholders.length > 0) {
      clean = clean.replace(/___CODE_BLOCK_SHIELD_(\d+)___/g, (match, idx) => {
        return codePlaceholders[parseInt(idx, 10)] || match;
      });
    }

    if (this._cleanedFieldCache.size > 3000) {
      this._cleanedFieldCache.clear();
    }
    this._cleanedFieldCache.set(text, clean);
    if (clean !== text) {
      this._cleanedFieldCache.set(clean, clean);
    }
    return clean;
  }

  _cleanClassText(cls) {
    if (!cls || typeof cls !== 'object') return cls;
    if (cls.curriculum) {
      if (typeof cls.curriculum.topic === 'string') cls.curriculum.topic = this._cleanField(cls.curriculum.topic);
      if (typeof cls.curriculum.dba === 'string') cls.curriculum.dba = this._cleanField(cls.curriculum.dba);
      if (typeof cls.curriculum.achievement === 'string') cls.curriculum.achievement = this._cleanField(cls.curriculum.achievement);
    }
    const rawDS = cls.didacticSequence ? { ...cls.didacticSequence } : null;
    if (cls.didacticSequence) {
      if (typeof cls.didacticSequence.inicio === 'string') cls.didacticSequence.inicio = this._cleanField(cls.didacticSequence.inicio);
      if (typeof cls.didacticSequence.desarrollo === 'string') cls.didacticSequence.desarrollo = this._cleanField(cls.didacticSequence.desarrollo);
      if (typeof cls.didacticSequence.cierre === 'string') cls.didacticSequence.cierre = this._cleanField(cls.didacticSequence.cierre);
      if (typeof cls.didacticSequence.recursos === 'string') cls.didacticSequence.recursos = this._cleanField(cls.didacticSequence.recursos);
      if (typeof cls.didacticSequence.evaluation === 'string') cls.didacticSequence.evaluation = this._cleanField(cls.didacticSequence.evaluation);
      if (typeof cls.didacticSequence.tareas === 'string') cls.didacticSequence.tareas = this._cleanField(cls.didacticSequence.tareas);
    }
    if (cls.pedagogy) {
      if (typeof cls.pedagogy.inicio === 'string') {
        cls.pedagogy.inicio = (rawDS && cls.pedagogy.inicio === rawDS.inicio) ? cls.didacticSequence.inicio : this._cleanField(cls.pedagogy.inicio);
      }
      if (typeof cls.pedagogy.desarrollo === 'string') {
        cls.pedagogy.desarrollo = (rawDS && cls.pedagogy.desarrollo === rawDS.desarrollo) ? cls.didacticSequence.desarrollo : this._cleanField(cls.pedagogy.desarrollo);
      }
      if (typeof cls.pedagogy.cierre === 'string') {
        cls.pedagogy.cierre = (rawDS && cls.pedagogy.cierre === rawDS.cierre) ? cls.didacticSequence.cierre : this._cleanField(cls.pedagogy.cierre);
      }
      if (typeof cls.pedagogy.recursos === 'string') {
        cls.pedagogy.recursos = (rawDS && cls.pedagogy.recursos === rawDS.recursos) ? cls.didacticSequence.recursos : this._cleanField(cls.pedagogy.recursos);
      }
      if (typeof cls.pedagogy.evaluation === 'string') {
        cls.pedagogy.evaluation = (rawDS && cls.pedagogy.evaluation === rawDS.evaluation) ? cls.didacticSequence.evaluation : this._cleanField(cls.pedagogy.evaluation);
      }
      if (typeof cls.pedagogy.evaluacion === 'string') {
        cls.pedagogy.evaluacion = (rawDS && cls.pedagogy.evaluacion === rawDS.evaluation) ? cls.didacticSequence.evaluation : this._cleanField(cls.pedagogy.evaluacion);
      }
      if (typeof cls.pedagogy.tareas === 'string') {
        cls.pedagogy.tareas = (rawDS && cls.pedagogy.tareas === rawDS.tareas) ? cls.didacticSequence.tareas : this._cleanField(cls.pedagogy.tareas);
      }
    }
    const rawStudentNb = cls.teacherNotebook?.studentNotebookContent;
    if (cls.teacherNotebook) {
      if (typeof cls.teacherNotebook.question === 'string') cls.teacherNotebook.question = this._cleanField(cls.teacherNotebook.question);
      if (typeof cls.teacherNotebook.dynamics === 'string') cls.teacherNotebook.dynamics = this._cleanField(cls.teacherNotebook.dynamics);
      if (typeof cls.teacherNotebook.studentNotebookContent === 'string') cls.teacherNotebook.studentNotebookContent = this._cleanField(cls.teacherNotebook.studentNotebookContent);
      if (typeof cls.teacherNotebook.practicalActivity === 'string') cls.teacherNotebook.practicalActivity = this._cleanField(cls.teacherNotebook.practicalActivity);
      if (typeof cls.teacherNotebook.detailedContent === 'string') cls.teacherNotebook.detailedContent = this._cleanField(cls.teacherNotebook.detailedContent);
      if (typeof cls.teacherNotebook.additionalNotes === 'string') cls.teacherNotebook.additionalNotes = this._cleanField(cls.teacherNotebook.additionalNotes);
    }
    if (typeof cls.description === 'string') {
      cls.description = (rawDS && cls.description === rawDS.desarrollo) ? cls.didacticSequence.desarrollo : this._cleanField(cls.description);
    }
    if (typeof cls.observations === 'string') cls.observations = this._cleanField(cls.observations);
    if (typeof cls.notebookContent === 'string') {
      cls.notebookContent = (rawStudentNb !== undefined && cls.notebookContent === rawStudentNb)
        ? cls.teacherNotebook.studentNotebookContent
        : this._cleanField(cls.notebookContent);
    }
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
