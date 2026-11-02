/* SkillNest Academy — interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* ---------- Header: scrolled state ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const setMenu = (open, returnFocus) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open && returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  nav.addEventListener('click', e => { if (e.target.closest('[data-open-register]')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true); });
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Active section indicator ---------- */
  const links = $$('[data-link]');
  const sectionIds = ['home', 'courses', 'why', 'how', 'faq'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const setActive = id => links.forEach(a => {
    const on = a.dataset.link === id;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  const updateActive = () => {
    const probe = window.scrollY + header.offsetHeight + window.innerHeight * 0.25;
    let current = 'home';
    sections.forEach(sec => { if (sec.offsetTop <= probe) current = sec.id; });
    setActive(current);
  };
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);

  /* ---------- Hero headline: split into lines for a line-by-line reveal ---------- */
  const h1 = $('[data-split]');
  const splitLines = () => {
    const text = h1.dataset.text || (h1.dataset.text = h1.textContent.trim().replace(/\s+/g, ' '));
    h1.innerHTML = text.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
    const lines = []; let top = null;
    $$('.w', h1).forEach(w => {
      if (top === null || Math.abs(w.offsetTop - top) > 4) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    h1.innerHTML = lines.map((l, i) => `<span class="line" style="--li:${i}"><span>${l.join(' ')}</span></span>`).join('');
    h1.classList.add('is-split');
  };

  /* ---------- Hero entrance ---------- */
  const startHero = () => {
    if (!reduceMotion.matches) {
      splitLines();
      const delays = { 1: 120, 2: 640, 3: 780, 4: 920 };
      $$('[data-hero]').forEach(el => el.style.setProperty('--d', delays[el.dataset.hero] || 0));
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
      let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(splitLines, 150); });
    } else {
      root.classList.add('is-ready');
    }
  };
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(startHero);

  /* ---------- Hero video (optional — plays only if a source is added in index.html) ---------- */
  const video = $('[data-hero-video]');
  if (video) {
    const hasSource = video.getAttribute('src') || video.querySelector('source');
    const saveData = navigator.connection && navigator.connection.saveData;
    if (hasSource && !reduceMotion.matches && !saveData) {
      video.muted = true; video.defaultMuted = true;
      video.addEventListener('playing', () => video.classList.add('is-playing'));
      video.addEventListener('error', () => video.classList.remove('is-playing'), true);
      const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => video.classList.remove('is-playing')); };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { en.isIntersecting ? play() : video.pause(); }, { threshold: 0.2 }).observe(video);
      } else { play(); }
    }
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal], [data-reveal-group], [data-steps]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target; el.classList.add('in'); io.unobserve(el);
        if (el.hasAttribute('data-reveal-group') || el.hasAttribute('data-steps')) setTimeout(() => el.classList.add('done'), 1600);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in', 'done'));
  }

  /* ---------- Statistics count-up ---------- */
  const counters = $$('[data-count]');
  const fmt = (el, v) => { el.textContent = Math.round(v) + (el.dataset.suffix || ''); };
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    counters.forEach(el => fmt(el, 0));
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target; cio.unobserve(el);
        const target = Number(el.dataset.count), dur = 1500, t0 = performance.now();
        const tick = now => {
          const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          fmt(el, target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  } /* else: the final values are already in the HTML */

  /* ---------- FAQ accordion ---------- */
  const faq = $('[data-faq]');
  if (faq) {
    const items = $$('.faq-item', faq);
    const buttons = items.map(i => $('.faq-q', i));
    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      $('.faq-q', item).setAttribute('aria-expanded', String(open));
    };
    items.forEach(i => setOpen(i, $('.faq-q', i).getAttribute('aria-expanded') === 'true'));
    faq.addEventListener('click', e => {
      const btn = e.target.closest('.faq-q'); if (!btn) return;
      const item = btn.closest('.faq-item'), willOpen = !item.classList.contains('is-open');
      items.forEach(i => setOpen(i, false));
      setOpen(item, willOpen);
    });
    faq.addEventListener('keydown', e => {
      const i = buttons.indexOf(document.activeElement); if (i < 0) return;
      const move = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: buttons.length - 1 }[e.key];
      if (move === undefined) return;
      e.preventDefault(); buttons[(move + buttons.length) % buttons.length].focus();
    });
  }

  /* ---------- Registration dialog + validation (front-end demo only) ---------- */
  const modal = $('[data-modal]');
  const form = $('[data-form]', modal);
  const formView = $('[data-form-view]', modal);
  const success = $('[data-success]', modal);
  let lastTrigger = null;

  const rules = {
    name:   v => v.trim().length < 2 ? 'Please enter your full name.' : (/^[\p{L}][\p{L}\s.'’-]*$/u.test(v.trim()) ? '' : 'Names can only contain letters, spaces and . \' -'),
    email:  v => !v.trim() ? 'Please enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address, like you@example.com.'),
    phone:  v => { const d = v.replace(/\D/g, ''); return !v.trim() ? 'Please enter your phone number.' : (/^\+?[\d\s().-]+$/.test(v.trim()) && d.length >= 7 && d.length <= 15 ? '' : 'Please enter a valid phone number (7–15 digits).'); },
    course: v => v ? '' : 'Please choose a course.'
  };
  const fieldOf = name => form.elements[name];
  const errOf = el => document.getElementById(el.getAttribute('aria-describedby'));
  const validate = el => {
    const msg = rules[el.name](el.value), err = errOf(el);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg; err.classList.toggle('is-visible', !!msg);
    return !msg;
  };
  const touched = new Set();
  Object.keys(rules).forEach(n => {
    const el = fieldOf(n);
    el.addEventListener('blur', () => { touched.add(n); validate(el); });
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { if (touched.has(n)) validate(el); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(rules).map(n => { touched.add(n); return [n, validate(fieldOf(n))]; });
    const bad = results.find(r => !r[1]);
    if (bad) { fieldOf(bad[0]).focus(); return; }
    /* No backend is configured, so nothing is transmitted or stored.
       To collect real registrations, POST `new FormData(form)` to your own endpoint here
       and only show the confirmation after a successful response. */
    formView.hidden = true; success.hidden = false; success.focus();
  });
  const resetForm = () => {
    form.reset(); touched.clear();
    $$('.field-err', form).forEach(p => { p.textContent = ''; p.classList.remove('is-visible'); });
    $$('[aria-invalid]', form).forEach(el => el.removeAttribute('aria-invalid'));
    formView.hidden = false; success.hidden = true;
  };
  const openModal = (course, trigger) => {
    lastTrigger = trigger || null;
    resetForm();
    if (course) fieldOf('course').value = course;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    (course ? fieldOf('name') : fieldOf('name')).focus();
  };
  const closeModal = () => { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); };
  modal.addEventListener('close', () => { document.body.style.overflow = ''; if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  $$('[data-close-register]', modal).forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open-register]'); if (!t) return;
    e.preventDefault(); openModal(t.dataset.course || '', t);
  });

  /* ---------- Placeholder links ---------- */
  $$('[data-placeholder]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();
