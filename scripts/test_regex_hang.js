const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000);
console.log('Test string length:', base64.length);

const regexes = [
  { name: 'r0', fn: s => s.replace(/([a-záéíóúñ0-9\)\].])(Eje\s+tem[aá]tico|Tema|Fase\s+de|Fase\s+inicial|Fase\s+central|Fase\s+final|Inicio|Desarrollo|Cierre|Recursos|Materiales|Tareas?|Compromisos?|Evaluaci[oó]n\s+formativa|Observaciones|Asignatura|Materia|Grado|Curso|Clase|Tiempo|Duraci[oó]n|Fecha|DBA|Logros?|Desempe[ñn]os?|Pregunta|Cuaderno|Informaci[oó]n|Secuencia|Din[aá]mica|Reglas?|Normas?|T[ií]tulo)\b/g, '$1\n$2') },
  { name: 'r1', fn: s => s.replace(/([A-ZÁÉÍÓÚÑ]{2,})([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g, '$1\n$2') },
  { name: 'r2', fn: s => s.replace(/([A-ZÁÉÍÓÚÑ]{3,})(INFORMACI[OÓ]N|SECUENCIA|CUADERNO|FASE|RECURSOS|MATERIALES|TAREAS|EVALUACI[OÓ]N|OBSERVACIONES|ASIGNATURA|GRADO|CLASE|TIEMPO|TEMA|DBA|LOGRO|DESEMPE[ÑN]O|DIN[AÁ]MICA|REGLAS|TALLER|T[IÍ]TULO)/g, '$1\n\n$2') },
  { name: 'r3_heading', fn: s => {
      const majorHeadings = 'INFORMACI[OÓ]N\\s+GENERAL|DATOS\\s+GENERALES|SECUENCIA\\s+DID[AÁ]CTICA\\s+ESTRUCTURADA|SECUENCIA\\s+DID[AÁ]CTICA|CUADERNO\\s+DEL\\s+DOCENTE|PLANEACI[OÓ]N\\s+DE\\s+CLASE|FASE\\s+DE\\s+INICIO|FASE\\s+DE\\s+DESARROLLO|FASE\\s+DE\\s+CIERRE|RECURSOS\\s+DID[AÁ]CTICOS|EVALUACI[OÓ]N|CRITERIOS\\s+DE\\s+EVALUACI[OÓ]N|TALLER';
      const headingRegex = new RegExp('([^\\n*])\\s*(\\*{0,2})(' + majorHeadings + ')(\\*{0,2})', 'gi');
      return s.replace(headingRegex, (match, p1, starsBefore, p2, starsAfter, offset, fullStr) => {
        const prefixBefore = fullStr.substring(Math.max(0, offset - 80), offset + p1.length);
        return p1 + '\n\n' + p2;
      });
    }
  },
  { name: 'r4_field', fn: s => {
      const inlineFields = 'Asignatura|Materia|Área|Grado|Curso|Clase\\s*(?:#|N[°º])?|Tiempo|Duración|Fecha|Tema|DBA|Logro|Desempeño|Título';
      const unglueFieldRegex = new RegExp('([a-záéíóúñ0-9A-ZÁÉÍÓÚÑ\\)\\]])(\\*{0,2})(' + inlineFields + ')(\\*{0,2})\\s*:', 'gi');
      return s.replace(unglueFieldRegex, '$1\n$3:');
    }
  },
  { name: 'r4_field2', fn: s => {
      const inlineFields = 'Asignatura|Materia|Área|Grado|Curso|Clase\\s*(?:#|N[°º])?|Tiempo|Duración|Fecha|Tema|DBA|Logro|Desempeño|Título';
      const fieldRegex = new RegExp('(?:^|[^\\w(*áéíóúñÁÉÍÓÚÑ])(\\*{0,2})(' + inlineFields + ')(\\*{0,2})\\s*:', 'gi');
      return s.replace(fieldRegex, '\n$2:');
    }
  },
  { name: 'r7b', fn: s => s.replace(/(?:^|\n)(##\s+)?([\p{Lu}]{2,}(?:\s+[\p{Lu}0-9\/\-]+){1,8})\s+([\p{Lu}][\p{Ll}])/gu, '$1$2 $3') },
  { name: 'r7f', fn: s => {
      const sentenceStarters = '(?:Restar|Sumar|Multiplicar|Dividir|Para agilizar|Para resolver|En la siguiente|Resolver|Consiste en|Es la|Son los|Se define|Permite)';
      return s.replace(new RegExp('(?:^|\\n)•\\s*([A-ZÁÉÍÓÚÑ][^\\n•]{3,75}?)\\s+(' + sentenceStarters + '\\b)', 'gu'), '\n\n## $1\n\n$2');
    }
  }
];

regexes.forEach(({ name, fn }) => {
  console.time(name);
  fn(base64);
  console.timeEnd(name);
});
console.log('All regexes finished successfully!');
