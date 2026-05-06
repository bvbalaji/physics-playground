import C from './palette';
import type { FigureProps } from '../types';

export function drawFigure(ctx: CanvasRenderingContext2D, f: FigureProps): void {
  const {
    x, y,
    face = 1, run = 0,
    sqY = 1, sqX = 1,
    armL = -0.6, armR = 0.6,
    expr = 'norm',
    glow = null,
    headBob = 0,
  } = f;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * sqX, sqY);
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 22; }

  ctx.strokeStyle = C.white;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Body
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 2); ctx.stroke();

  // Legs (with knee joints)
  const lp  = Math.sin(run) * 22;
  const lp2 = Math.sin(run + Math.PI) * 22;
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(lp  * 0.4, 14); ctx.lineTo(lp  * 0.7, 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(lp2 * 0.4, 14); ctx.lineTo(lp2 * 0.7, 24); ctx.stroke();

  // Arms
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(Math.sin(armL) * 18, -14 + Math.cos(armL) * 15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(Math.sin(armR) * 18, -14 + Math.cos(armR) * 15); ctx.stroke();

  // Neck + head
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(headBob, -30); ctx.stroke();
  ctx.beginPath(); ctx.arc(headBob, -38, 12, 0, Math.PI * 2); ctx.stroke();

  // ── Expressions ──────────────────────────────────────────
  ctx.lineWidth = 2;

  if (expr === 'norm') {
    ctx.beginPath(); ctx.arc(headBob, -38, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.arc(headBob - 4, -40, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headBob + 4, -40, 2, 0, Math.PI * 2); ctx.fill();

  } else if (expr === 'shock' || expr === 'strain') {
    const ec = expr === 'strain' ? C.orange : '#ff4';
    ctx.strokeStyle = ec; ctx.fillStyle = ec;
    ctx.beginPath(); ctx.arc(headBob, -37, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(headBob - 4, -41, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headBob + 4, -41, 2.5, 0, Math.PI * 2); ctx.fill();

  } else if (expr === 'happy') {
    ctx.strokeStyle = C.yellow; ctx.fillStyle = C.yellow;
    ctx.beginPath(); ctx.arc(headBob, -36, 5, Math.PI + 0.3, -0.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(headBob - 4, -41, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headBob + 4, -41, 2, 0, Math.PI * 2); ctx.fill();

  } else if (expr === 'scared') {
    ctx.strokeStyle = C.orange; ctx.fillStyle = C.orange;
    ctx.beginPath(); ctx.moveTo(headBob - 4, -35); ctx.lineTo(headBob + 4, -35); ctx.stroke();
    ctx.beginPath(); ctx.arc(headBob - 4, -41, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headBob + 4, -41, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4af';
    ctx.beginPath(); ctx.arc(headBob + 15, -44, 3, 0, Math.PI * 2); ctx.fill();

  } else if (expr === 'dead') {
    ctx.strokeStyle = '#f44';
    ctx.beginPath();
    ctx.moveTo(headBob - 6, -43); ctx.lineTo(headBob - 2, -39);
    ctx.moveTo(headBob - 2, -43); ctx.lineTo(headBob - 6, -39);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headBob + 2, -43); ctx.lineTo(headBob + 6, -39);
    ctx.moveTo(headBob + 6, -43); ctx.lineTo(headBob + 2, -39);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(headBob, -34, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}
