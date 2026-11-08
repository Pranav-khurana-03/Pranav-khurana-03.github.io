import { Fragment, useEffect, useReducer, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { BLUE_GOAL, ROBOT, clamp, leadModel, norm, type Pt } from "@/lib/shooter";
import { ActionButton, Code, Panel, RangeRow, Seg, Stat, StatGrid, Steps, Strong, drawGridAndGoal, fieldScale, pointerToField, useCanvas } from "./shared";

interface Ball { key: "naive" | "lead" | "alt"; label: string; col: string; hollow?: boolean; ux: number; uy: number }
interface Shot { t0: number; x0: number; y0: number; vx: number; vy: number; T: number; balls: Ball[]; done: boolean }
interface Result { key: string; label: string; col: string; off: number }
interface State { x: number; y: number; h: number; v: number; dir: number }

const GOAL = BLUE_GOAL;
const ballAt = (sh: Shot, b: Ball, tau: number): Pt => ({ x: sh.x0 + (sh.vx + b.ux) * tau, y: sh.y0 + (sh.vy + b.uy) * tau });

export default function ShootOnTheMove() {
  const reduce = useReducedMotion();
  const [s, setS] = useState<State>({ x: 70, y: 56, h: 180, v: 40, dir: 0 });
  const [trigger, setTrigger] = useState(false), [slow, setSlow] = useState(true), [alt, setAlt] = useState(false), [driving, setDriving] = useState(false), [flying, setFlying] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [frame, tick] = useReducer((n: number) => n + 1, 0);
  const [dragging, setDragging] = useState(false);
  const shot = useRef<Shot | null>(null);

  const m = leadModel(s, s.v, s.dir, s.h, GOAL, trigger);
  const speedF = slow ? 1 / 3 : 1;

  const reset = () => { shot.current = null; setResults([]); setFlying(false); };
  const finish = (sh: Shot) => {
    sh.done = true;
    setResults(sh.balls.map((b) => { const p = ballAt(sh, b, sh.T); return { key: b.key, label: b.label, col: b.col, off: Math.hypot(p.x - GOAL.x, p.y - GOAL.y) }; }));
  };

  const fire = () => {
    const T = Math.max(m.T, 0.05), dNow = Math.hypot(GOAL.x - s.x, GOAL.y - s.y), dPred = Math.hypot(GOAL.x - m.lead.x, GOAL.y - m.lead.y);
    const unit = (a: Pt, b: Pt): [number, number] => { const d = Math.hypot(b.x - a.x, b.y - a.y) || 1; return [(b.x - a.x) / d, (b.y - a.y) / d]; };
    const [nux, nuy] = unit(s, GOAL), [lux, luy] = unit(m.lead, GOAL), range = dNow / T; // muzzle speed from the current distance
    const balls: Ball[] = [
      { key: "naive", label: "Aimed straight at goal", col: "#ff5d5d", ux: nux * range, uy: nuy * range },
      { key: "lead", label: "Aimed from predicted spot", col: "#7fcf8f", ux: lux * range, uy: luy * range },
    ];
    if (alt) balls.push({ key: "alt", label: "Predicted spot + re-picked speed", col: "#7fcf8f", hollow: true, ux: (lux * dPred) / T, uy: (luy * dPred) / T });
    const sh: Shot = { t0: performance.now(), x0: s.x, y0: s.y, vx: m.vx, vy: m.vy, T, balls, done: false };
    shot.current = sh;
    if (reduce) { finish(sh); tick(); } else { setResults([]); setFlying(true); }
  };

  // animation loop: runs only while driving or while a ball is in the air
  useEffect(() => {
    if (!driving && !flying) return;
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (driving) {
        setS((o) => {
          let x = o.x + o.v * Math.cos((o.dir * Math.PI) / 180) * dt * speedF, y = o.y + o.v * Math.sin((o.dir * Math.PI) / 180) * dt * speedF, dir = o.dir;
          if (x < 9 || x > 135 || y < 9 || y > 135) { x = clamp(x, 9, 135); y = clamp(y, 9, 135); dir = norm(dir + 180); }
          return { ...o, x, y, dir };
        });
      }
      const sh = shot.current;
      if (sh && !sh.done && ((now - sh.t0) / 1000) * speedF >= sh.T) { finish(sh); setFlying(false); }
      tick();
      if (driving || (sh && !sh.done)) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [driving, flying, speedF]);

  const ref = useCanvas((ctx, w) => {
    const { sc, P } = fieldScale(w);
    drawGridAndGoal(ctx, w, GOAL, true);
    const [gx, gy] = P(GOAL), [rx, ry] = P(s), [qx, qy] = P(m.lead);
    ctx.setLineDash([6, 5]); ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(255,93,93,.6)"; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(gx, gy); ctx.stroke();
    ctx.strokeStyle = "rgba(127,207,143,.85)"; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]);
    // virtual goal = goal - velocity * airTime
    const [vx, vy] = P({ x: GOAL.x - m.vx * m.T, y: GOAL.y - m.vy * m.T });
    ctx.strokeStyle = "#7fcf8f"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(vx, vy - 7); ctx.lineTo(vx + 7, vy); ctx.lineTo(vx, vy + 7); ctx.lineTo(vx - 7, vy); ctx.closePath(); ctx.stroke();
    if (s.v > 0) { ctx.fillStyle = "rgba(127,207,143,.85)"; ctx.font = "500 9px 'IBM Plex Mono',monospace"; ctx.fillText("virtual goal", vx + 10, vy + 3); }

    const robot = (p: Pt, col: string, dash: number[], alpha: number) => {
      const [cx, cy] = P(p), half = (ROBOT / 2) * sc;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((-s.h * Math.PI) / 180); ctx.globalAlpha = alpha;
      ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.fillStyle = dash.length ? "rgba(255,107,53,.06)" : "rgba(28,34,40,.95)";
      ctx.fillRect(-half, -half, half * 2, half * 2); ctx.strokeRect(-half, -half, half * 2, half * 2);
      ctx.setLineDash([]); ctx.fillStyle = col; ctx.fillRect(half - 3, -half * 0.5, 3, half); ctx.restore();
    };
    robot(m.lead, "#ff6b35", [4, 4], 0.9);
    if (s.v > 0) {
      const ang = Math.atan2(qy - ry, qx - rx);
      ctx.strokeStyle = ctx.fillStyle = "#ff6b35"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(qx, qy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx - 9 * Math.cos(ang - 0.4), qy - 9 * Math.sin(ang - 0.4)); ctx.lineTo(qx - 9 * Math.cos(ang + 0.4), qy - 9 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
    }
    robot(s, "#f1efe9", [], 1);
    ctx.fillStyle = "#ff6b35"; ctx.beginPath(); ctx.arc(rx, ry, 3.5, 0, 7); ctx.fill();

    const sh = shot.current;
    if (sh) {
      const tau = sh.done ? sh.T : Math.min(((performance.now() - sh.t0) / 1000) * speedF, sh.T);
      for (const b of sh.balls) {
        const [sx, sy] = P({ x: sh.x0, y: sh.y0 }), [ex, ey] = P(ballAt(sh, b, tau));
        ctx.strokeStyle = b.col; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 7);
        if (b.hollow) { ctx.strokeStyle = b.col; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = b.col; ctx.fill(); }
        if (sh.done) { ctx.strokeStyle = b.col; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, 7); ctx.stroke(); }
      }
    }
  }, [s, trigger, frame, speedF, results]);

  const place = (e: PointerEvent<HTMLCanvasElement>) => { const p = pointerToField(e); reset(); setS((o) => ({ ...o, x: clamp(p.x, 9, 135), y: clamp(p.y, 9, 135) })); };
  const onKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const st = e.shiftKey ? 6 : 2, k = e.key.toLowerCase();
    const d: Record<string, [number, number] | undefined> = { arrowleft: [-st, 0], arrowright: [st, 0], arrowup: [0, st], arrowdown: [0, -st] };
    if (!d[k]) return;
    e.preventDefault(); reset();
    setS((o) => ({ ...o, x: clamp(o.x + d[k]![0], 9, 135), y: clamp(o.y + d[k]![1], 9, 135) }));
  };
  const setV = (patch: Partial<State>) => { reset(); setS((o) => ({ ...o, ...patch })); };

  return (
    <div>
      <p className="mb-6 max-w-[70ch] text-sm text-muted-2">
        A ball launched from a moving robot keeps the robot's sideways speed, so aiming straight at the goal misses. The TeleOp predicts where the robot will be when the ball arrives and aims from there. Set a velocity, then fire to compare the two shots.
      </p>
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="border border-line bg-[#0b0e11]">
          <canvas ref={ref} tabIndex={0} role="img" aria-label="Top-down field showing the robot, its predicted position, and two ball paths. Drag to move the robot."
            onPointerDown={(e) => { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); place(e); }}
            onPointerMove={(e) => dragging && place(e)} onPointerUp={() => setDragging(false)} onKeyDown={onKey}
            className="block aspect-square w-full touch-none cursor-grab" />
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-3 py-2.5 font-mono text-[0.64rem] uppercase tracking-wide text-muted-2">
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-cream align-middle" />Robot now</li>
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-dashed border-sig align-middle" />Robot predicted</li>
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-[#ff5d5d] align-middle" />Ball, aimed at goal</li>
            <li><span className="mr-1.5 inline-block w-4 border-t-2 border-[#7fcf8f] align-middle" />Ball, aimed from predicted spot</li>
          </ul>
        </div>
        <div>
          <Panel>
            <ActionButton onClick={fire}>Fire</ActionButton>
            <ActionButton ghost pressed={driving} onClick={() => setDriving((d) => !d)}>Drive</ActionButton>
            <Seg label="Air time constant" value={trigger ? "trig" : "auto"} onChange={(v) => { reset(); setTrigger(v === "trig"); }} options={[{ id: "auto", text: "Auto k" }, { id: "trig", text: "Trigger held" }]} />
            <Seg label="Playback speed" value={slow ? "slow" : "1x"} onChange={(v) => setSlow(v === "slow")} options={[{ id: "1x", text: "1×" }, { id: "slow", text: "Slow-mo" }]} />
            <RangeRow id="sm-v" label="Speed" min={0} max={60} value={s.v} onChange={(v) => setV({ v })} display={`${s.v} in/s`} />
            <RangeRow id="sm-d" label="Direction" min={-180} max={180} value={s.dir} onChange={(dir) => setV({ dir })} display={`${s.dir}°`} />
            <RangeRow id="sm-h" label="Heading" min={-180} max={180} value={s.h} onChange={(h) => setV({ h })} display={`${s.h}°`} />
            <label className="mt-1.5 flex items-start gap-2.5 text-sm text-muted-2">
              <input type="checkbox" checked={alt} onChange={(e) => { reset(); setAlt(e.target.checked); }} className="mt-1 size-4 accent-sig" />
              <span>Also re-pick flywheel speed from the predicted distance (a third, green-outlined shot)</span>
            </label>
          </Panel>
          <Panel>
            <StatGrid>
              <Stat label="Distance now" value={m.dist.toFixed(2)} unit="m" />
              <Stat label="Air time = d × k" value={m.T.toFixed(2)} unit="s" note={`k = ${m.k}`} />
              <Stat label="Predicted position" value={`${m.lead.x.toFixed(0)}, ${m.lead.y.toFixed(0)}`} note={`moves ${Math.hypot(m.lead.x - s.x, m.lead.y - s.y).toFixed(0)} in`} />
              <Stat hot label="Turret angle" value={m.aimed.toFixed(1)} unit="deg" note={`aimed at goal: ${m.naive.toFixed(1)} (shift ${norm(m.aimed - m.naive).toFixed(1)})`} />
              <Stat label="Flywheel (as coded)" value={m.fw} note="looked up at current distance" />
              <Stat label="If re-picked" value={m.fw2} note={`${m.fw2 - m.fw >= 0 ? "+" : ""}${m.fw2 - m.fw} vs coded`} />
            </StatGrid>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm" aria-live="polite">
              {results.map((r) => (<Fragment key={r.key}><span>{r.label}</span><b className="font-mono font-medium" style={{ color: r.col }}>{r.off.toFixed(1)} in off</b></Fragment>))}
            </div>
          </Panel>
        </div>
      </div>
      <Panel className="mt-6">
        <h3 className="mb-3 text-xl">The algorithm</h3>
        <Steps items={[
          <><Strong>Measure velocity.</Strong> The localizer differences the Pinpoint position every loop, giving X and Y velocity in inches per second.</>,
          <><Strong>Estimate air time.</Strong> <Code>airTime = distance × k</Code>, with distance in meters. <Code>k</Code> is 0.23 for a close shot, 0.12 past 2.8 m, and 0.37 while the driver holds the left trigger for a shoot-on-the-move shot.</>,
          <><Strong>Predict the robot.</Strong> <Code>leadPose = pose + velocity × airTime</Code>. This is where the robot will be when the ball arrives.</>,
          <><Strong>Aim from the prediction.</Strong> The turret angle is computed from the predicted position to the goal, not from where the robot is now. It is the same as aiming at a shifted virtual goal, <Code>goal − velocity × airTime</Code>, which the diamond marks.</>,
          <><Strong>Look up the flywheel.</Strong> Speed and hood come from the lookup table at the current distance.</>,
        ]} />
        <p className="mt-3 border-l-2 border-sig py-1.5 pl-3 text-sm text-muted-2">
          What the code does: the predicted position changes the turret angle only. In <Code>Camera.trackAprilTag</Code> the distance is not recomputed after the lead, so flywheel speed and hood stay on the current distance. The checkbox shows what re-picking would change. For a sideways drive the bearing is the big correction, and the range error is small.
        </p>
      </Panel>
      <p className="mt-4 max-w-[92ch] text-xs text-muted">
        Built from Camera.getLeadPose(), MainTeleOp.java and ShooterLUT.java on the DECODE repo's Jesus branch. The ball is a 2D top-down point with constant horizontal speed, and the goal point is approximated at the field corner. It illustrates the geometry and does not model drag, spin or height.
      </p>
    </div>
  );
}
