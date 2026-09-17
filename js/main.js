/* Espazo Bilitroque · Carballo — movemento e utilidades.

   GSAP, ScrollTrigger e Lenis veñen dun CDN. Se fallan (bloqueador,
   rede, CDN caído) nada do de aquí pode romper a páxina: as burbullas
   xa están colocadas, as iconas xa están debuxadas, os textos vense e
   o teléfono, o correo e o mapa funcionan. Por iso os estados
   «agochados» do CSS viven baixo html.has-motion, que só se activa
   desde aquí.

   Movemento desta plantilla: flotar. Círculos que chegan de fóra e se
   asentan, tarxetas que suben un chisco mentres medran de 0,9 a 1, e
   unha burbulla de fondo que só cambia de COR. Nada de canvas, nada de
   blur por frame, nada de filtros gooey. */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapReady = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const motion = gsapReady && !reduce;
  const html = document.documentElement;
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);
  if (motion) html.classList.add("has-motion");
  if (!gsapReady) html.classList.add("sin-gsap");

  /* ---------- Os poucos textos que nacen en JS ----------
     O mesmo ficheiro serve as dúas versións (galego na raíz, castelán
     en /es/), así que estas cadeas van por idioma en vez de estar
     escritas a man dentro das funcións. */
  const LG = (html.lang || "gl").slice(0, 2) === "es" ? "es" : "gl";
  const T = {
    gl: {
      mapaTitulo: "Mapa: Espazo Bilitroque, Rúa Perú 14, Carballo",
      fNome: "Nome", fIdade: "Idade", fTel: "Teléfono", fArea: "Área",
      fAsunto: "Reserva de praza · ",
      fAviso: "Ábrese o teu programa de correo cunha mensaxe preparada. Se non se abre, escribe a espazobilitroque@gmail.com ou chama ao 722 482 607."
    },
    es: {
      mapaTitulo: "Mapa: Espazo Bilitroque, Rúa Perú 14, Carballo",
      fNome: "Nombre", fIdade: "Edad", fTel: "Teléfono", fArea: "Área",
      fAsunto: "Reserva de plaza · ",
      fAviso: "Se abre tu programa de correo con un mensaje preparado. Si no se abre, escribe a espazobilitroque@gmail.com o llama al 722 482 607."
    }
  }[LG];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const rem = () => parseFloat(getComputedStyle(html).fontSize) || 16;
  const navH = () => parseFloat(getComputedStyle(html).getPropertyValue("--nav-h")) * rem() || 72;

  /* ---------- Reparto en caracteres (accesible) ----------
     O texto real substitúese por spans, así que a palabra enteira
     queda en aria-label e os spans quedan agochados para o lector de
     pantalla. A palabra ten que ser inline-block con nowrap: se non,
     as letras rompen a palabra a media liña. */
  function splitChars(el) {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const chars = [];
    text.split(" ").forEach((word, i, arr) => {
      const ws = document.createElement("span");
      ws.className = "split-word";
      ws.setAttribute("aria-hidden", "true");
      Array.from(word).forEach((ch) => {
        const cs = document.createElement("span");
        cs.className = "split-char";
        cs.textContent = ch;
        ws.appendChild(cs);
        chars.push(cs);
      });
      el.appendChild(ws);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }
  const splitMap = new Map();
  if (motion) $$("[data-split-char]").forEach((el) => splitMap.set(el, splitChars(el)));

  /* ---------- Aviso de cookies ----------
     O botón ten que funcionar de verdade: o banner agóchase con
     [hidden] e no CSS NON hai ningún display que poida gañarlle. */
  (function initCookieBanner() {
    const banner = $(".cookie-banner");
    const ack = $(".cookie-ack");
    if (!banner || !ack) return;
    const KEY = "bilitroque-cookie-ack";
    let visto = false;
    try { visto = localStorage.getItem(KEY) === "1"; } catch (e) {}
    if (!visto) banner.hidden = false;
    ack.addEventListener("click", () => {
      banner.hidden = true;
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
    });
  })();

  /* ---------- Menú móbil ---------- */
  (function initNavMovil() {
    const toggle = $(".nav-toggle");
    const menu = $(".nav-movil");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const aberto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", aberto ? "false" : "true");
      menu.hidden = aberto;
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }));
  })();

  /* ---------- Mapa baixo demanda ----------
     Sen API key e sen contactar con Google ata que a visitante preme.
     É o que fai certo o aviso de «sen cookies de terceiros»: se o
     iframe se montase só, sería mentira. */
  (function initMapConsent() {
    const btn = $(".map-consent");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const q = encodeURIComponent("Espazo Bilitroque, Rúa Perú 14, 15100 Carballo, A Coruña");
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + q + "&output=embed";
      iframe.title = T.mapaTitulo;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      btn.replaceWith(iframe);
    });
  })();

  /* ---------- Cabeceira e botón flotante ---------- */
  (function initCabecera() {
    const cabecera = $(".cabecera");
    const hero = $(".hero");
    const fab = $(".call-fab");
    function onScroll() {
      if (cabecera) cabecera.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (fab && hero && "IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        fab.classList.toggle("is-visible", !e.isIntersecting);
      }, { threshold: 0.1 }).observe(hero);
    }
  })();

  /* ---------- Enlace activo na navegación ---------- */
  (function initNavActiva() {
    const enlaces = $$(".nav a");
    if (!enlaces.length || !("IntersectionObserver" in window)) return;
    const porId = new Map();
    enlaces.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      const sec = document.getElementById(href.slice(1));
      if (sec) porId.set(sec, a);
    });
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const a = porId.get(e.target);
        if (a && e.isIntersecting) {
          enlaces.forEach((x) => x.classList.remove("is-activo"));
          a.classList.add("is-activo");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    porId.forEach((_, sec) => obs.observe(sec));
  })();

  /* ---------- Horario: marcar o día de hoxe, e o ano do pé ---------- */
  (function initHoxe() {
    const hoxe = new Date().getDay(); // 0 domingo … 6 sábado
    const fila = $('.dia[data-dia="' + hoxe + '"]');
    if (fila) fila.classList.add("es-hoy");
    const ano = $("[data-ano]");
    if (ano) ano.textContent = String(new Date().getFullYear());
  })();

  /* ---------- Formulario: abre o correo coa mensaxe feita ----------
     A web é estática. En vez de finxir un envío que non existe,
     compóñese un mailto co que a persoa escribiu. */
  (function initFormulario() {
    const form = $(".formulario");
    if (!form) return;
    const aviso = $("[data-aviso]", form);
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const val = (k) => String(d.get(k) || "").trim();
      const corpo = [
        T.fNome + ": " + val("nome"),
        T.fIdade + ": " + val("idade"),
        T.fTel + ": " + val("telefono"),
        T.fArea + ": " + val("area"),
        "",
        val("mensaxe")
      ].join("\n");
      const url = "mailto:espazobilitroque@gmail.com"
        + "?subject=" + encodeURIComponent(T.fAsunto + val("area"))
        + "&body=" + encodeURIComponent(corpo);
      window.location.href = url;
      if (aviso) {
        aviso.textContent = T.fAviso;
        aviso.hidden = false;
      }
    });
  })();

  /* ---------- Contadores ----------
     Con movemento reducido non se anima, pero o número ten que estar:
     amósase directamente o valor final. */
  function initContadores() {
    $$("[data-conta]").forEach((el) => {
      const bruto = (el.dataset.valor || el.textContent || "").replace(",", ".");
      const valor = parseFloat(bruto);
      if (!isFinite(valor)) return;
      const dec = parseInt(el.dataset.decimais || "0", 10);
      const pinta = (n) => { el.textContent = n.toFixed(dec).replace(".", ","); };
      if (!motion) { pinta(valor); return; }
      const obj = { n: 0 };
      pinta(0);
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(obj, {
          n: valor, duration: 1.15, ease: "power2.out",
          onUpdate: () => pinta(obj.n)
        })
      });
    });
  }

  /* ---------- Botóns magnéticos ---------- */
  function initMagneticos() {
    if (!motion || window.matchMedia("(hover: none)").matches) return;
    $$(".magnetico").forEach((el) => {
      const forza = 0.3;
      el.addEventListener("mousemove", (ev) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (ev.clientX - (r.left + r.width / 2)) * forza,
          y: (ev.clientY - (r.top + r.height / 2)) * forza,
          duration: 0.45, ease: "power3.out"
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  /* ---------- Iconas garabateadas: debuxarse en trazo ----------
     Cada path guarda o seu propio longo para poder repetir o debuxo
     ao pasar o rato sen volver medir nada. */
  function preparaGarabato(svg) {
    const paths = $$("path.garabato", svg);
    paths.forEach((p) => {
      let len = p.__len;
      if (len === undefined) {
        try { len = p.getTotalLength(); } catch (e) { len = 0; }
        p.__len = len;
      }
    });
    return paths;
  }
  function debuxa(svg, retraso) {
    const paths = preparaGarabato(svg);
    if (!paths.length) return null;
    const tl = gsap.timeline({ delay: retraso || 0 });
    paths.forEach((p, i) => {
      if (!p.__len) return;
      tl.fromTo(p,
        { strokeDasharray: p.__len, strokeDashoffset: p.__len },
        {
          strokeDashoffset: 0, duration: 0.5, ease: "power2.out",
          onComplete: () => { p.style.strokeDasharray = "none"; }
        }, i * 0.06);
    });
    return tl;
  }

  /* ---------- Hero: a coroa de burbullas ----------
     Os oito círculos entran desde fóra do marco a velocidades
     distintas e ásentanse sen rebote esaxerado. Ao pousarse, debúxanse
     as iconas e o wordmark acéndese letra a letra. */
  function initHero() {
    if (!motion) return;
    const burbullas = $$(".coroa .burbulla");
    if (!burbullas.length) return;

    /* de onde vén cada unha: fóra do marco, por lados distintos */
    const entradas = {
      1: { x: -320, y: -140, d: 1.25 },
      2: { x: -120, y: -340, d: 1.4 },
      3: { x: 90, y: -360, d: 1.15 },
      4: { x: 320, y: -180, d: 1.3 },
      5: { x: 360, y: 90, d: 1.2 },
      6: { x: 200, y: 320, d: 1.35 },
      7: { x: -180, y: 330, d: 1.2 },
      8: { x: -340, y: 120, d: 1.3 }
    };

    const tl = gsap.timeline();
    burbullas.forEach((b) => {
      const e = entradas[b.dataset.b] || { x: 0, y: -300, d: 1.2 };
      tl.fromTo(b,
        { x: e.x, y: e.y, scale: 0.72, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: e.d, ease: "power3.out" },
        0);
    });

    burbullas.forEach((b, i) => {
      const svg = $("svg", b);
      if (svg) debuxa(svg, 0.85 + i * 0.05);
    });

    const letras = $$(".wordmark .l");
    if (letras.length) {
      tl.fromTo(letras,
        { opacity: 0, y: 16, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.045 },
        0.7);
    }
    tl.fromTo([".wordmark-sup", ".wordmark-sub"],
      { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.95);
    tl.to(".hero-baixo > *", { opacity: 1, duration: 0.6, stagger: 0.09 }, 1.05);
  }

  /* ---------- Parallax de dous niveis nas burbullas do hero ----------
     Só transform, e moi pouco: as grandes móvense menos que as
     pequenas, así a coroa «respira» ao baixar. */
  function initParallax() {
    if (!motion) return;
    const hero = $(".hero");
    if (!hero) return;
    $$(".coroa .burbulla").forEach((b) => {
      const n = parseInt(b.dataset.b, 10);
      const lento = n % 2 === 0;
      gsap.to(b, {
        yPercent: lento ? -14 : -34,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 }
      });
    });
  }

  /* ---------- Titulares carácter a carácter ---------- */
  function initTitulares() {
    if (!motion) return;
    splitMap.forEach((chars, el) => {
      gsap.fromTo(chars,
        { yPercent: 70, opacity: 0, scale: 0.9 },
        {
          yPercent: 0, opacity: 1, scale: 1, duration: 0.62, ease: "power2.out",
          stagger: { each: 0.02 },
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });
  }

  /* ---------- Todo o que «chega flotando» ---------- */
  function initFlota() {
    if (!motion) return;
    $$("[data-flota]").forEach((el, i) => {
      gsap.fromTo(el,
        { y: 34, scale: 0.9, opacity: 0 },
        {
          y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "power2.out",
          delay: (i % 4) * 0.05,
          scrollTrigger: { trigger: el, start: "top 90%", once: true }
        });
    });
  }

  /* ---------- Áreas: a burbulla de fondo cambia de cor ----------
     As tarxetas son pegajosas (o <li> é o pegajoso, con margin-bottom
     como recorrido). O momento no que unha tarxeta se pega ao tope é o
     disparador do cambio de cor, así que o `start` sae do mesmo `top`
     que ten no CSS. Cámbiase a COR, non a forma: por iso é un tween de
     backgroundColor e non un cruce de dous círculos.

     Isto pasa tamén con movemento reducido: o contido (cor activa,
     número e nome) ten que seguir ao día aínda que non haxa
     desprazamentos. */
  function initAreas() {
    const items = $$(".area-item");
    const globo = $("[data-globo]");
    const numero = $("[data-globo-n]");
    const nome = $("[data-globo-t]");
    if (!items.length || !globo || !gsapReady) return;

    let actual = 0;
    function amosa(i) {
      if (i === actual) return;
      actual = i;
      const it = items[i];
      const cor = it.dataset.cor || "#f28c28";
      if (motion) gsap.to(globo, { backgroundColor: cor, duration: 0.55, ease: "power1.inOut" });
      else globo.style.backgroundColor = cor;
      if (numero) numero.textContent = String(i + 1).padStart(2, "0");
      if (nome) nome.textContent = it.dataset.nome || "";
    }

    items.forEach((it, i) => {
      ScrollTrigger.create({
        trigger: it,
        /* o mesmo tope pegajoso que o CSS, medido de verdade */
        start: () => "top " + ((parseFloat(getComputedStyle(it).top) || navH() + 48) + 4) + "px",
        onEnter: () => amosa(i),
        onLeaveBack: () => amosa(Math.max(0, i - 1))
      });
    });
  }

  /* ---------- Iconas que se redebuxan ao pasar o rato ---------- */
  function initHoverIconas() {
    if (!motion || window.matchMedia("(hover: none)").matches) return;
    $$(".area-carta").forEach((carta) => {
      const svg = $(".area-globo svg", carta);
      if (!svg) return;
      let corre = false;
      carta.addEventListener("mouseenter", () => {
        if (corre) return;
        corre = true;
        const tl = debuxa(svg, 0);
        if (tl) tl.eventCallback("onComplete", () => { corre = false; });
        else corre = false;
      });
    });
  }

  /* ---------- Marquee lento ----------
     A pista leva o contido dúas veces, así que ir de 0 a -50 % é un
     bucle exacto. Con GSAP en vez de CSS para que Lenis e o resto
     compartan o mesmo reloxo. */
  function initMarquee() {
    if (!motion) return;
    const pista = $(".marquee-pista");
    if (!pista) return;
    gsap.to(pista, { xPercent: -50, duration: 46, ease: "none", repeat: -1 });
  }

  /* ---------- Lenis ---------- */
  function initLenis() {
    if (!motion || typeof Lenis === "undefined") return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      a.addEventListener("click", (ev) => {
        const destino = document.querySelector(id);
        if (!destino) return;
        ev.preventDefault();
        lenis.scrollTo(destino, { offset: -navH() - 8 });
      });
    });
  }

  /* ---------- Arranque ----------
     Espérase polas fontes: se non, o reparto por caracteres mídese coa
     fonte de respaldo e o titular salta cando entra Fredoka. */
  function arranca() {
    initLenis();
    initHero();
    initParallax();
    initTitulares();
    initFlota();
    initAreas();
    initHoverIconas();
    initMarquee();
    initMagneticos();
    initContadores();
    if (gsapReady) ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(arranca).catch(arranca);
  } else {
    window.addEventListener("load", arranca);
  }

  /* recalcular posicións cando cambia o alto real do móbil */
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { if (gsapReady) ScrollTrigger.refresh(); }, 220);
  });
})();
