import type { Projectile, PhysicsParams, Target, Particle } from '../types';

export const FLOOR_Y = (H: number): number => H - 80;

export function stepProjectile(p: Projectile, params: PhysicsParams, W: number, H: number): void {
  const floor = FLOOR_Y(H);
  p.age++;
  p.vx += params.windX;
  p.vy += params.gravity;
  p.vx *= params.airDrag;
  p.vy *= params.airDrag;
  p.x  += p.vx;
  p.y  += p.vy;
  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > 60) p.trail.shift();

  if (p.y + params.ballRadius >= floor) {
    p.y  = floor - params.ballRadius;
    p.vy = -Math.abs(p.vy) * params.bounciness;
    p.vx *= 0.85;
    if (Math.abs(p.vy) < 0.5) p.vy = 0;
  }
  if (p.x - params.ballRadius < 0)  { p.x = params.ballRadius;      p.vx =  Math.abs(p.vx) * params.bounciness; }
  if (p.x + params.ballRadius > W)  { p.x = W - params.ballRadius;  p.vx = -Math.abs(p.vx) * params.bounciness; }

  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  if (p.y + params.ballRadius >= floor && speed < 0.3) p.alive = false;
  if (p.age > 600) p.alive = false;
}

export function checkHit(p: Projectile, t: Target, ballR: number): 'bull' | 'hit' | 'miss' {
  const dist = Math.hypot(p.x - t.x, p.y - t.y);
  if (dist < t.bullRadius + ballR) return 'bull';
  if (dist < t.radius     + ballR) return 'hit';
  return 'miss';
}

export function spawnCelebration(particles: Particle[], cx: number, cy: number, isBull: boolean): void {
  const colors = isBull
    ? ['#ffd700', '#ff4500', '#fff', '#ff69b4', '#00ffff']
    : ['#00ff88', '#fff', '#aaa', '#88f'];
  const count = isBull ? 80 : 40;
  const chars  = isBull ? ['★', '!', '✦', '💥', '🎯', '✨'] : ['●', '○', '·'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = isBull ? 2 + Math.random() * 8 : 1 + Math.random() * 5;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBull ? 4 : 2),
      life: isBull ? 90 : 60,
      maxLife: isBull ? 90 : 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      size:  isBull ? 3 + Math.random() * 6 : 2 + Math.random() * 4,
      char:  Math.random() < 0.3 ? chars[Math.floor(Math.random() * chars.length)] : undefined,
    });
  }
}

export function stepParticles(particles: Particle[]): Particle[] {
  return particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.18, vx: p.vx * 0.97, life: p.life - 1 }))
    .filter(p => p.life > 0);
}

export function launchVelocity(angle: number, power: number): { vx: number; vy: number } {
  const speed = power * 0.28;
  return { vx: Math.cos(angle) * speed, vy: -Math.sin(angle) * speed };
}
