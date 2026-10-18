import { formatDate, type ImportResult } from "@/chronology/lib/timeline";

interface Props {
  fileName: string;
  result: ImportResult;
  hasExisting: boolean;
  onConfirm: (mode: "replace" | "merge") => void;
  onCancel: () => void;
}

export function ImportPreview({ fileName, result, hasExisting, onConfirm, onCancel }: Props) {
  const { person, events, errors, warnings } = result;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay p-4">
      <div className="panel my-8 w-full max-w-2xl space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Import preview</h3>
          <p className="text-xs text-muted-foreground">{fileName} — read on this device only, nothing uploaded.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="text-2xl font-semibold">{events.length}</div>
            events ready to import
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            {person ? (
              <>
                <div><span className="text-muted-foreground">Reference:</span> {person.label || "—"}</div>
                <div><span className="text-muted-foreground">Date of birth:</span> {person.dob ? formatDate(person.dob, person.dobPrecision) : "—"}</div>
                <div><span className="text-muted-foreground">Prepared by:</span> {person.preparedBy || "—"}</div>
              </>
            ) : <span className="text-muted-foreground">No person details in file</span>}
          </div>
        </div>

        {errors.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-semibold text-destructive">{errors.length} row(s) with problems — these will not be imported</h4>
            <div className="max-h-56 overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs"><tr><th className="px-2 py-1 w-16">Row</th><th className="px-2 py-1">Problem</th></tr></thead>
                <tbody>{errors.map((e, i) => <tr key={i} className="border-t"><td className="px-2 py-1">{e.row}</td><td className="px-2 py-1">{e.message}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-semibold text-warning">Warnings</h4>
            <ul className="max-h-32 overflow-auto text-sm">{warnings.map((w, i) => <li key={i}>Row {w.row}: {w.message}</li>)}</ul>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
          <button className="btn" onClick={onCancel}>Cancel</button>
          {hasExisting ? (
            <>
              <button className="btn" onClick={() => onConfirm("merge")} disabled={!events.length}>Add these events to current timeline</button>
              <button className="btn btn-primary" onClick={() => onConfirm("replace")}>Replace current timeline</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => onConfirm("replace")} disabled={!events.length && !person}>Load timeline</button>
          )}
        </div>
      </div>
    </div>
  );
}
