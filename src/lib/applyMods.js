// Mod hook: any URL query param starting with "--" is applied as a CSS custom
// property on the root element, so external mod pages (e.g. on GitHub) can
// restyle the site by linking here with overrides. Unknown params are ignored.
export function applyMods(){
  try{
    const params=new URLSearchParams(window.location.search);
    for(const [key,value] of params){
      if(key.startsWith('--')) document.documentElement.style.setProperty(key,decodeURIComponent(value.replace(/\+/g,' ')));
    }
  }catch(e){}
}