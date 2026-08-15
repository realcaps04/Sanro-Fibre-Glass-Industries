import { brandConfig } from "@/brand/config";
import { storage } from "@/lib/storage";
import { applyAppUpdate, registerPwa } from "@/pwa";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 45_000;
const APPLIED_KEY = "releaseSha";
const DISMISSED_KEY = "dismissedReleaseSha";

interface VersionFile {
  sha?: string;
}

async function fetchGithubSha(): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${brandConfig.githubRepo}/commits/${brandConfig.githubBranch}`,
      {
        cache: "no-store",
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { sha?: string };
    return payload.sha ?? null;
  } catch {
    return null;
  }
}

async function fetchHostedSha(): Promise<string | null> {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as VersionFile;
    if (!payload.sha || payload.sha === "dev") return null;
    return payload.sha;
  } catch {
    return null;
  }
}

export function useAppUpdate() {
  const [available, setAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const pendingSha = useRef<string | null>(null);
  const hostedSha = useRef<string | null>(null);
  const checking = useRef(false);
  const swDismissed = useRef(false);

  const show = useCallback((sha?: string) => {
    if (sha) {
      if (sha === storage.get(DISMISSED_KEY, "")) return;
      pendingSha.current = sha;
    } else if (swDismissed.current) {
      return;
    }
    setAvailable(true);
  }, []);

  const check = useCallback(async () => {
    if (checking.current || document.visibilityState === "hidden") return;
    checking.current = true;
    try {
      const [githubSha, remoteHosted] = await Promise.all([fetchGithubSha(), fetchHostedSha()]);

      if (remoteHosted) {
        if (!hostedSha.current) {
          hostedSha.current = remoteHosted;
        } else if (remoteHosted !== hostedSha.current) {
          show(remoteHosted);
        }
      }

      if (githubSha) {
        const applied = storage.get(APPLIED_KEY, "");
        if (!applied) {
          storage.set(APPLIED_KEY, githubSha);
          return;
        }
        if (githubSha !== applied) {
          show(githubSha);
        }
      }
    } finally {
      checking.current = false;
    }
  }, [show]);

  useEffect(() => {
    void registerPwa({ onNeedRefresh: () => show() });
    void check();

    const interval = window.setInterval(() => {
      void check();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [check, show]);

  const update = useCallback(() => {
    if (updating) return;
    setUpdating(true);
    if (pendingSha.current) {
      storage.set(APPLIED_KEY, pendingSha.current);
      storage.remove(DISMISSED_KEY);
    }
    void applyAppUpdate();
  }, [updating]);

  const later = useCallback(() => {
    if (pendingSha.current) {
      storage.set(DISMISSED_KEY, pendingSha.current);
    } else {
      swDismissed.current = true;
    }
    setAvailable(false);
  }, []);

  return { available, updating, update, later };
}
