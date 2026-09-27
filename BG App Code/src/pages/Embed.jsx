import { useParams } from 'react-router-dom';
import { assetBySlug } from '@/data/assetStore';
import AssetVisual from '@/components/AssetVisual';
export default function Embed(){const {slug}=useParams(),asset=assetBySlug(slug);if(!asset)return <div style={{background:'#050505',color:'#fff',minHeight:'100vh',padding:30}}>Asset not found.</div>;return <main className="embed-page" aria-label={`${asset.title} background`}><AssetVisual asset={asset} className="asset-media"/></main>}