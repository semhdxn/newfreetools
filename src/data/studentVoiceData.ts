// Student Voice Tool — adapted from semhtools.co.uk/StudentVoiceTool
// 5-point Likert scale (Never=0, Sometimes=2, Don't know=3, Often=4, Very Often=5).
// Each statement maps to a Category (one of Attention/Control/Sensory/Escape) and
// optionally a Type (Belonging / Self-esteem / Emotional Wellbeing) used for composite scores.

export type StudentVoiceCategory = 'attention' | 'control' | 'sensory' | 'escape';
export type StudentVoiceType = 'belonging' | 'self-esteem' | 'emotional-wellbeing';

export interface StudentVoiceStatement {
  id: string;
  text: string;
  followUp: string;
  category: StudentVoiceCategory;
  type?: StudentVoiceType;
}

export interface StudentVoicePickerItem {
  id: string;
  text: string;
}

export const FREQUENCY_OPTIONS: { value: number; label: string; tone: 1 | 2 | 3 | 4 | 5 }[] = [
  { value: 0, label: 'Never', tone: 1 },
  { value: 2, label: 'Sometimes', tone: 2 },
  { value: 3, label: "Don't know", tone: 3 },
  { value: 4, label: 'Often', tone: 4 },
  { value: 5, label: 'Very Often', tone: 5 },
];

export const NOTABLE_THRESHOLD = 4; // Often or Very Often

export interface StudentVoiceCategoryDef {
  id: StudentVoiceCategory;
  label: string;
  description: string;
}

export const studentVoiceCategories: StudentVoiceCategoryDef[] = [
  { id: 'attention', label: 'Attention', description: 'Statements about wanting connection, attention or belonging.' },
  { id: 'control',   label: 'Control',   description: 'Statements about needing predictability, fairness or autonomy.' },
  { id: 'sensory',   label: 'Sensory',   description: 'Statements about sensory experiences, worry and how the body feels.' },
  { id: 'escape',    label: 'Escape',    description: 'Statements about wanting to avoid or escape something difficult.' },
];

