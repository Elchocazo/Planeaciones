/**
 * MÓDULO DE GESTIÓN DE USUARIOS Y ROLES INSTITUCIONALES (LocalStorage)
 * Soporta: Administrador/Docente, Coordinador Académico y Docentes.
 */

const STORAGE_USERS_KEY = 'school_teachers_users_v2';
const STORAGE_CURRENT_USER_KEY = 'school_current_active_user_v2';

// Roles disponibles en la plataforma institucional
const USER_ROLES = {
  ADMIN_TEACHER: {
    id: 'admin_teacher',
    name: 'Administrador / Docente',
    badgeClass: 'badge-role-admin',
    icon: '👑',
    canManageUsers: true,
    canReviewAll: true,
    canDownloadAll: true,
    canPlanClasses: true
  },
  COORDINATOR: {
    id: 'coordinator',
    name: 'Coordinación Académica',
    badgeClass: 'badge-role-coordinator',
    icon: '🎓',
    canManageUsers: false,
    canReviewAll: true,
    canDownloadAll: true,
    canPlanClasses: false
  },
  TEACHER: {
    id: 'teacher',
    name: 'Docente',
    badgeClass: 'badge-role-teacher',
    icon: '👨‍🏫',
    canManageUsers: false,
    canReviewAll: false,
    canDownloadAll: false,
    canPlanClasses: true
  }
};

