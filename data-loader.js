/* ============================================
   WC 2026 — single-source data loader.
   Fetches data/live.json once per page,
   caches at window.WC.data, fires "wc:ready".
   ============================================ */
(function(){
  if (window.WC && window.WC.data) return;
  window.WC = window.WC || {};
  window.WC.ready = new Promise((resolve, reject) => {
    fetch('data/live.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('live.json ' + r.status); return r.json(); })
      .then(json => {
        window.WC.data = json;
        document.dispatchEvent(new CustomEvent('wc:ready', { detail: json }));
        resolve(json);
      })
      .catch(err => {
        console.error('[WC] failed to load data/live.json', err);
        document.dispatchEvent(new CustomEvent('wc:error', { detail: err }));
        reject(err);
      });
  });
  // Convenience helpers, all read from window.WC.data
  window.WC.helpers = {
    teamByCode(code) {
      const data = window.WC.data;
      if (!data) return null;
      for (const g of data.groups) {
        const t = g.teams.find(t => t.code === code);
        if (t) return t;
      }
      return null;
    },
    // Compute group standings from completed matches
    computeStandings(letter) {
      const data = window.WC.data;
      if (!data) return [];
      const group = data.groups.find(g => g.letter === letter);
      if (!group) return [];
      const stats = {};
      group.teams.forEach(t => {
        stats[t.code] = { code: t.code, name: t.name, flag: t.flag,
          P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
      });
      data.matches
        .filter(m => m.group === letter && m.result &&
                     stats[m.home.code] && stats[m.away.code])
        .forEach(m => {
          const h = stats[m.home.code], a = stats[m.away.code];
          h.P++; a.P++;
          h.GF += m.result.home; h.GA += m.result.away; h.GD = h.GF - h.GA;
          a.GF += m.result.away; a.GA += m.result.home; a.GD = a.GF - a.GA;
          if (m.result.home > m.result.away) { h.W++; a.L++; h.Pts += 3; }
          else if (m.result.home < m.result.away) { a.W++; h.L++; a.Pts += 3; }
          else { h.D++; a.D++; h.Pts++; a.Pts++; }
        });
      return Object.values(stats).sort((a,b) =>
        (b.Pts - a.Pts) || (b.GD - a.GD) || (b.GF - a.GF) || a.name.localeCompare(b.name)
      );
    }
  };
})();
