/**
 * Background decoration shared by the app shell, login and loader.
 * Soft brand glows, a few fine flowing curves and a faint dot grid — fixed behind content,
 * never interactive, and kept at low opacity so text and controls always stay readable.
 */
export const GeometricDecor = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft brand glows */}
      <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,153,0,0.16)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,rgba(255,153,0,0.08)_0%,transparent_65%)]" />
      <div className="absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(107,76,58,0.14)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,rgba(107,76,58,0.20)_0%,transparent_65%)]" />

      {/* Faint dot grid, fading out from the top-right corner */}
      <svg className="absolute top-0 right-0 h-[420px] w-[620px] text-bcp-brown/[0.16] dark:text-white/[0.06] [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]">
        <defs>
          <pattern id="bcp-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bcp-dot-grid)" />
      </svg>

      {/* Flowing curves along the bottom edge */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[46vh] min-h-[260px]"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="bcp-curve-orange" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FF9900" stopOpacity="0" />
            <stop offset="0.45" stopColor="#FF9900" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FF9900" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="bcp-curve-brown" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#6B4C3A" stopOpacity="0.05" />
            <stop offset="0.6" stopColor="#6B4C3A" stopOpacity="0.28" />
            <stop offset="1" stopColor="#6B4C3A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bcp-wave-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FF9900" stopOpacity="0.07" />
            <stop offset="1" stopColor="#6B4C3A" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Layered soft wave */}
        <path d="M0 330 C 260 250, 520 380, 800 300 S 1240 210, 1440 260 L1440 400 L0 400 Z" fill="url(#bcp-wave-fill)" />
        {/* Fine strokes */}
        <path d="M-20 300 C 240 200, 520 360, 820 270 S 1260 170, 1460 220" stroke="url(#bcp-curve-orange)" strokeWidth="1.6" />
        <path d="M-20 340 C 300 260, 560 390, 860 310 S 1280 230, 1460 270" stroke="url(#bcp-curve-brown)" strokeWidth="1.3" />
        <path d="M-20 370 C 320 310, 600 400, 900 345 S 1300 290, 1460 320" stroke="url(#bcp-curve-orange)" strokeWidth="1" strokeOpacity="0.6" />
      </svg>

      {/* Single fine arc, top-left, for balance */}
      <svg className="absolute -top-24 -left-24 h-[360px] w-[360px]" viewBox="0 0 360 360" fill="none">
        <circle cx="180" cy="180" r="150" stroke="#FF9900" strokeOpacity="0.14" strokeWidth="1.2" />
        <circle cx="180" cy="180" r="118" stroke="#6B4C3A" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="2 7" />
      </svg>
    </div>
  );
};
