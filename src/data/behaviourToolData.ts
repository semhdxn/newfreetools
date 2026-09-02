// Behaviour Tool — Complete data: functions, statements (primary/secondary), strategies, scoring
// Extracted from free-tools-reproduction-guide.md

export type BehaviourFunction = 'control' | 'attention' | 'escape' | 'sensory' | 'self-esteem';
export type Cohort = 'primary' | 'secondary';

export interface BehaviourFunctionDef {
  id: BehaviourFunction;
  label: string;
  description: string;
}

export interface BehaviourStatement {
  id: string;
  function: BehaviourFunction;
  cohort: Cohort;
  text: string;
  source?: string;
}

export interface BehaviourStrategy {
  id: string;
  function: BehaviourFunction;
  text: string;
  source?: string;
}

export const behaviourFunctions: BehaviourFunctionDef[] = [
  { id: 'control', label: 'Control', description: 'Control-seeking behaviours — the child wants to be in charge or avoid perceived loss of control.' },
  { id: 'attention', label: 'Attention', description: 'Attention-seeking behaviours — the child seeks attention from others.' },
  { id: 'escape', label: 'Escape', description: 'Escape/avoidance behaviours — the child seeks to avoid or leave a task or situation.' },
  { id: 'sensory', label: 'Sensory', description: 'Sensory-driven behaviours — also explore the Sensory Suggester.' },
  { id: 'self-esteem', label: 'Self-Esteem', description: 'Indicators of the child\'s overall self-esteem (higher = stronger self-esteem).' },
];

// Helper to build statement arrays
const mkStmts = (prefix: string, fn: BehaviourFunction, cohort: Cohort, texts: string[]) =>
  texts.map((text, i) => ({ id: `${prefix}-${i}`, function: fn, cohort, text, source: 'Adapted from public SEMH/PBS literature — editable starter bank' }));

// PRIMARY COHORT (4-11 years)
const primaryControl = mkStmts('p-ctrl', 'control', 'primary', [
  'Tries to be in charge of group activities or games',
  'Refuses to follow instructions from adults',
  'Argues with adults when asked to stop something',
  'Wants to do things their own way',
  'Gets upset when asked to do something they don\'t want to do',
  'Becomes angry when they can\'t have what they want',
  'Tries to negotiate or bargain when told "no"',
  'Interrupts adults or other children',
  'Becomes upset when plans or routines change',
  'Complains or shows displeasure when asked to change activities',
  'Tries to make excuses to avoid doing things',
  'Resists transitions between lessons or activities',
  'Gets annoyed when another child takes a turn',
  'Wants the "best" toy or resource first',
  'Becomes frustrated when they can\'t control what happens',
]);

const primaryAttention = mkStmts('p-attn', 'attention', 'primary', [
  'Shows off or uses silly behaviour to get a laugh',
  'Acts out or "plays the clown" in class',
  'Makes funny noises or impressions to get others to look',
  'Deliberately does something they know will get told off',
  'Talks loudly or interrupts to get others to listen',
  'Seeks praise or approval from adults',
  'Becomes upset if others ignore them',
  'Constantly seeks help or attention from adults',
  'Uses aggressive or rude behaviour to get a reaction',
  'Does something dangerous or risky to get others to notice',
  'Tattles or tells tales on other children',
  'Brags or boasts about things they can do',
  'Becomes upset if they don\'t win or come first',
  'Seeks reassurance repeatedly from the same adult',
  'Uses accident-prone or "clumsy" behaviour to get attention',
]);

const primaryEscape = mkStmts('p-esc', 'escape', 'primary', [
  'Refuses to do work or complete a task',
  'Hides under tables or desks to avoid work',
  'Avoids joining in group activities or games',
  'Comes to the nurse\'s office complaining of minor ailments',
  'Asks to go to the toilet repeatedly',
  'Daydreams or zones out during class',
  'Becomes quiet or withdrawn when a task is difficult',
  'Says "I can\'t do this" before trying',
  'Tries to distract others from working',
  'Leaves the classroom without permission',
  'Complains of pain or feeling unwell during work',
  'Shuts down or refuses to speak when anxious',
  'Cries to get out of doing something',
  'Becomes aggressive when asked to do something difficult',
  'Procrastinates or delays starting a task',
]);

