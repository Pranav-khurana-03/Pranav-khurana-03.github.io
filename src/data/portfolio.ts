/* ALL site content lives here. Components only map over these arrays.
   Source: source-pdf/Portfolio Source.pdf and papers/. Items marked NOTE are not in the PDF
   and need confirming. */

export interface Slide {
  label: string;
  title: string;
  description: string;
  points?: string[];
  tags: string[];
  glbFileUrl?: string;
  imageUrl?: string;
  /** A drawn diagram shown in place of a model or photo. */
  visual?: "control-loop";
  /** Several photos or renders of the same thing, shown as tabs. */
  images?: { src: string; alt: string; label: string }[];
  /** Video slot. With no url it shows a placeholder frame. Files go in /public/videos/. */
  video?: { url?: string; poster?: string; caption: string };
}

export interface CadProject {
  id: string;
  title: string;
  organization: string;
  role: string;
  dateRange: string;
  description: string;
  points?: string[];
  stats?: { value: string; label: string }[];
  tags: string[];
  glbFileUrl?: string;
  imageUrl?: string;
  /** Descriptive alt text for imageUrl. Falls back to the title. */
  imageAlt?: string;
  link?: { href: string; label: string };
  /** External link (opens in a new tab), e.g. a GitHub repo. */
  externalLink?: { href: string; label: string };
  slides?: Slide[];
}

export interface SoftwareProject {
  id: string;
  title: string;
  kind: string;
  description: string;
  githubUrl: string | null;
  demoUrl?: string;
  tags: string[];
  steps?: string[];
  points?: string[];
  /** Optional visual shown beside the text. */
  visual?: "neural-net";
}

export interface SimulationProject {
  id: string;
  title: string;
  category: string;
  dateRange: string;
  description: string;
  points?: string[];
  tags: string[];
  images?: { src: string; alt: string; label: string }[];
}

export interface Paper {
  id: string;
  venue: string;
  lab: string;
  status: string;
  title: string;
  description: string;
  points?: string[];
  tags: string[];
  paperUrl: string | null;
}

export const personalInfo = {
  name: "Pranav Khurana",
  title: "Computer Engineer · Physical AI & Robotics",
  school: "University of Illinois Urbana-Champaign",
  major: "Computer Engineering",
  affiliations: ["UIUC Computer Engineering", "NOBE Illinois", "Published in Sensors"],
  bio: "Computer Engineering student at UIUC. I want to work on physical AI and help build the next generation of humanoids and robots. So far that means perception and control for machines that move: vision pipelines for a NOBE interceptor drone, a co-authored paper in Sensors on occlusion handling, and software for an FTC team that won the ROSS division and finished as the third alliance at Worlds. I also design and print the hardware my software runs on.",
  education: "B.S. Computer Engineering, University of Illinois Urbana-Champaign, 2026 to 2030",
  currentFocus: "Physical AI: perception, control, and learning for humanoids and robots",
  skills: [
    { group: "Perception & ML", items: ["YOLO", "OpenCV", "Kalman Filtering", "AprilTags", "Roboflow", "PyTorch", "Neural Networks", "LLM Inference"] },
    { group: "Languages", items: ["Python", "Java", "C", "C++", "MATLAB"] },
    { group: "Robotics & Control", items: ["ROS", "FTC SDK", "PID Control", "Motion Planning", "IMU / Gyro", "Digital Logic"] },
    { group: "Hardware & Design", items: ["Fusion 360", "FEA", "3D Printing"] },
    { group: "Tools", items: ["Git", "Linux"] },
  ],
  organizations: ["NOBE Illinois, Product Developer", "AI Club at Westford Academy, Founder & President"],
  previousWork: [
    { when: "Sep 2026 – Now", role: "Product Developer", org: "NOBE Illinois · Haylon Technologies drone, team of 7", now: true },
    { when: "Jun – Aug 2026", role: "Technical Intern", org: "Syntropy Systems, Nashua NH · neural network from scratch, LLM inference benchmarks, worked with the CEO" },
    { when: "May – Sep 2025", role: "Undergraduate Researcher", org: "BASH Lab, WPI · earbud noise cancellation, team of 3" },
    { when: "Research", role: "Undergraduate Researcher", org: "PeARL Lab, UMass Lowell · occlusion handling (Sensors 2024)" },
    { when: "4 years", role: "Software Lead & Captain", org: "FTC 3565 Ghost Robotics · ROSS division winner, 3rd alliance at Worlds" },
    { when: "High school", role: "Founder & President", org: "AI Club, Westford Academy · taught ML fundamentals" },
  ] as { when: string; role: string; org: string; now?: boolean }[],
  photoUrl: "/photo.jpg",
  resumeUrl: "/resume.pdf",
  email: "khuranapranav2007@gmail.com",
  githubUrl: "https://github.com/Pranav-khurana-03",
  linkedinUrl: "https://www.linkedin.com/in/pranav-khurana-a3117322a/",
  web3formsKey: "" as string,
};

