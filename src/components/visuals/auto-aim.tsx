import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { BLUE_GOAL, COS19, IN, RED_GOAL, ROBOT, clamp, distanceM, getHood, getSpeed, norm, turretAngle, turretServo, type Pt } from "@/lib/shooter";
import { Code, Panel, RangeRow, Seg, Stat, StatGrid, Steps, Strong, drawGridAndGoal, fieldScale, pointerToField, useCanvas } from "./shared";

interface Pose { x: number; y: number; h: number }

function Chart({ fn, lo, hi, d, fmt, label }: { fn: (d: number) => number; lo: number; hi: number; d: number; fmt: (v: number) => string; label: string }) {
  const ref = useCanvas((k, w, h) => {
    const X = (v: number) => 8 + (v / 4.4) * (w - 16), Y = (v: number) => h - 14 - ((v - lo) / (hi - lo)) * (h - 26);
    k.fillStyle = "rgba(255,107,53,.08)"; k.fillRect(X(3.8), 0, w, h);
    k.strokeStyle = "rgba(255,107,53,.4)"; k.setLineDash([3, 3]); k.beginPath(); k.moveTo(X(2.8), 0); k.lineTo(X(2.8), h); k.stroke(); k.setLineDash([]);
    k.strokeStyle = "#b3b9bf"; k.lineWidth = 1.5; k.beginPath();
    for (let v = 0.01; v <= 4.4; v += 0.02) { const y = fn(v); v < 0.02 ? k.moveTo(X(v), Y(y)) : k.lineTo(X(v), Y(y)); }
    k.stroke();
    const cd = Math.min(d, 4.4);
    k.fillStyle = "#ff6b35"; k.beginPath(); k.arc(X(cd), Y(fn(cd)), 4.5, 0, 7); k.fill();
    k.fillStyle = "#8a9199"; k.font = "500 9px 'IBM Plex Mono',monospace"; k.fillText("0", 8, h - 3); k.fillText("4.4", w - 22, h - 3); k.fillText(fmt(fn(cd)), 8, 12);
  }, [d, fn, lo, hi, fmt]);
  return (
    <figure>
      <canvas ref={ref} aria-label={label} className="block h-[130px] w-full border border-line bg-[#0b0e11]" />
      <figcaption className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted">{label}</figcaption>
    </figure>
  );
}

const fmtSpeed = (v: number) => String(Math.round(v)), fmtHood = (v: number) => v.toFixed(2);