const primarySensory = mkStmts('p-sens', 'sensory', 'primary', [
  'Is hyperactive or always "on the go"',
  'Fidgets constantly or can\'t sit still',
  'Is very quiet and withdrawn',
  'Seeks rough play or "tumbles"',
  'Covers ears or complains when it\'s noisy',
  'Is very sensitive to touch (dislikes hugs, high-fives)',
  'Eats non-food items or puts things in their mouth',
  'Doesn\'t notice when they bump into things',
  'Seems unaware of personal space',
  'Makes repetitive movements or noises',
  'Has strong reactions to smells or tastes',
  'Rocks, sways, or bounces repetitively',
  'Seeks spinning, swinging, or movement activities',
  'Doesn\'t react to pain',
  'Becomes overwhelmed in busy or noisy environments',
]);

const primarySelfEsteem = mkStmts('p-self', 'self-esteem', 'primary', [
  'Puts themselves down ("I\'m stupid", "I\'m bad at this")',
  'Avoids tasks they might not be good at',
  'Needs constant reassurance about their performance',
  'Becomes upset by any criticism or correction',
  'Doesn\'t believe compliments or praise',
  'Compares themselves unfavourably to other children',
  'Seems to have no confidence in their abilities',
  'Withdraws after making a mistake',
  'Blames others for their failures',
  'Becomes defensive when corrected',
  'Doesn\'t try new activities or challenges',
  'Seeks constant adult reassurance or validation',
  'Is self-critical or overly harsh on themselves',
  'Avoids eye contact or seems ashamed',
  'Says they don\'t want to come to school',
]);

// SECONDARY COHORT (11-18 years)
const secondaryControl = mkStmts('s-ctrl', 'control', 'secondary', [
  'Challenges authority or questions adult decisions',
  'Refuses to follow school rules or procedures',
  'Argues or disputes discipline decisions',
  'Insists on doing things their own way',
  'Becomes angry or defensive when corrected',
  'Sees rules as unfair or dislikes being told what to do',
  'Tries to negotiate boundaries or barter with staff',
  'Uses sarcasm or backchat to resist directions',
  'Becomes distressed when plans or routines change unexpectedly',
  'Gets frustrated when they don\'t have input into decisions',
  'Tries to find loopholes in rules',
  'Resists transition between lessons or activities',
  'Becomes annoyed when peers are chosen over them',
  'Wants special treatment or exemptions from rules',
  'Feels anxious when they can\'t predict what\'s happening',
]);

const secondaryAttention = mkStmts('s-attn', 'attention', 'secondary', [
  'Uses humour or jokes inappropriately to get attention',
  'Acts out or performs for peers',
  'Makes provocative statements to get a reaction',
  'Deliberately breaks minor rules to get noticed',
  'Seeks reassurance or validation repeatedly',
  'Becomes upset if they\'re not noticed or included',
  'Uses gossip or rumour to engage others',
  'Mimics or mocks adults or peers',
  'Takes risks or does dangerous things for peer approval',
  'Uses negative behaviour to be noticed over positive alternatives',
  'Constantly seeks adult attention or help',
  'Brags about achievements or possessions',
  'Becomes competitive or wants to be "the best"',
  'Seeks out confrontation to be noticed',
  'Over-shares or over-involves themselves in group dynamics',
]);

const secondaryEscape = mkStmts('s-esc', 'escape', 'secondary', [
  'Avoids work or procrastinates extensively',
  'Asks to leave lessons without permission',
  'Absence or truancy to avoid lessons',
  'Reports feeling ill to leave class',
  'Becomes withdrawn or shuts down in class',
  'Daydreams or is mentally absent during learning',
  'Uses distraction to avoid tasks',
  'Says "I can\'t" before attempting the work',
  'Uses low motivation as an excuse not to try',
  'Becomes aggressive when faced with difficult work',
  'Cries or becomes very emotional to get out of a task',
  'Says they don\'t care or give up easily',
  'Sleeps in class or avoids engagement',
  'Creates reasons or drama to leave class',
  'Uses distraction or derailment to avoid work',
]);