export const cadProjects: CadProject[] = [
  {
    id: "haylon-interceptor",
    title: "Haylon Interceptor Drone",
    organization: "NOBE Illinois for Haylon Technologies",
    role: "Product Developer",
    dateRange: "Sep 2026 to Present",
    description: "Hardware and software deliverables for an interceptor drone, on a team of 7 with weekly deliverables.",
    tags: ["Fusion 360", "UAV", "YOLO", "MATLAB", "NOBE"],
    slides: [
      {
        label: "Frame",
        title: "Full Drone Frame",
        description: "I modeled the full drone frame in Fusion 360, then rebuilt it as a complete assembly. Each failed print fed a design change.",
        points: [
          "Winglets snapped off in minimal-height drops, so I filleted the attachments and added a male-female slot in the fuselage where the winglet is inserted and screwed in",
          "Landing gear broke, so I reprinted it thicker with filleted edges to spread stress",
          "Motor mounts at the winglet ends snapped, so I filleted those edges too",
        ],
        tags: ["Fusion 360", "3D Printing", "Design Iteration"],
        glbFileUrl: "/glb/drone-frame-v1.glb",
      },
      {
        label: "Assembly",
        title: "Full Drone Assembly",
        description: "The complete multi-part drone assembly, designed around 3D-printed parts and team assembly.",
        tags: ["Fusion 360", "CAD Assembly", "UAV"],
        glbFileUrl: "/glb/drone-assembly-v1.glb",
      },
      {
        label: "Electronics",
        title: "Modular Electronics Mount",
        description: "My part of the new interceptor design: one accessible plate that carries the flight controller, an ESC and an ESP32.",
        points: [
          "Attached with two screws into heat-set inserts on the top face, reinforced by four standoffs between the plates",
          "The ESP32 had no mounting holes, so I extended the pockets to its size and glued it in",
          "Heat-set inserts melted too much plastic into the holes, so I reprinted with larger insert holes",
        ],
        tags: ["Fusion 360", "Heat-Set Inserts", "Tolerances"],
        glbFileUrl: "/glb/electronics-mount-v1.glb",
      },
      {
        label: "Prints",
        title: "Printed Parts",
        description: "The 3D-printed airframe parts with the electronics mount beside them, shown from the top and from the front.",
        tags: ["3D Printing", "Prototyping"],
        images: [
          { src: "/projects/nobe-drone-top-v1.jpg", alt: "Top-down photo of the black 3D-printed drone body with four arms ending in red nose cones, and the small black electronics mount in the corner, on a blue cutting mat", label: "Top" },
          { src: "/projects/nobe-drone-front-v1.jpg", alt: "Front photo of the black 3D-printed drone body, a tall cylinder with three arms ending in red nose cones, and the electronics mount behind it on a blue cutting mat", label: "Front" },
        ],
      },
    ],
  },
];

/* Lead feature of the Perception & Software section (video + repo). Same NOBE project as the CAD carousel. */
export const perceptionLead = {
  id: "drone-detection",
  title: "Drone Detection & Intercept Vision",
  organization: "NOBE Illinois for Haylon Technologies",
  role: "Product Developer",
  dateRange: "Sep 2026 to Present",
  description: "A YOLO pipeline that detects and tracks a target, then estimates bearing, distance and time to intercept. A custom model detects the Pavo Femto drone.",
  steps: ["Detect", "Track", "Predict", "Intercept"],
  points: [
    "Started on a bottle with YOLO26 and Python, then added bearing, distance from calibrated focal length, and time to intercept",
    "Added velocity prediction, then a Kalman filter to cut the noise it introduced",
    "Trained a YOLO nano model on my own photos from different angles and lighting, using Roboflow",
  ],
  tags: ["YOLO", "Python", "Kalman Filter", "Roboflow", "Computer Vision"],
  video: { url: "/videos/nobe-software-demo-v1.mp4", caption: "Drone detection and tracking demo" },
  githubUrl: "https://github.com/tharun4561/bottle-hud/tree/main",
  githubLabel: "View the team repo",
};

