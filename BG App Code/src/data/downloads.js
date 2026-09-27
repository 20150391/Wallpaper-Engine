let slugs=[];
try{slugs=JSON.parse(localStorage.getItem('sv-downloads')||'[]')}catch(e){}
const listeners=new Set();
const emit=()=>listeners.forEach(cb=>cb());
export const getDownloads=()=>slugs;
export const isDownloaded=slug=>slugs.includes(slug);
export const markDownloaded=slug=>{if(!slugs.includes(slug)){slugs=[...slugs,slug];try{localStorage.setItem('sv-downloads',JSON.stringify(slugs))}catch(e){}emit()}};
export const removeDownload=slug=>{slugs=slugs.filter(s=>s!==slug);try{localStorage.setItem('sv-downloads',JSON.stringify(slugs))}catch(e){}emit()};
export const subscribeDownloads=cb=>{listeners.add(cb);return()=>listeners.delete(cb)};