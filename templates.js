/* ============================================
   WC 2026 — render templates.
   Pure functions: take WC data, return HTML strings.
   Pages call WC.render.* on wc:ready.
   ============================================ */
(function(){
  window.WC = window.WC || {};
  const T = window.WC.render = {};

  // --- Match card (one fixture in the schedule list) ---
  T.matchCard = (m) => {
    const result = m.result
      ? `<span class="match-score">${m.result.home}–${m.result.away}</span>`
      : `<span class="match-vs">vs</span>`;
    const stageLabel = m.group && m.group !== '-' ? `GRP ${m.group}` : (m.stage || '').toUpperCase();
    // For knockouts we show the bracket placeholder name (e.g. "Winner Group A") instead of just the code
    const homeName = (m.stage && m.stage !== 'group') ? (m.home.name || m.home.code) : m.home.code;
    const awayName = (m.stage && m.stage !== 'group') ? (m.away.name || m.away.code) : m.away.code;
    return `<div class="match-card" data-city="${m.city}" data-date="${m.date}">
      <div class="match-row">
        <div class="match-meta">${m.id} · ${T._date(m.date)} · ${m.time} · ${stageLabel}</div>
        <div class="weather-slot" data-city="${m.city}" data-date="${m.date}">Loading…</div>
      </div>
      <div class="match-teams">${m.home.flag} ${homeName} ${result} ${m.away.flag} ${awayName}</div>
      <div class="match-stadium">📍 ${m.stadium || m.city}</div>
    </div>`;
  };

  T._date = (iso) => {
    // "2026-06-11" → "JUN 11"
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const [y,m,d] = iso.split('-');
    return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}`;
  };

  // --- Standings table for one group ---
  T.standingsCard = (letter) => {
    const rows = window.WC.helpers.computeStandings(letter);
    const trs = rows.map((t, i) => {
      const adv = i < 2 ? ' class="advance"' : '';
      const gd  = t.GD > 0 ? '+' + t.GD : t.GD;
      return `<tr${adv}>
        <td class="pos">${i+1}</td>
        <td class="team"><span class="flag">${t.flag}</span> ${t.name}</td>
        <td>${t.P}</td><td>${t.W}</td><td>${t.D}</td><td>${t.L}</td>
        <td>${t.GF}</td><td>${t.GA}</td><td>${gd}</td>
        <td class="pts">${t.Pts}</td>
      </tr>`;
    }).join('');
    return `<div class="grp-card" data-grp="${letter}">
      <div class="grp-head">GROUP ${letter}</div>
      <table class="grp-tbl">
        <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>${trs}</tbody>
      </table>
    </div>`;
  };

  // --- Trip page bits ---
  T.legRow = (l) => `<div class="leg">
    <div class="leg-date"><div class="d-num">${String(l.day).padStart(2,'0')}</div><div class="d-mon">${l.month}</div></div>
    <div>
      <div class="leg-route">${l.route.replace(/→/g, '<span class="arrow">→</span>')}</div>
      <div class="leg-meta">${l.meta}</div>
    </div>
  </div>`;

  T.rosterRow = (p) => `<div class="roster-row"><span class="rn">${p.num}</span> ${p.name}</div>`;

  T._resStatusClass = (s) => {
    const t = (s || '').toLowerCase();
    if (t.startsWith('booked') || t.startsWith('confirmed')) return 'pill-booked';
    if (t.startsWith('walk'))                                return 'pill-walkin';
    if (t.startsWith('on the plan'))                         return 'pill-plan';
    if (t.startsWith('to book') || t.startsWith('reserve'))  return 'pill-todo';
    if (t.startsWith('self'))                                return 'pill-self';
    return 'pill-plan';
  };
  T.reservationRow = (r) => `<tr>
    <td class="res-date">${r.dateRange}</td>
    <td>${r.city}</td>
    <td class="${(/—|TBD/.test(r.place)) ? 'res-tbd' : ''}">${r.place}${r.status ? ` <span class="res-pill ${T._resStatusClass(r.status)}">${r.status}</span>` : ''}</td>
  </tr>`;

  // Escape a string for safe use inside a double-quoted HTML attribute
  T._attr = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // CDMX day × meal × activity plan — one <tr> per day, four content cells.
  // ctx = { date: "Sat 20 Jun", meal: "breakfast|lunch|dinner|activity" } so each
  // real event (anything but a "tr" travel placeholder) gets an "Add to calendar" link.
  T._cdmxCell = (c, ctx) => {
    ctx = ctx || {};
    const isEvent = c && c.kind !== 'tr' && (c.text || c.loc);
    const cal = isEvent ? `
    <a class="cdmx-cal" href="#" role="button" aria-label="Add this to your calendar" title="Add to calendar"
       data-date="${T._attr(ctx.date)}" data-meal="${T._attr(ctx.meal)}"
       data-label="${T._attr(c.label)}" data-text="${T._attr(c.text)}" data-loc="${T._attr(c.loc)}">📅 Add to calendar</a>` : '';
    return `<div class="cdmx-cell cdmx-${(c && c.kind) || 'pl'}">
    <span class="cdmx-tag">${(c && c.label) || ''}</span>
    <span class="cdmx-v">${(c && c.text) || ''}${c && c.loc ? `<span class="cdmx-loc">${c.loc}</span>` : ''}</span>${cal}
  </div>`;
  };
  T._cdmxStack = (cells, ctx) => {
    if (!cells || !cells.length) return `<div class="cdmx-empty">—</div>`;
    return cells.map(c => T._cdmxCell(c, ctx)).join('');
  };
  T.cdmxPlanRow = (day) => `<tr${day.rowClass ? ` class="${day.rowClass}"` : ''}>
    <td class="cdmx-daycell"><span class="cdmx-day">${day.day}</span><span class="cdmx-daytag">${day.tag || ''}</span></td>
    <td>${T._cdmxStack(day.breakfast, { date: day.day, meal: 'breakfast' })}</td>
    <td>${T._cdmxStack(day.lunch,     { date: day.day, meal: 'lunch' })}</td>
    <td>${T._cdmxStack(day.dinner,    { date: day.day, meal: 'dinner' })}</td>
    <td>${T._cdmxStack(day.activity,  { date: day.day, meal: 'activity' })}</td>
  </tr>`;

  T.cityCard = (c) => `<div class="city ${c.code}">
    <div class="city-header">
      <div style="font-size: 28px; line-height: 1;">${c.emoji}</div>
      <div class="city-name">${c.name}</div>
      <div class="city-dates">${c.dates} <span class="city-nights">${c.nights} NIGHTS</span></div>
    </div>
    <div class="city-body">
      <div class="city-row"><div class="city-row-label">🍽️ Eat</div><div class="city-row-val">${c.eat}</div></div>
      <div class="city-row"><div class="city-row-label">🍹 Party</div><div class="city-row-val">${c.party}</div></div>
    </div>
  </div>`;

  // --- Country page WC history block ---
  T.wcHistory = (c) => {
    if (!c) return '';
    return `<div class="wch-grid">
      <div class="wch-cell"><div class="wch-num">${c.appearances}</div><div class="wch-lbl">Appearances</div></div>
      <div class="wch-cell wch-titles"><div class="wch-num">${c.titles}</div><div class="wch-lbl">Titles</div></div>
      <div class="wch-cell"><div class="wch-num">${c.finals}</div><div class="wch-lbl">Finals</div></div>
      <div class="wch-cell"><div class="wch-num">${c.semifinals}</div><div class="wch-lbl">Semifinals</div></div>
    </div>
    <div class="wch-best"><span class="wch-best-lbl">Best finish</span><span class="wch-best-val">${c.bestFinish}</span></div>
    <div class="wch-blurb">${c.blurb}</div>`;
  };
})();
