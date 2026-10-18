import Papa from "papaparse";
import { wellbeingByValue, type WellbeingImpact } from "@/chronology/lib/wellbeing";

export type Precision = "day" | "month" | "year";
export type Significance = "low" | "medium" | "high";

export interface Person {
  label: string;
  dob: string; // ISO YYYY-MM-DD or ""
  dobPrecision: Precision;
  preparedBy: string;
}

export interface TimelineEvent {
  id: string;
  category: string; // category id
  type: string;
  label: string;
  location: string; // town or city, for placement-type events
  start: string; // ISO
  startPrecision: Precision;
  end: string; // ISO or ""
  endPrecision: Precision;
  ongoing: boolean;
  approximate: boolean;
  significance: Significance;
  note: string;
  wellbeingImpact?: WellbeingImpact | undefined;
  wellbeingNote?: string | undefined;
}

export const CATEGORIES = [
  { id: "living", name: "Living arrangements", types: ["Lived with birth family", "Foster placement", "Kinship care", "Residential care", "Supported accommodation", "Adoption", "Moved home"] },
  { id: "education", name: "Education", types: ["Started school", "Changed school", "Suspension", "Exclusion", "EHCP issued", "Attendance concern", "Left education"] },
  { id: "health", name: "Health & wellbeing", types: ["Diagnosis", "Hospital admission", "CAMHS involvement", "Medication started", "Self-harm incident"] },
  { id: "family", name: "Family & relationships", types: ["Birth of sibling", "Parental separation", "Bereavement", "Contact arrangement", "Relationship began", "Relationship ended"] },
  { id: "services", name: "Professional involvement", types: ["Referral", "Child in Need plan", "Child Protection plan", "Looked after", "Youth justice involvement", "Educational Psychology", "Specialist teacher", "Case closed"] },
  { id: "significant", name: "Significant events", types: ["Police involvement", "Missing episode", "Achievement", "Other"] },
] as const;

export const catById = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[5];

/** Placement types that record a town or city location. */
const PLACEMENT_TYPES = ["lived with birth family", "foster placement", "kinship care", "residential care", "supported accommodation", "adoption", "moved home"];
export const wantsLocation = (type: string) => PLACEMENT_TYPES.includes(type.trim().toLowerCase());

/** Label as shown on screen, with the location appended where present. */
export const displayLabel = (e: TimelineEvent) => (e.location ? `${e.label} · ${e.location}` : e.label);

export const COLUMNS = ["record_type", "category", "type", "label", "start_date", "start_precision", "end_date", "end_precision", "ongoing", "approximate", "significance", "note"] as const;

export const emptyPerson = (): Person => ({ label: "", dob: "", dobPrecision: "day", preparedBy: "" });
export const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function normalise(iso: string, p: Precision) {
  if (!iso) return "";
  const [y = "", m = "01"] = iso.split("-");
  if (p === "year") return `${y}-01-01`;
  if (p === "month") return `${y}-${m}-01`;
  return iso;
}

export function formatDate(iso: string, p: Precision) {
  if (!iso) return "";
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  if (p === "year") return `${y}`;
  if (p === "month") return `${MONTHS[m - 1]} ${y}`;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function toDMY(iso: string) {
  if (!iso) return "";
  const [y = "", m = "", d = ""] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function validYMD(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d && y > 1900 && y < 2200;
}
const pad = (n: number) => String(n).padStart(2, "0");

/** Accepts DD/MM/YYYY, YYYY-MM-DD, MM/YYYY, YYYY. Returns ISO or null. */
export function parseDate(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) {
    const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return validYMD(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null;
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/);
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return validYMD(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null;
  }
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m && validYMD(Number(m[2]), Number(m[1]), 1)) return `${m[2]}-${pad(Number(m[1]))}-01`;
  m = s.match(/^(\d{4})$/);
  if (m && validYMD(Number(m[1]), 1, 1)) return `${m[1]}-01-01`;
  return null;
}

const MONTH_LOOKUP: Record<string, number> = {};
["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].forEach((name, i) => {
  MONTH_LOOKUP[name] = i + 1;
  MONTH_LOOKUP[name.slice(0, 3)] = i + 1;
});
MONTH_LOOKUP["sept"] = 9;

export interface FlexibleDate { start: string; precision: Precision; approximate: boolean; }

