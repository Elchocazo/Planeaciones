/**
 * SERVICIO DE INTEGRACIÓN CON GOOGLE CLOUD FIRESTORE
 * 
 * Arquitectura de sincronización en dos fases:
 * - Fase A: Sincronización inicial completa idempotente (descarga y reconciliación no destructiva una sola vez).
 * - Fase B: Sincronización incremental reactiva mediante cola de cambios pendientes (dirty queue),
 *           blindaje anti-eco en listeners en tiempo real y hashing determinista de contenido pedagógico.
 */

const FirestoreService = {
  db: null,
  app: null,
  isInitialized: false,
  status: 'offline', // 'offline' | 'connecting' | 'connected' | 'syncing' | 'error'
  statusMessage: 'Modo local',
  _unsubscribeListener: null,
  _syncDebounceTimers: {},
  _isSyncing: false,
  _isPaused: false,
  _knownHashes: {},
  _syncQueue: {},

  /**
   * Colecciones en Firestore
   */
  COLLECTION_PATH: 'school_plans_v1',
  CLASSES_COLLECTION_PATH: 'school_classes_v1',
  BUNDLES_COLLECTION_PATH: 'school_bundles_v1',

  /**
   * Claves de almacenamiento local para cola y estado de sincronización
   */
  _getQueueKey(teacherId) {
    return `firestore_sync_queue_${teacherId || 'usr_manuel'}`;
  },

  _getInitialSyncKey(teacherId) {
    return `firestore_initial_sync_done_${teacherId || 'usr_manuel'}`;
  },

  _getKnownHashesKey(teacherId) {
    return `firestore_known_hashes_${teacherId || 'usr_manuel'}`;
  },

  /**
   * Indica si la sincronización inicial completa ya finalizó para este docente
   */
  isInitialSyncDone(teacherId = 'usr_manuel') {
    const tid = teacherId || 'usr_manuel';
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this._getInitialSyncKey(tid)) === 'true';
      }
    } catch (e) {}
    return false;
  },

  /**
   * Registra si la sincronización inicial completa está realizada
   */
  setInitialSyncDone(teacherId = 'usr_manuel', done = true) {
    const tid = teacherId || 'usr_manuel';
    const key = this._getInitialSyncKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        if (done) {
          localStorage.setItem(key, 'true');
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {}
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, done ? 'true' : 'false').catch(() => {});
    }
  },

  /**
   * Carga los hashes conocidos desde el almacenamiento
   */
  _loadKnownHashes(teacherId) {
    const tid = teacherId || 'usr_manuel';
    const key = this._getKnownHashesKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(key);
        if (raw) {
          this._knownHashes = JSON.parse(raw);
          return;
        }
      }
    } catch (e) {}
    this._knownHashes = this._knownHashes || {};
  },

  /**
   * Guarda los hashes conocidos en el almacenamiento
   */
  _saveKnownHashes(teacherId) {
    const tid = teacherId || 'usr_manuel';
    const key = this._getKnownHashesKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(this._knownHashes || {}));
      }
    } catch (e) {}
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, this._knownHashes || {}).catch(() => {});
    }
  },

  /**
   * Cálculo determinista de hash de contenido (ignora metadatos volátiles como timestamps)
   */
  _computeHash(data) {
    if (!data) return 'h_empty';
    try {
      const cleanData = this._cleanForHashing(data);
      const str = JSON.stringify(cleanData);
      let hash = 2166136261;
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      return 'h_' + (hash >>> 0).toString(16);
    } catch (e) {
      return 'h_' + Date.now();
    }
  },

  /**
   * Limpia recursivamente objetos para hash canónico excluyendo marcas volátiles
   */
  _cleanForHashing(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this._cleanForHashing(item));
    }
    const clean = {};
    const ignoredKeys = new Set([
      'cloudUpdatedAt',
      'cloudStampedAt',
      '_syncedAt',
      'syncedFromClient',
      'updatedAt',
      'timestamp',
      'lastSyncTimestamp',
      'version'
    ]);
    const sortedKeys = Object.keys(obj).sort();
    for (const key of sortedKeys) {
      if (!ignoredKeys.has(key)) {
        clean[key] = this._cleanForHashing(obj[key]);
      }
    }
    return clean;
  },

  /**
   * Obtiene la cola de cambios pendientes de un docente
   */
  _getSyncQueue(teacherId) {
    const tid = teacherId || 'usr_manuel';
    if (this._syncQueue && Array.isArray(this._syncQueue[tid])) {
      return this._syncQueue[tid];
    }
    const key = this._getQueueKey(tid);
    let queue = [];
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(key);
        if (raw) queue = JSON.parse(raw);
      }
    } catch (e) {}
    if (!Array.isArray(queue)) queue = [];
    this._syncQueue = this._syncQueue || {};
    this._syncQueue[tid] = queue;
    return queue;
  },

  /**
   * Guarda la cola de sincronización en memoria y en almacenamiento persistente
   */
  _saveSyncQueue(teacherId, queue) {
    const tid = teacherId || 'usr_manuel';
    this._syncQueue = this._syncQueue || {};
    this._syncQueue[tid] = queue;
    const key = this._getQueueKey(tid);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(queue));
      }
    } catch (e) {}
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, queue).catch(() => {});
    }

    const pendingCount = this.getPendingQueueCount(tid);
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('firestore_queue_change', {
        detail: { teacherId: tid, pendingCount, queue }
      }));
    }
  },

  /**
   * Obtiene la cantidad de cambios pendientes en la cola
   */
  getPendingQueueCount(teacherId = 'usr_manuel') {
    const queue = this._getSyncQueue(teacherId);
    return queue.filter(item => item && (item.status === 'pending' || item.status === 'error')).length;
  },

  /**
   * Encola un cambio pendiente en la cola de sincronización (upsert o delete)
   */
  enqueueChange(teacherId, change) {
    if (!change || !change.entityType || !change.entityId) return;
    const tid = teacherId || 'usr_manuel';
    this._loadKnownHashes(tid);

    const docPath = change.docPath || (
      change.entityType === 'class' ? `${this.CLASSES_COLLECTION_PATH}/${tid}_${change.entityId}` :
      change.entityType === 'plan' ? `${this.COLLECTION_PATH}/${tid}_${change.entityId}` :
      `${this.BUNDLES_COLLECTION_PATH}/${tid}`
    );

    let contentHash = null;
    if (change.action === 'upsert' && change.data) {
      contentHash = this._computeHash(change.data);
      // Si el hash coincide con lo ya sincronizado y no hay item pendiente, evitar encolar
      if (this._knownHashes[docPath] === contentHash) {
        const existingQueue = this._getSyncQueue(tid);
        const hasPending = existingQueue.some(q => q.docPath === docPath && q.status === 'pending');
        if (!hasPending) {
          return;
        }
      }
    }

    const queue = this._getSyncQueue(tid);
    const existingIdx = queue.findIndex(item => item.entityType === change.entityType && item.entityId === change.entityId);

    const queueItem = {
      id: (existingIdx >= 0 && queue[existingIdx].id) ? queue[existingIdx].id : ('q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      entityType: change.entityType,
      entityId: change.entityId,
      docPath: docPath,
      action: change.action || 'upsert',
      data: change.data ? JSON.parse(JSON.stringify(change.data)) : null,
      contentHash: contentHash,
      version: change.version || 1,
      date: change.date || (change.entityType === 'plan' ? change.entityId : null),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    if (existingIdx >= 0) {
      queue[existingIdx] = queueItem;
    } else {
      queue.push(queueItem);
    }

    this._saveSyncQueue(tid, queue);

    // Si ya completó la fase inicial y Firestore está conectado, programar procesamiento incremental
    if (this.isReady() && this.isInitialSyncDone(tid)) {
      this._scheduleIncrementalSync(tid);
    }
  },

  /**
   * Programa la sincronización incremental debouncada
   */
  _scheduleIncrementalSync(teacherId) {
    const tid = teacherId || 'usr_manuel';
    if (this._syncDebounceTimers[tid]) {
      clearTimeout(this._syncDebounceTimers[tid]);
    }
    this._syncDebounceTimers[tid] = setTimeout(() => {
      this.processSyncQueue(tid).catch(err => {
        console.warn('[FirestoreService] Aviso en sync incremental programado:', err);
      });
    }, 400);
  },

  /**
   * Inicializa la conexión con Firebase Firestore
   */
  async init() {
    if (this.isInitialized && this.db) {
      return true;
    }

    if (typeof firebase === 'undefined') {
      console.info('[FirestoreService] Firebase SDK no cargado en este entorno. Operando en modo local.');
      this._updateStatus('offline', 'Modo local (SDK no disponible)');
      return false;
    }

    const config = (typeof FirebaseConfigManager !== 'undefined')
      ? FirebaseConfigManager.getConfig()
      : null;

    if (!config || !config.projectId || config.projectId.trim() === '') {
      console.info('[FirestoreService] Sin credenciales de Firebase configuradas. Operando en modo local.');
      this._updateStatus('offline', 'Modo local (Sin credenciales de nube)');
      return false;
    }

    try {
      this._updateStatus('connecting', 'Conectando con Firestore...');

      // Evitar duplicar apps de Firebase
      if (!firebase.apps || firebase.apps.length === 0) {
        this.app = firebase.initializeApp(config);
      } else {
        this.app = firebase.app();
      }

      this.db = firebase.firestore();
      
      // Ajuste de conexión óptimo para compatibilidad total con file:/// y web
      try {
        this.db.settings({
          experimentalAutoDetectLongPolling: true,
          merge: true
        });
      } catch (eSettings) {}

      // Habilitar persistencia offline SOLO si no es protocolo file:
      const isFileProtocol = (typeof window !== 'undefined' && window.location.protocol === 'file:');
      if (!isFileProtocol) {
        try {
          await this.db.enablePersistence({ synchronizeTabs: true });
        } catch (persErr) {
          try {
            await this.db.enablePersistence();
          } catch (p2) {}
        }
      }

      this.isInitialized = true;
      console.log('✅ [FirestoreService] Conectado exitosamente a Firebase Firestore:', config.projectId);

      // Iniciar escucha en tiempo real para el docente actual o Manuel Muñoz
      const currentTeacherId = (typeof UserService !== 'undefined') ? UserService.getCurrentUserId() : 'usr_manuel';
      const targetTeacherId = (currentTeacherId === 'usr_coordinacion') ? 'usr_manuel' : currentTeacherId;
      
      this._loadKnownHashes(targetTeacherId);
      this.startRealtimeSync(targetTeacherId);

      // Verificación de sincronización inicial vs incremental
      const initialDone = this.isInitialSyncDone(targetTeacherId);
      const pendingCount = this.getPendingQueueCount(targetTeacherId);

      if (!initialDone) {
        console.log(`☁️ [FirestoreService] Primera conexión para ${targetTeacherId}. Se requiere sincronización inicial.`);
        this._updateStatus('connected', 'Conectado a Firestore (Pendiente sincronización inicial)');
      } else {
        if (pendingCount > 0) {
          console.log(`☁️ [FirestoreService] Sincronización incremental para ${targetTeacherId} (${pendingCount} cambios pendientes).`);
          this._updateStatus('connected', `Conectado a Firestore (${pendingCount} pendientes)`);
          this.processSyncQueue(targetTeacherId).catch(e => console.warn('[FirestoreService] Aviso en sync incremental:', e));
        } else {
          console.log(`☁️ [FirestoreService] Todo al día para ${targetTeacherId}. 0 cambios pendientes.`);
          this._updateStatus('connected', 'Todo sincronizado');
        }
      }

      return true;
    } catch (err) {
      console.warn('[FirestoreService] Error al conectar con Firestore:', err);
      this._updateStatus('error', 'Error al conectar con Firestore: ' + (err.message || 'Error de red'));
      return false;
    }
  },

  /**
   * Actualiza y notifica el estado de la conexión a la UI
   */
  _updateStatus(status, message) {
    this.status = status;
    this.statusMessage = message;

    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const evt = new CustomEvent('firestore_status_change', {
        detail: { status, message, isReady: this.isReady(), isSyncing: this.isSyncing() }
      });
      window.dispatchEvent(evt);
    }

    // Actualizar indicador visual si existe en el DOM
    this.renderCloudStatusIndicator();
  },

  /**
   * Renderiza el indicador de estado de la nube en la cabecera
   */
  renderCloudStatusIndicator() {
    const el = document.getElementById('firestore-cloud-status-badge');
    if (!el) return;

    if (this.isSyncing()) {
      el.className = 'cloud-status-pill syncing';
      el.innerHTML = '<span class="status-dot yellow"></span> <span>Sincronizando...</span>';
      el.title = this.statusMessage;
    } else if (this.status === 'connected') {
      const pending = this.getPendingQueueCount();
      if (pending > 0) {
        el.className = 'cloud-status-pill syncing';
        el.innerHTML = `<span class="status-dot yellow"></span> <span>${pending} pendiente${pending > 1 ? 's' : ''}</span>`;
        el.title = `Conectado. Hay ${pending} cambio(s) pendiente(s) por subir a Firestore.`;
      } else {
        el.className = 'cloud-status-pill connected';
        el.innerHTML = '<span class="status-dot green"></span> <span>Nube Conectada</span>';
        el.title = 'Conexión activa con Cloud Firestore. Todo sincronizado.';
      }
    } else if (this.status === 'connecting') {
      el.className = 'cloud-status-pill connecting';
      el.innerHTML = '<span class="status-dot yellow"></span> <span>Conectando...</span>';
      el.title = 'Estableciendo enlace con Google Cloud Firestore...';
    } else if (this.status === 'error') {
      el.className = 'cloud-status-pill error';
      el.innerHTML = '<span class="status-dot red"></span> <span>Error Nube</span>';
      el.title = this.statusMessage;
    } else {
      el.className = 'cloud-status-pill offline';
      el.innerHTML = '<span class="status-dot gray"></span> <span>Modo Local</span>';
      el.title = 'Datos guardados localmente en este equipo. Haz clic para conectar con Firebase.';
    }
  },

  /**
   * Indica si Firestore está disponible para guardar o consultar
   */
  isReady() {
    return !!(this.isInitialized && this.db);
  },

  /**
   * Indica si hay una sincronización en ejecución
   */
  isSyncing() {
    return this._isSyncing || this.status === 'syncing';
  },

  /**
   * Pausa o detiene la sincronización activa a solicitud del usuario
   */
  pauseSync() {
    this._isPaused = true;
    this._isSyncing = false;
    this._updateStatus('connected', 'Sincronización detenida por el usuario');
    console.log('[FirestoreService] Sincronización detenida por el usuario.');
  },

  /**
   * Reanuda la sincronización de la cola
   */
  resumeSync(teacherId = 'usr_manuel') {
    this._isPaused = false;
    return this.processSyncQueue(teacherId);
  },

  /**
   * Obtiene la referencia al documento de una fecha específica
   */
  _getPlanDocRef(teacherId, date) {
    if (!this.db) return null;
    const docId = `${teacherId || 'usr_manuel'}_${date}`;
    return this.db.collection(this.COLLECTION_PATH).doc(docId);
  },

  /**
   * FASE A: Sincronización inicial completa (se ejecuta una única vez por docente)
   */
  async runInitialSync(teacherId = 'usr_manuel', force = false) {
    const tid = teacherId || 'usr_manuel';
    if (!this.isReady()) {
      const ok = await this.init();
      if (!ok) {
        throw new Error('No se pudo conectar a Firebase Firestore. Verifica tus credenciales.');
      }
    }

    if (!force && this.isInitialSyncDone(tid)) {
      console.log(`[FirestoreService] Sincronización inicial ya completada para ${tid}. Procesando cola incremental.`);
      return this.processSyncQueue(tid);
    }

    if (this._isSyncing) {
      console.log('[FirestoreService] Sincronización ya en curso. Omitiendo llamada concurrente.');
      return { total: 0, uploaded: 0 };
    }

    this._isSyncing = true;
    this._isPaused = false;
    this._updateStatus('syncing', 'Sincronización inicial con la nube...');

    const syncTimeoutId = setTimeout(() => {
      if (this.status === 'syncing') {
        console.warn('[FirestoreService] Timeout de seguridad en sincronización inicial');
        this._isSyncing = false;
        this._updateStatus('connected', 'Conectado a Firestore (En línea)');
      }
    }, 25000);

    try {
      this._loadKnownHashes(tid);

      // 1. Descarga e integración de datos remotos sin sobrescribir contenido local valioso
      await this._downloadRemoteForInitialSync(tid);

      // 2. Subida de registros locales a Firestore
      const uploadRes = await this._uploadLocalForInitialSync(tid);

      // 3. Limpiar cola de cambios pendientes porque todo el estado local y remoto quedó reconciliado
      this._saveSyncQueue(tid, []);
      this._saveKnownHashes(tid);

      // 4. Marcar sincronización inicial exitosa
      this.setInitialSyncDone(tid, true);

      clearTimeout(syncTimeoutId);
      this._isSyncing = false;
      this._updateStatus('connected', 'Todo sincronizado');
      console.log(`🚀 [FirestoreService] Sincronización inicial completada para ${tid}: ${uploadRes.totalClasses} clases y ${uploadRes.totalPlans} planes.`);

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('firestore_initial_sync_completed', {
          detail: { teacherId: tid, result: uploadRes }
        }));
      }

      return uploadRes;
    } catch (err) {
      clearTimeout(syncTimeoutId);
      this._isSyncing = false;
      console.error('[FirestoreService] Error en runInitialSync:', err);
      this._updateStatus('error', 'Error en sincronización inicial: ' + (err.message || err));
      throw err;
    }
  },

  /**
   * Helper de descarga para la sincronización inicial
   */
  async _downloadRemoteForInitialSync(tid) {
    if (!this.db) return;

    try {
      // Descargar planes de school_plans_v1
      const planSnap = await this.db.collection(this.COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .get();

      planSnap.forEach(doc => {
        const cloudPlan = doc.data();
        if (cloudPlan && cloudPlan.date) {
          const docPath = `${this.COLLECTION_PATH}/${doc.id}`;
          this._knownHashes[docPath] = this._computeHash(cloudPlan);
          this._mergeCloudPlanToLocal(tid, cloudPlan.date, cloudPlan);
        }
      });

      // Descargar clases individuales de school_classes_v1
      const classSnap = await this.db.collection(this.CLASSES_COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .get();

      classSnap.forEach(doc => {
        const cloudCls = doc.data();
        if (cloudCls && cloudCls.id && typeof ClassRepository !== 'undefined') {
          if (ClassRepository.isDeletedClass && ClassRepository.isDeletedClass(cloudCls.id, tid)) {
            // Eliminar de Firestore si estaba eliminada localmente
            this.db.collection(this.CLASSES_COLLECTION_PATH).doc(`${tid}_${cloudCls.id}`).delete().catch(() => {});
            return;
          }
          const docPath = `${this.CLASSES_COLLECTION_PATH}/${doc.id}`;
          this._knownHashes[docPath] = this._computeHash(cloudCls);
          ClassRepository.saveClass(cloudCls, tid, { skipCloud: true });
        }
      });
    } catch (e) {
      console.warn('[FirestoreService] Aviso al descargar datos para sincronización inicial:', e.message);
    }
  },

  /**
   * Helper de subida para la sincronización inicial
   */
  async _uploadLocalForInitialSync(tid) {
    let plans = {};
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getAllPlans) {
      plans = PlanRepository.getAllPlans(tid) || {};
    }
    if ((!plans || Object.keys(plans).length === 0) && typeof StorageService !== 'undefined' && StorageService.getAllPlans) {
      plans = StorageService.getAllPlans() || {};
    }

    let allClasses = (typeof ClassRepository !== 'undefined' && ClassRepository.getAllClasses)
      ? ClassRepository.getAllClasses(tid)
      : [];

    if (allClasses.length === 0 && Object.keys(plans).length > 0) {
      Object.keys(plans).forEach(d => {
        const p = plans[d];
        if (p && Array.isArray(p.classes)) {
          p.classes.forEach(c => {
            if (c) {
              if (!c.date) c.date = d;
              if (!c.teacherId) c.teacherId = tid;
              allClasses.push(c);
            }
          });
        }
      });
    }

    const profile = (typeof StorageService !== 'undefined') ? StorageService.getProfile() : {};
    const dates = Object.keys(plans);

    // 1. Guardar Bundle Maestro
    const bundleRef = this.db.collection(this.BUNDLES_COLLECTION_PATH).doc(tid);
    await bundleRef.set({
      teacherId: tid,
      profile: JSON.parse(JSON.stringify(profile || {})),
      cloudUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      totalClasses: allClasses.length,
      totalPlans: dates.length,
      syncSource: (typeof window !== 'undefined' && window.location.protocol === 'file:') ? 'local_file' : 'web'
    }, { merge: true }).catch(() => {});

    // 2. Operaciones de planes
    const planOps = [];
    for (const d of dates) {
      const plan = plans[d];
      if (plan && plan.classes && plan.classes.length > 0) {
        let validClasses = plan.classes;
        if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.isDeletedClass === 'function') {
          validClasses = validClasses.filter(c => !c?.id || !ClassRepository.isDeletedClass(c.id, tid));
        }
        if (typeof ClassRepository !== 'undefined' && ClassRepository.deduplicateClasses) {
          validClasses = ClassRepository.deduplicateClasses(validClasses);
        }
        if (validClasses.length > 0) {
          const docId = `${tid}_${d}`;
          const docRef = this.db.collection(this.COLLECTION_PATH).doc(docId);
          const payload = JSON.parse(JSON.stringify(plan));
          payload.classes = validClasses;
          payload.teacherId = tid;
          payload.date = d;
          payload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
          payload.syncedFromClient = true;
          planOps.push({ ref: docRef, data: payload, path: `${this.COLLECTION_PATH}/${docId}` });
        }
      }
    }

    // 3. Operaciones de clases
    const clsOps = [];
    for (const cls of allClasses) {
      if (cls && cls.id) {
        if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.isDeletedClass === 'function' && ClassRepository.isDeletedClass(cls.id, tid)) {
          continue;
        }
        const docId = `${tid}_${cls.id}`;
        const clsRef = this.db.collection(this.CLASSES_COLLECTION_PATH).doc(docId);
        const clsPayload = JSON.parse(JSON.stringify(cls));
        clsPayload.teacherId = tid;
        clsPayload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
        clsPayload.syncedFromClient = true;
        clsOps.push({ ref: clsRef, data: clsPayload, path: `${this.CLASSES_COLLECTION_PATH}/${docId}` });
      }
    }

    // 4. Ejecutar en lotes de 25
    const BATCH_LIMIT = 25;
    const allOps = [...planOps, ...clsOps];
    for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
      const chunk = allOps.slice(i, i + BATCH_LIMIT);
      try {
        const batch = this.db.batch();
        chunk.forEach(op => batch.set(op.ref, op.data, { merge: true }));
        await batch.commit();
        chunk.forEach(op => {
          this._knownHashes[op.path] = this._computeHash(op.data);
        });
      } catch (batchErr) {
        for (const op of chunk) {
          try {
            await op.ref.set(op.data, { merge: true });
            this._knownHashes[op.path] = this._computeHash(op.data);
          } catch (singleErr) {}
        }
      }
    }

    return { totalPlans: planOps.length, totalClasses: clsOps.length };
  },

  /**
   * FASE B: Sincronización incremental reactiva mediante cola de cambios (dirty queue)
   */
  async processSyncQueue(teacherId = 'usr_manuel') {
    const tid = teacherId || 'usr_manuel';
    if (!this.isReady()) {
      await this.init();
    }
    if (!this.isReady()) return { processed: 0, pending: 0 };

    // Si aún no se completó la sincronización inicial completa, delegar a Fase A
    if (!this.isInitialSyncDone(tid)) {
      return this.runInitialSync(tid);
    }

    if (this._isSyncing || this._isPaused) {
      return { processed: 0, inFlight: true };
    }

    const queue = this._getSyncQueue(tid);
    const pendingItems = queue.filter(item => item && (item.status === 'pending' || (item.status === 'error' && item.retryCount < 3)));

    if (pendingItems.length === 0) {
      this._updateStatus('connected', 'Todo sincronizado');
      return { processed: 0, pending: 0 };
    }

    this._isSyncing = true;
    this._loadKnownHashes(tid);

    const syncTimeout = setTimeout(() => {
      if (this.status === 'syncing') {
        console.warn('[FirestoreService] Timeout de seguridad en proceso incremental');
        this._isSyncing = false;
        this._updateStatus('connected', 'Conectado a Firestore (En línea)');
      }
    }, 15000);

    let processedCount = 0;

    try {
      this._updateStatus('syncing', `Sincronizando cambios (${pendingItems.length} pendientes)...`);

      // Procesar en lotes de hasta 25 operaciones
      const BATCH_LIMIT = 25;
      for (let i = 0; i < pendingItems.length; i += BATCH_LIMIT) {
        if (this._isPaused) {
          console.log('[FirestoreService] Sincronización detenida por el usuario');
          break;
        }

        const chunk = pendingItems.slice(i, i + BATCH_LIMIT);
        const batch = this.db.batch();
        const deleteOps = [];

        for (const item of chunk) {
          item.status = 'syncing';
          if (item.action === 'upsert' && item.data) {
            const parts = item.docPath.split('/');
            const col = parts[0];
            const docId = parts[1];
            const docRef = this.db.collection(col).doc(docId);
            const payload = JSON.parse(JSON.stringify(item.data));
            payload.teacherId = tid;
            payload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
            payload.syncedFromClient = true;
            batch.set(docRef, payload, { merge: true });
          } else if (item.action === 'delete') {
            const parts = item.docPath.split('/');
            const col = parts[0];
            const docId = parts[1];
            const docRef = this.db.collection(col).doc(docId);
            batch.delete(docRef);
            if (item.entityType === 'class' && item.date) {
              deleteOps.push(item);
            }
          }
        }

        try {
          await batch.commit();
          for (const item of chunk) {
            item.status = 'synced';
            item.syncedAt = new Date().toISOString();
            if (item.action === 'upsert' && item.contentHash) {
              this._knownHashes[item.docPath] = item.contentHash;
            } else if (item.action === 'delete') {
              delete this._knownHashes[item.docPath];
            }
            processedCount++;
          }
        } catch (batchErr) {
          console.warn('[FirestoreService] Error en lote batch incremental, procesando uno a uno:', batchErr.message);
          for (const item of chunk) {
            if (this._isPaused) break;
            try {
              const parts = item.docPath.split('/');
              const col = parts[0];
              const docId = parts[1];
              const docRef = this.db.collection(col).doc(docId);
              if (item.action === 'upsert' && item.data) {
                const payload = JSON.parse(JSON.stringify(item.data));
                payload.teacherId = tid;
                payload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
                payload.syncedFromClient = true;
                await docRef.set(payload, { merge: true });
                this._knownHashes[item.docPath] = item.contentHash;
              } else if (item.action === 'delete') {
                await docRef.delete();
                delete this._knownHashes[item.docPath];
              }
              item.status = 'synced';
              item.syncedAt = new Date().toISOString();
              processedCount++;
            } catch (singleErr) {
              item.retryCount = (item.retryCount || 0) + 1;
              item.status = item.retryCount >= 3 ? 'failed' : 'error';
              item.lastError = singleErr.message;
            }
          }
        }

        // Si hay eliminaciones de clases en planes, ejecutarlas
        for (const delItem of deleteOps) {
          try {
            const planDocRef = this.db.collection(this.COLLECTION_PATH).doc(`${tid}_${delItem.date}`);
            const snap = await planDocRef.get().catch(() => null);
            if (snap && snap.exists) {
              const data = snap.data();
              if (Array.isArray(data.classes)) {
                const filtered = data.classes.filter(c => c.id !== delItem.entityId && c.classId !== delItem.entityId);
                await planDocRef.update({ classes: filtered, updatedAt: new Date().toISOString() }).catch(() => {});
              }
            }
          } catch (delErr) {}
        }
      }

      // Limpiar de la cola los elementos ya sincronizados exitosamente
      const updatedQueue = queue.filter(item => item.status !== 'synced');
      this._saveSyncQueue(tid, updatedQueue);
      this._saveKnownHashes(tid);

      clearTimeout(syncTimeout);
      this._isSyncing = false;

      const remaining = this.getPendingQueueCount(tid);
      if (remaining === 0) {
        this._updateStatus('connected', 'Todo sincronizado');
      } else {
        this._updateStatus('connected', `Sincronización incremental completada (${remaining} pendientes)`);
      }

      return { processed: processedCount, pending: remaining };
    } catch (err) {
      clearTimeout(syncTimeout);
      this._isSyncing = false;
      console.warn('[FirestoreService] Error global en processSyncQueue:', err);
      this._updateStatus('error', 'Error al sincronizar cambios: ' + (err.message || 'Error de red'));
      return { processed: processedCount, error: err.message };
    }
  },

  /**
   * Guarda o actualiza una planeación en Cloud Firestore (encolando en dirty queue)
   */
  async savePlan(teacherId, date, planData) {
    if (!date || !planData) return false;
    const tid = teacherId || 'usr_manuel';
    this.enqueueChange(tid, {
      entityType: 'plan',
      entityId: date,
      docPath: `${this.COLLECTION_PATH}/${tid}_${date}`,
      action: 'upsert',
      data: planData
    });
    return true;
  },

  /**
   * Registra una observación pedagógica o visto bueno de Coordinación en Firestore
   */
  async saveCoordinatorReview(teacherId, date, reviewData) {
    if (!this.isReady()) {
      await this.init();
    }
    if (!this.isReady() || !date) return false;

    const tid = teacherId || 'usr_manuel';
    try {
      this._updateStatus('syncing', 'Subiendo concepto pedagógico a Firestore...');
      const docRef = this._getPlanDocRef(tid, date);
      if (!docRef) {
        this._updateStatus('connected', 'Conectado a Firestore (En línea)');
        return false;
      }

      const payload = {
        coordinatorReview: {
          ...reviewData,
          cloudStampedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        cloudUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await docRef.set(payload, { merge: true });
      this._loadKnownHashes(tid);
      this._knownHashes[`${this.COLLECTION_PATH}/${tid}_${date}`] = this._computeHash(payload);
      this._saveKnownHashes(tid);

      this._updateStatus('connected', 'Visto bueno sincronizado en la nube');
      console.log(`✍️ [FirestoreService] Visto bueno de coordinación sincronizado en Firestore: ${tid} - ${date}`);
      return true;
    } catch (err) {
      console.warn('[FirestoreService] Error al guardar visto bueno en Firestore:', err.message || err);
      this._updateStatus('connected', 'Conectado a Firestore');
      return false;
    }
  },

  /**
   * Inicia escucha en tiempo real de las planeaciones de un docente con blindaje anti-eco
   */
  startRealtimeSync(teacherId) {
    if (!this.isReady()) return;
    const tid = teacherId || 'usr_manuel';

    if (this._unsubscribeListener) {
      try { this._unsubscribeListener(); } catch (e) {}
      this._unsubscribeListener = null;
    }

    try {
      console.log(`👂 [FirestoreService] Iniciando escucha en tiempo real para docente: ${tid}`);
      this._loadKnownHashes(tid);

      this._unsubscribeListener = this.db.collection(this.COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .onSnapshot((snapshot) => {
          let updatedCount = 0;

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const cloudPlan = change.doc.data();
              if (cloudPlan && cloudPlan.date) {
                const docPath = `${this.COLLECTION_PATH}/${change.doc.id}`;
                const cloudHash = this._computeHash(cloudPlan);

                // Anti-echo: Si el hash coincide con lo último conocido, ignorar evento de red
                if (this._knownHashes[docPath] === cloudHash) {
                  return;
                }

                this._knownHashes[docPath] = cloudHash;
                this._mergeCloudPlanToLocal(tid, cloudPlan.date, cloudPlan);
                updatedCount++;
              }
            }
          });

          if (updatedCount > 0) {
            this._saveKnownHashes(tid);
            console.log(`🔄 [FirestoreService] ${updatedCount} planeación(es) sincronizada(s) desde Firestore`);
            
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('plan_remote_update', {
                detail: { teacherId: tid, source: 'firestore' }
              }));
            }

            if (typeof CoordinatorView !== 'undefined' && document.getElementById('coordinator-dashboard-modal')?.classList.contains('active')) {
              CoordinatorView.renderDashboard();
            }
          }
        }, (err) => {
          console.warn('[FirestoreService] Error en listener en tiempo real:', err);
        });
    } catch (err) {
      console.warn('[FirestoreService] No se pudo activar listener en tiempo real:', err);
    }
  },

  /**
   * Determina si un texto posee contenido pedagógico real (no vacío ni placeholder)
   */
  _hasRealContent(str) {
    if (!str || typeof str !== 'string') return false;
    const clean = str.replace(/<[^>]*>/g, '').replace(/[\s\r\n\t]+/g, '').trim();
    return clean.length > 0 && clean !== 'Sintemaplaneadotodavía' && clean !== 'Sin tema planeado todavía';
  },

  /**
   * Fusiona un plan recibido de la nube con el almacenamiento local respetando versiones y evitando reemplazos destructivos (Regla 10)
   */
  _mergeCloudPlanToLocal(teacherId, date, cloudPlan) {
    if (!cloudPlan || !date) return;
    const tid = teacherId || 'usr_manuel';

    try {
      // Alinear numeración de clases entrantes de la nube según el horario oficial antes de fusionar
      if (Array.isArray(cloudPlan.classes) && typeof ClassRepository !== 'undefined' && typeof ClassRepository.getScheduleSequenceNumber === 'function') {
        cloudPlan.classes.forEach(c => {
          if (!c) return;
          const d = c.date || date;
          const schedSeq = ClassRepository.getScheduleSequenceNumber(d, c.subjectName || c.subject, c.gradeName || c.grade, tid, { requireScheduledWeekday: true });
          if (schedSeq !== null && schedSeq > 0) {
            c.sequenceNumber = schedSeq;
            c.dayNumber = String(schedSeq);
          }
        });
      }

      if (typeof PlanRepository !== 'undefined') {
        const localPlan = PlanRepository.getPlan(tid, date);
        const cloudVersion = cloudPlan.version || 1;
        const localVersion = localPlan?.version || 0;

        const localHasContent = localPlan && Array.isArray(localPlan.classes) && localPlan.classes.some(c =>
          this._hasRealContent(c.topic) || this._hasRealContent(c.description) || this._hasRealContent(c.notebookContent)
        );

        const cloudHasContent = cloudPlan && Array.isArray(cloudPlan.classes) && cloudPlan.classes.some(c =>
          this._hasRealContent(c.topic) || this._hasRealContent(c.description) || this._hasRealContent(c.notebookContent)
        );

        if (!localPlan) {
          PlanRepository.savePlan(tid, date, cloudPlan, { skipBroadcast: true, skipCloud: true });
        } else {
          // Si local tiene contenido y la nube viene vacía: PRESERVAR 100% LO LOCAL
          if (localHasContent && !cloudHasContent) {
            console.log(`[FirestoreService] Blindando contenido pedagógico local de ${date} ante nube vacía`);
            if (cloudPlan.coordinatorReview) {
              localPlan.coordinatorReview = cloudPlan.coordinatorReview;
              PlanRepository.savePlan(tid, date, localPlan, { skipBroadcast: true, skipCloud: true });
            }
          } else if (localHasContent && cloudHasContent) {
            // Ambos tienen contenido: fusionar clase por clase respetando campos reales
            if (cloudPlan.coordinatorReview) localPlan.coordinatorReview = cloudPlan.coordinatorReview;
            if (Array.isArray(cloudPlan.classes)) {
              cloudPlan.classes.forEach(cloudCls => {
                if (!cloudCls) return;
                const locIdx = localPlan.classes.findIndex(lc => lc.id === cloudCls.id || (lc.subject === cloudCls.subject && lc.grade === cloudCls.grade));
                if (locIdx >= 0) {
                  const locCls = localPlan.classes[locIdx];
                  if (cloudVersion > localVersion) {
                    localPlan.classes[locIdx] = {
                      ...locCls,
                      ...cloudCls,
                      topic: this._hasRealContent(cloudCls.topic) ? cloudCls.topic : locCls.topic,
                      description: this._hasRealContent(cloudCls.description) ? cloudCls.description : locCls.description,
                      notebookContent: this._hasRealContent(cloudCls.notebookContent) ? cloudCls.notebookContent : locCls.notebookContent
                    };
                  }
                } else {
                  localPlan.classes.push(cloudCls);
                }
              });
            }
            localPlan.version = Math.max(localVersion, cloudVersion);
            PlanRepository.savePlan(tid, date, localPlan, { skipBroadcast: true, skipCloud: true });
          } else {
            // Local no tenía contenido: aceptar cloudPlan
            PlanRepository.savePlan(tid, date, cloudPlan, { skipBroadcast: true, skipCloud: true });
          }
        }
      }

      // También guardar en ClassRepository de forma aditiva y conservativa con skipCloud: true
      if (Array.isArray(cloudPlan.classes) && typeof ClassRepository !== 'undefined' && typeof ClassRepository.saveClass === 'function') {
        cloudPlan.classes.forEach(c => {
          if (c && (c.id || c.topic)) {
            if (c.id && ClassRepository.isDeletedClass && ClassRepository.isDeletedClass(c.id, tid)) return;
            const existingCls = ClassRepository.getClass ? ClassRepository.getClass(c.id, tid) : null;
            if (existingCls) {
              const existHasContent = this._hasRealContent(existingCls.curriculum?.topic) || this._hasRealContent(existingCls.didacticSequence?.inicio) || this._hasRealContent(existingCls.description);
              const incomingHasContent = this._hasRealContent(c.topic) || this._hasRealContent(c.description) || this._hasRealContent(c.notebookContent);
              if (existHasContent && !incomingHasContent) return; // Proteger local
            }
            if (!c.date) c.date = date;
            if (!c.teacherId) c.teacherId = tid;
            if (typeof ClassRepository.getScheduleSequenceNumber === 'function') {
              const schedSeq = ClassRepository.getScheduleSequenceNumber(c.date, c.subjectName || c.subject, c.gradeName || c.grade, tid, { requireScheduledWeekday: true });
              if (schedSeq !== null && schedSeq > 0) {
                c.sequenceNumber = schedSeq;
                c.dayNumber = String(schedSeq);
              }
            }
            ClassRepository.saveClass(c, tid, { skipCloud: true });
          }
        });
      }
    } catch (e) {
      console.warn('[FirestoreService] Error al fusionar datos de nube a local:', e);
    }
  },

  /**
   * Sube todas las planeaciones y clases locales de un docente a Cloud Firestore (Fuerza Fase A)
   */
  async uploadAllLocalPlans(teacherId = 'usr_manuel') {
    return this.runInitialSync(teacherId, true);
  },

  /**
   * Descarga todas las planeaciones y clases de un docente desde Firestore y las restaura localmente
   */
  async downloadAllFromCloud(teacherId = 'usr_manuel') {
    if (!this.isReady()) {
      const ok = await this.init();
      if (!ok) {
        throw new Error('No se pudo conectar a Firebase Firestore. Verifica tus credenciales.');
      }
    }

    const tid = teacherId || 'usr_manuel';
    this._updateStatus('syncing', 'Descargando planeaciones completas desde Firestore...');

    const syncTimeoutId = setTimeout(() => {
      if (this.status === 'syncing') {
        console.warn('[FirestoreService] Timeout de descarga - restaurando estado a connected');
        this._updateStatus('connected', 'Sincronización completada');
      }
    }, 15000);

    let restoredClassesCount = 0;
    let restoredPlansCount = 0;

    try {
      this._loadKnownHashes(tid);

      // 1. Intentar restauración rápida desde el Bundle Maestro
      const bundleDoc = await this.db.collection(this.BUNDLES_COLLECTION_PATH).doc(tid).get().catch(() => null);
      if (bundleDoc && bundleDoc.exists) {
        const bundle = bundleDoc.data();
        if (bundle && bundle.profile && typeof StorageService !== 'undefined') {
          StorageService.saveProfile(bundle.profile);
        }
      }

      // 2. Descargar planes individuales de school_plans_v1
      const snapshot = await this.db.collection(this.COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .get();

      snapshot.forEach(doc => {
        const cloudPlan = doc.data();
        if (cloudPlan && cloudPlan.date) {
          const docPath = `${this.COLLECTION_PATH}/${doc.id}`;
          this._knownHashes[docPath] = this._computeHash(cloudPlan);
          this._mergeCloudPlanToLocal(tid, cloudPlan.date, cloudPlan);
          restoredPlansCount++;
        }
      });

      // 3. Descargar clases individuales de school_classes_v1
      const classSnap = await this.db.collection(this.CLASSES_COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .get();

      classSnap.forEach(doc => {
        const cloudCls = doc.data();
        if (cloudCls && cloudCls.id && typeof ClassRepository !== 'undefined') {
          if (ClassRepository.isDeletedClass && ClassRepository.isDeletedClass(cloudCls.id, tid)) {
            if (this.isReady()) {
              this.db.collection(this.CLASSES_COLLECTION_PATH).doc(`${tid}_${cloudCls.id}`).delete().catch(() => {});
            }
            return;
          }
          const docPath = `${this.CLASSES_COLLECTION_PATH}/${doc.id}`;
          this._knownHashes[docPath] = this._computeHash(cloudCls);

          const matchDateInId = cloudCls.id.match(/^cls_(\d{4})(\d{2})(\d{2})_/);
          if (matchDateInId) {
            const canonicalDate = `${matchDateInId[1]}-${matchDateInId[2]}-${matchDateInId[3]}`;
            if (cloudCls.date !== canonicalDate) {
              cloudCls.date = canonicalDate;
            }
          }
          if (typeof ClassRepository.getScheduleSequenceNumber === 'function' && cloudCls.date) {
            const schedSeq = ClassRepository.getScheduleSequenceNumber(cloudCls.date, cloudCls.subjectName || cloudCls.subject, cloudCls.gradeName || cloudCls.grade, tid, { requireScheduledWeekday: true });
            if (schedSeq !== null && schedSeq > 0) {
              cloudCls.sequenceNumber = schedSeq;
              cloudCls.dayNumber = String(schedSeq);
            }
          }
          ClassRepository.saveClass(cloudCls, tid, { skipCloud: true });
          restoredClassesCount++;
        }
      });

      if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.realignSequenceNumbersToSchedule === 'function') {
        ClassRepository.realignSequenceNumbersToSchedule(tid);
      }

      this._saveKnownHashes(tid);
      this.setInitialSyncDone(tid, true);

      this._updateStatus('connected', 'Todo sincronizado');
      console.log(`📥 [FirestoreService] Descarga exitosa: ${restoredClassesCount} clases y ${restoredPlansCount} planes obtenidos de Firestore.`);

      if (typeof window !== 'undefined') {
        try {
          if (window.Calendar && typeof window.Calendar.render === 'function') window.Calendar.render();
          if (typeof DashboardView !== 'undefined' && typeof DashboardView.render === 'function') DashboardView.render();
          if (typeof SequenceView !== 'undefined' && typeof SequenceView.render === 'function') SequenceView.render();
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('class_session_cache_hydrated'));
            window.dispatchEvent(new CustomEvent('plan_remote_update', { detail: { teacherId: tid } }));
          }
        } catch (uiErr) {}
      }

      clearTimeout(syncTimeoutId);
      return { classes: restoredClassesCount, plans: restoredPlansCount };
    } catch (err) {
      clearTimeout(syncTimeoutId);
      console.error('[FirestoreService] Error al descargar de Firestore:', err);
      this._updateStatus('error', 'Error al descargar datos de Firestore: ' + err.message);
      return { classes: 0, plans: 0 };
    }
  },

  /**
   * Elimina de forma atómica e irreversible una clase y su referencia en la nube
   */
  async deleteClassFromCloud(teacherId, classId, date) {
    if (!classId) return;
    const tid = teacherId || 'usr_manuel';
    const docPath = `${this.CLASSES_COLLECTION_PATH}/${tid}_${classId}`;

    // Registrar acción de borrado en la cola de sincronización
    this.enqueueChange(tid, {
      entityType: 'class',
      entityId: classId,
      docPath: docPath,
      action: 'delete',
      date: date
    });

    try {
      if (!this.isReady()) {
        await this.init();
      }
      if (!this.isReady()) return;

      // 1. Eliminar documento individual de school_classes_v1
      const clsDocRef = this.db.collection(this.CLASSES_COLLECTION_PATH).doc(`${tid}_${classId}`);
      await clsDocRef.delete().catch(() => {});

      // 2. Si se proporciona la fecha, remover la clase del arreglo en school_plans_v1
      if (date) {
        const planDocRef = this.db.collection(this.COLLECTION_PATH).doc(`${tid}_${date}`);
        const snap = await planDocRef.get().catch(() => null);
        if (snap && snap.exists) {
          const data = snap.data();
          if (Array.isArray(data.classes)) {
            const filtered = data.classes.filter(c => c.id !== classId && c.classId !== classId);
            await planDocRef.update({
              classes: filtered,
              updatedAt: new Date().toISOString()
            }).catch(() => {});
          }
        }
      }

      this._loadKnownHashes(tid);
      delete this._knownHashes[docPath];
      this._saveKnownHashes(tid);
      console.log(`[FirestoreService] Eliminada clase ${classId} de la nube Firestore.`);
    } catch (err) {
      console.warn('[FirestoreService] Error al eliminar clase en Firestore:', err);
    }
  }
};

if (typeof window !== 'undefined') {
  window.FirestoreService = FirestoreService;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => FirestoreService.init());
    } else {
      FirestoreService.init();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirestoreService;
}
