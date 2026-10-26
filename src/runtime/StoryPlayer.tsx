import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    let cancelled = false;
    const load = async () => {
      // GitHub Pages may retain an older PWA bundle on iOS Safari.
      // Remove stale service-worker/cache entries once, then reload from network.
      try {
        const registrations = "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistrations()
          : [];
        const cacheNames = "caches" in window ? await caches.keys() : [];
        if (registrations.length || cacheNames.length) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          if (!sessionStorage.getItem("foundphone-runtime-cache-cleared")) {
            sessionStorage.setItem("foundphone-runtime-cache-cleared", "1");
            if (!cancelled) location.reload();
            return;
          }
        }
        sessionStorage.removeItem("foundphone-runtime-cache-cleared");
      } catch {
        // Continue loading if browser privacy settings block cache management.
      }
      if (cancelled) return;
      fetch(
        new URLSearchParams(location.search).get("preview") === "test"
          ? "./test-work.json"
          : new URLSearchParams(location.search).get("template") === "blank"
            ? "./blank-work.json"
            : "./work.json",
        { signal: abort.signal, cache: "no-store" },
      )
        .then((r) => {
          if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
          return r.json();
        })
        .then((x) => {
          const w = validateWork(x);
          document.title =
            w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
          setWork(w);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(String(e));
        });
    };
    void load();
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, []);
  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
