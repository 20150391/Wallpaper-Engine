function rng(seed){let s=(seed*9301+49297)%233280;return()=>{s=(s*9301+49297)%233280;return s/233280}}
export function loadImage(url){return new Promise((res,rej)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>res(img);img.onerror=rej;img.src=url})}
function base(ctx,w,h,opts){
  const baseHue=Math.floor((opts.hue/100)*360);
  const col=(off,l,a=1)=>`hsla(${(off+baseHue)%360},100%,${l}%,${a})`;
  ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
  const g=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.85);
  g.addColorStop(0,col(0,12,1));g.addColorStop(.6,'#08080c');g.addColorStop(1,'#030304');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  return {rand:rng(opts.seed||1),col,baseHue};
}
function vignette(ctx,w,h){ctx.globalCompositeOperation='source-over';const v=ctx.createLinearGradient(0,0,0,h);v.addColorStop(0,'rgba(0,0,0,.45)');v.addColorStop(.5,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h)}
function grain(ctx,w,h,amt,rand){if(amt<=0)return;ctx.globalCompositeOperation='source-over';const n=Math.floor(amt*1500);for(let i=0;i<n;i++){ctx.fillStyle=`rgba(255,255,255,${rand()*0.05})`;ctx.fillRect(rand()*w,rand()*h,1,1)}}
function blobs(ctx,w,h,opts,rand,col){ctx.globalCompositeOperation='screen';const n=8+Math.floor(opts.chaos*0.5+opts.density*0.3);const sc=opts.scale/100;for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=(0.06+rand()*0.28)*w*(0.5+sc*0.6);const g=ctx.createRadialGradient(x,y,0,x,y,r);const off=[20,200,320,160,60][i%5];g.addColorStop(0,col(off,55,0.7));g.addColorStop(.35,col(off,50,0.3));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}}
function streaks(ctx,w,h,opts,rand,col){ctx.globalCompositeOperation='screen';const n=Math.floor(opts.velocity*1.4+opts.density*0.8+opts.chaos*0.6);ctx.lineWidth=1+opts.velocity/25;for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,len=(0.04+rand()*0.34)*w*(0.4+opts.velocity/80);const a=rand()*Math.PI*2;const off=[20,200,320,60][i%4];ctx.strokeStyle=col(off,60,0.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke()}}
function dots(ctx,w,h,opts,rand,col){ctx.globalCompositeOperation='screen';const n=40+Math.floor(opts.density*2+opts.chaos*1.5);for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=0.5+rand()*(2+opts.chaos/40);ctx.fillStyle=col([20,200,320,60][i%4],70,0.7);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}}

