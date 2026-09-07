/* Correctif du lecteur PDF : la zone de rendu est une classe CSS, pas un id. */
renderPdf = async function () {
  const page = await pdfDoc.getPage(pdfPage);
  const base = page.getViewport({ scale: 1 });
  const wrap = document.querySelector('.canvas-wrap');
  const available = Math.max(300, (wrap ? wrap.clientWidth : 300) - 3);
  const viewport = page.getViewport({ scale: Math.min(1.45, available / base.width) });
  scaleOut = devicePixelRatio || 1;
  [pdfCanvas, inkCanvas].forEach(canvas => {
    canvas.width = viewport.width * scaleOut;
    canvas.height = viewport.height * scaleOut;
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';
  });
  await page.render({
    canvasContext: pdfCanvas.getContext('2d'), viewport,
    transform: scaleOut === 1 ? null : [scaleOut, 0, 0, scaleOut, 0, 0]
  }).promise;
  draw();
  pageInfo.textContent = 'Page ' + pdfPage + ' / ' + pdfDoc.numPages;
  prevPage.disabled = pdfPage === 1;
  nextPage.disabled = pdfPage === pdfDoc.numPages;
};

/* Le lien de retour dans les vues intégrées créait une seconde application. */
document.querySelectorAll('.legacy-frame').forEach(frame => frame.addEventListener('load', () => {
  try {
    frame.contentDocument.querySelector('a[href="index.html"]')?.remove();
  } catch (error) {}
}));

/* Annule uniquement la dernière annotation non encore enregistrée. */
const readerTools = document.querySelector('.reader-tools > div:nth-child(2)');
if (readerTools && !document.getElementById('undoPdf')) {
  const undoPdf = document.createElement('button');
  undoPdf.id = 'undoPdf';
  undoPdf.className = 'tool';
  undoPdf.type = 'button';
  undoPdf.textContent = '↶ Annuler';
  undoPdf.title = 'Annuler la dernière annotation';
  undoPdf.onclick = () => {
    if (!pending.length) {
      pdfMessage.textContent = 'Il n’y a aucune annotation à annuler.';
      return;
    }
    pending.pop();
    draw();
    pdfMessage.textContent = 'Dernière annotation annulée.';
  };
  readerTools.insertBefore(undoPdf, textInput);
}

/* Les quatre dossiers locaux restent visibles sous le cours sélectionné. */
window.localSection = window.localSection || 'cours';
localFiles = async function () {
  driveTitle.textContent = 'Documents · ' + modules[selected];
  driveFiles.classList.remove('hidden');
  driveFiles.innerHTML = '<p class="empty">Chargement des dossiers locaux…</p>';
  try {
    const sections = [['cours','Cours'],['exercices','Exercices'],['projets','Projets'],['resumes','Résumés']];
    const groups = await Promise.all(sections.map(async pair => ({
      id: pair[0], label: pair[1], files: await fetch('/api/files?m=' + selected + '&s=' + pair[0]).then(response => response.ok ? response.json() : [])
    })));
    const group = groups.find(item => item.id === window.localSection) || groups[0];
    const files = group.files.filter(file => /\.pdf$/i.test(file.name)).map(file => ({ ...file, section: group.id, label: group.label, local: true, module: selected }));
    const tabs = '<div class="folder-tabs">' + groups.map(item => '<button class="folder-tab ' + (item.id === group.id ? 'active' : '') + '" data-folder="' + item.id + '">' + item.label + ' <small>(' + item.files.length + ')</small></button>').join('') + '</div>';
    const cards = files.length ? files.map((file, index) => '<button class="drive-file" data-local-index="' + index + '"><b>' + escape(file.name) + '</b><small>' + file.label + ' · ' + Math.ceil(file.size / 1024) + ' Ko</small></button>').join('') : '<p class="empty">Aucun PDF dans « ' + group.label + ' » pour le moment.</p>';
    driveFiles.innerHTML = tabs + cards;
    driveFiles.querySelectorAll('[data-folder]').forEach(button => button.onclick = () => { window.localSection = button.dataset.folder; localFiles(); });
    driveFiles.querySelectorAll('[data-local-index]').forEach(button => button.onclick = () => openFile(files[+button.dataset.localIndex]));
  } catch (error) { driveFiles.innerHTML = '<p class="empty">Impossible de lire les dossiers locaux.</p>'; }
};
if (LOCAL_MODE) localFiles();

const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
function syncLegacyTheme(dark) {
  document.querySelectorAll('.legacy-frame').forEach(frame => {
    try {
      const documentInside = frame.contentDocument;
      documentInside.documentElement.dataset.theme = dark ? 'dark' : 'light';
      let embeddedStyle = documentInside.getElementById('mse-embedded-style');
      if (!embeddedStyle) {
        embeddedStyle = documentInside.createElement('style');
        embeddedStyle.id = 'mse-embedded-style';
        documentInside.head.append(embeddedStyle);
      }
      embeddedStyle.textContent = 'body::before{display:none!important}.gm-identity-row,.gm-app-nav,#theme{display:none!important}a[href="index.html"]{display:none!important}';
      const button = documentInside.getElementById('theme');
      if (button) button.textContent = dark ? '☀︎ Clair' : '☾ Sombre';
    } catch (error) {}
  });
}
function paintTheme() {
  const dark = localStorage.getItem('mse.online.theme') === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('mse.theme', dark ? 'dark' : 'light');
  themeText.textContent = dark ? 'Mode clair' : 'Mode sombre';
  syncLegacyTheme(dark);
}
themeToggle.onclick = () => {
  localStorage.setItem('mse.online.theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  paintTheme();
};
paintTheme();
document.querySelectorAll('.legacy-frame').forEach(frame => frame.addEventListener('load', paintTheme));
