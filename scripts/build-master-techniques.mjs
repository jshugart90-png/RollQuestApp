import fs from "fs";
import path from "path";

const outPath = path.resolve("app/data/techniques.ts");

const POSITION_TABS = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Leg Entanglements",
  "Submissions",
  "Self Defense",
  "Escapes",
];

const videos = [
  "0WjN8iuRk3o","tgIXxV6Ax1o","8wsjp47yR5w","mJIVHZUGw40","UWod5OtL9ME","Mwy4wivg7Q0","9SFHFIjSKsU","1d1-MshrzQI","RzSbYD6RuTk",
  "MEqGy5-XINg","2LEW823VWA8","3HiTG1OOKAI","ZnjNGoM_Iwo","YabK3X1bnZs","4ejQO_ehtPw","G0GUobdo9OA","goWtrxH64nk",
  "ODuQCA88oY4","isv_6Hd1Iac","T4C4oPpwOSU","734smcLl3sM","9Rqy7e3J620","xXZo1v74gm0","RJsyUR4ouuM","F5QOctE5fsY",
  "8F6meOljv-s","C1dKaS19PEg","gYmqLut1VN0","JL3ii1RVcEQ","r8iDzH9UwgY","UtHOOyEPbeI","mmnd5qpANlg","BUW4STY1NEA","-qfzOwgwZsg",
  "V6LFkdeSox0","jNC34nzjpOg"
];

