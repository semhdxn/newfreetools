import { FlaskConical } from "lucide-react";
import { PREMIUM_URL } from "@/lib/links";

/** Shown on every screen of the tool: it's a temporary test run before moving into the premium toolkit. */
export function TestingNotice({ className = "" }: { className?: string }) {
  return (
    <p role="note" className={`flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground sm:text-sm ${className}`}>
      <FlaskConical size={15} className="mt-0.5 shrink-0 text-warning" />
      <span>
        <strong>Temporarily available while we test it.</strong> The Chronology Builder will become part of the premium{" "}
        <a className="underline" href={PREMIUM_URL} target="_blank" rel="noreferrer noopener">SEMH Toolkit (toolkit.semh.co.uk)</a>{" "}
        and will be removed from this free site, so keep a CSV of anything you want to hold on to.
      </span>
    </p>
  );
}
