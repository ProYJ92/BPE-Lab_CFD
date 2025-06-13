(function(){
  if(window.lucide) return;
  window.lucide = {
    createIcons:function(){
      document.querySelectorAll('[data-lucide]').forEach(function(el){
        var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 24 24');
        svg.setAttribute('width','1em');
        svg.setAttribute('height','1em');
        svg.setAttribute('stroke','currentColor');
        svg.setAttribute('fill','none');
        svg.setAttribute('stroke-width','2');
        svg.setAttribute('stroke-linecap','round');
        svg.setAttribute('stroke-linejoin','round');
        svg.innerHTML='<circle cx="12" cy="12" r="10"></circle>';
        el.innerHTML='';
        el.appendChild(svg);
      });
    }
  };
})();
