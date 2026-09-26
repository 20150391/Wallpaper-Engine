import { useEffect, useState } from 'react';
import { getAssets, subscribe, assetBySlug, initStore, startRealtime } from '@/data/assetStore';
import { getUI, subscribeUI, setQuery as setStoreQuery } from '@/data/uiStore';
import { downloadAsset, downloadBatch, duplicateAsset } from '@/lib/media';
import SiteHeader from '@/components/SiteHeader';
import AssetCard from '@/components/AssetCard';
import CommandBar from '@/components/CommandBar';
import UploadZone from '@/components/UploadZone';
import ApiKeyCreator from '@/components/ApiKeyCreator';
import { Image } from '@/components/ui/image';
export default function Home(){
  const [assets,setAssets]=useState(getAssets());
  useEffect(()=>subscribe(()=>setAssets(getAssets())),[]);
  useEffect(()=>{initStore();startRealtime();},[]);
  const [query,setQuery]=useState(getUI().query);
  useEffect(()=>subscribeUI(()=>setQuery(getUI().query)),[]);
  const [filter,setFilter]=useState('ALL'),[selected,setSelected]=useState([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[exports,setExports]=useState(()=>Number(localStorage.getItem('sv-exports')||0)),[active,setActive]=useState(assets[0]);
  const duplicate=a=>perform(()=>duplicateAsset(a),1);
  const add=asset=>setSelected(current=>current.some(a=>a.slug===asset.slug)?current.filter(a=>a.slug!==asset.slug):[...current,asset]);
  const count=n=>{setExports(v=>{localStorage.setItem('sv-exports',String(v+n));return v+n})};
  const perform=async(fn,n)=>{setBusy(true);setMessage('EXPORT IN PROGRESS // preparing media…');try{await fn();count(n);setMessage('EXPORT COMPLETE // check your downloads')}catch(e){setMessage(`EXPORT ERROR // ${e.message}. For images, try the raw link in the asset detail.`)}finally{setBusy(false)}};
  const run=async(input)=>{const text=input.trim();if(!text)return;const [command,...rest]=text.split(/\s+/),slug=rest.join(' ').toLowerCase(),asset=assetBySlug(slug);
    if(command==='/help'){setMessage('COMMANDS // /get [asset-id] · /add [asset-id] · /download · /clear · /search [term]');return}
    if(command==='/clear'){setSelected([]);setMessage('QUEUE CLEARED');return}
    if(command==='/download'){if(!selected.length){setMessage('QUEUE EMPTY // use /add [asset-id] first');return}await perform(()=>downloadBatch(selected),selected.length);return}
    if(command==='/get'||command==='/add'){if(!asset){setMessage(`UNKNOWN ASSET // ${slug||'enter an asset-id such as molten-current'}`);return}if(command==='/add'){setSelected(current=>current.some(a=>a.slug===slug)?current:[...current,asset]);setMessage(`QUEUED // ${slug}`)}else await perform(()=>downloadAsset(asset),1);return}
    const term=(command==='/search'?rest.join(' '):text).toLowerCase();setStoreQuery(term);setMessage(term?`FILTER ACTIVE // ${term}`:'FILTER CLEARED');document.getElementById('images')?.scrollIntoView({behavior:'smooth'});
  };
  useEffect(()=>{if(location.hash)setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView(),100)},[]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{const best=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(best){const next=assetBySlug(best.target.dataset.slug);if(next)setActive(next.type==='image'?next:assets[3])}},{threshold:[0,.25,.5,.75]});document.querySelectorAll('.asset-card').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[filter,query,assets]);
  const visible=assets.filter(a=>{const q=`${a.title} ${a.slug} ${a.family} ${a.postedBy||''}`.toLowerCase().includes(query);if(filter==='FORKS')return !!a.forked&&q;if(filter==='STILLS')return !a.forked&&a.type==='image'&&q;if(filter==='MOTION')return !a.forked&&a.type==='video'&&q;return !a.forked&&q;});
  const stills=assets.filter(a=>a.type==='image').length,motion=assets.filter(a=>a.type==='video').length;
  return <div className="site"><div className="ambient-image" aria-hidden="true"><Image src={active?.image} alt="" className="ambient-media" fittingType="fill"/></div><SiteHeader/><main>
    <section className="intro"><div className="intro-top"><span>VISUAL ASSET REGISTRY / 001—{String(assets.length).padStart(3,'0')}</span><span>INDEPENDENT BACKGROUNDS FOR UNREASONABLE IDEAS</span></div><h1>RAW<br/>DIGITAL<br/><span>ENERGY.</span></h1><div className="intro-bottom"><p>High-impact stills and living backgrounds. Built to be downloaded, embedded, forked, and put to work.</p><span className="mono">SCROLL TO EXPLORE ↓</span></div></section>
    <div className="filter-line" id="images"><div className="filter-label"><b>THE ARCHIVE</b><span> / {String(visible.length).padStart(2,'0')} ASSETS ONLINE</span></div><div className="filters">{['ALL','STILLS','MOTION','FORKS'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)} aria-pressed={filter===f}>{f}</button>)}</div></div>
    <section className="gallery" aria-label="Background gallery"><div className="section-label"><span><b>01 /</b> VISUAL FEED</span><span>HOVER TO INSPECT · SELECT TO QUEUE</span></div>{visible.length?visible.map((asset,i)=><div key={asset.slug} id={asset.type==='video'&&i===visible.findIndex(a=>a.type==='video')?'motion':undefined}><AssetCard asset={asset} index={assets.indexOf(asset)} selected={selected.some(a=>a.slug===asset.slug)} onAdd={add} onDownload={a=>perform(()=>downloadAsset(a),1)} onDuplicate={duplicate} busy={busy}/></div>):<div style={{padding:'90px 20px',textAlign:'center',fontFamily:'monospace',color:'#A1A1AA'}}>NO MATCHES // Try another search. <button style={{color:'#00F0FF',background:'none',border:0}} onClick={()=>setStoreQuery('')}>CLEAR SEARCH</button></div>}</section>
    <section className="protocol" id="protocol"><span className="eyebrow">/ SYSTEM MANUAL</span><h2>BUILT TO<br/>BE USED<span style={{color:'#00F0FF'}}>.</span></h2><div className="protocol-grid"><div><span className="eyebrow">01 / DOWNLOAD</span><h3>Own the pixels.</h3><p>Get a single still or export a six-second WebM motion loop. Queue multiple assets and download one ZIP from the command bar.</p></div><div><span className="eyebrow">02 / EMBED</span><h3>Drop it in.</h3><p>Each visual has a clean, full-viewport iframe route. Open an asset to copy the embed code or the direct image URL.</p></div><div><span className="eyebrow">03 / FORK</span><h3>Branch it.</h3><p>Open any still, pick a style, dial the sliders, and generate a <code>FORK / {`{name}`}</code> variation. AUTO samples the image itself — zero credits, all browser.</p></div></div></section>
    <section className="upload-section" id="upload"><UploadZone/></section>
    <ApiKeyCreator/>
  </main>
  <div className="footer-grid"><div><span>REGISTRY STATUS</span><strong className="cyan">● ONLINE</strong></div><div><span>AVAILABLE ASSETS</span><strong>{String(assets.length).padStart(2,'0')} / LIVE</strong></div><div><span>STILLS / MOTION</span><strong>{String(stills).padStart(2,'0')} / {String(motion).padStart(2,'0')}</strong></div><div><span>YOUR EXPORTS / THIS BROWSER</span><strong>{String(exports).padStart(2,'0')}</strong></div></div>
  <footer className="site-footer"><span>© {new Date().getFullYear()} SYNTHETIC VORTEX / VISUAL UTILITY</span><span>CREATED BY BRADLEY</span><a href="#images">BACK TO ARCHIVE ↑</a></footer>
  <CommandBar selected={selected} busy={busy} message={message} onCommand={run} onClear={()=>{setSelected([]);setMessage('QUEUE CLEARED')}}/>
  </div>;
}