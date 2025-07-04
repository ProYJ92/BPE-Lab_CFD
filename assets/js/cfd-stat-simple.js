// CFD statistics tool with last N cycle analysis
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const rpmInput = document.getElementById('rpm');
const cycleInput = document.getElementById('cycle');
const precInput = document.getElementById('precision');
const outlierChk = document.getElementById('outlier');
const manualChk = document.getElementById('manualIdChk');
const manualIdInput = document.getElementById('manualIdInput');
const analyzeBtn = document.getElementById('analyze');
const resultsBox = document.getElementById('results');
const notesBox = document.getElementById('notes');
const removeBtn = document.getElementById('removeFile');
const clearBtn = document.getElementById('clearNotes');
const tsvBtn = document.getElementById('downloadTSV');
const sheetWarn = document.getElementById('sheetWarning');
let currentFile;

['dragenter','dragover','dragleave','drop'].forEach(ev=>{
  drop.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();});
});

drop.addEventListener('dragover',()=>drop.classList.add('drag'));
drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{
  drop.classList.remove('drag');
  handleFile(e.dataTransfer.files[0]);
});

drop.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>handleFile(e.target.files[0]));
removeBtn.addEventListener('click',clearFile);
clearBtn.addEventListener('click',clearNotes);
tsvBtn.addEventListener('click',downloadTSV);
manualChk.addEventListener('change',()=>{
  if(manualChk.checked){
    manualIdInput.classList.remove('hidden');
  }else{
    manualIdInput.classList.add('hidden');
  }
});

function handleFile(f){
  if(!f) return;
  currentFile = f;
  drop.classList.add('hidden');
  removeBtn.classList.remove('hidden');
  document.getElementById('fileName').textContent = f.name;
  document.getElementById('fileInfo').classList.remove('hidden');
  document.getElementById('inputSection').classList.remove('hidden');
  sheetWarn.classList.add('hidden');
  checkReady();
}

function clearFile(){
  currentFile = null;
  drop.classList.remove('hidden');
  removeBtn.classList.add('hidden');
  document.getElementById('fileInfo').classList.add('hidden');
  document.getElementById('inputSection').classList.add('hidden');
  resultsBox.innerHTML = '';
  fileInput.value = '';
  sheetWarn.classList.add('hidden');
  checkReady();
}

[rpmInput, cycleInput, precInput].forEach(inp=>{
  inp.addEventListener('input',checkReady);
});

function checkReady(){
  const rpm=parseFloat(rpmInput.value);
  const cyc=parseFloat(cycleInput.value);
  analyzeBtn.disabled = !(currentFile && rpm>0 && cyc>0);
}

analyzeBtn.addEventListener('click',()=>{
  if(!currentFile) return;
  parseFile(currentFile);
});

function parseFile(f){
  const ext = f.name.split('.').pop().toLowerCase();
  if(ext==='csv' || ext==='txt'){
    sheetWarn.classList.add('hidden');
    Papa.parse(f,{header:false,dynamicTyping:true,skipEmptyLines:true,complete:res=>processData(res.data)});
  }else if(ext==='xlsx' || ext==='xls'){
    if(window.XLSX && XLSX.read){
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
          sheetWarn.textContent='⚠ 여러 시트가 포함된 파일입니다. 첫 번째 시트만 분석됩니다.';
          sheetWarn.classList.remove('hidden');
        } else {
          sheetWarn.classList.add('hidden');
        }
        const ws = wb.Sheets[wb.SheetNames[0]];
        const arr = XLSX.utils.sheet_to_json(ws,{header:1,blankRows:false});
        processData(arr);
      }).catch(()=>{
        sheetWarn.textContent='⚠ 파일을 불러오는 중 문제가 발생했습니다. 파일을 다시 저장하거나 CSV 형식으로 변환해 보세요.';
        sheetWarn.classList.remove('hidden');
      });
    }else if(window.SimpleXLSX){
      SimpleXLSX.parse(f).then(arr=>{
        sheetWarn.classList.add('hidden');
        processData(arr);
      }).catch(()=>{
        sheetWarn.textContent='⚠ 파일을 불러오는 중 문제가 발생했습니다. 파일을 다시 저장하거나 CSV 형식으로 변환해 보세요.';
        sheetWarn.classList.remove('hidden');
      });
    }else{
      sheetWarn.textContent='⚠ XLSX 파일을 처리할 수 없습니다.';
      sheetWarn.classList.remove('hidden');
    }
  }else{
    sheetWarn.textContent='⚠ 지원되지 않는 파일 형식입니다. .txt, .csv, .xls, .xlsx 파일만 업로드 가능합니다.';
    sheetWarn.classList.remove('hidden');
  }
}

function isMonotonic(arr){
  for(let i=1;i<arr.length;i++) if(arr[i]<arr[i-1]) return false;
  return true;
}

