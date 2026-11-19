document.documentElement.classList.add('js');

// footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// scroll reveal
const revealTargets = document.querySelectorAll(
  '[data-reveal] .sec__head, [data-reveal] .grid, [data-reveal] .cards, [data-reveal] .ba, ' +
  '[data-reveal] .refl, [data-reveal] .mini, [data-reveal] > .wrap > .paper, [data-reveal] .checks, [data-reveal] .refl__quote'
);
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
// safety net: never leave content hidden
setTimeout(() => revealTargets.forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight) el.classList.add('is-in');
}), 1200);
window.addEventListener('load', () => setTimeout(() => revealTargets.forEach(el => {
  if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
}), 100));
revealTargets.forEach(el => io.observe(el));

// active nav link
const links = [...document.querySelectorAll('.nav__links a')];
const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.remove('is-active'));
      const a = map.get(e.target.id); if (a) a.classList.add('is-active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

// hero spiral: three layers turn at different speeds; scrolling speeds them up, scrolling up reverses them
const layers = [...document.querySelectorAll('.spiral .layer')];
if (layers.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const BASE = 4;        // degrees per second at rest (multiplied by each layer's data-speed)
  const GAIN = 0.35;     // degrees per second per px/s of scroll speed
  const MAX_BOOST = 420; // cap on scroll-driven speed
  const speeds = layers.map(l => parseFloat(l.dataset.speed) || 1);
  const angles = layers.map(() => 0);
  let boost = 0, lastY = scrollY, lastT = performance.now(), visible = true;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { lastT = performance.now(); lastY = scrollY; requestAnimationFrame(tick); } })
    .observe(document.querySelector('.hero'));

  function tick(now) {
    if (!visible) return;
    const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
    const y = scrollY, v = (y - lastY) / Math.max(dt, 0.001); lastY = y;   // signed: down = +, up = -
    const target = Math.max(-MAX_BOOST, Math.min(v * GAIN, MAX_BOOST));
    boost += (target - boost) * (Math.abs(target) > Math.abs(boost) ? 0.12 : 0.03);
    layers.forEach((l, i) => {
      angles[i] = (angles[i] + (BASE + boost) * speeds[i] * dt) % 360;
      l.style.transform = `rotate(${angles[i]}deg)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Readtheory screenshot: use assets/readtheory.png if it exists, else let user preview a file
const img = document.getElementById('shotImg');
const empty = document.getElementById('shotEmpty');
const file = document.getElementById('shotFile');
function showShot(src) { img.src = src; img.hidden = false; empty.hidden = true; }
img.addEventListener('load', () => { img.hidden = false; empty.hidden = true; });
img.addEventListener('error', () => { img.hidden = true; empty.hidden = false; });
if (img.complete && img.naturalWidth) { img.hidden = false; empty.hidden = true; } else { img.hidden = true; }
file.addEventListener('change', () => {
  const f = file.files[0]; if (f) showShot(URL.createObjectURL(f));
});

// lightbox
img.addEventListener('click', () => {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
  box.addEventListener('click', () => box.remove());
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc); } });
  document.body.appendChild(box);
});
