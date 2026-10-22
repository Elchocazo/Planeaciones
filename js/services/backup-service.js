/**
 * SERVICIO DE COPIAS DE SEGURIDAD (BackupService)
 * Exporta e importa copias completas de seguridad en formato JSON.
 */

class BackupServiceClass {
  constructor() {}

  generateFullBackup(teacherId) {
    const tid = teacherId || ClassRepository._getCurrentTeacherId();
    const profile = typeof StorageService !== 'undefined' ? StorageService.getProfile() : null;
    const classes = ClassRepository.getClasses({}, tid);
    const sequences = typeof SequenceRepository !== 'undefined' ? SequenceRepository.getAllSequences(tid) : [];
    const slots = typeof ScheduleRepository !== 'undefined' ? ScheduleRepository.getAllSlots(tid) : [];
    const plans = typeof StorageService !== 'undefined' ? StorageService.getAllPlans() : {};

    return {
      version: '4.0',
      schemaVersion: typeof DATA_SCHEMA_VERSION !== 'undefined' ? DATA_SCHEMA_VERSION : 4,
      createdAt: new Date().toISOString(),
      teacherId: tid,
      profile: profile,
      classes: classes,
      plans: plans,
      sequences: sequences,
      scheduleSlots: slots
    };
  }

  async createBackupData(teacherId) {
    return this.generateFullBackup(teacherId);
  }

  async downloadBackup(teacherId) {
    const backupData = await this.createBackupData(teacherId);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Respaldo_Planeaciones_${backupData.profile?.name?.replace(/\s+/g, '_') || 'Docente'}_${dateStr}.json`;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async restoreBackup(jsonString, teacherId) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || typeof data !== 'object') throw new Error('Formato de archivo inválido.');

      const tid = teacherId || data.teacherId || (typeof ClassRepository !== 'undefined' ? ClassRepository._getCurrentTeacherId() : 'usr_manuel');

      // Guardar snapshot de seguridad antes de restaurar
      if (typeof IDBStorage !== 'undefined' && IDBStorage.saveSnapshot) {
        await IDBStorage.saveSnapshot(tid, 'pre_restore_backup', { timestamp: new Date().toISOString() });
      }

      // Restaurar clases
      if (Array.isArray(data.classes)) {
        const classesMap = {};
        data.classes.forEach(c => {
          if (c && c.id) {
            classesMap[c.id] = c;
            if (typeof ClassRepository !== 'undefined' && typeof ClassRepository.unmarkClassDeleted === 'function') {
              ClassRepository.unmarkClassDeleted(c.id, tid);
            }
          }
        });
        if (typeof ClassRepository !== 'undefined') {
          if (ClassRepository._persist) {
            ClassRepository._persist(classesMap, tid);
            if (typeof ClassRepository.flushPersist === 'function') {
              await ClassRepository.flushPersist(tid);
            }
          } else {
            const classKey = ClassRepository.getStorageKey(tid);
            if (typeof localStorage !== 'undefined') localStorage.setItem(classKey, JSON.stringify(classesMap));
            if (typeof IDBStorage !== 'undefined') await IDBStorage.set(classKey, classesMap);
            ClassRepository._cache[tid] = classesMap;
          }
        }
      }

      // Restaurar planes diarios
      if (data.plans && typeof data.plans === 'object') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('teacher_planner_plans_v1', JSON.stringify(data.plans));
        }
        if (typeof PlanRepository !== 'undefined') {
          Object.keys(data.plans).forEach(d => {
            const p = data.plans[d];
            if (p) PlanRepository.savePlan(tid, d, p, { skipBroadcast: true });
          });
          if (typeof PlanRepository.flushPersist === 'function') {
            await PlanRepository.flushPersist(tid);
          }
        }
      }

      // Asegurar que el espejo legacy v3 contenga todas las clases restauradas
      if (Array.isArray(data.classes) && typeof ClassRepository !== 'undefined') {
        ClassRepository._sequenceIndex = {};
        if (typeof ClassRepository._syncLegacyPlanMirror === 'function') {
          const currentMap = ClassRepository._getAllMap(tid);
          ClassRepository._syncLegacyPlanMirror(currentMap, tid);
        }
        if (typeof PlanRepository !== 'undefined' && PlanRepository._memoryCache) {
          delete PlanRepository._memoryCache[tid];
        }
      }

      // Restaurar secuencias
      if (Array.isArray(data.sequences) && typeof SequenceRepository !== 'undefined') {
        const seqKey = SequenceRepository.getStorageKey(tid);
        if (typeof localStorage !== 'undefined') localStorage.setItem(seqKey, JSON.stringify(data.sequences));
        if (typeof IDBStorage !== 'undefined') await IDBStorage.set(seqKey, data.sequences);
        SequenceRepository._cache[tid] = data.sequences;
      }

      // Restaurar horario
      if (Array.isArray(data.scheduleSlots) && typeof ScheduleRepository !== 'undefined') {
        ScheduleRepository.saveSlots(data.scheduleSlots, tid);
      }

      // Restaurar perfil
      if (data.profile && typeof StorageService !== 'undefined' && StorageService.saveProfile) {
        StorageService.saveProfile(data.profile);
      }

      // Refrescar UI inmediatamente
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_cache_hydrated', { detail: { teacherId: tid } }));
        window.dispatchEvent(new CustomEvent('plan_remote_update', { detail: { teacherId: tid } }));
      }
      if (typeof Calendar !== 'undefined' && Calendar.render) Calendar.render();
      if (typeof DashboardView !== 'undefined' && DashboardView.render) DashboardView.render();

      console.log('[BackupService] Copia de seguridad restaurada con éxito.');
      return { success: true };
    } catch (err) {
      console.error('[BackupService] Error al restaurar copia de seguridad:', err);
      return { success: false, error: err.message };
    }
  }
}

const BackupService = new BackupServiceClass();

if (typeof window !== 'undefined') {
  window.BackupService = BackupService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackupService;
}
