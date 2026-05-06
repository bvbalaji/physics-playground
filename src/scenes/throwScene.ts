import { useRef, useCallback } from 'react';
import type { Dims, SceneHandle, ThrowParams, Ball, Expr } from '../types';
import { clearBg, drawGround, arw, lbl } from '../utils/canvas';
import { drawFigure } from '../utils/figure';
import C from '../utils/palette';

interface State {
  fx: number; fy: number;
  balls: Ball[];
  dragging: boolean; dragVX: number; dragVY: number;
  expr: Expr; armL: number; armR: number;
  run: number; face: number; headBob: number;
}

export function useThrowScene(params: ThrowParams, dims: Dims): SceneHandle {
  const S  = useRef<State>({ fx: 80, fy: 0, balls: [], dragging: false, dragVX: 0, dragVY: 0, expr: 'norm', armL: -0.6, armR: 0.6, run: 0, face: 1, headBob: 0 });
  const tk = useRef(0);

  const reset = useCallback(() => {
    S.current = { fx: 80, fy: dims.FL - 46, balls: [], dragging: false, dragVX: 0, dragVY: 0, expr: 'norm', armL: -0.6, armR: 0.6, run: 0, face: 1, headBob: 0 };
    tk.current = 0;
  }, [dims]);

  const onDown = useCallback(() => {
    S.current.dragging = true; S.current.dragVX = 0; S.current.dragVY = 0;
  }, []);

  const onMove = useCallback((_mx: number, _my: number, dx: number, dy: number) => {
    if (S.current.dragging) { S.current.dragVX = dx; S.current.dragVY = dy; }
  }, []);

  const onUp = useCallback(() => {
    const s = S.current;
    if (!s.dragging) return;
    s.dragging = false;
    const vx = -s.dragVX * 0.55;
    const vy = -s.dragVY * 0.55;
    s.balls.push({ x: s.fx, y: s.fy - 30, vx, vy, trail: [], r: params.ballSize, bounces: 0, angle: 0 });
    if (s.balls.length > 6) s.balls.shift();
    s.expr = 'happy'; s.armL = -1.4; s.armR = -0.1;
    s.face = vx > 0 ? 1 : -1;
  }, [params]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, mx: number, my: number) => {
    tk.current++;
    const s            = S.current;
    const { W, H, FL } = dims;
    clearBg(ctx, W, H);

    // Update balls
    s.balls.forEach(b => {
      b.vy += params.gravity * 0.04;
      b.x  += b.vx; b.y += b.vy;
      b.angle += b.vx * 0.05;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 24) b.trail.shift();
      if (b.y > FL - b.r) { b.y = FL - b.r; b.vy *= -params.elasticity; b.vx *= 0.82; b.bounces++; }
      if (b.x < b.r)      { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x > W - b.r)  { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
    });

    // Figure chases nearest ball
    if (s.balls.length) {
      const nearest = s.balls.reduce((a, b) => Math.abs(b.x - s.fx) < Math.abs(a.x - s.fx) ? b : a);
      const dx = nearest.x - s.fx;
      if (Math.abs(dx) > 50) {
        s.fx += dx * 0.06; s.face = dx > 0 ? 1 : -1;
        s.run += 0.2; s.fy = FL - 46;
      } else { s.run *= 0.85; }
      s.headBob = Math.sign(dx) * Math.min(7, Math.abs(dx) * 0.06);
      s.expr = s.dragging ? 'shock' : Math.abs(dx) < 60 ? 'happy' : tk.current % 120 < 60 ? 'happy' : 'norm';
    } else {
      s.headBob = 0;
      s.expr = s.dragging ? 'shock' : 'norm';
    }

    if (s.dragging) {
      s.armL = -1.4 + Math.atan2(s.dragVY, s.dragVX) * 0.5;
      s.armR = -0.1;
    } else if (!s.balls.length) {
      s.armL = -0.6; s.armR = 0.6;
    }

    // Arc preview
    if (s.dragging) {
      const vx = -s.dragVX * 0.55, vy = -s.dragVY * 0.55;
      ctx.strokeStyle = 'rgba(233,69,96,0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      let px = s.fx, py = s.fy - 30, pvx = vx, pvy = vy;
      ctx.moveTo(px, py);
      for (let i = 0; i < 60; i++) { pvy += params.gravity * 0.04; px += pvx; py += pvy; if (py > FL) break; ctx.lineTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.pink + '88';
      ctx.beginPath(); ctx.arc(mx, my, params.ballSize, 0, Math.PI * 2); ctx.fill();
      arw(ctx, mx, my, mx - s.dragVX * 7, my - s.dragVY * 7, C.pink, 3);
      lbl(ctx, 'release!', mx, my - params.ballSize - 12, C.pink, 11, 'center');
    }

    if (!s.balls.length && !s.dragging) lbl(ctx, 'drag & release to throw', W / 2, 40, C.cyan, 13, 'center');

    // Draw balls
    s.balls.forEach(b => {
      b.trail.forEach((p, i) => {
        ctx.globalAlpha = (i / b.trail.length) * 0.35;
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.angle);
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = C.pink; ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -b.r); ctx.stroke();
      ctx.restore();
      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (spd > 1) arw(ctx, b.x, b.y, b.x + b.vx * 4, b.y + b.vy * 4, C.yellow, 2);
      lbl(ctx, `v=${spd.toFixed(1)}`, b.x, b.y - b.r - 8, C.yellow, 10, 'center');
      if (b.bounces > 0) lbl(ctx, `×${b.bounces}`, b.x + b.r + 4, b.y - 4, C.cyan, 10);
    });

    drawGround(ctx, W, FL, H);
    drawFigure(ctx, { x: s.fx, y: s.fy, face: s.face, run: s.run, armL: s.armL, armR: s.armR, expr: s.expr, headBob: s.headBob });

    lbl(ctx, 'x = v₀cosθ·t', 14, 28, C.yellow, 13);
    lbl(ctx, 'y = v₀sinθ·t − ½gt²', 14, 46, 'rgba(255,255,255,0.4)', 11);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
  }, [params, dims]);

  return { reset, onDown, onMove, onUp, draw };
}
