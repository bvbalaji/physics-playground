import { useEffect, type RefObject } from 'react';

export interface CanvasDims { W: number; H: number; dpr: number; }

export function useResize(cvRef: RefObject<HTMLCanvasElement | null>, onResize: (d: CanvasDims) => void): void {
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    function resize() {
      const dpr  = window.devicePixelRatio || 1;
      const rect = cv!.getBoundingClientRect();
      cv!.width  = rect.width  * dpr;
      cv!.height = rect.height * dpr;
      cv!.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResize({ W: rect.width, H: rect.height, dpr });
    }
    const ro = new ResizeObserver(resize);
    ro.observe(cv); resize();
    return () => ro.disconnect();
  }, [cvRef, onResize]);
}
