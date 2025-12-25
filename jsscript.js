// =========================================================================
// script.js (ES Module friendly)
// - Handles: preloader, typed hero, lottie init, nav toggle, theme, lazy loading,
//   reveal animations, GSAP entrance, pointer tilt, project filters, lightbox,
//   SVG circular skills animation, canvas particles, mobile-friendly behaviors.
// =========================================================================

/* NOTE: this file uses GSAP (loaded from CDN in index.html). Lottie is optional. */

const SELECT = {
  preloader: '#preloader',
  typed: '#typed-text',
  heroLottie: '#heroLottie',
  navToggle: '#navToggle',
  navMenu: '#navMenu',
  themeToggle: '#themeToggle',
  reveal: '.reveal',
  lazy: 'img.lazy',
  projectCard: '.project-card',
  filterBtn: '.filter',
  lightbox: '#lightbox',
  lightboxImage: '#lightboxImage',
  lightboxTitle: '#lightboxTitle',
  lightboxClose: '.lightbox-close',
  bgCanvas: '#bgCanvas',
  skillCircle: '.skill-circle'
};

document.addEventListener('DOMContentLoaded', () => {
  // Remove preloader after minimal time (or once assets initialised)
  const preloader = document.querySelector(SELECT.preloader);
  setTimeout(() => preloader?.remove(), 700);

  // Nav toggle (mobile)
  const navToggle = document.querySelector(SELECT.navToggle);
  const navMenu = document.querySelector(SELECT.navMenu);
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.style.display = expanded ? '' : 'flex';
  });

  // Theme (persist)
  const themeToggle = document.querySelector(SELECT.themeToggle);
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme || 'dark');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Lottie optional hero micro-animation
  initHeroLottie();

  // Typed hero line
  const typedEl = document.querySelector(SELECT.typed);
  if (typedEl) typeLoop(typedEl, ['Student Web Developer', 'HTML • CSS • JavaScript', 'Anime UI Enthusiast'], 90, 900);

  // Lazy load: standard images
  lazyLoadImages();

  // Reveal & GSAP entrance
  initRevealAndGSAP();

  // Project pointer tilt & accessibility focus tilt
  initPointerTilt();

  // Filters
  initFilters();

  // Lightbox
  initLightbox();

  // Skills - circular SVG meters
  initSkillCircles();

  // Particles in background
  initParticles(document.querySelector(SELECT.bgCanvas));

  // Register service worker (optional - make sure sw.js exists)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker?.register('/sw.js').catch(()=>{/*ignore*/});
  }

  // Accessibility: keyboard navigation focus handling for project cards
  document.querySelectorAll(SELECT.projectCard).forEach(card => {
    card.addEventListener('keyup', (e) => { if (e.key === 'Enter') card.querySelector('button[data-open="modal"]')?.click(); });
  });
});

/* -------------------------
   THEME
   ------------------------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg', '#f8fafb');
    document.documentElement.style.setProperty('--accent', '#0066cc');
    document.documentElement.style.setProperty('--muted', '#445566');
  } else {
    document.documentElement.style.removeProperty('--bg');
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--muted');
  }
}

/* -------------------------
   LOTTIE HERO (optional)
   ------------------------- */
function initHeroLottie() {
  const el = document.querySelector('#heroLottie');
  if (!el || typeof lottie === 'undefined') return;
  // load a json from assets/hero-lottie.json if provided (replace path if needed)
  try {
    lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/hero-lottie.json' // TODO: provide JSON or remove
    });
  } catch (e) {
    // ignore if missing
  }
}

/* -------------------------
   Typed text (simple)
   ------------------------- */
function typeLoop(el, phrases, speed=100, pause=900) {
  let pi = 0, ii = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ii+1);
      ii++;
      if (ii === phrase.length) { deleting = true; setTimeout(tick, pause); return; }
    } else {
      el.textContent = phrase.slice(0, ii-1);
      ii--;
      if (ii === 0) { deleting = false; pi = (pi+1) % phrases.length; }
    }
    setTimeout(tick, deleting ? speed/2 : speed);
  }
  tick();
}

/* -------------------------
   Lazy load
   ------------------------- */
function lazyLoadImages() {
  const imgs = document.querySelectorAll('img.lazy');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(i => io.observe(i));
  } else {
    imgs.forEach(i => i.src = i.dataset.src);
  }
}

/* -------------------------
   Reveal + GSAP entrance
   ------------------------- */
