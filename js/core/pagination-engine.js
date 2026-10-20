/**
 * MOTOR CENTRALIZADO DE PAGINACIÓN Y GEOMETRÍA DE PÁGINA (PaginationEngine)
 * ÚNICA FUENTE DE VERDAD para dimensiones de página, márgenes y saltos de página.
 *
 * Principios Arquitectónicos (Fidelidad Absoluta a Microsoft Word y Google Docs):
 * 1. Estándar físico: Carta (Letter 215.9 x 279.4 mm) y A4 (210 x 297 mm) @ 96 DPI CSS.
 * 2. Modelo matemático estricto:
 *    usableWidth = pageWidth - marginLeft - marginRight
 *    usableHeight = pageHeight - marginTop - marginBottom
 * 3. Prohibición de Bloques Monolíticos Indivisibles:
 *    - Las listas (<ul> y <ol>) se dividen elemento por elemento (<li>). Los ítems que quepan
 *      en la página actual permanecen en ella; únicamente los restantes fluyen a la siguiente hoja.
 *    - Las tablas (<table>) se dividen fila por fila (<tr>).
 * 4. Control Estricto de Títulos Huérfanos (keep-with-next):
 *    - Encabezados (h1-h6), títulos de fase y párrafos destacados jamás quedan al pie de una
 *      página si su contenido subsiguiente no tiene espacio para iniciar (al menos 1 ítem de lista
 *      o 2 líneas de texto). Si no cabe el inicio del contenido, el título se traslada con él.
 * 5. Recombinación Transparente y No Destructiva:
 *    - Antes de cada cálculo y al guardar (getCleanHtml), los elementos divididos se recombinan
 *      a su estado semántico único original sin alterar el cursor ni los datos del docente.
 * 6. Cero parches visuales: Los saltos de página ocupan espacio real en el flujo DOM (espaciador
 *    matemático = espacio restante + margen inferior + margen superior) de modo que el contenido
 *    de la página siguiente inicia EXACTAMENTE en el margen superior de la nueva hoja.
 */

const PageConfig = {
  // Configuración activa
  paperSize: 'letter', // 'letter' | 'a4'

  // Dimensiones físicas estándar en milímetros (ISO y ANSI)
  SIZES: {
    letter: { widthMm: 215.9, heightMm: 279.4, name: 'Carta (Letter)' },
    a4:     { widthMm: 210.0, heightMm: 297.0, name: 'A4' }
  },

  // Márgenes estándar en centímetros (1.27 cm = Margen Estrecho oficial)
  margins: {
    topCm: 1.27,
    bottomCm: 1.27,
    leftCm: 1.27,
    rightCm: 1.27
  },

  // Escala de pantalla estándar W3C CSS: 96 DPI (1 in = 25.4 mm = 96 px)
  DPI: 96,
  MM_PER_INCH: 25.4,

  mmToPx(mm) {
    return (mm / this.MM_PER_INCH) * this.DPI;
  },

  cmToPx(cm) {
    return (cm * 10 / this.MM_PER_INCH) * this.DPI;
  },

  getPageWidthPx() {
    const size = this.SIZES[this.paperSize] || this.SIZES.letter;
    return Math.round(this.mmToPx(size.widthMm)); // 816 px para Carta
  },

  getPageHeightPx() {
    const size = this.SIZES[this.paperSize] || this.SIZES.letter;
    return Math.round(this.mmToPx(size.heightMm)); // 1056 px para Carta
  },

  getMarginTopPx() {
    return Math.round(this.cmToPx(this.margins.topCm)); // 48 px para 1.27 cm
  },

  getMarginBottomPx() {
    return Math.round(this.cmToPx(this.margins.bottomCm)); // 48 px para 1.27 cm
  },

  getMarginLeftPx() {
    return Math.round(this.cmToPx(this.margins.leftCm)); // 48 px para 1.27 cm
  },

  getMarginRightPx() {
    return Math.round(this.cmToPx(this.margins.rightCm)); // 48 px para 1.27 cm
  },

  getUsableWidthPx() {
    return this.getPageWidthPx() - this.getMarginLeftPx() - this.getMarginRightPx(); // 720 px para Carta @ 1.27cm
  },

  getUsableHeightPx() {
    return this.getPageHeightPx() - this.getMarginTopPx() - this.getMarginBottomPx(); // 960 px para Carta @ 1.27cm
  },

  setMargins(topCm, bottomCm, leftCm, rightCm) {
    if (topCm !== undefined && !isNaN(topCm)) this.margins.topCm = parseFloat(topCm);
    if (bottomCm !== undefined && !isNaN(bottomCm)) this.margins.bottomCm = parseFloat(bottomCm);
    if (leftCm !== undefined && !isNaN(leftCm)) this.margins.leftCm = parseFloat(leftCm);
    if (rightCm !== undefined && !isNaN(rightCm)) this.margins.rightCm = parseFloat(rightCm);
  },

  setPaperSize(sizeName) {
    if (this.SIZES[sizeName]) {
      this.paperSize = sizeName;
    }
  }
};

