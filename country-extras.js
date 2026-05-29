/* ============================================
   COUNTRY PAGE EXTRAS — runs on every country page
   1. Swaps the static Bobby SVG hero with a random postage stamp
      from the trip photo album.
   2. Adds an injury-risk dot to every bench player card.
   ============================================ */
(function () {
  // ---- 1. Random postage-stamp hero ----
  const STAMPS = [
    { file: 'stamp-1-brazil.png',      place: 'Amazonas',          year: '2014', country: 'Brazil' },
    { file: 'stamp-2-germany.png',     place: 'Beer Garden',       year: '2006', country: 'Germany' },
    { file: 'stamp-3-southafrica.png', place: 'Cape Town · Table', year: '2010', country: 'South Africa' },
    { file: 'stamp-4-russia.png',      place: 'Lake Ladoga',       year: '2018', country: 'Russia' },
    { file: 'stamp-5-germany.png',     place: 'Düsseldorf',        year: '2024', country: 'Germany' },
    { file: 'stamp-6-germany.png',     place: 'Düsseldorf squad',  year: '2024', country: 'Germany' },
    { file: 'stamp-7-brazil.png',      place: 'Rio · Maracanã',    year: '2014', country: 'Brazil' },
    { file: 'stamp-8-qatar.png',       place: 'Doha · Souq',       year: '2022', country: 'Qatar' },
    { file: 'stamp-9-russia.png',      place: 'Moscow · Red Sq',   year: '2018', country: 'Russia' }
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

  // ---- 2. Bench injury-risk dot ----
  // Deterministic risk based on the player's id, so the dot is stable per
  // page reload but varies across players. Levels: low (green), mod (amber), high (red).
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
      if (card.querySelector('.injury-dot')) return; // already done
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

  // ---- Inject one-time CSS for the new bits ----
  function injectCss() {
    if (document.getElementById('country-extras-css')) return;
    const css = `
      .country-stamp-hero {
        display: flex; justify-content: center; margin: 18px auto 14px;
      }
      .country-stamp {
        width: 260px; max-width: 86vw;
        padding: 14px 14px 8px;
        background: #F5EBD3;
        box-shadow: 0 8px 22px rgba(0,0,0,0.5);
        position: relative;
        transform: rotate(-2deg);
        color: #1F2E1F;
      }
      .country-stamp::before {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top left / 14px 14px repeat-x,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) bottom left / 14px 14px repeat-x,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top left / 14px 14px repeat-y,
          radial-gradient(circle at 7px 7px, #15110D 4px, transparent 5px) top right / 14px 14px repeat-y;
      }
      .country-stamp img {
        width: 100%; aspect-ratio: 4 / 3; display: block;
        object-fit: cover;
        border: 1px solid rgba(21,17,13,0.3);
        filter: sepia(0.10) saturate(0.95);
      }
      .country-stamp-pm {
        position: absolute; top: 10px; right: -22px;
        width: 78px; height: 78px;
        border-radius: 50%;
        border: 2px solid rgba(178,90,80,0.7);
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        font-style: italic; font-size: 7.5px; letter-spacing: 1px; font-weight: 700;
        color: rgba(178,90,80,0.9); text-align: center;
        transform: rotate(10deg);
        background: transparent;
        line-height: 1.25;
      }
      .country-stamp-pm::after {
        content: ""; position: absolute; inset: 5px; border-radius: 50%;
        border: 1px dashed rgba(178,90,80,0.55);
      }
      .country-stamp-meta {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: 8px; padding: 4px 2px 0;
        font-size: 9px; letter-spacing: 1.2px; font-weight: 700;
        color: #5C4E2A; text-transform: uppercase;
      }
      .country-stamp-meta .denom {
        background: #722F37; color: #F5EBD3;
        padding: 2px 7px; border-radius: 2px; font-weight: 800;
      }

      /* Injury-risk dot on bench cards */
      .injury-dot {
        display: inline-block; width: 9px; height: 9px;
        border-radius: 50%;
        margin-left: 6px;
        vertical-align: middle;
        border: 1.5px solid rgba(0,0,0,0.25);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
        cursor: help;
      }
      .injury-low  { background: #22C55E; }
      .injury-mod  { background: #F59E0B; }
      .injury-high { background: #EF4444; box-shadow: 0 0 6px rgba(239,68,68,0.6); }
    `;
    const tag = document.createElement('style');
    tag.id = 'country-extras-css';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function run() {
    injectCss();
    injectStampHero();
    annotateBench();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
