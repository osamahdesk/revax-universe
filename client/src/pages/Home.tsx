/* Lumina — مرصد الضوء السائل: الفيديو هو المشهد، والعناصر التحريرية زجاجية ودقيقة. */
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Music2,
  Play,
  Twitter,
  Youtube,
} from "lucide-react";

type NetworkQuality = "excellent" | "fair" | "weak" | "unknown";

const socialLinks = [
  { label: "Instagram @0r.ei", icon: Instagram, href: "https://www.instagram.com/0r.ei/" },
];

const footerColumns = [
  {
    title: "Discover",
    links: ["Labs & Workshops", "Deep Dive Series", "Global Circle", "Resource Vault", "Future Roadmap"],
  },
  {
    title: "The Mission",
    links: ["Origin Story", "The Collective", "Newsroom Hub", "Join the Team"],
  },
  {
    title: "Concierge",
    links: ["Get in Touch", "Legal Privacy", "User Agreement", "Report Concern"],
  },
];

const highlights = [
  { title: "Orbital stories", image: "/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg", revealImage: "/manus-storage/lumina-aurora-data_0db24b30.jpg" },
  { title: "Weather systems", image: "/manus-storage/lumina-aurora-data_0db24b30.jpg", revealImage: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg" },
  { title: "Farther horizons", image: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg", revealImage: "/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg" },
];

const observationScenes = [
  { index: "01", kicker: "ORBITAL STUDY / 01", title: "Watch what gathers beyond the horizon.", body: "A slow field guide to the forces that shape our shared sky. Scroll to move through the signal.", image: "/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg", revealImage: "/manus-storage/lumina-aurora-data_0db24b30.jpg", note: "PERIGEE / 42.8°" },
  { index: "02", kicker: "ATMOSPHERIC STUDY / 02", title: "The atmosphere keeps its own time.", body: "Trace the quiet movement of weather, light, and pressure as one continuous observation.", image: "/manus-storage/lumina-aurora-data_0db24b30.jpg", revealImage: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg", note: "AURORA / ACTIVE" },
  { index: "03", kicker: "DEEP FIELD / 03", title: "Clarity begins where the familiar ends.", body: "One final turn of the lens. Leave with a wider frame for the things still becoming visible.", image: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg", revealImage: "/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg", note: "ECLIPSE / 03:17" },
  { index: "04", kicker: "ECLIPSE THRESHOLD / 04", title: "The dark edge makes the signal visible.", body: "Orbit resolves into eclipse: a measured crossing where shadow becomes another kind of light.", image: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg", revealImage: "/manus-storage/lumina-aurora-data_0db24b30.jpg", note: "UMBRA / 04:12" },
  { index: "05", kicker: "SIGNAL CONVERGENCE / 05", title: "Everything visible leaves a trace.", body: "The lens closes gently: atmosphere, orbit, and shadow converge into one readable signal.", image: "/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg", revealImage: "/manus-storage/lumina-eclipse-reflection_cf7e4c0a.jpg", note: "SIGNAL / LOCKED" },
];

function sceneImageOpacity(index: number, progress: number) {
  const start = index / observationScenes.length;
  const end = (index + 1) / observationScenes.length;
  const fade = 0.09;
  return Math.max(0, Math.min(1, (progress - (start - fade)) / fade, ((end + fade) - progress) / fade));
}

function CursorRevealCard({ item, index }: { item: (typeof highlights)[number]; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const pending = useRef({ x: 50, y: 50 });
  const frame = useRef(0);

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pending.current = {
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    };
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (card) {
          card.style.setProperty("--cursor-x", `${pending.current.x}%`);
          card.style.setProperty("--cursor-y", `${pending.current.y}%`);
        }
        frame.current = 0;
      });
    }
  };

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  return (
    <a ref={cardRef} href="#lumina-footer" data-cursor="explore" onPointerMove={handlePointerMove} className="cursor-reveal-card liquid-glass group relative h-24 min-w-44 overflow-hidden rounded-2xl border border-[#a8e8ff]/20 bg-white/5 sm:h-28 sm:min-w-52 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" style={{ "--cursor-x": "50%", "--cursor-y": "50%" } as React.CSSProperties}>
      <img src={item.image} alt="" className="cursor-reveal-card__image absolute inset-0 h-full w-full object-cover" />
      <img src={item.revealImage} alt="" className="cursor-reveal-card__reveal absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-xs text-white"><span>{item.title}</span><span className="text-[10px] tracking-widest text-[#a8e8ff]/80">0{index + 1}</span></span>
      <span className="cursor-reveal-card__hint">MOVE TO REVEAL</span>
    </a>
  );
}

function ScrollStory({ videoRef, motionEnabled }: { videoRef: React.RefObject<HTMLVideoElement | null>; motionEnabled: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const targetProgress = useRef(0);
  const smoothedProgress = useRef(0);
  const lastVideoTime = useRef(-1);
  const lastVideoSyncAt = useRef(0);
  const renderedProgress = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointerPoint = useRef({ x: 50, y: 50 });
  const pointerFrame = useRef(0);
  const activeScene = Math.min(observationScenes.length - 1, Math.floor(progress * observationScenes.length));
  const scene = observationScenes[activeScene];

  const handlePanelPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerPoint.current = {
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    };
    if (!pointerFrame.current) {
      pointerFrame.current = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (panel) {
          panel.style.setProperty("--cursor-x", `${pointerPoint.current.x}%`);
          panel.style.setProperty("--cursor-y", `${pointerPoint.current.y}%`);
        }
        pointerFrame.current = 0;
      });
    }
  };

  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();

    const readTarget = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Use the whole page as the timeline so the first downward gesture starts frame 0 immediately.
      targetProgress.current = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    };

    const syncVideo = (displayProgress: number, now: number) => {
      const video = videoRef.current;
      const reducedMotion = !motionEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!video || reducedMotion || video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) return;
      // Seeking a compressed video on every scroll event causes decoder contention. Cap seeks to 30fps.
      if (now - lastVideoSyncAt.current < 33) return;
      const nextTime = displayProgress * video.duration;
      if (Math.abs(nextTime - lastVideoTime.current) > 0.028) {
        if (!video.paused) video.pause();
        video.currentTime = nextTime;
        lastVideoTime.current = nextTime;
        lastVideoSyncAt.current = now;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const reducedMotion = !motionEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const smoothing = reducedMotion ? 1 : 1 - Math.exp(-dt * 11);
      smoothedProgress.current += (targetProgress.current - smoothedProgress.current) * smoothing;
      const displayProgress = smoothedProgress.current;
      if (Math.abs(displayProgress - renderedProgress.current) > 0.0012) {
        renderedProgress.current = displayProgress;
        setProgress(displayProgress);
      }
      syncVideo(displayProgress, now);

      if (Math.abs(targetProgress.current - displayProgress) < 0.00035) {
        smoothedProgress.current = targetProgress.current;
        renderedProgress.current = targetProgress.current;
        setProgress(targetProgress.current);
        syncVideo(targetProgress.current, now);
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onResize = () => { readTarget(); onScroll(); };
    readTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [videoRef, motionEnabled]);

  return (
    <section ref={sectionRef} id="scroll-story" className="relative h-[330vh] w-full" aria-label="Lumina observation sequence">
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div ref={panelRef} onPointerMove={handlePanelPointerMove} className="reveal-panel relative isolate flex min-h-[72vh] w-full items-center overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#050912]/55 px-6 py-12 shadow-[0_0_90px_rgba(75,168,220,0.08)] backdrop-blur-[2px] sm:px-10 md:px-16" style={{ "--cursor-x": "50%", "--cursor-y": "50%", transform: `perspective(1400px) rotateX(${(0.5 - progress) * 1.5}deg)` } as React.CSSProperties}>
          <div className="lens-field pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_48%,transparent_0,rgba(2,7,16,0.1)_35%,rgba(2,7,16,0.88)_100%)]" aria-hidden="true" />
          {observationScenes.map((item, index) => <div key={item.index} className="reveal-scene absolute inset-0" style={{ opacity: sceneImageOpacity(index, progress) }}><img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center will-change-transform" style={{ transform: `scale(${1.04 - sceneImageOpacity(index, progress) * 0.04}) translate3d(${(progress - 0.5) * (index === 1 ? -24 : 18)}px, ${(progress - 0.5) * (index + 1) * 14}px, 0)` }} /><img src={item.revealImage} alt="" className="reveal-scene__image absolute inset-0 h-full w-full object-cover object-center" style={{ transform: `scale(${1.04 - sceneImageOpacity(index, progress) * 0.04}) translate3d(${(progress - 0.5) * (index === 1 ? -24 : 18)}px, ${(progress - 0.5) * (index + 1) * 14}px, 0)` }} /></div>)}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050912]/95 via-[#050912]/45 to-transparent" aria-hidden="true" />
          <div className="motion-scanline pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#a8e8ff]/30" style={{ transform: `translateY(${(progress - 0.5) * 220}px)` }} aria-hidden="true" />
          <div className="orbital-sweep pointer-events-none absolute -right-1/4 top-1/2 h-[125%] w-3/4 rounded-[50%] border border-[#a8e8ff]/15" style={{ transform: `translate3d(${(progress - 0.5) * -80}px, ${(progress - 0.5) * 36}px, 0) rotate(${(progress - 0.5) * 9}deg)`, opacity: activeScene === 3 ? 0.55 + Math.max(0, (progress - 0.7) / 0.3) * 0.3 : 0.55 }} aria-hidden="true" />
          <div className="eclipse-veil pointer-events-none absolute inset-0" style={{ opacity: activeScene >= 3 ? Math.max(0, (progress - 0.62) / 0.38) : 0, transform: `scale(${1 + Math.max(0, progress - 0.62) * 0.12})` }} aria-hidden="true" />
          <div className="scene-transition-wash pointer-events-none absolute inset-0" style={{ opacity: activeScene === 4 ? Math.max(0, (progress - 0.82) / 0.18) : 0 }} aria-hidden="true" />
          <div className="observatory-metrics pointer-events-none absolute right-6 top-6 z-10 hidden text-right md:block" aria-hidden="true"><span>LIVE ARRAY / 05</span><strong>{Math.round(progress * 100)}%</strong><small>{activeScene === 4 ? "SIGNAL CONVERGENCE" : "ATMOSPHERIC INDEX"}</small></div>

          <div className="relative z-10 grid w-full grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:items-end">
            <div className="max-w-xl will-change-transform" style={{ opacity: 0.98, transform: `translate3d(${(progress - activeScene / observationScenes.length) * -22}px, 0, 0)` }}>
              <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-[#a8e8ff]"><span className="h-px w-10 bg-[#a8e8ff]" /> {scene.kicker}</p>
              <h2 className="max-w-lg text-4xl font-medium leading-[0.96] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl">{scene.title}</h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">{scene.body}</p>
              <div className="mt-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-white/45"><span className="text-[#a8e8ff]">{scene.note}</span><span className="h-px w-12 bg-white/20" /><span>Scroll / scrub</span></div>
            </div>

            <div className="flex items-end justify-between gap-6 md:block"><div className="mb-5 text-right text-[10px] uppercase tracking-[0.22em] text-white/40 md:text-left">Sequence / 05</div><div className="flex items-center gap-3 md:block"><div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-white/15 md:h-32 md:w-px md:rounded-none"><div className="absolute left-0 top-0 h-full bg-[#a8e8ff] transition-[width] duration-150 md:bottom-0 md:left-0 md:top-auto md:h-auto md:w-full md:transition-[height]" style={{ width: `${progress * 100}%`, height: undefined }} /></div><div className="text-3xl font-light tracking-[-0.06em] text-white/85">{scene.index}<span className="text-sm text-white/30"> / 05</span></div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContextCursor() {
  const [position, setPosition] = useState({ x: -80, y: -80 });
  const [mode, setMode] = useState<"scroll" | "explore" | "play" | "open">("scroll");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const context = target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      setMode(context === "play" || context === "explore" || context === "open" ? context : "scroll");
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const label = mode === "play" ? "Play" : mode === "explore" ? "Explore" : mode === "open" ? "Open" : "Scroll";
  return (
    <div className={`context-cursor ${visible ? "is-visible" : ""} context-cursor--${mode}`} style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }} aria-hidden="true">
      <span className="context-cursor__core" />
      <span className="context-cursor__label">{label}</span>
    </div>
  );
}

function ScrollCue() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.max(0, Math.min(1, window.scrollY / maxScroll)));
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <div className="scroll-cue liquid-glass" style={{ opacity: Math.max(0, 1 - progress * 8), transform: `translate3d(0, ${progress * -18}px, 0)` }} aria-hidden="true">
      <span className="scroll-cue__line" />
      <span className="scroll-cue__label">Scroll</span>
      <span className="scroll-cue__arrow">↓</span>
    </div>
  );
}

