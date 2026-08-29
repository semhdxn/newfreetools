export type BehaviourFunction = 'control' | 'attention' | 'escape' | 'sensory' | 'self-esteem';
export type Cohort = 'primary' | 'secondary';

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

export let behaviourFunctions: { id: BehaviourFunction; label: string; description: string }[] = [
  { id: 'control', label: 'Control', description: 'Behaviours where the child seeks control over people, environment or events.' },
  { id: 'attention', label: 'Attention', description: 'Behaviours that seek attention from adults or peers.' },
  { id: 'escape', label: 'Escape', description: 'Behaviours used to avoid a task, person or environment.' },
  { id: 'sensory', label: 'Sensory', description: 'Sensory-driven behaviours — also explore the Sensory Suggester.' },
  { id: 'self-esteem', label: 'Self-Esteem', description: "Indicators of the child's overall self-esteem (higher = stronger self-esteem)." },
];

const SOURCE = 'Adapted from public SEMH/PBS literature — editable starter bank';

const mk = (
  prefix: string,
  fn: BehaviourFunction,
  cohort: Cohort,
  texts: string[],
): BehaviourStatement[] =>
  texts.map((text, i) => ({ id: `${prefix}-${i}`, function: fn, cohort, text }));

const primaryControl = mk('p-ctrl', 'control', 'primary', [
  'Tries to be in charge of group activities or games',
  'Refuses to follow instructions from adults',
  'Argues with adults when asked to stop something',
  'Insists that things are done their way',
  'Becomes upset when not given choice',
  'Tells other children what to do',
  'Negotiates or bargains to delay tasks',
  'Becomes oppositional when routines change unexpectedly',
  'Refuses to share materials or take turns',
  'Pushes against rules and boundaries',
  'Tries to control where they sit or who they sit next to',
  'Resists transitions from a preferred to a non-preferred activity',
  'Tells adults what they think the rules should be',
  'Tries to lead even when not chosen as leader',
  'Becomes distressed when an adult is "in charge"',
]);

const primaryAttention = mk('p-att', 'attention', 'primary', [
  'Calls out in class without being asked',
  'Makes silly noises to make others laugh',
  'Seeks adult attention frequently',
  'Acts as the "class clown"',
  'Interrupts when an adult is talking to someone else',
  "Repeatedly asks for help they don't actually need",
  'Shows off work or possessions to peers',
  'Tells exaggerated stories to gain interest',
  'Becomes louder when adults are not looking',
  'Tries to stand near or next to the adult',
  'Whispers, taps, or fidgets to draw attention',
  'Gets upset when another child is praised',
  'Behaves differently when an adult is watching',
  "Reports on other children's behaviour to adults",
  'Asks lots of questions to keep the adult engaged',
]);

const primaryEscape = mk('p-esc', 'escape', 'primary', [
  'Asks to go to the toilet during difficult tasks',
  'Says "I can\'t do it" before trying',
  'Puts head down or hides under table',
  'Walks out of the classroom when overwhelmed',
  'Refuses to start work',
  'Becomes "ill" at the start of a non-preferred lesson',
  'Distracts peers to delay starting a task',
  'Avoids eye contact when given an instruction',
  'Hides in cloakrooms, toilets, or quiet spaces',
  'Becomes silly or disruptive when work feels too hard',
  'Refuses to attend particular lessons',
  "Says they don't feel well to leave the room",
  'Throws or rips work to end the activity',
  'Plays up to get sent out',
  'Becomes very still and unresponsive when asked to engage',
]);

const primarySensory = mk('p-sen', 'sensory', 'primary', [
  'Fidgets constantly with objects or clothing',
  'Chews on clothing, pencils, or fingers',
  'Seeks out spinning, jumping or rough play',
  'Becomes distressed by noise in the classroom',
  'Avoids messy play (paint, glue, sand)',
  'Crashes into walls, furniture or other children',
  'Hums, taps or makes repetitive sounds',
  'Stares at lights, fans or moving objects',
  'Covers ears in busy environments',
  'Smells objects, food or other people',
  'Touches everything they walk past',
  'Struggles with school uniform textures',
  'Constantly out of seat or moving',
  'Becomes overwhelmed in the dining hall',
  'Seeks deep pressure (tight hugs, weighted items, squeezing)',
]);