export default function AutoAim() {
  const [s, setS] = useState<Pose>({ x: 58.7, y: 84.9, h: 180 });
  const [alliance, setAlliance] = useState<"blue" | "red">("blue");
  const [dragging, setDragging] = useState(false);
  const goal: Pt = alliance === "blue" ? BLUE_GOAL : RED_GOAL;

  const dist = distanceM(s, goal), turret = turretAngle(s, goal, s.h), servo = turretServo(turret);
  const speed = getSpeed(dist), hood = getHood(dist), far = dist > 2.8, beyond = dist >= 3.8;
  const distIn = Math.hypot(s.x - goal.x, s.y - goal.y);

  const ref = useCanvas((ctx, w) => {
    const { sc, P } = fieldScale(w);
    drawGridAndGoal(ctx, w, goal, alliance === "blue");
    const [gx, gy] = P(goal);
    const ring = (d: number, col: string, dash: number[], label: string) => {
      const rad = (d / COS19) * IN * sc;
      ctx.beginPath(); ctx.arc(gx, gy, rad, 0, Math.PI * 2); ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(179,185,191,.6)"; ctx.font = "500 10px 'IBM Plex Mono',monospace";
      const lx = alliance === "blue" ? gx + rad * Math.cos(Math.PI / 4) : gx - rad * Math.cos(Math.PI / 4) - 30, ly = gy + rad * Math.sin(Math.PI / 4);
      if (lx > 0 && lx < w - 20 && ly < w - 4) ctx.fillText(label, lx + 4, ly);
    };
    ring(1, "rgba(241,239,233,.1)", [2, 4], "1 m"); ring(2, "rgba(241,239,233,.1)", [2, 4], "2 m");
    ring(2.8, "rgba(255,107,53,.45)", [5, 4], "2.8 far"); ring(3.8, "rgba(255,107,53,.8)", [], "3.8 table ends");

    const [cx, cy] = P(s), half = (ROBOT / 2) * sc;
    ctx.strokeStyle = "rgba(255,107,53,.5)"; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((-s.h * Math.PI) / 180);
    ctx.fillStyle = "rgba(28,34,40,.95)"; ctx.strokeStyle = "#f1efe9"; ctx.lineWidth = 1.5;
    ctx.fillRect(-half, -half, half * 2, half * 2); ctx.strokeRect(-half, -half, half * 2, half * 2);
    ctx.fillStyle = "#f1efe9"; ctx.fillRect(half - 3, -half * 0.5, 3, half);
    ctx.font = "500 9px 'IBM Plex Mono',monospace"; ctx.fillStyle = "#8a9199"; ctx.fillText("FRONT", half - 30, -half - 4);
    ctx.restore();
    // turret: rear-mounted, 0 deg = robot rear, so field direction = (heading - 180) + turret angle
    const L = half * 2.1, dir = ((s.h - 180 + servo.actual) * Math.PI) / 180;
    if (servo.clipped) {
      const ideal = ((s.h - 180 + turret) * Math.PI) / 180;
      ctx.strokeStyle = "rgba(255,107,53,.35)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ideal) * L, cy - Math.sin(ideal) * L); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = "#ff6b35"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(dir) * L, cy - Math.sin(dir) * L); ctx.stroke();
    ctx.fillStyle = "#ff6b35"; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
  }, [s, alliance]);

  const place = (e: PointerEvent<HTMLCanvasElement>) => { const p = pointerToField(e); setS((o) => ({ ...o, x: clamp(p.x, 9, 135), y: clamp(p.y, 9, 135) })); };
  const onKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const k = e.key.toLowerCase(), st = e.shiftKey ? 6 : 2;
    const moves: Record<string, Partial<Pose> | undefined> = { arrowleft: { x: s.x - st }, arrowright: { x: s.x + st }, arrowup: { y: s.y + st }, arrowdown: { y: s.y - st }, q: { h: norm(s.h + 5) }, e: { h: norm(s.h - 5) } };
    const m = moves[k];
    if (!m) return;
    e.preventDefault();
    setS((o) => { const n = { ...o, ...m }; return { ...n, x: clamp(n.x, 9, 135), y: clamp(n.y, 9, 135) }; });
  };

  return (
    <div>
      <p className="mb-6 max-w-[68ch] text-sm text-muted-2">
        Drag the robot around the field. The turret angle, flywheel speed and hood position are recomputed from the robot's distance to the goal, the same way the TeleOp does it with the Limelight, odometry and a lookup table.
      </p>
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative border border-line bg-[#0b0e11]">
          <canvas ref={ref} tabIndex={0} role="img" aria-label="Top-down FTC field. Drag the robot to move it. Arrow keys move, Q and E rotate."
            onPointerDown={(e) => { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); place(e); }}
            onPointerMove={(e) => dragging && place(e)} onPointerUp={() => setDragging(false)} onKeyDown={onKey}
            className="block aspect-square w-full touch-none cursor-grab active:cursor-grabbing" />
          <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted">Drag robot · arrows move · Q / E rotate</span>
        </div>
        <div>
          <Seg label="Alliance goal" value={alliance} onChange={(v) => setAlliance(v as "blue" | "red")} options={[{ id: "blue", text: "Blue goal" }, { id: "red", text: "Red goal" }]} />
          <Panel>
            <span className={`mb-3 inline-block border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider ${far ? "border-sig text-sig" : "border-line text-muted-2"}`}>
              {beyond ? "Beyond table: fixed far shot" : far ? "Far shot (transfer 0.85)" : "Close shot"}
            </span>
            <StatGrid>
              <Stat label="Distance to goal" value={dist.toFixed(2)} unit="m" note={`${distIn.toFixed(0)} in straight-line`} />
              <Stat hot label="Turret angle" value={servo.actual.toFixed(1)} unit="deg" note={`servo ${servo.posC.toFixed(3)}${servo.clipped ? " · at turret limit" : ""}`} />
              <Stat hot label="Flywheel target" value={speed} unit="code units" note={beyond ? "fixed far value" : "from lookup table"} />
              <Stat hot label="Hood position" value={hood.toFixed(3)} note={`servo ${(1 - clamp(hood, 0.3, 1)).toFixed(3)}`} />
            </StatGrid>
          </Panel>
          <Panel>
            <RangeRow id="aa-x" label="Robot X" min={9} max={135} step={0.5} value={s.x} onChange={(v) => setS((o) => ({ ...o, x: v }))} display={`${s.x.toFixed(0)} in`} />
            <RangeRow id="aa-y" label="Robot Y" min={9} max={135} step={0.5} value={s.y} onChange={(v) => setS((o) => ({ ...o, y: v }))} display={`${s.y.toFixed(0)} in`} />
            <RangeRow id="aa-h" label="Heading" min={-180} max={180} value={s.h} onChange={(v) => setS((o) => ({ ...o, h: v }))} display={`${s.h.toFixed(0)}°`} />
          </Panel>
          <div className="grid grid-cols-2 gap-3">
            <Chart fn={getSpeed} lo={0} hi={210} d={dist} fmt={fmtSpeed} label="Flywheel vs distance (m)" />
            <Chart fn={getHood} lo={0.3} hi={1} d={dist} fmt={fmtHood} label="Hood vs distance (m)" />
          </div>
        </div>
      </div>
      <Panel className="mt-6">
        <h3 className="mb-3 text-xl">How it works</h3>
        <Steps items={[
          <><Strong>Know where the robot is.</Strong> A goBILDA Pinpoint odometry computer tracks X, Y and heading. When the Limelight sees the goal AprilTag (ID 20 blue, 24 red) and the robot is moving slowly, its MegaTag2 pose resets the odometry, so drift never builds up.</>,
          <><Strong>Turn position into distance.</Strong> <Code>distance = hypot(x, y) × cos(19°)</Code>, in meters, with the goal at the origin.</>,
          <><Strong>Aim the turret.</Strong> The angle to the goal, minus the chassis heading, becomes a turret angle. The turret is mounted facing the robot's rear, so the code passes <Code>heading − 180</Code>. Servo position is <Code>angle / 90 × 0.28 + 0.499</Code>, clamped to 0.05 to 0.95.</>,
          <><Strong>Look up flywheel speed and hood.</Strong> Distance goes into two measured tables that are smoothly interpolated between points. Past 3.8 m the code switches to fixed far-shot values (198 and 0.36). Past 2.8 m the shot counts as far and the transfer slows to 0.85.</>,
        ]} />
      </Panel>
      <p className="mt-4 max-w-[90ch] text-xs text-muted">
        Built from Camera.java, ShooterLUT.java and Shooter.java on the DECODE repo's Jesus branch. The goal point is approximated at the field corner, the robot is drawn at 18 in, and flywheel speed is in the code's own units.
      </p>
    </div>
  );
}
