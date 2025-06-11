/* === CELBIC|ANGLE_RPM_CALC === */
(() => {
  const π = Math.PI;
  const rpmEl = document.getElementById('rpm-input');
  const angleEl = document.getElementById('angle-input');
  const outUl = document.getElementById('calc-result');

  document.getElementById('calc-btn').addEventListener('click', () => {
    const rpm = parseFloat(rpmEl.value);
    const angle = parseFloat(angleEl.value);
    if (isNaN(rpm) || isNaN(angle)) return;

    const angleRad = angle * π / 180;
    const baseVal = rpm * angle * π / 360;
    const omega = rpm * 2 * π / 60;
    const yVal = -2 * baseVal / Math.tan(angleRad);

    const results = [
      { label: 'X', str: `value=${baseVal}*cos(-${omega}*t);` },
      { label: 'Y', str: `${yVal}` },
      { label: 'Z', str: `value=${baseVal}*sin(-${omega}*t);` }
    ];

    outUl.innerHTML = results.map(r => `\n      <li><code>${r.label} = ${r.str}</code>\n          <button class="btn copy-btn" aria-label="${r.label} 복사" data-copy="${r.str}">복사</button></li>`).join('');
  });

  document.addEventListener('click', e => {
    if (!e.target.matches('.copy-btn')) return;
    navigator.clipboard.writeText(e.target.dataset.copy)
      .then(() => { e.target.textContent = 'Copied!'; })
      .catch(() => alert('복사 실패'));
  });
})();
