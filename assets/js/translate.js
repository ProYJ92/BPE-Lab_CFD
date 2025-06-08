document.addEventListener('DOMContentLoaded', () => {
  let select = document.getElementById('langSwitcher');
  if (!select) {
    select = document.createElement('select');
    select.id = 'langSwitcher';
    ['ko','en','zh'].forEach(l => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      select.appendChild(opt);
    });
    document.body.prepend(select);
  }
  const saved = localStorage.getItem('lang') || 'ko';
  select.value = saved;
  loadLang(saved);
  select.addEventListener('change', (e) => {
    const lang = e.target.value;
    loadLang(lang);
    localStorage.setItem('lang', lang);
  });
});

async function loadLang(lang) {
  try {
    const res = await fetch(`assets/i18n/${lang}.json`);
    const data = await res.json();
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const txt = data[key];
      if (!txt) return;
      if (el.placeholder !== undefined && el.tagName === 'INPUT') {
        el.placeholder = txt;
      } else {
        el.textContent = txt;
      }
    });
  } catch(err) {
    console.warn('i18n load error', err);
  }
}
