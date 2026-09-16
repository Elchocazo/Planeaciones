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
   * Abre o inicializa la base de datos IndexedDB
   */
  async init() {
    if (!this.isSupported()) return null;
    if (this._db) return this._db;
    if (this._initPromise) return this._initPromise;

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
          this.requestPersistence();
          resolve(this._db);
        };

        req.onerror = (e) => {
          console.warn('[IDBStorage] Error al abrir base de datos:', e.target?.error);
          resolve(null);
        };

        req.onblocked = () => {
          console.warn('[IDBStorage] Conexión bloqueada por otra pestaña');
          resolve(null);
        };
      } catch (err) {
        console.warn('[IDBStorage] Excepción en init:', err);
        resolve(null);
      }
    });

    return this._initPromise;
  },

  /**
   * Obtiene un registro por su clave
   */
  async get(key) {
    if (!this.isSupported()) return null;
    try {
      const db = await this.init();
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    } catch (e) {
      return null;
    }
  },

  /**
   * Guarda o actualiza un registro por su clave
   */
  async set(key, value) {
    if (!this.isSupported()) return false;
    try {
      const db = await this.init();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = (err) => {
            console.warn('[IDBStorage] Error al guardar registro:', err);
            resolve(false);
          };
        } catch (e) {
          console.warn('[IDBStorage] Excepción en set:', e);
          resolve(false);
        }
      });
    } catch (e) {
      return false;
    }
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
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
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
    if (!this.isSupported()) return false;
    try {
      const key = `snapshot_${userId || 'default'}_history`;
      let history = (await this.get(key)) || [];
      if (!Array.isArray(history)) history = [];
      const newSnapshot = {
        timestamp: new Date().toISOString(),
        summary: `Respaldo del ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`,
        data: snapshotData
      };
      history.unshift(newSnapshot);
      if (history.length > 20) history = history.slice(0, 20); // Conservar hasta 20 puntos de restauración
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
