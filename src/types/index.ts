export interface Vec2 { x: number; y: number; }

// ── Scene identifiers ──────────────────────────────────────────
export type SceneId = 'gravity' | 'throw' | 'pendulum' | 'newton' | 'waves';

// ── Stick-figure facial expression ─────────────────────────────
export type Expr = 'norm' | 'shock' | 'happy' | 'scared' | 'dead' | 'strain';

// ── Canvas dimensions (CSS pixels + device pixel ratio) ────────
export interface Dims {
  W:   number;
  H:   number;
  FL:  number;   // floor Y coordinate
  dpr: number;
}

// ── Generic scene hook contract ────────────────────────────────
export interface SceneHandle {
  reset:  () => void;
  onDown: (mx: number, my: number) => void;
  onMove: (mx: number, my: number, dx: number, dy: number) => void;
  onUp:   (mx?: number, my?: number) => void;
  draw:   (ctx: CanvasRenderingContext2D, mx: number, my: number) => void;
}

// ── Per-scene parameter shapes ──────────────────────────────────
export interface GravityParams {
  gravity:    number;
  elasticity: number;
}

export interface ThrowParams {
  gravity:    number;
  elasticity: number;
  ballSize:   number;
}

export interface PendulumParams {
  length:  number;
  gravity: number;
  damping: number;
}

export interface NewtonParams {
  mass:     number;
  friction: number;
  force:    number;
}

export interface WaveParams {
  amplitudeA:  number;
  amplitudeB:  number;
  frequencyA:  number;
  frequencyB:  number;
}

// ── Figure draw props ───────────────────────────────────────────
export interface FigureProps {
  x:        number;
  y:        number;
  face?:    number;
  run?:     number;
  sqY?:     number;
  sqX?:     number;
  armL?:    number;
  armR?:    number;
  expr?:    Expr;
  glow?:    string | null;
  headBob?: number;
}

// ── Thrown ball ─────────────────────────────────────────────────
export interface Ball {
  x:       number;
  y:       number;
  vx:      number;
  vy:      number;
  trail:   Array<{ x: number; y: number }>;
  r:       number;
  bounces: number;
  angle:   number;
}

export interface PhysicsParams {
  gravity:    number;
  windX:      number;
  bounciness: number;
  airDrag:    number;
  ballMass:   number;
  ballRadius: number;
}

export interface CannonState {
  angle: number;
  power: number;
}

export interface Projectile {
  id:      number;
  x:       number;
  y:       number;
  vx:      number;
  vy:      number;
  trail:   Vec2[];
  alive:   boolean;
  hitBull: boolean;
  age:     number;
}

export interface Target {
  x:          number;
  y:          number;
  radius:     number;
  bullRadius: number;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  char?: string;
}

export interface GameStats {
  shots:     number;
  hits:      number;
  bullseyes: number;
  streak:    number;
}
