export default function OverlayLayer({overlay,setOverlay}){
  if(!overlay?.url) return null;
  const start=e=>{
    e.preventDefault();const el=e.currentTarget;el.setPointerCapture(e.pointerId);
    const r=el.parentElement.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width*100, py=(e.clientY-r.top)/r.height*100;
    const dx=overlay.x-px, dy=overlay.y-py;
    el.onpointermove=ev=>{const rr=el.parentElement.getBoundingClientRect();setOverlay(o=>o&&({...o,x:Math.max(0,Math.min(100,(ev.clientX-rr.left)/rr.width*100+dx)),y:Math.max(0,Math.min(100,(ev.clientY-rr.top)/rr.height*100+dy))}))};
    el.onpointerup=()=>{el.onpointermove=null;el.onpointerup=null};
  };
  return <img src={overlay.url} className="overlay-item" alt="overlay" draggable={false} style={{left:`${overlay.x}%`,top:`${overlay.y}%`,width:`${overlay.size}%`,transform:`translate(-50%,-50%) rotate(${overlay.rotation}deg)`,opacity:overlay.opacity}} onPointerDown={start}/>;
}