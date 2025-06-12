/* === CELBIC|ANGLE_RPM_CALC === */
(() => {
  const π = Math.PI;
  const rpmEl = document.getElementById('rpm-input');
  const angleEl = document.getElementById('angle-input');
  const outDiv = document.getElementById('calc-result');

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

    outDiv.innerHTML = results.map(r => `
      <div class="result-row">
        <code class="result-text">${r.label} = ${r.str}</code>
        <button class="btn outline-secondary btn-sm copy-btn" aria-label="${r.label} 복사" data-copy="${r.str}">
          <i data-lucide="copy" class="w-4 h-4"></i>
        </button>
      </div>`).join('');
    if (window.lucide) lucide.createIcons();
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const original = btn.innerHTML;
    navigator.clipboard.writeText(btn.dataset.copy)
      .then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.innerHTML = original; }, 1200);
      })
      .catch(() => alert('복사 실패'));
  });
})();