function RevaxMark({ className = "" }: { className?: string }) {
  return <span className={`revax-mark ${className}`} aria-hidden="true"><span className="revax-mark__core" /><span className="revax-mark__orbit revax-mark__orbit--one" /><span className="revax-mark__orbit revax-mark__orbit--two" /></span>;
}

function Sparkline({ values, tone = "cyan" }: { values: number[]; tone?: "cyan" | "violet" | "white" | "green" | "amber" | "red" }) {
  const width = 104;
  const height = 26;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.length < 2 ? `${width / 2},${height / 2}` : values.map((value, index) => `${(index / (values.length - 1)) * width},${height - ((value - min) / range) * (height - 4) - 2}`).join(" ");
  return <svg className={`telemetry-sparkline telemetry-sparkline--${tone}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Live metric trend"><polyline points={points} fill="none" vectorEffect="non-scaling-stroke" /></svg>;
}

function SceneRail({ onSelect }: { onSelect: (index: number) => void }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = () => { const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); setActive(Math.min(observationScenes.length - 1, Math.floor((window.scrollY / maxScroll) * observationScenes.length))); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <nav className="scene-rail" aria-label="Observation scenes"><span className="scene-rail__line" /><span className="scene-rail__label">SIGNAL INDEX</span>{observationScenes.map((scene, index) => <button key={scene.index} type="button" data-cursor="explore" className={`scene-rail__item ${active === index ? "is-active" : ""}`} onClick={() => onSelect(index)} aria-label={`Open scene ${scene.index}`}><span>{scene.index}</span><em>{scene.kicker.split(" / ")[0]}</em></button>)}</nav>;
}

function CommandCenter({ open, onClose, onJump }: { open: boolean; onClose: () => void; onJump: (index: number) => void }) {
  const [query, setQuery] = useState("");
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  if (!open) return null;
  const term = query.toLowerCase().trim();
  const matches = observationScenes.map((scene, index) => ({ scene, index })).filter(({ scene }) => `${scene.kicker} ${scene.title} ${scene.note}`.toLowerCase().includes(term));
  return <div className="command-center__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="command-center liquid-glass" role="dialog" aria-modal="true" aria-labelledby="command-center-title"><div className="command-center__top"><span>REVAX / COMMAND CENTER</span><button type="button" onClick={onClose} aria-label="Close command center">×</button></div><h2 id="command-center-title">Find a signal.</h2><p>Jump directly into an observation, study, or atmospheric trace.</p><label className="command-center__input"><span>/</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the archive" /></label><div className="command-center__results">{matches.length ? matches.map(({ scene, index }) => <button type="button" key={scene.index} data-cursor="open" onClick={() => { onJump(index); onClose(); }}><span className="command-center__index">{scene.index}</span><span><strong>{scene.title}</strong><small>{scene.kicker} · {scene.note}</small></span><ArrowUpRight size={15} /></button>) : <span className="command-center__empty">No signal matched that query.</span>}</div><div className="command-center__hint"><span>ENTER TO OPEN</span><span>ESC TO CLOSE</span></div></section></div>;
}

function LuminaSvgMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
    </svg>
  );
}

export default function Home() {
  const deviceProfile = useMemo(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const constrained = compact || Boolean(connection?.saveData) || deviceMemory <= 4 || navigator.hardwareConcurrency <= 4;
    return { name: constrained ? (compact ? "MOBILE / EFFICIENT" : "DESKTOP / CONSERVED") : "DESKTOP / HIGH FIDELITY", constrained, minSpeed: constrained ? 2 : 5, source: constrained ? "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4" : "/manus-storage/lumina-scroll-sequence-4k_d765b587.webm", type: constrained ? "video/mp4" : "video/webm" };
  }, []);
  const [networkNotice, setNetworkNotice] = useState<"weak" | "offline" | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<"loading" | "ready" | "error">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [telemetry, setTelemetry] = useState({ buffered: 0, speed: "—", speedValue: 0, ready: "0/4", edge: "CONNECTING", link: "—", latency: "—", quality: "unknown" as NetworkQuality });
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState({ buffer: [] as number[], speed: [] as number[], latency: [] as number[] });
  const videoInitialized = useRef(false);
  const isReady = videoState === "ready";
  const loaderPercent = Math.max(8, loadProgress);
  const loaderStage = videoState === "error" ? "SIGNAL RETRY" : loaderPercent < 34 ? "CALIBRATING LENS" : loaderPercent < 78 ? "LOCKING SATELLITE" : "SIGNAL READY";
  const jumpToScene = (index: number) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * (index / observationScenes.length), behavior: motionEnabled ? "smooth" : "auto" });
  };

  useEffect(() => {
    let timer = 0;
    const measure = () => {
      const video = videoRef.current;
      if (!video) return;
      const buffered = video.buffered.length && Number.isFinite(video.duration) && video.duration > 0 ? Math.round((video.buffered.end(video.buffered.length - 1) / video.duration) * 100) : 0;
      const resource = performance.getEntriesByName(video.currentSrc).find((entry) => entry instanceof PerformanceResourceTiming) as PerformanceResourceTiming | undefined;
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
      const speedValue = resource?.decodedBodySize && resource.duration > 0 ? resource.decodedBodySize * 8 / resource.duration / 1000 : connection?.downlink ?? 0;
      const latencyValue = resource?.responseStart ? Math.round(resource.responseStart) : 0;
      const speed = speedValue ? `${speedValue.toFixed(1)} Mbps` : "—";
      const quality: NetworkQuality = !navigator.onLine || videoState === "error" ? "weak" : speedValue >= deviceProfile.minSpeed && video.readyState >= 3 ? "excellent" : speedValue >= deviceProfile.minSpeed / 2 ? "fair" : "unknown";
      setTelemetry({ buffered, speed, speedValue, ready: `${video.readyState}/4`, edge: videoState === "error" ? "OFFLINE" : videoState === "ready" ? "ONLINE" : "CONNECTING", link: connection?.effectiveType?.toUpperCase() ?? "—", latency: latencyValue ? `${latencyValue} ms` : "—", quality });
      setTelemetryHistory((previous) => ({ buffer: [...previous.buffer, buffered].slice(-24), speed: [...previous.speed, speedValue].slice(-24), latency: [...previous.latency, latencyValue].slice(-24) }));
      timer = window.setTimeout(measure, 700);
    };
    measure();
    return () => window.clearTimeout(timer);
  }, [videoState, deviceProfile]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) { event.preventDefault(); setCommandOpen(true); }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const quality = telemetry.quality;
    if (quality === "weak" && navigator.onLine) setNetworkNotice("weak");
    else if (!navigator.onLine) setNetworkNotice("offline");
    else setNetworkNotice(null);
    if (quality !== "weak" && navigator.onLine) return;
    const timer = window.setTimeout(() => setNetworkNotice(null), 5200);
    return () => window.clearTimeout(timer);
  }, [telemetry.quality]);

  useEffect(() => {
    if (!legalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLegalOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [legalOpen]);

  const handleVideoProgress = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!video.buffered.length || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setLoadProgress(Math.min(100, Math.round((bufferedEnd / video.duration) * 100)));
  };

  const handleVideoReady = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.pause();
    if (!videoInitialized.current) {
      video.currentTime = 0;
      videoInitialized.current = true;
    }
    setLoadProgress(100);
    setVideoState("ready");
  };

  return (
    <main className={`relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white ${motionEnabled ? "" : "motion-paused"} ${accessibilityMode ? "accessibility-mode" : ""}`}>
      <ContextCursor />
      <ScrollCue />
      <SceneRail onSelect={jumpToScene} />
      <button type="button" data-cursor="open" className="command-trigger liquid-glass" onClick={() => setCommandOpen(true)} aria-label="Open Command Center"><span>⌘ /</span> Explore</button>
      <CommandCenter open={commandOpen} onClose={() => setCommandOpen(false)} onJump={jumpToScene} />
      <button type="button" data-cursor="open" className="motion-toggle liquid-glass" onClick={() => setMotionEnabled((value) => !value)} aria-pressed={motionEnabled}><span className="motion-toggle__dot" /> {motionEnabled ? "Motion on" : "Motion off"}</button><button type="button" data-cursor="open" className="accessibility-toggle liquid-glass" onClick={() => setAccessibilityMode((value) => !value)} aria-pressed={accessibilityMode}>A11y {accessibilityMode ? "on" : "off"}</button>
      <button type="button" data-cursor="open" className="telemetry-trigger liquid-glass" onClick={() => setTelemetryOpen((value) => !value)} aria-expanded={telemetryOpen}><span className="telemetry-trigger__pulse" /> Telemetry <span className="telemetry-trigger__chevron">{telemetryOpen ? "−" : "+"}</span></button>
      {networkNotice && <div className={`network-notice network-notice--${networkNotice}`} role="status" aria-live="polite"><span className="network-notice__signal" /><div><strong>{networkNotice === "offline" ? "Signal interrupted" : "Connection reduced"}</strong><small>{networkNotice === "offline" ? "Waiting for the network to return." : `REVAX switched to ${deviceProfile.name} for a smoother view.`}</small></div><button type="button" onClick={() => setNetworkNotice(null)} aria-label="Dismiss connection notice">×</button></div>}
      {telemetryOpen && <aside className={`telemetry-panel telemetry-panel--${telemetry.quality} liquid-glass`} aria-label="Live telemetry"><div className="telemetry-panel__head"><span>REVAX / LIVE TELEMETRY</span><button type="button" onClick={() => setTelemetryOpen(false)} aria-label="Close telemetry">×</button></div><p className="telemetry-panel__state"><span className={`telemetry-panel__status telemetry-panel__status--${telemetry.edge.toLowerCase()}`} /> {telemetry.edge === "ONLINE" ? "Signal locked" : telemetry.edge === "OFFLINE" ? "Signal unavailable" : "Synchronizing signal"}</p><div className={`telemetry-quality telemetry-quality--${telemetry.quality}`}><span className="telemetry-quality__dot" /><strong>{telemetry.quality === "excellent" ? "Excellent connection" : telemetry.quality === "fair" ? "Stable connection" : telemetry.quality === "weak" ? "Weak connection" : "Measuring connection"}</strong><small>{telemetry.quality === "excellent" ? "High bandwidth / ready for 4K" : telemetry.quality === "fair" ? "Moderate bandwidth / adaptive" : telemetry.quality === "weak" ? "Low bandwidth / conserve motion" : "Waiting for live samples"}</small></div><div className="telemetry-panel__grid"><div><small>BUFFER</small><strong>{telemetry.buffered}%</strong><Sparkline values={telemetryHistory.buffer} tone={telemetry.quality === "excellent" ? "green" : telemetry.quality === "fair" ? "amber" : telemetry.quality === "weak" ? "red" : "cyan"} /></div><div><small>READY STATE</small><strong>{telemetry.ready}</strong><span className="telemetry-meter"><span style={{ width: `${(Number(telemetry.ready.split("/")[0]) / 4) * 100}%` }} /></span></div><div><small>DOWNLOAD</small><strong>{telemetry.speed}</strong><Sparkline values={telemetryHistory.speed} tone={telemetry.quality === "excellent" ? "green" : telemetry.quality === "fair" ? "amber" : telemetry.quality === "weak" ? "red" : "violet"} /></div><div><small>NETWORK</small><strong>{telemetry.link}</strong><span className="telemetry-bars"><i /><i /><i /><i /><i /></span></div><div><small>RESPONSE</small><strong>{telemetry.latency}</strong><Sparkline values={telemetryHistory.latency} tone={telemetry.quality === "excellent" ? "green" : telemetry.quality === "fair" ? "amber" : telemetry.quality === "weak" ? "red" : "white"} /></div><div><small>MOTION</small><strong>{motionEnabled ? "ON" : "OFF"}</strong><span className={`telemetry-live-dot ${telemetry.edge === "ONLINE" ? "is-online" : ""}`} /></div></div><p className="telemetry-panel__note">Measured locally from the active video resource and browser connection.</p></aside>}
      <video
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover z-[0]"
        preload="auto"
        poster="/manus-storage/lumina-orbit-observatory_b9fb2af9.jpg"
        onLoadedMetadata={handleVideoProgress}
        onProgress={handleVideoProgress}
        onLoadedData={handleVideoReady}
        onCanPlay={handleVideoReady}
        onError={() => setVideoState("error")}
        onWaiting={() => { if (!isReady) setVideoState("loading"); }}
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src={deviceProfile.source} type={deviceProfile.type} />
        <source src={deviceProfile.constrained ? "/manus-storage/lumina-scroll-sequence-4k_d765b587.webm" : "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"} type={deviceProfile.constrained ? "video/webm" : "video/mp4"} />
      </video>
      <div className={`satellite-loader ${isReady ? "satellite-loader--hidden" : ""}`} role="status" aria-live="polite">
        <div className="satellite-loader__backdrop" />
        <div className="satellite-loader__scanlines" aria-hidden="true" />
        <div className="satellite-loader__grid" aria-hidden="true" />
        <div className="satellite-loader__orbit satellite-loader__orbit--one" />
        <div className="satellite-loader__orbit satellite-loader__orbit--two" />
        <div className="satellite-loader__orbit satellite-loader__orbit--three" />
        <div className="satellite-loader__crosshair" aria-hidden="true"><i /><i /><i /><i /><span /></div>
        <div className="satellite-loader__signal"><span /><span /><span /><span /><span /></div>
        <div className="satellite-loader__telemetry satellite-loader__telemetry--left" aria-hidden="true"><span>BUFFER / {telemetry.buffered}%</span><span>READY STATE / {telemetry.ready}</span><span>DOWNLOAD / {telemetry.speed}</span></div>
        <div className="satellite-loader__telemetry satellite-loader__telemetry--right" aria-hidden="true"><span>EDGE LINK / {telemetry.edge}</span><span>NETWORK / {telemetry.link}</span><span>RESPONSE / {telemetry.latency}</span></div>
        <div className="satellite-loader__content">
          <div className="satellite-loader__brand"><RevaxMark /><span>REVAX</span><b>UNIVERSE / ORBITAL NETWORK</b></div>
          <p className="satellite-loader__eyebrow">MISSION 05 / ATMOSPHERIC LINK</p>
          <h2>سيتم ربطك بالقمر الصناعي</h2>
          <p className="satellite-loader__status"><span>{loaderStage}</span><em>{videoState === "error" ? "إعادة محاولة استقبال الإشارة…" : "جاري تهيئة نافذة الرصد"}</em></p>
          <div className="satellite-loader__progress"><span style={{ width: `${loaderPercent}%` }} /></div>
          <div className="satellite-loader__readout"><span>VIDEO BUFFER</span><strong>{videoState === "error" ? "--" : `${loaderPercent}%`}</strong><span>READY / {isReady ? "YES" : "SYNC"}</span></div>
        </div>
        <div className="satellite-loader__footer"><span>NO SIGNAL IS LOST</span><span>SCANNING THE QUIET BETWEEN EVENTS</span><span>v.05.01</span></div>
      </div>
      <div className="fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(3,8,18,0.38)_0%,rgba(3,8,18,0.15)_44%,rgba(3,8,18,0.78)_100%)]" aria-hidden="true" />
      <div className="fixed inset-0 z-[2] lens-field" aria-hidden="true" />
      <div className="fixed inset-0 z-[3] ambient-grain" aria-hidden="true" />

      <div className={`relative z-10 flex min-h-[115vh] w-full max-w-7xl flex-col px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-8 lg:px-12 lg:pb-10 transition-opacity duration-1000 ease-out ${isReady ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <header className="flex items-center justify-between text-white">
          <a href="#top" className="group flex items-center gap-3 rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80" aria-label="Lumina home">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#a8e8ff]/30 bg-black/20 text-white backdrop-blur-md transition-transform duration-200 ease-out group-hover:scale-105">
              <img src="/manus-storage/lumina-mark_457b65a3.png" className="absolute inset-0 h-full w-full scale-125 object-contain opacity-20" alt="" />
              <RevaxMark />
            </span>
            <span className="text-sm font-medium tracking-[0.30em]">REVAX <span className="text-white/45">UNIVERSE</span></span>
          </a>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a8e8ff] shadow-[0_0_16px_#a8e8ff]" />
            Viewing live
          </div>
        </header>

        <section id="top" className="relative flex flex-1 flex-col justify-end pt-28 md:pt-40" aria-labelledby="lumina-title">
          <div className="orbital-line pointer-events-none absolute -left-28 bottom-44 h-72 w-[42rem] rounded-full border border-white/10" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative isolate max-w-3xl rounded-[2.25rem] px-5 py-6 sm:px-8 sm:py-8"
          >
            <div className="liquid-glass lens-halo absolute inset-0 -z-10 rounded-[2.25rem] bg-slate-950/10" aria-hidden="true" />
            <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#a8e8ff]/80">
              <span className="h-px w-10 bg-[#a8e8ff]/80" /> A clearer view of the extraordinary
            </p>
            <h1 id="lumina-title" className="max-w-2xl text-5xl font-medium leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[5.75rem]">
              The world, <span className="text-white/55">made luminous.</span>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              A calm window into global events and cosmic wonders, assembled for a more attentive world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#scroll-story" data-cursor="open" className="group inline-flex items-center gap-3 rounded-full bg-[#a8e8ff] px-5 py-3 text-xs font-medium text-slate-950 shadow-[0_0_30px_rgba(168,232,255,0.24)] transition duration-200 ease-out hover:bg-white active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Enter the observatory <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#scroll-story" data-cursor="play" className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-xs text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-white/25 bg-white/10"><Play size={11} fill="currentColor" /></span>
                Watch the signal
              </a>
            </div>
          </motion.div>

          <motion.div
            id="observe"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease: "easeOut" }}
            className="mt-12 flex gap-3 overflow-x-auto pb-2 sm:mt-16 md:max-w-3xl"
          >
            {highlights.map((item, index) => <CursorRevealCard key={item.title} item={item} index={index} />)}
          </motion.div>
        </section>

        <ScrollStory videoRef={videoRef} motionEnabled={motionEnabled} />

        <section id="signal-archive" className="signal-archive" aria-labelledby="archive-title"><div className="signal-archive__header"><div><p className="signal-archive__eyebrow">REVAX / SIGNAL ARCHIVE</p><h2 id="archive-title">Keep the signal.</h2></div><p>A living index of observations, traces, and quiet phenomena. Choose a frequency and return to the scene.</p></div><div className="signal-archive__grid">{observationScenes.slice(0, 4).map((scene, index) => <button type="button" data-cursor="explore" key={scene.index} onClick={() => jumpToScene(index)} className="archive-card"><span className="archive-card__index">{scene.index}</span><span className="archive-card__image" style={{ backgroundImage: `url(${scene.image})` }} /><span className="archive-card__content"><small>{scene.kicker}</small><strong>{scene.title}</strong><em>{scene.note}</em></span><ArrowUpRight size={15} /></button>)}</div></section>

        <motion.footer
          id="lumina-footer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-32 md:mt-64"
        >
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
              <div className="md:col-span-5">
                <div className="flex items-center gap-3 text-white">
                  <RevaxMark />
                  <span className="text-xl font-medium tracking-[-0.02em]">REVAX <span className="text-white/45">UNIVERSE</span></span>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-relaxed">
                  REVAX UNIVERSE provides premium clarity on global events and cosmic wonders — shared with all for free.
                </p>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                {footerColumns.map((column) => (
                  <nav key={column.title} aria-label={column.title}>
                    <h2 className="text-sm uppercase tracking-wider text-white font-medium mb-4">{column.title}</h2>
                    <ul className="text-xs space-y-2">
                      {column.links.map((link) => (
                        <li key={link}>
                          <span className="text-white/45">{link}</span>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
              <button type="button" className="rights-trigger" onClick={() => setLegalOpen(true)} data-cursor="open">© Revax — All rights reserved.</button>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="text-[10px] uppercase tracking-widest opacity-50">Follow Revax:</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ label, icon: Icon, href }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="opacity-70 hover:opacity-100 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white">
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
      {legalOpen && <div className="legal-modal__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLegalOpen(false); }}><section className="legal-modal liquid-glass" role="dialog" aria-modal="true" aria-labelledby="revax-legal-title"><div className="legal-modal__topline"><span>REVAX / LEGAL ARCHIVE</span><button type="button" onClick={() => setLegalOpen(false)} aria-label="Close legal information">×</button></div><div className="legal-modal__mark"><RevaxMark /></div><h2 id="revax-legal-title">Revax Universe</h2><p className="legal-modal__intro">A quiet observatory for clarity, exploration, and responsible connection.</p><div className="legal-modal__copy"><article><h3>Privacy Policy</h3><p>Revax only reads the browser and media signals needed to load and scrub this experience, such as video readiness, buffer progress, network type, and measured resource timing. These readings remain in the browser and are not used to identify you.</p></article><article><h3>Terms of Use</h3><p>Use Revax Universe for personal, lawful exploration. Visuals, motion systems, copy, and the REVAX mark are owned by Revax and may not be copied, redistributed, or presented as another service without permission.</p></article></div><div className="legal-modal__footer"><span>© Revax / All rights reserved</span><span>ESC TO CLOSE</span></div></section></div>}
    </main>
  );
}
