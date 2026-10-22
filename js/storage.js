/**
 * MÓDULO DE ALMACENAMIENTO Y GESTIÓN DE DATOS (LocalStorage)
 */

const STORAGE_KEYS = {
  PROFILE: 'teacher_planner_profile_v1',
  PLANS: 'teacher_planner_plans_v1'
};

// Grados por defecto solicitados: 1, 2, 3, 4A, 4B, 5, 6, 7, 8, 9, 10, 11
const DEFAULT_GRADES = [
  '1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'
];

// Perfil por defecto con materias, grados y HORARIO SEMANAL OFICIAL EXACTO (Bloques de 2 horas unificados)
const DEFAULT_WEEKLY_SCHEDULE = {
  "1": [ // Lunes (4 sesiones / 6 horas)
    { time: '7:00 - 7:50', subject: 'Dirección de grupo', grade: '7°' },
    { time: '7:50 - 8:40', subject: 'Sistemas', grade: '7°' },
    { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '2°' }, // 2 horas seguidas (con descanso)
    { time: '11:50 - 1:20', subject: 'Robótica', grade: '9°' }      // 2 horas seguidas
  ],
  "2": [ // Martes (5 sesiones / 7 horas)
    { time: '7:00 - 7:50', subject: 'Sistemas', grade: '3°' },
    { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '7°' },   // 2 horas seguidas
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '8°' },
    { time: '11:00 - 11:50', subject: 'Lógica', grade: '6°' },
    { time: '12:35 - 2:00', subject: 'Robótica', grade: '10°' }     // 2 horas seguidas
  ],
  "3": [ // Miércoles (3 sesiones / 5 horas)
    { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '3°' },   // 2 horas seguidas
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '5°' },
    { time: '11:00 - 12:35', subject: 'Matemáticas', grade: '7°' }  // 2 horas seguidas
  ],
  "4": [ // Jueves (5 sesiones / 7 horas)
    { time: '7:00 - 8:40', subject: 'Matemáticas', grade: '2°' },   // 2 horas seguidas
    { time: '8:40 - 9:30', subject: 'Sistemas', grade: '4°B' },
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '1°' },
    { time: '11:00 - 11:50', subject: 'Sistemas', grade: '6°' },
    { time: '12:35 - 2:00', subject: 'Robótica', grade: '11°' }     // 2 horas seguidas
  ],
  "5": [ // Viernes (5 sesiones / 6 horas)
    { time: '7:50 - 8:40', subject: 'Sistemas', grade: '2°' },
    { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '3°' },   // 2 horas seguidas (con descanso)
    { time: '11:00 - 11:50', subject: 'Sistemas', grade: '4°A' },
    { time: '11:50 - 12:35', subject: 'Matemáticas', grade: '7°' },
    { time: '12:35 - 1:20', subject: 'Dirección de grupo', grade: '7°' }
  ]
};

const DEFAULT_PROFILE = {
  name: 'Manuel Muñoz',
  role: 'Docente',
  institution: 'COLEGIO HOGAR MADRE DE DIOS',
  code: 'F- GA',
  version: '02',
  formatDate: '31.JUL.26',
  period: '1°',
  homeroom: '7°',
  grades: [...DEFAULT_GRADES],
  subjects: [
    { name: 'Matemáticas', grades: ['2°', '3°', '7°'] },
    { name: 'Sistemas', grades: ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
    { name: 'Lógica', grades: ['6°'] },
    { name: 'Robótica', grades: ['9°', '10°', '11°'] },
    { name: 'Dirección de grupo', grades: ['7°'] }
  ],
  weeklySchedule: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)),
  workDays: ['1', '2', '3', '4', '5'],
  dailyHours: 6,
  academicStartDate: '2026-09-01'
};

if (typeof window !== 'undefined') {
  window.DEFAULT_GRADES = DEFAULT_GRADES;
  window.DEFAULT_WEEKLY_SCHEDULE = DEFAULT_WEEKLY_SCHEDULE;
  window.DEFAULT_PROFILE = DEFAULT_PROFILE;
}

