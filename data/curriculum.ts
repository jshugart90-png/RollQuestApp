// data/curriculum.ts

export type Belt = "white" | "blue";

export type TechniqueCategory =
  | "positions"
  | "movement"
  | "escapes"
  | "guard"
  | "passes"
  | "sweeps"
  | "submissions"
  | "takedowns";

export type VideoLink = {
  label: string;
  url: string;
};

export type TechniqueStep = {
  title: string;
  detail: string;
};

export type Technique = {
  id: string;
  belt: Belt;
  category: TechniqueCategory;
  title: string;
  positionTag?: string; // e.g. "Closed Guard", "Side Control", etc.
  steps: TechniqueStep[];
  links?: VideoLink[];
};

export const BELTS: { key: Belt; label: string; color: string }[] = [
  { key: "white", label: "White Belt", color: "#F5F5F5" },
  { key: "blue", label: "Blue Belt", color: "#2F6BFF" },
];

export const CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  positions: "Positions",
  movement: "Movement",
  escapes: "Escapes",
  guard: "Guard",
  passes: "Passes",
  sweeps: "Sweeps",
  submissions: "Submissions",
  takedowns: "Takedowns",
};

export const CATEGORIES_ORDER: TechniqueCategory[] = [
  "positions",
  "movement",
  "escapes",
  "guard",
  "passes",
  "sweeps",
  "submissions",
  "takedowns",
];

