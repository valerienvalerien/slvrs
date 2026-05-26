/* =========================================================
   Salverys — interactions du site vivant
   ========================================================= */
(function () {
  'use strict';

  /* ---------- NAV : ombre au scroll + burger mobile ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const burger = nav.querySelector('.nav-burger');
    const links = nav.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', () => links.classList.toggle('open'));
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
    }
  }

  /* ---------- Image : repli dégradé si le lien casse ---------- */
  document.querySelectorAll('img.photo').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  /* ---------- Compteurs animés ---------- */
  function animateCounter(el) {
    const to = parseFloat(el.dataset.to);
    if (isNaN(to)) return;
    const dec = parseInt(el.dataset.dec || '0', 10);
    const pre = el.dataset.pre || '';
    const suf = el.dataset.suf || '';
    const dur = 1100;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (to * eased).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      el.textContent = pre + val + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal au scroll + déclenche les compteurs ---------- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealables = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('.num[data-to]');

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll && e.target.querySelectorAll('.num[data-to]').forEach(animateCounter);
        if (e.target.matches('.num[data-to]')) animateCounter(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
    counters.forEach(el => { if (!el.closest('.reveal')) io.observe(el); });
  } else {
    revealables.forEach(el => el.classList.add('in'));
    counters.forEach(el => {
      const to = parseFloat(el.dataset.to);
      if (!isNaN(to)) el.textContent = (el.dataset.pre || '') + to.toLocaleString('fr-FR', { minimumFractionDigits: parseInt(el.dataset.dec || '0', 10), maximumFractionDigits: parseInt(el.dataset.dec || '0', 10) }) + (el.dataset.suf || '');
    });
  }

  /* ---------- Pills (partagé par les deux simulateurs) ---------- */
  function bindPills(onChange) {
    document.querySelectorAll('.pill-group').forEach(group => {
      const name = group.dataset.group;
      group.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
          group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          onChange(name, parseFloat(pill.dataset.multiplier));
        });
      });
    });
  }

  function pop(el) {
    if (!el) return;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
  const euro = n => Math.round(n).toLocaleString('fr-FR');

  /* ========================================================
     SIMULATEUR MÉDICAL  (présent si #calls existe)
     ======================================================== */
  if (document.getElementById('calls')) {
    const TIERS = [
      { name: 'Essentiel', max: 250, price: 350 },
      { name: 'Confort',   max: 500, price: 590 },
      { name: 'Intensif',  max: 900, price: 950 },
    ];
    const PER_CALL_ELSEWHERE = 1.60;
    const MARGINAL_PER_100 = 95;
    const RDV_RATE = 0.12;
    const daysMult = { 5: 1.0, 6: 1.12, 7: 1.22 };
    const st = { calls: 250, days: 5, schedule: 1.0, integration: 1.0 };

    const tierFor = c => TIERS.find(t => c <= t.max) || null;
    const eur2 = n => n.toFixed(2).replace('.', ',') + ' €';
    const $ = id => document.getElementById(id);

    function calc() {
      const mult = (daysMult[st.days] || 1) * st.schedule;
      const tier = tierFor(st.calls);
      let name, base, custom = false;
      if (tier) { name = tier.name; base = tier.price; }
      else { custom = true; name = 'Sur-mesure'; base = 950 + Math.ceil((st.calls - 900) / 100) * MARGINAL_PER_100; }
      const price = base * mult;
      const elsewhere = st.calls * PER_CALL_ELSEWHERE * mult;
      const perCall = price / st.calls;
      const rdv = Math.round(st.calls * RDV_RATE);

      $('price-monthly').textContent = euro(price);
      $('calls-monthly').textContent = st.calls.toLocaleString('fr-FR');
      $('cost-percall').textContent = eur2(perCall);
      $('rdv-recovered').textContent = '≈ ' + rdv;
      $('coverage').textContent = st.days + ' j · ' + (st.schedule > 1 ? '8h–22h' : '8h–20h');

      const savings = elsewhere - price;
      const cmp = $('compare-line'), badge = $('savings-badge');
      if (savings > 0) {
        cmp.innerHTML = 'Facturation à l\'appel ailleurs : <span class="old">' + euro(elsewhere) + ' €/mois</span>';
        badge.textContent = 'Économie : ' + Math.round((savings / elsewhere) * 100) + ' % vs à l\'appel';
      } else {
        cmp.textContent = 'Forfait tout compris, sans surprise.';
        badge.textContent = 'Essai 15 jours offert';
      }

      let reco;
      if (custom) reco = 'Offre <strong>Sur-mesure</strong> — on cadre ensemble.';
      else if (name === 'Essentiel') reco = 'Forfait <strong>Essentiel</strong> — idéal pour un praticien.';
      else if (name === 'Confort') reco = 'Forfait <strong>Confort</strong> — le meilleur rapport volume / prix.';
      else reco = 'Forfait <strong>Intensif</strong> — pensé pour les cabinets de groupe.';
      $('recommendation').innerHTML = reco;
      pop($('price-monthly'));
    }

    $('calls').addEventListener('input', e => {
      st.calls = parseInt(e.target.value);
      $('calls-value').textContent = st.calls.toLocaleString('fr-FR') + ' appels';
      calc();
    });
    $('days').addEventListener('input', e => {
      st.days = parseInt(e.target.value);
      $('days-value').textContent = st.days + ' j';
      calc();
    });
    bindPills((name, m) => { st[name] = m; calc(); });
    calc();
  }

  /* ========================================================
     SIMULATEUR IT  (présent si #posts existe)
     ======================================================== */
  if (document.getElementById('posts')) {
    const COST_BASE = 585.53, MARGIN = 0.58, PROD = 0.85;
    const FR_COST = 3200, FR_PEN = 1.35;
    const st = { posts: 1, hours: 35, service: 1.0, channels: 1.0, language: 1.0, schedule: 1.0 };
    const $ = id => document.getElementById(id);
    const hourly = n => n.toFixed(1).replace('.', ',') + ' €';
    const vol = p => p >= 6 ? 0.90 : (p >= 3 ? 0.95 : 1.0);

    function calc() {
      const hpm = st.hours * 4.33;
      const ratio = hpm / 152;
      const basePrice = (COST_BASE * ratio) / (1 - MARGIN);
      const mult = st.service * st.channels * st.language * st.schedule;
      const total = basePrice * mult * st.posts * vol(st.posts);
      const frMult = st.language * Math.pow(st.schedule, FR_PEN);
      const frCost = FR_COST * ratio * st.posts * frMult;
      const savings = frCost - total;
      const hMonth = hpm * st.posts;

      $('price-monthly').textContent = euro(total);
      $('price-fr-hourly').textContent = (frCost / hMonth).toFixed(1).replace('.', ',') + ' €/h';
      $('price-fr').textContent = euro(frCost) + ' €/mois';
      $('savings-badge').textContent = 'Économie : ' + Math.round((savings / frCost) * 100) + ' %';
      $('hours-monthly').textContent = Math.round(hMonth) + ' h';
      $('hourly-displayed').textContent = hourly(total / hMonth);
      $('hourly-productive').textContent = hourly(total / (hMonth * PROD));
      $('annual-savings').textContent = euro(savings * 12) + ' €';

      let reco;
      if (st.posts === 1 && st.hours <= 20 && st.service <= 0.85) reco = 'Forfait <strong>Helpdesk Starter</strong> — idéal pour démarrer.';
      else if (st.posts >= 2 || (st.posts === 1 && st.hours >= 35 && st.service >= 1.0 && st.schedule > 1.0)) reco = 'Forfait <strong>Centre N1 Scale</strong> — couverture étendue + backup.';
      else reco = 'Forfait <strong>Support Pro</strong> — meilleur rapport coût / disponibilité.';
      $('recommendation').innerHTML = reco;
      pop($('price-monthly'));
    }

    $('posts').addEventListener('input', e => {
      st.posts = parseInt(e.target.value);
      $('posts-value').textContent = st.posts + ' agent' + (st.posts > 1 ? 's' : '');
      calc();
    });
    $('hours').addEventListener('input', e => {
      st.hours = parseInt(e.target.value);
      let l;
      if (st.hours <= 20) l = st.hours + ' h · temps partiel';
      else if (st.hours <= 30) l = st.hours + ' h · 4/5e';
      else if (st.hours === 35) l = '35 h · temps plein';
      else l = st.hours + ' h · temps plein +';
      $('hours-value').textContent = l;
      calc();
    });
    bindPills((name, m) => { st[name] = m; calc(); });
    calc();
  }
})();