export const roboticsProjects: CadProject[] = [
  {
    id: "ghost-robotics",
    title: "Ghost Robotics, FTC 3565",
    organization: "FTC Team 3565 Ghost Robotics",
    role: "Software Lead & Captain",
    dateRange: "4 years · captain from junior year",
    description: "Joined as a freshman, then led software and captained the team. We won the state title, won the ROSS division at Worlds in Houston, and finished as the third alliance in the world, out of more than 8,000 registered FTC teams.",
    stats: [
      { value: "3rd", label: "alliance at Worlds" },
      { value: "ROSS", label: "division winner" },
      { value: "8,000+", label: "registered teams" },
      { value: "State", label: "title" },
    ],
    points: [
      "Rebuilt the motion planner: Bézier paths plotted around obstacles, followed with feed-forward plus PID, and the robot corrects if another robot pushes it off the path",
      "Built AprilTag auto-shooting: the camera finds the goal tag and sets turret angle and shot velocity, with a measured lookup table for flywheel speed and hood angle",
      "Fused noisy AprilTag poses with dead-wheel odometry, resetting odometry when tag confidence is high",
    ],
    tags: ["Java", "FTC SDK", "AprilTags", "PID", "Leadership"],
    imageUrl: "/projects/ghost-robotics-heisenberg-v1.jpg",
    imageAlt: "Team 3565's competition robot, Heisenberg: a black laser-cut chassis with a red 3565 number plate, a Limelight camera on the turret, and green flywheel wheels above it",
    link: { href: "/ghost-robotics", label: "Explore the robotics software" },
  },
];

export const papers: Paper[] = [
  {
    id: "sensors-releaf",
    venue: "Sensors 2024, 24(17), 5727",
    lab: "PeARL Lab, UMass Lowell",
    status: "Published, open access",
    title: "Releaf: Real-Time Occlusion Handling by Game Theory",
    description: "Co-authored paper on keeping a multi-camera system locked on a target when one camera loses it. Cameras are modeled as players in a leader-follower game, so the camera with the clearest view leads. Tested on a 3D-printed robotic eye.",
    points: [
      "20% lower horizontal and 81% lower vertical error than Q-learning",
      "18% lower horizontal and 81% lower vertical error than DQN",
      "Needs no training, so leader selection runs in real time",
    ],
    tags: ["Game Theory", "Occlusion Handling", "Multi-Camera", "ROS", "OpenCV"],
    paperUrl: "https://doi.org/10.3390/s24175727",
  },
  {
    id: "urtc-earbud",
    venue: "IEEE MIT URTC · poster",
    lab: "BASH Lab, WPI",
    status: "Submitted; poster presented",
    title: "Noise Cancellation for a Multimodal Earbud",
    description: "Summer 2025 research on an earbud that senses breathing and chewing. I wrote the signal-cleaning software: an adaptive LMS filter on a Raspberry Pi Pico that subtracts ambient noise using a second, outward-facing microphone.",
    points: [
      "Rejected a trained model because the Pico could not run it",
      "Early failures were hardware: internal sound leaked outward, fixed by reprinting the earbud with more padding between microphones",
    ],
    tags: ["LMS Filter", "Signal Processing", "Embedded", "Raspberry Pi Pico"],
    paperUrl: null,
  },
];

export const softwareProjects: SoftwareProject[] = [
  {
    id: "syntropy-nn",
    title: "Neural Network from Scratch & LLM Inference",
    kind: "Machine Learning · Syntropy Systems internship, summer 2026",
    description: "Syntropy Systems builds agents inside corporate Slack channels that learn repetitive questions and tasks, then take them over. I worked directly with the founder and CEO on the machine learning fundamentals behind that kind of system.",
    githubUrl: null,
    tags: ["Python", "Neural Networks", "Backpropagation", "MNIST", "Speculative Decoding", "KV Caching"],
    steps: ["Forward pass", "Backpropagation", "MNIST digits"],
    visual: "neural-net",
    points: [
      "Implemented a neural network from scratch, including the forward pass and backpropagation, and trained it on MNIST for digit detection, writing all the code myself",
      "Experimented with LLM inference optimization using speculative decoding and KV caching, and compared the approaches",
      "Presented the comparison results to the founder and CEO",
    ],
  },
];