function initRevealAndGSAP() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // GSAP entrance if present
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(entry.target, {opacity:0, y:18}, {opacity:1, y:0, duration:0.8, ease:'power3.out'});
        }
        // trigger skills when skills section appears
        if (entry.target.id === 'skills' || entry.target.querySelector('.skill-circle')) {
          animateSkillCircles();
        }
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  reveals.forEach(r => obs.observe(r));

  // Also animate hero elements with GSAP
  if (typeof gsap !== 'undefined') {
    try {
      const tl = gsap.timeline({defaults:{duration:0.9, ease:'power3.out'}});
      tl.from('.hero-avatar', {y:20, opacity:0, stagger:0.06})
        .from('.hero-title', {y:8, opacity:0}, '-=0.6')
        .from('.hero-sub', {y:8, opacity:0}, '-=0.6')
        .from('.hero-ctas .btn', {y:8, opacity:0, stagger:0.08}, '-=0.6')
        .from('.typed-wrap', {opacity:0}, '-=0.5');
      // subtle hero parallax on pointer move
      const avatar = document.querySelector('.hero-avatar');
      if (avatar) {
        avatar.addEventListener('pointermove', (e) => {
          const r = avatar.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width/2)) / r.width;
          const dy = (e.clientY - (r.top + r.height/2)) / r.height;
          gsap.to(avatar, {x: dx*6, y: dy*6, rotation: dx*3, duration:0.9, ease:'power2.out'});
        });
        avatar.addEventListener('pointerleave', () => { gsap.to(avatar, {x:0, y:0, rotation:0, duration:0.6, ease:'power2.out'}); });
      }
    } catch (e) {
      // fail silently if gsap not available
    }
  }
}

/* -------------------------
   Pointer tilt for project cards (3D tilt)
   ------------------------- */
function initPointerTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    const rect = () => card.getBoundingClientRect();
    const onMove = (e) => {
      const r = rect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * 10; // rotateX
      const ry = (px - 0.5) * -10; // rotateY
      const tz = 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
      // subtle shadow
      card.style.boxShadow = `${-ry*3}px ${rx*3}px 30px rgba(0,255,204,0.06)`;
    };
    const reset = () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointerdown', () => card.classList.add('pressed'));
    card.addEventListener('pointerup', () => card.classList.remove('pressed'));
  });
}

/* -------------------------
   Filters
   ------------------------- */
function initFilters() {
  const buttons = document.querySelectorAll('.filter');
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const cards = grid.querySelectorAll('.project-card');
      cards.forEach(c => {
        const tags = (c.dataset.tags || '').split(',').map(s => s.trim());
        if (filter === 'all' || tags.includes(filter)) c.style.display = '';
        else c.style.display = 'none';
      });
    });
  });
}

/* -------------------------
   Lightbox (image preview)
   ------------------------- */
function initLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImage');
  const lbTitle = document.getElementById('lightboxTitle');

  document.querySelectorAll('button[data-open="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src;
      const title = btn.dataset.title || '';
      lbImg.src = src;
      lbImg.alt = title;
      lbTitle.textContent = title;
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('.lightbox-close').forEach(b => b.addEventListener('click', closeLB));
  lb?.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  function closeLB() {
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    lbTitle.textContent = '';
    document.body.style.overflow = '';
  }
}

/* -------------------------
   Animate circular skill meters
   ------------------------- */
function initSkillCircles() {
  // prepare strokeLength for each .progress circle
  document.querySelectorAll('.skill-circle').forEach(el => {
    const progress = el.querySelector('.progress');
    if (!progress) return;
    const r = progress.r.baseVal.value;
    const circumference = 2 * Math.PI * r;
    progress.style.strokeDasharray = `${circumference} ${circumference}`;
    progress.style.strokeDashoffset = circumference;
    // set colors optionally per index
    progress.style.stroke = window.getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00ffcc';
  });
}

function animateSkillCircles() {
  document.querySelectorAll('.skill-circle').forEach(el => {
    const value = Number(el.dataset.value || 0);
    const progress = el.querySelector('.progress');
    const text = el.querySelector('.skill-text');
    if (!progress || !text) return;
    const r = progress.r.baseVal.value;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (value / 100) * circumference;
    // animate stroke dash offset with gsap if available
    if (typeof gsap !== 'undefined') {
      gsap.to(progress.style, {strokeDashoffset: offset, duration: 1.0, ease: 'power3.out'});
      // numeric counter
      gsap.fromTo({n:0},{n:value,duration:1.0,ease:'power3.out',onUpdate:function(){ text.textContent = Math.floor(this.targets()[0].n) + '%'; }});
    } else {
      // fallback immediate
      progress.style.strokeDashoffset = offset;
      text.textContent = value + '%';
    }
  });
}

/* -------------------------
   Canvas particles - lightweight
   ------------------------- */
function initParticles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.max(18, Math.floor(w * h / 120000));
  function rand(min,max){ return Math.random()*(max-min)+min; }
  for (let i=0;i<count;i++){
    particles.push({ x:rand(0,w), y:rand(0,h), r:rand(0.6,2.6), vx:rand(-0.26,0.26), vy:rand(-0.36,0.36), a:rand(0.06,0.25) });
  }
  addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w+10;
      if (p.x > w+10) p.x = -10;
      if (p.y < -10) p.y = h+10;
      if (p.y > h+10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,255,204,${p.a})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}