const seeds = {
  "Takedowns & Standing": {
    white: [
      ["Technical Stand-Up", "Base Movement"], ["Collar Tie Snap-Down", "Takedown Entry"], ["Single Leg Finish", "Takedown"],
      ["Double Leg Mechanics", "Takedown"], ["Arm Drag to Rear Angle", "Off-Balance"], ["Body Lock Entry", "Clinch"],
      ["Foot Sweep Timing", "Trip / Sweep"], ["Front Headlock Go-Behind", "Control"], ["Ankle Pick on Recovery Step", "Takedown Entry"],
      ["Outside Trip Fundamentals", "Trip / Sweep"], ["Underhook Pummeling Drill", "Hand Fighting"], ["Sprawl and Re-Shot Basics", "Defense"],
    ],
    blue: [
      ["Russian Tie to Mat Return", "Chain Wrestling"], ["Snap-Down to Front Headlock Chain", "Chain Wrestling"],
      ["Single Leg Shelf to Run-the-Pipe", "Takedown"], ["Body Lock to Outside Trip Chain", "Clinch"],
      ["Fake Shot to Duck Under", "Misdirection"], ["Collar Drag to Foot Sweep", "Gi Takedown"],
      ["Whizzer Counter to Re-Attack", "Defense"], ["Underhook to Knee Tap", "Takedown Entry"],
      ["Slide-By to Rear Body Lock", "Off-Balance"], ["Standing Grip-Fight Decision Tree", "Strategy"],
    ]
  },
  "Guard Work": {
    white: [
      ["Closed Guard Posture Break", "Control"], ["Scissor Sweep", "Sweep"], ["Hip Bump Sweep", "Sweep"], ["Flower Sweep", "Sweep"],
      ["Pendulum Sweep", "Sweep"], ["Cross Collar Setup", "Gi Attack"], ["Kimura Grip from Guard", "Submission Setup"],
      ["Sit-Up Sweep", "Sweep"], ["Butterfly Basic Elevation", "Open Guard"], ["Half Guard Knee Shield", "Retention"],
      ["Spider Guard Intro", "Open Guard"], ["Sleeve Drag Angle Creation", "Control"],
    ],
    blue: [
      ["De La Riva Off-Balance Series", "Open Guard"], ["Butterfly to Single X Chain", "Leg Entanglement"],
      ["Lasso to Sweep Variations", "Open Guard"], ["Half Guard Dogfight to Back", "Back Take"],
      ["Collar-Sleeve Attack Matrix", "Gi Guard"], ["Reverse De La Riva Entries", "Open Guard"],
      ["Omoplata to Sweep Chain", "Submission Chain"], ["Guard Retention Leg Pummeling", "Retention"],
      ["Closed Guard Armbar / Triangle Chain", "Submission Chain"], ["Open Guard Re-Guard Flow", "Retention"],
    ]
  },
  "Guard Passing": {
    white: [
      ["Closed Guard Posture and Open", "Guard Opening"], ["Knee Slice Pass", "Pressure Pass"], ["Toreando Pass", "Movement Pass"],
      ["Double Under Pass", "Stack Pass"], ["Over-Under Pass", "Pressure Pass"], ["Leg Drag Intro", "Control Pass"],
      ["Stack Pressure Walk", "Stack Pass"], ["X-Pass Fundamentals", "Movement Pass"], ["Near-Side Under Pass", "Pressure Pass"],
      ["Half Guard Top Basics", "Top Control"], ["Passer Head Position Drill", "Fundamentals"], ["Grip Reset Passing Drill", "Strategy"],
    ],
    blue: [
      ["Leg Drag to Back-Step Chain", "Passing Chain"], ["Body Lock Passing Sequence", "Pressure Pass"],
      ["Knee Cut to Far Side", "Pressure Pass"], ["Long Step Recounter", "Movement Pass"],
      ["Stack Pass to Back Take", "Passing Chain"], ["Leg Weave Counter Passing", "Passing Chain"],
      ["Toreando to Knee Slice Combination", "Passing Chain"], ["Half Guard Flattening System", "Pressure Pass"],
      ["North-South Re-Entry Passing", "Control Pass"], ["Passing Tempo and Threat Cycling", "Strategy"],
    ]
  },
  "Side Control": {
    white: [
      ["Crossface and Underhook Pin", "Pinning"], ["Kesa Gatame Hold", "Pinning"], ["Knee-on-Belly Entry", "Transition"],
      ["Far Arm Isolation", "Control"], ["Hip Switch Reset", "Transition"], ["Guard Recovery Denial", "Retention"],
      ["North-South Transition", "Transition"], ["Windshield Wiper to Mount", "Transition"], ["Cradle Pin Intro", "Pinning"],
      ["Side Control Pressure Drill", "Fundamentals"], ["Near Hip Blocking Basics", "Control"], ["Frame Breaking Progression", "Fundamentals"],
    ],
    blue: [
      ["Kimura Trap from Side", "Submission Chain"], ["Monoplata Entry", "Submission Chain"],
      ["Wrist Ride to Mount", "Transition"], ["Lapel Wedge Pin", "Gi Control"], ["Scarf Hold Attack Timing", "Submission"],
      ["Hip Switch to KOB Reactions", "Transition"], ["Side to Crucifix Path", "Submission Chain"],
      ["Turtle Denial Cycle", "Retention"], ["North-South Rotation Control", "Pinning"], ["Pressure Cycling Strategy", "Strategy"],
    ]
  },
  "Mount": {
    white: [
      ["Low Mount Stability", "Pinning"], ["High Mount Climb", "Transition"], ["Americana from Mount", "Submission"],
      ["Cross Collar Choke from Mount", "Gi Choke"], ["S-Mount Armbar Intro", "Submission"], ["Upa Counter Posting", "Retention"],
      ["Gift Wrap Control", "Control"], ["Technical Mount Entry", "Transition"], ["Elbow Isolation Drill", "Control"],
      ["Mount Pressure Breathing", "Fundamentals"], ["Mount to Back Exposure", "Back Take"], ["Mount Re-Centering Drill", "Fundamentals"],
    ],
    blue: [
      ["S-Mount Collar and Armbar Chain", "Submission Chain"], ["Mounted Arm Triangle Setup", "Submission Chain"],
      ["Mount Side-Switch System", "Transition"], ["Elbow Persistence to Armbar", "Submission Chain"],
      ["Mount to Triangle Threat", "Submission Chain"], ["Technical Mount Hand Trap Flow", "Control"],
      ["Mounted Wrist Ride Progression", "Control"], ["Bridge Surf Timing", "Retention"],
      ["Mount Attack Clustering", "Strategy"], ["Mount to Back Maintenance", "Back Take"],
    ]
  },
  "Back / Rear Mount": {
    white: [
      ["Seatbelt Control Fundamentals", "Control"], ["Rear Naked Choke Basics", "Submission"], ["Short Choke Intro", "Submission"],
      ["Bow-and-Arrow Basics", "Gi Choke"], ["Body Triangle Control", "Control"], ["Trap Arm to RNC", "Submission Chain"],
      ["One Hook Recovery", "Retention"], ["Back Hand Fighting Basics", "Control"], ["Collar Feed Setup", "Gi Setup"],
      ["Back Retention Hip Tracking", "Retention"], ["Safe Side Defense Awareness", "Defense"], ["Back Control Reset Drill", "Fundamentals"],
    ],
    blue: [
      ["RNC Hand-Fight Solutions", "Submission"], ["Body Triangle Finish Strategy", "Control"],
      ["Mata Leao Detail Mechanics", "Submission"], ["Seatbelt High Back Climb", "Control"],
      ["Bow-and-Arrow Refinements", "Gi Choke"], ["Strangle Chain Drill", "Submission Chain"],
      ["Turning Escape Countering", "Retention"], ["Back to Mount Transition", "Transition"],
      ["Collar Drag to Choke Angle", "Gi Choke"], ["Back Attack Pace Strategy", "Strategy"],
    ]
  },
  "Turtle & Leg Entanglements": {
    white: [
      ["Seatbelt Turtle Breakdown", "Control"], ["Clock Choke Entry", "Gi Choke"], ["Spiral Ride Basics", "Control"],
      ["Single Leg X Entry", "Leg Entanglement"], ["Straight Ashi Control", "Leg Entanglement"], ["Front Headlock Spin to Back", "Back Take"],
      ["Peek-Out Escape Basics", "Escape"], ["Ankle Lock Defense Intro", "Defense"], ["Turtle Hip Block Control", "Control"],
      ["Leg Entanglement Safety Rules", "Fundamentals"], ["Knee Line Awareness Drill", "Fundamentals"], ["Turtle to Guard Recovery", "Escape"],
    ],
    blue: [
      ["Crucifix Entry Chain", "Control"], ["Anaconda Roll Sequence", "Submission Chain"],
      ["Outside Ashi Entries", "Leg Entanglement"], ["Inside Sankaku Defense", "Defense"],
      ["K-Guard Entry Concepts", "Leg Entanglement"], ["Clock Choke Finish Detail", "Gi Choke"],
      ["Leg Lock to Back Take", "Back Take"], ["Turtle Ride Decision Tree", "Strategy"],
      ["Leg Entanglement Flow Rounds", "Fundamentals"], ["Guillotine Counter from Turtle", "Defense"],
    ]
  },
  "Submissions": {
    white: [
      ["Armbar from Closed Guard", "Armbar"], ["Triangle Choke Fundamentals", "Triangle"], ["Kimura from Side Control", "Kimura"],
      ["Basic Guillotine from Front Headlock", "Guillotine"], ["Ezekiel from Mount", "Gi Choke"], ["Baseball Bat Choke Basics", "Gi Choke"],
      ["Paper Cutter Intro", "Gi Choke"], ["North-South Choke Setup", "Choke"], ["Cross Collar from Guard", "Gi Choke"],
      ["Americana Fundamentals", "Shoulder Lock"], ["Straight Ankle Lock Intro", "Leg Lock"], ["Submission Safety and Tapping", "Fundamentals"],
    ],
    blue: [
      ["Loop Choke Setup Chain", "Gi Choke"], ["Armbar to Kimura Chain", "Submission Chain"],
      ["North-South Guillotine", "Guillotine"], ["Triangle to Armbar Chain", "Submission Chain"],
      ["Baseball Bat Timing Trap", "Gi Choke"], ["Kimura Trap Finishing Paths", "Submission Chain"],
      ["Submission Threat Clustering", "Strategy"], ["Wristlock Ethics and Control", "Fundamentals"],
      ["Heel Exposure Theory", "Leg Lock"], ["Submission Journaling Habit", "Mindset"],
    ]
  },
  "Self Defense": {
    white: [
      ["Standing Distance and Stance", "Awareness"], ["Verbal De-Escalation Basics", "Prevention"], ["Wrist Grab Release (Same Side)", "Grip Break"],
      ["Wrist Grab Release (Cross Side)", "Grip Break"], ["Two-Handed Lapel Grab Defense", "Clinch Defense"], ["Headlock Defense Standing", "Headlock Escape"],
      ["Bear Hug Over-Arm Defense", "Clinch Defense"], ["Bear Hug Under-Arm Defense", "Clinch Defense"], ["Technical Stand-Up Under Pressure", "Base Movement"],
      ["Fence Frame and Angle Exit", "Awareness"], ["Ground Up-Kick Distance Management", "Ground Defense"], ["Safe Exit and Help Protocol", "Scenario"],
    ],
    blue: [
      ["Haymaker Cover to Clinch Entry", "Striking Defense"], ["Wall Pin Escape Sequence", "Scenario"],
      ["Standing Guillotine Threat to Exit", "Clinch Defense"], ["Single-Leg Defense in Street Context", "Takedown Defense"],
      ["Mount Strike Control with Trap-and-Roll", "Ground Defense"], ["Guard Distance Management Under Strikes", "Ground Defense"],
      ["Knife Threat Awareness Principles", "Awareness"], ["Multiple Opponent Exit Priorities", "Scenario"],
      ["Self-Defense Decision Ladder", "Strategy"], ["Post-Incident Protocol", "Scenario"],
    ]
  },
  "Escapes": {
    white: [
      ["Side Control Frame and Shrimp", "Pin Escape"], ["Mount Trap and Roll (Upa)", "Pin Escape"], ["Mount Elbow-Knee Escape", "Pin Escape"],
      ["Back Escape to Safe Side", "Back Escape"], ["Knee-on-Belly Recovery", "Pin Escape"], ["Scarf Hold Basic Escape", "Pin Escape"],
      ["North-South Frame Escape", "Pin Escape"], ["Closed Guard Posture Escape", "Guard Escape"], ["Half Guard Bottom Recovery", "Guard Recovery"],
      ["Turtle Defensive Shell", "Defensive Posture"], ["Bridge-Shrimp Connection Drill", "Fundamentals"], ["Emergency Tap and Reset Protocol", "Safety"],
    ],
    blue: [
      ["Side Control Underhook Escape Chain", "Pin Escape"], ["Mount Escape Decision Tree", "Pin Escape"],
      ["Back Escape Against Body Triangle", "Back Escape"], ["KOB to Single Leg Counter Escape", "Counter Escape"],
      ["Scarf Hold to Backdoor Escape", "Pin Escape"], ["North-South Inversion Recovery", "Pin Escape"],
      ["Late Stage Guillotine Escape Concepts", "Submission Escape"], ["Armbar Hitchhiker Recovery", "Submission Escape"],
      ["Leg Entanglement Defensive Sequence", "Leg Lock Escape"], ["Escape Pace and Breath Strategy", "Strategy"],
    ]
  },
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

let vid = 0;
function nextVideo() {
  const id = videos[vid % videos.length];
  vid += 1;
  return id;
}

function makeSteps(name, position, belt, category) {
  const tone = belt === "white"
    ? "Stay calm, keep your base, and trust the sequence one detail at a time."
    : "At blue belt, chain your first attack to a second and a third so the opponent runs out of clean answers.";
  return [
    `Start by establishing your first control point for ${name}: posture, grips, and head position before speed.`,
    `Create an angle from ${position} by moving your hips and feet together; your hands guide, your body commits.`,
    `Apply the ${category.toLowerCase()} mechanics in phases: break balance first, then enter, then finish with structure instead of force.`,
    `If the opponent resists, transition to your next option immediately rather than freezing; momentum and decision-making win exchanges.`,
    `Secure the end position for at least a three-count before releasing pressure so the movement becomes match-usable, not just drill-usable.`,
    `${tone}`,
  ];
}

function makeTips(position, belt) {
  return [
    belt === "white"
      ? "One clean rep beats five rushed reps."
      : "Link reactions: always know your next two options.",
    `In ${position}, head position and hip angle usually decide whether your technique succeeds.`,
    "Breathe on purpose during transitions so your timing stays sharp under fatigue.",
  ];
}

function makeMistakes() {
  return [
    "Skipping the setup and trying to force the finish.",
    "Stopping after the first resistance instead of chaining to the next response.",
    "Losing posture while focusing only on grips or hands.",
  ];
}

const techniques = [];
for (const position of POSITION_TABS) {
  for (const belt of ["white", "blue"]) {
    const list = seeds[position][belt];
    list.forEach(([name, category], idx) => {
      const id = `${belt}-${slug(position)}-${String(idx + 1).padStart(2, "0")}-${slug(name)}`;
      techniques.push({
        id,
        name,
        belt,
        position,
        category,
        shortDescription: `${name} for ${position}. Built from Core fundamentals with clear coaching detail and match-ready structure.`,
        fullStepByStep: makeSteps(name, position, belt, category),
        tips: makeTips(position, belt),
        commonMistakes: makeMistakes(),
        youtubeUrl: `https://www.youtube.com/watch?v=${nextVideo()}`,
        difficulty: belt === "white" ? "beginner" : "intermediate",
        curriculum: {
          sourceGym: "Core",
          track: `${belt}-core`,
          isMasterLibrary: true,
          tags: ["core", "core", "master-library", slug(position)],
        },
      });
    });
  }
}

const header = `export type PositionTab =\n${POSITION_TABS.map((p) => `  | \"${p}\"`).join("\n")};\n\nexport type Technique = {\n  id: string;\n  name: string;\n  belt: \"white\" | \"blue\";\n  position: PositionTab;\n  category: string;\n  shortDescription: string;\n  fullStepByStep: string[];\n  tips: string[];\n  commonMistakes: string[];\n  youtubeUrl: string;\n  difficulty: \"beginner\" | \"intermediate\";\n  curriculum: {\n    sourceGym: string;\n    track: string;\n    isMasterLibrary: boolean;\n    tags: string[];\n  };\n};\n\nexport type TechniqueOverride = Partial<Omit<Technique, \"id\">>;\n\nexport type GymTechniqueOverrides = Record<string, TechniqueOverride>;\n\nexport const POSITION_TABS: PositionTab[] = [\n${POSITION_TABS.map((p) => `  \"${p}\",`).join("\n")}\n];\n\nfunction video(id: string) {\n  return \`https://www.youtube.com/watch?v=\${id}\`;\n}\n\nexport function applyGymOverrides(\n  techniques: Technique[],\n  overrides?: GymTechniqueOverrides\n): Technique[] {\n  if (!overrides) return techniques;\n  return techniques.map((tech) => ({ ...tech, ...(overrides[tech.id] ?? {}) }));\n}\n\nexport const TECHNIQUES: Technique[] = [\n`;

const body = techniques.map((t) => `  {\n    id: \"${esc(t.id)}\",\n    name: \"${esc(t.name)}\",\n    belt: \"${t.belt}\",\n    position: \"${esc(t.position)}\",\n    category: \"${esc(t.category)}\",\n    shortDescription: \"${esc(t.shortDescription)}\",\n    fullStepByStep: [\n${t.fullStepByStep.map((s) => `      \"${esc(s)}\"`).join(",\n")}\n    ],\n    tips: [${t.tips.map((s) => `\"${esc(s)}\"`).join(", ")}],\n    commonMistakes: [${t.commonMistakes.map((s) => `\"${esc(s)}\"`).join(", ")}],\n    youtubeUrl: video(\"${t.youtubeUrl.split("=")[1]}\"),\n    difficulty: \"${t.difficulty}\",\n    curriculum: {\n      sourceGym: \"${t.curriculum.sourceGym}\",\n      track: \"${t.curriculum.track}\",\n      isMasterLibrary: ${t.curriculum.isMasterLibrary ? "true" : "false"},\n      tags: [${t.curriculum.tags.map((s) => `\"${esc(s)}\"`).join(", ")}],\n    },\n  }`).join(",\n\n");

const footer = `\n];\n\nexport function getTechniqueById(id: string): Technique | undefined {\n  return TECHNIQUES.find((technique) => technique.id === id);\n}\n`;

fs.writeFileSync(outPath, header + body + footer, "utf8");
console.log(`Wrote ${techniques.length} techniques to ${outPath}`);
