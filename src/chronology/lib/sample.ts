import type { WellbeingImpact } from "@/chronology/lib/wellbeing";
import { newId, type Person, type TimelineEvent } from "@/chronology/lib/timeline";

interface Seed {
  category: string;
  type: string;
  label: string;
  location?: string;
  start: string; // YYYY-MM
  end?: string; // YYYY-MM
  ongoing?: boolean;
  approximate?: boolean;
  significance: "low" | "medium" | "high";
  note?: string;
  wellbeing?: WellbeingImpact;
}

/** A complete but entirely fictional chronology, used for demonstrations and testing. */
const SEEDS: Seed[] = [
  // Living arrangements
  { category: "living", type: "Lived with birth family", label: "At home with mother and siblings", location: "Leeds", start: "2012-03", end: "2018-06", wellbeing: "negative", significance: "high", note: "Moved out following a child protection investigation into neglect." },
  { category: "living", type: "Foster placement", label: "Emergency placement with carers", location: "Bradford", start: "2018-06", end: "2019-02", wellbeing: "mixed", significance: "high", note: "Placement held under Regulation 39; carers supported a difficult settling-in period." },
  { category: "living", type: "Foster placement", label: "Long-term fostering placement", location: "Sheffield", start: "2019-02", end: "2021-03", approximate: true, wellbeing: "positive", significance: "medium" },
  { category: "living", type: "Residential care", label: "Residential children's home", location: "Manchester", start: "2021-03", end: "2022-09", wellbeing: "negative", significance: "high", note: "Placement broke down twice before stabilising; keyworker reports attached." },
  { category: "living", type: "Supported accommodation", label: "Semi-independent living", location: "Manchester", start: "2022-09", ongoing: true, wellbeing: "positive", significance: "medium" },

  // Education
  { category: "education", type: "Started school", label: "Started primary school", location: "Leeds", start: "2016-09", wellbeing: "positive", significance: "medium", note: "Attendance settled at first; missed sessions rose from 2020." },
  { category: "education", type: "Changed school", label: "Moved school on placement change", location: "Bradford", start: "2018-09", end: "2021-07", wellbeing: "neutral", significance: "medium" },
  { category: "education", type: "Suspension", label: "Fixed-term suspension (2 days)", start: "2020-11", wellbeing: "negative", significance: "medium", note: "Altercation at lunchtime; second of three fixed-term suspensions that term." },
  { category: "education", type: "Suspension", label: "Fixed-term suspension (5 days)", start: "2021-03", wellbeing: "negative", significance: "high" },
  { category: "education", type: "Exclusion", label: "Permanent exclusion", start: "2022-01", wellbeing: "very-negative", significance: "high", note: "Exclusion upheld by governors' panel; no alternative provision found until autumn." },
  { category: "education", type: "Attendance concern", label: "Attendance fell to 62%", start: "2022-05", wellbeing: "negative", significance: "medium" },
  { category: "education", type: "Changed school", label: "Started SEMH provision", location: "Manchester", start: "2022-09", end: "2023-07", wellbeing: "positive", significance: "medium", note: "Small-group provision; report notes growing engagement." },

  // Health & wellbeing
  { category: "health", type: "Diagnosis", label: "ADHD diagnosis confirmed", start: "2020-09", approximate: true, wellbeing: "positive", significance: "medium", note: "Confirmed by paediatric team after a 14-month wait." },
  { category: "health", type: "CAMHS involvement", label: "Referred to CAMHS", start: "2021-02", wellbeing: "neutral", significance: "high" },
  { category: "health", type: "Self-harm incident", label: "Self-harm incident", start: "2021-08", wellbeing: "very-negative", significance: "high" },
  { category: "health", type: "Hospital admission", label: "Overnight hospital admission", start: "2021-10", wellbeing: "very-negative", significance: "high", note: "Two-night admission following self-harm; discharged with safety plan." },
  { category: "health", type: "Medication started", label: "Started ADHD medication", start: "2022-03", wellbeing: "positive", significance: "low" },

  // Family & relationships
  { category: "family", type: "Parental separation", label: "Parents separated", location: "Leeds", start: "2015-06", wellbeing: "negative", significance: "high", note: "Contact with father became irregular from this point." },
  { category: "family", type: "Contact arrangement", label: "Monthly supervised contact", start: "2018-07", end: "2019-11", wellbeing: "mixed", significance: "medium" },
  { category: "family", type: "Bereavement", label: "Death of maternal grandmother", start: "2020-01", wellbeing: "very-negative", significance: "high", note: "Grandmother had been the main carer during early childhood." },
  { category: "family", type: "Contact arrangement", label: "Contact reduced to quarterly", start: "2020-06", wellbeing: "negative", significance: "medium" },

  // Professional involvement
  { category: "services", type: "Referral", label: "Referral to children's social care", start: "2018-03", significance: "high", note: "Referral made by school; assessed as s.47 within 15 days." },
  { category: "services", type: "Child in Need plan", label: "Child in Need plan opened", start: "2018-05", significance: "medium" },
  { category: "services", type: "Child Protection plan", label: "Child Protection plan (neglect)", start: "2018-06", end: "2018-11", significance: "high" },
  { category: "services", type: "Looked after", label: "Became looked after (s.31)", start: "2018-06", significance: "high" },
  { category: "services", type: "Youth justice involvement", label: "Youth offending team involvement", start: "2021-11", end: "2022-08", significance: "medium", note: "Referral order following criminal damage charge." },

  // Significant events
  { category: "significant", type: "Missing episode", label: "Missing for two nights", start: "2021-04", wellbeing: "very-negative", significance: "high", note: "Returned home; follow-up safety review completed." },
  { category: "significant", type: "Missing episode", label: "Missing overnight", start: "2021-07", wellbeing: "negative", significance: "medium" },
  { category: "significant", type: "Police involvement", label: "Police attended placement", start: "2021-12", wellbeing: "negative", significance: "medium" },
  { category: "significant", type: "Achievement", label: "Level 1 food hygiene award", start: "2022-06", wellbeing: "very-positive", significance: "low", note: "Completed alongside a college taster course." },
];

/** Fictional person details to match the sample chronology. */
const PERSON: Omit<Person, "dobPrecision"> & { dobPrecision: "month" } = {
  label: "AB-26-001",
  dob: "2012-03-01",
  dobPrecision: "month",
  preparedBy: "Sample data (fictional)",
};

/** Returns a fresh copy of the fictional sample timeline (new ids each call). */
export function sampleTimeline(): { person: Person; events: TimelineEvent[] } {
  return {
    person: { ...PERSON },
    events: SEEDS.map((s) => ({
      id: newId(),
      category: s.category,
      type: s.type,
      label: s.label,
      location: s.location ?? "",
      start: `${s.start}-01`,
      startPrecision: "month",
      end: s.end ? `${s.end}-01` : "",
      endPrecision: "month",
      ongoing: !!s.ongoing,
      approximate: !!s.approximate,
      significance: s.significance,
      note: s.note ?? "",
      ...(s.wellbeing ? { wellbeingImpact: s.wellbeing } : {}),
    })),
  };
}
