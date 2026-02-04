// Mobile nav toggle
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 90;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Section reveal / narrative punctuation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('[data-animate="true"]').forEach(el => observer.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink() {
  let currentId = null;
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const offset = section.offsetTop - 120;
    const height = section.offsetHeight;
    if (scrollY >= offset && scrollY < offset + height) {
      currentId = section.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
}

window.addEventListener('scroll', setActiveLink);

// Very light particle dots in the background
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    const size = Math.random() * 3 + 1;
    dot.style.position = 'absolute';
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.borderRadius = '999px';
    dot.style.background = Math.random() > 0.5 ? 'rgba(43,108,111,0.28)' : 'rgba(215,116,61,0.32)';
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.opacity = '0.35';
    dot.style.animation = `drift ${12 + Math.random() * 12}s ease-in-out infinite`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    particlesContainer.appendChild(dot);
  }
}

// Inject keyframes for particle drift
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  25% { transform: translate3d(10px, -16px, 0); }
  50% { transform: translate3d(-12px, -6px, 0); }
  75% { transform: translate3d(6px, 10px, 0); }
}`;
document.head.appendChild(styleEl);

console.log('Narrative interactions loaded.');
