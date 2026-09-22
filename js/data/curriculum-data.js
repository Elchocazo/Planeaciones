/**
 * MÓDULO DE GESTIÓN DEL BANCO CURRICULAR POR PERIODO (MALLA DE TEMAS, LOGROS Y DBA)
 * Malla Curricular Oficial Institucional - Colegio Hogar Madre de Dios
 * Docente: Manuel Alejandro Muñoz Palomino / Manuel Muñoz
 *
 * Arquitectura modularizada y optimizada:
 * Los datos se organizan por materia bajo js/data/curriculum/:
 * - matematicas.js
 * - sistemas.js
 * - robotica.js
 * - logica.js
 * - direccion_grupo.js
 *
 * Este archivo centraliza y expone DEFAULT_CURRICULUM manteniendo 100%
 * de compatibilidad retroactiva con window.DEFAULT_CURRICULUM y module.exports.
 */

const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v13';

let DEFAULT_CURRICULUM = {
  "1°": {},
  "2°": {},
  "3°": {},
  "4°": {}
};

// Carga en entorno Node.js
if (typeof module !== 'undefined' && typeof require === 'function') {
  try {
    const mat = require('./curriculum/matematicas.js');
    const sis = require('./curriculum/sistemas.js');
    const rob = require('./curriculum/robotica.js');
    const log = require('./curriculum/logica.js');
    const dir = require('./curriculum/direccion_grupo.js');

    [mat, sis, rob, log, dir].forEach(mod => {
      ['1°', '2°', '3°', '4°'].forEach(p => {
        if (mod && mod[p]) Object.assign(DEFAULT_CURRICULUM[p], mod[p]);
      });
    });
  } catch (e) {
    console.warn('[curriculum-data] Error cargando módulos curriculares en Node:', e);
  }
}

// Carga en entorno Navegador
if (typeof window !== 'undefined') {
  const browserModules = [
    window.CURRICULUM_MATEMATICAS,
    window.CURRICULUM_SISTEMAS,
    window.CURRICULUM_ROBOTICA,
    window.CURRICULUM_LOGICA,
    window.CURRICULUM_DIRECCION_GRUPO
  ];

  browserModules.forEach(mod => {
    if (mod) {
      ['1°', '2°', '3°', '4°'].forEach(p => {
        if (mod[p]) Object.assign(DEFAULT_CURRICULUM[p], mod[p]);
      });
    }
  });

  // Si ya existía un DEFAULT_CURRICULUM previo, fusionarlo
  if (window.DEFAULT_CURRICULUM && typeof window.DEFAULT_CURRICULUM === 'object') {
    ['1°', '2°', '3°', '4°'].forEach(p => {
      if (window.DEFAULT_CURRICULUM[p]) {
        Object.assign(DEFAULT_CURRICULUM[p], window.DEFAULT_CURRICULUM[p]);
      }
    });
  }
}

// Equivalencia completa entre Sistemas y Tecnología e Informática para todos los periodos
['1°', '2°', '3°', '4°'].forEach(p => {
  if (DEFAULT_CURRICULUM[p] && DEFAULT_CURRICULUM[p]['Sistemas']) {
    DEFAULT_CURRICULUM[p]['Tecnología e Informática'] = DEFAULT_CURRICULUM[p]['Sistemas'];
    DEFAULT_CURRICULUM[p]['Tecnología'] = DEFAULT_CURRICULUM[p]['Sistemas'];
  }
});

if (typeof window !== 'undefined') {
  window.DEFAULT_CURRICULUM = DEFAULT_CURRICULUM;
  window.STORAGE_CURRICULUM_KEY = STORAGE_CURRICULUM_KEY;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_CURRICULUM;
}
