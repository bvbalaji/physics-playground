import type { Projectile, Target, Particle, CannonState } from '../types';
import { FLOOR_Y } from './physics';

export function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const floor = FLOOR_Y(H);
  const sky = ctx.createLinearGradient(0, 0, 0, floor);
  sky.addColorStop(0,   '#080a12');
  sky.addColorStop(0.6, '#0d1525');
  sky.addColorStop(1,   '#1a2540');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, floor);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const sc = Math.floor(W / 6);
  for (let i = 0; i < sc; i++) {
    const sx = (i * 137.508) % W, sy = (i * 73.1) % (floor * 0.8);
    ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  const gr = ctx.createLinearGradient(0, floor, 0, H);
  gr.addColorStop(0, '#1e2d1a'); gr.addColorStop(1, '#0e160b');
  ctx.fillStyle = gr; ctx.fillRect(0, floor, W, H - floor);
  ctx.strokeStyle = '#3a5c2a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, floor); ctx.lineTo(W, floor); ctx.stroke();
  ctx.strokeStyle = 'rgba(58,92,42,0.25)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, floor); ctx.lineTo(x + 20, H); ctx.stroke(); }
}

export function drawCannon(ctx: CanvasRenderingContext2D, cannon: CannonState, baseX: number, baseY: number, draggingAngle: boolean, draggingPower: boolean): void {
  const { angle, power } = cannon;
  ctx.save(); ctx.translate(baseX, baseY);
  ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 4; ctx.fillStyle = '#5a3e0a';
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.stroke(); }
  ctx.fillStyle = '#8b6914'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(-angle);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
  ctx.fillStyle = draggingAngle ? '#e8a020' : '#c47a10'; ctx.strokeStyle = '#8b5a00'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-10, -10, 52, 20, 4); ctx.fill(); ctx.stroke(); ctx.restore();
  const fillW = (power / 100) * 48;
  ctx.fillStyle = `hsl(${120 - power * 1.2}, 90%, 50%)`; ctx.globalAlpha = 0.5;
  ctx.fillRect(-8, -7, fillW, 14); ctx.globalAlpha = 1;
  ctx.fillStyle = '#d4860f'; ctx.strokeStyle = '#8b5a00'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(44, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (draggingAngle || draggingPower) {
    ctx.strokeStyle = 'rgba(255,215,0,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(0, 0, 70, -Math.PI * 0.8, Math.PI * 0.1); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  ctx.save(); ctx.translate(baseX, baseY);
  ctx.strokeStyle = 'rgba(255,215,0,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 50, -angle, 0); ctx.stroke();
  ctx.fillStyle = 'rgba(255,215,0,0.8)'; ctx.font = 'bold 11px Space Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(angle * 180 / Math.PI)}°`, 65, -15);
  ctx.restore();
}

export function drawTrajectoryPreview(ctx: CanvasRenderingContext2D, sx: number, sy: number, vx: number, vy: number, gravity: number, drag: number, wind: number, W: number, H: number): void {
  const floor = FLOOR_Y(H);
  ctx.save(); ctx.strokeStyle = 'rgba(255,215,0,0.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
  ctx.beginPath(); let px = sx, py = sy, pvx = vx, pvy = vy; ctx.moveTo(px, py);
  for (let i = 0; i < 200; i++) { pvx += wind; pvy += gravity; pvx *= drag; pvy *= drag; px += pvx; py += pvy; if (py > floor || px < 0 || px > W) break; if (i % 2 === 0) ctx.lineTo(px, py); }
  ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}

export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile, r: number): void {
  for (let i = 1; i < p.trail.length; i++) {
    const t = i / p.trail.length;
    ctx.beginPath(); ctx.arc(p.trail[i].x, p.trail[i].y, r * t * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,140,0,${t * 0.35})`; ctx.fill();
  }
  ctx.save(); ctx.shadowColor = '#ff8c00'; ctx.shadowBlur = 18;
  const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, 1, p.x, p.y, r);
  g.addColorStop(0, '#ffe066'); g.addColorStop(0.5, '#e86a00'); g.addColorStop(1, '#6b2000');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  ctx.fillStyle = 'rgba(255,215,0,0.7)'; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText(spd.toFixed(1), p.x, p.y - r - 6);
}

export function drawTarget(ctx: CanvasRenderingContext2D, target: Target, pulse: number): void {
  const { x, y, radius, bullRadius } = target;
  const p = 1 + Math.sin(pulse) * 0.04;
  [{ r: radius * p, col: '#cc1111' }, { r: radius * 0.75 * p, col: '#ffffff' }, { r: radius * 0.5 * p, col: '#cc1111' }, { r: bullRadius * p, col: '#ffd700' }]
    .forEach(({ r, col }) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke(); });
  ctx.save(); ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12 + Math.sin(pulse) * 4;
  ctx.beginPath(); ctx.arc(x, y, bullRadius * p, 0, Math.PI * 2); ctx.fillStyle = '#ffd700'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - radius, y); ctx.lineTo(x + radius, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - radius); ctx.lineTo(x, y + radius); ctx.stroke();
  ctx.fillStyle = '#6b4c2a'; ctx.fillRect(x - 4, y + radius * p, 8, 20); ctx.fillRect(x - 18, y + radius * p + 18, 36, 6);
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    if (p.char) { ctx.font = `bold ${p.size * 3}px Arial`; ctx.fillStyle = p.color; ctx.textAlign = 'center'; ctx.fillText(p.char, p.x, p.y); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); }
  }); ctx.globalAlpha = 1;
}

export function drawWindIndicator(ctx: CanvasRenderingContext2D, wind: number, x: number, y: number): void {
  const bw = 80;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-bw / 2, -8, bw, 16);
  const fill = (Math.abs(wind) / 0.5) * (bw / 2);
  ctx.fillStyle = wind === 0 ? 'rgba(255,255,255,0.3)' : `rgba(${wind > 0 ? '100,200,255' : '255,150,100'},0.6)`;
  ctx.fillRect(wind >= 0 ? 0 : -fill, -6, fill, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(-bw / 2, -8, bw, 16);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText(wind === 0 ? 'NO WIND' : `WIND ${wind > 0 ? '→' : '←'} ${Math.abs(wind).toFixed(2)}`, 0, 4);
  ctx.restore();
}

export function drawHUD(ctx: CanvasRenderingContext2D, angle: number, power: number, shots: number, hits: number, bullseyes: number, streak: number, W: number): void {
  ctx.font = 'bold 12px Space Mono, monospace'; ctx.textAlign = 'left';
  [
    { label: 'ANGLE',     val: `${Math.round(angle * 180 / Math.PI)}°` },
    { label: 'POWER',     val: `${power}%` },
    { label: 'SHOTS',     val: `${shots}` },
    { label: 'HITS',      val: `${hits}` },
    { label: 'BULLSEYES', val: `${bullseyes}` },
    { label: 'STREAK',    val: `${streak}` },
  ].forEach((l, i) => {
    const row = 24 + i * 22;
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillText(l.label, W - 150, row);
    ctx.fillStyle = '#ffd700';                ctx.fillText(l.val,   W - 58,  row);
  });
}

export function drawBanner(ctx: CanvasRenderingContext2D, text: string, sub: string, alpha: number, W: number, H: number): void {
  ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, H / 2 - 55, 0, H / 2 + 55);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, 'rgba(0,0,0,0.85)'); g.addColorStop(0.7, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, H / 2 - 55, W, 110);
  ctx.textAlign = 'center'; ctx.font = 'bold 48px Black Han Sans, sans-serif';
  ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 30;
  ctx.fillText(text, W / 2, H / 2 + 10); ctx.shadowBlur = 0;
  ctx.font = '14px Space Mono, monospace'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(sub, W / 2, H / 2 + 34); ctx.restore();
}

export function drawPowerBar(ctx: CanvasRenderingContext2D, power: number, W: number, H: number, isMobile: boolean, active: boolean): void {
  ctx.save();
  if (isMobile) {
    const bx = 130, by = H - 48, bw = 160, bh = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = active ? `hsl(${120 - power * 1.2},100%,55%)` : `hsl(${120 - power * 1.2},80%,45%)`;
    ctx.fillRect(bx, by, (power / 100) * bw, bh);
    ctx.strokeStyle = active ? '#ffd700' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = active ? 2 : 1; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Space Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(`POWER  ${power}%`, bx + bw / 2, by + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px Space Mono, monospace'; ctx.fillText('◀ drag ▶', bx + bw / 2, by - 5);
  } else {
    const bx = W - 38, by = H / 2 - 100, bw = 18, bh = 200;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    const fillH = (power / 100) * bh;
    ctx.fillStyle = active ? `hsl(${120 - power * 1.2},100%,55%)` : `hsl(${120 - power * 1.2},80%,45%)`;
    ctx.fillRect(bx, by + bh - fillH, bw, fillH);
    ctx.strokeStyle = active ? '#ffd700' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = active ? 2 : 1; ctx.strokeRect(bx, by, bw, bh);
    ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Space Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(`POWER  ${power}%`, 0, 5); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px Space Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('▲', bx + bw / 2, by - 4); ctx.fillText('drag', bx + bw / 2, by - 15);
  }
  ctx.restore();
}
