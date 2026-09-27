import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { getUI, subscribeUI, setQuery, openPrompt } from '@/data/uiStore';
export default function SiteHeader(){
  const [open,setOpen]=useState(false);
  const [ui,setUi]=useState(getUI());
  const [theme,setTheme]=useState(()=>localStorage.getItem('sv-theme')||'dark');
  const nav=useNavigate(),loc=useLocation();
  useEffect(()=>subscribeUI(()=>setUi(getUI())),[]);
  useEffect(()=>{document.documentElement.classList.toggle('light',theme==='light');localStorage.setItem('sv-theme',theme)},[theme]);
  const onSearch=v=>{setQuery(v);if(loc.pathname!=='/')nav('/')};
  return <header className="site-header">
    <Link to="/" className="brand" aria-label="Synthetic Vortex home"><span className="brand-mark">✳</span><span>SYNTHETIC<br/>VORTEX<span className="brand-dot">_</span></span></Link>
    <div className="header-search"><Search size={15}/><input value={ui.query} onChange={e=>onSearch(e.target.value)} placeholder="SEARCH ASSETS…" aria-label="Search assets"/></div>
    <div className="header-right">
      <button className="theme-toggle" onClick={()=>setTheme(t=>t==='light'?'dark':'light')} aria-label="Toggle light or dark theme" title="Toggle theme">{theme==='light'?<Moon size={16}/>:<Sun size={16}/>}</button>
      <button className="name-pill" onClick={openPrompt} title="Change display name"><i/> {ui.name||'SET NAME'}</button>
      <span className="header-signal"><i/> ONLINE</span>
      <button className="menu-trigger" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">INDEX {open?<X size={18}/>:<Menu size={18}/>}</button>
    </div>
    {open&&<nav className="stack-menu"><Link onClick={()=>setOpen(false)} to="/">01 / ALL ASSETS <ArrowUpRight size={18}/></Link><Link onClick={()=>setOpen(false)} to="/#images">02 / STILLS <ArrowUpRight size={18}/></Link><Link onClick={()=>setOpen(false)} to="/#motion">03 / MOTION <ArrowUpRight size={18}/></Link><Link onClick={()=>setOpen(false)} to="/#protocol">04 / PROTOCOL <ArrowUpRight size={18}/></Link></nav>}
  </header>;
}