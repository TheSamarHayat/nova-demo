import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Check, Menu, Play, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RobotScene } from "@/components/nova/robot-scene";
import { ShowcaseScene } from "@/components/nova/showcase-scene";
import { ScrollProgress } from "@/components/nova/scroll-progress";
import { useNovaScroll } from "@/lib/nova-scroll";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "NOVA — Your AI Companion, Built for Tomorrow" },
      { name: "description", content: "Meet NOVA: an AI companion that learns, adapts and works beside you." },
      { property: "og:title", content: "NOVA — Your AI Companion, Built for Tomorrow" },
      { property: "og:description", content: "Meet NOVA: an AI companion that learns, adapts and works beside you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovaPage,
});

const features = [
  { title: "Learns your workflow", description: "Adapts to the way you think, create and get things done.", icon: "↗" },
  { title: "Responds instantly", description: "Real-time answers that keep your momentum moving.", icon: "ϟ" },
  { title: "Works everywhere", description: "A thoughtful companion across web, mobile and desktop.", icon: "◎" },
  { title: "Private by design", description: "Your work stays yours. Always.", icon: "⌑" },
];

const steps = [
  { number: "01", title: "Connect", description: "Link your tools in one click." },
  { number: "02", title: "Teach", description: "Show NOVA how you work." },
  { number: "03", title: "Automate", description: "Let NOVA take it from here." },
];

const lineup = [
  { name: "Helmet", descriptor: "A sharper perspective.", tag: "VISION" },
  { name: "Scout", descriptor: "Always one step ahead.", tag: "ADAPTIVE" },
  { name: "Voyager", descriptor: "Ready for what’s next.", tag: "EXPLORER" },
];

function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (progress >= 100) {
      const timer = window.setTimeout(() => setVisible(false), 450);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [progress]);
  return <AnimatePresence>{visible && <motion.div className="loading-screen" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}><span className="brand-mark">NOVA<span className="brand-dot" /></span><div className="loading-track"><motion.i animate={{ width: `${Math.max(4, progress)}%` }} /></div><span className="loading-value">{Math.round(progress)}%</span></motion.div>}</AnimatePresence>;
}

function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const links = [["Features", "features"], ["How it works", "how"], ["Showcase", "showcase"], ["Contact", "contact"]];
  const close = () => setOpen(false);
  return <>
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#hero" className="brand-mark" aria-label="NOVA home">NOVA<span className="brand-dot" /></a>
      <nav className="desktop-links" aria-label="Main navigation">{links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <Button className="nav-cta" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Get started <ArrowUpRight /></Button>
      <Button variant="ghost" size="icon" className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
    </header>
    <AnimatePresence>{open && <motion.nav className="mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} aria-label="Mobile navigation">
      {links.map(([label, id], index) => <motion.a key={id} href={`#${id}`} onClick={close} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }}>{label}<ArrowUpRight /></motion.a>)}
      <span className="mobile-menu-note">A little more capable, every day.</span>
    </motion.nav>}</AnimatePresence>
  </>;
}

function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    if (!dot || !ring) return;
    let x = 0, y = 0, rx = 0, ry = 0, frame = 0;
    const move = (event: PointerEvent) => { x = event.clientX; y = event.clientY; dot.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const animate = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; frame = requestAnimationFrame(animate); };
    const enter = (event: Event) => { if ((event.target as HTMLElement).closest("a,button,.lineup-panel")) ring.classList.add("cursor-active"); };
    const leave = () => ring.classList.remove("cursor-active");
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    frame = requestAnimationFrame(animate);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerover", enter); document.removeEventListener("pointerout", leave); cancelAnimationFrame(frame); };
  }, []);
  return <div className="custom-cursor" aria-hidden="true"><i className="cursor-dot" /><i className="cursor-ring" /></div>;
}

