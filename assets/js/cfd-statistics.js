/* === cfd-statistics|SCRIPT_START === */
(() => {
  // 1. 필수 라이브러리 존재 검사 (로컬 복사본이므로 실패 시 404 → 즉시 알림)
  if(typeof XLSX==='undefined' || typeof Papa==='undefined'){
    alert('필수 라이브러리를 로드하지 못했습니다. 파일 경로를 확인하세요.');
    return;
  }

  // 2. DOM 요소
  const drop   = document.getElementById('drop-area');
  const input  = document.getElementById('file-input');
  const choose = document.getElementById('file-btn');
  const prev   = document.getElementById('file-preview');
  const fname  = document.getElementById('file-name');
  const rmvBtn = document.getElementById('file-remove');
  const statForm = document.getElementById('stat-form');
  const rpmEl  = document.getElementById('rpm');
  const cycleEl= document.getElementById('cycle');
  const outlierEl = document.getElementById('outlier');
  const decimalsEl = document.getElementById('decimals');
  const analyzeBtn = document.getElementById('analyze-btn');
  const thead  = document.querySelector('#note-table thead');
  const notesBody = document.querySelector('#note-table tbody');
  const exportBtn = document.getElementById('export-notes');
  const clearBtn  = document.getElementById('clear-notes');

  let workbook='', uploaded='';

  // 3) 토스트
  const toast=(m,err=false)=>{ const t=document.createElement('div');
    t.className='toast'+(err?' error':'');t.textContent=m;document.body.appendChild(t);
    setTimeout(()=>t.remove(),2500);};

  // 4) 텍스트→Workbook util (PapaParse)
  const csvToWb=txt=>{
    const arr=Papa.parse(txt.trim(),{skipEmptyLines:true}).data;
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(arr),'Sheet1');
    return wb;
  };

  // 5) 파일 처리
  function handle(file){
    const ext=file.name.split('.').pop().toLowerCase();
    const rdr=new FileReader();
    rdr.onerror=()=>toast('읽기 오류',true);
    rdr.onload=e=>{
      try{
        workbook=['xlsx','xls'].includes(ext)
           ? XLSX.read(e.target.result,{type:'array'})
           : csvToWb(e.target.result);
        uploaded=file.name;
        fname.textContent=file.name;
        prev.classList.remove('d-none');
        statForm.classList.remove('d-none');
        input.value='';
        toast('업로드 완료');
        renderNotes();
      }catch(err){
        console.error(err);
        toast('파싱 실패: '+err.message,'error');
      }
    };
    (ext==='xlsx'||ext==='xls') ? rdr.readAsArrayBuffer(file)
                                : rdr.readAsText(file,'utf-8');
  }

  // 6) drag&drop + click
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragover');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');
                                   if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);});
  drop.addEventListener('click',()=>input.click());
  choose.addEventListener('click',()=>input.click());
  input.addEventListener('change',e=>{if(e.target.files[0]) handle(e.target.files[0]);});
  rmvBtn.addEventListener('click',()=>{workbook='';uploaded='';prev.classList.add('d-none');toast('파일 제거');});

  analyzeBtn.addEventListener('click', analyze);
  exportBtn.addEventListener('click', exportNotes);
  clearBtn.addEventListener('click', clearNotes);
  notesBody.addEventListener('click', onRemoveNote);

  // ----- 분석 로직 -----
  function analyze(){
    if(!workbook){ toast('먼저 파일을 업로드하세요','error'); return; }
    try{
      const rpm = parseFloat(rpmEl.value);
      const cycle = parseFloat(cycleEl.value);
      const decimals = parseInt(decimalsEl.value,10) || 0;
      const useOutlier = outlierEl.checked;
      if(isNaN(rpm) || isNaN(cycle) || rpm===0){ toast('RPM과 Cycle을 확인하세요','error'); return; }
      const span = cycle * (60 / rpm);
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet,{header:1,defval:null});
        if(!rows.length) return;
        const headers = rows[0].slice(1);
        const dataRows = rows.slice(1).map(r=>r.map(v=>parseFloat(v)));
        const lastTime = dataRows[dataRows.length-1][0];
        const filtered = dataRows.filter(r=>r[0]>= lastTime - span);
        const avgs = headers.map((_,i)=>{
          const vals = filtered.map(r=>r[i+1]).filter(v=>!isNaN(v));
          if(!vals.length) return null;
          let data = vals;
          if(useOutlier && vals.length>3) data = removeOutliers(vals);
          const avg = data.reduce((a,b)=>a+b,0)/data.length;
          return Number(avg.toFixed(decimals));
        });
        storeNote(sheetName,avgs);
      });
    }catch(err){
      console.error(err);
      toast('데이터 처리 중 오류: '+err.message,'error');
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
    notes.push([dayjs().format('YYYY-MM-DD HH:mm:ss'), uploaded, sheet, ...avgs]);
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
  function onRemoveNote(e){
    const btn=e.target.closest('button[data-idx]');
    if(btn){
      const idx=parseInt(btn.dataset.idx,10);
      const arr=getNotes();
      arr.splice(idx,1); saveNotes(arr); renderNotes();
    }
  }
  function exportNotes(){
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
  }
  function clearNotes(){
    if(!confirm('모든 노트를 삭제하시겠습니까?')) return;
    localStorage.removeItem('cfdStatNotes');
    renderNotes();
  }

  renderNotes();
})();
/* === cfd-statistics|SCRIPT_END === */
