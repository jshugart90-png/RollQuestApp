export type PositionTab =
  | "Takedowns & Standing"
  | "Guard Work"
  | "Guard Passing"
  | "Side Control"
  | "Mount"
  | "Back / Rear Mount"
  | "Turtle & Legs"
  | "Submissions";

export type Technique = {
  id: string;
  name: string;
  belt: "White" | "Blue" | "Purple" | "Brown" | "Black";
  stripes: 1 | 2 | 3 | 4;
  position: PositionTab;
  shortDescription: string;
  fullStepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  youtubeUrl: string;
  difficulty: "Fundamental" | "Intermediate" | "Advanced";
};

export const POSITION_TABS: PositionTab[] = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Legs",
  "Submissions",
];

export const TECHNIQUES: Technique[] = [
  {
    id: "white-back-seatbelt-control",
    name: "Seatbelt Retention from Rear Mount",
    belt: "White",
    stripes: 1,
    position: "Back / Rear Mount",
    shortDescription: "Lock safe chest-to-back pressure and stop shoulder escapes before they start.",
    fullStepByStep: [
      "Place your choking arm over the shoulder and your secondary arm under the armpit, connecting palm-to-palm at the sternum so your elbows pinch inward.",
      "Glue your chest to your partner's upper back and keep your head close to the side of your choking arm to deny turning room.",
      "Slide your top hook deep across the thigh while your bottom hook blocks their hip line, then flex your heels to keep their hips captured.",
      "If they scoot their shoulders down, walk your hips higher and keep your seatbelt tight before attempting any choke.",
      "Settle your breathing and apply steady pressure rather than squeezing hard; control always comes before submission."
    ],
    tips: [
      "Think chest connected, elbows tight, hips active.",
      "Use your head position as a third hand to block their turn."
    ],
    commonMistakes: [
      "Reaching too far for a choke and losing top shoulder control.",
      "Crossing ankles in front of the hips while they still have escape power."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=V6LFkdeSox0",
    difficulty: "Fundamental"
  },
  {
    id: "white-back-rnc-finish",
    name: "Rear Naked Choke Fundamentals",
    belt: "White",
    stripes: 1,
    position: "Back / Rear Mount",
    shortDescription: "Classic blood choke from strong back control with clean hand positioning.",
    fullStepByStep: [
      "Build your seatbelt and use your non-choking hand to hide behind their head, keeping your elbows close to your ribs.",
      "Slide your choking forearm under the chin with the blade of the forearm, not the wrist, and keep your shoulder tight to the back of their head.",
      "Place your choking hand behind your opposite biceps and then place your support hand behind their head, palm touching your own skull.",
      "Expand your chest, squeeze elbows together, and imagine pulling your choking elbow toward your own hip to close both carotid arteries.",
      "Hold controlled pressure and release immediately if your partner taps."
    ],
    tips: [
      "Hide your choking hand before you attack.",
      "Finish with posture and elbow line, not arm strength."
    ],
    commonMistakes: [
      "Trying to finish across the face with loose head control.",
      "Opening the seatbelt too early and letting the opponent turn."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=6Qy6mBfS0xY",
    difficulty: "Fundamental"
  },
  {
    id: "white-back-bow-arrow-entry",
    name: "Bow-and-Arrow Setup from Back",
    belt: "White",
    stripes: 2,
    position: "Back / Rear Mount",
    shortDescription: "Use collar control and angle change to create a high-percentage gi finish.",
    fullStepByStep: [
      "From rear mount, open your partner's near collar with your support hand and feed a deep thumb-in grip to your choking hand.",
      "Keep your chest connected as you slide your support hand to grab their far pant leg near the knee.",
      "Fall to your choking-arm side while maintaining your collar grip and pull the pant leg away to stretch their frame.",
      "Draw your collar-gripping elbow backward as your leg extends to increase rotational pressure across the neck.",
      "Maintain clean control and release immediately on the tap."
    ],
    tips: [
      "Make your first collar grip as deep as possible.",
      "The leg extension creates the finish angle; do not rush it."
    ],
    commonMistakes: [
      "Leaning backward without controlling the pant leg.",
      "Using a shallow collar grip that slips under pressure."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=R8QmJXn7Q5E",
    difficulty: "Intermediate"
  },
  {
    id: "white-back-trap-arm-rnc",
    name: "Trap Arm to Rear Naked Choke",
    belt: "White",
    stripes: 2,
    position: "Back / Rear Mount",
    shortDescription: "Isolate one defensive hand first, then finish when the neck opens naturally.",
    fullStepByStep: [
      "Secure rear mount with seatbelt and identify which hand is actively protecting the neck.",
      "Use your underhook-side hand to pin that wrist to their chest while your hook-side leg pinches over the arm.",
      "Shift your chest pressure forward so the trapped arm cannot peel your choking hand away.",
      "Slide your choking arm under the chin and lock your RNC grip while the trapped arm remains pinned.",
      "Apply controlled finishing pressure and monitor your partner's safety response."
    ],
    tips: [
      "Arm isolation creates calm, high-confidence choke entries.",
      "Trap first, finish second."
    ],
    commonMistakes: [
      "Attempting to trap with loose hooks and sliding off the back.",
      "Forgetting to keep shoulder pressure while switching grips."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=9D2r2QdMJ8Q",
    difficulty: "Intermediate"
  },
  {
    id: "white-back-body-triangle-control",
    name: "Body Triangle Control Principles",
    belt: "White",
    stripes: 3,
    position: "Back / Rear Mount",
    shortDescription: "Transition from hooks to body triangle for tighter hip control and slower escapes.",
    fullStepByStep: [
      "From secure back control, bring one foot across the opponent's stomach while maintaining chest connection.",
      "Thread your opposite foot behind the knee of the crossing leg and lock a body triangle on the safe side of their torso.",
      "Squeeze your knees slightly inward while keeping hips mobile so they cannot rotate into you.",
      "Use your top shoulder to pressure behind their head and prevent turning toward your lock side.",
      "Adjust your lock if needed, keeping your feet active and never sacrificing upper-body control."
    ],
    tips: [
      "Lock to the side that limits their strongest escape direction.",
      "Use gradual pressure; your triangle is for control, not pain."
    ],
    commonMistakes: [
      "Crossing ankles instead of locking a true triangle.",
      "Focusing on leg squeeze while losing seatbelt tension."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=Q4v8Vg0eR6E",
    difficulty: "Intermediate"
  },
  {
    id: "white-back-short-choke",
    name: "Short Choke from Rear Mount",
    belt: "White",
    stripes: 3,
    position: "Back / Rear Mount",
    shortDescription: "Compact choke when the opponent tucks the chin and hides neck space.",
    fullStepByStep: [
      "Start from seatbelt and hide your choking hand beside their jawline rather than reaching deep under the chin.",
      "Cup your support hand behind their head and keep your choking elbow tight to your rib cage.",
      "Rotate your choking forearm so the blade compresses one side of the neck as your biceps close the other side.",
      "Pull your support-side elbow backward while lifting your chest to tighten the finishing wedge.",
      "Hold steady pressure for one to two seconds, then release on tap."
    ],
    tips: [
      "Great option when full RNC depth is unavailable.",
      "Stay compact and avoid overextension."
    ],
    commonMistakes: [
      "Trying to muscle through the chin with wrist pressure.",
      "Letting your support hand drift away from head control."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=YVj3YhWJf4Q",
    difficulty: "Intermediate"
  },
  {
    id: "white-back-rear-triangle",
    name: "Rear Triangle Entry",
    belt: "White",
    stripes: 4,
    position: "Back / Rear Mount",
    shortDescription: "Transition to a rear triangle when your opponent over-defends hand fighting.",
    fullStepByStep: [
      "From back control, isolate one arm so their shoulder line turns slightly away from your lock side.",
      "Bring your top leg high across their shoulder and neck line while controlling posture with your hands.",
      "Thread your bottom leg over your own ankle and pivot your hips to lock a triangle around neck and trapped arm.",
      "Squeeze knees inward and angle your hips so your hamstring and calf compress both sides of the neck.",
      "Use controlled pressure and stabilize before adding arm attacks."
    ],
    tips: [
      "Hip angle matters more than leg strength.",
      "Trap an arm whenever possible to increase choke efficiency."
    ],
    commonMistakes: [
      "Locking low on the shoulders instead of the neck line.",
      "Rushing the transition and losing back position entirely."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=SqRz8RJ5vT8",
    difficulty: "Advanced"
  },
  {
    id: "white-back-escape-counter-hip-switch",
    name: "Counter to Back Escape Hip Switch",
    belt: "White",
    stripes: 4,
    position: "Back / Rear Mount",
    shortDescription: "Follow and recover when opponent tries to drop hips to one side and slide out.",
    fullStepByStep: [
      "When the opponent drops toward one hip, keep your seatbelt connected and switch your hook priority to block that hip line.",
      "Walk your upper body slightly higher on their shoulders to keep chest pressure where escape space is opening.",
      "Use your free leg to pummel back inside and recover your second hook before attacking.",
      "If they continue rotating, transition briefly to body triangle to slow movement and reset control.",
      "Return to stable rear mount and re-establish hand-fighting dominance."
    ],
    tips: [
      "Recover position first; submission attempts come second.",
      "Your hooks should react to their hip movement, not stay static."
    ],
    commonMistakes: [
      "Holding one hook stubbornly while opponent rotates free.",
      "Ignoring hand fighting while focusing only on leg recovery."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=2Qb8fYwT6rM",
    difficulty: "Fundamental"
  },
  {
    id: "white-back-collar-choke-one-arm",
    name: "One-Arm Collar Choke from Back",
    belt: "White",
    stripes: 4,
    position: "Back / Rear Mount",
    shortDescription: "Gi-specific choke using deep lapel feed and shoulder pressure with minimal hand switching.",
    fullStepByStep: [
      "From back control in the gi, feed your choking hand deep into the far collar, palm down, thumb hidden.",
      "Use your support hand to control the wrist of their top defense hand so they cannot strip grips quickly.",
      "Drive your choking-side shoulder forward and pull your gripping elbow down toward your hip pocket.",
      "Maintain tight chest-to-back contact while your forearm blade compresses one side of the neck.",
      "Apply pressure smoothly and stop immediately on tap."
    ],
    tips: [
      "Grip depth determines finish quality.",
      "Shoulder pressure multiplies choke efficiency."
    ],
    commonMistakes: [
      "Using a shallow collar grip that slides out.",
      "Leaning backward and sacrificing control."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=rkNf8m9Yy7M",
    difficulty: "Intermediate"
  },
  {
    id: "white-back-transition-armbar",
    name: "Back to Armbar Transition",
    belt: "White",
    stripes: 4,
    position: "Back / Rear Mount",
    shortDescription: "Switch from rear mount to armbar when choke defense over-commits both hands.",
    fullStepByStep: [
      "Force hand fighting from back control until your opponent commits both hands to defend the neck.",
      "Control one wrist with two hands and place your top leg over their shoulder while keeping chest connection.",
      "Pivot your hips off to the side, bringing your second leg across the face line to control posture.",
      "Pinch knees, keep thumb pointing up, and pull the arm to your chest before extending hips gently.",
      "Finish with controlled extension and immediate release on tap."
    ],
    tips: [
      "Keep their elbow line trapped before falling back.",
      "A calm pivot beats a fast scramble."
    ],
    commonMistakes: [
      "Dropping back before controlling the wrist and elbow.",
      "Leaving space so opponent turns and stacks."
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=YH7m2K9xvA0",
    difficulty: "Advanced"
  }
];

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES.find((technique) => technique.id === id);
}
