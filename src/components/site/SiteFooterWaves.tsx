import { memo } from "react";

function SiteFooterWaves() {
  return (
    <div className="site-footer-waves" aria-hidden="true">
      <svg className="site-wave site-wave--one" viewBox="0 0 1440 320" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="site-wave-gradient-one" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.36" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          fill="url(#site-wave-gradient-one)"
          d="M0,224L60,202.7C120,181,240,139,360,149.3C480,160,600,224,720,224C840,224,960,160,1080,144C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      <svg className="site-wave site-wave--two" viewBox="0 0 1440 320" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="site-wave-gradient-two" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#EC4899" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <path
          fill="url(#site-wave-gradient-two)"
          d="M0,288L48,266.7C96,245,192,203,288,197.3C384,192,480,224,576,245.3C672,267,768,277,864,250.7C960,224,1056,160,1152,149.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <svg className="site-wave site-wave--three" viewBox="0 0 1440 320" preserveAspectRatio="none" focusable="false">
        <path
          fill="rgba(255,255,255,0.06)"
          d="M0,256L80,234.7C160,213,320,171,480,176C640,181,800,235,960,234.7C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>
    </div>
  );
}

export default memo(SiteFooterWaves);
