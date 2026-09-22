/**
 * ESTADO CENTRAL DE LA APLICACIÓN (AppState)
 * Separa de forma estricta el estado de la interfaz del DOM y de la persistencia.
 */

class AppStateClass {
  constructor() {
    this._state = {
      currentTeacherId: 'usr_manuel',
      currentDate: new Date().toISOString().slice(0, 10),
      currentClassId: null,
      currentView: 'dashboard', // 'dashboard' | 'calendar' | 'editor' | 'sequences' | 'settings' | 'notebook'
      currentPeriod: '1°',
      isDirty: false,
      saveStatus: 'saved', // 'saved' | 'saving' | 'dirty' | 'error'
      lastSavedAt: null
    };
    this._listeners = new Set();
  }

  get(key) {
    return this._state[key];
  }

  getAll() {
    return { ...this._state };
  }

  set(key, value) {
    if (this._state[key] === value) return;
    const prev = { ...this._state };
    this._state[key] = value;
    this._notify(key, value, prev);
  }

  setMultiple(updates = {}) {
    const prev = { ...this._state };
    let hasChanges = false;
    Object.keys(updates).forEach(k => {
      if (this._state[k] !== updates[k]) {
        this._state[k] = updates[k];
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this._notify('*', this._state, prev);
    }
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify(changedKey, newVal, prevState) {
    this._listeners.forEach(cb => {
      try {
        cb(this._state, changedKey, newVal, prevState);
      } catch (e) {
        console.error('[AppState] Error en listener:', e);
      }
    });
  }
}

const AppState = new AppStateClass();

if (typeof window !== 'undefined') {
  window.AppState = AppState;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppState;
}
