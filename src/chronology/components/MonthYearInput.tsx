import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THIS_YEAR = new Date().getFullYear();
const FIRST_YEAR = 1960;
const LAST_YEAR = THIS_YEAR + 1;
const SPAN = 5;

/** Five-year ranges, oldest first: 1960–1964, 1965–1969 ... up to the last selectable year. */
const RANGES: { from: number; to: number }[] = [];
for (let y = FIRST_YEAR; y <= LAST_YEAR; y += SPAN) RANGES.push({ from: y, to: Math.min(y + SPAN - 1, LAST_YEAR) });
const rangeOf = (y: number) => Math.floor((y - FIRST_YEAR) / SPAN);

interface Props {
  label: string;
  /** ISO date fixed to the 1st ("YYYY-MM-01") or "". */
  value: string;
  onChange: (v: string) => void;
  id?: string;
  /** Earliest selectable month (ISO). Earlier years and months are greyed out. */
  min?: string;
  /** Where the picker opens when there is no value yet (ISO), e.g. the previous event's date. */
  startAt?: string;
  /** Show a Clear button when a value is set. */
  clearable?: boolean;
}

/**
 * Drill-down month picker: click a five-year range, then a year, then a month.
 * No dropdowns and no typing. Stores "YYYY-MM-01" so everything downstream is unchanged.
 */
export function MonthYearInput({ label, value, onChange, id, min, startAt, clearable }: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const minYear = min ? Number(min.slice(0, 4)) : 0;
  const minKey = min ? min.slice(0, 7) : "";

  const openPicker = () => {
    const src = value || startAt || "";
    const y = src ? Number(src.slice(0, 4)) : NaN;
    if (Number.isFinite(y) && y >= FIRST_YEAR && y <= LAST_YEAR) {
      setRange(rangeOf(y));
      setYear(value ? y : null); // editing: straight to the months; otherwise: the years in that range
    } else {
      setRange(null);
      setYear(null);
    }
    setOpen(true);
  };

  const pick = (y: number, m: number) => {
    onChange(`${y}-${String(m).padStart(2, "0")}-01`);
    setOpen(false);
  };

  const shown = value ? `${MONTHS[Number(value.slice(5, 7)) - 1] ?? ""} ${value.slice(0, 4)}` : "";
  const r = range !== null ? RANGES[range] : undefined;

  return (
    <div onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }}>
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          id={id}
          className="field text-left"
          aria-expanded={open}
          aria-label={`${label}: ${shown || "not set"}. Choose month and year`}
          onClick={() => (open ? setOpen(false) : openPicker())}
        >
          {shown || <span className="text-muted-foreground">Choose month and year</span>}
        </button>
        {clearable && value && (
          <button type="button" className="btn" onClick={() => { onChange(""); setOpen(false); }}>Clear</button>
        )}
      </div>

      {open && (
        <div className="date-pick" role="group" aria-label={`${label} picker`}>
          <div className="date-crumbs">
            <button type="button" onClick={() => { setRange(null); setYear(null); }}>All years</button>
            {r && (<><span aria-hidden>›</span><button type="button" onClick={() => setYear(null)}>{r.from}–{r.to}</button></>)}
            {year !== null && (<><span aria-hidden>›</span><span className="font-semibold text-foreground">{year}</span></>)}
          </div>

          {range === null && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {RANGES.map((g, i) => (
                <button key={g.from} type="button" className="chip" disabled={g.to < minYear} onClick={() => setRange(i)}>
                  {g.from}–{g.to}
                </button>
              ))}
            </div>
          )}

          {r && year === null && (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from + i).map((y) => (
                <button key={y} type="button" className="chip" disabled={y < minYear} onClick={() => setYear(y)}>{y}</button>
              ))}
            </div>
          )}

          {year !== null && (
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((name, i) => {
                const key = `${year}-${String(i + 1).padStart(2, "0")}`;
                return (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={value.slice(0, 7) === key}
                    className="chip"
                    disabled={!!minKey && key < minKey}
                    onClick={() => pick(year, i + 1)}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
