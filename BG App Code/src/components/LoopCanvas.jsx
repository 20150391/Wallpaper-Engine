import { useEffect, useRef } from 'react';
import { drawLoop } from '@/lib/media';
export default function LoopCanvas({kind,className=''}) {
  const ref=useRef(null);
  useEffect(()=>{let frame;const canvas=ref.current;const start=performance.now();const render=now=>{drawLoop(canvas,now-start,kind);frame=requestAnimationFrame(render)};frame=requestAnimationFrame(render);return()=>cancelAnimationFrame(frame)},[kind]);
  return <canvas ref={ref} width={960} height={540} className={className} aria-label={`${kind} animated background preview`} role="img" />;
}