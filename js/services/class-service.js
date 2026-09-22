/**
 * SERVICIO DE CLASES (ClassService)
 * Orquesta la lógica de negocio para las sesiones de clase:
 * - Creación y resolución a partir del horario y secuencias.
 * - Guardado atómico con debounce de autoguardado (1,000 ms) exclusivo para la clase activa.
 * - Validación obligatoria de integridad (Req. 68, 82).
 * - Duplicación independiente (Req. 14, 31).
 * - Búsqueda de la siguiente clase pendiente real.
 */

class ClassServiceClass {
  constructor() {
    this._autoSaveTimer = null;
    this._debounceDelay = 1000; // ms (Req. 17: 800 - 1500 ms)
    this._currentEditingClassId = null;
  }

  setCurrentEditingClass(classId) {
    this._currentEditingClassId = classId;
    if (typeof AppState !== 'undefined') {
      AppState.set('currentClassId', classId);
      AppState.set('isDirty', false);
      AppState.set('saveStatus', 'saved');
    }
  }

  getCurrentEditingClass() {
    if (!this._currentEditingClassId && typeof AppState !== 'undefined') {
      this._currentEditingClassId = AppState.get('currentClassId');
    }
    if (!this._currentEditingClassId) return null;
    return ClassRepository.getClass(this._currentEditingClassId);
  }

  /**
   * Programa un autoguardado con debounce que afecta ÚNICAMENTE a la clase actual
   */
  scheduleAutoSave(classData) {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }

    if (typeof AppState !== 'undefined') {
      AppState.set('isDirty', true);
      AppState.set('saveStatus', 'dirty');
    }