export const studentVoiceStatements: StudentVoiceStatement[] = [
  {
    "id": "unfair",
    "text": "I feel treated unfairly.",
    "followUp": "Do you feel unfairly treated by anyone at any other time? ",
    "category": "control"
  },
  {
    "id": "kidslikeme",
    "text": "I want to be liked by other children",
    "followUp": "How do you know they do not like you? Which ones do like you? Are there any in particular you would like to get to know more?",
    "category": "attention",
    "type": "belonging"
  },
  {
    "id": "shouted",
    "text": "I don't like to be shouted at",
    "followUp": "When did this happen last? Is it just shouting or other loud noises?",
    "category": "escape"
  },
  {
    "id": "stupid",
    "text": "I don't like feeling or looking stupid",
    "followUp": "When do you feel like this? Where?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "notice",
    "text": "I like to be noticed by others",
    "followUp": "What do you like about being noticed?",
    "category": "attention",
    "type": "belonging"
  },
  {
    "id": "help",
    "text": "I don't always get help when I ask for it",
    "followUp": "How do you tell people you want help? What kind of help do you need?",
    "category": "attention"
  },
  {
    "id": "routine",
    "text": "I don't like it when my routine changes",
    "followUp": "How does it feel when things change unexpectedly? Who can you tell about this?",
    "category": "control"
  },
  {
    "id": "dontknow",
    "text": "I don't know what I am expected to do",
    "followUp": "When do you most feel like this?",
    "category": "escape"
  },
  {
    "id": "worrywork",
    "text": "I worry about the work I do in school",
    "followUp": "Have you spoken to your teachers? Shall we write down the worries and see what we can sort out together?",
    "category": "escape"
  },
  {
    "id": "fool",
    "text": "I worry about making a fool of myself in front of others",
    "followUp": "Has this ever happened? Do you notice others much in class? Do people around you tend to make mistakes? Do you remember their mistakes?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "bored",
    "text": "I am bored",
    "followUp": "When are you least bored? How would a teacher know you are bored...what do you do?",
    "category": "escape"
  },
  {
    "id": "windupfriends",
    "text": "I like winding up friends/teachers",
    "followUp": "What do your friends do? What do you like about that?",
    "category": "attention"
  },
  {
    "id": "listentome",
    "text": "I like to be listened to by adults",
    "followUp": "Do you get to talk to adults much? Would you like more time to talk to adults you trust?",
    "category": "attention"
  },
  {
    "id": "smallchild",
    "text": "I don't like when I feel I am treated like a small child",
    "followUp": "Are you treated like small child? When? Do you think those who treat you this way know they are doing it?",
    "category": "control",
    "type": "self-esteem"
  },
  {
    "id": "toofull",
    "text": "My head feels very full",
    "followUp": "Shall we sketch out whats in your head? We can seperate the sections out on this head diagram and the bigger the section, the more you think about it. If you don’t want to say what the section is, just shade it in.",
    "category": "sensory",
    "type": "emotional-wellbeing"
  },
  {
    "id": "space",
    "text": "I like to have my own space with my own things",
    "followUp": "Do you feel you have that at school/home? Could we help to create that?",
    "category": "control"
  },
  {
    "id": "changestaff",
    "text": "I don't like having new adults in school or changes to staff",
    "followUp": "Do you have favourite staff? Do they know they are your favourites?",
    "category": "control"
  },
  {
    "id": "stomach",
    "text": "I feel funny in my stomach when something is wrong",
    "followUp": "When did you last feel this way?",
    "category": "sensory",
    "type": "emotional-wellbeing"
  },
  {
    "id": "mistake",
    "text": "I worry about making mistakes",
    "followUp": "How often do you mistakes? Do you think mistakes are normal? What do you fear might happen if you make a mistake?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "worryfamily",
    "text": "I worry about my family / friends",
    "followUp": "What do you worry specifically about? When do you most feel like this?",
    "category": "sensory",
    "type": "emotional-wellbeing"
  },
  {
    "id": "seemecry",
    "text": "I don't like crying in front of others",
    "followUp": "Do you worry about crying? Have you cried recently?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "incontrol",
    "text": "I like it when I am in control",
    "followUp": "When do you feel most in control? What do you like about that?",
    "category": "control"
  },
  {
    "id": "whattodo",
    "text": "I don't like being told what to do",
    "followUp": "Are there times when you do do as you are told easily? Who for? When?",
    "category": "control"
  },
  {
    "id": "bullied",
    "text": "I feel bullied and have not told anyone",
    "followUp": "Have you told your teachers / responsible adult?",
    "category": "escape",
    "type": "emotional-wellbeing"
  },
  {
    "id": "different",
    "text": "I don't like to feel or look different from others",
    "followUp": "When do you feel most different? Is your difference a good thing to you/others? How do you think others differ from other people? Is that positive/negative?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "angry",
    "text": "I feel angry",
    "followUp": "What last made you angry? What was the first thing you noticed that made you uncomfortable? How often do you find this thing makes feel that way?",
    "category": "sensory"
  },
  {
    "id": "hungry",
    "text": "I feel hungry",
    "followUp": "How often are you eating? What is your breakfast made up of normally?",
    "category": "sensory"
  },
  {
    "id": "checking",
    "text": "I keep checking my work",
    "followUp": "In what areas do you find yourself checking? In or out of school? ",
    "category": "control",
    "type": "emotional-wellbeing"
  },
  {
    "id": "future",
    "text": "I worry about the future",
    "followUp": "Do you feel you know what will happen? How sure are you? How much control do you have? ",
    "category": "control",
    "type": "emotional-wellbeing"
  },
  {
    "id": "concentrate",
    "text": "I find it really hard to concentrate",
    "followUp": "What do you find distracting?",
    "category": "sensory"
  },
  {
    "id": "noisy",
    "text": "I find it hard when it is noisy",
    "followUp": "What noises bother you the most?",
    "category": "sensory"
  },
  {
    "id": "homeorout",
    "text": "I like leaving lessons or going home",
    "followUp": "What might help make it easier for you to be in the classroom?",
    "category": "escape"
  },
  {
    "id": "praisepublic",
    "text": "I find it hard when I am praised in front of others",
    "followUp": "Where is the best place to give you praise? When?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "embarrased",
    "text": "I feel embarrassed",
    "followUp": "When do you feel like this? Where?",
    "category": "escape",
    "type": "self-esteem"
  },
  {
    "id": "mornings",
    "text": "I feel nervous or afraid before school",
    "followUp": "Do you know what you fear? Are some days better than others?",
    "category": "sensory",
    "type": "emotional-wellbeing"
  }
];

