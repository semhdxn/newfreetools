// Home Behaviour Questionnaire — adapted from parents.semh.co.uk
// 45 questions across 9 categories on a 5-point Likert scale
// (Very Often = 5, Often = 4, Occasionally = 3, Infrequently = 2, Never = 1)

export type HomeBehaviourCategoryId =
  | 'emo' | 'mh' | 'selfe' | 'phy' | 'worry'
  | 'sen' | 'learn' | 'mood' | 'soc';

export interface HomeBehaviourQuestion {
  id: string;
  categoryId: HomeBehaviourCategoryId;
  text: string;
  source?: string;
}

export interface HomeBehaviourCategory {
  id: HomeBehaviourCategoryId;
  label: string;
  description: string;
  advice: string;
  webLinks: { label: string; url: string }[];
  productIds: string[]; // affiliate product ids
  /** Custom strategy bullets added by admins via Content Review. Empty by default. */
  customStrategies?: { id: string; text: string; source?: string }[];
}

export const FREQUENCY_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: 'Very Often' },
  { value: 4, label: 'Often' },
  { value: 3, label: 'Occasionally' },
  { value: 2, label: 'Infrequently' },
  { value: 1, label: 'Never' },
];

export let homeBehaviourCategories: HomeBehaviourCategory[] = [
  {
    id: 'emo',
    label: 'Emotional Wellbeing',
    description: 'How well your child recognises and regulates their feelings.',
    advice:
      "Anger, upset and difficulty naming feelings are common in all children at certain times. Some children — based on opportunity and experience — have a stronger understanding of their own emotional escalation and how to relax themselves; others need more support. Tools like the 5-Point Scale or 'My Hidden Chimp' are great ways to start these conversations.",
    webLinks: [
      { label: '5 Ways to Wellbeing (NHS)', url: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/' },
    ],
    productIds: ['hbq-emo-1', 'hbq-emo-2', 'hbq-emo-3'],
  },
  {
    id: 'mh',
    label: 'Mental Health (other)',
    description: 'Other mental-health indicators including mood swings, panic and unusual experiences.',
    advice:
      "Mood swings, phobias, panic and other intense experiences can have many causes. If they persist or feel overwhelming, talk with your GP — early conversations make later support easier. Keeping a short diary of triggers and frequency is a useful starting point.",
    webLinks: [
      { label: 'CAMHS guide (Young Minds)', url: 'https://youngminds.org.uk/find-help/your-guide-to-support/guide-to-camhs/' },
    ],
    productIds: ['hbq-mh-1'],
  },
  {
    id: 'selfe',
    label: 'Self Esteem',
    description: "Your child's confidence in their own abilities and identity.",
    advice:
      "Try to praise the effort and outcome rather than the child directly ('that was a brilliant try' rather than 'you're so clever'). Constructive feedback, modelling failure openly, and mapping small achievements all help build durable self-esteem over time.",
    webLinks: [
      { label: 'Young Minds — Self Esteem', url: 'https://youngminds.org.uk/find-help/for-parents/parents-guide-to-support-a-z/parents-guide-to-support-self-esteem/' },
    ],
    productIds: ['hbq-selfe-1', 'hbq-selfe-2', 'hbq-selfe-3'],
  },
  {
    id: 'phy',
    label: 'Physical Health',
    description: 'Sleep, exercise, eating and general wellness.',
    advice:
      "Sleep, regular movement and balanced eating underpin almost every other area of wellbeing. Establish predictable wind-down routines, screen-free time before bed, daily outdoor time, and a relaxed approach to breakfast (cold or 'unusual' breakfast options are fine).",
    webLinks: [
      { label: 'Sleep hygiene (NHS)', url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/how-to-get-to-sleep/' },
      { label: 'NHS exercise advice', url: 'https://www.nhs.uk/live-well/exercise/' },
      { label: 'Healthy breakfasts (NHS)', url: 'https://www.nhs.uk/live-well/eat-well/healthy-breakfasts-recipes/' },
    ],
    productIds: ['hbq-phy-1', 'hbq-phy-2', 'hbq-phy-3'],
  },
  {
    id: 'worry',
    label: 'Worry',
    description: 'How often your child feels anxious, perfectionist or seeks reassurance.',
    advice:
      "Some worry is normal and even helpful. It becomes a problem when it stops a child from doing things they want to do. Validate the feeling first ('I can see this feels really big'), then problem-solve together. Watch for repeated reassurance-seeking — answering it endlessly can reinforce the worry.",
    webLinks: [
      { label: 'CAMHS guide (Young Minds)', url: 'https://youngminds.org.uk/find-help/your-guide-to-support/guide-to-camhs/' },
    ],
    productIds: ['hbq-worry-1', 'hbq-worry-2', 'hbq-worry-3'],
  },
  {
    id: 'sen',
    label: 'Sensory',
    description: 'How your child seeks or avoids sensory input.',
    advice:
      "Children seek and avoid sensory input differently. Keep a short list of the textures, smells, sounds and movements your child avoids or seeks — patterns will emerge. Consider also running the Sensory Suggester for a fuller, area-by-area picture.",
    webLinks: [
      { label: 'About Sensory Processing (Understood.org)', url: 'https://www.understood.org/pages/en/learning-thinking-differences/child-learning-disabilities/sensory-processing-issues/' },
    ],
    productIds: ['hbq-sen-1', 'hbq-sen-2', 'hbq-sen-3'],
  },
  {
    id: 'learn',
    label: 'Learning Skills',
    description: 'Concentration, organisation and following instructions.',
    advice:
      "Difficulty organising, concentrating or following instructions can have many causes. Try chunking tasks into 1–3 step instructions, give a visual checklist, and allow short fidgets/movement breaks. Speak to school early if it's a sustained pattern.",
    webLinks: [
      { label: 'Supporting learning at home (BBC Bitesize)', url: 'https://www.bbc.co.uk/bitesize/articles/zj6yt39' },
    ],
    productIds: ['hbq-learn-1', 'hbq-learn-2', 'hbq-learn-3'],
  },
  {
    id: 'mood',
    label: 'Low Mood',
    description: 'Indicators of low mood, withdrawal or loss of interest.',
    advice:
      "Motivation varies week-to-week and even hour-to-hour for everyone. Sustained low mood, withdrawal or loss of interest in things they used to enjoy is worth talking to your GP about. Keep doors to conversation open without pressure.",
    webLinks: [
      { label: 'CAMHS guide (Young Minds)', url: 'https://youngminds.org.uk/find-help/your-guide-to-support/guide-to-camhs/' },
    ],
    productIds: ['hbq-mood-1', 'hbq-mood-2', 'hbq-mood-3'],
  },
  {
    id: 'soc',
    label: 'Social Skills',
    description: 'Friendships, social cues and group interaction.',
    advice:
      "Social skills are learned, practised and refined throughout childhood. Social Stories™ and short, structured play with one peer at a time can help. If your child prefers adults or struggles with groups, that's information rather than a problem — work with school to build small successes.",
    webLinks: [
      { label: 'Nurture (NurtureUK)', url: 'https://www.nurtureuk.org/nurture/what-nurture-group' },
    ],
    productIds: ['hbq-soc-1', 'hbq-soc-2'],
  },
];

export let homeBehaviourQuestions: HomeBehaviourQuestion[] = [
  { id: 'emo-1', categoryId: 'emo', text: "finds it difficult to regulate (calm) self" },
  { id: 'emo-2', categoryId: 'emo', text: "can become angry quickly" },
  { id: 'mh-1', categoryId: 'mh', text: "hears voices" },
  { id: 'selfe-1', categoryId: 'selfe', text: "has an extreme response to criticism" },
  { id: 'phy-1', categoryId: 'phy', text: "has poor sleep habits" },
  { id: 'mh-2', categoryId: 'mh', text: "demonstrates extreme reactions to loud or unpredictable noise" },
  { id: 'emo-3', categoryId: 'emo', text: "struggles to identify own emotions" },
  { id: 'phy-2', categoryId: 'phy', text: "under or over exercises" },
  { id: 'worry-1', categoryId: 'worry', text: "worries about what their friends think" },
  { id: 'phy-3', categoryId: 'phy', text: "has poor eating habits" },
  { id: 'sen-1', categoryId: 'sen', text: "seeks or avoids certain smells" },
  { id: 'sen-2', categoryId: 'sen', text: "seeks or avoids certain textures, sensations or clothing" },
  { id: 'sen-3', categoryId: 'sen', text: "likes deep pressure (hugs / tight clothing / massage)" },
  { id: 'sen-4', categoryId: 'sen', text: "finds it hard to stay still" },
  { id: 'sen-5', categoryId: 'sen', text: "appears clumsy" },
  { id: 'learn-1', categoryId: 'learn', text: "finds organising themselves difficult" },
  { id: 'selfe-2', categoryId: 'selfe', text: "demonstrates low confidence in their own abilities" },
  { id: 'mh-3', categoryId: 'mh', text: "is variable in mood — extreme highs and lows" },
  { id: 'mood-1', categoryId: 'mood', text: "feels demotivated" },
  { id: 'mh-4', categoryId: 'mh', text: "experiences nightmares" },
  { id: 'mh-5', categoryId: 'mh', text: "can panic in crowds or other specific situations" },
  { id: 'selfe-3', categoryId: 'selfe', text: "struggles to accept failure or disappointment" },
  { id: 'worry-2', categoryId: 'worry', text: "demonstrates perfectionism" },
  { id: 'worry-3', categoryId: 'worry', text: "finds it hard to separate from you or another significant adult" },
  { id: 'soc-1', categoryId: 'soc', text: "struggles to understand social cues" },
  { id: 'phy-4', categoryId: 'phy', text: "experiences illness or fatigue" },
  { id: 'learn-2', categoryId: 'learn', text: "finds it hard to concentrate" },
  { id: 'soc-2', categoryId: 'soc', text: "finds making friends a challenge" },
  { id: 'emo-4', categoryId: 'emo', text: "finds it hard to talk about feelings" },
  { id: 'learn-3', categoryId: 'learn', text: "struggles to follow instructions given by adults" },
  { id: 'soc-3', categoryId: 'soc', text: "doesn't always accept other people's views or needs willingly" },
  { id: 'phy-5', categoryId: 'phy', text: "skips breakfast" },
  { id: 'selfe-4', categoryId: 'selfe', text: "plays down their own successes" },
  { id: 'mood-2', categoryId: 'mood', text: "becomes withdrawn" },
  { id: 'mood-3', categoryId: 'mood', text: "feels sad or tearful" },
  { id: 'mood-4', categoryId: 'mood', text: "has little interest in doing things" },
  { id: 'mood-5', categoryId: 'mood', text: "feels bad about themselves" },
  { id: 'soc-4', categoryId: 'soc', text: "prefers the company of adults" },
  { id: 'learn-4', categoryId: 'learn', text: "struggles to remember instructions" },
  { id: 'learn-5', categoryId: 'learn', text: "struggles to understand instructions" },
  { id: 'selfe-5', categoryId: 'selfe', text: "is dismissive of or irritated by praise" },
  { id: 'emo-5', categoryId: 'emo', text: "struggles to cope with day-to-day stressors" },
  { id: 'soc-5', categoryId: 'soc', text: "struggles to name friends" },
  { id: 'worry-4', categoryId: 'worry', text: "seeks reassurance" },
  { id: 'worry-5', categoryId: 'worry', text: "worries excessively about seemingly small issues or feels on edge" },
];

export type HomeBehaviourResponseMap = Record<string, number>;
export type HomeBehaviourScoreMap = Record<HomeBehaviourCategoryId, number>; // average per category 1..5

export function calculateHomeBehaviourScores(responses: HomeBehaviourResponseMap): HomeBehaviourScoreMap {
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const q of homeBehaviourQuestions) {
    const v = responses[q.id];
    if (typeof v !== 'number') continue;
    sums[q.categoryId] = sums[q.categoryId] || { sum: 0, n: 0 };
    sums[q.categoryId].sum += v;
    sums[q.categoryId].n += 1;
  }
  const scores = {} as HomeBehaviourScoreMap;
  for (const c of homeBehaviourCategories) {
    const s = sums[c.id];
    scores[c.id] = s && s.n > 0 ? Math.round((s.sum / s.n) * 10) / 10 : 0;
  }
  return scores;
}

export function getHomeBehaviourCategory(id: string): HomeBehaviourCategory | undefined {
  return homeBehaviourCategories.find(c => c.id === id);
}

export function getHomeBehaviourQuestionsByCategory(id: HomeBehaviourCategoryId): HomeBehaviourQuestion[] {
  return homeBehaviourQuestions.filter(q => q.categoryId === id);
}

// Categories with average score >= 3 ("Occasionally" and above) are surfaced as relevant.
export const RELEVANCE_THRESHOLD = 3;
