/**
 * ADMINISTRADOR DE MIGRACIONES (MigrationManager)
 * Responsable de la migración segura, atómica y no destructiva de versiones heredadas (v1, v2, v3)
 * hacia la nueva arquitectura de entidades independientes (v4).
 *
 * Flujo de salvaguarda obligatorio (Req. 62):
 * BACKUP PREVIO COMPLETO -> DETECTAR VERSIÓN -> MIGRAR -> VALIDAR -> GUARDAR -> CONFIRMAR
 * (En caso de fallo: ROLLBACK AUTOMÁTICO).
 */

const DATA_SCHEMA_VERSION = 5;

class MigrationManagerClass {
  constructor() {
    this.SCHEMA_KEY = 'planeaciones_data_schema_version';
  }

  getCurrentVersion() {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(this.SCHEMA_KEY);
        return v ? parseInt(v, 10) : 0;
      }
    } catch (e) {}
    return 0;
  }

  needsMigration() {
    return this.getCurrentVersion() < DATA_SCHEMA_VERSION;
  }

  /**
   * Ejecuta la migración garantizando respaldo triple y verificación de integridad
   */
  async runMigration(teacherId) {
    const tid = teacherId || (typeof UserService !== 'undefined' && UserService.getCurrentUserId ? UserService.getCurrentUserId() : 'usr_manuel');

    if (!this.needsMigration()) {
      return { success: true, message: 'El esquema ya se encuentra en la versión más reciente (v5).' };
    }

    console.log(`[MigrationManager] Iniciando protocolo de migración segura a v5 para ${tid}...`);

    // PASO 1: BACKUP COMPLETO PREVIO (Req. 64)
    const backupResult = await this._createFullPreMigrationBackup(tid);
    if (!backupResult.success) {
      console.error('[MigrationManager] Falló la creación del respaldo previo. Migración cancelada por seguridad.');
      return { success: false, error: 'No se pudo crear el respaldo de seguridad previo.' };
    }

    try {
      // PASO 2: EJECUTAR RECUPERACIÓN UNIVERSAL CON RecoveryService (Req. 2, 3, 110)
      if (typeof RecoveryService !== 'undefined' && RecoveryService.executeSafeRecovery) {
        const recovResult = await RecoveryService.executeSafeRecovery(tid);
        console.log(`[MigrationManager] RecoveryService procesó ${recovResult.totalClasses} clases.`);
      }
      const legacyPlans = this._extractAllLegacyPlans(tid);
      const totalDays = Object.keys(legacyPlans).length;
      let totalLegacyClasses = 0;
      Object.values(legacyPlans).forEach(p => {
        if (p && Array.isArray(p.classes)) totalLegacyClasses += p.classes.length;
      });

      console.log(`[MigrationManager] Encontrados ${totalDays} días y ${totalLegacyClasses} clases heredadas.`);

      // PASO 3: TRANSFORMAR A ENTIDADES INDEPENDIENTES ClassSession
      const migratedSessions = {};
      const generatedSequences = {};

      Object.keys(legacyPlans).forEach(dateStr => {
        const plan = legacyPlans[dateStr];
        if (!plan || !Array.isArray(plan.classes)) return;

        const period = plan.period || '1°';

        plan.classes.forEach((legacyClass, idx) => {
          const classId = legacyClass.id || legacyClass.classId || ClassRepository.generateClassId('cls');
          const subName = legacyClass.subject || legacyClass.subjectName || 'General';
          const grdName = legacyClass.grade || legacyClass.gradeName || 'General';
          const group = legacyClass.group || grdName;

          // Parsear número de clase
          const rawSeq = legacyClass.sequenceNumber ?? legacyClass.consecutive ?? legacyClass.dayNumber;
          const parsedSeq = rawSeq !== undefined && rawSeq !== null && !isNaN(parseInt(String(rawSeq).replace(/[^0-9]/g, ''), 10))
            ? parseInt(String(rawSeq).replace(/[^0-9]/g, ''), 10)
            : (idx + 1);

          // Parsear fases pedagógicas desde description
          const parsedPedagogy = this._parseLegacyPedagogy(legacyClass.description || '');
          if (legacyClass.observations && !parsedPedagogy.observaciones) {
            parsedPedagogy.observaciones = legacyClass.observations;
          }

          // Snapshot curricular
          const curriculumSnapshot = {
            topic: legacyClass.topic || legacyClass.curriculum?.topic || '',
            dba: legacyClass.dba || legacyClass.curriculum?.dba || '',
            achievement: legacyClass.achievement || legacyClass.performance || legacyClass.curriculum?.achievement || ''
          };

          const subLower = String(subName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const isHomeroom = subLower.includes('direccion de grupo') || subLower.includes('dirección de grupo');

          const session = {
            id: classId,
            teacherId: tid,
            sequenceId: null,
            scheduleSlotId: null,
            date: dateStr, // Inmutable
            dayOfWeek: legacyClass.dayOfWeek || '',
            startTime: legacyClass.startTime || '',
            endTime: legacyClass.endTime || '',
            time: legacyClass.time || '',
            subjectId: ClassRepository._slugify(subName),
            subjectName: subName,
            gradeId: ClassRepository._slugify(grdName),
            gradeName: grdName,
            group: group,
            period: period,
            sequenceNumber: parsedSeq, // Inmutable
            status: (legacyClass.description && legacyClass.description.trim()) ? 'planned' : 'pending',
            subjectType: isHomeroom ? 'homeroom' : 'academic',
            curriculum: curriculumSnapshot,
            pedagogy: parsedPedagogy,
            observations: legacyClass.observations || '',
            notebookContent: legacyClass.notebookContent || '',
            attachments: Array.isArray(legacyClass.attachments) ? legacyClass.attachments : [],
            description: legacyClass.description || '',
            topic: curriculumSnapshot.topic,
            dba: curriculumSnapshot.dba,
            achievement: curriculumSnapshot.achievement,
            dayNumber: String(parsedSeq),
            subject: subName,
            grade: grdName,
            version: Math.max(legacyClass.version || 1, 1),
            createdAt: legacyClass.createdAt || plan.createdAt || new Date().toISOString(),
            updatedAt: legacyClass.updatedAt || plan.updatedAt || new Date().toISOString()
          };

          migratedSessions[classId] = session;

          // Registrar secuencia si tiene tema
          const seqKey = `${period}__${subName}__${group}__${parsedSeq}`;
          if (!generatedSequences[seqKey] && (curriculumSnapshot.topic || curriculumSnapshot.dba)) {
            generatedSequences[seqKey] = {
              id: SequenceRepository.generateSequenceId('seq'),
              teacherId: tid,
              period: period,
              subjectName: subName,
              gradeName: grdName,
              group: group,
              sequenceNumber: parsedSeq,
              topic: curriculumSnapshot.topic,
              dba: curriculumSnapshot.dba,
              achievement: curriculumSnapshot.achievement,
              status: session.status,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt
            };
          }
        });
      });

      // PASO 4: VALIDACIÓN ESTRICTA (Req. 62, 68)
      const migratedCount = Object.keys(migratedSessions).length;
      if (totalLegacyClasses > 0 && migratedCount < totalLegacyClasses) {
        throw new Error(`Validación fallida: se esperaban ${totalLegacyClasses} clases y se procesaron ${migratedCount}.`);
      }

      // PASO 5: GUARDAR NUEVO MODELO ATÓMICO
      // Fusionar sesiones migradas con las clases ya recuperadas en ClassRepository
      const currentMap = (typeof ClassRepository !== 'undefined' && ClassRepository._getAllMap)
        ? ClassRepository._getAllMap(tid)
        : {};
      
      Object.keys(migratedSessions).forEach(cid => {
        if (!currentMap[cid]) {
          currentMap[cid] = migratedSessions[cid];
        } else {
          // Fusionar campos si la clase ya existía
          if (typeof RecoveryService !== 'undefined' && RecoveryService._smartMerge) {
            currentMap[cid] = RecoveryService._smartMerge(currentMap[cid], migratedSessions[cid]);
          } else {
            currentMap[cid] = Object.assign({}, migratedSessions[cid], currentMap[cid]);
          }
        }
      });

      const classKey = ClassRepository.getStorageKey(tid);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(classKey, JSON.stringify(currentMap));
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        await IDBStorage.set(classKey, currentMap);
      }
      if (typeof ClassRepository !== 'undefined' && ClassRepository._cache) {
        ClassRepository._cache[tid] = currentMap;
      }
      if (typeof ClassRepository !== 'undefined' && ClassRepository._persist) {
        ClassRepository._persist(currentMap, tid);
      }

      // Guardar Sequences
      const seqKey = SequenceRepository.getStorageKey(tid);
      const seqArray = Object.values(generatedSequences);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(seqKey, JSON.stringify(seqArray));
      }
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        await IDBStorage.set(seqKey, seqArray);
      }
      if (typeof SequenceRepository !== 'undefined' && SequenceRepository._cache) {
        SequenceRepository._cache[tid] = seqArray;
      }

      // PASO 6: REGISTRAR RESULTADO Y VERSIÓN DE ESQUEMA
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.SCHEMA_KEY, String(DATA_SCHEMA_VERSION));
      }

      console.log(`[MigrationManager] Migración completada con éxito. ${migratedCount} clases migradas y validadas.`);
      return {
        success: true,
        migratedCount: migratedCount,
        schemaVersion: DATA_SCHEMA_VERSION
      };

    } catch (err) {
      console.error('[MigrationManager] Error en la migración. Ejecutando ROLLBACK...', err);
      await this._rollback(tid, backupResult.snapshot);
      return { success: false, error: err.message };
    }
  }

  /**
   * Extrae los bloques Inicio, Desarrollo, Cierre sin perder ningún carácter
   */
  _parseLegacyPedagogy(descText) {
    if (!descText || typeof descText !== 'string') {
      return { inicio: '', desarrollo: '', cierre: '', recursos: '', evaluacion: '', tareas: '' };
    }

    const text = descText.trim();
    const result = { inicio: '', desarrollo: '', cierre: '', recursos: '', evaluacion: '', tareas: '' };

    const lines = text.split('\n');
    let currentSection = null;
    const sectionBuffers = {
      inicio: [],
      desarrollo: [],
      cierre: [],
      recursos: [],
      evaluacion: [],
      tareas: []
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      const cleanUpper = trimmed.toUpperCase().replace(/\*/g, '');

      if (/^(FASE\s+DE\s+INICIO|INICIO)\b/i.test(cleanUpper)) {
        currentSection = 'inicio';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+INICIO|INICIO)[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.inicio.push(rest);
      } else if (/^(FASE\s+DE\s+DESARROLLO|DESARROLLO)\b/i.test(cleanUpper)) {
        currentSection = 'desarrollo';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+DESARROLLO|DESARROLLO)[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.desarrollo.push(rest);
      } else if (/^(FASE\s+DE\s+CIERRE|CIERRE)\b/i.test(cleanUpper)) {
        currentSection = 'cierre';
        const rest = trimmed.replace(/^[\*\s]*(FASE\s+DE\s+CIERRE|CIERRE)[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.cierre.push(rest);
      } else if (/^RECURSOS(\s+DID[AÁ]CTICOS)?\b/i.test(cleanUpper)) {
        currentSection = 'recursos';
        const rest = trimmed.replace(/^[\*\s]*RECURSOS(\s+DID[AÁ]CTICOS)?[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.recursos.push(rest);
      } else if (/^EVALUACI[OÓ]N(\s+FORMATIVA)?\b/i.test(cleanUpper)) {
        currentSection = 'evaluacion';
        const rest = trimmed.replace(/^[\*\s]*EVALUACI[OÓ]N(\s+FORMATIVA)?[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.evaluacion.push(rest);
      } else if (/^(TAREAS?|COMPROMISOS?|TAREAS?\s*\/\s*COMPROMISOS?)\b/i.test(cleanUpper)) {
        currentSection = 'tareas';
        const rest = trimmed.replace(/^[\*\s]*(TAREAS?|COMPROMISOS?|TAREAS?\s*\/\s*COMPROMISOS?)[\*\s]*:?/i, '').trim();
        if (rest) sectionBuffers.tareas.push(rest);
      } else {
        if (currentSection) {
          sectionBuffers[currentSection].push(line);
        } else {
          sectionBuffers.desarrollo.push(line);
        }
      }
    });

    result.inicio = sectionBuffers.inicio.join('\n').trim();
    result.desarrollo = sectionBuffers.desarrollo.join('\n').trim();
    result.cierre = sectionBuffers.cierre.join('\n').trim();
    result.recursos = sectionBuffers.recursos.join('\n').trim();
    result.evaluacion = sectionBuffers.evaluacion.join('\n').trim();
    result.tareas = sectionBuffers.tareas.join('\n').trim();

    if (!result.inicio && !result.cierre && !result.recursos && !result.evaluacion && !result.tareas) {
      result.desarrollo = text;
    }

    return result;
  }

  _extractAllLegacyPlans(teacherId) {
    const plans = {};

    // 1. Intentar v3
    try {
      const rawV3 = localStorage.getItem(`teacher_planner_plans_${teacherId}_v3`);
      if (rawV3) {
        const p3 = JSON.parse(rawV3);
        Object.assign(plans, p3);
      }
    } catch (e) {}

    // 2. Intentar v2
    try {
      const rawV2 = localStorage.getItem(`teacher_planner_plans_${teacherId}_v2`);
      if (rawV2) {
        const p2 = JSON.parse(rawV2);
        Object.keys(p2).forEach(d => {
          if (!plans[d]) plans[d] = p2[d];
        });
      }
    } catch (e) {}

    // 3. Intentar v1
    if (teacherId === 'usr_manuel') {
      try {
        const rawV1 = localStorage.getItem('teacher_planner_plans_v1');
        if (rawV1) {
          const p1 = JSON.parse(rawV1);
          Object.keys(p1).forEach(d => {
            if (!plans[d]) plans[d] = p1[d];
          });
        }
      } catch (e) {}
    }

    return plans;
  }

  async _createFullPreMigrationBackup(teacherId) {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        teacherId: teacherId,
        localStorageDump: {},
        description: 'Copia de seguridad automática previa a la migración de esquema v4'
      };

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) snapshot.localStorageDump[k] = localStorage.getItem(k);
        }
      }

      // Guardar en localStorage
      try {
        localStorage.setItem(`migration_backup_${teacherId}_pre_v4`, JSON.stringify(snapshot));
      } catch (e) {}

      // Guardar en IndexedDB
      if (typeof IDBStorage !== 'undefined' && IDBStorage.set) {
        await IDBStorage.set(`migration_backup_${teacherId}_pre_v4`, snapshot);
      }

      // Respaldo en disco si server.js está activo
      if (typeof fetch !== 'undefined') {
        try {
          await fetch('/api/autosave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'PRE_MIGRATION_BACKUP_V4',
              teacherId: teacherId,
              timestamp: snapshot.timestamp,
              data: snapshot
            })
          });
        } catch (e) {}
      }

      return { success: true, snapshot };
    } catch (e) {
      console.error('[MigrationManager] Error creando respaldo:', e);
      return { success: false, error: e.message };
    }
  }

  async _rollback(teacherId, snapshot) {
    if (!snapshot || !snapshot.localStorageDump) return false;
    try {
      Object.keys(snapshot.localStorageDump).forEach(k => {
        localStorage.setItem(k, snapshot.localStorageDump[k]);
      });
      console.log('[MigrationManager] Rollback ejecutado con éxito.');
      return true;
    } catch (e) {
      console.error('[MigrationManager] Fallo en rollback:', e);
      return false;
    }
  }
}

const MigrationManager = new MigrationManagerClass();

if (typeof window !== 'undefined') {
  window.MigrationManager = MigrationManager;
  window.DATA_SCHEMA_VERSION = DATA_SCHEMA_VERSION;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MigrationManager;
}
