import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { readDraftStorage, removeDraftStorage, writeDraftStorage } from "@/lib/draft-storage";

const DEFAULT_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function stringifyState(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

type ReplaceStateOptions = {
  markClean?: boolean;
};

export function usePersistentDraftState<T>({
  storageKey,
  initialState,
  enabled = true,
  ttlMs = DEFAULT_DRAFT_TTL_MS,
  version = "v1",
  debounceMs = 500,
}: {
  storageKey: string;
  initialState: T;
  enabled?: boolean;
  ttlMs?: number;
  version?: string;
  debounceMs?: number;
}) {
  const hydratedRef = useRef(false);
  const initialStateRef = useRef(initialState);
  const [state, setState] = useState<T>(initialState);
  const [baselineState, setBaselineState] = useState<T>(initialState);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState, storageKey]);

  useEffect(() => {
    if (!enabled) {
      const resolvedInitialState = initialStateRef.current;
      hydratedRef.current = true;
      setState(resolvedInitialState);
      setBaselineState(resolvedInitialState);
      setHasRestoredDraft(false);
      setIsHydrated(true);
      removeDraftStorage(storageKey);
      return;
    }

    const resolvedInitialState = initialStateRef.current;
    const restored = readDraftStorage<T>({ storageKey, ttlMs, version });
    hydratedRef.current = true;
    setBaselineState(resolvedInitialState);
    setState(restored?.state ?? resolvedInitialState);
    setHasRestoredDraft(Boolean(restored));
    setIsHydrated(true);
  }, [enabled, storageKey, ttlMs, version]);

  const isDirty = useMemo(
    () => stringifyState(state) !== stringifyState(baselineState),
    [baselineState, state],
  );

  useEffect(() => {
    if (!enabled || !hydratedRef.current || !isHydrated) return;

    if (!isDirty) {
      removeDraftStorage(storageKey);
      return;
    }

    const timer = window.setTimeout(() => {
      writeDraftStorage({
        storageKey,
        version,
        state,
      });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, isDirty, isHydrated, state, storageKey, version]);

  const replaceState = useCallback((nextState: T, options?: ReplaceStateOptions) => {
    setState(nextState);
    if (options?.markClean) {
      setBaselineState(nextState);
      setHasRestoredDraft(false);
      removeDraftStorage(storageKey);
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    setHasRestoredDraft(false);
    removeDraftStorage(storageKey);
  }, [storageKey]);

  const markSaved = useCallback((nextState?: T) => {
    setState((current) => {
      const resolved = nextState ?? current;
      setBaselineState(resolved);
      setHasRestoredDraft(false);
      removeDraftStorage(storageKey);
      return resolved;
    });
  }, [storageKey]);

  const discardDraft = useCallback((nextState?: T) => {
    const resolved = nextState ?? baselineState;
    setState(resolved);
    setBaselineState(resolved);
    setHasRestoredDraft(false);
    removeDraftStorage(storageKey);
  }, [baselineState, storageKey]);

  return {
    state,
    setState,
    replaceState,
    clearDraft,
    markSaved,
    discardDraft,
    isDirty,
    hasRestoredDraft,
    isHydrated,
  };
}
