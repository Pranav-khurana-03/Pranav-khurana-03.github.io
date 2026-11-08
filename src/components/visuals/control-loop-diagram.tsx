/* Block diagram of the stabilizing drone's control loop, drawn from the firmware README
   (Pranav-khurana-03/Drone-Project). It is a drawing of the code's structure, not a video frame. */

interface BoxProps { x: number; y: number; w: number; h: number; title: string; sub?: string; strong?: boolean }

function Box({ x, y, w, h, title, sub, strong }: BoxProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#151a1f" stroke={strong ? "#f1efe9" : "#3a434b"} strokeWidth={strong ? 1.4 : 1} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 4)} textAnchor="middle" fill="#f1efe9" fontSize="11.5" fontWeight="500">{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fill="#8a9199" fontSize="9.5">{sub}</text>}
    </g>
  );
}

export function ControlLoopDiagram() {
  const line = { stroke: "#b3b9bf", strokeWidth: 1.2, fill: "none", markerEnd: "url(#arrow)" } as const;
  return (
    <div className="grid h-full w-full place-items-center bg-[#0b0e11] p-3">
      <svg
        viewBox="-60 0 720 440"
        role="img"
        aria-label="Block diagram of the drone's control loop. Pilot sticks set a desired roll and pitch angle. The MPU6050 accelerometer and gyro feed a Kalman filter that estimates the actual angle. An outer loop turns the angle error into a desired rotation rate. An inner PID loop compares that to the measured gyro rate for each of roll, pitch and yaw. An X-quad mixer combines the efforts with throttle and drives four motors through their speed controllers, 250 times per second."
        className="h-full max-h-[480px] w-full font-sans"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#b3b9bf" />
          </marker>
        </defs>

        <text x="20" y="26" fill="#8a9199" fontSize="9.5" letterSpacing="1.2" fontFamily="IBM Plex Mono, monospace">CONTROL LOOP · 250 Hz (4 ms)</text>

        {/* inputs */}
        <Box x={20} y={50} w={150} h={52} title="Pilot sticks" sub="PPM receiver, 4 channels" />
        <Box x={20} y={230} w={150} h={52} title="MPU6050" sub="accelerometer + gyro" />
        <Box x={20} y={140} w={150} h={52} title="Kalman filter" sub="angle estimate" />

        {/* loops */}
        <Box x={235} y={90} w={170} h={60} title="Outer loop" sub="angle error → desired rate" strong />
        <Box x={235} y={215} w={170} h={70} title="Inner PID loop" sub="rate error → effort, per axis" strong />

        {/* output */}
        <Box x={450} y={150} w={130} h={56} title="X-quad mixer" sub="+ throttle, clamped" />
        <Box x={450} y={290} w={130} h={52} title="4 ESCs → motors" sub="1000–2000 µs" />

        {/* wiring */}
        <path d="M170 76 H203 V112 H235" {...line} />
        <text x="176" y="68" fill="#8a9199" fontSize="9">desired angle</text>
        <path d="M95 232 V192" {...line} />
        <path d="M170 166 H203 V130 H235" {...line} />
        <text x="176" y="182" fill="#8a9199" fontSize="9">angle</text>
        <path d="M320 150 V215" {...line} />
        <text x="327" y="188" fill="#8a9199" fontSize="9">desired rate</text>
        <path d="M170 262 H235" {...line} />
        <text x="176" y="256" fill="#8a9199" fontSize="9">gyro rate</text>
        <path d="M405 250 H428 V190 H450" {...line} />
        <path d="M95 50 V38 H515 V150" {...line} />
        <text x="260" y="33" fill="#8a9199" fontSize="9">throttle</text>
        <path d="M515 206 V290" {...line} />

        <text x="20" y="400" fill="#8a9199" fontSize="9.5">Roll, pitch and yaw each have their own tuned gains.</text>
        <text x="20" y="416" fill="#8a9199" fontSize="9.5">Below the throttle cutoff, motors idle and the integrators reset.</text>
      </svg>
    </div>
  );
}
