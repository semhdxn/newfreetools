import {
  SCHOOL_DAY_STAGES,
  SCHOOL_DAY_FEELINGS,
  type SchoolDayFeeling,
  type SchoolDayFeelingsMap,
} from '@/data/schoolDayStages';

/**
 * Read-only summary of a pupil's school day feelings.
 *
 * Renders a horizontal stacked bar per stage: each segment width is
 * proportional to the number of taps for that feeling within that stage.
 * If the pupil didn't tap anything in a stage, we show a muted "—".
 *
 * Used in Results, the printable Report, and the Combined PDF.
 */
export const SchoolDaySummary = ({ feelings }: { feelings: SchoolDayFeelingsMap }) => {
  const totalTaps = SCHOOL_DAY_STAGES.reduce((sum, s) => sum + (feelings[s.id]?.length ?? 0), 0);

  if (totalTaps === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        The pupil didn't tap any feelings during the school day walk-through.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {SCHOOL_DAY_FEELINGS.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${f.dotClass}`} aria-hidden />
            <span>{f.emoji} {f.label}</span>
          </span>
        ))}
      </div>

      {/* Per-stage bars */}
      <div className="space-y-2">
        {SCHOOL_DAY_STAGES.map((stage) => {
          const arr = feelings[stage.id] ?? [];
          const counts = SCHOOL_DAY_FEELINGS.reduce((acc, f) => {
            acc[f.id] = 0;
            return acc;
          }, {} as Record<SchoolDayFeeling, number>);
          for (const f of arr) {
            const k = f as SchoolDayFeeling;
            if (k in counts) counts[k] += 1;
          }
          const stageTotal = arr.length;
          // Highlight if this stage skews difficult (negative feelings dominant).
          const negative = counts.worried + counts.tricky + counts.too_loud;
          const positive = counts.safe + counts.happy + counts.calm;
          const difficult = stageTotal > 0 && negative > positive;
          return (
            <div key={stage.id} className="grid grid-cols-[8rem_1fr_3.5rem] sm:grid-cols-[10rem_1fr_4rem] items-center gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm">
                <div className="font-medium truncate" title={stage.label}>{stage.label}</div>
                {difficult && (
                  <div className="text-[10px] uppercase tracking-wide text-destructive">flag</div>
                )}
              </div>
              <div className="flex h-5 rounded-md overflow-hidden border border-border bg-muted/40">
                {stageTotal === 0 ? (
                  <span className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground">—</span>
                ) : (
                  SCHOOL_DAY_FEELINGS.map((f) => {
                    const v = counts[f.id];
                    if (v === 0) return null;
                    const pct = (v / stageTotal) * 100;
                    return (
                      <span
                        key={f.id}
                        className={`${f.dotClass}`}
                        style={{ width: `${pct}%` }}
                        title={`${f.label}: ${v}`}
                        aria-label={`${f.label}: ${v}`}
                      />
                    );
                  })
                )}
              </div>
              <div className="text-xs text-muted-foreground text-right">{stageTotal} tap{stageTotal === 1 ? '' : 's'}</div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-muted-foreground">
        A stage is flagged if the child tapped <em>worried</em> or <em>tricky</em> more often than <em>safe</em> or <em>happy</em>. Use this as a starting point for conversation.
      </p>

      {/* Per-stage breakdown legend ------------------------------------- */}
      {/* A small matrix that spells out the exact count for every feeling
          in every stage. Sits underneath the stacked bars so adults can
          read precise numbers without hovering. */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Feelings per stage
        </h4>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs border-collapse">
            <caption className="sr-only">
              Count of each feeling tapped during every part of the school day.
            </caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="font-medium text-muted-foreground py-1.5 pr-2">
                  Stage
                </th>
                {SCHOOL_DAY_FEELINGS.map((f) => (
                  <th
                    key={f.id}
                    scope="col"
                    className="font-medium text-muted-foreground py-1.5 px-1.5 text-center whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden>{f.emoji}</span>
                      <span className="hidden sm:inline">{f.label}</span>
                      <span className="sr-only sm:hidden">{f.label}</span>
                    </span>
                  </th>
                ))}
                <th scope="col" className="font-medium text-muted-foreground py-1.5 pl-1.5 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {SCHOOL_DAY_STAGES.map((stage) => {
                const arr = feelings[stage.id] ?? [];
                const counts = SCHOOL_DAY_FEELINGS.reduce((acc, f) => {
                  acc[f.id] = 0;
                  return acc;
                }, {} as Record<SchoolDayFeeling, number>);
                for (const f of arr) {
                  const k = f as SchoolDayFeeling;
                  if (k in counts) counts[k] += 1;
                }
                const stageTotal = arr.length;
                return (
                  <tr key={stage.id} className="border-t border-border/60">
                    <th
                      scope="row"
                      className="font-medium py-1.5 pr-2 text-foreground whitespace-nowrap"
                    >
                      {stage.label}
                    </th>
                    {SCHOOL_DAY_FEELINGS.map((f) => {
                      const n = counts[f.id];
                      return (
                        <td
                          key={f.id}
                          className={`py-1.5 px-1.5 text-center tabular-nums ${
                            n === 0 ? 'text-muted-foreground' : 'text-foreground font-semibold'
                          }`}
                          aria-label={`${f.label} for ${stage.label}: ${n}`}
                        >
                          {n}
                        </td>
                      );
                    })}
                    <td className="py-1.5 pl-1.5 text-right tabular-nums text-muted-foreground">
                      {stageTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};