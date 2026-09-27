import { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
export default function OverlayEditor({overlay,setOverlay}){
  const inputRef=useRef(null);
  const onFile=e=>{const f=e.target.files?.[0];if(!f)return;setOverlay({url:URL.createObjectURL(f),x:50,y:50,size:30,rotation:0,opacity:1})};
  if(!overlay?.url) return <div className="overlay-controls">
    <div className="stack-title">OVERLAY STUDIO / DROP AN ITEM IN</div>
    <label className="upload-file"><input ref={inputRef} type="file" accept="image/*" onChange={onFile} aria-label="Upload overlay image"/><span><Upload size={15}/> UPLOAD OVERLAY ITEM</span></label>
    <p className="fork-credit-note">Add a logo, shape, or object — then drag it over the background, resize, rotate, and set opacity.</p>
  </div>;
  return <div className="overlay-controls">
    <div className="stack-title">OVERLAY ITEM / DRAG ON THE PREVIEW</div>
    {[['SIZE',overlay.size,5,100,1,v=>setOverlay(o=>({...o,size:v}))],['ROTATION',overlay.rotation,0,360,1,v=>setOverlay(o=>({...o,rotation:v}))],['OPACITY',overlay.opacity,0,1,0.05,v=>setOverlay(o=>({...o,opacity:v}))]].map(([label,val,min,max,step,setter])=>
      <label className="slider-row" key={label}><span>{label}</span><input type="range" min={min} max={max} step={step} value={val} onChange={e=>setter(Number(e.target.value))}/><span>{step<1?val.toFixed(2):val}</span></label>
    )}
    <button className="outline-button" onClick={()=>{setOverlay(null);if(inputRef.current)inputRef.current.value=''}}><Trash2 size={15}/> REMOVE OVERLAY</button>
  </div>;
}