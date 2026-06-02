/* =========================================================
   Vi Data Ops — Mobile shared content builders (ViContent)
   Repeated card decks + the three architecture renderers
   (accordion / swipe / step-through) + showcase builders.
   All driven by ViMobile data so markup stays lean.
   ========================================================= */
(function () {
  const V = window.ViMobile;
  const reduced = V.reduced;

  const releaseData = [
    ["Two-audience Analytics", "Product Ops gets run health, stage duration, failure modes, per-client frequency, and deliverables shipped. CP View gets approval rates by client and action type."],
    ["Contextual Copilot", "Chat messages carry current route, run id, client id, and operator id, so questions like \u201cwhy did this fail?\u201d resolve against the visible surface."],
    ["Search Insights preview", "The Client Brief path now parses first and previews client, brand, audiences, keywords, LI buckets, KOLs, competitors, and parser warnings before the agent build starts."],
    ["Multi-audience fan-out", "Brief and thin-JSON paths expose a BuildGroupTable and combo picker, then launch one grouped run per audience set with a shared run_group_id."],
    ["Audience policy gates", "Patient, caregiver, and HCP audiences now drive allowed deliverables: Claims QA, eligibility/payer JSON, or no claims artifact at all."],
    ["Claims QA goes real", "The demo-only path was replaced with multipart CSV/JSON dispatch, payer modes, and the standing rule that No CSV means No QA."],
    ["Readiness and re-run", "Run Detail now shows Ready to send, Needs review, or Blocked, plus a real re-run endpoint for terminal runs."],
    ["Client corrections", "Client Detail surfaces correction history from diff.json files, including patch versus supersede, add/remove counts, and pending decision-capture flags."],
    ["Typed API surface", "Fastify routes now use Zod validation, generated OpenAPI, canonical shared enums, and event-kind guards to reduce UI/backend drift."],
    ["Cleaner operating system", "Dormant tools and Confluence infrastructure were removed, duplicate client folders merged, and operator-facing upload paths documented as first-class."],
    ["Multi-user access", "Username/password login replaced the single shared token: scrypt-hashed credentials, session tokens, admin-managed accounts and roles, and a one-switch private mode."],
    ["Self-correcting agents", "A validation critic reviews each maker\u2019s output before delivery and re-dispatches it with the critique when a check fails \u2014 a bounded self-correction loop."],
    ["Settings control plane", "Settings exposes the live model tier, auth source, effective model map, backend health probe, SSE state, LAN sharing URL, output paths, and hidden-client recovery."],
    ["Admin user controls", "The Users surface manages account creation, roles, password resets, enable/disable, deletion guards, and the shared/private workspace switch."],
  ];

  const controlData = [
    ["Track isolation", "Intent, Claims QA, and Search Insights have separate inputs, outputs, skills, and validation logic."],
    ["Decision gates", "Analyst recommendations pause before delivery so operators approve or reject high-impact changes."],
    ["Audience policy gate", "Patients can receive Claims QA, caregivers receive eligibility/payer deliverables, and HCP audiences are blocked from claims artifacts."],
    ["Readiness badge", "Run Detail tells operators whether a completed run is Ready to send, Needs review, or Blocked."],
    ["No CSV = No QA", "Claims QA cannot proceed without a CSV source-of-truth, even when JSON or payer files are present."],
    ["Routed upload banner", "Confident upload classifications begin with a high-visibility routed-client banner and re-upload affordance."],
    ["Traceable runs", "Every run has stage history, events, errors, payload summaries, artifacts, and rerun affordances."],
    ["Corrections history", "Client Detail exposes prior corrections, patch versus supersede status, and pending decision-capture work."],
    ["Typed contracts", "Zod schemas, generated OpenAPI, and canonical shared enums reduce silent drift between server, UI, and tests."],
    ["Contextual Copilot", "The chat system is scoped to the current UI context, so operator questions stay grounded in visible data."],
    ["Multi-user access", "Scrypt-hashed credentials, admin-managed accounts, and roles; deliverables download over authenticated requests, never open links."],
    ["Private-mode switch", "One toggle returns the workspace to admin-only on demand, so access can be opened and closed without redeploying."],
    ["Runtime settings", "Inspect health, SSE state, model tier, auth source, effective models, LAN sharing, and hidden-client recovery from one page."],
    ["Self-correction loop", "A validation critic reviews each maker\u2019s output and re-dispatches it with the critique when a check fails, before delivery."],
  ];

  function releases(el) {
    if (!el) return;
    el.innerHTML = releaseData.map(([h, p], i) =>
      `<article class="release-card reveal"><span class="idx">${String(i + 1).padStart(2, "0")}</span><div><h3>${h}</h3><p>${p}</p></div></article>`
    ).join("");
    V.reveal(el);
  }

  function controls(el) {
    if (!el) return;
    el.innerHTML = controlData.map(([h, p]) =>
      `<article class="control-card reveal"><h3>${h}</h3><p>${p}</p></article>`
    ).join("");
    V.reveal(el);
  }

  /* ---------- Showcase: tab chips (variant A) ---------- */
  function showcaseTabs({ tabs, img, cap }) {
    if (!tabs) return;
    tabs.innerHTML = V.shotOrder.map((k, i) =>
      `<button data-shot="${k}"${i === 0 ? ' class="is-active"' : ""}>${V.shots[k].label}</button>`
    ).join("");
    tabs.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        const s = V.shots[b.dataset.shot];
        tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        img.style.opacity = "0";
        setTimeout(() => { img.src = s.src; img.alt = s.alt; cap.textContent = s.caption; img.style.opacity = "1"; }, reduced ? 0 : 150);
      });
    });
  }

  /* ---------- Showcase: swipe carousel (variant B/C) ---------- */
  function showcaseSwipe({ track, dots, cap, thumbs }) {
    if (!track) return;
    track.innerHTML = V.shotOrder.map((k) => {
      const s = V.shots[k];
      return `<figure class="sc-slide"><img src="${s.src}" alt="${s.alt}" loading="lazy" /></figure>`;
    }).join("");
    if (dots) dots.innerHTML = V.shotOrder.map((_, i) => `<button class="sc-dot${i === 0 ? " is-active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("");
    if (thumbs) thumbs.innerHTML = V.shotOrder.map((k, i) =>
      `<button class="sc-thumb${i === 0 ? " is-active" : ""}" data-i="${i}"><img src="${V.shots[k].src}" alt="" loading="lazy" /><span>${V.shots[k].label}</span></button>`
    ).join("");
    if (cap) cap.textContent = V.shots[V.shotOrder[0]].caption;

    const slides = Array.from(track.children);
    const setActive = (i) => {
      if (cap) cap.textContent = V.shots[V.shotOrder[i]].caption;
      if (dots) dots.querySelectorAll(".sc-dot").forEach((d, k) => d.classList.toggle("is-active", k === i));
      if (thumbs) {
        thumbs.querySelectorAll(".sc-thumb").forEach((t, k) => t.classList.toggle("is-active", k === i));
        const act = thumbs.querySelector(".sc-thumb.is-active");
        if (act) thumbs.scrollTo({ left: act.offsetLeft - thumbs.clientWidth / 2 + act.clientWidth / 2, behavior: reduced ? "auto" : "smooth" });
      }
    };
    let raf = null;
    track.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; const i = Math.round(track.scrollLeft / track.clientWidth); setActive(i); });
    }, { passive: true });
    const goTo = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
    if (dots) dots.querySelectorAll(".sc-dot").forEach((d, i) => d.addEventListener("click", () => goTo(i)));
    if (thumbs) thumbs.querySelectorAll(".sc-thumb").forEach((t) => t.addEventListener("click", () => goTo(Number(t.dataset.i))));
  }

  /* ---------- Architecture helpers ---------- */
  const topo = V.topo;
  function nodeButton(key) {
    const n = topo.nodes[key];
    return `<button class="topo-node${n.terminal ? " is-terminal" : ""}" data-node="${key}"><span class="topo-tag">${n.tag}</span>${n.name}<small>${n.sub}</small></button>`;
  }
  function applyDetail({ title, body, chips, liveLabel }, key) {
    const n = topo.nodes[key];
    if (title) title.textContent = n.name;
    if (body) { body.style.opacity = "0"; setTimeout(() => { body.textContent = n.detail; body.style.opacity = "1"; }, reduced ? 0 : 120); }
    if (liveLabel) liveLabel.textContent = "Active path · " + n.name;
    if (chips) {
      const nb = Array.from(topo.neighbors(key));
      chips.hidden = nb.length === 0;
      chips.innerHTML = '<span class="lbl">flows to</span>' + nb.map((k) => `<span class="c">${topo.nodes[k].name}</span>`).join("");
    }
  }
  // shared live cycle controller
  function liveCycle({ onFocus, container, ms = 2600 }) {
    let i = 0, timer = null, pinned = false;
    const step = () => { if (pinned) return; i = (i + 1) % topo.sequence.length; onFocus(topo.sequence[i], false); };
    const start = () => { if (!reduced && !timer) timer = setInterval(step, ms); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    onFocus(topo.sequence[0], false);
    start();
    if (container && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !pinned ? start() : stop())), { threshold: 0.08 }).observe(container);
    }
    return {
      pin(key) { pinned = true; stop(); const idx = topo.sequence.indexOf(key); if (idx >= 0) i = idx; onFocus(key, true); },
      resume() { pinned = false; start(); },
      toggle(key) { if (pinned && topo.sequence[i] === key) { pinned = false; start(); } else { this.pin(key); } },
      get pinned() { return pinned; },
    };
  }

  /* ---------- Architecture: accordion (variant A) ---------- */
  function archAccordion({ list, detailTitle, detailBody, chips, liveLabel, section }) {
    if (!list) return;
    const byLayer = {};
    Object.keys(topo.nodes).forEach((k) => { (byLayer[topo.nodes[k].layer] ||= []).push(k); });
    list.innerHTML = topo.layers.map((L, li) => `
      <div class="acc ${L.cls}${li === 0 ? " is-open" : ""}" data-layer="${L.id}">
        <button class="acc-head"><span class="lt"><span class="ldot"></span><h3>${L.title}</h3></span><span class="lt"><span class="meta">${byLayer[L.id].length}</span><span class="caret">\u25be</span></span></button>
        <div class="acc-body"><div><div class="acc-inner">${byLayer[L.id].map(nodeButton).join("")}</div></div></div>
      </div>`).join("");

    const detail = { title: detailTitle, body: detailBody, chips, liveLabel };
    const nodeEls = {};
    list.querySelectorAll(".topo-node").forEach((el) => (nodeEls[el.dataset.node] = el));
    const focus = (key, pinned) => {
      Object.entries(nodeEls).forEach(([k, el]) => el.classList.toggle("is-focus", k === key));
      applyDetail(detail, key);
      if (pinned) { // open the layer that holds it
        const acc = list.querySelector(`.acc[data-layer="${topo.nodes[key].layer}"]`);
        if (acc) acc.classList.add("is-open");
      }
    };
    const cycle = liveCycle({ onFocus: focus, container: section });
    list.querySelectorAll(".acc-head").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("is-open")));
    list.querySelectorAll(".topo-node").forEach((el) => el.addEventListener("click", () => cycle.toggle(el.dataset.node)));
  }

  /* ---------- Architecture: layered flow + live trace + bottom sheet (variant B) ---------- */
  function archSwipe({ track, dots, liveLabel, traceBar, sheet, sheetTitle, sheetTag, sheetBody, sheetChips, sheetClose, section }) {
    if (!track) return;
    const byLayer = {};
    Object.keys(topo.nodes).forEach((k) => { (byLayer[topo.nodes[k].layer] ||= []).push(k); });
    const clsOf = (key) => topo.layers.find((L) => L.id === topo.nodes[key].layer).cls;

    track.innerHTML = topo.layers.map((L, li) => `
      <div class="arch-panel ${L.cls}" data-layer="${L.id}">
        <div class="arch-panel-head">
          <span class="ldot"></span>
          <div class="arch-panel-meta"><span class="arch-panel-num">Layer ${li + 1} / ${topo.layers.length}</span><h3>${L.title}</h3></div>
          <span class="arch-panel-count">${byLayer[L.id].length}</span>
        </div>
        <div class="arch-panel-nodes">${byLayer[L.id].map(nodeButton).join("")}</div>
      </div>`).join("");
    if (dots) dots.innerHTML = topo.layers.map((_, i) => `<button class="sc-dot${i === 0 ? " is-active" : ""}"></button>`).join("");
    if (traceBar) traceBar.innerHTML = topo.sequence.map((k) => `<button class="trace-seg ${clsOf(k)}" data-key="${k}" aria-label="${topo.nodes[k].name}"></button>`).join("");
    const traceSegs = traceBar ? Array.from(traceBar.querySelectorAll(".trace-seg")) : [];

    const nodeEls = {};
    track.querySelectorAll(".topo-node").forEach((el) => (nodeEls[el.dataset.node] = el));
    const panels = Array.from(track.children);
    const panelOf = (key) => panels.find((p) => p.dataset.layer === topo.nodes[key].layer);

    const focus = (key, pinned) => {
      Object.entries(nodeEls).forEach(([k, el]) => el.classList.toggle("is-focus", k === key));
      traceSegs.forEach((s) => s.classList.toggle("is-active", s.dataset.key === key));
      if (liveLabel) liveLabel.textContent = topo.nodes[key].name;
      if (pinned) { const p = panelOf(key); if (p) track.scrollTo({ left: p.offsetLeft - track.offsetLeft, behavior: reduced ? "auto" : "smooth" }); }
    };
    const cycle = liveCycle({ onFocus: focus, container: section });

    const openSheet = (key) => {
      const n = topo.nodes[key];
      sheetTag.textContent = n.tag; sheetTag.className = "sheet-tag " + clsOf(key);
      sheetTitle.textContent = n.name; sheetBody.textContent = n.detail;
      const nb = Array.from(topo.neighbors(key));
      sheetChips.innerHTML = '<span class="lbl">flows to</span>' + nb.map((k) => `<span class="c">${topo.nodes[k].name}</span>`).join("");
      sheet.classList.add("is-open"); cycle.pin(key);
    };
    track.querySelectorAll(".topo-node").forEach((el) => el.addEventListener("click", () => openSheet(el.dataset.node)));
    traceSegs.forEach((s) => s.addEventListener("click", () => openSheet(s.dataset.key)));
    const close = () => { sheet.classList.remove("is-open"); cycle.resume(); };
    if (sheetClose) sheetClose.addEventListener("click", close);
    sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });

    if (dots) {
      let raf = null;
      track.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; const i = Math.round(track.scrollLeft / track.clientWidth); dots.querySelectorAll(".sc-dot").forEach((d, k) => d.classList.toggle("is-active", k === i)); }); }, { passive: true });
      dots.querySelectorAll(".sc-dot").forEach((d, i) => d.addEventListener("click", () => track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" })));
    }
  }

  /* ---------- Architecture: guided step-through (variant C) ---------- */
  function archStep({ card, tag, name, layerName, body, chips, dots, prev, next, playBtn, counter, section }) {
    if (!card) return;
    if (dots) dots.innerHTML = topo.sequence.map((_, i) => `<button class="sc-dot${i === 0 ? " is-active" : ""}" data-i="${i}"></button>`).join("");
    const render = (key) => {
      const n = topo.nodes[key];
      card.className = "step-card " + topo.layers.find((L) => L.id === n.layer).cls + (n.terminal ? " is-terminal" : "");
      tag.textContent = n.tag; name.textContent = n.name; if (layerName) layerName.textContent = topo.layers.find((L) => L.id === n.layer).title;
      body.style.opacity = "0"; setTimeout(() => { body.textContent = n.detail; body.style.opacity = "1"; }, reduced ? 0 : 120);
      const nb = Array.from(topo.neighbors(key));
      if (chips) chips.innerHTML = '<span class="lbl">flows to</span>' + nb.map((k) => `<span class="c">${topo.nodes[k].name}</span>`).join("");
      const i = topo.sequence.indexOf(key);
      if (dots) dots.querySelectorAll(".sc-dot").forEach((d, k) => d.classList.toggle("is-active", k === i));
      if (counter) counter.textContent = String(i + 1).padStart(2, "0") + " / " + String(topo.sequence.length).padStart(2, "0");
    };
    const cycle = liveCycle({ onFocus: render, container: section });
    const cur = () => topo.sequence.findIndex((k) => topo.nodes[k] && name.textContent === topo.nodes[k].name);
    if (prev) prev.addEventListener("click", () => { const i = (cur() - 1 + topo.sequence.length) % topo.sequence.length; cycle.pin(topo.sequence[i]); syncPlay(); });
    if (next) next.addEventListener("click", () => { const i = (cur() + 1) % topo.sequence.length; cycle.pin(topo.sequence[i]); syncPlay(); });
    if (dots) dots.querySelectorAll(".sc-dot").forEach((d) => d.addEventListener("click", () => { cycle.pin(topo.sequence[Number(d.dataset.i)]); syncPlay(); }));
    function syncPlay() { if (playBtn) playBtn.classList.toggle("is-playing", !cycle.pinned); }
    if (playBtn) playBtn.addEventListener("click", () => { cycle.toggle(topo.sequence[cur()]); syncPlay(); });
    syncPlay();
  }

  window.ViContent = { releases, controls, showcaseTabs, showcaseSwipe, archAccordion, archSwipe, archStep };
})();
