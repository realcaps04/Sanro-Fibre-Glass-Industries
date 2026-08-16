const wave =
  "M0,58 C240,98 480,18 720,58 C960,98 1200,18 1440,58 C1680,98 1920,18 2160,58 C2400,98 2640,18 2880,58 V120 H0 Z";

export function HeroWaves() {
  return (
    <div className="hero-wave pointer-events-none absolute inset-x-0 bottom-0 h-[4.75rem] overflow-hidden" aria-hidden>
      <svg
        className="hero-wave-shift absolute bottom-1.5 left-0 h-full w-[200%]"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path fill="rgb(255 255 255 / 0.18)" d={wave} />
      </svg>
      <svg
        className="hero-wave-shift hero-wave-shift-delay absolute bottom-0 left-0 h-full w-[200%]"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path fill="var(--background)" d={wave} />
      </svg>
    </div>
  );
}
