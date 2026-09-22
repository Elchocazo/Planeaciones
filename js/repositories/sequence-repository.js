/**
 * REPOSITORIO DE SECUENCIAS CURRICULARES (SequenceRepository)
 * Responsable de la secuencia curricular/pedagógica (CurriculumSequence).
 * Garantiza:
 * - sequenceNumber PERMANENTE e INMUTABLE.
 * - Cálculo de nuevo número mediante max(existentes) + 1 (jamás reutiliza huecos ni renumera por índice).
 * - Desacoplamiento total entre asignaturas, cursos y grupos paralelos (4A != 4B).
 */

class SequenceRepositoryClass {
  constructor() {
    this._cache = {}; // teacherId -> CurriculumSequence[]
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
    return `teacher_curriculum_sequences_${tid}_v4`;
  }

  generateSequenceId(prefix = 'seq') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${ts}_${rand}`;
  }

  _norm(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  async init(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) return this._cache[tid];

    let sequences = null;
    // 1. Cargar desde IndexedDB
    if (typeof IDBStorage !== 'undefined' && IDBStorage.get) {
      try {
        sequences = await IDBStorage.get(this.getStorageKey(tid));
      } catch (e) {}
    }

    // 2. Cargar desde LocalStorage
    if (!sequences && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getStorageKey(tid));
        if (raw) sequences = JSON.parse(raw);
      } catch (e) {}
    }

    if (!Array.isArray(sequences)) {
      sequences = [];
    }

    this._cache[tid] = sequences;
    this._isInitialized = true;
    return sequences;
  }

  getAllSequences(teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    if (this._cache[tid]) {
      return JSON.parse(JSON.stringify(this._cache[tid]));
    }
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
    this._cache[tid] = [];
    return [];
  }

  getSequenceById(sequenceId, teacherId) {
    if (!sequenceId) return null;
    const all = this.getAllSequences(teacherId);
    const found = all.find(s => s.id === sequenceId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  _normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId) {
    if (typeof scopeOrPeriod === 'string') {
      let group = grade;
      let tid = teacherId;
      if (teacherId === undefined && typeof groupOrTeacherId === 'string' && groupOrTeacherId.startsWith('usr_')) {
        tid = groupOrTeacherId;
        group = grade;
      } else if (typeof groupOrTeacherId === 'string') {
        group = groupOrTeacherId;
      }
      return {
        period: scopeOrPeriod,
        subject: subject,
        grade: grade,
        group: group,
        teacherId: tid
      };
    }
    return scopeOrPeriod || {};
  }

  getSequencesByScope(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    const scope = this._normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId);
    const tid = scope.teacherId || this._getCurrentTeacherId();
    const all = this.getAllSequences(tid);

    const targetSub = this._norm(scope.subject || scope.subjectName);
    const targetGrd = this._norm(scope.grade || scope.gradeName);
    const targetGrp = this._norm(scope.group || scope.grade || scope.gradeName);
    const targetPer = this._norm(scope.period || '1°');

    return all.filter(seq => {
      if (targetPer && this._norm(seq.period) !== targetPer) return false;
      if (targetSub && this._norm(seq.subjectName || seq.subjectId) !== targetSub) return false;
      if (targetGrd && this._norm(seq.gradeName || seq.gradeId) !== targetGrd) return false;
      const seqGroup = seq.group || seq.gradeName || seq.grade;
      if (targetGrp && seqGroup && this._norm(seqGroup) !== targetGrp) return false;
      return true;
    }).sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  }

  /**
   * REGLA ESTRICTA (Requisitos 8, 9, 10, 111):
   * Determina el siguiente número consecutivo dentro de teacher + period + subject + grade + group.
   * Si existen 1, 2, 4, 5 -> el siguiente es 6 (max + 1). Jamás reutiliza el 3 ni renumera.
   */
  getNextSequenceNumber(scopeOrPeriod = {}, subject, grade, groupOrTeacherId, teacherId) {
    const scope = this._normalizeScope(scopeOrPeriod, subject, grade, groupOrTeacherId, teacherId);
    const tid = scope.teacherId || this._getCurrentTeacherId();
    const existingSeqs = this.getSequencesByScope(scope);

    let maxNumber = 0;
    existingSeqs.forEach(seq => {
      const num = parseInt(seq.sequenceNumber, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    });

    // También contrastar con clases persistidas para este mismo scope
    if (typeof ClassRepository !== 'undefined' && ClassRepository.getMaxSequenceNumber) {
      const classMax = ClassRepository.getMaxSequenceNumber(scope);
      if (classMax > maxNumber) {
        maxNumber = classMax;
      }
    }

    return maxNumber + 1;
  }

  saveSequence(sequenceData, teacherId) {
    if (!sequenceData) return null;
    const tid = teacherId || sequenceData.teacherId || this._getCurrentTeacherId();
    const all = this.getAllSequences(tid);

    const seqId = sequenceData.id || this.generateSequenceId('seq');
    const existingIdx = all.findIndex(s => s.id === seqId);

    const now = new Date().toISOString();
    const finalized = {
      ...sequenceData,
      id: seqId,
      teacherId: tid,
      period: sequenceData.period || '1°',
      subjectName: sequenceData.subjectName || sequenceData.subject || '',
      gradeName: sequenceData.gradeName || sequenceData.grade || '',
      group: sequenceData.group || sequenceData.gradeName || sequenceData.grade || '',
      sequenceNumber: sequenceData.sequenceNumber || this.getNextSequenceNumber(sequenceData),
      topic: sequenceData.topic || '',
      dba: sequenceData.dba || '',
      achievement: sequenceData.achievement || '',
      status: sequenceData.status || 'pending',
      createdAt: sequenceData.createdAt || (existingIdx >= 0 ? all[existingIdx].createdAt : now),
      updatedAt: now
    };

    if (existingIdx >= 0) {
      all[existingIdx] = finalized;
    } else {
      all.push(finalized);
    }

    this._persist(all, tid);
    return JSON.parse(JSON.stringify(finalized));
  }

  deleteSequence(sequenceId, teacherId) {
    if (!sequenceId) return false;
    const tid = teacherId || this._getCurrentTeacherId();
    let all = this.getAllSequences(tid);
    const initialLen = all.length;
    all = all.filter(s => s.id !== sequenceId);

    if (all.length !== initialLen) {
      this._persist(all, tid);
      return true;
    }
    return false;
  }

  _persist(sequences, teacherId) {
    const tid = teacherId || this._getCurrentTeacherId();
    this._cache[tid] = sequences;
    const key = this.getStorageKey(tid);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(sequences));
      }
    } catch (e) {}

    if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
      IDBStorage.set(key, sequences).catch(() => {});
    }
  }
}

const SequenceRepository = new SequenceRepositoryClass();

if (typeof window !== 'undefined') {
  window.SequenceRepository = SequenceRepository;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SequenceRepository;
}
