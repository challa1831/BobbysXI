/* ============================================
   WC 2026 HUB — SHARED JS
   ============================================ */

// =========================================
// PLAYER MODAL
// =========================================
function showPlayer(pid) {
  const data = (window.playerData || {})[pid];
  if (!data) return;
  const overlay = document.getElementById('player-modal');
  if (!overlay) return;

  document.getElementById('modal-name').textContent = `${data.flag || ''} ${data.name}`.trim();
  document.getElementById('modal-pos').textContent = `${data.position} · ${data.club || 'Club TBD'} · Age ${data.age || '–'}`;

  const statsHtml = `
    <div class="stat-box"><div class="stat-label">Form</div><div class="stat-value">${data.form || '–'}</div></div>
    <div class="stat-box"><div class="stat-label">Int'l Goals</div><div class="stat-value">${data.careerGoals || '–'}</div></div>
    <div class="stat-box"><div class="stat-label">WC Apps</div><div class="stat-value">${data.wcApps || '–'}</div></div>
    <div class="stat-box"><div class="stat-label">WC Goals</div><div class="stat-value">${data.wcGoals || '–'}</div></div>
  `;
  document.getElementById('modal-stats').innerHTML = statsHtml;
  document.getElementById('modal-note').textContent = data.note || '';

  overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('player-modal');
  if (overlay) overlay.classList.remove('active');
}

document.addEventListener('click', function(e) {
  if (e.target.id === 'player-modal') closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// =========================================
// WEATHER (Open-Meteo, no API key needed)
// =========================================
const VENUE_COORDS = {
  'Atlanta':            { lat: 33.755, lon: -84.401 },
  'Boston':             { lat: 42.0926, lon: -71.2643 },
  'Dallas':             { lat: 32.7474, lon: -97.0945 },
  'Guadalajara':        { lat: 20.6816, lon: -103.4624 },
  'Houston':            { lat: 29.6847, lon: -95.4108 },
  'Kansas City':        { lat: 39.0488, lon: -94.4839 },
  'Los Angeles':        { lat: 33.9534, lon: -118.3387 },
  'Mexico City':        { lat: 19.3029, lon: -99.1505 },
  'Miami':              { lat: 25.9580, lon: -80.2389 },
  'Monterrey':          { lat: 25.6692, lon: -100.2444 },
  'New York/New Jersey':{ lat: 40.8136, lon: -74.0744 },
  'NJ':                 { lat: 40.8136, lon: -74.0744 },
  'NY':                 { lat: 40.8136, lon: -74.0744 },
  'MetLife':            { lat: 40.8136, lon: -74.0744 },
  'Philadelphia':       { lat: 39.9008, lon: -75.1675 },
  'San Francisco':      { lat: 37.4030, lon: -121.9700 },
  'Seattle':            { lat: 47.5952, lon: -122.3316 },
  'Toronto':            { lat: 43.6332, lon: -79.3493 },
  'Vancouver':          { lat: 49.2768, lon: -123.1119 }
};

const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  56: '🌧️', 57: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  66: '🌧️', 67: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 77: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  85: '🌨️', 86: '❄️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

async function fetchWeather(city, dateISO) {
  const coords = VENUE_COORDS[city];
  if (!coords) return null;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
              `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
              `&start_date=${dateISO}&end_date=${dateISO}&timezone=auto`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data?.daily?.weather_code?.[0] && data?.daily?.weather_code?.[0] !== 0) return null;
    return {
      code: data.daily.weather_code[0],
      tMax: data.daily.temperature_2m_max[0],
      tMin: data.daily.temperature_2m_min[0],
      precipPct: data.daily.precipitation_probability_max[0]
    };
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return null;
  }
}

async function applyWeatherToCards() {
  const cards = document.querySelectorAll('[data-city][data-date]');
  for (const card of cards) {
    const city = card.dataset.city;
    const date = card.dataset.date;
    const slot = card.querySelector('.weather-slot');
    if (!slot) continue;
    const w = await fetchWeather(city, date);
    if (!w) { slot.innerHTML = '<span class="weather-na">— °</span>'; continue; }
    const icon = WMO_ICONS[w.code] || '🌡️';
    slot.innerHTML = `
      <span class="weather-icon">${icon}</span>
      <span class="weather-temp">${Math.round(w.tMin)}°/${Math.round(w.tMax)}°C</span>
      <span class="weather-rain">${w.precipPct ?? 0}% 💧</span>
    `;
  }
}

document.addEventListener('DOMContentLoaded', applyWeatherToCards);
