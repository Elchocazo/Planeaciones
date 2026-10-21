// Benchmark: coste de ClassRepository.saveClass / StorageService.savePlan con el banco semilla real.
// Uso: node scripts/bench_save_with_seed.js
const memoryStore = {};
let lsWrites = 0, lsBytes = 0, idbWrites = 0;
global.localStorage = {
  getItem: k => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k, v) => { lsWrites++; lsBytes += String(v).length; memoryStore[k] = String(v); },
  removeItem: k => { delete memoryStore[k]; },
  clear: () => Object.keys(memoryStore).forEach(k => delete memoryStore[k]),
  key: i => Object.keys(memoryStore)[i] || null,
  get length() { return Object.keys(memoryStore).length; }
};
// IDB simulado con coste de clonado estructurado (como el navegador)
global.IDBStorage = {
  get: async () => null,
  set: async (k, v) => { idbWrites++; structuredClone(v); return true; },
  saveSnapshot: async () => true,
  requestPersistence: () => true
};
const { INITIAL_CLASSES_DATA } = require('../js/data/initial-classes-data.js');
global.window = { INITIAL_CLASSES_DATA, addEventListener() {}, dispatchEvent() {} };
global.INITIAL_CLASSES_DATA = INITIAL_CLASSES_DATA;
const ClassRepository = require('../js/repositories/class-repository.js');
global.ClassRepository = ClassRepository;
const TID = 'usr_bench';

(async () => {
  let t = process.hrtime.bigint();
  await ClassRepository.init(TID);
  const initMs = Number(process.hrtime.bigint() - t) / 1e6;
  const all = ClassRepository.getAllClasses(TID);
  console.log(`Clases en cache tras init: ${all.length}  (init ${initMs.toFixed(0)} ms)`);
  const sample = all.slice(0, 20);
  lsWrites = 0; lsBytes = 0; idbWrites = 0;
  t = process.hrtime.bigint();
  for (const c of sample) {
    c.observations = (c.observations || '') + ' ';
    ClassRepository.saveClass(c, TID);
  }
  const ms = Number(process.hrtime.bigint() - t) / 1e6;
  await new Promise(r => setTimeout(r, 50));
  console.log(`20 x saveClass: ${ms.toFixed(1)} ms total, ${(ms / 20).toFixed(1)} ms/guardado síncrono`);
  console.log(`localStorage.setItem: ${lsWrites} escrituras, ${(lsBytes / 1048576).toFixed(1)} MB serializados`);
  console.log(`IDB set (clonados): ${idbWrites}`);
  process.exit(0);
})();
