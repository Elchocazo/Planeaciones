/**
 * REPOSITORIO DE HORARIO (ScheduleRepository)
 * Responsable ÚNICAMENTE del horario recurrente institucional (ScheduleSlot).
 * NO almacena ni muta planeaciones de clase.
 */

class ScheduleRepositoryClass {
  constructor() {
    this._cache = {}; // teacherId -> ScheduleSlot[]
    this._isInitialized = false;
  }

  _getCurrentTeacherId() {
    if (typeof UserService !== 'undefined' && UserService.getCurrentUserId) {
      return UserService.getCurrentUserId() || 'usr_manuel';
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('school_current_active_user_v2') || 'usr_manuel';
    }
    return 'usr_manuel';
  }

  getStorageKey(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    return `teacher_schedule_slots_${tid}_v4`;
  }

  generateSlotId(prefix = 'slot') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${ts}_${rand}`;
  }

  async init(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) return this._cache[tid];

    let slots = null;
    // 1. Intentar cargar desde IndexedDB
    if (typeof IDBStorage !== 'undefined' && IDBStorage.get) {
      try {
        slots = await IDBStorage.get(this.getStorageKey(tid));
      } catch (e) {}
    }

    // 2. Intentar cargar desde LocalStorage
    if (!slots && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getStorageKey(tid));
        if (raw) slots = JSON.parse(raw);
      } catch (e) {}
    }

    // 3. Si no existe, inicializar a partir del perfil actual
    if (!Array.isArray(slots) || slots.length === 0) {
      slots = this._createSlotsFromProfile(tid);
      this.saveSlots(slots, tid);
    }

    this._cache[tid] = slots;
    this._isInitialized = true;
    return slots;
  }

  _createSlotsFromProfile(teacherId) {
    let weekly = null;
    if (typeof StorageService !== 'undefined' && StorageService.getProfile) {
      const prof = StorageService.getProfile();
      weekly = prof?.weeklySchedule;
    }
    if (!weekly && typeof window !== 'undefined' && window.DEFAULT_WEEKLY_SCHEDULE) {
      weekly = window.DEFAULT_WEEKLY_SCHEDULE;
    }
    if (!weekly) return [];

    return this.convertWeeklyScheduleToSlots(weekly, teacherId);
  }

  convertWeeklyScheduleToSlots(weeklySchedule, teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    const slots = [];

    // weeklySchedule = { "1": [ { time, subject, grade } ], ... }
    Object.keys(weeklySchedule || {}).forEach(dayKey => {
      const weekday = parseInt(dayKey, 10);
      const items = weeklySchedule[dayKey];
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const subLower = String(item.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const isHomeroom = subLower.includes('direccion de grupo') || subLower.includes('dirección de grupo');

          // Desglosar tiempo si viene en formato "7:00 - 7:50"
          let startTime = '';
          let endTime = '';
          if (item.time && item.time.includes('-')) {
            const parts = item.time.split('-').map(s => s.trim());
            startTime = parts[0] || '';
            endTime = parts[1] || '';
          }

          // Normalizar grupo/grado
          const gradeStr = String(item.grade || '').trim();
          let group = gradeStr;
          if (gradeStr.includes('4°A') || gradeStr === '4A') group = '4A';
          else if (gradeStr.includes('4°B') || gradeStr === '4B') group = '4B';

          slots.push({
            id: item.id || this.generateSlotId('slot'),
            teacherId: tid,
            weekday: weekday, // 1=Lunes .. 5=Viernes
            index: index,
            startTime: startTime,
            endTime: endTime,
            time: item.time || '',
            subjectId: this._slugify(item.subject || 'asignatura'),
            subjectName: item.subject || '',
            gradeId: this._slugify(gradeStr),
            gradeName: gradeStr,
            group: group,
            subjectType: isHomeroom ? 'homeroom' : (item.subjectType || 'academic'),
            active: true
          });
        });
      }
    });

    return slots;
  }

  _slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'general';
  }

  getAllSlots(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) {
      return JSON.parse(JSON.stringify(this._cache[tid]));
    }
    // Si no está en caché síncrona, intentar leer de localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getStorageKey(tid));
        if (raw) {
          const parsed = JSON.parse(raw);
          this._cache[tid] = parsed;
          return JSON.parse(JSON.stringify(parsed));
        }
      } catch (e) {}
    }
    const created = this._createSlotsFromProfile(tid);
    this._cache[tid] = created;
    return JSON.parse(JSON.stringify(created));
  }

  getSlotsByWeekday(weekday, teacherId) {
    const all = this.getAllSlots(teacherId);
    const dayNum = parseInt(weekday, 10);
    return all.filter(slot => slot.weekday === dayNum && slot.active !== false)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  getSlotsForDate(dateStr, teacherId) {
    if (!dateStr) return [];
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const jsDay = dateObj.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
    // Mapeo escolar: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    if (jsDay === 0) return []; // Domingo
    return this.getSlotsByWeekday(jsDay, teacherId);
  }

  getSlotById(slotId, teacherId) {
    const all = this.getAllSlots(teacherId);
    return all.find(s => s.id === slotId) || null;
  }

  saveSlots(slots, teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (!Array.isArray(slots)) return false;

    this._cache[tid] = JSON.parse(JSON.stringify(slots));
    const key = this.getStorageKey(tid);

    // 1. Guardar en LocalStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(this._cache[tid]));
      }
    } catch (e) {}

    // 2. Guardar en IndexedDB
    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, this._cache[tid]).catch(() => {});
    }

    return true;
  }
}

const ScheduleRepository = new ScheduleRepositoryClass();

if (typeof window !== 'undefined') {
  window.ScheduleRepository = ScheduleRepository;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScheduleRepository;
}
