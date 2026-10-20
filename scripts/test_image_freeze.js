const { PageConfig, PaginationEngine } = require('../js/core/pagination-engine.js');

function createMockDOM(blocksData) {
  const insertedSpacers = [];
  const editorChildren = [];

  blocksData.forEach((b, idx) => {
    const el = {
      nodeType: 1,
      tagName: b.tag.toUpperCase(),
      className: b.className || '',
      classList: {
        contains: (c) => (b.className || '').split(' ').includes(c)
      },
      offsetHeight: b.height || 40,
      textContent: b.text || '',
      parentNode: {
        insertBefore: (newEl, ref) => {
          insertedSpacers.push({ spacer: newEl, before: ref });
        }
      },
      getAttribute: (k) => null,
      querySelector: (sel) => null,
      querySelectorAll: (sel) => []
    };
    editorChildren.push(el);
  });

  const editor = {
    id: 'notebook-single-editor',
    isConnected: true,
    children: editorChildren,
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    cloneNode: () => ({ querySelectorAll: () => [], innerHTML: '' })
  };

  const headerCard = { offsetHeight: 120 };
  const obsCard = { offsetHeight: 100, parentNode: { insertBefore: () => {} } };
  const docFooter = { offsetHeight: 40, parentNode: { insertBefore: () => {} } };

  const paperContainer = {
    style: {},
    querySelector: (sel) => {
      if (sel === '.notebook-page-header-card') return headerCard;
      if (sel === '.notebook-observations-card') return obsCard;
      if (sel === '.notebook-document-footer') return docFooter;
      return null;
    },
    querySelectorAll: (sel) => []
  };

  return { paperContainer, editor, insertedSpacers };
}

console.log('Testing image with height 2000px...');
const { paperContainer, editor, insertedSpacers } = createMockDOM([
  { tag: 'H2', height: 40, text: 'Propósito' },
  { tag: 'P', height: 300, text: 'Circuitos 1 a 4' },
  { tag: 'P', height: 200, text: 'Conexión con próxima clase' },
  { tag: 'DIV', height: 2000, text: 'INFOGRAPHIC IMAGE' }
]);

console.time('paginate');
const res = PaginationEngine.paginate(paperContainer, editor);
console.timeEnd('paginate');

console.log('Result totalPages:', res.totalPages);
console.log('Breaks count:', res.breaks.length);
console.log('Breaks details:', res.breaks.map(b => ({ pageNum: b.pageNum, remainingSpace: b.remainingSpace, isManual: b.isManual })));