/** Forgiving date entry for quick add: "14/3/18", "14 Mar 2019", "Mar 2019", "3/2019", "2019", optional "c." / "approx" prefix. */
export function parseFlexibleDate(raw: string): FlexibleDate | null {
  let s = raw.trim();
  let approximate = false;
  const prefix = s.match(/^(?:c|circa|approx(?:imately)?|about)\.?\s+/i);
  if (prefix) { approximate = true; s = s.slice(prefix[0].length).trim(); }
  else if (/^[~≈]/.test(s)) { approximate = true; s = s.slice(1).trim(); }

  const twoDigitYear = (y2: number) => (y2 < 70 ? 2000 + y2 : 1900 + y2);

  let m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)\.?\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_LOOKUP[(m[2] ?? "").toLowerCase()];
    return mo && validYMD(Number(m[3]), mo, Number(m[1])) ? { start: `${m[3]}-${pad(mo)}-${pad(Number(m[1]))}`, precision: "day", approximate } : null;
  }
  m = s.match(/^([a-zA-Z]+)\.?\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_LOOKUP[(m[1] ?? "").toLowerCase()];
    return mo ? { start: `${m[2]}-${pad(mo)}-01`, precision: "month", approximate } : null;
  }
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) {
    const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return validYMD(y, mo, d) ? { start: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", approximate } : null;
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return validYMD(y, mo, d) ? { start: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", approximate } : null;
  }
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2})$/);
  if (m) {
    const y = twoDigitYear(Number(m[3]));
    const [d, mo] = [Number(m[1]), Number(m[2])];
    return validYMD(y, mo, d) ? { start: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", approximate } : null;
  }
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m && validYMD(Number(m[2]), Number(m[1]), 1)) return { start: `${m[2]}-${pad(Number(m[1]))}-01`, precision: "month", approximate };
  if (/^\d{4}$/.test(s) && validYMD(Number(s), 1, 1)) return { start: `${s}-01-01`, precision: "year", approximate };
  return null;
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const yearFrac = (iso: string) => {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return y + (m - 1) / 12 + (d - 1) / 365;
};

/* ---------- CSV export ---------- */

export function toCSV(person: Person, events: TimelineEvent[]) {
  const rows: string[][] = [
    ["person", "", "", person.label, toDMY(normalise(person.dob, person.dobPrecision)), person.dob ? person.dobPrecision : "", "", "", "", "", "", person.preparedBy],
    ...events.map((e) => [
      "event",
      catById(e.category).name,
      e.type,
      e.label,
      toDMY(normalise(e.start, e.startPrecision)),
      e.startPrecision,
      toDMY(normalise(e.end, e.endPrecision)),
      e.end ? e.endPrecision : "",
      e.ongoing ? "yes" : "no",
      e.approximate ? "yes" : "no",
      e.significance,
      e.note,
      e.location,
      e.wellbeingImpact ?? "",
      e.wellbeingNote ?? "",
    ]),
  ];
  return "\uFEFF" + Papa.unparse({ fields: [...COLUMNS, "location", "wellbeing_impact", "wellbeing_note"], data: rows }, { quotes: false, newline: "\r\n" });
}

export function templateCSV() {
  const data = [
    ["person", "", "", "AB-1234", "14/03/2010", "day", "", "", "", "", "", "J. Practitioner"],
    ["event", "Living arrangements", "Foster placement", "Placed with carers", "01/06/2015", "month", "20/09/2018", "day", "no", "no", "high", "Planned move, \"settled well\"", "Leeds"],
    ["event", "Education", "Started school", "Started primary school", "01/01/2014", "year", "", "", "no", "yes", "medium", "Date approximate,\nfrom school records"],
  ];
  return "\uFEFF" + Papa.unparse({ fields: [...COLUMNS, "location", "wellbeing_impact", "wellbeing_note"], data }, { newline: "\r\n" });
}

export function downloadBlob(content: Blob | string, filename: string, type = "text/csv;charset=utf-8") {
  const blob = typeof content === "string" ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const safeRef = (s: string) => (s.trim() || "untitled").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 40);

/* ---------- CSV import ---------- */

export interface RowIssue { row: number; message: string; }
export interface ImportResult {
  person: Person | null;
  events: TimelineEvent[];
  errors: RowIssue[];
  warnings: RowIssue[];
}

const PREC = ["day", "month", "year"];
const yesNo = (v: string): boolean | null => {
  const s = v.trim().toLowerCase();
  if (s === "" || s === "no" || s === "n" || s === "false") return false;
  if (s === "yes" || s === "y" || s === "true") return true;
  return null;
};

