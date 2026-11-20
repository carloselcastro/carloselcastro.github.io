(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- drum ---------- */
  const lugs = document.getElementById("lugs");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = 50 + 47.5 * Math.cos(a), y = 50 + 47.5 * Math.sin(a);
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", -1.1); r.setAttribute("y", -2.6);
    r.setAttribute("width", 2.2); r.setAttribute("height", 5.2); r.setAttribute("rx", 1);
    r.setAttribute("transform", `translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})`);
    lugs.appendChild(r);
  }

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const voice = new DrumVoice();
  const canvas = document.getElementById("membrane");
  const head = document.getElementById("head");
  const membrane = new Membrane(canvas, {
    res: 280,
    colors: [hex("#e4e7f0"), hex("#3550e8"), hex("#f2a516"), hex("#0f1733")],
    onStrike: (exc) => { lastExc = exc; },
  });
  let lastExc = null;
  membrane.render();

  // mode readout
  const modesEl = document.getElementById("modes");
  const cells = [];
  for (let i = 0; i < 6; i++) {
    const d = document.createElement("div");
    d.innerHTML = '<span class="m"></span><span class="f"></span><span class="e"><i></i></span>';
    modesEl.appendChild(d);
    cells.push(d);
  }
  function readout() {
    const es = membrane.energies().sort((a, b) => b.e - a.e).slice(0, 6);
    const max = es[0].e || 1;
    es.forEach((m, i) => {
      const c = cells[i];
      c.querySelector(".m").textContent = `(${m.m}, ${m.n})`;
      c.querySelector(".f").textContent = `${Math.round(voice.f0 * m.ratio)} Hz`;
      c.querySelector(".e i").style.width = max > 1e-9 ? `${(100 * Math.sqrt(m.e / max)) | 0}%` : "0";
    });
  }
  readout();
  setInterval(() => { if (membrane.running) readout(); }, 100);

  function strikeAt(clientX, clientY, withSound = true) {
    const rect = canvas.getBoundingClientRect();
    const dx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const dy = ((clientY - rect.top) / rect.height) * 2 - 1;
    const r = Math.hypot(dx, dy);
    if (r > 1.02) return;
    const exc = membrane.strike(Math.min(r, 0.97), Math.atan2(dy, dx));
    if (withSound) voice.play(exc);
    if (!reduced) {
      const hr = head.getBoundingClientRect();
      const rp = document.createElement("span");
      rp.className = "ripple";
      rp.style.left = `${clientX - hr.left}px`;
      rp.style.top = `${clientY - hr.top}px`;
      head.appendChild(rp);
      setTimeout(() => rp.remove(), 650);
    }
    readout();
  }

  head.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    strikeAt(e.clientX, e.clientY);
  });
  // unlock audio on the first completed gesture anywhere on the page (required on phones)
  const unlockAudio = () => { if (voice.enabled) voice.unlock(); };
  ["pointerup", "touchend", "click", "keydown"].forEach((t) =>
    document.addEventListener(t, unlockAudio, { capture: true, passive: true })
  );
  head.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const r = 0.15 + Math.random() * 0.6, a = Math.random() * Math.PI * 2;
    strikeAt(rect.left + rect.width * (0.5 + 0.5 * r * Math.cos(a)), rect.top + rect.height * (0.5 + 0.5 * r * Math.sin(a)));
  });

  const soundBtn = document.getElementById("sound");
  soundBtn.addEventListener("click", () => {
    voice.enabled = !voice.enabled;
    soundBtn.setAttribute("aria-pressed", voice.enabled);
    soundBtn.textContent = voice.enabled ? "Sound on" : "Sound off";
  });
  const f0 = document.getElementById("f0"), f0v = document.getElementById("f0v");
  f0.addEventListener("input", () => {
    voice.f0 = +f0.value;
    f0v.textContent = `${f0.value} Hz`;
    readout();
  });

  // one silent opening strike; with reduced motion, a single still frame instead
  const opening = () => {
    const rect = canvas.getBoundingClientRect();
    strikeAt(rect.left + rect.width * 0.66, rect.top + rect.height * 0.38, false);
  };
  if (reduced) {
    opening();
    membrane.step(0.35);
    membrane.render();
    membrane.stop();
    readout();
  } else {
    setTimeout(opening, 450);
  }
  // pause rendering when the hero is off screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) membrane.stop();
      else if (membrane.magnitude() > (membrane.ref || 1) * 0.004 && !reduced) membrane.start();
    }).observe(head);
  }

  /* ---------- publications filter ---------- */
  const chips = [...document.querySelectorAll(".chip")];
  const pubs = [...document.querySelectorAll(".pub")];
  const years = [...document.querySelectorAll("#publications .year")];
  chips.forEach((c) => {
    const k = c.dataset.filter;
    c.querySelector(".n").textContent = k === "all" ? pubs.length : pubs.filter((p) => p.dataset.kind === k).length;
  });
  function applyFilter(k) {
    chips.forEach((c) => c.setAttribute("aria-pressed", c.dataset.filter === k));
    pubs.forEach((p) => (p.hidden = !(k === "all" || p.dataset.kind === k)));
    years.forEach((y) => (y.hidden = ![...y.querySelectorAll(".pub")].some((p) => !p.hidden)));
  }
  chips.forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
  document.querySelectorAll("[data-filter-link]").forEach((a) =>
    a.addEventListener("click", () => applyFilter(a.dataset.filterLink))
  );

  /* ---------- email: assembled only on click, never in the HTML ---------- */
  const copyBtn = document.getElementById("copy-mail");
  if (copyBtn && navigator.clipboard) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", () => {
      const addr = ["carlos", "castro"].join(".") + String.fromCharCode(64) + ["professores", "ibmec", "edu", "br"].join(".");
      navigator.clipboard.writeText(addr).then(
        () => { copyBtn.textContent = "Email address copied"; },
        () => { copyBtn.textContent = "Copy failed, use the address above"; }
      );
      setTimeout(() => (copyBtn.textContent = "Copy email address"), 2500);
    });
  }

  /* ---------- current section in nav ---------- */
  const links = [...document.querySelectorAll(".bar nav a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.setAttribute("aria-current", l.getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id], #top").forEach((s) => io.observe(s));
  }
})();
