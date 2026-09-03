import { useState, useMemo } from 'react';
import { MWM_GLOBAL_CRITERIA, MwmCriteria } from '@/data/mwmCriteriaData';
import { Badge } from '@/components/ui';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface CriteriaPickerProps {
  selected: MwmCriteria[];
  onToggle: (c: MwmCriteria) => void;
}

export default function CriteriaPicker({ selected, onToggle }: CriteriaPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(() => selected.map((c) => c.id), [selected]);

  const filtered = useMemo(
    () =>
      MWM_GLOBAL_CRITERIA.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.statements.some((s) => s.statement_text.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [searchTerm]
  );

  const toggleExpanded = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="Search criteria…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="border rounded-lg divide-y max-h-[420px] overflow-y-auto">
        {filtered.map((c) => (
          <div key={c.id}>
            <div className="flex items-center gap-2 p-3 hover:bg-gray-50">
              <button
                onClick={() => toggleExpanded(c.id)}
                className="text-muted-foreground flex-shrink-0"
                aria-label="Toggle details"
              >
                {expanded.has(c.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <input
                type="checkbox"
                checked={selectedIds.includes(c.id)}
                onChange={() => onToggle(c)}
                className="w-4 h-4 flex-shrink-0"
                aria-label={`Select ${c.name}`}
              />
              <label className="flex-1 text-sm font-medium cursor-pointer">{c.name}</label>
              {selectedIds.includes(c.id) && (
                <Badge className="text-xs">✓ Added</Badge>
              )}
            </div>

            {expanded.has(c.id) && (
              <div className="bg-gray-50 border-t">
                <ol className="list-decimal pl-8 pr-3 pb-3 pt-3 text-xs text-muted-foreground space-y-1">
                  {c.statements.map((s) => (
                    <li key={s.id}>{s.statement_text}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
