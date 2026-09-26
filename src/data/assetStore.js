import { assets as seed } from './assets';
import { base44 } from '@/api/base44Client';

let items = [...seed];
const listeners = new Set();
const emit = () => listeners.forEach(cb => cb());

const fromDB = (r) => ({
  slug: r.slug,
  title: r.title,
  type: r.type,
  family: r.family,
  color: r.color,
  image: r.image,
  description: r.description,
  postedBy: r.posted_by,
  forked: !!r.forked,
  forkOf: r.fork_of,
  id: r.id,
  _db: true
});

export const getAssets = () => items;
export const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
export const assetBySlug = (slug) => items.find(a => a.slug === slug);

let loaded = false;
export const initStore = async () => {
  if (loaded) return;
  loaded = true;
  try {
    const records = await base44.entities.Submission.list('-created_date', 500);
    items = [...records.map(fromDB), ...seed];
    emit();
  } catch (e) { /* keep seed */ }
};

export const fetchBySlug = async (slug) => {
  const existing = items.find(a => a.slug === slug);
  if (existing) return existing;
  try {
    const records = await base44.entities.Submission.filter({ slug }, '-created_date', 1);
    if (records.length) {
      const a = fromDB(records[0]);
      items = [a, ...items.filter(x => x.slug !== slug)];
      emit();
      return a;
    }
  } catch (e) {}
  return null;
};

export const addAsset = async (asset) => {
  try {
    const rec = await base44.entities.Submission.create({
      slug: asset.slug,
      title: asset.title,
      type: asset.type || 'image',
      family: asset.family || '',
      color: asset.color || '#00F0FF',
      image: asset.image,
      description: asset.description || '',
      posted_by: asset.postedBy || 'ANONYMOUS',
      forked: !!asset.forked,
      fork_of: asset.forkOf || ''
    });
    items = [fromDB(rec), ...items.filter(a => a.slug !== asset.slug)];
    emit();
  } catch (e) {
    items = [{ ...asset, _user: true }, ...items.filter(a => a.slug !== asset.slug)];
    emit();
  }
};

let rtStarted = false;
export const startRealtime = () => {
  if (rtStarted) return;
  rtStarted = true;
  try {
    base44.entities.Submission.subscribe((event) => {
      if (event.type === 'create') {
        const a = fromDB(event.data);
        if (!items.find(x => x.slug === a.slug)) { items = [a, ...items]; emit(); }
      } else if (event.type === 'delete') {
        items = items.filter(x => x.id !== event.data.id);
        emit();
      } else if (event.type === 'update') {
        const a = fromDB(event.data);
        items = items.map(x => x.id === a.id ? a : x);
        emit();
      }
    });
  } catch (e) {}
};