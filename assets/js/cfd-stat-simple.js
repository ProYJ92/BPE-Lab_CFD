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
  analyzeBtn.disabled = !(currentFile && rpmInput.value && cycleInput.value);
}

analyzeBtn.addEventListener('click',()=>{
  if(!currentFile) return;
  parseFile(currentFile);
});

function parseFile(f){
  const ext = f.name.split('.').pop().toLowerCase();
  if(ext==='csv'||ext==='txt'){
    Papa.parse(f,{header:false,dynamicTyping:true,complete:res=>processData(res.data)});
  }else{
    f.arrayBuffer().then(buf=>{
      const wb = XLSX.read(buf,{type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws,{header:1});
      processData(arr);
    });
  }
}

function processData(rows){
  if(rows.length<2) return;
  const rpm = parseFloat(rpmInput.value);
  const cycles = parseFloat(cycleInput.value);
  const precision = parseInt(precInput.value||'3',10);
  const cycleTime = 60 / rpm;
  const tEnd = rows[rows.length-1][0];
  const tThreshold = tEnd - cycles*cycleTime;
  const dataRows = rows.slice(1).filter(r=>r[0]>=tThreshold);
  const cols = rows[0].length;
  const means=[];
  for(let c=1;c<cols;c++){
    const vals = dataRows.map(r=>Number(r[c])).filter(v=>!isNaN(v));
    if(outlierChk.checked) removeOutliers(vals);
    const avg = vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:NaN;
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
    const div=document.createElement('div');
    div.className='note-item flex justify-between items-center border-b py-1';
    div.innerHTML=`<span>${i+1} / ${n.ts} / ${n.id} / ${n.sheet} / ${n.values.join(', ')}</span>`;
    const btn=document.createElement('button');
    btn.innerHTML='<i data-lucide="x" class="w-4 h-4"></i>';
    btn.setAttribute('aria-label','기록 삭제');
    btn.addEventListener('click',()=>deleteNote(i));
    div.appendChild(btn);
    notesBox.appendChild(div);
  });
  lucide.createIcons();
}

function deleteNote(idx){
  const notes=JSON.parse(localStorage.getItem('cfdStatsNotes')||'[]');
  notes.splice(idx,1);
  localStorage.setItem('cfdStatsNotes',JSON.stringify(notes));
  renderNotes();
}

(function init(){renderNotes();})();
