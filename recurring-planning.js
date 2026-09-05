/* Horaire récurrent du semestre : 14 septembre au 17 décembre 2026. */
document.addEventListener('DOMContentLoaded', () => {
  const firstDay = '2026-09-14';
  const lastDay = '2026-12-17';
  const template = [
    [0, '08:32', 'Nendaz → Sion · Car postal 362', 'Personnel'],
    [0, '09:39', 'Sion → Lausanne Provence · IR95 + métro', 'Personnel'],
    [0, '11:15', 'FTP Physics · C4 · Lausanne', 'Cours'],
    [0, '13:40', 'Dîner · Poulet citron-herbes', 'Personnel'],
    [0, '15:00', 'MA HYBRD · A3 · Lausanne', 'Cours'],
    [0, '17:32', 'Lausanne Provence → Sion', 'Personnel'],
    [0, '20:01', 'Sion → Nendaz · Car postal 362', 'Personnel'],
    [0, '20:35', 'Souper · Wrap poulet', 'Repas'],

    [1, '08:32', 'Nendaz → Sion · Car postal 362', 'Personnel'],
    [1, '09:39', 'Sion → Lausanne Provence · IR95 + métro', 'Personnel'],
    [1, '11:15', 'FTP ModSim · A3 · Lausanne', 'Cours'],
    [1, '13:40', 'Dîner · Poulet curry-coco', 'Personnel'],
    [1, '15:00', 'FTP Multiphy · B2 · Lausanne', 'Cours'],
    [1, '17:30', 'CM QRM-A · B2 · Lausanne', 'Cours'],
    [1, '20:36', 'Lausanne → Sion', 'Personnel'],
    [1, '22:01', 'Sion → Nendaz · Car postal 362', 'Personnel'],
    [1, '22:30', 'Souper · Riz-poulet-carottes', 'Personnel'],

    [2, '05:50', 'Nendaz → Sion · Car postal 362', 'Personnel'],
    [2, '06:39', 'Sion → Lausanne Provence · IR95', 'Personnel'],
    [2, '08:45', 'FTP OrdDiff-A · B2 · Lausanne', 'Cours'],
    [2, '11:15', 'TSM FMechHeat · B2 · Lausanne', 'Cours'],
    [2, '13:40', 'Dîner · Poulet fajita', 'Personnel'],
    [2, '15:00', 'TSM CSM-A · A4 · Lausanne', 'Cours'],
    [2, '17:30', 'CM AdvProjMgmt · B2 · Lausanne', 'Cours'],
    [2, '20:36', 'Lausanne → Sion', 'Personnel'],
    [2, '22:01', 'Sion → Nendaz · Car postal 362', 'Personnel'],
    [2, '22:30', 'Souper · Omelette pommes de terre', 'Personnel'],

    [3, '05:50', 'Nendaz → Sion · Car postal 362', 'Personnel'],
    [3, '06:39', 'Sion → Lausanne Provence · IR95', 'Personnel'],
    [3, '08:45', 'FTP CompAlg · A6 · Lausanne', 'Cours'],
    [3, '12:30', 'Lausanne Provence → Genève', 'Personnel'],
    [3, '13:30', 'Dîner · Poulet teriyaki', 'Personnel'],
    [3, '14:40', 'MA CFD · LabMec · Genève', 'Cours'],
    [3, '18:05', 'Genève → Sion · IR90', 'Personnel'],
    [3, '20:01', 'Sion → Nendaz · Car postal 362', 'Personnel'],
    [3, '20:30', 'Souper · Wrap poulet', 'Repas']
  ].map(([day, time, title, kind]) => ({ day, time, title, kind }));

  const matchesTemplate = (event, day) => template.some(item =>
    item.day === day && item.time === event.time && item.title === event.title
  );
  const inSemester = date => date >= firstDay && date <= lastDay;

  draw = function () {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    range.textContent = start.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' }) + ' – ' + end.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' });
    week.innerHTML = '';

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + day);
      const dateKey = iso(date);
      const column = document.createElement('article');
      column.className = 'day';
      column.innerHTML = `<h2>${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][day]}<br><small>${date.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' })}</small></h2>`;

      const recurring = inSemester(dateKey)
        ? template.filter(item => item.day === day).map(item => ({ ...item, recurring: true }))
        : [];
      const personal = events.filter(event => event.date === dateKey && !matchesTemplate(event, day));
      const dayEvents = [...recurring, ...personal].sort((a, b) => a.time.localeCompare(b.time));

      if (!dayEvents.length) column.insertAdjacentHTML('beforeend', '<p class="empty">Rien de prévu</p>');
      dayEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = `event ${cls(event.kind)}`;
        card.innerHTML = `${event.recurring ? '' : '<button class="del" title="Supprimer">×</button>'}<b>${event.time || '—'} · ${event.title}</b>${event.kind}${event.recurring ? ' · horaire type' : ''}`;
        const deleteButton = card.querySelector('.del');
        if (deleteButton) deleteButton.onclick = () => {
          events.splice(events.indexOf(event), 1);
          save();
          draw();
        };
        column.append(card);
      });
      week.append(column);
    }
  };

  start = new Date('2026-09-14T12:00:00');
  draw();
  const branding = document.createElement('script');
  branding.src = 'branding.js';
  document.body.append(branding);
});
