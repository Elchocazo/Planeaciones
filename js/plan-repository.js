/**
 * REPOSITORIO CENTRALIZADO DE PLANEACIONES (PlanRepository)
 * UNICA FUENTE DE VERDAD PARA PLANEACIONES INSTITUCIONALES.
 *
 * Principios arquitectonicos:
 * 1. Identidad estable: teacherId -> plans -> YYYY-MM-DD -> Plan -> classes[]
 * 2. Inmutabilidad de fecha: Una planeacion existente JAMAS cambia de fecha automaticamente.
 * 3. Proteccion anti-vacios: Jamas sobrescribe texto existente con campos vacios.
 * 4. Escrituras atomicas con versionado (version, updatedAt, updatedBy).
 * 5. Control de concurrencia y sincronizacion inter-pestanas mediante BroadcastChannel.
 * 6. Persistencia de alta capacidad: IndexedDB primario + LocalStorage indice/espejo + disco.
 */

const PlanRepository = {
  _channel: null,
  _tabId: 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
  _cache: {}, // teacherId -> { [date]: Plan }
  _isInitialized: false,
  _initPromise: null,

  /**
   * Genera un ID estable para una planeacion
   */
  generatePlanId(teacherId, date) {
    return 'plan_' + (teacherId || 'usr_default') + '_' + date;
  },

  /**
   * Genera un ID permanente, aleatorio y único para una clase (completamente desacoplado del índice)
   */
  generateClassId(planId = null) {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 9);
    return `cls_${ts}_${rand}`;
  },

  /**
   * Inicializa el repositorio y el canal de sincronizacion entre pestanas
   */
  async init() {
    if (this._isInitialized) return true;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        // Inicializar BroadcastChannel para concurrencia multi-pestana
        if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
          try {
            this._channel = new BroadcastChannel('planeaciones_sync_v3');
            this._channel.onmessage = (event) => this._handleBroadcastMessage(event.data);
          } catch (eChan) {
            console.warn('[PlanRepository] BroadcastChannel no disponible:', eChan);
          }
        }

        // Listener fallback de storage events para navegadores antiguos
        if (typeof window !== 'undefined' && window.addEventListener) {
          window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('teacher_planner_plans_') && e.newValue) {
              const match = e.key.match(/teacher_planner_plans_(.+)_v[23]/);
              if (match && match[1]) {
                const teacherId = match[1];
                try {
                  const updated = JSON.parse(e.newValue);
                  this._cache[teacherId] = updated;
                } catch (err) {}
              }
            }
          });
        }

        // Inicializar IndexedDB si esta disponible
        if (typeof IDBStorage !== 'undefined' && IDBStorage.init) {
          await IDBStorage.init();
        }

        this._isInitialized = true;
        return true;
      } catch (err) {
        console.error('[PlanRepository] Error en inicializacion:', err);
        this._isInitialized = true;
        return false;
      }
    })();

    return this._initPromise;
  },

  /**
   * Manejador de mensajes de sincronizacion entre pestanas
   */
  _handleBroadcastMessage(msg) {
    if (!msg || msg.sourceTabId === this._tabId) return;

    if (msg.type === 'PLAN_SAVED') {
      const { teacherId, date, plan, version } = msg;
      if (!this._cache[teacherId]) this._cache[teacherId] = {};
      
      const currentInMemory = this._cache[teacherId][date];
      // Si la version entrante es mas reciente o igual, actualizar la cache
      if (!currentInMemory || (version && version >= (currentInMemory.version || 0))) {
        this._cache[teacherId][date] = JSON.parse(JSON.stringify(plan));
      }

      // Notificar a observadores locales (Planner, NotebookEditor, etc.)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const evt = new CustomEvent('plan_remote_update', {
          detail: { teacherId, date, version, sourceTabId: msg.sourceTabId }
        });
        window.dispatchEvent(evt);
      }
    }

    if (msg.type === 'CLASS_SAVED') {
      const { teacherId, date, classId, classData, version } = msg;
      if (!this._cache[teacherId]) this._cache[teacherId] = {};
      const currentPlan = this._cache[teacherId][date];
      if (currentPlan && Array.isArray(currentPlan.classes)) {
        const idx = currentPlan.classes.findIndex(c => c.id === classId);
        if (idx >= 0) {
          currentPlan.classes[idx] = JSON.parse(JSON.stringify(classData));
          currentPlan.version = Math.max(currentPlan.version || 1, version || 1);
        }
      }

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const evt = new CustomEvent('class_remote_update', {
          detail: { teacherId, date, classId, version, sourceTabId: msg.sourceTabId }
        });
        window.dispatchEvent(evt);
      }
    }
  },

  clearCache() {
    this._cache = {};
  },

  /**
   * Clave canonica de almacenamiento por docente
   */
  getStorageKey(teacherId) {
    return 'teacher_planner_plans_' + (teacherId || 'usr_manuel') + '_v3';
  },

  /**
   * Claves heredadas para migracion no destructiva
   */
  getLegacyStorageKeys(teacherId) {
    const keys = ['teacher_planner_plans_' + (teacherId || 'usr_manuel') + '_v2'];
    if (teacherId === 'usr_manuel') {
      keys.push('teacher_planner_plans_v1');
    }
    return keys;
  },

  /**
   * Obtiene todas las planeaciones de un docente (lectura atomica desde cache, IndexedDB o LocalStorage)
   */
  getAllPlans(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();

    if (this._cache[tid] && Object.keys(this._cache[tid]).length > 0) {
      return JSON.parse(JSON.stringify(this._cache[tid]));
    }

    const keyV3 = this.getStorageKey(tid);
    let loaded = null;

    // 1. Intentar leer desde LocalStorage v3
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(keyV3);
        if (raw) loaded = JSON.parse(raw);
      }
    } catch (e) {}

    // 2. Si no existe en v3, intentar leer desde keys heredadas (v2 o v1) sin borrar nada
    if (!loaded) {
      for (const legacyKey of this.getLegacyStorageKeys(tid)) {
        try {
          if (typeof localStorage !== 'undefined') {
            const rawLegacy = localStorage.getItem(legacyKey);
            if (rawLegacy) {
              loaded = JSON.parse(rawLegacy);
              break;
            }
          }
        } catch (e) {}
      }
    }

    if (!loaded || typeof loaded !== 'object') {
      loaded = {};
    }

    // Normalizar identidad estable en cada plan cargado sin alterar fechas
    Object.keys(loaded).forEach(d => {
      loaded[d] = this._normalizePlanStructure(tid, d, loaded[d]);
    });

    this._cache[tid] = loaded;
    return JSON.parse(JSON.stringify(loaded));
  },

  /**
   * Obtiene la planeacion de una fecha especifica para un docente
   * INMUTABILIDAD: Jamas altera la fecha ni infiere cambios.
   */
  getPlan(teacherId, date) {
    if (!date) return null;
    const tid = teacherId || this._getCurrentTeacherId();
    const all = this.getAllPlans(tid);
    const plan = all[date];
    if (!plan) return null;
    return JSON.parse(JSON.stringify(plan));
  },

  /**
   * Calcula el consecutivo persistente para la combinación PERIODO + MATERIA + GRADO
   * sequenceKey = `${period}|${subject}|${grade}`
   * Busca en todas las planeaciones guardadas en fechas anteriores (< date).
   */
  calculateNextSequenceNumber(teacherId, date, period = '1°', subject = '', grade = '', currentDayClasses = []) {
    if (!subject || !grade) return 1;
    const tid = teacherId || this._getCurrentTeacherId();
    const allPlans = this.getAllPlans(tid);

    const norm = (s) => String(s || '').trim().toLowerCase();
    const targetSub = norm(subject);
    const targetGrd = norm(grade);
    const targetPer = norm(period || '1°');

    let maxFound = 0;

    // 1. Fechas cronológicas anteriores estrictas (< date)
    const prevDates = Object.keys(allPlans).filter(d => d < date).sort();
    for (const d of prevDates) {
      const p = allPlans[d];
      if (!p || !Array.isArray(p.classes)) continue;
      const planPer = norm(p.period || '1°');
      if (planPer !== targetPer) continue;

      for (const cls of p.classes) {
        if (norm(cls.subject) === targetSub && norm(cls.grade) === targetGrd) {
          const num = cls.sequenceNumber || parseInt(String(cls.dayNumber || '').replace(/[^0-9]/g, ''), 10) || 0;
          if (num > maxFound) {
            maxFound = num;
          }
        }
      }
    }

    // 2. Clases del mismo día ya agregadas en esta misma inicialización
    if (Array.isArray(currentDayClasses)) {
      for (const cls of currentDayClasses) {
        if (norm(cls.subject) === targetSub && norm(cls.grade) === targetGrd) {
          const num = cls.sequenceNumber || parseInt(String(cls.dayNumber || '').replace(/[^0-9]/g, ''), 10) || 0;
          if (num > maxFound) {
            maxFound = num;
          }
        }
      }
    }

    return maxFound + 1;
  },

  /**
   * Crea una nueva planeacion inicial para una fecha a partir del horario semanal
   * IMPORTANTE: Esta operacion SOLO se invoca para una fecha que NO existe previamente.
   * JAMAS se aplica sobre una fecha ya guardada.
   */
  createPlan(teacherId, date, weeklyScheduleOrClasses = null, period = '1°') {
    const tid = teacherId || this._getCurrentTeacherId();
    const planId = this.generatePlanId(tid, date);

    // Deducir dia de la semana para la inicializacion
    const dateParts = date.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayIndex = dateObj.getDay(); // 0=Dom, 1=Lun ... 6=Sab
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = dayNames[dayIndex] || 'Lunes';

    let initialClasses = [];

    // Si se proporciona un arreglo directo de clases iniciales
    if (Array.isArray(weeklyScheduleOrClasses)) {
      weeklyScheduleOrClasses.forEach((item, idx) => {
        const clsId = item.id || this.generateClassId(planId);
        const seqNum = item.sequenceNumber || parseInt(item.dayNumber, 10) || this.calculateNextSequenceNumber(tid, date, period, item.subject, item.grade, initialClasses);
        initialClasses.push({
          id: clsId,
          planId: planId,
          date: date,
          dayOfWeek: item.dayOfWeek || dayOfWeek,
          dayNumber: String(item.dayNumber || seqNum),
          sequenceNumber: seqNum,
          time: item.time || '',
          subject: item.subject || '',
          grade: item.grade || '',
          dba: item.dba || '',
          achievement: item.achievement || '',
          topic: item.topic || '',
          description: item.description || '',
          observations: item.observations || '',
          notebookContent: item.notebookContent || '',
          attachments: item.attachments || [],
          version: item.version || 1
        });
      });
    } else if (weeklyScheduleOrClasses && weeklyScheduleOrClasses[String(dayIndex)] && Array.isArray(weeklyScheduleOrClasses[String(dayIndex)])) {
      // Si se proporciona horario semanal, poblar las clases iniciales
      const daySlots = weeklyScheduleOrClasses[String(dayIndex)];
      daySlots.forEach((slot, idx) => {
        const clsId = this.generateClassId(planId);
        const seqNum = this.calculateNextSequenceNumber(tid, date, period, slot.subject, slot.grade, initialClasses);
        initialClasses.push({
          id: clsId,
          planId: planId,
          date: date,
          dayOfWeek: dayOfWeek,
          dayNumber: String(seqNum),
          sequenceNumber: seqNum,
          time: slot.time || '',
          subject: slot.subject || '',
          grade: slot.grade || '',
          dba: '',
          achievement: '',
          topic: '',
          description: '',
          observations: '',
          notebookContent: '',
          attachments: [],
          version: 1
        });
      });
    }

    const newPlan = {
      id: planId,
      teacherId: tid,
      date: date,
      period: period || '1°',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: tid,
      classes: initialClasses,
      attachments: [],
      generalNotes: ''
    };

    return newPlan;
  },

  /**
   * Guarda o actualiza atomicamente la planeacion de una fecha.
   *
   * REGLAS CRITICAS DE SALVAGUARDA:
   * 1. Inmutabilidad de fecha: plan.date y class.date son estrictamente fijadas a date.
   * 2. Anti-vacios: Si el usuario ya tenia texto y la operacion entrante viene vacia,
   *    se conserva el texto existente (a menos que options.forceEmpty === true).
   * 3. Versionado atomico: Se incrementa version y se estampa updatedAt.
   * 4. Sincronizacion multi-pestana inmediata via BroadcastChannel.
   */
  savePlan(teacherId, date, incomingPlanData, options = {}) {
    if (!date || !incomingPlanData) {
      console.warn('[PlanRepository] Intento de guardado invalido: fecha o datos nulos');
      return false;
    }

    const tid = teacherId || this._getCurrentTeacherId();
    const planId = this.generatePlanId(tid, date);
    const existingPlan = this.getPlan(tid, date);

    // 1. Preservar y fusionar clases aplicando la regla ANTI-VACIOS
    const mergedClasses = this._mergeClassesSafely(
      existingPlan ? existingPlan.classes : [],
      incomingPlanData.classes || [],
      date,
      planId,
      options.forceEmpty === true
    );

    // 2. Determinar version incremental
    const currentVersion = existingPlan ? (existingPlan.version || 1) : 0;
    const nextVersion = currentVersion + 1;

    // 3. Construir el objeto Plan definitivo con identidad estable
    const finalizedPlan = {
      id: planId,
      teacherId: tid,
      date: date, // INMUTABLE: siempre la fecha del registro
      period: incomingPlanData.period || existingPlan?.period || '1°',
      version: nextVersion,
      createdAt: existingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: tid,
      classes: mergedClasses,
      attachments: Array.isArray(incomingPlanData.attachments)
        ? incomingPlanData.attachments
        : (existingPlan?.attachments || []),
      generalNotes: (incomingPlanData.generalNotes !== undefined && incomingPlanData.generalNotes !== null)
        ? incomingPlanData.generalNotes
        : (existingPlan?.generalNotes || '')
    };

    // 4. Actualizar la cache local en memoria
    if (!this._cache[tid]) this._cache[tid] = {};
    this._cache[tid][date] = finalizedPlan;

    // 5. Persistir en LocalStorage
    const key = this.getStorageKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(this._cache[tid]));
      }
    } catch (eLS) {
      console.warn('[PlanRepository] LocalStorage lleno o error al guardar. Se prioriza IndexedDB.');
    }

    // 6. Persistir en IndexedDB de Alta Capacidad (Sin limite de tamano)
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, this._cache[tid]).catch(err => {
        console.warn('[PlanRepository] Error al escribir en IndexedDB:', err);
      });
    }

    // 7. Notificar a todas las demas pestanas via BroadcastChannel
    if (this._channel) {
      try {
        this._channel.postMessage({
          type: 'PLAN_SAVED',
          teacherId: tid,
          date: date,
          plan: finalizedPlan,
          version: nextVersion,
          sourceTabId: this._tabId
        });
      } catch (eChan) {}
    }

    // 8. Respaldo fisico en disco via servidor local en segundo plano
    clearTimeout(this._diskSyncTimer);
    this._diskSyncTimer = setTimeout(() => {
      this._syncToDisk(tid);
    }, 1500);

    return finalizedPlan;
  },

  /**
   * Elimina una planeacion para una fecha (con snapshot de seguridad antes de borrar)
   */
  deletePlan(teacherId, date) {
    const tid = teacherId || this._getCurrentTeacherId();
    const existing = this.getPlan(tid, date);
    if (!existing) return true;

    // Guardar snapshot de seguridad antes de eliminar
    this.saveSnapshot(tid, 'delete_' + date, existing);

    const all = this.getAllPlans(tid);
    delete all[date];
    this._cache[tid] = all;

    const key = this.getStorageKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(all));
      }
    } catch (e) {}

    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, all).catch(() => {});
    }

    return true;
  },

  /**
   * Guarda o actualiza atómicamente una ÚNICA CLASE de una fecha.
   * Modifica ÚNICAMENTE esa clase. Las demás clases de la fecha y de otras fechas
   * permanecen 100% inalteradas (byte por byte).
   * Aplica la regla ANTI-VACÍOS estricta sobre:
   * 1. Secuencia didáctica (description)
   * 2. Comentarios / observaciones (observations)
   * 3. Cuaderno docente (notebookContent)
   * Así como sobre topic, dba, achievement.
   */
  saveClass(teacherId, date, classId, incomingClassData, options = {}) {
    if (!date || !classId || !incomingClassData) {
      console.warn('[PlanRepository] saveClass error: parámetros inválidos', { date, classId });
      return null;
    }

    const tid = teacherId || this._getCurrentTeacherId();
    let currentPlan = this.getPlan(tid, date);

    if (!currentPlan) {
      currentPlan = this.createPlan(tid, date);
    }

    if (!Array.isArray(currentPlan.classes)) {
      currentPlan.classes = [];
    }

    // Buscar la clase existente por classId
    let classIndex = currentPlan.classes.findIndex(c => c.id === classId);
    let existingClass = classIndex >= 0 ? currentPlan.classes[classIndex] : null;

    if (!existingClass) {
      // Si no existe por ID, buscar si hay una con coincidencia por subject y grade
      existingClass = {
        id: classId,
        planId: currentPlan.id,
        date: date,
        dayOfWeek: incomingClassData.dayOfWeek || '',
        dayNumber: incomingClassData.dayNumber || '1',
        sequenceNumber: incomingClassData.sequenceNumber || parseInt(incomingClassData.dayNumber, 10) || 1,
        time: incomingClassData.time || '',
        subject: incomingClassData.subject || '',
        grade: incomingClassData.grade || '',
        dba: '',
        achievement: '',
        topic: '',
        description: '',
        observations: '',
        notebookContent: '',
        attachments: [],
        version: 1
      };
      currentPlan.classes.push(existingClass);
      classIndex = currentPlan.classes.length - 1;
    }

    // Guardar versión histórica previa de la clase antes de sobreescribir
    this._saveClassVersionHistory(tid, date, classId, existingClass);

    // Incrementar versión de la clase
    const prevClassVersion = existingClass.version || 1;
    const nextClassVersion = prevClassVersion + 1;

    // Campos de texto protegidos por la regla anti-vacíos:
    // description (secuencia didáctica), observations (comentarios), notebookContent (cuaderno docente)
    // además de topic, dba, achievement
    const textFields = ['topic', 'dba', 'achievement', 'description', 'observations', 'notebookContent'];
    const forceEmpty = options.forceEmpty === true;

    const updatedClass = {
      ...existingClass,
      id: classId, // INMUTABLE
      planId: currentPlan.id,
      date: date, // INMUTABLE
      dayOfWeek: incomingClassData.dayOfWeek || existingClass.dayOfWeek || '',
      dayNumber: incomingClassData.dayNumber !== undefined ? String(incomingClassData.dayNumber) : existingClass.dayNumber,
      sequenceNumber: incomingClassData.sequenceNumber !== undefined ? incomingClassData.sequenceNumber : (existingClass.sequenceNumber || parseInt(existingClass.dayNumber, 10) || 1),
      time: incomingClassData.time || existingClass.time || '',
      subject: incomingClassData.subject || existingClass.subject || '',
      grade: incomingClassData.grade || existingClass.grade || '',
      attachments: Array.isArray(incomingClassData.attachments) ? incomingClassData.attachments : (existingClass.attachments || []),
      version: nextClassVersion,
      updatedAt: new Date().toISOString()
    };

    textFields.forEach(field => {
      const incVal = incomingClassData[field];
      const existVal = existingClass[field];

      if (forceEmpty) {
        updatedClass[field] = incVal || '';
      } else {
        if (this._hasRealContent(incVal)) {
          updatedClass[field] = incVal;
        } else if (this._hasRealContent(existVal)) {
          // El campo entrante vino vacío pero existía texto previo: PROTEGER Y PRESERVAR
          updatedClass[field] = existVal;
        } else {
          updatedClass[field] = (incVal !== undefined && incVal !== null) ? incVal : (existVal || '');
        }
      }
    });

    // Modificar ÚNICAMENTE esta clase en el arreglo del día
    currentPlan.classes[classIndex] = updatedClass;

    // Incrementar versión del plan
    currentPlan.version = (currentPlan.version || 1) + 1;
    currentPlan.updatedAt = new Date().toISOString();
    currentPlan.updatedBy = tid;

    // Actualizar cache en memoria
    if (!this._cache[tid]) this._cache[tid] = {};
    this._cache[tid][date] = currentPlan;

    // Persistir en LocalStorage v3
    const key = this.getStorageKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(this._cache[tid]));
      }
    } catch (eLS) {
      console.warn('[PlanRepository] LocalStorage lleno o error al guardar clase. Se prioriza IndexedDB.');
    }

    // Persistir en IndexedDB
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, this._cache[tid]).catch(err => {
        console.warn('[PlanRepository] Error al escribir en IndexedDB:', err);
      });
    }

    // Notificar a otras pestañas via BroadcastChannel
    if (this._channel) {
      try {
        this._channel.postMessage({
          type: 'CLASS_SAVED',
          teacherId: tid,
          date: date,
          classId: classId,
          classData: updatedClass,
          version: nextClassVersion,
          sourceTabId: this._tabId
        });
      } catch (eChan) {}
    }

    // Respaldo físico en disco en segundo plano
    clearTimeout(this._diskSyncTimer);
    this._diskSyncTimer = setTimeout(() => {
      this._syncToDisk(tid);
    }, 1500);

    // Registro de auditoría
    console.log(`[CLASS] classId: ${classId} date: ${date} seq: ${updatedClass.dayNumber} v: ${nextClassVersion}`);
    console.log(`[SAVE] sequence: ${Boolean(updatedClass.description)} observations: ${Boolean(updatedClass.observations)} notebook: ${Boolean(updatedClass.notebookContent)}`);

    return updatedClass;
  },

  /**
   * Elimina una clase específica de un día (con snapshot de seguridad)
   */
  deleteClass(teacherId, date, classId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const currentPlan = this.getPlan(tid, date);
    if (!currentPlan || !Array.isArray(currentPlan.classes)) return false;

    const classToDelete = currentPlan.classes.find(c => c.id === classId);
    if (!classToDelete) return false;

    // Snapshot de seguridad antes de eliminar
    this.saveSnapshot(tid, `delete_class_${date}_${classId}`, classToDelete);

    currentPlan.classes = currentPlan.classes.filter(c => c.id !== classId);
    currentPlan.version = (currentPlan.version || 1) + 1;
    currentPlan.updatedAt = new Date().toISOString();

    const saved = this.savePlan(tid, date, currentPlan, { forceEmpty: true });
    return Boolean(saved);
  },

  // Historial de versiones de clases
  _classHistory: {},
  _saveClassVersionHistory(teacherId, date, classId, classData) {
    if (!classData) return;
    const histKey = `${teacherId}_${date}_${classId}`;
    if (!this._classHistory[histKey]) this._classHistory[histKey] = [];
    this._classHistory[histKey].push({
      timestamp: new Date().toISOString(),
      version: classData.version || 1,
      classData: JSON.parse(JSON.stringify(classData))
    });
    if (this._classHistory[histKey].length > 10) {
      this._classHistory[histKey].shift();
    }
  },

  getClassVersionHistory(teacherId, date, classId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const histKey = `${tid}_${date}_${classId}`;
    return this._classHistory[histKey] ? JSON.parse(JSON.stringify(this._classHistory[histKey])) : [];
  },

  restoreClassVersion(teacherId, date, classId, historyIndex = -1) {
    const history = this.getClassVersionHistory(teacherId, date, classId);
    if (!history || history.length === 0) return null;
    const targetIdx = historyIndex >= 0 && historyIndex < history.length ? historyIndex : history.length - 1;
    const snapshot = history[targetIdx];
    if (!snapshot || !snapshot.classData) return null;

    return this.saveClass(teacherId, date, classId, snapshot.classData, { forceEmpty: true });
  },

  /**
   * Guarda una instantanea historica de una planeacion o de todas las planeaciones
   */
  saveSnapshot(teacherId, label, data) {
    const tid = teacherId || this._getCurrentTeacherId();
    const snapKey = 'snapshot_' + tid + '_' + label;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(snapKey, JSON.stringify({
          label,
          timestamp: new Date().toISOString(),
          data
        }));
      }
    } catch (e) {}

    if (typeof IDBStorage !== 'undefined' && IDBStorage.saveSnapshot) {
      IDBStorage.saveSnapshot(tid + '_' + label, data).catch(() => {});
    }
    return true;
  },

  /**
   * Obtiene la lista de instantaneas de recuperacion
   */
  getSnapshots(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const snapshots = {};
    try {
      if (typeof localStorage !== 'undefined') {
        const prefix = 'snapshot_' + tid + '_';
        const allKeys = typeof localStorage.key === 'function'
          ? Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
          : Object.keys(localStorage.store || {});

        allKeys.forEach(k => {
          if (k && k.startsWith(prefix)) {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                snapshots[k] = JSON.parse(raw);
              } catch (e) {}
            }
          }
        });
      }
    } catch (e) {}
    return snapshots;
  },

  // =========================================================================
  // METODOS AUXILIARES Y PROTECCIONES INTERNAS
  // =========================================================================

  /**
   * Obtiene el ID del docente activo
   */
  _getCurrentTeacherId() {
    if (typeof UserService !== 'undefined' && UserService.getCurrentUserId) {
      return UserService.getCurrentUserId() || 'usr_manuel';
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('school_current_active_user_v2') || 'usr_manuel';
    }
    return 'usr_manuel';
  },

  /**
   * Comprueba si un string contiene contenido pedagogico real (no solo espacios ni etiquetas vacias)
   */
  _hasRealContent(val) {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    if (!str || str === '<p><br/></p>' || str === '<p><br></p>' || str === '<p></p>' || str === '<br>') {
      return false;
    }
    const cleanText = str.replace(/<[^>]+>/g, '').replace(/[\s\u00a0\u200B]+/g, '');
    if (cleanText.length > 0) return true;
    return /<(img|table|iframe|hr|svg|canvas|video|audio)[^>]*>/i.test(str);
  },

  /**
   * Fusion segura de clases aplicando la regla ANTI-VACIOS y garantizando IDs estables
   */
  _mergeClassesSafely(existingClasses, incomingClasses, date, planId, forceEmpty = false) {
    if (!Array.isArray(incomingClasses) || incomingClasses.length === 0) {
      // Si incomingClasses viene vacio y no es forceEmpty, preservar las existentes
      if (!forceEmpty && Array.isArray(existingClasses) && existingClasses.length > 0) {
        return JSON.parse(JSON.stringify(existingClasses));
      }
      return [];
    }

    const safeClasses = [];

    incomingClasses.forEach((inc, idx) => {
      // 1. Buscar la clase existente correspondiente prioritariamente por ID permanente
      let exist = null;
      if (inc.id && Array.isArray(existingClasses)) {
        exist = existingClasses.find(c => c.id === inc.id);
      }
      if (!exist && Array.isArray(existingClasses) && existingClasses[idx]) {
        exist = existingClasses[idx];
      }

      const classId = inc.id || exist?.id || this.generateClassId(planId);
      const seqNum = inc.sequenceNumber || exist?.sequenceNumber || parseInt(inc.dayNumber || exist?.dayNumber || (idx + 1), 10) || 1;
      const safeClass = {
        id: classId,
        planId: planId,
        date: date, // INMUTABLE
        dayOfWeek: inc.dayOfWeek || exist?.dayOfWeek || '',
        dayNumber: String(inc.dayNumber || exist?.dayNumber || seqNum),
        sequenceNumber: seqNum,
        time: inc.time || exist?.time || '',
        subject: inc.subject || exist?.subject || '',
        grade: inc.grade || exist?.grade || '',
        attachments: Array.isArray(inc.attachments) ? inc.attachments : (exist?.attachments || []),
        version: Math.max(inc.version || 1, exist?.version || 1)
      };

      // Campos de texto protegidos por la regla anti-vacios:
      // topic, dba, achievement, description, observations, notebookContent
      const textFields = ['topic', 'dba', 'achievement', 'description', 'observations', 'notebookContent'];

      textFields.forEach(field => {
        const incVal = inc[field];
        const existVal = exist ? exist[field] : undefined;

        if (forceEmpty) {
          // El usuario ordeno borrar explicitamente el contenido
          safeClass[field] = incVal || '';
        } else {
          // Si el campo entrante tiene contenido real, se actualiza
          if (this._hasRealContent(incVal)) {
            safeClass[field] = incVal;
          } else if (this._hasRealContent(existVal)) {
            // El campo entrante vino vacio pero existia texto previo: PROTEGER Y PRESERVAR
            safeClass[field] = existVal;
          } else {
            safeClass[field] = incVal || '';
          }
        }
      });

      safeClasses.push(safeClass);
    });

    return safeClasses;
  },

  /**
   * Normaliza la estructura de un plan antiguo garantizando identificadores estables
   */
  _normalizePlanStructure(teacherId, date, rawPlan) {
    if (!rawPlan || typeof rawPlan !== 'object') {
      return this.createPlan(teacherId, date);
    }

    const planId = rawPlan.id || this.generatePlanId(teacherId, date);
    const normalizedClasses = (rawPlan.classes || []).map((cls, idx) => {
      const clsId = cls.id || this.generateClassId(planId);
      const seqNum = cls.sequenceNumber || parseInt(cls.dayNumber || (idx + 1), 10) || (idx + 1);
      return {
        id: clsId,
        planId: planId,
        date: date, // INMUTABLE
        dayOfWeek: cls.dayOfWeek || '',
        dayNumber: String(cls.dayNumber || seqNum),
        sequenceNumber: seqNum,
        time: cls.time || '',
        subject: cls.subject || '',
        grade: cls.grade || '',
        dba: cls.dba || '',
        achievement: cls.achievement || cls.performance || '',
        topic: cls.topic || '',
        description: cls.description || '',
        observations: cls.observations || '',
        notebookContent: cls.notebookContent || '',
        attachments: Array.isArray(cls.attachments) ? cls.attachments : [],
        version: cls.version || 1
      };
    });

    return {
      id: planId,
      teacherId: teacherId,
      date: date, // INMUTABLE
      period: rawPlan.period || '1°',
      version: rawPlan.version || 1,
      createdAt: rawPlan.createdAt || new Date().toISOString(),
      updatedAt: rawPlan.updatedAt || rawPlan.lastUpdated || new Date().toISOString(),
      updatedBy: rawPlan.updatedBy || teacherId,
      classes: normalizedClasses,
      attachments: Array.isArray(rawPlan.attachments) ? rawPlan.attachments : [],
      generalNotes: rawPlan.generalNotes || '',
      coordinatorReview: rawPlan.coordinatorReview || null
    };
  },

  /**
   * Envio de respaldo fisico a disco via servidor Node local
   */
  async _syncToDisk(teacherId) {
    if (typeof window === 'undefined' || !window.fetch) return;
    try {
      const allPlans = this.getAllPlans(teacherId);
      const payload = {
        version: '3.0',
        exportedAt: new Date().toISOString(),
        teacherId: teacherId,
        plans: allPlans
      };
      await fetch('/api/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }
};

if (typeof window !== 'undefined') {
  window.PlanRepository = PlanRepository;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlanRepository;
}
