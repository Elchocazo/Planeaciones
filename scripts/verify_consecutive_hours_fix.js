const fs = require('fs');
global.window = global;
global.document = { readyState: 'complete', addEventListener: () => {} };
const mockLocalStorage = {};
global.localStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; }
};

require('../js/users-service.js');
require('../js/storage.js');
require('../js/curriculum.js');
require('../js/export.js');
require('../js/docx-generator.js');

console.log('=== TEST 1: Verificación de DEFAULT_WEEKLY_SCHEDULE ===');
const schedule = StorageService.getProfile().weeklySchedule;

// Verificar Jueves (Día 4)
const thu = schedule['4'];
console.log('Total bloques los Jueves:', thu.length, '(debe ser 5)');
if (thu.length !== 5) {
  console.error('ERROR: Se esperaban 5 bloques los jueves, pero hay:', thu.length);
  process.exit(1);
}

const mat2Thu = thu.filter(c => c.subject === 'Matemáticas' && c.grade === '2°');
console.log('Bloques de Matemáticas 2° el jueves:', mat2Thu.length, '(debe ser 1)');
if (mat2Thu.length !== 1 || mat2Thu[0].time !== '7:00 - 8:40') {
  console.error('ERROR: Matemáticas 2° los jueves debe ser 1 solo bloque con horario 7:00 - 8:40. Encontrado:', mat2Thu);
  process.exit(1);
}
console.log('✔ Matemáticas 2° unificado correctamente en:', mat2Thu[0].time);

const rob11Thu = thu.filter(c => c.subject === 'Robótica' && c.grade === '11°');
console.log('Bloques de Robótica 11° el jueves:', rob11Thu.length, '(debe ser 1)');
if (rob11Thu.length !== 1 || rob11Thu[0].time !== '12:35 - 2:00') {
  console.error('ERROR: Robótica 11° los jueves debe ser 1 solo bloque con horario 12:35 - 2:00. Encontrado:', rob11Thu);
  process.exit(1);
}
console.log('✔ Robótica 11° unificado correctamente en:', rob11Thu[0].time);

// Verificar Lunes (Día 1)
const mon = schedule['1'];
const mat2Mon = mon.filter(c => c.subject === 'Matemáticas' && c.grade === '2°');
const rob9Mon = mon.filter(c => c.subject === 'Robótica' && c.grade === '9°');
if (mat2Mon.length !== 1 || mat2Mon[0].time !== '8:40 - 11:00' || rob9Mon.length !== 1 || rob9Mon[0].time !== '11:50 - 1:20') {
  console.error('ERROR: Lunes no está unificado correctamente:', mon);
  process.exit(1);
}
console.log('✔ Lunes unificado: Matemáticas 2° (8:40 - 11:00) y Robótica 9° (11:50 - 1:20)');

// Verificar Martes (Día 2)
const tue = schedule['2'];
const mat7Tue = tue.filter(c => c.subject === 'Matemáticas' && c.grade === '7°');
const rob10Tue = tue.filter(c => c.subject === 'Robótica' && c.grade === '10°');
if (mat7Tue.length !== 1 || mat7Tue[0].time !== '7:50 - 9:30' || rob10Tue.length !== 1 || rob10Tue[0].time !== '12:35 - 2:00') {
  console.error('ERROR: Martes no está unificado correctamente:', tue);
  process.exit(1);
}
console.log('✔ Martes unificado: Matemáticas 7° (7:50 - 9:30) y Robótica 10° (12:35 - 2:00)');

// Verificar Miércoles (Día 3)
const wed = schedule['3'];
const mat3Wed = wed.filter(c => c.subject === 'Matemáticas' && c.grade === '3°');
const mat7Wed = wed.filter(c => c.subject === 'Matemáticas' && c.grade === '7°');
if (mat3Wed.length !== 1 || mat3Wed[0].time !== '7:50 - 9:30' || mat7Wed.length !== 1 || mat7Wed[0].time !== '11:00 - 12:35') {
  console.error('ERROR: Miércoles no está unificado correctamente:', wed);
  process.exit(1);
}
console.log('✔ Miércoles unificado: Matemáticas 3° (7:50 - 9:30) y Matemáticas 7° (11:00 - 12:35)');