// Usuarios predeterminados del colegio
const DEFAULT_SYSTEM_USERS = [
  {
    id: 'usr_manuel',
    name: 'Manuel Muñoz',
    role: 'admin_teacher',
    email: 'manuel.munoz@hogarmadrededios.edu.co',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    homeroom: '7°',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    period: '1°',
    grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'],
    subjects: [
      { name: 'Matemáticas', grades: ['2°', '3°', '7°'] },
      { name: 'Sistemas', grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
      { name: 'Lógica', grades: ['6°'] },
      { name: 'Robótica', grades: ['9°', '10°', '11°'] },
      { name: 'Dirección de grupo', grades: ['7°'] }
    ],
    weeklySchedule: {
      "1": [
        { time: '7:00 - 7:50', subject: 'Dirección de grupo', grade: '7°' },
        { time: '7:50 - 8:40', subject: 'Sistemas', grade: '7°' },
        { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '2°' },
        { time: '11:50 - 1:20', subject: 'Robótica', grade: '9°' }
      ],
      "2": [
        { time: '7:00 - 7:50', subject: 'Sistemas', grade: '3°' },
        { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '7°' },
        { time: '10:10 - 11:00', subject: 'Sistemas', grade: '8°' },
        { time: '11:00 - 11:50', subject: 'Lógica', grade: '6°' },
        { time: '12:35 - 2:00', subject: 'Robótica', grade: '10°' }
      ],
      "3": [
        { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '3°' },
        { time: '10:10 - 11:00', subject: 'Sistemas', grade: '5°' },
        { time: '11:00 - 12:35', subject: 'Matemáticas', grade: '7°' }
      ],
      "4": [
        { time: '7:00 - 8:40', subject: 'Matemáticas', grade: '2°' },
        { time: '8:40 - 9:30', subject: 'Sistemas', grade: '4°B' },
        { time: '10:10 - 11:00', subject: 'Sistemas', grade: '1°' },
        { time: '11:00 - 11:50', subject: 'Sistemas', grade: '6°' },
        { time: '12:35 - 2:00', subject: 'Robótica', grade: '11°' }
      ],
      "5": [
        { time: '7:50 - 8:40', subject: 'Sistemas', grade: '2°' },
        { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '3°' },
        { time: '11:00 - 11:50', subject: 'Sistemas', grade: '4°A' },
        { time: '11:50 - 12:35', subject: 'Matemáticas', grade: '7°' },
        { time: '12:35 - 1:20', subject: 'Dirección de grupo', grade: '7°' }
      ],
      academicStartDate: '2026-09-01'
    }
  },
  {
    id: 'usr_coordinacion',
    name: 'Coordinación Académica',
    role: 'coordinator',
    email: 'coordinacion@hogarmadrededios.edu.co',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    homeroom: 'Supervisión General',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'],
    subjects: [],
    weeklySchedule: {}
  },
  {
    id: 'usr_docente_ciencias',
    name: 'Prof. Carlos Mendoza',
    role: 'teacher',
    email: 'carlos.mendoza@hogarmadrededios.edu.co',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    homeroom: '8°',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    grades: ['6°', '7°', '8°', '9°', '10°', '11°'],
    subjects: [
      { name: 'Ciencias Naturales', grades: ['6°', '7°', '8°'] },
      { name: 'Biología', grades: ['9°', '10°', '11°'] },
      { name: 'Química', grades: ['10°', '11°'] }
    ],
    weeklySchedule: {
      "1": [
        { subject: 'Ciencias Naturales', grade: '6°' },
        { subject: 'Biología', grade: '9°' },
        { subject: 'Química', grade: '10°' }
      ],
      "2": [
        { subject: 'Ciencias Naturales', grade: '7°' },
        { subject: 'Ciencias Naturales', grade: '8°' },
        { subject: 'Química', grade: '11°' }
      ],
      "3": [
        { subject: 'Biología', grade: '10°' },
        { subject: 'Ciencias Naturales', grade: '6°' }
      ],
      "4": [
        { subject: 'Ciencias Naturales', grade: '8°' },
        { subject: 'Biología', grade: '9°' },
        { subject: 'Química', grade: '10°' }
      ],
      "5": [
        { subject: 'Química', grade: '11°' },
        { subject: 'Biología', grade: '10°' },
        { subject: 'Ciencias Naturales', grade: '7°' }
      ]
    }
  },
  {
    id: 'usr_docente_lenguaje',
    name: 'Prof. Laura Gómez',
    role: 'teacher',
    email: 'laura.gomez@hogarmadrededios.edu.co',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    homeroom: '6°',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°'],
    subjects: [
      { name: 'Lengua Castellana', grades: ['4°A', '4°B', '5°', '6°', '7°'] },
      { name: 'Comprensión Lectora', grades: ['4°A', '4°B', '6°', '7°'] },
      { name: 'Inglés', grades: ['1°', '2°', '3°'] }
    ],
    weeklySchedule: {
      "1": [
        { subject: 'Lengua Castellana', grade: '6°' },
        { subject: 'Lengua Castellana', grade: '7°' },
        { subject: 'Inglés', grade: '1°' }
      ],
      "2": [
        { subject: 'Comprensión Lectora', grade: '6°' },
        { subject: 'Lengua Castellana', grade: '5°' },
        { subject: 'Inglés', grade: '2°' }
      ],
      "3": [
        { subject: 'Lengua Castellana', grade: '4°A' },
        { subject: 'Lengua Castellana', grade: '4°B' },
        { subject: 'Inglés', grade: '3°' }
      ],
      "4": [
        { subject: 'Lengua Castellana', grade: '6°' },
        { subject: 'Comprensión Lectora', grade: '7°' },
        { subject: 'Lengua Castellana', grade: '5°' }
      ],
      "5": [
        { subject: 'Inglés', grade: '2°' },
        { subject: 'Lengua Castellana', grade: '7°' },
        { subject: 'Comprensión Lectora', grade: '4°A' }
      ]
    }
  }
];

window.USER_ROLES = USER_ROLES;

const UserService = {
  /**
   * Obtiene todos los usuarios registrados
   */
  getAllUsers() {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (!data) {
        this.saveAllUsers(DEFAULT_SYSTEM_USERS);
        return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error al obtener usuarios:', e);
      return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
    }
  },

  /**
   * Guarda el arreglo completo de usuarios
   */
  saveAllUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error al guardar usuarios:', e);
      return false;
    }
  },

  /**
   * Obtiene el ID del usuario actualmente activo
   */
  getCurrentUserId() {
    const id = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return id || 'usr_manuel';
  },

  /**
   * Obtiene el objeto de usuario actualmente activo
   */
  getCurrentUser() {
    const currentId = this.getCurrentUserId();
    const users = this.getAllUsers();
    const user = users.find(u => u.id === currentId);
    if (user) return user;
    return users[0] || DEFAULT_SYSTEM_USERS[0];
  },

  /**
   * Establece el usuario activo en sesión
   */
  setCurrentUser(userId) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, userId);
    
    // Sincronizar el perfil actual con StorageService para mantener compatibilidad
    const user = this.getUserById(userId);
    if (user) {
      StorageService.saveProfile(user);
    }
  },

  /**
   * Obtiene un usuario por ID
   */
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  },

  /**
   * Guarda o actualiza un usuario
   */
  saveUser(userData) {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === userData.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      userData.id = userData.id || ('usr_' + Date.now());
      users.push(userData);
    }

    this.saveAllUsers(users);

    // Si es el usuario actual, actualizar también en StorageService
    if (userData.id === this.getCurrentUserId()) {
      StorageService.saveProfile(userData);
    }

    return userData;
  },

  /**
   * Elimina un usuario por ID (no permite eliminar el admin principal)
   */
  deleteUser(userId) {
    if (userId === 'usr_manuel') {
      alert('No es posible eliminar el perfil de Administrador Principal.');
      return false;
    }

    let users = this.getAllUsers();
    users = users.filter(u => u.id !== userId);
    this.saveAllUsers(users);

    // Si el usuario eliminado era el actual, cambiar a Manuel Muñoz
    if (this.getCurrentUserId() === userId) {
      this.setCurrentUser('usr_manuel');
    }

    return true;
  },

  /**
   * Clave de almacenamiento de planeaciones para un usuario específico
   */
  getPlansStorageKey(userId) {
    return `teacher_planner_plans_${userId}_v2`;
  },

  _plansCache: {},
  _idbInitialized: false,

  /**
   * Inicializa la sincronización en segundo plano con IndexedDB (Alta Capacidad tipo Docs)
   */
  initIDBSync() {
    if (typeof IDBStorage === 'undefined' || !IDBStorage.isSupported()) return;
    IDBStorage.init().then(async () => {
      const currentUserId = this.getCurrentUserId ? this.getCurrentUserId() : 'usr_manuel';
      const key = this.getPlansStorageKey(currentUserId);
      const storedPlans = await IDBStorage.get(key);
      if (storedPlans && typeof storedPlans === 'object' && Object.keys(storedPlans).length > 0) {
        if (!this._plansCache) this._plansCache = {};
        this._plansCache[currentUserId] = {
          ...(this._plansCache[currentUserId] || {}),
          ...storedPlans
        };
      } else {
        // Primera vez con IndexedDB: migrar datos existentes
        const localPlans = this.getTeacherPlans(currentUserId);
        if (localPlans && Object.keys(localPlans).length > 0) {
          await IDBStorage.set(key, localPlans);
        }
      }
      this._idbInitialized = true;
    }).catch(err => {
      console.warn('[UsersService] Error en sincronización inicial de IndexedDB:', err);
    });
  },

  /**
   * Obtiene todas las planeaciones de un docente específico
   */
  getTeacherPlans(userId) {
    if (!this._plansCache) this._plansCache = {};
    if (this._plansCache[userId] && Object.keys(this._plansCache[userId]).length > 0) {
      return JSON.parse(JSON.stringify(this._plansCache[userId]));
    }

    try {
      const key = this.getPlansStorageKey(userId);

      // Priorizar respaldo completo e íntegro de sessionStorage (evita cualquier truncamiento de LocalStorage)
      try {
        const fromSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`backup_${key}`) : null;
        if (fromSession) {
          const parsedSession = JSON.parse(fromSession);
          if (parsedSession && Object.keys(parsedSession).length > 0) {
            this._plansCache[userId] = parsedSession;
            return JSON.parse(JSON.stringify(parsedSession));
          }
        }
      } catch (eS) {}

      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this._plansCache[userId] = parsed;
        return JSON.parse(JSON.stringify(parsed));
      }

      // Compatibilidad con el almacenamiento legacy para Manuel Muñoz
      if (userId === 'usr_manuel') {
        const legacyData = localStorage.getItem('teacher_planner_plans_v1');
        if (legacyData) {
          const parsed = JSON.parse(legacyData);
          this._plansCache[userId] = parsed;
          this.saveTeacherPlans(userId, parsed);
          return JSON.parse(JSON.stringify(parsed));
        }
      }

      this._plansCache[userId] = {};
      return {};
    } catch (e) {
      console.error(`Error al leer planeaciones del docente ${userId}:`, e);
      return {};
    }
  },

  /**
   * Guarda todas las planeaciones de un docente específico (Alta Capacidad tipo Google Docs)
   */
  saveTeacherPlans(userId, plansData) {
    if (!this._plansCache) this._plansCache = {};
    this._plansCache[userId] = JSON.parse(JSON.stringify(plansData));

    const key = this.getPlansStorageKey(userId);

    // 1. Guardado de Alta Capacidad en IndexedDB (Gigabytes de almacenamiento ilimitado)
    if (typeof IDBStorage !== 'undefined' && IDBStorage.isSupported()) {
      IDBStorage.set(key, plansData).catch(e => {
        console.warn('[UsersService] IDB write error:', e);
      });
    }

    // 2. Liberar espacio en LocalStorage eliminando claves legacy duplicadas
    if (userId === 'usr_manuel') {
      try {
        localStorage.removeItem('teacher_planner_plans_v1');
      } catch (eClean) {}
    }

    // 3. Respaldo en LocalStorage con degradación elegante sin alertas intrusivas
    try {
      localStorage.setItem(key, JSON.stringify(plansData));
    } catch (e) {
      // Si LocalStorage alcanza su cuota física de 5MB, almacenamos un índice ligero en LocalStorage
      // mientras el documento COMPLETO permanece 100% íntegro en memoria y en IndexedDB.
      try {
        const leanPlans = {};
        Object.keys(plansData).forEach(date => {
          const p = plansData[date];
          leanPlans[date] = {
            ...p,
            classes: (p.classes || []).map(c => ({
              ...c,
              notebookContent: (c.notebookContent && c.notebookContent.length > 500)
                ? c.notebookContent.slice(0, 300) + '... <!-- [Guardado en IndexedDB] -->'
                : c.notebookContent
            }))
          };
        });
        localStorage.setItem(key, JSON.stringify(leanPlans));
      } catch (eLean) {
        // Silencioso: los datos están totalmente resguardados en IndexedDB
      }
    }

    // 4. Respaldo en sessionStorage (silencioso)
    try {
      sessionStorage.setItem(`backup_${key}`, JSON.stringify(plansData));
    } catch (eBackup) {}

    // 5. Respaldo en disco físico en segundo plano (Protocolo Anti-Pérdida)
    clearTimeout(this._diskSyncTimer);
    this._diskSyncTimer = setTimeout(() => {
      if (typeof StorageService !== 'undefined' && typeof StorageService.syncToDisk === 'function') {
        StorageService.syncToDisk();
      }
    }, 1200);

    return true;
  },

  /**
   * Guarda o actualiza la planeación de una fecha para un docente
   */
  saveTeacherPlanForDate(userId, dateStr, planData) {
    const plans = this.getTeacherPlans(userId);
    plans[dateStr] = {
      date: dateStr,
      lastUpdated: new Date().toISOString(),
      ...planData
    };
    return this.saveTeacherPlans(userId, plans);
  },

  /**
   * Registra el Visto Bueno / Retroalimentación de Coordinación para una planeación
   */
  saveCoordinatorReview(teacherId, dateStr, reviewData) {
    const plans = this.getTeacherPlans(teacherId);
    if (!plans[dateStr]) {
      plans[dateStr] = { date: dateStr, classes: [] };
    }

    const currentCoord = this.getCurrentUser();

    plans[dateStr].coordinatorReview = {
      reviewerId: currentCoord.id,
      reviewerName: currentCoord.name,
      status: reviewData.status || 'approved', // 'approved', 'approved_with_notes', 'needs_revision'
      comments: reviewData.comments || '',
      date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      stamped: true
    };

    this.saveTeacherPlans(teacherId, plans);
    return plans[dateStr].coordinatorReview;
  },

  /**
   * Obtiene resumen de planeaciones de todos los docentes
   */
  getAllTeachersAuditSummary(period = '3°') {
    const users = this.getAllUsers().filter(u => u.role !== 'coordinator');
    
    return users.map(user => {
      const plans = this.getTeacherPlans(user.id);
      const planDates = Object.keys(plans);
      
      let totalClassesPlanned = 0;
      let totalReviewed = 0;
      let pendingRevision = 0;

      planDates.forEach(date => {
        const plan = plans[date];
        if (plan && plan.classes && plan.classes.length > 0) {
          totalClassesPlanned += plan.classes.length;
          if (plan.coordinatorReview && plan.coordinatorReview.status) {
            totalReviewed++;
          } else {
            pendingRevision++;
          }
        }
      });

      return {
        user,
        totalPlansDays: planDates.length,
        totalClassesPlanned,
        totalReviewed,
        pendingRevision,
        planDates: planDates.sort(),
        status: planDates.length > 0 ? 'active' : 'empty'
      };
    });
  }
};

window.UserService = UserService;

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserService.initIDBSync());
  } else {
    UserService.initIDBSync();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserService;
}