// ✅ START SIMPLE: White + Blue only.
// We’ll expand these lists steadily once the structure is stable.
export const TECHNIQUES: Technique[] = [
  // =========================
  // WHITE BELT — FOUNDATION
  // =========================
  {
    id: "w-hip-escape-shrimp",
    belt: "white",
    category: "movement",
    title: "Hip Escape (Shrimp)",
    positionTag: "Fundamentals",
    steps: [
      { title: "Frame", detail: "Elbows tight. Forearms frame their hip/shoulder to make space." },
      { title: "Foot Plant", detail: "Plant the foot on the side you want to move toward." },
      { title: "Hip Out", detail: "Drive off the planted foot and slide hips away." },
      { title: "Recover Guard", detail: "Bring knee back inside. Re-compose guard (knee shield/closed guard)." },
    ],
    links: [
      { label: "Example search: shrimp escape", url: "https://www.youtube.com/results?search_query=bjj+hip+escape+shrimp" },
    ],
  },
  {
    id: "w-bridge-roll-upa",
    belt: "white",
    category: "escapes",
    title: "Mount Escape: Upa (Bridge & Roll)",
    positionTag: "Mount Bottom",
    steps: [
      { title: "Trap an Arm", detail: "Pin their posting hand to your chest (hug it tight)." },
      { title: "Trap a Foot", detail: "Hook their foot with yours so they can’t base." },
      { title: "Bridge", detail: "Explode hips up high (aim up + over your shoulder)." },
      { title: "Roll & Land", detail: "Roll them over into your guard/top position. Stabilize." },
    ],
    links: [
      { label: "Example search: upa mount escape", url: "https://www.youtube.com/results?search_query=bjj+upa+mount+escape" },
    ],
  },
  {
    id: "w-elbow-knee-escape",
    belt: "white",
    category: "escapes",
    title: "Mount Escape: Elbow-Knee (Knee Elbow)",
    positionTag: "Mount Bottom",
    steps: [
      { title: "Frame", detail: "Hands/forearms frame at their hips. Elbows inside." },
      { title: "Knee Inside", detail: "Slide one knee between you and them (make a wedge)." },
      { title: "Recover Half Guard", detail: "Bring the other leg in and connect to half guard." },
      { title: "Re-Guard", detail: "Shrimp to full guard or build to knee shield." },
    ],
    links: [
      { label: "Example search: elbow knee mount escape", url: "https://www.youtube.com/results?search_query=bjj+elbow+knee+mount+escape" },
    ],
  },
  {
    id: "w-side-control-frame-escape",
    belt: "white",
    category: "escapes",
    title: "Side Control Escape: Frame → Shrimp → Guard",
    positionTag: "Side Control Bottom",
    steps: [
      { title: "Frames", detail: "Near forearm frames neck/jawline, far forearm frames hip." },
      { title: "Bridge", detail: "Small bridge to create space and reset frames." },
      { title: "Shrimp", detail: "Hip escape away from pressure." },
      { title: "Knee In", detail: "Insert knee between you and them (guard recovery)." },
      { title: "Re-Guard", detail: "Replace to knee shield/half/closed guard." },
    ],
    links: [
      { label: "Example search: side control frame escape", url: "https://www.youtube.com/results?search_query=bjj+side+control+frame+escape" },
    ],
  },
  {
    id: "w-closed-guard-posture-break",
    belt: "white",
    category: "guard",
    title: "Closed Guard: Posture Break",
    positionTag: "Closed Guard Bottom",
    steps: [
      { title: "Control", detail: "Hands control wrists or collar/behind head (no loose grips)." },
      { title: "Angle", detail: "Pull them forward while shifting hips slightly off-center." },
      { title: "Break Posture", detail: "Bring their head/shoulders over your chest line." },
      { title: "Clamp & Climb", detail: "Legs stay active; climb guard higher if needed." },
    ],
    links: [
      { label: "Example search: closed guard posture break", url: "https://www.youtube.com/results?search_query=bjj+closed+guard+posture+break" },
    ],
  },
  {
    id: "w-scissor-sweep",
    belt: "white",
    category: "sweeps",
    title: "Closed Guard: Scissor Sweep",
    positionTag: "Closed Guard Bottom",
    steps: [
      { title: "Break Posture", detail: "Get them forward and control sleeve/collar (or arm + head)." },
      { title: "Make Angle", detail: "Open guard, get shin across belly, other leg chops behind knee." },
      { title: "Pull + Chop", detail: "Pull them over your shin while chopping their base leg." },
      { title: "Top Position", detail: "Come up to mount or stabilize top guard pass posture." },
    ],
    links: [
      { label: "Example search: scissor sweep", url: "https://www.youtube.com/results?search_query=bjj+scissor+sweep" },
    ],
  },
  {
    id: "w-cross-collar-choke",
    belt: "white",
    category: "submissions",
    title: "Closed Guard: Cross Collar Choke",
    positionTag: "Closed Guard Bottom",
    steps: [
      { title: "Deep First Grip", detail: "First hand deep in collar (palm up), fingers to tag." },
      { title: "Second Grip", detail: "Second hand in opposite collar (palm down), elbows tight." },
      { title: "Cut Angle", detail: "Use hips to angle off, bring elbows toward ribs." },
      { title: "Finish", detail: "Pull with forearms + flare elbows slightly while keeping posture broken." },
    ],
    links: [
      { label: "Example search: cross collar choke closed guard", url: "https://www.youtube.com/results?search_query=bjj+cross+collar+choke+closed+guard" },
    ],
  },
  {
    id: "w-technical-standup",
    belt: "white",
    category: "movement",
    title: "Technical Stand-Up",
    positionTag: "Fundamentals",
    steps: [
      { title: "Post", detail: "Hand posts behind you; opposite foot plants near hips." },
      { title: "Hip Lift", detail: "Lift hips off the floor to create space." },
      { title: "Leg Back", detail: "Swing the free leg back into a staggered stance." },
      { title: "Hands Up", detail: "Maintain guard posture and distance as you stand." },
    ],
    links: [
      { label: "Example search: technical stand up", url: "https://www.youtube.com/results?search_query=bjj+technical+stand+up" },
    ],
  },
  {
    id: "w-double-leg-basic",
    belt: "white",
    category: "takedowns",
    title: "Double Leg (Basic Entry)",
    positionTag: "Standing",
    steps: [
      { title: "Level Change", detail: "Hips drop straight down, back stays upright." },
      { title: "Penetration Step", detail: "Step between their feet; knee points forward." },
      { title: "Connect Hands", detail: "Wrap behind knees (or high on hips), head tight to ribs." },
      { title: "Drive + Angle", detail: "Run your feet and turn the corner to finish." },
    ],
    links: [
      { label: "Example search: bjj double leg", url: "https://www.youtube.com/results?search_query=bjj+double+leg+takedown" },
    ],
  },

  // =========================
  // BLUE BELT — CORE ATTACKS
  // =========================
  {
    id: "b-knee-cut-pass",
    belt: "blue",
    category: "passes",
    title: "Knee Cut Pass",
    positionTag: "Open Guard Top",
    steps: [
      { title: "Control Legs", detail: "Win inside position; control knee line (pant/ankle or shin)." },
      { title: "Knee Slice", detail: "Cut knee across their thigh while keeping chest forward." },
      { title: "Underhook/Head Control", detail: "Secure underhook or crossface to kill their turn-in." },
      { title: "Clear Hips", detail: "Free your trapped leg and settle to side control." },
    ],
    links: [
      { label: "Example search: knee cut pass", url: "https://www.youtube.com/results?search_query=bjj+knee+cut+pass" },
    ],
  },
  {
    id: "b-torreando-pass",
    belt: "blue",
    category: "passes",
    title: "Toreando (Bullfighter) Pass",
    positionTag: "Open Guard Top",
    steps: [
      { title: "Grip Pants/Shins", detail: "Control their legs at shins/pants; elbows tight." },
      { title: "Side Step", detail: "Step to the side and pull legs across your body." },
      { title: "Run Around", detail: "Sprint around their hips—don’t stop in front." },
      { title: "Pin", detail: "Crossface/underhook and settle side control." },
    ],
    links: [
      { label: "Example search: toreando pass", url: "https://www.youtube.com/results?search_query=bjj+toreando+pass" },
    ],
  },
  {
    id: "b-kimura-from-closed-guard",
    belt: "blue",
    category: "submissions",
    title: "Kimura from Closed Guard",
    positionTag: "Closed Guard Bottom",
    steps: [
      { title: "Isolate Arm", detail: "Control wrist; sit up to clamp their arm." },
      { title: "Figure-4", detail: "Grab your own wrist to lock the kimura grip." },
      { title: "Angle Out", detail: "Hip out to the side to get finishing angle." },
      { title: "Finish", detail: "Rotate wrist behind them while keeping elbow pinned." },
    ],
    links: [
      { label: "Example search: kimura closed guard", url: "https://www.youtube.com/results?search_query=bjj+kimura+from+closed+guard" },
    ],
  },
  {
    id: "b-armbar-from-guard",
    belt: "blue",
    category: "submissions",
    title: "Armbar from Guard",
    positionTag: "Closed Guard Bottom",
    steps: [
      { title: "Control", detail: "Control one arm; break posture first." },
      { title: "Hip Angle", detail: "Shift hips out; bring leg high across their back." },
      { title: "Leg Over Head", detail: "Swing leg over head, pinch knees tight." },
      { title: "Finish", detail: "Heels down, knees pinch, thumb up—extend hips." },
    ],
    links: [
      { label: "Example search: armbar from guard", url: "https://www.youtube.com/results?search_query=bjj+armbar+from+guard" },
    ],
  },
  {
    id: "b-tripod-sweep",
    belt: "blue",
    category: "sweeps",
    title: "Open Guard: Tripod Sweep",
    positionTag: "Open Guard Bottom",
    steps: [
      { title: "Control Ankle", detail: "Grip their ankle; keep your elbow tight." },
      { title: "Foot on Hip", detail: "Other foot posts on their hip to manage distance." },
      { title: "Hook Far Leg", detail: "Inside hook behind their far heel/calf." },
      { title: "Tip + Lift", detail: "Pull ankle while lifting hook to dump them." },
    ],
    links: [
      { label: "Example search: tripod sweep", url: "https://www.youtube.com/results?search_query=bjj+tripod+sweep" },
    ],
  },
  {
    id: "b-back-take-chair-sit",
    belt: "blue",
    category: "movement",
    title: "Back Take: Seatbelt + Chair Sit",
    positionTag: "Back Control",
    steps: [
      { title: "Seatbelt", detail: "One arm over shoulder, one under armpit—hands connect." },
      { title: "Chest to Back", detail: "Glue your chest to their back; head tight." },
      { title: "Chair Sit", detail: "Sit behind them and pull them into you." },
      { title: "Hooks In", detail: "Insert hooks and stabilize." },
    ],
    links: [
      { label: "Example search: chair sit back take", url: "https://www.youtube.com/results?search_query=bjj+chair+sit+back+take" },
    ],
  },
];

export function getTechniquesByBelt(belt: Belt) {
  return TECHNIQUES.filter((t) => t.belt === belt);
}

export function getTechniqueById(id: string) {
  return TECHNIQUES.find((t) => t.id === id);
}
