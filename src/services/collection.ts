import { storage } from "@/lib/storage";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createCollection<T>(key: string, seed: T[]) {
  let cache: T[] | null = null;

  const read = (): T[] => {
    if (!cache) {
      const stored = storage.get<T[] | null>(key, null);
      cache = stored ? stored : clone(seed);
    }
    return cache;
  };

  const write = (next: T[]): T[] => {
    cache = next;
    storage.set(key, next);
    return cache;
  };

  return { read, write };
}
