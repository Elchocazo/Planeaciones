const fs = require('fs');
const JSZip = require('jszip');
global.JSZip = JSZip;

// Cargar DocxTemplateEngine
const DocxTemplateEngine = require('../js/docx-generator.js');

async function testGeneration() {
  console.log('--- Probando generación nativa de Word con nueva plantilla oficial ---');
  
  const templateBuf = fs.readFileSync('Preparador.docx');
  
  const mockPlan = {
    date: '2026-09-14',
    period: 'I',
    classes: [
      {
        date: '2026-09-14',
        dayNumber: '1',
        dayOfWeek: 'Lunes',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1: Justifica regularidades y propiedades de los números, sus relaciones y operaciones.',
        achievement: 'Reconoce el significado y utilidad de las fracciones en situaciones de reparto y medición.',
        topic: 'Fracciones: Concepto y términos',
        description: 'Inicio: Dinámica con figuras geométricas divididas en partes iguales para activar saberes previos.\nDesarrollo: Explicación de numerador y denominador mediante ejemplos cotidianos. Actividad en el cuaderno resolviendo 5 ejercicios prácticos.\nCierre: Preguntas reflexivas y socialización de dudas en plenaria.\nRecursos: Cartulina, marcadores, cuaderno de apuntes.\nEvaluación formativa: Observación directa de la participación y revisión del ejercicio en clase.',
        observations: 'El grupo mostró gran interés y asimiló rápidamente el concepto de partes iguales.'
      },
      {
        date: '2026-09-16',
        dayNumber: '2',
        dayOfWeek: 'Miércoles',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1: Justifica regularidades y propiedades de los números.',
        achievement: 'Identifica y representa fracciones propias e impropias.',
        topic: 'Fracciones propias e impropias',
        description: 'Inicio: Repaso relámpago con tarjetas visuales de la clase anterior.\nDesarrollo: Diferenciación entre fracciones menores a la unidad y mayores a la unidad. Taller en parejas.\nCierre: Quiz rápido de 3 preguntas de selección múltiple.\nTarea: Ejercicios página 45 del libro guía.',
        observations: ''
      }
    ],
    generalNotes: 'Semana de refuerzo de operaciones y conceptos fraccionarios.',
    coordinatorReview: {
      status: 'approved',
      reviewerName: 'Lic. Claudia Restrepo (Coordinación)',
      date: '2026-09-15',
      comments: 'Excelente coherencia entre DBA, desempeños y secuencias didácticas didácticas. Se aprueba la planeación.'
    }
  };

  const mockProfile = {
    name: 'Manuel Moz',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    homeroom: 'Cuarto (4°)',
    subjects: [{ name: 'Matemáticas' }]
  };

  const resultBuf = await DocxTemplateEngine.generateDocx(templateBuf, mockPlan, mockProfile);
  fs.writeFileSync('Preparador_Generado_Test.docx', resultBuf);
  console.log('¡Documento generado con éxito! Guardado en Preparador_Generado_Test.docx, tamaño:', resultBuf.length);

  // Inspeccionar el documento generado
  const zip = await JSZip.loadAsync(resultBuf);
  const docXml = await zip.file('word/document.xml').async('string');
  const headerXml = await zip.file('word/header1.xml').async('string');

  console.log('\n--- VERIFICACIÓN DE CONTENIDO ---');
  console.log('¿Tiene Asignatura Matemáticas?', docXml.includes('Matemáticas'));
  console.log('¿Tiene Grado Cuarto (4°)?', docXml.includes('Cuarto (4°)'));
  console.log('¿Tiene Docente Manuel Moz?', docXml.includes('Manuel Moz'));
  console.log('¿Tiene Periodo I?', docXml.includes('I'));
  console.log('¿Tiene Inicio / Desarrollo en negrita?', docXml.includes('<w:b/>') && docXml.includes('Inicio:'));
  console.log('¿Tiene Observaciones?', docXml.includes('El grupo mostró gran interés'));
  console.log('¿Tiene Sello de Coordinación?', docXml.includes('REVISIÓN &amp; VISTO BUENO OFICIAL: APROBADO'));
  console.log('¿Tiene Header Institucional en header1.xml?', headerXml.includes('COLEGIO HOGAR MADRE DE DIOS') && headerXml.includes('CODIGO: F- GA'));
}

testGeneration().catch(console.error);
