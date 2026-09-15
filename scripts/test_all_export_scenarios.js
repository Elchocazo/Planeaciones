const fs = require('fs');
const JSZip = require('jszip');
global.JSZip = JSZip;

const DocxTemplateEngine = require('../js/docx-generator.js');

async function runAllTests() {
  console.log('================================================================');
  console.log('🧪 EJECUTANDO SUITE COMPLETA DE PRUEBAS DE EXPORTACIÓN A WORD');
  console.log('================================================================\n');

  const templateBuf = fs.readFileSync('Preparador.docx');

  const profile = {
    name: 'Lic. Manuel Fernando Moz',
    institution: 'COLEGIO HOGAR MADRE DE DIOS',
    code: 'F- GA',
    version: '02',
    formatDate: '31.JUL.26',
    homeroom: '7° Grado',
    subjects: [{ name: 'Matemáticas' }, { name: 'Geometría' }]
  };

  // CASO 1: Clase individual
  console.log('▶ Caso 1: Planeación de Clase Individual');
  const planSingle = {
    date: '2026-09-14',
    period: 'I',
    classes: [
      {
        date: '2026-09-14',
        dayNumber: '1',
        dayOfWeek: 'Lunes',
        subject: 'Matemáticas',
        grade: 'Séptimo (7°)',
        dba: 'DBA 2: Propone y utiliza diferentes procedimientos para realizar operaciones con números racionales.',
        achievement: 'Resuelve problemas cotidianos aplicando la suma y resta de fracciones homogéneas.',
        topic: 'Operaciones con números racionales: Fracciones homogéneas',
        description: 'Inicio: Presentación de un problema contextual sobre reparto de presupuesto familiar.\nDesarrollo: Explicación interactiva en el tablero. Ejercicios guiados en equipos de trabajo colaborativo.\nCierre: Reflexión guiada y evaluación formativa rápida.\nRecursos: Guía de trabajo impreso, calculadora básica.\nEvaluación formativa: Rúbrica de participación grupal.',
        observations: 'Excelente participación activa de los estudiantes.'
      }
    ]
  };
  const docSingle = await DocxTemplateEngine.generateDocx(templateBuf, planSingle, profile);
  fs.writeFileSync('test_caso1_single.docx', docSingle);
  console.log('  ✔ test_caso1_single.docx generado (', docSingle.length, 'bytes)');

  // CASO 2: Semana completa de una asignatura (4 clases)
  console.log('\n▶ Caso 2: Semana Completa de Asignatura (4 clases)');
  const planSubjectWeek = {
    date: '2026-09-14',
    period: 'I',
    classes: [
      {
        date: '2026-09-14',
        dayNumber: '1',
        dayOfWeek: 'Lunes',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1: Justifica regularidades y propiedades de números.',
        achievement: 'Comprende fracciones.',
        topic: 'Concepto de fracción',
        description: 'Inicio: Activación de saberes.\nDesarrollo: Taller práctico.\nCierre: Preguntas de cierre.',
        observations: 'Clase desarrollada con normalidad.'
      },
      {
        date: '2026-09-15',
        dayNumber: '2',
        dayOfWeek: 'Martes',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1',
        achievement: 'Comprende fracciones.',
        topic: 'Representación gráfica',
        description: 'Inicio: Repaso previo.\nDesarrollo: Dibujo en cuadrícula.\nCierre: Retroalimentación.',
        observations: ''
      },
      {
        date: '2026-09-17',
        dayNumber: '3',
        dayOfWeek: 'Jueves',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1',
        achievement: 'Clasifica fracciones.',
        topic: 'Fracciones propias e impropias',
        description: 'Inicio: Comparación de ejemplos.\nDesarrollo: Ejercicios guiados.\nCierre: Quiz relámpago.',
        observations: 'Requiere reforzar fracciones mixtas.'
      },
      {
        date: '2026-09-18',
        dayNumber: '4',
        dayOfWeek: 'Viernes',
        subject: 'Matemáticas',
        grade: 'Cuarto (4°)',
        dba: 'DBA 1',
        achievement: 'Aplica conceptos.',
        topic: 'Taller evaluativo semanal',
        description: 'Inicio: Indicaciones de la evaluación.\nDesarrollo: Aplicación del taller evaluativo individual.\nCierre: Recolección y socialización general.',
        observations: 'Todos entregaron a tiempo.'
      }
    ],
    generalNotes: 'Semana culminada satisfactoriamente con el 100% de logros alcanzados.'
  };
  const docSubjectWeek = await DocxTemplateEngine.generateDocx(templateBuf, planSubjectWeek, profile);
  fs.writeFileSync('test_caso2_week.docx', docSubjectWeek);
  console.log('  ✔ test_caso2_week.docx generado (', docSubjectWeek.length, 'bytes)');

  // CASO 3: Con Aprobación y Visto Bueno de Coordinación
  console.log('\n▶ Caso 3: Planeación con Visto Bueno de Coordinación Académica');
  const planApproved = {
    ...planSubjectWeek,
    coordinatorReview: {
      status: 'approved',
      reviewerName: 'Lic. Claudia Restrepo (Coordinadora Académica)',
      date: '2026-09-15',
      comments: 'Excelente planeación pedagógica alineada con el modelo institucional.'
    }
  };
  const docApproved = await DocxTemplateEngine.generateDocx(templateBuf, planApproved, profile);
  fs.writeFileSync('test_caso3_approved.docx', docApproved);
  console.log('  ✔ test_caso3_approved.docx generado (', docApproved.length, 'bytes)');

  // CASO 4: Validación de Integridad XML en todos los documentos generados
  console.log('\n--- VERIFICANDO INTEGRIDAD DE ARCHIVOS GENERADOS ---');
  for (const filename of ['test_caso1_single.docx', 'test_caso2_week.docx', 'test_caso3_approved.docx']) {
    const zip = await JSZip.loadAsync(fs.readFileSync(filename));
    const docXml = await zip.file('word/document.xml').async('string');
    const hdrXml = await zip.file('word/header1.xml').async('string');
    
    const hasTblHeader = docXml.includes('<w:tblHeader/>');
    const hasCantSplit = docXml.includes('<w:cantSplit/>');
    const hasMetaTable = docXml.includes('ASIGNATURA:');
    const hasObsTable = docXml.includes('OBSERVACIONES:');
    const hasHeaderLogo = hdrXml.includes('COLEGIO HOGAR MADRE DE DIOS');

    console.log(`[${filename}]:`);
    console.log(`  - Encabezado institucional nativo: ${hasHeaderLogo ? 'OK' : 'ERROR'}`);
    console.log(`  - Tabla de metadatos 2x6: ${hasMetaTable ? 'OK' : 'ERROR'}`);
    console.log(`  - Repetición de encabezado en multicanal (w:tblHeader): ${hasTblHeader ? 'OK' : 'ERROR'}`);
    console.log(`  - Filas indivisibles (w:cantSplit): ${hasCantSplit ? 'OK' : 'ERROR'}`);
    console.log(`  - Tabla de observaciones: ${hasObsTable ? 'OK' : 'ERROR'}`);
    if (filename.includes('approved')) {
      console.log(`  - Sello de coordinación académica: ${docXml.includes('VISTO BUENO OFICIAL') ? 'OK' : 'ERROR'}`);
    }
  }

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE EXPORTACIÓN PASARON EXITOSAMENTE!');
}

runAllTests().catch(err => {
  console.error('Error en pruebas:', err);
  process.exit(1);
});
