import { useEffect, useMemo, useState } from "react";
import { ghostRobotics, type AutoSegment } from "@/data/portfolio";
import { BLUE_GOAL, ROBOT, clamp, type Pt } from "@/lib/shooter";
import { Code, Panel, Stat, StatGrid, Strong, drawGridAndGoal, fieldScale, useCanvas } from "./shared";

const SPEED = 48, DWELL = 1; // illustrative drive speed (in/s) and gate dwell (s); not measured
const { poses, segments } = ghostRobotics.auto21;

const bez = (pts: Pt[], t: number): Pt => {
  const u = 1 - t;
  if (pts.length === 2) return { x: u * pts[0].x + t * pts[1].x, y: u * pts[0].y + t * pts[1].y };
  return { x: u * u * pts[0].x + 2 * u * t * pts[1].x + t * t * pts[2].x, y: u * u * pts[0].y + 2 * u * t * pts[1].y + t * t * pts[2].y };
};
const deriv = (pts: Pt[], t: number): Pt => {
  const u = 1 - t;
  if (pts.length === 2) return { x: pts[1].x - pts[0].x, y: pts[1].y - pts[0].y };
  return { x: 2 * u * (pts[1].x - pts[0].x) + 2 * t * (pts[2].x - pts[1].x), y: 2 * u * (pts[1].y - pts[0].y) + 2 * t * (pts[2].y - pts[1].y) };
};
const headingAt = (s: AutoSegment, t: number) => {
  const h = s.heading;
  if (h.kind === "const") return h.deg;
  if (h.kind === "linear") return h.from + (h.to - h.from) * t;
  const d = deriv(s.pts, t), a = (Math.atan2(d.y, d.x) * 180) / Math.PI;
  return h.reversed ? a + 180 : a;
};
const pathLen = (s: AutoSegment) => { let L = 0, p = s.pts[0]; for (let i = 1; i <= 40; i++) { const q = bez(s.pts, i / 40); L += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return L; };

interface Timed extends AutoSegment { drive: number; t0: number; end: number }
function buildTimeline() {
  let clock = 0, vol = 0;
  const segs: Timed[] = segments.map((s) => {
    const drive = pathLen(s) / SPEED, t0 = clock, end = clock + drive + (s.dwell ? DWELL : 0);
    clock = end;
    return { ...s, drive, t0, end };
  });
  const volleyAfter = segs.map((s) => (s.kind === "score" ? ++vol : vol));
  return { segs, total: clock, volleyAfter };
}

export default function Auto21Paths() {
  const { segs, total, volleyAfter } = useMemo(buildTimeline, []);
  const [time, setTime] = useState(0), [playing, setPlaying] = useState(false);

  const locate = (tm: number) => {
    let i = segs.findIndex((s) => tm < s.end);
    if (i < 0) i = segs.length - 1;
    const s = segs[i], u = clamp((tm - s.t0) / s.drive, 0, 1);
    return { i, s, u, p: bez(s.pts, u), h: headingAt(s, u), firing: s.threshold !== undefined && u >= s.threshold };
  };
  const cur = locate(time);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      let done = false;
      setTime((t) => { const n = t + dt * 1.4; if (n >= total) { done = true; return total - 1e-3; } return n; });
      if (done) setPlaying(false); else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  const ref = useCanvas((ctx, w) => {
    const { sc, P } = fieldScale(w);
    drawGridAndGoal(ctx, w, BLUE_GOAL, true);
    const [gx, gy] = P(BLUE_GOAL);
    const strokePath = (s: AutoSegment, col: string, lw: number, alpha: number) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const [x, y] = P(bez(s.pts, i / 40)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
    };
    const tag = (p: Pt, text: string, dx = 8, dy = -8, col = "#b3b9bf") => { const [x, y] = P(p); ctx.fillStyle = col; ctx.font = "500 10px 'IBM Plex Mono',monospace"; ctx.fillText(text, x + dx, y + dy); };
    const dot = (p: Pt, col: string, r = 4.5, hollow = false) => { const [x, y] = P(p); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (hollow) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } };

    dot(poses.spike3, "rgba(179,185,191,.4)", 4, true); tag(poses.spike3, "spike 3 (off)", 8, 4, "rgba(138,145,153,.8)");
    segs.forEach((s, i) => { if (i !== cur.i) strokePath(s, s.kind === "collect" ? "#b3b9bf" : "#ff6b35", 1.6, 0.3); });
    const a = cur.s;
    strokePath(a, a.kind === "collect" ? "#f1efe9" : "#ff6b35", 3, 1);
    if (a.threshold !== undefined) {
      ctx.save(); ctx.strokeStyle = "#ff6b35"; ctx.lineWidth = 6; ctx.setLineDash([2, 5]); ctx.globalAlpha = 0.9; ctx.beginPath();
      const i0 = Math.round(a.threshold * 40);
      for (let i = i0; i <= 40; i++) { const [x, y] = P(bez(a.pts, i / 40)); i === i0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    dot(poses.start, "#f1efe9", 5); tag(poses.start, "START");
    dot(poses.shoot, "#ff6b35", 6); tag(poses.shoot, "SHOOT POSE", 10, -8, "#ff6b35");
    dot(poses.spike2, "#b3b9bf"); tag(poses.spike2, "spike 2", 8, -10);
    dot(poses.gate, "#b3b9bf"); tag(poses.gate, "gate", 8, 14);
    dot(poses.spike1, "#b3b9bf"); tag(poses.spike1, "spike 1");

    const [rx, ry] = P(cur.p), half = (ROBOT / 2) * sc;
    if (cur.firing) { ctx.strokeStyle = "rgba(255,107,53,.85)"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]); }
    ctx.save(); ctx.translate(rx, ry); ctx.rotate((-cur.h * Math.PI) / 180);
    ctx.fillStyle = "rgba(28,34,40,.96)"; ctx.strokeStyle = "#f1efe9"; ctx.lineWidth = 1.6;
    ctx.fillRect(-half, -half, half * 2, half * 2); ctx.strokeRect(-half, -half, half * 2, half * 2);
    ctx.fillStyle = "#f1efe9"; ctx.fillRect(half - 3, -half * 0.5, 3, half); ctx.restore();
    if (cur.firing) { ctx.fillStyle = "#ff6b35"; ctx.font = "500 11px 'IBM Plex Mono',monospace"; ctx.fillText("FIRING", rx + half + 6, ry - half); }
  }, [time, segs]);

  // a volley counts once the firing window opens on its return path
  const vol = volleyAfter[cur.i] - (cur.s.kind === "score" && !cur.firing ? 1 : 0);
  const goTo = (i: number) => { setTime(segs[clamp(i, 0, segs.length - 1)].t0); setPlaying(false); };

  return (
    <div>
      <p className="mb-6 max-w-[70ch] text-sm text-muted-2">
        Seven scoring trips from one starting spot: the preload, two spike lines, and four runs to the gate. Every path is a Bézier curve built with Pedro Pathing, and the robot starts firing before it has stopped. Press play or click a step.
      </p>
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="border border-line bg-[#0b0e11]">
          <canvas ref={ref} role="img" aria-label="Top-down field with the robot's planned autonomous path" className="block aspect-square w-full" />
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-3 py-2.5 font-mono text-[0.64rem] uppercase tracking-wide text-muted-2">
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-muted-2 align-middle" />Collect</li>
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-sig align-middle" />Return and score</li>
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-dotted border-sig align-middle" />Firing window</li>
          </ul>
          <div className="flex items-center gap-2.5 border-t border-line p-3">
            <button type="button" aria-pressed={playing} onClick={() => { if (!playing && time >= total - 0.01) setTime(0); setPlaying((p) => !p); }} className="h-11 min-w-20 border border-cream bg-cream px-4 font-mono text-xs uppercase tracking-wider text-dark">{playing ? "Pause" : "Play"}</button>
            <button type="button" aria-label="Previous step" onClick={() => goTo(cur.i - 1)} className="h-11 min-w-11 border border-line font-mono text-xs">&lt;</button>
            <input type="range" min={0} max={1000} value={Math.round((time / total) * 1000)} onChange={(e) => { setTime((+e.target.value / 1000) * total); setPlaying(false); }} aria-label="Timeline" className="h-11 flex-1 accent-sig" />
            <button type="button" aria-label="Next step" onClick={() => goTo(cur.i + 1)} className="h-11 min-w-11 border border-line font-mono text-xs">&gt;</button>
          </div>
        </div>
        <div>
          <div className="mb-3.5">
            <StatGrid cols={3}>
              <Stat label="Step" value={`${cur.i + 1}/${segs.length}`} />
              <Stat hot label="Volleys" value={`${vol}/7`} />
              <Stat hot label="Artifacts" value={`${vol * 3}/21`} />
            </StatGrid>
          </div>
          <Panel className="p-2">
            <ol>
              {segs.map((s, i) => (
                <li key={i}>
                  <button type="button" aria-current={i === cur.i ? "step" : undefined} onClick={() => goTo(i)}
                    className={`grid min-h-11 w-full grid-cols-[28px_1fr] gap-2 border-l-2 px-2.5 py-1.5 text-left text-sm ${i === cur.i ? "border-sig bg-ink-3 text-cream" : "border-line text-muted-2"}`}>
                    <span className="pt-0.5 font-mono text-xs text-muted">{i + 1}</span>
                    <span><b className={`font-medium ${s.kind === "score" ? "text-sig" : ""}`}>{s.name}</b><small className="block text-xs text-muted">{s.sub}</small></span>
                  </button>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
      <Panel className="mt-6">
        <h3 className="mb-3 text-xl">What to notice</h3>
        <ul className="ml-5 list-disc space-y-2 text-sm text-muted-2 marker:text-muted">
          <li><Strong>It shoots on the move.</Strong> Each return path starts the shot once the follower is 60% of the way along (70% on the last one), so the robot is still driving into the shooting pose when the first ball leaves.</li>
          <li><Strong>The turret does the aiming.</Strong> The chassis heading comes from the path (a constant 180° heading, or tangent-reversed on the way back), and the turret angle is set from it so the shooter stays on the goal.</li>
          <li><Strong>One command per action.</Strong> The routine is a sequence of parallel commands, each pairing a path with a job: <Code>FollowPedro</Code> with <Code>CollectSpikesPedro</Code>, <Code>GateCollectPedro</Code>, or <Code>BangBangBang</Code> for the shot. I own the sequencing class, <Code>SequentialCommand</Code>.</li>
          <li><Strong>Fixed shot settings.</Strong> The auto holds flywheel speed at 140 and the hood at 0.48. That sits close to what the TeleOp lookup table gives for this spot, about 2 m from the goal.</li>
        </ul>
      </Panel>
      <p className="mt-4 max-w-[92ch] text-xs text-muted">
        Drawn from Blue21.java on the DECODE repo's Jesus branch, using its real poses and control points, in the 144 in Pedro Pathing frame. The matching spike 3 route is commented out in the code, so it is not part of the run and is shown only as a faint marker. Timing is illustrative, not measured. The 21-artifact total comes from counting seven volleys of three, and it is not a constant in the code.
      </p>
    </div>
  );
}
