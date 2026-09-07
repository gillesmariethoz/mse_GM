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

/* Télécharge le PDF actuellement ouvert sans quitter l’application. */
const saveButton = document.getElementById('savePdf');
if (saveButton && !document.getElementById('downloadPdf')) {
  const downloadPdf = document.createElement('button');
  downloadPdf.id = 'downloadPdf'; downloadPdf.className = 'tool'; downloadPdf.type = 'button';
  downloadPdf.textContent = '⇩ Télécharger le PDF';
  downloadPdf.onclick = () => {
    if (!sourceBytes) { pdfMessage.textContent = 'Ouvre d’abord un PDF.'; return; }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([sourceBytes], { type: 'application/pdf' }));
    link.download = fileName || 'document.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  saveButton.before(downloadPdf);
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
const courseBarStyle = document.createElement('style');
courseBarStyle.textContent = '.course-card .bar{display:block!important;position:relative!important;height:5px!important;overflow:hidden!important}.course-card .bar i{position:absolute!important;inset:0 auto 0 0!important;height:100%!important;max-width:100%!important;margin:0!important}';
document.head.append(courseBarStyle);
courseBarStyle.textContent += '.today-grid{align-items:start}.task-list{min-height:0}.new-task{flex-wrap:wrap}.new-task #taskInput{min-width:210px}.new-task #taskDate,.new-task #taskCourse{border:1px solid var(--line);border-radius:9px;padding:10px;background:var(--card);color:var(--ink);font:inherit}.task-main{display:block}.task-meta{display:block;margin-top:3px;font-size:11px;color:var(--muted)}html[data-theme="dark"] .connect-drive{background:#edf3ef!important;color:#102025!important}html[data-theme="dark"] .connect-drive:disabled{background:#aab9b2!important;color:#34413c!important}';
courseBarStyle.textContent += '.mobile-menu-toggle,.mobile-menu-panel{display:none}@media(max-width:780px){.mobile-nav{display:none!important}#installApp{display:none}main>header{position:relative;padding-left:47px}.mobile-menu-toggle{display:grid;place-items:center;position:absolute;left:0;top:0;width:38px;height:38px;padding:0;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font-size:20px;cursor:pointer}.mobile-menu-panel{position:absolute;z-index:30;top:47px;left:0;width:205px;padding:8px;border:1px solid var(--line);border-radius:12px;background:var(--card);box-shadow:0 16px 36px #101a2026}.mobile-menu-panel.open{display:grid;gap:3px}.mobile-menu-panel button{border:0;border-radius:8px;padding:11px;text-align:left;background:transparent;color:var(--ink);font:inherit;font-weight:700;cursor:pointer}.mobile-menu-panel button:hover{background:var(--soft)}}';

/* Navigation complète sur téléphone : un seul burger en haut à gauche. */
const topHeader = document.querySelector('main > header');
if (topHeader && !document.getElementById('mobileMenuToggle')) {
  const menuToggle = document.createElement('button');
  menuToggle.id = 'mobileMenuToggle'; menuToggle.className = 'mobile-menu-toggle'; menuToggle.type = 'button'; menuToggle.title = 'Ouvrir le menu'; menuToggle.setAttribute('aria-label', 'Ouvrir le menu'); menuToggle.textContent = '☰';
  const menuPanel = document.createElement('div');
  menuPanel.id = 'mobileMenuPanel'; menuPanel.className = 'mobile-menu-panel';
  menuPanel.innerHTML = '<button data-mobile-view="today">⌂ Accueil</button><button data-mobile-view="planning">▦ Planning</button><button data-mobile-view="grades">⌁ Notes</button><button data-mobile-view="courses">◫ Mes cours</button><button data-mobile-view="pdf">✎ Mes PDF</button><button id="mobileInstallApp">⇩ Installer l’app</button>';
  menuToggle.onclick = () => menuPanel.classList.toggle('open');
  menuPanel.querySelectorAll('[data-mobile-view]').forEach(button => button.onclick = () => {
    const target = button.dataset.mobileView;
    menuPanel.classList.remove('open');
    if (target === 'pdf') { show('courses'); setTimeout(() => document.getElementById('courseExplorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }
    else show(target);
  });
  topHeader.prepend(menuToggle, menuPanel);
}

/* Installation PWA : l’application peut être ajoutée au téléphone ou au PC. */
let installEvent;
const installApp = document.createElement('button');
installApp.id = 'installApp'; installApp.className = 'theme-toggle'; installApp.type = 'button';
installApp.textContent = '⇩ Installer l’app'; installApp.title = 'Installer Master Mariethoz';
document.getElementById('themeToggle')?.before(installApp);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installEvent = event; installApp.hidden = false; });
window.addEventListener('appinstalled', () => { installEvent = null; installApp.hidden = true; });
installApp.onclick = async () => {
  if (installEvent) {
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    installApp.hidden = true;
    return;
  }
  alert('Pour installer l’application, ouvre le menu du navigateur puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».');
};
document.getElementById('mobileInstallApp')?.addEventListener('click', () => { document.getElementById('mobileMenuPanel')?.classList.remove('open'); installApp.click(); });

/* Les tâches peuvent être reliées à un cours et à une échéance. */
const taskDate = document.createElement('input');
taskDate.id = 'taskDate'; taskDate.type = 'date'; taskDate.setAttribute('aria-label', 'Échéance');
const taskCourse = document.createElement('select');
taskCourse.id = 'taskCourse'; taskCourse.setAttribute('aria-label', 'Cours concerné');
taskCourse.innerHTML = '<option value="">Cours (facultatif)</option>' + modules.map(name => '<option>' + escape(name) + '</option>').join('');
taskInput.after(taskDate, taskCourse);
renderTasks = function () {
  taskList.innerHTML = tasks.map((task, index) => {
    const details = [task.course, task.date ? new Date(task.date + 'T12:00:00').toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' }) : ''].filter(Boolean).join(' · ');
    return `<label class="task ${task.done ? 'done' : ''}"><input type="checkbox" data-task="${index}" ${task.done ? 'checked' : ''}><span class="task-main">${escape(task.text)}${details ? `<small class="task-meta">${escape(details)}</small>` : ''}</span><button data-remove="${index}">×</button></label>`;
  }).join('');
  taskCount.textContent = tasks.filter(task => !task.done).length;
  dashboard();
  document.querySelectorAll('[data-task]').forEach(input => input.onchange = () => { tasks[input.dataset.task].done = input.checked; store('mse.online.tasks', tasks); renderTasks(); });
  document.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { tasks.splice(button.dataset.remove, 1); store('mse.online.tasks', tasks); renderTasks(); });
};
taskForm.onsubmit = event => {
  event.preventDefault();
  if (!taskInput.value.trim()) return;
  tasks.unshift({ text: taskInput.value.trim(), date: taskDate.value, course: taskCourse.value, done: false });
  taskInput.value = ''; taskDate.value = ''; taskCourse.value = '';
  store('mse.online.tasks', tasks); renderTasks();
};
renderTasks();
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
