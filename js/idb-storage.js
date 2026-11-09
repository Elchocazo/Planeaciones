/**
 * MOTOR DE ALMACENAMIENTO DE ALTA CAPACIDAD (IndexedDB)
 * Proporciona almacenamiento persistente de gigabytes para documentos de clase,
 * guías pedagógicas e imágenes, eliminando por completo el límite de 5MB de LocalStorage
 * y permitiendo que el Cuaderno del Docente funcione como Google Docs o Word Online.
 */

const IDBStorage = {
  dbName: 'DocentePlannerDocsDB_v1',
  dbVersion: 1,
  storeName: 'documents_store',
  _db: null,
  _initPromise: null,

  /**
   * Determina si el entorno actual soporta la API IndexedDB
   */
  isSupported() {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  },

  /**
   * Abre o inicializa la base de datos IndexedDB con auto-recuperación ante bloqueos y cierres
   */
  async init(force = false) {
    if (!this.isSupported()) return null;
    if (this._db && !force) {
      try {
        if (this._db.objectStoreNames) {
          return this._db;
        }
      } catch (e) {
        this._db = null;
      }
    }
    if (this._initPromise && !force) return this._initPromise;

    this._initPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(this.dbName, this.dbVersion);

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        req.onsuccess = (e) => {
          this._db = e.target.result;
          this._db.onclose = () => {
            this._db = null;
            this._initPromise = null;
          };
          this._db.onversionchange = () => {
            try { this._db.close(); } catch (err) {}
            this._db = null;
            this._initPromise = null;
          };
          this.requestPersistence();
          resolve(this._db);
        };

        req.onerror = (e) => {
          console.warn('[IDBStorage] Error al abrir base de datos:', e.target?.error);
          this._initPromise = null;
          resolve(null);
        };

        req.onblocked = () => {
          console.warn('[IDBStorage] Conexión bloqueada por otra pestaña');
          this._initPromise = null;
          resolve(null);
        };
      } catch (err) {
        console.warn('[IDBStorage] Excepción en init:', err);
        this._initPromise = null;
        resolve(null);
      }
    });

    return this._initPromise;
  },

  /**
   * Fuerza el cierre y la reconexión limpia con la base de datos
   */
  async reconnect() {
    if (this._db) {
      try { this._db.close(); } catch (e) {}
      this._db = null;
    }
    this._initPromise = null;
    return this.init(true);
  },

  /**
   * Obtiene un registro por su clave con soporte de auto-reconexión
   */
  async get(key) {
    if (!this.isSupported()) return null;

    const tryGet = async (isRetry = false) => {
      try {
        let db = await this.init(isRetry);
        if (!db) {
          if (!isRetry) db = await this.reconnect();
          if (!db) return null;
        }

        return await new Promise((resolve) => {
          let resolved = false;
          const done = (res) => {
            if (!resolved) {
              resolved = true;
              resolve(res);
            }
          };

          try {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(key);
            req.onsuccess = () => done(req.result !== undefined ? req.result : null);
            req.onerror = () => done(null);
            tx.onerror = () => done(null);
            tx.onabort = () => done(null);
          } catch (e) {
            if (e && (e.name === 'InvalidStateError' || e.name === 'TransactionInactiveError')) {
              this._db = null;
              this._initPromise = null;
            }
            done(null);
          }
        });
      } catch (e) {
        return null;
      }
    };

    let res = await tryGet(false);
    if (res === null && this._db === null) {
      res = await tryGet(true);
    }
    return res;
  },

  /**
   * Guarda o actualiza un registro por su clave de forma confirmada en disco
   * con auto-recuperación y blindaje de serialización (Anti-DataCloneError).
   */
  async set(key, value) {
    if (!this.isSupported()) return false;

    const tryPut = async (targetValue, isRetry = false) => {
      try {
        let db = await this.init(isRetry);
        if (!db) {
          if (!isRetry) db = await this.reconnect();
          if (!db) return false;
        }

        return await new Promise((resolve) => {
          let resolved = false;
          const done = (result) => {
            if (!resolved) {
              resolved = true;
              resolve(result);
            }
          };

          try {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            let req;
            try {
              req = store.put(targetValue, key);
            } catch (putErr) {
              if (putErr && putErr.name === 'DataCloneError') {
                try {
                  const sanitized = JSON.parse(JSON.stringify(targetValue));
                  req = store.put(sanitized, key);
                } catch (jsonErr) {
                  console.warn('[IDBStorage] Error al sanitizar valor para put:', jsonErr);
                  done(false);
                  return;
                }
              } else {
                throw putErr;
              }
            }

            let reqOk = false;
            req.onsuccess = () => {
              reqOk = true;
            };
            req.onerror = (err) => {
              console.warn('[IDBStorage] Error al guardar registro:', err.target?.error || err);
              done(false);
            };

            tx.oncomplete = () => {
              done(reqOk);
            };
            tx.onerror = (err) => {
              console.warn('[IDBStorage] Transacción fallida en set:', err.target?.error || err);
              done(false);
            };
            tx.onabort = (err) => {
              console.warn('[IDBStorage] Transacción abortada en set:', err.target?.error || err);
              done(false);
            };
          } catch (e) {
            console.warn('[IDBStorage] Excepción en set:', e && e.name, e && e.message);
            if (e && (e.name === 'InvalidStateError' || e.name === 'TransactionInactiveError' || e.name === 'NotFoundError')) {
              this._db = null;
              this._initPromise = null;
            }
            done(false);
          }
        });
      } catch (e) {
        return false;
      }
    };

    let ok = await tryPut(value, false);
    if (!ok) {
      console.warn(`[IDBStorage] Reintentando set('${key}') tras reconexión...`);
      await this.reconnect();
      let safeVal = value;
      try { safeVal = JSON.parse(JSON.stringify(value)); } catch (e) {}
      ok = await tryPut(safeVal, true);
    }
    return ok;
  },

  /**
   * Elimina un registro por su clave
   */
  async delete(key) {
    if (!this.isSupported()) return false;
    try {
      const db = await this.init();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.delete(key);
          let reqOk = false;

          req.onsuccess = () => {
            reqOk = true;
          };
          req.onerror = () => resolve(false);

          tx.oncomplete = () => {
            resolve(reqOk);
          };
          tx.onerror = () => resolve(false);
          tx.onabort = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    } catch (e) {
      return false;
    }
  },

  /**
   * Obtiene todas las claves almacenadas
   */
  async keys() {
    if (!this.isSupported()) return [];
    try {
      const db = await this.init();
      if (!db) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.getAllKeys();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    } catch (e) {
      return [];
    }
  },

  /**
   * Solicita al navegador persistencia permanente del almacenamiento (evita que el SO o navegador lo limpie)
   */
  async requestPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const granted = await navigator.storage.persist();
          if (granted) {
            console.log('[IDBStorage] Persistencia permanente de almacenamiento concedida por el navegador.');
          }
        }
      } catch (err) {
        // Silencioso
      }
    }
  },

  /**
   * Guarda una instantánea histórica de recuperación (Protocolo Anti-Pérdida de Datos)
   */
  async saveSnapshot(userId, snapshotData) {
    if (!this.isSupported() || !snapshotData) return false;
    try {
      const key = `snapshot_${userId || 'default'}_history`;
      let history = (await this.get(key)) || [];
      if (!Array.isArray(history)) history = [];

      // Evitar guardar si es idéntico al snapshot más reciente
      if (history.length > 0 && history[0].data && typeof history[0].data === 'object') {
        const lastKeys = Object.keys(history[0].data.plans || {}).length;
        const curKeys = Object.keys(snapshotData.plans || {}).length;
        if (lastKeys === curKeys && history[0].timestamp) {
          const diffMs = Date.now() - new Date(history[0].timestamp).getTime();
          // Si han pasado menos de 60 segundos y la cantidad de planes es idéntica, no saturar
          if (diffMs < 60000) return true;
        }
      }

      const newSnapshot = {
        timestamp: new Date().toISOString(),
        summary: `Respaldo del ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`,
        data: snapshotData
      };
      history.unshift(newSnapshot);
      // Conservar hasta 25 puntos de restauración para evitar rotación prematura de planeaciones previas
      if (history.length > 25) history = history.slice(0, 25);
      await this.set(key, history);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Obtiene la lista de instantáneas históricas de recuperación
   */
  async getSnapshots(userId) {
    if (!this.isSupported()) return [];
    try {
      const key = `snapshot_${userId || 'default'}_history`;
      const history = await this.get(key);
      return Array.isArray(history) ? history : [];
    } catch (e) {
      return [];
    }
  }
};

if (typeof window !== 'undefined') {
  window.IDBStorage = IDBStorage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IDBStorage;
}
