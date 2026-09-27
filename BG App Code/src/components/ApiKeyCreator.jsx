import { useState } from 'react';
import { STYLE_LIST, proceduralDataUrl, proceduralComboDataUrl, pickStyles } from '@/lib/procedural';
import { getAssets } from '@/data/assetStore';
import { getUI } from '@/data/uiStore';
import { saveBlob } from '@/lib/media';
import { base44 } from '@/api/base44Client';
import { Copy, Key, Download, Wand, Sparkles } from 'lucide-react';

const STORE_KEY = 'sv-apikey';
const genKey = () => 'sv_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const bestMatch = (assets, q) => {
  if (!q) return null;
  const scored = assets.map(a => {
    const text = `${a.title} ${a.family} ${a.description}`.toLowerCase();
    let s = 0; q.split(/\s+/).forEach(w => { if (w && text.includes(w)) s++; });
    return { a, s };
  }).filter(x => x.s > 0).sort((x, y) => y.s - x.s);
  return scored[0]?.a || null;
};
const OPTS = { chaos: 55, hue: 50, velocity: 55, density: 55, scale: 50, smoothness: 55, grain: 15 };

export default function ApiKeyCreator() {
  const [key, setKey] = useState(() => localStorage.getItem(STORE_KEY) || '');
  const [mode, setMode] = useState('edit');
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');

  const create = async () => {
    const k = genKey();
    try { await base44.entities.ApiKey.create({ key: k, label: getUI().name || 'web' }); } catch (e) {}
    localStorage.setItem(STORE_KEY, k); setKey(k); setMsg('KEY GENERATED + STORED // copy the endpoint below');
  };
  const copy = (text, label) => { navigator.clipboard?.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); };
  const validate = async () => { if (!key) return false; try { const f = await base44.entities.ApiKey.filter({ key }); return f.length > 0; } catch (e) { return false; } };

  const run = async () => {
    setBusy(true); setMsg(''); setPreview(''); setMatch(null);
    const valid = await validate();
    if (!valid) { setMsg('INVALID KEY — regenerate to continue'); setBusy(false); return; }
    try {
      if (mode === 'edit') {
        const url = input.trim();
        if (!url) { setMsg('PASTE AN IMAGE URL FIRST'); return; }
        const style = STYLE_LIST[(url.length + (key || '').length) % STYLE_LIST.length];
        const dataUrl = await proceduralDataUrl({ ...OPTS, style, seed: url.length + (key || '').length }, url);
        setPreview(dataUrl); setMsg(`EDITED // auto style = ${style.toUpperCase()}`);
      } else {
        const q = input.trim().toLowerCase();
        if (!q) { setMsg('TYPE A PROMPT FIRST'); return; }
        const best = bestMatch(getAssets().filter(a => a.type === 'image'), q);
        if (!best) { setMsg('NO MATCH IN REGISTRY'); return; }
        const styles = pickStyles(q.length + (key || '').length);
        const dataUrl = await proceduralComboDataUrl(styles, { ...OPTS, seed: q.length + (key || '').length }, best.image);
        setPreview(dataUrl); setMatch(best); setMsg(`CREATED // from ${best.slug} // ${styles.map(s => s.toUpperCase()).join(' + ')}`);
      }
    } catch (e) { setMsg(`ERROR // ${e.message}`); }
    finally { setBusy(false); }
  };

  const downloadResult = async () => {
    if (!preview) return;
    const blob = await (await fetch(preview)).blob();
    saveBlob(blob, mode === 'edit' ? 'api-edit.png' : `create-${match?.slug || 'image'}.png`);
  };

  const editUrl = `${ORIGIN}/api?key=${key}&mode=edit&img=IMAGE_URL`;
  const createUrl = `${ORIGIN}/api?key=${key}&mode=create&q=PROMPT`;
  const activeUrl = mode === 'edit' ? editUrl : createUrl;
  const snippet = mode === 'edit' ? `curl "${editUrl}" -o edited.png` : `curl "${createUrl}" -o created.png`;
  const placeholder = mode === 'edit' ? 'PASTE IMAGE URL' : 'TYPE A PROMPT (e.g. molten blue fluid)';
  const action = mode === 'edit' ? <><Wand size={16} />{busy ? 'EDITING…' : 'EDIT IMAGE'}</> : <><Sparkles size={16} />{busy ? 'CREATING…' : 'CREATE IMAGE'}</>;

  return <section className="api-section" id="api">
    <span className="eyebrow">/ API KEY CREATOR</span>
    <h3>EDIT BY API.<br/>SHIP BY URL.</h3>
    <p>Generate a key, copy the endpoint, and drop it into any project. The edit engine auto-picks one of 10 procedural styles based on your image. The create engine reads a prompt, pulls a matching still from the registry, and forks it with one style or a combo of two.</p>
    <div className="api-row">
      <button onClick={create} className="primary-button"><Key size={17} />{key ? 'REGENERATE KEY' : 'GENERATE KEY'}</button>
      {key && <div className="api-keybox"><span className="muted">KEY //</span><code>{key}</code><button className="api-copy" onClick={() => copy(key, 'key')}><Copy size={14} />{copied === 'key' ? 'COPIED' : 'COPY'}</button></div>}
    </div>
    {key && <>
      <div className="api-tabs">{['edit', 'create'].map(m => <button key={m} className={mode === m ? 'active' : ''} onClick={() => { setMode(m); setInput(''); setPreview(''); setMatch(null); setMsg(''); }} aria-pressed={mode === m}>{m === 'edit' ? 'EDIT IMAGE' : 'CREATE IMAGE'}</button>)}</div>
      <div className="api-endpoint"><span className="muted">ENDPOINT //</span><code>{activeUrl}</code><button className="api-copy" onClick={() => copy(activeUrl, 'url')}><Copy size={14} />{copied === 'url' ? 'COPIED' : 'COPY'}</button></div>
      <div className="api-snippet"><span className="muted">SNIPPET //</span><pre>{snippet}</pre></div>
      <div className="stack-title" style={{ marginTop: 18 }}>TEST API KEY</div>
      <div className="api-demo">
        <input className="upload-title" value={input} onChange={e => setInput(e.target.value)} placeholder={placeholder} disabled={busy} aria-label={placeholder} />
        <button onClick={run} disabled={busy} className="outline-button">{action}</button>
      </div>
      {msg && <div className="upload-message">{msg}</div>}
      {preview && <div className="api-result"><img src={preview} alt="API result" />{match && <span className="muted">FROM / {match.slug}</span>}<button onClick={downloadResult} className="primary-button"><Download size={16} />DOWNLOAD</button></div>}
    </>}
  </section>;
}