function Hero() {
  const reduced = useReducedMotion();
  return <section id="hero" data-nova-section className="hero-section section-wrap">
    <div className="hero-copy">
      <p className="eyebrow"><span className="eyebrow-spark"><Sparkles /></span> Meet NOVA <span className="eyebrow-rule" /> YOUR NEXT CHAPTER
      </p>
      <motion.h1 initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18 }}>
        Your AI companion,<br /><span className="gradient-ink">built for tomorrow.</span>
      </motion.h1>
      <motion.p className="hero-description" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.32 }}>NOVA learns, adapts and works beside you — in 3D, in real time.</motion.p>
      <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
        <Button className="primary-cta" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Get started <ArrowUpRight /></Button>
        <a className="watch-link" href="#showcase"><span className="play-icon"><Play /></span> Watch demo</a>
      </motion.div>
      <div className="hero-index"><span>01 / 05</span><i /><span>INTELLIGENCE, IN MOTION</span></div>
    </div>
    <div className="hero-coordinate" aria-hidden="true">37°46′49.3″N<br />122°25′09.7″W</div>
    <a href="#features" className="scroll-cue"><span>Scroll to explore</span><ArrowDown /></a>
    <div className="hero-ghost" aria-hidden="true">N</div>
  </section>;
}

function Features() {
  const progress = useNovaScroll((state) => state.sectionProgress);
  const active = Math.min(3, Math.floor(progress * 4));
  return <section id="features" data-nova-section className="features-section section-wrap">
    <div className="section-kicker"><span>01 — THE DIFFERENCE</span><span>INTELLIGENCE, WITH INTENTION</span></div>
    <div className="features-layout">
      <div className="features-intro"><p className="eyebrow">More than a tool</p><h2>A little more<br />human, <span className="gradient-ink">by design.</span></h2><p className="section-description">Less prompting. More progress. NOVA makes space for the work only you can do.</p><div className="feature-pagination"><span>0{active + 1}</span><i /><span>04</span></div></div>
      <div className="feature-detail-wrap"><AnimatePresence mode="wait"><motion.article key={active} className="feature-detail" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}><span className="feature-symbol">{features[active]?.icon}</span><span className="feature-count">0{active + 1} / 04</span><h3>{features[active]?.title}</h3><p>{features[active]?.description}</p></motion.article></AnimatePresence>
        <div className="feature-list">{features.map((feature, index) => <div key={feature.title} className={`feature-list-item ${active === index ? "active" : ""}`}><span>0{index + 1}</span><i /><b>{feature.title}</b></div>)}</div>
      </div>
    </div>
    <div className="feature-scroll-progress"><i style={{ transform: `scaleX(${(active + 1) / 4})` }} /></div>
  </section>;
}

function Marquee() {
  const reduced = useReducedMotion();
  return <div className={`marquee-band ${reduced ? "is-static" : ""}`} aria-label="AI, 3D, real time, future"><div className="marquee-track">{Array.from({ length: 4 }, (_, index) => <span key={index}>AI <i>✳</i> 3D <i>✳</i> REAL-TIME <i>✳</i> FUTURE <i>✳</i> PERSONAL <i>✳</i></span>)}</div></div>;
}

