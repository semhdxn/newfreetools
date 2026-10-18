const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 1 - 1900 + 1 }, (_, i) => THIS_YEAR + 1 - i);

/** Month + year dropdowns. Value is an ISO date fixed to the 1st ("YYYY-MM-01") or "". */
export function MonthYearInput({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id?: string }) {
  const y = value ? value.slice(0, 4) : "";
  const m = value ? value.slice(5, 7) : "";
  const update = (ny: string, nm: string) => onChange(ny ? `${ny}-${nm || "01"}-01` : "");
  return (
    <div>
      <span className="label">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <select id={id} className="field" aria-label={`${label} month`} value={m} onChange={(e) => update(y || String(THIS_YEAR), e.target.value)}>
          <option value="">Month</option>
          {MONTHS.map((n, i) => <option key={n} value={String(i + 1).padStart(2, "0")}>{n}</option>)}
        </select>
        <select className="field" aria-label={`${label} year`} value={y} onChange={(e) => update(e.target.value, m)}>
          <option value="">Year</option>
          {YEARS.map((yr) => <option key={yr} value={String(yr)}>{yr}</option>)}
        </select>
      </div>
    </div>
  );
}
