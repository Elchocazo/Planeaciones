/**
 * MODAL DE AUTENTICACIÓN INSTITUCIONAL Y CONTROL DE ACCESO
 * Colegio Hogar Madre de Dios
 * 
 * Gestiona:
 * 1. Portal de inicio protegido (Página de inicio cover de pantalla completa)
 * 2. Acceso exclusivo de Coordinación Académica para Marisol Ruiz (contraseña: CHMD2026)
 * 3. Enlace privado de Docente & Administrador para Manuel Muñoz (#admin)
 * 4. Trabajo transparente y sin bloqueos desde el entorno local en la carpeta raíz
 */

const AuthModal = {
  SESSION_STORAGE_KEY: 'chmd_session_auth',

  /**
   * Determina si la app se ejecuta en un entorno local (carpeta raíz)
   */
  isLocalEnvironment() {
    try {
      if (typeof window === 'undefined' || !window.location) return false;
      const proto = window.location.protocol;
      const host = window.location.hostname;
      return proto === 'file:' || host === 'localhost' || host === '127.0.0.1';
    } catch (e) {
      return false;
    }
  },

  /**
   * Obtiene la sesión institucional activa
   */
  getSession() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Guarda los datos de sesión activa en sessionStorage
   */
  saveSession(sessionData) {
    try {
      const payload = {
        ...sessionData,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  },

  /**
   * Elimina la sesión activa
   */
  clearSession() {
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (e) {}
  },

  /**
   * Bloquea la interfaz de la aplicación y muestra la pantalla de inicio institucional
   */
  lockScreen() {
    document.documentElement.classList.remove('portal-gate-hidden');
    document.documentElement.classList.add('auth-locked');
    if (document.body) {
      document.body.classList.remove('portal-gate-hidden');
      document.body.classList.add('auth-locked');
    }

    const gate = document.getElementById('institutional-portal-gate');
    if (gate) {
      gate.classList.remove('hidden');
      gate.style.display = 'flex';
    }

    // Configurar qué tarjeta mostrar según la URL
    this.updateGateCardsByUrl();
  },

  /**
   * Desbloquea la interfaz de la aplicación y oculta la pantalla de inicio
   */
  unlockScreen() {
    document.documentElement.classList.add('portal-gate-hidden');
    document.documentElement.classList.remove('auth-locked');
    if (document.body) {
      document.body.classList.add('portal-gate-hidden');
      document.body.classList.remove('auth-locked');
    }

    const gate = document.getElementById('institutional-portal-gate');
    if (gate) {
      gate.classList.add('hidden');
      gate.style.display = 'none';
    }
  },

  /**
   * Determina qué tarjeta de acceso mostrar en la pantalla de inicio (#admin vs Coordinación)
   */
  updateGateCardsByUrl() {
    const cardCoord = document.getElementById('gate-card-coordinator');
    const cardAdmin = document.getElementById('gate-card-admin');
    if (!cardCoord || !cardAdmin) return;

    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const isAdminRequested = path.endsWith('/admin') || path.includes('/admin/') || hash.includes('admin') || search.includes('admin');

    if (isAdminRequested) {
      cardCoord.style.display = 'none';
      cardAdmin.style.display = 'block';
      if (document.body) document.body.classList.remove('role-coordinator-active');
      if (typeof UserService !== 'undefined') UserService.setCurrentUser('usr_manuel');
    } else {
      cardCoord.style.display = 'block';
      cardAdmin.style.display = 'none';
      setTimeout(() => {
        const passInp = document.getElementById('gate-coord-password');
        if (passInp && typeof passInp.focus === 'function') passInp.focus();
      }, 150);
    }
  },

  /**
   * Alternar a la vista de Coordinación Académica en la pantalla de inicio
   */
  showCoordinatorGate(event) {
    if (event) event.preventDefault();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#coordinacion');
    } else {
      window.location.hash = '#coordinacion';
    }
    this.updateGateCardsByUrl();
  },

  /**
   * Alternar a la vista de Administrador en la pantalla de inicio (#admin)
   */
  showAdminGate(event) {
    if (event) event.preventDefault();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#admin');
    } else {
      window.location.hash = '#admin';
    }
    this.updateGateCardsByUrl();
  },

  /**
   * Alternar visibilidad de contraseña en el formulario de la puerta de acceso
   */
  toggleGatePasswordVisibility() {
    const inp = document.getElementById('gate-coord-password');
    if (!inp) return;
    inp.type = (inp.type === 'password') ? 'text' : 'password';
  },

  /**
   * Procesa el inicio de sesión de Marisol Ruiz desde la pantalla de inicio
   */
  handleGateCoordinatorSubmit(event) {
    if (event) event.preventDefault();
    const passInput = document.getElementById('gate-coord-password');
    const errorMsg = document.getElementById('gate-coord-error-msg');
    const rawPassword = passInput ? passInput.value.trim() : '';
    const password = rawPassword.toUpperCase();

    const isValid = (password === 'CHMD2026');

    if (isValid) {
      if (errorMsg) errorMsg.style.display = 'none';

      // 1. Guardar sesión activa
      this.saveSession({
        userId: 'usr_coordinacion',
        role: 'coordinator',
        name: 'Marisol Ruiz'
      });

      // 2. Establecer usuario en el sistema
      if (typeof UserService !== 'undefined') {
        UserService.setCurrentUser('usr_coordinacion');
      }

      // 3. Activar clase de coordinación en el body para bloqueo estricto de UI
      if (document.body) {
        document.body.classList.add('role-coordinator-active');
      }

      // 4. Desbloquear pantalla
      this.unlockScreen();

      // 5. Actualizar interfaz y cabecera
      if (typeof App !== 'undefined') {
        App.renderHeaderProfile();
        App.showToast('¡Bienvenida, Coordinadora Marisol Ruiz! Modo de supervisión activo.', 'success');
      }

      // 6. NAVEGAR DIRECTAMENTE AL CALENDARIO DE CLASES DE MANUEL MUÑOZ
      const calViewEl = document.getElementById('calendar-view');
      if (calViewEl) calViewEl.style.display = 'grid';

      if (typeof AppRouter !== 'undefined' && typeof AppRouter.navigateTo === 'function') {
        AppRouter.navigateTo('calendar', { force: true });
      } else if (typeof App !== 'undefined' && App.showCalendarView) {
        App.showCalendarView();
      }

      if (window.Calendar && typeof window.Calendar.render === 'function') {
        window.Calendar.render();
      }

      // 7. Sincronizar planeaciones de Manuel Muñoz desde Firestore
      if (typeof FirestoreService !== 'undefined' && typeof FirestoreService.downloadAllFromCloud === 'function') {
        FirestoreService.downloadAllFromCloud('usr_manuel').then(() => {
          if (window.Calendar && typeof window.Calendar.render === 'function') {
            window.Calendar.render();
          }
        }).catch(() => {});
      }
    } else {
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = '❌ Contraseña incorrecta. La contraseña institucional no coincide.';
      }
      if (passInput) {
        passInput.select();
        passInput.focus();
      }
    }
  },

  /**
   * Procesa el acceso directo de Manuel Muñoz (#admin)
   */
  handleGateAdminDirectLogin() {
    this.saveSession({
      userId: 'usr_manuel',
      role: 'admin_teacher',
      name: 'Manuel Muñoz'
    });

    if (typeof UserService !== 'undefined') {
      UserService.setCurrentUser('usr_manuel');
    }

    if (document.body) {
      document.body.classList.remove('role-coordinator-active');
    }

    this.unlockScreen();

    if (typeof App !== 'undefined') {
      App.renderHeaderProfile();
      App.showToast('Sesión iniciada como Manuel Muñoz (Docente/Admin)', 'success');
      App.showCalendarView();
    }

    // Sincronizar automáticamente con Firestore si estamos en la nube o hay clases pendientes
    if (typeof FirestoreService !== 'undefined') {
      if (!FirestoreService.isReady()) {
        FirestoreService.init().then(() => {
          if (FirestoreService.isReady()) {
            FirestoreService.downloadAllFromCloud('usr_manuel').catch(() => {});
          }
        }).catch(() => {});
      } else {
        FirestoreService.downloadAllFromCloud('usr_manuel').catch(() => {});
      }
    }
  },

  /**
   * Inicia sesión con Google a través de Firebase Authentication
   */
  async signInWithGoogle() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      alert('El servicio de Firebase Auth no está disponible en este momento. Verifique su conexión a internet.');
      return;
    }

    try {
      if (typeof FirestoreService !== 'undefined' && !FirestoreService.isReady()) {
        await FirestoreService.init();
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      if (typeof App !== 'undefined') {
        App.showToast('Abriendo ventana segura de Google...', 'info');
      }

      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      console.log('✅ Google Auth exitoso:', user.displayName, user.email);

      // Guardar sesión
      this.saveSession({
        userId: 'usr_manuel',
        role: 'admin_teacher',
        name: user.displayName || 'Manuel Muñoz',
        email: user.email
      });

      if (typeof UserService !== 'undefined') {
        UserService.setCurrentUser('usr_manuel');
        const current = UserService.getCurrentUser();
        if (user.displayName) current.name = user.displayName;
        if (user.email) current.email = user.email;
        if (user.photoURL) current.photoURL = user.photoURL;
        UserService.saveUser(current);
      }

      if (document.body) {
        document.body.classList.remove('role-coordinator-active');
      }

      this.unlockScreen();

      if (typeof App !== 'undefined') {
        App.renderHeaderProfile();
        App.showToast(`¡Hola, ${user.displayName || 'Docente'}! Autenticado con Google exitosamente.`, 'success');
        App.showCalendarView();
      }

      // Sincronizar planeaciones con Firestore
      if (typeof FirestoreService !== 'undefined' && FirestoreService.isReady()) {
        FirestoreService.downloadAllFromCloud('usr_manuel').catch(() => {});
      }
    } catch (err) {
      console.error('Error durante Google Sign-in:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        if (typeof App !== 'undefined') App.showToast('Inicio de sesión con Google cancelado.', 'warning');
      } else if (err.code === 'auth/unauthorized-domain') {
        alert('Dominio no autorizado para OAuth en Firebase. Agrega tu dominio en Firebase Console (Authentication > Settings > Authorized Domains).');
      } else {
        if (typeof App !== 'undefined') App.showToast('Error de autenticación con Google: ' + (err.message || err.code), 'error');
      }
    }
  },

  /**
   * Cierra la sesión institucional y regresa a la pantalla de inicio limpia
   */
  logout() {
    this.clearSession();

    if (document.body) {
      document.body.classList.remove('role-coordinator-active');
    }
    if (typeof UserService !== 'undefined') {
      UserService.setCurrentUser('usr_manuel');
    }

    if (this.isLocalEnvironment()) {
      if (typeof App !== 'undefined') {
        App.renderHeaderProfile();
        App.showToast('Sesión local restablecida.', 'info');
      }
      return;
    }

    // Cerrar cualquier modal o vista abierta
    if (typeof CoordinatorView !== 'undefined' && CoordinatorView.closeDashboard) {
      CoordinatorView.closeDashboard();
    }

    // Bloquear pantalla y mostrar la puerta institucional
    this.lockScreen();
    this.updateGateCardsByUrl();

    // Resetear formulario de clave
    const passInput = document.getElementById('gate-coord-password');
    if (passInput) passInput.value = '';
    const err = document.getElementById('gate-coord-error-msg');
    if (err) err.style.display = 'none';

    if (typeof App !== 'undefined') {
      App.showToast('Sesión institucional cerrada.', 'info');
    }
  },

  /**
   * Inicialización y verificación síncrona/asíncrona en la carga
   */
  checkUrlParamsOnLoad() {
    const isLocal = this.isLocalEnvironment();
    const session = this.getSession();

    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const isAdminRequested = path.endsWith('/admin') || path.includes('/admin/') || hash.includes('admin') || search.includes('admin');

    if (isLocal) {
      // ENTORNO LOCAL (Carpeta raíz): Acceso directo inmediato sin bloqueo
      console.log('💻 [AuthModal] Modo local detectado. Acceso directo habilitado.');
      if (document.body) document.body.classList.remove('role-coordinator-active');
      if (typeof UserService !== 'undefined') {
        UserService.setCurrentUser('usr_manuel');
      }
      this.unlockScreen();
      // Inicializar sincronización en segundo plano con la nube Firestore
      if (typeof FirestoreService !== 'undefined' && !FirestoreService.isReady()) {
        FirestoreService.init().catch(e => console.warn('[AuthModal] Init local Firestore:', e));
      }
      return;
    }

    // ENTORNO WEB REMOTO (Hosting público)
    if (isAdminRequested) {
      // Entrada explícita a la zona de Administrador (/admin o #admin)
      if (session && session.role === 'admin_teacher') {
        console.log('👑 [AuthModal] Sesión activa de Administrador confirmada.');
        if (document.body) document.body.classList.remove('role-coordinator-active');
        if (typeof UserService !== 'undefined') {
          UserService.setCurrentUser('usr_manuel');
        }
        this.unlockScreen();
        if (typeof App !== 'undefined') {
          App.renderHeaderProfile();
        }
      } else {
        // No tiene sesión de admin o tenía sesión previa de Marisol:
        // Limpiar para evitar fuga de perfil y mostrar pantalla de acceso de administrador
        this.clearSession();
        if (document.body) document.body.classList.remove('role-coordinator-active');
        if (typeof UserService !== 'undefined') {
          UserService.setCurrentUser('usr_manuel');
        }
        this.lockScreen();
        this.updateGateCardsByUrl();
      }
    } else {
      // Acceso normal a la web pública
      if (session && session.role === 'coordinator') {
        console.log(`🔐 [AuthModal] Sesión válida encontrada: Marisol Ruiz (coordinator)`);
        if (typeof UserService !== 'undefined') {
          UserService.setCurrentUser('usr_coordinacion');
        }
        if (document.body) {
          document.body.classList.add('role-coordinator-active');
        }
        this.unlockScreen();

        setTimeout(() => {
          if (typeof App !== 'undefined') App.renderHeaderProfile();
          if (typeof AppRouter !== 'undefined' && AppRouter.navigateTo) {
            AppRouter.navigateTo('calendar');
          } else if (typeof App !== 'undefined' && App.showCalendarView) {
            App.showCalendarView();
          }
          if (window.Calendar && typeof window.Calendar.render === 'function') {
            window.Calendar.render();
          }
        }, 200);
      } else if (session && session.role === 'admin_teacher') {
        if (document.body) document.body.classList.remove('role-coordinator-active');
        if (typeof UserService !== 'undefined') {
          UserService.setCurrentUser('usr_manuel');
        }
        this.unlockScreen();
        if (typeof App !== 'undefined') App.renderHeaderProfile();
      } else {
        // Sin sesión activa: Bloquear y mostrar pantalla de inicio institucional de Marisol
        if (document.body) document.body.classList.remove('role-coordinator-active');
        if (typeof UserService !== 'undefined') {
          UserService.setCurrentUser('usr_manuel');
        }
        this.lockScreen();
        this.updateGateCardsByUrl();
      }
    }

    // Escuchar cambios de hash en tiempo real
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', () => {
        const curHash = (window.location.hash || '').toLowerCase();
        if (curHash.includes('admin')) {
          const s = this.getSession();
          if (!s || s.role !== 'admin_teacher') {
            this.clearSession();
            if (document.body) document.body.classList.remove('role-coordinator-active');
            if (typeof UserService !== 'undefined') UserService.setCurrentUser('usr_manuel');
            this.lockScreen();
            this.updateGateCardsByUrl();
          }
        } else if (!this.getSession() && !this.isLocalEnvironment()) {
          this.updateGateCardsByUrl();
        }
      });
    }
  },

  /**
   * Compatibilidad hacia atrás para llamadas a modales antiguos
   */
  openLoginModal(role = null) {
    if (!this.isLocalEnvironment() && !this.getSession()) {
      this.lockScreen();
      return;
    }
    // Si ya hay sesión pero desea abrir el modal de coordinación
    if (role === 'coordinator' && typeof CoordinatorView !== 'undefined') {
      CoordinatorView.openDashboard('usr_manuel');
    }
  },

  closeLoginModal() {
    // Si está desbloqueado, no hace nada perjudicial
  }
};

