/**
 * Browser-only persistence for the standalone tools.
 *
 * Everything a user enters lives in localStorage under a single namespace and
 * never leaves the device. There is no backend in this build, so this file is
 * the whole "database".
 */

export type ToolId = 'sensory' | 'behaviour' | 'home-behaviour' | 'student-voice' | 'mwm';

export interface ToolSession<S = unknown> {
  toolId: ToolId;
  /** Locally generated pseudonym, e.g. `brave-otter-42`. Never a real name. */
  childId: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  state: S;
}

const PREFIX = 'semh-free-tools:v1:';
const key = (toolId: ToolId) => `${PREFIX}${toolId}`;

export const TOOL_LABELS: Record<ToolId, string> = {
  sensory: 'Sensory Checklist',
  behaviour: 'Behaviour (School)',
  'home-behaviour': 'Home Behaviour',
  'student-voice': 'Pupil Voice',
  mwm: 'Measure What Matters',
};

function safeParse<S>(raw: string | null): ToolSession<S> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ToolSession<S>;
    return parsed && typeof parsed === 'object' && parsed.childId ? parsed : null;
  } catch {
    return null;
  }
}

export function loadSession<S>(toolId: ToolId): ToolSession<S> | null {
  if (typeof window === 'undefined') return null;
  return safeParse<S>(window.localStorage.getItem(key(toolId)));
}

export function saveSession<S>(session: ToolSession<S>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(session.toolId), JSON.stringify({ ...session, updatedAt: new Date().toISOString() }));
  } catch {
    // Storage full or blocked (private mode) — the tool still works in memory.
  }
}

export function clearSession(toolId: ToolId): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key(toolId));
}

export function clearAllSessions(): void {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}

export function listSessions(): ToolSession[] {
  if (typeof window === 'undefined') return [];
  return (Object.keys(TOOL_LABELS) as ToolId[])
    .map((id) => loadSession(id))
    .filter((s): s is ToolSession => s !== null);
}
