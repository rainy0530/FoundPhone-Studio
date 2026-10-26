import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "./Phone";
import { validateWork, type Work } from "./schema";
import "./styles.css";
function Player() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    // Load the current published story directly. Do not wait for iOS Safari
    // service-worker/cache APIs: they can stall the player on the loading screen.
    fetch("./work.json", { signal: abort.signal, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error("无法加载 work.json（HTTP " + r.status + "）");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title;
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
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