export const simulationProjects: SimulationProject[] = [
  {
    id: "mount-fea",
    title: "Electronics Mount Stress Study",
    category: "FEA · MATLAB",
    dateRange: "Fall 2026",
    description: "Stress simulation of the electronics plate under 5 g, run in MATLAB. Outputs: von Mises stress, displacement magnitude and safety factor.",
    points: [
      "Load: a 20 g plate at 5 g is 0.981 N, over 188.476 mm² of screw-hole surface, a traction of 0.00520 MPa",
      "The plate alone deforms noticeably near the screw holes; the model leaves out the four standoffs that carry load in the real assembly",
      "Verdict: edges are filleted and 5 g should not break it, with the standoffs adding support",
    ],
    tags: ["MATLAB", "FEA", "Von Mises Stress", "Safety Factor"],
    images: [
      { src: "/projects/von-mises-stress-v1.png", alt: "MATLAB plot of von Mises stress on the electronics plate in MPa; the plate is blue almost everywhere, with red and yellow hot spots around the screw holes at the right edge, on a scale up to about 0.016 MPa", label: "Stress result" },
      { src: "/projects/electronics-mount-render-v1.png", alt: "Fusion 360 render of the white electronics mount holding an ESP32 board and a flight controller, with four gold standoffs between the plates", label: "The part" },
    ],
  },
];

/* Autonomous Stabilizing Drone: a carousel like the NOBE hardware card. The photos are frames
   from the demo video (https://www.youtube.com/watch?v=yZt6ehGUBP8). */
