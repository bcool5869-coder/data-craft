import { LESSONS } from './lessons.js';
import { RESOURCES, STAGES, byId } from './resources.js';
import * as ai from './ai.js';
import * as py from './py.js';
import * as tutor from './tutor.js';

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');
const SITE = 'Data Craft';

// ---------- storage (per-browser convenience only) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('dsai:' + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('dsai:' + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

const quizDone = (l) => {
  const ans = store.get(`quiz:${l.id}`, []);
  return l.quiz.every((q, i) => ans[i] === q.answer);
};
const lessonDone = (l) => store.get(`ex:${l.id}`, false) && quizDone(l);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c != null && c !== false) node.append(c);
  return node;
}
const html = (s) => { const d = el('div', { class: 'prose' }); d.innerHTML = s; return d; }; // trusted, authored content

// ---------- AI model panel ----------
const dialog = $('#model-dialog');
const aiBtn = $('#ai-status');
let aiLoading = false;

function renderAiStatus() {
  const m = ai.loadedModel();
  aiBtn.textContent = aiLoading ? 'Tutor: loading…' : m ? 'Tutor: ready' : 'AI tutor';
  aiBtn.classList.toggle('ready', !!m);
}

function openModelDialog() {
  const body = $('#model-options', dialog);
  body.replaceChildren();
  body.append(el('p', { class: 'muted' },
    ai.hasWebGPU()
      ? 'WebGPU detected: the model will run on your graphics card.'
      : 'WebGPU not available: the model will run on your CPU (slower). Chrome or Edge on desktop works best.'));
  for (const [key, m] of Object.entries(ai.MODELS)) {
    body.append(el('button', { class: 'model-option', type: 'button', onclick: () => startLoad(key) },
      el('strong', {}, m.label),
      el('span', {}, `${m.size} download, cached after the first time`),
      el('span', { class: 'muted' }, 'A small 1B model. Good at explaining code and errors, but it can be wrong. Double-check what it says.')));
  }
  body.append(el('div', { class: 'progress', hidden: true }, el('div', { class: 'bar' })), el('p', { class: 'load-msg muted' }));
  if (!dialog.open) dialog.showModal();
}

async function startLoad(key) {
  if (aiLoading) return;
  aiLoading = true;
  renderAiStatus();
  const progress = $('.progress', dialog), bar = $('.bar', dialog), msg = $('.load-msg', dialog);
  dialog.querySelectorAll('.model-option').forEach((b) => (b.disabled = true));
  progress.hidden = false;
  msg.textContent = 'Downloading…';
  try {
    await ai.loadModel(key, (p) => {
      bar.style.width = `${Math.round(p * 100)}%`;
      msg.textContent = p < 1 ? `Downloading… ${Math.round(p * 100)}%` : 'Starting the model…';
    });
    msg.textContent = 'Ready!';
    setTimeout(() => dialog.close(), 600);
  } catch (err) {
    console.error(err);
    msg.textContent = `Could not load the model: ${err.message}`;
  } finally {
    aiLoading = false;
    dialog.querySelectorAll('.model-option').forEach((b) => (b.disabled = false));
    renderAiStatus();
  }
}

aiBtn.addEventListener('click', openModelDialog);
$('#model-close').addEventListener('click', () => dialog.close());

