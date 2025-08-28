const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

(() => {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

(() => {
  const btn = $('.nav-toggle');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  const closeOnLink = (e) => {
    if (e.target.classList.contains('nav-link') || e.target.classList.contains('nav-cta')) {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  };

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
  });

  menu.addEventListener('click', closeOnLink);
})();

(() => {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });

  targets.forEach((el) => io.observe(el));
})();

(() => {
  const cards = $$('[data-tilt]');
  if (!cards.length) return;

  const damp = 14;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  cards.forEach((card) => {
    let hover = false;

    card.addEventListener('pointerenter', () => { hover = true; card.style.willChange = 'transform'; });
    card.addEventListener('pointerleave', () => {
      hover = false; card.style.transform = ''; card.style.willChange = 'auto';
    });
    card.addEventListener('pointermove', (e) => {
      if (!hover) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rx = clamp(-dy * damp, -6, 6);
      const ry = clamp(dx * damp, -6, 6);
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  });
})();

(() => {
  const cards = $$('.project-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const wrap = $('.project-media', card);
    const type = card.getAttribute('data-type');
    const src = card.getAttribute('data-preview');
    const poster = card.getAttribute('data-poster') || '';

    if (!wrap || !type || !src) return;

    let mediaEl = null;
    if (type === 'video') {
      mediaEl = document.createElement('video');
      mediaEl.src = src; mediaEl.playsInline = true; mediaEl.muted = true; mediaEl.loop = true;
      if (poster) mediaEl.poster = poster;
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = src; mediaEl.alt = ''; mediaEl.loading = 'lazy'; mediaEl.decoding = 'async';
    }
    wrap.appendChild(mediaEl);

    if (type === 'video') {
      const play = () => mediaEl.play().catch(() => {});
      const pause = () => mediaEl.pause();
      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', pause);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', pause);
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.isIntersecting ? play() : pause());
      }, { threshold: 0.6 });
      io.observe(card);
    }
  });
})();

(() => {
  const chips = $$('.chip');
  const cards = $$('.project-card');
  if (!chips.length || !cards.length) return;

  const setActive = (clicked) => {
    chips.forEach((c) => c.classList.toggle('is-active', c === clicked));
  };

  const applyFilter = (key) => {
    cards.forEach((card) => {
      const tags = (card.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
      const show = key === 'all' || tags.includes(key);
      card.style.display = show ? '' : 'none';
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      setActive(chip);
      applyFilter(chip.dataset.filter);
    });
  });

  applyFilter('all');
})();

(() => {
  const form = $('.contact-form');
  const status = $('.form-status', form || document);
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      status.textContent = 'Harap lengkapi semua field.';
      return;
    }
    status.textContent = 'Terkirim. Akan dihubungi secepatnya. Terima kasih!';
    form.reset();
  });
})();