// Verificar Viernes (Día 5)
const fri = schedule['5'];
const mat3Fri = fri.filter(c => c.subject === 'Matemáticas' && c.grade === '3°');
if (mat3Fri.length !== 1 || mat3Fri[0].time !== '8:40 - 11:00') {
  console.error('ERROR: Viernes no está unificado correctamente:', fri);
  process.exit(1);
}
console.log('✔ Viernes unificado: Matemáticas 3° (8:40 - 11:00)');

console.log('\n=== TEST 2: Fusión de Clases Redundantes Preexistentes ===');
// Simular el caso exacto de la captura del usuario (2 filas separadas guardadas en localStorage)
const legacyClasses = [
  {
    date: '2026-09-10',
    time: '7:00 - 7:50',
    dayNumber: '2',
    dayOfWeek: 'Jueves',
    subject: 'Matemáticas',
    grade: '2°',
    topic: 'Lectura, escritura y valor posicional hasta 9.999',
    dba: 'DBA 1',
    achievement: 'Logro 1',
    description: 'Secuencia hora 1'
  },
  {
    date: '2026-09-10',
    time: '7:50 - 8:40',
    dayNumber: '3',
    dayOfWeek: 'Jueves',
    subject: 'Matemáticas',
    grade: '2°',
    topic: 'Descomposición aditiva',
    dba: 'DBA 1',
    achievement: 'Logro 2',
    description: 'Secuencia hora 2'
  },
  {
    date: '2026-09-10',
    time: '8:40 - 9:30',
    dayNumber: '2',
    dayOfWeek: 'Jueves',
    subject: 'Sistemas',
    grade: '4°B',
    topic: 'Word avanzado'
  }
];

const consolidated = StorageService.consolidateClasses(legacyClasses);
console.log('Filas antes de consolidar:', legacyClasses.length, '| Filas después:', consolidated.length);
if (consolidated.length !== 2) {
  console.error('ERROR: Se esperaban 2 filas después de consolidar, se obtuvieron:', consolidated.length);
  process.exit(1);
}

if (consolidated[0].time !== '7:00 - 8:40' || consolidated[0].dayNumber !== '2') {
  console.error('ERROR: La fila fusionada no tiene el tiempo o consecutivo esperado:', consolidated[0]);
  process.exit(1);
}
console.log('✔ Fila 1 fusionada exitosamente: 7:00 - 8:40 | Consecutivo #2 |', consolidated[0].subject, consolidated[0].grade);
console.log('✔ Fila redundante eliminada sin pérdida de estructura.');

console.log('\n=== TEST 3: Generación de Plan para 10/09/2026 (Captura de Usuario) ===');
StorageService.setAcademicStartDate('2026-09-01');

// Crear planeación inicial para el 10/09/2026
const dParts = '2026-09-10'.split('-').map(Number);
const dObj = new Date(dParts[0], dParts[1]-1, dParts[2]);
const dSched = StorageService.consolidateSchedule(schedule[String(dObj.getDay())]);

const thuClasses = [];
dSched.forEach((item, i) => {
  const num = StorageService.getNextClassNumber('2026-09-10', item.subject, item.grade, i, thuClasses);
  const cur = CurriculumService.getAutoCurriculumItem('1°', item.subject, item.grade, num);
  thuClasses.push({
    date: '2026-09-10',
    time: item.time,
    dayNumber: String(num),
    dayOfWeek: 'Jueves',
    subject: item.subject,
    grade: item.grade,
    dba: cur?.dba || '',
    achievement: cur?.achievement || '',
    topic: cur?.topic || '',
    description: cur?.suggestedSequence || ''
  });
});

console.log('Total clases generadas para el Jueves 10/09/2026:', thuClasses.length);
thuClasses.forEach((c, idx) => {
  console.log(`  [Fila ${idx + 1}] ⏰ ${c.time.padEnd(16)} | Clase #${c.dayNumber} | ${c.subject.padEnd(12)} ${c.grade.padEnd(5)} -> ${c.topic.slice(0, 45)}...`);
});

if (thuClasses.length !== 5) {
  console.error('ERROR: Se esperaban 5 clases para el jueves, pero se generaron:', thuClasses.length);
  process.exit(1);
}

if (thuClasses[0].subject !== 'Matemáticas' || thuClasses[0].grade !== '2°' || thuClasses[0].time !== '7:00 - 8:40') {
  console.error('ERROR: La primera fila debe ser Matemáticas 2° de 7:00 a 8:40');
  process.exit(1);
}

console.log('\n🎉 ¡TODOS LOS TESTS DE UNIFICACIÓN DE 2 HORAS PASARON EXITOSAMENTE AL 100%!');
