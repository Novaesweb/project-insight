import { memo, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const springConfig = { damping: 28, stiffness: 280, mass: 0.45 };
const ringSpringConfig = { damping: 24, stiffness: 180, mass: 0.65 };

function PublicSiteCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const pointerX = useMotionValue(-120);
  const pointerY = useMotionValue(-120);
  const ringX = useSpring(pointerX, ringSpringConfig);
  const ringY = useSpring(pointerY, ringSpringConfig);
  const dotX = useSpring(pointerX, springConfig);
  const dotY = useSpring(pointerY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(mediaQuery.matches && !reducedMotion.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("public-site-cursor-active");
      return;
    }

    document.body.classList.add("public-site-cursor-active");

    const interactiveSelector = [
      "a",
      "button",
      "[role='button']",
      "[data-site-cursor='interactive']",
      "summary",
    ].join(",");

    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof Element ? Boolean(target.closest(interactiveSelector)) : false;

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      setVisible(true);
      setInteractive(isInteractiveTarget(event.target));
    };

    const handlePointerLeave = () => setVisible(false);
    const handlePointerDown = () => setInteractive(true);
    const handlePointerUp = (event: PointerEvent) => setInteractive(isInteractiveTarget(event.target));

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.classList.remove("public-site-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="public-site-cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: interactive ? 1.55 : 1,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="public-site-cursor-core"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: interactive ? 0.72 : 1,
        }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        aria-hidden="true"
      />
    </>
  );
}

export default memo(PublicSiteCursor);