export const droneProject: CadProject = {
  id: "stabilizing-drone",
  title: "Autonomous Stabilizing Drone",
  organization: "Independent project",
  role: "Builder",
  dateRange: "Jun to Oct 2024",
  description: "A quadcopter built from scratch with flight firmware I wrote in C++.",
  tags: ["Kalman Filter", "PID", "C++", "MPU6050", "Teensy 4.1"],
  externalLink: { href: "https://github.com/Pranav-khurana-03/Drone-Project", label: "View the firmware" },
  slides: [
    {
      label: "In flight",
      title: "Autonomous Stabilizing Drone",
      description: "A quadcopter built from scratch around a store-bought frame, ESCs and a transmitter. Its firmware reads an MPU6050 IMU, fuses the data with a Kalman filter, and runs a cascaded PID controller that keeps the aircraft level while pilot commands arrive over a PPM receiver.",
      points: [
        "The first attempt sent PWM straight from an Arduino to the ESCs and failed, from off-center mass, motor friction and design discrepancies",
        "Moved from an Arduino to a Teensy 4.1 because the loop was too slow to react before crashing, and switched from 2-blade to 3-blade propellers for steadier thrust",
      ],
      tags: ["C++", "Teensy 4.1", "ESCs", "3-blade props"],
      images: [
        { src: "/projects/stabilizing-drone-flight-v1.jpg", alt: "Close-up of the drone: a black quadcopter frame with orange motors, blue three-blade propellers and a tangle of wiring and electronics on top", label: "Close-up" },
        { src: "/projects/drone-test-indoor-v1.jpg", alt: "Wide shot of the drone on a foam mat with its propellers spinning, in a room with batteries, a laptop and a flight controller on the floor", label: "Indoor test" },
      ],
    },
    {
      label: "Build",
      title: "Wiring the flight controller",
      description: "Every connection is hand-wired on the frame: the IMU and the microcontroller sit on breadboards next to the power distribution board, and a FlySky transmitter and receiver carry the pilot's commands.",
      points: [
        "The IMU talks to the microcontroller over I2C, the receiver sends a PPM signal, and four signal wires drive the ESCs",
        "The early build, before the IMU and filtering, is what failed when PWM went straight from an Arduino to the ESCs",
      ],
      tags: ["Hand wiring", "I2C", "PPM", "ESCs", "FlySky"],
      images: [
        { src: "/projects/drone-early-build-v1.jpg", alt: "An early build of the drone on a foam mat: motors on carbon arms, a breadboard and a tangle of red, yellow and green wires, with a blue USB cable attached", label: "Early build" },
        { src: "/projects/drone-imu-wiring-v1.jpg", alt: "Top view of the drone's wiring with the IMU board circled in white on a breadboard, a second breadboard holding the microcontroller, and a blue power distribution board", label: "IMU" },
        { src: "/projects/drone-transmitter-v1.jpg", alt: "Left: the drone's radio receiver zip-tied to the frame. Right: a FlySky FS-i6X transmitter", label: "Radio" },
      ],
    },
    {
      label: "Code",
      title: "The firmware, step by step",
      description: "Frames from my walkthrough of the C++ firmware, which runs the sensor fusion and the control loop.",
      points: [
        "Sensor reads: raw gyro and accelerometer values become rates and angles, with the calibration offsets removed",
        "Kalman filter: a small function blends the accelerometer angle with the gyro rate",
        "PID: one function computes proportional, integral and derivative effort, with the output clamped at ±400",
        "Mixer: throttle, pitch, roll and yaw combine into each motor's power",
      ],
      tags: ["C++", "Kalman Filter", "PID", "Motor Mixing"],
      images: [
        { src: "/projects/drone-code-sensors-v1.jpg", alt: "Code reading gyro values over I2C, converting them to roll, pitch and yaw rates, and computing roll and pitch angles from the accelerometer", label: "Sensors" },
        { src: "/projects/drone-code-kalman-v2.jpg", alt: "A kalman function that updates a state and its uncertainty from a rate input and an angle measurement", label: "Kalman" },
        { src: "/projects/drone-code-pid-v2.jpg", alt: "A getPIDEffort function computing proportional, integral and derivative terms and clamping the output to plus or minus 400", label: "PID" },
        { src: "/projects/drone-code-mixer-v1.jpg", alt: "Four lines of code setting each motor's power from throttle, pitch, roll and yaw with plus and minus signs", label: "Mixer" },
      ],
    },
    {
      label: "Tuning",
      title: "Tuning and testing",
      description: "I watched live angle and rate data on the serial plotter while holding the drone, and adjusted the gains from there.",
      points: [
        "A very high P gain caused significant oscillation",
        "With the gains tuned, the drone was unaffected by shaking",
      ],
      tags: ["Serial plotter", "PID tuning", "Bench testing"],
      images: [
        { src: "/projects/drone-plotter-v1.jpg", alt: "Left: a live line plot of sensor data on the serial plotter. Right: the drone held in a hand above a laptop", label: "Live data" },
        { src: "/projects/drone-tuning-oscillation-v1.jpg", alt: "Me holding the drone in my lap during a test, with the caption: Really high P gain causing significant oscillation", label: "High P gain" },
        { src: "/projects/drone-shake-test-v1.jpg", alt: "The drone being shaken by hand during a test, with the caption: Drone unaffected by shaking", label: "Shake test" },
      ],
    },
    {
      label: "Control loop",
      title: "How it holds itself level",
      description: "A drawing of the firmware's structure, from the project README. Roll, pitch and yaw each run through the same two loops at 250 Hz.",
      points: [
        "At startup it samples the gyro 2,000 times at rest for per-axis bias, and takes one accelerometer reading to zero roll and pitch",
        "Motor vibration made the accelerometer noisier than the gyro, so a 1D Kalman filter blends the accelerometer angle (noisy, no drift) with the gyro rate (smooth, drifts)",
        "The outer loop turns angle error into a desired rate, and an inner PID drives the gyro rate to it, with anti-windup and clamped output",
      ],
      tags: ["Kalman Filter", "Cascaded PID", "MPU6050", "PPM"],
      visual: "control-loop",
    },
  ],
};

export const gridProjects: CadProject[] = [
  {
    id: "traffic-light",
    title: "AI Smart Traffic Light",
    organization: "Independent project",
    role: "Builder",
    dateRange: "Jun 2024 to Feb 2025",
    description: "A traffic light for rush-hour school traffic, which gym teachers and deans direct by hand. A NEAT-trained model beat timer baselines in my Pygame simulation. I built a prototype with 3 cameras, a Raspberry Pi 5 and a Coral accelerator running YOLO vehicle detection, and pitched it to the director of public works; it did not move forward over safety and liability concerns.",
    tags: ["NEAT", "Pygame", "YOLO", "Raspberry Pi", "Coral"],
  },
  // NOTE: this one is from the previous site, not the PDF. Confirm the description.
  {
    id: "shoe-sole",
    title: "Modular Shoe: Detachable Sole",
    organization: "Team CAD project",
    role: "Designer",
    dateRange: "Fall 2026",
    description: "A shoe with a swappable sole: a dovetail rail, a rear snap clip, and a release button. Modeled in Fusion 360.",
    tags: ["Fusion 360", "Mechanism Design", "Snap Fit"],
    glbFileUrl: "/glb/shoe-modular-v1.glb",
  },
];

