import { Image } from '@/components/ui/image';
import LoopCanvas from '@/components/LoopCanvas';
export default function AssetVisual({asset,className=''}) {
  if (asset.type === 'video') return <LoopCanvas kind={asset.kind} className={className} />;
  const url = asset.image || '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return <img src={url} alt={`${asset.title} background`} className={className} />;
  return <Image src={url} alt={`${asset.title} abstract background`} className={className} fittingType="fill" />;
}