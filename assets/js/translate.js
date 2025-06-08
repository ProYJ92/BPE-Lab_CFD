window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('langSwitcher');
  const lang = localStorage.getItem('lang') || 'ko';
  if (select) {
    select.value = lang;
    select.addEventListener('change', () => {
      localStorage.setItem('lang', select.value);
      location.reload();
    });
  }
  fetch(`assets/i18n/${lang}.json`)
    .then(r => r.json())
    .then(data => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) el.textContent = data[key];
      });
    });
});