const primarySelfEsteem = mk('p-se', 'self-esteem', 'primary', [
  'Talks positively about themselves',
  'Tries new activities willingly',
  'Accepts praise without dismissing it',
  'Takes pride in their work',
  'Recovers from mistakes without becoming upset',
  'Shares opinions and ideas in class',
  'Believes they can improve with effort',
  'Smiles and engages with peers',
  'Accepts feedback constructively',
  'Volunteers for tasks or roles',
  'Stands up for themselves in a calm way',
  'Talks about things they are good at',
  'Believes adults like them',
  'Believes peers like them',
  'Asks for help when they need it',
]);

const secondaryControl = mk('s-ctrl', 'control', 'secondary', [
  'Challenges staff authority openly',
  'Argues over school rules they disagree with',
  'Tries to dictate group dynamics with peers',
  'Refuses reasonable requests on principle',
  'Uses sarcasm or humour to undermine staff',
  'Becomes confrontational when given direct instructions',
  'Picks battles over small details',
  'Walks out of lessons when not given a choice',
  'Refuses to wear uniform correctly as a stand',
  'Uses phone or possessions to defy rules',
  'Tries to control conversations with adults',
  'Resists structured tasks but engages with self-directed ones',
  'Pushes back when an adult appears uncertain',
  'Refuses to back down even when wrong',
  'Sets up situations where staff have to choose battles',
]);

const secondaryAttention = mk('s-att', 'attention', 'secondary', [
  'Performs for peers (jokes, mimicry, dramatic stories)',
  'Posts or talks about themselves frequently online',
  'Seeks reassurance from staff repeatedly',
  'Disrupts lessons in ways that gain peer laughter',
  'Reports problems to multiple adults to gain time',
  'Behaves notably differently in front of an audience',
  'Engages in risky behaviour when peers are watching',
  'Becomes withdrawn if attention shifts to someone else',
  'Uses appearance, clothing or accessories to stand out',
  'Gravitates toward whichever adult will engage with them',
  'Becomes louder, faster or more dramatic when noticed',
  'Initiates conflict to become the centre of a situation',
  'Tells stories that put themselves at the centre',
  'Looks for an audience before saying something rude',
  "Becomes upset when an adult says they're busy",
]);

const secondaryEscape = mk('s-esc', 'escape', 'secondary', [
  'Truants from specific lessons',
  'Becomes ill on days with non-preferred lessons',
  'Refuses to enter the classroom',
  'Spends excessive time in the toilet or corridors',
  'Says "I don\'t care" when work feels too hard',
  'Disengages by putting head down or hood up',
  'Refuses to write or produce work',
  'Engages in behaviour that gets them sent out of class',
  'Avoids social situations they find uncomfortable',
  'Self-removes to a "safe" adult or space',
  'Becomes argumentative when challenged academically',
  'Refuses to attend particular subjects',
  'Pretends not to hear instructions',
  'Falls asleep or shuts down during lessons',
  'Becomes verbally aggressive to be removed from the room',
]);

const secondarySensory = mk('s-sen', 'sensory', 'secondary', [
  'Fidgets constantly during lessons',
  'Chews pen lids, hoodie strings, sleeves or nails',
  'Wears headphones to manage classroom noise',
  'Becomes overwhelmed in busy corridors or assemblies',
  'Avoids the dining hall or eats in a quiet space',
  'Seeks rough physical contact (play-fighting, leaning, pushing)',
  'Struggles to sit still for long periods',
  'Reacts strongly to perfumes, deodorants or food smells',
  'Avoids practical lessons involving messy materials',
  'Crashes into people or objects "by accident"',
  'Strong preferences/aversions about clothing fabrics',
  'Taps, drums or makes repetitive movements',
  'Becomes more dysregulated as the day goes on',
  'Seeks spinning, swinging or fast movement',
  'Reports that lights, sounds or smells are "too much"',
]);

