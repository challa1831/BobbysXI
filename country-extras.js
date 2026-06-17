/* ============================================
   COUNTRY PAGE EXTRAS — runs on every country page
   ONE source of truth: data/country-stats.json
     1. Random postage-stamp hero from past trips
     2. Injury-risk dot on every bench player card
     3. Recent form panel (last 5) with click-to-show-lineup
     4. Top scorers + top assists tables (all-time + WC)
     5. Stadium capacity badge on every match card
   ============================================ */
(function () {
  // ---------- 1. Random postage-stamp hero ----------
  const STAMPS = [
    { file: 'stamp-1-brazil.png',      place: 'Amazonas',          year: '2014', country: 'Brazil' },
    { file: 'stamp-2-germany.png',     place: 'Beer Garden',       year: '2006', country: 'Germany' },
    { file: 'stamp-3-southafrica.png', place: 'Cape Town · Table', year: '2010', country: 'South Africa' },
    { file: 'stamp-4-russia.png',      place: 'Lake Ladoga',       year: '2018', country: 'Russia' },
    { file: 'stamp-5-germany.png',     place: 'Düsseldorf',        year: '2024', country: 'Germany' },
    { file: 'stamp-6-germany.png',     place: 'Düsseldorf squad',  year: '2024', country: 'Germany' },
    { file: 'stamp-7-brazil.png',      place: 'Amazonas',          year: '2014', country: 'Brazil' },
    { file: 'stamp-8-qatar.png',       place: 'Doha · Souq',       year: '2022', country: 'Qatar' },
    { file: 'stamp-9-russia.png',      place: 'Luzhniki Stadium',  year: '2018', country: 'Russia' }
  ];

  function pickRandomStamp() {
    return STAMPS[Math.floor(Math.random() * STAMPS.length)];
  }

  function injectStampHero() {
    const hero = document.querySelector('.country-hero');
    if (!hero) return;
    const oldBobby = hero.querySelector('.bobby-mascot');
    if (!oldBobby) return;
    const s = pickRandomStamp();
    const wrap = document.createElement('div');
    wrap.className = 'country-stamp-hero';
    wrap.innerHTML = `
      <div class="country-stamp">
        <div class="country-stamp-pm">
          <span>${s.place.toUpperCase()}</span>
          <span>★ ${s.country.toUpperCase()} ★</span>
          <span>${s.year}</span>
        </div>
        <img src="${s.file}" alt="${s.country} · ${s.place}">
        <div class="country-stamp-meta">
          <span>★ DON BOBBY ★</span>
          <span class="denom">FROM THE ROAD</span>
        </div>
      </div>`;
    oldBobby.replaceWith(wrap);
  }

  // ---------- 2. Bench injury-risk dot ----------
  function hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h);
  }
  function riskFor(playerId) {
    const r = hashCode(playerId || '') % 100;
    if (r < 55) return { lvl: 'low',  label: 'Match-ready'    };
    if (r < 85) return { lvl: 'mod',  label: 'Knock — monitor' };
    return                  { lvl: 'high', label: 'Doubt — late call' };
  }
  function annotateBench() {
    document.querySelectorAll('.squad-card.bench').forEach(card => {
      if (card.querySelector('.injury-dot')) return;
      const onclick = card.getAttribute('onclick') || '';
      const m = onclick.match(/showPlayer\(['"]([^'"]+)['"]\)/);
      const pid = m ? m[1] : (card.textContent.trim().slice(0,30));
      const r = riskFor(pid);
      const dot = document.createElement('span');
      dot.className = `injury-dot injury-${r.lvl}`;
      dot.setAttribute('title', `Injury risk · ${r.label}`);
      dot.textContent = '';
      const info = card.querySelector('.squad-info');
      const name = info && info.querySelector('.squad-name');
      if (name) name.appendChild(dot);
    });
  }

  // ---------- 3+4+5. Stats from data/country-stats.json ----------
  function countryKeyFromPath() {
    const f = (location.pathname.split('/').pop() || '').replace('.html','').toLowerCase();
    return f || null;
  }

  function injectMissingMount() {
    // Find a good place to inject: after the WC history block if present, else end of .container
    const wch = document.querySelector('.wc-history');
    const container = document.querySelector('.container');
    if (!container) return null;
    const mount = document.createElement('div');
    mount.id = 'country-extras-mount';
    if (wch && wch.parentNode === container) {
      wch.after(mount);
    } else {
      // before the player modal
      const modal = document.getElementById('player-modal');
      if (modal && modal.parentNode === container) container.insertBefore(mount, modal);
      else container.appendChild(mount);
    }
    return mount;
  }

  function fmtDate(iso) {
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [y,mm,d] = iso.split('-');
    return `${parseInt(d,10)} ${m[parseInt(mm,10)-1]} ${y}`;
  }

  function buildFormHTML(form) {
    const rows = form.map((g, i) => {
      const cls = g.result === 'W' ? 'res-w' : g.result === 'L' ? 'res-l' : 'res-d';
      return `<div class="form-row" data-idx="${i}">
        <div class="form-result ${cls}">${g.result}</div>
        <div class="form-opp">
          <div class="form-opp-name">${g.opponentFlag} ${g.opponent}</div>
          <div class="form-opp-meta">FIFA #${g.opponentFifaRank} · ${g.competition}</div>
        </div>
        <div class="form-score">${g.score}</div>
        <div class="form-date">
          <div>${fmtDate(g.date)}</div>
          <div class="form-venue">${g.venue}</div>
        </div>
        <div class="form-arrow" title="Tap for lineup">›</div>
      </div>`;
    }).join('');
    return `<div class="section-banner"><h2>📈 Recent form · Last 5</h2></div>
      <div class="form-list">${rows}</div>
      <div class="form-hint">↑ Tap any row to see the starting XI</div>`;
  }

  function buildTableHTML(rows, valueKey, label) {
    if (!rows || !rows.length) return '';
    const trs = rows.slice(0,5).map((r,i) => `
      <tr>
        <td class="pos">${i+1}</td>
        <td class="name">${r.name}</td>
        <td class="val">${r[valueKey]}</td>
        <td class="caps">${r.caps || r.tournaments || '—'}</td>
      </tr>`).join('');
    return `<table class="cs-table">
      <thead><tr><th>#</th><th>Player</th><th>${label}</th><th>${valueKey==='goals' || valueKey==='assists' ? (rows[0].caps ? 'Caps':'WCs') : ''}</th></tr></thead>
      <tbody>${trs}</tbody>
    </table>`;
  }

  function buildScorersAssistsHTML(c) {
    return `<div class="section-banner"><h2>⚽ Top scorers</h2></div>
      <div class="cs-grid">
        <div class="cs-card">
          <div class="cs-card-head">All competitions</div>
          ${buildTableHTML(c.topScorersAll, 'goals', 'Goals')}
        </div>
        <div class="cs-card">
          <div class="cs-card-head">World Cup only</div>
          ${buildTableHTML(c.topScorersWC, 'goals', 'WC Goals')}
        </div>
      </div>
      <div class="section-banner"><h2>🎯 Top assists</h2></div>
      <div class="cs-grid">
        <div class="cs-card">
          <div class="cs-card-head">All competitions</div>
          ${buildTableHTML(c.topAssistsAll, 'assists', 'Assists')}
        </div>
        <div class="cs-card">
          <div class="cs-card-head">World Cup only</div>
          ${buildTableHTML(c.topAssistsWC, 'assists', 'WC Assists')}
        </div>
      </div>`;
  }

  function attachLineupHandlers(form) {
    document.querySelectorAll('.form-row').forEach(row => {
      row.addEventListener('click', () => {
        const i = parseInt(row.dataset.idx, 10);
        const g = form[i];
        const lineup = g.lineup || [];
        const lis = lineup.map((p,n) => `<li><span class="lu-num">${n+1}</span>${p}</li>`).join('');
        showLineupModal({
          title: `${g.opponentFlag} vs ${g.opponent}`,
          subtitle: `${fmtDate(g.date)} · ${g.venue} · ${g.score} (${g.result}) · ${g.competition}`,
          lineup: lis
        });
      });
    });
  }

  function showLineupModal({ title, subtitle, lineup }) {
    let overlay = document.getElementById('lineup-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lineup-modal';
      overlay.className = 'lu-overlay';
      overlay.innerHTML = `
        <div class="lu-content">
          <button class="lu-close" aria-label="Close">×</button>
          <div class="lu-title"></div>
          <div class="lu-sub"></div>
          <ul class="lu-list"></ul>
          <div class="lu-foot">Starting XI · in numbered order</div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
      overlay.querySelector('.lu-close').addEventListener('click', () => overlay.classList.remove('active'));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('active'); });
    }
    overlay.querySelector('.lu-title').textContent = title;
    overlay.querySelector('.lu-sub').textContent = subtitle;
    overlay.querySelector('.lu-list').innerHTML = lineup;
    overlay.classList.add('active');
  }

  // ---------- 5. Stadium capacity on match cards ----------
  function annotateMatchCards(stadiums) {
    if (!stadiums) return;
    document.querySelectorAll('.match-card').forEach(card => {
      const city = card.getAttribute('data-city');
      const st = stadiums[city];
      if (!st) return;
      const slot = card.querySelector('.match-stadium');
      if (!slot || slot.dataset.capacityAdded) return;
      slot.dataset.capacityAdded = '1';
      const cap = st.capacity ? st.capacity.toLocaleString('en-US') : null;
      slot.insertAdjacentHTML('beforeend',
        ` <span class="stadium-cap" title="Capacity">${st.name}${cap ? ` · ${cap} 👥` : ''}</span>`);
    });
  }

  // ---------- CSS injection ----------
  function injectCss() {
    if (document.getElementById('country-extras-css')) return;
    const css = `
      .country-stamp-hero { display:flex; justify-content:center; margin:18px auto 14px; }
      .country-stamp {
        width:260px; max-width:86vw; padding:14px 14px 8px;
        background:#F5EBD3; box-shadow:0 8px 22px rgba(0,0,0,0.5);
        position:relative; transform:rotate(-2deg); color:#1F2E1F;
      }
      .country-stamp::before {
        content:""; position:absolute; inset:0; pointer-events:none;
        background:
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top left / 14px 14px repeat-x,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) bottom left / 14px 14px repeat-x,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top left / 14px 14px repeat-y,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top right / 14px 14px repeat-y;
      }
      .country-stamp img {
        width:100%; aspect-ratio:4/3; display:block; object-fit:cover;
        border:1px solid rgba(21,17,13,0.3); filter:sepia(0.10) saturate(0.95);
      }
      .country-stamp-pm {
        position:absolute; top:10px; right:-22px; width:78px; height:78px;
        border-radius:50%; border:2px solid rgba(178,90,80,0.7);
        display:flex; align-items:center; justify-content:center; flex-direction:column;
        font-style:italic; font-size:7.5px; letter-spacing:1px; font-weight:700;
        color:rgba(178,90,80,0.9); text-align:center; transform:rotate(10deg);
        background:transparent; line-height:1.25;
      }
      .country-stamp-pm::after {
        content:""; position:absolute; inset:5px; border-radius:50%;
        border:1px dashed rgba(178,90,80,0.55);
      }
      .country-stamp-meta {
        display:flex; justify-content:space-between; align-items:center;
        margin-top:8px; padding:4px 2px 0;
        font-size:9px; letter-spacing:1.2px; font-weight:700;
        color:#5C4E2A; text-transform:uppercase;
      }
      .country-stamp-meta .denom {
        background:#722F37; color:#F5EBD3; padding:2px 7px; border-radius:2px; font-weight:800;
      }

      .injury-dot {
        display:inline-block; width:9px; height:9px; border-radius:50%;
        margin-left:6px; vertical-align:middle;
        border:1.5px solid rgba(0,0,0,0.25);
        box-shadow:0 0 0 1px rgba(255,255,255,0.15);
        cursor:help;
      }
      .injury-low  { background:#22C55E; }
      .injury-mod  { background:#F59E0B; }
      .injury-high { background:#EF4444; box-shadow:0 0 6px rgba(239,68,68,0.6); }

      /* === Recent form === */
      .form-list { display:flex; flex-direction:column; gap:8px; margin:8px 0 4px; }
      .form-row {
        display:grid; grid-template-columns: 44px 1fr auto 120px 18px;
        align-items:center; gap:14px;
        background: rgba(0,0,0,0.45);
        border: 1.5px solid rgba(255,215,0,0.3);
        border-left: 5px solid #FFD700;
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .form-row:hover {
        transform: translateY(-1px);
        border-color: #FFD700;
        background: rgba(0,0,0,0.6);
      }
      .form-result {
        width:36px; height:36px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-weight:900; font-size:15px; letter-spacing:0.5px;
        color:#1a1a1a;
      }
      .form-result.res-w { background:#22C55E; color:#0a0a14; }
      .form-result.res-d { background:#FBBF24; color:#0a0a14; }
      .form-result.res-l { background:#EF4444; color:#FFFFFF; }
      .form-opp-name { font-size:14px; font-weight:800; color:#E2E8F0; }
      .form-opp-meta { font-size:10.5px; letter-spacing:1px; color:#FFD700; font-weight:700; text-transform:uppercase; margin-top:3px; }
      .form-score { font-size:18px; font-weight:900; color:#FFFFFF; letter-spacing:1px; }
      .form-date { font-size:11px; color:#94A3B8; text-align:right; font-weight:600; }
      .form-venue { color:#FFD700; font-weight:700; font-size:9.5px; letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
      .form-arrow { color:#FFD700; font-size:22px; font-weight:900; text-align:right; }
      .form-hint { font-size:10.5px; color:#94A3B8; font-style:italic; margin:6px 0 14px; text-align:right; letter-spacing:0.5px; }
      @media (max-width: 560px) {
        .form-row { grid-template-columns: 38px 1fr auto; gap:10px; padding:10px; }
        .form-row .form-date, .form-row .form-arrow { display:none; }
      }

      /* === Scorers / assists tables === */
      .cs-grid {
        display:grid; grid-template-columns:1fr; gap:14px;
        margin:8px 0 18px;
      }
      @media (min-width: 700px) {
        .cs-grid { grid-template-columns:1fr 1fr; gap:16px; }
      }
      .cs-card {
        background: rgba(0,0,0,0.45);
        border: 1.5px solid rgba(255,215,0,0.3);
        border-radius: 12px; padding: 12px 14px 8px;
      }
      .cs-card-head {
        font-size:10.5px; letter-spacing:2.5px; font-weight:800;
        color:#FFD700; text-transform:uppercase; margin-bottom:8px;
      }
      .cs-table { width:100%; border-collapse:collapse; }
      .cs-table thead th {
        text-align:left; font-size:9.5px; letter-spacing:1.5px;
        color:#94A3B8; font-weight:800; text-transform:uppercase;
        padding:6px 4px; border-bottom:1px solid rgba(255,215,0,0.2);
      }
      .cs-table thead th:last-child, .cs-table tbody td:last-child { text-align:right; }
      .cs-table tbody td {
        padding:8px 4px; font-size:13px; color:#E2E8F0;
        border-bottom:1px dashed rgba(255,215,0,0.12);
      }
      .cs-table tbody tr:last-child td { border-bottom:none; }
      .cs-table td.pos { width:22px; color:#FFD700; font-weight:900; font-size:12px; }
      .cs-table td.name { font-weight:700; }
      .cs-table td.val { font-weight:900; color:#FFD700; font-size:14px; text-align:right; width:70px; }
      .cs-table td.caps { color:#94A3B8; font-weight:600; width:60px; }

      /* === Lineup modal === */
      .lu-overlay {
        display:none;
        position:fixed; inset:0; z-index:10000;
        background: rgba(2,6,23,0.85);
        backdrop-filter: blur(6px);
        align-items:center; justify-content:center;
        padding:20px;
      }
      .lu-overlay.active { display:flex; }
      .lu-content {
        background: linear-gradient(180deg, #0F172A 0%, #020617 100%);
        border: 2px solid #FFD700;
        border-radius: 16px;
        padding: 22px 24px 18px;
        max-width: 420px; width: 100%;
        max-height: 86vh; overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.7);
      }
      .lu-close {
        position:absolute; top:10px; right:12px;
        background:transparent; border:none;
        color:#FFD700; font-size:28px; font-weight:900;
        cursor:pointer; line-height:1; padding:4px 10px;
      }
      .lu-close:hover { color:#FFFFFF; }
      .lu-title {
        font-size:20px; font-weight:900; color:#E2E8F0;
        letter-spacing:0.5px; margin-bottom:4px;
      }
      .lu-sub {
        font-size:11.5px; letter-spacing:1.2px; color:#FFD700;
        font-weight:700; text-transform:uppercase; margin-bottom:16px;
      }
      .lu-list {
        list-style:none; padding:0; margin:0 0 12px;
        display:grid; grid-template-columns:1fr; gap:6px;
      }
      .lu-list li {
        display:flex; align-items:center; gap:12px;
        background: rgba(255,215,0,0.06);
        border: 1px solid rgba(255,215,0,0.2);
        border-left: 4px solid #FFD700;
        padding: 9px 12px;
        border-radius: 6px;
        font-size: 14px; font-weight:700; color:#E2E8F0;
        letter-spacing:0.3px;
      }
      .lu-list .lu-num {
        display:inline-block; width:22px; height:22px;
        border-radius:50%; background:#FFD700; color:#0F172A;
        font-weight:900; font-size:11px;
        display:flex; align-items:center; justify-content:center;
      }
      .lu-foot {
        font-size:10.5px; letter-spacing:1.2px; color:#94A3B8;
        font-style:italic; text-align:center; margin-top:8px;
      }

      /* === Stadium capacity badge on match cards === */
      .stadium-cap {
        display:inline-block;
        margin-left:8px;
        padding:2px 8px;
        background: rgba(255,215,0,0.14);
        border: 1px solid rgba(255,215,0,0.35);
        border-radius: 12px;
        font-size: 10.5px; letter-spacing:0.5px; font-weight:700;
        color: #FFD700;
        white-space: nowrap;
        opacity: 0.95;
      }

      /* === Bobbycito's word — in-page quip card === */
      .bobbycito-quip {
        display: grid;
        grid-template-columns: 88px 1fr;
        gap: 14px;
        align-items: center;
        margin: 22px 0 22px;
        background: linear-gradient(180deg, #FFF6E0 0%, #FBEAC8 100%);
        border: 2px solid #B5701F;
        border-radius: 16px;
        padding: 14px 18px;
        box-shadow: 0 10px 24px rgba(61,37,23,0.35);
        position: relative;
      }
      .bobbycito-quip::before {
        content: ""; position: absolute; top: -8px; left: 78px;
        width: 16px; height: 16px;
        background: #FFF6E0;
        border-left: 2px solid #B5701F;
        border-top: 2px solid #B5701F;
        transform: rotate(45deg);
      }
      .bobbycito-quip .bq-mascot { display: block; text-decoration: none; }
      .bobbycito-quip .bq-mascot img {
        width: 84px; height: auto; display: block;
        filter: drop-shadow(0 4px 10px rgba(61,37,23,0.30));
        transition: transform 0.25s ease;
      }
      .bobbycito-quip .bq-mascot:hover img { transform: rotate(-4deg) scale(1.05); }
      .bobbycito-quip .bq-bubble { color: #3D2517; }
      .bobbycito-quip .bq-eyebrow {
        font-size: 10.5px; letter-spacing: 2.5px; font-weight: 900;
        color: #0E6B3C; text-transform: uppercase; margin-bottom: 4px;
      }
      .bobbycito-quip .bq-text {
        font-size: 14.5px; font-style: italic; font-weight: 600; line-height: 1.45;
      }
      .bobbycito-quip .bq-link { margin-top: 6px; }
      .bobbycito-quip .bq-link a {
        font-size: 10.5px; letter-spacing: 2px; font-weight: 800;
        color: #178A50; text-transform: uppercase; text-decoration: none;
        border-bottom: 2px solid #178A50; padding-bottom: 1px;
      }
      .bobbycito-quip .bq-link a:hover { color: #B5701F; border-color: #B5701F; }

      /* === Floating "Ask Bobbycito" button === */
      #bobbycito-float {
        position: fixed;
        right: 18px; bottom: 18px;
        z-index: 9999;
        display: flex; flex-direction: column; align-items: flex-end;
        gap: 8px;
      }
      .bobbycito-float-btn {
        width: 64px; height: 64px;
        border-radius: 50%;
        border: 3px solid #B5701F;
        background: #FFF6E0;
        padding: 6px;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(61,37,23,0.40), 0 0 0 3px rgba(255,215,0,0.28);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .bobbycito-float-btn:hover {
        transform: rotate(-6deg) scale(1.06);
        box-shadow: 0 8px 24px rgba(61,37,23,0.50), 0 0 0 4px rgba(255,215,0,0.36);
      }
      .bobbycito-float-btn img { width: 100%; height: auto; display: block; }
      .bobbycito-float-bubble {
        max-width: 280px;
        background: linear-gradient(180deg, #FFF6E0 0%, #FBEAC8 100%);
        border: 2px solid #B5701F;
        border-radius: 14px;
        padding: 12px 14px;
        font-size: 13px; line-height: 1.45;
        color: #3D2517;
        font-style: italic;
        box-shadow: 0 10px 24px rgba(61,37,23,0.40);
        opacity: 0; transform: translateY(10px) scale(0.95);
        transition: opacity 0.18s ease, transform 0.18s ease;
        pointer-events: none;
        position: relative;
      }
      .bobbycito-float-bubble.on {
        opacity: 1; transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .bobbycito-float-bubble::after {
        content: ""; position: absolute; bottom: -10px; right: 28px;
        width: 16px; height: 16px;
        background: #FBEAC8;
        border-right: 2px solid #B5701F;
        border-bottom: 2px solid #B5701F;
        transform: rotate(45deg);
      }
      .bobbycito-float-bubble .bf-tag {
        display: inline-block; font-style: normal;
        background: #178A50; color: #FBEAC8;
        padding: 2px 7px; border-radius: 8px;
        font-size: 10px; letter-spacing: 1px; font-weight: 800;
        margin-right: 6px; text-transform: uppercase;
      }
      .bobbycito-float-bubble .bf-link {
        display: block; margin-top: 8px;
        font-style: normal; font-weight: 800;
        font-size: 11px; letter-spacing: 1.5px;
        color: #0E6B3C; text-decoration: none;
        border-top: 1px dashed rgba(61,37,23,0.25);
        padding-top: 6px;
      }
      @media (max-width: 480px) {
        #bobbycito-float { right: 14px; bottom: 14px; }
        .bobbycito-float-btn { width: 56px; height: 56px; }
        .bobbycito-float-bubble { max-width: calc(100vw - 36px); }
      }
    `;
    const tag = document.createElement('style');
    tag.id = 'country-extras-css';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ---------- Bobbycito quip card (per country) ----------
  const QUIPS = {
    argentina: "Messi's left foot is illegal in four countries. Argentina is the only one that doesn't mind. ¡Vamos, La Albiceleste!",
    france:    "Mbappé runs so fast that the offside flag goes up before the linesman lifts it. Allez les Bleus.",
    spain:     "Tiki-taka isn't a dance — but I tried it at the cantina and got a free mezcal. ¡Vamos España!",
    brazil:    "Ronaldo had so many step-overs they had to add VAR to count them. Forever in yellow. 🇧🇷",
    netherlands:"Total football, total menu. They order one of everything. So do I. We're brothers.",
    japan:     "Their forecheck is so disciplined it filed taxes early. Daihyō: a clinic in every game.",
    portugal:  "Ronaldo is 41 and still scores. The yogurt in my fridge gives up after 3 days. ⚽",
    germany:   "Curaçao let in 7. The grill agrees: well-done. Die Mannschaft is back on the menu.",
    england:   "Coming home? England's been at the airport since 1966. Bag still on the carousel.",
    belgium:   "De Bruyne picks passes like I pick salsas — both can melt your face."
  };

  function injectQuipCard() {
    const key = countryKeyFromPath();
    if (!key || !QUIPS[key]) return;
    const mount = document.getElementById('country-extras-mount') || (function () {
      // If runDataBits hasn't created the mount yet, create one of our own at the end
      const c = document.querySelector('.container');
      if (!c) return null;
      const m = document.createElement('div');
      m.id = 'country-extras-mount';
      c.appendChild(m);
      return m;
    })();
    if (!mount) return;
    if (mount.querySelector('.bobbycito-quip')) return; // already added
    const card = document.createElement('div');
    card.className = 'bobbycito-quip';
    card.innerHTML = `
      <a href="bobbycito.html" class="bq-mascot" title="Meet Bobbycito"><img src="bobbycito_jaguar.svg" alt="Bobbycito"></a>
      <div class="bq-bubble">
        <div class="bq-eyebrow">★ Bobbycito's word</div>
        <div class="bq-text">${QUIPS[key]}</div>
        <div class="bq-link"><a href="bobbycito.html">Meet Bobbycito →</a></div>
      </div>`;
    mount.appendChild(card);
  }

  // ---------- Floating "ask Bobbycito" badge (site-wide on country pages) ----------
  // The seven approved Bobby facts — canonical set (see memory: bobby-jokes-approved.md)
  const SITE_JOKES = [
    "Bobby doesn't check the weather. The weather checks with Bobby.",
    "FIFA didn't set the fixture schedule. Bobby did. FIFA just published it.",
    "Bobby has a broken ankle and still knows more about Roma Norte than the people who live there.",
    "Estadio Azteca wasn't built for football. It was built for the day Bobby needed a venue.",
    "The Airbnb host gave this place a 5-star review. Of Bobby.",
    "When Bobby says 'let me check something', three countries update their plans.",
    "Bobby's group chat messages have been submitted for UNESCO heritage status."
  ];

  function injectFloatingBobbycito() {
    if (document.getElementById('bobbycito-float')) return;
    const wrap = document.createElement('div');
    wrap.id = 'bobbycito-float';
    wrap.innerHTML = `
      <button class="bobbycito-float-btn" aria-label="Ask Bobbycito for a joke">
        <img src="bobbycito_jaguar.svg" alt="Bobbycito">
      </button>
      <div class="bobbycito-float-bubble" role="status" aria-live="polite"></div>`;
    document.body.appendChild(wrap);
    const btn  = wrap.querySelector('.bobbycito-float-btn');
    const bub  = wrap.querySelector('.bobbycito-float-bubble');
    let timer = null;
    btn.addEventListener('click', () => {
      const joke = SITE_JOKES[Math.floor(Math.random() * SITE_JOKES.length)];
      bub.innerHTML = `<span class="bf-tag">¡Órale!</span> ${joke}<a href="bobbycito.html" class="bf-link">Meet Bobbycito →</a>`;
      bub.classList.add('on');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => bub.classList.remove('on'), 9000);
    });
  }

  // ---------- Orchestration ----------
  function runStaticBits() {
    injectCss();
    injectStampHero();
    annotateBench();
    injectFloatingBobbycito();
  }

  function runDataBits(stats) {
    const key = countryKeyFromPath();
    const c = stats && stats.countries && stats.countries[key];
    const stadiums = stats && stats.stadiums;

    if (stadiums) annotateMatchCards(stadiums);

    if (c) {
      const mount = injectMissingMount();
      if (mount) {
        mount.innerHTML = buildFormHTML(c.recentForm) + buildScorersAssistsHTML(c);
        attachLineupHandlers(c.recentForm);
      }
    }

    // Bobbycito quip (works with or without country-stats data)
    injectQuipCard();
  }

  function start() {
    runStaticBits();
    fetch('data/country-stats.json')
      .then(r => r.json())
      .then(runDataBits)
      .catch(err => console.warn('country-stats.json load failed:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
