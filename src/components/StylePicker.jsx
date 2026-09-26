import { useEffect, useRef } from 'react';
import { drawProcedural, STYLE_LIST } from '@/lib/procedural';
export default function StylePicker({value,onChange,sourceImg}){
  return <div className="style-grid" role="radiogroup" aria-label="Fork style">{STYLE_LIST.map(s=><Thumb key={s} style={s} active={value===s} onClick={()=>onChange(s)} sourceImg={sourceImg}/>)}</div>;
}
function Thumb({style,active,onClick,sourceImg}){
  const ref=useRef(null);
  useEffect(()=>{const c=ref.current;if(!c)return;c.width=120;c.height=68;drawProcedural(c,{style,chaos:55,hue:50,velocity:55,density:55,scale:50,smoothness:55,grain:15,seed:style.length*7},sourceImg);},[style,sourceImg]);
  return <button type="button" onClick={onClick} className={active?'style-thumb active':'style-thumb'} aria-pressed={active} role="radio" aria-checked={active}>
    <canvas ref={ref}/><span>{style.toUpperCase()}</span>
    {style==='auto'&&<em className="style-auto-tag">samples image</em>}
  </button>;
}