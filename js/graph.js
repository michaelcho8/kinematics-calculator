/* ────────────────────────────────────────────────────────────────────────
 * graph.js — Inline-SVG graph renderer for kinematics motion.
 *
 * Four public functions, one per kind of plot:
 *   drawPositionTime(svg, { u, a, tMax })
 *   drawVelocityTime(svg, { u, a, tMax })
 *   draw2DPath(svg, { ux, uy, ax, ay, tMax })
 *   drawProjectile(svg, { v0, angle, g })
 *
 * Each function clears the target <svg> and repaints it. The SVG element
 * is expected to have a viewBox set (typical: "0 0 320 200" for 1D,
 * "0 0 400 280" for 2D / projectile).
 *
 * Visual style is intentionally blueprint-paper: white axes/labels on the
 * blueprint surface (CSS background on the panel), sun-yellow trace.
 * Classes referenced by these helpers are styled in style.css under
 * "Graph panels" — keep that section in sync.
 * ──────────────────────────────────────────────────────────────────────── */

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_PADDING = { top: 24, right: 18, bottom: 26, left: 38 };

// Sample count for smooth curves
const SAMPLES = 60;

function clearSvg(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function getViewBox(svg) {
  const vb = svg.viewBox.baseVal;
  return { w: vb.width, h: vb.height };
}

// Map a single point from data coords to SVG coords
function makeMapper({ xMin, xMax, yMin, yMax }, { w, h }, padding) {
  const pl = padding.left, pr = padding.right, pt = padding.top, pb = padding.bottom;
  const plotW = w - pl - pr;
  const plotH = h - pt - pb;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  return (x, y) => {
    const sx = pl + ((x - xMin) / xSpan) * plotW;
    // Flip y so larger values point up
    const sy = pt + (1 - (y - yMin) / ySpan) * plotH;
    return [sx, sy];
  };
}

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  return node;
}

// Pad a range so the trace doesn't sit on the axis edge
function padRange(min, max, frac = 0.1) {
  const span = (max - min) || 1;
  const pad = span * frac;
  return { min: min - pad, max: max + pad };
}

