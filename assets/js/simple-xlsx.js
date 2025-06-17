// Minimal XLSX reader for single-sheet files using browser DecompressionStream
// Returns sheet data as array of rows (array of cell values)
window.SimpleXLSX = { parse };

async function parse(file){
  const buf = await file.arrayBuffer();
  const files = await unzip(buf);
  const dec = s=>new TextDecoder().decode(s);
  const wb = dec(files['xl/workbook.xml']);
  const wbDoc = new DOMParser().parseFromString(wb,'application/xml');
  const sheetEl = wbDoc.querySelector('sheets sheet');
  if(!sheetEl) throw new Error('No sheet');
  const rid = sheetEl.getAttribute('r:id');
  const relsDoc = new DOMParser().parseFromString(dec(files['xl/_rels/workbook.xml.rels']),'application/xml');
  let target = relsDoc.querySelector(`Relationship[Id="${rid}"]`).getAttribute('Target');
  if(!target.startsWith('xl/')) target = 'xl/' + target.replace(/^\/?/, '');
  const sheetXML = dec(files[target]);
  const shared = files['xl/sharedStrings.xml'] ? parseShared(dec(files['xl/sharedStrings.xml'])) : [];
  return parseSheet(sheetXML, shared);
}

function parseShared(xml){
  const doc = new DOMParser().parseFromString(xml,'application/xml');
  return Array.from(doc.getElementsByTagName('si')).map(si=>si.textContent);
}

function colIndex(ref){
  let col=0; for(let i=0;i<ref.length;i++){ const c=ref.charCodeAt(i); if(c>=65&&c<=90){ col=col*26+(c-64); } else break; } return col-1;
}

function parseSheet(xml, shared){
  const doc = new DOMParser().parseFromString(xml,'application/xml');
  const rows=[]; let max=0;
  doc.querySelectorAll('sheetData row').forEach(rowEl=>{
    const r=parseInt(rowEl.getAttribute('r'))-1;
    const cells=[];
    rowEl.querySelectorAll('c').forEach(cel=>{
      const idx = colIndex(cel.getAttribute('r'));
      const vEl = cel.getElementsByTagName('v')[0];
      let v = vEl ? vEl.textContent : '';
      if(cel.getAttribute('t')==='s') v = shared[parseInt(v,10)] || '';
      else v = v===''?null:Number(v);
      cells[idx]=isNaN(v)?v:Number(v);
      if(idx>max) max=idx;
    });
    rows[r]=cells;
  });
  return rows.map(r=>{const a=new Array(max+1).fill(null); if(r) r.forEach((v,i)=>{a[i]=v;}); return a;});
}

async function unzip(buf){
  const view=new DataView(buf); const u8=new Uint8Array(buf); let off=0; const files={};
  const dec=new TextDecoder();
  while(off+30<=u8.length){
    const sig=view.getUint32(off,true); if(sig!==0x04034b50) break;
    const comp=view.getUint16(off+8,true); const nameLen=view.getUint16(off+26,true); const extraLen=view.getUint16(off+28,true);
    const size=view.getUint32(off+18,true); const name=dec.decode(u8.subarray(off+30,off+30+nameLen));
    const start=off+30+nameLen+extraLen; const data=u8.subarray(start,start+size);
    if(comp===0) files[name]=data; else if(comp===8) files[name]=await inflateRaw(data); else throw new Error('Unsupported compression');
    off=start+size;
  }
  return files;
}

async function inflateRaw(data){
  if(typeof DecompressionStream==='undefined') throw new Error('DecompressionStream unsupported');
  const ds=new DecompressionStream('deflate-raw');
  const ab=await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer();
  return new Uint8Array(ab);
}