function processData(rows){
  if(rows.length<2) return;
  const rpm = parseFloat(rpmInput.value);
  const cycles = parseFloat(cycleInput.value);
  if(rpm<=0||cycles<=0) return;
  const precision = Math.max(parseInt(precInput.value||'3',10),0);

  const timeValues = rows.slice(1).map(r=>r[0]);
  const numericTime = timeValues.every(v=>typeof v==='number' && !isNaN(v)) && isMonotonic(timeValues);

  let dataRows = rows.slice(1).map(r=>r.slice());
  if(numericTime){
    dataRows.forEach(r=>{ r[0] = Math.round(r[0]*100)/100; });
    const tEnd = dataRows[dataRows.length-1][0];
    const cycleTime = 60 / rpm;
    const cutoffTime = tEnd - cycles*cycleTime;
    const eps = 1e-9;
    dataRows = dataRows.filter(r=>r[0] >= cutoffTime - eps);
  }

  const cols = rows[0].length;
  const means=[];
  for(let c=1;c<cols;c++){
    let vals = dataRows.map(r=>Number(r[c])).filter(v=>!isNaN(v));
    if(outlierChk.checked) removeOutliers(vals);
    const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : NaN;
    means.push(avg);
  }
  const formatted = means.map(v=>isNaN(v)?'NaN':v.toFixed(precision));
  showResult(formatted,rows[0].slice(1));
  saveNote(formatted);
}

function removeOutliers(arr){
  if(arr.length<4) return arr;
  const sorted=arr.slice().sort((a,b)=>a-b);
  const q1=quantile(sorted,0.25); const q3=quantile(sorted,0.75);
  const iqr=q3-q1; const min=q1-1.5*iqr; const max=q3+1.5*iqr;
  for(let i=arr.length-1;i>=0;i--) if(arr[i]<min||arr[i]>max) arr.splice(i,1);
  return arr;
}
function quantile(sorted,q){
  const pos=(sorted.length-1)*q; const base=Math.floor(pos); const rest=pos-base;
  return sorted[base]+(sorted[base+1]-sorted[base])*rest;
}

function showResult(vals,headers){
  const headerRow=headers.map(h=>`<th>${h}</th>`).join('');
  const valRow=vals.map(v=>`<td>${v}</td>`).join('');
  resultsBox.innerHTML=`<table><tr>${headerRow}</tr><tr>${valRow}</tr></table>`;
}

function saveNote(values){
  const ts = dayjs().format('YYMMDD-HH:mm');
  const name = currentFile.name.replace(/\.[^.]+$/,'');
  const cleaned = name.replace(/[^A-Za-z0-9가-힣]/g,'');
  let id;
  if(manualChk.checked && manualIdInput.value.trim()){
    const manualVal = manualIdInput.value.trim();
    const cleanedManual = manualVal.replace(/[^A-Za-z0-9가-힣]/g,'');
    id = cleanedManual.length ? cleanedManual : manualVal;
  }else{
    id = cleaned.length<=12 ? cleaned : cleaned.slice(0,6)+cleaned.slice(-6);
  }
  const note={ts,id,values};
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  notes.push(note);
  localStorage.setItem('cfdStatsNotes',JSON.stringify(notes));
  renderNotes();
}

function renderNotes(){
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  notesBox.innerHTML='';
  notes.forEach((n,i)=>{
    const row=document.createElement('div');
    row.className='log-row border-b py-1';
    row.innerHTML=`<span class="seq">${i+1}</span><span class="meta">${n.ts} / ${n.id}</span><span class="data">${n.values.join(', ')}</span>`;
    const copy=document.createElement('button');
    copy.className='copy-btn';
    copy.setAttribute('aria-label','복사');
    copy.innerHTML='<i data-lucide="copy"></i>';
    copy.addEventListener('click',()=>copyNote(n,i));
    const del=document.createElement('button');
    del.className='del-btn';
    del.setAttribute('aria-label','삭제');
    del.innerHTML='<i data-lucide="x"></i>';
    del.addEventListener('click',()=>deleteNote(i));
    row.appendChild(copy);
    row.appendChild(del);
    notesBox.appendChild(row);
  });
  lucide.createIcons();
}

function deleteNote(idx){
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  notes.splice(idx,1);
  localStorage.setItem('cfdStatsNotes',JSON.stringify(notes));
  renderNotes();
}

function copyNote(n){
  navigator.clipboard.writeText(n.values.join('\t'));
}

function clearNotes(){
  if(!confirm('모든 노트를 삭제하시겠습니까?')) return;
  localStorage.removeItem('cfdStatsNotes');
  renderNotes();
}

function downloadTSV(){
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  if(!notes.length) return;
  const maxCols=Math.max(...notes.map(n=>n.values.length));
  const header=['Index','Timestamp','ID'];
  for(let i=1;i<=maxCols;i++) header.push(`Value${i}`);
  const lines=[header.join('\t')];
  notes.forEach((n,i)=>{
    const row=[i+1,n.ts,n.id];
    row.push(...n.values);
    lines.push(row.join('\t'));
  });
  const blob=new Blob(
    [lines.join('\n')],
    {type:'text/tab-separated-values;charset=utf-8'}
  );
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='notes.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

(function init(){renderNotes();})();