// Renders the model's **bold** and `code` markdown as DOM nodes (never as HTML, so its text can't inject markup).
function formatReply(text) {
  return text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/).map((part) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return el('strong', {}, part.slice(2, -2));
    if (/^`[^`]+`$/.test(part)) return el('code', {}, part.slice(1, -1));
    return part;
  });
}

// Streams a tutor reply into `output`. Returns when done.
async function streamAi(req, output, controls) {
  if (!ai.isLoaded()) { openModelDialog(); return; }
  const controller = new AbortController();
  controls.run.forEach((b) => (b.disabled = true));
  controls.stop.hidden = false;
  controls.stop.onclick = () => controller.abort();
  output.textContent = '';
  output.classList.add('busy');
  try {
    await ai.generate({ ...req, signal: controller.signal, onToken: (_, text) => { output.replaceChildren(...formatReply(text)); } });
  } catch (err) {
    if (err.name !== 'AbortError') output.textContent += `\n\n[Error: ${err.message}]`;
  } finally {
    output.classList.remove('busy');
    controls.run.forEach((b) => (b.disabled = false));
    controls.stop.hidden = true;
  }
}

// ---------- Python ----------
const pyBtn = $('#py-status');
let pyState = 'idle';
function renderPyStatus(text) {
  pyBtn.textContent = text || (pyState === 'ready' ? 'Python: ready' : pyState === 'busy' ? 'Python: running…' : 'Python: starts on first run');
  pyBtn.classList.toggle('ready', pyState === 'ready');
}
py.setStatusListener((text) => renderPyStatus(`Python: ${text}`));
pyBtn.addEventListener('click', () => {
  if (pyState === 'busy' && confirm('Stop the running code? Python restarts and every variable is lost.')) {
    py.stop();
    pyState = 'idle';
    renderPyStatus();
  }
});

// One Python namespace per lesson page. The lesson's hidden setup code runs before its first cell.
let session = { lesson: null, setupDone: false };

async function runInLesson(code, { check, exerciseSetup } = {}) {
  const lesson = session.lesson;
  pyState = 'busy';
  renderPyStatus();
  try {
    if (!session.setupDone && lesson.setup) {
      const r = await py.run(lesson.setup);
      if (r.error) throw new Error('Lesson setup failed:\n' + r.error);
    }
    session.setupDone = true;
    if (exerciseSetup) {
      const r = await py.run(exerciseSetup);
      if (r.error) throw new Error('Exercise setup failed:\n' + r.error);
    }
    const res = await py.run(code, check);
    pyState = 'ready';
    return res;
  } catch (err) {
    pyState = 'idle';
    session.setupDone = false; // the worker may have been restarted
    return { stdout: '', error: err.message, images: [] };
  } finally {
    renderPyStatus();
  }
}

function renderResult(out, res) {
  out.replaceChildren();
  if (res.stdout) out.append(el('pre', { class: 'stdout' }, res.stdout));
  if (res.html) { const t = el('div', { class: 'table-wrap' }); t.innerHTML = res.html; out.append(t); } // escaped by pandas
  if (res.text) out.append(el('pre', { class: 'value' }, res.text));
  for (const png of res.images || []) out.append(el('img', { src: `data:image/png;base64,${png}`, alt: 'Chart produced by the code' }));
  if (res.error) out.append(el('pre', { class: 'error' }, res.error));
  out.hidden = !out.childElementCount;
}

// A code editor: a textarea that grows, indents with Tab and runs with Shift+Enter.
function editor(value, onChange) {
  const ta = el('textarea', { class: 'code', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Python code' });
  ta.value = value;
  const fit = () => { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight + 2}px`; };
  ta.addEventListener('input', () => { fit(); onChange?.(ta.value); });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  });
  requestAnimationFrame(fit);
  return ta;
}

function codeCell(code, lesson) {
  const ta = editor(code);
  const out = el('div', { class: 'cell-output', hidden: true, 'aria-live': 'polite' });
  const runBtn = el('button', { type: 'button', class: 'run' }, '▶ Run');
  const askBtn = el('button', { type: 'button', class: 'ghost', hidden: true }, 'Ask the tutor about this error');
  const explainBtn = el('button', { type: 'button', class: 'ghost' }, 'Explain this code');
  let lastError = null;

  const run = async () => {
    runBtn.disabled = true;
    out.hidden = false;
    out.replaceChildren(el('p', { class: 'muted small' }, 'Running…'));
    const res = await runInLesson(ta.value);
    renderResult(out, res);
    lastError = res.error;
    askBtn.hidden = !res.error;
    runBtn.disabled = false;
  };
  runBtn.addEventListener('click', run);
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); run(); } });
  explainBtn.addEventListener('click', () => askTutor(tutor.explainCode(ta.value, lesson.title), 'Explain this code'));
  askBtn.addEventListener('click', () => askTutor(tutor.explainError(ta.value, lastError, lesson.title), 'Explain this error'));

  return el('div', { class: 'cell' }, ta, el('div', { class: 'cell-bar' }, runBtn, explainBtn, askBtn), out);
}

// ---------- tutor card (one per lesson page) ----------
let askTutor = () => {};

