// Runs every lesson in Node with the vendored Pyodide, the same way the browser does:
// all code cells must run without errors, every exercise starter must FAIL its check, and every solution must PASS.
//   node tools/test_lessons.mjs [lessonId ...]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadPyodide } from '../vendor/pyodide/pyodide.mjs';
import { LESSONS } from '../js/lessons.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const only = process.argv.slice(2).map(Number);

const py = await loadPyodide({ indexURL: path.join(root, 'vendor/pyodide') + path.sep });
await py.loadPackage(['numpy', 'pandas', 'scikit-learn', 'matplotlib', 'scipy'], { messageCallback: () => {} });
py.FS.mkdirTree('data');
for (const f of ['cafe_sales.csv', 'study_hours.csv', 'ab_test.csv', 'tiny_corpus.txt']) {
  py.FS.writeFile(`data/${f}`, readFileSync(path.join(root, 'data', f)));
}
const mod = py.globals.get('dict')();
py.runPython(readFileSync(path.join(root, 'js/runner.py'), 'utf8'), { globals: mod });
const runCell = mod.get('run_cell');
const run = (code, ns, check) => {
  const r = runCell(code, ns, check ?? null);
  const o = r.toJs({ dict_converter: Object.fromEntries });
  r.destroy();
  return o;
};

let failures = 0;
const fail = (msg) => { failures++; console.log('  ✗ ' + msg); };

for (const lesson of LESSONS) {
  if (only.length && !only.includes(lesson.id)) continue;
  const t0 = Date.now();
  console.log(`Lesson ${lesson.id}: ${lesson.title}`);
  let ns = py.globals.get('dict')();
  if (lesson.setup) {
    const r = run(lesson.setup, ns);
    if (r.error) fail(`lesson setup: ${r.error}`);
  }
  lesson.body.filter((s) => s.code).forEach((s, i) => {
    const r = run(s.code, ns);
    if (r.error) fail(`cell ${i + 1}: ${r.error}\n${s.code}`);
    else if (process.env.VERBOSE) console.log(`  cell ${i + 1}:`, (r.stdout + (r.text ?? '')).slice(0, 300), r.images.length ? `[${r.images.length} img]` : '');
  });
  const ex = lesson.exercise;
  for (const [which, code, want] of [['starter', ex.starter, false], ['solution', ex.solution, true]]) {
    ns = py.globals.get('dict')();
    if (lesson.setup) run(lesson.setup, ns);
    if (ex.setup) run(ex.setup, ns);
    const r = run(code, ns, ex.check);
    if (want && r.error) fail(`${which} raised: ${r.error}`);
    else if (r.passed !== want && !(r.error && !want)) fail(`${which} check ${want ? 'failed' : 'passed but should fail'}: ${r.feedback}`);
    else console.log(`  ${which}: ${want ? 'passes' : 'fails'} as expected${want ? '' : ` ("${r.feedback ?? r.error?.trim().split('\n').pop()}")`}`);
  }
  console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log(failures ? `\n${failures} FAILURE(S)` : '\nAll lessons OK');
process.exit(failures ? 1 : 0);
