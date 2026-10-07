"use client";
// Hub-driven animated background (theme.layout.bgAnimation / bgSpeed). Pure CSS, honours prefers-reduced-motion.
import type { SiteTheme } from "@/lib/theme-loader";

export function AnimatedBg({ theme }: { theme?: SiteTheme | null }) {
  const kind = theme?.layout?.bgAnimation;
  if (!kind || kind === "none") return null;
  const speed = Math.min(3, Math.max(0.25, theme?.layout?.bgSpeed ?? 1));
  const dur = `${24 / speed}s`;
  const css = `
.ds-bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.ds-bg i{position:absolute;border-radius:50%;filter:blur(80px);opacity:.35;will-change:transform;animation:ds-float ${dur} ease-in-out infinite alternate}
.ds-bg i:nth-child(1){width:55vmax;height:55vmax;left:-10%;top:-15%;background:var(--accent,#22d3ee)}
.ds-bg i:nth-child(2){width:45vmax;height:45vmax;right:-10%;top:20%;background:color-mix(in oklab,var(--accent,#22d3ee) 55%,#fff);animation-delay:-8s;opacity:.22}
.ds-bg i:nth-child(3){width:40vmax;height:40vmax;left:25%;bottom:-20%;background:color-mix(in oklab,var(--accent,#22d3ee) 60%,#000);animation-delay:-15s}
.ds-bg.mesh i{filter:blur(120px);opacity:.3}
.ds-bg.dotgrid{background:radial-gradient(color-mix(in oklab,var(--accent,#22d3ee) 35%,transparent) 1px,transparent 1px) 0 0/22px 22px}
.ds-bg.dotgrid i{display:none}
.ds-bg.gradient-shift{background:linear-gradient(120deg,transparent,color-mix(in oklab,var(--accent,#22d3ee) 22%,transparent),transparent);background-size:300% 300%;animation:ds-shift ${dur} ease infinite}
.ds-bg.gradient-shift i{display:none}
@keyframes ds-float{to{transform:translate3d(8vmax,6vmax,0) scale(1.15)}}
@keyframes ds-shift{50%{background-position:100% 50%}}
@media (prefers-reduced-motion:reduce){.ds-bg i,.ds-bg.gradient-shift{animation:none}}`;
  return (
    <div className={`ds-bg ${kind}`} aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <i /><i /><i />
    </div>
  );
}
