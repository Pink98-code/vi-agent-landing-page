const shots = {
  login: {
    src: "assets/product-login.png",
    alt: "Vi Data Ops login screen with username and password fields, keep me signed in checkbox, and sign in button.",
    caption:
      "Login: the Sign in screen that starts the authenticated operator flow, with username/password access, session persistence, and the forced-password-change path behind first login.",
  },
  dashboard: {
    src: "assets/product-dashboard.png",
    alt: "Vi Data Ops dashboard with run metrics, next best action, track mix, and collapsed chat.",
    caption:
      "Dashboard: run metrics, Next Best Action, approval trends, track mix, and collapsed chat in one operator console.",
  },
  analytics: {
    src: "assets/product-analytics.png",
    alt: "Analytics page showing Product Ops run health, failure modes, stage durations, and KPI cards.",
    caption:
      "Analytics: Product Ops gets run health, stage durations, failure modes, per-client frequency, and shipped deliverables; CP View gets approval metrics.",
  },
  system: {
    src: "assets/product-system.png",
    alt: "System page showing the agent pipeline topology and per-layer health table.",
    caption:
      "System graph: a 5-layer operating model with health, flow state, latency, sample size, and error rates.",
  },
  settings: {
    src: "assets/product-settings.png",
    alt: "Settings page showing agent model tier, auth source, effective models, backend health, and sharing state.",
    caption:
      "Settings: model tier, auth source, effective model map, backend health, SSE state, sharing URL, output paths, and hidden-client recovery in one operator surface.",
  },
  users: {
    src: "assets/product-users.png",
    alt: "Users admin page showing sharing mode, create user controls, roles, and account actions.",
    caption:
      "Users: account creation, roles, reset and disable actions, deletion guardrails, and the shared/private workspace switch for controlled team access.",
  },
  search: {
    src: "assets/product-search-insights.png",
    alt: "Search Insights builder entry screen with existing client, thin JSON, and full brief choices.",
    caption:
      "Search Insights: the real builder surface, with recent builds, three entry paths, parsed-brief preview, and audience grouping before long agent work.",
  },
  run: {
    src: "assets/product-run-detail.png",
    alt: "Run detail page with Ready to send status, stage list, retry stage button, and Re-run button.",
    caption:
      "Run Detail: readiness badge, stage trace, captured decisions, and a real Re-run action for terminal runs.",
  },
  upload: {
    src: "assets/product-upload.png",
    alt: "Upload router with file drop zone, operator hint, and automatic routing.",
    caption:
      "Upload router: one drop zone for files, folders, zips, and disambiguation when routing is uncertain.",
  },
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (prefersReducedMotion) {
    counters.forEach((node) => {
      node.textContent = node.dataset.count;
    });
    return;
  }

  counters.forEach((node) => {
    const target = Number(node.dataset.count || "0");
    const duration = 1100 + target * 10;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(target * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupScrollProgress() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    bar.style.width = `${pct}%`;
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
}

function setupShowcase() {
  const image = document.getElementById("showcase-image");
  const caption = document.getElementById("showcase-caption");
  const buttons = document.querySelectorAll("[data-shot]");
  if (!image || !caption || buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.shot;
      const shot = shots[key];
      if (!shot) return;

      buttons.forEach((b) => b.classList.toggle("is-active", b === button));
      image.style.opacity = "0";
      window.setTimeout(
        () => {
          image.src = shot.src;
          image.alt = shot.alt;
          caption.textContent = shot.caption;
          image.style.opacity = "1";
        },
        prefersReducedMotion ? 0 : 160
      );
    });
  });
}

function setupFlowAnimation() {
  const nodes = Array.from(document.querySelectorAll("[data-flow-node]"));
  if (nodes.length === 0 || prefersReducedMotion) return;

  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % nodes.length;
    nodes.forEach((node, i) => node.classList.toggle("is-active", i === index));
  }, 2200);
}

function setupBriefingPanels() {
  const panels = Array.from(document.querySelectorAll(".briefing-panel"));
  if (panels.length === 0 || prefersReducedMotion) return;

  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % panels.length;
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
  }, 3600);
}

