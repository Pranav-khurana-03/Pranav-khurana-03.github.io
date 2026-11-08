import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/* Illustration of a small feed-forward network on an MNIST-style digit:
   a forward pass lights the layers left to right, then backpropagation pushes the
   error back right to left. Layer sizes are illustrative, not a trained model's. */

const DIGIT = [
  "XXXXXXX.",
  ".....XX.",
  "....XX..",
  "...XX...",
  "..XX....",
  "..XX....",
  ".XX.....",
  ".XX.....",
];
const HIDDEN = 8;
const OUT = 10;
const TARGET = 7;
const CYCLE = 6; // seconds: forward 0-2.5, hold, backward 3-5.5, rest
const CREAM = "241,239,233";
const SIG = "255,107,53";

// Deterministic pseudo-random so edges and output scores are stable between frames.
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function NeuralNetViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [playing, setPlaying] = useState(!reduce);
  const playingRef = useRef(playing);
  const timeRef = useRef(reduce ? 2.7 : 0);
  const visibleRef = useRef(true);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0, raf = 0, last = performance.now();

    const fit = () => {
      const d = devicePixelRatio || 1;
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * d; cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      draw();
    };

    function draw() {
      const t = timeRef.current % CYCLE;
      const pf = clamp(t / 2.5);               // forward progress
      const pb = clamp((t - 3) / 2.5);         // backward progress
      const backward = t >= 3 && t < 5.5;
      ctx!.clearRect(0, 0, W, H);

      // layout
      const gridCell = Math.max(9, Math.min(20, (H - 120) / 8 / 1.0, W * 0.05));
      const gridSize = gridCell * 8;
      const xs = [W * 0.09, W * 0.4, W * 0.62, W * 0.84]; // grid-left, h1, h2, out
      const top = 64, bottom = H - 52;
      const spread = (n: number, i: number) => top + ((i + 0.5) / n) * (bottom - top);
      const gx = xs[0], gy = (top + bottom) / 2 - gridSize / 2;
      const layers = [
        null,
        Array.from({ length: HIDDEN }, (_, i) => ({ x: xs[1], y: spread(HIDDEN, i) })),
        Array.from({ length: HIDDEN }, (_, i) => ({ x: xs[2], y: spread(HIDDEN, i) })),
        Array.from({ length: OUT }, (_, i) => ({ x: xs[3], y: spread(OUT, i) })),
      ];
      const inputPts = Array.from({ length: 8 }, (_, i) => ({ x: gx + gridSize + 4, y: gy + (i + 0.5) * gridCell }));
      const sources = [inputPts, layers[1]!, layers[2]!];
      const targets = [layers[1]!, layers[2]!, layers[3]!];

      // how lit each layer is (0 to 1), and which direction is active
      const fwdLit = (L: number) => { const s = pf * 3; return t < 0.01 ? 0.06 : s >= L ? 0.35 + 0.65 * Math.max(0, 1 - (s - L)) : 0.06; };
      const bwdLit = (L: number) => { const q = (1 - pb) * 3; return backward && q <= L ? 0.35 + 0.65 * Math.max(0, 1 - (L - q)) : 0; };

      // edges
      for (let k = 0; k < 3; k++) {
        const fwdWave = t < 2.6 ? Math.max(0, 1 - Math.abs(pf * 3 - (k + 0.5)) * 1.3) : 0;
        const bwdWave = backward ? Math.max(0, 1 - Math.abs((1 - pb) * 3 - (k + 0.5)) * 1.3) : 0;
        sources[k].forEach((a, i) => targets[k].forEach((b, j) => {
          const w = rnd(k * 1000 + i * 31 + j);
          const base = 0.05 + w * 0.07;
          ctx!.lineWidth = 0.8;
          ctx!.strokeStyle = `rgba(${CREAM},${base + fwdWave * (0.1 + w * 0.3)})`;
          ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          if (bwdWave > 0) {
            ctx!.strokeStyle = `rgba(${SIG},${bwdWave * (0.08 + w * 0.4)})`;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }));
      }

      // input grid (a handwritten-style "7")
      const inLit = fwdLit(0), inBack = bwdLit(0);
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const on = DIGIT[r][c] === "X";
        const a = on ? 0.35 + 0.6 * inLit : 0.08;
        ctx!.fillStyle = `rgba(${inBack > 0 && on ? SIG : CREAM},${inBack > 0 && on ? 0.4 + inBack * 0.5 : a})`;
        ctx!.fillRect(gx + c * gridCell + 1, gy + r * gridCell + 1, gridCell - 2, gridCell - 2);
      }

      // hidden + output nodes
      ctx!.font = "500 10px 'IBM Plex Mono', monospace";
      for (let L = 1; L <= 3; L++) {
        layers[L]!.forEach((n, i) => {
          let f = fwdLit(L), b = bwdLit(L);
          if (L === 3) {
            const score = i === TARGET ? 1 : 0.1 + rnd(i + 7) * 0.25; // illustrative output scores
            f = f > 0.1 ? 0.12 + (f - 0.06) * score : f;
          }
          const r = L === 3 ? 7 : 8;
          ctx!.beginPath(); ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(14,17,20,1)`; ctx!.fill();
          ctx!.lineWidth = 1.3;
          ctx!.strokeStyle = `rgba(${CREAM},${Math.min(1, f)})`; ctx!.stroke();
          if (f > 0.2) { ctx!.fillStyle = `rgba(${CREAM},${f * 0.5})`; ctx!.beginPath(); ctx!.arc(n.x, n.y, r - 3, 0, Math.PI * 2); ctx!.fill(); }
          if (b > 0) { ctx!.strokeStyle = `rgba(${SIG},${Math.min(1, b)})`; ctx!.lineWidth = 1.8; ctx!.beginPath(); ctx!.arc(n.x, n.y, r + 1.5, 0, Math.PI * 2); ctx!.stroke(); }
          if (L === 3) {
            ctx!.fillStyle = `rgba(${i === TARGET ? SIG : CREAM},${i === TARGET ? 1 : 0.55})`;
            ctx!.fillText(String(i), n.x + 14, n.y + 3.5);
          }
        });
      }

      // captions
      ctx!.fillStyle = "rgba(179,185,191,.75)";
      ctx!.fillText("INPUT", gx, gy + gridSize + 20);
      ctx!.fillText("HIDDEN", xs[1] - 20, H - 28);
      ctx!.fillText("HIDDEN", xs[2] - 20, H - 28);
      ctx!.fillText("OUTPUT", xs[3] - 16, H - 28);
      const phase = backward ? "BACKPROPAGATION · push the error back, update weights" : t < 2.6 ? "FORWARD PASS · compute the prediction" : t < 3 ? "COMPARE · prediction vs. label" : "NEXT EXAMPLE";
      ctx!.fillStyle = backward ? `rgba(${SIG},1)` : `rgba(${CREAM},.9)`;
      ctx!.fillText(phase, 16, 26);
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (playingRef.current && visibleRef.current) { timeRef.current += dt; draw(); }
      raf = requestAnimationFrame(loop);
    };

    fit();
    const ro = new ResizeObserver(fit); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }); io.observe(cv);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return (
    <div className="relative flex h-full min-h-[360px] flex-col">
      <div role="img" aria-label="Animated diagram of a small neural network classifying an 8 by 8 pixel handwritten 7. A forward pass lights each layer from input to output, then backpropagation sends the error back from output to input." className="relative min-h-[320px] flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2">
        <p className="text-[0.7rem] leading-snug text-muted">Illustration of the forward and backward pass. Layer sizes are illustrative, not my trained network's.</p>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause animation" : "Play animation"}
          className="grid size-11 shrink-0 place-items-center border border-line text-muted-2 hover:border-cream/40 hover:text-cream"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
}