function tutorCard(lesson) {
  const q = el('textarea', { id: 'tutor-q', rows: '3', placeholder: 'e.g. What is the difference between a list and a NumPy array?' });
  const heading = el('p', { class: 'muted small tutor-mode' });
  const output = el('div', { class: 'ai-output', 'aria-live': 'polite' });
  const askBtn = el('button', { type: 'button', class: 'primary' }, 'Ask');
  const stopBtn = el('button', { type: 'button', hidden: true }, 'Stop');
  const controls = { run: [askBtn], stop: stopBtn };
  const card = el('section', { class: 'card tutor', id: 'tutor' },
    el('h2', {}, '🤖 AI tutor'),
    el('p', { class: 'muted small' }, 'Ask a question about this lesson, or use "Explain this code" or "Ask the tutor about this error" under any code cell. It runs on your device, so nothing you type is sent anywhere.'),
    el('div', { class: 'field' }, el('label', { for: 'tutor-q' }, 'Your question'), q),
    el('div', { class: 'actions' }, askBtn, stopBtn),
    heading, output,
    el('p', { class: 'muted small' }, 'A small 1B model: helpful, but it makes mistakes. Check its answers against the lesson.'));

  askBtn.addEventListener('click', () => {
    if (!q.value.trim()) { q.focus(); return; }
    heading.textContent = '';
    streamAi(tutor.ask(q.value.trim(), lesson.title), output, controls);
  });
  askTutor = (req, label) => {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading.textContent = label;
    streamAi(req, output, controls);
  };
  return card;
}

// ---------- lesson parts ----------
function exerciseCard(lesson) {
  const ex = lesson.exercise;
  const key = `code:${lesson.id}`;
  const ta = editor(store.get(key, ex.starter), (v) => store.set(key, v));
  const out = el('div', { class: 'cell-output', hidden: true, 'aria-live': 'polite' });
  const verdict = el('div', { class: 'verdict', hidden: true, role: 'status' });
  const runBtn = el('button', { type: 'button', class: 'primary' }, '▶ Run and check');
  const resetBtn = el('button', { type: 'button' }, 'Reset code');
  const hint = el('details', {}, el('summary', {}, 'Hint'), el('p', {}, ex.hint));
  const solution = el('details', {}, el('summary', {}, 'Show a solution'), el('pre', { class: 'solution' }, ex.solution));
  const askBtn = el('button', { type: 'button', class: 'ghost', hidden: true }, 'Ask the tutor about this error');
  let lastError = null;

  const setVerdict = (passed, msg) => {
    verdict.hidden = false;
    verdict.className = `verdict ${passed ? 'pass' : 'fail'}`;
    verdict.textContent = passed ? '✓ Correct! Exercise complete.' : `✗ ${msg}`;
  };
  if (store.get(`ex:${lesson.id}`, false)) setVerdict(true);

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    out.hidden = false;
    out.replaceChildren(el('p', { class: 'muted small' }, 'Running…'));
    verdict.hidden = true;
    const res = await runInLesson(ta.value, { check: ex.check, exerciseSetup: ex.setup });
    renderResult(out, res);
    lastError = res.error;
    askBtn.hidden = !res.error;
    if (res.error) setVerdict(false, 'Your code raised an error (see above).');
    else if (res.passed) { store.set(`ex:${lesson.id}`, true); setVerdict(true); }
    else setVerdict(false, res.feedback || 'Not quite yet.');
    runBtn.disabled = false;
  });
  resetBtn.addEventListener('click', () => {
    if (!confirm('Replace your code with the starter code?')) return;
    ta.value = ex.starter;
    store.set(key, ex.starter);
    ta.dispatchEvent(new Event('input'));
  });
  askBtn.addEventListener('click', () => askTutor(tutor.explainError(ta.value, lastError, lesson.title), 'Explain this error'));

  return el('section', { class: 'card exercise' },
    el('h2', {}, 'Exercise'),
    html(ex.task.html),
    ta,
    el('div', { class: 'cell-bar' }, runBtn, resetBtn, askBtn),
    out, verdict, hint, solution);
}