function drawAuto(canvas,opts,img){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  if(!img){drawBlobs(canvas,opts);return}
  const rand=rng(opts.seed||1),baseHue=Math.floor((opts.hue/100)*360);
  const col=(off,l,a=1)=>`hsla(${(off+baseHue)%360},100%,${l}%,${a})`;
  const ir=img.width/img.height,cr=w/h;let dw,dh,dx,dy;
  if(ir>cr){dh=h;dw=h*ir;dx=(w-dw)/2;dy=0}else{dw=w;dh=w/ir;dx=0;dy=(h-dh)/2}
  ctx.drawImage(img,dx,dy,dw,dh);
  ctx.globalCompositeOperation='soft-light';ctx.fillStyle=col(0,50,0.5);ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
  const stamps=3+Math.floor(opts.density*0.2+opts.chaos*0.18);
  for(let i=0;i<stamps;i++){
    const sw=img.width*(0.15+rand()*0.3),sh=img.height*(0.15+rand()*0.3);
    const sx=rand()*(img.width-sw),sy=rand()*(img.height-sh);
    const sc=0.4+rand()*(opts.scale/50)*1.4,rot=rand()*Math.PI*2;
    ctx.save();ctx.globalAlpha=0.4+rand()*0.4;ctx.translate(rand()*w,rand()*h);ctx.rotate(rot);ctx.scale(sc,sc);
    ctx.drawImage(img,sx,sy,sw,sh,-sw/2,-sh/2,sw,sh);ctx.restore();
  }
  const rb=4+Math.floor(opts.smoothness*0.14+opts.chaos*0.08);
  ctx.globalCompositeOperation='screen';
  for(let i=0;i<rb;i++){const x=rand()*w,y=rand()*h,r=(0.06+rand()*0.18)*w*(0.5+opts.scale/200);const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col(rand()*360,60,0.6));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h);
}
function drawLines(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);blobs(ctx,w,h,opts,rand,col);streaks(ctx,w,h,opts,rand,col);dots(ctx,w,h,opts,rand,col);ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawBlobs(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const n=6+Math.floor(opts.smoothness*0.2+opts.density*0.2+opts.chaos*0.1);const sc=opts.scale/100;for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=(0.08+rand()*0.25)*w*(0.5+sc*0.7);const g=ctx.createRadialGradient(x,y,0,x,y,r);const off=[20,200,320,160,60,300][i%6];g.addColorStop(0,col(off,58,0.75));g.addColorStop(.4,col(off,52,0.35));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}dots(ctx,w,h,opts,rand,col);ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawOrbits(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const rings=4+Math.floor(opts.density*0.12+opts.chaos*0.1);for(let i=0;i<rings;i++){const cx=rand()*w,cy=rand()*h,maxR=w*(0.2+opts.scale/200);const arcs=3+Math.floor(opts.chaos/15);for(let j=0;j<arcs;j++){const r=maxR*(0.2+(j/arcs)*0.8);ctx.strokeStyle=col([20,200,320,160][j%4],60,0.5);ctx.lineWidth=1+opts.velocity/40;ctx.beginPath();const start=rand()*Math.PI*2,end=start+Math.PI*(0.4+rand()*1.2);ctx.arc(cx,cy,r,start,end);ctx.stroke()}}dots(ctx,w,h,opts,rand,col);ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawShards(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const n=8+Math.floor(opts.chaos*0.4+opts.density*0.2);const sc=opts.scale/100;for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,sz=(0.05+rand()*0.2)*w*(0.5+sc*0.8);const a=rand()*Math.PI*2;ctx.fillStyle=col([20,200,320,160,60][i%5],55,0.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*sz,y+Math.sin(a)*sz);ctx.lineTo(x+Math.cos(a+2.094)*sz,y+Math.sin(a+2.094)*sz);ctx.closePath();ctx.fill()}streaks(ctx,w,h,opts,rand,col);ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawWeave(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const step=Math.max(20,80-opts.density*0.6);ctx.lineWidth=1+opts.velocity/40;for(let y=0;y<h;y+=step){ctx.strokeStyle=col(20,55,0.4);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+(rand()-0.5)*opts.velocity);ctx.stroke()}for(let x=0;x<w;x+=step){ctx.strokeStyle=col(200,55,0.4);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(rand()-0.5)*opts.velocity,h);ctx.stroke()}dots(ctx,w,h,opts,rand,col);ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawSparks(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const n=80+Math.floor(opts.density*4+opts.chaos*3);for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=0.4+rand()*(1.5+opts.scale/50);ctx.fillStyle=col([20,200,320,60][i%4],75,0.8);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(i%4===0){const len=(0.02+rand()*0.1)*w*(opts.velocity/50);const a=rand()*Math.PI*2;ctx.strokeStyle=col(20,70,0.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke()}}ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawMist(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const n=3+Math.floor(opts.smoothness*0.06+opts.density*0.04);const sc=opts.scale/100;for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=(0.3+rand()*0.4)*w*(0.6+sc*0.5);const g=ctx.createRadialGradient(x,y,0,x,y,r);const off=[20,200,320,160][i%4];g.addColorStop(0,col(off,50,0.5));g.addColorStop(.5,col(off,45,0.2));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawCells(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const step=Math.max(18,70-opts.density*0.5-opts.smoothness*0.2);const rad=step*(0.3+opts.scale/300);for(let y=0;y<h+step;y+=step){for(let x=0;x<w+step;x+=step){const ox=x+(rand()-0.5)*step*0.3,oy=y+(rand()-0.5)*step*0.3;const g=ctx.createRadialGradient(ox,oy,0,ox,oy,rad);const off=[(x*0.1)%360,(y*0.1)%360,((x+y)*0.05)%360][Math.floor(rand()*3)];g.addColorStop(0,col(off,55,0.5));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(ox,oy,rad,0,Math.PI*2);ctx.fill()}}ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
function drawRipple(canvas,opts){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const {rand,col}=base(ctx,w,h,opts);ctx.globalCompositeOperation='screen';const centers=2+Math.floor(opts.density*0.06+opts.chaos*0.04);const rings=6+Math.floor(opts.chaos*0.15);for(let c=0;c<centers;c++){const cx=rand()*w,cy=rand()*h;for(let j=0;j<rings;j++){const r=(j/rings)*w*(0.3+opts.scale/200);ctx.strokeStyle=col([20,200,320,160][c%4],60,0.4);ctx.lineWidth=1+opts.velocity/50;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}}ctx.globalCompositeOperation='source-over';grain(ctx,w,h,opts.grain,rand);vignette(ctx,w,h)}
const styles={auto:drawAuto,lines:drawLines,blobs:drawBlobs,orbits:drawOrbits,shards:drawShards,weave:drawWeave,sparks:drawSparks,mist:drawMist,cells:drawCells,ripple:drawRipple};
export const STYLE_LIST=['auto','lines','blobs','orbits','shards','weave','sparks','mist','cells','ripple'];
export function drawProcedural(canvas,opts,sourceImg){(styles[opts.style||'auto']||drawLines)(canvas,opts,sourceImg)}
export async function proceduralDataUrl(opts,sourceUrl){
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
  let img=null;
  if((opts.style||'auto')==='auto'&&sourceUrl){try{img=await loadImage(sourceUrl)}catch(e){img=null}}
  drawProcedural(canvas,opts,img);
  return canvas.toDataURL('image/png');
}
export function pickStyles(seed){const n=((seed%2)===0)?1:2;const pool=[...STYLE_LIST];const out=[];let s=seed||1;while(out.length<n&&pool.length){s=(s*9301+49297)%233280;const idx=Math.floor((s/233280)*pool.length);out.push(pool.splice(idx,1)[0]);}return out;}
export async function proceduralComboDataUrl(styles,opts,sourceUrl){const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;let img=null;if(sourceUrl){try{img=await loadImage(sourceUrl)}catch(e){img=null}}drawProcedural(canvas,{...opts,style:styles[0]||'auto'},img);if(styles.length>1){const c2=document.createElement('canvas');c2.width=1280;c2.height=720;drawProcedural(c2,{...opts,style:styles[1]},img);const ctx=canvas.getContext('2d');ctx.globalAlpha=0.5;ctx.globalCompositeOperation='screen';ctx.drawImage(c2,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}return canvas.toDataURL('image/png')}