// Modal de configuración de Firebase Firestore
const FirestoreConfigModal = {
  _listenerAttached: false,

  open() {
    let modal = document.getElementById('firestore-config-modal');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('firestore-config-modal');
    }

    if (!this._listenerAttached && typeof window !== 'undefined') {
      this._listenerAttached = true;
      window.addEventListener('firestore_status_change', () => {
        const m = document.getElementById('firestore-config-modal');
        if (m && m.classList.contains('active')) {
          this.renderForm();
        }
      });
    }

    this.renderForm();
    modal.classList.add('active');
  },

  close() {
    const modal = document.getElementById('firestore-config-modal');
    if (modal) modal.classList.remove('active');
  },

  createModalDOM() {
    const div = document.createElement('div');
    div.id = 'firestore-config-modal';
    div.className = 'coordinator-modal-backdrop';
    div.style.zIndex = '3700';
    div.innerHTML = `
      <div class="coordinator-modal-card" style="max-width:620px;">
        <div class="coordinator-modal-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.4rem;">☁️</span>
            <div>
              <h3 style="margin:0; font-size:1.15rem; color:var(--slate-900); font-weight:800;">
                Sincronización en la Nube (Google Cloud Firestore)
              </h3>
              <div style="font-size:0.8rem; color:var(--slate-500);">
                Conecta la base de datos para sincronizar planeaciones y observaciones en tiempo real
              </div>
            </div>
          </div>
          <button type="button" class="btn-close-modal" onclick="FirestoreConfigModal.close()">&times;</button>
        </div>

        <div style="padding:1.25rem 1.5rem;" id="firestore-config-modal-body">
          <!-- Renderizado dinámicamente -->
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  renderForm() {
    const container = document.getElementById('firestore-config-modal-body');
    if (!container) return;

    const currentConfig = (typeof FirebaseConfigManager !== 'undefined')
      ? FirebaseConfigManager.getConfig()
      : {};

    const isConnected = (typeof FirestoreService !== 'undefined') && FirestoreService.isReady();
    const isSyncing = (typeof FirestoreService !== 'undefined') && FirestoreService.isSyncing();
    const statusMsg = (typeof FirestoreService !== 'undefined') ? FirestoreService.statusMessage : 'Modo local';
    const pendingCount = (typeof FirestoreService !== 'undefined' && typeof FirestoreService.getPendingQueueCount === 'function')
      ? FirestoreService.getPendingQueueCount('usr_manuel')
      : 0;

    let statusTitle = isConnected ? 'Conectado a Firestore' : 'Modo Local / Desconectado';
    let statusIcon = isConnected ? '🟢' : '🟡';
    if (isConnected) {
      if (isSyncing) {
        statusIcon = '⏳';
        statusTitle = 'Sincronizando con la Nube';
      } else if (pendingCount > 0) {
        statusIcon = '🟡';
        statusTitle = `Conectado (${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''})`;
      } else {
        statusIcon = '🟢';
        statusTitle = 'Todo sincronizado (Nube al día)';
      }
    }

    container.innerHTML = `
      <!-- Estado de la Nube -->
      <div style="background:${isConnected ? '#ecfdf5' : '#fffbeb'}; border:1px solid ${isConnected ? '#a7f3d0' : '#fde68a'}; border-radius:8px; padding:0.9rem; margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="font-weight:700; font-size:0.9rem; color:${isConnected ? '#065f46' : '#92400e'}; display:flex; align-items:center; gap:6px;">
            <span>${statusIcon}</span>
            <span>Estado: ${statusTitle}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--slate-500); margin-top:2px;">
            ${isSyncing ? '⏳ ' + statusMsg : '✔️ ' + statusMsg}
          </div>
        </div>

        <div style="display:flex; gap:0.4rem; align-items:center;">
          ${isSyncing ? `
            <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; background:#fee2e2; color:#b91c1c; border-color:#fca5a5;" onclick="FirestoreService.pauseSync(); FirestoreConfigModal.renderForm();" title="Detener proceso de sincronización actual">
              ⏹️ Detener
            </button>
          ` : ''}
          ${isConnected ? `
            <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem;" onclick="FirestoreConfigModal.syncNow()">
              🔄 Sincronizar Ahora
            </button>
          ` : `
            <button type="button" class="btn btn-primary btn-sm" style="font-size:0.75rem;" onclick="FirestoreConfigModal.testConnection()">
              ⚡ Conectar
            </button>
          `}
        </div>
      </div>

      <!-- Enlace para Marisol Ruiz -->
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.9rem; margin-bottom:1.25rem;">
        <div style="font-weight:700; font-size:0.85rem; color:#1e40af; margin-bottom:4px;">
          🔗 Enlace Online para Marisol Ruiz (Coordinación):
        </div>
        <div style="font-size:0.78rem; color:var(--slate-600); margin-bottom:6px;">
          Comparte este enlace directo con Marisol Ruiz. Al abrirlo, le solicitará su contraseña <strong>CHMD2026</strong> y entrará directamente al panel de revisión:
        </div>
        <div style="display:flex; gap:0.4rem;">
          <input type="text" readonly value="${(typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'https://planeacionesmanuel.web.app/#coordinacion' : (window.location.origin + window.location.pathname + '#coordinacion')}" class="form-input" style="font-size:0.8rem; background:#fff; font-family:monospace;" id="coord-share-link" />
          <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('coord-share-link').value); App.showToast('¡Enlace copiado al portapapeles!', 'success');">
            📋 Copiar
          </button>
          <a href="https://planeacionesmanuel.web.app/#coordinacion" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none; display:inline-flex; align-items:center; color:#1e40af; font-weight:700;" title="Abrir versión web oficial en una pestaña nueva">
            🌐 Abrir
          </a>
        </div>
      </div>

      <!-- Respaldo Físico y Sincronización Inmediata -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.9rem; margin-bottom:1.25rem;">
        <div style="font-weight:700; font-size:0.88rem; color:#0f172a; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
          <span>💾</span>
          <span>Seguridad de Planeaciones: Respaldo y Nube</span>
        </div>
        <div style="font-size:0.78rem; color:#64748b; margin-bottom:0.75rem;">
          Tus datos están protegidos en tu equipo. Puedes descargar una copia de seguridad física o forzar la sincronización con Firestore:
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="FirestoreConfigModal.downloadLocalBackup()" style="display:flex; align-items:center; gap:4px; font-weight:700;">
            💾 Descargar Copia JSON
          </button>
          <label class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer; font-weight:700;">
            📂 Restaurar desde JSON
            <input type="file" accept=".json" style="display:none;" onchange="FirestoreConfigModal.restoreFromFile(event)" />
          </label>
          <button type="button" class="btn btn-primary btn-sm" onclick="FirestoreConfigModal.uploadAllNow()" style="display:flex; align-items:center; gap:4px; background:#059669; border-color:#059669; font-weight:700;">
            🚀 Subir a la Nube
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="FirestoreConfigModal.syncNow()" style="display:flex; align-items:center; gap:4px; font-weight:700;">
            📥 Descargar de Nube
          </button>
        </div>
      </div>

      <!-- Formulario de Credenciales de Firebase -->
      <form onsubmit="FirestoreConfigModal.handleSave(event)">
        <div style="font-weight:700; font-size:0.88rem; color:var(--slate-800); margin-bottom:0.75rem;">
          Configuración del Proyecto de Firebase:
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">Project ID:</label>
            <input type="text" id="fb-project-id" class="form-input" style="font-size:0.82rem;" value="${currentConfig.projectId || ''}" placeholder="ej. planeacionesmanuel" required />
          </div>

          <div class="form-group" style="margin-bottom:0.75rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">API Key:</label>
            <input type="text" id="fb-api-key" class="form-input" style="font-size:0.82rem;" value="${currentConfig.apiKey || ''}" placeholder="AIzaSy..." required />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">Auth Domain:</label>
            <input type="text" id="fb-auth-domain" class="form-input" style="font-size:0.82rem;" value="${currentConfig.authDomain || ''}" placeholder="ej. planeacionesmanuel.firebaseapp.com" />
          </div>

          <div class="form-group" style="margin-bottom:0.75rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">Storage Bucket:</label>
            <input type="text" id="fb-storage-bucket" class="form-input" style="font-size:0.82rem;" value="${currentConfig.storageBucket || ''}" placeholder="ej. planeacionesmanuel.appspot.com" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">Messaging Sender ID:</label>
            <input type="text" id="fb-messaging-sender-id" class="form-input" style="font-size:0.82rem;" value="${currentConfig.messagingSenderId || ''}" placeholder="ej. 2405449859" />
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">App ID:</label>
            <input type="text" id="fb-app-id" class="form-input" style="font-size:0.82rem;" value="${currentConfig.appId || ''}" placeholder="ej. 1:2405449859:web:a1e96214cca1f657f39bb6" />
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--slate-100); padding-top:1rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="FirestoreConfigModal.uploadAllNow()">
            🚀 Subir todo ahora
          </button>

          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="FirestoreConfigModal.close()">Cerrar</button>
            <button type="submit" class="btn btn-primary">💾 Guardar Configuración</button>
          </div>
        </div>
      </form>
    `;
  },

  downloadLocalBackup() {
    if (typeof BackupService !== 'undefined' && BackupService.downloadBackup) {
      BackupService.downloadBackup('usr_manuel');
      if (typeof App !== 'undefined') App.showToast('¡Copia de seguridad descargada exitosamente en tu equipo!', 'success');
    }
  },

  async restoreFromFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        if (typeof BackupService !== 'undefined') {
          const res = await BackupService.restoreBackup(content, 'usr_manuel');
          if (res.success) {
            App.showToast('¡Planeaciones restauradas exitosamente desde el archivo!', 'success');
            if (typeof FirestoreService !== 'undefined' && FirestoreService.isReady()) {
              FirestoreService.uploadAllLocalPlans('usr_manuel').catch(() => {});
            }
          } else {
            App.showToast('Error al restaurar: ' + (res.error || 'Archivo incompatible'), 'error');
          }
        }
      };
      reader.readAsText(file);
    } catch (err) {
      if (typeof App !== 'undefined') App.showToast('Error al leer el archivo: ' + err.message, 'error');
    }
  },

  async handleSave(event) {
    event.preventDefault();
    const config = {
      projectId: document.getElementById('fb-project-id')?.value.trim() || '',
      apiKey: document.getElementById('fb-api-key')?.value.trim() || '',
      authDomain: document.getElementById('fb-auth-domain')?.value.trim() || '',
      storageBucket: document.getElementById('fb-storage-bucket')?.value.trim() || '',
      messagingSenderId: document.getElementById('fb-messaging-sender-id')?.value.trim() || '',
      appId: document.getElementById('fb-app-id')?.value.trim() || ''
    };

    if (typeof FirebaseConfigManager !== 'undefined') {
      FirebaseConfigManager.saveConfig(config);
    }

    App.showToast('Configuración guardada. Conectando con Firestore...', 'info');

    if (typeof FirestoreService !== 'undefined') {
      FirestoreService.isInitialized = false;
      const ok = await FirestoreService.init();
      if (ok) {
        App.showToast('¡Conectado exitosamente a Firebase Firestore!', 'success');
      } else {
        App.showToast('No se pudo conectar a Firestore. Revisa las credenciales ingresadas.', 'error');
      }
    }

    this.renderForm();
  },

  async testConnection() {
    if (typeof FirestoreService !== 'undefined') {
      FirestoreService.isInitialized = false;
      const ok = await FirestoreService.init();
      if (ok) {
        App.showToast('¡Conexión establecida con Firestore!', 'success');
      } else {
        App.showToast('Error al conectar. Verifica las credenciales de Firebase.', 'error');
      }
      this.renderForm();
    }
  },

  async syncNow() {
    if (typeof FirestoreService !== 'undefined' && FirestoreService.isReady()) {
      App.showToast('Sincronizando con Firestore...', 'info');
      try {
        if (!FirestoreService.isInitialSyncDone('usr_manuel')) {
          await FirestoreService.runInitialSync('usr_manuel');
          App.showToast('¡Sincronización inicial completada con la nube!', 'success');
        } else {
          const pending = FirestoreService.getPendingQueueCount('usr_manuel');
          if (pending > 0) {
            await FirestoreService.processSyncQueue('usr_manuel');
            App.showToast(`¡${pending} cambio(s) pendiente(s) sincronizado(s)!`, 'success');
          } else {
            await FirestoreService.downloadAllFromCloud('usr_manuel');
            App.showToast('¡Todo sincronizado con la nube!', 'success');
          }
        }
        if (typeof CoordinatorView !== 'undefined' && document.getElementById('coordinator-dashboard-modal')?.classList.contains('active')) {
          CoordinatorView.renderDashboard();
        }
      } catch (e) {
        App.showToast('Error durante la sincronización: ' + e.message, 'error');
      }
      this.renderForm();
    }
  },

  async uploadAllNow() {
    if (typeof FirestoreService !== 'undefined') {
      try {
        App.showToast('Subiendo todas las planeaciones locales a Firestore...', 'info');
        const res = await FirestoreService.uploadAllLocalPlans('usr_manuel');
        App.showToast(`¡${res.uploaded} planeaciones subidas con éxito a la nube!`, 'success');
      } catch (e) {
        App.showToast('Error al subir: ' + e.message, 'error');
      }
      this.renderForm();
    }
  }
};

if (typeof window !== 'undefined') {
  window.AuthModal = AuthModal;
  window.FirestoreConfigModal = FirestoreConfigModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthModal.checkUrlParamsOnLoad());
  } else {
    AuthModal.checkUrlParamsOnLoad();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthModal, FirestoreConfigModal };
}
