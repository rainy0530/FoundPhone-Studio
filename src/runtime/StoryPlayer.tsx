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
    const params = new URLSearchParams(location.search);
    const dataPath =
      params.get("preview") === "test"
        ? "./test-work.json"
        : params.get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json";
    const dataUrl = new URL(dataPath, location.href);
    // Cache data per published version: repeat visits load faster, while a new
    // ?v=... link still requests fresh story data after a deployment.
    const version = params.get("v");
    if (version) dataUrl.searchParams.set("v", version);
    fetch(dataUrl.toString(), { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error("无法加载剧情数据（HTTP " + r.status + "）");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        // Enforce the published phone layout even when a stale work.json is served.
        w.apps = w.apps.map((a) => ["instagram", "twitter"].includes(a.id) ? { ...a, installed: false, visible: false, dock: false } : a);
        w.phone.notifications = true;
        document.title = w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  return (
    <main className="story-runtime">
      {work ? (
        <Phone key="story-phone-lock-kkt-v3" work={work} resetOnReload />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