    this._autoSaveTimer = setTimeout(() => {
      this.saveClassNow(classData, { isAutoSave: true });
    }, this._debounceDelay);
  }

  /**
   * Cancela cualquier temporizador de autoguardado pendiente
   */
  cancelPendingAutoSave() {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
  }

  /**
   * Ejecuta el guardado inmediato y atómico de la clase actual
   */
  saveClassNow(classData, options = {}) {
    this.cancelPendingAutoSave();

    if (!classData) return null;

    if (typeof AppState !== 'undefined') {
      AppState.set('saveStatus', 'saving');
    }

    try {
      // 1. Validaciones básicas obligatorias (Req. 82)
      if (!classData.date || !classData.subjectName && !classData.subject) {
        throw new Error('Faltan datos obligatorios para guardar la clase (fecha o asignatura).');
      }

      // 2. Persistencia en repositorio
      const saved = ClassRepository.saveClass(classData);
      if (!saved) throw new Error('El repositorio rechazó la operación.');

      this._currentEditingClassId = saved.id;

      if (typeof AppState !== 'undefined') {
        AppState.set('isDirty', false);
        AppState.set('saveStatus', 'saved');
        AppState.set('lastSavedAt', new Date().toISOString());
        AppState.set('currentClassId', saved.id);
      }

      // Notificar a observadores de la interfaz
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_saved_locally', {
          detail: { classSession: saved, isAutoSave: options.isAutoSave || false }
        }));
      }

      return saved;
    } catch (err) {
      console.error('[ClassService] Error al guardar clase:', err);
      if (typeof AppState !== 'undefined') {
        AppState.set('saveStatus', 'error');
      }
      return null;
    }
  }

  /**
   * Crea una nueva clase pedagógica a partir de un slot de horario o datos base
   */
  createClassFromSlot(slot, dateStr, teacherId) {
    const tid = teacherId || slot.teacherId || ClassRepository._getCurrentTeacherId();
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    const period = (typeof AppState !== 'undefined' && AppState.get('currentPeriod')) || '1°';

    // Determinar siguiente consecutivo inmutable para esta materia y curso
    const nextSeq = ClassRepository.getNextSequenceNumber({
      teacherId: tid,
      period: period,
      subject: slot.subjectName || slot.subject,
      grade: slot.gradeName || slot.grade,
      group: slot.group
    });

    // Obtener snapshot curricular sugerido
    let curSnapshot = { topic: '', dba: '', achievement: '' };
    if (slot.subjectType !== 'homeroom' && typeof CurriculumRepository !== 'undefined') {
      const curItem = CurriculumRepository.getItemByNumber(period, slot.subjectName, slot.gradeName, nextSeq);
      if (curItem) {
        curSnapshot = {
          topic: curItem.topic || '',
          dba: curItem.dba || '',
          achievement: curItem.achievement || ''
        };
      }
    }

    const newClassData = {
      id: ClassRepository.generateClassId('cls'),
      teacherId: tid,
      scheduleSlotId: slot.id || null,
      date: targetDate,
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      time: slot.time || '',
      subjectId: slot.subjectId,
      subjectName: slot.subjectName || slot.subject,
      gradeId: slot.gradeId,
      gradeName: slot.gradeName || slot.grade,
      group: slot.group || slot.gradeName || slot.grade,
      period: period,
      sequenceNumber: nextSeq,
      status: 'pending',
      subjectType: slot.subjectType || 'academic',
      curriculum: curSnapshot,
      pedagogy: {
        inicio: '',
        desarrollo: '',
        cierre: '',
        recursos: '',
        evaluacion: '',
        tareas: ''
      },
      observations: '',
      notebookContent: '',
      attachments: [],
      version: 1
    };

    return ClassRepository.createClass(newClassData, tid);
  }

  /**
   * Busca la siguiente clase pendiente real en la secuencia o en el día (Req. 30)
   */
  findNextPendingClass(currentClass) {
    if (!currentClass) return null;
    const tid = currentClass.teacherId || ClassRepository._getCurrentTeacherId();

    // 1. Buscar si hay otra clase pendiente en el MISMO día
    const sameDayClasses = ClassRepository.getByDate(currentClass.date, tid);
    const nextInSameDay = sameDayClasses.find(c => c.id !== currentClass.id && c.status === 'pending');
    if (nextInSameDay) return nextInSameDay;

    // 2. Buscar si hay una clase posterior en la misma secuencia curricular
    const allOfSubject = ClassRepository.getClasses({
      teacherId: tid,
      period: currentClass.period,
      subject: currentClass.subjectName,
      grade: currentClass.gradeName,
      group: currentClass.group
    }, tid);

    const nextInSeq = allOfSubject
      .filter(c => c.sequenceNumber > currentClass.sequenceNumber)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)[0];

    if (nextInSeq) return nextInSeq;

    return null;
  }

  /**
   * Busca la clase anterior de la misma secuencia curricular (Req. 96)
   */
  findPreviousClassInSequence(currentClass) {
    if (!currentClass) return null;
    const tid = currentClass.teacherId || ClassRepository._getCurrentTeacherId();

    const allOfSubject = ClassRepository.getClasses({
      teacherId: tid,
      period: currentClass.period,
      subject: currentClass.subjectName,
      grade: currentClass.gradeName,
      group: currentClass.group
    }, tid);

    const prevList = allOfSubject
      .filter(c => c.sequenceNumber < currentClass.sequenceNumber)
      .sort((a, b) => b.sequenceNumber - a.sequenceNumber);

    return prevList[0] || null;
  }

  /**
   * Actualiza un campo en la clase actualmente cargada en edición
   */
  updateCurrentClassField(fieldPath, value) {
    const cls = this.getCurrentEditingClass();
    if (!cls) return { success: false, error: 'No hay clase en edición activa' };

    const parts = fieldPath.split('.');
    let target = cls;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;

    // Actualizar en el repositorio temporalmente o cache de ClassRepository
    ClassRepository.saveClass(cls);
    if (typeof AppState !== 'undefined') {
      AppState.set('isDirty', true);
      AppState.set('saveStatus', 'dirty');
    }
    return { success: true, classSession: cls };
  }

  /**
   * Guarda de forma atómica la clase en edición activa
   */
  saveCurrentEditingClass() {
    const cls = this.getCurrentEditingClass();
    if (!cls) return { success: false, error: 'No hay clase en edición activa' };
    const saved = this.saveClassNow(cls);
    return { success: !!saved, classSession: saved };
  }

  /**
   * Aplica un plan rápido generando o actualizando una clase completa y válida
   */
  applyQuickPlan(quickData) {
    const tid = quickData.teacherId || ClassRepository._getCurrentTeacherId();
    const targetDate = quickData.date || new Date().toISOString().slice(0, 10);
    const period = quickData.period || (typeof AppState !== 'undefined' && AppState.get('currentPeriod')) || '1°';
    const sub = quickData.subjectName || quickData.subject || '';
    const grd = quickData.gradeName || quickData.grade || '';
    const grp = quickData.group || grd;

    const nextSeq = quickData.sequenceNumber || ClassRepository.getNextSequenceNumber({
      teacherId: tid,
      period,
      subject: sub,
      grade: grd,
      group: grp
    });

    const newClassData = {
      id: quickData.id || ClassRepository.generateClassId('cls'),
      teacherId: tid,
      date: targetDate,
      period,
      subjectName: sub,
      gradeName: grd,
      group: grp,
      sequenceNumber: nextSeq,
      status: (quickData.topic || quickData.activity) ? 'planned' : 'pending',
      curriculum: {
        topic: quickData.topic || '',
        dba: quickData.dba || '',
        achievement: quickData.achievement || ''
      },
      pedagogy: {
        inicio: quickData.inicio || '',
        desarrollo: quickData.activity || quickData.desarrollo || '',
        cierre: quickData.cierre || '',
        recursos: quickData.recursos || '',
        evaluacion: quickData.evaluacion || '',
        tareas: quickData.tareas || ''
      },
      observations: quickData.observations || '',
      notebookContent: quickData.notebookContent || ''
    };

    const saved = ClassRepository.saveClass(newClassData, tid);
    return { success: !!saved, classSession: saved };
  }

  /**
   * Duplica una clase asignándole el siguiente número de clase disponible (max + 1)
   */
  duplicateClassAsNext(classId, targetDate, teacherId) {
    const dup = ClassRepository.duplicateClass(classId, { targetDate }, teacherId);
    return { success: !!dup, classSession: dup };
  }
}

const ClassService = new ClassServiceClass();

if (typeof window !== 'undefined') {
  window.ClassService = ClassService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassService;
}
