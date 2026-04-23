import type { Technique } from "./index";

type RequestedItem = {
  name: string;
  position: Technique["position"];
  category: string;
  difficulty?: Technique["difficulty"];
};

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDetailedSteps(item: RequestedItem): string[] {
  const title = item.name;
  if (item.category === "Throws" || item.category === "Takedown Defense" || item.position === "Takedowns & Standing") {
    return [
      `Start in a balanced stance for ${title}: posture tall, chin tucked, and feet under your hips.`,
      "Win the initial hand-fight and establish your primary grip/control point before committing your hips.",
      "Create kuzushi (off-balance) by pulling/pushing on an angle, not straight back.",
      "Step your entry foot to the correct line and bring your hips/chest close to remove space.",
      "Complete the throw/takedown with directional pressure and maintain top control through the landing.",
      "Stabilize for three seconds before transitioning to your next positional objective.",
    ];
  }
  if (item.category === "Sweeps") {
    return [
      `Establish your guard structure and grips before attempting ${title}.`,
      "Break your partner's posture and load their weight onto the side you intend to sweep.",
      "Use your legs and hips together to create lift while your grips control rotation.",
      "Turn your shoulders in the direction of the sweep and follow through without pausing midway.",
      "Come up immediately to top position and secure chest-to-chest or knee-line control.",
      "Settle base and posture before attacking the next transition or submission.",
    ];
  }
  if (item.category === "Passing" || item.category === "Guard Entries" || item.category === "Guard Re-entries") {
    return [
      `Frame and posture first so ${title} starts from a safe base.`,
      "Control the nearest leg/hip line to prevent your partner from re-guarding.",
      "Move your feet in short, stable steps while keeping pressure through your shoulder and hips.",
      "Clear the knee-line completely before switching your hips to settle control.",
      "Pin the far shoulder/hip and connect your chest to remove space.",
      "Consolidate side control or mount before starting any submission chain.",
    ];
  }
  if (item.category === "Submissions") {
    return [
      `Secure dominant control first, then begin ${title} with clean grip placement.`,
      "Isolate the target limb/neck by controlling the far shoulder or head line.",
      "Adjust your angle before applying pressure; finish mechanics come from alignment, not strength.",
      "Apply the submission in stages so you can maintain control if your partner defends.",
      "Track common defensive reactions and convert to your secondary attack if needed.",
      "Release immediately on tap and return to stable positional control.",
    ];
  }
  if (item.category === "Escapes" || item.category === "Submission Defense") {
    return [
      `Protect first: frame, hide vulnerable limbs, and build structure for ${title}.`,
      "Create a wedge with elbows/knees before trying to move your hips.",
      "Bridge or shrimp to open space, then insert your knee/shin as a barrier.",
      "Turn to your safest side and recover guard or come to a technical stand-up.",
      "Re-establish posture and distance to prevent immediate re-attack.",
      "Reset grips and return to your preferred defensive structure.",
    ];
  }
  if (item.category === "Transitions") {
    return [
      `Begin ${title} from stable control with your partner already off-balanced.`,
      "Maintain one anchor grip while changing your angle for the next attack.",
      "Shift hips and shoulder line as a unit so you stay heavy during the transition.",
      "Flow into the second control point before letting go of the first.",
      "Check posture and pressure after the transition to deny scrambles.",
      "Continue to your finishing option only once control is fully established.",
    ];
  }
  if (item.category === "Self Defense") {
    return [
      `Recognize the attack early and create a stable base before using ${title}.`,
      "Address immediate danger first: clear airway/pressure line and protect posture.",
      "Control at least one attacking arm/wrist to prevent follow-up strikes or re-grips.",
      "Step to a safe angle while applying the core defense mechanic.",
      "Disengage or off-balance into a controlled takedown/throw when appropriate.",
      "Create distance, scan for additional threats, and exit to safety.",
    ];
  }
  if (item.category === "Drills") {
    return [
      `Set the rules and objective for ${title} (pace, intensity, and starting position).`,
      "Perform the first sequence with technical precision at moderate speed.",
      "Link movement phases without pausing: entry, control, transition, and finish.",
      "Reset quickly and repeat from both sides to balance reps.",
      "Increase resistance gradually while preserving clean mechanics.",
      "Debrief with your partner/coach and note one correction before the next round.",
    ];
  }
  return [
    `Establish foundational posture and control for ${title}.`,
    "Secure the primary grip/frame that makes the movement stable.",
    "Move your hips first, then connect upper-body control to complete the action.",
    "Follow through into the correct finishing position with active base.",
    "Stabilize and check posture before transitioning to the next sequence.",
  ];
}

