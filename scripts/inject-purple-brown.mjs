/**
 * Appends Purple + Brown curriculum (8 each per position) to app/data/techniques.ts
 * Run from repo root: node scripts/inject-purple-brown.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const techniquesPath = path.join(__dirname, "..", "app", "data", "techniques.ts");

const POSITIONS = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Leg Entanglements",
  "Submissions",
];

const POS_SLUG = {
  "Takedowns & Standing": "stand",
  "Guard Work": "guard",
  "Guard Passing": "pass",
  "Side Control": "side",
  Mount: "mount",
  "Back / Rear Mount": "back",
  "Turtle & Leg Entanglements": "turtle",
  Submissions: "sub",
};

const POOLS = {
  "Takedowns & Standing": [
    "0WjN8iuRk3o",
    "tgIXxV6Ax1o",
    "8wsjp47yR5w",
    "mJIVHZUGw40",
    "UWod5OtL9ME",
    "Mwy4wivg7Q0",
    "9SFHFIjSKsU",
    "1d1-MshrzQI",
  ],
  "Guard Work": [
    "MEqGy5-XINg",
    "2LEW823VWA8",
    "3HiTG1OOKAI",
    "ZnjNGoM_Iwo",
    "YabK3X1bnZs",
    "4ejQO_ehtPw",
    "G0GUobdo9OA",
    "goWtrxH64nk",
  ],
  "Guard Passing": [
    "ODuQCA88oY4",
    "isv_6Hd1Iac",
    "T4C4oPpwOSU",
    "734smcLl3sM",
    "9Rqy7e3J620",
    "xXZo1v74gm0",
    "RJsyUR4ouuM",
    "F5QOctE5fsY",
  ],
  "Side Control": [
    "8F6meOljv-s",
    "MEqGy5-XINg",
    "YabK3X1bnZs",
    "goWtrxH64nk",
    "2LEW823VWA8",
    "ZnjNGoM_Iwo",
    "4ejQO_ehtPw",
    "G0GUobdo9OA",
  ],
  Mount: [
    "C1dKaS19PEg",
    "gYmqLut1VN0",
    "JL3ii1RVcEQ",
    "r8iDzH9UwgY",
    "UtHOOyEPbeI",
    "mmnd5qpANlg",
    "BUW4STY1NEA",
    "-qfzOwgwZsg",
  ],
  "Back / Rear Mount": [
    "V6LFkdeSox0",
    "ODuQCA88oY4",
    "isv_6Hd1Iac",
    "T4C4oPpwOSU",
    "734smcLl3sM",
    "9Rqy7e3J620",
    "xXZo1v74gm0",
    "RJsyUR4ouuM",
  ],
  "Turtle & Leg Entanglements": [
    "jNC34nzjpOg",
    "8wsjp47yR5w",
    "mJIVHZUGw40",
    "UWod5OtL9ME",
    "Mwy4wivg7Q0",
    "9SFHFIjSKsU",
    "1d1-MshrzQI",
    "RzSbYD6RuTk",
  ],
  Submissions: [
    "C1dKaS19PEg",
    "gYmqLut1VN0",
    "JL3ii1RVcEQ",
    "V6LFkdeSox0",
    "MEqGy5-XINg",
    "3HiTG1OOKAI",
    "F5QOctE5fsY",
    "UtHOOyEPbeI",
  ],
};

/** [slug, name, category, difficulty, shortDescription] — purple = linking & dilemmas; brown = refinement & pressure systems */
const CURRICULUM = {
  "Takedowns & Standing": {
    purple: [
      ["duck-under-rear-bodylock", "Duck Under to Rear Body Lock", "Chain Wrestling", "advanced", "Sell level change, clear the elbow line, and connect chest-to-back before they rebuild posture."],
      ["hand-fight-penetrate", "Hand-Fight to Penetration Step", "Takedown Entry", "intermediate", "Win inside bicep ties, clear collar blocks, and time the shot when their far leg becomes light."],
      ["snap-down-go-behind", "Snap-Down to Go-Behind Chain", "Control", "advanced", "Use collar snap to load weight forward, then circle with sprawl discipline to replace head pressure with back control."],
      ["single-leg-shelf-run-pipe", "Single Leg Shelf to Run the Pipe", "Takedown", "intermediate", "Shelf high, block whizzer depth with forehead line, and turn the corner with hip-first running mechanics."],
      ["double-leg-chain-front-head", "Double Leg to Front Headlock Chain", "Chain Wrestling", "advanced", "If hips square, transition to front headlock instead of stalling; finish mat returns with lateral drops."],
      ["collar-tie-uchi-setup", "Collar Tie to Inside Trip Setup", "Trip / Sweep", "intermediate", "Steer posture in arcs so inside reaps meet diagonal pulls—timing beats reach."],
      ["two-on-one-mat-return", "Two-on-One Mat Return", "Control", "advanced", "Use Russian tie to break stance, then run elbow line to the mat while protecting your knee insertion."],
      ["sprawl-counter-re-shot", "Sprawl Counter to Re-Shot", "Defense", "intermediate", "Downblock and sprawl as one unit, then re-pummel underhooks and re-enter with cleaner head position."],
    ],
    brown: [
      ["misdirection-double", "Misdirection Double Leg", "Takedown", "advanced", "Layer feints: tie, snap, and level change so the real entry hides inside the second threat."],
      ["bodylock-sag-chain", "Bodylock Sag and Chain Finishes", "Control", "advanced", "Use sag step to break vertical posture, then chain outside trip or inside reap based on hip angle."],
      ["slide-by-rear-mat", "Slide-By to Rear Mat Return", "Chain Wrestling", "advanced", "Clear elbow with slide-by, immediately capture far hip, and finish with controlled lateral arc."],
      ["ankle-pick-wrestle-up", "Ankle Pick to Wrestle-Up", "Takedown Entry", "intermediate", "Pick on the recovery step and wrestle up through underhooks so you never stall at the ankles."],
      ["front-headlock-darce-threat", "Front Headlock Darce Threat to Go-Behind", "Submission Chain", "advanced", "Threaten darce depth to freeze hips, then release to go-behind when they defend the neck."],
      ["standing-cradle-breakdown", "Standing Cradle Breakdown (Gi)", "Control", "advanced", "Rare chain for specialists: secure cradle only with consent and coach oversight; prioritize safe mat returns."],
      ["kouchi-gari-timing", "Kouchi Gari Timing vs Pressure", "Trip / Sweep", "intermediate", "Small inner reaps when partner drives forward—pull creates the step you reap."],
      ["defense-chain-reshot", "Defense to Re-Attack Chain", "Defense", "advanced", "Map common counters: whizzer, sprawl, snap—each defense ends with a grip reset and a second honest attempt."],
    ],
  },
  "Guard Work": {
    purple: [
      ["dlr-kiss-dragon", "DLR to Kiss of the Dragon", "Guard Retention", "advanced", "Invert with lapel or belt control to recover when stack pressure steals height—never invert without a grip plan."],
      ["spider-lasso-chain-sweep", "Spider-Lasso Chain Sweep", "Sweep", "intermediate", "Reload feet on biceps and lasso to create continuous off-balances instead of single-shot yanks."],
      ["reverse-de-la-x-offense", "Reverse De La Riva Offense", "Guard", "advanced", "Use RDLR hook to steer knee line and enter kiss/backside attacks when passer commits to leg weave."],
      ["butterfly-ashi-chain", "Butterfly to Ashi Chain", "Leg Entanglement", "advanced", "Elevate and enter ashi when they post hands; respect gym heel-hook rules and default to control-only finishes."],
      ["collar-sleeve-matrix", "Collar-Sleeve Matrix Entries", "Guard", "intermediate", "Sequence tripod, sickle, and arm drag from the same grip family so reactions open new doors."],
      ["half-guard-dogfight-back", "Half Guard Dogfight to Back", "Back Take", "advanced", "Win underhook height, wedge knee behind hip, and climb to seatbelt without gifting crossface flattening."],
      ["closed-guard-two-on-one", "Closed Guard Two-on-One Systems", "Control", "intermediate", "Use 2-on-1 to break posture and chain pendulum, flower, and omoplata threats in rhythm."],
      ["open-guard-leg-pummel", "Open Guard Leg Pummel Mastery", "Retention", "advanced", "Pummel lasso, DLR, and K-guard entries while denying crossface—small circles beat long reaches."],
    ],
    brown: [
      ["worm-guard-chain", "Worm Guard Chain Concepts", "Guard", "advanced", "Feed lapel through legs to steer posture; chain sweeps only when partner’s base commits forward."],
      ["berimbolo-discipline", "Berimbolo Discipline (Control First)", "Back Take", "advanced", "Invert to capture hip line first; insert hooks only after shoulder line is won—no spinning without intent."],
      ["x-guard-sweep-matrix", "X-Guard Sweep Matrix", "Sweep", "advanced", "Single leg X and full X transitions off-balance standing passer into technical lifts or back takes."],
      ["deep-half-topple", "Deep Half Guard Topple Series", "Sweep", "intermediate", "Use underhook and knee torque to topple without exposing your neck to crossface counter-kimuras."],
      ["lasso-spider-kill", "Lasso-Spider Kill Chains", "Guard", "advanced", "Kill passer’s weave attempts by switching lasso sides and threatening omoplata lifts."],
      ["reverse-half-back", "Reverse Half Guard to Back", "Back Take", "advanced", "Enter waiter or reverse half to chase the back when they turn away to avoid smash passes."],
      ["shin-on-shin-chain", "Shin-on-Shin to Single X", "Leg Entanglement", "intermediate", "Use shin contact to redirect weight, then slide into SLX for sweeps allowed in your ruleset."],
      ["guard-retention-calculation", "Guard Retention Calculation Drill", "Mindset", "advanced", "Pre-visualize three frames per roll: where feet go if they crossface, weave, or stack—train decisions, not panic."],
    ],
  },
  "Guard Passing": {
    purple: [
      ["bodylock-slow-roll", "Bodylock Slow-Roll Passing", "Pressure Pass", "advanced", "Chest connection kills lasso inversions; micro-walk feet while you deny re-pummeling space."],
      ["leg-drag-backstep-chain", "Leg Drag Back-Step Chain", "Passing Chain", "intermediate", "Pin hips after drag; back-step only once crossface wins the head battle."],
      ["knee-cut-farside", "Knee Cut to Far Side", "Pressure Pass", "advanced", "Threaten near side, slice across when underhook appears, and settle three-quarter mount with head block."],
      ["stack-to-back", "Stack Pass to Back Take", "Passing Chain", "advanced", "Fold guard with disciplined neck line; insert hooks when they turn away to relieve stack pressure."],
      ["longstep-recounter", "Long Step Recounter System", "Movement Pass", "intermediate", "Second long step changes angle when lasso returns; never repeat the same failed lane."],
      ["leg-weave-counter", "Leg Weave Counter Passing", "Passing Chain", "advanced", "Weave shin across butterfly hooks, crossface early, and clear trapped ankle without standing tall."],
      ["over-under-knee-cut", "Over-Under to Knee Cut Bridge", "Pressure Pass", "advanced", "Use over-under to kill hips, then bridge to knee cut when they expose far knee shield."],
      ["passing-tempo-drill", "Passing Tempo and Grip Reset", "Fundamentals", "intermediate", "Train two-speed passing: slow pressure cycles, then one explosive window—never sprint without setup."],
    ],
    brown: [
      ["bodylock-calf-slice", "Bodylock into Calf Slice Threat (Gi)", "Pressure Pass", "advanced", "Use gi pant control in body lock to threaten calf compression passes where rules allow—prioritize control."],
      ["smash-pass-leg-weave", "Smash Pass Leg Weave Kill", "Pressure Pass", "advanced", "Kill knee-elbow escape by weaving over bottom leg while shoulder drives through sternum line."],
      ["float-pass-chain", "Float Passing Chain", "Movement Pass", "advanced", "Stay light on knees while switching toreando, leg drag, and knee slice in response to hip shifts."],
      ["north-south-guard-entry", "North-South Guard Entry Passing", "Passing Chain", "intermediate", "Use north-south rotation to kill seated guard frames before returning to side control."],
      ["double-pants-redirect", "Double Pants Redirect System", "Movement Pass", "advanced", "Steer both knees across center, then redirect to opposite corner when they hip escape predictably."],
      ["half-guard-knee-cut", "Half Guard Top Knee Cut", "Pressure Pass", "advanced", "Kill Z-guard frames with knee cut after whizzer and crossface stabilize the upper body."],
      ["leg-drag-inversion-follow", "Leg Drag Inversion Follow", "Passing Chain", "advanced", "When they invert, follow with shoulder pressure instead of chasing feet—ride the inversion."],
      ["passing-study-journal", "Passing Study Journal Method", "Mindset", "intermediate", "After each round log one passer mistake as a sentence—brown belt progress is pattern recognition."],
    ],
  },
  "Side Control": {
    purple: [
      ["kimura-trap-north-south", "Kimura Trap to North-South", "Submission Chain", "advanced", "Walk kimura line to north-south to expose armbar and back takes without releasing chest."],
      ["monoplata-chain", "Monoplata Chain from Side", "Submission Chain", "advanced", "Trap far arm behind thigh with controlled sit-through; finish only with supervision."],
      ["wrist-ride-mount", "Wrist Ride to Mount Climb", "Transition", "intermediate", "Gift wrap ride to clear bottom elbow and windshield-wiper to mount."],
      ["lapel-wedge-control", "Lapel Wedge Pinning", "Control", "advanced", "Feed wedge under near arm to block shrimp while crossface stays ethical on airway."],
      ["scarf-hold-timing", "Scarf Hold Attack Timing", "Submission", "intermediate", "Use kesa for far arm extension attacks while far leg kickstands base."],
      ["hip-switch-kob", "Hip Switch to Knee on Belly", "Transition", "advanced", "Float KOB to solicit pushes, then return to heavy side control or mount."],
      ["turtle-deny-chain", "Turtle Deny from Side", "Retention", "intermediate", "Track near shoulder to block early turn-ins with hip drops."],
      ["side-pressure-breath", "Side Control Pressure Breathing", "Fundamentals", "intermediate", "Coordinate exhale with forward hip drive through sternum, not throat."],
    ],
    brown: [
      ["side-mount-lapel-strangle", "Side Mount Lapel Strangle Setup", "Gi Choke", "advanced", "Use lapel folding from side mount to threaten loop and paper-cutter style pressure responsibly."],
      ["far-side-armbar-chain", "Far-Side Armbar Chain", "Submission Chain", "advanced", "Isolate far arm with knee slice entries and step-over finishes without losing crossface."],
      ["north-south-rotational-pin", "North-South Rotational Pin", "Pinning", "advanced", "Quarter-turn walks to kill frames while hunting kimura and choke lanes."],
      ["crucifix-entry-side", "Crucifix Entry from Side", "Submission Chain", "advanced", "Thread near arm trap from side pin with head control before rolling to crucifix."],
      ["reverse-side-control", "Reverse Side Control Domination", "Pinning", "intermediate", "Use reverse side to kill near-side frames and re-enter standard side with fresh crossface."],
      ["side-to-mount-backstep", "Side to Mount Back-Step", "Transition", "advanced", "Back-step mount entry when they turn in—block far hip throughout."],
      ["kimura-roll-recovery", "Kimura Roll Recovery (Top)", "Retention", "advanced", "If they roll kimura defense, follow with seatbelt connection instead of losing the grip entirely."],
      ["side-control-tempo", "Side Control Tempo Domination", "Mindset", "advanced", "Alternate between crushing cycles and micro-releases to exhaust intelligent defenders."],
    ],
  },
  Mount: {
    purple: [
      ["s-mount-collar-system", "S-Mount Collar System", "Submission Chain", "advanced", "Climb S-mount, isolate elbows, and layer cross-collar threats with armbar feints."],
      ["mounted-arm-triangle", "Mounted Arm Triangle", "Submission Chain", "advanced", "Gift wrap entries into head-and-arm with airway awareness and coach oversight."],
      ["switch-sides-mount", "Switch-Sides Mount Walk", "Transition", "intermediate", "Walk knees across to kill bridge angles and reopen high mount."],
      ["elbow-persistence-armbar", "Elbow Persistence to Armbar", "Submission Chain", "advanced", "Micro-pry elbows before S-mount; finish armbar with thumb-up discipline."],
      ["mount-to-triangle-threat", "Mount to Triangle Threat", "Submission Chain", "intermediate", "Sit high to capture head-arm when they bench—return to mount if posture recovers."],
      ["upa-surf-timing", "Upa Surf Timing", "Retention", "intermediate", "Post on diagonals early; surf bridges instead of resisting with stiffness."],
      ["mount-grip-fight", "Mount Grip Fighting Systems", "Control", "advanced", "Win inside wrist battles before climbing; never climb with loose knees."],
      ["technical-mount-pressure", "Technical Mount Pressure", "Pinning", "intermediate", "Use technical mount to split arms and threaten high-percentage chokes."],
    ],
    brown: [
      ["mount-gogoplata-threat", "Mount Gogoplata Threat (Flexibility)", "Submission Chain", "advanced", "Optional high-risk attack: only with consent; prioritize shin control over spine crank."],
      ["cross-mount-transitions", "Cross Mount Transition System", "Transition", "advanced", "Switch between mount, S-mount, and north-south to deny predictable escapes."],
      ["mount-back-step-armbar", "Mount Back-Step Armbar", "Submission Chain", "advanced", "Back-step into armbar when they turn away—maintain knee on biceps line."],
      ["gift-wrap-mount-chain", "Gift Wrap Mount Chains", "Control", "advanced", "Use gift wrap to open collar chokes without torqueing the spine recklessly."],
      ["mount-body-triangle", "Mount Body Triangle Control", "Control", "intermediate", "Lock body triangle from mount for short control bursts—avoid rib squeezing."],
      ["mount-attacks-flow", "Mount Attack Flow Roll", "Mindset", "intermediate", "Chain three attacks slowly; brown belt finishes come from patience."],
      ["mount-knee-drive", "Mount Knee Drive Pin", "Pinning", "advanced", "Drive knees through armpit lines to kill elbow re-insertion during climbs."],
      ["mount-psychology", "Mount Psychology and Pace", "Mindset", "advanced", "Alternate threat density: sometimes silence and weight beat constant attacking."],
    ],
  },
  "Back / Rear Mount": {
    purple: [
      ["rnc-handfight", "RNC Handfight Solutions", "Submission", "advanced", "Mirror defenses with swims; use hooks to extend when chin tucks."],
      ["body-triangle-finish-setup", "Body Triangle Finish Setup", "Control", "intermediate", "Lock body triangle on safe side to buy collar and RNC lanes."],
      ["mata-leao-detail", "Mata Leão Grip Detail", "Submission", "advanced", "Parallel forearm blade, support hand on crown, expand chest—no jaw cranks."],
      ["seatbelt-climb", "Seatbelt High Back Climb", "Control", "intermediate", "Swim over peel attempts and re-seat higher on shoulder line."],
      ["strangle-chain-drill", "Strangle Chain Drill", "Mindset", "intermediate", "Rotate bow-and-arrow, RNC, and short choke with partner resets."],
      ["peanut-butter-turn-defense", "Peanut Butter Turn Defense", "Retention", "advanced", "Drop cheek, insert second hook during turn, re-seat seatbelt low."],
      ["back-attack-pace", "Back Attack Pace Control", "Mindset", "intermediate", "Attack in clusters with breath resets—fatigue causes sloppy chokes."],
      ["gi-back-pant-stretch", "Gi Back Pant Stretch Systems", "Submission", "advanced", "Pair collar depth with pant stretch mechanics for bow-and-arrow refinements."],
    ],
    brown: [
      ["parallel-rnc", "Parallel RNC Finishes", "Submission", "advanced", "Refine parallel forearm finish when standard RNC geometry is blocked."],
      ["back-mount-transition", "Back to Mount Transition", "Transition", "intermediate", "When hooks slip, transition to mount with gift wrap instead of losing everything."],
      ["choke-hand-trap", "Choke Hand Trap Systems", "Submission Chain", "advanced", "Trap two-on-one defenses and insert short choke or arm triangle."],
      ["back-bodylock-standing", "Standing Back Bodylock Finishes", "Control", "advanced", "Control standing back with seatbelt and mat returns per academy rules."],
      ["rear-mount-leg-ride", "Rear Mount Leg Ride", "Control", "intermediate", "Use hook tension variations to steer hip escape attempts into strangles."],
      ["back-attack-fakes", "Back Attack Fakes", "Mindset", "advanced", "Sell false collar grips to open true RNC insertion windows."],
      ["defensive-back-escape-study", "Defensive Back Escape Study (Bottom)", "Defense", "advanced", "Map safe-side escapes with frames—teach partners ethical defense density."],
      ["back-system-journal", "Back System Journaling", "Mindset", "intermediate", "Log which strangle required fewest steps from seatbelt—optimize your default."],
    ],
  },
  "Turtle & Leg Entanglements": {
    purple: [
      ["crucifix-entry", "Crucifix Entry Refinement", "Control", "advanced", "Isolate arm, thread leg trap, roll with head control before attacking."],
      ["anaconda-roll", "Anaconda Roll Chains", "Submission Chain", "advanced", "Roll with gable grip integrity and land in controlled side pin."],
      ["outside-ashi-entry", "Outside Ashi Entry", "Leg Entanglement", "intermediate", "Enter outside ashi with heel line focus; follow gym leglock rules."],
      ["inside-sankaku-defense", "Inside Sankaku Defense Study", "Defense", "advanced", "Hide heel, cross safely if allowed, tap early—study with upper belts."],
      ["guillotine-counter-turtle", "Guillotine Counter from Turtle", "Defense", "intermediate", "Two-on-one wrist, peek-out toward safe side."],
      ["k-guard-entry", "K-Guard Entry Concepts", "Leg Entanglement", "advanced", "Enter K-guard only under coach ruleset; prioritize control over drama."],
      ["clock-choke-finish", "Clock Choke Finish Details", "Submission", "advanced", "Walk clock with deep collar and humane shoulder angles."],
      ["leg-entanglement-flow", "Leg Entanglement Flow Rounds", "Mindset", "intermediate", "Flow SLX, ashi, and standing with agreed finish rules."],
    ],
    brown: [
      ["heel-exposure-theory", "Heel Exposure Theory (Ruleset)", "Leg Lock", "advanced", "Study inside heel mechanics as theory until competition rules and coach clear you."],
      ["411-entry-chain", "411 Honey Hole Entry Chains", "Leg Entanglement", "advanced", "Chain entries from cross ashi when rules allow—control before submission."],
      ["turtle-power-half", "Turtle Power Half (Supervised)", "Control", "advanced", "High-pressure rides only with consent; prioritize partner spine safety."],
      ["crucifix-strangle", "Crucifix Strangle Finishes", "Submission", "advanced", "Stabilize crucifix before chokes; no rolling without arm trap."],
      ["leg-lock-back-take", "Leg Lock to Back Take", "Back Take", "advanced", "When they roll out of leg entanglements, follow to back with seatbelt."],
      ["turtle-breakdown-system", "Turtle Breakdown System", "Control", "intermediate", "Layer seatbelt, spiral ride, and power half as a decision tree."],
      ["defensive-turtle-peek", "Defensive Turtle Peek Mastery", "Escape", "intermediate", "Peek with posts and frames without gifting guillotines."],
      ["leg-entanglement-culture", "Leg Entanglement Training Culture", "Mindset", "advanced", "Brown belts set the tone: clear rules, clear taps, clear respect."],
    ],
  },
  Submissions: {
    purple: [
      ["loop-choke-setup", "Loop Choke Setup from Guard Top", "Gi Choke", "advanced", "Feed loop when they turn away in stack; block hip roll-through."],
      ["armbar-kimura-chain", "Armbar to Kimura Chain", "Submission Chain", "advanced", "Switch on hitchhiker defenses without losing knee pinch."],
      ["north-south-guillotine", "North-South Guillotine", "Guillotine", "intermediate", "High wrist, sprawl hips to far shoulder, finish with spine alignment."],
      ["wristlock-ethics", "Wristlock Ethics in Training", "Mindset", "beginner", "Ask consent; finish with minimal torque; thank partners."],
      ["heel-hook-theory", "Heel Hook Theory (Control)", "Leg Lock", "advanced", "Control positions only until rules and coach approve finishing study."],
      ["triangle-armbar-chain", "Triangle to Armbar Chain", "Submission Chain", "advanced", "Flow between triangle and armbar with hip mobility priority."],
      ["paper-cutter-mount", "Paper Cutter from Mount", "Gi Choke", "advanced", "Cross-collar depth with driving forearm—ethical pressure only."],
      ["submission-pace", "Submission Pace and Clusters", "Mindset", "intermediate", "Attack in waves: three threats, reset breath, repeat."],
    ],
    brown: [
      ["darce-brabo-chain", "Darce / Brabo Chain (Nogi)", "Choke", "advanced", "Link front headlock attacks with darce entries when curriculum includes nogi."],
      ["cross-collar-breadcutter", "Cross Collar Breadcutter Pressure", "Gi Choke", "advanced", "Use lapel folding pressure systems with airway respect."],
      ["mounted-von-flue", "Mounted Von Flue Counter Chain", "Submission Chain", "advanced", "Study von flue counters when opponent turns during mount attacks."],
      ["inverted-triangle", "Inverted Triangle from Guard", "Triangle", "advanced", "High complexity finish: drill with supervision and mobility honesty."],
      ["calf-slicer-theory", "Calf Slicer Theory (Gi)", "Compression", "advanced", "Understand compression mechanics where legal; prioritize tap culture."],
      ["kimura-trap-back", "Kimura Trap to Back Finish", "Submission Chain", "advanced", "Ride kimura trap into back exposure without ripping shoulder lines."],
      ["submission-meta-game", "Submission Meta-Game", "Mindset", "advanced", "Force them to defend your B-game so A-game opens—brown belt deception."],
      ["coach-others-finishes", "Coaching Others on Finishes", "Mindset", "intermediate", "Teaching sharpens your own strangles—explain pressure, not pain."],
    ],
  },
};

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildSteps(position, belt, name, category) {
  const tier = belt === "brown" ? "Brown belt" : "Purple belt";
  const focus =
    belt === "brown"
      ? "micro-adjustments, fewer steps, and ruthless efficiency"
      : "linking dilemmas, grip upgrades, and positional honesty";
  return [
    `${tier} framing: anchor the first control point so you can read weight shifts before committing to "${name}"—never rush the first connection.`,
    `Map two reactions: write mentally what happens if they post early versus late, then pre-load your second grip so your ${category.toLowerCase()} sequences stay one step ahead.`,
    `Layer pressure in thirds: first third establishes line, second third steals balance, final third applies the finish or transition—${focus}.`,
    `Keep head and hip relationship disciplined: where your forehead points usually tells the truth about whether you are blocking their escape or chasing your own balance.`,
    `Use training rounds to log one detail per rep—thumb angle, elbow height, or knee line—and adjust on the next entry until the pattern feels repeatable under fatigue.`,
    `End every hard repetition with a reset ritual: shake wrists, thank your partner, and name one thing you will try cleaner next time—culture is part of technique.`,
  ];
}

