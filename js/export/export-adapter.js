/**
 * ADAPTADOR DE EXPORTACIÓN (ExportAdapter)
 * Transforma entidades puras ClassSession al contrato institucional esperado
 * por export.js y docx-generator.js.
 *
 * Principio Sagrado (Req. 55, 57):
 * READ -> TRANSFORM -> EXPORT
 * Operación 100% de SOLO LECTURA: Jamás guarda, renumera ni muta las clases.
 */

class ExportAdapterClass {
  constructor() {}

  /**
   * Adapta una única ClassSession para exportación individual
   */
  fromClass(classSession, profileData = null) {
    if (!classSession) return null;
    return this.fromClasses([classSession], profileData, {
      singleClass: true,
      date: classSession.date,
      period: classSession.period
    });
  }

  /**
   * Adapta un conjunto de ClassSessions (día, semana, materia) para exportación institucional
   */
  fromClasses(classSessions = [], profileData = null, options = {}) {
    if (!Array.isArray(classSessions) || classSessions.length === 0) {
      return null;
    }

    const first = classSessions[0];
    const targetDate = options.date || first.date || new Date().toISOString().slice(0, 10);
    const targetPeriod = options.period || first.period || '1°';

    const adaptedClasses = classSessions.map((cls, idx) => {
      const seqNum = cls.sequenceNumber || parseInt(cls.dayNumber, 10) || (idx + 1);
      const dayOfWeek = cls.dayOfWeek || (typeof ExportService !== 'undefined' ? ExportService.getDayOfWeekName(cls.date || targetDate) : 'Lunes');

      const dbaText = this.cleanBrokenLinebreaks(cls.curriculum?.dba || cls.dba || '');
      const achievementText = this.cleanBrokenLinebreaks(cls.curriculum?.achievement || cls.achievement || cls.performance || '');
      const topicText = this.cleanBrokenLinebreaks(cls.curriculum?.topic || cls.topic || '');

      // Reconstruir la descripción en formato pedagógico institucional respetando el orden oficial
      const descriptionText = this._formatInstitutionalDescription(cls);

      return {
        id: cls.id,
        classId: cls.id,
        date: cls.date || targetDate,
        dayNumber: String(seqNum),
        sequenceNumber: seqNum,
        consecutive: seqNum,
        dayOfWeek: dayOfWeek,
        time: cls.time || (cls.startTime && cls.endTime ? `${cls.startTime} - ${cls.endTime}` : ''),
        subject: cls.subjectName || cls.subject || '',
        grade: cls.gradeName || cls.grade || '',
        group: cls.group || cls.gradeName || cls.grade || '',
        dba: dbaText,
        achievement: achievementText,
        performance: achievementText,
        topic: topicText,
        description: descriptionText,
        observations: this.cleanBrokenLinebreaks(cls.observations || ''),
        notebookContent: this.cleanBrokenLinebreaks(cls.notebookContent || ''),
        attachments: Array.isArray(cls.attachments) ? JSON.parse(JSON.stringify(cls.attachments)) : [],
        version: cls.version || 1
      };
    });

    const teacherName = profileData?.name || (typeof StorageService !== 'undefined' ? StorageService.getProfile()?.name : 'Docente');
    const teacherClean = (teacherName || 'Docente').replace(/\s+/g, '_');

    let customFileName = options.customFileName || null;
    if (!customFileName) {
      if (options.singleClass && adaptedClasses.length === 1) {
        const single = adaptedClasses[0];
        const subClean = (single.subject || 'Clase').replace(/\s+/g, '_');
        const grdClean = (single.grade || '').replace(/\s+/g, '_');
        const numClean = `Clase${single.sequenceNumber}`;
        customFileName = `Preparador_${teacherClean}_${subClean}_${grdClean}_${numClean}_${targetDate}`;
      }
    }

    return {
      id: 'export_' + targetDate + '_' + Date.now(),
      date: targetDate,
      period: targetPeriod,
      classes: adaptedClasses,
      generalNotes: options.generalNotes || '',
      coordinatorReview: options.coordinatorReview || null,
      customFileName: customFileName
    };
  }