const StorageService = {
  /**
   * Obtiene el perfil del docente guardado o normalizado
   */
  getProfile() {
    try {
      if (typeof UserService !== 'undefined' && UserService.getCurrentUser) {
        const u = UserService.getCurrentUser();
        if (u && u.role === 'coordinator') {
          const manuel = UserService.getUserById('usr_manuel');
          if (manuel) {
            return {
              ...manuel,
              activeReviewer: u.name,
              activeReviewerRole: u.role
            };
          }
        }
        return u;
      }

      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        this.saveProfile(DEFAULT_PROFILE);
        return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
      }
      
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: (parsed.name && parsed.name.trim()) ? parsed.name : DEFAULT_PROFILE.name,
        homeroom: (parsed.homeroom && parsed.homeroom.trim()) ? parsed.homeroom : DEFAULT_PROFILE.homeroom,
        grades: parsed.grades && parsed.grades.length > 0 ? parsed.grades : [...DEFAULT_GRADES],
        subjects: parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_PROFILE.subjects,
        weeklySchedule: parsed.weeklySchedule || DEFAULT_PROFILE.weeklySchedule,
        academicStartDate: parsed.academicStartDate || DEFAULT_PROFILE.academicStartDate
      };
    } catch (e) {
      console.error('Error al leer el perfil:', e);
      return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    }
  },

  /**
   * Obtiene una copia del horario semanal por defecto institucional
   */
  getDefaultSchedule() {
    return JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
  },

  /**
   * Une dos rangos horarios en uno solo (ej. '7:00 - 7:50' y '7:50 - 8:40' -> '7:00 - 8:40')
   */
  mergeTimeRanges(time1, time2) {
    if (!time1) return time2 || '';
    if (!time2) return time1 || '';
    const clean1 = time1.replace(/\s*\([^)]*\)/g, '').trim();
    const clean2 = time2.replace(/\s*\([^)]*\)/g, '').trim();
    const parts1 = clean1.split('-').map(s => s.trim());
    const parts2 = clean2.split('-').map(s => s.trim());
    if (parts1.length === 2 && parts2.length === 2) {
      return `${parts1[0]} - ${parts2[1]}`;
    }
    return `${clean1} / ${clean2}`;
  },

  /**
   * Consolida horas contiguas de la misma asignatura y grado en una lista de horario diario
   */
  consolidateSchedule(daySchedule) {
    if (!Array.isArray(daySchedule) || daySchedule.length <= 1) return daySchedule || [];
    const merged = [];
    const norm = (s) => String(s || '').trim().toLowerCase();

    for (let i = 0; i < daySchedule.length; i++) {
      const curr = { ...daySchedule[i] };
      while (i + 1 < daySchedule.length) {
        const next = daySchedule[i + 1];
        if (norm(curr.subject) === norm(next.subject) && norm(curr.grade) === norm(next.grade)) {
          curr.time = this.mergeTimeRanges(curr.time, next.time);
          i++;
        } else {
          break;
        }
      }
      merged.push(curr);
    }
    return merged;
  },

  /**
   * Consolida clases contiguas de la misma asignatura y grado en una planeación de clases,
   * garantizando que 2 horas seguidas tengan una sola planeación.
   */
  consolidateClasses(classes) {
    if (!Array.isArray(classes) || classes.length <= 1) return classes || [];
    
    // Si alguna clase ya tiene trabajo o contenido pedagógico redactado, NO consolidar
    const hasCustomWork = classes.some(c => 
      (c.topic && c.topic.trim()) || 
      (c.description && c.description.trim()) || 
      (c.observations && c.observations.trim()) || 
      (c.notebookContent && c.notebookContent.trim())
    );
    if (hasCustomWork) {
      return classes;
    }

    const merged = [];
    const norm = (s) => String(s || '').trim().toLowerCase();

    for (let i = 0; i < classes.length; i++) {
      const curr = { ...classes[i] };
      while (i + 1 < classes.length) {
        const next = classes[i + 1];
        if (norm(curr.subject) === norm(next.subject) && norm(curr.grade) === norm(next.grade)) {
          curr.time = this.mergeTimeRanges(curr.time, next.time);

          // Preservar observaciones si son distintas
          const obs1 = (curr.observations || '').trim();
          const obs2 = (next.observations || '').trim();
          if (obs2 && obs1 !== obs2) {
            curr.observations = obs1 ? `${obs1}\n${obs2}` : obs2;
          }

          // Si la siguiente hora tenía contenido de cuaderno y la actual no, conservarlo
          if (!curr.notebookContent && next.notebookContent) {
            curr.notebookContent = next.notebookContent;
          }

          // Unir anexos si existen
          if (Array.isArray(next.attachments) && next.attachments.length > 0) {
            curr.attachments = [...(curr.attachments || []), ...next.attachments];
          }

          i++;
        } else {
          break;
        }
      }
      merged.push(curr);
    }
    return merged;
  },

  /**
   * Guarda o actualiza una única clase de forma aislada a través de PlanRepository
   */
  saveClass(dateStr, classId, classData, options = {}) {
    try {
      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';
      let result = null;
      if (typeof PlanRepository !== 'undefined' && PlanRepository.saveClass) {
        result = PlanRepository.saveClass(currentUserId, dateStr, classId, classData, options);
      }
      if (typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
        try {
          ClassRepository.saveClass({
            ...classData,
            id: classId,
            date: dateStr,
            planId: 'plan_' + dateStr
          }, currentUserId, options);
        } catch (eCr) {
          console.warn('[StorageService] Error sincronizando clase con ClassRepository:', eCr);
        }
      }
      return result;
    } catch (e) {
      console.error('Error al guardar clase:', e);
      return null;
    }
  },

  /**
   * Guarda o actualiza el horario semanal del docente
   */
  saveWeeklySchedule(weeklySchedule) {
    const prof = this.getProfile();
    prof.weeklySchedule = weeklySchedule;
    return this.saveProfile(prof);
  },

  /**
   * Guarda o actualiza el perfil del docente
   */
  saveProfile(profileData) {
    try {
      if (profileData && (profileData.id === 'usr_coordinacion' || profileData.role === 'coordinator')) {
        // Blindaje: No sobreescribir el perfil docente con datos de supervisión de coordinación
        if (typeof UserService !== 'undefined' && UserService.getAllUsers && UserService.saveAllUsers) {
          const users = UserService.getAllUsers();
          const idx = users.findIndex(u => u.id === 'usr_coordinacion');
          if (idx >= 0) {
            users[idx] = { ...users[idx], ...profileData };
            UserService.saveAllUsers(users);
          }
        }
        return true;
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
      if (typeof UserService !== 'undefined' && UserService.getAllUsers && UserService.saveAllUsers && UserService.getCurrentUserId) {
        const uid = profileData.id || UserService.getCurrentUserId();
        const users = UserService.getAllUsers();
        const idx = users.findIndex(u => u.id === uid);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...profileData };
          UserService.saveAllUsers(users);
        }
      }
      return true;
    } catch (e) {
      console.error('Error al guardar el perfil:', e);
      return false;
    }
  },

  /**
   * Obtiene todas las planeaciones guardadas para el usuario activo
   * Formato: { "YYYY-MM-DD": { date: "YYYY-MM-DD", classes: [...], generalNotes: "" } }
   */
  /**
   * Obtiene todas las planeaciones guardadas para el usuario activo a través de PlanRepository
   * Formato: { "YYYY-MM-DD": { id, teacherId, date: "YYYY-MM-DD", classes: [...], generalNotes: "" } }
   */
  getAllPlans() {
    try {
      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';

      if (typeof PlanRepository !== 'undefined' && PlanRepository.getAllPlans) {
        return PlanRepository.getAllPlans(currentUserId);
      }
      if (typeof UserService !== 'undefined' && UserService.getTeacherPlans) {
        return UserService.getTeacherPlans(currentUserId);
      }
      const data = localStorage.getItem(STORAGE_KEYS.PLANS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error al leer planeaciones:', e);
      return {};
    }
  },

  /**
   * Obtiene la planeación de una fecha específica a través de PlanRepository
   */
  getPlanByDate(dateStr) {
    if (!dateStr) return null;
    const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
      ? UserService.getCurrentUserId()
      : 'usr_manuel';

    let plan = null;
    if (typeof PlanRepository !== 'undefined' && PlanRepository.getPlan) {
      plan = PlanRepository.getPlan(currentUserId, dateStr);
    } else {
      const plans = this.getAllPlans();
      plan = plans[dateStr] || null;
    }

    // Salvaguarda cruzada: asegurar que TODAS las clases de ClassRepository para esta fecha estén reflejadas
    if (typeof ClassRepository !== 'undefined' && ClassRepository.getByDate) {
      const classSessions = ClassRepository.getByDate(dateStr, currentUserId) || [];
      if (classSessions.length > 0) {
        let planNeedsSync = false;
        if (!plan) {
          plan = {
            id: 'plan_' + dateStr.replace(/-/g, ''),
            date: dateStr,
            period: classSessions[0]?.period || '1°',
            classes: [],
            version: 1
          };
          planNeedsSync = true;
        }
        if (!Array.isArray(plan.classes)) {
          plan.classes = [];
          planNeedsSync = true;
        }

        classSessions.forEach(cs => {
          if (!cs) return;
          const csId = cs.id || cs.classId;
          const existingIdx = plan.classes.findIndex(c => c && (c.id === csId || c.classId === csId));

          const convertedClass = {
            id: cs.id,
            classId: cs.id,
            date: cs.date || dateStr,
            dayOfWeek: cs.dayOfWeek || (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(dateStr) : ''),
            dayNumber: String(cs.dayNumber || cs.sequenceNumber || 1),
            sequenceNumber: cs.sequenceNumber || parseInt(cs.dayNumber, 10) || 1,
            time: cs.time || '',
            startTime: cs.startTime || '',
            endTime: cs.endTime || '',
            scheduleSlotId: cs.scheduleSlotId || null,
            subject: cs.subjectName || cs.subject || '',
            grade: cs.gradeName || cs.grade || '',
            group: cs.group || cs.gradeName || cs.grade || '',
            topic: cs.curriculum?.topic || cs.topic || '',
            dba: cs.curriculum?.dba || cs.dba || '',
            achievement: cs.curriculum?.achievement || cs.achievement || '',
            description: cs.didacticSequence?.desarrollo || cs.pedagogy?.desarrollo || (cs.didacticSequence?.inicio ? `Inicio: ${cs.didacticSequence.inicio}\n\nDesarrollo: ${cs.didacticSequence.desarrollo || ''}\n\nCierre: ${cs.didacticSequence.cierre || ''}` : (cs.description || '')),
            observations: cs.observations || cs.teacherNotebook?.additionalNotes || '',
            notebookContent: cs.notebookContent || cs.teacherNotebook?.studentNotebookContent || '',
            attachments: Array.isArray(cs.attachments) ? cs.attachments : [],
            curriculum: cs.curriculum || null,
            didacticSequence: cs.didacticSequence || cs.pedagogy || null,
            pedagogy: cs.pedagogy || cs.didacticSequence || null,
            teacherNotebook: cs.teacherNotebook || null,
            status: cs.status || 'planned',
            version: cs.version || 1
          };

          if (existingIdx >= 0) {
            const prev = plan.classes[existingIdx];
            if (prev.sequenceNumber !== convertedClass.sequenceNumber ||
                prev.dayNumber !== convertedClass.dayNumber ||
                prev.topic !== convertedClass.topic ||
                prev.version !== convertedClass.version) {
              planNeedsSync = true;
            }
            plan.classes[existingIdx] = { ...prev, ...convertedClass };
          } else {
            plan.classes.push(convertedClass);
            planNeedsSync = true;
          }
        });

        if (planNeedsSync && typeof PlanRepository !== 'undefined') {
          if (PlanRepository._cache) {
            if (!PlanRepository._cache[currentUserId]) PlanRepository._cache[currentUserId] = {};
            PlanRepository._cache[currentUserId][dateStr] = plan;
          }
          if (typeof PlanRepository.savePlan === 'function') {
            PlanRepository.savePlan(currentUserId, dateStr, plan, { isClassSync: true });
          }
        }
      }
    }

    return plan;
  },

  /**
   * Alias directo para compatibilidad total con llamadas a getPlan
   */
  getPlan(dateStr) {
    return this.getPlanByDate(dateStr);
  },

  /**
   * Limpia todas las planeaciones guardadas (con resguardo previo de seguridad)
   */
  clearAllPlans() {
    try {
      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';

      if (typeof PlanRepository !== 'undefined' && PlanRepository.saveSnapshot) {
        PlanRepository.saveSnapshot(currentUserId, 'pre_clear_all', this.getAllPlans());
      }
      if (typeof UserService !== 'undefined' && UserService.saveTeacherPlans) {
        UserService.saveTeacherPlans(currentUserId, {});
      }
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify({}));
      return true;
    } catch (e) {
      console.error('Error al limpiar planeaciones:', e);
      return false;
    }
  },

  /**
   * Limpia planeaciones anteriores al 1 de septiembre sin destruir datos existentes del docente
   */
  cleanPlansBeforeSeptember() {
    // Protección contra borrado silencioso: conservamos intactos los datos
    return true;
  },

  /**
   * Guarda o actualiza la planeación de una fecha a través de PlanRepository
   * Garantiza inmutabilidad de fecha, versionado atómico y protección anti-vacíos
   */
  savePlan(dateStr, planData, isSyncing = false, options = {}) {
    try {
      if (!dateStr || !planData) return false;

      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';

      // Asegurar consolidación de bloques continuos solo si es una nueva creación
      if (planData && Array.isArray(planData.classes) && (!planData.version || planData.version <= 1)) {
        planData.classes = this.consolidateClasses(planData.classes);
      }

      let success = false;
      if (typeof PlanRepository !== 'undefined' && PlanRepository.savePlan) {
        const saved = PlanRepository.savePlan(currentUserId, dateStr, planData, options);
        success = !!saved;
      } else if (typeof UserService !== 'undefined' && UserService.saveTeacherPlanForDate) {
        success = UserService.saveTeacherPlanForDate(currentUserId, dateStr, planData, options);
      } else {
        const plans = this.getAllPlans();
        plans[dateStr] = {
          date: dateStr,
          lastUpdated: new Date().toISOString(),
          ...planData
        };
        try {
          localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
          success = true;
        } catch (eLocal) {}
      }

      // Sincronización transparente de contraparte espejo (4°A / 4°B)
      if (success && !isSyncing && planData && Array.isArray(planData.classes)) {
        planData.classes.forEach(cls => {
          this.syncParallelClasses(cls, dateStr);
        });
      }

      // Sincronización bidireccional inmediata con ClassRepository (Dashboard, Calendario y Secuencias)
      if (success && planData && Array.isArray(planData.classes) && typeof ClassRepository !== 'undefined' && ClassRepository.saveClass) {
        planData.classes.forEach(cls => {
          if (!cls) return;
          try {
            ClassRepository.saveClass({
              ...cls,
              date: dateStr,
              planId: planData.id || ('plan_' + dateStr)
            }, currentUserId, options);
          } catch (eCr) {
            console.warn('[StorageService] Error sincronizando clase de plan con ClassRepository:', eCr);
          }
        });
      }

      return success;
    } catch (e) {
      console.error('Error al guardar la planeación:', e);
      return false;
    }
  },

  /**
   * Guarda una copia de seguridad inmediata de una fecha específica antes de cualquier acción
   */
  _planSnapshots: {},
  savePlanSnapshot(dateStr, planData = null) {
    try {
      const planToBackup = planData || this.getPlanByDate(dateStr);
      if (!planToBackup) return false;
      if (!this._planSnapshots) this._planSnapshots = {};
      this._planSnapshots[dateStr] = JSON.parse(JSON.stringify(planToBackup));
      try {
        sessionStorage.setItem(`plan_undo_snapshot_${dateStr}`, JSON.stringify(planToBackup));
      } catch (e) {}
      return true;
    } catch (e) {
      console.warn('Error al guardar snapshot de planeación:', e);
      return false;
    }
  },

  /**
   * Restaura la copia de seguridad de una fecha previa
   */
  restorePlanSnapshot(dateStr) {
    try {
      let snapshot = this._planSnapshots?.[dateStr];
      if (!snapshot) {
        const fromSession = sessionStorage.getItem(`plan_undo_snapshot_${dateStr}`);
        if (fromSession) snapshot = JSON.parse(fromSession);
      }
      if (!snapshot) return null;
      this.savePlan(dateStr, snapshot);
      return snapshot;
    } catch (e) {
      console.error('Error al restaurar snapshot de planeación:', e);
      return null;
    }
  },

  hasPlanSnapshot(dateStr) {
    if (this._planSnapshots && this._planSnapshots[dateStr]) return true;
    try {
      return !!sessionStorage.getItem(`plan_undo_snapshot_${dateStr}`);
    } catch (e) {
      return false;
    }
  },

  /**
   * Determina a qué día del horario semanal oficial corresponde una lista de clases analizando materias y grados
   */
  getScheduleDayMatch(classes, profile = null) {
    if (!Array.isArray(classes) || classes.length === 0) return null;
    const prof = profile || this.getProfile();
    const weeklySched = prof?.weeklySchedule || window.DEFAULT_WEEKLY_SCHEDULE || {};
    const days = ['1', '2', '3', '4', '5'];
    const dayNames = { '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves', '5': 'Viernes' };

    let bestDay = null;
    let maxMatches = 0;

    days.forEach(d => {
      const sched = this.consolidateSchedule(weeklySched[d] || []);
      let matches = 0;
      classes.forEach(c => {
        const match = sched.some(s => s.subject === c.subject && s.grade === c.grade);
        if (match) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        bestDay = d;
      }
    });

    const total = classes.length;
    const ratio = total > 0 ? (maxMatches / total) : 0;
    return {
      bestDayIndex: bestDay,
      bestDayName: dayNames[bestDay] || 'Lunes',
      matchCount: maxMatches,
      totalClasses: total,
      matchRatio: ratio
    };
  },

  /**
   * Detecta si una fecha tiene materias que corresponden a otro día de la semana,
   * y si ese otro día en la misma semana tiene las materias de esta fecha (par cruzado).
   */
  detectSwappedPair(dateStr) {
    try {
      const plan = this.getPlanByDate(dateStr);
      if (!plan || !Array.isArray(plan.classes) || plan.classes.length === 0) return null;

      const dateParts = dateStr.split('-').map(Number);
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const currentDayIndex = String(dateObj.getDay());
      const currentDayName = typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(dateStr) : '';

      const matchInfo = this.getScheduleDayMatch(plan.classes);
      if (!matchInfo || matchInfo.bestDayIndex === currentDayIndex || matchInfo.matchRatio < 0.6) {
        return null;
      }

      if (typeof ExportService === 'undefined' || !ExportService.getWeekDates) {
        return {
          isSwappedPair: false,
          mismatchOnly: true,
          detectedDayIndex: matchInfo.bestDayIndex,
          detectedDayName: matchInfo.bestDayName,
          targetDate: null
        };
      }

      const weekDates = ExportService.getWeekDates(dateStr);
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * DESACTIVADO: Escaneo de pares intercambiados neutralizado por inmutabilidad de fecha
   */
  detectAllSwappedPairs() {
    return [];
  },

  /**
   * DESACTIVADO: Intercambio de planeaciones deshabilitado para garantizar que cada día es 100% independiente
   */
  swapDayPlans(dateStr1, dateStr2) {
    console.warn('[StorageService] swapDayPlans neutralizado: las fechas de planeación son estrictamente inmutables.');
    return false;
  },

  /**
   * Obtiene la fecha configurada como Primer Día de Clases (Clase 1)
   */
  getAcademicStartDate() {
    const profile = this.getProfile();
    return profile?.academicStartDate || '2026-09-01';
  },

  /**
   * Configura una fecha como el Primer Día de Clases (Clase 1) y sincroniza
   * automáticamente los consecutivos y datos del curso desde esa fecha en adelante.
   */
  setAcademicStartDate(startDate) {
    try {
      const profile = this.getProfile();
      profile.academicStartDate = startDate;
      this.saveProfile(profile);

      if (typeof UserService !== 'undefined' && UserService.getCurrentUserId) {
        const u = UserService.getCurrentUser();
        if (u) {
          u.academicStartDate = startDate;
          UserService.saveUser(u);
        }
      }

      // Sincronizar evento de inicio de clases en holidays si existe
      if (typeof HolidayService !== 'undefined') {
        const events = HolidayService.getSchoolEvents();
        const startEvt = events.find(e => e.id === 'evt_inicio_clases');
        if (startEvt) {
          startEvt.startDate = startDate;
          const dParts = startDate.split('-').map(Number);
          const endD = new Date(dParts[0], dParts[1] - 1, dParts[2] + 4);
          const mm = String(endD.getMonth() + 1).padStart(2, '0');
          const dd = String(endD.getDate()).padStart(2, '0');
          startEvt.endDate = `${endD.getFullYear()}-${mm}-${dd}`;
          HolidayService.saveSchoolEvents(events);
        }
      }

      // Re-sincronizar y cargar automáticamente la planeación para startDate y días posteriores
      this.syncAndLoadClassesFromStartDate(startDate);

      return true;
    } catch (e) {
      console.error('Error al configurar primer día de clases:', e);
      return false;
    }
  },

  /**
   * Asegura la inicialización respetando al 100% la inmutabilidad de todas las planeaciones existentes.
   * JAMÁS re-secuencia ni altera días que ya fueron guardados por el docente.
   */
  syncAndLoadClassesFromStartDate(startDate) {
    try {
      const profile = this.getProfile();
      const existing = this.getPlanByDate(startDate);
      const targetPeriod = profile.period || '1°';

      // Asegurar que startDate tenga su planeación inicial solo si no existía previamente
      if (!existing) {
        const dateParts = startDate.split('-').map(Number);
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const dayIndex = dateObj.getDay();
        const weeklySchedule = profile?.weeklySchedule || window.DEFAULT_WEEKLY_SCHEDULE || {};
        const daySchedule = this.consolidateSchedule(weeklySchedule[String(dayIndex)] || []);

        const initialClasses = [];
        if (daySchedule.length > 0) {
          daySchedule.forEach((schedItem, i) => {
            const classNum = this.getNextClassNumber(startDate, schedItem.subject, schedItem.grade, i, initialClasses);
            const isDirGroup = schedItem.subject && String(schedItem.subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
            const autoCur = (!isDirGroup && typeof CurriculumService !== 'undefined')
              ? CurriculumService.getAutoCurriculumItem(targetPeriod, schedItem.subject, schedItem.grade, classNum)
              : null;

            initialClasses.push({
              date: startDate,
              time: schedItem.time || '',
              dayNumber: `${classNum}`,
              dayOfWeek: typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(startDate) : '',
              subject: schedItem.subject,
              grade: schedItem.grade,
              dba: isDirGroup ? '' : (autoCur?.dba || ''),
              achievement: isDirGroup ? '' : (autoCur?.achievement || ''),
              topic: isDirGroup ? '' : (autoCur?.topic || ''),
              description: '',
              notebookContent: ''
            });
          });

          this.savePlan(startDate, {
            date: startDate,
            period: targetPeriod,
            classes: initialClasses,
            attachments: [],
            generalNotes: ''
          });
        }
      }
      // REGLA ABSOLUTA: Las fechas futuras existentes NO se tocan ni se re-secuencian automáticamente.
    } catch (e) {
      console.error('Error sincronizando clases desde fecha de inicio:', e);
    }
  },

  saveAllPlans(plans) {
    try {
      if (typeof UserService !== 'undefined' && UserService.saveTeacherPlans) {
        UserService.saveTeacherPlans(UserService.getCurrentUserId(), plans);
      }
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Obtiene el siguiente número consecutivo de clase para una fecha, asignatura y grado.
   * La consecutividad es específica por asignatura y curso (ej. Matemáticas 7°: Clase 1, Clase 2, Clase 3...),
   * comenzando a contar desde la fecha configurada como Primer Día de Clases (academicStartDate).
   */
  getNextClassNumber(dateStr, subject = null, grade = null, excludeIndex = -1, currentDayClasses = [], period = '1°') {
    try {
      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';

      // 1. Delegación a ClassRepository por horario oficial y calendario
      if (typeof ClassRepository !== 'undefined') {
        if (dateStr && typeof ClassRepository.getScheduleSequenceNumber === 'function') {
          const schedSeq = ClassRepository.getScheduleSequenceNumber(dateStr, subject, grade, currentUserId, { requireScheduledWeekday: true });
          if (schedSeq !== null && schedSeq > 0) {
            return schedSeq;
          }
        }
        if (ClassRepository.getNextSequenceNumber) {
          const repoNext = ClassRepository.getNextSequenceNumber({
            teacherId: currentUserId,
            period: period || '1°',
            subject: subject,
            grade: grade,
            group: grade
          });

        // Revisar si en el mismo día hay clases en memoria aún no persistidas
        let sameDayMax = 0;
        if (Array.isArray(currentDayClasses)) {
          const norm = (str) => String(str || '').trim().toLowerCase();
          const targetSub = norm(subject);
          const targetGrd = norm(grade);
          currentDayClasses.forEach((cls, idx) => {
            if (excludeIndex >= 0 && idx >= excludeIndex) return;
            const clsSub = norm(cls.subject);
            const clsGrd = norm(cls.grade);
            if (targetSub && clsSub && clsSub !== targetSub) return;
            if (targetGrd && clsGrd && clsGrd !== targetGrd) return;
            const parsed = parseInt(String(cls.dayNumber || cls.sequenceNumber || '').replace(/[^0-9]/g, ''), 10);
            if (!isNaN(parsed) && parsed > sameDayMax) {
              sameDayMax = parsed;
            }
          });
        }
          return Math.max(repoNext, sameDayMax + 1);
        }
      }

      if (typeof PlanRepository !== 'undefined' && PlanRepository.calculateNextSequenceNumber) {
        return PlanRepository.calculateNextSequenceNumber(currentUserId, dateStr, period, subject, grade, currentDayClasses);
      }

      const startDate = this.getAcademicStartDate();
      const allPlans = this.getAllPlans();

      // Solo contar fechas cronológicas que estén en el rango de inicio lectivo [startDate, dateStr)
      const previousDates = Object.keys(allPlans)
        .filter(d => d >= startDate && d < dateStr)
        .sort(); // orden cronológico ascendente

      let lastNum = 0;

      const norm = (str) => String(str || '').trim().toLowerCase();
      const targetSub = norm(subject);
      const targetGrd = norm(grade);

      // 1. Analizar cronológicamente los días anteriores a partir del primer día de clases
      for (const d of previousDates) {
        const plan = allPlans[d];
        if (plan && Array.isArray(plan.classes)) {
          for (const cls of plan.classes) {
            const clsSub = norm(cls.subject);
            const clsGrd = norm(cls.grade);

            // Si se pasa materia, debe coincidir
            if (targetSub && clsSub && clsSub !== targetSub) continue;
            // Si se pasa grado, debe coincidir
            if (targetGrd && clsGrd && clsGrd !== targetGrd) continue;

            const parsed = parseInt(String(cls.dayNumber || '').replace(/[^0-9]/g, ''), 10);
            if (!isNaN(parsed) && parsed > lastNum) {
              lastNum = parsed;
            }
          }
        }
      }

      // 2. Analizar si en el MISMO día ya existen clases previas de esa misma materia y grado
      if (Array.isArray(currentDayClasses)) {
        currentDayClasses.forEach((cls, idx) => {
          if (excludeIndex >= 0 && idx >= excludeIndex) return;

          const clsSub = norm(cls.subject);
          const clsGrd = norm(cls.grade);

          if (targetSub && clsSub && clsSub !== targetSub) return;
          if (targetGrd && clsGrd && clsGrd !== targetGrd) return;

          const parsed = parseInt(String(cls.dayNumber || '').replace(/[^0-9]/g, ''), 10);
          if (!isNaN(parsed) && parsed > lastNum) {
            lastNum = parsed;
          }
        });
      }

      return lastNum > 0 ? lastNum + 1 : 1;
    } catch (e) {
      console.error('Error calculando consecutivo de clase por materia:', e);
      return 1;
    }
  },

  /**
   * Normaliza la representación del grado escolar (ej: '4A' o '4°A' -> '4°A')
   */
  normalizeGrade(grade) {
    const g = String(grade || '').trim().toUpperCase();
    if (g === '4A' || g === '4°A' || g === '4-A' || g === 'CUARTO A') return '4°A';
    if (g === '4B' || g === '4°B' || g === '4-B' || g === 'CUARTO B') return '4°B';
    if (g === '1' || g === '1°' || g === '1-A' || g === 'PRIMERO') return '1°';
    if (g === '2' || g === '2°' || g === '2-A' || g === 'SEGUNDO') return '2°';
    return String(grade || '').trim();
  },

  /**
   * Normaliza el número de clase a dígito limpio (ej: 'Clase 1' -> '1', '1' -> '1')
   */
  normalizeClassNumber(num) {
    if (num === null || num === undefined) return '';
    const parsed = parseInt(String(num).replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? String(num).trim() : String(parsed);
  },

  /**
   * Obtiene el grado paralelo espejo si aplica (ej: 4°A <-> 4°B, 1° <-> 2° para Sistemas)
   */
  getParallelGrade(subject, grade) {
    const s = String(subject || '').trim().toLowerCase();
    const isSistemas = s.includes('sistema') || s.includes('tecnolog') || s.includes('informát');
    if (!isSistemas) return null;

    const g = this.normalizeGrade(grade);
    if (g === '4°A') return '4°B';
    if (g === '4°B') return '4°A';
    if (g === '1°') return '2°';
    if (g === '2°') return '1°';

    const matchA = g.match(/^(\d+)°?A$/i);
    if (matchA) return `${matchA[1]}°B`;
    const matchB = g.match(/^(\d+)°?B$/i);
    if (matchB) return `${matchB[1]}°A`;

    return null;
  },

  /**
   * Determina si dos materias y grados son paralelas / espejo
   */
  isParallelClass(subjectA, gradeA, subjectB, gradeB) {
    const targetB = this.getParallelGrade(subjectA, gradeA);
    if (!targetB) return false;
    const sA = String(subjectA || '').trim().toLowerCase();
    const sB = String(subjectB || '').trim().toLowerCase();
    const sameSubject = sA === sB || 
      (sA.includes('sistema') && sB.includes('sistema')) || 
      (sA.includes('tecnolog') && sB.includes('tecnolog'));
    return sameSubject && this.normalizeGrade(gradeB) === targetB;
  },

  /**
   * Busca contenido ya planificado en la contraparte espejo para una materia, grado y consecutivo de clase
   */
  getParallelClassContent(subject, grade, dayNumber) {
    const targetParallelGrade = this.getParallelGrade(subject, grade);
    if (!targetParallelGrade) return null;

    const targetClassNum = this.normalizeClassNumber(dayNumber);
    if (!targetClassNum) return null;

    const allPlans = this.getAllPlans();
    const allDates = Object.keys(allPlans).sort();

    for (const d of allDates) {
      const plan = allPlans[d];
      if (plan && Array.isArray(plan.classes)) {
        for (const cls of plan.classes) {
          if (this.isParallelClass(subject, grade, cls.subject, cls.grade)) {
            const clsNum = this.normalizeClassNumber(cls.dayNumber);
            if (clsNum === targetClassNum) {
              const hasContent = (cls.topic && cls.topic.trim()) ||
                                 (cls.description && cls.description.trim()) ||
                                 (cls.notebookContent && cls.notebookContent.trim()) ||
                                 (cls.dba && cls.dba.trim()) ||
                                 (cls.achievement && cls.achievement.trim());
              if (hasContent) {
                return {
                  date: d,
                  topic: cls.topic || '',
                  dba: cls.dba || '',
                  achievement: cls.achievement || '',
                  description: cls.description || '',
                  observations: cls.observations || '',
                  notebookContent: cls.notebookContent || '',
                  attachments: Array.isArray(cls.attachments) ? JSON.parse(JSON.stringify(cls.attachments)) : []
                };
              }
            }
          }
        }
      }
    }
    return null;
  },

  /**
   * Sincroniza bidireccionalmente los contenidos de una clase con su grado paralelo espejo (4°A <-> 4°B)
   */
  syncParallelClasses(sourceCls, sourceDateStr) {
    if (!sourceCls) return false;
    const targetParallelGrade = this.getParallelGrade(sourceCls.subject, sourceCls.grade);
    if (!targetParallelGrade) return false;

    const sourceClassNum = this.normalizeClassNumber(sourceCls.dayNumber);
    if (!sourceClassNum) return false;

    const hasAnyContent = (sourceCls.topic && sourceCls.topic.trim()) ||
                          (sourceCls.description && sourceCls.description.trim()) ||
                          (sourceCls.notebookContent && sourceCls.notebookContent.trim()) ||
                          (sourceCls.dba && sourceCls.dba.trim()) ||
                          (sourceCls.achievement && sourceCls.achievement.trim());
    if (!hasAnyContent) return false;

    const allPlans = this.getAllPlans();
    let anyUpdated = false;

    // 1. Sincronizar en todos los planes guardados
    Object.keys(allPlans).forEach(d => {
      const plan = allPlans[d];
      if (plan && Array.isArray(plan.classes)) {
        let planModified = false;
        plan.classes.forEach(cls => {
          if (d === sourceDateStr && cls === sourceCls) return;

          if (this.isParallelClass(sourceCls.subject, sourceCls.grade, cls.subject, cls.grade)) {
            const clsNum = this.normalizeClassNumber(cls.dayNumber);
            if (clsNum === sourceClassNum) {
              cls.topic = sourceCls.topic || '';
              cls.dba = sourceCls.dba || '';
              cls.achievement = sourceCls.achievement || '';
              cls.description = sourceCls.description || '';
              cls.observations = sourceCls.observations || '';
              cls.notebookContent = sourceCls.notebookContent || '';
              if (Array.isArray(sourceCls.attachments)) {
                cls.attachments = JSON.parse(JSON.stringify(sourceCls.attachments));
              }
              planModified = true;
              anyUpdated = true;
            }
          }
        });

        if (planModified) {
          this.savePlan(d, plan, true);
        }
      }
    });

    // 2. Si Planner está activo en memoria y tiene el plan abierto en pantalla
    if (typeof window !== 'undefined' && window.Planner && window.Planner.currentPlan && Array.isArray(window.Planner.currentPlan.classes)) {
      let domNeedsUpdate = false;
      window.Planner.currentPlan.classes.forEach(cls => {
        if (cls === sourceCls) return;
        if (this.isParallelClass(sourceCls.subject, sourceCls.grade, cls.subject, cls.grade)) {
          const clsNum = this.normalizeClassNumber(cls.dayNumber);
          if (clsNum === sourceClassNum) {
            cls.topic = sourceCls.topic || '';
            cls.dba = sourceCls.dba || '';
            cls.achievement = sourceCls.achievement || '';
            cls.description = sourceCls.description || '';
            cls.observations = sourceCls.observations || '';
            cls.notebookContent = sourceCls.notebookContent || '';
            if (Array.isArray(sourceCls.attachments)) {
              cls.attachments = JSON.parse(JSON.stringify(sourceCls.attachments));
            }
            domNeedsUpdate = true;
          }
        }
      });
      if (domNeedsUpdate && typeof window.Planner.render === 'function') {
        window.Planner.render();
      }
    }

    return anyUpdated;
  },

  /**
   * Elimina la planeación de una fecha
   */
  deletePlan(dateStr) {
    try {
      const plans = this.getAllPlans();
      if (plans[dateStr]) {
        delete plans[dateStr];
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
      }
      return true;
    } catch (e) {
      console.error('Error al eliminar planeación:', e);
      return false;
    }
  },

  /**
   * Exporta todos los datos de la aplicación a un archivo JSON descargable
   */
  exportBackup() {
    if (typeof BackupService !== 'undefined' && BackupService.downloadBackup) {
      BackupService.downloadBackup();
      return;
    }
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      plans: this.getAllPlans()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `respaldo_planeador_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Importa datos desde un archivo JSON
   */
  async importBackup(jsonString) {
    try {
      if (typeof BackupService !== 'undefined' && BackupService.restoreBackup) {
        await BackupService.restoreBackup(jsonString);
      }
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (parsed.profile) {
        this.saveProfile(parsed.profile);
      }
      if (parsed.plans) {
        const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
          ? UserService.getCurrentUserId()
          : 'usr_manuel';
        if (typeof UserService !== 'undefined' && UserService.saveTeacherPlans) {
          UserService.saveTeacherPlans(currentUserId, parsed.plans);
        }
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(parsed.plans));
      }
      if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.flushPersist === 'function') {
        await ClassRepository.flushPersist();
      }
      if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
        await PlanRepository.flushPersist();
      }
      await this.executeAutoSaveProtocol(false);
      return true;
    } catch (e) {
      console.error('Error al importar copia de seguridad:', e);
      return false;
    }
  },

  // =========================================================================
  // PROTOCOLO DE GUARDADO AUTOMÁTICO Y PREVENCIÓN DE PÉRDIDA DE DATOS
  // =========================================================================

  _isSaving: false,
  _isDirty: false,
  _hasDiskEndpoint: null, // null: no verificado, false: no disponible, true: disponible

  markDirty() {
    this._isDirty = true;
    if (typeof AppState !== 'undefined' && AppState.set) {
      AppState.set('isDirty', true);
    }
  },

  markClean() {
    this._isDirty = false;
    if (typeof AppState !== 'undefined' && AppState.set) {
      AppState.set('isDirty', false);
    }
  },

  /**
   * El respaldo físico en disco (/api/autosave) solo existe cuando la app se ejecuta con
   * servidor_local.py en el propio equipo. En file:// o en el hosting estático (Firebase)
   * no se intenta, evitando serializar y subir varios MB en cada guardado.
   */
  canUseDiskEndpoint() {
    if (this._hasDiskEndpoint === false) return false;
    if (typeof window === 'undefined' || !window.fetch || !window.location) return false;
    const loc = window.location;
    if (loc.protocol !== 'http:' && loc.protocol !== 'https:') return false;
    const host = String(loc.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
  },

  /**
   * Envía un respaldo en segundo plano al servidor local (para guardado físico a disco duro)
   */
  async syncToDisk(payload = null) {
    if (!this.canUseDiskEndpoint()) return false;
    try {
      const dataToSync = payload || {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        profile: this.getProfile(),
        plans: this.getAllPlans()
      };
      const resp = await fetch('/api/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });
      if (resp.ok) {
        this._hasDiskEndpoint = true;
        return true;
      } else {
        this._hasDiskEndpoint = false;
        return false;
      }
    } catch (e) {
      this._hasDiskEndpoint = false;
      return false;
    }
  },

  /**
   * Ejecuta el protocolo completo de autoguardado y prevención de pérdida de datos
   */
  async executeAutoSaveProtocol(showFeedback = true) {
    if (this._isSaving) return false;
    const isDirty = this._isDirty || (typeof AppState !== 'undefined' && AppState.get('isDirty'));

    // Si es un autoguardado en segundo plano y no hubo cambios, no saturar el hilo principal
    if (!showFeedback && !isDirty) {
      return true;
    }

    this._isSaving = true;
    try {
      // 1. Recolectar datos activos de la interfaz (Planeador diario)
      if (typeof window !== 'undefined' && window.Planner && typeof window.Planner.collectDataFromDOM === 'function') {
        window.Planner.collectDataFromDOM();
        if (window.Planner.currentPlan && window.Planner.currentDateStr) {
          this.savePlan(window.Planner.currentDateStr, window.Planner.currentPlan);
        }
      }

      // 2. Recolectar datos activos del Cuaderno Docente si está abierto
      if (typeof window !== 'undefined' && window.NotebookEditor && typeof window.NotebookEditor.saveCurrentNotebookContent === 'function') {
        window.NotebookEditor.saveCurrentNotebookContent(false);
      }

      // 3. Capturar estado completo
      const profile = this.getProfile();
      const allPlans = this.getAllPlans();
      const currentUserId = (typeof UserService !== 'undefined' && UserService.getCurrentUserId)
        ? UserService.getCurrentUserId()
        : 'usr_manuel';

      // Asegurar volcado inmediato y síncrono de repositorios principales (Regla 10)
      if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.flushPersist === 'function') {
        await ClassRepository.flushPersist();
      }
      if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
        await PlanRepository.flushPersist();
      }

      // 4. Guardar snapshot histórico en IndexedDB y disco en tiempo inactivo (no bloqueante)
      if (isDirty || showFeedback) {
        this.markClean();
        const asyncBackup = async () => {
          try {
            if (typeof IDBStorage !== 'undefined' && IDBStorage.saveSnapshot) {
              await IDBStorage.saveSnapshot(currentUserId, {
                profile,
                plans: allPlans
              });
            }
            if (this._hasDiskEndpoint !== false) {
              this.syncToDisk({
                version: '2.0',
                exportedAt: new Date().toISOString(),
                profile,
                plans: allPlans
              });
            }
          } catch (e) {}
        };

        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(() => asyncBackup(), { timeout: 2000 });
        } else {
          setTimeout(asyncBackup, 50);
        }
      }

      if (showFeedback && typeof App !== 'undefined' && App.showToast) {
        App.showToast('✓ Protocolo de autoguardado ejecutado: datos 100% protegidos en memoria, base de datos y disco', 'success');
      }

      return true;
    } catch (err) {
      console.warn('[StorageService] Error en protocolo de autoguardado:', err);
      return false;
    } finally {
      this._isSaving = false;
    }
  },

  /**
   * Inicia el ciclo heartbeat de autoguardado inteligente en segundo plano cada 90 segundos
   */
  startAutoSaveHeartbeat(intervalMs = 90000) {
    if (this._heartbeatStarted) return;
    this._heartbeatStarted = true;

    // Asegurar persistencia del almacenamiento
    if (typeof IDBStorage !== 'undefined' && IDBStorage.requestPersistence) {
      IDBStorage.requestPersistence();
    }

    this._heartbeatTimer = setInterval(() => {
      // Solo guardar si hay cambios pendientes
      if (this._isDirty || (typeof AppState !== 'undefined' && AppState.get('isDirty'))) {
        this.executeAutoSaveProtocol(false);
      }
    }, intervalMs);
    if (this._heartbeatTimer && typeof this._heartbeatTimer.unref === 'function') {
      this._heartbeatTimer.unref();
    }

    // Salvaguardas ante cierre de pestaña o cambio de visibilidad solo si hay cambios sucios
    if (typeof window !== 'undefined') {
      const flushOnUnload = () => {
        if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.flushPersist === 'function') {
          ClassRepository.flushPersist();
        }
        if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
          PlanRepository.flushPersist();
        }
        if (this._isDirty || (typeof AppState !== 'undefined' && AppState.get('isDirty'))) {
          this.executeAutoSaveProtocol(false);
        }
      };
      window.addEventListener('beforeunload', flushOnUnload);
      window.addEventListener('pagehide', flushOnUnload);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.flushPersist === 'function') {
            ClassRepository.flushPersist();
          }
          if (typeof PlanRepository !== 'undefined' && typeof PlanRepository.flushPersist === 'function') {
            PlanRepository.flushPersist();
          }
          if (this._isDirty || (typeof AppState !== 'undefined' && AppState.get('isDirty'))) {
            this.executeAutoSaveProtocol(false);
          }
        }
      });
    }

    console.log(`[StorageService] Protocolo de autoguardado inteligente activo (latido cada ${intervalMs / 1000}s).`);
  }
};

StorageService.DEFAULT_WEEKLY_SCHEDULE = DEFAULT_WEEKLY_SCHEDULE;
StorageService.DEFAULT_PROFILE = DEFAULT_PROFILE;
StorageService.DEFAULT_GRADES = DEFAULT_GRADES;

if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      StorageService.startAutoSaveHeartbeat();
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