export const studentVoiceEnvironmentItems: StudentVoicePickerItem[] = [
  {
    "id": "env-0-chair",
    "text": "Where you sit in the class"
  },
  {
    "id": "env-1-sit",
    "text": "Who I sit near/around"
  },
  {
    "id": "env-2-noisy",
    "text": "The noise in the room"
  },
  {
    "id": "env-3-timeout",
    "text": "Being able to leave the room"
  },
  {
    "id": "env-4-readaloud",
    "text": "Not having to read in front of others"
  },
  {
    "id": "env-5-friends",
    "text": "Help to make friends"
  },
  {
    "id": "env-6-diffadults",
    "text": "Working with different teachers/staff"
  },
  {
    "id": "env-7-talking",
    "text": "How people talk to me"
  },
  {
    "id": "env-8-help",
    "text": "Getting more help in some lessons"
  },
  {
    "id": "env-9-quiet",
    "text": "Having a quiet space to go to"
  },
  {
    "id": "env-10-lots",
    "text": "Having my work broken up for me"
  },
  {
    "id": "env-11-repeat",
    "text": "Having things explained again"
  },
  {
    "id": "env-12-handson",
    "text": "More work that involves movement/creating things"
  },
  {
    "id": "env-13-writing",
    "text": "Less writing"
  },
  {
    "id": "env-14-break",
    "text": "Getting to have a break"
  },
  {
    "id": "env-15-snack",
    "text": "Having a snack"
  },
  {
    "id": "env-16-running",
    "text": "Being able to move around outside"
  },
  {
    "id": "env-17-key",
    "text": "Having sometime I trust to talk to"
  }
];

export const studentVoiceResponseItems: StudentVoicePickerItem[] = [
  {
    "id": "resp-0-distract",
    "text": "Change the subject or distract me"
  },
  {
    "id": "resp-1-leave",
    "text": "Let me leave the room - give me an excuse to do so"
  },
  {
    "id": "resp-2-timeout",
    "text": "Suggest I take some time outside"
  },
  {
    "id": "resp-3-strengths",
    "text": "Remind me of what I am good or or my past successes"
  },
  {
    "id": "resp-4-touch",
    "text": "Place your hand gently on the table"
  },
  {
    "id": "resp-5-rules",
    "text": "Remind me what the rules are"
  },
  {
    "id": "resp-6-choice",
    "text": "Remind me of my choices"
  },
  {
    "id": "resp-7-consequences",
    "text": "Remind me of the consequences of my actions"
  },
  {
    "id": "resp-8-firm",
    "text": "Speak to me in a firm voice"
  },
  {
    "id": "resp-9-look",
    "text": "Give me a pre-agreed look that helps me know to try to calm"
  },
  {
    "id": "resp-10-trust",
    "text": "Let me talk to my trusted adult"
  },
  {
    "id": "resp-11-breathe",
    "text": "Remind me to 'breathe'"
  },
  {
    "id": "resp-12-audience",
    "text": "Let me get away from others who are watching"
  },
  {
    "id": "resp-13-lead",
    "text": "Guide me from the room"
  },
  {
    "id": "resp-14-traffic",
    "text": "Ask me to describe my feelings using a traffic light"
  },
  {
    "id": "resp-15-smile",
    "text": "Smile at me"
  },
  {
    "id": "resp-16-laugh",
    "text": "Use humour to help me calm"
  },
  {
    "id": "resp-17-hug",
    "text": "Offer me a hug"
  },
  {
    "id": "resp-18-smileremind",
    "text": "Make me smile - remind me to do so"
  },
  {
    "id": "resp-19-phonecall",
    "text": "Remind me of a positive phone call home"
  },
  {
    "id": "resp-20-space",
    "text": "Ask if I would like some space?"
  },
  {
    "id": "resp-21-workhelp",
    "text": "Give me help with my work"
  },
  {
    "id": "resp-22-praise",
    "text": "Give me praise"
  },
  {
    "id": "resp-23-rewards",
    "text": "Remind me about my specific rewards"
  },
  {
    "id": "resp-24-time",
    "text": "Give me some time to come round"
  },
  {
    "id": "resp-25-help",
    "text": "Get my trusted adult to help me out"
  },
  {
    "id": "resp-26-talk",
    "text": "Let me have time to talk about things with you/another adult"
  },
  {
    "id": "resp-27-small",
    "text": "Help me break down the steps of what I need to do next"
  },
  {
    "id": "resp-28-praise3",
    "text": "Notice when I do better than before, especially when it is hard for me to do so"
  },
  {
    "id": "resp-29-change",
    "text": "Help me by telling me about future changes."
  }
];