function setupTopology() {
  const topology = document.getElementById("topology");
  const svg = document.getElementById("topo-links");
  const grid = document.getElementById("topo-grid");
  const detailTitle = document.getElementById("topo-detail-title");
  const detailBody = document.getElementById("topo-detail-body");
  const flowLabel = document.getElementById("topo-flow-label");
  if (!topology || !svg || !grid) return;

  const svgNS = "http://www.w3.org/2000/svg";
  svg.innerHTML =
    '<defs><linearGradient id="topoFlowGrad" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#806df7"/>' +
    '<stop offset="0.55" stop-color="#00b6d0"/>' +
    '<stop offset="1" stop-color="#f97316"/>' +
    "</linearGradient></defs>";

  const edges = [
    ["ui", "api"],
    ["upload", "api"],
    ["copilot", "api"],
    ["api", "auth"],
    ["api", "sse"],
    ["api", "registry"],
    ["api", "dispatcher"],
    ["dispatcher", "runners"],
    ["dispatcher", "registry"],
    ["runners", "makers"],
    ["makers", "mcp"],
    ["makers", "critic"],
    ["critic", "makers"],
    ["runners", "analysis"],
    ["runners", "quality"],
    ["quality", "registry"],
    ["analysis", "outputs"],
    ["runners", "outputs"],
    ["runners", "registry"],
    ["registry", "sse"],
    ["sse", "ui"],
    ["registry", "analytics"],
    ["analytics", "ui"],
    ["registry", "copilot"],
    ["outputs", "learning"],
    ["decisions", "learning"],
    ["learning", "registry"],
    ["makers", "classify"],
    ["classify", "registry"],
    ["learning", "curator"],
    ["curator", "learning"],
    ["auth", "ui"],
  ];

  const sequence = [
    "upload", "api", "dispatcher", "runners", "makers",
    "classify", "critic", "mcp", "quality", "registry",
    "outputs", "analytics", "learning", "curator", "copilot", "ui",
  ];

  const nodes = {};
  const layerOf = {};
  const columns = Array.from(grid.querySelectorAll(".topo-col"));
  columns.forEach((col, colIndex) => {
    col.querySelectorAll(".topo-node").forEach((node) => {
      const key = node.dataset.node;
      nodes[key] = node;
      layerOf[key] = colIndex;
    });
  });

  function nodeTitle(node) {
    const clone = node.cloneNode(true);
    clone.querySelector(".topo-tag")?.remove();
    clone.querySelector("small")?.remove();
    return clone.textContent.trim();
  }

  const neighborMap = {};
  edges.forEach(([from, to]) => {
    (neighborMap[from] ||= new Set()).add(to);
    (neighborMap[to] ||= new Set()).add(from);
  });

  const drawn = [];

  function anchor(rect, side, base) {
    switch (side) {
      case "right":
        return { x: rect.right - base.left, y: rect.top - base.top + rect.height / 2 };
      case "left":
        return { x: rect.left - base.left, y: rect.top - base.top + rect.height / 2 };
      case "top":
        return { x: rect.left - base.left + rect.width / 2, y: rect.top - base.top };
      default:
        return { x: rect.left - base.left + rect.width / 2, y: rect.bottom - base.top };
    }
  }

  function build() {
    drawn.length = 0;
    Array.from(svg.querySelectorAll("path")).forEach((p) => p.remove());

    const base = topology.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);

    edges.forEach(([from, to]) => {
      const fromEl = nodes[from];
      const toEl = nodes[to];
      if (!fromEl || !toEl) return;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const sameCol = layerOf[from] === layerOf[to];
      const forward = layerOf[to] > layerOf[from];

      let p1;
      let p2;
      let d;
      if (sameCol) {
        const down = tr.top > fr.top;
        p1 = anchor(fr, down ? "bottom" : "top", base);
        p2 = anchor(tr, down ? "top" : "bottom", base);
        const cy = (p1.y + p2.y) / 2;
        d = `M ${p1.x} ${p1.y} C ${p1.x} ${cy}, ${p2.x} ${cy}, ${p2.x} ${p2.y}`;
      } else {
        p1 = anchor(fr, forward ? "right" : "left", base);
        p2 = anchor(tr, forward ? "left" : "right", base);
        const cx = (p1.x + p2.x) / 2;
        d = `M ${p1.x} ${p1.y} C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`;
      }

      const edge = document.createElementNS(svgNS, "path");
      edge.setAttribute("class", "topo-edge");
      edge.setAttribute("d", d);
      svg.appendChild(edge);

      const flow = document.createElementNS(svgNS, "path");
      flow.setAttribute("class", "topo-edge-flow");
      flow.setAttribute("d", d);
      flow.style.animationDelay = `${Math.random() * -3.4}s`;
      svg.appendChild(flow);

      drawn.push({ from, to, edge, flow });
    });
  }

  function focus(key) {
    if (!key || !nodes[key]) return;
    topology.classList.add("has-focus");
    Object.entries(nodes).forEach(([name, node]) => {
      node.classList.toggle("is-focus", name === key);
      node.classList.toggle("is-neighbor", neighborMap[key]?.has(name) || false);
    });
    drawn.forEach(({ from, to, edge, flow }) => {
      const lit = from === key || to === key;
      edge.classList.toggle("is-lit", lit);
      flow.classList.toggle("is-lit", lit);
    });
    if (detailTitle && detailBody) {
      detailTitle.textContent = nodeTitle(nodes[key]);
      detailBody.style.opacity = "0";
      window.setTimeout(() => {
        detailBody.innerHTML = nodes[key].dataset.detail || "";
        detailBody.style.opacity = "1";
      }, prefersReducedMotion ? 0 : 130);
    }
    if (flowLabel) flowLabel.textContent = `Active path · ${nodeTitle(nodes[key])}`;
  }

  function clearFocus() {
    topology.classList.remove("has-focus");
    Object.values(nodes).forEach((node) => node.classList.remove("is-focus", "is-neighbor"));
    drawn.forEach(({ edge, flow }) => {
      edge.classList.remove("is-lit");
      flow.classList.remove("is-lit");
    });
    if (flowLabel) flowLabel.textContent = "Tracing data flow across four layers";
  }

  let pinned = null;
  let cycleIndex = 0;
  let timer = null;

  function startCycle() {
    if (prefersReducedMotion || timer) return;
    timer = window.setInterval(() => {
      if (pinned) return;
      cycleIndex = (cycleIndex + 1) % sequence.length;
      focus(sequence[cycleIndex]);
    }, 2600);
  }

  function stopCycle() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  Object.entries(nodes).forEach(([key, node]) => {
    node.addEventListener("pointerenter", () => {
      if (pinned) return;
      focus(key);
    });
    node.addEventListener("click", () => {
      if (pinned === key) {
        pinned = null;
        startCycle();
      } else {
        pinned = key;
        stopCycle();
        focus(key);
      }
    });
  });

  topology.addEventListener("pointerleave", () => {
    if (!pinned) {
      const current = sequence[cycleIndex];
      focus(current);
    }
  });

  let raf = null;
  window.addEventListener(
    "resize",
    () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(build);
    },
    { passive: true }
  );

  build();
  focus(sequence[0]);
  startCycle();
}

