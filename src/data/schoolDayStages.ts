/**
 * Stages of the pupil's school day for the "My School Day" interactive
 * walk-through. The pupil watches a small character travel across these
 * stages and taps a feeling button (worried / tricky / safe / happy) at
 * any moment. Each tap is recorded against whatever stage is currently
 * active, so the saved data is always shaped per-stage.
 */

export type SchoolDayFeeling =
  | 'worried'
  | 'tricky'
  | 'too_loud'
  | 'happy'
  | 'safe'
  | 'calm';

export interface SchoolDayStage {
  /** Stable id used as the key in the saved map. */
  id: string;
  /** Short human label shown above the timeline. */
  label: string;
  /** Slightly longer hint shown to the pupil while this stage is active. */
  hint: string;
  /** Decorative scene tone — we tint the sky/ground for each stage. */
  scene:
    | 'home'
    | 'street_morning'
    | 'classroom_morning'
    | 'playground'
    | 'classroom_midday'
    | 'lunch_hall'
    | 'classroom_afternoon'
    | 'street_afternoon';
}

/** Eight equal-length stages. */
export const SCHOOL_DAY_STAGES: SchoolDayStage[] = [
  { id: 'before_school',   label: 'Before school',         hint: 'Waking up, getting ready at home.', scene: 'home' },
  { id: 'on_the_way',      label: 'On the way',            hint: 'Travelling to school.',             scene: 'street_morning' },
  { id: 'first_lesson',    label: 'First lesson',          hint: 'Settling in for the first lesson.', scene: 'classroom_morning' },
  { id: 'break',           label: 'Break',                 hint: 'Out at break time.',                scene: 'playground' },
  { id: 'after_break',     label: 'Lessons after break',   hint: 'Back inside for more lessons.',     scene: 'classroom_midday' },
  { id: 'lunch',           label: 'Lunch',                 hint: 'Lunchtime.',                        scene: 'lunch_hall' },
  { id: 'last_lessons',    label: 'Last lessons',          hint: 'The afternoon lessons.',            scene: 'classroom_afternoon' },
  { id: 'travelling_home', label: 'Travelling home',       hint: 'Heading home at the end of the day.', scene: 'street_afternoon' },
];

export interface FeelingMeta {
  id: SchoolDayFeeling;
  label: string;
  emoji: string;
  /** Tailwind class for the button background. Uses semantic tokens. */
  buttonClass: string;
  /** Tailwind class for the dot that lands on the timeline. */
  dotClass: string;
  /** Plain colour for SVG fills (HSL var so it adapts to the theme). */
  cssVar: string;
}

export const SCHOOL_DAY_FEELINGS: FeelingMeta[] = [
  { id: 'worried', label: 'Worried', emoji: '😟', buttonClass: 'bg-freq-2 text-freq-2-foreground hover:bg-freq-2/90 border-freq-2',  dotClass: 'bg-freq-2',  cssVar: 'hsl(var(--freq-2))'  },
  { id: 'tricky',  label: 'Tricky',  emoji: '😣', buttonClass: 'bg-freq-1 text-freq-1-foreground hover:bg-freq-1/90 border-freq-1',  dotClass: 'bg-freq-1',  cssVar: 'hsl(var(--freq-1))'  },
  { id: 'too_loud',label: 'Too Loud',emoji: '🔊', buttonClass: 'bg-accent text-accent-foreground hover:bg-accent/90 border-accent',  dotClass: 'bg-accent',  cssVar: 'hsl(var(--accent))' },
  { id: 'happy',   label: 'Happy',   emoji: '😄', buttonClass: 'bg-freq-5 text-freq-5-foreground hover:bg-freq-5/90 border-freq-5',  dotClass: 'bg-freq-5',  cssVar: 'hsl(var(--freq-5))'  },
  { id: 'safe',    label: 'Safe',    emoji: '🙂', buttonClass: 'bg-freq-4 text-freq-4-foreground hover:bg-freq-4/90 border-freq-4',  dotClass: 'bg-freq-4',  cssVar: 'hsl(var(--freq-4))'  },
  { id: 'calm',    label: 'Calm',    emoji: '😌', buttonClass: 'bg-calm text-calm-foreground hover:bg-calm/90 border-calm', dotClass: 'bg-calm', cssVar: 'hsl(var(--calm))' },
];

export const SCHOOL_DAY_TOTAL_MS = 60_000;

export type SchoolDayFeelingsMap = Partial<Record<string, SchoolDayFeeling[]>>;

/** Build an empty map keyed by every known stage id. */
export const emptySchoolDayFeelings = (): SchoolDayFeelingsMap => {
  const out: SchoolDayFeelingsMap = {};
  for (const s of SCHOOL_DAY_STAGES) out[s.id] = [];
  return out;
};

/** Sky / ground colours per scene — kept here so the component stays lean. */
export const SCENE_PALETTE: Record<SchoolDayStage['scene'], { sky: string; ground: string; accent: string }> = {
  home:                 { sky: '#f8d6c2', ground: '#cfa17a', accent: '#9a6f4f' },
  street_morning:       { sky: '#cde4f5', ground: '#a8a8a8', accent: '#7a7a7a' },
  classroom_morning:    { sky: '#fde9b8', ground: '#caa97a', accent: '#a37b4f' },
  playground:           { sky: '#9fd2f3', ground: '#a3c98a', accent: '#6f8d4f' },
  classroom_midday:     { sky: '#ffe188', ground: '#caa97a', accent: '#a37b4f' },
  lunch_hall:           { sky: '#ffd9b5', ground: '#bfa17a', accent: '#8a6a45' },
  classroom_afternoon:  { sky: '#ffc187', ground: '#caa97a', accent: '#8a5f33' },
  street_afternoon:     { sky: '#f3a37a', ground: '#9a8a7a', accent: '#5e4a36' },
};
