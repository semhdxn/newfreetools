import { TestingNotice } from "@/chronology/components/TestingNotice";
import { useState } from "react";
import { ArrowRight, Check, Download, FileText, Globe, Lock, Sparkles } from "lucide-react";

interface Props {
  /** True when a chronology is already on screen (entered or imported). */
  hasData: boolean;
  onStart: () => void;
  onSample: () => void;
  onSkip: () => void;
}

const OUTPUTS = [
  { icon: <FileText size={18} />, name: "One-page PDF report", desc: "The whole timeline on a single page — for meetings, reviews and the file." },
  { icon: <Globe size={18} />, name: "Detailed HTML file", desc: "The full timeline with dates, notes and searchable events. Opens offline in any browser." },
  { icon: <Download size={18} />, name: "CSV you can keep", desc: "Every entry in a spreadsheet you can store, print, or re-open here later." },
];

const STEPS = [
  ["Tell us the basics", "Initials or a reference, the young person's date of birth, and who is preparing the chronology."],
  ["Answer questions area by area", "Living arrangements, education, health and wellbeing, family, professionals, significant events. Say no to any area that doesn't apply."],
  ["Review it", "See everything you have entered in one list, and change anything before you finish."],
  ["View the timeline", "Category lanes or a story path, with the option to focus on one life stage or a range of years."],
  ["Download what you need", "The PDF report, the detailed HTML file, a PNG or a printed copy — plus a CSV to keep."],
];

const CHECKS = [
  "Have the key dates to hand — moves, school changes, placements and significant events. Month and year is enough for everything.",
  "Use initials or a reference rather than full names, in the details as well as in event labels and notes.",
  "Export a CSV before you close the tab. Nothing is saved automatically, and closing the page clears the screen.",
  "Not sure how it works? Load the sample timeline first — it is fictional, and takes a second to clear again.",
];

/** Landing screen shown when the app opens: what it does, how it works, and the privacy promise. */
export function Introduction({ hasData, onStart, onSample, onSkip }: Props) {
  const [fading, setFading] = useState(false);

  /** Fade this screen out before handing over to the next one. */
  const fadeTo = (run: () => void) => {
    if (fading) return;
    setFading(true);
    window.setTimeout(() => { run(); setFading(false); }, 300);
  };

  return (
    <section
      aria-labelledby="intro-title"
      className={`no-print fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-background ${fading ? "fade-out" : ""}`}
    >
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
          <p role="note" className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock size={14} className="mt-0.5 shrink-0" />
            <span>Nothing you enter leaves this device or is saved. Closing this tab clears everything. Use Export CSV to keep a copy.</span>
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={`mx-auto max-w-3xl space-y-5 px-4 py-6 sm:py-8 ${fading ? "" : "fade-in"}`}>
          <div className="space-y-2">
            <h2 id="intro-title" className="font-display text-3xl font-extrabold sm:text-4xl">
              Build a young person's chronology
            </h2>
            <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
              A private way to turn a written history into a clear timeline. Everything is typed in here and
              drawn on this screen — nothing is uploaded, and nothing is remembered when the tab closes.
            </p>
            <TestingNotice className="max-w-prose" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {OUTPUTS.map((o) => (
              <div key={o.name} className="panel space-y-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-notice text-notice-foreground">{o.icon}</span>
                <p className="font-display font-bold leading-snug">{o.name}</p>
                <p className="text-sm text-muted-foreground">{o.desc}</p>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3 className="font-display text-lg font-bold">How it works</h3>
            <ol className="mt-3 space-y-3">
              {STEPS.map(([title, desc], i) => (
                <li key={title} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-muted-foreground">{desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel">
            <h3 className="font-display text-lg font-bold">Before you start</h3>
            <ul className="mt-3 space-y-2.5">
              {CHECKS.map((c) => (
                <li key={c} className="flex gap-2.5 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span className="min-w-0 text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel flex items-start gap-3 border-notice bg-notice text-notice-foreground">
            <Lock size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <h3 className="font-display text-lg font-bold">Your privacy</h3>
              <p>
                There is no account and no upload. The page makes no network requests at all, so what you type
                stays on this device and disappears when you close the tab. Your exported file is the only copy.
              </p>
              <p className="text-xs opacity-80">
                Treat the finished timeline as confidential: it contains sensitive personal information.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Already have a chronology saved as a CSV? Drag the file anywhere onto this page to open it.
          </p>
        </div>
      </div>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 py-3">
          <button type="button" className="btn btn-primary" onClick={() => fadeTo(onStart)}>
            Start step by step <ArrowRight size={15} />
          </button>
          <button type="button" className="btn" onClick={() => fadeTo(onSample)}>
            <Sparkles size={15} /> Try a sample
          </button>
          {hasData && (
            <button type="button" className="btn ml-auto" onClick={() => fadeTo(onSkip)}>
              Skip to timeline <ArrowRight size={15} />
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
