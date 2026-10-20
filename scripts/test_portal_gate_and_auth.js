/**
 * PRUEBA AUTOMATIZADA: PORTAL INSTITUCIONAL DE INICIO Y SEGURIDAD DE ACCESO
 * Verifica:
 * 1. Ocultamiento total de datos previos en web sin autenticación
 * 2. Tarjeta pública por defecto exclusiva para Marisol Ruiz (sin acceso admin de Manuel)
 * 3. Enlace privado aparte (#admin) para Manuel Muñoz
 * 4. Detección transparente de trabajo local desde la carpeta raíz
 * 5. Validación de contraseña institucional 'CHMD2026'
 * 6. Flujo de cierre de sesión (Logout)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando suite de pruebas: Portal Institucional & Acceso Seguro...\n');

// 1. Verificar presencia de elementos en index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

assert(indexHtml.includes('auth-locked'), 'index.html debe contener el script síncrono para auth-locked en <head>');
assert(indexHtml.includes('institutional-portal-gate'), 'index.html debe contener el contenedor #institutional-portal-gate');
assert(indexHtml.includes('gate-card-coordinator'), 'index.html debe contener la tarjeta de acceso a Coordinación');
assert(indexHtml.includes('gate-card-admin'), 'index.html debe contener la tarjeta de acceso de Administrador (#admin)');
assert(indexHtml.includes('gate-coord-password'), 'index.html debe contener el campo de contraseña institucional');
console.log('✅ 1. Estructura HTML de la pantalla de inicio institucional verificada.');

// 2. Verificar que los estilos en styles.css oculten .app-container si auth-locked está activo
const stylesCss = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

assert(stylesCss.includes('html.auth-locked body .app-container'), 'styles.css debe ocultar completamente .app-container cuando auth-locked está presente');
assert(stylesCss.includes('display: none !important;'), 'styles.css debe aplicar display: none !important');
assert(stylesCss.includes('.portal-gate-overlay'), 'styles.css debe definir .portal-gate-overlay');
console.log('✅ 2. Reglas de bloqueo visual estricto en CSS verificadas (Cero fuga de información de fondo).');

// 3. Simular entorno DOM y probar lógica de AuthModal
global.window = {
  location: {
    protocol: 'https:',
    hostname: 'planeacionesmanuel.web.app',
    hash: '',
    search: '',
    origin: 'https://planeacionesmanuel.web.app',
    pathname: '/'
  },
  history: {
    replaceState: (state, title, url) => {
      window.location.hash = url;
    }
  },
  addEventListener: () => {}
};

const sessionStorageStore = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageStore[k] || null,
  setItem: (k, v) => { sessionStorageStore[k] = String(v); },
  removeItem: (k) => { delete sessionStorageStore[k]; }
};

const classListSet = new Set();
global.document = {
  documentElement: {
    classList: {
      add: (c) => classListSet.add(c),
      remove: (c) => classListSet.delete(c),
      contains: (c) => classListSet.has(c)
    }
  },
  body: {
    classList: {
      add: (c) => classListSet.add(c),
      remove: (c) => classListSet.delete(c),
      contains: (c) => classListSet.has(c)
    }
  },
  getElementById: (id) => {
    return {
      id,
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      value: (id === 'gate-coord-password' ? 'CHMD2026' : ''),
      focus: () => {},
      select: () => {}
    };
  },
  readyState: 'complete',
  addEventListener: () => {}
};

// Cargar AuthModal
const { AuthModal } = require('../js/ui/auth-modal.js');

// Test 3.1: En web sin sesión, la pantalla se bloquea
AuthModal.checkUrlParamsOnLoad();
assert(classListSet.has('auth-locked'), 'En web sin sesión, la pantalla debe tener la clase auth-locked');
console.log('✅ 3. Web sin sesión: Bloqueo inmediato activado.');

// Test 3.2: Detección de entorno local
global.window.location.protocol = 'file:';
global.window.location.hostname = '';
const isLocal = AuthModal.isLocalEnvironment();
assert.strictEqual(isLocal, true, 'isLocalEnvironment debe devolver true en protocolo file:');

AuthModal.checkUrlParamsOnLoad();
assert(!classListSet.has('auth-locked'), 'En entorno local (file:), la pantalla NO debe quedar bloqueada');
console.log('✅ 4. Modo local (carpeta raíz): Acceso directo sin pantalla de bloqueo verificado.');

// Test 3.3: Retornar a entorno web y probar login de Marisol con contraseña correcta
global.window.location.protocol = 'https:';
global.window.location.hostname = 'planeacionesmanuel.web.app';
global.UserService = {
  verifyPassword: (id, pass) => id === 'usr_coordinacion' && pass === 'CHMD2026',
  setCurrentUser: (id) => { global.currentUser = id; },
  getCurrentUserId: () => global.currentUser || 'usr_manuel'
};
global.CoordinatorView = {
  openDashboard: (teacherId) => { global.coordinatorDashboardOpenedWith = teacherId; },
  closeDashboard: () => { global.coordinatorDashboardClosed = true; }
};
global.App = {
  renderHeaderProfile: () => {},
  showToast: (msg, type) => { global.lastToast = { msg, type }; },
  showCalendarView: () => {}
};

// Simular login con contraseña errónea
let errorAlertShown = false;
let mockErrorEl = { style: {} };
global.document.getElementById = (id) => {
  if (id === 'gate-coord-password') return { value: 'clave_invalida', select: () => {}, focus: () => {} };
  if (id === 'gate-coord-error-msg') return mockErrorEl;
  return { style: {}, classList: { add: () => {}, remove: () => {} } };
};
AuthModal.handleGateCoordinatorSubmit({ preventDefault: () => {} });
assert.strictEqual(mockErrorEl.style.display, 'block', 'Contraseña errónea debe mostrar mensaje de error');
console.log('✅ 5. Contraseña inválida rechazada correctamente.');

global.AppRouter = {
  navigateTo: (view) => { global.routerNavigatedTo = view; }
};
global.window.AppRouter = global.AppRouter;
global.Calendar = {
  render: () => { global.calendarRendered = true; }
};
global.window.Calendar = global.Calendar;

// Simular login exitoso de Marisol Ruiz
global.document.getElementById = (id) => {
  if (id === 'gate-coord-password') return { value: 'CHMD2026', select: () => {}, focus: () => {} };
  if (id === 'gate-coord-error-msg') return mockErrorEl;
  if (id === 'institutional-portal-gate') return { style: {}, classList: { add: () => {}, remove: () => {}, contains: () => true } };
  if (id === 'calendar-view') return { style: {} };
  return { style: {}, classList: { add: () => {}, remove: () => {} } };
};
AuthModal.handleGateCoordinatorSubmit({ preventDefault: () => {} });

const session = AuthModal.getSession();
assert(session, 'Debe existir una sesión activa tras el login exitoso');
assert.strictEqual(session.role, 'coordinator', 'El rol de sesión debe ser coordinator');
assert.strictEqual(session.name, 'Marisol Ruiz', 'El nombre en sesión debe ser Marisol Ruiz');
assert.strictEqual(global.currentUser, 'usr_coordinacion', 'El usuario actual en UserService debe ser usr_coordinacion');
assert.strictEqual(global.routerNavigatedTo, 'calendar', 'Debe navegar directamente al calendario de clases');
assert.strictEqual(global.calendarRendered, true, 'Debe renderizar el calendario de clases');
assert(!classListSet.has('auth-locked'), 'La pantalla debe desbloquearse tras el login de Marisol');
console.log('✅ 6. Login exitoso de Marisol Ruiz: Sesión guardada, pantalla desbloqueada y navegación al Calendario.');

// Test 3.4: Logout
AuthModal.logout();
assert.strictEqual(AuthModal.getSession(), null, 'Logout debe eliminar la sesión');
assert(classListSet.has('auth-locked'), 'Logout debe rebloquear la pantalla en entorno web');
console.log('✅ 7. Logout exitoso: Sesión eliminada y pantalla rebloqueada.');

// Test 3.5: Acceso de administrador (#admin)
global.window.location.hash = '#admin';
AuthModal.handleGateAdminDirectLogin();
const adminSession = AuthModal.getSession();
assert(adminSession, 'Debe existir sesión tras login de admin');
assert.strictEqual(adminSession.role, 'admin_teacher', 'Rol debe ser admin_teacher');
assert.strictEqual(global.currentUser, 'usr_manuel', 'Usuario debe ser usr_manuel');
assert(!classListSet.has('auth-locked'), 'Pantalla debe desbloquearse para admin');
console.log('✅ 8. Enlace aparte (#admin): Acceso directo para Manuel Muñoz verificado.');

console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100%)!');
