import { useState } from 'react';
import type { FC } from 'react';
import type { PhysicsParams } from '../types';

interface SliderRowProps {
  label: string; unit: string; hint: string;
  min: number; max: number; step: number;
  value: number; color: string;
  onChange: (v: number) => void;
}

const SliderRow: FC<SliderRowProps> = ({ label, unit, hint, min, max, step, value, color, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: '#7a8a9a', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'Space Mono, monospace' }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: color, height: 5, cursor: 'pointer', touchAction: 'none' }} />
    <span style={{ fontSize: 9, color: '#4a5560', fontFamily: 'Space Mono, monospace' }}>{hint}</span>
  </div>
);

interface Props { params: PhysicsParams; onChange: (p: PhysicsParams) => void; isMobile: boolean; }

const ParamPanel: FC<Props> = ({ params, onChange, isMobile }) => {
  const [open, setOpen] = useState(!isMobile);
  const set = (k: keyof PhysicsParams, v: number) => onChange({ ...params, [k]: v });

  const sliders: SliderRowProps[] = [
    { label: 'Gravity',    unit: '',    hint: 'Downward pull per frame',            min: 0.1,  max: 1.5, step: 0.05, value: params.gravity,    color: '#e94560', onChange: v => set('gravity',    v) },
    { label: 'Wind',       unit: '',    hint: 'Horizontal drift (neg = left)',       min: -0.5, max: 0.5, step: 0.01, value: params.windX,      color: '#00d4ff', onChange: v => set('windX',      v) },
    { label: 'Bounciness', unit: '',    hint: 'Energy kept on bounce (0–1)',         min: 0,    max: 1,   step: 0.05, value: params.bounciness, color: '#00ff88', onChange: v => set('bounciness', v) },
    { label: 'Air Drag',   unit: '',    hint: 'Speed multiplier per frame (1=none)', min: 0.9,  max: 1,   step: 0.002,value: params.airDrag,    color: '#ffd700', onChange: v => set('airDrag',    v) },
    { label: 'Ball Mass',  unit: ' kg', hint: 'Affects momentum display',           min: 1,    max: 20,  step: 0.5,  value: params.ballMass,   color: '#ff6b35', onChange: v => set('ballMass',   v) },
    { label: 'Ball Size',  unit: ' px', hint: 'Radius — also affects hitbox',       min: 4,    max: 24,  step: 1,    value: params.ballRadius, color: '#c084fc', onChange: v => set('ballRadius', v) },
  ];

  return (
    <div style={{ background: '#0d1018', borderTop: '2px solid #1e2535', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', height: 38, background: 'transparent', border: 'none', color: '#ffd700', fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderBottom: open ? '1px solid #1e2535' : 'none' }}>
        <span style={{ fontSize: 14 }}>{open ? '▲' : '▼'}</span>
        Physics Parameters
        <span style={{ fontSize: 9, color: '#4a5a6a' }}>— tune everything</span>
      </button>
      {open && (
        <div style={{ padding: '14px 16px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px 24px' }}>
          {sliders.map(s => <SliderRow key={s.label} {...s} />)}
        </div>
      )}
    </div>
  );
};

export default ParamPanel;