function aiLabCard(lesson) {
  const lab = lesson.aiLab;
  const saved = store.get(`lab:${lesson.id}`, {});
  const inputs = {};
  const fields = lab.fields.map((f) => {
    const input = f.multiline
      ? el('textarea', { id: `f-${f.id}`, rows: String(f.rows || 4), placeholder: f.placeholder || '' })
      : el('input', { id: `f-${f.id}`, type: 'text', placeholder: f.placeholder || '' });
    input.value = saved[f.id] ?? '';
    input.addEventListener('input', () => { saved[f.id] = input.value; store.set(`lab:${lesson.id}`, saved); });
    inputs[f.id] = input;
    return el('div', { class: 'field' }, el('label', { for: `f-${f.id}` }, f.label), input);
  });
  const results = el('div');
  const runBtn = el('button', { type: 'button', class: 'primary' }, lab.button);
  const stopBtn = el('button', { type: 'button', hidden: true }, 'Stop');
  runBtn.addEventListener('click', async () => {
    if (!ai.isLoaded()) { openModelDialog(); return; }
    const values = {};
    // Empty fields fall back to the example so the lab works straight away.
    for (const f of lab.fields) values[f.id] = inputs[f.id].value.trim() || f.placeholder || '';
    const runs = lab.prompts(values).map(({ label, req }) => ({ req, output: el('div', { class: 'ai-output', 'aria-live': 'polite' }), label }));
    results.replaceChildren(...runs.flatMap((r) => [el('p', { class: 'tutor-mode' }, r.label), r.output]));
    stopped = false;
    for (const r of runs) {
      if (stopped) break;
      await streamAi(r.req, r.output, { run: [runBtn], stop: stopBtn });
    }
  });
  let stopped = false;
  stopBtn.addEventListener('click', () => { stopped = true; });
  return el('section', { class: 'card lab' },
    el('h2', {}, lab.title), el('p', {}, lab.intro), ...fields,
    el('div', { class: 'actions' }, runBtn, stopBtn), results);
}

function quizCard(lesson) {
  const answers = store.get(`quiz:${lesson.id}`, []);
  const score = el('p', { class: 'muted small' });
  const updateScore = () => {
    const right = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
    score.textContent = `${right} of ${lesson.quiz.length} correct`;
  };
  const items = lesson.quiz.map((q, qi) => {
    const why = el('p', { class: 'why', hidden: true });
    const opts = q.options.map((o, oi) => {
      const b = el('button', { type: 'button', class: 'option' }, o);
      b.addEventListener('click', () => {
        answers[qi] = oi;
        store.set(`quiz:${lesson.id}`, answers);
        show();
        updateScore();
      });
      return b;
    });
    const show = () => {
      const a = answers[qi];
      if (a == null) return;
      opts.forEach((b, oi) => {
        b.classList.toggle('right', oi === q.answer && a === q.answer);
        b.classList.toggle('wrong', oi === a && a !== q.answer);
      });
      why.hidden = false;
      why.textContent = (a === q.answer ? '✓ ' : '✗ Not quite. ') + q.why;
      why.className = `why ${a === q.answer ? 'pass' : 'fail'}`;
    };
    show();
    return el('li', {}, el('p', { class: 'q' }, q.q), el('div', { class: 'options' }, ...opts), why);
  });
  updateScore();
  return el('section', { class: 'card quiz' }, el('h2', {}, 'Quick check'), el('ol', {}, ...items), score);
}

