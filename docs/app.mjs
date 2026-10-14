import { assessSpend, slideFromHash, nextSlide } from './model.mjs';

const slides = [...document.querySelectorAll('.slide')];
const links = [...document.querySelectorAll('#chapter-nav a')];
let current = slideFromHash(location.hash, slides.length);

function showSlide(index, announce = true) {
  current = index;
  slides.forEach((slide, i) => { slide.hidden = i !== index; });
  links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  const chapter = slides[index].dataset.chapter;
  document.querySelector('#page-current').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('#page-total').textContent = String(slides.length).padStart(2, '0');
  document.querySelector('#slide-label').textContent = chapter.toUpperCase();
  document.querySelector('#previous').disabled = index === 0;
  document.querySelector('#next').disabled = index === slides.length - 1;
  document.title = `ADAM — ${chapter}`;
  if (announce) {
    document.querySelector('#slide-announcement').textContent = `Slide ${index + 1} of ${slides.length}: ${chapter}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
function navigate(direction) {
  const index = nextSlide(current, direction, slides.length);
  if (index !== current) location.hash = String(index + 1);
}
window.addEventListener('hashchange', () => showSlide(slideFromHash(location.hash, slides.length)));
document.querySelector('#previous').addEventListener('click', () => navigate(-1));
document.querySelector('#next').addEventListener('click', () => navigate(1));
document.querySelector('#meet-team').addEventListener('click', () => { location.hash = '2'; });
document.addEventListener('keydown', event => {
  if (event.target.closest('input, textarea, select, [role="tablist"], [role="button"]')) return;
  if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowRight' || event.key === 'PageDown') navigate(1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') navigate(-1);
  if (event.key === 'Home') location.hash = '1';
  if (event.key === 'End') location.hash = String(slides.length);
});

const roles = {
  Research: { title: 'Find your next move.', description: 'Explore opportunities and understand the thinking behind a strategy.' },
  Risk: { title: 'Set your boundaries.', description: 'Choose your limits and keep your strategy aligned with your appetite for risk.' },
  Execution: { title: 'Put the plan to work.', description: 'Follow orders and transactions as your strategy moves into action.' },
  Treasury: { title: 'See the whole picture.', description: 'Keep your portfolio, allocated capital and service spending in view.' },
};
function chooseRole(role) {
  const item = roles[role];
  if (!item) return;
  document.querySelector('#role-content').innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
  document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.role === role)));
  document.querySelectorAll('[data-station]').forEach(station => station.setAttribute('aria-pressed', String(station.dataset.station === role)));
}
document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => chooseRole(button.dataset.role)));
document.querySelectorAll('[data-station]').forEach(station => {
  const select = () => { chooseRole(station.dataset.station); if (current === 0) location.hash = '2'; };
  station.addEventListener('click', select);
  station.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); }
  });
});

function updateGuard() {
  const amount = Number(document.querySelector('#amount').value);
  const revoked = document.querySelector('#revoke').checked;
  const result = assessSpend({ amount, perTransaction: 50, windowCap: 100, used: 0, principal: 500, floor: 250, revoked });
  document.querySelector('#amount-value').textContent = String(amount);
  document.querySelector('#guard-status').dataset.allowed = String(result.allowed);
  document.querySelector('#guard-icon').textContent = result.allowed ? '✓' : '×';
  document.querySelector('#guard-verdict').textContent = revoked ? 'Access revoked' : result.allowed ? 'Within your limit' : 'Over your limit. Blocked.';
}
document.querySelector('#amount').addEventListener('input', updateGuard);
document.querySelector('#revoke').addEventListener('change', updateGuard);

const categories = {
  trade: { title: 'Put your view into action.', protocols: ['DexHunter', 'SaturnSwap', 'CardexScan', 'Strike', 'SteelSwap'] },
  lend: { title: 'Make capital work harder.', protocols: ['Fluid', 'Surf', 'Danogo', 'Indigo', 'Liqwid'] },
  yield: { title: 'Build an income strategy.', protocols: ['Indigo', 'Danogo', 'SaturnSwap'] },
  liquidity: { title: 'Bring depth to the market.', protocols: ['SaturnSwap', 'Danogo'] },
};
function setCategory(category) {
  const item = categories[category];
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.category === category)));
  document.querySelector('#protocol-content').innerHTML = `<h3>${item.title}</h3><div class="protocol-names">${item.protocols.map(name => `<span>${name}</span>`).join('')}</div>`;
}
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
document.querySelectorAll('[role="tablist"]').forEach(list => list.addEventListener('keydown', event => {
  const buttons = [...list.querySelectorAll('[role="tab"]')];
  const index = buttons.indexOf(document.activeElement);
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
  buttons[target].focus();
  buttons[target].click();
}));

const coverFigure = document.querySelector('.cover-visual');
const tourStations = [...coverFigure.querySelectorAll('[data-station]')];
const still = matchMedia('(prefers-reduced-motion: reduce)');
let tourFrame = 0;
let tourVisible = false;
let tourClock = 0;
let tourLast = 0;
let pauseUntil = 0;
function tourTick(now) {
  const dt = tourLast ? Math.min((now - tourLast) / 1000, 1 / 30) : 0;
  tourLast = now;
  if (now > pauseUntil) {
    tourClock += dt;
    const selected = Math.floor(tourClock / 4) % tourStations.length;
    tourStations.forEach((station, index) => { station.dataset.tour = String(index === selected); });
  }
  tourFrame = tourVisible && !still.matches ? requestAnimationFrame(tourTick) : 0;
}
function startTour() {
  if (!tourFrame && tourVisible && !still.matches) { tourLast = 0; tourFrame = requestAnimationFrame(tourTick); }
}
new IntersectionObserver(entries => {
  tourVisible = entries[entries.length - 1].isIntersecting;
  startTour();
}).observe(coverFigure);
const pauseTour = () => {
  pauseUntil = performance.now() + 6000;
  tourStations.forEach(station => { delete station.dataset.tour; });
};
coverFigure.addEventListener('pointermove', pauseTour);
coverFigure.addEventListener('focusin', pauseTour);
still.addEventListener('change', () => { pauseTour(); startTour(); });

chooseRole('Research');
updateGuard();
setCategory('trade');
showSlide(current, false);
