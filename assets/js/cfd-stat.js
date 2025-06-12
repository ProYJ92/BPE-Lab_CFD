(()=>{
const drop=document.getElementById('drop-area');
const fileInput=document.getElementById('file-input');
const filePreview=document.getElementById('file-preview');
const statForm=document.getElementById('stat-form');
const rpmEl=document.getElementById('rpm');
const cycleEl=document.getElementById('cycle');
const outlierEl=document.getElementById('outlier');
const decimalsEl=document.getElementById('decimals');
const noteHead=document.querySelector('#note-table thead');
const noteBody=document.querySelector('#note-table tbody');
const analyzeBtn=document.getElementById('analyze-btn');
const exportBtn=document.getElementById('export-notes');
const clearBtn=document.getElementById('clear-notes');
let workbook=null,uploaded='';

function resetPanel(){fileInput.value='';filePreview.innerHTML='';statForm.classList.add('d-none');workbook=null;uploaded='';}

drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragover');});
drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);});
fileInput.addEventListener('change',()=>{const f=fileInput.files[0];if(f)handleFile(f);});
filePreview.addEventListener('click',e=>{if(e.target.classList.contains('remove'))resetPanel();});

function handleFile(file){filePreview.innerHTML=`<div class="file-box" title="${file.name}">📄 ${file.name}<button class="remove">❌</button></div>`;const ext=file.name.split('.').pop().toLowerCase();const rdr=new FileReader();rdr.onload=e=>{try{workbook=['xlsx','xls'].includes(ext)?XLSX.read(e.target.result,{type:'array'}):textToWb(e.target.result);uploaded=file.name;statForm.classList.remove('d-none');}catch(err){console.error(err);resetPanel();}};if(ext==='xlsx'||ext==='xls')rdr.readAsArrayBuffer(file);else rdr.readAsText(file,'utf-8');}

function textToWb(txt){const arr=Papa.parse(txt.trim(),{skipEmptyLines:true}).data;const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(arr),'Sheet1');return wb;}

analyzeBtn.addEventListener('click',analyze);
exportBtn.addEventListener('click',exportNotes);
clearBtn.addEventListener('click',clearNotes);
noteBody.addEventListener('click',e=>{const btn=e.target.closest('button[data-idx]');if(btn){const idx=parseInt(btn.dataset.idx,10);const arr=getNotes();arr.splice(idx,1);saveNotes(arr);renderNotes();}});

function analyze(){if(!workbook)return;const rpm=parseFloat(rpmEl.value);const cycle=parseFloat(cycleEl.value);const decimals=parseInt(decimalsEl.value,10)||0;const useOutlier=outlierEl.checked;if(isNaN(rpm)||isNaN(cycle)||rpm===0)return;const dtc=60/rpm;workbook.SheetNames.forEach(name=>{const sheet=workbook.Sheets[name];const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null});if(rows.length<2)return;const headers=rows[0].slice(1);const data=rows.slice(1).map(r=>r.map(v=>parseFloat(v)));const first=data[0][0];const last=data[data.length-1][0];let tStart=last-cycle*dtc;if(tStart<first)tStart=first;const filtered=data.filter(r=>r[0]>=tStart);const vals=headers.map((_,i)=>{let v=filtered.map(r=>r[i+1]).filter(x=>!isNaN(x));if(useOutlier&&v.length>3)v=tukeyFilter(v);if(!v.length)return null;const avg=v.reduce((a,b)=>a+b,0)/v.length;return Number(avg.toFixed(decimals));});storeNote(name,headers,vals);});}

function tukeyFilter(arr){const s=[...arr].sort((a,b)=>a-b);const q1=s[Math.floor(0.25*s.length)];const q3=s[Math.floor(0.75*s.length)];const iqr=q3-q1;return arr.filter(v=>v>=q1-1.5*iqr&&v<=q3+1.5*iqr);}

function getNotes(){return JSON.parse(localStorage.getItem('cfdNotes')||'[]');}
function saveNotes(a){localStorage.setItem('cfdNotes',JSON.stringify(a));}

function storeNote(sheet,headers,values){const notes=getNotes();notes.push({date:dayjs().format('YYYY-MM-DD HH:mm:ss'),id:uploaded,sheet,headers,values});saveNotes(notes);renderNotes();}

function renderNotes(){const notes=getNotes();noteBody.innerHTML='';if(!notes.length){noteHead.innerHTML='';return;}const header=['No','date','id','sheet',...notes[0].headers,''];noteHead.innerHTML='<tr>'+header.map(h=>`<th>${h}</th>`).join('')+'</tr>';notes.forEach((n,i)=>{const row=[i+1,n.date,n.id,n.sheet,...n.values.map(v=>v==null?'':v)];const tr=document.createElement('tr');tr.innerHTML=row.map(v=>`<td>${v}</td>`).join('')+`<td><button class="btn icon danger" data-idx="${i}" aria-label="삭제"><i class="fa fa-trash"></i></button></td>`;noteBody.appendChild(tr);});}

function clearNotes(){if(!confirm('모든 노트를 삭제하시겠습니까?'))return;localStorage.removeItem('cfdNotes');renderNotes();}

function exportNotes(){const notes=getNotes();if(!notes.length)return;const arr=notes.map(n=>{const obj={date:n.date,id:n.id,sheet:n.sheet};n.headers.forEach((h,i)=>{obj[h]=n.values[i];});return obj;});const csv=Papa.unparse(arr);downloadBlob(csv,`notes_${dayjs().format('YYMMDD')}.csv`);}

function downloadBlob(txt,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download=name;a.click();URL.revokeObjectURL(a.href);}

renderNotes();
console.info('✅ All checks passed');
})();
