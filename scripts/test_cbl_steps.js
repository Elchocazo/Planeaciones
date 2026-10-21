const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000);
const rawHtml = '<p>Texto</p><img src="data:image/png;base64,' + base64 + '"><p>Texto</p>';

// Blindaje de imagen conforme a Regla 5 de GEMINI.md
const imagePlaceholders = [];
const shieldedHtml = rawHtml.replace(/<img\b[^>]*>/gi, (m) => {
  const ph = `___IMG_SHIELD_${imagePlaceholders.length}___`;
  imagePlaceholders.push(m);
  return ph;
});

const regexes = [
  { name: '1_crit', fn: s => s.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n') },
  { name: '1_inst', fn: s => s.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n') },
  { name: '2_crit', fn: s => s.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:') },
  { name: '2_inst', fn: s => s.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:') },
  { name: '2_rec',  fn: s => s.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:') },
  { name: '2_rec2', fn: s => s.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:') },
  { name: '2_tar',  fn: s => s.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:') },
  { name: '2_tal',  fn: s => s.replace(/(?:^|\n)\s*(TALLER\s*[\/:\-])\s*\n+\s*(ACTIVIDAD(?:ES)?|EJERCICIO(?:S)?|GU[IÍ]A)\b/gi, '\n$1 $2') },
  { name: '3_crit', fn: s => s.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:') },
  { name: '3_inst', fn: s => s.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:') },
  { name: '3_rec',  fn: s => s.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:') },
  { name: '3_tar',  fn: s => s.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:') },
  { name: '4_coma', fn: s => s.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ') },
  { name: '5_prep', fn: s => s.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, '$1 $2') },
  { name: '6_cont', fn: s => s.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2') },
  { name: '7_paren', fn: s => s.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2') },
  { name: '8_guion', fn: s => s.replace(/(?<!\b(?:en|de|con|el|la|un|una))\b([a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s*-\s*\n\s*([a-záéíóúñ]+)\b/g, '$1-$2') },
  { name: '9_list',  fn: s => s.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2') },
  { name: '10_head', fn: s => s.replace(/([^\n:]{1,120}:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2') },
  { name: '11_trip', fn: s => s.replace(/\n{3,}/g, '\n\n') }
];

regexes.forEach(({ name, fn }) => {
  console.time(name);
  fn(shieldedHtml);
  console.timeEnd(name);
});
console.log('All tests in cleanBrokenLinebreaks finished!');
