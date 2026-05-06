import { useRef, useCallback } from 'react';
import type { Dims, SceneHandle, GravityParams, Expr } from '../types';
import { clearBg, drawGround, arw, lbl } from '../utils/canvas';
import { drawFigure } from '../utils/figure';
import C from '../utils/palette';

interface State {
  fx: number; fy: number; fvx: number; fvy: number;
  dragging: boolean; onGround: boolean;
  sqY: number; sqX: number;
  expr: Expr; armL: number; armR: number;
  trail: Array<{ x: number; y: number }>;
  splat: boolean; splatT: number;
}

export function useGravityScene(params: GravityParams, dims: Dims): SceneHandle {
  const S   = useRef<State>({ fx: 0, fy: 0, fvx: 0, fvy: 0, dragging: false, onGround: true, sqY: 1, sqX: 1, expr: 'norm', armL: -0.6, armR: 0.6, trail: [], splat: false, splatT: 0 });
  const tk  = useRef(0);

  const reset = useCallback(() => {
    S.current = {
      fx: dims.W / 2, fy: dims.FL - 46, fvx: 0, fvy: 0,
      dragging: false, onGround: true, sqY: 1, sqX: 1,
      expr: 'norm', armL: -0.6, armR: 0.6,
      trail: [], splat: false, splatT: 0,
    };
    tk.current = 0;
  }, [dims]);

  const onDown = useCallback((mx: number, my: number) => {
    void my;
    S.current.dragging  = true;
    S.current.splat     = false;
    S.current.onGround  = false;
    S.current.fvy       = 0;
    S.current.trail     = [];
  }, []);

  const onMove = useCallback((mx: number, my: number, dx: number, dy: number) => {
    if (!S.current.dragging) return;
    S.current.fx  = mx;
    S.current.fy  = Math.min(my, dims.FL - 46);
    S.current.fvx = dx;
    S.current.fvy = dy;
  }, [dims]);

  const onUp = useCallback(() => {
    S.current.dragging = false;
    S.current.expr = 'scared';
    S.current.armL = -1.1;
    S.current.armR = -1.1;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, mx: number, my: number) => {
    tk.current++;
    const s             = S.current;
    const { W, H, FL }  = dims;

    clearBg(ctx, W, H);

    // Physics tick
    if (!s.dragging && !s.onGround) {
      s.fvy += params.gravity * 0.05;
      s.fx  += s.fvx;
      s.fy  += s.fvy;
      s.fvx *= 0.97;
      s.trail.push({ x: s.fx, y: s.fy });
      if (s.trail.length > 20) s.trail.shift();

      if (s.fy >= FL - 46) {
        s.fy = FL - 46;
        const imp = Math.abs(s.fvy);
        s.fvy = -imp * params.elasticity;
        s.fvx *= 0.5;
        if (Math.abs(s.fvy) < 0.8) { s.fvy = 0; s.onGround = true; }
        s.sqY = Math.max(0.35, 1 - imp * 0.045);
        s.sqX = 2 - s.sqY;
        if (imp > 18)      { s.splat = true; s.splatT = 60; s.expr = 'dead'; }
        else if (imp > 8)  { s.expr = 'shock'; s.armL = Math.PI * 0.4; s.armR = Math.PI * 0.4; }
        else               { s.expr = 'happy'; s.armL = -0.6; s.armR = 0.6; }
        s.trail = [];
      }
    }
    if (s.onGround || Math.abs(s.fvy) < 1) {
      s.sqY = Math.min(1, s.sqY + 0.07);
      s.sqX = Math.max(1, s.sqX - 0.05);
    }
    if (s.splat) {
      s.splatT--;
      if (s.splatT <= 0) { s.splat = false; s.expr = 'norm'; }
    } else if (s.expr !== 'norm' && tk.current % 90 === 0) {
      s.expr = 'norm'; s.armL = -0.6; s.armR = 0.6;
    }
    if (s.dragging) { s.expr = 'scared'; s.armL = -1.1; s.armR = -1.1; }

    // Gravity label
    if (s.dragging) {
      lbl(ctx, `g = ${params.gravity.toFixed(1)} m/s²`, W / 2, 46, C.pink, 22, 'center');
      arw(ctx, W / 2, 58, W / 2, 108, C.pink, 3);
    }

    // Trail
    s.trail.forEach((p, i) => {
      ctx.globalAlpha = (i / s.trail.length) * 0.45;
      ctx.fillStyle = C.cyan;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Splat ring
    if (s.splat) {
      const r = (60 - s.splatT) * 3;
      ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.globalAlpha = s.splatT / 60;
      ctx.beginPath(); ctx.arc(s.fx, FL, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Height / velocity indicators
    if (!s.onGround) {
      const h = FL - 46 - s.fy;
      ctx.strokeStyle = 'rgba(0,212,255,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(s.fx + 44, s.fy + 46); ctx.lineTo(s.fx + 44, FL); ctx.stroke();
      ctx.setLineDash([]);
      lbl(ctx, `h=${Math.max(0, h).toFixed(0)}`, s.fx + 52, (s.fy + FL) / 2, C.cyan, 11);
      lbl(ctx, `v=${s.fvy.toFixed(1)}`, s.fx - 60, (s.fy + FL) / 2, C.yellow, 11);
    }

    // Drag hint
    if (!s.dragging && s.onGround) {
      ctx.strokeStyle = 'rgba(0,212,255,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(s.fx, s.fy - 38, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      lbl(ctx, 'drag me!', s.fx, s.fy - 80, C.cyan, 11, 'center');
    }

    drawGround(ctx, W, FL, H);
    drawFigure(ctx, { x: s.fx, y: s.fy, sqY: s.sqY, sqX: s.sqX, expr: s.expr, armL: s.armL, armR: s.armR, glow: s.dragging ? C.cyan : null });

    lbl(ctx, 'y = ½gt²', 14, 28, C.yellow, 14);
    lbl(ctx, 'v = gt', 14, 46, 'rgba(255,255,255,0.4)', 11);

    ctx.fillStyle = s.dragging ? C.pink : C.white;
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
  }, [params, dims]);

  return { reset, onDown, onMove, onUp, draw };
}
