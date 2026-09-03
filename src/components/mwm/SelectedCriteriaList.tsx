import { MwmCriteria } from '@/data/mwmCriteriaData';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface SelectedCriteriaListProps {
  selected: MwmCriteria[];
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

export default function SelectedCriteriaList({ selected, onMove, onRemove }: SelectedCriteriaListProps) {
  if (selected.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-4 text-sm text-muted-foreground text-center">
        No criteria selected yet — add at least one from the list.
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {selected.map((c, i) => (
        <li
          key={c.id}
          className="flex items-center gap-2 border rounded-lg p-2 bg-white hover:bg-gray-50"
        >
          <span className="w-6 text-center text-sm font-medium text-muted-foreground">{i + 1}</span>
          <span className="flex-1 text-sm font-medium">{c.name}</span>
          <button
            onClick={() => onMove(c.id, -1)}
            disabled={i === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(c.id, 1)}
            disabled={i >= selected.length - 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(c.id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