const secondarySensory = mkStmts('s-sens', 'sensory', 'secondary', [
  'Seems hyperactive or restless most of the time',
  'Fidgets, taps, or moves constantly',
  'Seems withdrawn or disconnected',
  'Seeks rough play or physical contact',
  'Complains about noise or seeks quiet spaces',
  'Avoids or dislikes physical touch',
  'Has poor awareness of personal space',
  'Fidgets with objects or picks at things',
  'Makes repetitive movements or noises',
  'Seems unaware of pain or discomfort',
  'Has intense reactions to smells, tastes or textures',
  'Seeks stimulating or intense sensory experiences',
  'Becomes overwhelmed in busy or loud environments',
  'Seems "zoned out" or disconnected from the room',
  'Has unusual or intense sensory needs',
]);

const secondarySelfEsteem = mkStmts('s-self', 'self-esteem', 'secondary', [
  'Uses negative self-talk ("I\'m useless", "I can\'t do anything")',
  'Avoids challenging tasks or new experiences',
  'Seeks constant reassurance or praise',
  'Is sensitive to criticism or correction',
  'Dismisses or downplays their achievements',
  'Compares themselves negatively to peers',
  'Lacks confidence in their abilities',
  'Withdraws after making a mistake',
  'Blames others for their failures',
  'Becomes defensive when challenged',
  'Doesn\'t believe positive feedback',
  'Seeks adult validation repeatedly',
  'Is harsh on themselves for small mistakes',
  'Avoids eye contact or shows signs of shame',
  'Expresses not wanting to attend school or engage',
]);

export const behaviourStatements: BehaviourStatement[] = [
  ...primaryControl,
  ...primaryAttention,
  ...primaryEscape,
  ...primarySensory,
  ...primarySelfEsteem,
  ...secondaryControl,
  ...secondaryAttention,
  ...secondaryEscape,
  ...secondarySensory,
  ...secondarySelfEsteem,
];

// Helper to build strategy arrays
const mkStrat = (id: string, fn: BehaviourFunction, texts: string[]) =>
  texts.map((text, i) => ({ id: `${id}-${i}`, function: fn, text, source: 'Adapted from public SEMH/PBS literature' }));

