/* ALBANI Avvocati - interazioni e animazioni.
   GSAP + ScrollTrigger sono caricati in locale. Tutto il contenuto resta leggibile anche senza script. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- Menu mobile ---------- */
  var burger = $(".burger");
  if (burger) {
    var setNav = function (open) {
      root.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    };
    burger.addEventListener("click", function () { setNav(!root.classList.contains("nav-open")); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("nav-open")) { setNav(false); burger.focus(); }
    });
    $$(".head-nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  /* ---------- Header compatto dopo lo scroll (senza listener di scroll) ---------- */
  var sentinel = $(".head-sentinel");
  if (sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      var e = en[0];
      root.classList.toggle("stuck", !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(sentinel);
  }

  /* ---------- Costruzione del logo ---------- */
  /* Il segno viene tracciato a penna: una linea alla volta, nell'ordine in cui la disegnerebbe una mano.
     La punta segue il tratto guida, rallenta a fine linea, si solleva e si sposta sulla successiva. */
  function buildLogo(svg, opts) {
    if (!hasGsap || !svg) return null;
    opts = opts || {};
    var slow = opts.slow || 1;
    var strokes = $$(".mk", svg), lines = $$(".ln", svg), pen = $(".pen", svg);
    var tl = gsap.timeline({ paused: true });
    gsap.set(strokes, { strokeDasharray: "1 2", strokeDashoffset: 1.03 });
    var place = function (pt, lift) {
      if (pen) pen.setAttribute("transform", "translate(" + pt.x.toFixed(2) + " " + (pt.y - lift).toFixed(2) + ") rotate(" + (lift ? -3 : 0) + ")");
    };
    var prevEnd = null;
    strokes.forEach(function (p, i) {
      var real = p.getTotalLength(), len = parseFloat(p.getAttribute("data-len")) || real;
      var start = p.getPointAtLength(0), finish = p.getPointAtLength(real);
      var dur = (0.16 + len / 1500) * slow, st = { v: 0 };
      if (i === 0) {
        place(start, 14);
        tl.to(pen, { opacity: 1, duration: 0.35 * slow, ease: "power2.out" }, 0);
        tl.to({ l: 14 }, { l: 0, duration: 0.25 * slow, ease: "power2.in", onUpdate: function () { place(start, this.targets()[0].l); } }, ">-0.1");
      } else {
        // penna sollevata: salto verso l'inizio della linea successiva
        var from = prevEnd, hop = { t: 0 };
        var dist = Math.hypot(start.x - from.x, start.y - from.y);
        tl.to(hop, {
          t: 1, duration: (0.12 + dist / 3200) * slow, ease: "power2.inOut",
          onUpdate: function () {
            var t = hop.t, arc = Math.sin(Math.PI * t) * 16;
            place({ x: from.x + (start.x - from.x) * t, y: from.y + (start.y - from.y) * t }, arc);
          }
        });
      }
      tl.to(st, {
        v: 1, duration: dur, ease: "sine.inOut",
        onUpdate: function () {
          p.style.strokeDashoffset = String(1.03 * (1 - st.v));
          place(p.getPointAtLength(real * st.v), 0);
        }
      });
      prevEnd = finish;
    });
    var drawn = tl.duration();
    // la penna si allontana
    if (pen) tl.to(pen, { opacity: 0, x: "+=26", y: "-=34", duration: 0.5 * slow, ease: "power2.in" }, drawn);
    var letters = $$(".lt", svg), sub = $$(".sb", svg);
    if (letters.length) {
      tl.from(letters, { opacity: 0, y: 10, duration: 0.8, ease: "power3.out", stagger: 0.07 }, drawn * 0.72);
      tl.from(sub, { opacity: 0, duration: 0.6, ease: "power1.out", stagger: 0.025 }, ">-0.5");
    }
    tl.eventCallback("onComplete", function () { lines.forEach(function (n) { n.removeAttribute("mask"); }); });
    return tl;
  }

  var intro = $(".intro");
  function endIntro(fast) {
    try { sessionStorage.setItem("albani-intro", "1"); } catch (e) {}
    root.classList.add("intro-done");
    if (!intro) return;
    if (hasGsap && !fast) {
      gsap.to($("svg", intro), { opacity: 0, y: -18, duration: 0.5, ease: "power2.in" });
      gsap.to(intro, { clipPath: "inset(0 0 100% 0)", duration: 1, delay: 0.12, ease: "expo.inOut", onComplete: function () { intro.remove(); root.classList.remove("intro-on"); } });
    } else { intro.remove(); root.classList.remove("intro-on"); }
  }
  if (intro && root.classList.contains("intro-on")) {
    var itw = buildLogo($("svg", intro));
    if (itw) {
      gsap.set(intro, { clipPath: "inset(0 0 0% 0)" });
      itw.eventCallback("onComplete", function () {
        $$(".ln", intro).forEach(function (n) { n.removeAttribute("mask"); });
        gsap.delayedCall(0.3, endIntro);
      });
      itw.play();
      var skip = $(".intro-skip", intro);
      if (skip) skip.addEventListener("click", function () { itw.kill(); endIntro(false); });
    } else endIntro(true);
  } else if (intro) { intro.remove(); }

  /* Logo che si disegna quando entra in vista (pagina Identità) */
  if (hasGsap && !calm && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    $$("[data-draw]").forEach(function (svg) {
      var tw = buildLogo(svg, { slow: 1.3 });
      if (tw) ScrollTrigger.create({ trigger: svg, start: "top 78%", once: true, onEnter: function () { tw.play(); } });
    });

    /* Entrate allo scroll: ogni tipo di blocco ha il suo movimento */
    var ease = "expo.out";
    $$("[data-reveal]").forEach(function (el) {
      var kind = el.getAttribute("data-reveal"), st = { trigger: el, start: "top 86%", once: true };
      if (kind === "stagger") {
        gsap.from(el.children, { opacity: 0, y: 34, duration: 0.9, ease: ease, stagger: 0.08, scrollTrigger: st });
      } else if (kind === "clip") {
        gsap.from(el, { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut", scrollTrigger: st });
        var im = $("img", el);
        if (im) gsap.from(im, { scale: 1.18, duration: 1.6, ease: ease, scrollTrigger: st });
      } else if (kind === "boxes") {
        gsap.from($$(".box", el), { opacity: 0, y: 40, duration: 0.9, ease: ease, stagger: { each: 0.09, from: "start" }, scrollTrigger: st });
      } else if (kind === "route") {
        gsap.from($$("li", el), { opacity: 0, x: -24, duration: 0.8, ease: ease, stagger: 0.16, scrollTrigger: st });
      } else {
        gsap.from(el, { opacity: 0, y: 28, duration: 1, ease: ease, scrollTrigger: st });
      }
    });
    var wm = $(".watermark");
    if (wm) gsap.fromTo(wm, { xPercent: 8 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: wm.parentNode, start: "top bottom", end: "bottom top", scrub: 1 } });
  }

  /* ---------- Schede a tre tappe (pattern tabs accessibile) ---------- */
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap), bar = $(".steps-bar", wrap), imgs = $$(".stack img", wrap);
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (bar) bar.style.setProperty("--p", String(i / (tabs.length - 1)));
      imgs.forEach(function (im, k) { im.setAttribute("data-pos", String((k - i + imgs.length) % imgs.length)); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault();
        select((n + tabs.length) % tabs.length, true);
      });
    });
    select(0, false);
  });

  /* ---------- Modulo contatti ---------- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status"), btn = $('button[type="submit"]', form), started = Date.now();
    var rules = {
      nome: function (v) { return v.trim().length < 2 ? "Inserisci nome e cognome." : ""; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Inserisci un indirizzo email valido, ad esempio nome@azienda.it."; },
      telefono: function (v) { return v.trim() && !/^[0-9+().\s-]{6,20}$/.test(v.trim()) ? "Controlla il numero: sono ammessi cifre, spazi e il prefisso +." : ""; },
      messaggio: function (v) { return v.trim().length < 20 ? "Descrivi la richiesta in almeno 20 caratteri." : ""; },
      privacy: function (v, el) { return el.checked ? "" : "Per inviare la richiesta devi confermare di aver letto l'informativa privacy."; }
    };
    var check = function (name) {
      var el = form.elements[name]; if (!el || !rules[name]) return true;
      var msg = rules[name](el.value, el), out = doc.getElementById("err-" + name);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (out) out.textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n]; if (!el) return;
      el.addEventListener("blur", function () { check(n); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") check(n); });
    });
    var say = function (text, kind) { status.textContent = text; status.className = "status " + (kind || ""); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) { say("Controlla i campi evidenziati.", "ko"); form.elements[bad[0]].focus(); return; }
      if (form.elements.sito.value || Date.now() - started < 2500) { say("Invio non riuscito. Riprova tra qualche secondo.", "ko"); return; }
      var data = new FormData(form), endpoint = form.getAttribute("data-endpoint");
      if (endpoint) {
        btn.disabled = true; say("Invio in corso...", "");
        fetch(endpoint, { method: "POST", body: data, headers: { "X-Requested-With": "fetch" }, credentials: "same-origin" })
          .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
          .then(function (j) {
            if (!j || !j.ok) throw new Error("rifiutato");
            form.reset(); say("Richiesta inviata. Ti rispondiamo all'indirizzo email indicato.", "ok");
          })
          .catch(function () { say("Non siamo riusciti a inviare la richiesta. Riprova oppure scrivi a " + form.getAttribute("data-mail") + ".", "ko"); })
          .then(function () { btn.disabled = false; });
      } else {
        var body = "Nome: " + data.get("nome") + "\nEmail: " + data.get("email") + "\nTelefono: " + (data.get("telefono") || "-") +
          "\nSede di riferimento: " + data.get("sede") + "\nArea di interesse: " + data.get("area") + "\n\n" + data.get("messaggio");
        var href = "mailto:" + form.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Richiesta dal sito - " + data.get("nome")) + "&body=" + encodeURIComponent(body);
        say("Abbiamo preparato il messaggio nel tuo programma di posta: per completare l'invio premi Invia da lì. Se non si apre, scrivi a " + form.getAttribute("data-mail") + ".", "ok");
        window.location.href = href;
      }
    });
  }

  /* Anno nel footer */
  $$("[data-year]").forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
})();
