// Utility: smooth scroll
function smoothScrollTo(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const offset = 96;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// System map click
const systemNodes = document.querySelectorAll('.system-node');
systemNodes.forEach((node, index) => {
  node.addEventListener('click', () => {
    const target = node.getAttribute('data-target');
    smoothScrollTo(target);
  });
});

// Update active system node + indicator on scroll
const sections = ['#inputs', '#signals', '#decisions', '#outcomes'].map(id => document.querySelector(id));
const indicator = document.getElementById('systemIndicator');

function updateSystemMap() {
  let activeIndex = 0;
  const scrollY = window.scrollY;
  sections.forEach((sec, i) => {
    if (!sec) return;
    const offset = sec.offsetTop - 140;
    if (scrollY >= offset) activeIndex = i;
  });
  systemNodes.forEach((node, i) => {
    node.classList.toggle('active', i === activeIndex);
  });
  if (indicator) {
    const widthFraction = 1 / systemNodes.length;
    indicator.style.transform = `translateX(${activeIndex * 100}%)`;
  }
}

window.addEventListener('scroll', updateSystemMap);
updateSystemMap();

// Inputs: progressive disclosure
const vignetteEls = document.querySelectorAll('.input-vignette');
const inputCards = document.querySelectorAll('.input-card');

let vignetteIndex = 0;

function cycleVignettes(direction) {
  const total = vignetteEls.length;
  vignetteIndex = (vignetteIndex + direction + total) % total;
  vignetteEls.forEach((v, i) => v.classList.toggle('active', i === vignetteIndex));
  const ref = vignetteEls[vignetteIndex].getAttribute('data-input-ref');
  inputCards.forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-input') === ref);
  });
}

// Use IntersectionObserver to advance vignettes as user scrolls slowly
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const now = window.scrollY;
  const delta = now - lastScrollY;
  const inputsSection = document.getElementById('inputs');
  if (inputsSection) {
    const rect = inputsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
      if (Math.abs(delta) > 35) {
        cycleVignettes(delta > 0 ? 1 : -1);
      }
    }
  }
  lastScrollY = now;
}, { passive: true });

// Signals: animate charts on hover
const signalCards = document.querySelectorAll('.signal-card');

signalCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.querySelectorAll('.chart-bar').forEach(bar => {
      const width = bar.getAttribute('data-width');
      if (!width) return;
      bar.querySelector('::after');
    });
    card.querySelectorAll('.chart-bar').forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.setProperty('--target-width', width + '%');
      const afterSpan = document.createElement('span');
      afterSpan.style.position = 'absolute';
      afterSpan.style.inset = '0';
      afterSpan.style.borderRadius = '999px';
      afterSpan.style.width = '0';
      afterSpan.style.transition = 'width 0.6s ease-out';
      afterSpan.style.background = bar.classList.contains('baseline')
        ? 'linear-gradient(90deg, rgba(31,58,74,0.4), rgba(31,58,74,0.9))'
        : 'linear-gradient(90deg, rgba(178,58,46,0.4), rgba(178,58,46,0.9))';
      bar.innerHTML = '';
      bar.appendChild(afterSpan);
      requestAnimationFrame(() => {
        afterSpan.style.width = width + '%';
      });
    });
  }, { once: true });
});

// Friction strip: hover reveals details and fills segment
const frictionSegments = document.querySelectorAll('.friction-segment');
const frictionBody = document.getElementById('frictionBody');

const frictionCopy = {
  discover: 'Discover · Mild uncertainty about value, but stakes are low.',
  onboard: 'Onboard · Norm confusion and competing instructions increased drop‑off most.',
  use: 'Use · Attention load during peak tasks reduced follow‑through.',
  exit: 'Exit · Lack of clear off‑ramp led to silent churn instead of feedback.'
};

frictionSegments.forEach(seg => {
  seg.addEventListener('mouseenter', () => {
    frictionSegments.forEach(s => s.classList.remove('active'));
    seg.classList.add('active');
    const phase = seg.getAttribute('data-phase');
    if (frictionBody && frictionCopy[phase]) {
      frictionBody.textContent = frictionCopy[phase];
    }
  });
});

// Decisions: click nodes to reveal panels + animate micro-charts
const decisionNodes = document.querySelectorAll('.decision-node');
const decisionPanels = document.querySelectorAll('.decision-panel');

function activateDecision(key) {
  decisionNodes.forEach(node => {
    node.classList.toggle('active', node.getAttribute('data-decision') === key);
  });
  decisionPanels.forEach(panel => {
    const active = panel.getAttribute('data-panel') === key;
    panel.classList.toggle('active', active);
    if (active) {
      panel.querySelectorAll('.micro-bar').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (!width) return;
        const inner = document.createElement('span');
        inner.style.position = 'absolute';
        inner.style.inset = '0';
        inner.style.borderRadius = '999px';
        inner.style.width = '0';
        inner.style.transition = 'width 0.6s ease-out';
        inner.style.background = bar.classList.contains('baseline')
          ? 'linear-gradient(90deg, rgba(31,58,74,0.4), rgba(31,58,74,0.9))'
          : 'linear-gradient(90deg, rgba(178,58,46,0.4), rgba(178,58,46,0.9))';
        bar.innerHTML = '';
        bar.appendChild(inner);
        requestAnimationFrame(() => { inner.style.width = width + '%'; });
      });
    }
  });
}

decisionNodes.forEach(node => {
  node.addEventListener('click', () => {
    activateDecision(node.getAttribute('data-decision'));
  });
});

// Initialize first decision
activateDecision('constraint');

// Outcomes timeline
const timelineDots = document.querySelectorAll('.timeline-dot');
const timelineYear = document.getElementById('timelineYear');
const timelineText = document.getElementById('timelineText');

function activateDot(dot) {
  const track = dot.getAttribute('data-track');
  const year = dot.getAttribute('data-year');
  const text = dot.getAttribute('data-text');
  document
    .querySelectorAll(`.timeline-track[data-track="${track}"] .timeline-dot`)
    .forEach(d => d.classList.remove('active'));
  dot.classList.add('active');
  if (timelineYear && timelineText) {
    const labelTrack = track === 'people' ? 'Individuals' : track === 'systems' ? 'Systems' : 'Risk';
    timelineYear.textContent = `${year} · ${labelTrack}`;
    timelineText.textContent = text;
  }
}

timelineDots.forEach(dot => {
  dot.addEventListener('click', () => activateDot(dot));
});

// Activate a default dot
if (timelineDots.length) activateDot(timelineDots[2]);