function formatTech(t) {
  const pool = POOLS[t.position];
  const vid = pool[t.videoIdx % pool.length];
  const steps = t.fullStepByStep.map((l) => `      "${esc(l)}"`).join(",\n");
  const tips = t.tips.map((l) => `"${esc(l)}"`).join(", ");
  const mistakes = t.commonMistakes.map((l) => `"${esc(l)}"`).join(", ");
  return `  {
    id: "${t.id}",
    name: "${esc(t.name)}",
    belt: "${t.belt}",
    position: "${t.position}",
    category: "${esc(t.category)}",
    shortDescription: "${esc(t.shortDescription)}",
    fullStepByStep: [
${steps}
    ],
    tips: [${tips}],
    commonMistakes: [${mistakes}],
    youtubeUrl: video("${vid}"),
    difficulty: "${t.difficulty}",
  }`;
}

const out = [];
for (const position of POSITIONS) {
  const pack = CURRICULUM[position];
  let vi = 0;
  for (const belt of ["purple", "brown"]) {
    const rows = pack[belt];
    rows.forEach(([slug, name, category, difficulty, shortDescription], idx) => {
      const id = `${belt}-${POS_SLUG[position]}-${String(idx + 1).padStart(2, "0")}-${slug}`;
      const fullStepByStep = buildSteps(position, belt, name, category);
      const tips = [
        belt === "brown"
          ? "Brown belt efficiency: fewer moving parts, more consequence per inch."
          : "Purple belt creativity: same grip, different second threats—make them guess wrong once.",
        "If you cannot explain the technique in one sentence, you are probably muscling—slow down and rebuild the first layer.",
        "Film one rep monthly; video does not lie about posture leaks.",
      ];
      const commonMistakes = [
        "Skipping the grip fight and jumping to the finish.",
        "Training the move only on tired partners—test it fresh and honest too.",
      ];
      out.push(
        formatTech({
          id,
          name,
          belt,
          position,
          category,
          shortDescription,
          fullStepByStep,
          tips,
          commonMistakes,
          difficulty,
          videoIdx: vi++,
        })
      );
    });
  }
}

const chunk = `  // Purple Belt curriculum (8 per position)\n  // Brown Belt curriculum (8 per position)\n${out.join(",\n")}`;

let s = fs.readFileSync(techniquesPath, "utf8");
if (s.includes('"purple-stand-01-duck-under-rear-bodylock"')) {
  console.log("Purple/brown curriculum already present — skipping.");
  process.exit(0);
}
const tailRe = /\r?\n\];\r?\n\r?\nexport function getTechniqueById/;
const m = s.match(tailRe);
if (!m || m.index === undefined) {
  console.error("Array end marker not found — file may have changed.");
  process.exit(1);
}
const insertPoint = m.index;
const before = s.slice(0, insertPoint);
const tail = s.slice(insertPoint);
if (!/\r?\n  \}$/.test(before)) {
  console.error("Expected TECHNIQUES array to end with closing brace.");
  process.exit(1);
}
const fixed = before.replace(/\r?\n  \}$/, `\r\n  },\r\n${chunk.replace(/\n/g, "\r\n")}`);
s = fixed + tail;
fs.writeFileSync(techniquesPath, s);
console.log("Injected", out.length, "techniques (purple + brown, 8 per belt per position).");
