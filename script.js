'use strict';

// ================= HELPERS =================
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
const CFG = window.ALBUM || { tracks: [], platforms: [], products: [] };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function safeLink(value) {
  try {
    const u = new URL(value);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
  } catch { return ''; }
}

// ================= TOAST =================
const toast = $('#status');
let toastTimer;
function notify(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

// ================= SCROLL PROGRESS =================
(function () {
  const bar = $('.scroll-progress');
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? (h.scrollTop / max * 100) + '%' : '0%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ================= PARALLAX =================
(function () {
  if (REDUCED) return;
  const layers = $$('[data-parallax]');
  if (!layers.length) return;
  let ticking = false;
  function apply() {
    const y = window.scrollY;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      // only move layers currently in a viewport-adjacent zone
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      el.style.setProperty('--p', (-y * speed) + 'px');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(apply);
      ticking = true;
    }
  }, { passive: true });
  apply();
})();

// ================= REVEAL ON SCROLL =================
(function () {
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }) : null;
  function arm() {
    $$('.reveal').forEach(el => {
      if (!io) { el.classList.add('visible'); return; }
      io.observe(el);
    });
  }
  if (document.readyState !== 'loading') arm();
  else document.addEventListener('DOMContentLoaded', arm);
  window.ARM_REVEAL = arm;
})();

// ================= MENU MOBILE =================
(function () {
  const btn  = $('.menu-btn');
  const nav  = $('header.nav nav');
  if (!btn || !nav) return;
  function close() { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ================= PLATFORMS =================
(function () {
  const host = $('#plataformas');
  if (!host) return;
  (CFG.platforms || []).forEach(p => {
    const href = safeLink(p.url);
    const el = document.createElement(href ? 'a' : 'button');
    el.textContent = p.name;
    if (href) {
      el.href = href; el.target = '_blank'; el.rel = 'noopener noreferrer';
    } else {
      el.type = 'button';
      el.addEventListener('click', () => notify('Link oficial em breve.'));
    }
    host.appendChild(el);
  });
})();

// ================= TRACKS =================
(function () {
  const list = $('#track-list');
  const audio = $('#audio');
  if (!list || !audio) return;

  let current = -1;

  function waveSVG(seed) {
    let pts = '';
    const N = 44;
    for (let i = 0; i < N; i++) {
      const s = Math.sin(i * 0.6 + seed) * 7 + Math.cos(i * 0.2 + seed * 0.7) * 5;
      const h = Math.max(4, Math.abs(s) + 4);
      pts += `<rect x="${i / (N - 1) * 100}" y="${12 - h / 2}" width="1.4" height="${h}" fill="currentColor"/>`;
    }
    return `<svg viewBox="0 0 100 24" preserveAspectRatio="none">${pts}</svg>`;
  }

  function update() {
    $$('.track-row', list).forEach((row, i) => {
      const playing = i === current && !audio.paused;
      row.classList.toggle('playing', playing);
      const icon = $('.play svg', row);
      if (icon) icon.innerHTML = playing
        ? '<rect x="2" y="1" width="2.5" height="8" fill="currentColor"/><rect x="6.5" y="1" width="2.5" height="8" fill="currentColor"/>'
        : '<polygon points="0,0 10,5 0,10" fill="currentColor"/>';
    });
  }

  const tracks = CFG.tracks || [];

  if (!tracks.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Faixas em breve. Acompanhe o lançamento nas plataformas.';
    list.appendChild(p);
    return;
  }

  tracks.forEach((tr, i) => {
    const row = document.createElement('div');
    row.className = 'track-row reveal';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `Ouvir ${tr.name}`);

    row.innerHTML = `
      <button class="play" aria-label="Play"><svg viewBox="0 0 10 10"><polygon points="0,0 10,5 0,10" fill="currentColor"/></svg></button>
      <div class="title">${tr.n ? tr.n + ' · ' : ''}${tr.name}<small>${tr.feat || ''}</small></div>
      <div class="wave" aria-hidden="true">${waveSVG(i * 2.3)}</div>
      <div class="ext">${tr.spotify ? 'spotify' : (tr.audio ? 'preview' : 'em breve')}</div>
    `;

    async function trigger() {
      const spotify = safeLink(tr.spotify);
      // 1) tenta audio local
      if (tr.audio) {
        if (current === i && !audio.paused) { audio.pause(); return; }
        if (current !== i) { current = i; audio.src = tr.audio; }
        audio.hidden = false;
        try { await audio.play(); } catch { notify('Não foi possível reproduzir o áudio.'); }
        update();
        return;
      }
      // 2) tenta spotify
      if (spotify) {
        window.open(spotify, '_blank', 'noopener,noreferrer');
        notify(`Abrindo ${tr.name} no Spotify`);
        return;
      }
      // 3) nada
      notify('Faixa chega quando o álbum sair.');
    }

    row.addEventListener('click', trigger);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });

    list.appendChild(row);
  });

  ['play', 'pause', 'ended'].forEach(ev => audio.addEventListener(ev, update));
  audio.addEventListener('error', () => notify('Áudio indisponível.'));
  update();

  // re-arma reveal nos itens recém-criados
  if (typeof window.ARM_REVEAL === 'function') window.ARM_REVEAL();
})();

// ================= PRODUCTS =================
(function () {
  const grid = $('#products');
  if (!grid) return;
  (CFG.products || []).forEach(p => {
    const card = document.createElement('article');
    card.className = 'product reveal';

    const wrap = document.createElement('div');
    wrap.className = 'img-wrap';

    const img = document.createElement('img');
    img.src = p.image;
    img.alt = `${p.name} — coleção Trilha sonora perfeita pra tocar o terror`;
    img.loading = 'lazy';
    img.width = 400; img.height = 500;

    wrap.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = p.name;

    const href = safeLink(p.url);
    const action = document.createElement(href ? 'a' : 'button');
    action.textContent = 'Ver peça';
    if (href) {
      action.href = href; action.target = '_blank'; action.rel = 'noopener noreferrer';
    } else {
      action.type = 'button';
      action.addEventListener('click', () => notify('Coleção conceitual. Venda em breve.'));
    }

    card.append(wrap, h3, action);
    grid.appendChild(card);
  });
  if (typeof window.ARM_REVEAL === 'function') window.ARM_REVEAL();
})();

// ================= HERO: SUBTLE TILT NA CAPA =================
(function () {
  if (REDUCED) return;
  const wrap = $('.cover-wrap');
  const cover = $('.cover-wrap .cover');
  if (!wrap || !cover) return;
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cover.style.transform = `rotate(${-4 + x * 6}deg) translate(${x * 10}px, ${y * 8}px)`;
  });
  wrap.addEventListener('mouseleave', () => {
    cover.style.transform = '';
  });
})();
