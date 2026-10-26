import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "./Phone";
import { validateWork, type Work } from "./schema";
import "./styles.css";
function Player() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // The published player.html uses this entrypoint; clear stale iPad PWA
      // caches here too, otherwise it can keep running an older chat bundle.
      try {
        const registrations = "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistrations()
          : [];
        const cacheNames = "caches" in window ? await caches.keys() : [];
        if (registrations.length || cacheNames.length) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          if (!sessionStorage.getItem("foundphone-player-cache-cleared")) {
            sessionStorage.setItem("foundphone-player-cache-cleared", "1");
            if (!cancelled) location.reload();
            return;
          }
        }
        sessionStorage.removeItem("foundphone-player-cache-cleared");
      } catch {
        // Continue if browser privacy settings block cache management.
      }
      if (cancelled) return;
      fetch("./work.json", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw Error("缺少 work.json");
          return r.json();
        })
        .then((x) => {
          const w = validateWork(x);
          document.title = w.title;
          setWork(w);
        })
        .catch((e) => setError(String(e)));
    };
    void load();
    return () => { cancelled = true; };
  }, []);
  return (
    <main className="standalone-player">
      {work ? (
        <>
          <div className="player-title">
            <h1>{work.title}</h1>
          </div>
          <Phone work={work} />
          <p className="player-footnote">
            {work.description}
            <br />
            进度保存在此浏览器 · FoundPhone Studio
          </p>
        </>
      ) : (
        <p>{error || "正在打开故事…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Player />);
