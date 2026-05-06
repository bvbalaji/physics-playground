import React from 'react';
import type { SceneId } from '../types';
import C from '../utils/palette';

interface TabDef { id: SceneId; label: string; shortLabel: string; }

const TABS: TabDef[] = [
  { id: 'gravity',  label: 'Gravity',   shortLabel: 'Grav'  },
  { id: 'throw',    label: 'Throw',     shortLabel: 'Throw' },
  { id: 'pendulum', label: 'Pendulum',  shortLabel: 'Pend'  },
  { id: 'newton',   label: 'Newton',    shortLabel: 'Newt'  },
  { id: 'waves',    label: 'Waves',     shortLabel: 'Wave'  },
];

interface Props {
  active: SceneId;
  isMobile: boolean;
  onSelect: (id: SceneId) => void;
}

const SceneTabs: React.FC<Props> = ({ active, isMobile, onSelect }) => (
  <div style={{ display: 'flex', background: C.panel, borderBottom: `2px solid ${C.border}`, flexShrink: 0 }}>
    {TABS.map(({ id, label, shortLabel }) => {
      const isOn = id === active;
      return (
        <button
          key={id}
          onClick={() => onSelect(id)}
          style={{
            flex: 1,
            height: isMobile ? 44 : 38,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'monospace',
            fontSize: isMobile ? 10 : 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.05em',
            transition: 'all .15s',
            background: isOn ? C.pink : 'transparent',
            color: isOn ? C.bg : C.muted,
            borderBottom: isOn ? `3px solid ${C.yellow}` : '3px solid transparent',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isMobile ? shortLabel : label}
        </button>
      );
    })}
  </div>
);

export default SceneTabs;
