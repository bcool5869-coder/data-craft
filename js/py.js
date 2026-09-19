// Page-side handle to the Python worker. Cells run one at a time, in order.
let worker = null;
let nextId = 0;
const pending = new Map();
let onStatus = () => {};
let started = false;

function spawn() {
  worker = new Worker(new URL('./py-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'status') { onStatus(data.text); return; }
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.ok) p.resolve(data.result); else p.reject(new Error(data.error));
  };
  worker.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || 'Python worker crashed'));
    pending.clear();
  };
}

function call(msg) {
  if (!worker) spawn();
  started = true;
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, ...msg });
  });
}

export const setStatusListener = (fn) => { onStatus = fn; };
export const isStarted = () => started;

// Serialise runs so cells never interleave.
let queue = Promise.resolve();
export function run(code, check) {
  const job = queue.then(() => call({ type: 'run', code, check }));
  queue = job.catch(() => {});
  return job;
}

export function reset() {
  if (!worker) return Promise.resolve();
  const job = queue.then(() => call({ type: 'reset' }));
  queue = job.catch(() => {});
  return job;
}

// Stops a runaway cell (e.g. an infinite loop) by killing the worker. All variables are lost.
export function stop() {
  if (!worker) return;
  worker.terminate();
  worker = null;
  for (const p of pending.values()) p.reject(new Error('Stopped. Python was restarted, so run the cells above again.'));
  pending.clear();
  queue = Promise.resolve();
}
