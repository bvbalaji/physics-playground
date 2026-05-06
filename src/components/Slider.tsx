import React from 'react';
import C from '../utils/palette';

interface Props {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  color: string;
  onChange: (v: number) => void;
}

const Slider: React.FC<Props> = ({ label, unit, min, max, step, value, color, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: C.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'monospace', minWidth: 48, textAlign: 'right' }}>
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 6, touchAction: 'none' }}
    />
  </div>
);

export default Slider;
