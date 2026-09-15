// Verificación completa del Horario Semanal Oficial
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

console.log('=== VERIFICACIÓN DE HORARIO SEMANAL OFICIAL COMPLETO ===\n');

const schedule = DEFAULT_WEEKLY_SCHEDULE;

const expectedSchedule = {
  "1": [ // Lunes (4 sesiones / 6 horas pedagógicas)
    { time: '7:00 - 7:50', subject: 'Dirección de grupo', grade: '7°' },
    { time: '7:50 - 8:40', subject: 'Sistemas', grade: '7°' },
    { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '2°' }, // 2 horas (con descanso 9:30-10:10 omitido)
    { time: '11:50 - 1:20', subject: 'Robótica', grade: '9°' }      // 2 horas (libre 11:00-11:50 omitido)
  ],
  "2": [ // Martes (5 sesiones / 7 horas pedagógicas)
    { time: '7:00 - 7:50', subject: 'Sistemas', grade: '3°' },
    { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '7°' },   // 2 horas
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '8°' },
    { time: '11:00 - 11:50', subject: 'Lógica', grade: '6°' },     // Lógica Matemática 6°
    { time: '12:35 - 2:00', subject: 'Robótica', grade: '10°' }     // 2 horas (libre 11:50-12:35 omitido)
  ],
  "3": [ // Miércoles (3 sesiones / 5 horas pedagógicas)
    { time: '7:50 - 9:30', subject: 'Matemáticas', grade: '3°' },   // 2 horas (libre 7:00-7:50 omitido)
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '5°' },
    { time: '11:00 - 12:35', subject: 'Matemáticas', grade: '7°' }  // 2 horas (libre 12:35-2:00 omitido)
  ],
  "4": [ // Jueves (5 sesiones / 7 horas pedagógicas)
    { time: '7:00 - 8:40', subject: 'Matemáticas', grade: '2°' },   // 2 horas
    { time: '8:40 - 9:30', subject: 'Sistemas', grade: '4°B' },
    { time: '10:10 - 11:00', subject: 'Sistemas', grade: '1°' },
    { time: '11:00 - 11:50', subject: 'Sistemas', grade: '6°' },
    { time: '12:35 - 2:00', subject: 'Robótica', grade: '11°' }     // 2 horas (libre 11:50-12:35 omitido)
  ],
  "5": [ // Viernes (5 sesiones / 6 horas pedagógicas)
    { time: '7:50 - 8:40', subject: 'Sistemas', grade: '2°' },      // (libre 7:00-7:50 omitido)
    { time: '8:40 - 11:00', subject: 'Matemáticas', grade: '3°' },  // 2 horas (con descanso 9:30-10:10 omitido)
    { time: '11:00 - 11:50', subject: 'Sistemas', grade: '4°A' },
    { time: '11:50 - 12:35', subject: 'Matemáticas', grade: '7°' },
    { time: '12:35 - 1:20', subject: 'Dirección de grupo', grade: '7°' }
  ]
};

const dayNames = { "1": "Lunes", "2": "Martes", "3": "Miércoles", "4": "Jueves", "5": "Viernes" };

let totalClasses = 0;

for (let d = 1; d <= 5; d++) {
  const dStr = String(d);
  const actual = schedule[dStr];
  const expected = expectedSchedule[dStr];
  const name = dayNames[dStr];

  console.log(`📅 ${name.toUpperCase()} (Día ${d}):`);
  if (!actual || actual.length !== expected.length) {
    console.error(`❌ Error en cantidad de clases para ${name}: esperado ${expected.length}, encontrado ${actual ? actual.length : 0}`);
    process.exit(1);
  }

  for (let i = 0; i < expected.length; i++) {
    const a = actual[i];
    const e = expected[i];
    if (a.time !== e.time || a.subject !== e.subject || a.grade !== e.grade) {
      console.error(`❌ Discrepancia en ${name} clase ${i+1}:`);
      console.error(`   Esperado: ${e.time} | ${e.subject} ${e.grade}`);
      console.error(`   Obtenido: ${a.time} | ${a.subject} ${a.grade}`);
      process.exit(1);
    }
    console.log(`   ✔ Clase ${i+1}: ⏰ ${a.time.padEnd(14)} | ${a.subject.padEnd(20)} ${a.grade}`);
    totalClasses++;
  }
  console.log('');
}

console.log(`✨ Total bloques de planeación a la semana: ${totalClasses}`);
console.log('🎉 ¡TODOS LOS DÍAS COINCIDEN AL 100% CON LA DISTRIBUCIÓN DEL HORARIO DOCENTE!');
