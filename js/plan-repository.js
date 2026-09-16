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
   * Genera un ID estable para una clase dentro de una planeacion
   */
  generateClassId(planId, classIndex, subject, grade) {
    const cleanSub = String(subject || 'gen').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
    const cleanGrd = String(grade || '0').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3);
    return 'class_' + planId + '_' + classIndex + '_' + cleanSub + '_' + cleanGrd;
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
   * Crea una nueva planeacion inicial para una fecha a partir del horario semanal
   * IMPORTANTE: Esta operacion SOLO se invoca para una fecha que NO existe previamente.
   * JAMAS se aplica sobre una fecha ya guardada.
   */
  createPlan(teacherId, date, weeklySchedule = null, period = '1°') {
    const tid = teacherId || this._getCurrentTeacherId();
    const planId = this.generatePlanId(tid, date);

    // Deducir dia de la semana para la inicializacion
    const dateParts = date.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayIndex = dateObj.getDay(); // 0=Dom, 1=Lun ... 6=Sab
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = dayNames[dayIndex] || 'Lunes';

    let initialClasses = [];

    // Si se proporciona horario semanal, poblar las clases iniciales
    if (weeklySchedule && weeklySchedule[String(dayIndex)] && Array.isArray(weeklySchedule[String(dayIndex)])) {
      const daySlots = weeklySchedule[String(dayIndex)];
      daySlots.forEach((slot, idx) => {
        const clsId = this.generateClassId(planId, idx, slot.subject, slot.grade);
        initialClasses.push({
          id: clsId,
          planId: planId,
          date: date,
          dayOfWeek: dayOfWeek,
          dayNumber: String(idx + 1),
          time: slot.time || '',
          subject: slot.subject || '',
          grade: slot.grade || '',
          dba: '',
          achievement: '',
          topic: '',
          description: '',
          observations: '',
          notebookContent: '',
          attachments: []
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
   * Guarda una instantanea historica de una planeacion o de todas las planeaciones
   */
  async saveSnapshot(teacherId, label, data) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (typeof IDBStorage !== 'undefined' && IDBStorage.saveSnapshot) {
      return IDBStorage.saveSnapshot(tid + '_' + label, data);
    }
    return false;
  },

  /**
   * Obtiene la lista de instantaneas de recuperacion
   */
  async getSnapshots(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (typeof IDBStorage !== 'undefined' && IDBStorage.getSnapshots) {
      return IDBStorage.getSnapshots(tid);
    }
    return [];
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
      // Buscar la clase existente correspondiente por indice o por id
      const exist = (Array.isArray(existingClasses) && existingClasses[idx]) ? existingClasses[idx] : null;

      const classId = inc.id || exist?.id || this.generateClassId(planId, idx, inc.subject, inc.grade);
      const safeClass = {
        id: classId,
        planId: planId,
        date: date, // INMUTABLE
        dayOfWeek: inc.dayOfWeek || exist?.dayOfWeek || '',
        dayNumber: String(inc.dayNumber || exist?.dayNumber || (idx + 1)),
        time: inc.time || exist?.time || '',
        subject: inc.subject || exist?.subject || '',
        grade: inc.grade || exist?.grade || '',
        attachments: Array.isArray(inc.attachments) ? inc.attachments : (exist?.attachments || [])
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
      const clsId = cls.id || this.generateClassId(planId, idx, cls.subject, cls.grade);
      return {
        id: clsId,
        planId: planId,
        date: date, // INMUTABLE
        dayOfWeek: cls.dayOfWeek || '',
        dayNumber: String(cls.dayNumber || (idx + 1)),
        time: cls.time || '',
        subject: cls.subject || '',
        grade: cls.grade || '',
        dba: cls.dba || '',
        achievement: cls.achievement || cls.performance || '',
        topic: cls.topic || '',
        description: cls.description || '',
        observations: cls.observations || '',
        notebookContent: cls.notebookContent || '',
        attachments: Array.isArray(cls.attachments) ? cls.attachments : []
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
