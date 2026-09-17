/* Comprobacións antes de dar a web por rematada.
   Uso: MSYS_NO_PATHCONV=1 NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js [ruta] */
const { chromium } = require('playwright');

const RUTA = process.argv[2] || '/index.html';
const BASE = 'http://127.0.0.1:8731';
let fallos = 0;
const ok = (b, t, extra) => {
  if (!b) fallos++;
  console.log((b ? '  OK   ' : '  FALLO') + ' · ' + t + (extra ? '  → ' + extra : ''));
};

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. con movemento ---------- */
  let page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const err = [];
  page.on('console', (m) => { if (m.type() === 'error') err.push(m.text()); });
  page.on('pageerror', (e) => err.push(String(e.message)));
  page.on('requestfailed', (r) => err.push(r.url() + ' ' + ((r.failure() || {}).errorText)));
  await page.goto(BASE + RUTA, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n== ' + RUTA + ' · con movemento ==');
  ok(err.length === 0, 'sen erros de consola nin peticións falladas', err.join(' | '));
  ok(await page.evaluate(() => document.documentElement.classList.contains('has-motion')),
     'html.has-motion activo (GSAP cargou)');
  ok(await page.evaluate(() => typeof Lenis !== 'undefined'), 'Lenis dispoñible');

  /* cookies: o botón ten que pechar de verdade */
  const bannerVisible = await page.isVisible('.cookie-banner');
  ok(bannerVisible, 'o aviso de cookies aparece');
  await page.click('.cookie-ack');
  await page.waitForTimeout(400);
  ok(!(await page.isVisible('.cookie-banner')), 'o botón «Entendido» pecha o aviso de verdade');
  ok(await page.evaluate(() => {
    const b = document.querySelector('.cookie-banner');
    return getComputedStyle(b).display === 'none';
  }), 'o banner queda en display:none (ningún display lle gaña a [hidden])');

  /* as letras do wordmark e as burbullas quedan visibles ao rematar */
  ok(await page.evaluate(() => {
    const ls = [...document.querySelectorAll('.wordmark .l')];
    return ls.length === 10 && ls.every((l) => parseFloat(getComputedStyle(l).opacity) > 0.9);
  }), 'as 10 letras do wordmark quedan visibles');
  ok(await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.coroa .burbulla')];
    return bs.every((b) => parseFloat(getComputedStyle(b).opacity) > 0.9)
        && bs.every((b) => getComputedStyle(b).mixBlendMode === 'multiply');
  }), 'as 8 burbullas están visibles e en multiply');

  /* as iconas rematan debuxadas (sen dasharray pendurando) */
  ok(await page.evaluate(() => {
    const ps = [...document.querySelectorAll('.coroa path.garabato')];
    return ps.length > 0 && ps.every((p) => {
      const o = parseFloat(getComputedStyle(p).strokeDashoffset) || 0;
      return Math.abs(o) < 0.5;
    });
  }), 'as iconas garabateadas quedan debuxadas enteiras');

  /* multiply só sobre branco */
  ok(await page.evaluate(() => {
    const fondoDe = (el) => {
      let n = el.parentElement;
      while (n) {
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        n = n.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    return [...document.querySelectorAll('*')]
      .filter((e) => getComputedStyle(e).mixBlendMode === 'multiply')
      .every((e) => fondoDe(e) === 'rgb(255, 255, 255)');
  }), 'todo o que mestura en multiply ten fondo branco sólido debaixo');

  /* o mapa non contacta con Google ata que se preme */
  ok(await page.evaluate(() => !document.querySelector('.mapa iframe')),
     'o mapa non monta o iframe ata que se preme');
  const antes = [];
  page.on('request', (r) => { if (/google\.com\/maps/.test(r.url())) antes.push(r.url()); });
  await page.evaluate(() => document.querySelector('#contacto').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.click('.map-consent');
  await page.waitForTimeout(2500);
  ok(await page.evaluate(() => !!document.querySelector('.mapa iframe')),
     'ao premer, o iframe do mapa si se monta');
  ok(antes.length > 0, 'e só entón se pide a google.com/maps', String(antes.length) + ' petición(s)');

  /* contadores rematados */
  await page.evaluate(() => document.querySelector('#prezos').scrollIntoView());
  await page.waitForTimeout(2500);
  ok(await page.evaluate(() => {
    const c = [...document.querySelectorAll('#prezos [data-conta]')];
    return c.length === 7 && c.every((e) => e.textContent.trim() === e.dataset.valor);
  }), 'os contadores de prezos paran no valor real');

  /* ---- aro de progreso ---- */
  ok(await page.evaluate(() => {
    const c = document.querySelector('.progreso');
    return c && !c.hidden && document.querySelectorAll('.progreso-tramos circle').length === 9;
  }), 'o aro de progreso ten os 9 tramos, un por sección');
  ok(await page.evaluate(() => {
    const cores = [...document.querySelectorAll('.progreso-tramos circle')]
      .map((c) => c.getAttribute('stroke'));
    return cores.join(',') === '#f28c28,#2fa84f,#2f80ed,#3bb8a9,#7b4fbf,#e0463c,#f7d33d,#f48fb1,#2f80ed';
  }), 'cada tramo leva a cor da súa sección');
  /* arriba de todo: nin se ve nin está enchido */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  ok(await page.evaluate(() => {
    const c = document.querySelector('.progreso');
    return !c.classList.contains('is-visible')
      && document.querySelector('.progreso-cifra b').textContent === '0';
  }), 'no hero o aro está agochado e a 0 %');
  /* ata abaixo: visible e ao 100 %, con todos os tramos completos */
  /* as imaxes en lazy fan medrar a páxina mentres se baixa: a primeira
     chegada ao fondo aínda non é o fondo de verdade */
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  ok(await page.evaluate(() => {
    const c = document.querySelector('.progreso');
    return c.classList.contains('is-visible')
      && document.querySelector('.progreso-cifra b').textContent === '100';
  }), 'ao final da páxina o aro marca 100 %');
  ok(await page.evaluate(() => {
    const C = 2 * Math.PI * 44;
    return [...document.querySelectorAll('.progreso-tramos circle')].every((c) => {
      const feito = parseFloat(c.getAttribute('stroke-dasharray'));
      const ini = -parseFloat(c.getAttribute('stroke-dashoffset'));
      return feito > 0 && Math.abs((ini + feito) - Math.min(C, ini + feito)) < 1;
    });
  }), 'todos os tramos quedan pintados e ningún se sae do aro');
  /* a metade: nin 0 nin 100, e a etiqueta di a porcentaxe */
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2));
  await page.waitForTimeout(900);
  ok(await page.evaluate(() => {
    const n = parseInt(document.querySelector('.progreso-cifra b').textContent, 10);
    return n > 40 && n < 60;
  }), 'a media páxina o aro marca preto do 50 %');
  ok(await page.evaluate(() => /\d+ ?%/.test(document.querySelector('.progreso').getAttribute('aria-label') || '')),
     'a etiqueta do botón leva a porcentaxe');
  /* e volve arriba ao premelo */
  await page.click('.progreso');
  await page.waitForTimeout(2500);
  ok(await page.evaluate(() => window.scrollY < 40), 'ao premer o aro, a páxina volve arriba');

  /* nada de canvas nin filtros gooey */
  ok(await page.evaluate(() => document.querySelectorAll('canvas').length === 0), 'sen canvas');
  ok(await page.evaluate(() => document.querySelectorAll('filter feGaussianBlur').length === 0),
     'sen filtros SVG de desenfoque (gooey)');

  /* sen desprazamento horizontal */
  for (const w of [1440, 1024, 768, 400, 360]) {
    await page.setViewportSize({ width: w, height: 880 });
    await page.waitForTimeout(600);
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!desborda, 'sen scroll horizontal a ' + w + ' px');
  }

  /* a 400 px quedan 5 burbullas */
  await page.setViewportSize({ width: 400, height: 860 });
  await page.waitForTimeout(600);
  const visibles = await page.evaluate(() =>
    [...document.querySelectorAll('.coroa .burbulla')].filter((b) => getComputedStyle(b).display !== 'none').length);
  ok(visibles === 5, 'a 400 px a coroa queda en 5 círculos', 'son ' + visibles);
  await page.close();

  /* ---------- 2. con movemento reducido ---------- */
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const err2 = [];
  page.on('pageerror', (e) => err2.push(String(e.message)));
  await page.goto(BASE + RUTA, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  console.log('\n== ' + RUTA + ' · movemento reducido ==');
  ok(err2.length === 0, 'sen erros de JS', err2.join(' | '));
  ok(!(await page.evaluate(() => document.documentElement.classList.contains('has-motion'))),
     'html.has-motion NON se activa');
  ok(await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.coroa .burbulla')];
    return bs.every((b) => parseFloat(getComputedStyle(b).opacity) > 0.9
      && getComputedStyle(b).transform === 'none');
  }), 'as burbullas están xa colocadas, sen transform');
  ok(await page.evaluate(() => {
    const ls = [...document.querySelectorAll('.wordmark .l')];
    return ls.every((l) => parseFloat(getComputedStyle(l).opacity) > 0.9);
  }), 'o wordmark xa está pintado');
  ok(await page.evaluate(() => {
    const ps = [...document.querySelectorAll('.coroa path.garabato')];
    return ps.every((p) => getComputedStyle(p).strokeDasharray === 'none');
  }), 'as iconas xa están debuxadas (sen dasharray)');
  ok(await page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-split-char]')];
    return t.length > 0 && t.every((e) => parseFloat(getComputedStyle(e).opacity) > 0.9)
      && document.querySelectorAll('.split-char').length === 0;
  }), 'os titulares non se parten en caracteres e vense enteiros');
  ok(await page.evaluate(() => {
    const p = [...document.querySelectorAll('#prezos [data-conta]')];
    return p.every((e) => e.textContent.trim() === e.dataset.valor);
  }), 'os contadores amosan o valor final sen animar');
  ok(await page.evaluate(() => {
    const f = [...document.querySelectorAll('[data-flota]')];
    return f.every((e) => parseFloat(getComputedStyle(e).opacity) > 0.9);
  }), 'os bloques «que chegan flotando» vense sen mover nada');
  /* o aro é contido, non adorno: ten que seguir contando */
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => document.querySelector('.progreso-cifra b').textContent === '100'),
     'o aro de progreso segue contando con movemento reducido');
  await page.close();

  /* ---------- 3. sen JavaScript de terceiros (CDN caído) ---------- */
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route('**cdnjs.cloudflare.com**', (r) => r.abort());
  await page.route('**cdn.jsdelivr.net**', (r) => r.abort());
  await page.goto(BASE + RUTA, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('\n== ' + RUTA + ' · co CDN caído ==');
  ok(await page.evaluate(() => document.documentElement.classList.contains('sin-gsap')),
     'a páxina detecta que non hai GSAP');
  ok(await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.coroa .burbulla')];
    const ls = [...document.querySelectorAll('.wordmark .l')];
    const t = [...document.querySelectorAll('[data-split-char]')];
    return bs.every((b) => parseFloat(getComputedStyle(b).opacity) > 0.9)
      && ls.every((l) => parseFloat(getComputedStyle(l).opacity) > 0.9)
      && t.every((e) => parseFloat(getComputedStyle(e).opacity) > 0.9);
  }), 'hero, wordmark e titulares seguen visibles');
  ok(await page.evaluate(() => !!document.querySelector('a[href^="tel:"]')
    && !!document.querySelector('a[href^="mailto:"]')), 'teléfono e correo seguen sendo enlaces');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => document.querySelector('.progreso-cifra b').textContent === '100'),
     'o aro de progreso funciona sen GSAP');
  await page.click('.cookie-ack');
  await page.waitForTimeout(300);
  ok(!(await page.isVisible('.cookie-banner')), 'o aviso de cookies segue pechando');
  await page.close();

  await browser.close();
  console.log('\n' + (fallos ? 'FALLOS: ' + fallos : 'todo correcto'));
  process.exit(fallos ? 1 : 0);
})();
