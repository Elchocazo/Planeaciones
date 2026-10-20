/**
 * CONFIGURACIÓN DE FIREBASE Y FIRESTORE
 * 
 * Permite la persistencia de planeaciones en Google Cloud Firestore y la sincronización
 * en tiempo real entre docentes y el perfil de coordinación de Marisol Ruiz.
 */

// Credenciales institucionales por defecto
const INSTITUTIONAL_AUTH = {
  COORDINATOR: {
    id: 'usr_coordinacion',
    name: 'Marisol Ruiz',
    role: 'coordinator',
    password: 'CHMD2026',
    email: 'marisol.ruiz@hogarmadrededios.edu.co',
    institution: 'COLEGIO HOGAR MADRE DE DIOS'
  }
};

// Configuración de Firebase Firestore del proyecto planeacionesmanuel
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDwYGiQfwoS4RbrwgHUMUabI6v1mxf4Gg8",
  authDomain: "planeacionesmanuel.firebaseapp.com",
  projectId: "planeacionesmanuel",
  storageBucket: "planeacionesmanuel.firebasestorage.app",
  messagingSenderId: "2405449859",
  appId: "1:2405449859:web:a1e96214cca1f657f39bb6",
  measurementId: "G-EHQXLTLDVS"
};

const FirebaseConfigManager = {
  STORAGE_KEY: 'school_planner_firebase_config_v1',

  /**
   * Obtiene la configuración activa de Firebase
   */
  getConfig() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.projectId) {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[FirebaseConfig] Error al leer configuración guardada:', e);
    }
    return DEFAULT_FIREBASE_CONFIG;
  },

  /**
   * Guarda una nueva configuración de Firebase
   */
  saveConfig(config) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('[FirebaseConfig] Error al guardar configuración:', e);
      return false;
    }
  },

  /**
   * Verifica si hay una configuración válida
   */
  hasValidConfig() {
    const cfg = this.getConfig();
    return !!(cfg && cfg.projectId && cfg.projectId.trim() !== '' && cfg.apiKey && cfg.apiKey.trim() !== '');
  },

  /**
   * Limpia la configuración almacenada
   */
  clearConfig() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

if (typeof window !== 'undefined') {
  window.INSTITUTIONAL_AUTH = INSTITUTIONAL_AUTH;
  window.FirebaseConfigManager = FirebaseConfigManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INSTITUTIONAL_AUTH, FirebaseConfigManager };
}
