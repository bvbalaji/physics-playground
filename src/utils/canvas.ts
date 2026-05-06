import C from './palette';

/** Fill background + subtle grid */
export function clearBg(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(30,30,60,0.9)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 36) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 36) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

/** Draw the ground bar */
export function drawGround(ctx: CanvasRenderingContext2D, W: number, FL: number, H: number): void {
  ctx.fillStyle = C.blue;
  ctx.fillRect(0, FL, W, H - FL);
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, FL); ctx.lineTo(W, FL); ctx.stroke();
}

/** Draw an arrow from (x1,y1) to (x2,y2) */
export function arw(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  col: string,
  lw = 2.5,
): void {
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 11 * Math.cos(a - 0.4), y2 - 11 * Math.sin(a - 0.4));
  ctx.lineTo(x2 - 11 * Math.cos(a + 0.4), y2 - 11 * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Bold monospace label */
export function lbl(
  ctx: CanvasRenderingContext2D,
  t: string,
  x: number, y: number,
  col: string, sz: number,
  align: CanvasTextAlign = 'left',
): void {
  ctx.save();
  ctx.font = `bold ${sz}px monospace`;
  ctx.fillStyle = col; ctx.textAlign = align;
  ctx.fillText(t, x, y);
  ctx.restore();
}
