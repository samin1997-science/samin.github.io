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
systemNodes.forEach((node) => {
  node.addEventListener('click', () => {
    const target = node.getAttribute('data-target');
    smoothScrollTo(target);
  });
});

// Update active system node + indicator on scroll
const sections = ['#about', '#inputs', '#signals', '#decisions', '#outcomes'].map((id) => document.querySelector(id));
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
    indicator.style.transform = `translateX(${activeIndex * 100}%)`;
  }
}

window.addEventListener('scroll', updateSystemMap);
updateSystemMap();

// Inputs: progressive disclosure
const vignetteEls = document.querySelectorAll('.input-vignette');
const inputCards = document.querySelectorAll('.input-card');

let vignetteIndex = 0;

function setVignette(index) {
  vignetteIndex = index;
  vignetteEls.forEach((v, i) => v.classList.toggle('active', i === vignetteIndex));
  const ref = vignetteEls[vignetteIndex].getAttribute('data-input-ref');
  inputCards.forEach((card) => {
    card.classList.toggle('active', card.getAttribute('data-input') === ref);
  });
}

setVignette(0);

let lastScrollY = window.scrollY;
window.addEventListener(
  'scroll',
  () => {
    const now = window.scrollY;
    const delta = now - lastScrollY;
    const inputsSection = document.getElementById('inputs');
    if (inputsSection) {
      const rect = inputsSection.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
        if (Math.abs(delta) > 35) {
          const total = vignetteEls.length;
          const nextIndex = (vignetteIndex + (delta > 0 ? 1 : -1) + total) % total;
          setVignette(nextIndex);
        }
      }
    }
    lastScrollY = now;
  },
  { passive: true }
);

// Work panels: fade in + animate mini charts when in view
const workPanels = document.querySelectorAll('.work-panel');

const workObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const panel = entry.target;
        panel.classList.add('visible');
        // animate bars
        panel.querySelectorAll('.mini-bar').forEach((bar) => {
          const width = bar.getAttribute('data-width');
          if (!width) return;
          bar.querySelector('::after');
          bar.style.setProperty('--w', width + '%');
          requestAnimationFrame(() => {
            bar.style.setProperty('--w', width + '%');
            bar.style.setProperty('overflow', 'hidden');
            bar.style.setProperty('position', 'relative');
            bar.style.setProperty('display', 'block');
          });
          bar.style.setProperty('transition', 'none');
          requestAnimationFrame(() => {
            bar.style.setProperty('transition', '');
            bar.style.setProperty('width', '100%');
            bar.style.setProperty('clipPath', `inset(0 calc(100% - ${width}%) 0 0)`);
          });
        });
        panel.querySelectorAll('.mini-pill').forEach((pill) => {
          const width = pill.getAttribute('data-width');
          if (!width) return;
          pill.style.setProperty('--w', width + '%');
          pill.style.setProperty('position', 'relative');
          const inner = document.createElement('span');
          inner.style.position = 'absolute';
          inner.style.inset = '0';
          inner.style.borderRadius = '999px';
          inner.style.width = '0';
          inner.style.transition = 'width 0.6s ease-out';
          inner.style.background = 'linear-gradient(90deg, rgba(31,58,74,0.4), rgba(178,58,46,0.8))';
          pill.appendChild(inner);
          requestAnimationFrame(() => {
            inner.style.width = width + '%';
          });
        });
        const ringWrap = panel.querySelector('.work-ring');
        const ring = panel.querySelector('.ring-fg');
        if (ringWrap && ring) {
          const target = parseInt(ringWrap.getAttribute('data-ring') || '0', 10);
          const circumference = 2 * Math.PI * 40;
          const offset = circumference * (1 - target / 100);
          ring.style.strokeDashoffset = offset;
        }
        workObserver.unobserve(panel);
      }
    });
  },
  { threshold: 0.4 }
);

workPanels.forEach((panel) => workObserver.observe(panel));

// Signals: animate charts on first hover
const signalCards = document.querySelectorAll('.signal-card');

signalCards.forEach((card) => {
  card.addEventListener(
    'mouseenter',
    () => {
      card.querySelectorAll('.chart-bar').forEach((bar) => {
        const width = bar.getAttribute('data-width');
        if (!width) return;
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
    },
    { once: true }
  );
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

frictionSegments.forEach((seg) => {
  seg.addEventListener('mouseenter', () => {
    frictionSegments.forEach((s) => s.classList.remove('active'));
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
  decisionNodes.forEach((node) => {
    node.classList.toggle('active', node.getAttribute('data-decision') === key);
  });
  decisionPanels.forEach((panel) => {
    const active = panel.getAttribute('data-panel') === key;
    panel.classList.toggle('active', active);
    if (active) {
      panel.querySelectorAll('.micro-bar').forEach((bar) => {
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
        requestAnimationFrame(() => {
          inner.style.width = width + '%';
        });
      });
    }
  });
}

decisionNodes.forEach((node) => {
  node.addEventListener('click', () => {
    activateDecision(node.getAttribute('data-decision'));
  });
});

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
    .forEach((d) => d.classList.remove('active'));
  dot.classList.add('active');
  if (timelineYear && timelineText) {
    const labelTrack = track === 'people' ? 'Individuals' : track === 'systems' ? 'Systems' : 'Risk';
    timelineYear.textContent = `${year} · ${labelTrack}`;
    timelineText.textContent = text;
  }
}

timelineDots.forEach((dot) => {
  dot.addEventListener('click', () => activateDot(dot));
});

if (timelineDots.length) activateDot(timelineDots[2]);

// Findings: animate bars when scrolled into view + jump to work panel
const findingCards = document.querySelectorAll('.finding-card');

const findingsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const bar = card.querySelector('.finding-bar');
        if (bar) {
          const width = bar.getAttribute('data-width') || '70';
          card.style.setProperty('--finding-width', width + '%');
          card.classList.add('active');
        }
        findingsObserver.unobserve(card);
      }
    });
  },
  { threshold: 0.5 }
);

findingCards.forEach((card) => findingsObserver.observe(card));

findingCards.forEach((card) => {
  const btn = card.querySelector('.finding-jump');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const ref = card.getAttribute('data-project-ref');
    const targetPanel = document.querySelector(`.work-panel[data-project="${ref}"]`);
    if (targetPanel) {
      const top = targetPanel.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
