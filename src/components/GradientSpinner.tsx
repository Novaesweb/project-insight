export default function GradientSpinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <defs>
        <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8334a" />
          <stop offset="50%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#7b1fa2" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="url(#spinner-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}



