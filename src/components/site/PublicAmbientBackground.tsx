import { memo } from "react";

import { cn } from "@/lib/utils";

interface PublicAmbientBackgroundProps {
  className?: string;
}

function PublicAmbientBackground({ className }: PublicAmbientBackgroundProps) {
  return (
    <div className={cn("public-ambient-background", className)} aria-hidden="true">
      <div className="public-ambient-grid" />
      <div className="public-ambient-orb public-ambient-orb--one" />
      <div className="public-ambient-orb public-ambient-orb--two" />
      <div className="public-ambient-orb public-ambient-orb--three" />
      <div className="public-ambient-beam public-ambient-beam--left" />
      <div className="public-ambient-beam public-ambient-beam--right" />
      <div className="public-ambient-particles" />
      <div className="public-ambient-noise" />
    </div>
  );
}

export default memo(PublicAmbientBackground);
