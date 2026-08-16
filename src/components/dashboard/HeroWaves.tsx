import { useId } from "react";

export function HeroWaves() {
  const uid = useId().replace(/:/g, "");
  const back = `${uid}-back`;
  const mid = `${uid}-mid`;
  const front = `${uid}-front`;
  const shine = `${uid}-shine`;
  const shadow = `${uid}-shadow`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="hero-wave-3d absolute inset-0 h-full w-full"
        viewBox="0 0 390 340"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={back} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#001c17" />
            <stop offset="55%" stopColor="#00362d" />
            <stop offset="100%" stopColor="#0a5346" />
          </linearGradient>
          <linearGradient id={mid} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#002922" />
            <stop offset="45%" stopColor="#0b5c4d" />
            <stop offset="100%" stopColor="#15705e" />
          </linearGradient>
          <linearGradient id={front} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#003f34" />
            <stop offset="40%" stopColor="#0d6b59" />
            <stop offset="100%" stopColor="#1d8a74" />
          </linearGradient>
          <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(178 255 214 / 0)" />
            <stop offset="45%" stopColor="rgb(178 255 214 / 0.35)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.08)" />
          </linearGradient>
          <filter id={shadow} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#00140f" floodOpacity="0.38" />
          </filter>
        </defs>

        <path
          fill={`url(#${back})`}
          d="M-30,118 C70,78 130,168 230,118 C330,68 390,148 450,108 L450,340 L-30,340 Z"
        />
        <path
          fill={`url(#${mid})`}
          filter={`url(#${shadow})`}
          d="M-30,158 C80,112 150,208 250,152 C350,96 410,188 470,142 L470,340 L-30,340 Z"
        />
        <path
          fill={`url(#${front})`}
          filter={`url(#${shadow})`}
          d="M-30,198 C90,154 160,248 270,192 C380,136 430,228 500,182 L500,340 L-30,340 Z"
        />
        <path
          fill="none"
          stroke={`url(#${shine})`}
          strokeWidth="3"
          strokeLinecap="round"
          d="M-30,198 C90,154 160,248 270,192 C380,136 430,228 500,182"
        />
        <path
          fill="none"
          stroke="rgb(178 255 214 / 0.14)"
          strokeWidth="2"
          d="M-30,158 C80,112 150,208 250,152 C350,96 410,188 470,142"
        />
      </svg>

      <svg
        className="absolute inset-x-0 bottom-0 h-16 w-full"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          fill="var(--background)"
          d="M0,38 C240,78 480,8 720,38 C960,68 1200,8 1440,38 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  );
}
