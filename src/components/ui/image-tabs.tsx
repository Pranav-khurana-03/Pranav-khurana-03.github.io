import { useState } from "react";

export interface ImageView {
  src: string;
  alt: string;
  label: string;
}

/* One image, or tabs between several views of the same thing. */
export function ImageTabs({ views, fit = "contain", tabsAt = "bottom" }: { views: ImageView[]; fit?: "contain" | "cover"; tabsAt?: "top" | "bottom" }) {
  const [i, setI] = useState(0);
  const v = views[i];
  if (!v) return null;
  return (
    <div className="relative h-full w-full bg-[#0b0e11]">
      <img
        key={v.src}
        src={v.src}
        alt={v.alt}
        loading="lazy"
        className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
      />
      {views.length > 1 && (
        <div className={`absolute inset-x-0 flex justify-center ${tabsAt === "top" ? "top-3.5" : "bottom-3.5"}`}>
          <div role="tablist" aria-label="Views" className="flex gap-0.5 border border-line bg-ink/85 p-0.5">
            {views.map((view, n) => (
              <button
                key={view.src}
                role="tab"
                aria-selected={n === i}
                onClick={() => setI(n)}
                className={`h-11 px-3 font-mono text-[0.66rem] uppercase tracking-wide ${n === i ? "bg-cream text-dark" : "text-muted-2"}`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
