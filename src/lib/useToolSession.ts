import { useCallback, useEffect, useRef, useState } from 'react';
import { generateChildId } from './randomWords';
import { clearSession, loadSession, saveSession, type ToolId, type ToolSession } from './storage';

/**
 * Loads (or starts) the localStorage-backed session for a tool and autosaves
 * every state change. The child is identified only by a locally generated
 * pseudonym — no names, initials or free text about a child are collected.
 */
export function useToolSession<S>(toolId: ToolId, initialState: S) {
  const [session, setSession] = useState<ToolSession<S>>(() => {
    const existing = loadSession<S>(toolId);
    // Shallow-merge onto the current default shape so a session saved before
    // new state fields were added doesn't come back with them `undefined`.
    if (existing) return { ...existing, state: { ...initialState, ...existing.state } };
    const now = new Date().toISOString();
    return { toolId, childId: generateChildId(), createdAt: now, updatedAt: now, completed: false, state: initialState };
  });

  const first = useRef(true);
  useEffect(() => {
    // Skip the very first render so simply visiting a tool page does not create
    // a stored record until the user actually interacts.
    if (first.current) {
      first.current = false;
      return;
    }
    saveSession(session);
  }, [session]);

  const setState = useCallback((updater: S | ((prev: S) => S)) => {
    setSession((prev) => ({
      ...prev,
      state: typeof updater === 'function' ? (updater as (p: S) => S)(prev.state) : updater,
    }));
  }, []);

  const setCompleted = useCallback((completed: boolean) => {
    setSession((prev) => ({ ...prev, completed }));
  }, []);

  const restart = useCallback(() => {
    clearSession(toolId);
    const now = new Date().toISOString();
    first.current = true;
    setSession({ toolId, childId: generateChildId(), createdAt: now, updatedAt: now, completed: false, state: initialState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  return { session, state: session.state, childId: session.childId, setState, setCompleted, restart };
}
