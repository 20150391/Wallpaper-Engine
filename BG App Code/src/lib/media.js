import { markDownloaded } from '@/data/downloads';
const palettes = {
  plasma: { base:'#18104a', blobs:['125,62,255','31,114,255','196,49,245'], spark:'165,159,255' },
  molten: { base:'#391006', blobs:['255,86,20','255,154,35','110,55,230'], spark:'255,177,100' },
  ember:  { base:'#2a0a04', blobs:['255,60,10','255,140,30','200,30,80'], spark:'255,120,80' },
  prism:  { base:'#041a2a', blobs:['0,200,255','120,80,255','40,255,200'], spark:'150,220,255' },
  chrome: { base:'#0a0a12', blobs:['180,190,210','90,110,140','220,220,240'], spark:'200,210,230' },
  aurora: { base:'#04120a', blobs:['20,255,140','0,180,255','180,60,255'], spark:'120,255,200' },
  abyss:  { base:'#080418', blobs:['40,0,80','0,40,120','80,0,160'], spark:'120,60,200' },
};
export function drawLoop(canvas, time, kind) {
  const c = canvas.getContext('2d'); if (!c) return;
  const w = canvas.width, h = canvas.height, t = time / 1000;
  const p = palettes[kind] || palettes.plasma;
  c.fillStyle = '#050509'; c.fillRect(0,0,w,h);
  const base = c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.75);
  base.addColorStop(0, p.base); base.addColorStop(.65,'#080912'); base.addColorStop(1,'#030304'); c.fillStyle=base;c.fillRect(0,0,w,h);
  c.globalCompositeOperation='screen';
  for(let j=0;j<7;j++) {
    const x=w*(.5+.24*Math.sin(t*(.17+j*.025)+j*1.8)), y=h*(.5+.25*Math.cos(t*(.13+j*.03)+j*2.1));
    const r=w*(.16+.055*Math.sin(t*.45+j));
    const g=c.createRadialGradient(x,y,0,x,y,r);
    const col=p.blobs[j%3];
    g.addColorStop(0,`rgba(${col},.66)`);g.addColorStop(.32,`rgba(${col},.27)`);g.addColorStop(1,`rgba(${col},0)`);
    c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  }
  for(let j=0;j<34;j++) {
    const x=w*(.5+.43*Math.sin(j*19.17+t*(.12+j%5*.025)));
    const y=h*(.5+.43*Math.cos(j*12.7+t*(.18+j%4*.02)));
    c.fillStyle=`rgba(${p.spark},.58)`;
    c.beginPath();c.arc(x,y,1+(j%4),0,Math.PI*2);c.fill();
  }
  c.globalCompositeOperation='source-over';
  const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'rgba(0,0,0,.22)');shade.addColorStop(.5,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.42)');c.fillStyle=shade;c.fillRect(0,0,w,h);
}
export function saveBlob(blob, name) { const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000); }
export async function imageBlob(asset) { const res=await fetch(asset.image);if(!res.ok)throw new Error('The image could not be fetched.');return res.blob(); }
export async function recordLoop(asset) {
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('Video export needs a browser with MediaRecorder support.');
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
  const stream=canvas.captureStream(30);const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime){stream.getTracks().forEach(x=>x.stop());throw new Error('This browser cannot export WebM video.');}
  const chunks=[];const recorder=new MediaRecorder(stream,{mimeType:mime});
  return new Promise((resolve,reject)=>{let raf;let start;
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onerror=e=>{cancelAnimationFrame(raf);stream.getTracks().forEach(x=>x.stop());reject(new Error('Video recording failed.'))};
    recorder.onstop=()=>{cancelAnimationFrame(raf);stream.getTracks().forEach(x=>x.stop());resolve(new Blob(chunks,{type:'video/webm'}))};
    const frame=now=>{if(start===undefined)start=now;drawLoop(canvas,now-start,asset.kind);if(now-start<6000)raf=requestAnimationFrame(frame);else recorder.stop()};
    drawLoop(canvas,0,asset.kind);recorder.start();raf=requestAnimationFrame(frame);
  });
}
export async function downloadAsset(asset) {const blob=asset.type==='video'?await recordLoop(asset):await imageBlob(asset);const extension=asset.type==='video'?'webm':(blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png');saveBlob(blob,`${asset.slug}.${extension}`);markDownloaded(asset.slug);}
export async function duplicateAsset(asset) {const blob=asset.type==='video'?await recordLoop(asset):await imageBlob(asset);const extension=asset.type==='video'?'webm':(blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png');saveBlob(blob,`${asset.slug}-copy.${extension}`);markDownloaded(asset.slug);}
const table=(()=>{let a=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;a[n]=c>>>0}return a})();
function crc(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function u16(v){return [v&255,(v>>>8)&255]} function u32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
export function makeZip(files){const enc=new TextEncoder(),parts=[],central=[];let offset=0;for(const file of files){const name=enc.encode(file.name),data=file.data,hash=crc(data);const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(hash),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);parts.push(local,data);central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(hash),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]));offset+=local.length+data.length}const centralSize=central.reduce((n,p)=>n+p.length,0);return new Blob([...parts,...central,new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralSize),...u32(offset),...u16(0)])],{type:'application/zip'})}
export async function downloadBatch(assets){const files=[];for(const asset of assets){const blob=asset.type==='video'?await recordLoop(asset):await imageBlob(asset);files.push({name:`${asset.slug}.${asset.type==='video'?'webm':blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png'}`,data:new Uint8Array(await blob.arrayBuffer())});markDownloaded(asset.slug)}saveBlob(makeZip(files),'synthetic-vortex.zip')}