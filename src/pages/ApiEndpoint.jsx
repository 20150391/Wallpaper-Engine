import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAssets, initStore } from '@/data/assetStore';
import { drawProcedural, proceduralComboDataUrl, STYLE_LIST, pickStyles, loadImage } from '@/lib/procedural';
import { saveBlob } from '@/lib/media';
import { base44 } from '@/api/base44Client';

const OPTS = { chaos: 55, hue: 50, velocity: 55, density: 55, scale: 50, smoothness: 55, grain: 15 };
const bestMatch = (assets, q) => {
  if (!q) return null;
  const scored = assets.map(a => {
    const text = `${a.title} ${a.family} ${a.description}`.toLowerCase();
    let s = 0; q.split(/\s+/).forEach(w => { if (w && text.includes(w)) s++; });
    return { a, s };
  }).filter(x => x.s > 0).sort((x, y) => y.s - x.s);
  return scored[0]?.a || null;
};

export default function ApiEndpoint() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('PROCESSING');
  const qs = params.toString();

  useEffect(() => {
    let live = true;
    (async () => {
      const key = params.get('key') || '';
      const mode = params.get('mode') || 'edit';
      if (!key) { if (live) setStatus('NO KEY / use ?key=...'); return; }
      let valid = false;
      try { const found = await base44.entities.ApiKey.filter({ key }); valid = found.length > 0; } catch (e) { valid = false; }
      if (!valid) { if (live) setStatus('INVALID KEY'); return; }
      try {
        if (mode === 'create') {
          await initStore();
          const q = (params.get('q') || '').toLowerCase().trim();
          if (!q) { if (live) setStatus('NO PROMPT / use ?q=prompt'); return; }
          const best = bestMatch(getAssets().filter(a => a.type === 'image'), q);
          if (!best) { if (live) setStatus('NO MATCH IN REGISTRY'); return; }
          const styles = pickStyles(q.length + key.length);
          const dataUrl = await proceduralComboDataUrl(styles, { ...OPTS, seed: q.length + key.length }, best.image);
          const blob = await (await fetch(dataUrl)).blob();
          saveBlob(blob, `create-${best.slug}.png`);
          if (live) setStatus(`CREATED / ${best.slug} // ${styles.join('+')} // downloaded`);
        } else {
          const img = (params.get('img') || '').trim();
          if (!img) { if (live) setStatus('NO IMAGE / use ?img=url'); return; }
          const style = STYLE_LIST[(img.length + key.length) % STYLE_LIST.length];
          const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
          let sourceImg = null;
          try { sourceImg = await loadImage(img); } catch (e) { sourceImg = null; }
          drawProcedural(canvas, { ...OPTS, style, seed: img.length + key.length }, sourceImg);
          canvas.toBlob(b => { saveBlob(b, `edited-${style}.png`); if (live) setStatus(`EDITED / style=${style} // downloaded`); }, 'image/png');
        }
      } catch (e) { if (live) setStatus(`ERROR / ${e.message}`); }
    })();
    return () => { live = false; };
  }, [qs]);

  return <div className="embed-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 40, fontFamily: 'var(--font-mono)' }}>
    <div className="eyebrow">/ API ENDPOINT</div>
    <div style={{ fontSize: 24, letterSpacing: '-.04em', fontWeight: 800 }}>{status}</div>
    <div className="muted" style={{ fontSize: 12 }}>You can close this tab.</div>
  </div>;
}