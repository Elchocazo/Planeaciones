/**
 * SERVICIO DE INTEGRACIÓN CON GOOGLE CLOUD FIRESTORE
 * 
 * Sincronización en tiempo real de planeaciones pedagógicas, revisiones y vistos buenos.
 * Soporta modo desconectado con fallback automático en LocalStorage / IndexedDB.
 */

const FirestoreService = {
  db: null,
  app: null,
  isInitialized: false,
  status: 'offline', // 'offline' | 'connecting' | 'connected' | 'syncing' | 'error'
  statusMessage: 'Modo local',
  _unsubscribeListener: null,
  _syncDebounceTimers: {},

  /**
   * Colección base en Firestore
   */
  COLLECTION_PATH: 'school_plans_v1',

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
      // En file:/// IndexedDB carece de Web Locks de origen y genera
      // "INTERNAL ASSERTION FAILED: Unexpected state".
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
      this._updateStatus('connected', 'Conectado a Firestore (En línea)');
      console.log('✅ [FirestoreService] Conectado exitosamente a Firebase Firestore:', config.projectId);

      // Iniciar escucha en tiempo real para el docente actual o Manuel Muñoz
      const currentTeacherId = (typeof UserService !== 'undefined') ? UserService.getCurrentUserId() : 'usr_manuel';
      const targetTeacherId = (currentTeacherId === 'usr_coordinacion') ? 'usr_manuel' : currentTeacherId;
      this.startRealtimeSync(targetTeacherId);

      // Cero barridos masivos automáticos al inicio:
      // La sincronización ocurre ÚNICAMENTE cuando el usuario guarda datos nuevos (guardar clase o plan).
      // Las descargas o subidas masivas completas quedan reservadas para los botones manuales del modal.
      console.log(`☁️ [FirestoreService] Modo bajo demanda activo para ${targetTeacherId}: sincroniza únicamente cuando hay datos nuevos.`);

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
        detail: { status, message, isReady: this.isReady() }
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

    if (this.status === 'connected') {
      el.className = 'cloud-status-pill connected';
      el.innerHTML = '<span class="status-dot green"></span> <span>Nube Conectada</span>';
      el.title = 'Conexión activa con Cloud Firestore. Sincronización en tiempo real habilitada.';
    } else if (this.status === 'syncing') {
      el.className = 'cloud-status-pill syncing';
      el.innerHTML = '<span class="status-dot yellow"></span> <span>Sincronizando...</span>';
      el.title = 'Sincronizando datos con la nube de Firestore...';
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
   * Obtiene la referencia al documento de una fecha específica
   */
  _getPlanDocRef(teacherId, date) {
    if (!this.db) return null;
    const docId = `${teacherId || 'usr_manuel'}_${date}`;
    return this.db.collection(this.COLLECTION_PATH).doc(docId);
  },

  /**
   * Guarda o actualiza una planeación en Cloud Firestore
   */
  async savePlan(teacherId, date, planData) {
    if (!this.isReady()) {
      await this.init();
    }
    if (!this.isReady() || !date || !planData) return false;

    const tid = teacherId || 'usr_manuel';

    // Limpiar debounce previo para esta fecha
    const debounceKey = `${tid}_${date}`;
    if (this._syncDebounceTimers[debounceKey]) {
      clearTimeout(this._syncDebounceTimers[debounceKey]);
    }

    return new Promise((resolve) => {
      this._syncDebounceTimers[debounceKey] = setTimeout(async () => {
        const syncTimeout = setTimeout(() => {
          if (this.status === 'syncing') {
            console.warn(`[FirestoreService] Timeout de seguridad al sincronizar fecha ${date} - restaurando estado a conectado`);
            this._updateStatus('connected', 'Conectado a Firestore (En línea)');
            resolve(true);
          }
        }, 3000);

        try {
          this._updateStatus('syncing', `Subiendo planeación del ${date}...`);
          const docRef = this._getPlanDocRef(tid, date);
          if (!docRef) {
            clearTimeout(syncTimeout);
            this._updateStatus('connected', 'Conectado a Firestore (En línea)');
            resolve(false);
            return;
          }

          // Clonar datos limpios para Firestore (sin referencias circulares ni funciones)
          const payload = JSON.parse(JSON.stringify(planData));
          payload.teacherId = tid;
          payload.date = date;
          payload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
          payload.syncedFromClient = true;

          const setPromise = docRef.set(payload, { merge: true });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout de sincronización en Firestore (3s)')), 3000)
          );
          await Promise.race([setPromise, timeoutPromise]);
          
          clearTimeout(syncTimeout);
          this._updateStatus('connected', 'Conectado a Firestore (En línea)');
          console.log(`☁️ [FirestoreService] Planeación guardada en nube: ${tid} - ${date}`);
          resolve(true);
        } catch (err) {
          clearTimeout(syncTimeout);
          console.warn('[FirestoreService] Aviso al sincronizar planeación en Firestore (datos locales protegidos):', err.message || err);
          this._updateStatus('connected', 'Conectado a Firestore (En línea)');
          resolve(false);
        }
      }, 350); // Debounce de 350ms para agrupamiento óptimo de escrituras
    });
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
    const syncTimeout = setTimeout(() => {
      if (this.status === 'syncing') {
        this._updateStatus('connected', 'Conectado a Firestore');
      }
    }, 5000);

    try {
      this._updateStatus('syncing', 'Subiendo concepto pedagógico a Firestore...');
      const docRef = this._getPlanDocRef(tid, date);
      if (!docRef) {
        clearTimeout(syncTimeout);
        return false;
      }

      const payload = {
        coordinatorReview: {
          ...reviewData,
          cloudStampedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        cloudUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const setPromise = docRef.set(payload, { merge: true });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout escribiendo visto bueno (4s)')), 4000)
      );
      await Promise.race([setPromise, timeoutPromise]);

      clearTimeout(syncTimeout);
      this._updateStatus('connected', 'Visto bueno sincronizado en la nube');
      console.log(`✍️ [FirestoreService] Visto bueno de coordinación sincronizado en Firestore: ${tid} - ${date}`);
      return true;
    } catch (err) {
      clearTimeout(syncTimeout);
      console.warn('[FirestoreService] Error al guardar visto bueno en Firestore:', err.message || err);
      this._updateStatus('connected', 'Conectado a Firestore');
      return false;
    }
  },

  /**
   * Inicia escucha en tiempo real de las planeaciones de un docente
   */
  startRealtimeSync(teacherId) {
    if (!this.isReady()) return;
    const tid = teacherId || 'usr_manuel';

    // Desuscribirse de escucha previa si existía
    if (this._unsubscribeListener) {
      try { this._unsubscribeListener(); } catch (e) {}
      this._unsubscribeListener = null;
    }

    try {
      console.log(`👂 [FirestoreService] Iniciando escucha en tiempo real para docente: ${tid}`);
      
      this._unsubscribeListener = this.db.collection(this.COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .onSnapshot((snapshot) => {
          let updatedCount = 0;

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const cloudPlan = change.doc.data();
              if (cloudPlan && cloudPlan.date) {
                this._mergeCloudPlanToLocal(tid, cloudPlan.date, cloudPlan);
                updatedCount++;
              }
            }
          });

          if (updatedCount > 0) {
            console.log(`🔄 [FirestoreService] ${updatedCount} planeación(es) sincronizada(s) desde Firestore`);
            
            // Notificar a las vistas activas para refrescar interfaz
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('plan_remote_update', {
                detail: { teacherId: tid, source: 'firestore' }
              }));
            }

            // Si está abierto el panel de coordinación, refrescarlo
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

      // También guardar en ClassRepository de forma aditiva y conservativa
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
   * Sube todas las planeaciones y clases locales de un docente a Cloud Firestore
   */
  async uploadAllLocalPlans(teacherId = 'usr_manuel') {
    if (!this.isReady()) {
      const ok = await this.init();
      if (!ok) {
        throw new Error('No se pudo conectar a Firebase Firestore. Verifica tus credenciales.');
      }
    }

    const tid = teacherId || 'usr_manuel';
    let plans = {};
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getAllPlans) {
      plans = PlanRepository.getAllPlans(tid) || {};
    }
    if ((!plans || Object.keys(plans).length === 0) && typeof StorageService !== 'undefined' && StorageService.getAllPlans) {
      plans = StorageService.getAllPlans() || {};
    }
    if ((!plans || Object.keys(plans).length === 0) && typeof UserService !== 'undefined') {
      plans = UserService.getTeacherPlans(tid) || {};
    }

    let allClasses = (typeof ClassRepository !== 'undefined' && ClassRepository.getAllClasses)
      ? ClassRepository.getAllClasses(tid)
      : [];

    // Si allClasses está vacío pero hay planes con clases, recopilarlas
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
    if (dates.length === 0 && allClasses.length === 0) {
      console.log(`[FirestoreService] 0 planeaciones locales para ${tid}. Nada que subir.`);
      return { total: 0, uploaded: 0 };
    }

    this._updateStatus('syncing', `Subiendo ${allClasses.length} clases y ${dates.length} planes a Firestore...`);

    // Timeout de seguridad: si queda en syncing más de 12s, restaurar a connected
    const syncTimeoutId = setTimeout(() => {
      if (this.status === 'syncing') {
        console.warn('[FirestoreService] Timeout de sincronización - restaurando estado a connected');
        this._updateStatus('connected', 'Sincronización completada (timeout de seguridad)');
      }
    }, 12000);

    try {
      // 1. Guardar Metadatos del Docente en Bundle Maestro (ligero y sin límite de 1MB)
      const bundleRef = this.db.collection('school_bundles_v1').doc(tid);
      const bundlePromise = bundleRef.set({
        teacherId: tid,
        profile: JSON.parse(JSON.stringify(profile || {})),
        cloudUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        totalClasses: allClasses.length,
        totalPlans: dates.length,
        syncSource: (typeof window !== 'undefined' && window.location.protocol === 'file:') ? 'local_file' : 'web'
      }, { merge: true });
      const bundleTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout escribiendo metadatos')), 6000)
      );
      await Promise.race([bundlePromise, bundleTimeout]).catch(e => console.warn('[FirestoreService] Bundle notice:', e.message));

      // 2. Preparar operaciones de planes por fecha
      const planOps = [];
      let count = 0;
      for (const d of dates) {
        const plan = plans[d];
        if (plan && plan.classes && plan.classes.length > 0) {
          const isBackupFn = (typeof ClassRepository !== 'undefined' && ClassRepository.isBackupClass)
            ? (c) => ClassRepository.isBackupClass(c)
            : (c) => false;
          let validClasses = plan.classes.filter(c => !isBackupFn(c));
          if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.isDeletedClass === 'function') {
            validClasses = validClasses.filter(c => !c?.id || !ClassRepository.isDeletedClass(c.id, tid));
          }
          if (typeof ClassRepository !== 'undefined' && ClassRepository.deduplicateClasses) {
            validClasses = ClassRepository.deduplicateClasses(validClasses);
          }
          if (validClasses.length > 0) {
            const docRef = this._getPlanDocRef(tid, d);
            const payload = JSON.parse(JSON.stringify(plan));
            payload.classes = validClasses;
            payload.teacherId = tid;
            payload.date = d;
            payload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
            planOps.push({ ref: docRef, data: payload });
            count++;
          }
        }
      }

      // 3. Preparar operaciones de clases individuales
      const clsOps = [];
      for (const cls of allClasses) {
        if (cls && cls.id) {
          if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.isDeletedClass === 'function' && ClassRepository.isDeletedClass(cls.id, tid)) {
            continue;
          }
          const clsRef = this.db.collection('school_classes_v1').doc(`${tid}_${cls.id}`);
          const clsPayload = JSON.parse(JSON.stringify(cls));
          clsPayload.teacherId = tid;
          clsPayload.cloudUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
          clsOps.push({ ref: clsRef, data: clsPayload });
        }
      }

      // 4. Ejecutar en batches pequeños de 25 ops con tolerancia y fallback individual
      const BATCH_LIMIT = 25;
      const allOps = [...planOps, ...clsOps];
      for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
        const chunk = allOps.slice(i, i + BATCH_LIMIT);
        try {
          const batch = this.db.batch();
          chunk.forEach(op => batch.set(op.ref, op.data, { merge: true }));
          const commitPromise = batch.commit();
          const commitTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout en lote batch Firestore')), 6000)
          );
          await Promise.race([commitPromise, commitTimeout]);
        } catch (batchErr) {
          console.warn(`[FirestoreService] Aviso en lote ${Math.floor(i/BATCH_LIMIT)+1}, procediendo con escritura individual:`, batchErr.message);
          for (const op of chunk) {
            try {
              await op.ref.set(op.data, { merge: true });
            } catch (singleErr) {
              console.warn('[FirestoreService] Aviso en documento individual:', singleErr.message);
            }
          }
        }
        console.log(`[FirestoreService] Lote ${Math.floor(i/BATCH_LIMIT)+1}/${Math.ceil(allOps.length/BATCH_LIMIT)} procesado (${chunk.length} ops)`);
      }

      clearTimeout(syncTimeoutId);
      this._updateStatus('connected', `¡${allClasses.length} clases y ${count} días sincronizados en la nube!`);
      console.log(`🚀 [FirestoreService] Carga masiva exitosa: ${allClasses.length} clases y ${count} planes subidos a Firestore.`);
      return { total: dates.length, uploaded: count, totalClasses: allClasses.length };
    } catch (err) {
      clearTimeout(syncTimeoutId);
      console.error('[FirestoreService] Error en uploadAllLocalPlans:', err);
      this._updateStatus('error', 'Error al subir a Firestore: ' + err.message);
      throw err;
    }
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

    // Timeout de seguridad: si queda en syncing más de 12s, restaurar a connected
    const syncTimeoutId = setTimeout(() => {
      if (this.status === 'syncing') {
        console.warn('[FirestoreService] Timeout de descarga - restaurando estado a connected');
        this._updateStatus('connected', 'Sincronización completada');
      }
    }, 12000);

    let restoredClassesCount = 0;
    let restoredPlansCount = 0;

    try {
      // 1. Intentar restauración rápida desde el Bundle Maestro
      const bundleDoc = await this.db.collection('school_bundles_v1').doc(tid).get();
      if (bundleDoc.exists) {
        const bundle = bundleDoc.data();
        if (bundle) {
          // Restaurar perfil
          if (bundle.profile && typeof StorageService !== 'undefined') {
            StorageService.saveProfile(bundle.profile);
          }

          // Restaurar clases en ClassRepository
          if (bundle.classes && Array.isArray(bundle.classes) && typeof ClassRepository !== 'undefined') {
            bundle.classes.forEach(c => {
              if (c && c.id) {
                if (ClassRepository.isDeletedClass && ClassRepository.isDeletedClass(c.id, tid)) return;
                if (typeof ClassRepository.getScheduleSequenceNumber === 'function' && c.date) {
                  const schedSeq = ClassRepository.getScheduleSequenceNumber(c.date, c.subjectName || c.subject, c.gradeName || c.grade, tid, { requireScheduledWeekday: true });
                  if (schedSeq !== null && schedSeq > 0) {
                    c.sequenceNumber = schedSeq;
                    c.dayNumber = String(schedSeq);
                  }
                }
                ClassRepository.saveClass(c, tid, { skipCloud: true });
                restoredClassesCount++;
              }
            });
          }

          // Restaurar planes en PlanRepository
          if (bundle.plans && typeof PlanRepository !== 'undefined') {
            Object.keys(bundle.plans).forEach(d => {
              const p = bundle.plans[d];
              if (p) {
                PlanRepository.savePlan(tid, d, p, { skipBroadcast: true, skipCloud: true });
                restoredPlansCount++;
              }
            });
          }
        }
      }

      // 2. Descargar planes individuales de school_plans_v1
      const snapshot = await this.db.collection(this.COLLECTION_PATH)
        .where('teacherId', '==', tid)
        .get();

      snapshot.forEach(doc => {
        const cloudPlan = doc.data();
        if (cloudPlan && cloudPlan.date) {
          this._mergeCloudPlanToLocal(tid, cloudPlan.date, cloudPlan);
          restoredPlansCount++;
        }
      });

      // 3. Descargar clases individuales de school_classes_v1
      const classSnap = await this.db.collection('school_classes_v1')
        .where('teacherId', '==', tid)
        .get();

      classSnap.forEach(doc => {
        const cloudCls = doc.data();
        if (cloudCls && cloudCls.id && typeof ClassRepository !== 'undefined') {
          if (ClassRepository.isDeletedClass && ClassRepository.isDeletedClass(cloudCls.id, tid)) {
            // Eliminar de Firestore en background si fue marcada como eliminada localmente
            if (this.isReady()) {
              this.db.collection('school_classes_v1').doc(`${tid}_${cloudCls.id}`).delete().catch(() => {});
            }
            return;
          }
          // Salvaguarda canónica: Si el ID codifica una fecha oficial (ej: cls_20261014_...), restaurar fecha canónica
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

      this._updateStatus('connected', `¡${restoredClassesCount} clases y ${restoredPlansCount} planes descargados de la nube!`);
      console.log(`📥 [FirestoreService] Descarga exitosa: ${restoredClassesCount} clases y ${restoredPlansCount} planes obtenidos de Firestore.`);

      // 4. Refrescar interfaces activas de forma segura
      if (typeof window !== 'undefined') {
        try {
          if (window.Calendar && typeof window.Calendar.render === 'function') {
            window.Calendar.render();
          }
          if (typeof DashboardView !== 'undefined' && typeof DashboardView.render === 'function') {
            DashboardView.render();
          }
          if (typeof SequenceView !== 'undefined' && typeof SequenceView.render === 'function') {
            SequenceView.render();
          }
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('class_session_cache_hydrated'));
            window.dispatchEvent(new CustomEvent('plan_remote_update', { detail: { teacherId: tid } }));
          }
        } catch (uiErr) {
          console.warn('[FirestoreService] Aviso durante refresco de UI post-descarga:', uiErr);
        }
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
    try {
      if (!this.isReady()) {
        await this.init();
      }
      if (!this.isReady()) return;

      // 1. Eliminar documento individual de school_classes_v1
      const clsDocRef = this.db.collection('school_classes_v1').doc(`${tid}_${classId}`);
      await clsDocRef.delete().catch(() => {});

      // 2. Si se proporciona la fecha, remover la clase del arreglo en school_plans_v1
      if (date) {
        const planDocRef = this.db.collection(this.COLLECTION_PATH).doc(`plan_${tid}_${date}`);
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
      console.log(`[FirestoreService] Eliminada clase ${classId} de la nube Firestore.`);
    } catch (err) {
      console.warn('[FirestoreService] Error al eliminar clase en Firestore:', err);
    }
  }
};

if (typeof window !== 'undefined') {
  window.FirestoreService = FirestoreService;

  // Inicialización automática tras cargar DOM
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
