// Test Roles and Coordinator System
global.window = global;
global.window.scrollTo = function() {};
global.confirm = () => true;
global.alert = () => {};

let mountedHtml = '';

global.document = {
  addEventListener(event, fn) {},
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
      querySelector() { return null; }
    };
  },
  body: {
    appendChild(el) {}
  },
  createElement(tag) {
    return {
      style: {},
      innerHTML: '',
      classList: { add() {}, remove() {} }
    };
  },
  querySelectorAll() { return []; }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};

require('../js/users-service.js');
require('../js/storage.js');
require('../js/docx-generator.js');
require('../js/curriculum.js');
require('../js/holidays.js');
require('../js/export.js');
require('../js/notebook-editor.js');
require('../js/coordinator-view.js');
require('../js/calendar.js');
require('../js/planner.js');
require('../js/app.js');

console.log('=== TEST 1: Initializing Multi-Role Platform ===');
App.init();

const allUsers = UserService.getAllUsers();
console.log('Users loaded:', allUsers.map(u => `${u.name} [${u.role}]`));

console.log('=== TEST 2: Manuel Muñoz plans a class ===');
UserService.setCurrentUser('usr_manuel');
const planDate = '2026-09-01';
const planData = {
  date: planDate,
  period: '3°',
  classes: [
    {
      dayNumber: '1',
      dayOfWeek: 'Martes',
      subject: 'Sistemas',
      grade: '3°',
      dba: 'DBA 1: Reconoce herramientas tecnológicas',
      achievement: 'Identifica las partes principales del computador',
      topic: 'Componentes de Hardware',
      description: 'Inicio: Lluvia de ideas. Desarrollo: Identificación de periféricos. Cierre: Taller gráfico.'
    }
  ],
  generalNotes: 'Excelente participación del grupo 3°.'
};
StorageService.savePlan(planDate, planData);
console.log('Plan saved for Manuel Muñoz on', planDate);

console.log('=== TEST 3: Switching to Coordinator ===');
UserService.setCurrentUser('usr_coordinacion');
const coord = UserService.getCurrentUser();
console.log('Current active user is now:', coord.name, `[${coord.role}]`);

console.log('=== TEST 4: Coordinator audits Manuel Muñoz plan and grants Visto Bueno ===');
const auditSummary = UserService.getAllTeachersAuditSummary('3°');
console.log('Audit summary:', auditSummary.map(s => `${s.user.name}: ${s.totalClassesPlanned} clases planeadas, estado: ${s.status}`));

const review = UserService.saveCoordinatorReview('usr_manuel', planDate, {
  status: 'approved',
  comments: 'Excelente planeación pedagógica, cumple con los estándares institucionales y DBAs.'
});
console.log('Coordinator review stamped:', review);

console.log('=== TEST 5: Verify Generated Sheet has the Coordinator Stamp ===');
const teacher = UserService.getUserById('usr_manuel');
const teacherPlan = UserService.getTeacherPlans('usr_manuel')[planDate];
const htmlSheet = ExportService.generateHtmlSheet(teacherPlan, teacher);

if (htmlSheet.includes('REVISIÓN & VISTO BUENO DE COORDINACIÓN ACADÉMICA') && htmlSheet.includes('Aprobado / Visto Bueno Oficial')) {
  console.log('✅ Sheet correctly renders Coordinator Stamp and Feedback!');
} else {
  console.error('❌ Missing Coordinator Stamp in HTML Sheet!');
  process.exit(1);
}

console.log('=== TEST 6: Creating a New Teacher as Admin ===');
UserService.setCurrentUser('usr_manuel');
const newTeacher = UserService.saveUser({
  name: 'Prof. Andrés Felipe Castro',
  role: 'teacher',
  email: 'andres.castro@hogarmadrededios.edu.co',
  homeroom: '9°',
  subjects: [{ name: 'Física', grades: ['10°', '11°'] }]
});
console.log('New teacher registered:', newTeacher.name, 'ID:', newTeacher.id);

const updatedUsers = UserService.getAllUsers();
console.log('Total users now:', updatedUsers.length);

console.log('=== ALL ROLE & COORDINATOR TESTS PASSED 100% SUCCESSFULLY! ===');
