// Mobile nav
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

// Smooth scroll for hero CTA and nav links
function smoothScrollTo(id) {
  const el = document.querySelector(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('[data-scroll], .nav-link').forEach(el => {
  el.addEventListener('click', e => {
    const href = el.getAttribute('data-scroll') || el.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollTo(href);
  });
});

// Active nav state
const sections = document.querySelectorAll('header[id], section[id]');
const links = document.querySelectorAll('.nav-link');

function setActiveLink() {
  let current = null;
  const y = window.scrollY;
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    const height = sec.offsetHeight;
    if (y >= top && y < top + height) current = sec.id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', setActiveLink);

// Reveal and animate project cards + mini charts
const projectObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      card.classList.add('visible');

      // bars
      card.querySelectorAll('.mini-bar-fill, .mini-pill').forEach(el => {
        const width = el.getAttribute('data-width');
        if (!width) return;
        const inner = document.createElement('span');
        inner.style.position = 'absolute';
        inner.style.inset = '0';
        inner.style.borderRadius = '999px';
        inner.style.width = '0';
        inner.style.transition = 'width .7s ease-out';
        if (el.classList.contains('mini-pill')) {
          inner.style.background = 'linear-gradient(90deg,#b5393f,#e9b54c)';
        } else if (el.classList.contains('before')) {
          inner.style.background = 'linear-gradient(90deg,#9ca3af,#6b7280)';
        } else {
          inner.style.background = 'linear-gradient(90deg,#2b6c6f,#e9b54c)';
        }
        el.appendChild(inner);
        requestAnimationFrame(() => { inner.style.width = width + '%'; });
      });

      // ring
      const ringWrap = card.querySelector('.mini-ring');
      const ring = card.querySelector('.ring-fg');
      if (ringWrap && ring) {
        const target = parseInt(ringWrap.getAttribute('data-ring') || '0', 10);
        const circumference = 2 * Math.PI * 40;
        const offset = circumference * (1 - target / 100);
        ring.style.strokeDashoffset = offset;
      }

      projectObserver.unobserve(card);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.project-card').forEach(c => projectObserver.observe(c));

// Background particles (very light)
const particles = document.getElementById('particles');
if (particles) {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span');
    const size = Math.random() * 3 + 1;
    d.style.position = 'absolute';
    d.style.width = `${size}px`;
    d.style.height = `${size}px`;
    d.style.borderRadius = '999px';
    d.style.background = Math.random() > 0.5 ? 'rgba(43,108,111,0.32)' : 'rgba(215,116,61,0.32)';
    d.style.top = `${Math.random() * 100}%`;
    d.style.left = `${Math.random() * 100}%`;
    d.style.opacity = '0.4';
    d.style.animation = `float ${12 + Math.random()*10}s ease-in-out infinite`;
    d.style.animationDelay = `${Math.random()*6}s`;
    particles.appendChild(d);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes float {0%,100%{transform:translate3d(0,0,0);}25%{transform:translate3d(8px,-14px,0);}50%{transform:translate3d(-10px,-6px,0);}75%{transform:translate3d(6px,10px,0);}}`;
  document.head.appendChild(style);
}
