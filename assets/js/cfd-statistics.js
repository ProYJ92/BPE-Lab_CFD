/* === cfd-statistics|ANALYZER === */
(() => {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileBtn = document.getElementById('file-btn');
  const preview = document.getElementById('file-preview');
  const fileName = document.getElementById('file-name');
  const fileRemove = document.getElementById('file-remove');
  const statForm = document.getElementById('stat-form');
  const rpmEl = document.getElementById('rpm');
  const cycleEl = document.getElementById('cycle');
  const outlierEl = document.getElementById('outlier');
  const decimalsEl = document.getElementById('decimals');
  const analyzeBtn = document.getElementById('analyze-btn');
  const thead = document.querySelector('#note-table thead');
  const notesBody = document.querySelector('#note-table tbody');
  const exportBtn = document.getElementById('export-notes');
  const clearBtn = document.getElementById('clear-notes');

  let workbook = null;
  let uploadedName = '';

  function parseTextToWorkbook(text){
    const lines = text.trim().split(/\r?\n/);
    const delim = (lines[0].includes('\t') ? '\t' : ',');
    const rows  = lines.map(l => l.split(delim).map(v => v.trim()));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
  }

  dropArea.addEventListener('click', () => fileInput.click());
  fileBtn.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('keydown', e => { if (e.key === 'Enter') fileInput.click(); });

  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(file){
    const ext = file.name.split('.').pop().toLowerCase();
    const isExcel = ['xlsx','xls'].includes(ext);
    const isText  = ['csv','txt'].includes(ext);

    if(!isExcel && !isText){
      alert('지원 형식: xlsx, xls, csv, txt');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => alert(`${file.name} 읽기 오류`);

    reader.onload = e => {
      try{
        workbook = isExcel
          ? XLSX.read(e.target.result, {type:'array'})
          : parseTextToWorkbook(e.target.result);
        afterLoadSuccess(file.name);
      }catch(err){
        alert(`${file.name} 파일을 열 수 없습니다.\n${err.message}`);
      }
    };

    isExcel ? reader.readAsArrayBuffer(file)
            : reader.readAsText(file,'utf-8');
  }

  function afterLoadSuccess(fname){
    uploadedName = fname;
    preview.classList.remove('d-none');
    fileName.textContent = fname;
    statForm.classList.remove('d-none');
    fileInput.value='';
    dropArea.classList.add('d-none');
  }

  fileRemove.addEventListener('click', () => {
    workbook = null;
    uploadedName = '';
    fileInput.value = '';
    preview.classList.add('d-none');
    statForm.classList.add('d-none');
    dropArea.classList.remove('d-none');
  });

  analyzeBtn.addEventListener('click', analyze);

  async function analyze(){
    if(!workbook){
      alert('먼저 파일을 업로드하세요');
      return;
    }
    try{
      const rpm = parseFloat(rpmEl.value);
      const cycle = parseFloat(cycleEl.value);
      const decimals = parseInt(decimalsEl.value,10) || 0;
      const useOutlier = outlierEl.checked;
      if(isNaN(rpm) || isNaN(cycle) || rpm === 0) { alert('RPM과 Cycle을 확인하세요'); return; }
      const span = cycle * (60 / rpm);
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet,{header:1,defval:null});
        if(!rows.length) return;
        const headers = rows[0].slice(1);
        const dataRows = rows.slice(1).map(r => r.map(v => parseFloat(v)));
        const lastTime = dataRows[dataRows.length-1][0];
        const filtered = dataRows.filter(r => r[0] >= lastTime - span);
        const avgs = headers.map((_,i)=>{
          const vals = filtered.map(r => r[i+1]).filter(v => !isNaN(v));
          if(!vals.length) return null;
          let data = vals;
          if(useOutlier && vals.length>3) data = removeOutliers(vals);
          const avg = data.reduce((a,b)=>a+b,0)/data.length;
          return Number(avg.toFixed(decimals));
        });
        storeNote(sheetName,avgs);
      });
    }catch(err){
      alert(`데이터를 처리하는 중 오류가 발생했습니다.\n(${err.message})`);
    }
  }

  function percentile(sorted,p){
    const pos=(sorted.length-1)*p;
    const base=Math.floor(pos);
    const rest=pos-base;
    return sorted[base]+(sorted[base+1]-sorted[base])*rest;
  }

  function removeOutliers(arr){
    const s=arr.slice().sort((a,b)=>a-b);
    const q1=percentile(s,0.25);
    const q3=percentile(s,0.75);
    const i=q3-q1;
    const min=q1-1.5*i;
    const max=q3+1.5*i;
    return arr.filter(v=>v>=min && v<=max);
  }

  function getNotes(){ return JSON.parse(localStorage.getItem('cfdStatNotes')||'[]'); }
  function saveNotes(a){ localStorage.setItem('cfdStatNotes',JSON.stringify(a)); }

  function buildHeader(n){
    const base=['No','일시','ID','시트'];
    const ths=[...base,...Array.from({length:n},(_,i)=>`결과${i+1}`),''];
    thead.innerHTML=`<tr>${ths.map(t=>`<th>${t}</th>`).join('')}</tr>`;
  }

  function storeNote(sheet,avgs){
    const notes=getNotes();
    notes.push([dayjs().format('YYYY-MM-DD HH:mm:ss'), uploadedName, sheet, ...avgs]);
    saveNotes(notes);
    buildHeader(avgs.length);
    renderNotes();
  }

  function renderNotes(){
    const notes=getNotes();
    notesBody.innerHTML='';
    if(notes.length){
      buildHeader(notes[0].length-3);
    } else {
      thead.innerHTML='';
    }
    notes.forEach((n,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=[i+1,n[0],n[1],n[2],...n.slice(3)].map(v=>`<td>${v===null?'':v}</td>`).join('')+
        `<td><button class="btn icon danger" data-idx="${i}" aria-label="삭제"><i class="fa fa-trash"></i></button></td>`;
      notesBody.appendChild(tr);
    });
  }

  notesBody.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-idx]');
    if(btn){
      const idx=parseInt(btn.dataset.idx,10);
      const arr=getNotes();
      arr.splice(idx,1); saveNotes(arr); renderNotes();
    }
  });

  exportBtn.addEventListener('click',()=>{
    const notes=getNotes();
    if(!notes.length) return;
    const header=['일시','ID','시트',...notes[0].slice(3).map((_,i)=>`결과${i+1}`)];
    const ws=XLSX.utils.aoa_to_sheet([header,...notes]);
    const csv=XLSX.utils.sheet_to_csv(ws);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download='cfd_notes.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  clearBtn.addEventListener('click',()=>{
    if(!confirm('모든 노트를 삭제하시겠습니까?')) return;
    localStorage.removeItem('cfdStatNotes');
    renderNotes();
  });



  renderNotes();
})();
