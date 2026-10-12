// Home-page figure: k-means clustering, animated on a canvas.
// Real assignment + centroid-update steps on random blobs; the readout shows the true iteration and inertia.
const K = 3, N = 150;

export function startHero(canvas, readout) {
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let W = 0, H = 0, colors, ink, faint;

  function resize() {
    const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    colors = [css('--c1'), css('--c2'), css('--c3')];
    ink = css('--text'); faint = css('--border');
  }

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const pts = Array.from({ length: N }, () => ({ x: .5, y: .5, tx: .5, ty: .5, c: -1, fade: 0 }));
  let cents = [], iter = 0, inertia = 0, phase = 'step', wait = 0;

  function newData() {
    const centers = [];
    while (centers.length < K) {
      const c = { x: .18 + Math.random() * .64, y: .18 + Math.random() * .64 };
      if (centers.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > .3)) centers.push(c);
    }
    pts.forEach((p, i) => {
      const c = centers[i % K], s = .07 + (i % 5) * .012;
      p.tx = Math.min(.97, Math.max(.03, c.x + gauss() * s * 1.6));
      p.ty = Math.min(.97, Math.max(.03, c.y + gauss() * s * 1.6));
      p.c = -1;
    });
    // start centroids on random points, like k-means++ would roughly do
    cents = Array.from({ length: K }, () => {
      const p = pts[Math.floor(Math.random() * N)];
      return { x: p.tx, y: p.ty, gx: p.tx, gy: p.ty, trail: [] };
    });
    iter = 0; inertia = 0;
  }

  function step() {
    let moved = 0;
    inertia = 0;
    for (const p of pts) {
      let best = 0, bd = Infinity;
      cents.forEach((c, j) => { const d = (p.tx - c.gx) ** 2 + (p.ty - c.gy) ** 2; if (d < bd) { bd = d; best = j; } });
      p.c = best; inertia += bd;
    }
    cents.forEach((c, j) => {
      const mine = pts.filter((p) => p.c === j);
      if (!mine.length) return;
      const nx = mine.reduce((a, p) => a + p.tx, 0) / mine.length, ny = mine.reduce((a, p) => a + p.ty, 0) / mine.length;
      moved += Math.hypot(nx - c.gx, ny - c.gy);
      c.trail.push({ x: c.gx, y: c.gy });
      c.gx = nx; c.gy = ny;
    });
    iter++;
    return moved < 1e-4;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const pad = 18, X = (v) => pad + v * (W - pad * 2), Y = (v) => pad + v * (H - pad * 2);
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gx = Math.round(X(i / 4)) + .5, gy = Math.round(Y(i / 4)) + .5;
      ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx, Y(1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), gy); ctx.lineTo(X(1), gy); ctx.stroke();
    }
    for (const p of pts) {
      ctx.globalAlpha = p.c < 0 ? .35 : .85;
      ctx.fillStyle = p.c < 0 ? ink : colors[p.c];
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    cents.forEach((c, j) => {
      ctx.strokeStyle = colors[j]; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
      ctx.beginPath();
      c.trail.forEach((t, i) => (i ? ctx.lineTo(X(t.x), Y(t.y)) : ctx.moveTo(X(t.x), Y(t.y))));
      if (c.trail.length) { ctx.lineTo(X(c.x), Y(c.y)); ctx.stroke(); }
      ctx.setLineDash([]);
      const cx = X(c.x), cy = Y(c.y);
      ctx.fillStyle = css('--surface'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx + 3.5, cy); ctx.moveTo(cx, cy - 3.5); ctx.lineTo(cx, cy + 3.5); ctx.stroke();
    });
    if (readout) readout.textContent = `iter ${String(iter).padStart(2, '0')} · inertia ${inertia.toFixed(3)}`;
  }

  resize();
  newData();
  if (reduced) {
    pts.forEach((p) => { p.x = p.tx; p.y = p.ty; });
    for (let i = 0; i < 20 && !step(); i++);
    cents.forEach((c) => { c.x = c.gx; c.y = c.gy; });
    draw();
    return;
  }

  const ro = new ResizeObserver(() => { resize(); draw(); });
  ro.observe(canvas);
  const theme = matchMedia('(prefers-color-scheme: dark)');
  const onTheme = () => resize();
  theme.addEventListener('change', onTheme);

  let last = performance.now();
  function frame(now) {
    if (!canvas.isConnected) { ro.disconnect(); theme.removeEventListener('change', onTheme); return; }
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const k = 1 - Math.exp(-dt * 6);
    for (const p of pts) { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; }
    for (const c of cents) { c.x += (c.gx - c.x) * k; c.y += (c.gy - c.y) * k; }
    wait -= dt;
    if (wait <= 0) {
      if (phase === 'step') {
        const done = step();
        wait = done ? 2.6 : .85;
        if (done) phase = 'reset';
      } else {
        newData(); phase = 'step'; wait = 1.4;
      }
    }
    draw();
  }
  wait = 1.2;
  requestAnimationFrame(frame);
}