  /**
   * Reensambla los bloques estructurados (inicio, desarrollo, cierre, recursos, evaluación, tareas)
   * exactamente al formato textual institucional que el parser de export.js y Word esperan.
   */
  _formatInstitutionalDescription(cls) {
    const seq = cls.didacticSequence || cls.pedagogy || {};
    const parts = [];

    const cleanRecursos = (text) => {
      if (!text || typeof text !== 'string') return '';
      return text.replace(/^(?:(?:RECURSOS\s+)?DID[AÁ]CTICOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|RECURSOS\s*(?:[:\/-]?\s*)?(?:Y\s+)?MATERIALES|(?:Y\s+)?MATERIALES(?:\s+DID[AÁ]CTICOS)?)\s*:?\s*/i, '').trim();
    };

    const cleanTareas = (text) => {
      if (!text || typeof text !== 'string') return '';
      return text.replace(/^(?:(?:TAREAS?(?:\s*[\/:]\s*COMPROMISOS?)?|\bCOMPROMISOS?)\s*[:\/-]?\s*(?:(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)?|[\/:]?\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE)\s*:?\s*/i, '').trim();
    };

    if (seq.inicio && seq.inicio.trim()) {
      parts.push(`FASE DE INICIO:\n${this.cleanBrokenLinebreaks(seq.inicio)}`);
    }
    if (seq.desarrollo && seq.desarrollo.trim()) {
      parts.push(`FASE DE DESARROLLO:\n${this.cleanBrokenLinebreaks(seq.desarrollo)}`);
    }
    if (seq.cierre && seq.cierre.trim()) {
      parts.push(`FASE DE CIERRE:\n${this.cleanBrokenLinebreaks(seq.cierre)}`);
    }
    const recVal = cleanRecursos(seq.recursos);
    if (recVal) {
      parts.push(`Recursos didácticos y materiales:\n${this.cleanBrokenLinebreaks(recVal)}`);
    }
    const evalText = seq.evaluation || seq.evaluacion || '';
    if (evalText && evalText.trim()) {
      parts.push(`Evaluación formativa:\n${this.cleanBrokenLinebreaks(evalText)}`);
    }
    const tarVal = cleanTareas(seq.tareas);
    if (tarVal) {
      parts.push(`Tareas / Compromisos:\n${this.cleanBrokenLinebreaks(tarVal)}`);
    }

    if (parts.length > 0) {
      return parts.join('\n\n');
    }

    let desc = cls.description ? cls.description.trim() : '';
    if (desc) {
      desc = desc
        .replace(/(?:Recursos\s+did[aá]cticos?\s*:\s*(?:Y\s+)?MATERIALES|Recursos\s+did[aá]cticos?\s+y\s+materiales\s*:?)/gi, 'Recursos didácticos y materiales:')
        .replace(/(?:Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*:\s*(?:Y\s+)?ACTIVIDADES\s+EXTRACLASE|Tareas?(?:\s*[\/:]\s*Compromisos?)?\s*y\s+actividades\s+extraclase\s*:?)/gi, 'Tareas / Compromisos:');
      desc = this.cleanBrokenLinebreaks(desc);
    }
    return desc;
  }

  cleanBrokenLinebreaks(text) {
    if (!text || typeof text !== 'string') return '';
    if (typeof window !== 'undefined' && window.ImportParser && typeof window.ImportParser.cleanBrokenLinebreaks === 'function') {
      return window.ImportParser.cleanBrokenLinebreaks(text);
    }
    let clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Reparar "Criterios de" e "Instrumentos de" huérfanos sin la palabra "evaluación"
    clean = clean.replace(/(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nCriterios de evaluación:\n');
    clean = clean.replace(/(?:^|\n)\s*Instrumentos\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi, '\nInstrumentos de evaluación:\n');

    // 2. Unir palabras clave partidas por salto de línea específicamente
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nCriterios de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de)\s*\n+\s*evaluaci[oó]n\b/gi, '\nInstrumentos de evaluación:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*:\s*(?:y\s+)?materiales\b/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos)\s*\n+\s*(?:y\s+)?materiales(?!\s*:)/gi, '\nRecursos didácticos y materiales:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas)\s*\n+\s*(?:y\s+)?compromisos(?!\s*:)/gi, '\nTareas y compromisos:');

    // 3. Normalizar encabezados de subsección para que tengan dos puntos
    clean = clean.replace(/(?:^|\n)\s*(Criterios\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Instrumentos\s+de\s+evaluaci[oó]n)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Recursos\s+did[aá]cticos\s+y\s+materiales)(?!\s*:)/gi, '\n$1:');
    clean = clean.replace(/(?:^|\n)\s*(Tareas\s+(?:y\s+)?compromisos)(?!\s*:)/gi, '\n$1:');

    // 4. Unir saltos de línea artificiales tras comas o punto y coma dentro de una misma idea/viñeta
    clean = clean.replace(/([,;])\s*\n\s*(?![•\-\*\d\n\r#]|\*{1,2}[A-Z])/g, '$1 ');

    // 5. Unir oraciones partidas tras preposiciones, artículos o conjunciones
    clean = clean.replace(/(?:^|[^a-záéíóúñA-ZÁÉÍÓÚÑ])(de|del|la|el|los|las|en|con|para|por|sobre|un|una|unos|unas|su|sus|sin|y|o|que|al|a|como|entre|hacia|desde|hasta|e|ni)\s*\n\s*([a-záéíóúñ0-9«"“\(\[])/g, (match, prep, nextChar) => {
      const prefix = match.slice(0, match.indexOf(prep));
      return prefix + prep + ' ' + nextChar;
    });

    // 6. Unir líneas que terminan en palabra normal y la siguiente empieza con minúscula
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*([a-záéíóúñ])/g, '$1 $2');

    // 7. Unir líneas que terminan en texto y continúan con paréntesis explicativo en la línea siguiente
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ0-9,])\s*\n\s*(\([a-záéíóúñA-ZÁÉÍÓÚÑ0-9])/g, '$1 $2');

    // 8. Unir palabras con guión partidas por salto
    clean = clean.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\s*-\s*\n\s*([a-záéíóúñA-ZÁÉÍÓÚÑ])/g, '$1-$2');

    // 9. Espaciado armónico antes de subsecciones
    clean = clean.replace(/([^\n])\n*((?:Criterios|Instrumentos)\s+de\s+evaluaci[oó]n:)/gi, '$1\n\n$2');

    // 10. Eliminar saltos dobles innecesarios entre un encabezado con dos puntos (:) y su primera viñeta
    clean = clean.replace(/([^\n:]+:)\s*\n{2,}([•]|[-*](?!\*))/g, '$1\n$2');

    // 11. Normalizar saltos triples o excesivos
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  }
}

const ExportAdapter = new ExportAdapterClass();

if (typeof window !== 'undefined') {
  window.ExportAdapter = ExportAdapter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportAdapter;
}
