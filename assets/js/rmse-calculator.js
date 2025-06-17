const dropLeft = document.getElementById('dropLeft');
const dropRight = document.getElementById('dropRight');
const fileLeft = document.getElementById('fileLeft');
const fileRight = document.getElementById('fileRight');
const infoLeft = document.getElementById('fileInfoLeft');
const infoRight = document.getElementById('fileInfoRight');
const nameLeft = document.getElementById('fileNameLeft');
const nameRight = document.getElementById('fileNameRight');
const removeLeft = document.getElementById('removeFileLeft');
const removeRight = document.getElementById('removeFileRight');
const warnLeft = document.getElementById('sheetWarningLeft');
const warnRight = document.getElementById('sheetWarningRight');
const inputSection = document.getElementById('inputSection');
const analyzeBtn = document.getElementById('analyze');
const precisionInput = document.getElementById('precision');
const idInput = document.getElementById('analysisId');
const resultsBox = document.getElementById('results');
const notesBox = document.getElementById('notes');
const clearBtn = document.getElementById('clearNotes');
const tsvBtn = document.getElementById('downloadTSV');

let leftFile, rightFile;

['dragenter','dragover','dragleave','drop'].forEach(ev=>{
  [dropLeft, dropRight].forEach(d=>d.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();}));
});

function dragHighlight(drop){ drop.classList.add('drag'); }
function dragUnhighlight(drop){ drop.classList.remove('drag'); }

[dropLeft, dropRight].forEach(d=>{
  d.addEventListener('dragover',()=>dragHighlight(d));
  d.addEventListener('dragleave',()=>dragUnhighlight(d));
  d.addEventListener('drop',e=>{
    dragUnhighlight(d);
    handleFile(d===dropLeft? 'left':'right', e.dataTransfer.files[0]);
  });
  d.addEventListener('click',()=> (d===dropLeft?fileLeft:fileRight).click());
});

fileLeft.addEventListener('change',e=>handleFile('left', e.target.files[0]));
fileRight.addEventListener('change',e=>handleFile('right', e.target.files[0]));
removeLeft.addEventListener('click',()=>clearFile('left'));
removeRight.addEventListener('click',()=>clearFile('right'));
clearBtn.addEventListener('click',clearNotes);
tsvBtn.addEventListener('click',downloadTSV);

function handleFile(side,f){
  if(!f) return;
  if(side==='left'){leftFile=f;nameLeft.textContent=f.name;infoLeft.classList.remove('hidden');dropLeft.classList.add('hidden');removeLeft.classList.remove('hidden');warnLeft.classList.add('hidden');}
  else{rightFile=f;nameRight.textContent=f.name;infoRight.classList.remove('hidden');dropRight.classList.add('hidden');removeRight.classList.remove('hidden');warnRight.classList.add('hidden');}
  checkReady();
}

function clearFile(side){
  if(side==='left'){leftFile=null;fileLeft.value='';dropLeft.classList.remove('hidden');infoLeft.classList.add('hidden');removeLeft.classList.add('hidden');warnLeft.classList.add('hidden');}
  else{rightFile=null;fileRight.value='';dropRight.classList.remove('hidden');infoRight.classList.add('hidden');removeRight.classList.add('hidden');warnRight.classList.add('hidden');}
  resultsBox.textContent='';
  inputSection.classList.add('hidden');
  checkReady();
}

[precisionInput,idInput].forEach(el=>el.addEventListener('input',checkReady));

function checkReady(){
  analyzeBtn.disabled = !(leftFile && rightFile);
  if(leftFile && rightFile) inputSection.classList.remove('hidden');
  else inputSection.classList.add('hidden');
}

analyzeBtn.addEventListener('click',analyze);

