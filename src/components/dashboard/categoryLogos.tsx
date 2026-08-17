import type { ReactNode } from "react";

function LogoFrame({
  bg,
  glow,
  children,
}: {
  bg: string;
  glow?: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <rect width="64" height="64" rx="18" fill={bg} />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill="none"
        stroke="rgb(255 255 255 / 0.18)"
        strokeWidth="1"
      />
      {glow ? (
        <circle cx="18" cy="14" r="22" fill={glow} opacity="0.45" />
      ) : null}
      {children}
    </svg>
  );
}

export function DoorBillsLogo() {
  return (
    <LogoFrame bg="#003f34" glow="rgb(178 255 214 / 0.22)">
      <rect x="20" y="12" width="24" height="40" rx="2.5" fill="#f3fbf8" />
      <rect x="22.5" y="15" width="8.5" height="16" rx="1" fill="#d7ebe4" />
      <rect x="33" y="15" width="8.5" height="16" rx="1" fill="#d7ebe4" />
      <rect x="22.5" y="33.5" width="8.5" height="15" rx="1" fill="#d7ebe4" />
      <rect x="33" y="33.5" width="8.5" height="15" rx="1" fill="#d7ebe4" />
      <rect x="31.2" y="12" width="1.6" height="40" fill="#c4a574" />
      <circle cx="40.5" cy="33" r="1.7" fill="#d6ff4a" />
    </LogoFrame>
  );
}

export function WaterproofingLogo() {
  return (
    <LogoFrame bg="#0b6b78" glow="rgb(186 230 253 / 0.28)">
      <path
        d="M32 14c6.8 9.2 12 16.4 12 23.2A12 12 0 1 1 20 37.2C20 30.4 25.2 23.2 32 14Z"
        fill="#e8fbff"
      />
      <path
        d="M32 22c4.2 5.7 7.4 10.2 7.4 14.4A7.4 7.4 0 1 1 24.6 36.4C24.6 32.2 27.8 27.7 32 22Z"
        fill="#7dd3e8"
      />
      <path d="M29.2 38.8c1.2 2.6 4.6 3.4 6.6 1.2" fill="none" stroke="#0b6b78" strokeWidth="1.8" strokeLinecap="round" />
    </LogoFrame>
  );
}

export function AnyBillLogo() {
  return (
    <LogoFrame bg="#145c4a" glow="rgb(214 255 74 / 0.18)">
      <rect x="14" y="20" width="26" height="30" rx="3" fill="#e8f5f1" transform="rotate(-8 27 35)" />
      <rect x="22" y="16" width="26" height="30" rx="3" fill="#f8ffe6" />
      <rect x="26" y="22" width="14" height="2.2" rx="1.1" fill="#003f34" opacity="0.35" />
      <rect x="26" y="27" width="18" height="2" rx="1" fill="#003f34" opacity="0.18" />
      <rect x="26" y="32" width="16" height="2" rx="1" fill="#003f34" opacity="0.18" />
      <circle cx="42" cy="40" r="7" fill="#d6ff4a" />
      <path d="M39.2 40.2 41.2 42.2 45.2 37.8" fill="none" stroke="#003f34" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </LogoFrame>
  );
}

export function PaymentsLogo() {
  return (
    <LogoFrame bg="#c8f000" glow="rgb(255 255 255 / 0.35)">
      <circle cx="32" cy="32" r="16" fill="#003f34" />
      <path
        d="M24.5 21.5h16M24.5 27h16"
        fill="none"
        stroke="#d6ff4a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M27.5 21.5v22.5M27.5 27c7.8 0 12.2 3.2 12.2 9.2 0 5.6-4.2 8.8-12.2 8.8"
        fill="none"
        stroke="#d6ff4a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </LogoFrame>
  );
}

export function CustomersLogo() {
  return (
    <LogoFrame bg="#1f4d42" glow="rgb(178 255 214 / 0.2)">
      <circle cx="25" cy="24" r="7" fill="#f3fbf8" />
      <path d="M12 46c1.2-8.4 6.4-13 13-13s11.8 4.6 13 13" fill="#d7ebe4" />
      <circle cx="40" cy="23" r="6.2" fill="#d6ff4a" />
      <path d="M31 46c1-7.4 5.4-11.4 11.2-11.4 5.8 0 10.4 4 11.4 11.4" fill="#b2ffd6" />
    </LogoFrame>
  );
}

export function ProductsLogo() {
  return (
    <LogoFrame bg="#8b5a3c" glow="rgb(255 232 210 / 0.22)">
      <path d="M32 14 48 22v20L32 50 16 42V22Z" fill="#fff3e8" />
      <path d="M32 14 48 22 32 30 16 22Z" fill="#f0d0b0" />
      <path d="M32 30v20L48 42V22Z" fill="#e2b48a" />
      <path d="M24 19.5 40 27.5" fill="none" stroke="#8b5a3c" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
    </LogoFrame>
  );
}

export function ReportsLogo() {
  return (
    <LogoFrame bg="#062821" glow="rgb(214 255 74 / 0.16)">
      <rect x="15" y="34" width="7" height="16" rx="2" fill="#7aa89c" />
      <rect x="25.5" y="26" width="7" height="24" rx="2" fill="#b2ffd6" />
      <rect x="36" y="18" width="7" height="32" rx="2" fill="#d6ff4a" />
      <path d="M16 22c6-8 12-4 18 2s8 4 14-2" fill="none" stroke="#f3fbf8" strokeWidth="2" strokeLinecap="round" />
    </LogoFrame>
  );
}

export function EstimateLogo() {
  return (
    <LogoFrame bg="#2a463e" glow="rgb(243 251 248 / 0.12)">
      <rect x="18" y="14" width="28" height="36" rx="4" fill="#f3fbf8" />
      <rect x="24" y="12" width="16" height="7" rx="3.5" fill="#d6ff4a" />
      <rect x="23" y="26" width="18" height="2.2" rx="1.1" fill="#003f34" opacity="0.28" />
      <rect x="23" y="32" width="14" height="2.2" rx="1.1" fill="#003f34" opacity="0.16" />
      <rect x="23" y="38" width="16" height="2.2" rx="1.1" fill="#003f34" opacity="0.16" />
      <path d="M44 40 48 36l6 8-8 6-4-4Z" fill="#c8f000" />
      <path d="M46.2 46.2 48.4 44" fill="none" stroke="#003f34" strokeWidth="1.4" strokeLinecap="round" />
    </LogoFrame>
  );
}
