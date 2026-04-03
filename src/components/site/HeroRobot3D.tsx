import { Suspense, lazy, memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface HeroRobot3DProps {
  interactive?: boolean;
  quality?: "desktop" | "mobile";
  className?: string;
}

const DesktopHeroRobotScene = lazy(() => import("./HeroRobotScene3D"));

function useMediaQuery(query: string, initialValue = false) {
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [query]);

  return matches;
}

function checkWebGLSupport() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function HeroRobotFallback({ className, reducedMotion = false }: { className?: string; reducedMotion?: boolean }) {
  const containerClassName = useMemo(
    () => [
      "relative isolate overflow-hidden rounded-[2rem] border border-white/10",
      "bg-[radial-gradient(circle_at_26%_20%,rgba(85,149,255,0.22),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,81,208,0.16),transparent_28%),linear-gradient(180deg,rgba(11,11,26,0.96),rgba(5,5,14,0.98))]",
      className,
    ].filter(Boolean).join(" "),
    [className],
  );

  return (
    <div className={containerClassName} aria-hidden="true">
      <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 50% 50%, rgba(122, 90, 255, 0.12), transparent 60%)" }} />
      <motion.img
        src="/mascot/novaesweb-bot-mobile.jpg"
        alt=""
        role="presentation"
        className="relative z-[1] h-full w-full object-contain px-4 py-5 drop-shadow-[0_30px_80px_rgba(100,120,255,0.28)]"
        loading="eager"
        animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [-0.6, 0.8, -0.6], scale: [1, 1.018, 1] }}
        transition={reducedMotion ? undefined : { duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-8 bottom-6 h-12 rounded-full bg-[radial-gradient(circle,rgba(120,164,255,0.3),transparent_72%)] blur-2xl" />
    </div>
  );
}

function HeroRobot3D({ interactive = true, quality = "desktop", className = "" }: HeroRobot3DProps) {
  const isDesktopViewport = useMediaQuery("(min-width: 1024px)", quality === "desktop");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [supportsWebGL, setSupportsWebGL] = useState(false);
  const [shouldMountScene, setShouldMountScene] = useState(quality === "mobile");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSupportsWebGL(checkWebGLSupport());
  }, []);

  useEffect(() => {
    if (quality === "mobile" || !isDesktopViewport || typeof window === "undefined") {
      setShouldMountScene(false);
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMountScene(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [quality, isDesktopViewport]);

  const shouldUseFallback = quality === "mobile" || !isDesktopViewport || !supportsWebGL || !shouldMountScene;
  const frameClassName = [
    "relative isolate overflow-hidden rounded-[2rem] border border-white/10",
    "bg-[radial-gradient(circle_at_26%_18%,rgba(72,129,255,0.22),transparent_30%),radial-gradient(circle_at_75%_22%,rgba(255,84,204,0.14),transparent_28%),linear-gradient(180deg,rgba(9,10,22,0.96),rgba(4,5,12,0.98))]",
    className,
  ].filter(Boolean).join(" ");

  if (shouldUseFallback) {
    return (
      <div ref={containerRef}>
        <HeroRobotFallback className={className} reducedMotion={prefersReducedMotion} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={frameClassName} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,118,255,0.14),transparent_58%)]" />
      <Suspense fallback={<HeroRobotFallback className="h-full w-full" reducedMotion={prefersReducedMotion} />}>
        <DesktopHeroRobotScene
          interactive={interactive && !prefersReducedMotion}
          reducedMotion={prefersReducedMotion}
          className="relative z-[1] h-full w-full"
        />
      </Suspense>
    </div>
  );
}

export default memo(HeroRobot3D);
