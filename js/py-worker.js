// Web Worker that owns Pyodide (CPython compiled to WebAssembly), so long-running code never freezes the page.
// Everything is loaded from this repo: the runtime and package wheels from vendor/pyodide/, datasets from data/.
import { loadPyodide } from '../vendor/pyodide/pyodide.mjs';

const DATA_FILES = ['cafe_sales.csv', 'study_hours.csv', 'ab_test.csv', 'tiny_corpus.txt'];

let pyodide = null;
let runCell = null;
let ns = null;

const status = (text) => postMessage({ type: 'status', text });

async function init() {
  status('Starting Python…');
  pyodide = await loadPyodide({ indexURL: new URL('../vendor/pyodide/', import.meta.url).href });
  pyodide.FS.mkdirTree('data');
  await Promise.all(DATA_FILES.map(async (name) => {
    const res = await fetch(new URL(`../data/${name}`, import.meta.url));
    pyodide.FS.writeFile(`data/${name}`, new Uint8Array(await res.arrayBuffer()));
  }));
  const runner = await (await fetch(new URL('./runner.py', import.meta.url))).text();
  const mod = pyodide.globals.get('dict')();
  pyodide.runPython(runner, { globals: mod });
  runCell = mod.get('run_cell');
  ns = pyodide.globals.get('dict')();
}

const ready = init();

async function run(code, check) {
  await ready;
  // Load any vendored packages the code imports (numpy, pandas, sklearn, matplotlib…).
  const imports = pyodide.pyimport('pyodide.code').find_imports(code + '\n' + (check || '')).toJs();
  const known = imports.filter((m) => ['numpy', 'pandas', 'sklearn', 'matplotlib', 'scipy'].includes(m));
  if (known.length) {
    status(`Loading ${known.join(', ')}… (first time only)`);
    await pyodide.loadPackagesFromImports(code + '\n' + (check || ''));
  }
  status('Running…');
  const res = runCell(code, ns, check ?? null);
  const out = res.toJs({ dict_converter: Object.fromEntries });
  res.destroy();
  return out;
}

self.onmessage = async ({ data }) => {
  const { id, type } = data;
  try {
    if (type === 'reset') {
      await ready;
      ns.destroy?.();
      ns = pyodide.globals.get('dict')();
      postMessage({ id, ok: true });
    } else if (type === 'run') {
      postMessage({ id, ok: true, result: await run(data.code, data.check) });
    }
  } catch (err) {
    postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