(() => {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

(() => {
  const btn = document.getElementById('to-top');
  if (!btn) return;

  const THRESHOLD = 320;
  let isLaunching = false;

  const onScroll = () => {
    if (window.scrollY > THRESHOLD) btn.classList.add('show');
    else btn.classList.remove('show');
  };

  const smoothTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { window.scrollTo(0, 0); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  btn.addEventListener('click', () => {
    if (isLaunching) return;
    isLaunching = true;
    btn.classList.add('launch');
    const oldLabel = btn.getAttribute('aria-label') || 'Kembali ke atas';
    btn.setAttribute('aria-label', 'Meluncur ke atas');

    smoothTop();

    const dur = getComputedStyle(document.documentElement)
      .getPropertyValue('--rocket-dur').trim();
    const ms = dur.endsWith('ms') ? parseFloat(dur) : parseFloat(dur) * 1000;

    setTimeout(() => {
      btn.classList.remove('launch');
      btn.setAttribute('aria-label', oldLabel);
      isLaunching = false;
    }, ms + 80);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

(() => {
  const btn = document.getElementById('to-top');
  if (!btn) return;

  const RADIUS = 140;          
  const STRENGTH = 0.15;       
  const MAX_SCALE_BOOST = 0.08; 

  let raf = 0;
  let targetTX = 0, targetTY = 0, targetScale = 1;
  let curTX = 0, curTY = 0, curScale = 1;

  const lerp = (a, b, t) => a + (b - a) * t;

  function animate() {
    curTX = lerp(curTX, targetTX, 0.22);
    curTY = lerp(curTY, targetTY, 0.22);
    curScale = lerp(curScale, targetScale, 0.22);


    btn.style.translate = `${curTX}px ${curTY}px`;
    btn.style.scale = String(curScale);

    raf = requestAnimationFrame(animate);
  }

  function resetMagnet() {
    targetTX = targetTY = 0;
    targetScale = 1;
    btn.classList.remove('near');
  }

  function onPointerMove(e) {
    if (!btn.classList.contains('show') || btn.classList.contains('launch')) {
      resetMagnet();
      return;
    }

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < RADIUS) {
      const t = 1 - dist / RADIUS;          
      targetTX = dx * STRENGTH * t;
      targetTY = dy * STRENGTH * t;
      targetScale = 1 + (MAX_SCALE_BOOST * t);
      btn.classList.add('near');
    } else {
      resetMagnet();
    }
  }

  function onPointerLeave() { resetMagnet(); }
  function onScrollOrResize() {
    if (!btn.classList.contains('show')) resetMagnet();
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  if (!raf) raf = requestAnimationFrame(animate);
})();

(() => {
  const root = document.documentElement;
  const cursor = document.querySelector('.cursor-dot');
  if (!cursor) return;

  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFine) return;

  let mouseX = 0, mouseY = 0;
  let x = 0, y = 0;
  const FOLLOW = 0.6; 

  const raf = () => {
    x += (mouseX - x) * FOLLOW;
    y += (mouseY - y) * FOLLOW;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(raf);
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (Math.abs(mouseX - x) + Math.abs(mouseY - y) > 240) {
      x = mouseX; y = mouseY;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, { passive: true });

  const actSel = 'a, button, .butto, [role="button"], input[type="submit"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(actSel)) cursor.classList.add('active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(actSel)) cursor.classList.remove('active');
  });

  const focusSel = 'input, textarea, [contenteditable="true"]';
  document.addEventListener('focusin', (e) => {
    if (e.target.closest(focusSel)) root.classList.add('cursor-hidden');
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.closest(focusSel)) root.classList.remove('cursor-hidden');
  });

  requestAnimationFrame(raf);
})();

(() => {
  const canvas = document.getElementById('bg-stars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 0, H = 0, running = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let STAR_COUNT = 0;     
  let DUST_COUNT = 0;     
  const STARS = [];
  const DUSTS = [];

  function resize() {
    const { innerWidth, innerHeight } = window;
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    STAR_COUNT = Math.round((W * H) / 9000);
    DUST_COUNT = Math.round((W * H) / 45000);

    STAR_COUNT = Math.min(STAR_COUNT, 220);
    DUST_COUNT = Math.min(DUST_COUNT, 80);

    spawnObjects();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnObjects() {
    STARS.length = 0;
    DUSTS.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
      const z = Math.random();
      STARS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z,
        r: 0.6 + z * 1.2,
        tw: rand(0, Math.PI * 2),     
        tws: rand(0.8, 1.8),          
      });
    }

    for (let i = 0; i < DUST_COUNT; i++) {
      DUSTS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: rand(-0.04, 0.06),       
        vy: rand(-0.02, 0.04),
        r: rand(0.8, 2.0),
        a: rand(0.05, 0.18),          
      });
    }
  }

  let lastT = 0;
  function draw(t = 0) {
    if (!running) return;
    const dt = Math.min(32, t - lastT || 16) / 1000;
    lastT = t;

    ctx.clearRect(0, 0, W, H);

    const sy = window.scrollY || 0;
    const parallaxBase = -sy * 0.05;

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--star-color').trim() || 'rgba(255,255,255,0.9)';
    for (const s of STARS) {
      const twinkle = reduceMotion ? 1 : (0.7 + Math.sin(s.tw) * 0.3);
      s.tw += s.tws * dt; 

      const px = s.x;
      const py = s.y + parallaxBase * (s.z * 0.8 + 0.2);

      ctx.globalAlpha = Math.min(1, twinkle);
      ctx.beginPath();
      ctx.arc(px, wrap(py, -5, H + 5), s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const d of DUSTS) {
      if (!reduceMotion) {
        d.x += d.vx;
        d.y += d.vy;
      }
      d.x = wrap(d.x, -10, W + 10);
      d.y = wrap(d.y, -10, H + 10);

      const px = d.x;
      const py = d.y + parallaxBase * 0.25;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, d.r * 2.4);
      grad.addColorStop(0, `rgba(255,255,255,${d.a})`);
      const dustColor = getComputedStyle(document.documentElement).getPropertyValue('--dust-color').trim() || 'rgba(255,255,255,0.12)';
      grad.addColorStop(1, dustColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, wrap(py, -10, H + 10), d.r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  function wrap(v, min, max) {
    const range = max - min;
    while (v < min) v += range;
    while (v > max) v -= range;
    return v;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      lastT = 0;
      if (!reduceMotion) requestAnimationFrame(draw);
      else { 
        draw(performance.now());
      }
    }
  });

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) draw(performance.now());
  });

  if (!reduceMotion) {
    requestAnimationFrame(draw);
  } else {
    draw(performance.now());
  }
})();


(() => {
  const strokes = document.querySelectorAll('.brand-stroke');
  strokes.forEach(p => {
    try {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--logo-len', `${len}`);
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    } catch {}
  });
})();