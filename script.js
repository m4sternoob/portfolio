// M4sterNoob Portfolio — Vanilla JS
// Smooth scroll, nav highlight, modals, stats counter, hero canvas

(() => {
  'use strict';

  // ===== Smooth scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', anchor.getAttribute('href'));
    });
  });

  // ===== Nav scroll state =====
  const nav = document.querySelector('.nav');
  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 20) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        navTicking = false;
      });
      navTicking = true;
    }
  }, { passive: true });

  // ===== Mobile nav toggle =====
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('open');
    });
    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }

  // ===== Active nav link on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  function syncNav() {
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) currentId = '#' + section.id;
    });
    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === currentId) {
        link.style.color = 'var(--accent)';
      }
    });
  }
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  // ===== IntersectionObserver for fade-in =====
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.project-card, .tech-card, .about-card, .contact-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
      observer.observe(el);
    });
  }

  // ===== Stats counter animation =====
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  if (statValues.length && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 1200;
          const start = performance.now();
          function animate(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
            else el.textContent = target;
          }
          requestAnimationFrame(animate);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statValues.forEach(el => statsObserver.observe(el));
  }

  // ===== Modal functionality =====
  const modals = document.querySelectorAll('.modal');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalCloses = document.querySelectorAll('.modal-close');

  function openModal(modalId) {
    const modal = document.getElementById(modalId + '-modal') || document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = false;
    // Focus trap
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    modal.dataset.firstFocusable = firstFocusable ? '#' + firstFocusable.id : '';
    modal.dataset.lastFocusable = lastFocusable ? '#' + lastFocusable.id : '';
    document.body.style.overflow = 'hidden';
    firstFocusable?.focus();
    // Trap focus
    modal.addEventListener('keydown', trapFocus);
    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }
    modal._trapFocus = trapFocus;
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (modal._trapFocus) {
      modal.removeEventListener('keydown', modal._trapFocus);
      modal._trapFocus = null;
    }
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  modalCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  // Close on overlay click
  modals.forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        closeModal(modal);
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (!modal.hidden) closeModal(modal);
      });
    }
  });

  // ===== Hero canvas — subtle particle field =====
  const canvas = document.querySelector('.hero-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0, height = 0;
    let animationId = null;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5 ? '0,212,255' : '185,104,255';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor((width * height) / 15000), 80);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    function start() {
      resize();
      initParticles();
      animate();
      window.addEventListener('resize', () => {
        resize();
        initParticles();
      }, { passive: true });
    }

    // Respect prefers-reduced-motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      start();
    }
  }

  // ===== Parallax hero gradient =====
  const heroGradient = document.querySelector('.hero-gradient');
  if (heroGradient) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;
      if (scrolled < heroHeight) {
        heroGradient.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroGradient.style.opacity = 1 - scrolled / heroHeight;
      }
    }, { passive: true });
  }

  console.log('🎮 M4sterNoob Portfolio loaded');
})();