export const behaviourStrategies: BehaviourStrategy[] = [
  ...mkStrat('str-ctrl', 'control', [
    'Offer choices within boundaries ("Would you like to start with A or B?")',
    'Give a role where the child leads (peer mentor, line leader, task chooser).',
    'Use a visual schedule so transitions are predictable.',
    'Negotiate a small area of "control" (desk setup, seating, order of tasks).',
    'Acknowledge their need for autonomy: "I know you like to choose — you can pick the colour."',
    'Provide advance notice of changes to routines.',
    'Let them have input into class/room rules.',
    'Praise and reward negotiation and problem-solving, not compliance alone.',
    'Avoid power struggles by offering face-saving ways to comply.',
    'Teach explicit negotiation and compromise skills.',
  ]),
  ...mkStrat('str-attn', 'attention', [
    'Catch and praise positive behaviour immediately and specifically.',
    'Use a positive time-investment strategy: set aside 1:1 time where the child leads.',
    'Reduce the "payoff" for negative attention (minimize response, avoid arguing).',
    'Use attention as a reward for desired behaviour, not a given.',
    'Teach peer-interaction skills and role-model social connection.',
    'Create classroom roles that allow positive attention-seeking (helper, expert, leader).',
    'Use a reward chart or token system for replacing negative attention-seeking with positive.',
    'Acknowledge the need ("I can see you want to make people laugh — here\'s a good time for jokes").',
    'Notice and name positive peer interactions immediately.',
    'Build in regular, predictable 1:1 check-ins with an adult.',
  ]),
  ...mkStrat('str-esc', 'escape', [
    'Break tasks into smaller chunks and celebrate each step.',
    'Provide visual prompts and written instructions so they can work independently.',
    'Use timers or time-boxing to show when a task ends.',
    'Offer a "takeover" option: let a trusted adult take over and model the first few steps.',
    'Provide movement breaks between work blocks.',
    'Use scaffolding: start easier, build confidence, then increase difficulty.',
    'Offer choices in how to complete a task (write, draw, build, explain).',
    'Teach calming/coping strategies: breathing, movement, fidget tools, sensory input.',
    'Sit the child near a trusted peer who can quietly model the start of a task.',
    'Use low-key re-engagement: a quiet question or a co-regulation moment rather than a demand.',
    'Identify and address the triggering content (literacy demand, social demand, sensory load).',
    'Make returning to class easy — do not require an apology or lengthy conversation before re-entry.',
  ]),
  ...mkStrat('str-sens', 'sensory', [
    'Build in regular movement breaks (heavy work, stretching, errands).',
    'Offer fidget tools or chewable jewellery to channel sensory seeking productively.',
    'Provide ear defenders or noise-cancelling headphones for noisy environments.',
    'Allow flexible seating (wobble cushion, standing desk, floor space).',
    'Reduce visual clutter on walls and around the working area.',
    'Allow the child to leave busy spaces (corridors, dining hall) a few minutes early.',
    'Use a sensory diet planned with input from the family or an OT.',
    'Offer alternatives for messy or strong-smelling activities.',
    'Cross-link to the Sensory Suggester to identify specific sensory profiles.',
    'Plan a calm, low-stimulus space the child can use to regulate.',
  ]),
  ...mkStrat('str-self', 'self-esteem', [
    'Give specific, accurate praise that names what the child did well — avoid generic "good job".',
    'Display the child\'s work in classroom or shared spaces.',
    'Set up small "expert" roles where the child teaches a peer something they can do.',
    'Catch and reframe negative self-talk ("I can\'t do this") into "I can\'t do this YET".',
    'Build in regular small wins through achievable, scaffolded tasks.',
    'Use a strengths-based conversation routine ("Tell me one thing that went well today").',
    'Make repair after rupture explicit — show the child the relationship is intact after a difficult moment.',
    'Involve the child in setting their own goals so success is visible to them.',
    'Highlight progress over time using their own past work as the comparison, not peers\'.',
    'Connect the child with a trusted adult mentor for regular check-ins.',
  ]),
];

// Helper functions
export const getStatementsForFunctionAndCohort = (fn: BehaviourFunction, cohort: Cohort) =>
  behaviourStatements.filter(s => s.function === fn && s.cohort === cohort);

export const getStatementsForCohort = (cohort: Cohort) =>
  behaviourStatements.filter(s => s.cohort === cohort);

export const getStrategiesForFunction = (fn: BehaviourFunction) =>
  behaviourStrategies.filter(s => s.function === fn);

// Response scale
export const FREQUENCY_OPTIONS: { value: number; label: string }[] = [
  { value: 4, label: 'Very Often' },
  { value: 3, label: 'Often' },
  { value: 2, label: 'Occasionally' },
  { value: 1, label: 'Infrequently' },
  { value: 0, label: 'Never' },
];

export type ResponseMap = Record<string, number>;
export type ScoreMap = Record<BehaviourFunction, number>;

// Scoring: mean(responses) / 4 × 100 = percentage 0–100%
export const calculateScores = (responses: ResponseMap, cohort: Cohort): ScoreMap => {
  const scores: ScoreMap = { control: 0, attention: 0, escape: 0, sensory: 0, 'self-esteem': 0 };
  behaviourFunctions.forEach(({ id }) => {
    const stmts = getStatementsForFunctionAndCohort(id, cohort);
    if (stmts.length === 0) { scores[id] = 0; return; }
    let sum = 0;
    let answered = 0;
    stmts.forEach(s => {
      if (responses[s.id] !== undefined) {
        sum += responses[s.id];
        answered++;
      }
    });
    scores[id] = answered > 0 ? Math.round((sum / (answered * 4)) * 100) : 0;
  });
  return scores;
};

export const getBandColour = (score: number): string => {
  if (score <= 20) return 'bg-destructive';
  if (score <= 50) return 'bg-amber-500';
  if (score <= 75) return 'bg-green-500';
  return 'bg-green-700';
};

export const BASELINE_THRESHOLD = 20;
export const SENSORY_ALERT_THRESHOLD = 50;
