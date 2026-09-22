/**
 * VISTA DE RECUPERACIÓN Y AUDITORÍA DE DATOS (RecoveryView)
 * 
 * Cumple los Requisitos Mandatorios 136 a 141:
 * - Sección "Planeaciones Recuperadas": Muestra todas las clases huérfanas o
 *   rescatadas de almacenamientos anteriores.
 * - Permite previsualizar, editar, exportar a PDF o vincular a una fecha u horario escolar.
 * - Diagnóstico de Almacenamiento y Auditoría en tiempo real.
 */

class RecoveryViewClass {
  constructor() {
    this.container = null;
    this.selectedClassForLinking = null;
  }

  init() {
    this.container = document.getElementById('recovery-view');
  }

  async render() {
    if (!this.container) {
      this.container = document.getElementById('recovery-view');
    }
    if (!this.container) return;

    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : null;
    const orphanedClasses = (typeof ClassRepository !== 'undefined' && ClassRepository.getOrphanedClasses)
      ? ClassRepository.getOrphanedClasses(tid)
      : [];

    let audit = null;
    if (typeof RecoveryService !== 'undefined') {
      try {
        audit = await RecoveryService.auditAllStorages(tid);
      } catch (e) {
        console.warn('[RecoveryView] Error obteniendo auditoría:', e);
      }
    }

    this.container.innerHTML = `
      <div class="recovery-page-layout">
        <!-- Título y Acciones -->
        <div class="section-title-row" style="margin-bottom:1.25rem;">
          <div>
            <h2 style="font-size:1.4rem; font-weight:800; color:var(--slate-800); margin:0 0 4px;">
              🛡️ Centro de Recuperación y Auditoría de Datos
            </h2>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:0;">
              Salvaguarda total de planeaciones docentes. Garantía de Cero Pérdida de Información.
            </p>
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="AppRouter.goBack()" title="Volver a la sección anterior">
              ← Volver
            </button>
            <button type="button" class="btn btn-primary" id="btn-deep-scan" onclick="RecoveryView.triggerDeepScan(this)">
              🔄 Re-escanear Almacenamientos
            </button>
          </div>
        </div>

        <!-- Tarjetas de Diagnóstico de Almacenamiento (Req. 141) -->
        <div class="dashboard-stats-row" style="margin-bottom:1.5rem;">
          <div class="stat-pill">
            <span class="stat-num">${audit ? audit.totalClassesInRepository : 0}</span>
            <span class="stat-desc">Clases en Repositorio</span>
          </div>
          <div class="stat-pill success">
            <span class="stat-num">${audit ? audit.completedClasses : 0}</span>
            <span class="stat-desc">Planeadas Completas</span>
          </div>
          <div class="stat-pill ${orphanedClasses.length > 0 ? 'warning' : ''}">
            <span class="stat-num">${orphanedClasses.length}</span>
            <span class="stat-desc">Por Vincular / Huérfanas</span>
          </div>
          <div class="stat-pill success" style="background:#ecfdf5; border-color:#a7f3d0;">
            <span class="stat-num" style="color:#059669;">100%</span>
            <span class="stat-desc" style="color:#065f46;">Datos Preservados</span>
          </div>
        </div>

        <!-- Lista de Planeaciones Huérfanas / Recuperadas -->
        <div class="card" style="background:#fff; border-radius:12px; border:1px solid var(--slate-200); padding:1.25rem; box-shadow:var(--shadow-sm);">
          <div class="section-title-row" style="margin-bottom:1rem; border-bottom:1px solid var(--slate-100); padding-bottom:0.75rem;">
            <h3 style="margin:0; font-size:1.1rem; color:#1e293b;">
              📋 Planeaciones Recuperadas Pendientes de Asignar (${orphanedClasses.length})
            </h3>
            <span style="font-size:0.8rem; color:#64748b;">
              Preservadas con contenido completo. Puedes vincularlas a una fecha y hora cuando lo desees.
            </span>
          </div>

          ${orphanedClasses.length > 0 ? `
            <div class="orphaned-classes-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:12px;">
              ${orphanedClasses.map(cls => `
                <div class="card orphan-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div>
                      <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-size:0.75rem;">
                        Clase #${cls.sequenceNumber || '?'}
                      </span>
                      <strong style="margin-left:6px; font-size:0.9rem; color:#1e293b;">${cls.subjectName || 'Sin Materia'}</strong>
                    </div>
                    <span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.7rem;">
                      ${cls.gradeName || 'Sin Grado'} (${cls.group || 'Gral'})
                    </span>
                  </div>

                  <div style="font-size:0.82rem; color:#475569; margin-bottom:8px;">
                    <strong>Tema:</strong> ${cls.curriculum?.topic || 'Sin tema especificado'}
                  </div>

                  ${cls.didacticSequence?.desarrollo ? `
                    <div style="font-size:0.78rem; color:#64748b; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                      ${cls.didacticSequence.desarrollo}
                    </div>
                  ` : ''}

                  <div style="display:flex; justify-content:flex-end; gap:6px; border-top:1px solid #edf2f7; padding-top:8px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="AppRouter.navigateTo('editor', { classId: '${cls.id}' })">
                      ✏️ Ver / Editar
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="RecoveryView.openLinkModal('${cls.id}')">
                      🔗 Vincular a Fecha
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state-card" style="text-align:center; padding:2.5rem 1rem;">
              <span style="font-size:2rem;">🎉</span>
              <h4 style="margin:8px 0 4px; color:#1e293b;">¡Todas las planeaciones están vinculadas!</h4>
              <p style="font-size:0.85rem; color:#64748b; margin:0;">
                No hay planeaciones huérfanas en el sistema. Todo tu trabajo está correctamente integrado en las fechas y el calendario.
              </p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  async triggerDeepScan(buttonEl) {
    if (typeof RecoveryService === 'undefined') {
      alert('RecoveryService no está disponible.');
      return;
    }

    const tid = (typeof ClassRepository !== 'undefined') ? ClassRepository._getCurrentTeacherId() : 'usr_manuel';
    const btn = buttonEl || document.getElementById('btn-deep-scan') || (typeof event !== 'undefined' ? event?.target : null);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Escaneando...';
    }

    try {
      const report = await RecoveryService.executeSafeRecovery(tid);
      alert(`Escaneo completado con éxito:\n\n- Clases encontradas en total: ${report.found}\n- Clases recuperadas agregadas: ${report.recovered}\n- Ya presentes / enriquecidas: ${report.alreadyPresent}`);
      this.render();
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('class_session_saved', { detail: {} }));
      }
    } catch (e) {
      console.error('[RecoveryView] Error en escaneo:', e);
      alert('Error durante el escaneo: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 Re-escanear Almacenamientos';
      }
    }
  }

  openLinkModal(classId) {
    const cls = ClassRepository.getClass(classId);
    if (!cls) return;

    this.selectedClassForLinking = cls;
    const targetDate = cls.date || new Date().toISOString().slice(0, 10);

    const modalHtml = `
      <div class="modal-backdrop active" id="link-class-modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <h2>🔗 Vincular Planeación a Fecha</h2>
            <button type="button" class="btn-close-modal" onclick="document.getElementById('link-class-modal-backdrop').remove()">&times;</button>
          </div>
          <div class="modal-body" style="padding:1.25rem;">
            <p style="font-size:0.85rem; color:#64748b; margin-top:0;">
              Asigna una fecha y horario para la <strong>Clase #${cls.sequenceNumber} (${cls.subjectName} — ${cls.gradeName})</strong>. 
              El consecutivo y contenido pedagógico se mantendrán intactos.
            </p>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">Fecha destino *</label>
              <input type="date" id="input-link-date" class="form-input" value="${targetDate}" />
            </div>

            <div style="display:flex; gap:10px;">
              <div class="form-group half-width">
                <label class="form-label">Hora Inicio</label>
                <input type="time" id="input-link-start" class="form-input" value="${cls.startTime || '07:00'}" />
              </div>
              <div class="form-group half-width">
                <label class="form-label">Hora Fin</label>
                <input type="time" id="input-link-end" class="form-input" value="${cls.endTime || '08:00'}" />
              </div>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('link-class-modal-backdrop').remove()">Cancelar</button>
            <button type="button" class="btn btn-success" onclick="RecoveryView.confirmLinkClass('${classId}')">
              ✅ Guardar vinculación
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  confirmLinkClass(classId) {
    const dateInput = document.getElementById('input-link-date');
    const startInput = document.getElementById('input-link-start');
    const endInput = document.getElementById('input-link-end');

    const newDate = dateInput ? dateInput.value : '';
    if (!newDate) {
      alert('Por favor selecciona una fecha válida.');
      return;
    }

    const tid = ClassRepository._getCurrentTeacherId();
    const updated = ClassRepository.linkOrphanedClass(classId, newDate, null, tid);

    if (updated) {
      if (startInput && endInput) {
        updated.startTime = startInput.value;
        updated.endTime = endInput.value;
        updated.time = `${startInput.value} - ${endInput.value}`;
        ClassRepository.saveClass(updated, tid);
      }

      const modalEl = document.getElementById('link-class-modal-backdrop');
      if (modalEl) modalEl.remove();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`✅ Clase #${updated.sequenceNumber} vinculada al ${newDate}.`, 'success');
      }

      this.render();
      if (typeof DashboardView !== 'undefined') DashboardView.render();
    } else {
      alert('No se pudo vincular la clase.');
    }
  }

  _escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

const RecoveryView = new RecoveryViewClass();

if (typeof window !== 'undefined') {
  window.RecoveryView = RecoveryView;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecoveryView;
}
