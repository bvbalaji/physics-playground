import { useRef, useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import type { PhysicsParams, CannonState, Projectile, Target, Particle, GameStats } from '../types';
import { stepProjectile, checkHit, spawnCelebration, stepParticles, launchVelocity, FLOOR_Y } from '../utils/physics';
import { drawBackground, drawCannon, drawTrajectoryPreview, drawProjectile, drawTarget, drawParticles, drawWindIndicator, drawHUD, drawBanner, drawPowerBar } from '../utils/draw';
import { useGameLoop } from '../hooks/useGameLoop';
import { useResize }   from '../hooks/useResize';

const CANNON_BASE = (_W: number, H: number) => ({ x: 90, y: FLOOR_Y(H) });

interface Props { params: PhysicsParams; isMobile: boolean; }

let projId = 0;

const CannonCanvas: FC<Props> = ({ params, isMobile }) => {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const dims  = useRef({ W: 600, H: 400 });

  const cannonRef   = useRef<CannonState>({ angle: Math.PI / 4, power: 60 });
  const projRef     = useRef<Projectile[]>([]);
  const partRef     = useRef<Particle[]>([]);
  const targetRef   = useRef<Target>({ x: 0, y: 0, radius: 38, bullRadius: 12 });
  const statsRef    = useRef<GameStats>({ shots: 0, hits: 0, bullseyes: 0, streak: 0 });
  const pulseRef    = useRef(0);
  const bannerRef   = useRef<{ text: string; sub: string; alpha: number; timer: number } | null>(null);
  const dragMode    = useRef<'angle' | 'power' | null>(null);
  const dragStart   = useRef({ x: 0, y: 0 });

  const [, forceUpdate] = useState(0);

  const placeTarget = useCallback((W: number, H: number) => {
    const floor = FLOOR_Y(H);
    const t = targetRef.current;
    t.x = W * 0.45 + Math.random() * (W * 0.38);
    t.y = floor - t.radius - 10 - Math.random() * (H * 0.42);
  }, []);

  const onResize = useCallback(({ W, H }: { W: number; H: number }) => {
    dims.current = { W, H };
    placeTarget(W, H);
    projRef.current = [];
  }, [placeTarget]);

  useResize(cvRef, onResize);

  const fire = useCallback(() => {
    const { W, H } = dims.current;
    const base = CANNON_BASE(W, H);
    const { angle, power } = cannonRef.current;
    const { vx, vy } = launchVelocity(angle, power);
    projRef.current.push({ id: projId++, x: base.x + Math.cos(angle) * 52, y: base.y - Math.sin(angle) * 52, vx, vy, trail: [], alive: true, hitBull: false, age: 0 });
    statsRef.current.shots++;
    forceUpdate(n => n + 1);
  }, []);

  const getPos = useCallback((e: MouseEvent | TouchEvent) => {
    const cv = cvRef.current!; const rect = cv.getBoundingClientRect();
    const { W, H } = dims.current;
    const src = 'touches' in e ? ((e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0]) : (e as MouseEvent);
    return { x: (src.clientX - rect.left) * (W / rect.width), y: (src.clientY - rect.top) * (H / rect.height) };
  }, []);

  const hitZone = useCallback((px: number, py: number): 'angle' | 'power' | 'fire' | null => {
    const { W, H } = dims.current;
    const base = CANNON_BASE(W, H);
    const dist = Math.hypot(px - base.x, py - base.y);
    if (dist < 30) return 'fire';
    if (dist < 100) return 'angle';
    if (isMobile) {
      if (px > 120 && px < 300 && py > H - 65 && py < H - 30) return 'power';
    } else {
      if (px > W - 50 && px < W - 20 && py > H / 2 - 110 && py < H / 2 + 110) return 'power';
    }
    return null;
  }, [isMobile]);

  const onDown = useCallback((e: MouseEvent | TouchEvent) => {
    if ('touches' in e) (e as TouchEvent).preventDefault();
    const p = getPos(e); const z = hitZone(p.x, p.y);
    if (z === 'fire') { fire(); return; }
    if (z) { dragMode.current = z; dragStart.current = p; }
  }, [getPos, hitZone, fire]);

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if ('touches' in e) (e as TouchEvent).preventDefault();
    if (!dragMode.current) return;
    const p = getPos(e); const { W, H } = dims.current; const base = CANNON_BASE(W, H);
    if (dragMode.current === 'angle') {
      const a = -Math.atan2(p.y - base.y, p.x - base.x);
      cannonRef.current.angle = Math.max(0.05, Math.min(Math.PI * 0.9, a));
    } else {
      const delta = isMobile ? (dragStart.current.x - p.x) * 0.5 : (dragStart.current.y - p.y) * 0.5;
      cannonRef.current.power = Math.max(5, Math.min(100, cannonRef.current.power + delta));
      dragStart.current = p;
    }
  }, [getPos, isMobile]);

  const onUp = useCallback(() => { dragMode.current = null; }, []);

  useEffect(() => {
    const cv = cvRef.current!;
    cv.addEventListener('mousedown',   onDown as EventListener);
    cv.addEventListener('touchstart',  onDown as EventListener, { passive: false });
    cv.addEventListener('mousemove',   onMove as EventListener);
    cv.addEventListener('touchmove',   onMove as EventListener, { passive: false });
    cv.addEventListener('mouseup',     onUp);
    cv.addEventListener('touchend',    onUp);
    cv.addEventListener('touchcancel', onUp);
    window.addEventListener('mouseup', onUp);
    return () => {
      cv.removeEventListener('mousedown',   onDown as EventListener);
      cv.removeEventListener('touchstart',  onDown as EventListener);
      cv.removeEventListener('mousemove',   onMove as EventListener);
      cv.removeEventListener('touchmove',   onMove as EventListener);
      cv.removeEventListener('mouseup',     onUp);
      cv.removeEventListener('touchend',    onUp);
      cv.removeEventListener('touchcancel', onUp);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onDown, onMove, onUp]);

  useGameLoop(useCallback(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const { W, H } = dims.current;
    const base = CANNON_BASE(W, H);
    const cannon = cannonRef.current;
    const target = targetRef.current;
    const stats  = statsRef.current;
    pulseRef.current += 0.06;

    projRef.current.forEach(p => {
      if (!p.alive || p.hitBull) return;
      stepProjectile(p, params, W, H);
      const result = checkHit(p, target, params.ballRadius);
      if (result !== 'miss') {
        p.hitBull = true;
        const bull = result === 'bull';
        stats.hits++; if (bull) { stats.bullseyes++; stats.streak++; } else stats.streak = 0;
        spawnCelebration(partRef.current, target.x, target.y, bull);
        bannerRef.current = { text: bull ? '🎯 BULLSEYE!' : '✅ HIT!', sub: bull ? `STREAK × ${stats.streak} — perfect shot!` : `${stats.hits} hit${stats.hits > 1 ? 's' : ''} from ${stats.shots} shots`, alpha: 1, timer: bull ? 180 : 120 };
        setTimeout(() => { placeTarget(W, H); projRef.current = []; }, 1200);
        forceUpdate(n => n + 1);
      }
    });
    projRef.current = projRef.current.filter(p => p.alive);
    partRef.current = stepParticles(partRef.current);
    const banner = bannerRef.current;
    if (banner) { banner.timer--; banner.alpha = Math.min(1, banner.timer / 40); if (banner.timer <= 0) bannerRef.current = null; }

    drawBackground(ctx, W, H);
    const { vx, vy } = launchVelocity(cannon.angle, cannon.power);
    drawTrajectoryPreview(ctx, base.x + Math.cos(cannon.angle) * 52, base.y - Math.sin(cannon.angle) * 52, vx, vy, params.gravity, params.airDrag, params.windX, W, H);
    drawTarget(ctx, target, pulseRef.current);
    projRef.current.forEach(p => { if (!p.hitBull) drawProjectile(ctx, p, params.ballRadius); });
    drawCannon(ctx, cannon, base.x, base.y, dragMode.current === 'angle', dragMode.current === 'power');
    drawParticles(ctx, partRef.current);
    if (banner) drawBanner(ctx, banner.text, banner.sub, banner.alpha, W, H);
    drawPowerBar(ctx, cannon.power, W, H, isMobile, dragMode.current === 'power');
    drawWindIndicator(ctx, params.windX, W / 2, 22);
    drawHUD(ctx, cannon.angle, cannon.power, stats.shots, stats.hits, stats.bullseyes, stats.streak, W);
    if (stats.shots === 0) {
      ctx.fillStyle = 'rgba(255,215,0,0.55)'; ctx.font = '12px Space Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('DRAG BARREL to aim  •  DRAG POWER BAR to set force  •  TAP WHEEL to fire', W / 2, FLOOR_Y(H) - 16);
    }
  }, [params, isMobile, placeTarget]));

  return <canvas ref={cvRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />;
};

export default CannonCanvas;
