/* === cfd-statistics|ANALYZER === */
(() => {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileBtn = document.getElementById('file-btn');
  const filePreview = document.getElementById('file-preview');
  const fileNameEl = document.getElementById('file-name');
  const fileRemove = document.getElementById('file-remove');
  const form = document.getElementById('stat-form');
  const rpmEl = document.getElementById('rpm');
  const cycleEl = document.getElementById('cycle');
  const outlierEl = document.getElementById('outlier');
  const decimalsEl = document.getElementById('decimals');
  const analyzeBtn = document.getElementById('analyze-btn');
  const notesBody = document.querySelector('#note-table tbody');
  const exportBtn = document.getElementById('export-notes');
  const clearBtn = document.getElementById('clear-notes');
  const modal = document.getElementById('note-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = modal.querySelector('.close-btn');

  let selectedFile = null;

  dropArea.addEventListener('click', () => fileInput.click());
  fileBtn.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('keydown', e => { if (e.key === 'Enter') fileInput.click(); });

  ['dragenter','dragover'].forEach(evt => {
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt => {
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.remove('dragover'); });
  });
  dropArea.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  function handleFile(file){
    const ext = file.name.split('.').pop().toLowerCase();
    if(!/(csv|xlsx?)$/.test(ext)){ alert('Excel(.xlsx) 또는 CSV 파일만 지원합니다.'); return; }
    selectedFile = file;
    fileNameEl.textContent = file.name;
    filePreview.classList.remove('d-none');
    dropArea.classList.add('d-none');
    form.classList.remove('d-none');
  }

  fileRemove.addEventListener('click', resetUploader);

  function resetUploader(){
    selectedFile = null;
    fileInput.value = '';
    filePreview.classList.add('d-none');
    dropArea.classList.remove('d-none');
    form.classList.add('d-none');
  }

  analyzeBtn.addEventListener('click', analyze);

  function parseWorkbook(file){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = e => {
        try { resolve(XLSX.read(new Uint8Array(e.target.result), {type:'array'})); }
        catch(err){ reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function analyze(){
    if(!selectedFile) return;
    const rpm = parseFloat(rpmEl.value);
    const cycle = parseFloat(cycleEl.value);
    const decimals = parseInt(decimalsEl.value,10) || 0;
    const useOutlier = outlierEl.checked;
    if(isNaN(rpm) || isNaN(cycle) || rpm === 0) { alert('RPM과 Cycle을 확인하세요'); return; }
    let wb;
    try{ wb = await parseWorkbook(selectedFile); }catch(e){ alert('파일을 읽을 수 없습니다.'); return; }
    const span = cycle * (60 / rpm);
    wb.SheetNames.forEach(sheetName => {
      const sheet = wb.Sheets[sheetName];
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
    resetUploader();
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

  function storeNote(sheet,avgs){
    const notes=getNotes();
    notes.push([dayjs().format('YYYY-MM-DD HH:mm:ss'), selectedFile.name, sheet, ...avgs]);
    saveNotes(notes);
    renderNotes();
  }

  function renderNotes(){
    const notes=getNotes();
    notesBody.innerHTML='';
    const thead=document.querySelector('#note-table thead tr');
    if(notes.length){
      const nRes=notes[0].length-3;
      thead.innerHTML='<th>No</th><th>일시</th><th>ID</th><th>시트</th>'+Array.from({length:nRes},(_,i)=>`<th>결과${i+1}</th>`).join('')+'<th></th>';
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
    const row=e.target.closest('tr');
    if(btn){
      const idx=parseInt(btn.dataset.idx,10);
      const arr=getNotes();
      arr.splice(idx,1); saveNotes(arr); renderNotes();
      e.stopPropagation();
      return;
    }
    if(row){
      const idx=[...notesBody.children].indexOf(row);
      const note=getNotes()[idx];
      showModal(JSON.stringify(note,null,2));
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

  function showModal(text){
    modalBody.textContent=text;
    modal.classList.remove('d-none');
    modal.querySelector('.modal-content').focus();
  }
  function hideModal(){ modal.classList.add('d-none'); }
  modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) hideModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !modal.classList.contains('d-none')) hideModal(); });

  renderNotes();
})();