/* ── Ghost Robotics deep dive (/ghost-robotics) ──
   Source: WAGhostRobotics/DECODE, branch Jesus: ShooterLUT.java, Camera.java, Pathing/Blue21.java.
   I own SequentialCommand, the command-sequencing class the 21-ball auto relies on. */
export type HeadingSpec =
  | { kind: "const"; deg: number }
  | { kind: "tangent"; reversed?: boolean }
  | { kind: "linear"; from: number; to: number };

export interface AutoSegment {
  name: string;
  kind: "collect" | "score" | "leave";
  pts: { x: number; y: number }[];
  heading: HeadingSpec;
  /** Fraction of the path at which the shot starts (BangBangBang threshold). */
  threshold?: number;
  dwell?: boolean;
  sub: string;
}

const auto21Poses = {
  start: { x: 17.5, y: 113 },
  shoot: { x: 58.686, y: 84.857 },
  spike2: { x: 12.686, y: 58.5 },
  gate: { x: 12.5, y: 60 },
  spike1: { x: 18, y: 83.514 },
  spike3: { x: 14.457, y: 40 },
};

const gateRun = (n: number): AutoSegment[] => [
  { name: `Gate run ${n}`, kind: "collect", pts: [auto21Poses.shoot, { x: 49, y: 65 }, auto21Poses.gate], heading: { kind: "linear", from: 180, to: 150 }, dwell: true, sub: "GateCollectPedro" },
  { name: "Back to shoot", kind: "score", pts: [auto21Poses.gate, auto21Poses.shoot], heading: { kind: "tangent", reversed: true }, threshold: 0.6, sub: "tangent heading, reversed" },
];

export const ghostRobotics = {
  repoUrl: "https://github.com/WAGhostRobotics/DECODE/tree/Jesus",
  // Distance in meters -> value. Copied from ShooterLUT.java.
  lut: {
    speed: [[0, 0], [0.6, 108], [0.8, 113], [1, 119], [1.2, 120], [1.4, 126], [1.6, 137], [1.8, 144], [2, 148], [2.2, 155], [2.4, 164], [2.6, 166], [2.8, 177], [3, 177], [3.25, 182], [3.3, 183], [3.4, 185], [3.5, 192], [3.6, 195], [3.8, 199]] as [number, number][],
    hood: [[0, 0.98], [0.6, 0.98], [0.8, 0.85], [1, 0.78], [1.2, 0.65], [1.4, 0.615], [1.6, 0.55], [1.8, 0.48], [2, 0.47], [2.2, 0.415], [2.4, 0.43], [2.6, 0.4], [2.8, 0.4], [3, 0.425], [3.2, 0.415], [3.3, 0.41], [3.4, 0.42], [3.6, 0.39], [3.8, 0.39]] as [number, number][],
  },
  auto21: {
    poses: auto21Poses,
    segments: [
      { name: "Preload to shooting pose", kind: "score", pts: [auto21Poses.start, auto21Poses.shoot], heading: { kind: "const", deg: 180 }, threshold: 0.6, sub: "BangBangBang at 60%" },
      { name: "Spike 2 pickup", kind: "collect", pts: [auto21Poses.shoot, { x: 53.743, y: 58.514 }, auto21Poses.spike2], heading: { kind: "const", deg: 180 }, sub: "CollectSpikesPedro" },
      { name: "Back to shoot", kind: "score", pts: [auto21Poses.spike2, auto21Poses.shoot], heading: { kind: "tangent", reversed: true }, threshold: 0.6, sub: "tangent heading, reversed" },
      ...[1, 2, 3, 4].flatMap(gateRun),
      { name: "Spike 1 pickup", kind: "collect", pts: [auto21Poses.shoot, auto21Poses.spike1], heading: { kind: "tangent" }, sub: "CollectSpikesPedro" },
      { name: "Back to shoot", kind: "score", pts: [auto21Poses.spike1, auto21Poses.shoot], heading: { kind: "tangent", reversed: true }, threshold: 0.7, sub: "fires at 70%" },
      { name: "Leave, turret to 0", kind: "leave", pts: [auto21Poses.shoot, auto21Poses.spike1], heading: { kind: "linear", from: 181.8, to: 180 }, sub: "heading eases to 180, turret set to 0" },
    ] as AutoSegment[],
  },
};
