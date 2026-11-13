import { useEffect } from "react";
import Lenis from "lenis";
import { novaScrollValues, useNovaScroll } from "@/lib/nova-scroll";

export function ScrollProgress() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nova-section]"));
    let lastSection = -1;
    let lastSectionProgress = -1;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = window.scrollY / max;
      let section = 0;
      let nearest = Number.POSITIVE_INFINITY;
      let sectionProgress = 0;
      sections.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (distance < nearest) {
          nearest = distance;
          section = index;
          sectionProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
        }
      });
      novaScrollValues.progress = progress;
      novaScrollValues.section = section;
      novaScrollValues.sectionProgress = sectionProgress;
      const sectionChanged = section !== lastSection;
      const milestoneChanged = Math.floor(sectionProgress * 4) !== Math.floor(lastSectionProgress * 4);
      const heroProgressChanged = section === 0 && Math.abs(progress - lastSectionProgress) > 0.003;
      if (sectionChanged || milestoneChanged || heroProgressChanged) {
        const milestoneProgress = Math.floor(sectionProgress * 4) / 4;
        useNovaScroll.getState().setScroll(progress, section, milestoneProgress);
        lastSection = section;
        lastSectionProgress = section === 0 ? progress : sectionProgress;
      }
      const root = document.documentElement;
      root.style.setProperty("--scroll-progress", String(progress));
      const glowToken = ["--glow-hero", "--glow-features", "--glow-how", "--glow-showcase", "--glow-contact"][section] ?? "--glow-hero";
      if (sectionChanged) root.style.setProperty("--glow", getComputedStyle(root).getPropertyValue(glowToken));
    };

    if (reducedMotion) {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    lenis.on("scroll", update);
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      lenis.destroy();
    };
  }, []);

  return null;
}