"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { track, logError } from "@/lib/telemetry";

const KEY = "cookie_consent_v1";
function grant(on: boolean) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", {
      analytics_storage: on ? "granted" : "denied",
    });
  } catch {}
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onErr = (e: ErrorEvent) => logError("window", e.error ?? e.message);
    const onRej = (e: PromiseRejectionEvent) => logError("promise", e.reason);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    let c: string | null = null;
    try { c = localStorage.getItem(KEY); } catch {}
    if (!c) setVisible(true);
    else { grant(c === "accepted"); track("page_view", { path: location.pathname }); }
    return () => { window.removeEventListener("error", onErr); window.removeEventListener("unhandledrejection", onRej); };
  }, []);

  function choose(accepted: boolean) {
    try { localStorage.setItem(KEY, accepted ? "accepted" : "declined"); } catch {}
    grant(accepted);
    if (accepted) track("consent_accept");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed bottom-0 left-0 right-0 z-[9998] p-4 border-t backdrop-blur-sm"
      style={{ background: "var(--surface, #101826)", borderColor: "var(--border, rgba(34,211,238,0.14))" }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="flex-1 text-sm" style={{ color: "var(--text, #e2e8f0)" }}>
          We use anonymous analytics cookies to improve AgentLogs. You can decline and everything still works.{" "}
          <Link href="/docs" className="underline">Learn more</Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => choose(false)} className="px-4 py-2 text-xs rounded-lg border min-h-[44px]"
            style={{ borderColor: "var(--border, rgba(34,211,238,0.14))", color: "var(--text, #e2e8f0)" }}>Decline</button>
          <button onClick={() => choose(true)} className="px-4 py-2 text-xs rounded-lg font-medium min-h-[44px]"
            style={{ background: "var(--accent, #22d3ee)", color: "#0c111a" }}>Accept</button>
        </div>
      </div>
    </div>
  );
}
