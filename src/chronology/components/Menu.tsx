import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Lightweight disclosure menu. Closes on outside click, Escape, or item click. */
export function Menu({ label, icon, badge, children }: { label: string; icon?: ReactNode; badge?: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        {icon}{label}{badge}<ChevronDown size={14} />
      </button>
      {open && (
        <div role="menu" className="fixed inset-x-4 z-40 mt-2 rounded-xl sm:absolute sm:inset-x-auto sm:left-0 sm:w-64 border bg-card p-1.5 shadow-soft">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ onClick, disabled, icon, children, hint }: { onClick: () => void; disabled?: boolean; icon?: ReactNode; children: ReactNode; hint?: string }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-secondary disabled:pointer-events-none disabled:opacity-50">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span><span className="block font-medium">{children}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
    </button>
  );
}
