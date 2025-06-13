// CFD statistics tool with last N cycle analysis
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const rpmInput = document.getElementById('rpm');
const cycleInput = document.getElementById('cycle');
const precInput = document.getElementById('precision');
const outlierChk = document.getElementById('outlier');
const analyzeBtn = document.getElementById('analyze');
const resultsBox = document.getElementById('results');
const notesBox = document.getElementById('notes');
const removeBtn = document.getElementById('removeFile');
const clearBtn = document.getElementById('clearNotes');
const csvBtn = document.getElementById('downloadCSV');
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
csvBtn.addEventListener('click',downloadCSV);

function handleFile(f){
  if(!f) return;
  currentFile = f;
  drop.classList.add('hidden');
  removeBtn.classList.remove('hidden');
  document.getElementById('fileName').textContent = f.name;
  document.getElementById('fileInfo').classList.remove('hidden');
  document.getElementById('inputSection').classList.remove('hidden');
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
  if(ext==='csv'||ext==='txt'){
    Papa.parse(f,{header:false,dynamicTyping:true,skipEmptyLines:true,complete:res=>processData(res.data)});
  }else{
    f.arrayBuffer().then(buf=>{
      const wb = XLSX.read(buf,{type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws,{header:1});
      processData(arr);
    });
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
  const id = name.slice(0,2)+name.slice(-2);
  const note={ts,id,sheet:1,values};
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
    row.innerHTML=`<span class="seq">${i+1}</span><span class="meta">${n.ts} / ${n.id} / ${n.sheet}</span><span class="data">${n.values.join(', ')}</span>`;
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

function downloadCSV(){
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  if(!notes.length) return;
  const maxCols=Math.max(...notes.map(n=>n.values.length));
  const header=['Index','Timestamp','ID','Sheet No.','Column No.'];
  for(let i=1;i<=maxCols;i++) header.push(`Value${i}`);
  const lines=[header.join('\t')];
  notes.forEach((n,i)=>{
    const row=[i+1,n.ts,n.id,n.sheet,''];
    row.push(...n.values);
    lines.push(row.join('\t'));
  });
  const blob=new Blob([lines.join('\n')],{type:'text/tab-separated-values'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='notes.tsv';
  a.click();
  URL.revokeObjectURL(a.href);
}

(function init(){renderNotes();})();
