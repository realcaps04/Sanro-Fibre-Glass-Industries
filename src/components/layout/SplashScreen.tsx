import { useData } from "@/context/DataContext";
import { useEffect } from "react";

export function SplashScreen() {
  return (
    <div className="hero-gradient flex min-h-dvh flex-col items-center justify-center px-8">
      <img
        src="/icons/icon-192.png"
        alt=""
        className="h-[108px] w-[108px] rounded-[28px] object-cover shadow-[0_18px_40px_rgb(0_0_0/0.28)]"
      />
      <p className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-white">Sanro Doors</p>
      <p className="mt-2 text-[10px] font-medium tracking-[0.22em] text-white/55 uppercase">
        Designed to open possibilities
      </p>
    </div>
  );
}

export function BootSplashHandoff() {
  const { loading } = useData();

  useEffect(() => {
    const splash = document.getElementById("boot-splash");
    if (!splash) return;

    const hide = () => {
      splash.style.transition = "opacity 400ms ease";
      splash.style.opacity = "0";
      window.setTimeout(() => splash.remove(), 420);
    };

    if (!loading) hide();
    const failsafe = window.setTimeout(hide, 2500);
    return () => window.clearTimeout(failsafe);
  }, [loading]);

  return null;
}
