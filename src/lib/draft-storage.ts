export type DraftStorageEnvelope<T> = {
  version: string;
  savedAt: number;
  state: T;
};

export function readDraftStorage<T>({
  storageKey,
  ttlMs,
  version,
}: {
  storageKey: string;
  ttlMs: number;
  version: string;
}) {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DraftStorageEnvelope<T>;
    if (!parsed || parsed.version !== version || !parsed.savedAt) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    if (Date.now() - parsed.savedAt > ttlMs) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function writeDraftStorage<T>({
  storageKey,
  version,
  state,
}: {
  storageKey: string;
  version: string;
  state: T;
}) {
  if (typeof window === "undefined") return;

  const payload: DraftStorageEnvelope<T> = {
    version,
    savedAt: Date.now(),
    state,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

export function removeDraftStorage(storageKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}