const PaginationEngine = {
  config: PageConfig,
  _isPaginating: false,
  _debounceTimer: null,
  _resizeObserver: null,

  /**
   * Ejecuta la paginación completa sobre el contenedor del cuaderno
   * @param {HTMLElement} paperContainer - Contenedor principal (.notebook-paper-container)
   * @param {HTMLElement} editor - Editor contenteditable (#notebook-single-editor)
   * @returns {Object} Resultado con número total de páginas y posiciones de saltos
   */
  paginate(paperContainer, editor) {
    if (!paperContainer || !editor || !editor.isConnected) {
      return { totalPages: 1, breaks: [] };
    }

    if (this._isPaginating) return { totalPages: 1, breaks: [] };
    this._isPaginating = true;

    try {
      // 1. Guardar la selección actual del cursor para restaurarla intacta
      const savedSelection = this._saveSelection(editor);

      // 2. Aplicar geometría y márgenes físicos al contenedor principal
      const marginTopPx = this.config.getMarginTopPx();
      const marginBottomPx = this.config.getMarginBottomPx();
      const marginLeftPx = this.config.getMarginLeftPx();
      const marginRightPx = this.config.getMarginRightPx();
      const pageWidthPx = this.config.getPageWidthPx();
      const usableHeightPx = this.config.getUsableHeightPx();

      paperContainer.style.maxWidth = pageWidthPx + 'px';
      paperContainer.style.width = '100%';
      paperContainer.style.boxSizing = 'border-box';
      paperContainer.style.paddingTop = marginTopPx + 'px';
      paperContainer.style.paddingBottom = marginBottomPx + 'px';
      paperContainer.style.paddingLeft = marginLeftPx + 'px';
      paperContainer.style.paddingRight = marginRightPx + 'px';

      // 3. Recombinar splits previos y remover espaciadores temporales para medir el flujo natural
      this._removeExistingSpacers(paperContainer);

      // 4. Medir encabezado institucional en Página 1
      const headerCard = paperContainer.querySelector('.notebook-page-header-card');
      let headerHeight = 0;
      if (headerCard && headerCard.offsetHeight > 0) {
        const headerStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(headerCard) : {};
        headerHeight = Math.ceil(headerCard.offsetHeight + (parseFloat(headerStyle.marginBottom) || 0));
      }

      // Altura disponible en Página 1 para contenido
      const page1ContentAvailable = Math.max(150, usableHeightPx - headerHeight);

      // 5. Medir bloques de contenido dentro del editor
      const blocks = Array.from(editor.children || []).filter(el => {
        return el.nodeType === 1 && (!el.classList || !el.classList.contains('nb-page-break-spacer'));
      });

      let currentPage = 1;
      let currentHeightOnPage = 0;
      let maxPageHeight = page1ContentAvailable;
      const breaks = [];

      let i = 0;
      while (i < blocks.length) {
        const block = blocks[i];

        // Verificar si es un salto manual explícito (Ctrl+Enter)
        if (block.classList && block.classList.contains('notebook-page-break')) {
          breaks.push({
            targetBlock: block,
            pageNum: currentPage + 1,
            remainingSpace: Math.max(0, maxPageHeight - currentHeightOnPage),
            isManual: true
          });
          currentPage++;
          currentHeightOnPage = 0;
          maxPageHeight = usableHeightPx;
          i++;
          continue;
        }

        // Medir dimensiones del bloque
        const blockStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(block) : { marginTop: '0px', marginBottom: '0px' };
        const mt = parseFloat(blockStyle.marginTop) || 0;
        const mb = parseFloat(blockStyle.marginBottom) || 0;
        const blockHeight = Math.ceil((block.offsetHeight || 0) + mt + mb);

        // Si el bloque es cero altura (vacío), continuar
        if (blockHeight === 0 && !block.querySelector?.('img, table, hr')) {
          i++;
          continue;
        }

        // Comprobar reglas de cohesión pedagógica:
        // Encabezados o títulos de paso no deben quedar huérfanos al final de página (keep-with-next)
        const isHeading = this._isHeadingElement(block);
        let extraLookahead = 0;
        if (isHeading && i + 1 < blocks.length) {
          const nextBlock = blocks[i + 1];
          extraLookahead = this._getHeadingLookahead(nextBlock);
        }

        // Si es encabezado y NO cabe junto con el inicio del contenido siguiente,
        // trasladar el encabezado a la siguiente página para evitar que quede huérfano.
        if (isHeading && currentHeightOnPage > 0 && (currentHeightOnPage + blockHeight + extraLookahead > maxPageHeight)) {
          const remainingSpace = Math.max(0, maxPageHeight - currentHeightOnPage);
          breaks.push({
            targetBlock: block,
            pageNum: currentPage + 1,
            remainingSpace: remainingSpace,
            isManual: false
          });
          currentPage++;
          currentHeightOnPage = blockHeight;
          maxPageHeight = usableHeightPx;
          i++;
          continue;
        }

        // ¿Cabe el bloque en la página actual?
        if (currentHeightOnPage + blockHeight <= maxPageHeight) {
          currentHeightOnPage += blockHeight;
          i++;
          continue;
        }

        // Si NO cabe completamente en la página actual:
        // Comprobar si es un contenedor divisible granularmente (Lista o Tabla)
        const isList = block.tagName === 'UL' || block.tagName === 'OL';
        const isTable = block.tagName === 'TABLE';

        if (isList) {
          const items = Array.from(block.children || []).filter(el => el.tagName === 'LI');
          if (items.length > 1) {
            const availableSpace = maxPageHeight - currentHeightOnPage - mt;
            let accumulatedH = 0;
            let fitCount = 0;

            for (let k = 0; k < items.length; k++) {
              const it = items[k];
              const itStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(it) : {};
              const itH = Math.ceil((it.offsetHeight || 30) + (parseFloat(itStyle.marginTop) || 0) + (parseFloat(itStyle.marginBottom) || 0));
              if (accumulatedH + itH <= availableSpace) {
                accumulatedH += itH;
                fitCount++;
              } else {
                break;
              }
            }

            if (fitCount > 0 && fitCount < items.length) {
              const continuationList = this._splitList(block, fitCount);
              if (continuationList) {
                const remainingSpace = Math.max(0, maxPageHeight - (currentHeightOnPage + mt + accumulatedH));
                breaks.push({
                  targetBlock: continuationList,
                  pageNum: currentPage + 1,
                  remainingSpace: remainingSpace,
                  isManual: false
                });
                currentPage++;
                currentHeightOnPage = 0;
                maxPageHeight = usableHeightPx;
                blocks.splice(i + 1, 0, continuationList);
                i++;
                continue;
              }
            }
          }
        } else if (isTable) {
          const tbody = block.querySelector ? (block.querySelector('tbody') || block) : block;
          const rows = tbody.querySelectorAll ? Array.from(tbody.querySelectorAll('tr')) : (tbody.children || []);
          if (rows.length > 2) {
            const availableSpace = maxPageHeight - currentHeightOnPage - mt;
            let accumulatedH = 0;
            let fitRowCount = 0;

            for (let r = 0; r < rows.length; r++) {
              const row = rows[r];
              const rStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(row) : {};
              const rH = Math.ceil((row.offsetHeight || 30) + (parseFloat(rStyle.marginTop) || 0) + (parseFloat(rStyle.marginBottom) || 0));
              if (accumulatedH + rH <= availableSpace) {
                accumulatedH += rH;
                fitRowCount++;
              } else {
                break;
              }
            }

            if (fitRowCount > 1 && fitRowCount < rows.length) {
              const continuationTable = this._splitTable(block, fitRowCount);
              if (continuationTable) {
                const remainingSpace = Math.max(0, maxPageHeight - (currentHeightOnPage + mt + accumulatedH));
                breaks.push({
                  targetBlock: continuationTable,
                  pageNum: currentPage + 1,
                  remainingSpace: remainingSpace,
                  isManual: false
                });
                currentPage++;
                currentHeightOnPage = 0;
                maxPageHeight = usableHeightPx;
                blocks.splice(i + 1, 0, continuationTable);
                i++;
                continue;
              }
            }
          }
        }

        // Si no se puede dividir o no cabe ningún ítem:
        if (currentHeightOnPage > 0) {
          const remainingSpace = Math.max(0, maxPageHeight - currentHeightOnPage);
          breaks.push({
            targetBlock: block,
            pageNum: currentPage + 1,
            remainingSpace: remainingSpace,
            isManual: false
          });
          currentPage++;
          currentHeightOnPage = blockHeight;
          maxPageHeight = usableHeightPx;
          i++;
        } else {
          // El bloque es más alto que una página entera vacía:
          currentHeightOnPage = blockHeight % usableHeightPx;
          const extraPages = Math.floor(blockHeight / usableHeightPx);
          currentPage += extraPages;
          maxPageHeight = usableHeightPx;
          i++;
        }
      }

      // 6. Evaluar la sección final de Cierre: Observaciones Pedagógicas y Footer
      const obsCard = paperContainer.querySelector('.notebook-observations-card');
      const docFooter = paperContainer.querySelector('.notebook-document-footer');

      let closingHeight = 0;
      if (obsCard && obsCard.offsetHeight > 0) {
        const obsStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(obsCard) : {};
        closingHeight += Math.ceil(obsCard.offsetHeight + (parseFloat(obsStyle.marginTop) || 0) + (parseFloat(obsStyle.marginBottom) || 0));
      }
      if (docFooter && docFooter.offsetHeight > 0) {
        const footerStyle = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(docFooter) : {};
        closingHeight += Math.ceil(docFooter.offsetHeight + (parseFloat(footerStyle.marginTop) || 0));
      }

      if (closingHeight > 0) {
        if (currentHeightOnPage + closingHeight > maxPageHeight && currentHeightOnPage > 0) {
          const target = obsCard || docFooter;
          breaks.push({
            targetBlock: target,
            pageNum: currentPage + 1,
            remainingSpace: Math.max(0, maxPageHeight - currentHeightOnPage),
            isClosingBlock: true
          });
          currentPage++;
        }
      }

      // 7. Insertar los espaciadores matemáticos reales en el DOM
      this._applySpacers(breaks);

      // 8. Restaurar la selección del cursor si el usuario estaba escribiendo
      this._restoreSelection(editor, savedSelection);

      // 9. Actualizar indicadores de total de páginas
      this._updatePageIndicators(paperContainer, currentPage);

      return { totalPages: currentPage, breaks };
    } finally {
      this._isPaginating = false;
    }
  },

  /**
   * Determina si un elemento funciona como encabezado o título de sección
   */
  _isHeadingElement(block) {
    if (!block || !block.tagName) return false;
    const tag = block.tagName.toUpperCase();
    if (/^H[1-6]$/.test(tag)) return true;
    if (block.classList && (
      block.classList.contains('preparador-phase-title') ||
      block.classList.contains('notebook-section-title') ||
      block.classList.contains('notebook-heading')
    )) return true;

    // Párrafos cortos destacados como títulos de sección
    const text = (block.textContent || '').trim();
    if (text.length > 0 && text.length <= 100) {
      if (/^Paso\s*\d+/i.test(text)) return true;
      if (/^(Definici[oó]n|Elementos|Objetivo|Prop[oó]sito|Actividad|Desarrollo|Evaluaci[oó]n|Cierre|Introducci[oó]n|Momento|Fase|Etapa|Taller|Instrucciones|Materiales)\b/i.test(text)) return true;
      if (block.querySelector && (block.querySelector('strong') || block.querySelector('b') || block.querySelector('u'))) {
        const strongEl = block.querySelector('strong, b, u');
        const strongText = (strongEl?.textContent || '').trim();
        if (strongText.length >= text.length * 0.7 && !text.endsWith('.')) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Calcula el espacio mínimo subsiguiente requerido por un encabezado (keep-with-next)
   */
  _getHeadingLookahead(nextBlock) {
    if (!nextBlock) return 0;
    const tag = (nextBlock.tagName || '').toUpperCase();
    if (this._isHeadingElement(nextBlock)) {
      return 60;
    }
    if (tag === 'UL' || tag === 'OL') {
      const firstLi = nextBlock.querySelector ? nextBlock.querySelector('li') : (nextBlock.children?.[0]);
      if (firstLi) {
        const style = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(firstLi) : {};
        return Math.max(35, Math.ceil((firstLi.offsetHeight || 30) + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0)));
      }
      return 40;
    }
    if (tag === 'TABLE') {
      return 55;
    }
    return Math.min(nextBlock.offsetHeight || 45, 60);
  },

  /**
   * Divide una lista (UL u OL) trasladando los elementos restantes a una lista de continuación
   */
  _splitList(listBlock, fitCount) {
    if (!listBlock) return null;
    const items = Array.from(listBlock.children || []).filter(el => el.tagName === 'LI');
    if (fitCount <= 0 || fitCount >= items.length) return null;

    let continuationList = null;
    if (typeof document !== 'undefined' && document.createElement) {
      continuationList = document.createElement(listBlock.tagName);
      if (listBlock.className) continuationList.className = listBlock.className;
      if (listBlock.style && listBlock.style.cssText) continuationList.style.cssText = listBlock.style.cssText;
      if (listBlock.tagName === 'OL') {
        const start = parseInt(listBlock.getAttribute('start') || '1', 10) || 1;
        continuationList.setAttribute('start', String(start + fitCount));
      }
    } else {
      // Mock para pruebas en entorno Node.js
      continuationList = {
        nodeType: 1,
        tagName: listBlock.tagName,
        className: listBlock.className || '',
        children: [],
        parentNode: listBlock.parentNode,
        setAttribute: function(k, v) { this[k] = v; },
        getAttribute: function(k) { return this[k]; },
        removeAttribute: function(k) { delete this[k]; },
        classList: { contains: () => false },
        offsetHeight: 0
      };
    }

    const splitId = 'split_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    if (listBlock.setAttribute) {
      listBlock.setAttribute('data-split-source', splitId);
    }
    if (continuationList.setAttribute) {
      continuationList.setAttribute('data-split-continuation', splitId);
    }

    const itemsToMove = items.slice(fitCount);
    itemsToMove.forEach(item => {
      if (continuationList.appendChild) {
        continuationList.appendChild(item);
      } else if (continuationList.children) {
        continuationList.children.push(item);
        item.parentNode = continuationList;
      }
    });

    if (listBlock.parentNode && listBlock.parentNode.insertBefore) {
      listBlock.parentNode.insertBefore(continuationList, listBlock.nextSibling);
    }

    return continuationList;
  },

  /**
   * Divide una tabla (TABLE) trasladando las filas restantes a una tabla de continuación
   */
  _splitTable(tableBlock, fitRowCount) {
    if (!tableBlock) return null;
    const tbody = tableBlock.querySelector ? (tableBlock.querySelector('tbody') || tableBlock) : tableBlock;
    const rows = tbody.querySelectorAll ? Array.from(tbody.querySelectorAll('tr')) : (tbody.children || []);
    if (fitRowCount <= 0 || fitRowCount >= rows.length) return null;

    let continuationTable = null;
    if (typeof document !== 'undefined' && document.createElement) {
      continuationTable = document.createElement('table');
      if (tableBlock.className) continuationTable.className = tableBlock.className;
      if (tableBlock.style && tableBlock.style.cssText) continuationTable.style.cssText = tableBlock.style.cssText;

      const originalThead = tableBlock.querySelector('thead');
      if (originalThead) {
        continuationTable.appendChild(originalThead.cloneNode(true));
      }

      const contTbody = document.createElement('tbody');
      continuationTable.appendChild(contTbody);

      const splitId = 'split_tbl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      tableBlock.setAttribute('data-split-source', splitId);
      continuationTable.setAttribute('data-split-continuation', splitId);

      const rowsToMove = rows.slice(fitRowCount);
      rowsToMove.forEach(row => contTbody.appendChild(row));

      if (tableBlock.parentNode && tableBlock.parentNode.insertBefore) {
        tableBlock.parentNode.insertBefore(continuationTable, tableBlock.nextSibling);
      }
    }
    return continuationTable;
  },

  /**
   * Recombina de manera transparente elementos que fueron divididos previamente para paginar
   */
  _recombineSplitElements(container) {
    if (!container || !container.querySelectorAll) return;
    const continuations = Array.from(container.querySelectorAll('[data-split-continuation]'));
    continuations.reverse().forEach(contEl => {
      const splitId = contEl.getAttribute('data-split-continuation');
      const sourceEl = container.querySelector(`[data-split-source="${splitId}"]`);
      if (sourceEl) {
        if (sourceEl.tagName === 'TABLE' && contEl.tagName === 'TABLE') {
          const sourceTbody = sourceEl.querySelector('tbody') || sourceEl;
          const contRows = Array.from(contEl.querySelectorAll('tbody tr, tr'));
          contRows.forEach(tr => {
            if (!tr.closest('thead') && !tr.querySelector('th')) {
              sourceTbody.appendChild(tr);
            }
          });
        } else {
          while (contEl.firstChild) {
            sourceEl.appendChild(contEl.firstChild);
          }
        }
        sourceEl.removeAttribute('data-split-source');
      }
      if (contEl.parentNode && contEl.parentNode.removeChild) {
        contEl.parentNode.removeChild(contEl);
      } else if (contEl.remove) {
        contEl.remove();
      }
    });
  },

  /**
   * Inserta los espaciadores matemáticos que empujan el contenido exactamente
   * a la siguiente hoja sin tocar el texto interior
   */
  _applySpacers(breaks) {
    const marginBottomPx = this.config.getMarginBottomPx();
    const marginTopPx = this.config.getMarginTopPx();
    const marginCm = this.config.margins.topCm;

    breaks.forEach(({ targetBlock, pageNum, remainingSpace, isManual, isClosingBlock }) => {
      const spacerHeight = Math.max(30, Math.round(remainingSpace + marginBottomPx + marginTopPx));

      let spacer = null;
      if (typeof document !== 'undefined' && document.createElement) {
        spacer = document.createElement('div');
        spacer.className = 'nb-page-break-spacer' + (isClosingBlock ? ' nb-closing-spacer' : '');
        spacer.contentEditable = 'false';
        spacer.setAttribute('data-page-num', pageNum);
        spacer.style.height = spacerHeight + 'px';

        spacer.innerHTML = `
          <div class="nb-page-break-inner" style="top:${Math.round(remainingSpace + marginBottomPx)}px;">
            <div class="nb-page-break-line"></div>
            <span class="nb-page-break-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Hoja ${pageNum} &bull; Margen ${marginCm} cm
            </span>
          </div>
        `;
      } else {
        spacer = {
          className: 'nb-page-break-spacer',
          style: { height: spacerHeight + 'px' },
          pageNum,
          spacerHeight
        };
      }

      if (targetBlock && targetBlock.parentNode && targetBlock.parentNode.insertBefore) {
        targetBlock.parentNode.insertBefore(spacer, targetBlock);
      }
    });
  },

  /**
   * Elimina espaciadores existentes y recombina elementos para realizar mediciones limpias
   */
  _removeExistingSpacers(paperContainer) {
    if (!paperContainer) return;
    this._recombineSplitElements(paperContainer);
    if (paperContainer.querySelectorAll) {
      paperContainer.querySelectorAll('.nb-page-break-spacer, .nb-auto-page-break').forEach(el => {
        if (el && el.remove) el.remove();
        else if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
      });
    }
  },

  /**
   * Guarda la posición del cursor de manera segura relativa al editor
   */
  _saveSelection(editor) {
    if (typeof window === 'undefined' || !window.getSelection) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);
    if (!editor.contains || !editor.contains(range.startContainer)) return null;

    return {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };
  },

  /**
   * Restaura la selección del cursor
   */
  _restoreSelection(editor, saved) {
    if (!saved || typeof window === 'undefined' || !window.getSelection) return;
    try {
      if (!editor.contains || !editor.contains(saved.startContainer)) return;
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(saved.startContainer, saved.startOffset);
      range.setEnd(saved.endContainer, saved.endOffset);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  },

  /**
   * Actualiza el badge o indicador de total de hojas en la interfaz
   */
  _updatePageIndicators(paperContainer, totalPages) {
    if (typeof document !== 'undefined' && document.getElementById) {
      const badge = document.getElementById('notebook-total-pages-badge');
      if (badge) {
        badge.textContent = `${totalPages} ${totalPages === 1 ? 'Hoja' : 'Hojas'}`;
      }
    }
  },

  /**
   * Programa una re-paginación con debounce y requestAnimationFrame para no saturar durante la escritura
   */
  schedulePagination(paperContainer, editor, delay = 750) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      const run = () => this.paginate(paperContainer, editor);
      if (typeof window !== 'undefined') {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => window.requestAnimationFrame(run), { timeout: 400 });
        } else if (window.requestAnimationFrame) {
          window.requestAnimationFrame(run);
        } else {
          run();
        }
      } else {
        run();
      }
    }, delay);
  },

  /**
   * Limpia el HTML del editor para guardado o almacenamiento, recombinando splits y retirando espaciadores efímeros
   */
  getCleanHtml(editor) {
    if (!editor) return '';
    const clone = editor.cloneNode(true);
    this._recombineSplitElements(clone);
    if (clone.querySelectorAll) {
      clone.querySelectorAll('.nb-page-break-spacer, .nb-auto-page-break').forEach(el => el.remove());
      clone.querySelectorAll('.nb-page-break-target').forEach(el => {
        el.classList.remove('nb-page-break-target');
        if (el.dataset && el.dataset.origMarginTop !== undefined) {
          el.style.marginTop = el.dataset.origMarginTop;
          delete el.dataset.origMarginTop;
        } else {
          el.style.marginTop = '';
        }
        if (!el.getAttribute('style') || el.getAttribute('style').trim() === '') {
          el.removeAttribute('style');
        }
      });
      // Limpiar cajas matemáticas vacías o que solo contengan signos/comas
      clone.querySelectorAll('.notebook-math-block').forEach(el => {
        const text = (el.textContent || '').trim();
        if (!text || !/[a-zA-Z0-9\+\-\*\/=]/.test(text) || /^[,;.:\-_*•]+$/.test(text)) {
          el.remove();
        }
      });
      // Limpiar párrafos e ítems de lista vacíos o que solo tengan asteriscos/viñetas
      clone.querySelectorAll('p, li').forEach(el => {
        const text = (el.textContent || '').trim();
        if (!text || /^[\s\*•\-\–—,;.:_]+$/.test(text)) {
          el.remove();
        }
      });
      // Limpiar listas que hayan quedado vacías
      clone.querySelectorAll('ul, ol').forEach(el => {
        if (!el.children.length) el.remove();
      });
    }
    const html = clone.innerHTML;
    if (typeof window !== 'undefined' && window.ImportParser && typeof window.ImportParser.cleanDocumentArtifacts === 'function') {
      return window.ImportParser.cleanDocumentArtifacts(html);
    }
    return html
      .replace(/(?:\\[tT]ext|\/[tT]ext|\x09ext|\\textbf|\\textit|\\mathrm|\\mathbf|\\textnormal|\\mbox)\s*\{([^}]*)\}/gi, '$1')
      .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
      .replace(/\\times\b/g, '×').replace(/\\div\b/g, '÷').replace(/\\cdot\b/g, '·').replace(/\\pm\b/g, '±')
      .replace(/\\(?:le|leq)\b/g, '≤').replace(/\\(?:ge|geq)\b/g, '≥').replace(/\\neq\b/g, '≠').replace(/\\approx\b/g, '≈')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^\$\n\r]+?)\$/g, '$1')
      .replace(/\$/g, '')
      .replace(/\{([^{}\n\r]*)\}/g, '$1')
      .replace(/[{}]/g, '')
      .replace(/""\*{1,3}/g, '"').replace(/''\*{1,3}/g, "'")
      .replace(/->\s*\*{0,2}/g, '-> ')
      .replace(/(?:^|\n)\s*(?:•\s*)?[\*•\-\–—_]{1,3}\s*(?=\n|$)/g, '\n')
      .replace(/(?<=[^\*\s])\*{1,3}(?=[^\*]|$)/g, '')
      .replace(/\*{1,3}/g, '')
      .replace(/\s*\*{1,2}\)\s*(?=\n|•|$)/g, '');
  }
};

if (typeof window !== 'undefined') {
  window.PageConfig = PageConfig;
  window.PaginationEngine = PaginationEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PageConfig, PaginationEngine };
}