const secondarySelfEsteem = mk('s-se', 'self-esteem', 'secondary', [
  'Speaks about themselves with realistic confidence',
  'Engages willingly with new challenges',
  'Accepts praise without deflection',
  'Sets goals for themselves',
  'Recovers from setbacks within a reasonable time',
  'Contributes to class discussions',
  'Believes effort leads to improvement',
  'Maintains friendships in a balanced way',
  'Accepts constructive feedback',
  'Takes on responsibilities or leadership roles',
  'Asserts themselves calmly when needed',
  'Identifies their own strengths',
  'Believes staff treat them fairly',
  'Trusts that peers value their company',
  'Asks for help when they need it without embarrassment',
]);

export let behaviourStatements: BehaviourStatement[] = [
  ...primaryControl, ...primaryAttention, ...primaryEscape, ...primarySensory, ...primarySelfEsteem,
  ...secondaryControl, ...secondaryAttention, ...secondaryEscape, ...secondarySensory, ...secondarySelfEsteem,
];

const mkStrat = (prefix: string, fn: BehaviourFunction, texts: string[]): BehaviourStrategy[] =>
  texts.map((text, i) => ({ id: `${prefix}-${i}`, function: fn, text, source: SOURCE }));

export let behaviourStrategies: BehaviourStrategy[] = [
  ...mkStrat('str-ctrl', 'control', [
    'Offer structured choices ("Would you like to do task A or task B first?") to give a sense of control within boundaries.',
    'Use a visual schedule so the child can predict and "own" the order of activities.',
    'Hand control of small classroom jobs to the child (handing out books, leading the line) at planned moments.',
    'Avoid public power struggles — give the instruction once, then step away to allow processing time.',
    'Use "when… then…" language rather than "if… then…" to keep the message firm but neutral.',
    'Plan transitions in advance with a 5-minute, 2-minute, 1-minute warning.',
    'Co-create class rules with the child so they have ownership of the boundaries.',
    'Use a private signal/word for redirection rather than a public verbal correction.',
    'Acknowledge their wish for control: "I can see you really want to choose. Here are two things you can choose between."',
    'Repair the relationship after a power struggle — name the rupture, then move on warmly.',
  ]),
  ...mkStrat('str-att', 'attention', [
    "Plan regular, predictable 1:1 attention so it doesn't need to be earned through behaviour.",
    'Catch the child being good — name the desired behaviour out loud immediately.',
    'Use "tactical ignoring" of low-level attention-seeking, paired with quick positive attention for on-task moments.',
    'Give the child a meaningful role (register monitor, technology helper) that gives them positive visibility.',
    'Use a "check-in / check-out" routine at the start and end of each day.',
    'Praise effort and process privately as well as publicly to reduce the audience effect.',
    'Teach the child a non-disruptive way to ask for adult attention (a card, a signal).',
    'Avoid lengthy verbal reprimands — these can themselves reinforce attention-seeking.',
    'Notice and praise quiet positive behaviour from peers nearby to model what earns attention.',
    'Build a positive relationship outside of behaviour incidents — chat about interests, share a joke.',
  ]),
  ...mkStrat('str-esc', 'escape', [
    'Break tasks into small, achievable chunks with clear "I can do this" entry points.',
    'Pre-teach difficult content so the child enters the lesson already familiar with it.',
    'Offer a "first / then" board to make the start point and reward visible.',
    'Provide a planned, sanctioned escape route (a movement break, an errand) to use before crisis point.',
    'Use a visual or written timer so the child can see the end is approaching.',
    'Reduce written demands — accept verbal answers, scribed answers, or short-form responses.',
    'Sit the child near a trusted peer who can quietly model the start of a task.',
    'Use low-key re-engagement: a quiet question or a co-regulation moment rather than a demand.',
    'Identify and address the triggering content (literacy demand, social demand, sensory load).',
    'Make returning to class easy — do not require an apology or lengthy conversation before re-entry.',
  ]),
  ...mkStrat('str-sen', 'sensory', [
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
  ...mkStrat('str-se', 'self-esteem', [
    'Give specific, accurate praise that names what the child did well — avoid generic "good job".',
    "Display the child's work in classroom or shared spaces.",
    'Set up small "expert" roles where the child teaches a peer something they can do.',
    'Catch and reframe negative self-talk ("I can\'t do this") into "I can\'t do this YET".',
    'Build in regular small wins through achievable, scaffolded tasks.',
    'Use a strengths-based conversation routine ("Tell me one thing that went well today").',
    'Make repair after rupture explicit — show the child the relationship is intact after a difficult moment.',
    'Involve the child in setting their own goals so success is visible to them.',
    "Highlight progress over time using their own past work as the comparison, not peers'.",
    'Connect the child with a trusted adult mentor for regular check-ins.',
  ]),
];

export const getStatementsForFunctionAndCohort = (fn: BehaviourFunction, cohort: Cohort) =>
  behaviourStatements.filter(s => s.function === fn && s.cohort === cohort);

export const getStatementsForCohort = (cohort: Cohort) =>
  behaviourStatements.filter(s => s.cohort === cohort);

export const getStrategiesForFunction = (fn: BehaviourFunction) =>
  behaviourStrategies.filter(s => s.function === fn);

export const FREQUENCY_OPTIONS: { value: number; label: string }[] = [
  { value: 4, label: 'Very Often' },
  { value: 3, label: 'Often' },
  { value: 2, label: 'Occasionally' },
  { value: 1, label: 'Infrequently' },
  { value: 0, label: 'Never' },
];

export type ResponseMap = Record<string, number>;
export type ScoreMap = Record<BehaviourFunction, number>;

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

// --- Runtime overrides / additions ---
const _defaultFunctions = [...behaviourFunctions];
const _defaultStatements = [...behaviourStatements];
const _defaultStrategies = [...behaviourStrategies];

export interface BehaviourPublishedPatch {
  overrides: Array<{ item_type: string; item_id: string; field: string; value: string | null; hidden: boolean }>;
  additions: Array<{ id: string; item_type: string; parent_id: string; payload: Record<string, any>; hidden: boolean }>;
}

export function applyBehaviourPublishedContent(patch: BehaviourPublishedPatch) {
  const overrideMap = new Map<string, { value: string | null; hidden: boolean }>();
  const hiddenIds = new Set<string>();
  for (const o of patch.overrides) {
    overrideMap.set(`${o.item_type}|${o.item_id}|${o.field}`, { value: o.value, hidden: o.hidden });
    if (o.field === '__hidden__' && o.hidden) hiddenIds.add(`${o.item_type}|${o.item_id}`);
  }
  const ov = (type: string, id: string, field: string, def: string) =>
    overrideMap.get(`${type}|${id}|${field}`)?.value ?? def;

  behaviourFunctions = _defaultFunctions.map(f => ({
    ...f,
    label: ov('function', f.id, 'label', f.label),
    description: ov('function', f.id, 'description', f.description),
  }));

  const baseStmts = _defaultStatements
    .filter(s => !hiddenIds.has(`question|${s.id}`))
    .map(s => ({
      ...s,
      text: ov('question', s.id, 'text', s.text),
      source: ov('question', s.id, 'source', (s as any).source ?? '') || undefined,
    }));
  const addedStmts: BehaviourStatement[] = patch.additions
    .filter(a => a.item_type === 'question' && !a.hidden)
    .map(a => {
      const [fn, cohort] = a.parent_id.split(':') as [BehaviourFunction, Cohort];
      return { id: `add-${a.id}`, function: fn, cohort, text: a.payload.text ?? '', source: a.payload.source };
    });
  behaviourStatements = [...baseStmts, ...addedStmts];

  const baseStrats = _defaultStrategies
    .filter(s => !hiddenIds.has(`strategy|${s.id}`))
    .map(s => ({
      ...s,
      text: ov('strategy', s.id, 'text', s.text),
      source: ov('strategy', s.id, 'source', s.source ?? '') || undefined,
    }));
  const addedStrats: BehaviourStrategy[] = patch.additions
    .filter(a => a.item_type === 'strategy' && !a.hidden)
    .map(a => ({ id: `add-${a.id}`, function: a.parent_id as BehaviourFunction, text: a.payload.text ?? '', source: a.payload.source }));
  behaviourStrategies = [...baseStrats, ...addedStrats];
}
