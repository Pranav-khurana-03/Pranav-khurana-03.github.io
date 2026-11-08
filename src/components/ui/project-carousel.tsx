import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ModelViewerWrapper } from "@/components/ui/model-viewer-wrapper";
import { VideoSlot } from "@/components/ui/video-slot";
import { ImageTabs } from "@/components/ui/image-tabs";
import { ControlLoopDiagram } from "@/components/visuals/control-loop-diagram";
import type { CadProject } from "@/data/portfolio";

export function BulletList({ items, dark }: { items?: string[]; dark?: boolean }) {
  if (!items?.length) return null;
  return (
    <ul className={`mb-6 space-y-2 text-sm ${dark ? "text-muted-2" : "text-[#3f3d39]"}`}>
      {items.map((p) => (
        <li key={p} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-mid">{p}</li>
      ))}
    </ul>
  );
}

export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="bg-rule px-2 py-1 font-mono text-[0.68rem] text-[#4d4b47]">{t}</li>
      ))}
    </ul>
  );
}

/* One card cycling several models, one tab per model. */
export function ProjectCarousel({ project }: { project: CadProject }) {
  const slides = project.slides ?? [];
  const [i, setI] = useState(0);
  const go = (n: number) => setI((n + slides.length) % slides.length);
  const s = slides[i];
  if (!s) return null;

  return (
    <article className="grid border border-rule bg-paper-2 lg:grid-cols-2" aria-roledescription="carousel" aria-label={project.title}>
      <div className="relative h-[380px] bg-[#0b0e11] lg:h-[520px]">
        {/* Video slides leave room at the bottom so the tab bar doesn't cover the player controls. */}
        <div className={`h-full ${s.video ? "pb-16" : ""}`}>
          {s.visual === "control-loop"
            ? <ControlLoopDiagram key={s.label} />
            : s.images
            ? <ImageTabs key={s.label} views={s.images} tabsAt="top" />
            : s.video
            ? <VideoSlot key={s.label} url={s.video.url} poster={s.video.poster} caption={s.video.caption} alt={s.title} />
            : <ModelViewerWrapper key={s.glbFileUrl ?? s.label} src={s.glbFileUrl} imageUrl={s.imageUrl} alt={s.title} label={s.label} />}
        </div>
        <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute bottom-3.5 left-3 grid size-11 place-items-center border border-line bg-ink/85 text-cream hover:border-cream/40">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute bottom-3.5 right-3 grid size-11 place-items-center border border-line bg-ink/85 text-cream hover:border-cream/40">
          <ChevronRight size={18} />
        </button>
        <div className="absolute inset-x-0 bottom-3.5 flex justify-center">
          <div role="tablist" className="flex gap-0.5 border border-line bg-ink/85 p-0.5">
            {slides.map((sl, n) => (
              <button key={sl.label} role="tab" aria-selected={n === i} onClick={() => go(n)}
                className={`h-11 px-3 font-mono text-[0.66rem] uppercase tracking-wide ${n === i ? "bg-cream text-dark" : "text-muted-2"}`}>
                {sl.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center border-t border-rule p-8 text-dark lg:border-l lg:border-t-0 lg:p-12" aria-live="polite">
        <p className="mb-4 text-sm text-mid"><b className="font-medium text-dark">{project.role}</b><br />{project.organization} · {project.dateRange}</p>
        <h3 className="mb-4 text-4xl">{s.title}</h3>
        <p className="mb-5 text-mid">{s.description}</p>
        <BulletList items={s.points} />
        <Tags items={s.tags} />
        {project.externalLink && <a href={project.externalLink.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-1.5 self-start border border-dark px-5 text-sm font-medium text-dark hover:bg-dark hover:text-cream">{project.externalLink.label} <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </article>
  );
}