function buildTips(item: RequestedItem): string[] {
  return [
    `Keep your base under you throughout ${item.name}; balance beats speed.`,
    "Use angle and leverage first, then apply pressure.",
    "Connect each step so your partner has no timing window to escape.",
  ];
}

function buildMistakes(item: RequestedItem): string[] {
  return [
    `Starting ${item.name} before grips/frames are established.`,
    "Driving force straight-on instead of creating angle and off-balance.",
    "Completing the movement but failing to stabilize the finish.",
  ];
}

function createRequestedTechnique(item: RequestedItem): Technique {
  return {
    id: `rq-extra-${slug(item.name)}`,
    name: item.name,
    belt: "white",
    position: item.position,
    category: item.category,
    shortDescription: `${item.name} added for expanded gym curriculum coverage.`,
    fullStepByStep: buildDetailedSteps(item),
    tips: buildTips(item),
    commonMistakes: buildMistakes(item),
    youtubeUrl: "https://www.youtube.com/",
    difficulty: item.difficulty ?? "beginner",
    curriculum: {
      sourceGym: "RollQuest Requested Set",
      track: "Requested Additions",
      isMasterLibrary: true,
      tags: ["requested", "expanded", "gym"],
    },
  };
}

const REQUESTED_ITEMS: RequestedItem[] = [
  { name: "Stand up in base", position: "Self Defense", category: "Fundamentals" },
  { name: "Hip Bridge", position: "Escapes", category: "Fundamentals" },
  { name: "Mount", position: "Mount", category: "Positions" },
  { name: "Side Control", position: "Side Control", category: "Positions" },
  { name: "Sprawl", position: "Takedowns & Standing", category: "Takedown Defense" },
  { name: "Break falls: Backward", position: "Takedowns & Standing", category: "Ukemi" },
  { name: "Break falls: Side", position: "Takedowns & Standing", category: "Ukemi" },
  { name: "Break falls: Forward", position: "Takedowns & Standing", category: "Ukemi" },
  { name: "Basic form of grip", position: "Takedowns & Standing", category: "Grip Fighting" },
  { name: "O Soto Gari", position: "Takedowns & Standing", category: "Throws" },
  { name: "Pulling Guard", position: "Guard Work", category: "Guard Entries" },
  { name: "O Goshi", position: "Takedowns & Standing", category: "Throws" },
  { name: "Back Mount", position: "Back / Rear Mount", category: "Positions" },
  { name: "Mermaid Pass Escape", position: "Escapes", category: "Guard Re-entries" },
  { name: "Knee on belly", position: "Side Control", category: "Pins" },
  { name: "Penetration step to cut through guard pass", position: "Guard Passing", category: "Passing" },
  { name: "Closed Guard", position: "Guard Work", category: "Positions" },
  { name: "Half Guard", position: "Guard Work", category: "Positions" },
  { name: "Turtle", position: "Turtle & Leg Entanglements", category: "Positions" },
  { name: "Single leg guard pass (traditional)", position: "Guard Passing", category: "Passing" },
  { name: "Scissor sweep", position: "Guard Work", category: "Sweeps" },
  { name: "Pushing knee sweep", position: "Guard Work", category: "Sweeps" },
  { name: "Rear naked choke", position: "Back / Rear Mount", category: "Submissions" },
  { name: "Americana (mount)", position: "Mount", category: "Submissions" },
  { name: "Americana (side control)", position: "Side Control", category: "Submissions" },
  { name: "Standard cross collar choke (guard)", position: "Guard Work", category: "Submissions" },
  { name: "Standard cross collar choke (mount)", position: "Mount", category: "Submissions" },
  { name: "Paper cutter choke (side control)", position: "Side Control", category: "Submissions" },
  { name: "Paper cutter choke (top mount)", position: "Mount", category: "Submissions" },
  { name: "Spinning arm bar (mount)", position: "Mount", category: "Submissions" },
  { name: "Upa escape", position: "Mount", category: "Escapes" },
  { name: "Side control escape (guard reposition)", position: "Escapes", category: "Escapes" },
  { name: "The clock transition", position: "Back / Rear Mount", category: "Transitions" },
  { name: "Americana to Kimura (mount)", position: "Mount", category: "Transitions" },
  { name: "Kimura to Guillotine (guard)", position: "Guard Work", category: "Transitions" },
  { name: "Two hand front choke defense", position: "Self Defense", category: "Self Defense" },
  { name: "Two hand front choke defense with hip throw", position: "Self Defense", category: "Self Defense" },
  { name: "Two hand front choke defense against wall (finger lock)", position: "Self Defense", category: "Self Defense" },
  { name: "Two hand front choke defense with armlock", position: "Self Defense", category: "Self Defense" },
  { name: "Any takedown to any position to any submission", position: "Takedowns & Standing", category: "Drills" },
  { name: "White belt drill circuits", position: "Takedowns & Standing", category: "Drills" },
  { name: "Koshi Guruma", position: "Takedowns & Standing", category: "Throws" },
  { name: "Morote Seoi Nage", position: "Takedowns & Standing", category: "Throws" },
  { name: "Tomoe Nage (stomach throw)", position: "Takedowns & Standing", category: "Throws" },
  { name: "Double ankle grab sweep (standing pass)", position: "Guard Passing", category: "Sweeps" },
  { name: "Elevator sweep (guard)", position: "Guard Work", category: "Sweeps" },
  { name: "Half guard pass", position: "Guard Passing", category: "Passing" },
  { name: "Kimura lock from north-south", position: "Side Control", category: "Submissions" },
  { name: "Clock choke from turtle", position: "Turtle & Leg Entanglements", category: "Submissions" },
  { name: "Straight arm bar from back", position: "Back / Rear Mount", category: "Submissions" },
  { name: "Spinning straight armbar from knee on belly", position: "Side Control", category: "Submissions" },
  { name: "Baseball choke (knee on belly)", position: "Side Control", category: "Submissions" },
  { name: "Paper cutter choke: pistol grip variation (side control)", position: "Side Control", category: "Submissions" },
  { name: "Knee on belly peg leg escape", position: "Escapes", category: "Escapes" },
  { name: "Back escape (leg peel)", position: "Escapes", category: "Escapes" },
  { name: "Turtle escape (head control)", position: "Escapes", category: "Escapes" },
  { name: "Spinning armbar defense", position: "Escapes", category: "Submission Defense" },
  { name: "Straight arm bar defense (from guard)", position: "Escapes", category: "Submission Defense" },
  { name: "Guillotine choke defense (from guard)", position: "Escapes", category: "Submission Defense" },
  { name: "North-south control escape (reversal to side control)", position: "Escapes", category: "Escapes" },
  { name: "Spinning arm bar escape (hitchhiker)", position: "Escapes", category: "Submission Defense" },
  { name: "Double underhook clinch", position: "Takedowns & Standing", category: "Clinch" },
  { name: "Circle sacrifice throw", position: "Takedowns & Standing", category: "Throws" },
  { name: "Sacrifice throw", position: "Takedowns & Standing", category: "Throws" },
  { name: "Kneeling ippori saci nage", position: "Takedowns & Standing", category: "Throws" },
  { name: "Side mount", position: "Side Control", category: "Positions" },
  { name: "Butterfly guard", position: "Guard Work", category: "Positions" },
  { name: "Elevator sweep (butterfly guard)", position: "Guard Work", category: "Sweeps" },
  { name: "Pulling arm sweep (butterfly guard)", position: "Guard Work", category: "Sweeps" },
  { name: "Hook sweep (standing pass)", position: "Guard Passing", category: "Sweeps" },
  { name: "Murder choke (back mount)", position: "Back / Rear Mount", category: "Submissions", difficulty: "intermediate" },
  { name: "Rear single wing choke (back mount)", position: "Back / Rear Mount", category: "Submissions", difficulty: "intermediate" },
  { name: "Hell choke (turtle)", position: "Turtle & Leg Entanglements", category: "Submissions", difficulty: "intermediate" },
  { name: "Leg americana (scarf)", position: "Side Control", category: "Submissions", difficulty: "intermediate" },
  { name: "Leg straight arm lock (scarf)", position: "Side Control", category: "Submissions", difficulty: "intermediate" },
  { name: "Omoplata", position: "Guard Work", category: "Submissions", difficulty: "intermediate" },
  { name: "Turtle escape (half guard reposition)", position: "Escapes", category: "Escapes" },
  { name: "Knee on belly escape (sweep)", position: "Escapes", category: "Escapes" },
  { name: "Omoplata defense (roll)", position: "Escapes", category: "Submission Defense" },
  { name: "Spinning arm bar escape (leg trap)", position: "Escapes", category: "Submission Defense" },
];

export const REQUESTED_TECHNIQUES: Technique[] = REQUESTED_ITEMS.map(createRequestedTechnique);