export function parseCSV(textRaw: string): ImportResult {
  const text = textRaw.replace(/^\uFEFF/, "");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.replace(/^\uFEFF/, "").trim().toLowerCase(),
  });
  const res: ImportResult = { person: null, events: [], errors: [], warnings: [] };
  const fields = parsed.meta.fields ?? [];
  const missing = COLUMNS.filter((c) => !fields.includes(c));
  if (missing.length) {
    res.errors.push({ row: 1, message: `Missing column(s): ${missing.join(", ")}` });
    return res;
  }

  parsed.data.forEach((r, i) => {
    const row = i + 2;
    const g = (k: string) => (r[k] ?? "").toString().trim();
    const rt = g("record_type").toLowerCase();
    const errs: string[] = [];

    if (rt === "person") {
      if (res.person) { res.warnings.push({ row, message: "Extra person row ignored" }); return; }
      let dob = "";
      if (g("start_date")) {
        const d = parseDate(g("start_date"));
        if (!d) errs.push(`unrecognised date of birth "${g("start_date")}"`);
        else dob = d;
      }
      const p = (g("start_precision").toLowerCase() || "day") as Precision;
      if (!PREC.includes(p)) errs.push(`unrecognised precision "${g("start_precision")}"`);
      if (errs.length) { res.errors.push({ row, message: errs.join("; ") }); return; }
      res.person = { label: g("label"), dob: normalise(dob, p), dobPrecision: p, preparedBy: g("note") };
      return;
    }
    if (rt !== "event") { res.errors.push({ row, message: `record_type must be "person" or "event" (got "${g("record_type")}")` }); return; }

    // category
    let cat = CATEGORIES.find((c) => c.name.toLowerCase() === g("category").toLowerCase() || c.id === g("category").toLowerCase());
    let type = g("type");
    if (!cat) {
      res.warnings.push({ row, message: `Unknown category "${g("category")}" — placed in Significant events / Other` });
      cat = CATEGORIES[5];
      type = "Other";
    } else {
      const preset = cat.types.find((t) => t.toLowerCase() === type.toLowerCase());
      if (preset) type = preset;
      else if (!type) type = "Other";
    }

    const sp = (g("start_precision").toLowerCase() || "day") as Precision;
    const ep = (g("end_precision").toLowerCase() || "day") as Precision;
    if (!PREC.includes(sp)) errs.push(`unrecognised start precision "${g("start_precision")}"`);
    if (!PREC.includes(ep)) errs.push(`unrecognised end precision "${g("end_precision")}"`);

    let start = "";
    if (!g("start_date")) errs.push("missing start date");
    else {
      const d = parseDate(g("start_date"));
      if (!d) errs.push(`unrecognised date "${g("start_date")}"`);
      else start = normalise(d, sp);
    }
    let end = "";
    if (g("end_date")) {
      const d = parseDate(g("end_date"));
      if (!d) errs.push(`unrecognised end date "${g("end_date")}"`);
      else end = normalise(d, ep);
    }
    if (start && end && end < start) errs.push("end date before start date");

    const ongoing = yesNo(g("ongoing"));
    const approximate = yesNo(g("approximate"));
    if (ongoing === null) errs.push(`ongoing must be yes/no (got "${g("ongoing")}")`);
    if (approximate === null) errs.push(`approximate must be yes/no (got "${g("approximate")}")`);
    if (ongoing && end) errs.push("event is marked ongoing but has an end date");
    const sig = (g("significance").toLowerCase() || "medium") as Significance;
    if (!["low", "medium", "high"].includes(sig)) errs.push(`significance must be low/medium/high (got "${g("significance")}")`);
    const wellbeing = wellbeingByValue(g("wellbeing_impact"));
    if (g("wellbeing_impact") && !wellbeing) res.warnings.push({ row, message: "Unrecognised wellbeing judgement — left unassessed" });

    if (errs.length) { res.errors.push({ row, message: errs.join("; ") }); return; }
    res.events.push({
      id: newId(),
      category: cat.id,
      type,
      label: g("label") || type,
      location: g("location"),
      start,
      startPrecision: sp,
      end,
      endPrecision: ep,
      ongoing: !!ongoing,
      approximate: !!approximate,
      significance: sig,
      note: (r["note"] ?? "").toString(),
      wellbeingImpact: wellbeing?.value,
      wellbeingNote: (r["wellbeing_note"] ?? "").toString(),
    });
  });
  if (!res.person) res.warnings.push({ row: 2, message: "No person row found — current details kept" });
  return res;
}

export const eventKey = (e: TimelineEvent) =>
  [e.category, e.type.toLowerCase(), e.label, e.location, e.start, e.startPrecision, e.end, e.end ? e.endPrecision : "", e.ongoing, e.approximate, e.significance, e.note, e.wellbeingImpact ?? "", e.wellbeingNote ?? ""].join("\u0001");
