import { useEffect, useRef, useState } from 'react';
import { clock, effect, frameLoop, init, surface } from 'vgpu';
import shapeWavesShader from '../shaders/shapeWaves.wgsl';
import './ShapeWaves.css';

// A WebGPU background rendered behind the whole app.
// Purely decorative: it never captures clicks, and if WebGPU is unavailable the
// canvas simply stays hidden so the CSS fallback shows through.
export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !('gpu' in navigator)) {
      return undefined;
    }

    let disposed = false;
    let session = null;

    (async () => {
      try {
        const gpu = await init();
        if (disposed) {
          gpu.dispose();
          return;
        }

        const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });

        const waves = effect(gpu, shapeWavesShader, {
          label: 'shape-waves',
          set: { params: { time: 0, aspect: 1, intensity: 0.9, scale: 3.5 } },
        });

        // Keep the wave density even when the window changes shape.
        const unsubscribe = canvasSurface.onResize(({ width, height }) => {
          waves.set({ params: { aspect: height > 0 ? width / height : 1 } });
        });

        const time = clock(gpu);
        const loop = frameLoop(gpu, (frame) => {
          waves.set({ params: { time: time.time } });
          frame.pass(canvasSurface, waves);
        });

        session = {
          stop() {
            loop.stop();
            unsubscribe();
            waves.dispose();
            gpu.dispose();
          },
        };

        if (disposed) {
          session.stop();
          session = null;
          return;
        }

        setReady(true);
      } catch (error) {
        // No adapter, blocked GPU, shader error … just keep the CSS fallback.
        console.error('[AnimatedBackground] WebGPU unavailable:', error);
      }
    })();

    return () => {
      disposed = true;
      if (session) {
        session.stop();
        session = null;
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div data-ready={ready} className="shape-waves">
        <canvas ref={canvasRef} className="shape-waves__canvas" />
      </div>
    </div>
  );
}
