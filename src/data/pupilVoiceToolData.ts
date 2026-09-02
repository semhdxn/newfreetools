// Pupil Voice (Student Voice) Tool — Complete data
// Extracted from free-tools-reproduction-guide.md

export interface StudentVoiceStatement {
  id: string;
  text: string;
  followUp?: string;
  category?: string;
  type?: string;
}

export interface StudentVoicePickerItem {
  id: string;
  text: string;
}

export interface SchoolDayStage {
  id: string;
  label: string;
  hint: string;
  scene: 'home' | 'street_morning' | 'classroom_morning' | 'playground' | 'classroom_midday' | 'lunch_hall' | 'classroom_afternoon' | 'street_afternoon';
}

export interface FeelingMeta {
  id: SchoolDayFeeling;
  label: string;
  emoji: string;
  buttonClass: string;
  dotClass: string;
  cssVar: string;
}

export type SchoolDayFeeling = 'worried' | 'tricky' | 'too_loud' | 'happy' | 'safe' | 'calm';

// ============================================================================
// Main statement pool — child-facing questions/prompts
// ============================================================================

export const studentVoiceStatements: StudentVoiceStatement[] = [
  {
    id: 'readingouthload',
    text: 'I find it hard reading out loud in front of the class',
    followUp: 'Does anyone else struggle with that? Would it help to practice with a friend first?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'makemistake',
    text: 'I worry about making a mistake in front of others',
    followUp: 'When you have made a mistake, what happened?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'standupinfront',
    text: 'I don\'t like standing up in front of the class',
    followUp: 'Is it the standing or the looking or both?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'hardtoconcentrate',
    text: 'I find it hard to concentrate in lessons',
    followUp: 'When do you find it easiest to concentrate? What helps you focus?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
  {
    id: 'toofullhead',
    text: 'My head feels very full',
    followUp: 'Can you think about what\'s in your head? Would it help to write it down?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
  {
    id: 'worryfamily',
    text: 'I worry about my family / friends',
    followUp: 'What do you worry specifically about?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
  {
    id: 'foolofmyself',
    text: 'I worry about making a fool of myself in front of others',
    followUp: 'Has this ever happened? What happened?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'bored',
    text: 'I am bored',
    followUp: 'When are you least bored? What helps you feel less bored?',
    category: 'escape',
  },
  {
    id: 'windupfriends',
    text: 'I like winding up friends/teachers',
    followUp: 'What do your friends do when you wind them up? What do you like about that?',
    category: 'attention',
  },
  {
    id: 'listentome',
    text: 'I like to be listened to by adults',
    followUp: 'Do you get to talk to adults much? Would you like more time?',
    category: 'attention',
  },
  {
    id: 'treatedlikesmallchild',
    text: 'I don\'t like when I feel I am treated like a small child',
    followUp: 'Are you treated like a small child? When?',
    category: 'control',
    type: 'self-esteem',
  },
  {
    id: 'toofullhead2',
    text: 'My head feels very full',
    followUp: 'What\'s taking up space in your head?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
  {
    id: 'space',
    text: 'I like to have my own space with my own things',
    followUp: 'Do you feel you have that at school/home? Could we help create that?',
    category: 'control',
  },
  {
    id: 'changestaff',
    text: 'I don\'t like having new adults in school or changes to staff',
    followUp: 'Do you have favourite staff? Do they know they\'re your favourites?',
    category: 'control',
  },
  {
    id: 'funnyinthestomach',
    text: 'I feel funny in my stomach when something is wrong',
    followUp: 'When did you last feel this way?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
  {
    id: 'worryaboutmistakes',
    text: 'I worry about making mistakes',
    followUp: 'How often do you make mistakes? What do you fear might happen?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'dontlikecryinginfront',
    text: 'I don\'t like crying in front of others',
    followUp: 'Do you worry about crying? Have you cried recently?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'incontrol',
    text: 'I like it when I am in control',
    followUp: 'When do you feel most in control? What do you like about that?',
    category: 'control',
  },
  {
    id: 'dontlikebeingorderedabout',
    text: 'I don\'t like being told what to do',
    followUp: 'Are there times when you do as you\'re told easily? Who for? When?',
    category: 'control',
  },
  {
    id: 'bullied',
    text: 'I feel bullied and have not told anyone',
    followUp: 'Have you told your teachers / responsible adult?',
    category: 'escape',
    type: 'emotional-wellbeing',
  },
  {
    id: 'different',
    text: 'I don\'t like to feel or look different from others',
    followUp: 'When do you feel most different? Is that a good thing to you?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'angry',
    text: 'I feel angry',
    followUp: 'What last made you angry? What was the first thing you noticed?',
    category: 'sensory',
  },
  {
    id: 'hungry',
    text: 'I feel hungry',
    followUp: 'How often are you eating? What does your breakfast usually look like?',
    category: 'sensory',
  },
  {
    id: 'checking',
    text: 'I keep checking my work',
    followUp: 'In what areas do you find yourself checking?',
    category: 'control',
    type: 'emotional-wellbeing',
  },
  {
    id: 'future',
    text: 'I worry about the future',
    followUp: 'Do you feel you know what will happen? How sure are you?',
    category: 'control',
    type: 'emotional-wellbeing',
  },
  {
    id: 'hardnoisy',
    text: 'I find it hard when it is noisy',
    followUp: 'What noises bother you the most?',
    category: 'sensory',
  },
  {
    id: 'leavelesons',
    text: 'I like leaving lessons or going home',
    followUp: 'What might help make it easier for you to be in the classroom?',
    category: 'escape',
  },
  {
    id: 'praisepublic',
    text: 'I find it hard when I am praised in front of others',
    followUp: 'Where is the best place to give you praise? When?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'embarrassed',
    text: 'I feel embarrassed',
    followUp: 'When do you feel like this? Where?',
    category: 'escape',
    type: 'self-esteem',
  },
  {
    id: 'nervousbeforeschool',
    text: 'I feel nervous or afraid before school',
    followUp: 'Do you know what you fear? Are some days better than others?',
    category: 'sensory',
    type: 'emotional-wellbeing',
  },
];

// ============================================================================
// Environment items — "What in school might help me?"
// ============================================================================

export const studentVoiceEnvironmentItems: StudentVoicePickerItem[] = [
  { id: 'env-0-chair', text: 'Where you sit in the class' },
  { id: 'env-1-sit', text: 'Who I sit near/around' },
  { id: 'env-2-noisy', text: 'The noise in the room' },
  { id: 'env-3-timeout', text: 'Being able to leave the room' },
  { id: 'env-4-readaloud', text: 'Not having to read in front of others' },
  { id: 'env-5-friends', text: 'Help to make friends' },
  { id: 'env-6-diffadults', text: 'Working with different teachers/staff' },
  { id: 'env-7-talking', text: 'How people talk to me' },
  { id: 'env-8-help', text: 'Getting more help in some lessons' },
  { id: 'env-9-quiet', text: 'Having a quiet space to go to' },
  { id: 'env-10-lots', text: 'Having lots of choices in what I do' },
  { id: 'env-11-alone', text: 'Time on my own if I need it' },
  { id: 'env-12-move', text: 'Being able to move around more' },
  { id: 'env-13-comfort', text: 'Things that help me feel comfortable (fidgets, cushions)' },
  { id: 'env-14-break', text: 'Regular breaks during lessons' },
];

// ============================================================================
// Response items — "How do adults respond to me?"
// ============================================================================

export const studentVoiceResponseItems: StudentVoicePickerItem[] = [
  { id: 'resp-0-listen', text: 'Adults listen to me' },
  { id: 'resp-1-fair', text: 'Adults are fair to me' },
  { id: 'resp-2-kindness', text: 'Adults are kind when I am upset' },
  { id: 'resp-3-help', text: 'Adults help me when I\'m stuck' },
  { id: 'resp-4-patience', text: 'Adults are patient with me' },
  { id: 'resp-5-proud', text: 'Adults notice when I do something good' },
  { id: 'resp-6-understanding', text: 'Adults understand how I feel' },
  { id: 'resp-7-safe', text: 'Adults keep me safe' },
  { id: 'resp-8-respected', text: 'Adults respect me' },
  { id: 'resp-9-quiet', text: 'Adults speak to me quietly when I\'m upset' },
];

// ============================================================================
// School day stages — for "My School Day" timeline feature
// ============================================================================

export const SCHOOL_DAY_STAGES: SchoolDayStage[] = [
  { id: 'before_school', label: 'Before school', hint: 'Waking up, getting ready at home.', scene: 'home' },
  { id: 'on_the_way', label: 'On the way', hint: 'Travelling to school.', scene: 'street_morning' },
  { id: 'first_lesson', label: 'First lesson', hint: 'Settling in for the first lesson.', scene: 'classroom_morning' },
  { id: 'break', label: 'Break', hint: 'Out at break time.', scene: 'playground' },
  { id: 'after_break', label: 'Lessons after break', hint: 'Back inside for more lessons.', scene: 'classroom_midday' },
  { id: 'lunch', label: 'Lunch', hint: 'Lunchtime.', scene: 'lunch_hall' },
  { id: 'last_lessons', label: 'Last lessons', hint: 'The afternoon lessons.', scene: 'classroom_afternoon' },
  { id: 'travelling_home', label: 'Travelling home', hint: 'Heading home at the end of the day.', scene: 'street_afternoon' },
];

// ============================================================================
// School day feelings — emotional check-in for each stage
// ============================================================================

export const SCHOOL_DAY_FEELINGS: FeelingMeta[] = [
  {
    id: 'worried',
    label: 'Worried',
    emoji: '😟',
    buttonClass: 'bg-freq-2 text-freq-2-foreground hover:bg-freq-2/90 border-freq-2',
    dotClass: 'bg-freq-2',
    cssVar: 'hsl(var(--freq-2))',
  },
  {
    id: 'tricky',
    label: 'Tricky',
    emoji: '😣',
    buttonClass: 'bg-freq-1 text-freq-1-foreground hover:bg-freq-1/90 border-freq-1',
    dotClass: 'bg-freq-1',
    cssVar: 'hsl(var(--freq-1))',
  },
  {
    id: 'too_loud',
    label: 'Too Loud',
    emoji: '🔊',
    buttonClass: 'bg-accent text-accent-foreground hover:bg-accent/90 border-accent',
    dotClass: 'bg-accent',
    cssVar: 'hsl(var(--accent))',
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😄',
    buttonClass: 'bg-freq-5 text-freq-5-foreground hover:bg-freq-5/90 border-freq-5',
    dotClass: 'bg-freq-5',
    cssVar: 'hsl(var(--freq-5))',
  },
  {
    id: 'safe',
    label: 'Safe',
    emoji: '🙂',
    buttonClass: 'bg-freq-4 text-freq-4-foreground hover:bg-freq-4/90 border-freq-4',
    dotClass: 'bg-freq-4',
    cssVar: 'hsl(var(--freq-4))',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    buttonClass: 'bg-calm text-calm-foreground hover:bg-calm/90 border-calm',
    dotClass: 'bg-calm',
    cssVar: 'hsl(var(--calm))',
  },
];

// ============================================================================
// Scene palette — colours for each school day stage
// ============================================================================

export const SCENE_PALETTE: Record<SchoolDayStage['scene'], { sky: string; ground: string; accent: string }> = {
  home: { sky: '#f8d6c2', ground: '#cfa17a', accent: '#9a6f4f' },
  street_morning: { sky: '#cde4f5', ground: '#a8a8a8', accent: '#7a7a7a' },
  classroom_morning: { sky: '#fde9b8', ground: '#caa97a', accent: '#a37b4f' },
  playground: { sky: '#9fd2f3', ground: '#a3c98a', accent: '#6f8d4f' },
  classroom_midday: { sky: '#ffe188', ground: '#caa97a', accent: '#a37b4f' },
  lunch_hall: { sky: '#ffd9b5', ground: '#bfa17a', accent: '#8a6a45' },
  classroom_afternoon: { sky: '#ffc187', ground: '#caa97a', accent: '#8a5f33' },
  street_afternoon: { sky: '#f3a37a', ground: '#9a8a7a', accent: '#5e4a36' },
};

export const SCHOOL_DAY_TOTAL_MS = 60_000;

export type SchoolDayFeelingsMap = Partial<Record<string, SchoolDayFeeling[]>>;

export const emptySchoolDayFeelings = (): SchoolDayFeelingsMap => {
  const out: SchoolDayFeelingsMap = {};
  for (const s of SCHOOL_DAY_STAGES) out[s.id] = [];
  return out;
};

// ============================================================================
// Helper functions
// ============================================================================

export function lookupStatementText(id: string): string {
  return studentVoiceStatements.find(s => s.id === id)?.text ?? id;
}

export function lookupEnvironmentText(id: string): string {
  return studentVoiceEnvironmentItems.find(i => i.id === id)?.text ?? id;
}

export function lookupResponseText(id: string): string {
  return studentVoiceResponseItems.find(i => i.id === id)?.text ?? id;
}

export function isEnvironmentId(id: string): boolean {
  return studentVoiceEnvironmentItems.some(i => i.id === id);
}

export function isResponseId(id: string): boolean {
  return studentVoiceResponseItems.some(i => i.id === id);
}

export function lookupSchoolDayStage(id: string): SchoolDayStage | undefined {
  return SCHOOL_DAY_STAGES.find(s => s.id === id);
}

export function lookupFeeling(id: string): FeelingMeta | undefined {
  return SCHOOL_DAY_FEELINGS.find(f => f.id === id);
}
