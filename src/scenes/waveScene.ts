import { useRef, useCallback } from 'react';
import type { Dims, SceneHandle, WaveParams, Expr } from '../types';
import { clearBg, drawGround, lbl } from '../utils/canvas';
import { drawFigure } from '../utils/figure';
import C from '../utils/palette';

interface State {
  t: number; surfX: number; surfVX: number;
  expr: Expr; run: number; face: number;
}

export function useWaveScene(params: WaveParams, dims: Dims): SceneHandle {
  const S  = useRef<State>({ t: 0, surfX: 300, surfVX: 0, expr: 'norm', run: 0, face: 1 });
  const tk = useRef(0);

  const reset = useCallback(() => {
    S.current = { t: 0, surfX: dims.W / 2, surfVX: 0, expr: 'norm', run: 0, face: 1 };
    tk.current = 0;
  }, [dims]);

  const onDown = useCallback(() => {}, []);
  const onMove = useCallback(() => {}, []);
  const onUp   = useCallback(() => {}, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, mx: number, my: number) => {
    tk.current++;
    const s            = S.current;
    const { W, H, FL } = dims;
    s.t += 0.055;

    const wY = (x: number) =>
      params.amplitudeA * Math.sin(params.frequencyA * 0.028 * x - s.t * 2) +
      params.amplitudeB * Math.sin(params.frequencyB * 0.028 * x - s.t * 2.5 + 1.2);

    // Surfer seeks wave peak
    let bestX = s.surfX, bestAmp = Math.abs(wY(s.surfX));
    for (let x = s.surfX - 150; x < s.surfX + 150; x += 8) {
      const a = Math.abs(wY(x));
      if (a > bestAmp) { bestAmp = a; bestX = x; }
    }
    s.surfVX += (bestX - s.surfX) * 0.012;
    s.surfVX *= 0.87;
    s.surfX  += s.surfVX;
    s.surfX   = Math.max(30, Math.min(W - 30, s.surfX));
    s.face    = s.surfVX > 0 ? 1 : -1;
    s.run    += Math.abs(s.surfVX) * 0.12;
    s.expr    = bestAmp > 35 ? 'happy' : bestAmp > 15 ? 'norm' : 'scared';

    clearBg(ctx, W, H);

    // Wave A
    ctx.beginPath();
    for (let x = 0; x < W; x += 2) {
      const y = FL + params.amplitudeA * Math.sin(params.frequencyA * 0.028 * x - s.t * 2);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = C.pink + '77'; ctx.lineWidth = 2; ctx.stroke();

    // Wave B
    ctx.beginPath();
    for (let x = 0; x < W; x += 2) {
      const y = FL + params.amplitudeB * Math.sin(params.frequencyB * 0.028 * x - s.t * 2.5 + 1.2);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = C.cyan + '77'; ctx.lineWidth = 2; ctx.stroke();

    // Composite
    ctx.beginPath();
    for (let x = 0; x < W; x += 2) {
      const y = FL + wY(x);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.stroke();

    // Max-amplitude guide
    const maxAmp = params.amplitudeA + params.amplitudeB;
    ctx.strokeStyle = 'rgba(255,215,0,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, FL - maxAmp); ctx.lineTo(W, FL - maxAmp); ctx.stroke();
    ctx.setLineDash([]);
    lbl(ctx, `max=${maxAmp.toFixed(0)}`, 8, FL - maxAmp - 5, C.yellow, 10);

    // Legend
    lbl(ctx, '─A', W - 32, 28, C.pink,  10);
    lbl(ctx, '─B', W - 32, 42, C.cyan,  10);
    lbl(ctx, '─Σ', W - 32, 56, C.white, 10);

    drawGround(ctx, W, FL, H);

    const lean = s.surfVX * 0.1;
    drawFigure(ctx, {
      x: s.surfX, y: FL + wY(s.surfX) - 46,
      face: s.face, run: s.run, expr: s.expr,
      armL: -0.6 + lean * 2, armR: 0.6 + lean * 2,
      glow: bestAmp > 40 ? C.yellow : null,
    });

    lbl(ctx, 'y = A·sin(kx−ωt) + B·sin(k₂x−ω₂t)', 14, 28, C.yellow, W < 400 ? 10 : 12);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
  }, [params, dims]);

  return { reset, onDown, onMove, onUp, draw };
}
