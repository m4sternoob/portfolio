// Smooth-scroll for in-page anchor links.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', anchor.getAttribute('href'));
  });
});

// Highlight the active nav link based on scroll position.
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.topnav .nav-links a[href^="#"]');

function syncNav() {
  let currentId = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) currentId = '#' + section.id;
  });
  navLinks.forEach((link) => {
    link.style.color = '';
    if (link.getAttribute('href') === currentId) {
      link.style.color = 'var(--accent)';
    }
  });
}

window.addEventListener('scroll', syncNav, { passive: true });
syncNav();

// Fade-in cards on first paint (progressive enhancement).
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.project-card, .skill-category, .contact-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
}

// Modal functionality
const modals = document.querySelectorAll('.modal');
const modalTriggers = document.querySelectorAll('.details-trigger');
const modalCloses = document.querySelectorAll('.modal-close');

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.hidden = false;
    // Force reflow for animation
    modal.offsetHeight;
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const modalId = trigger.getAttribute('href').slice(1);
    openModal(modalId);
  });
});

modalCloses.forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    closeModal(modal);
  });
});

// Close modal on backdrop click
modals.forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modals.forEach(modal => {
      if (!modal.hidden) closeModal(modal);
    });
  }
});

// Parallax hero background shape (subtle)
const heroShape = document.querySelector('.hero-bg-shape');
if (heroShape) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroShape.style.transform = `translate(-50%, ${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

// Add active class to nav on scroll (for potential styling)
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const nav = document.querySelector('.topnav');
      if (window.scrollY > 50) {
        nav.style.background = 'rgba(13, 13, 18, 0.95)';
        nav.style.borderBottomColor = 'var(--border-bright)';
      } else {
        nav.style.background = 'rgba(13, 13, 18, 0.85)';
        nav.style.borderBottomColor = 'var(--border)';
      }
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

console.log('🎮 Portfolio loaded — M4sterNoob');