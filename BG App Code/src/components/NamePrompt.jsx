import { useState, useEffect } from 'react';
import { getUI, subscribeUI, setName, closePrompt } from '@/data/uiStore';
export default function NamePrompt(){
  const [open,setOpen]=useState(getUI().promptOpen);
  const [val,setVal]=useState(getUI().name);
  useEffect(()=>subscribeUI(()=>setOpen(getUI().promptOpen)),[]);
  if(!open) return null;
  const submit=e=>{e.preventDefault();const n=val.trim();if(!n)return;setName(n);closePrompt()};
  return <div className="name-prompt" role="dialog" aria-modal="true"><form onSubmit={submit}>
    <span className="eyebrow">/ IDENTIFY</span>
    <h2>ENTER A DISPLAY NAME</h2>
    <p>Saved in your browser only. You can change it anytime from the top bar.</p>
    <input value={val} onChange={e=>setVal(e.target.value)} placeholder="e.g. NEON_ARCHITECT" autoFocus aria-label="Display name"/>
    <button type="submit" disabled={!val.trim()}>CONTINUE →</button>
  </form></div>;
}