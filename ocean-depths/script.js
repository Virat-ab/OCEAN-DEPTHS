/* ============================================================
   Ocean Depths — script.js
   All scroll interactions, animations, cursor, particles etc.
   ============================================================ */

/* ─── LOADER ─────────────────────────────────── */
(function initLoader() {
  const fill   = document.getElementById('loader-fill');
  const loader = document.getElementById('loader');
  let progress = 0;

  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = 'auto';
      }, 400);
    }
    fill.style.width = progress + '%';
  }, 120);

  document.body.style.overflow = 'hidden';
})();


/* ─── CUSTOM CURSOR ─────────────────────────────────── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let fx = 0, fy = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });

  function animateFollower() {
    fx += (tx - fx) * 0.12;
    fy += (ty - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Scale on hover
  document.querySelectorAll('a, button, .fact-card, .ascend-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
      follower.style.transform = 'translate(-50%,-50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      follower.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
})();


/* ─── DEPTH / PRESSURE SCROLL TRACKER ─────────────────────────────────── */
(function initDepthTracker() {
  const depthVal  = document.getElementById('depth-value');
  const navPressure = document.getElementById('nav-pressure');
  const nav = document.getElementById('nav');

  const zones = Array.from(document.querySelectorAll('.zone')).map(z => ({
    el:       z,
    depth:    parseInt(z.dataset.depth),
    pressure: parseInt(z.dataset.pressure),
  }));

  function lerp(a, b, t) { return a + (b - a) * t; }

  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress  = scrollY / maxScroll;

    // Nav
    nav.classList.toggle('scrolled', scrollY > 60);

    // Interpolate depth & pressure between zones
    let currentZoneIdx = 0;
    zones.forEach((z, i) => {
      const rect = z.el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) currentZoneIdx = i;
    });

    const curr = zones[currentZoneIdx];
    const next = zones[Math.min(currentZoneIdx + 1, zones.length - 1)];
    const zoneRect = curr.el.getBoundingClientRect();
    const zoneProgress = Math.max(0, Math.min(1,
      -zoneRect.top / zoneRect.height
    ));

    const depth    = Math.round(lerp(curr.depth,    next.depth,    zoneProgress));
    const pressure = Math.round(lerp(curr.pressure, next.pressure, zoneProgress));

    depthVal.textContent    = depth.toLocaleString() + 'm';
    navPressure.textContent = pressure + ' ATM';

    // Gauge fill for twilight zone
    const gauge = document.getElementById('gauge-fill');
    if (gauge) {
      const pct = Math.min(100, (pressure / 1100) * 100);
      gauge.style.width = pct + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─── INTERSECTION OBSERVER — ZONE REVEAL ─────────────────────────────────── */
(function initReveal() {
  const zones = document.querySelectorAll('.zone');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Trigger stat counters if abyss zone
        if (entry.target.id === 'abyss') {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.2 });

  zones.forEach(z => observer.observe(z));
})();


/* ─── PARTICLES ─────────────────────────────────── */
(function initParticles() {
  const configs = {
    'surface-particles':  { count: 22, sizeMax: 4,   dur: [8, 14],  color: 'rgba(255,255,255,0.55)' },
    'sunlight-particles': { count: 28, sizeMax: 3,   dur: [10, 18], color: 'rgba(200,240,255,0.45)' },
    'twilight-particles': { count: 18, sizeMax: 2.5, dur: [12, 20], color: 'rgba(72,202,228,0.35)'  },
    'midnight-particles': { count: 12, sizeMax: 2,   dur: [14, 22], color: 'rgba(72,202,228,0.2)'   },
    'abyss-particles':    { count: 8,  sizeMax: 1.5, dur: [16, 26], color: 'rgba(72,202,228,0.12)'  },
  };

  Object.entries(configs).forEach(([id, cfg]) => {
    const container = document.getElementById(id);
    if (!container) return;

    for (let i = 0; i < cfg.count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * cfg.sizeMax + 1;
      const dur  = Math.random() * (cfg.dur[1] - cfg.dur[0]) + cfg.dur[0];
      const left = Math.random() * 100;
      const delay = Math.random() * -dur;
      const drift = (Math.random() - 0.5) * 60;

      p.style.cssText = `
        width:${size}px; height:${size}px;
        background:${cfg.color};
        left:${left}%;
        animation-duration:${dur}s;
        animation-delay:${delay}s;
        --drift:${drift}px;
      `;
      // Custom drift via keyframe override
      p.style.setProperty('--drift', drift + 'px');
      container.appendChild(p);
    }
  });
})();


/* ─── BIOLUMINESCENCE DOTS ─────────────────────────────────── */
(function initBiolum() {
  // Twilight zone scattered glow
  const twilightLayer = document.getElementById('biolum');
  if (twilightLayer) {
    for (let i = 0; i < 30; i++) {
      const dot = document.createElement('div');
      dot.className = 'biolum-dot';
      const size = Math.random() * 4 + 2;
      const dur  = Math.random() * 3 + 2;
      dot.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        animation-duration:${dur}s;
        animation-delay:${Math.random() * -dur}s;
      `;
      twilightLayer.appendChild(dot);
    }
  }

  // Midnight scattered dots
  const midLayer = document.getElementById('biolum-dots');
  if (midLayer) {
    for (let i = 0; i < 50; i++) {
      const dot = document.createElement('div');
      dot.className = 'biolum-dot';
      const size = Math.random() * 3 + 1;
      const dur  = Math.random() * 4 + 2;
      const hue  = Math.random() > 0.5 ? '#48cae4' : '#90e0ef';
      dot.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        background:${hue};
        box-shadow: 0 0 6px ${hue}, 0 0 16px ${hue};
        animation-duration:${dur}s;
        animation-delay:${Math.random() * -dur}s;
      `;
      midLayer.appendChild(dot);
    }
  }
})();


/* ─── PARALLAX SCROLL ─────────────────────────────────── */
(function initParallax() {
  let ticking = false;

  function update() {
    const scrollY = window.scrollY;

    // Parallax backgrounds (subtle)
    document.querySelectorAll('.zone-bg').forEach((bg, i) => {
      const zone = bg.parentElement;
      const rect = zone.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      bg.style.transform = `translateY(${center * 0.25}px)`;
    });

    // Seagull parallax
    const seagull = document.getElementById('seagull');
    if (seagull) {
      seagull.style.transform = `translateY(${scrollY * -0.15}px)`;
    }

    // Anglerfish subtle float with scroll
    const anglerfish = document.getElementById('anglerfish');
    if (anglerfish) {
      const rect = anglerfish.parentElement.getBoundingClientRect();
      anglerfish.style.transform = `translateX(${rect.top * 0.04}px)`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();


/* ─── STAT COUNTERS ─────────────────────────────────── */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    counter.dataset.animated = '1';
    const target = parseInt(counter.dataset.target);
    const dur = 2200;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - t, 4);
      counter.textContent = Math.round(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}


/* ─── ASCEND BUTTON ─────────────────────────────────── */
document.getElementById('ascend-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ─── FACT CARD INTERACTION (keyboard + click) ─────────────────────────────────── */
(function initCards() {
  document.querySelectorAll('.fact-card').forEach(card => {
    card.addEventListener('click', function () {
      // Ripple
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        background:rgba(144,224,239,0.15);
        width:200px; height:200px;
        margin:-100px;
        top:50%; left:50%;
        animation: ripple 0.6s ease-out forwards;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // Add ripple keyframe
  const style = document.createElement('style');
  style.textContent = `@keyframes ripple {
    from { transform: scale(0); opacity: 1; }
    to   { transform: scale(2.5); opacity: 0; }
  }`;
  document.head.appendChild(style);
})();


/* ─── NAV SMOOTH SCROLL ─────────────────────────────────── */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});


/* ─── AMBIENT SOUND TOGGLE (silent by default, toggle available) ─── */
// No audio autoplay — respects user preference
