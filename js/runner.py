# Runs one code cell like a notebook: prints go to the output, the value of the last line is shown,
# and any matplotlib figures are returned as PNGs. Loaded by py-worker.js (and tools/test_lessons.mjs).
# exec/eval are the point here: the learner runs their own code, inside their own browser's Pyodide
# (WebAssembly) sandbox in a Web Worker. Nothing is sent to or run on a server.
import ast, base64, io, os, sys, traceback, warnings

os.environ.setdefault('MPLBACKEND', 'agg')
# Figures are captured after each cell, so plt.show() on the non-interactive backend is expected.
warnings.filterwarnings('ignore', message='.*non-interactive.*')


def _show(value):
    """Returns (text, html) for the last expression's value."""
    if value is None:
        return None, None
    mod = type(value).__module__ or ''
    if mod.startswith('pandas') and type(value).__name__ == 'DataFrame':
        import pandas as pd
        with pd.option_context('display.max_rows', 20, 'display.max_columns', 20):
            return None, value._repr_html_()  # pandas escapes cell values
    return repr(value), None


def _exec(code, ns):
    tree = ast.parse(code, '<cell>', 'exec')
    last = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        last = ast.Expression(tree.body.pop().value)
    exec(compile(tree, '<cell>', 'exec'), ns)
    return eval(compile(last, '<cell>', 'eval'), ns) if last is not None else None


def _did_you_mean(ev, ns):
    """For a misspelled DataFrame column (KeyError), suggest the closest real column name."""
    import difflib
    key = ev.args[0] if ev.args else None
    if not isinstance(key, str):
        return ''
    key = key.removeprefix('Column not found: ')
    cols = {str(c) for v in ns.values() if type(v).__name__ == 'DataFrame' for c in v.columns}
    match = difflib.get_close_matches(key, cols, n=1)
    return f"\nDid you mean '{match[0]}'?" if match else ''


def _error_text(ns):
    et, ev, tb = sys.exc_info()
    # Drop the runner's own frames so the learner sees only their code.
    while tb is not None and tb.tb_frame.f_code.co_filename != '<cell>':
        tb = tb.tb_next
    text = ''.join(traceback.format_exception(et, ev, tb))
    return text + _did_you_mean(ev, ns) if isinstance(ev, KeyError) else text


def run_cell(code, ns, check=None):
    """Returns dict(stdout, text, html, error, images, passed, feedback)."""
    out = io.StringIO()
    saved = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    res = dict(stdout='', text=None, html=None, error=None, images=[], passed=None, feedback=None)
    try:
        try:
            res['text'], res['html'] = _show(_exec(code, ns))
        except BaseException:
            res['error'] = _error_text(ns)
        if check is not None and res['error'] is None:
            try:
                exec(compile(check, '<check>', 'exec'), ns)
                res['passed'] = True
            except AssertionError as e:
                res['passed'], res['feedback'] = False, str(e) or 'Not quite yet. Check the task again.'
            except Exception as e:
                res['passed'], res['feedback'] = False, f'{type(e).__name__}: {e}'
    finally:
        sys.stdout, sys.stderr = saved
    res['stdout'] = out.getvalue()
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is not None:
        for n in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(n).savefig(buf, format='png', dpi=96, bbox_inches='tight')
            res['images'].append(base64.b64encode(buf.getvalue()).decode())
        plt.close('all')
    return res
