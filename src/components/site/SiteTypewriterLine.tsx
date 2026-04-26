import { memo, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface SiteTypewriterLineProps {
  messages: string[];
  className?: string;
}

const TYPE_SPEED = 68;
const DELETE_SPEED = 34;
const HOLD_DELAY = 1500;

function SiteTypewriterLine({ messages, className }: SiteTypewriterLineProps) {
  const lines = useMemo(() => messages.filter(Boolean), [messages]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!lines.length || reducedMotion) {
      setDisplayText(lines[0] ?? "");
      return;
    }

    const currentLine = lines[activeIndex] ?? "";

    const timeoutId = window.setTimeout(() => {
      if (!isDeleting && displayText.length < currentLine.length) {
        setDisplayText(currentLine.slice(0, displayText.length + 1));
        return;
      }

      if (!isDeleting && displayText.length === currentLine.length) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && displayText.length > 0) {
        setDisplayText(currentLine.slice(0, displayText.length - 1));
        return;
      }

      setIsDeleting(false);
      setActiveIndex((current) => (current + 1) % lines.length);
    }, !isDeleting && displayText.length === currentLine.length ? HOLD_DELAY : isDeleting ? DELETE_SPEED : TYPE_SPEED);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, displayText, isDeleting, lines, reducedMotion]);

  if (!lines.length) return null;

  return (
    <div className={cn("site-typewriter-line", className)} aria-live="polite">
      <span className="site-typewriter-dot" aria-hidden="true" />
      <span className="site-typewriter-text">{displayText || lines[0]}</span>
      <span className="site-typewriter-cursor" aria-hidden="true" />
    </div>
  );
}

export default memo(SiteTypewriterLine);
