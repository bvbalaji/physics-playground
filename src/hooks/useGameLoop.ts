import { useEffect, useRef } from 'react';

export function useGameLoop(tick: () => void): void {
  const ref = useRef(tick);
  ref.current = tick;
  useEffect(() => {
    let id = 0;
    const loop = () => { ref.current(); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}
