import { useCallback, useEffect, useRef, type DependencyList, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { FIELD, type Pt } from "@/lib/shooter";

/* Canvas that repaints on resize and whenever `deps` change. */
export function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: DependencyList) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  const paint = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const d = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawRef.current(ctx, w, h);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ro = new ResizeObserver(paint);
    ro.observe(c);
    return () => ro.disconnect();
  }, [paint]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(paint, deps);
  return ref;
}

/** Field inches (origin bottom-left, y up) to canvas pixels. */
export const fieldScale = (w: number) => {
  const sc = w / FIELD;
  return { sc, P: (p: Pt): [number, number] => [p.x * sc, (FIELD - p.y) * sc] };
};

export function pointerToField(e: RPointerEvent<HTMLCanvasElement>): Pt {
  const b = e.currentTarget.getBoundingClientRect();
  return { x: ((e.clientX - b.left) / b.width) * FIELD, y: FIELD - ((e.clientY - b.top) / b.height) * FIELD };
}

export function drawGridAndGoal(ctx: CanvasRenderingContext2D, w: number, goal: Pt, blue: boolean) {
  const { sc, P } = fieldScale(w);
  ctx.strokeStyle = "rgba(127,140,150,.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 6; i++) { const v = i * 24 * sc; ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, w); ctx.moveTo(0, v); ctx.lineTo(w, v); ctx.stroke(); }
  const [gx, gy] = P(goal), s = 26 * sc, sx = goal.x === 0 ? 1 : -1;
  ctx.fillStyle = blue ? "rgba(90,140,255,.55)" : "rgba(255,90,90,.55)";
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + sx * s, gy); ctx.lineTo(gx, gy + s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f1efe9";
  ctx.font = "500 11px 'IBM Plex Mono',monospace";
  ctx.fillText("GOAL", gx + (sx > 0 ? 6 : -40), gy + 14);
}

/* ── small UI pieces ── */
export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`mb-3.5 border border-line bg-ink-2 p-5 ${className}`}>{children}</div>
);

export const Stat = ({ label, value, unit, note, hot }: { label: string; value: ReactNode; unit?: string; note?: ReactNode; hot?: boolean }) => (
  <div className="bg-ink px-3.5 py-3">
    <small className="mb-0.5 block font-mono text-[0.62rem] uppercase tracking-wider text-muted">{label}</small>
    <b className={`font-serif text-3xl font-normal leading-tight ${hot ? "text-sig" : ""}`}>{value}</b>
    {unit && <span className="ml-1 text-xs text-muted">{unit}</span>}
    {note && <div className="text-xs text-muted">{note}</div>}
  </div>
);

export const StatGrid = ({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) => (
  <div className={`grid gap-px border border-line bg-line ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>{children}</div>
);

export function Seg({ label, options, value, onChange }: { label: string; options: { id: string; text: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div role="group" aria-label={label} className="mb-3 mr-2 inline-flex flex-wrap border border-line">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
          className={`h-11 px-3.5 font-mono text-[0.7rem] uppercase tracking-wide ${value === o.id ? "bg-cream text-dark" : "text-muted-2 hover:text-cream"}`}>
          {o.text}
        </button>
      ))}
    </div>
  );
}

export function RangeRow({ id, label, min, max, step = 1, value, onChange, display }: { id: string; label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; display: string }) {
  return (
    <div className="mb-2 grid grid-cols-[90px_1fr_64px] items-center gap-2.5 text-sm text-muted-2">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="h-11 w-full accent-sig" />
      <output htmlFor={id} className="text-right font-mono text-xs text-cream">{display}</output>
    </div>
  );
}

export const ActionButton = ({ children, onClick, ghost, pressed }: { children: ReactNode; onClick: () => void; ghost?: boolean; pressed?: boolean }) => (
  <button type="button" onClick={onClick} aria-pressed={pressed}
    className={`mb-3 mr-2 h-11 border px-5 font-mono text-xs uppercase tracking-wider ${ghost ? (pressed ? "border-sig text-sig" : "border-line text-cream") : "border-cream bg-cream text-dark"}`}>
    {children}
  </button>
);

export const Steps = ({ items }: { items: ReactNode[] }) => (
  <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-2 marker:text-muted">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ol>
);

export const Code = ({ children }: { children: ReactNode }) => <code className="bg-ink-3 px-1.5 py-px font-mono text-[0.8em] text-cream">{children}</code>;
export const Strong = ({ children }: { children: ReactNode }) => <b className="font-medium text-cream">{children}</b>;
