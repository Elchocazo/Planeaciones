/**
 * REPOSITORIO DE CURRÍCULO (CurriculumRepository)
 * Proporciona acceso de consulta y desacoplamiento para la Malla Curricular Institucional.
 * Garantiza:
 * - Consulta pura sin mutación de planeaciones existentes.
 * - Suministro de snapshots curriculares para las clases.
 */

class CurriculumRepositoryClass {
  constructor() {
    this._bank = null;
  }

  _norm(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  getBank() {
    if (this._bank) return this._bank;
    if (typeof CurriculumService !== 'undefined' && CurriculumService.getAllCurriculum) {
      this._bank = CurriculumService.getAllCurriculum();
      return this._bank;
    }
    if (typeof window !== 'undefined' && window.DEFAULT_CURRICULUM) {
      this._bank = window.DEFAULT_CURRICULUM;
      return this._bank;
    }
    return {};
  }

  /**
   * Obtiene la lista de temas, logros y DBAs para un periodo, asignatura y grado
   */
  getItems(period = '1°', subject = '', grade = '') {
    const bank = this.getBank();
    const p = String(period || '1°').trim();
    const sNorm = this._norm(subject);
    const gNorm = this._norm(grade);

    const periodData = bank[p] || bank['1°'] || {};
    
    // Buscar la asignatura correspondiente de forma tolerante
    let foundSubjectKey = Object.keys(periodData).find(k => this._norm(k) === sNorm);
    if (!foundSubjectKey) {
      if (sNorm.includes('sistema') || sNorm.includes('tecnolog') || sNorm.includes('informat')) {
        foundSubjectKey = Object.keys(periodData).find(k => {
          const kn = this._norm(k);
          return kn.includes('sistema') || kn.includes('tecnolog');
        });
      } else if (sNorm.includes('matemat')) {
        foundSubjectKey = Object.keys(periodData).find(k => this._norm(k).includes('matemat'));
      } else if (sNorm.includes('robot')) {
        foundSubjectKey = Object.keys(periodData).find(k => this._norm(k).includes('robot'));
      }
    }

    if (!foundSubjectKey || !periodData[foundSubjectKey]) {
      return [];
    }

    const subjectData = periodData[foundSubjectKey];
    // Buscar el grado correspondiente
    let foundGradeKey = Object.keys(subjectData).find(k => this._norm(k) === gNorm);
    if (!foundGradeKey) {
      // Normalizaciones comunes: 4A -> 4°A, 7 -> 7°
      const numMatch = gNorm.match(/\d+/);
      if (numMatch) {
        foundGradeKey = Object.keys(subjectData).find(k => this._norm(k).includes(numMatch[0]));
      }
    }

    if (!foundGradeKey || !Array.isArray(subjectData[foundGradeKey])) {
      return [];
    }

    return JSON.parse(JSON.stringify(subjectData[foundGradeKey]));
  }

  /**
   * Obtiene un ítem curricular específico por número de clase (1-based)
   */
  getItemByNumber(period = '1°', subject = '', grade = '', classNumber = 1) {
    const items = this.getItems(period, subject, grade);
    if (!items || items.length === 0) return null;

    const idx = Math.max(0, parseInt(classNumber, 10) - 1);
    if (idx < items.length) {
      return items[idx];
    }
    // Si sobrepasa el número de temas, retornar el último o un ciclo
    return items[items.length - 1] || null;
  }
}

const CurriculumRepository = new CurriculumRepositoryClass();

if (typeof window !== 'undefined') {
  window.CurriculumRepository = CurriculumRepository;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurriculumRepository;
}
