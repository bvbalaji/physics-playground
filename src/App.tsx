import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { PhysicsParams } from './types';
import CannonCanvas from './components/CannonCanvas';
import ParamPanel   from './components/ParamPanel';

const DEFAULT: PhysicsParams = { gravity: 0.35, windX: 0, bounciness: 0.45, airDrag: 0.99, ballMass: 5, ballRadius: 9 };

const App: FC = () => {
  const [params,   setParams]   = useState<PhysicsParams>(DEFAULT);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0b0c0f', fontFamily: 'Space Mono, monospace', maxWidth: 960, maxHeight: 900, overflow: 'hidden', borderRadius: isMobile ? 0 : 12, boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
      <div style={{ padding: '10px 20px', background: '#0d1018', borderBottom: '2px solid #1e2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <span style={{ fontFamily: 'Black Han Sans, sans-serif', fontSize: isMobile ? 20 : 26, color: '#ffd700', letterSpacing: '0.05em' }}>CANNON LAB</span>
          <span style={{ fontSize: 9, color: '#4a5a6a', marginLeft: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Physics Playground</span>
        </div>
        <div style={{ fontSize: 10, color: '#4a5a6a', textAlign: 'right', lineHeight: 1.8 }}>
          <div>DRAG BARREL → aim</div>
          <div>DRAG BAR → power</div>
          <div>TAP WHEEL → fire</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <CannonCanvas params={params} isMobile={isMobile} />
      </div>
      <ParamPanel params={params} onChange={setParams} isMobile={isMobile} />
    </div>
  );
};

export default App;
