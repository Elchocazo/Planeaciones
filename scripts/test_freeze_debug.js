const fs = require('fs');
const ImportParser = require('../js/services/import-parser.js');
const NotebookEditor = require('../js/notebook-editor.js');
const { PageConfig, PaginationEngine } = require('../js/core/pagination-engine.js');

const testInputFile = fs.readFileSync('scripts/test_user_robotica_input.js', 'utf8');
const match = testInputFile.match(/const rawInput = `([\s\S]+?)`;/);
const text = match[1];

const parsed = ImportParser.parse(text);
const cls = {
  id: 'test_cls',
  date: '2026-09-28',
  teacherNotebook: parsed.teacherNotebook,
  curriculum: parsed.curriculum,
  didacticSequence: parsed.didacticSequence
};

const html = NotebookEditor._prepareInitialHtml(cls);
console.log('HTML Length:', html.length);

// Now let's test PaginationEngine on this content
// Create mock DOM elements
function createMockEl(tagName, className = '', height = 30) {
  return {
    nodeType: 1,
    tagName: tagName.toUpperCase(),
    className: className,
    classList: {
      contains: (c) => className.split(' ').includes(c),
      add: (c) => { className += ' ' + c; },
      remove: (c) => { className = className.replace(c, '').trim(); }
    },
    style: {},
    children: [],
    childNodes: [],
    offsetHeight: height,
    isConnected: true,
    querySelector: () => null,
    querySelectorAll: () => [],
    getAttribute: (k) => null,
    setAttribute: (k, v) => {},
    removeAttribute: (k) => {},
    insertBefore: function(newNode, refNode) {
      const idx = this.children.indexOf(refNode);
      if (idx !== -1) this.children.splice(idx, 0, newNode);
      else this.children.push(newNode);
      newNode.parentNode = this;
      return newNode;
    },
    appendChild: function(newNode) {
      this.children.push(newNode);
      newNode.parentNode = this;
      return newNode;
    },
    removeChild: function(node) {
      const idx = this.children.indexOf(node);
      if (idx !== -1) this.children.splice(idx, 1);
      return node;
    }
  };
}

console.log('Testing done.');