export type StudentVoiceResponseMap = Record<string, number>;
export type StudentVoiceScoreMap = {
  attention: number;
  control: number;
  sensory: number;
  escape: number;
  emotional: number;
  selfEsteem: number;
};

const MAX_PER_QUESTION = 5;

/** Returns each category's % of max (0-100), plus composite emotional/self-esteem %. */
export function calculateScores(responses: StudentVoiceResponseMap): StudentVoiceScoreMap {
  const tot: Record<StudentVoiceCategory, { sum: number; count: number }> = {
    attention: { sum: 0, count: 0 },
    control:   { sum: 0, count: 0 },
    sensory:   { sum: 0, count: 0 },
    escape:    { sum: 0, count: 0 },
  };
  let emoSum = 0, emoCount = 0, selfSum = 0, selfCount = 0;
  for (const s of studentVoiceStatements) {
    const v = responses[s.id] ?? 0;
    tot[s.category].sum += v;
    tot[s.category].count += 1;
    if (s.type === 'emotional-wellbeing') { emoSum += v; emoCount += 1; }
    if (s.type === 'self-esteem') { selfSum += v; selfCount += 1; }
  }
  const pct = (sum: number, count: number) => count === 0 ? 0 : Math.round((sum / (count * MAX_PER_QUESTION)) * 100);
  return {
    attention: pct(tot.attention.sum, tot.attention.count),
    control:   pct(tot.control.sum,   tot.control.count),
    sensory:   pct(tot.sensory.sum,   tot.sensory.count),
    escape:    pct(tot.escape.sum,    tot.escape.count),
    emotional: pct(emoSum, emoCount),
    selfEsteem: pct(selfSum, selfCount),
  };
}

/** Statements scored Often (4) or Very Often (5), grouped per category. */
export function notableByCategory(responses: StudentVoiceResponseMap) {
  const out: Record<StudentVoiceCategory, StudentVoiceStatement[]> = {
    attention: [], control: [], sensory: [], escape: [],
  };
  for (const s of studentVoiceStatements) {
    const v = responses[s.id] ?? 0;
    if (v >= NOTABLE_THRESHOLD) out[s.category].push(s);
  }
  return out;
}

/** Resolve a picker-item id to its display text. Returns the id as a last
 *  resort so callers can still render *something*. */
export function lookupEnvironmentText(id: string): string {
  return studentVoiceEnvironmentItems.find(i => i.id === id)?.text ?? id;
}

export function lookupResponseText(id: string): string {
  return studentVoiceResponseItems.find(i => i.id === id)?.text ?? id;
}

/** True when the id belongs to the environment ("things in school") pool. */
export function isEnvironmentId(id: string): boolean {
  return studentVoiceEnvironmentItems.some(i => i.id === id);
}

/** True when the id belongs to the adult-response pool. */
export function isResponseId(id: string): boolean {
  return studentVoiceResponseItems.some(i => i.id === id);
}
