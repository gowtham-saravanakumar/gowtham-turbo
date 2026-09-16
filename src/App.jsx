import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HistoricalWorld from './HistoricalWorld.jsx';
import { missions, sectors, skills } from './missionData.js';
import AdminDashboard from './AdminDashboard.jsx';

gsap.registerPlugin(ScrollTrigger);

function BootSequence({ reduced }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), reduced ? 0 : 800);
    return () => window.clearTimeout(id);
  }, [reduced]);
  if (done) return null;
  return (
    <div className={`boot-sequence ${reduced ? 'skip' : ''}`} aria-hidden="true">
      <div className="boot-stars" />
      <div className="boot-mark"><i /><i /><i /></div>
      <p>CITY ARCHIVE / WAKING THE WATCHTOWER</p>
      <div className="boot-progress"><i /></div>
      <small>ROOFTOP LINK · CITY MAP · MISSION DATA · CONTACT LEDGER</small>
    </div>
  );
}

function useAudioSystem(enabled) {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  useEffect(() => {
    if (!enabled) {
      nodesRef.current.forEach((node) => { try { node.stop?.(); } catch {} try { node.disconnect?.(); } catch {} });
      nodesRef.current = [];
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.035;
    master.connect(ctx.destination);
    const low = ctx.createOscillator();
    const lowGain = ctx.createGain();
    low.type = 'sine';
    low.frequency.value = 54;
    lowGain.gain.value = 0.55;
    low.connect(lowGain).connect(master);
    const high = ctx.createOscillator();
    const highGain = ctx.createGain();
    high.type = 'triangle';
    high.frequency.value = 108;
    highGain.gain.value = 0.08;
    high.connect(highGain).connect(master);
    low.start();
    high.start();
    nodesRef.current = [low, high, lowGain, highGain, master];
    return () => {
      nodesRef.current.forEach((node) => { try { node.stop?.(); } catch {} try { node.disconnect?.(); } catch {} });
      nodesRef.current = [];
      ctx.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [enabled]);
}

function Hud({ active, progress, cameraMode, setCameraMode, audio, setAudio, reduced, setReduced }) {
  const sector = sectors[active] || sectors[0];
  const pct = Math.round(progress * 100).toString().padStart(2, '0');
  const coords = useMemo(() => ({
    x: Math.round(Math.sin(progress * 17) * 622 + 440),
    y: Math.round(Math.cos(progress * 9) * 283 + 182),
    z: Math.round(progress * 9420)
  }), [progress]);
  return (
    <>
      <div className="hud-left" aria-hidden="true">
        <span className="hud-label">CITY MAP / LIVE</span>
        <strong>{sector.sector}</strong>
        <div className="coords"><span>X {coords.x}</span><span>Y {coords.y}</span><span>Z {coords.z}</span></div>
      </div>
      <div className="hud-right" aria-hidden="true">
        <div className="reticle"><i /><i /><b /></div>
        <span className="hud-label">EAGLE-EYE STATUS</span>
        <strong>{sector.state}</strong>
        <div className="core-readout"><span>SCAN RANGE</span><i><b style={{ width: `${98 - progress * 8}%` }} /></i><em>{Math.round(98 - progress * 8)}%</em></div>
      </div>
      <div className="flight-progress" aria-hidden="true"><i style={{ height: `${Math.max(2, progress * 100)}%` }} /><span>{pct}</span></div>
      <div className="camera-dock" aria-label="Camera controls">
        {['chase', 'cockpit', 'wide'].map((mode) => (
          <button key={mode} className={cameraMode === mode ? 'active' : ''} onClick={() => setCameraMode(mode)}>{mode.toUpperCase()}</button>
        ))}
        <span />
        <button onClick={() => setReduced((v) => !v)} aria-pressed={reduced}>MOTION {reduced ? 'LOW' : 'FULL'}</button>
        <button onClick={() => setAudio((v) => !v)} aria-pressed={audio}>AUDIO {audio ? 'ON' : 'OFF'}</button>
      </div>
    </>
  );
}

function Header({ active, jump }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="mission-header">
      <button className="identity" onClick={() => jump('intro')} aria-label="Return to mission start">
        <span className="identity-mark">G</span>
        <span><b>GOWTHAM</b><small>SEO & DIGITAL GROWTH</small></span>
      </button>
      <nav aria-label="Mission navigation">
        <button className="nav-toggle" aria-expanded={open} onClick={() => setOpen((x) => !x)}>CITY MAP <i>{open ? '×' : '+'}</i></button>
        <div className={`mission-nav ${open ? 'open' : ''}`}>
          {sectors.slice(1, 9).map((s, i) => (
            <button key={s.id} className={active === i + 1 ? 'active' : ''} onClick={() => { jump(s.id); setOpen(false); }}>{s.label}</button>
          ))}
        </div>
      </nav>
    </header>
  );
}

function SectionIndex({ no, label }) {
  return <div className="scene-index" aria-hidden="true"><b>{no}</b><span>{label}</span></div>;
}

function usePublicRecords(endpoint, fallback) {
  const [records, setRecords] = useState(fallback);
  useEffect(() => {
    fetch(endpoint, { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (Array.isArray(data) && data.length) setRecords(data); })
      .catch(() => {});
  }, [endpoint]);
  return records;
}

function Intro({ fire }) {
  return (
    <section className="scene scene-intro" id="intro" data-scene="0">
      <div className="intro-grid" />
      <div className="scene-kicker"><span>MISSION 00</span><i /><span>CITY GATE / IDENTITY FOUND</span></div>
      <div className="hero-lockup reveal">
        <p className="hero-code">GS // 00-ALPHA // HISTORICAL PORTFOLIO</p>
        <h1><span>GOWTHAM</span><em>SARAVANAKUMAR</em></h1>
        <div className="hero-roles"><span>SEO SPECIALIST</span><i>×</i><span>DIGITAL GROWTH STRATEGIST</span></div>
        <p className="hero-copy">Helping B2B, manufacturing and niche businesses turn search visibility into qualified organic growth.</p>
        <div className="hero-actions"><a href="#missions">EXPLORE MY WORK <i>↘</i></a><a href="#contact">START A PROJECT <i>↗</i></a></div>
      </div>
      <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><i /></div>
    </section>
  );
}

function About() {
  return (
    <section className="scene scene-about" id="about" data-scene="1">
      <SectionIndex no="01" label="THE ARCHIVES" />
      <div className="planet-label reveal"><span>CITY DISTRICT 01</span><strong>ARCHIVES</strong><i /></div>
      <div className="holo holo-about reveal">
        <div className="holo-head"><span>PERSONNEL / GOWTHAM</span><i>ACTIVE</i></div>
        <p className="eyebrow">SEO SPECIALIST × DIGITAL GROWTH STRATEGIST</p>
        <h2>SEARCH WORK.<br /><em>WITH SUBSTANCE<br />UNDERNEATH.</em></h2>
        <div className="about-layout">
          <div className="portrait-frame"><img src="./assets/images/jpg/portrait.jpg" alt="Gowtham Saravanakumar" /><span>GOWTHAM S.<br />COIMBATORE, INDIA</span></div>
          <div className="about-copy">
            <p>I'm an independent SEO expert in Coimbatore, specialising in technical SEO, search intent and organic growth systems for B2B, B2C and D2C businesses.</p>
            <p>My work connects crawlability, content architecture, schema, local SEO and analytics. When you hire me, you get me: direct strategy, hands-on execution and one point of accountability.</p>
          </div>
        </div>
        <div className="signal-row"><span><b>3+ YEARS</b>SEO EXPERIENCE</span><span><b>15+ CLIENTS</b>SERVED DIRECTLY</span><span><b>40+ ARTICLES</b>PUBLISHED</span></div>
      </div>
    </section>
  );
}

function Missions({ fire }) {
  const [selected, setSelected] = useState(0);
  const projects = usePublicRecords('/api/projects', missions);
  useEffect(() => { if (selected >= projects.length) setSelected(0); }, [projects.length, selected]);
  return (
    <section className="scene scene-missions" id="missions" data-scene="2">
      <SectionIndex no="02" label="THE MARKET" />
      <div className="section-copy reveal">
        <p className="eyebrow">SELECTED WORK / SEARCH SYSTEMS</p>
        <h2>COMPLEX IDEAS.<br /><em>CLEAR SEARCH PATHS.</em></h2>
        <p>Explore the challenge, approach and outcome behind selected knowledge, technical SEO and content architecture work.</p>
      </div>
      <div className="warning-strip"><span>EAGLE-EYE SCANNER</span><i /><b>INTERACTIVE MAP</b><button onClick={fire}>SCAN THE CITY</button></div>
      <div className="world-selector reveal">
        <div className="world-tabs" role="tablist" aria-label="Project worlds">
          {projects.map((m, i) => <button role="tab" aria-selected={selected === i} className={selected === i ? 'active' : ''} key={m.id || m.no} onClick={() => setSelected(i)}><span>MISSION {String(i + 1).padStart(2, '0')}</span><b>{m.name}</b><small>{m.type}</small></button>)}
        </div>
        <article className="world-readout" aria-live="polite">
          <span>DESTINATION / {String(selected + 1).padStart(2, '0')}</span>
          <h3>{projects[selected].name}</h3>
          <p>{projects[selected].body}</p>
          <dl className="case-details"><dt>Challenge</dt><dd>{projects[selected].challenge}</dd><dt>Approach</dt><dd>{projects[selected].approach}</dd><dt>Outcome</dt><dd>{projects[selected].result}</dd></dl><a className="project-link" href={projects[selected].url || '#contact'}>VIEW PROJECT ↗</a><div>{(Array.isArray(projects[selected].tech) ? projects[selected].tech : []).map((x) => <i key={x}>{x}</i>)}</div>
        </article>
      </div>
    </section>
  );
}

function GameDev() {
  return (
    <section className="scene scene-game" id="experience" data-scene="3">
      <SectionIndex no="03" label="THE GUILD" />
      <div className="section-copy reveal narrow">
        <p className="eyebrow">EXPERIENCE / INDEPENDENT PRACTICE</p>
        <h2>TECHNICAL THINKING.<br /><em>HUMAN UNDERSTANDING.</em></h2>
        <p>A practice built across technical SEO, credible content and growth. I work across the connected layers that influence discovery, relevance and conversion.</p>
      </div>
      <div className="lab-readouts reveal">
        <article><span>01 / PRESENT</span><b>INDEPENDENT SEO PRACTICE</b><p>Technical audits, keyword mapping, strategy, implementation and reporting — without agency hand-offs.</p></article>
        <article><span>02 / SPECIALIST MARKETS</span><b>B2B CONTENT & SEARCH</b><p>Product and category architecture for manufacturing, engineering and technical buyers.</p></article>
        <article><span>03 / IMPLEMENTATION</span><b>SEO-FIRST SITE QUALITY</b><p>Semantic HTML, metadata, canonicals, structured data and performance-conscious frontend work.</p></article>
        <article><span>04 / PUBLISHING</span><b>PRACTICAL SEO RESEARCH</b><p>40+ articles across search-led and knowledge topics, with practical frameworks shared on Medium.</p></article>
      </div>
    </section>
  );
}

function FullStack() {
  const [node, setNode] = useState(0);
  const fallbackNodes = [["TECHNICAL SEO", "Crawl · Index · Core Web Vitals", "Crawl analysis, indexation, internal linking, structured data and technical diagnostics."], ["ON-PAGE SEO", "Intent · Relevance · Structure", "Titles, descriptions, headings and page-level search intent optimisation."], ["KEYWORD RESEARCH", "Demand · Gaps · Priority", "Prioritised keyword maps, clusters, competitive gaps and opportunity validation."], ["CONTENT STRATEGY", "Architecture · Briefs · Topics", "Useful content systems for technical buyers, long sales cycles and specialist markets."], ["LINK BUILDING", "Outreach · Authority · Relevance", "Targeted editorial outreach built around relevance and topical authority."], ["SEARCH ANALYTICS", "GSC · GA4 · Insights", "Search Console and GA4 analysis that turns movement into actionable next steps."], ["LOCAL SEO", "GBP · Maps · Local intent", "Google Business Profile, citations and location-focused content systems."], ["B2B / B2C / D2C SEO", "Products · Buyers · Expertise", "Search strategy for manufacturing, engineering and technical product environments."]];
  const records = usePublicRecords('/api/services', []);
  const nodes = records.length ? records.map((service) => [service.name, service.tagline, service.description]) : fallbackNodes;
  useEffect(() => { if (node >= nodes.length) setNode(0); }, [node, nodes.length]);
  return (
    <section className="scene scene-stack" id="services" data-scene="4">
      <SectionIndex no="04" label="THE WORKSHOP" />
      <div className="section-copy reveal stack-title">
        <p className="eyebrow">SERVICES / CONNECTED SEARCH DISCIPLINES</p>
        <h2>FOCUSED HELP.<br /><em>REAL SEARCH PROBLEMS.</em></h2>
        <p>Start with one search problem or connect the whole system. Select a service to explore how I help.</p>
      </div>
      <div className="architecture reveal">
        <div className="arch-nodes">
          {nodes.map((n, i) => <button className={node === i ? 'active' : ''} key={n[0]} onMouseEnter={() => setNode(i)} onFocus={() => setNode(i)} onClick={() => setNode(i)}><span>0{i + 1}</span><b>{n[0]}</b><small>{n[1]}</small></button>)}
        </div>
        <div className="arch-detail"><span>NODE / 0{node + 1}</span><h3>{nodes[node][0]}</h3><b>{nodes[node][1]}</b><p>{nodes[node][2]}</p></div>
      </div>
    </section>
  );
}

function CodeSection() {
  return (
    <section className="scene scene-code" id="process" data-scene="5">
      <SectionIndex no="05" label="THE LIBRARY" />
      <div className="section-copy reveal code-copy">
        <p className="eyebrow">PROCESS / DISCOVER TO GROW</p>
        <h2>FROM DISCOVERY<br /><em>TO QUALIFIED GROWTH.</em></h2>
        <p>Audit visibility. Analyse search data and competitors. Map intent. Improve technical foundations. Build useful content. Measure what leads to business outcomes.</p>
      </div>
      <div className="terminal reveal" aria-label="SEO workflow">
        <div><span>SEARCH.GROWTH</span><i>LIVE</i></div>
        <pre><em>01</em> DISCOVER  / audit search visibility{`\n`}<em>02</em> ANALYZE   / search data + competitors{`\n`}<em>03</em> STRATEGIZE / intent + content architecture{`\n`}<em>04</em> OPTIMIZE  / technical + on-page SEO{`\n`}<em>05</em> MEASURE   / relevance + qualified leads</pre>
      </div>
    </section>
  );
}

function Skills() {
  const [selected, setSelected] = useState(0);
  const fallbackSkills = skills;
  const liveSkills = usePublicRecords('/api/skills', []);
  const displaySkills = liveSkills.length ? liveSkills.map((skill) => [skill.name, skill.description]) : fallbackSkills;
  const positions = [[14,28],[30,13],[48,38],[71,16],[86,40],[70,70],[47,82],[24,71],[12,53],[40,57],[61,46],[82,60]];
  useEffect(() => { if (selected >= displaySkills.length) setSelected(0); }, [displaySkills.length, selected]);
  return (
    <section className="scene scene-skills" id="skills" data-scene="6">
      <SectionIndex no="06" label="THE OBSERVATORY" />
      <div className="section-copy reveal skills-copy">
        <p className="eyebrow">SKILL CONSTELLATION / CONNECTED CAPABILITIES</p>
        <h2>EVERY NODE<br /><em>CONNECTS.</em></h2>
        <p>Select a capability to see how it supports the work. My daily stack includes Search Console, GA4, Ahrefs, Semrush, Screaming Frog and PageSpeed Insights.</p>
      </div>
      <div className="skill-map reveal">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M14 28L30 13L48 38L71 16L86 40L70 70L47 82L24 71L12 53Z" />
          <path d="M30 13L47 82M48 38L86 40M14 28L70 70M71 16L24 71" />
        </svg>
        {displaySkills.map((s, i) => <button key={s[0]} className={`skill-node ${selected === i ? 'active' : ''}`} style={{ left: `${positions[i % positions.length][0]}%`, top: `${positions[i % positions.length][1]}%` }} onClick={() => setSelected(i)}><i /><span>{s[0]}</span></button>)}
        <div className="skill-readout"><span>SELECTED NODE</span><h3>{displaySkills[selected][0]}</h3><p>{displaySkills[selected][1]}</p></div>
      </div>
    </section>
  );
}

function Writing() {
 return <aside className="writing-section" id="writing"><p className="eyebrow">FIELD NOTES / WRITING</p><h2>I publish what I learn from doing the work.</h2><div className="writing-grid">{[
 ['How to Read Google Search Console Like an SEO — Not a Marketer','https://imgowtham.medium.com/how-to-read-google-search-console-like-an-seo-not-a-marketer-32d4e7397e83'],
 ["Crawl Budget Is Real — And You’re Probably Wasting It",'https://imgowtham.medium.com/crawl-budget-is-real-and-youre-probably-wasting-it-af97edfb1966'],
 ['The Keyword Research Process I Actually Use','https://medium.com/@imgowtham/the-keyword-research-process-i-actually-use-6a020ba783b8']
 ].map(([title,url])=><a key={url} href={url}><small>MEDIUM ↗</small><h3>{title}</h3></a>)}</div><a href="./blog.html">Explore the portfolio blog ↗</a></aside>;
}

function Signature() {
  return (
    <section className="scene scene-signature" id="signature" data-scene="7">
      <SectionIndex no="07" label="THE WATCHTOWER" />
      <div className="signature-lockup reveal">
        <p className="eyebrow">WORKING PRINCIPLE / ORGANIC GROWTH</p>
        <div><span>TECHNICAL SEO</span><span>CONTENT & SEARCH STRATEGY</span><span>B2B SEO SPECIALIST</span></div>
        <h2>RELEVANCE FIRST.<br />SOLID FOUNDATIONS.<br /><em>MEANINGFUL GROWTH.</em></h2>
      </div>
    </section>
  );
}

function Contact({ onTransmit }) {
  const [status, setStatus] = useState('');
  async function submit(e) {
    e.preventDefault();
    setStatus('TRANSMITTING...');
    const form = e.currentTarget;
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
      if (!response.ok) throw new Error('Transmission failed');
      form.reset();
      setStatus('TRANSMISSION SENT');
      onTransmit();
    } catch {
      setStatus('CHANNEL ERROR — USE DIRECT EMAIL LINK');
    }
  }
  return (
    <section className="scene scene-contact" id="contact" data-scene="8">
      <SectionIndex no="08" label="THE HIDDEN CHAMBER" />
      <div className="dock-copy reveal">
        <p className="eyebrow">FINAL MISSION / OPEN THE LEDGER</p>
        <h2>READY TO GROW<br /><em>YOUR SEARCH VISIBILITY?</em></h2>
        <p>Tell me where search is getting stuck, what you've already tried and what a useful outcome looks like. Available for selected projects in Coimbatore and beyond.</p>
        <div className="direct-links"><a href="mailto:iamgowthamsaravanakumar@gmail.com">EMAIL ↗</a><a href="https://www.linkedin.com/in/gowtham-now/" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="tel:+918668014466">VOICE ↗</a></div>
      </div>
      <form className="command-panel reveal" action="/api/contact" method="post" onSubmit={submit}>
        <div className="command-head"><span>CONTACT LEDGER</span><i>PROJECT ENQUIRY</i></div>
        <label><span>NAME</span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
        <label><span>EMAIL</span><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
        <label><span>WEBSITE / BUSINESS</span><input name="project" required placeholder="Your website or business" /></label>
        <label><span>MESSAGE</span><textarea name="message" rows="4" required placeholder="Your SEO goals and project details" /></label>
        <input className="honeypot" type="text" name="_honey" tabIndex="-1" autoComplete="off" aria-hidden="true" />
        <button type="submit">OPEN A PROJECT <i>↗</i></button>
        <p role="status" aria-live="polite">{status}</p>
      </form>
    </section>
  );
}

function Complete() {
  return (
    <section className="scene scene-complete" id="complete" data-scene="9">
      <div className="complete-lockup reveal">
        <p>WATCHTOWER PERSPECTIVE / ALL SYSTEMS VISIBLE</p>
        <h2>GOWTHAM<br /><em>SARAVANAKUMAR</em></h2>
        <div>SEO SPECIALIST <i>×</i> DIGITAL GROWTH STRATEGIST</div>
        <strong>CITY REVEALED</strong>
        <a href="#intro">RETURN TO THE GATE ↑</a>
      </div>
    </section>
  );
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminDashboard />;
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [fireSignal, setFireSignal] = useState(0);
  const [shakeSignal, setShakeSignal] = useState(0);
  const [portal, setPortal] = useState(false);
  const [audio, setAudio] = useState(false);
  const [cameraMode, setCameraMode] = useState('chase');
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const raf = useRef(0);
  useAudioSystem(audio);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reduced);
  }, [reduced]);

  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const p = Math.min(1, Math.max(0, scrollY / max));
        progressRef.current = p;
        setProgress(p);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    const sections = [...document.querySelectorAll('.scene')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number(visible.target.dataset.scene || 0));
    }, { threshold: [0.18, 0.42, 0.62], rootMargin: '-10% 0px -10% 0px' });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const contexts = [];
    document.querySelectorAll('.scene').forEach((scene) => {
      const ctx = gsap.context(() => {
        gsap.fromTo(scene.querySelectorAll('.reveal'),
          { y: reduced ? 18 : 70, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.09, duration: reduced ? 0.35 : 1.0, ease: 'power3.out', scrollTrigger: { trigger: scene, start: 'top 68%', end: 'top 30%', toggleActions: 'play none none reverse' } }
        );
      }, scene);
      contexts.push(ctx);
    });
    ScrollTrigger.refresh();
    return () => contexts.forEach((c) => c.revert());
  }, [reduced]);

  useEffect(() => {
    const fireKey = (e) => {
      if ((e.key.toLowerCase() === 'f') && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        e.preventDefault();
        fire();
      }
    };
    window.addEventListener('keydown', fireKey);
    return () => window.removeEventListener('keydown', fireKey);
  });

  function fire() {
    if (reduced) return;
    setFireSignal((x) => x + 1);
    setShakeSignal((x) => x + 1);
    setPortal(false);
  }

  function jump(id) {
    const target = document.getElementById(id);
    if (!target) return;
    if (!reduced) {
      setPortal(true);
      setTimeout(() => setPortal(false), 850);
      setShakeSignal((x) => x + 1);
    }
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function transmitFx() {
    setPortal(true);
    setShakeSignal((x) => x + 1);
    setTimeout(() => setPortal(false), 1050);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#about">Skip cinematic and open portfolio content</a>
      <BootSequence reduced={reduced} />
      <HistoricalWorld progress={progressRef} pointer={pointerRef} reduced={reduced} fireSignal={fireSignal} cameraMode={cameraMode} shakeSignal={shakeSignal} />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className={`portal-flash ${portal ? 'active' : ''}`} aria-hidden="true"><i /><b /></div>
      <Header active={active} jump={jump} />
      <Hud active={active} progress={progress} cameraMode={cameraMode} setCameraMode={setCameraMode} audio={audio} setAudio={setAudio} reduced={reduced} setReduced={setReduced} />
      <main>
        <Intro fire={fire} />
        <About />
        <Missions fire={fire} />
        <GameDev />
        <FullStack />
        <CodeSection />
        <Skills /><Writing />
        <Signature />
        <Contact onTransmit={transmitFx} />
        <Complete />
      </main>
      <div className="fire-hint" aria-hidden="true"><span>PRESS F</span><b>EAGLE-EYE SCAN</b></div>
    </div>
  );
}