// Round axis bounds to nice numbers (multiples of 1, 2, 2.5, 5, 10 × 10^n)
function niceNumber(value, round) {
  if (value === 0) return 0;
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const frac = Math.abs(value) / Math.pow(10, exp);
  let niceFrac;
  if (round) {
    niceFrac = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return Math.sign(value) * niceFrac * Math.pow(10, exp);
}

function drawAxes(svg, range, viewBox, padding, xLabel, yLabel) {
  const { xMin, xMax, yMin, yMax } = range;
  const map = makeMapper(range, viewBox, padding);

  // Find the y-coord of x-axis (where y=0 falls) or the bottom of the plot
  const axisY = (yMin <= 0 && yMax >= 0) ? 0 : yMin;
  // X-coord of y-axis (where x=0 falls) or left edge
  const axisX = (xMin <= 0 && xMax >= 0) ? 0 : xMin;

  // X axis
  const [x0, ay] = map(xMin, axisY);
  const [x1] = map(xMax, axisY);
  svg.appendChild(el('line', {
    class: 'graph-axis',
    x1: x0, y1: ay, x2: x1, y2: ay,
  }));

  // Y axis
  const [ax, y0] = map(axisX, yMin);
  const [, y1] = map(axisX, yMax);
  svg.appendChild(el('line', {
    class: 'graph-axis',
    x1: ax, y1: y0, x2: ax, y2: y1,
  }));

  // Axis labels (corner positions)
  const vb = viewBox;
  if (xLabel) {
    const label = el('text', {
      class: 'graph-axis-label',
      x: vb.w - padding.right + 4,
      y: ay + 14,
      'text-anchor': 'end',
    });
    label.textContent = xLabel;
    svg.appendChild(label);
  }
  if (yLabel) {
    const label = el('text', {
      class: 'graph-axis-label',
      x: ax - 4,
      y: padding.top - 4,
      'text-anchor': 'end',
    });
    label.textContent = yLabel;
    svg.appendChild(label);
  }

  // Endpoint value labels for sanity
  const valLabel = (text, x, y, anchor = 'middle') => {
    const t = el('text', {
      class: 'graph-axis-label',
      x, y,
      'text-anchor': anchor,
    });
    t.textContent = text;
    svg.appendChild(t);
  };
  const fmt = n => Math.abs(n) >= 1000 || (Math.abs(n) > 0 && Math.abs(n) < 0.01)
    ? n.toExponential(1)
    : (Number.isInteger(n) ? n.toString() : n.toFixed(2));

  // x-axis: show xMin and xMax values
  valLabel(fmt(xMin), x0, ay + 14, 'start');
  valLabel(fmt(xMax), x1, ay + 14, 'end');
  // y-axis: show yMin and yMax values
  valLabel(fmt(yMax), ax - 4, padding.top + 4, 'end');
  valLabel(fmt(yMin), ax - 4, viewBox.h - padding.bottom + 4, 'end');

  return map;
}

function drawTrace(svg, points, map, options = {}) {
  if (points.length < 2) return;
  const d = points.map(([x, y], i) => {
    const [sx, sy] = map(x, y);
    return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`;
  }).join(' ');
  svg.appendChild(el('path', {
    class: 'graph-trace' + (options.dotted ? ' graph-trace-dotted' : ''),
    d,
  }));
}

function drawPoint(svg, x, y, map, cls = 'graph-point') {
  const [sx, sy] = map(x, y);
  svg.appendChild(el('circle', {
    class: cls,
    cx: sx.toFixed(2),
    cy: sy.toFixed(2),
    r: 4,
  }));
}

// ── Public: 1D position vs time ──────────────────────────────────────

export function drawPositionTime(svg, { u, a, tMax }) {
  clearSvg(svg);
  if (!Number.isFinite(u) || !Number.isFinite(a) || !Number.isFinite(tMax) || tMax <= 0) return;

  const viewBox = getViewBox(svg);
  const padding = DEFAULT_PADDING;
  const samples = Math.max(2, Math.min(SAMPLES, Math.ceil(tMax * 12)));

  const points = [];
  let yMinRaw = 0, yMaxRaw = 0;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * tMax;
    const s = u * t + 0.5 * a * t * t;
    points.push([t, s]);
    if (s < yMinRaw) yMinRaw = s;
    if (s > yMaxRaw) yMaxRaw = s;
  }

  // If acceleration causes the position to reverse direction (turnaround),
  // include that vertex by extending the y-range to include it.
  const yPad = padRange(yMinRaw, yMaxRaw, 0.1);

  const range = { xMin: 0, xMax: tMax, yMin: yPad.min, yMax: yPad.max };
  const map = drawAxes(svg, range, viewBox, padding, 'time (s)', 's (m)');
  drawTrace(svg, points, map, { dotted: false });
}

// ── Public: 1D velocity vs time ──────────────────────────────────────

export function drawVelocityTime(svg, { u, a, tMax }) {
  clearSvg(svg);
  if (!Number.isFinite(u) || !Number.isFinite(a) || !Number.isFinite(tMax) || tMax <= 0) return;

  const viewBox = getViewBox(svg);
  const padding = DEFAULT_PADDING;

  const vEnd = u + a * tMax;
  const yMinRaw = Math.min(u, vEnd, 0);
  const yMaxRaw = Math.max(u, vEnd, 0);
  const yPad = padRange(yMinRaw, yMaxRaw, 0.1);

  const range = { xMin: 0, xMax: tMax, yMin: yPad.min, yMax: yPad.max };
  const map = drawAxes(svg, range, viewBox, padding, 'time (s)', 'v (m/s)');

  // Velocity is linear: just two endpoints
  drawTrace(svg, [[0, u], [tMax, vEnd]], map, { dotted: false });
}

// ── Public: 2D path (x vs y) ─────────────────────────────────────────

export function draw2DPath(svg, { ux, uy, ax, ay, tMax }) {
  clearSvg(svg);
  if (![ux, uy, ax, ay, tMax].every(Number.isFinite) || tMax <= 0) return;

  const viewBox = getViewBox(svg);
  const padding = DEFAULT_PADDING;
  const samples = Math.max(2, Math.min(SAMPLES, Math.ceil(tMax * 20)));

  const points = [];
  let xMinRaw = 0, xMaxRaw = 0, yMinRaw = 0, yMaxRaw = 0;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * tMax;
    const x = ux * t + 0.5 * ax * t * t;
    const y = uy * t + 0.5 * ay * t * t;
    points.push([x, y]);
    if (x < xMinRaw) xMinRaw = x;
    if (x > xMaxRaw) xMaxRaw = x;
    if (y < yMinRaw) yMinRaw = y;
    if (y > yMaxRaw) yMaxRaw = y;
  }

  const xPad = padRange(xMinRaw, xMaxRaw, 0.1);
  const yPad = padRange(yMinRaw, yMaxRaw, 0.15);

  const range = { xMin: xPad.min, xMax: xPad.max, yMin: yPad.min, yMax: yPad.max };
  const map = drawAxes(svg, range, viewBox, padding, 'x (m)', 'y (m)');
  drawTrace(svg, points, map, { dotted: true });

  // Mark start and end
  drawPoint(svg, points[0][0], points[0][1], map);
  drawPoint(svg, points[points.length - 1][0], points[points.length - 1][1], map);
}

// ── Public: projectile parabola ──────────────────────────────────────

export function drawProjectile(svg, { v0, angle, g }) {
  clearSvg(svg);
  if (!Number.isFinite(v0) || !Number.isFinite(angle) || !Number.isFinite(g)) return;
  if (v0 <= 0 || angle < 0 || angle > 90 || g <= 0) return;

  const theta = angle * Math.PI / 180;
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  const T = 2 * vy / g;
  if (T <= 0) return;

  const tPeak = vy / g;
  const xPeak = vx * tPeak;
  const yPeak = vy * tPeak - 0.5 * g * tPeak * tPeak;
  const xMax = vx * T;

  const viewBox = getViewBox(svg);
  const padding = DEFAULT_PADDING;

  const samples = 60;
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * T;
    const x = vx * t;
    const y = vy * t - 0.5 * g * t * t;
    points.push([x, y]);
  }

  const xPad = padRange(0, xMax, 0.05);
  const yPad = padRange(0, yPeak, 0.15);

  const range = { xMin: xPad.min, xMax: xPad.max, yMin: yPad.min, yMax: yPad.max };
  const map = drawAxes(svg, range, viewBox, padding, 'x (m)', 'y (m)');
  drawTrace(svg, points, map, { dotted: true });

  // Peak marker — dashed vertical guideline to the apex
  const [px, py] = map(xPeak, yPeak);
  const [, ay] = map(xPeak, 0);
  svg.appendChild(el('line', {
    class: 'graph-peak',
    x1: px, y1: py, x2: px, y2: ay,
  }));

  // Start, peak, and landing points
  drawPoint(svg, 0, 0, map);
  drawPoint(svg, xPeak, yPeak, map);
  drawPoint(svg, xMax, 0, map);
}
