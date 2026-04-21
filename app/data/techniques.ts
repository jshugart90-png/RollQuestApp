export type PositionTab =
  | "Takedowns & Standing"
  | "Guard Work"
  | "Guard Passing"
  | "Side Control"
  | "Mount"
  | "Back / Rear Mount"
  | "Turtle & Leg Entanglements"
  | "Submissions";

export type Technique = {
  id: string;
  name: string;
  belt: "white" | "blue";
  position: PositionTab;
  category: string;
  shortDescription: string;
  fullStepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  youtubeUrl: string;
  difficulty: "beginner";
};

export const POSITION_TABS: PositionTab[] = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Leg Entanglements",
  "Submissions",
];

const LINKS = {
  standupBase: "https://www.youtube.com/watch?v=0WjN8iuRk3o",
  guardBase: "https://www.youtube.com/watch?v=5m4wFl0M7fM",
  passBase: "https://www.youtube.com/watch?v=4gJf6gN8y5Q",
  sideBase: "https://www.youtube.com/watch?v=8F6meOljv-s",
  mountBase: "https://www.youtube.com/watch?v=bUu5vM7mA7U",
  backBase: "https://www.youtube.com/watch?v=u8r3J1fQ0xA",
  turtleBase: "https://www.youtube.com/watch?v=Rj0m4YxQ7sM",
  subBase: "https://www.youtube.com/watch?v=YzW7D2v4xM8",
};

