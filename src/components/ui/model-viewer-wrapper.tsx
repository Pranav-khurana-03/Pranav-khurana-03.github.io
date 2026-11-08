import { useEffect, useRef, useState } from "react";

interface Props {
  src?: string;
  imageUrl?: string;
  alt: string;
  label?: string;
}

/* One viewer for every model: loading spinner, readable error, placeholder if no src. */
export function ModelViewerWrapper({ src, imageUrl, alt, label = "Object" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    const onLoad = () => setState("ready");
    const onError = () => setState("error");
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [src]);

  if (!src && imageUrl) {
    return <img src={imageUrl} alt={alt} loading="lazy" className="h-full w-full object-cover" />;
  }

  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#0f1317] font-mono text-[0.68rem] uppercase tracking-wider text-muted" role="img" aria-label={`Placeholder for ${alt}`}>
        <span className="border border-dashed border-line px-4 py-6">{label} · media coming</span>
      </div>
    );
  }

  return (
    <div className="group relative h-full w-full bg-ink">
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        rotation-per-second="15deg"
        interaction-prompt="none"
        shadow-intensity="0.5"
        exposure="1.2"
        tone-mapping="neutral"
        style={{ width: "100%", height: "100%", cursor: "grab", ["--poster-color" as string]: "transparent" }}
      />
      {state === "loading" && (
        <div className="absolute inset-0 grid place-items-center font-mono text-xs text-muted" role="status">
          Loading model…
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted" role="alert">
          This model couldn't load. Try refreshing the page.
        </div>
      )}
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 bg-black/50 px-2 py-1 font-mono text-[0.62rem] text-cream/60 opacity-0 transition-opacity group-hover:opacity-100">
        DRAG TO ROTATE · SCROLL TO ZOOM
      </span>
    </div>
  );
}