function setupFlowProgress() {
  const map = document.getElementById("flow-map");
  const fill = document.getElementById("flow-track-fill");
  if (!map || !fill) return;
  const steps = Array.from(map.querySelectorAll("[data-flow-node]"));
  if (steps.length === 0) return;

  function update() {
    const active = steps.findIndex((s) => s.classList.contains("is-active"));
    const idx = active < 0 ? 0 : active;
    const pct = steps.length <= 1 ? 100 : (idx / (steps.length - 1)) * 100;
    fill.style.width = `${Math.max(8, pct)}%`;
  }

  update();
  const observer = new MutationObserver(update);
  steps.forEach((s) => observer.observe(s, { attributes: true, attributeFilter: ["class"] }));
}

function setupHeroNetwork() {
  const canvas = document.getElementById("hero-network");
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let frame = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(46, Math.floor((width * height) / 25000));
    points = Array.from({ length: count }, (_, i) => {
      const band = i % 5;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        r: band === 0 ? 2.4 : 1.55,
        tone: band,
      };
    });
  }

  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);

    const activeX = width * (0.18 + 0.1 * Math.sin(frame / 110));
    const activeY = height * (0.48 + 0.08 * Math.cos(frame / 130));

    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -20) a.x = width + 20;
      if (a.x > width + 20) a.x = -20;
      if (a.y < -20) a.y = height + 20;
      if (a.y > height + 20) a.y = -20;

      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 128) {
          const alpha = (1 - dist / 128) * 0.24;
          ctx.strokeStyle = `rgba(204, 255, 251, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const pulse = Math.max(0, 1 - Math.hypot(a.x - activeX, a.y - activeY) / 260);
      ctx.fillStyle =
        a.tone === 0
          ? `rgba(0, 219, 208, ${0.55 + pulse * 0.38})`
          : a.tone === 1
            ? `rgba(249, 115, 22, ${0.36 + pulse * 0.22})`
            : `rgba(255, 255, 255, ${0.28 + pulse * 0.28})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r + pulse * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(draw);
}

if (!document.documentElement.classList.contains("use-mobile-variant")) {
  setupCounters();
  setupReveal();
  setupScrollProgress();
  setupShowcase();
  setupFlowAnimation();
  setupFlowProgress();
  setupBriefingPanels();
  setupTopology();
  setupHeroNetwork();
}
