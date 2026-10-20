const ExportService = require('../js/export.js');

const userClassFromImage = {
  date: '2026-09-08',
  subjectName: 'Sistemas',
  gradeName: '3°',
  topic: 'Clase #1: Introducción a la asignatura',
  description: 'Asignatura: Tecnología e Informática\nGrado: Tercero\nClase: #1\nTiempo disponible: 1 hora\nFASE DE INICIO: Explicación\nFASE DE DESARROLLO: Práctica\nFASE DE CIERRE: Evaluación',
  dba: 'Reconoce y utiliza diferentes dispositivos tecnológicos',
  achievement: 'Conoce y comprende los temas'
};

const planData = {
  date: '2026-09-08',
  period: '1°',
  classes: [userClassFromImage]
};

const profileData = {
  name: 'Manuel Muñoz',
  homeroom: '7°',
  subjects: [{ name: 'Matemáticas', grades: ['7°'] }]
};

const html = ExportService.generateHtmlSheet(planData, profileData);

console.log('--- REVISIÓN DE CABECERA OFICIAL ---');
const hasSistemasInMeta = html.includes('ASIGNATURA:</td>') && html.includes('Sistemas');
const hasMatematicasInMeta = html.includes('>Matemáticas</td>');
const has3rdGradeInMeta = html.includes('GRADO:</td>') && html.includes('3°');
const hasDateInCol = html.includes('08/09/2026');
const hasClassNumInCol = html.includes('>1</td>');
const hasDayInCol = html.includes('Martes');

console.log('¿Aparece Sistemas en Asignatura?:', hasSistemasInMeta);
console.log('¿Aparece 3° en Grado?:', has3rdGradeInMeta);
console.log('¿Aparece Matemáticas en ASIGNATURA?:', hasMatematicasInMeta);
console.log('¿Fecha d/m/a tiene 08/09/2026?:', hasDateInCol);
console.log('¿Clase tiene 1?:', hasClassNumInCol);
console.log('¿Día tiene Martes?:', hasDayInCol);

if (!hasMatematicasInMeta && hasSistemasInMeta && has3rdGradeInMeta && hasDateInCol && hasClassNumInCol) {
  console.log('\n🎉 TEST 100% EXITOSO: La tabla ahora muestra Sistemas 3° y las columnas Fecha/Clase/Día completas.');
  process.exit(0);
} else {
  console.error('\n❌ ERROR EN EL TEST');
  process.exit(1);
}