export const TECHNIQUES: Technique[] = [
  // Takedowns & Standing (6)
  {
    id: "white-stand-technical-standup",
    name: "Technical Stand-Up",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Self-Protection Movement",
    shortDescription: "Stand safely without giving your opponent a free leg to attack.",
    fullStepByStep: [
      "Post your hand behind you and place your opposite foot firmly on the mat, keeping your hips loaded like a spring.",
      "Lift your hips and slide your bottom leg underneath you so your shin points away from danger, not toward your opponent.",
      "Keep your eyes on the target, frame with your free hand, and bring your rear foot back into a stable grappling stance.",
      "Only once your base is balanced, re-engage grips or create space to reset."
    ],
    tips: ["Keep your posting hand close, not stretched far behind.", "Think: frame, post, rise, and recover stance."],
    commonMistakes: ["Standing straight up with no frame and getting tackled.", "Leaving your head down during the rise."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },
  {
    id: "white-stand-collar-tie-snapdown",
    name: "Collar Tie Snap-Down",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Takedown Entry",
    shortDescription: "Break posture from standing and create front-headlock opportunities.",
    fullStepByStep: [
      "Establish a collar tie with your palm heavy on the crown and your elbow tight to prevent inside pummeling.",
      "Step slightly off line, pull the head down, and steer their shoulder to fold their posture forward.",
      "As they react, circle to angle and connect your second hand to chin, triceps, or front headlock control.",
      "If the takedown does not finish, use the snap-down to force a defensive reset and win initiative."
    ],
    tips: ["Your feet create the angle; your hands only guide.", "Snap in rhythm with a small step, not from a flat stance."],
    commonMistakes: ["Pulling with arms only and getting counter-gripped.", "Leaving your own posture too high after the snap."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },
  {
    id: "white-stand-single-leg-finish",
    name: "Single-Leg Basic Finish",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Takedown",
    shortDescription: "Secure one leg, control posture, and finish with direction and pressure.",
    fullStepByStep: [
      "Level change with a straight back, step your lead foot close, and connect your shoulder to the opponent's hip.",
      "Wrap the leg above the knee and keep your head tight on the inside line to prevent crossface pressure.",
      "Drive up to your feet while lifting the leg and turning the corner so their base breaks diagonally.",
      "Finish by running the pipe or shelving the leg, then settle directly into top control."
    ],
    tips: ["Head position is your steering wheel.", "Secure your hands before trying to lift."],
    commonMistakes: ["Shooting from too far and reaching.", "Keeping your head outside with weak posture."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },
  {
    id: "white-stand-arm-drag-back-angle",
    name: "Arm Drag to Rear Angle",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Off-Balance Entry",
    shortDescription: "Use pull-and-step timing to create a back angle from neutral standing.",
    fullStepByStep: [
      "Catch the wrist with one hand and secure near the triceps with your second hand so the arm is connected to your chest.",
      "Pull the arm across your center line while stepping your lead foot outside their lead foot.",
      "Keep your chest close behind their shoulder and immediately lock body control before they square up.",
      "From rear angle, choose mat return or body lock finish based on their reaction."
    ],
    tips: ["Drag with your whole body turn, not just your arms.", "Take the angle first, then think takedown."],
    commonMistakes: ["Dragging in place with no foot movement.", "Pausing after the drag and losing the angle."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },
  {
    id: "white-stand-foot-sweep-timing",
    name: "Basic Foot Sweep Timing",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Trip / Sweep",
    shortDescription: "Catch the moment the foot is light and direct the upper body opposite the sweep.",
    fullStepByStep: [
      "Establish sleeve-and-collar or collar-and-elbow control so you can steer posture in two directions.",
      "Move your partner in a small circle until you feel one foot become light as it prepares to step.",
      "Sweep that foot with your instep while your grips pull and rotate their shoulders the opposite way.",
      "Follow immediately to top position, keeping your chest over hips so they cannot scramble back up."
    ],
    tips: ["The sweep works on timing, not power.", "Think pull, turn, and reap in one beat."],
    commonMistakes: ["Trying to kick a planted heavy leg.", "Leaning backward during the sweep attempt."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },
  {
    id: "white-stand-clinch-body-lock",
    name: "Body Lock Entry from Clinch",
    belt: "white",
    position: "Takedowns & Standing",
    category: "Control",
    shortDescription: "Close distance safely and secure tight midline control for easy finishes.",
    fullStepByStep: [
      "Win inside arm position and step chest-to-chest so there is no striking distance or easy re-shot lane.",
      "Connect your hands behind the lower back with elbows pinched and your forehead tight under their jawline.",
      "Step your hips close and off-balance them with short steering steps, never extending your lock away from your body.",
      "Finish with a simple outside trip or mat return and land in side control."
    ],
    tips: ["Head pressure makes the lock feel twice as strong.", "Keep your elbows tight like a seatbelt."],
    commonMistakes: ["Locking high on the ribs and losing leverage.", "Reaching for the lock before winning inside position."],
    youtubeUrl: LINKS.standupBase,
    difficulty: "beginner",
  },

  // Guard Work (6)
  {
    id: "white-guard-closed-control",
    name: "Closed Guard Posture Control",
    belt: "white",
    position: "Guard Work",
    category: "Control",
    shortDescription: "Break posture first, then chain attacks with calm control.",
    fullStepByStep: [
      "Close your guard high on the back and pull your knees inward so the opponent's posture stays compromised.",
      "Control one wrist and one collar or head tie, then pull their weight forward onto your hips.",
      "Angle slightly to one side so your hips are loaded for attacks instead of flat beneath them.",
      "Use this posture break to transition into sweeps, armbars, or collar attacks."
    ],
    tips: ["Guard is strongest when your knees are active.", "Create angle before launching attacks."],
    commonMistakes: ["Keeping guard low and loose around the waist.", "Trying submissions on a fully postured opponent."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },
  {
    id: "white-guard-scissor-sweep",
    name: "Scissor Sweep Fundamentals",
    belt: "white",
    position: "Guard Work",
    category: "Sweep",
    shortDescription: "Classic white-belt sweep from collar-and-sleeve with sharp angle.",
    fullStepByStep: [
      "Break posture and secure cross-collar with one hand and sleeve control with the other.",
      "Open guard, place your shin across their torso, and load your bottom leg outside their knee like a chopping blade.",
      "Pull with your grips while cutting the shin across and chopping the leg in opposite directions.",
      "Follow immediately to mount and stabilize before attacking."
    ],
    tips: ["Pull and kick at the same moment.", "Keep your top shin active against their chest."],
    commonMistakes: ["Trying to sweep with no angle.", "Leaving the sleeve free so they post."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },
  {
    id: "white-guard-hip-bump-sweep",
    name: "Hip Bump Sweep",
    belt: "white",
    position: "Guard Work",
    category: "Sweep",
    shortDescription: "Sit-up sweep that punishes opponents who keep hands posted wide.",
    fullStepByStep: [
      "Open guard and sit up quickly, posting one hand behind you and hugging over their shoulder line.",
      "Trap their far arm or post by controlling triceps so they cannot widen base.",
      "Drive your hips diagonally into them and rotate over your posted hand to tip them backward.",
      "Come up to mount with chest pressure and wide knees."
    ],
    tips: ["Explode from hips, not shoulders.", "Sit up close so your chest meets theirs."],
    commonMistakes: ["Sitting up too far away.", "Forgetting to trap the posting hand."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },
  {
    id: "white-guard-kimura-grip-fight",
    name: "Kimura Grip from Closed Guard",
    belt: "white",
    position: "Guard Work",
    category: "Submission Setup",
    shortDescription: "Use grip fighting and angle to isolate shoulder line safely.",
    fullStepByStep: [
      "Control their wrist and pin it to your chest while climbing your guard higher on their back.",
      "Sit up and loop your second arm over their triceps to lock a figure-four grip tight to your body.",
      "Angle your hips out and keep their elbow bent at ninety degrees while you draw their hand away from center.",
      "Finish slowly or use the grip to sweep if they posture hard."
    ],
    tips: ["Keep the captured elbow away from their ribs.", "Use hip angle to multiply control."],
    commonMistakes: ["Trying to crank flat on your back.", "Allowing the wrist to float free."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },
  {
    id: "white-guard-flower-sweep",
    name: "Flower Sweep",
    belt: "white",
    position: "Guard Work",
    category: "Sweep",
    shortDescription: "High-percentage pendulum sweep that uses sleeve control and leg momentum.",
    fullStepByStep: [
      "Establish deep sleeve grip and opposite pant or ankle control to pin one side of their base.",
      "Open guard, angle to your sleeve side, and swing your free leg wide like a pendulum.",
      "As their weight tips, lift with your hooking leg and pull their trapped arm across your center.",
      "Roll to top and settle with shoulder pressure."
    ],
    tips: ["Think pendulum: smooth arc, not a kick.", "Your grips should glue one side of their body."],
    commonMistakes: ["Trying from flat hips.", "Not controlling the posting arm first."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },
  {
    id: "white-guard-cross-collar-choke",
    name: "Cross Collar Choke from Guard",
    belt: "white",
    position: "Guard Work",
    category: "Submission",
    shortDescription: "Foundational gi choke based on deep grips and elbow line.",
    fullStepByStep: [
      "Break posture and feed your first hand deep into the opposite collar, knuckles behind the neck.",
      "Use your second hand to enter the near collar palm-up and bring both elbows close to your ribs.",
      "Pull your opponent forward and flare wrists so both forearms form a scissoring pressure around the neck.",
      "Finish with your back engaged, not by curling only your arms."
    ],
    tips: ["First grip depth decides the finish.", "Keep wrists aligned and elbows low."],
    commonMistakes: ["Shallow collar grips.", "Trying to finish while opponent is postured high."],
    youtubeUrl: LINKS.guardBase,
    difficulty: "beginner",
  },

  // Guard Passing (6)
  {
    id: "white-pass-posture-in-closed-guard",
    name: "Closed Guard Posture and Opening",
    belt: "white",
    position: "Guard Passing",
    category: "Guard Opening",
    shortDescription: "Build posture first, then open guard with base and pressure.",
    fullStepByStep: [
      "Place one hand on the sternum and one on the belt line while keeping your elbows inside.",
      "Raise your posture tall with hips forward and eyes up so your spine supports pressure.",
      "Step one foot up, then the second, and use your knee wedge to separate the ankles safely.",
      "As guard opens, control legs immediately and transition into your pass of choice."
    ],
    tips: ["Posture before pressure, always.", "Keep elbows tight to avoid arm attacks."],
    commonMistakes: ["Trying to open guard while hunched forward.", "Leaving one arm across center too long."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },
  {
    id: "white-pass-knee-slice",
    name: "Knee Slice Pass",
    belt: "white",
    position: "Guard Passing",
    category: "Pressure Pass",
    shortDescription: "Classic pass that uses hip line control and shoulder pressure.",
    fullStepByStep: [
      "Control inside position with one knee between their legs and your opposite foot posted wide for base.",
      "Grip far collar or underhook and pin their near knee to the mat to remove shield frames.",
      "Slice your knee across their thigh while dropping shoulder pressure into their chest and turning hips slightly down.",
      "Clear your trailing foot, settle chest-to-chest, and establish side control."
    ],
    tips: ["Win the underhook battle early.", "Your slicing knee should travel forward, not sideways."],
    commonMistakes: ["Trying to slide without pinning the near leg.", "Staying too upright and losing pressure."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },
  {
    id: "white-pass-toreando-basics",
    name: "Toreando Pass Basics",
    belt: "white",
    position: "Guard Passing",
    category: "Movement Pass",
    shortDescription: "Speed pass that redirects both legs and circles around hip line.",
    fullStepByStep: [
      "Grip both pant legs near the knees and keep your elbows tucked for structural control.",
      "Step diagonally while steering both legs across your center line as if opening a gate.",
      "Run your feet around their hip line and drop shoulder pressure into chest before they recover guard.",
      "Secure side control with crossface and near-side underhook."
    ],
    tips: ["Move feet first, then settle pressure.", "Keep hips low when you circle around."],
    commonMistakes: ["Standing too tall and getting lassoed.", "Pausing after redirecting legs."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },
  {
    id: "white-pass-double-under",
    name: "Double Under Pass",
    belt: "white",
    position: "Guard Passing",
    category: "Stack Pass",
    shortDescription: "Control both legs and stack safely to pass around the hips.",
    fullStepByStep: [
      "Thread both arms under the thighs and clasp hands around the hips so legs are pinned.",
      "Lift and stack your partner by driving shoulder pressure into their stomach while keeping head tight.",
      "Walk around to one side in small steps while maintaining leg control to prevent inversion.",
      "Drop your hips low as you clear legs and stabilize side control."
    ],
    tips: ["Keep your elbows glued to their hips.", "Use steps and angle, not brute force."],
    commonMistakes: ["Letting knees flare open during stack.", "Trying to sprint around too early."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },
  {
    id: "white-pass-over-under",
    name: "Over-Under Pass",
    belt: "white",
    position: "Guard Passing",
    category: "Pressure Pass",
    shortDescription: "Pin one leg over shoulder and one under arm to freeze guard movement.",
    fullStepByStep: [
      "Trap one leg over your shoulder and underhook the opposite leg so both hips are misaligned.",
      "Drop your chest low and connect your ear to their torso to remove space.",
      "Walk toward the trapped-over-shoulder side, clearing their knee line before turning the corner.",
      "Finish with heavy chest pressure and controlled hip pin."
    ],
    tips: ["Head position keeps hips pinned.", "Walk slowly and never give knee space back."],
    commonMistakes: ["Staying too high and getting re-guarded.", "Trying to force pass without controlling far leg."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },
  {
    id: "white-pass-leg-drag-intro",
    name: "Leg Drag Introduction",
    belt: "white",
    position: "Guard Passing",
    category: "Control Pass",
    shortDescription: "Drag one leg across center and staple hips before sliding through.",
    fullStepByStep: [
      "Control ankle and knee, then drag one leg across your center line so their hips turn away.",
      "Step your near knee beside their trapped thigh to staple movement while your far leg posts for base.",
      "Crossface and underhook to pin upper body and stop spinning escape attempts.",
      "Slide chest forward and settle in side control with tight hip connection."
    ],
    tips: ["Turn their hips first, then pin shoulders.", "A strong staple knee prevents guard recovery."],
    commonMistakes: ["Dragging leg but leaving hips square.", "Ignoring upper body control after drag."],
    youtubeUrl: LINKS.passBase,
    difficulty: "beginner",
  },

  // Side Control (6)
  {
    id: "white-side-crossface-underhook",
    name: "Crossface and Underhook Control",
    belt: "white",
    position: "Side Control",
    category: "Pinning",
    shortDescription: "Build true side control with shoulder pressure and hip blocking.",
    fullStepByStep: [
      "Place your crossface shoulder under their jawline and turn their face away from you.",
      "Thread your far-side underhook deep and glue your elbow to their back.",
      "Sprawl your hips low with knees wide so their near elbow cannot re-enter inside space.",
      "Adjust weight toward chest and hips in rhythm to stay heavy without overcommitting."
    ],
    tips: ["Head direction controls the escape direction.", "Shoulder pressure should feel steady, not jerky."],
    commonMistakes: ["Resting weight on knees instead of torso.", "Leaving underhook shallow and loose."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },
  {
    id: "white-side-kesa-gatame-hold",
    name: "Kesa Gatame Hold Basics",
    belt: "white",
    position: "Side Control",
    category: "Pinning Variation",
    shortDescription: "Use scarf hold to pin upper body and isolate near arm.",
    fullStepByStep: [
      "Sit near their shoulder with your near arm wrapping head and your far arm controlling near triceps.",
      "Drop your hip to the mat close to their ribs while extending your far leg for base.",
      "Keep your chest angled slightly toward their head so they cannot easily turn into you.",
      "When they bridge, post your free hand and reset chest pressure before attacking."
    ],
    tips: ["Stay close to shoulder line, not hips.", "Your far leg acts as a kickstand."],
    commonMistakes: ["Sitting too high by the neck and losing base.", "Leaning backward during bridges."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },
  {
    id: "white-side-knee-on-belly-entry",
    name: "Knee-on-Belly Entry",
    belt: "white",
    position: "Side Control",
    category: "Transition",
    shortDescription: "Transition to mobile control and create reactions for submissions.",
    fullStepByStep: [
      "From side control, post one hand on mat and one on collar or shoulder for balance.",
      "Slide your near knee across their stomach with toes active and shin angled through center.",
      "Keep your weight centered over your posting points, not dumped through the knee alone.",
      "Use their push reaction to transition back to side control or into mount."
    ],
    tips: ["Float your weight, do not spike it.", "Hands and toes are your balance tripod."],
    commonMistakes: ["Leaning too far forward and getting rolled.", "Placing knee too low near hips."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },
  {
    id: "white-side-far-arm-isolation",
    name: "Far-Side Arm Isolation",
    belt: "white",
    position: "Side Control",
    category: "Control to Attack",
    shortDescription: "Isolate the far arm to open kimura, americana, and armbar chains.",
    fullStepByStep: [
      "Maintain crossface while walking your underhook shoulder deeper under their far scapula.",
      "Use your free hand to peel their far wrist from their body and pin it to the mat.",
      "Switch your hips slightly to keep chest pressure while isolating the elbow from their ribs.",
      "Transition into submission grip only after the elbow is clearly detached."
    ],
    tips: ["Isolate elbow first, wrist second.", "Keep chest pressure during hand fighting."],
    commonMistakes: ["Chasing wrist with loose chest connection.", "Allowing opponent to turn into turtle."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },
  {
    id: "white-side-hip-switch-control",
    name: "Hip Switch to Reverse Side Control",
    belt: "white",
    position: "Side Control",
    category: "Transition",
    shortDescription: "Switch hips to shut down frames and reset pressure.",
    fullStepByStep: [
      "When your opponent frames hard against your neck, windshield-wiper your hips to face their legs.",
      "Pin their near arm with your hip line while your chest tracks their torso.",
      "Keep one arm controlling near hip to prevent guard recovery as you settle reverse side control.",
      "Switch back to standard side control once their frame collapses."
    ],
    tips: ["Hip switch is a pressure reset, not a scramble.", "Stay connected through the transition."],
    commonMistakes: ["Switching hips with too much space.", "Forgetting to block near hip during switch."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },
  {
    id: "white-side-guard-recovery-denial",
    name: "Guard Recovery Denial from Side Control",
    belt: "white",
    position: "Side Control",
    category: "Retention",
    shortDescription: "Block knee insertions and maintain top pressure when opponent shrimps.",
    fullStepByStep: [
      "As they shrimp, track their near knee with your elbow and hip so it cannot thread inside.",
      "Step your near leg back and drop your hip line to smother the recovering frame.",
      "Re-apply crossface and underhook as soon as their movement slows.",
      "Advance to knee-on-belly or mount when control is stable."
    ],
    tips: ["Follow knees with your hips, not your hands.", "Rebuild chest control after every defensive burst."],
    commonMistakes: ["Reaching for legs and losing upper-body pin.", "Staying static while opponent keeps moving."],
    youtubeUrl: LINKS.sideBase,
    difficulty: "beginner",
  },

  // Mount (6)
  {
    id: "white-mount-low-control",
    name: "Low Mount Control",
    belt: "white",
    position: "Mount",
    category: "Pinning",
    shortDescription: "Stabilize against bridges by dropping hips and widening base.",
    fullStepByStep: [
      "Sit heavy over hips with knees pinched and feet tucked near their hips for base.",
      "Post your hands lightly on mat or chest and keep your head over their center line.",
      "When they bridge, post opposite hand and foot while keeping hips connected.",
      "Return to center and re-establish chest pressure before attacking."
    ],
    tips: ["Balance over center, not too high.", "Ride movement instead of resisting every bridge."],
    commonMistakes: ["Leaning forward and getting rolled.", "Squeezing with legs only and losing posture."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },
  {
    id: "white-mount-high-mount-climb",
    name: "High Mount Climb",
    belt: "white",
    position: "Mount",
    category: "Transition",
    shortDescription: "Climb above elbows to remove defensive frames and open submissions.",
    fullStepByStep: [
      "Walk your knees up toward armpits while controlling wrists so elbows stay separated from torso.",
      "Slide one knee high under shoulder line and keep hips low to avoid being bridged off.",
      "Pinch knees inward and keep heels tight as you settle above their chest.",
      "Use high mount to attack armbars and cross-collar chokes with reduced risk."
    ],
    tips: ["Climb when their elbows are wide.", "Move one knee at a time with balance."],
    commonMistakes: ["Rushing high mount and falling forward.", "Allowing elbows back inside during climb."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },
  {
    id: "white-mount-americana",
    name: "Americana from Mount",
    belt: "white",
    position: "Mount",
    category: "Submission",
    shortDescription: "Pin and paintbrush shoulder lock from a stable top mount.",
    fullStepByStep: [
      "Pin one wrist to the mat with palm down and keep elbow bent at ninety degrees.",
      "Thread your second arm under their triceps and grab your own wrist to create a figure-four grip.",
      "Slide the pinned hand down toward their hip while lifting elbow in a paintbrush arc.",
      "Apply pressure slowly and keep chest weight heavy to prevent escapes."
    ],
    tips: ["Keep their wrist glued to mat.", "Move elbow and hand together in tight arc."],
    commonMistakes: ["Lifting wrist off floor.", "Trying to finish with arms while hips are light."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },
  {
    id: "white-mount-cross-collar",
    name: "Cross Collar Choke from Mount",
    belt: "white",
    position: "Mount",
    category: "Submission",
    shortDescription: "Secure deep collar grips and finish with elbow line and chest expansion.",
    fullStepByStep: [
      "Open one collar and feed your first hand deep, knuckles behind neck line.",
      "Use your second hand to enter opposite collar while keeping elbows tucked near ribs.",
      "Drop your head low to keep posture pressure and pull elbows toward your hips.",
      "Finish by engaging back muscles and squeezing forearms around carotid lines."
    ],
    tips: ["Deep first grip makes second grip easy.", "Head low keeps them pinned."],
    commonMistakes: ["Staying upright while setting grips.", "Crossing wrists awkwardly with shallow grips."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },
  {
    id: "white-mount-armbar",
    name: "S-Mount Armbar Basics",
    belt: "white",
    position: "Mount",
    category: "Submission",
    shortDescription: "Isolate arm from high mount and finish with controlled hip extension.",
    fullStepByStep: [
      "From high mount, pin one wrist and slide opposite knee near their ear to limit movement.",
      "Step your second leg around their head and sit to S-mount with knees squeezing inward.",
      "Fall to controlled side while trapping thumb-up arm line to your chest.",
      "Pinch knees and lift hips gently to finish."
    ],
    tips: ["Control elbow line before falling back.", "Keep heels heavy to stop escapes."],
    commonMistakes: ["Falling back with loose arm control.", "Crossing legs and losing pressure."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },
  {
    id: "white-mount-upa-counter-post",
    name: "Countering Upa from Mount",
    belt: "white",
    position: "Mount",
    category: "Retention",
    shortDescription: "Read bridge direction and post correctly without giving position away.",
    fullStepByStep: [
      "Feel which side they trap and bridge toward by monitoring shoulder and hip load.",
      "Post opposite hand and same-side foot in a wide base as bridge starts, not after.",
      "Keep hips low and slightly forward so their momentum dissolves under your weight.",
      "Re-center and attack once their bridge cycle ends."
    ],
    tips: ["Early post beats big post.", "Stay calm and surf the bridge."],
    commonMistakes: ["Posting with trapped hand.", "Letting hips lift during bridge defense."],
    youtubeUrl: LINKS.mountBase,
    difficulty: "beginner",
  },

  // Back / Rear Mount (6)
  {
    id: "white-back-seatbelt-control",
    name: "Seatbelt Retention from Rear Mount",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Control",
    shortDescription: "Lock chest-to-back pressure and prevent shoulder escapes.",
    fullStepByStep: [
      "Connect over-under seatbelt tight at sternum with elbows pinched.",
      "Keep your head near choking-arm side and chest glued to upper back.",
      "Set hooks deep and use heel tension to control hip line.",
      "Prioritize control and hand fighting before any choke attempt."
    ],
    tips: ["Chest connection is king.", "Elbows tight make seatbelt unbreakable."],
    commonMistakes: ["Opening grips too early.", "Crossing ankles in front of hips."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },
  {
    id: "white-back-rnc-finish",
    name: "Rear Naked Choke Fundamentals",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Submission",
    shortDescription: "High-percentage finish using clean forearm position and head control.",
    fullStepByStep: [
      "Hide choking hand first while controlling wrist fight with support hand.",
      "Slide forearm under chin and connect choking hand to opposite biceps.",
      "Place support hand behind their head and pull elbows inward.",
      "Expand chest and draw choking elbow down for controlled finish."
    ],
    tips: ["Hide then strike.", "Finish with structure, not force."],
    commonMistakes: ["Cranking over jaw with no control.", "Losing hook pressure during attack."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },
  {
    id: "white-back-short-choke",
    name: "Short Choke from Back",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Submission",
    shortDescription: "Compact alternative when chin defense blocks full RNC entry.",
    fullStepByStep: [
      "Keep seatbelt and place choking forearm blade near one carotid side.",
      "Cup your support hand behind opponent's head to block posture.",
      "Compress elbows inward while lifting chest and rotating forearm angle.",
      "Finish calmly and release immediately on tap."
    ],
    tips: ["Stay compact.", "Do not chase deep grip if short choke is open."],
    commonMistakes: ["Overextending for deep grip.", "Losing head control with support hand."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },
  {
    id: "white-back-bow-and-arrow",
    name: "Bow-and-Arrow Choke Basics",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Submission",
    shortDescription: "Gi back attack using deep collar and leg extension mechanics.",
    fullStepByStep: [
      "Establish deep thumb-in collar grip while maintaining back connection.",
      "Grab far pant leg and fall to choking side without losing chest alignment.",
      "Extend leg and pull collar elbow back to stretch frame and tighten choke.",
      "Control finish line and release on tap."
    ],
    tips: ["Collar depth matters most.", "Use angle and extension together."],
    commonMistakes: ["Falling flat with no pant control.", "Trying finish from shallow collar grip."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },
  {
    id: "white-back-body-triangle",
    name: "Body Triangle Control",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Control",
    shortDescription: "Switch hooks to body triangle for powerful hip containment.",
    fullStepByStep: [
      "Bring one leg across abdomen while preserving seatbelt pressure.",
      "Thread opposite foot behind knee and lock triangle on safe side.",
      "Pinch knees and keep hips active to follow rotation attempts.",
      "Use control to win hand fighting and set safe submissions."
    ],
    tips: ["Triangle is for control, not pain.", "Always keep upper-body connection."],
    commonMistakes: ["Forgetting head control during lock transition.", "Locking on wrong side and losing angle."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },
  {
    id: "white-back-trap-arm-rnc",
    name: "Trap Arm to RNC",
    belt: "white",
    position: "Back / Rear Mount",
    category: "Submission Chain",
    shortDescription: "Immobilize one defense hand before finishing choke.",
    fullStepByStep: [
      "Identify defending hand and pin wrist with underhook-side hand.",
      "Use your hook-side leg to trap arm against torso while chest stays glued.",
      "Slide choking arm under chin and lock RNC mechanics.",
      "Apply controlled finishing pressure with trapped arm neutralized."
    ],
    tips: ["Trap first, finish second.", "Keep pressure forward so trap stays secure."],
    commonMistakes: ["Loose leg trap.", "Attempting choke before arm is isolated."],
    youtubeUrl: LINKS.backBase,
    difficulty: "beginner",
  },

  // Turtle & Leg Entanglements (6)
  {
    id: "white-turtle-seatbelt-breakdown",
    name: "Seatbelt Breakdown from Turtle",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Control",
    shortDescription: "Use seatbelt and angle to flatten turtle safely.",
    fullStepByStep: [
      "Secure one arm over shoulder and one under armpit while chest stays connected.",
      "Step to angle beside hip and pull shoulder line backward while driving chest forward.",
      "Break their base to near hip and settle top pressure before attacking.",
      "Transition to back control if they expose hooks."
    ],
    tips: ["Angle before force.", "Keep your chest heavy throughout breakdown."],
    commonMistakes: ["Pulling straight backward with no angle.", "Leaving hips far away from turtle."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },
  {
    id: "white-turtle-clock-choke-entry",
    name: "Clock Choke Entry",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Submission",
    shortDescription: "Gi turtle attack using deep collar and rotational walk.",
    fullStepByStep: [
      "Insert deep collar grip near neck with knuckles firm and elbow tight.",
      "Control near hip or far pant to block defensive turn-in.",
      "Walk your legs around head side in a clock motion while dropping shoulder pressure.",
      "Stop when choke pressure peaks and release on tap."
    ],
    tips: ["Deep collar first.", "Walk smooth and tight, not wide."],
    commonMistakes: ["Shallow grip and no choke pressure.", "Walking too far and losing control."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },
  {
    id: "white-turtle-spiral-ride",
    name: "Spiral Ride Control",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Control",
    shortDescription: "Break turtle posture and expose back with spiral pressure.",
    fullStepByStep: [
      "Control near wrist and far hip while your chest stays over shoulder blades.",
      "Drive shoulder pressure diagonally forward as your hips circle behind.",
      "Use spiral tension to force elbows wide and create hook entry lane.",
      "Insert first hook only when their base has clearly collapsed."
    ],
    tips: ["Shoulder pressure sets the spiral.", "Hips follow hands, not the reverse."],
    commonMistakes: ["Reaching hooks before posture breaks.", "Losing wrist control during circle."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },
  {
    id: "white-leg-single-leg-x-entry",
    name: "Single-Leg X Intro Entry",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Leg Entanglement",
    shortDescription: "Foundational leg entanglement for sweeps and stand-ups.",
    fullStepByStep: [
      "From open guard, capture one ankle and place outside foot on hip line.",
      "Thread your inside leg under their thigh and clamp knees to isolate leg.",
      "Sit to angle while controlling heel line and lifting with your inside hook.",
      "Off-balance them backward or stand up into top position."
    ],
    tips: ["Keep hips under their center.", "Clamp knees so leg cannot slip free."],
    commonMistakes: ["Loose knee pinch.", "Trying to sweep while flat on back."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },
  {
    id: "white-leg-ashi-garami-control",
    name: "Straight Ashi Garami Control",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Leg Entanglement",
    shortDescription: "Control-first leg position to off-balance and stand.",
    fullStepByStep: [
      "Secure one leg between your hips and wrap your outside leg over their thigh.",
      "Triangle your feet lightly or pinch knees to keep knee line trapped.",
      "Control heel and ankle while you sit to dominant angle.",
      "Use push-pull off-balance to sweep or technical stand-up on top."
    ],
    tips: ["Control knee line before any attack.", "Use feet as clamps, not hooks alone."],
    commonMistakes: ["Crossing feet loosely.", "Ignoring upper-body posture while entangled."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },
  {
    id: "white-turtle-front-headlock-spin",
    name: "Front Headlock Spin to Back",
    belt: "white",
    position: "Turtle & Leg Entanglements",
    category: "Back Take",
    shortDescription: "Convert front headlock control into clean back exposure.",
    fullStepByStep: [
      "Secure chin-and-triceps style front headlock with elbows tight.",
      "Sprawl hips back to break their posture and stop shots.",
      "Circle to far side while pulling head and steering triceps inward.",
      "Insert hook and seatbelt once their back opens."
    ],
    tips: ["Sprawl before spin.", "Head control determines their direction."],
    commonMistakes: ["Circling with no hip pressure.", "Releasing triceps too early."],
    youtubeUrl: LINKS.turtleBase,
    difficulty: "beginner",
  },

  // Submissions (6)
  {
    id: "white-sub-armbar-guard",
    name: "Armbar from Closed Guard",
    belt: "white",
    position: "Submissions",
    category: "Armbar",
    shortDescription: "Break posture, isolate arm, and finish with clean hip line.",
    fullStepByStep: [
      "Control one wrist and opposite triceps while pulling posture forward.",
      "Climb your leg high on shoulder and pivot hips to angle out.",
      "Swing second leg across face, pinch knees, and keep thumb up alignment.",
      "Lift hips gently while pulling elbow line to finish."
    ],
    tips: ["Angle first, then leg swing.", "Pin knees to stop stack pressure."],
    commonMistakes: ["Trying armbar straight-on with flat hips.", "Loose leg over head."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  {
    id: "white-sub-triangle-guard",
    name: "Triangle Choke Fundamentals",
    belt: "white",
    position: "Submissions",
    category: "Triangle",
    shortDescription: "Classic guard choke using posture break and hip angle.",
    fullStepByStep: [
      "Control wrist and head posture to make opponent lean forward.",
      "Shoot one leg over neck and clamp opposite leg over shin line.",
      "Angle your hips off center and lock figure-four behind knee.",
      "Pull head and squeeze knees while lifting hips for finish."
    ],
    tips: ["Cut angle before squeezing.", "Lock over shin, not over foot."],
    commonMistakes: ["Staying square under opponent.", "Loose top leg with no clamp."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  {
    id: "white-sub-kimura-side-control",
    name: "Kimura from Side Control",
    belt: "white",
    position: "Submissions",
    category: "Kimura",
    shortDescription: "Powerful shoulder lock from top with chest pressure and figure-four grip.",
    fullStepByStep: [
      "Pin near wrist to mat and thread your second arm under triceps.",
      "Lock figure-four grip and keep elbows close to your chest.",
      "Walk your hips toward head side while lifting elbow from mat.",
      "Rotate hand behind back in controlled arc for finish."
    ],
    tips: ["Keep wrist pinned first.", "Use body angle, not arm curl."],
    commonMistakes: ["Trying to finish with no chest pressure.", "Letting elbow drift back to ribs."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  {
    id: "white-sub-guillotine-basic",
    name: "Basic Guillotine from Front Headlock",
    belt: "white",
    position: "Submissions",
    category: "Guillotine",
    shortDescription: "Neck attack when opponent shoots with exposed head position.",
    fullStepByStep: [
      "Wrap neck with choking arm high and connect your wrist to your ribs.",
      "Secure support grip and raise choking elbow while keeping head tight.",
      "Sit to guard or stay standing with hips back to deny takedown completion.",
      "Apply upward forearm pressure and controlled chest lift for tap."
    ],
    tips: ["High wrist line is crucial.", "Hips back protect your base."],
    commonMistakes: ["Gripping too low on neck.", "Falling backward without control."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  {
    id: "white-sub-ezekiel-mount",
    name: "Ezekiel Choke from Mount",
    belt: "white",
    position: "Submissions",
    category: "Choke",
    shortDescription: "Sleeve-assisted choke from a stable mount position.",
    fullStepByStep: [
      "From mount, feed one hand into your opposite sleeve to build blade-like frame.",
      "Place forearm across neck while second hand slides behind head to complete scissor line.",
      "Drop elbows and chest pressure together so neck compression tightens evenly.",
      "Hold controlled pressure and release on tap."
    ],
    tips: ["Secure sleeve grip deeply.", "Mount stability comes before choke pressure."],
    commonMistakes: ["Attempting from unstable high posture.", "Forearm placement too high on face."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  {
    id: "white-sub-baseball-bat-basic",
    name: "Baseball Bat Choke Basics",
    belt: "white",
    position: "Submissions",
    category: "Gi Choke",
    shortDescription: "Cross-grip gi choke that punishes forward pressure.",
    fullStepByStep: [
      "Set first palm-up collar grip deep with forearm across neck.",
      "Place second palm-down grip on opposite collar like holding a bat.",
      "Rotate around head side as you drop shoulder and align forearms as cutting blades.",
      "Finish when collar tension compresses both sides of neck."
    ],
    tips: ["Grip depth makes timing forgiving.", "Turn your body as one unit."],
    commonMistakes: ["Shallow second grip.", "Trying to squeeze in place with no rotation."],
    youtubeUrl: LINKS.subBase,
    difficulty: "beginner",
  },
  // Blue Belt samples
  {
    id: "blue-stand-arm-drag-single-leg",
    name: "Arm Drag to Single Leg",
    belt: "blue",
    position: "Takedowns & Standing",
    category: "Chain Wrestling",
    shortDescription: "Blend arm drag and penetration step for a clean takedown finish.",
    fullStepByStep: [
      "Win wrist-and-triceps control and pull the arm sharply across your center line.",
      "Step to outside angle and keep your chest close so they cannot square up.",
      "Drop level immediately to the near leg and connect shoulder to hip line.",
      "Finish by turning the corner and running through to stable top position."
    ],
    tips: ["Your angle determines the finish.", "Drag and shot should feel like one motion."],
    commonMistakes: ["Pausing between drag and shot.", "Shooting with head disconnected from hip."],
    youtubeUrl: "https://www.youtube.com/watch?v=z9vq-1l5F5c",
    difficulty: "beginner",
  },
  {
    id: "blue-guard-dlr-off-balance",
    name: "De La Riva Off-Balance Sweep",
    belt: "blue",
    position: "Guard Work",
    category: "Sweep",
    shortDescription: "Use DLR hook and sleeve tension to force a controlled top transition.",
    fullStepByStep: [
      "Establish DLR hook, ankle control, and a sleeve grip that keeps posture tilted forward.",
      "Scoot your hips under center and angle slightly to your hook side.",
      "Kick and pull in opposite directions to break base and make them post.",
      "Come up on the sweep with posture and settle into passing position."
    ],
    tips: ["Off-balance before you try to come up.", "Keep your hook active as steering wheel."],
    commonMistakes: ["Staying flat and trying to yank with arms.", "Letting sleeve grip go before standing up."],
    youtubeUrl: "https://www.youtube.com/watch?v=4f2xPz3J7Y8",
    difficulty: "beginner",
  },
  {
    id: "blue-pass-leg-drag-advance",
    name: "Leg Drag to Back Step",
    belt: "blue",
    position: "Guard Passing",
    category: "Passing Chain",
    shortDescription: "Drag the leg, pin hips, and back-step when opponent frames hard.",
    fullStepByStep: [
      "Drag one leg across your center and staple it with your near knee.",
      "Crossface to turn the head away and remove rotational escape.",
      "When they frame into you, back-step your free leg to bypass knee shield recovery.",
      "Drop hips and settle side control or three-quarter mount."
    ],
    tips: ["Pin hips before changing direction.", "Back-step only after head control is secure."],
    commonMistakes: ["Back-stepping too early.", "Ignoring crossface and losing shoulder control."],
    youtubeUrl: "https://www.youtube.com/watch?v=F8m7xH2M9aQ",
    difficulty: "beginner",
  },
  {
    id: "blue-side-kimura-trap-system",
    name: "Kimura Trap from Side Control",
    belt: "blue",
    position: "Side Control",
    category: "Submission Chain",
    shortDescription: "Use kimura control to force transitions to back or armbar.",
    fullStepByStep: [
      "Pin wrist and thread figure-four while keeping chest pressure over shoulders.",
      "Walk north-south angle to separate elbow from torso and expose finishing lanes.",
      "If they defend rotation, maintain grip and step over head for armbar transition.",
      "If they turn away, follow to back control without releasing kimura connection."
    ],
    tips: ["The grip is a control system, not only a finish.", "Stay chest-heavy while transitioning."],
    commonMistakes: ["Forcing finish when transition is open.", "Letting elbow reconnect to ribs."],
    youtubeUrl: "https://www.youtube.com/watch?v=I3mM4lN6Q3c",
    difficulty: "beginner",
  },
  {
    id: "blue-mount-s-mount-cross-collar",
    name: "S-Mount to Collar Choke",
    belt: "blue",
    position: "Mount",
    category: "Submission Chain",
    shortDescription: "Climb high and finish with collar pressure when armbar defense appears.",
    fullStepByStep: [
      "Climb to high mount and force elbows away from center line.",
      "Shift to S-mount with one knee high by the head and heel heavy at hip line.",
      "Feed deep collar grip and angle your chest so their shoulders cannot rotate.",
      "Draw elbows down and finish with steady collar pressure."
    ],
    tips: ["S-mount stabilizes their upper body.", "Keep your hips heavy while setting grips."],
    commonMistakes: ["Rushing grips before balance is secure.", "Allowing elbows back inside."],
    youtubeUrl: "https://www.youtube.com/watch?v=8r5Q2sH9z3M",
    difficulty: "beginner",
  },
  {
    id: "blue-back-bow-arrow-finish",
    name: "Bow-and-Arrow Finish Details",
    belt: "blue",
    position: "Back / Rear Mount",
    category: "Submission",
    shortDescription: "Refine collar depth and angle for efficient gi choke finishes.",
    fullStepByStep: [
      "Establish deep choking collar grip and secure far pant near knee line.",
      "Fall to choking side while extending your top leg to stretch posture.",
      "Draw your collar elbow toward your hip as your chest stays connected.",
      "Finish once both carotid lines are compressed and control is stable."
    ],
    tips: ["Pull and extension happen together.", "Do not sacrifice control for speed."],
    commonMistakes: ["Shallow collar grip.", "Falling flat without pant control."],
    youtubeUrl: "https://www.youtube.com/watch?v=YzW7D2v4xM8",
    difficulty: "beginner",
  },
  {
    id: "blue-turtle-crucifix-control",
    name: "Crucifix Entry from Turtle",
    belt: "blue",
    position: "Turtle & Leg Entanglements",
    category: "Control",
    shortDescription: "Trap an arm and rotate to crucifix for dominant control and attacks.",
    fullStepByStep: [
      "From turtle ride, isolate near arm by pulling elbow away from ribs.",
      "Thread your leg over the arm and pinch to secure the trap.",
      "Roll your hips to the side while controlling head to enter crucifix alignment.",
      "Settle control before attacking chokes or straight arm locks."
    ],
    tips: ["Arm trap quality makes the position stable.", "Control head direction during roll."],
    commonMistakes: ["Rolling without secure arm trap.", "Leaving too much hip space."],
    youtubeUrl: "https://www.youtube.com/watch?v=3Yl3q8W2Q4k",
    difficulty: "beginner",
  },
  {
    id: "blue-sub-baseball-bat-timing",
    name: "Baseball Bat Choke Timing Trap",
    belt: "blue",
    position: "Submissions",
    category: "Gi Choke",
    shortDescription: "Bait forward pressure and finish baseball bat choke with proper rotation.",
    fullStepByStep: [
      "Set a deep palm-up collar grip while keeping your elbow hidden and protected.",
      "Insert palm-down second grip and align wrists like holding a bat.",
      "Invite pressure, then rotate around head side with chest dropping toward mat.",
      "Keep forearm blades connected and finish once pressure closes both arteries."
    ],
    tips: ["Grip depth creates reliable timing.", "Rotate your torso, not just your arms."],
    commonMistakes: ["Trying to squeeze in place.", "Second grip too shallow to bite."],
    youtubeUrl: "https://www.youtube.com/watch?v=2Qn1T8Q9L8o",
    difficulty: "beginner",
  },
];

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES.find((technique) => technique.id === id);
}
