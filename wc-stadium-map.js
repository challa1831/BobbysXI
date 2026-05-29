/* ============================================
   Shared WC 2026 host-city Leaflet map.
   Auto-mounts in any <div id="wc-stadium-map">.
   On schedule.html it also wires click-to-filter
   against the existing .match-card elements.
   ============================================ */
(function(){
  const STADIUMS = [
    { city: 'New York/New Jersey', name: 'New York / New Jersey', venue: 'MetLife Stadium',           lat: 40.8135, lng: -74.0745,  matches: 8, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Los Angeles',         name: 'Los Angeles',           venue: 'SoFi Stadium',              lat: 33.9534, lng: -118.3392, matches: 8, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Dallas',              name: 'Dallas',                venue: 'AT&T Stadium',              lat: 32.7480, lng: -97.0930,  matches: 7, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'San Francisco',       name: 'San Francisco Bay Area',venue: "Levi's Stadium",            lat: 37.4033, lng: -121.9694, matches: 7, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Miami',               name: 'Miami',                 venue: 'Hard Rock Stadium',         lat: 25.9580, lng: -80.2389,  matches: 7, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Atlanta',             name: 'Atlanta',               venue: 'Mercedes-Benz Stadium',     lat: 33.7555, lng: -84.4009,  matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Seattle',             name: 'Seattle',               venue: 'Lumen Field',               lat: 47.5952, lng: -122.3316, matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Kansas City',         name: 'Kansas City',           venue: 'Arrowhead Stadium',         lat: 39.0489, lng: -94.4839,  matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Philadelphia',        name: 'Philadelphia',          venue: 'Lincoln Financial Field',   lat: 39.9008, lng: -75.1675,  matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Houston',             name: 'Houston',               venue: 'NRG Stadium',               lat: 29.6847, lng: -95.4107,  matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Boston',              name: 'Boston',                venue: 'Gillette Stadium',          lat: 42.0909, lng: -71.2643,  matches: 6, country: 'USA',    color: '#185FA5', border: '#0C447C' },
    { city: 'Mexico City',         name: 'Mexico City',           venue: 'Estadio Azteca',            lat: 19.3030, lng: -99.1506,  matches: 5, country: 'Mexico', color: '#D85A30', border: '#993C1D' },
    { city: 'Guadalajara',         name: 'Guadalajara',           venue: 'Estadio Akron',             lat: 20.6460, lng: -103.4597, matches: 5, country: 'Mexico', color: '#D85A30', border: '#993C1D' },
    { city: 'Monterrey',           name: 'Monterrey',             venue: 'Estadio BBVA',              lat: 25.6694, lng: -100.2462, matches: 5, country: 'Mexico', color: '#D85A30', border: '#993C1D' },
    { city: 'Toronto',             name: 'Toronto',               venue: 'BMO Field',                 lat: 43.6332, lng: -79.4187,  matches: 7, country: 'Canada', color: '#1D9E75', border: '#0F6E56' },
    { city: 'Vancouver',           name: 'Vancouver',             venue: 'BC Place',                  lat: 49.2769, lng: -123.1116, matches: 7, country: 'Canada', color: '#1D9E75', border: '#0F6E56' }
  ];

  function makeIcon(color, border, active=false) {
    const size = active ? 28 : 22;
    return L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid ${border};box-shadow:0 2px 8px rgba(0,0,0,0.32);display:flex;align-items:center;justify-content:center;">
               <span style="font-size:${active?12:10}px;">⚽</span>
             </div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2 - 4]
    });
  }

  function init() {
    const el = document.getElementById('wc-stadium-map');
    if (!el || !window.L) return;
    if (el.dataset.mounted === '1') return;
    el.dataset.mounted = '1';

    const map = L.map('wc-stadium-map', { zoomControl: true, scrollWheelZoom: false, minZoom: 2 }).setView([40, -98], 3.4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Detect if we should wire click-to-filter against match-cards
    const cards = document.querySelectorAll('.match-card');
    const hasFilterUI = cards.length > 0 && document.getElementById('filter-current');
    const label = document.getElementById('filter-current');
    const reset = document.getElementById('filter-reset');
    const markerByCity = {};

    function applyFilter(city) {
      if (!hasFilterUI) return;
      let count = 0;
      cards.forEach(c => {
        if (!city || c.dataset.city === city) { c.classList.remove('is-hidden'); count++; }
        else c.classList.add('is-hidden');
      });
      STADIUMS.forEach(s => {
        const m = markerByCity[s.city];
        if (m) m.setIcon(makeIcon(s.color, s.border, city === s.city));
      });
      if (city) {
        label.textContent = `${city} · ${count} match${count===1?'':'es'}`;
        if (reset) reset.hidden = false;
      } else {
        label.textContent = 'All 16 host stadiums · click a marker to filter';
        if (reset) reset.hidden = true;
      }
    }

    STADIUMS.forEach(s => {
      const m = L.marker([s.lat, s.lng], { icon: makeIcon(s.color, s.border) }).addTo(map);
      const filterBtn = hasFilterUI
        ? `<button onclick="window._filterStadium('${s.city.replace(/'/g, "\\'")}')" style="background:#185FA5;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;width:100%;margin-top:6px;">View matches</button>`
        : '';
      m.bindPopup(`
        <div style="min-width:180px;">
          <div style="font-size:15px;font-weight:700;color:#1a1a18;margin-bottom:3px;">${s.name}</div>
          <div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${s.country}</div>
          <div style="font-size:12.5px;color:#444;margin-bottom:4px;">🏟️ ${s.venue}</div>
          <div style="font-size:12.5px;color:#444;">📅 ${s.matches} matches</div>
          ${filterBtn}
        </div>
      `, { offset: [0, -6] });
      if (hasFilterUI) m.on('click', () => applyFilter(s.city));
      markerByCity[s.city] = m;
    });

    if (hasFilterUI) {
      window._filterStadium = applyFilter;
      if (reset) reset.addEventListener('click', () => applyFilter(null));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
