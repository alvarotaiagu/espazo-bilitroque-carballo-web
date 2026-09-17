/* Capturas de revisión con Playwright.
   Con Lenis, window.scrollTo NON dispara os ScrollTrigger do final:
   hai que recorrer a páxina coa roda do rato e agardar antes de medir.
   Uso: NODE_PATH=/c/Users/alvar/node_modules node scripts/shot.js [ruta] [ancho] [etiqueta] */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const RUTA = process.argv[2] || '/';
const ANCHO = parseInt(process.argv[3] || '1440', 10);
const ETI = process.argv[4] || 'desktop';
const BASE = 'http://127.0.0.1:8731';
const OUT = path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: ANCHO, height: ANCHO < 700 ? 850 : 900 },
    deviceScaleFactor: 1
  });
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push('CONSOLE ' + m.text()); });
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => errores.push('REQFAIL ' + r.url() + ' — ' + (r.failure() || {}).errorText));

  await page.goto(BASE + RUTA, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(OUT, ETI + '-01-hero.png') });

  /* recorrido coa roda, que é o que Lenis entende */
  const alto = await page.evaluate(() => document.body.scrollHeight);
  const paso = Math.round(page.viewportSize().height * 0.8);
  let n = 2;
  for (let y = 0; y < alto; y += paso) {
    await page.mouse.wheel(0, paso);
    await page.waitForTimeout(900);
    if (n <= 14) {
      await page.screenshot({ path: path.join(OUT, ETI + '-' + String(n).padStart(2, '0') + '.png') });
    }
    n++;
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, ETI + '-99-final.png') });

  console.log('alto', alto, 'capturas', Math.min(n, 15));
  if (errores.length) { console.log('--- PROBLEMAS ---'); errores.forEach((e) => console.log(e)); }
  else console.log('sen erros de consola nin peticións falladas');
  await browser.close();
})();
