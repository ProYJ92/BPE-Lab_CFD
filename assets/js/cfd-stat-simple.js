// ---------------- 평균 계산기 (xlsx + csv/txt) ----------------
const drop = document.getElementById('drop');
const file = document.getElementById('file');
const out  = document.getElementById('out');

// drag 방지
['dragenter','dragover','dragleave','drop'].forEach(ev=>{
  drop.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();});
});
drop.addEventListener('dragover',()=>drop.classList.add('drag'));
drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{
  drop.classList.remove('drag');
  handleFile(e.dataTransfer.files[0]);
});
// 클릭 업로드
drop.addEventListener('click',()=>file.click());
file.addEventListener('change',e=>handleFile(e.target.files[0]));

function handleFile(f){
  if(!f) return;
  // 파일명 표시
  drop.innerHTML = `📄 <span class="filename">${f.name}</span>`;
  const ext = f.name.split('.').pop().toLowerCase();
  if(ext === 'csv' || ext === 'txt'){
    if(typeof Papa === 'undefined'){
      console.error('Missing Papa Parse library');
      return;
    }
    parseCSV(f);
  }else{
    if(typeof XLSX === 'undefined'){
      console.error('Missing XLSX library');
      return;
    }
    parseXLSX(f);
  }
}

/* ---------- CSV / TXT ---------- */
function parseCSV(f){
  Papa.parse(f,{
    header:false,
    dynamicTyping:true,
    complete:({data})=>showResult( computeMeans(data) )
  });
}

/* ---------- XLSX / XLS ---------- */
function parseXLSX(f){
  f.arrayBuffer().then(buff=>{
    const wb = XLSX.read(buff,{type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const arr= XLSX.utils.sheet_to_json(ws,{header:1});
    showResult( computeMeans(arr) );
  });
}

/* ---------- 평균 계산 ---------- */
function computeMeans(rows){
  const sums = [], cnts = [];
  rows.forEach(r=>{
    r.forEach((v,i)=>{
      if(typeof v === 'number' && !isNaN(v)){
        sums[i] = (sums[i]||0) + v;
        cnts[i] = (cnts[i]||0) + 1;
      }
    });
  });
  return sums.map((s,i)=>cnts[i] ? (s/cnts[i]).toFixed(2) : '');
}

/* ---------- 결과 출력 ---------- */
function showResult(means){
  if(!means.length){ out.textContent = '숫자 데이터가 없습니다.'; return; }
  const header = means.map((_,i)=>`<th>${String.fromCharCode(65+i)}</th>`).join('');
  const values = means.map(v=>`<td>${v}</td>`).join('');
  out.innerHTML = `
    <table>
      <tr>${header}</tr>
      <tr>${values}</tr>
    </table>`;
}