const resourceItem = (r) => el('li', { class: 'resource' },
  el('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.title),
  el('span', { class: 'provider' }, ` · ${r.provider}`),
  el('span', { class: 'tags' },
    el('span', { class: 'tag' }, r.level),
    r.cert ? el('span', { class: 'tag cert' }, 'free certificate') : null),
  el('span', { class: 'note' }, r.note));

function resourcesCard(lesson) {
  return el('section', { class: 'card' },
    el('h2', {}, 'Go deeper (free)'),
    el('ul', { class: 'resources' }, ...lesson.resources.map((id) => resourceItem(byId[id]))),
    el('p', { class: 'small' }, el('a', { href: '#/courses' }, 'See all free courses →')));
}

// ---------- pages ----------
function renderHome() {
  document.title = `${SITE}: a free data science & AI course`;
  const done = LESSONS.filter(lessonDone).length;
  const parts = [...new Set(LESSONS.map((l) => l.part))];
  main.replaceChildren(
    el('section', { class: 'hero' },
      el('h1', {}, 'Learn data science and AI by doing'),
      el('p', { class: 'lede' },
        '16 hands-on lessons, from your first line of Python to how ChatGPT-style models work. Every lesson has real code you run and edit in your browser, a checked exercise, a quick quiz and links to the best free courses for going deeper.'),
      el('ul', { class: 'features' },
        el('li', {}, el('strong', {}, 'Real Python in the browser. '), 'NumPy, pandas, scikit-learn and matplotlib, with nothing to install.'),
        el('li', {}, el('strong', {}, 'A private AI tutor. '), 'A small language model that runs on your own device explains code and errors.'),
        el('li', {}, el('strong', {}, 'Free forever. '), 'No account, no server. Your progress stays in this browser.')),
      el('p', { class: 'muted' }, `${done} of ${LESSONS.length} lessons complete`),
      el('div', { class: 'progress home' }, el('div', { class: 'bar', style: `width:${(100 * done) / LESSONS.length}%` }))),
    ...parts.map((part) => el('section', { class: 'part' },
      el('h2', {}, part),
      el('ol', { class: 'lesson-list' },
        ...LESSONS.filter((l) => l.part === part).map((l) => el('li', {},
          el('a', { href: `#/lesson/${l.id}`, class: lessonDone(l) ? 'done' : '' },
            el('span', { class: 'num' }, String(l.id)),
            el('span', { class: 'title' }, l.title),
            el('span', { class: 'meta' }, lessonDone(l) ? '✓ done' : `${l.minutes} min`))))))),
    el('section', { class: 'card cta' },
      el('h2', {}, `${RESOURCES.length} free courses and books`),
      el('p', {}, 'From Harvard, MIT, Stanford, Google, Microsoft, Kaggle, fast.ai, Hugging Face and more, organised along the same path as this course.'),
      el('a', { href: '#/courses', class: 'button primary' }, 'Browse free courses →')),
  );
}

function renderCourses() {
  document.title = `Free courses: ${SITE}`;
  let stage = 'All';
  const list = el('div');
  const chips = el('div', { class: 'chips', role: 'toolbar', 'aria-label': 'Filter by topic' });
  const draw = () => {
    chips.replaceChildren(...['All', ...STAGES].map((s) => el('button', {
      type: 'button', class: `chip ${s === stage ? 'on' : ''}`, 'aria-pressed': String(s === stage),
      onclick: () => { stage = s; draw(); },
    }, s)));
    list.replaceChildren(...STAGES.filter((s) => stage === 'All' || s === stage).map((s) => el('section', { class: 'card' },
      el('h2', {}, s),
      el('ul', { class: 'resources' }, ...RESOURCES.filter((r) => r.stage === s).map(resourceItem)))));
  };
  draw();
  main.replaceChildren(
    el('nav', { class: 'crumbs' }, el('a', { href: '#/' }, '← Course home')),
    el('h1', {}, 'Free data science & AI courses'),
    el('p', { class: 'lede' }, 'Every course and book here can be studied for free. "Free certificate" means the certificate is free too; otherwise you can usually audit for free and pay only for a certificate. Checked September 2026.'),
    el('p', { class: 'muted small' }, 'Suggested order: Python → maths and statistics → data analysis and SQL → machine learning → deep learning → LLMs and agents → MLOps. Links open the provider\'s site.'),
    chips, list);
  window.scrollTo(0, 0);
}

function renderLesson(lesson) {
  document.title = `${lesson.id}. ${lesson.title}: ${SITE}`;
  if (session.lesson !== lesson) {
    session = { lesson, setupDone: false };
    if (py.isStarted()) py.reset();
  }
  const prev = LESSONS.find((l) => l.id === lesson.id - 1);
  const next = LESSONS.find((l) => l.id === lesson.id + 1);

  main.replaceChildren(
    el('nav', { class: 'crumbs' }, el('a', { href: '#/' }, '← All lessons')),
    el('article', {},
      el('p', { class: 'eyebrow' }, `Lesson ${lesson.id} of ${LESSONS.length} · ${lesson.part} · ${lesson.minutes} min`),
      el('h1', {}, lesson.title),
      lesson.setup ? el('details', { class: 'setup' }, el('summary', {}, 'Setup code (runs automatically before the first cell)'),
        el('pre', {}, lesson.setup)) : null,
      ...lesson.body.map((s) => (s.code != null ? codeCell(s.code, lesson) : html(s.html))),
      exerciseCard(lesson),
      lesson.aiLab ? aiLabCard(lesson) : null,
      quizCard(lesson),
      tutorCard(lesson),
      resourcesCard(lesson)),
    el('nav', { class: 'pager' },
      prev ? el('a', { href: `#/lesson/${prev.id}` }, `← ${prev.title}`) : el('span'),
      next ? el('a', { href: `#/lesson/${next.id}` }, `${next.title} →`) : el('a', { href: '#/' }, 'Finish →')),
  );
  window.scrollTo(0, 0);
}

function route() {
  const m = location.hash.match(/^#\/lesson\/(\d+)/);
  const lesson = m && LESSONS.find((l) => l.id === Number(m[1]));
  if (lesson) renderLesson(lesson);
  else if (location.hash === '#/courses') renderCourses();
  else renderHome();
}

window.addEventListener('hashchange', route);
renderAiStatus();
renderPyStatus();
route();
