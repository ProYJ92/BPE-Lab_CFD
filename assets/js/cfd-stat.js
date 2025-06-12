const drop = document.getElementById('drop-area');
const input= document.getElementById('file-input');
const res  = document.getElementById('result-box');

// 드래그&드롭
['dragenter','dragover','dragleave','drop'].forEach(ev=>{
  drop.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();});
});
drop.addEventListener('dragover',()=>drop.classList.add('dragover'));
drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
drop.addEventListener('drop',e=>{
  drop.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});
// 클릭 업로드
drop.addEventListener('click',()=>input.click());
input.addEventListener('change',e=>handleFile(e.target.files[0]));

function handleFile(file){
  if(!file)return;
  drop.innerHTML = `<span class="filename">📄 ${file.name}</span>`;
  const ext = file.name.split('.').pop().toLowerCase();
  if(['csv','txt'].includes(ext)) parseCSV(file);
  else parseXLSX(file);
}

// CSV / TXT
function parseCSV(file){
  Papa.parse(file,{
    header:true,
    dynamicTyping:true,
    complete:({data})=>displayMeans(data)
  });
}
// XLS/XLSX
function parseXLSX(file){
  const reader=new FileReader();
  reader.onload=e=>{
    const wb=XLSX.read(e.target.result,{type:'binary'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const json=XLSX.utils.sheet_to_json(ws,{defval:null});
    displayMeans(json);
  };
  reader.readAsBinaryString(file);
}

// 평균 계산 후 표시
function displayMeans(rows){
  if(!rows.length){res.textContent='데이터 없음';return;}
  const headers=Object.keys(rows[0]);
  const sums   =Object.fromEntries(headers.map(h=>[h,0]));
  const counts =Object.fromEntries(headers.map(h=>[h,0]));
  rows.forEach(r=>{
    headers.forEach(h=>{
      const v=r[h];
      if(typeof v==='number' && !isNaN(v)){
        sums[h]+=v; counts[h]++;
      }
    });
  });
  const html = headers.map(h=>{
    const mean = counts[h] ? (sums[h]/counts[h]).toFixed(4) : '—';
    return `<div>${h}: <strong>${mean}</strong></div>`;
  }).join('');
  res.innerHTML = `<h3>열별 평균값</h3>${html}`;
}
