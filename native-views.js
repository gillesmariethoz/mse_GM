(() => {
  const style = document.createElement('style');
  style.textContent = `
    .native-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}.native-plan-tools,.native-plan-form{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.native-plan-tools{justify-content:flex-end;margin-bottom:14px}.native-button,.native-plan-form input,.native-plan-form select,.native-mark{font:inherit;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;background:var(--card)}.native-button{font-weight:750;cursor:pointer}.native-button.primary{border:0;background:var(--ink);color:#fff}.native-plan-form{padding:12px;margin-bottom:14px;border:1px solid var(--line);border-radius:12px;background:var(--paper)}.native-plan-form input:first-child{flex:1;min-width:180px}.native-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}.native-day{min-height:210px;padding:9px;border:1px solid var(--line);border-radius:11px}.native-day h3{font-size:12px;margin:0 0 7px}.native-day h3 small{display:block;color:var(--muted);margin-top:2px}.native-event{position:relative;margin:6px 0;padding:7px 19px 7px 8px;border-left:3px solid #315d7d;border-radius:6px;background:color-mix(in srgb,#315d7d 9%,var(--card));font-size:11px}.native-event.personnel{border-color:#a86e18;background:color-mix(in srgb,#a86e18 10%,var(--card))}.native-event.revision{border-color:#356d45;background:color-mix(in srgb,#356d45 10%,var(--card))}.native-event.echeance{border-color:var(--accent);background:var(--soft)}.native-event b{display:block}.native-delete{position:absolute;right:5px;top:4px;border:0;background:none;color:var(--accent);cursor:pointer}.native-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.native-stat{padding:13px;border:1px solid var(--line);border-radius:12px}.native-stat b{display:block;font-size:25px}.native-stat small{color:var(--muted)}.native-grade-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.native-module{padding:16px;border:1px solid var(--line);border-radius:14px}.native-module-head{display:flex;justify-content:space-between;gap:8px;padding-bottom:10px;border-bottom:1px solid var(--line)}.native-module h3{margin:0 0 3px}.native-score{min-width:67px;text-align:center;padding:6px;border-radius:8px;background:var(--soft);color:var(--accent)}.native-score b{display:block;font-size:19px}.native-component{display:grid;grid-template-columns:1fr 72px;gap:8px;align-items:center;padding:9px 0}.native-component+.native-component{border-top:1px dashed var(--line)}.native-component label{font-weight:650;font-size:13px}.native-component label small{display:block;color:var(--muted);font-weight:400;margin-top:2px}.native-mark{width:72px;text-align:center;font-weight:700}.native-status{display:inline-block;padding:5px 8px;border-radius:999px;background:var(--soft);font-size:11px;font-weight:700;color:var(--muted)}.native-status.ok{color:#356d45}@media(max-width:850px){.native-week{grid-template-columns:repeat(2,minmax(0,1fr))}.native-grade-grid{grid-template-columns:1fr}}@media(max-width:520px){.native-summary{grid-template-columns:1fr}.native-plan-tools{justify-content:flex-start}.native-plan-form input:first-child{min-width:100%}}`;
  document.head.append(style);
  style.textContent += '.native-stat,.native-module{background:var(--card)}.native-info{margin-top:14px}.native-info h3{margin:0 0 10px}.native-info-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}.native-info table{width:100%;border-collapse:collapse;font-size:12px}.native-info th,.native-info td{padding:7px 4px;border-bottom:1px solid var(--line);text-align:left}.native-info th{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em}@media(max-width:1100px){.native-week{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:650px){.native-week{grid-template-columns:repeat(2,minmax(0,1fr))}.native-info-grid{grid-template-columns:1fr}}';

  const get = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const put = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const seed = [
    ['2026-09-14','08:32','Nendaz → Sion · Car postal 362','Personnel'],['2026-09-14','09:39','Sion → Lausanne Provence · IR95 + métro','Personnel'],['2026-09-14','11:15','FTP Physics · C4 · Lausanne','Cours'],['2026-09-14','13:40','Dîner · Poulet citron-herbes','Personnel'],['2026-09-14','20:35','Souper · Wrap poulet','Personnel'],
    ['2026-09-15','08:32','Nendaz → Sion · Car postal 362','Personnel'],['2026-09-15','09:39','Sion → Lausanne Provence · IR95 + métro','Personnel'],['2026-09-15','11:15','FTP ModSim · A3 · Lausanne','Cours'],['2026-09-15','13:40','Dîner · Poulet curry-coco','Personnel'],['2026-09-15','22:30','Souper · Riz-poulet-carottes','Personnel'],
    ['2026-09-16','05:50','Nendaz → Sion · Car postal 362','Personnel'],['2026-09-16','06:39','Sion → Lausanne Provence · IR95','Personnel'],['2026-09-16','08:45','FTP OrdDiff-A · B2 · Lausanne','Cours'],['2026-09-16','13:40','Dîner · Poulet fajita','Personnel'],['2026-09-17','08:45','FTP CompAlg · A6 · Lausanne','Cours'],['2026-09-17','14:40','MA CFD · LabMec · Genève','Cours'],['2026-09-17','20:30','Souper · Wrap poulet','Personnel']
  ].map(([date,time,title,kind]) => ({date,time,title,kind}));
  const completeSeed = [
    ['2026-09-14','15:00','MA HYBRD · A3 · Lausanne','Cours'],['2026-09-14','17:32','Lausanne Provence → Sion','Personnel'],['2026-09-14','20:01','Sion → Nendaz · Car postal 362','Personnel'],
    ['2026-09-15','15:00','FTP Multiphy · B2 · Lausanne','Cours'],['2026-09-15','17:30','CM QRM-A · B2 · Lausanne','Cours'],['2026-09-15','20:36','Lausanne → Sion','Personnel'],['2026-09-15','22:01','Sion → Nendaz · Car postal 362','Personnel'],
    ['2026-09-16','11:15','TSM FMechHeat · B2 · Lausanne','Cours'],['2026-09-16','15:00','TSM CSM-A · A4 · Lausanne','Cours'],['2026-09-16','17:30','CM AdvProjMgmt · B2 · Lausanne','Cours'],['2026-09-16','20:36','Lausanne → Sion','Personnel'],['2026-09-16','22:01','Sion → Nendaz · Car postal 362','Personnel'],['2026-09-16','22:30','Souper · Omelette pommes de terre','Personnel'],
    ['2026-09-17','05:50','Nendaz → Sion · Car postal 362','Personnel'],['2026-09-17','06:39','Sion → Lausanne Provence · IR95','Personnel'],['2026-09-17','12:30','Lausanne Provence → Genève','Personnel'],['2026-09-17','18:05','Genève → Sion · IR90','Personnel'],['2026-09-17','20:01','Sion → Nendaz · Car postal 362','Personnel'],['2026-09-17','13:30','Dîner · Poulet teriyaki','Personnel']
  ].map(([date,time,title,kind]) => ({date,time,title,kind}));
  let events = get('mse.events', []); [...seed,...completeSeed].forEach(item => { if (!events.some(event => event.date===item.date && event.time===item.time && event.title===item.title)) events.push(item); }); put('mse.events', events);
  const semesterStart = new Date('2026-09-14T12:00:00');
  const semesterEnd = new Date('2026-12-17T12:00:00');
  const routine = [...seed, ...completeSeed].map(item => ({ ...item, offset: Math.round((new Date(item.date + 'T12:00:00') - semesterStart) / 86400000) }));
  for (let week = 1; ; week += 1) {
    let any = false;
    routine.forEach(item => {
      const date = new Date(semesterStart); date.setDate(date.getDate() + item.offset + week * 7);
      if (date > semesterEnd) return;
      any = true;
      const next = { date: date.toISOString().slice(0,10), time: item.time, title: item.title, kind: item.kind };
      if (!events.some(event => event.date === next.date && event.time === next.time && event.title === next.title)) events.push(next);
    });
    if (!any) break;
  }
  put('mse.events', events);
  const monday = date => { const copy = new Date(date); copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7)); copy.setHours(0,0,0,0); return copy; };
  const iso = date => date.toISOString().slice(0,10);
  let weekStart = new Date('2026-09-14T12:00:00');
  const planRoot = document.getElementById('nativePlanning');
  const renderPlan = () => {
    const end = new Date(weekStart); end.setDate(end.getDate()+6);
    const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    planRoot.innerHTML = `<article class="native-card"><div class="native-plan-tools"><button class="native-button" data-plan="prev">‹</button><b>${weekStart.toLocaleDateString('fr-CH',{day:'2-digit',month:'short'})} – ${end.toLocaleDateString('fr-CH',{day:'2-digit',month:'short'})}</b><button class="native-button" data-plan="next">›</button><button class="native-button" data-plan="today">Aujourd’hui</button></div><form class="native-plan-form" id="nativePlanForm"><input id="nativePlanTitle" placeholder="Ex. Réviser les EDO" required><input id="nativePlanDate" type="date" required><input id="nativePlanTime" type="time"><select id="nativePlanKind"><option>Cours</option><option>Révision</option><option>Échéance</option><option>Personnel</option></select><button class="native-button primary">Ajouter</button></form><div class="native-week">${days.map((name,index) => { const day = new Date(weekStart); day.setDate(day.getDate()+index); const content = events.filter(event => event.date === iso(day)).sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(event => `<div class="native-event ${event.kind.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}"><button class="native-delete" data-remove="${events.indexOf(event)}">×</button><b>${esc(event.time||'—')} · ${esc(event.title)}</b>${esc(event.kind)}</div>`).join('') || '<small>Rien de prévu</small>'; return `<div class="native-day"><h3>${name}<small>${day.toLocaleDateString('fr-CH',{day:'2-digit',month:'2-digit'})}</small></h3>${content}</div>`; }).join('')}</div></article>`;
    planRoot.querySelectorAll('[data-plan]').forEach(button => button.onclick = () => { if(button.dataset.plan==='prev') weekStart.setDate(weekStart.getDate()-7); if(button.dataset.plan==='next') weekStart.setDate(weekStart.getDate()+7); if(button.dataset.plan==='today') weekStart=monday(new Date()); renderPlan(); });
    planRoot.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { events.splice(+button.dataset.remove,1); put('mse.events',events); renderPlan(); });
    planRoot.querySelector('#nativePlanForm').onsubmit = event => { event.preventDefault(); events.push({title:planRoot.querySelector('#nativePlanTitle').value.trim(),date:planRoot.querySelector('#nativePlanDate').value,time:planRoot.querySelector('#nativePlanTime').value,kind:planRoot.querySelector('#nativePlanKind').value}); put('mse.events',events); renderPlan(); };
    const info = document.createElement('section');
    info.className = 'native-card native-info';
    info.innerHTML = `<h3>Trajets et repas — horaires utiles</h3><div class="native-info-grid"><div><table><thead><tr><th>Jour</th><th>Trajet</th><th>Départ</th><th>Arrivée</th></tr></thead><tbody><tr><td>Lun / Mar</td><td>Nendaz → Sion · Car 362</td><td>08:32</td><td>09:02</td></tr><tr><td>Lun / Mar</td><td>Sion → Lausanne Provence · IR95 + métro</td><td>09:39</td><td>10:59</td></tr><tr><td>Mer / Jeu</td><td>Nendaz → Sion · Car 362</td><td>05:50</td><td>06:20</td></tr><tr><td>Mer / Jeu</td><td>Sion → Lausanne Provence · IR95</td><td>06:39</td><td>08:13</td></tr><tr><td>Jeu</td><td>Lausanne Provence → Genève</td><td>12:30</td><td>13:25</td></tr><tr><td>Jeu</td><td>Genève → Sion · IR90</td><td>18:05</td><td>19:56</td></tr><tr><td>Lun / Jeu</td><td>Sion → Nendaz · Car 362</td><td>20:01</td><td>20:32</td></tr><tr><td>Mar / Mer</td><td>Sion → Nendaz · Car 362</td><td>22:01</td><td>22:28</td></tr></tbody></table></div><div><table><thead><tr><th>Jour</th><th>Dîner</th><th>Souper</th></tr></thead><tbody><tr><td>Lundi</td><td>13:40 · Poulet citron-herbes</td><td>20:35 · Wrap poulet</td></tr><tr><td>Mardi</td><td>13:40 · Poulet curry-coco</td><td>22:30 · Riz-poulet-carottes</td></tr><tr><td>Mercredi</td><td>13:40 · Poulet fajita</td><td>22:30 · Omelette pommes de terre</td></tr><tr><td>Jeudi</td><td>13:30 · Poulet teriyaki</td><td>20:30 · Wrap poulet</td></tr></tbody></table></div></div>`;
    planRoot.append(info);
  };

  const moduleSpecs = [['Physics',[['Examen final',1]]],['HYBRD',[['Projet / continu',.5,true],['Examen écrit',.5]]],['ModSim',[['Examen final',1]]],['Multiphy',[['Examen final',1]]],['QRM',[['Travail semestre',.3],['Examen écrit',.7]]],['OrdDiff',[['Examen final',1]]],['FMechHeat',[['Examen final',1]]],['CSM',[['Examen final',1]]],['Adv. Project Mgmt',[['Projet',1/3],['Examen écrit',2/3]]],['CompAlg',[['Examen final',1]]],['CFD',[['Projet / continu',.5,true],['Examen oral',.5]]]];
  let marks = get('mse.marks', {});
  const gradeRoot = document.getElementById('nativeGrades');
  const isMark = value => value !== '' && value !== undefined && +value >= 1 && +value <= 6;
  const markList = value => Array.isArray(value) ? value : (value === undefined || value === '' ? [] : [value]);
  const renderGrades = () => {
    let total = 0, complete = 0, passed = 0, finals = {};
    const cards = moduleSpecs.map(([name, parts], index) => {
      const values = marks[index] || {};
      const scores = parts.map(([, , multi], partIndex) => {
        const list = multi ? markList(values[partIndex]) : [values[partIndex]];
        return list.length && list.every(isMark) ? list.reduce((sum, mark) => sum + (+mark), 0) / list.length : null;
      });
      const done = scores.every(score => score !== null);
      const grade = done ? parts.reduce((sum, part, partIndex) => sum + part[1] * scores[partIndex], 0) : null;
      finals[index] = grade;
      if (done) { complete += 1; total += grade; if (grade >= 4) passed += 1; }
      const fields = parts.map(([label, weight, multi], partIndex) => {
        if (!multi) return `<div class="native-component"><label>${label}<small>Compte pour ${Math.round(weight * 100)}% du module</small></label><input class="native-mark" data-mark-module="${index}" data-mark-part="${partIndex}" type="number" min="1" max="6" step="0.1" inputmode="decimal" placeholder="—" value="${values[partIndex] ?? ''}"></div>`;
        const list = markList(values[partIndex]);
        const inputs = (list.length ? list : ['']).map((mark, markIndex) => `<input class="native-mark" data-mark-module="${index}" data-mark-part="${partIndex}" data-mark-index="${markIndex}" type="number" min="1" max="6" step="0.1" inputmode="decimal" placeholder="—" value="${mark}">`).join('');
        return `<div class="native-component" style="display:block"><label>${label}<small>La moyenne de tes contrôles continus compte pour ${Math.round(weight * 100)}% du module</small></label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${inputs}<button class="native-button" data-add-mark="${index}" data-add-part="${partIndex}" type="button">+ Ajouter une note</button></div></div>`;
      }).join('');
      const status = done ? (grade >= 4 ? '✓ Module validé' : 'À consolider') : `${scores.filter(score => score !== null).length} / ${parts.length} composante${parts.length > 1 ? 's' : ''}`;
      return `<article class="native-module"><div class="native-module-head"><div><h3>${name}</h3><small>3 ECTS</small></div><div class="native-score"><b>${grade === null ? '—' : grade.toFixed(2)}</b><small>module</small></div></div>${fields}<span class="native-status ${done && grade >= 4 ? 'ok' : ''}">${status}</span></article>`;
    }).join('');
    gradeRoot.innerHTML = `<div class="native-summary"><div class="native-stat"><b>${complete ? (total / complete).toFixed(2) : '—'}</b><small>Moyenne actuelle</small></div><div class="native-stat"><b>${complete} / 11</b><small>modules complets</small></div><div class="native-stat"><b>${passed}</b><small>modules validés</small></div></div><div class="native-grade-grid">${cards}</div>`;
    put('mse.grades', finals);
    gradeRoot.querySelectorAll('[data-mark-module]').forEach(input => input.onchange = () => {
      const moduleIndex = input.dataset.markModule, partIndex = input.dataset.markPart, markIndex = input.dataset.markIndex;
      marks[moduleIndex] ??= {};
      if (markIndex === undefined) { if (input.value === '') delete marks[moduleIndex][partIndex]; else marks[moduleIndex][partIndex] = input.value; }
      else { const list = markList(marks[moduleIndex][partIndex]); if (input.value === '') list.splice(+markIndex, 1); else list[+markIndex] = input.value; marks[moduleIndex][partIndex] = list; }
      put('mse.marks', marks); renderGrades();
    });
    gradeRoot.querySelectorAll('[data-add-mark]').forEach(button => button.onclick = () => { const moduleIndex = button.dataset.addMark, partIndex = button.dataset.addPart; marks[moduleIndex] ??= {}; marks[moduleIndex][partIndex] = markList(marks[moduleIndex][partIndex]); marks[moduleIndex][partIndex].push(''); put('mse.marks', marks); renderGrades(); });
  };
  renderPlan(); renderGrades();
})();
