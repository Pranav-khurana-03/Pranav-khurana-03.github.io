import { ghostRobotics } from "@/data/portfolio";

/* Shooter math ported from Camera.java, ShooterLUT.java and Shooter.java (FTC 3565, DECODE). */
export const IN = 39.37; // inches per meter
export const COS19 = Math.cos((19 * Math.PI) / 180);
export const FIELD = 144; // inches, Pedro Pathing frame
export const ROBOT = 18; // drawn robot size, inches

export interface Pt { x: number; y: number }
export const BLUE_GOAL: Pt = { x: 0, y: FIELD };
export const RED_GOAL: Pt = { x: FIELD, y: FIELD };

export const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* Monotone cubic interpolation, same scheme as FTCLib's InterpLUT */
export function makeLUT(pts: [number, number][]) {
  const n = pts.length, X = pts.map((p) => p[0]), Y = pts.map((p) => p[1]), d: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) d[i] = (Y[i + 1] - Y[i]) / (X[i + 1] - X[i]);
  m[0] = d[0];
  for (let i = 1; i < n - 1; i++) m[i] = (d[i - 1] + d[i]) / 2;
  m[n - 1] = d[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x: number) => {
    if (x <= X[0]) return Y[0];
    if (x >= X[n - 1]) return Y[n - 1];
    let i = 0;
    while (x >= X[i + 1]) i++;
    const h = X[i + 1] - X[i], t = (x - X[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

const speedLUT = makeLUT(ghostRobotics.lut.speed);
const hoodLUT = makeLUT(ghostRobotics.lut.hood);
export const getSpeed = (d: number) => (d === 0 ? 0 : d >= 3.8 ? 198 : Math.trunc(speedLUT(d)));
export const getHood = (d: number) => (d === 0 ? 0.98 : d >= 3.8 ? 0.36 : hoodLUT(d));

/** distance = hypot(x, y) * cos(19 deg), in meters, with the goal as origin */
export const distanceM = (p: Pt, goal: Pt) => Math.hypot((p.x - goal.x) / IN, (p.y - goal.y) / IN) * COS19;

/** The turret faces the robot's rear, so the code feeds it heading - 180. */
export const turretAngle = (p: Pt, goal: Pt, headingDeg: number) =>
  norm((Math.atan2(goal.y - p.y, goal.x - p.x) * 180) / Math.PI - (headingDeg - 180));

export function turretServo(angle: number) {
  const pos = (angle / 90) * 0.28 + 0.499, posC = clamp(pos, 0.05, 0.95);
  return { pos, posC, clipped: pos !== posC, actual: ((posC - 0.499) * 90) / 0.28 };
}

/** Air-time constant k: 0.37 with the left trigger held, else 0.12 past 2.8 m and 0.23 close. */
export const airTimeK = (dist: number, trigger: boolean) => (trigger ? 0.37 : dist > 2.8 ? 0.12 : 0.23);

/** Camera.getLeadPose(): lead = pose + velocity * (distance * k) */
export function leadModel(p: Pt, speedIps: number, dirDeg: number, headingDeg: number, goal: Pt, trigger: boolean) {
  const dist = distanceM(p, goal), k = airTimeK(dist, trigger), T = dist * k;
  const vx = speedIps * Math.cos((dirDeg * Math.PI) / 180), vy = speedIps * Math.sin((dirDeg * Math.PI) / 180);
  const lead: Pt = { x: p.x + vx * T, y: p.y + vy * T };
  const dist2 = distanceM(lead, goal);
  return { dist, k, T, vx, vy, lead, naive: turretAngle(p, goal, headingDeg), aimed: turretAngle(lead, goal, headingDeg), fw: getSpeed(dist), fw2: getSpeed(dist2) };
}