function HowItWorks() {
  const progress = useNovaScroll((state) => state.sectionProgress);
  const active = Math.min(2, Math.floor(progress * 3.01));
  return <section id="how" data-nova-section className="how-section section-wrap">
    <div className="section-kicker"><span>02 — YOUR NEW RHYTHM</span><span>THREE SMALL STEPS. A BIG SHIFT.</span></div>
    <div className="how-heading"><p className="eyebrow">Easy by nature</p><h2>From first hello<br />to <span className="gradient-ink">fully in sync.</span></h2></div>
    <div className="how-steps"><div className="step-rail"><i style={{ transform: `scaleY(${Math.max(0.08, progress)})` }} /></div>{steps.map((step, index) => <motion.article key={step.number} className={`how-step ${index <= active ? "is-active" : ""}`} animate={{ opacity: index <= active ? 1 : 0.44, x: index <= active ? 0 : 12 }} transition={{ duration: 0.35 }}><span className="step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div><ArrowDownRight className="step-arrow" /></motion.article>)}</div>
    <div className="how-footnote"><span>BUILT AROUND YOUR FLOW</span><span>NO MANUAL. NO FRICTION.</span></div>
  </section>;
}

function Showcase() {
  const [active, setActive] = useState(0);
  const mobile = useIsMobile();
  return <section id="showcase" data-nova-section className="showcase-section section-wrap">
    <div className="section-kicker"><span>03 — MEET THE LINEUP</span><span>A FORM FOR EVERY FRONTIER</span></div>
    <div className="showcase-heading"><div><p className="eyebrow">Explore the lineup</p><h2>Made for the<br /><span className="gradient-ink">way forward.</span></h2></div><p className="section-description">A closer look at the details behind your next favorite collaborator.</p></div>
    <div className="showcase-stage"><ShowcaseScene activeModel={active} mobile={mobile} /><div className="showcase-model-labels">{lineup.map((item, index) => <div key={item.name} className={`model-label ${active === index ? "is-active" : ""}`}><span>0{index + 1}</span><b>{item.name}</b></div>)}</div></div>
    <div className="lineup-panels" onMouseLeave={() => { if (!mobile) setActive(0); }}>{lineup.map((item, index) => <button type="button" key={item.name} className={`lineup-panel ${active === index ? "is-active" : ""}`} onMouseEnter={() => { if (!mobile) setActive(index); }} onFocus={() => setActive(index)} onClick={() => setActive(index)} aria-pressed={active === index}><span className="panel-tag">{item.tag}</span><span className="panel-number">0{index + 1}</span><div className="panel-content"><h3>{item.name}</h3><p>{item.descriptor}</p></div><ArrowUpRight className="panel-arrow" /></button>)}</div>
    <div className="showcase-bottomline"><span>THOUGHTFULLY BUILT. ALWAYS BECOMING.</span><span>SCROLL TO MEET THE REST <ArrowDown /></span></div>
  </section>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <section id="contact" data-nova-section className="contact-section section-wrap">
    <div className="section-kicker"><span>04 — THE NEXT MOVE</span><span>LET’S MAKE IT HAPPEN</span></div>
    <div className="contact-grid"><div className="contact-copy"><p className="eyebrow">Your future, in good company</p><h2>Ready to meet<br /><span className="gradient-ink">NOVA?</span></h2><p className="section-description">The best work happens when you have the right partner. Let’s start there.</p></div>
      <form className="contact-form" onSubmit={handleSubmit}><div className="form-heading"><span>01 / LET’S TALK</span><span>ALL FIELDS REQUIRED</span></div><label>Your name<input name="name" autoComplete="name" placeholder="How should we call you?" required /></label><label>Your email<input type="email" name="email" autoComplete="email" placeholder="you@somewhere.com" required /></label><label>What’s on your mind?<textarea name="message" placeholder="Tell us a little about it…" rows={3} required /></label><Button type="submit" className="send-button">{sent ? <>Message noted <Check /></> : <>Send a note <ArrowRight /></>}</Button>{sent && <p className="success-message" role="status">Thanks for reaching out. NOVA is looking forward to it.</p>}<p className="form-disclaimer">Demo form — your note is not sent to a server.</p></form>
    </div>
    <footer className="site-footer"><a href="#hero" className="brand-mark">NOVA<span className="brand-dot" /></a><span className="footer-note">A MORE THOUGHTFUL KIND OF INTELLIGENCE.</span><div className="footer-links"><a href="#features">Features</a><a href="#showcase">Showcase</a><a href="#contact">Contact</a></div><span className="footer-copy">© 2026 NOVA. DEMO PROJECT.</span><span className="footer-credit">3D: Tomás Laulhé · PixelMannen / tomkranis · Pixor · DigitalSpace Corp.</span></footer>
  </section>;
}

function NovaPage() {
  const [webglAvailable, setWebglAvailable] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebglAvailable(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebglAvailable(false);
    }
  }, []);
  return <main className="nova-app">
    <ScrollProgress />
    <div className="site-atmosphere" aria-hidden="true"><i /><i /><i /></div>
    {webglAvailable && <div className="scene-layer" aria-hidden="true"><Canvas camera={{ position: [0, 0.25, 6], fov: 38 }} dpr={[1, 1.7]} gl={{ alpha: true, antialias: true }}><Suspense fallback={null}><RobotScene /></Suspense></Canvas></div>}
    <SiteNav />
    <Hero /><Features /><Marquee /><HowItWorks /><Showcase /><Contact />
    <CustomCursor /><LoadingScreen />
  </main>;
}