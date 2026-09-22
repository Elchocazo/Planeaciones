/**
 * MÓDULO DE GESTIÓN DEL BANCO CURRICULAR POR PERIODO (MALLA DE TEMAS, LOGROS Y DBA)
 * Malla Curricular Oficial Institucional - Colegio Hogar Madre de Dios
 * Docente: Manuel Alejandro Muñoz Palomino / Manuel Muñoz
 *
 * Arquitectura optimizada: los datos se gestionan a través de curriculum-data.js / CurriculumRepository
 * evitando duplicación de 750KB en memoria y en disco.
 */

const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v13';

const DEFAULT_CURRICULUM = (typeof window !== 'undefined' && window.DEFAULT_CURRICULUM)
  ? window.DEFAULT_CURRICULUM
  : (typeof global !== 'undefined' && global.DEFAULT_CURRICULUM
      ? global.DEFAULT_CURRICULUM
      : (typeof require !== 'undefined' ? require('./data/curriculum-data.js') : {}));

const CurriculumService = {
  _cachedCurriculum: null,
  getDefaultCurriculum() {
    return DEFAULT_CURRICULUM;
  },

  /**
   * Genera el ítem curricular oficial estandarizado para la Clase #1 (Introducción)
   * Válido para todas las asignaturas y grados de la institución.
   */
  getIntroClassItem(period = '1°', subject = 'Asignatura', grade = 'General', baseStandard = '') {
    const subClean = String(subject || 'Asignatura').trim();
    const grdClean = String(grade || '').trim();
    const perClean = String(period || '1°').trim();
    const gradeLabel = grdClean ? ` (${grdClean})` : '';

    return {
      id: `intro_${subClean}_${grdClean}_${perClean}`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      topic: "Clase #1: Introducción a la asignatura, acuerdos pedagógicos, metodología y criterios de evaluación",
      dba: baseStandard || `Reconoce los propósitos formativos, ejes temáticos, indicadores de desempeño y criterios de evaluación del ${perClean} periodo en ${subClean}${gradeLabel}, concertando los acuerdos pedagógicos y normas de convivencia del aula.`,
      achievement: `● Conoce y comprende los temas, indicadores de desempeño y metodología de trabajo del ${perClean} periodo.\n● Participa activamente en la concertación de acuerdos pedagógicos, normas de aula y criterios de evaluación formativa.\n● Asume una actitud de responsabilidad, escucha respetuosa y compromiso ético frente a las actividades de aprendizaje.`,
      suggestedSequence: "Inicio: Saludo de bienvenida, motivación inicial y socialización del encuadre pedagógico del periodo. Desarrollo: Presentación detallada de la malla curricular, ejes temáticos, indicadores de desempeño y criterios de evaluación institucional; concertación del pacto pedagógico de aula y normas de convivencia. Cierre: Registro de temas e indicadores en el cuaderno pedagógico por parte de los estudiantes y resolución de inquietudes."
    };
  },

  /**
   * Determina si un tema corresponde a la clase de introducción pedagógica institucional
   */
  isIntroTopic(topicStr) {
    const s = String(topicStr || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s.includes('introduccion a la clase') ||
           s.includes('introduccion a la asignatura') ||
           s.includes('acuerdos pedagogicos') ||
           s.includes('clase #1') ||
           (s.includes('temas') && s.includes('indicadores'));
  },

  getAllCurriculum() {
    if (this._cachedCurriculum) return this._cachedCurriculum;
    try {
      const data = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CURRICULUM_KEY) : null;
      let parsed = data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));

      if (parsed && (!parsed["1°"] || !parsed["1°"]["Robótica"] || !parsed["1°"]["Robótica"]["10°"] || parsed["1°"]["Robótica"]["10°"].length < 5)) {
        if (!parsed["1°"]) parsed["1°"] = {};
        if (!parsed["1°"]["Robótica"]) parsed["1°"]["Robótica"] = {};
        parsed["1°"]["Robótica"]["10°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Robótica"]["10°"]));
      }

      // Sincronización oficial de 7° Sistemas / Tecnología e Informática con los estándares institucionales
      if (parsed && (!parsed["1°"] || !parsed["1°"]["Sistemas"] || !parsed["1°"]["Sistemas"]["7°"] || !parsed["1°"]["Sistemas"]["7°"][0] || !parsed["1°"]["Sistemas"]["7°"][0].dba || !parsed["1°"]["Sistemas"]["7°"][0].dba.includes('Apropiación y uso responsable'))) {
        if (!parsed["1°"]) parsed["1°"] = {};
        if (!parsed["1°"]["Sistemas"]) parsed["1°"]["Sistemas"] = {};
        parsed["1°"]["Sistemas"]["7°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Sistemas"]["7°"]));
        if (!parsed["1°"]["Tecnología e Informática"]) parsed["1°"]["Tecnología e Informática"] = {};
        parsed["1°"]["Tecnología e Informática"]["7°"] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM["1°"]["Sistemas"]["7°"]));
      }

      // REGLA OBLIGATORIA: Para TODAS las materias y grados en todos los periodos, la Clase 1 siempre es la Introducción
      let hasIntroUpdates = false;
      for (const p of Object.keys(parsed)) {
        if (!parsed[p] || typeof parsed[p] !== 'object') continue;
        for (const s of Object.keys(parsed[p])) {
          if (!parsed[p][s] || typeof parsed[p][s] !== 'object') continue;
          for (const g of Object.keys(parsed[p][s])) {
            const list = parsed[p][s][g];
            if (Array.isArray(list) && list.length > 0) {
              if (!this.isIntroTopic(list[0]?.topic)) {
                const baseStd = list[0]?.dba || '';
                list.unshift(this.getIntroClassItem(p, s, g, baseStd));
                hasIntroUpdates = true;
              }
            }
          }
        }
      }

      if ((hasIntroUpdates || !data) && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_CURRICULUM_KEY, JSON.stringify(parsed));
      }
      this._cachedCurriculum = parsed;
      return parsed;
    } catch (e) {
      console.error('Error al leer banco curricular:', e);
      return JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
    }
  },

  saveAllCurriculum(curriculumData) {
    try {
      this._cachedCurriculum = curriculumData;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_CURRICULUM_KEY, JSON.stringify(curriculumData));
      }
      return true;
    } catch (e) {
      console.error('Error al guardar banco curricular:', e);
      return false;
    }
  },

  getItems(period, subject, grade) {
    const isDirGroup = subject && String(subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    if (isDirGroup) {
      return [];
    }

    const all = this.getAllCurriculum();
    const normGrade = (g) => String(g || '').trim();
    const gKey = normGrade(grade);
    const gAlt = gKey.endsWith('°') ? gKey.slice(0, -1) : (gKey + '°');

    const normalize = (s) => String(s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const getSubjectAliases = (sub) => {
      const norm = normalize(sub);
      const aliases = [norm];
      if (norm.includes('sistema') || norm.includes('tecnolog') || norm.includes('informatic')) {
        ['sistemas', 'tecnologia e informatica', 'tecnologia', 'informatica'].forEach(a => {
          if (!aliases.includes(a)) aliases.push(a);
        });
      }
      if (norm.includes('logica')) {
        ['logica', 'logica matematica', 'lógica', 'lógica matemática'].forEach(a => {
          const na = normalize(a);
          if (!aliases.includes(na)) aliases.push(na);
        });
      }
      return aliases;
    };

    const findGradeItems = (perObj, sub) => {
      if (!perObj) return null;
      const aliases = getSubjectAliases(sub);
      for (const alias of aliases) {
        const subFound = Object.keys(perObj).find(k => normalize(k) === alias);
        if (subFound && perObj[subFound]) {
          if (perObj[subFound][gKey]) return perObj[subFound][gKey];
          if (perObj[subFound][gAlt]) return perObj[subFound][gAlt];
          const gNorm = normalize(gKey);
          const gFound = Object.keys(perObj[subFound]).find(k => normalize(k) === gNorm);
          if (gFound && perObj[subFound][gFound]) return perObj[subFound][gFound];
        }
      }
      return null;
    };

    let items = findGradeItems(all[period], subject);
    if (!items || items.length === 0) {
      // Fallback a periodo 1° si no existe en ese periodo específico
      items = findGradeItems(all["1°"], subject);
    }

    if (!items || items.length === 0) {
      return [this.getIntroClassItem(period, subject, grade)];
    }

    // Regla obligatoria: La Clase 1 SIEMPRE debe ser Introducción a la clase
    if (!this.isIntroTopic(items[0]?.topic)) {
      const baseStd = items[0]?.dba || '';
      items.unshift(this.getIntroClassItem(period, subject, grade, baseStd));
    }

    return items;
  },

  /**
   * Obtiene automáticamente el tema, DBA y desempeño correspondiente
   * para un periodo, asignatura, grado y número correlativo de clase.
   */
  getAutoCurriculumItem(period, subject, grade, classNum) {
    const isDirGroup = subject && String(subject).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('direccion de grupo');
    if (isDirGroup) {
      return {
        id: '',
        topic: '',
        dba: '',
        achievement: '',
        suggestedSequence: ''
      };
    }

    const num = Math.max(1, parseInt(classNum, 10) || 1);
    
    // Regla de Clase 1: Siempre es Introducción oficial
    if (num === 1) {
      const items = this.getItems(period, subject, grade);
      if (items && items.length > 0 && this.isIntroTopic(items[0]?.topic)) {
        return items[0];
      }
      return this.getIntroClassItem(period, subject, grade);
    }

    const items = this.getItems(period, subject, grade);
    if (items && items.length > 0) {
      const idx = (num - 1) % items.length;
      return items[idx];
    }

    // Generador pedagógico institucional de respaldo (asegura que nunca quede vacío)
    const subClean = String(subject || 'Clase').trim();
    const grdClean = String(grade || 'General').trim();
    const perClean = String(period || '1°').trim();
    return {
      id: `auto_${subClean}_${grdClean}_${perClean}_${num}`,
      topic: `${subClean} ${grdClean} - Eje Temático #${num} (${perClean} Periodo)`,
      dba: `DBA: Aplica los conceptos, modelos y competencias fundamentales de ${subClean} para ${grdClean} en la resolución de problemas durante el ${perClean} periodo.`,
      achievement: `Saber: Comprende los conceptos y estructuras clave de ${subClean} correspondientes a ${grdClean}. Hacer: Desarrolla actividades pedagógicas y talleres procedimentales con autonomía y rigor.`
    };
  },

  saveItems(period, subject, grade, items) {
    const all = this.getAllCurriculum();
    if (!all[period]) all[period] = {};
    if (!all[period][subject]) all[period][subject] = {};
    all[period][subject][grade] = items;
    this._cachedCurriculum = all;
    return this.saveAllCurriculum(all);
  }
};

const CurriculumManager = {
  selectedPeriod: '1°',
  selectedSubject: '',
  selectedGrade: '',
  currentItems: [],

  init() {
    const profile = StorageService.getProfile();
    this.selectedPeriod = profile.period || '1°';
    
    // Asignatura por defecto
    const subjects = profile.subjects || [];
    if (subjects.length > 0) {
      this.selectedSubject = typeof subjects[0] === 'string' ? subjects[0] : subjects[0].name;
      const grades = this.getGradesForSubject(this.selectedSubject);
      this.selectedGrade = grades.length > 0 ? grades[0] : (profile.homeroom || '1°');
    }

    this.loadCurrentItems();
  },

  getGradesForSubject(subjectName) {
    const profile = StorageService.getProfile();
    const subObj = (profile.subjects || []).find(s => (typeof s === 'string' ? s : s.name) === subjectName);
    if (subObj && typeof subObj === 'object' && Array.isArray(subObj.grades) && subObj.grades.length > 0) {
      return subObj.grades;
    }
    return profile.grades || ['1°', '2°', '3°', '4°A', '4°B', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  },

  openModal(period, subject, grade) {
    if (period) this.selectedPeriod = period;
    if (subject) this.selectedSubject = subject;
    if (grade) this.selectedGrade = grade;

    if (!this.selectedSubject) {
      this.init();
    } else {
      this.loadCurrentItems();
    }

    this.render();
    const modal = document.getElementById('curriculum-modal-backdrop');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('curriculum-modal-backdrop');
    if (modal) modal.classList.remove('active');
  },

  loadCurrentItems() {
    this.currentItems = CurriculumService.getItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade);
  },

  onPeriodChange(val) {
    this.selectedPeriod = val;
    this.loadCurrentItems();
    this.render();
  },

  onSubjectChange(val) {
    this.selectedSubject = val;
    const grades = this.getGradesForSubject(val);
    if (!grades.includes(this.selectedGrade) && grades.length > 0) {
      this.selectedGrade = grades[0];
    }
    this.loadCurrentItems();
    this.render();
  },

  onGradeChange(val) {
    this.selectedGrade = val;
    this.loadCurrentItems();
    this.render();
  },

  addNewRow() {
    this.collectFromDOM();
    this.currentItems.push({
      id: 'cur_' + Date.now(),
      topic: '',
      dba: '',
      achievement: ''
    });
    this.render();
  },

  deleteRow(idx) {
    this.collectFromDOM();
    if (!confirm('¿Deseas eliminar este tema del banco curricular?')) return;
    this.currentItems.splice(idx, 1);
    this.render();
    this.saveData();
  },

  collectFromDOM() {
    const rows = document.querySelectorAll('.curriculum-row');
    const items = [];
    rows.forEach((row, idx) => {
      const topic = row.querySelector('.cur-input-topic')?.value || '';
      const dba = row.querySelector('.cur-input-dba')?.value || '';
      const achievement = row.querySelector('.cur-input-achievement')?.value || '';
      const id = this.currentItems[idx]?.id || ('cur_' + Date.now() + '_' + idx);

      if (topic.trim() || dba.trim() || achievement.trim()) {
        items.push({ id, topic, dba, achievement });
      }
    });
    this.currentItems = items;
  },

  saveData() {
    this.collectFromDOM();
    CurriculumService.saveItems(this.selectedPeriod, this.selectedSubject, this.selectedGrade, this.currentItems);
    App.showToast(`Malla de ${this.selectedSubject} (${this.selectedGrade}) - ${this.selectedPeriod} guardada`, 'success');
    this.closeModal();

    // Re-renderizar planeador si está activo para que se actualicen los selectores de temas
    if (window.Planner && window.Planner.render) {
      window.Planner.render();
    }
  },

  render() {
    const profile = StorageService.getProfile();
    const subjects = profile.subjects || [];
    const availableGrades = this.getGradesForSubject(this.selectedSubject);

    const subjectOptions = subjects.map(s => {
      const name = typeof s === 'string' ? s : s.name;
      return `<option value="${name}" ${this.selectedSubject === name ? 'selected' : ''}>${name}</option>`;
    }).join('');

    const gradeOptions = availableGrades.map(g => {
      return `<option value="${g}" ${this.selectedGrade === g ? 'selected' : ''}>${g}</option>`;
    }).join('');

    const rowsHtml = this.currentItems.map((item, idx) => `
      <tr class="curriculum-row" style="border-bottom: 1px solid var(--slate-200);">
        <td style="padding: 8px; vertical-align: top; width: 5%; text-align: center; font-weight: bold; color: var(--slate-500);">
          ${idx + 1}
        </td>
        <td style="padding: 8px; vertical-align: top; width: 28%;">
          <textarea class="form-control cur-input-topic" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="Nombre o eje temático...">${this.escapeHtml(item.topic || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: top; width: 32%;">
          <textarea class="form-control cur-input-dba" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="DBA asociado...">${this.escapeHtml(item.dba || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: top; width: 30%;">
          <textarea class="form-control cur-input-achievement" rows="2" style="font-size: 0.82rem; resize: vertical;" placeholder="Logro e Indicador de desempeño...">${this.escapeHtml(item.achievement || '')}</textarea>
        </td>
        <td style="padding: 8px; vertical-align: middle; width: 5%; text-align: center;">
          <button type="button" class="btn btn-danger-subtle btn-icon" onclick="CurriculumManager.deleteRow(${idx})" title="Eliminar tema">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');

    let container = document.getElementById('curriculum-modal-backdrop');
    if (!container) {
      container = document.createElement('div');
      container.id = 'curriculum-modal-backdrop';
      container.className = 'modal-backdrop';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="modal-card" style="max-width: 900px; width: 95%;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="background: var(--primary-100); color: var(--primary-700); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">📖</div>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--slate-900);">Malla Curricular Institucional (Temas, Logros y DBAs)</h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--slate-500);">Configura los temas que aparecerán automáticamente en el planeador para cada clase</p>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-icon" onclick="CurriculumManager.closeModal()" title="Cerrar">✕</button>
        </div>

        <div class="modal-body" style="padding: 1rem 1.25rem;">
          <!-- Filtros de selección rápida -->
          <div style="display: flex; gap: 1rem; background: var(--slate-50); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--slate-200); margin-bottom: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 140px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Periodo:</label>
              <select class="form-select" onchange="CurriculumManager.onPeriodChange(this.value)">
                <option value="1°" ${this.selectedPeriod === '1°' ? 'selected' : ''}>1° Periodo</option>
                <option value="2°" ${this.selectedPeriod === '2°' ? 'selected' : ''}>2° Periodo</option>
                <option value="3°" ${this.selectedPeriod === '3°' ? 'selected' : ''}>3° Periodo</option>
                <option value="4°" ${this.selectedPeriod === '4°' ? 'selected' : ''}>4° Periodo</option>
              </select>
            </div>

            <div style="flex: 1.5; min-width: 180px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Asignatura:</label>
              <select class="form-select" onchange="CurriculumManager.onSubjectChange(this.value)">
                ${subjectOptions}
              </select>
            </div>

            <div style="flex: 1; min-width: 120px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Grado / Curso:</label>
              <select class="form-select" onchange="CurriculumManager.onGradeChange(this.value)">
                ${gradeOptions}
              </select>
            </div>
          </div>

          <!-- Tabla de temas -->
          <div style="max-height: 50vh; overflow-y: auto; border: 1px solid var(--slate-200); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; background: #fff;">
              <thead style="background: var(--slate-100); position: sticky; top: 0; z-index: 1;">
                <tr>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 5%;">#</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 28%;">Eje Temático / Tema</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 32%;">DBA (Derecho Básico)</th>
                  <th style="padding: 8px; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-600); width: 30%;">Logro e Indicador</th>
                  <th style="padding: 8px; width: 5%;"></th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml.length > 0 ? rowsHtml : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--slate-400); font-size: 0.85rem;">
                      No hay temas registrados para ${this.selectedSubject} en ${this.selectedGrade} (${this.selectedPeriod} Periodo).<br/>
                      Haz clic en <strong>"+ Añadir Tema"</strong> para registrar el primero.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-secondary" style="font-size: 0.82rem;" onclick="CurriculumManager.addNewRow()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Añadir Tema
            </button>
            <span style="font-size: 0.78rem; color: var(--slate-500);">Total temas en esta malla: <strong>${this.currentItems.length}</strong></span>
          </div>
        </div>

        <div class="modal-footer" style="padding: 0.75rem 1.25rem; background: var(--slate-50); border-top: 1px solid var(--slate-200); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="CurriculumManager.closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="CurriculumManager.saveData()">💾 Guardar Malla</button>
        </div>
      </div>
    `;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

CurriculumManager.save = function() {
  this.saveData();
};

CurriculumService.mallaSeptimoMatematicas = {
  "subject": "Matemáticas",
  "grade": "7°",
  "teachers": [
    "Manuel Alejandro Muñoz Palomino"
  ],
  "weeklyHours": "5H",
  "courseObjective": "Comprender y utilizar diferentes formas de representar números enteros, fraccionarios y decimales, aplicando la estructura del sistema de numeración decimal y los algoritmos para operar con ellos. Emplear estrategias de estimación, modelación simbólica y lenguaje algebraico para resolver y verificar problemas numéricos, variacionales y aleatorios, analizando situaciones de cambio y de incertidumbre en contextos reales.",
  "allPeriodsDBA": "● Comprende y resuelve problemas que involucran números racionales en sus diferentes representaciones (fracciones, decimales, razones) y operaciones básicas (suma, resta, multiplicación, división), así como potenciación y radicación en contextos adecuados.\n● Describe y utiliza algoritmos —convencionales y no convencionales— para realizar operaciones con números racionales y los emplea con sentido en la solución de problemas.\n● Utiliza diferentes relaciones y representaciones (recta numérica, fracciones equivalentes, decimales) para argumentar y resolver problemas con cantidades desconocidas.\n● Aplica el sistema métrico decimal en la conversión y uso de unidades (longitud, masa, capacidad, tiempo) para resolver problemas de medida.\n● Plantea y resuelve ecuaciones y expresiones algebraicas simples, las describe verbalmente y las representa de forma numérica, simbólica o gráfica.\n● Justifica procedimientos aritméticos y algebraicos mediante las propiedades de las operaciones (conmutativa, asociativa, distributiva) y razona cuándo un cálculo debe ser exacto o aproximado.\n● Aplica técnicas de estimación y verificación para valorar la plausibilidad de los resultados obtenidos.",
  "competencies": {
    "mathematical": [
      "Razonamiento y demostración",
      "Modelación",
      "Comunicación",
      "Resolución de problemas"
    ],
    "thoughts": [
      "Pensamiento Numérico y Sistemas Numéricos",
      "Pensamiento Espacial y Sistemas Geométricos",
      "Pensamiento Métrico y Sistemas de Medidas",
      "Pensamiento Aleatorio y Sistemas de Datos",
      "Pensamiento Variacional y Sistemas Algebraicos y Analíticos"
    ],
    "citizenship": [
      "Competencias Ciudadanas, Convivencia y Paz, Participación y Pluralidad: Practico el respeto, manejo mis emociones, cumplo normas y valoro las diferencias."
    ]
  },
  "periods": {
    "1°": {
      "name": "Primer Periodo: Pensamiento Numérico (Números Enteros)",
      "standard": "Justifico procedimientos aritméticos y aplico las propiedades de las operaciones con números enteros para modelar situaciones de la vida cotidiana (temperaturas, niveles, deudas, ganancias).",
      "problemQuestion": "¿Cómo profundizamos en el uso de los números enteros (Z) y sus operaciones para modelar y resolver situaciones de nuestro entorno, como temperaturas, deudas y niveles?",
      "topics": [
        "El conjunto de los Números Enteros {Z}: Necesidad histórica y números relativos con signo",
        "Representación de números enteros en la recta numérica, orden y valor absoluto",
        "Operaciones aditivas en {Z} (adición y sustracción): algoritmo, ley de signos y problemas del entorno",
        "Operaciones multiplicativas en {Z} (multiplicación y división exacta): ley de signos y aplicaciones",
        "Propiedades de las operaciones en {Z} (conmutativa, asociativa, distributiva)",
        "Potenciación y radicación de enteros: propiedades y cálculo en contextos significativos",
        "Jerarquía de las operaciones y polinomios aritméticos con signos de agrupación",
        "Introducción al lenguaje algebraico en {Z}: incógnitas, relaciones y traducción de enunciados",
        "Ecuaciones lineales básicas en {Z} aplicadas a la solución de problemas"
      ],
      "achievement": "● Reconoce y conceptualiza el conjunto de los números enteros {Z}, su representación en la recta numérica y las relaciones de orden y valor absoluto, con el propósito de modelar cuantitativamente fenómenos del entorno físico y socioeconómico donde los números naturales resultan insuficientes (tales como balances financieros, temperaturas extremas y altitudes geográficas).\n● Aplica con exactitud los algoritmos de adición, sustracción, multiplicación, división, potencias y polinomios aritméticos en {Z}, con la finalidad de estructurar estrategias de solución a problemas cotidianos y plantear ecuaciones lineales sencillas que permitan tomar decisiones fundamentadas.\n● Desarrolla el razonamiento lógico, el rigor matemático y el hábito de verificar los procedimientos propios y ajenos, con el fin de formular argumentos sólidos, emitir juicios críticos ante situaciones problema y afrontar con seguridad desafíos académicos y pruebas estandarizadas.",
      "resources": "TICs, cuaderno, aplicaciones educativas, material concreto.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "2°": {
      "name": "Segundo Periodo: Pensamiento Numérico y Variacional (Racionales y Proporcionalidad)",
      "standard": "Resuelvo y formulo problemas que implican la potenciación, radicación y aplicación de razones y proporciones con números racionales, utilizando diferentes representaciones (fracción, decimal, porcentaje) para interpretar y comunicar situaciones de la vida cotidiana.",
      "problemQuestion": "¿De qué manera los números racionales (Q) y las relaciones de proporcionalidad nos permiten modelar situaciones de reparto, cambio y comparación en contextos cotidianos como descuentos, mezclas o escalas?",
      "topics": [
        "Conjunto de números racionales (Q): Necesidad histórica y relación con los números enteros",
        "Representación de los racionales en forma fraccionaria, decimal y porcentual",
        "Ubicación de números racionales en la recta numérica y comparación de magnitudes",
        "Operaciones con números racionales: Adición y sustracción (fracciones homogéneas y heterogéneas)",
        "Operaciones con números racionales: Multiplicación y división (fracción recíproca)",
        "Potenciación y radicación en números racionales y estrategias de simplificación",
        "Aplicación de números racionales en contextos reales (recetas, mezclas, escalas y tasas de cambio)",
        "Razones y proporciones: Regla de tres simple (directa e inversa)",
        "Cálculo de porcentajes, variaciones porcentuales y modelación de proporcionalidad"
      ],
      "achievement": "● Representa números racionales en diferentes formas y los ubica en la recta numérica, para reconocer equivalencias y relaciones entre fracciones, decimales y porcentajes en contextos reales.\n● Aplica algoritmos de operaciones con números racionales en la resolución de problemas contextualizados, para fortalecer la precisión y la coherencia en el razonamiento matemático.\n● Argumenta y justifica procedimientos de cálculo y simplificación, para comunicar con claridad sus estrategias y validar sus resultados ante sus pares.\n● Modela situaciones de proporcionalidad directa e inversa utilizando la regla de tres y porcentajes, para interpretar fenómenos cotidianos como repartos, descuentos o escalas.\n● Interpreta resultados y comunica conclusiones con lenguaje matemático adecuado, para expresar ideas cuantitativas con rigor y comprensión conceptual.",
      "resources": "TICs, cuaderno, material concreto y manipulativo, aplicaciones interactivas y trabajo colaborativo.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "3°": {
      "name": "Tercer Periodo: Pensamiento Variacional y Espacial (Álgebra y Geometría)",
      "standard": "Formulo, represento y resuelvo problemas que involucran ecuaciones y expresiones algebraicas, aplicando propiedades de las operaciones y del orden para interpretar relaciones de variación y comunicar resultados con precisión.",
      "problemQuestion": "¿Cómo podemos usar el lenguaje algebraico y las ecuaciones para representar, analizar y resolver situaciones de cambio y relaciones entre cantidades en la vida cotidiana?",
      "topics": [
        "Lenguaje algebraico y representación simbólica: Concepto de variable, constante y término algebraico",
        "Traducción de situaciones cotidianas al lenguaje algebraico",
        "Evaluación y simplificación de expresiones algebraicas (términos semejantes y valor numérico)",
        "Identificación de patrones numéricos y relaciones funcionales",
        "Ecuaciones de primer grado con una incógnita: Planteamiento y propiedades de la igualdad",
        "Resolución de ecuaciones lineales y verificación de soluciones",
        "Aplicación de ecuaciones en contextos reales (repartos, precios, distancias, mezclas y balances)",
        "Representación y análisis de relaciones de cambio: Construcción de tablas y gráficas",
        "Interpretación de tendencias, dependencias y comunicación de resultados"
      ],
      "achievement": "● Identifica variables y constantes en expresiones algebraicas, para comprender cómo se representan relaciones de cambio y patrones en diferentes contextos.\n● Traduce situaciones cotidianas al lenguaje algebraico, para modelar fenómenos y resolver problemas con mayor precisión y claridad.\n● Resuelve ecuaciones de primer grado aplicando propiedades de igualdad y operaciones inversas, para determinar valores desconocidos y verificar la validez de sus soluciones.\n● Analiza y comunica resultados obtenidos en la resolución de ecuaciones, para fortalecer la argumentación y la interpretación matemática.\n● Representa relaciones de cambio mediante tablas y gráficas, para visualizar dependencias entre variables y comunicar tendencias de manera efectiva.\n● Argumenta sus procedimientos y resultados, para consolidar la comprensión conceptual y la comunicación matemática.",
      "resources": "Material concreto y manipulativo (tarjetas algebraicas, regletas, balanzas de ecuaciones), TICs y aplicaciones interactivas.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    },
    "4°": {
      "name": "Cuarto Periodo: Pensamiento Aleatorio (Estadística)",
      "standard": "Recojo, organizo, analizo e interpreto datos de diferentes fuentes para describir fenómenos y tomar decisiones fundamentadas, aplicando conceptos básicos de probabilidad y medidas estadísticas.",
      "problemQuestion": "¿Cómo podemos usar la estadística y la probabilidad para interpretar información, tomar decisiones y comunicar resultados sobre situaciones reales en nuestro entorno?",
      "topics": [
        "Recolección y organización de datos: Tipos de variables (cualitativas y cuantitativas)",
        "Tablas de frecuencias (absoluta, relativa y porcentual) para datos no agrupados",
        "Representación gráfica de datos: Diagramas de barras, sectores circulares y pictogramas",
        "Uso de herramientas digitales para organizar información e identificación de sesgos",
        "Medidas de tendencia central: Media aritmética (cálculo e interpretación)",
        "Medidas de tendencia central: Mediana y Moda en conjuntos de datos",
        "Comparación de conjuntos de datos y formulación de conclusiones basadas en evidencia",
        "Introducción a la probabilidad: Concepto de experimento aleatorio, evento y espacio muestral",
        "Cálculo de probabilidades simples (Regla de Laplace) y estimación de la incertidumbre"
      ],
      "achievement": "● Recolecta y organiza datos en tablas y gráficos, para representar información de manera clara y facilitar su análisis.\n● Calcula medidas de tendencia central (media, mediana y moda), para resumir y comparar conjuntos de datos de forma significativa.\n● Interpreta gráficos y tablas de frecuencia, para comunicar conclusiones y tomar decisiones basadas en evidencia.\n● Aplica conceptos básicos de probabilidad en situaciones cotidianas, para estimar resultados posibles y comprender la incertidumbre.",
      "resources": "TICs, cuaderno, material concreto y manipulativo (dados, fichas, encuestas), aplicaciones interactivas y proyectos prácticos.",
      "evaluation": "Observación y registro continuo, rúbricas analíticas, autoevaluación, coevaluación y retroalimentación formativa."
    }
  }
};


CurriculumService.mallaDecimoRobotica = {
  subject: "Robótica",
  grade: "10°",
  weeklyHours: "2H (Jueves)",
  teachers: ["Manuel Muñoz"],
  courseObjective: "Diseñar, ensamblar, cablear y programar una pinza robótica articulada mediante modelado digital CAD (Tinkercad), corte de precisión en acrílico/MDF y control electrónico con Arduino y servomotores, traduciendo señales analógicas de un joystick en trayectorias mecánicas angulares con la asistencia crítica de herramientas de Inteligencia Artificial.",
  problemQuestion: "¿Cómo transformar señales analógicas de un módulo joystick en trayectorias mecánicas angulares para accionar una pinza robótica articulada mediante servomotores y engranajes?",
  standard: "Analizo y seleccionar componentes electrónicos, sistemas de modelado digital y estructuras de control por software para integrarlos en un prototipo mecatrónico funcional.",
  thematicAxes: [
    {
      num: 1,
      title: "Electrónica y Potencia del Robot",
      weeks: "Semanas 1 a 2",
      topics: [
        "Señales analógicas vs. digitales: principio del joystick (potenciómetros de 2 ejes X/Y y botón Z).",
        "Actuadores angulares: servomotor (MG995 / MG996R o SG90), principio de modulación PWM y torque.",
        "Gestión de potencia: alimentación externa independiente (pack de baterías), masa común (GND) y protección del microcontrolador."
      ]
    },
    {
      num: 2,
      title: "Diseño CAD y Fabricación Mecánica",
      weeks: "Semanas 3 a 5",
      topics: [
        "Interpretación de planos técnicos CNC a escala 1:1 (piezas 18 a 27).",
        "Modelado paramétrico en CAD (Tinkercad): simulación 3D de eslabones articulados.",
        "Ensamble estructural: calado/corte de piezas (acrílico/MDF) y reducción de fricción con arandelas.",
        "Sincronización de engranajes 19 y 20 y fijación del cero mecánico en el chasis (pieza 18)."
      ]
    },
    {
      num: 3,
      title: "Programación y Control en Arduino asistido por IA",
      weeks: "Semanas 6 a 8",
      topics: [
        "Prompting técnico: formulación de instrucciones precisas a herramientas de IA para generar la plantilla base del código en C++ (Arduino IDE).",
        "Interpretación y lectura crítica de código.",
        "Estructura del sketch de Arduino, lectura analógica del pin del joystick y calibración del mapeo map(valor, 0, 1023, min_ang, max_ang) para no forzar los dientes del acrílico."
      ]
    },
    {
      num: 4,
      title: "Funcionamiento, Calibración e Integración",
      weeks: "Semanas 9 a 10",
      topics: [
        "Acople físico: fijación del servomotor al chasis (pieza 18) y calibración del cero mecánico.",
        "Pruebas de cinemática: apertura y cierre simétrico en lazo abierto mediante mando por joystick.",
        "Desafío 'Pick & Place' en equipos de 3: prueba de carga, sujeción y traslado de objetos."
      ]
    }
  ],
  performanceIndicators: {
    saber: "Comprende cómo la variación de voltaje del joystick se traduce en movimiento angular y es capaz de explicar la función de cada línea del código de Arduino generado con asistencia de IA.",
    hacer: "Ensambla la estructura según los planos técnicos CNC, cablea el circuito en protoboard y adapta el código generado por IA configurando los pines y límites de giro correctos.",
    ser: "Cumple de manera responsable con su rol en el equipo de 3 estudiantes, cuida las herramientas y asume una postura ética y analítica ante la IA (usándola como apoyo y no como reemplazo de su comprensión).",
    prototipado: "Utiliza el prototipado rápido como herramienta para la resolución de problemas mecatrónicos."
  },
  resources: [
    "Planos técnicos CNC descargables a escala 1:1 (piezas 18 a 27).",
    "Esquema eléctrico oficial de conexión (Arduino, Joystick, Servo y Baterías).",
    "Guía de prompting para programación en Arduino con IA.",
    "Impresoras 3D, cortadoras láser y herramientas de prototipado rápido."
  ],
  formativeEvaluation: [
    "Diagnóstica/Proceso: Pruebas semanales de lectura del joystick en el Monitor Serial y simulación en Tinkercad Circuits.",
    "Sustentación de Código (Interpretación de IA): Evaluación oral individual o grupal donde las estudiantes explican qué hace cada bloque del código sugerido por la IA y cómo modificaron los parámetros clave.",
    "Revisión Mecánica: Movimiento suave y sincronizado de los engranajes 19 y 20 sin atascos.",
    "Reto Funcional Pick & Place: Eficacia de la pinza al sujetar y trasladar piezas sin que el motor vibre ni pierda posición.",
    "Bitácora y Coevaluación: Registro grupal del prompt usado, código final comentado, diagrama de conexiones y evaluación interna entre pares."
  ]
};


CurriculumService.mallaSeptimoSistemas = {
  subject: "Tecnología e Informática / Sistemas",
  grade: "7°",
  period: "1°",
  weeklyHours: "1H (Lunes)",
  teachers: ["Manuel Alejandro Muñoz Palomino"],
  courseObjective: "Apropiar y utilizar responsablemente las herramientas ofimáticas y de creación de contenidos digitales para comunicar ideas, analizar datos y producir piezas audiovisuales e interactivas con calidad profesional y creatividad.",
  standard: "Apropiación y uso responsable de la tecnología para la producción de contenidos digitales con fines comunicativos, educativos y creativos.",
  problemQuestion: "¿Cómo utilizar las herramientas de ofimática y creación de contenido digital para comunicar ideas con calidad profesional y creatividad?",
  thematicAxes: [
    {
      num: 1,
      title: "Procesadores de texto",
      topics: [
        "Aplicación de estilos, tablas y diseño editorial básico.",
        "Normas de presentación y formato digital."
      ]
    },
    {
      num: 2,
      title: "Hojas de cálculo",
      topics: [
        "Uso de fórmulas avanzadas y gráficos.",
        "Automatización de cálculos y análisis de datos."
      ]
    },
    {
      num: 3,
      title: "Presentaciones interactivas",
      topics: [
        "Integración de elementos multimedia y animaciones.",
        "Diseño visual coherente y atractivo."
      ]
    },
    {
      num: 4,
      title: "Creación y edición de contenido digital",
      topics: [
        "Edición y grabación de video con criterios estéticos y técnicos.",
        "Producción de piezas digitales (texto, imagen, audio o video) con propósito comunicativo."
      ]
    }
  ],
  performanceIndicators: [
    "Gestiona documentos complejos con estilos definidos, para comunicar información con claridad y presentación profesional.",
    "Automatiza cálculos mediante funciones avanzadas, para analizar datos y tomar decisiones informadas en contextos académicos o cotidianos.",
    "Crea presentaciones digitales interactivas, para expresar ideas de forma visual y atractiva que capte la atención del público.",
    "Diseña piezas de contenido digital (texto, imagen, audio o video), para transmitir mensajes con coherencia estética y técnica.",
    "Edita y graba videos con criterios técnicos y narrativos, para producir materiales audiovisuales que comuniquen ideas o proyectos escolares con impacto.",
    "Evalúa la pertinencia y calidad de los contenidos digitales creados, para mejorar continuamente sus producciones y fortalecer su pensamiento crítico."
  ],
  resources: [
    "Computadores, tabletas y celulares disponibles en aula o hogar.",
    "Software de edición de video (Clip Champ, Canva, Cap Cut, Movie Maker).",
    "Plataformas colaborativas y almacenamiento en la nube.",
    "Tutoriales, guías interactivas y recursos multimedia creados por los estudiantes."
  ],
  formativeEvaluation: [
    "Rúbrica de proyectos ofimáticos y audiovisuales.",
    "Portafolio digital con evidencias de progreso.",
    "Observación del trabajo en la nube y del proceso de edición.",
    "Producto final: video o presentación multimedia con propósito educativo o social."
  ],
  supportStrategies: [
    "Talleres prácticos de nivelación guiada en sala de sistemas para afianzar el uso de fórmulas y estilos.",
    "Acompañamiento personalizado entre pares para el montaje y exportación de proyectos audiovisuales.",
    "Guías paso a paso y videotutoriales de apoyo alojados en la nube para consulta asincrónica."
  ]
};

CurriculumService.mallaSeptimoTecnologia = CurriculumService.mallaSeptimoSistemas;

if (typeof window !== 'undefined') {
  window.CurriculumService = CurriculumService;
  window.CurriculumManager = CurriculumManager;
  window.DEFAULT_CURRICULUM = DEFAULT_CURRICULUM;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurriculumService;
}

