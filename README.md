# 📊 Data Craft

**Live site: https://bcool5869-coder.github.io/data-craft/**

A free, hands-on **data science and AI course** that runs entirely on GitHub Pages.
16 lessons take you from your first line of Python to how large language models work. Each lesson has:

- **Runnable, editable Python** in the browser via [Pyodide](https://pyodide.org) (NumPy, pandas, scikit-learn, matplotlib, SciPy, SQLite)
- a **checked exercise** (your code is run and tested, with hints and a solution)
- a short **quiz**
- a private **AI tutor** that explains code and errors: **MiniCPM5-1B** running on the learner's device via
  [wllama](https://github.com/ngxson/wllama) (llama.cpp → WebAssembly, WebGPU when available)
- links to the best **free courses** for going deeper (Harvard, MIT, Stanford, Google, Microsoft, Kaggle, fast.ai, Hugging Face…)

No server, no account, no API key. **Everything the site loads lives in this repo**: code, the Python runtime and
packages, datasets and the model weights. Nothing is fetched from a CDN or any other host.

## Lessons
| Part | Lessons |
|---|---|
| Foundations | 1 What are data science and AI? · 2 Python for data · 3 NumPy: vectors and matrices |
| Working with data | 4 pandas: exploring a dataset · 5 Cleaning messy data · 6 Visualising data · 7 SQL |
| Statistics | 8 Probability and statistics by simulation · 9 A/B tests and hypothesis testing |
| Machine learning | 10 Linear regression and gradient descent · 11 Classification and honest evaluation · 12 Clustering and PCA |
| Deep learning | 13 Neural networks from scratch · 14 How large language models work |
| Using AI | 15 Prompting, RAG and fine-tuning · 16 MLOps, ethics and your portfolio |

The free-course catalogue is in `js/resources.js`; research notes and sources are in
[research/free-courses.md](research/free-courses.md).

## Run locally
ES modules and workers need a web server (opening `index.html` as a file won't work):

```bash
python -m http.server 8766
```

Then open http://localhost:8766.

## Test every lesson
`tools/test_lessons.mjs` runs each lesson in Node with the vendored Pyodide, exactly as the browser does. Every
code cell must run without errors, every exercise **starter must fail** its check, and every **solution must pass**:

```bash
node tools/test_lessons.mjs        # all lessons
node tools/test_lessons.mjs 5 9    # only lessons 5 and 9
```

## How it works
```
index.html            page shell
css/style.css         styles (light + dark)
js/app.js             routing, lesson pages, code cells, exercises, quizzes, tutor, course catalogue
js/lessons-1.js       lessons 1–8   (H`html` sections and C`python` cells; String.raw keeps backslashes)
js/lessons-2.js       lessons 9–16
js/resources.js       the free courses and books
js/py.js              page side of the Python worker (queue, stop/restart)
js/py-worker.js       Web Worker that owns Pyodide, so long runs never freeze the page
js/runner.py          runs a cell like a notebook: prints, last-line value, pandas tables, matplotlib PNGs, checks
js/ai.js              wllama wrapper: load the model, stream a reply
js/tutor.js           tutor prompts (explain code, explain an error, answer a question)
data/                 small synthetic datasets (tools/make_data.py regenerates them) and a tiny text corpus
vendor/pyodide/       Pyodide 314.0.7 core + only the 17 wheels needed (~52 MB, MPL-2.0 and package licences)
vendor/wllama/        wllama 3.6.1 (MIT)
models/minicpm5-1b/   MiniCPM5-1B Q4_K_M in 22 plain 30 MB byte parts (GitHub limit is 100 MB per file; small parts survive a flaky upload) (Apache-2.0)
```

- **One Python namespace per lesson**. A lesson's hidden `setup` (shown in a collapsible block) runs before its first
  cell, and an exercise's `setup` runs before each check. Python and packages download on the first run
  (~13 MB for Python, ~36 MB if a lesson uses every package) and are then cached by the browser.
- **Stop** a runaway cell by clicking the *Python* pill: the worker is killed and restarted.
- **Model sharing**: the model is cached in the browser under the same name as the
  [Story Craft](https://github.com/bcool5869-coder/story-craft) course. Both sites are on the same github.io origin,
  so a learner who already has it doesn't download it again.
- **Progress** (exercise passed + quiz answers + your exercise code) is kept in `localStorage`, on that device only.

## Writing tutor prompts for a 1B model (tested in the browser)
- Send only the **last lines of a traceback**. Library frames are noise and make it ramble.
- Give it the facts it needs: the runner adds a Python-style *"Did you mean 'revenue'?"* to a pandas `KeyError`,
  so the tutor (and the learner) sees the right column name.
- For grounded answers (RAG lab), **don't add "if the context doesn't say, say so"**: on MiniCPM5-1B that made it
  refuse even easy lookups. The lab shows the answer *without* and *with* context side by side instead.
- Ask for numbered points of **one short sentence** each, with a prefill (`1.`), and render only `**bold**` and
  `` `code` `` (as DOM nodes, never as HTML).

## Credits
Python: [Pyodide](https://pyodide.org) (MPL-2.0) and its packages (NumPy, pandas, scikit-learn, SciPy, matplotlib and
dependencies, under their own open-source licences). Model: [OpenBMB MiniCPM5](https://huggingface.co/openbmb)
(Apache-2.0). Runtime: wllama and llama.cpp (MIT). Built-in datasets: scikit-learn (iris, wine, digits, breast cancer).
