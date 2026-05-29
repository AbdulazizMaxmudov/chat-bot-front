import { useEffect, useRef } from 'react';

export default function VideoAvatar({ avatarState }) {
  const canvasRef = useRef(null);
  const idleRef = useRef(null);
  const speakRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const render = () => {
      const vid = avatarState === 'speaking' ? speakRef.current : idleRef.current;
      if (vid && vid.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) d[i + 3] = 0;
        }
        ctx.putImageData(img, 0, 0);
      }
      frameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [avatarState]);

  return (
    <div className="relative w-full h-full">
      <video ref={idleRef} src="/idle.mp4" autoPlay loop muted playsInline style={{ display: 'none' }} />
      <video ref={speakRef} src="/speaking.mp4" autoPlay loop muted playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={400} height={500} className="w-full h-full" />
    </div>
  );
}
