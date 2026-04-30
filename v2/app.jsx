/* ========================================================================
   Zain Ali — Portfolio · App
   ======================================================================== */

const { useState, useEffect, useRef, useLayoutEffect } = React;

/* ─── Tweaks defaults ─────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#B7522C",
  "showGrain": true,
  "showGrid": true,
  "fontPair": "newsreader-geist"
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  "newsreader-geist": {
    label: "Newsreader × Geist",
    serif: '"Newsreader", "Source Serif Pro", Georgia, serif',
    sans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Geist Mono", ui-monospace, Menlo, monospace',
  },
  "fraunces-figtree": {
    label: "Fraunces × Figtree",
    serif: '"Fraunces", Georgia, serif',
    sans: '"Figtree", -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  },
  "instrument-sohne": {
    label: "Instrument × Inter Tight",
    serif: '"Instrument Serif", Georgia, serif',
    sans: '"Inter Tight", -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  },
};

/* ─── Reveal-on-scroll hook ──────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
    );
    // Delay slightly so React has fully painted before first observation
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal, .reveal-mask").forEach((el) => io.observe(el));
    }, 80);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);
}

/* ─── Magnetic button effect ─────────────────────────────────────────── */
function useMagnetic(strength = 0.25) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return ref;
}

/* ─── Animated number counter ────────────────────────────────────────── */
function AnimatedNum({ value, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(value * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  const formatted = n >= 1_000_000 ? (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M"
                  : n >= 1_000 ? (n / 1_000).toFixed(0) + "K"
                  : n;
  return <span ref={ref}>{formatted}<span className="plus">{suffix}</span></span>;
}

/* ─── Nav ────────────────────────────────────────────────────────────── */
function Nav({ tweaks, setTweak, openTweaks }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const ctaRef = useMagnetic(0.18);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">ZA</span>
          <span>Zain Ali</span>
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#expertise">Expertise</a>
          <a href="#impact">Impact</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta">
          <button
            className="theme-toggle"
            onClick={() => setTweak("theme", tweaks.theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {tweaks.theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <a ref={ctaRef} href="#contact" className="btn btn-primary">
            Get in Touch
            <ArrowIcon />
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Eye-tracking 3D character ──────────────────────────────────────── */
function ScrollGuy() {
  const wrapRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const headRef = useRef(null);
  const bodyRef = useRef(null);
  const mouthRef = useRef(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0, hasMouse = false;
    let raf;

    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      // scroll progress (0 at top, 1 deep into page)
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollP = Math.min(1, scrollY / maxScroll);

      // target the cursor; if no mouse, target the scroll position (looks "down" as we scroll)
      let tx, ty;
      if (hasMouse) {
        tx = mouseX - cx;
        ty = mouseY - cy;
      } else {
        tx = 0;
        ty = scrollP * 600; // simulate looking down as user scrolls
      }
      const dist = Math.hypot(tx, ty) || 1;
      const ndx = tx / dist;
      const ndy = ty / dist;

      // pupils
      const pupilMax = 7;
      const pupilX = ndx * pupilMax;
      const pupilY = ndy * pupilMax;
      // additional vertical bias from scroll — eyes drift down as page scrolls
      const scrollBias = scrollP * 4;
      if (leftEyeRef.current) {
        leftEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY + scrollBias}px)`;
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY + scrollBias}px)`;
      }

      // subtle head rotate (3D)
      const rotY = Math.max(-18, Math.min(18, ndx * 18));
      const rotX = Math.max(-12, Math.min(12, -ndy * 12));
      const tilt = Math.max(-6, Math.min(6, ndx * 6));
      if (headRef.current) {
        headRef.current.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${tilt * 0.3}deg)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `rotateY(${rotY * 0.4}deg) rotateX(${rotX * 0.2}deg)`;
      }
      // mouth shifts with scroll — slight smile -> neutral as you scroll past hero
      if (mouthRef.current) {
        const heroP = Math.min(1, scrollY / window.innerHeight);
        const smile = 1 - heroP * 0.7;
        mouthRef.current.style.transform = `scaleY(${0.5 + smile * 0.6})`;
      }
    };

    const tick = () => { update(); raf = requestAnimationFrame(tick); };

    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; hasMouse = true; };
    const onLeave = () => { hasMouse = false; };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) { mouseX = t.clientX; mouseY = t.clientY; hasMouse = true; }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div className="scroll-guy" ref={wrapRef} aria-hidden="true">
      <div className="sg-stage">
        <div className="sg-shadow"></div>
        <div className="sg-figure">
          <div className="sg-body" ref={bodyRef}>
            <div className="sg-shoulders"></div>
            <div className="sg-neck"></div>
          </div>
          <div className="sg-head" ref={headRef}>
            <div className="sg-hair"></div>
            <div className="sg-face">
              <div className="sg-brow sg-brow-l"></div>
              <div className="sg-brow sg-brow-r"></div>
              <div className="sg-eye sg-eye-l">
                <div className="sg-pupil" ref={leftEyeRef}></div>
              </div>
              <div className="sg-eye sg-eye-r">
                <div className="sg-pupil" ref={rightEyeRef}></div>
              </div>
              <div className="sg-nose"></div>
              <div className="sg-mouth" ref={mouthRef}></div>
              <div className="sg-cheek sg-cheek-l"></div>
              <div className="sg-cheek sg-cheek-r"></div>
            </div>
            <div className="sg-ear sg-ear-l"></div>
            <div className="sg-ear sg-ear-r"></div>
          </div>
        </div>
        <div className="sg-caption">
          <span className="sg-dot"></span>
          watching you scroll
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  const ctaRef = useMagnetic(0.2);
  const ctaRef2 = useMagnetic(0.2);
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-status reveal">
          <span className="dot"></span>
          <span>Available for select partnerships · 2026</span>
        </div>

        <h1 className="display hero-title">
          <span className="row"><span className="reveal-mask"><span>Building</span></span></span>
          <span className="row"><span className="reveal-mask" style={{ "--reveal-delay": "100ms" }}><span><em className="italic">Scalable</em> Software</span></span></span>
          <span className="row"><span className="reveal-mask" style={{ "--reveal-delay": "200ms" }}><span>Products &amp;</span></span></span>
          <span className="row"><span className="reveal-mask" style={{ "--reveal-delay": "300ms" }}><span><span className="accent">Platforms.</span></span></span></span>
        </h1>

        <div className="hero-bottom">
          <div className="hero-intro reveal" style={{ "--reveal-delay": "500ms" }}>
            <p>
              Hi, I'm <span className="name">Zain Ali</span> — Founder &amp; Technologist at iVector. I turn
              complex problems into elegant, production-grade software — from 0→1
              products to platforms that scale to millions.
            </p>
            <div className="hero-actions">
              <a ref={ctaRef} href="#contact" className="btn btn-primary">
                Get in touch <ArrowIcon />
              </a>
              <a ref={ctaRef2} href="#experience" className="btn btn-ghost">
                View experience
              </a>
            </div>
          </div>

          <div className="stat-strip reveal" style={{ "--reveal-delay": "650ms" }}>
            <div className="stat">
              <div className="stat-num"><AnimatedNum value={10} /><span className="plus">+</span></div>
              <div className="stat-label">Years building</div>
            </div>
            <div className="stat">
              <div className="stat-num"><AnimatedNum value={30} /><span className="plus">+</span></div>
              <div className="stat-label">Products shipped</div>
            </div>
            <div className="stat">
              <div className="stat-num"><AnimatedNum value={5_000_000} /><span className="plus">+</span></div>
              <div className="stat-label">Users reached</div>
            </div>
          </div>
        </div>
      </div>

      <ScrollGuy />

      <div className="scroll-indicator">
        <span>Scroll</span>
        <span className="line"></span>
      </div>
    </section>
  );
}

/* ─── About + Expertise ──────────────────────────────────────────────── */
const EXPERTISE = [
  { title: "Full-Stack Development", desc: "End-to-end product engineering from architecture to deployment" },
  { title: "Platform Architecture", desc: "Scalable distributed systems built for millions of users" },
  { title: "Product Strategy", desc: "0→1 product thinking with a bias for measurable outcomes" },
  { title: "Team Leadership", desc: "Building and mentoring high-performance engineering teams" },
];

function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="section-head">
          <div className="label reveal"><span className="num">01</span> About me</div>
          <h2 className="section-title reveal">
            Bridging <em className="italic">ideas</em> &amp;<br />engineering.
          </h2>
        </div>

        <div className="about-grid">
          <div className="about-copy reveal">
            <p className="lede">
              I'm the founder of <em className="italic" style={{ color: "var(--ink)" }}>iVector</em>,
              a technology studio building software products that actually matter. My work sits at the
              intersection of product thinking, systems architecture, and execution — I care deeply about
              <em className="italic" style={{ color: "var(--accent)" }}> why</em> something is built as
              much as <em className="italic" style={{ color: "var(--accent)" }}>how</em>.
            </p>
            <p style={{ marginTop: 22, fontSize: 16, lineHeight: 1.65, maxWidth: "60ch", color: "var(--ink-3)" }}>
              Over the past decade I've launched SaaS platforms, led engineering teams, and scaled products
              from prototype to production. I believe great software is born from empathy for users and
              obsession with craft.
            </p>
            <div className="links">
              <a href="#" className="pill-link"><GithubIcon /> GitHub</a>
              <a href="#" className="pill-link"><LinkedInIcon /> LinkedIn</a>
              <a href="#" className="pill-link"><MailIcon /> Email</a>
            </div>
          </div>

          <div id="expertise" className="expertise-list reveal" style={{ "--reveal-delay": "150ms" }}>
            {EXPERTISE.map((e, i) => (
              <div key={e.title} className="expertise-row">
                <span className="idx">/{String(i + 1).padStart(2, "0")}</span>
                <div className="title">{e.title}</div>
                <div className="desc">{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Experience timeline ────────────────────────────────────────────── */
const EXPERIENCE = [
  {
    years: "2018 — Present",
    role: "Founder & CEO",
    company: "iVector",
    blurb: "Founded iVector to build software products that solve real business problems at scale. Led the company from a 2-person team to a full engineering studio delivering SaaS platforms, mobile apps, and AI-powered tools across multiple industries.",
    tags: ["SaaS", "AI/ML", "Mobile", "Platform Engineering"],
  },
  {
    years: "2015 — 2018",
    role: "Lead Software Architect",
    company: "TechScale Labs",
    blurb: "Designed and led the migration of a monolithic legacy platform to a microservices architecture, reducing deployment times by 80% and enabling the platform to serve 2M+ concurrent users. Managed a team of 12 engineers across 3 time zones.",
    tags: ["Microservices", "Kubernetes", "AWS", "Team Lead"],
  },
  {
    years: "2012 — 2015",
    role: "Senior Full-Stack Engineer",
    company: "Velocity Digital",
    blurb: "Built and shipped 6 client products from scratch — including a fintech platform processing $50M/month in transactions. Led frontend architecture decisions and introduced performance monitoring that reduced page load times by 60%.",
    tags: ["React", "Node.js", "PostgreSQL", "Fintech"],
  },
];

function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <div className="section-head">
          <div className="label reveal"><span className="num">02</span> Career journey</div>
          <h2 className="section-title reveal">
            Experience &amp; <em className="italic">track record.</em>
          </h2>
        </div>
        <div className="timeline">
          {EXPERIENCE.map((x, i) => (
            <div className="timeline-item reveal" style={{ "--reveal-delay": `${i * 80}ms` }} key={x.role}>
              <div className="meta">
                <div className="years">{x.years}</div>
                <span className="marker"></span>
              </div>
              <div className="body">
                <h3 className="role">{x.role}</h3>
                <div className="company">{x.company}</div>
                <p className="blurb">{x.blurb}</p>
                <div className="tag-row">
                  {x.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Skills ─────────────────────────────────────────────────────────── */
const SKILLS = [
  { glyph: "FE/", title: "Frontend", items: ["React", "Next.js", "TypeScript", "Vue.js", "Tailwind CSS", "Framer Motion", "GraphQL"] },
  { glyph: "BE/", title: "Backend", items: ["Node.js", "Python", "Go", "FastAPI", "REST APIs", "PostgreSQL", "Redis"] },
  { glyph: "OPS/", title: "Cloud & DevOps", items: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Monitoring"] },
  { glyph: "MOB/", title: "Mobile", items: ["React Native", "Flutter", "iOS", "Android", "Expo"] },
  { glyph: "AI/", title: "AI & Data", items: ["LLMs", "RAG", "OpenAI API", "LangChain", "Vector DBs", "ML Pipelines"] },
  { glyph: "PRO/", title: "Product & Process", items: ["System Design", "Agile/Scrum", "Product Strategy", "Technical Writing", "OKRs"] },
];

function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="section-head">
          <div className="label reveal"><span className="num">03</span> Technical arsenal</div>
          <h2 className="section-title reveal">
            Skills &amp; <em className="italic">expertise.</em>
          </h2>
        </div>
        <div className="skills-grid reveal">
          {SKILLS.map((s) => (
            <div key={s.title} className="skill-cell">
              <div className="head">
                <h3>{s.title}</h3>
                <span className="glyph">{s.glyph}</span>
              </div>
              <div className="skill-list">
                {s.items.map((it) => <span key={it} className="skill-chip">{it}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Projects ───────────────────────────────────────────────────────── */
function ProjectVisual({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      draw();
    };
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
    const ink3 = getComputedStyle(document.documentElement).getPropertyValue("--ink-3").trim();

    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      // base
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (kind === "saas") {
        grad.addColorStop(0, paper);
        grad.addColorStop(1, accent + "20");
      } else if (kind === "ai") {
        grad.addColorStop(0, ink);
        grad.addColorStop(1, accent);
      } else {
        grad.addColorStop(0, accent + "30");
        grad.addColorStop(1, paper);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (kind === "saas") {
        // flowing pipeline lines
        ctx.lineWidth = 1.5 * dpr;
        for (let i = 0; i < 14; i++) {
          ctx.strokeStyle = i % 3 === 0 ? accent : ink3 + "60";
          ctx.beginPath();
          const y = (h / 14) * i + (h / 28);
          ctx.moveTo(0, y);
          for (let x = 0; x < w; x += 6 * dpr) {
            const wave = Math.sin((x / w) * 6 + i * 0.5) * (h / 40);
            ctx.lineTo(x, y + wave);
          }
          ctx.stroke();
        }
        // node dots
        ctx.fillStyle = accent;
        for (let i = 0; i < 22; i++) {
          const x = ((i * 73) % w);
          const y = ((i * 137) % h);
          ctx.beginPath();
          ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (kind === "ai") {
        // document-grid + tokens
        ctx.strokeStyle = paper + "30";
        ctx.lineWidth = 1 * dpr;
        for (let r = 0; r < 8; r++) {
          for (let cc = 0; cc < 16; cc++) {
            const len = Math.random() * (w / 18) + (w / 24);
            const x = cc * (w / 16) + (w / 32);
            const y = r * (h / 9) + (h / 14);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len, y);
            ctx.stroke();
          }
        }
        // highlight blocks
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(w * 0.15, h * 0.35, w * 0.18, h * 0.06);
        ctx.fillRect(w * 0.55, h * 0.6, w * 0.2, h * 0.06);
        ctx.globalAlpha = 1;
      } else {
        // mobile waves / pulse
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        for (let x = 0; x < w; x += 2) {
          const t = x / w;
          const y = h / 2
            + Math.sin(t * 18) * (h / 6) * Math.exp(-Math.abs(t - 0.5) * 6)
            + Math.sin(t * 40) * (h / 20);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // dot grid
        ctx.fillStyle = accent;
        for (let i = 0; i < 30; i++) {
          ctx.globalAlpha = Math.random() * 0.6 + 0.2;
          ctx.beginPath();
          ctx.arc(Math.random() * w, Math.random() * h, 2 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [kind]);
  return <canvas ref={ref}></canvas>;
}

const PROJECTS = [
  {
    featured: true, kind: "SaaS Platform", visual: "saas", icon: "⚡", name: "VectorFlow",
    blurb: "End-to-end data pipeline orchestration platform built for enterprise teams. Reduced data processing setup time from weeks to hours, now serving 200+ enterprise clients across 18 countries.",
    results: ["200+ enterprise clients onboarded", "$2M ARR within 18 months", "99.99% uptime SLA maintained"],
    stack: ["Next.js", "Go", "Kubernetes", "Kafka"],
  },
  {
    kind: "AI Product", visual: "ai", icon: "◐", name: "IntelliDoc",
    blurb: "AI-powered document intelligence platform that extracts, summarizes, and answers questions from unstructured docs. Processes 1M+ documents/day.",
    results: [], stack: ["LangChain", "RAG", "FastAPI"],
  },
  {
    kind: "Mobile App", visual: "mobile", icon: "◇", name: "PulseHealth",
    blurb: "Health & wellness tracking app with real-time coaching. 500K+ downloads, featured in App Store editorial picks two years running.",
    results: [], stack: ["React Native", "Node.js", "ML"],
  },
];

function Projects() {
  return (
    <section id="impact">
      <div className="container">
        <div className="section-head">
          <div className="label reveal"><span className="num">04</span> Work &amp; impact</div>
          <h2 className="section-title reveal">
            Projects that <em className="italic">move<br />the needle.</em>
          </h2>
        </div>

        <div className="projects">
          {PROJECTS.map((p) => (
            <article
              key={p.name}
              className={`project reveal ${p.featured ? "project-featured" : ""}`}
            >
              <div className="visual"><ProjectVisual kind={p.visual} /></div>
              <div className="kind">
                <span>{p.kind}</span>
                <span className="badge">{p.icon} Featured</span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              {p.results.length > 0 && (
                <div className="results">
                  {p.results.map((r) => <div className="result-row" key={r}>{r}</div>)}
                </div>
              )}
              <div className="stack">
                {p.stack.map((s) => <span key={s} className="tag">{s}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className="impact-stats reveal">
          <div className="impact-stat">
            <div className="num"><span className="accent">$</span><AnimatedNum value={10} />M<span className="accent">+</span></div>
            <div className="label">Revenue generated</div>
          </div>
          <div className="impact-stat">
            <div className="num"><AnimatedNum value={5_000_000} /><span className="accent">+</span></div>
            <div className="label">Users impacted</div>
          </div>
          <div className="impact-stat">
            <div className="num"><AnimatedNum value={30} /><span className="accent">+</span></div>
            <div className="label">Products shipped</div>
          </div>
          <div className="impact-stat">
            <div className="num"><AnimatedNum value={18} /></div>
            <div className="label">Countries reached</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ────────────────────────────────────────────────────────── */
function Contact() {
  const ctaRef = useMagnetic(0.15);
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-head">
          <div className="label reveal"><span className="num">05</span> Let's work together</div>
          <h2 className="section-title reveal">
            Have a project in <em className="italic">mind?</em>
          </h2>
        </div>

        <div className="contact-inner">
          <div className="reveal">
            <p className="lede" style={{ marginBottom: 8, maxWidth: "26ch" }}>
              Whether you're building a new product, need a technical co-founder, or want to scale an existing
              platform — <em className="italic" style={{ color: "var(--accent)" }}>I'd love to hear about it.</em>
            </p>
            <a ref={ctaRef} href="mailto:hello@ivector.studio" className="contact-cta">
              hello@ivector.studio
              <span className="arrow">
                <ArrowIcon />
              </span>
            </a>
          </div>

          <div className="contact-meta reveal" style={{ "--reveal-delay": "150ms" }}>
            <div className="meta-row">
              <div className="key">Connect</div>
              <div className="val">
                <a href="#">LinkedIn</a> &nbsp;·&nbsp; <a href="#">GitHub</a> &nbsp;·&nbsp; <a href="#">X / Twitter</a>
              </div>
            </div>
            <div className="meta-row">
              <div className="key">Availability</div>
              <div className="val">Available for calls<br />Usually responds within 24h</div>
            </div>
            <div className="meta-row">
              <div className="key">Based in</div>
              <div className="val">California, USA<br />Working globally · GMT-7</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <span className="brand">ZA. Zain Ali</span>
        <span>© 2026 · Built with care at iVector</span>
        <span>v2.4 · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>
      </div>
    </footer>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────── */
function ArrowIcon() {
  return (
    <svg className="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MoonIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function SunIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>);
}
function GithubIcon() { return (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z"/></svg>); }
function LinkedInIcon() { return (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>); }
function MailIcon() { return (<svg viewBox="0 0 24 24" fill="none"><path d="M3 7.5l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>); }

/* ─── App ────────────────────────────────────────────────────────────── */
function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // apply theme
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);

  // apply accent
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
  }, [tweaks.accent]);

  // apply font pair
  useLayoutEffect(() => {
    const f = FONT_PAIRS[tweaks.fontPair] || FONT_PAIRS["newsreader-geist"];
    document.documentElement.style.setProperty("--serif", f.serif);
    document.documentElement.style.setProperty("--sans", f.sans);
    document.documentElement.style.setProperty("--mono", f.mono);
  }, [tweaks.fontPair]);

  // grain / grid toggles
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--grain-opacity", tweaks.showGrain ? (tweaks.theme === "dark" ? "0.08" : "0.06") : "0");
    document.documentElement.style.setProperty("--grid-opacity", tweaks.showGrid ? (tweaks.theme === "dark" ? "0.35" : "0.5") : "0");
  }, [tweaks.showGrain, tweaks.showGrid, tweaks.theme]);

  useReveal();

  return (
    <>
      <div className="bg-layer bg-grid"></div>
      <div className="bg-layer bg-grain"></div>

      <Nav tweaks={tweaks} setTweak={setTweak} />

      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer />

      <window.TweaksPanel>
        <window.TweakSection label="Theme" />
        <window.TweakRadio
          label="Mode"
          value={tweaks.theme}
          options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
          onChange={(v) => setTweak("theme", v)}
        />
        <window.TweakColor label="Accent" value={tweaks.accent} onChange={(v) => setTweak("accent", v)} />
        <window.TweakSection label="Type" />
        <window.TweakSelect
          label="Pairing"
          value={tweaks.fontPair}
          options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak("fontPair", v)}
        />
        <window.TweakSection label="Texture" />
        <window.TweakToggle label="Grain" value={tweaks.showGrain} onChange={(v) => setTweak("showGrain", v)} />
        <window.TweakToggle label="Grid" value={tweaks.showGrid} onChange={(v) => setTweak("showGrid", v)} />
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/* ─── Theme toggle button ────────────────────────────────────────────── */
const styleEl = document.createElement("style");
styleEl.textContent = `
.theme-toggle {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--ink-2);
  display: grid; place-items: center;
  cursor: pointer;
  transition: all 200ms var(--ease-out);
}
.theme-toggle:hover {
  border-color: var(--ink);
  color: var(--ink);
  transform: rotate(20deg);
}
`;
document.head.appendChild(styleEl);
