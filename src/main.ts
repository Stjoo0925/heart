const canvas = document.getElementById('scene') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Design parameters (minimal, refined)
const THEME_BG_TOP = '#0b0f14';
const THEME_BG_BOTTOM = '#10161d';
// Line style palette
const LINE_COLOR = '#ff3b5c';
const LINE_GLOW = 'rgba(255, 59, 92, 0.45)';
const GUIDE_COLOR = 'rgba(255,255,255,0.08)';

// Motion parameters
const BEAT_INTENSITY = 0.5; // 0..1
const BEAT_FREQ = 1.05; // Hz
const LINE_SPEED = 0.35; // cycles per second (draw speed around outline)
const TAIL_FRACTION = 0.22; // tail length as fraction of perimeter
const BASE_LINE_WIDTH = 3.2; // in CSS px

// Handle device pixel ratio for crisp rendering
function resizeCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale drawing ops back to CSS pixels
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Parametric heart curve (classic) in canonical coordinates
// x(t) = 16 sin^3 t
// y(t) = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
function heartPoint(t: number): { x: number; y: number } {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

function buildHeartPoints(centerX: number, centerY: number, size: number, steps: number) {
  const pts: Array<{x:number;y:number}> = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const p = heartPoint(t);
    const x = centerX + (p.x * size) / 20;
    const y = centerY - (p.y * size) / 20;
    pts.push({ x, y });
  }
  return pts;
}

function strokePolyline(points: Array<{x:number;y:number}>, color: string, width: number, glow = false) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  if (glow) {
    ctx.shadowColor = LINE_GLOW;
    ctx.shadowBlur = Math.max(6, width * 1.8);
  }
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

function extractTail(points: Array<{x:number;y:number}>, headIndex: number, tailLen: number) {
  const n = points.length;
  const out: Array<{x:number;y:number}> = [];
  for (let k = 0; k <= tailLen; k++) {
    const idx = (headIndex - k + n) % n;
    out.unshift(points[idx]);
  }
  return out;
}

function drawGlow(centerX: number, centerY: number, size: number, glowStrength: number) {
  if (glowStrength <= 0) return;
  const layers = 3;
  for (let i = 1; i <= layers; i++) {
    const r = size * (1 + i * 0.18);
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    const alpha = glowStrength * (1 - i / (layers + 1)) * 0.22;
    ctx.fillStyle = `rgba(255, 59, 92, ${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

function drawBackground(w: number, h: number) {
  // Vertical subtle gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, THEME_BG_TOP);
  bg.addColorStop(1, THEME_BG_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Vignette
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.6);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function drawShadow(cx: number, cy: number, base: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + base * 0.62, base * 0.56, base * 0.18, 0, 0, Math.PI * 2);
  ctx.filter = 'blur(8px)';
  ctx.fill();
  ctx.filter = 'none';
  ctx.restore();
}

let start = performance.now();
function tick(now: number) {
  const elapsed = (now - start) / 1000; // seconds

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  // Background
  drawBackground(w, h);

  // Layout
  const base = Math.min(w, h) * 0.34;

  // Eased heartbeat: rise fast, decay slow
  const t = elapsed * BEAT_FREQ * Math.PI * 2;
  const s = Math.sin(t);
  const osc = Math.max(0, s) ** 2 * 0.9 + Math.max(0, -s) * 0.1; // slight asymmetry
  const scale = 1 + BEAT_INTENSITY * (0.05 * osc ** 2 + 0.03 * osc);

  const cx = w / 2;
  const cy = h / 2 - base * 0.02;

  // Subtle floor shadow and ambient glow
  drawShadow(cx, cy, base * scale, 0.18 + 0.08 * osc);
  drawGlow(cx, cy, base * 0.9 * scale, 0.28);

  // Build polyline points for current scale
  const STEPS = 720;
  const pts = buildHeartPoints(cx, cy, base * scale, STEPS);

  // Guide outline (very faint)
  strokePolyline(pts, GUIDE_COLOR, Math.max(1, BASE_LINE_WIDTH * 0.6));

  // Compute animated head index and tail
  const cycle = (elapsed * LINE_SPEED) % 1;
  const headIndex = Math.floor(cycle * STEPS);
  const tailLen = Math.max(2, Math.floor(STEPS * TAIL_FRACTION));
  const tailPts = extractTail(pts, headIndex, tailLen);

  // Glow pass
  strokePolyline(tailPts, LINE_COLOR, Math.max(1, BASE_LINE_WIDTH * 2.2), true);
  // Core pass
  strokePolyline(tailPts, LINE_COLOR, Math.max(1, BASE_LINE_WIDTH));

  // Head capsule (dot)
  const head = pts[headIndex];
  ctx.save();
  ctx.fillStyle = LINE_COLOR;
  ctx.shadowColor = LINE_GLOW;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(head.x, head.y, Math.max(1.5, BASE_LINE_WIDTH * 0.7), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
