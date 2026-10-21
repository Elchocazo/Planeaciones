/**
 * Ejecutor de la batería de pruebas de regresión (Node.js, sin dependencias).
 * Uso:  node scripts/run_all_tests.js [filtro]
 * Ejecuta cada scripts/test_*.js en un proceso aislado con límite de tiempo
 * y resume aprobadas / fallidas. Código de salida 1 si alguna falla.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const filter = process.argv[2] || '';
const files = fs.readdirSync(dir)
  .filter(f => /^(test_.*|check_scripts_syntax)\.js$/.test(f) && f.includes(filter))
  .sort();

const results = [];
for (const f of files) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(dir, f)], {
    cwd: path.join(dir, '..'),
    encoding: 'utf8',
    timeout: 60000
  });
  const ms = Date.now() - t0;
  const out = (r.stdout || '') + (r.stderr || '');
  const failedByText = /(^|\s)(FAIL|FAILED|❌)(\s|:|$)/m.test(out) && !/0 fall|0 failed|FAIL(ED)?: 0/i.test(out);
  const ok = r.status === 0 && !r.error && !failedByText;
  results.push({ f, ok, ms, status: r.status, timeout: !!(r.error && r.error.code === 'ETIMEDOUT'), tail: out.trim().split('\n').slice(-4).join('\n') });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${f}  (${ms} ms${r.error ? ', ' + r.error.code : ''})`);
}

const failed = results.filter(r => !r.ok);
console.log(`\nTotal: ${results.length}  Aprobadas: ${results.length - failed.length}  Fallidas: ${failed.length}`);
for (const r of failed) {
  console.log(`\n--- ${r.f} (exit ${r.status}${r.timeout ? ', TIMEOUT' : ''}) ---\n${r.tail}`);
}
process.exit(failed.length ? 1 : 0);
