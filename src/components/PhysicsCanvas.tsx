import React, { forwardRef } from 'react';

interface Props {
  isMobile: boolean;
}

/** The raw <canvas> element. Ref forwarded so App can attach event listeners. */
const PhysicsCanvas = forwardRef<HTMLCanvasElement, Props>(({ isMobile }, ref) => (
  <canvas
    ref={ref}
    style={{
      display: 'block',
      width: '100%',
      touchAction: 'none',
      cursor: isMobile ? 'default' : 'none',
      flexShrink: 0,
    }}
  />
));

PhysicsCanvas.displayName = 'PhysicsCanvas';
export default PhysicsCanvas;
