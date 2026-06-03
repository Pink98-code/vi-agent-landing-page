/* =========================================================
   Vi Data Ops: Mobile shared behavior (ViMobile)
   Exposes building blocks; each variant wires what it needs.
   Heavy effects (hero canvas) are throttled + auto-paused
   off-screen for battery/perf on mobile.
   ========================================================= */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Animated counters ---- */
  function counters(root = document) {
    const nodes = root.querySelectorAll("[data-count]");
    if (reduced) { nodes.forEach((n) => (n.textContent = Number(n.dataset.count).toLocaleString())); return; }
    const run = (node) => {
      const target = Number(node.dataset.count || "0");
      const dur = 1000 + target * 9;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { nodes.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---- Reveal on scroll ---- */
  function reveal(root = document) {
    const nodes = root.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) { nodes.forEach((n) => n.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---- Scroll progress bar (scoped to a scroll container) ---- */
  function scrollProgress(bar, scroller = window) {
    if (!bar) return;
    const el = scroller === window ? document.documentElement : scroller;
    const update = () => {
      const max = el.scrollHeight - (scroller === window ? window.innerHeight : el.clientHeight);
      const top = scroller === window ? window.scrollY : el.scrollTop;
      const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (top / max) * 100));
      bar.style.width = pct + "%";
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return update;
  }

  /* ---- Hero particle network (mobile-throttled) ---- */
  function heroNetwork(canvas) {
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, pts = [], frame = 0, raf = null, running = false;
    const LINK = 116;
    function resize() {
      dpr = Math.min(1.75, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fewer points on mobile
      const count = Math.max(26, Math.min(46, Math.floor((w * h) / 13000)));
      pts = Array.from({ length: count }, (_, i) => {
        const band = i % 5;
        return { x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.18,
          r: band === 0 ? 2.2 : 1.5, tone: band };
      });
    }
    function draw() {
      frame += 1;
      // ~30fps: skip every other frame
      if (frame % 2 === 0) { ctx.clearRect(0, 0, w, h);
        const ax = w * (0.2 + 0.1 * Math.sin(frame / 110));
        const ay = h * (0.46 + 0.08 * Math.cos(frame / 130));
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          a.x += a.vx; a.y += a.vy;
          if (a.x < -20) a.x = w + 20; if (a.x > w + 20) a.x = -20;
          if (a.y < -20) a.y = h + 20; if (a.y > h + 20) a.y = -20;
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
            if (d < LINK) {
              ctx.strokeStyle = `rgba(204,255,251,${(1 - d / LINK) * 0.22})`;
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          const pulse = Math.max(0, 1 - Math.hypot(a.x - ax, a.y - ay) / 220);
          ctx.fillStyle = a.tone === 0 ? `rgba(0,219,208,${0.55 + pulse * 0.36})`
            : a.tone === 1 ? `rgba(249,115,22,${0.34 + pulse * 0.2})`
            : `rgba(255,255,255,${0.26 + pulse * 0.26})`;
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r + pulse * 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(draw); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
    resize();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); if (running) { running = false; start(); } }, { passive: true });
    // auto-pause when hero scrolls out of view
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? start() : stop()));
      }, { threshold: 0.02 }).observe(canvas);
    } else { start(); }
  }

  /* ---- Generic auto-cycle highlighter (briefing / flow) ---- */
  function autoCycle(items, ms, onStep, opts = {}) {
    if (!items.length) return { stop() {} };
    let idx = 0, timer = null;
    const apply = (i) => { items.forEach((el, k) => el.classList.toggle("is-active", k === i)); onStep && onStep(i, items[i]); };
    apply(0);
    if (reduced) { items.forEach((el) => el.classList.add("is-active")); return { stop() {} }; }
    const tick = () => { idx = (idx + 1) % items.length; apply(idx); };
    const startT = () => { if (!timer) timer = setInterval(tick, ms); };
    const stopT = () => { if (timer) { clearInterval(timer); timer = null; } };
    startT();
    // pause when off-screen
    if (opts.container && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? startT() : stopT())), { threshold: 0.1 }).observe(opts.container);
    }
    return { stop: stopT, go: (i) => { idx = i; apply(i); } };
  }

  /* ---- Architecture data (shared across variants) ---- */
  const topo = {
    layers: [
      { id: "interface", title: "Interface", cls: "layer-interface" },
      { id: "control", title: "Control plane", cls: "layer-control" },
      { id: "execution", title: "Agents & engines", cls: "layer-execution" },
      { id: "delivery", title: "Delivery & learning", cls: "layer-delivery" },
    ],
    nodes: {
      ui: { layer: "interface", tag: "UI", name: "React / Vite console", sub: "dashboard · wizards · admin", detail: "The React/Vite operator console renders the dashboard, the Search Insights wizard, Run Detail, Analytics, the System graph, and admin user management. It subscribes to the event stream so state never lies about progress." },
      upload: { layer: "interface", tag: "IN", name: "Upload router", sub: "classify · dedupe · route", detail: "A deterministic intake router ingests files, folders, zips, briefs, audit bundles, CSV specs, and JSON configs, resolves track, client, file kind, and audience shape, dedupes by content hash, and hard-links into the canonical input tree before anything runs." },
      copilot: { layer: "interface", tag: "AI", name: "Orchestrator Copilot", sub: "ask · go (confirm-first)", detail: "One orchestrator chat agent serving two intents, auto-routed: Ask answers read-only questions about runs, deliverables, and cross-client analytics by citing the system\u2019s own data; Go dispatches runs confirm-first. Scoped to the current route, run, client, and operator." },
      api: { layer: "control", tag: "API", name: "Fastify control API", sub: "Zod · OpenAPI · enums", detail: "A Fastify control server with Zod-backed request/response validation, generated OpenAPI, canonical shared enums, and event-kind guards to keep the UI, server, and tests from drifting apart." },
      auth: { layer: "control", tag: "SEC", name: "Auth & sessions", sub: "roles · private-mode switch", detail: "Multi-user access: username/password login with scrypt-hashed credentials, opaque session tokens, admin-managed accounts and roles, and a one-switch private mode that instantly drops the workspace back to admin-only when sharing should stop." },
      sse: { layer: "control", tag: "SSE", name: "Live event stream", sub: "stage events · logs", detail: "A Server-Sent Events stream pushes real stage transitions, logs, and errors to the cockpit as runs advance. No invented progress bars." },
      dispatcher: { layer: "control", tag: "ORC", name: "Dispatcher", sub: "stages · fan-out · watchdog", detail: "The dispatcher advances each track\u2019s stages, races stage work against a watchdog and timeout so a hung run never wedges the queue, and fans multi-audience Search Insights out into grouped terminal runs under one shared run_group_id." },
      registry: { layer: "control", tag: "DB", name: "SQLite run registry", sub: "runs · gates · decisions", detail: "A SQLite run registry is the shared source of truth: runs, stages, decision gates, captured decisions, payload summaries, artifacts, per-model usage, and run_group_id clusters. An append-only event log is the truth-of-record for replay." },
      runners: { layer: "execution", tag: "RUN", name: "Track runners", sub: "intent · claims · SI", detail: "Track-specific runners for Intent Audit, Claims QA, and Search Insights isolate every Agent SDK call. Each track owns its inputs, outputs, and validation rules and never shares assumptions across tracks." },
      makers: { layer: "execution", tag: "AGT", name: "Maker agents", sub: "analyst · builder · QA · parser", detail: "The reasoning agents that produce work: an audit analyst, a Search Insights builder, a Claims QA agent, a client-brief parser, and a lightweight upload classifier. Each agent\u2019s model tier is resolved from the auth context." },
      classify: { layer: "execution", tag: "CLS", name: "Classification engine", sub: "7-category · signals", detail: "A classification engine places each client in a closed seven-category taxonomy from weighted signals: orphan ICD codes, drug brands, and lexicon hits, all pinned by golden-fixture tests so a lexicon edit can\u2019t silently re-classify existing clients. An operator override always wins." },
      critic: { layer: "execution", tag: "CRT", name: "Validation critic", sub: "self-correction loop", detail: "A generalized validation critic reviews each maker\u2019s output before delivery. A failed verdict re-dispatches the same maker inline with the critique appended: a bounded self-correction loop. A stagnation guard stops a maker that isn\u2019t converging." },
      mcp: { layer: "execution", tag: "MCP", name: "MCP tool layer", sub: "parse · validate · build", detail: "Typed, test-backed MCP tools expose the deterministic mechanics the agents call into: parse, validate, finalize, Claims QA, Search Insights build, and the read-only knowledge and insights queries." },
      quality: { layer: "execution", tag: "QG", name: "Quality gate", sub: "consistency · completeness", detail: "A consolidated quality gate runs before a run is allowed to finish: it reconciles cross-reader consistency and confirms every expected artifact exists and is well-formed." },
      analysis: { layer: "execution", tag: "PY", name: "Python analysis", sub: "stats · workbooks", detail: "Python analysis modules handle trends, anomalies, clustering, prediction, cross-client similarity, and workbook assembly: the heavy quality work that stays deterministic and reproducible." },
      outputs: { layer: "delivery", tag: "OUT", name: "Outputs tree", sub: "XLSX · JSON · MD · logs", terminal: true, detail: "Validated workbooks, fixed JSON, payer artifacts, diff XLSX, summaries, change logs, and group manifests land in the right client domain inside a structured Outputs tree. Deliverables download over authenticated requests, not open links." },
      analytics: { layer: "delivery", tag: "BI", name: "Analytics views", sub: "internal · partner-facing", detail: "Two-audience analytics roll up the registry: an internal operations view gets run health, stage latency, failure modes, and shipped deliverables; a partner-facing view gets approval rates by client and action type." },
      learning: { layer: "delivery", tag: "LRN", name: "Cross-client learning", sub: "patterns · outcomes", detail: "Corrections, keyword outcomes, and recurring cross-client patterns accrue into a pattern registry that later runs read from. It is the part of the system that compounds with every client and every operator decision." },
      curator: { layer: "delivery", tag: "KB", name: "Knowledge curator", sub: "prune · calibrate · propose", detail: "A knowledge-curator agent maintains the learning base: it prunes stale patterns, reconciles the critic\u2019s calibration signal, and drafts standing-rule changes as proposals for review. It never auto-applies a rule." },
      decisions: { layer: "delivery", tag: "DEC", name: "Decision capture", sub: "judgment \u2192 memory", detail: "Operator gate decisions are captured and distilled into reusable, generalizable patterns. They are proposed for review, never auto-applied, so human judgment becomes durable institutional memory instead of a one-off click." },
    },
    edges: [["ui","api"],["upload","api"],["copilot","api"],["api","auth"],["api","sse"],["api","registry"],["api","dispatcher"],["dispatcher","runners"],["dispatcher","registry"],["runners","makers"],["makers","mcp"],["makers","critic"],["critic","makers"],["runners","analysis"],["runners","quality"],["quality","registry"],["analysis","outputs"],["runners","outputs"],["runners","registry"],["registry","sse"],["sse","ui"],["registry","analytics"],["analytics","ui"],["registry","copilot"],["outputs","learning"],["decisions","learning"],["learning","registry"],["makers","classify"],["classify","registry"],["learning","curator"],["curator","learning"],["auth","ui"]],
    sequence: ["upload","api","dispatcher","runners","makers","classify","critic","mcp","quality","registry","outputs","analytics","learning","curator","copilot","ui"],
  };
  topo.neighbors = (key) => {
    const set = new Set();
    topo.edges.forEach(([a, b]) => { if (a === key) set.add(b); if (b === key) set.add(a); });
    return set;
  };

  /* ---- Product showcase data ---- */
  const shots = {
    login: { src: "assets/product-login.png", label: "Login", alt: "Vi Data Ops login screen.", caption: "Login: the Sign in screen that starts the authenticated operator flow, with username/password access, session persistence, and a forced-password-change path behind first login." },
    dashboard: { src: "assets/product-dashboard.png", label: "Dashboard", alt: "Vi Data Ops dashboard.", caption: "Dashboard: run metrics, Next Best Action, approval trends, track mix, and collapsed chat in one operator console." },
    analytics: { src: "assets/product-analytics.png", label: "Analytics", alt: "Analytics page.", caption: "Analytics: Product Ops gets run health, stage durations, failure modes, per-client frequency, and shipped deliverables; CP View gets approval metrics." },
    search: { src: "assets/product-search-insights.png", label: "Search Insights", alt: "Search Insights builder.", caption: "Search Insights: the real builder surface, with recent builds, three entry paths, parsed-brief preview, and audience grouping before long agent work." },
    run: { src: "assets/product-run-detail.png", label: "Run Detail", alt: "Run detail page.", caption: "Run Detail: readiness badge, stage trace, captured decisions, and a real Re-run action for terminal runs." },
    upload: { src: "assets/product-upload.png", label: "Upload", alt: "Upload router.", caption: "Upload router: one drop zone for files, folders, zips, and disambiguation when routing is uncertain." },
    system: { src: "assets/product-system.png", label: "System", alt: "System topology page.", caption: "System graph: a 5-layer operating model with health, flow state, latency, sample size, and error rates." },
    settings: { src: "assets/product-settings.png", label: "Settings", alt: "Settings page.", caption: "Settings: model tier, auth source, effective model map, backend health, SSE state, sharing URL, output paths, and hidden-client recovery." },
    users: { src: "assets/product-users.png", label: "Users", alt: "Users admin page.", caption: "Users: account creation, roles, reset and disable actions, deletion guardrails, and the shared/private workspace switch." },
  };
  const shotOrder = ["dashboard","analytics","search","run","upload","system","settings","users","login"];

  window.ViMobile = { reduced, counters, reveal, scrollProgress, heroNetwork, autoCycle, topo, shots, shotOrder };
})();
