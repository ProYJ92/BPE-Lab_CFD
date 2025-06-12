const drop = document.getElementById('drop');
const file = document.getElementById('file');
const out  = document.getElementById('out');

['dragenter','dragover','dragleave','drop'].forEach(ev=>{
  drop.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();});
});
drop.addEventListener('dragover',()=>drop.classList.add('drag'));
drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{
  drop.classList.remove('drag');
  handle(e.dataTransfer.files[0]);
});
drop.addEventListener('click',()=>file.click());
file.addEventListener('change',e=>handle(e.target.files[0]));

function handle(f){
  if(!f)return;
  drop.innerHTML = `📄 <span class="filename">${f.name}</span>`;
  const ext = f.name.split('.').pop().toLowerCase();
  (ext==='csv'||ext==='txt') ? readCSV(f) : readXLSX(f);
}

function readCSV(f){
  Papa.parse(f,{
    complete:({data})=>show(avg(data)),
    dynamicTyping:true
  });
}

function readXLSX(f){
  f.arrayBuffer().then(b=>{
    const wb=XLSX.read(b,{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const data=XLSX.utils.sheet_to_json(ws,{header:1});
    show(avg(data));
  });
}

function avg(rows){
  const sums=[], cnts=[];
  rows.forEach(r=>{
    r.forEach((v,i)=>{
      if(typeof v==='number'&&!isNaN(v)){
        sums[i]=(sums[i]||0)+v;
        cnts[i]=(cnts[i]||0)+1;
      }
    });
  });
  return sums.map((s,i)=>cnts[i]? (s/cnts[i]).toFixed(2) : '');
}

function show(a){
  if(!a.length){out.textContent='숫자 데이터가 없습니다.';return;}
  const head=a.map((_,i)=>String.fromCharCode(65+i));
  const tbl=`<table>
      <tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>
      <tr>${a.map(v=>`<td>${v}</td>`).join('')}</tr>
    </table>`;
  out.innerHTML=tbl;
}
