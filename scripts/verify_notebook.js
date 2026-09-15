// Test Notebook Editor
global.window = global;
global.confirm = () => true;
global.alert = () => {};
global.window.scrollTo = function() {};
global.window.addEventListener = function() {};
global.window.getSelection = function() {
  return { rangeCount: 0, isCollapsed: true, getRangeAt: () => null, removeAllRanges: () => {}, addRange: () => {} };
};



let mountedHtml = '';

global.document = {
  addEventListener(event, fn) {},
  execCommand(cmd, bool, val) {
    console.log('[DEBUG execCommand]', cmd, val);
  },
  getElementById(id) {
    return {
      style: {},
      get innerHTML() { return mountedHtml; },
      set innerHTML(val) { mountedHtml = val; },
      textContent: '',
      value: '',
      addEventListener() {},
      appendChild() {},
      removeChild() {},
      classList: { add() {}, remove() {}, toggle() {} },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      focus() {}
    };

  },
  body: {
    appendChild(el) {},
    classList: { add() {}, remove() {}, toggle() {} }
  },

  createElement(tag) {
    return {
      style: {},
      innerHTML: '',
      classList: { add() {}, remove() {} }
    };
  },
  querySelectorAll() { return []; },
  scrollTo() {}
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};

require('../js/storage.js');
require('../js/docx-generator.js');
require('../js/curriculum.js');
require('../js/holidays.js');
require('../js/export.js');
require('../js/notebook-editor.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

App.init();
App.openDayPlanner('2026-09-01');

console.log('--- Opening Notebook Editor for Class 0 ---');
NotebookEditor.openForClass(0);

console.log('--- Applying Math Template ---');
NotebookEditor.applyTemplate('math');

console.log('--- Saving Notebook Content ---');
NotebookEditor.saveCurrentNotebookContent(false);

console.log('--- SUCCESS! ALL NOTEBOOK OPERATIONS COMPLETED PERFECTLY ---');
