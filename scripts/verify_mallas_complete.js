/**
 * Verification script for the complete Mallas integration
 * Checks all subjects, grades, and periods (1° to 4°)
 */

// Setup mock window & localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; }
};

global.window = global;

// Load CurriculumService
const CurriculumService = require('../js/curriculum.js');

const periods = ['1°', '2°', '3°', '4°'];

const subjectsAndGrades = [
  { subject: 'Matemáticas', grades: ['2°', '3°', '7°'] },
  { subject: 'Lógica', grades: ['6°'] },
  { subject: 'Sistemas', grades: ['1°', '2°', '3°', '4°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
  { subject: 'Tecnología e Informática', grades: ['1°', '2°', '3°', '4°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
  { subject: 'Tecnología', grades: ['1°', '2°', '3°', '4°', '4°A', '4°B', '5°', '6°', '7°', '8°'] },
  { subject: 'Robótica', grades: ['9°', '10°', '11°'] },
  { subject: 'Dirección de grupo', grades: ['7°'] }
];

let totalChecks = 0;
let passedChecks = 0;
let errors = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
  } else {
    errors.push(message);
    console.error('❌ FAIL:', message);
  }
}

console.log('--- INICIANDO VERIFICACIÓN DE MALLAS CURRICULARES (TODOS LOS PERIODOS 1° A 4°) ---');

for (const period of periods) {
  console.log(`\nVerificando Periodo ${period}:`);
  for (const item of subjectsAndGrades) {
    const { subject, grades } = item;
    for (const grade of grades) {
      const items = CurriculumService.getItems(period, subject, grade);
      assert(items && items.length > 1, `[${period}] ${subject} ${grade}: debe retornar al menos 2 items (Intro + temas malla) (obtenido: ${items ? items.length : 0})`);

      if (items && items.length > 1) {
        // items[0] es la Clase #1 de Introducción
        const intro = items[0];
        assert(CurriculumService.isIntroTopic(intro.topic), `[${period}] ${subject} ${grade}: item 0 debe ser Intro`);
        assert(intro.topic.startsWith('Clase #1:'), `[${period}] ${subject} ${grade}: item 0 debe empezar con 'Clase #1:'`);

        // items[1] es el primer tema de la Malla curricular oficial
        const firstMallaTopic = items[1];
        const hasTopic = !!(firstMallaTopic.topic && firstMallaTopic.topic.trim().length > 3);
        const hasDba = !!(firstMallaTopic.dba && firstMallaTopic.dba.trim().length > 10);
        const hasAchievement = !!(firstMallaTopic.achievement && firstMallaTopic.achievement.trim().length > 10);
        const hasBullets = (firstMallaTopic.dba && (firstMallaTopic.dba.includes('●') || firstMallaTopic.dba.includes('•')));
        const isNotGeneric = !firstMallaTopic.dba.includes('Aplica los conceptos, modelos y competencias');

        assert(hasTopic, `[${period}] ${subject} ${grade}: tema 1 de malla debe tener topic descriptivo ("${firstMallaTopic.topic}")`);
        assert(hasDba, `[${period}] ${subject} ${grade}: tema 1 de malla debe tener DBA`);
        assert(hasAchievement, `[${period}] ${subject} ${grade}: tema 1 de malla debe tener desempeño / logro`);
        assert(hasBullets, `[${period}] ${subject} ${grade}: tema 1 de malla DBA debe contener viñetas oficiales (● o •)`);
        assert(isNotGeneric, `[${period}] ${subject} ${grade}: no debe contener el placeholder genérico antiguo`);
      }

      // Probar AutoCurriculumItem para Clase 1
      const class1 = CurriculumService.getAutoCurriculumItem(period, subject, grade, 1);
      assert(class1 && CurriculumService.isIntroTopic(class1.topic), `[${period}] ${subject} ${grade}: Clase 1 debe ser Introducción`);
      assert(class1 && class1.topic.startsWith('Clase #1:'), `[${period}] ${subject} ${grade}: Clase 1 debe empezar con 'Clase #1:'`);

      // Probar AutoCurriculumItem para Clase 2
      const class2 = CurriculumService.getAutoCurriculumItem(period, subject, grade, 2);
      assert(class2 && !CurriculumService.isIntroTopic(class2.topic), `[${period}] ${subject} ${grade}: Clase 2 debe ser tema de malla (no intro)`);
      assert(class2 && class2.topic === items[1].topic, `[${period}] ${subject} ${grade}: Clase 2 topic debe coincidir con items[1] ("${class2?.topic?.substring(0, 30)}...")`);

      // Probar AutoCurriculumItem para Clase 3
      if (items && items.length > 2) {
        const class3 = CurriculumService.getAutoCurriculumItem(period, subject, grade, 3);
        assert(class3 && class3.topic === items[2].topic, `[${period}] ${subject} ${grade}: Clase 3 topic debe coincidir con items[2]`);
      }
    }
  }
}

console.log('\n----------------------------------------');
console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${totalChecks}`);
console.log(`PRUEBAS EXITOSAS: ${passedChecks}`);
console.log(`FALLOS: ${errors.length}`);

if (errors.length === 0) {
  console.log('🎉 TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE (100% SUCCESS)!');
  process.exit(0);
} else {
  console.error(`💥 SE ENCONTRARON ${errors.length} ERRORES.`);
  process.exit(1);
}
