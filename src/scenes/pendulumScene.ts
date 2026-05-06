import { useRef, useCallback } from 'react';
import type { Dims, SceneHandle, PendulumParams, Expr } from '../types';
import { clearBg, drawGround, lbl } from '../utils/canvas';
import { drawFigure } from '../utils/figure';
import C from '../utils/palette';

interface State {
  angle: number; omega: number;
  dragging: boolean; riding: boolean;
  expr: Expr;
  trail: Array<{ x: number; y: number }>;
}

export function usePendulumScene(params: PendulumParams, dims: Dims): SceneHandle {
  const S  = useRef<State>({ angle: -0.5, omega: 0, dragging: false, riding: false, expr: 'norm', trail: [] });
  const tk = useRef(0);

  const reset = useCallback(() => {
    S.current = { angle: -0.5, omega: 0, dragging: false, riding: false, expr: 'norm', trail: [] };
    tk.current = 0;
  }, []);

  const pivotX = () => dims.W / 2;
  const pivotY = 70;

  const onDown = useCallback((mx: number, my: number) => {
    const s  = S.current;
    const px = dims.W / 2;
    const bx = px + Math.sin(s.angle) * params.length;
    const by = pivotY + Math.cos(s.angle) * params.length;
    if (Math.hypot(mx - bx, my - by) < 44) {
      s.dragging = true; s.omega = 0;
    } else if (Math.hypot(mx - dims.W / 2, my - (dims.FL - 46)) < 70) {
      s.riding = !s.riding;
    }
  }, [params, dims]);

  const onMove = useCallback((mx: number, my: number) => {
    if (S.current.dragging) S.current.angle = Math.atan2(mx - pivotX(), my - pivotY);
  }, [dims]); // eslint-disable-line react-hooks/exhaustive-deps

  const onUp = useCallback(() => { S.current.dragging = false; }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, mx: number, my: number) => {
    tk.current++;
    const s            = S.current;
    const { W, H, FL } = dims;
    const L = params.length, px = W / 2, py = pivotY;
    clearBg(ctx, W, H);

    // Physics
    if (!s.dragging) {
      const alpha = -(params.gravity / (L / 55)) * Math.sin(s.angle);
      s.omega += alpha * 0.018;
      s.omega *= (1 - params.damping * 0.003);
      s.angle += s.omega;
    }

    const bx  = px + Math.sin(s.angle) * L;
    const by  = py + Math.cos(s.angle) * L;
    const spd = Math.abs(s.omega);

    // Trail
    s.trail.push({ x: bx, y: by });
    if (s.trail.length > 70) s.trail.shift();
    for (let i = 1; i < s.trail.length; i++) {
      ctx.globalAlpha = (i / s.trail.length) * 0.25;
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y); ctx.lineTo(s.trail[i].x, s.trail[i].y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Energy bars
    const h  = (L / 55) * (1 - Math.cos(s.angle));
    const KE = 0.5 * (s.omega * L / 55) ** 2;
    const PE = params.gravity * h * 0.5;
    const bw = Math.min(110, W * 0.22), bx2 = W - bw - 20, by2 = 20;
    ctx.fillStyle = C.border; ctx.fillRect(bx2, by2, bw, 9); ctx.fillRect(bx2, by2 + 14, bw, 9);
    ctx.fillStyle = C.orange; ctx.fillRect(bx2, by2, Math.min(bw, KE * 32), 9);
    ctx.fillStyle = C.cyan;   ctx.fillRect(bx2, by2 + 14, Math.min(bw, PE * 32), 9);
    lbl(ctx, 'KE', bx2 - 24, by2 + 8,  C.orange, 10);
    lbl(ctx, 'PE', bx2 - 24, by2 + 22, C.cyan,   10);
    lbl(ctx, KE.toFixed(2), bx2 + bw + 5, by2 + 8,  C.orange, 10);
    lbl(ctx, PE.toFixed(2), bx2 + bw + 5, by2 + 22, C.cyan,   10);

    // Rod
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.stroke();

    // Bob
    ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2);
    ctx.fillStyle = spd > 0.06 ? C.orange : C.cyan; ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 2.5; ctx.stroke();
    lbl(ctx, spd.toFixed(2), bx, by + 4, C.white, 10, 'center');

    if (!s.dragging && !s.riding) {
      ctx.strokeStyle = 'rgba(0,212,255,0.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      lbl(ctx, 'grab bob!', bx, by - 30, C.cyan, 11, 'center');
    }

    drawGround(ctx, W, FL, H);

    if (s.riding) {
      const lean = s.omega * 2.5;
      s.expr = spd > 0.1 ? 'shock' : spd > 0.02 ? 'happy' : 'norm';
      drawFigure(ctx, { x: bx, y: by - 14, face: s.omega > 0 ? 1 : -1, armL: -1.3 + lean, armR: -1.3 - lean, expr: s.expr, glow: C.yellow, sqY: 1 - Math.abs(lean) * 0.04 });
      lbl(ctx, 'WHEEE!', bx + 28, by - 22, C.yellow, 13);
    } else {
      drawFigure(ctx, { x: W / 2, y: FL - 46, expr: 'norm', armL: -0.6, armR: 0.6 });
      lbl(ctx, 'tap figure to ride!', W / 2, FL - 88, C.cyan, 11, 'center');
    }

    lbl(ctx, 'T = 2π√(L/g)', 14, 28, C.yellow, 14);
    lbl(ctx, `T = ${(2 * Math.PI * Math.sqrt(L / 55 / params.gravity)).toFixed(2)}s`, 14, 46, 'rgba(255,255,255,0.4)', 11);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
  }, [params, dims]);

  return { reset, onDown, onMove, onUp, draw };
}
