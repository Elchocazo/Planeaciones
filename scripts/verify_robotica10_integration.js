const fs = require('fs');
const path = require('path');

// Entorno simulado de navegador
const mockLocalStorage = {};
global.localStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; }
};

global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

// Cargar scripts en orden
require('../js/storage.js');
require('../js/curriculum.js');

console.log('=== TEST 1: Verificación de la Malla Oficial de Robótica 10° ===');
const items = CurriculumService.getItems('1°', 'Robótica', '10°');
console.log('Total sesiones registradas en Robótica 10°:', items.length);
if (items.length < 5) {
  console.error('ERROR: Se esperaban al menos 5 sesiones para Robótica 10°, se encontraron:', items.length);
  process.exit(1);
}

console.log('✔ Sesión 1:', items[0].topic);
console.log('✔ Sesión 2:', items[1].topic);
console.log('✔ Sesión última:', items[items.length - 1].topic);
console.log('✔ Malla curricular de Robótica 10° validada.');

console.log('\n=== TEST 2: Verificación de CurriculumService.mallaDecimoRobotica ===');
if (!CurriculumService.mallaDecimoRobotica) {
  console.error('ERROR: No existe CurriculumService.mallaDecimoRobotica');
  process.exit(1);
}
console.log('✔ Malla oficial decimo existe.');
console.log('✔ Título pregunta problémica:', CurriculumService.mallaDecimoRobotica.problemQuestion);
console.log('✔ Total ejes temáticos:', CurriculumService.mallaDecimoRobotica.thematicAxes.length);

console.log('\n=== TEST 3: Verificación de Consecutivo y Auto-Poblado para los Martes (Robótica 10°) ===');
const scheduleTuesday = DEFAULT_WEEKLY_SCHEDULE['2'];
console.log('Total horas programadas en el martes oficial:', scheduleTuesday.length);

const robClassesTuesday = scheduleTuesday.filter(c => c.subject === 'Robótica' && c.grade === '10°');
console.log('Bloques de Robótica 10° los martes:', robClassesTuesday.length);
if (robClassesTuesday.length !== 1 || robClassesTuesday[0].time !== '12:35 - 2:00') {
  console.error('ERROR: Los martes deben tener exactamente 1 bloque unificado (2 horas) de Robótica 10° de 12:35 a 2:00');
  process.exit(1);
}
console.log('✔ Horario de Robótica 10° los martes:', robClassesTuesday[0].time);

// Simular auto-curriculum para sesión 1 y 2
const curHora1 = CurriculumService.getAutoCurriculumItem('1°', 'Robótica', '10°', 1);
const curHora2 = CurriculumService.getAutoCurriculumItem('1°', 'Robótica', '10°', 2);
console.log('\n✔ Martes Clase 1:', curHora1.topic);
console.log('  Secuencia (primeras 80 letras):', curHora1.suggestedSequence.slice(0, 80) + '...');
console.log('\n✔ Siguiente Martes Clase 2:', curHora2.topic);
console.log('  Secuencia (primeras 80 letras):', curHora2.suggestedSequence.slice(0, 80) + '...');

console.log('\n=== TEST 4: Verificación de Jueves (Robótica 11°) ===');
const scheduleThursday = DEFAULT_WEEKLY_SCHEDULE['4'];
const rob10Thursday = scheduleThursday.filter(c => c.subject === 'Robótica' && c.grade === '10°');
const rob11Thursday = scheduleThursday.filter(c => c.subject === 'Robótica' && c.grade === '11°');
console.log('Robótica 10° en jueves:', rob10Thursday.length, '(debe ser 0, Robótica 10° es exclusivo de los martes)');
console.log('Robótica 11° en jueves:', rob11Thursday.length, '(debe ser 1 bloque unificado de 2 horas)');
if (rob10Thursday.length !== 0 || rob11Thursday.length !== 1 || rob11Thursday[0].time !== '12:35 - 2:00') {
  console.error('ERROR: El horario del jueves no tiene la distribución adecuada.');
  process.exit(1);
}
console.log('✔ Martes y Jueves calibrados a la perfección con el horario oficial.');

console.log('\n🎉 ¡TODOS LOS TESTS DE VERIFICACIÓN PASARON EXITOSAMENTE!');
