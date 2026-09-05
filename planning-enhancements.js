(() => {
  const printCss = `
    @page { size: A4 landscape; margin: 5mm; }
    @media print {
      html,body{background:#fff!important;color:#17212b!important}
      body::before,.gm-footer,.gm-app-nav,.gm-identity-row,header a,.controls,.panel{display:none!important}
      .w{max-width:none!important;padding:0!important}
      header{display:block!important;border:0!important;padding:0 0 2mm!important;margin:0!important}
      header h1{font-size:19pt!important;margin:0!important}
      header .ey,header .muted{display:block!important;color:#56616a!important}
      .week{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:2mm!important;margin:0!important}
      .day{min-height:0!important;padding:2mm!important;border:1px solid #9da5a7!important;break-inside:avoid!important}
      .day h2{font-size:8pt!important;margin:0 0 1mm!important}
      .event{margin:1mm 0!important;padding:1.2mm!important;font-size:6.4pt!important;line-height:1.15!important;break-inside:avoid!important}
      .event button{display:none!important}
      .event b{font-size:6.4pt!important}
    }`;
  document.head.insertAdjacentHTML('beforeend', `<style id="mse-print-style">${printCss}</style>`);
  window.addEventListener('DOMContentLoaded', () => {
    const theme = document.getElementById('theme');
    if (theme && !document.getElementById('print')) {
      const button = document.createElement('button');
      button.id = 'print'; button.className = 'btn'; button.type = 'button'; button.textContent = 'Imprimer';
      button.onclick = () => window.print(); theme.before(button);
    }
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); window.print(); }
    });
    if (!document.querySelector('script[src="branding.js"]')) {
      const branding = document.createElement('script'); branding.src = 'branding.js'; document.body.append(branding);
    }
  });
})();
