(() => {
  const doc = document.documentElement;
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const cursorGlow = document.querySelector('.cursor-glow');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScrollHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 36);
  };

  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('is-open');
    mobileMenu?.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      navToggle?.setAttribute('aria-label', 'Open menu');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: offset, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  if (!reduceMotion) {
    const revealItems = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item, index) => {
      if (!item.style.getPropertyValue('--delay')) {
        item.style.setProperty('--delay', `${Math.min((index % 5) * 0.055, 0.22)}s`);
      }
      revealObserver.observe(item);
    });
  } else {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  }

  const animateCounter = (counter) => {
    if (counter.dataset.counted === 'true') return;
    counter.dataset.counted = 'true';

    const target = Number(counter.dataset.target || 0);
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';
    const format = counter.dataset.format || 'locale';
    const duration = reduceMotion ? 1 : 1600;
    const startTime = performance.now();

    const formatNumber = (value) => {
      const rounded = Math.round(value);
      const number = format === 'plain' ? String(rounded) : rounded.toLocaleString();
      return `${prefix}${number}${suffix}`;
    };

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = formatNumber(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = formatNumber(target);
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateCounter(entry.target);
    });
  }, { threshold: 0.42 });

  document.querySelectorAll('.counter').forEach((counter) => counterObserver.observe(counter));

  const barObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      bar.style.setProperty('--width', bar.dataset.width || '0');
      requestAnimationFrame(() => bar.classList.add('is-filled'));
      observer.unobserve(bar);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('.bar-row b').forEach((bar) => barObserver.observe(bar));

  const glowTargets = document.querySelectorAll('.metric-card, .dashboard-card, .glass-panel, .summary-card, .spec-card, .return-block, .timeline-item, .lifestyle-callout');

  glowTargets.forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty('--mx', `${x}%`);
      target.style.setProperty('--my', `${y}%`);
    });
  });

  if (!reduceMotion) {
    const parallaxItems = document.querySelectorAll('[data-parallax]');
    const galleryCards = document.querySelectorAll('.gallery-card[data-depth]');
    let ticking = false;

    const updateParallax = () => {
      const viewportHeight = window.innerHeight || 1;

      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.parallax || 0);
        const rect = item.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        item.style.transform = `translate3d(0, ${progress * speed * -120}px, 0)`;
      });

      galleryCards.forEach((card) => {
        const depth = Number(card.dataset.depth || 0);
        const rect = card.getBoundingClientRect();
        const progress = (rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;
        card.style.setProperty('--parallax', `${progress * depth * -120}px`);
      });

      ticking = false;
    };

    const requestParallax = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    updateParallax();
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
  }

  if (cursorGlow && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.classList.add('is-visible');
      cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      cursorGlow.classList.remove('is-visible');
    });
  }

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.13}px, ${y * 0.22}px)`;
      });

      button.addEventListener('pointerleave', () => {
        button.style.transform = '';
      });
    });
  }

  window.addEventListener('load', () => {
    doc.classList.add('is-loaded');
  });
})();