function parseFileData(f, warnEl){
  return new Promise(resolve=>{
    const ext=f.name.split('.').pop().toLowerCase();
    if(ext==='csv' || ext==='txt'){
      warnEl.classList.add('hidden');
      Papa.parse(f,{header:false,dynamicTyping:true,skipEmptyLines:true,complete:res=>{
        const arr=res.data.slice(1).map(r=>Number(r[2]||0));
        resolve(arr.map(v=>isNaN(v)?0:v));
      }});
    }else if(ext==='xlsx' || ext==='xls'){
      f.arrayBuffer().then(buf=>{
        let wb;
        try{
          const data=new Uint8Array(buf);
          wb=XLSX.read(data,{type:'array'});
        }catch(e){
          try{
            let binary='';
            const bytes=new Uint8Array(buf);
            for(let i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
            wb=XLSX.read(binary,{type:'binary'});
          }catch(e2){
            console.error('XLSX read error',e2);
            throw e2;
          }
        }
        if(wb.SheetNames.length>1){
          warnEl.textContent='⚠ 여러 시트가 포함된 파일입니다. 첫 번째 시트만 사용됩니다.';
          warnEl.classList.remove('hidden');
        } else {
          warnEl.classList.add('hidden');
        }
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,blankRows:false});
        const arr=rows.slice(1).map(r=>Number(r[2]||0));
        resolve(arr.map(v=>isNaN(v)?0:v));
      }).catch(()=>{
        warnEl.textContent='⚠ 파일을 불러오는 중 문제가 발생했습니다. 파일을 다시 저장하거나 CSV 형식으로 변환해 보세요.';
        warnEl.classList.remove('hidden');
        resolve([]);
      });
    }else{
      warnEl.textContent='⚠ 지원되지 않는 파일 형식입니다. .txt, .csv, .xls, .xlsx 파일만 업로드 가능합니다.';
      warnEl.classList.remove('hidden');
      resolve([]);
    }
  });
}

async function analyze(){
  const [left,right] = await Promise.all([
    parseFileData(leftFile,warnLeft),
    parseFileData(rightFile,warnRight)
  ]);
  if(!left.length || !right.length){
    resultsBox.textContent='파일을 제대로 불러오지 못했습니다.';
    return;
  }
  const n=Math.max(left.length,right.length)||1;
  while(left.length<n) left.push(0);
  while(right.length<n) right.push(0);
  let sum=0;
  for(let i=0;i<n;i++){
    const diff=left[i]-right[i];
    sum+=diff*diff;
  }
  const prec=Math.max(parseInt(precisionInput.value||'3',10),0);
  const rmse=Math.sqrt(sum/n);
  const value=rmse.toFixed(prec);
  resultsBox.textContent=`RMSE: ${value}`;
  saveNote(value);
}

function saveNote(value){
  const ts=dayjs().format('YYMMDD-HH:mm');
  const id=idInput.value.trim();
  const note={ts,id,value};
  const notes=JSON.parse(localStorage.getItem('rmseNotes')||'[]');
  notes.push(note);
  localStorage.setItem('rmseNotes',JSON.stringify(notes));
  renderNotes();
}

function renderNotes(){
  const notes=JSON.parse(localStorage.getItem('rmseNotes')||'[]');
  notesBox.innerHTML='';
  notes.forEach((n,i)=>{
    const row=document.createElement('div');
    row.className='log-row border-b py-1';
    row.innerHTML=`<span class="seq">${i+1}</span><span class="meta">${n.ts}</span><span class="meta">${n.id}</span><span class="data flex-1">${n.value}</span>`;
    const copy=document.createElement('button');
    copy.className='copy-btn';
    copy.setAttribute('aria-label','복사');
    copy.innerHTML='<i data-lucide="copy"></i>';
    copy.addEventListener('click',()=>copyNote(i));
    const del=document.createElement('button');
    del.className='del-btn';
    del.setAttribute('aria-label','삭제');
    del.innerHTML='<i data-lucide="x"></i>';
    del.addEventListener('click',()=>deleteNote(i));
    row.appendChild(copy);
    row.appendChild(del);
    notesBox.appendChild(row);
  });
  if(window.lucide) lucide.createIcons();
}

function deleteNote(idx){
  const notes=JSON.parse(localStorage.getItem('rmseNotes')||'[]');
  notes.splice(idx,1);
  localStorage.setItem('rmseNotes',JSON.stringify(notes));
  renderNotes();
}

function copyNote(idx){
  const notes=JSON.parse(localStorage.getItem('rmseNotes')||'[]');
  const n=notes[idx];
  const text=[idx+1,n.ts,n.id,n.value].join('\t');
  navigator.clipboard.writeText(text);
}

function clearNotes(){
  if(!confirm('모든 노트를 삭제하시겠습니까?')) return;
  localStorage.removeItem('rmseNotes');
  renderNotes();
}

function downloadTSV(){
  const notes=JSON.parse(localStorage.getItem('rmseNotes')||'[]');
  if(!notes.length) return;
  const lines=['Index\tTimestamp\tID\tRMSE'];
  notes.forEach((n,i)=>{ lines.push(`${i+1}\t${n.ts}\t${n.id}\t${n.value}`); });
  const blob=new Blob([lines.join('\n')],{type:'text/tab-separated-values;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='rmse_notes.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

(function init(){renderNotes();})();

