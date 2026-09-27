import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { addAsset } from '@/data/assetStore';
import { getUI } from '@/data/uiStore';
import { Upload } from 'lucide-react';
export default function UploadZone(){
  const [name,setName]=useState(''),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
  const inputRef=useRef(null);
  const submit=async(e)=>{
    e.preventDefault();
    const clean=name.trim();
    if(!clean){setMsg('NAME YOUR FILE FIRST');return;}
    if(!file){setMsg('SELECT AN IMAGE FILE FIRST');return;}
    setBusy(true);setMsg('UPLOADING // encoding to public storage…');
    try{
      const {file_url}=await base44.integrations.Core.UploadPublicFile({file});
      if(!file_url)throw new Error('Upload failed — no URL returned.');
      await addAsset({slug:`upload-${Date.now().toString(36)}`,title:`USER / ${clean.toUpperCase()}`,type:'image',family:'USER / SUBMITTED',color:'#00F0FF',image:file_url,description:`Submitted to the registry by a visitor.`,postedBy:getUI().name||'ANONYMOUS'});
      setMsg('SUBMITTED // added to the archive');
      setName('');setFile(null);if(inputRef.current)inputRef.current.value='';
    }catch(err){setMsg(`ERROR // ${err.message}`)}
    finally{setBusy(false)}
  };
  return <form className="upload-zone" onSubmit={submit}>
    <span className="eyebrow">/ OPEN REGISTRY</span>
    <h3>UPLOAD YOUR<br/>OWN FIRE.</h3>
    <p>Drop a still into the public archive. Name it, submit, and it joins the feed instantly with the same download, embed, and fork tools as every other asset.</p>
    <div className="upload-row">
      <input className="upload-title" value={name} onChange={e=>setName(e.target.value)} placeholder="NAME THIS ASSET" aria-label="Asset name" disabled={busy}/>
      <label className="upload-file">
        <input ref={inputRef} type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} disabled={busy} aria-label="Select image file"/>
        <span>{file?file.name:'CHOOSE FILE'}</span>
      </label>
      <button type="submit" disabled={busy} className="primary-button"><Upload size={17}/>{busy?'UPLOADING…':'SUBMIT'}</button>
    </div>
    {msg&&<div role="status" className="upload-message">{msg}</div>}
  </form>;
}