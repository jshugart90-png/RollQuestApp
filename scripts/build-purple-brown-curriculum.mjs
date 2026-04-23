import fs from "fs";
import path from "path";

const outDir = path.resolve("app/data/curriculum");

const positions = [
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

const positionSlug = {
  "Takedowns & Standing": "takedowns-standing",
  "Guard Work": "guard-work",
  "Guard Passing": "guard-passing",
  "Side Control": "side-control",
  Mount: "mount",
  "Back / Rear Mount": "back-rear-mount",
  "Turtle & Leg Entanglements": "turtle-leg-entanglements",
  Submissions: "submissions",
  "Self Defense": "self-defense",
  Escapes: "escapes",
};

const vids = [
  "0WjN8iuRk3o","tgIXxV6Ax1o","8wsjp47yR5w","mJIVHZUGw40","UWod5OtL9ME","Mwy4wivg7Q0","9SFHFIjSKsU","1d1-MshrzQI","RzSbYD6RuTk",
  "MEqGy5-XINg","2LEW823VWA8","3HiTG1OOKAI","ZnjNGoM_Iwo","YabK3X1bnZs","4ejQO_ehtPw","G0GUobdo9OA","goWtrxH64nk",
  "ODuQCA88oY4","isv_6Hd1Iac","T4C4oPpwOSU","734smcLl3sM","9Rqy7e3J620","xXZo1v74gm0","RJsyUR4ouuM","F5QOctE5fsY",
  "8F6meOljv-s","C1dKaS19PEg","gYmqLut1VN0","JL3ii1RVcEQ","r8iDzH9UwgY","UtHOOyEPbeI","mmnd5qpANlg","BUW4STY1NEA","-qfzOwgwZsg",
  "V6LFkdeSox0","jNC34nzjpOg"
];
let vi = 0;
const nextVid = () => vids[(vi++) % vids.length];

const purpleSeeds = {
  "Takedowns & Standing": [
    ["Russian Tie to Snap-Down Chain", "Chain Wrestling"], ["Single Leg Shelf and Crackdown", "Takedown"],
    ["Duck Under to Rear Body Lock", "Off-Balance"], ["Collar Drag to Kouchi", "Gi Takedown"],
    ["Whizzer Kickout Re-Attack", "Counter Wrestling"], ["Front Headlock to Go-Behind Cycle", "Control"],
    ["Body Lock to Outside Trip Variations", "Clinch"], ["Foot Sweep Combo Timing", "Trip / Sweep"],
  ],
  "Guard Work": [
    ["De La Riva to X-Guard Chain", "Open Guard"], ["Lasso to Omoplata Sweep Path", "Gi Guard"],
    ["Half Guard Dogfight to Back", "Back Take"], ["Butterfly to SLX Decision Tree", "Leg Entanglement"],
    ["Collar-Sleeve Attack Matrix", "Gi Guard"], ["Reverse DLR Back Exposure", "Open Guard"],
    ["K-Guard Entry to Technical Stand", "Guard Transition"], ["Advanced Guard Retention Pummeling", "Retention"],
  ],
  "Guard Passing": [
    ["Body Lock Shoulder Pressure Pass", "Pressure Pass"], ["Leg Drag to Mount Chain", "Passing Chain"],
    ["Knee Cut to North-South Transfer", "Pressure Pass"], ["Long Step Re-Counter System", "Movement Pass"],
    ["Over-Under to Back-Step", "Passing Chain"], ["Headquarters Passing Reactions", "Passing Strategy"],
    ["Half Guard Flatten and Crossface", "Pressure Pass"], ["Stack Control to Side Switch", "Stack Pass"],
  ],
  "Side Control": [
    ["Kimura Trap to Back Take", "Submission Chain"], ["North-South Kimura Re-Entry", "Submission Chain"],
    ["Near-Side Wrist Ride Flow", "Control"], ["Lapel Wedge to Mount", "Gi Control"],
    ["Kesa Gatame Attack Cycle", "Submission"], ["Hip Switch Reverse Side Pin", "Pinning"],
    ["Knee-on-Belly Reaction Tree", "Transition"], ["Crucifix Entry from Side", "Control"],
  ],
  Mount: [
    ["S-Mount Armbar / Collar Chain", "Submission Chain"], ["Mounted Arm Triangle Details", "Submission"],
    ["Gift Wrap to Back Sequence", "Back Take"], ["Technical Mount Hand Trap", "Control"],
    ["High Mount Elbow Split", "Control"], ["Mounted Triangle Threat", "Submission Chain"],
    ["Mount Side Switch Retention", "Retention"], ["Pressure Mount to Ezekiel", "Gi Choke"],
  ],
  "Back / Rear Mount": [
    ["RNC Hand Fighting Layers", "Submission"], ["Body Triangle Pressure Steering", "Control"],
    ["Bow-and-Arrow to Armbar Switch", "Gi Choke"], ["Short Choke Finishing Details", "Submission"],
    ["Seatbelt Climb and Hook Recovery", "Control"], ["Back to Mount Transition", "Transition"],
    ["Collar Grip Trap and Finish", "Gi Choke"], ["Back Escape Counter Traps", "Retention"],
  ],
  "Turtle & Leg Entanglements": [
    ["Crucifix Arm Trap Sequence", "Control"], ["Anaconda Entry to Front Headlock", "Submission Chain"],
    ["Outside Ashi Entry with Knee Line Control", "Leg Entanglement"], ["Inside Sankaku Defensive Sequence", "Defense"],
    ["Clock Choke Finishing Route", "Gi Choke"], ["Turtle Ride Spiral to Back", "Control"],
    ["K-Guard Safety and Exit", "Leg Entanglement"], ["Leg Entanglement to Back Take", "Transition"],
  ],
  Submissions: [
    ["Armbar to Triangle to Omoplata", "Submission Chain"], ["Loop Choke Reaction Finishes", "Gi Choke"],
    ["North-South Guillotine Details", "Guillotine"], ["Kimura Trap Finishing System", "Submission Chain"],
    ["Baseball Bat Timing Entries", "Gi Choke"], ["Cross Collar from Mount Variations", "Gi Choke"],
    ["Submission Threat Clustering", "Strategy"], ["Leg Lock Safety and Control", "Leg Lock"],
  ],
  "Self Defense": [
    ["Haymaker Cover to Clinch Control", "Striking Defense"], ["Wall Pin Escape and Exit", "Scenario"],
    ["Standing Guillotine Threat to Exit", "Clinch Defense"], ["Single Leg Defense in Self Defense", "Takedown Defense"],
    ["Guard Under Strikes Distance Control", "Ground Defense"], ["Mount Strike Frame and Bridge", "Ground Defense"],
    ["Multiple Opponent Exit Priorities", "Scenario"], ["Self Defense Decision Ladder", "Strategy"],
  ],
  Escapes: [
    ["Side Control Underhook Escape Chain", "Pin Escape"], ["Mount Escape Decision Tree", "Pin Escape"],
    ["Back Escape Against Body Triangle", "Back Escape"], ["Knee-on-Belly Counter Escape", "Counter Escape"],
    ["Scarf Hold to Backdoor Escape", "Pin Escape"], ["North-South Inversion Recovery", "Pin Escape"],
    ["Armbar Hitchhiker Recovery", "Submission Escape"], ["Late Guillotine Escape Concepts", "Submission Escape"],
  ],
};

const brownSeeds = {
  "Takedowns & Standing": [
    ["Inside Trip to Front Headlock Chain", "Chain Wrestling"], ["Slide-By to Rear Mat Return", "Off-Balance"],
    ["Single Leg to Double Leg Conversion", "Takedown"], ["Body Lock Sag and Reap", "Clinch"],
    ["Counter Shot to Spin Behind", "Counter Wrestling"], ["Snap-Down to Darce Threat", "Submission Threat"],
    ["Ankle Pick from Hand Fighting", "Takedown Entry"], ["Gi Grip Trap Throw Setup", "Gi Takedown"],
  ],
  "Guard Work": [
    ["Worm-Style Lapel Control Routes", "Gi Guard"], ["Berimbolo Control Path", "Back Take"],
    ["X-Guard to Technical Lift", "Sweep"], ["Deep Half Back Exposure", "Back Take"],
    ["Lasso Spider Hybrid Control", "Open Guard"], ["K-Guard to Saddle Entry Theory", "Leg Entanglement"],
    ["Reverse Half Guard Sweeps", "Sweep"], ["High-Level Guard Retention Chains", "Retention"],
  ],
  "Guard Passing": [
    ["Body Lock to Split Squat Finish", "Pressure Pass"], ["Smash Pass Knee Isolation", "Pressure Pass"],
    ["Leg Drag Inversion Follow", "Passing Chain"], ["Cross Grip Torreando to Mount", "Movement Pass"],
    ["Half Guard Head Control Passing", "Pressure Pass"], ["Float Passing Side Switches", "Movement Pass"],
    ["North-South to Leg Weave", "Passing Chain"], ["Passing Meta-Game Sequencing", "Strategy"],
  ],
  "Side Control": [
    ["Far-Side Armbar Conversion", "Submission Chain"], ["North-South Rotational Pin", "Pinning"],
    ["Lapel Strangle from Side", "Gi Choke"], ["Kimura Roll Follow-Up", "Submission Chain"],
    ["Reverse Side Control Domination", "Pinning"], ["Side to Mount Back-Step", "Transition"],
    ["Crucifix Follow with Choke", "Submission"], ["Pressure Cycle Fatigue Strategy", "Strategy"],
  ],
  Mount: [
    ["Mount Transition Web", "Transition"], ["Back-Step Armbar from Mount", "Submission"],
    ["Gift Wrap Collar Finish Route", "Gi Choke"], ["Cross Mount to S-Mount Entries", "Control"],
    ["Elbow Split to Arm Triangle", "Submission Chain"], ["Technical Mount Ride Detail", "Control"],
    ["Mount Threat Pacing", "Strategy"], ["Mount to Back to Mount Loop", "Transition"],
  ],
  "Back / Rear Mount": [
    ["Parallel RNC Mechanics", "Submission"], ["Back Body Lock Standing Returns", "Control"],
    ["Choke Hand Trap System", "Submission Chain"], ["Hook Steering vs Hip Escapes", "Retention"],
    ["Back Attack Fakes and Traps", "Strategy"], ["Bow-and-Arrow Grip Upgrades", "Gi Choke"],
    ["Short Choke to Armbar Route", "Submission Chain"], ["Back Control Coaching Framework", "Teaching"],
  ],
  "Turtle & Leg Entanglements": [
    ["411 Entry Concepts", "Leg Entanglement"], ["Leg Lock to Back Conversion", "Transition"],
    ["Turtle Breakdown System", "Control"], ["Crucifix Strangle Finishes", "Submission"],
    ["Power Half Nelson Safety Route", "Control"], ["Inside Heel Exposure Theory", "Leg Lock"],
    ["Turtle Peek and Re-Attack", "Escape"], ["Leg Entanglement Coaching Protocol", "Teaching"],
  ],
  Submissions: [
    ["Darce / Brabo Integration", "Choke"], ["Breadcutter Pressure System", "Gi Choke"],
    ["Kimura Trap to Back Finish", "Submission Chain"], ["Inverted Triangle Finishing Details", "Triangle"],
    ["Cross Collar Finishing Layers", "Gi Choke"], ["Submission Meta-Game Sequencing", "Strategy"],
    ["Coaching Finishing Mechanics", "Teaching"], ["Advanced Safety and Consent Protocol", "Fundamentals"],
  ],
  "Self Defense": [
    ["Advanced Clinch Entry under Pressure", "Scenario"], ["Wall and Vehicle Confinement Escapes", "Scenario"],
    ["Weapon Threat Distance Management", "Awareness"], ["Third-Party Protection Priorities", "Scenario"],
    ["Ground Strike Survival to Exit", "Ground Defense"], ["Takedown Defense Under Chaos", "Takedown Defense"],
    ["De-Escalation Leadership Framework", "Strategy"], ["Post-Incident Legal / Medical Checklist", "Protocol"],
  ],
  Escapes: [
    ["Late Stage Pin Escape Chains", "Pin Escape"], ["Body Triangle Escape Layers", "Back Escape"],
    ["Submission Escape Prioritization", "Submission Escape"], ["Leg Entanglement Defensive Tree", "Leg Lock Escape"],
    ["Mounted Attack Survival Framework", "Ground Defense"], ["Crossface Denial from Bottom", "Defensive Posture"],
    ["Escape Timing Under Fatigue", "Strategy"], ["Coachable Escape Diagnostics", "Teaching"],
  ],
};

function slug(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function esc(input) {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function steps(name, position, belt, category) {
  const beltNote = belt === "purple"
    ? "Purple belt focus: build dilemmas and force predictable reactions."
    : "Brown belt focus: reduce wasted motion and punish every predictable defense.";
  return [
    `Start ${name} by winning the first tactical layer from ${position}: posture, base, and head alignment before speed.`,
    `Create the angle that serves ${category.toLowerCase()} mechanics, then commit your hips and shoulders together so your movement stays connected.`,
    `Apply pressure in phases: first break balance, second isolate the line, third finish or transition without pausing.`,
    `If the first lane closes, immediately chain to your secondary option instead of resetting to neutral; advanced grappling rewards continuity.`,
    `Stabilize the final position with deliberate weight and breathing so the technique holds under resistance, not only in cooperative drilling.`,
    `${beltNote}`,
  ];
}

function tips(position, belt) {
  return [
    belt === "purple"
      ? "Use one grip to create two threats whenever possible."
      : "At brown belt, your best technique usually looks simple because timing is doing the work.",
    `In ${position}, keep your head and hip lines disciplined; they determine control quality.`,
    "Film and review one round each week to catch micro-errors your partner cannot describe in the moment.",
  ];
}

function mistakes() {
  return [
    "Rushing the finish before the control layer is secure.",
    "Stopping after the first defended attempt instead of chaining to the next option.",
    "Letting posture collapse while hand-fighting.",
  ];
}

function buildFile(varName, belt, seedMap, headerComment) {
  const entries = [];
  for (const position of positions) {
    seedMap[position].forEach(([name, category], idx) => {
      const id = `${belt}-${positionSlug[position]}-${String(idx + 1).padStart(2, "0")}-${slug(name)}`;
      entries.push({
        id,
        name,
        belt,
        position,
        category,
        shortDescription: `${name} for ${position}. Core ${belt} core with coaching-level detail for live rounds.`,
        fullStepByStep: steps(name, position, belt, category),
        tips: tips(position, belt),
        commonMistakes: mistakes(),
        youtubeUrl: `https://www.youtube.com/watch?v=${nextVid()}`,
        difficulty: belt === "purple" ? "intermediate" : idx % 2 === 0 ? "advanced" : "intermediate",
        curriculum: {
          sourceGym: "Core",
          track: `${belt}-core`,
          isMasterLibrary: true,
          tags: ["core", "core", "master-library", positionSlug[position], belt],
        },
      });
    });
  }

  const content = `import type { Technique } from "./index";

function video(id: string) {
  return \`https://www.youtube.com/watch?v=\${id}\`;
}

/**
 * ${headerComment}
 */
export const ${varName}: Technique[] = [
${entries.map((t) => `  {
    id: "${esc(t.id)}",
    name: "${esc(t.name)}",
    belt: "${t.belt}",
    position: "${esc(t.position)}",
    category: "${esc(t.category)}",
    shortDescription: "${esc(t.shortDescription)}",
    fullStepByStep: [
${t.fullStepByStep.map((s) => `      "${esc(s)}"`).join(",\n")}
    ],
    tips: [${t.tips.map((s) => `"${esc(s)}"`).join(", ")}],
    commonMistakes: [${t.commonMistakes.map((s) => `"${esc(s)}"`).join(", ")}],
    youtubeUrl: video("${t.youtubeUrl.split("=")[1]}"),
    difficulty: "${t.difficulty}",
    curriculum: {
      sourceGym: "Core",
      track: "${t.curriculum.track}",
      isMasterLibrary: true,
      tags: [${t.curriculum.tags.map((s) => `"${esc(s)}"`).join(", ")}],
    },
  }`).join(",\n\n")}
];
`;
  return content;
}

const purpleFile = buildFile(
  "Core_PURPLE_TECHNIQUES",
  "purple",
  purpleSeeds,
  "Core Purple Belt core curriculum (8 techniques per position)."
);
const brownFile = buildFile(
  "Core_BROWN_TECHNIQUES",
  "brown",
  brownSeeds,
  "Core Brown Belt core curriculum (8 techniques per position)."
);

fs.writeFileSync(path.join(outDir, "core.purple.ts"), purpleFile, "utf8");
fs.writeFileSync(path.join(outDir, "core.brown.ts"), brownFile, "utf8");
console.log("Generated purple and brown curriculum files.");
