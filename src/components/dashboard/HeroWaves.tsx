export function HeroWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="hero-wave-drift absolute -top-10 left-[-18%] h-[130%] w-[136%] opacity-80"
        viewBox="0 0 720 420"
        preserveAspectRatio="none"
      >
        <path
          fill="rgb(178 255 214 / 0.1)"
          d="M-40,90 C80,20 180,160 320,70 C460,-20 560,150 760,40 L760,-40 L-40,-40 Z"
        />
        <path
          fill="rgb(11 92 77 / 0.35)"
          d="M-40,210 C90,130 210,280 360,190 C510,100 620,270 780,160 L780,420 L-40,420 Z"
        />
      </svg>
      <svg
        className="hero-wave-drift-slow absolute right-[-20%] -bottom-6 h-[70%] w-[90%] opacity-70"
        viewBox="0 0 520 280"
        preserveAspectRatio="none"
      >
        <path
          fill="rgb(255 255 255 / 0.08)"
          d="M0,180 C80,110 170,230 270,150 C370,70 430,210 560,120 L560,280 L0,280 Z"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-[5.5rem] w-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <path
          fill="rgb(178 255 214 / 0.16)"
          d="M0,88 C180,140 340,36 540,86 C740,136 900,44 1100,90 C1240,122 1360,70 1440,92 L1440,160 L0,160 Z"
        />
        <path
          fill="rgb(0 41 34 / 0.28)"
          d="M0,108 C220,58 420,148 720,104 C1020,60 1220,142 1440,96 L1440,160 L0,160 Z"
        />
        <path
          fill="var(--background)"
          d="M0,128 C240,164 460,96 720,132 C980,168 1220,108 1440,136 L1440,160 L0,160 Z"
        />
      </svg>
    </div>
  );
}
